import { ContestState } from "@/types/contest";
import { OFFICIAL_TESTS, generateInitial28Students } from "@/lib/contestData";
import fs from "fs/promises";
import path from "path";

// En Vercel / serverless el directorio de trabajo es de solo lectura, por lo que usamos /tmp
const isVercel = !!process.env.VERCEL;
const DATA_DIR = isVercel ? "/tmp" : path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "concurso.json");

const INITIAL_STATE: ContestState = {
  settings: {
    title: "LA LIGA INDIVIDUAL DEL PIANISTA",
    subtitle: "Bases Oficiales y Calendario Anual de Competición • 28 Alumnos",
    adminPin: "piano1234",
    currentWeek: 1,
    totalWeeks: 27,
    isResultsPublished: false,
    tests: OFFICIAL_TESTS,
  },
  students: generateInitial28Students(),
};

let memoryState: ContestState | null = null;

export async function getContestState(): Promise<ContestState> {
  if (memoryState) return memoryState;

  try {
    const content = await fs.readFile(DATA_FILE, "utf-8");
    memoryState = JSON.parse(content) as ContestState;
    return memoryState;
  } catch {
    // Si no se puede leer el archivo, inicializar con el estado oficial en memoria y guardar si es posible
    memoryState = JSON.parse(JSON.stringify(INITIAL_STATE));
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
      await fs.writeFile(DATA_FILE, JSON.stringify(memoryState, null, 2), "utf-8");
    } catch {
      // Ignorar error si el sistema de archivos es estrictamente de solo lectura
    }
    return memoryState as ContestState;
  }
}

export async function saveContestState(state: ContestState): Promise<void> {
  memoryState = state;
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
