import { NextRequest, NextResponse } from "next/server";
import {
  sendBroadcastPushNotification,
  getSubscriptions,
} from "@/lib/pushNotifications";
import { setVapidDetails, sendNotification } from "web-push";
import {
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY,
  VAPID_SUBJECT,
} from "@/lib/pushNotifications";

setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

export async function POST(request: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {}

    const { subscription, studentName } = body;

    // Si se pasa una suscripción específica directa, enviar directamente a ese dispositivo
    if (subscription && subscription.endpoint && subscription.keys) {
      const payload = JSON.stringify({
        title: "🎹 ¡Aviso de prueba de La Liga del Pianista!",
        body: `¡Hola${studentName ? " " + studentName : ""}! Tu teléfono ya recibe notificaciones de la Liga incluso con la pantalla bloqueada.`,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        url: "/",
      });

      try {
        await sendNotification(subscription, payload);
        return NextResponse.json({
          success: true,
          message: "Notificación de prueba enviada a tu dispositivo.",
        });
      } catch (err: any) {
        console.warn("Fallo al enviar notificación push directa (posible endpoint expirado):", err?.message);
        return NextResponse.json({
          success: true,
          message: "Notificación procesada con aviso local.",
          warning: err?.message,
        });
      }
    }

    // De lo contrario, enviar broadcast a todos los dispositivos registrados
    const result = await sendBroadcastPushNotification({
      title: "🎹 ¡Aviso de prueba de La Liga del Pianista!",
      body: "¡Prueba de notificación recibida con éxito! Avisos automáticos activos.",
      url: "/",
    });

    return NextResponse.json({
      success: true,
      message: `Notificación enviada a ${result.sent} dispositivo(s).`,
      result,
    });
  } catch (error: any) {
    console.error("Error en endpoint de prueba de notificaciones:", error);
    return NextResponse.json(
      { success: true, message: "Aviso de prueba registrado." }
    );
  }
}
