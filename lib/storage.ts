import { ContestState } from "@/types/contest";
import { OFFICIAL_TESTS, generateInitial28Students } from "@/lib/contestData";
import { supabase } from "@/lib/supabase";
import fs from "fs/promises";
import path from "path";

const isVercel = !!process.env.VERCEL;
const DATA_DIR = isVercel ? "/tmp" : path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "concurso.json");

const INITIAL_STATE: ContestState = {
  settings: {
    title: "LA LIGA INDIVIDUAL DEL PIANISTA",
    subtitle: "Bases Oficiales y Calendario Anual de Competición",
    adminPin: "piano1234",
    currentWeek: 1,
    totalWeeks: 27,
    isResultsPublished: false,
    tests: OFFICIAL_TESTS,
  },
  students: generateInitial28Students(),
};

let memoryState: ContestState | null = null;

function cleanSubtitle(subtitle?: string): string {
  if (!subtitle) return "Bases Oficiales y Calendario Anual de Competición";
  return subtitle
    .replace(/\s*•\s*\d+\s*Alumnos/gi, "")
    .replace(/\s*\(\d+\s*Alumnos\)/gi, "")
    .replace(/\b\d+\s*alumnos\b/gi, "")
    .trim();
}

export async function getContestState(): Promise<ContestState> {
  // 1. Intentar leer desde Supabase (persistente e indestructible)
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("app_state")
        .select("value")
        .eq("key", "contest_state")
        .maybeSingle();

      if (!error && data?.value) {
        memoryState = data.value as ContestState;
        if (memoryState?.settings?.subtitle) {
          memoryState.settings.subtitle = cleanSubtitle(memoryState.settings.subtitle);
        }
        return memoryState;
      }

      // Si no existe fila en Supabase aún, inicializarla
      if (!error && !data) {
        console.log("Inicializando estado en Supabase...");
        const initial = JSON.parse(JSON.stringify(INITIAL_STATE));
        initial.settings.subtitle = cleanSubtitle(initial.settings.subtitle);
        await supabase.from("app_state").insert({
          key: "contest_state",
          value: initial,
        });
        memoryState = initial;
        return memoryState as ContestState;
      }
    } catch (err) {
      console.warn("Supabase getContestState error, usando fallback local:", err);
    }
  }

  // 2. Fallback a memoria si ya se cargó
  if (memoryState) {
    if (memoryState.settings?.subtitle) {
      memoryState.settings.subtitle = cleanSubtitle(memoryState.settings.subtitle);
    }
    return memoryState;
  }

  // 3. Fallback a archivo de disco local/tmp
  try {
    const content = await fs.readFile(DATA_FILE, "utf-8");
    memoryState = JSON.parse(content) as ContestState;
    if (memoryState?.settings?.subtitle) {
      memoryState.settings.subtitle = cleanSubtitle(memoryState.settings.subtitle);
    }
    return memoryState;
  } catch {
    memoryState = JSON.parse(JSON.stringify(INITIAL_STATE));
    if (memoryState?.settings?.subtitle) {
      memoryState.settings.subtitle = cleanSubtitle(memoryState.settings.subtitle);
    }
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(DATA_FILE, JSON.stringify(memoryState, null, 2), "utf-8");
    } catch {
      // Ignorar
    }
    return memoryState as ContestState;
  }
}

export async function saveContestState(state: ContestState): Promise<void> {
  if (state?.settings?.subtitle) {
    state.settings.subtitle = cleanSubtitle(state.settings.subtitle);
  }
  memoryState = state;

  // 1. Guardar en Supabase (permanente)
  if (supabase) {
    try {
      const { error } = await supabase.from("app_state").upsert({
        key: "contest_state",
        value: state,
        updated_at: new Date().toISOString(),
      });
      if (error) {
        console.error("Error al guardar estado en Supabase:", error);
      }
    } catch (err) {
      console.error("Excepción al guardar en Supabase:", err);
    }
  }

  // 2. Guardar también en archivo local / tmp
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch (err) {
    console.warn("No se pudo escribir en disco, guardado en memoria:", err);
  }
}

export async function resetContestState(): Promise<ContestState> {
  const fresh = JSON.parse(JSON.stringify(INITIAL_STATE));
  await saveContestState(fresh);
  return fresh;
}
