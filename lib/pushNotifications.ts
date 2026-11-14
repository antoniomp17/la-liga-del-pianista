import { setVapidDetails, sendNotification, type PushSubscription } from "web-push";
import { supabase } from "@/lib/supabase";
import fs from "fs/promises";
import path from "path";

// Claves VAPID oficiales para Web Push
export const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  "BEtiGpnsI9vD47l22VuMrtaBtaP7g9jD9OyN3I7P2f0Z9H-rsSRCcPdMos_ng7Vdu3-AzSeDc8hHuLa2co4_rpY";

export const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY ||
  "YITAWkXGN1Gm1RkabYmhVTnTZ8qqLsuMVCqq42o6nGo";

export const VAPID_SUBJECT = "mailto:profesora@laligadelpianista.es";

setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

export interface StoredSubscription {
  id: string;
  studentId?: string;
  studentName?: string;
  subscription: PushSubscription;
  createdAt: string;
}

const isVercel = !!process.env.VERCEL;
const DATA_DIR = isVercel ? "/tmp" : path.join(process.cwd(), "data");
const SUBSCRIPTIONS_FILE = path.join(DATA_DIR, "push-subscriptions.json");

let memorySubscriptions: StoredSubscription[] = [];

/**
 * Lee todas las suscripciones push activas.
 */
export async function getSubscriptions(): Promise<StoredSubscription[]> {
  // 1. Supabase
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("push_subscriptions")
        .select("id, subscription, updated_at");
      if (!error && data) {
        const parsed = data.map((d: any) => ({
          id: d.id,
          subscription: d.subscription.subscription || d.subscription,
          studentId: d.subscription.studentId,
          studentName: d.subscription.studentName,
          createdAt: d.updated_at,
        })) as StoredSubscription[];
        memorySubscriptions = parsed;
        return memorySubscriptions;
      }
    } catch (err) {
      console.warn("Error leyendo suscripciones de Supabase:", err);
    }
  }

  // 2. Memoria
  if (memorySubscriptions.length > 0) return memorySubscriptions;

  // 3. Archivo local / tmp
  try {
    const content = await fs.readFile(SUBSCRIPTIONS_FILE, "utf-8");
    memorySubscriptions = JSON.parse(content) as StoredSubscription[];
    return memorySubscriptions;
  } catch {
    return memorySubscriptions;
  }
}

/**
 * Guarda o actualiza una suscripción push.
 */
export async function saveSubscription(
  sub: PushSubscription,
  studentId?: string,
  studentName?: string
): Promise<void> {
  const all = await getSubscriptions();
  const filtered = all.filter((s) => s.subscription.endpoint !== sub.endpoint);

  const entry: StoredSubscription = {
    id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    studentId,
    studentName,
    subscription: sub,
    createdAt: new Date().toISOString(),
  };

  filtered.push(entry);
  memorySubscriptions = filtered;

  // 1. Guardar en Supabase
  if (supabase) {
    try {
      await supabase.from("push_subscriptions").upsert({
        id: entry.id,
        subscription: {
          subscription: sub,
          studentId,
          studentName,
        },
        updated_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Error guardando suscripción en Supabase:", err);
    }
  }

  // 2. Guardar en disco local / tmp
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(SUBSCRIPTIONS_FILE, JSON.stringify(filtered, null, 2), "utf-8");
  } catch (err) {
    console.warn("No se pudo persistir suscripción en disco, guardada en memoria:", err);
  }
}

/**
 * Envía una notificación push a todos los dispositivos suscritos.
 */
export async function sendBroadcastPushNotification(payload: {
  title: string;
  body: string;
  url?: string;
}): Promise<{ sent: number; failed: number }> {
  const subscriptions = await getSubscriptions();
  if (subscriptions.length === 0) {
    return { sent: 0, failed: 0 };
  }

  let sent = 0;
  let failed = 0;
  const expiredEndpoints = new Set<string>();

  const stringPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    url: payload.url || "/",
  });

  await Promise.all(
    subscriptions.map(async (item) => {
      try {
        await sendNotification(item.subscription, stringPayload);
        sent++;
      } catch (err: any) {
        failed++;
        if (err.statusCode === 404 || err.statusCode === 410) {
          expiredEndpoints.add(item.subscription.endpoint);
        }
      }
    })
  );

  // Limpiar suscripciones inválidas
  if (expiredEndpoints.size > 0) {
    const valid = memorySubscriptions.filter(
      (s) => !expiredEndpoints.has(s.subscription.endpoint)
    );
    memorySubscriptions = valid;

    if (supabase) {
      try {
        const toDelete = memorySubscriptions
          .filter((s) => expiredEndpoints.has(s.subscription.endpoint))
          .map((s) => s.id);
        if (toDelete.length > 0) {
          await supabase.from("push_subscriptions").delete().in("id", toDelete);
        }
      } catch {}
    }

    try {
      await fs.writeFile(
        SUBSCRIPTIONS_FILE,
        JSON.stringify(memorySubscriptions, null, 2),
        "utf-8"
      );
    } catch {}
  }

  return { sent, failed };
}
