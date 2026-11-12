import { ContestState } from "@/types/contest";
import { OFFICIAL_TESTS, generateInitial28Students } from "@/lib/contestData";
import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "concurso.json");

const INITIAL_STATE: ContestState = {
  settings: {
    title: "LA LIGA INDIVIDUAL DEL PIANISTA",
    subtitle: "Bases Oficiales y Calendario Anual de Competición • 28 Alumnos",
    adminPin: "piano1234",
    currentWeek: 3,
    totalWeeks: 27,
    isResultsPublished: true,
    tests: OFFICIAL_TESTS,
  },
  students: generateInitial28Students(),
};

let memoryState: ContestState | null = null;

export async function getContestState(): Promise<ContestState> {
  if (memoryState) return memoryState;

  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const content = await fs.readFile(DATA_FILE, "utf-8");
    memoryState = JSON.parse(content) as ContestState;
    return memoryState;
  } catch {
    await saveContestState(INITIAL_STATE);
    memoryState = JSON.parse(JSON.stringify(INITIAL_STATE));
    return memoryState as ContestState;
  }
}

export async function saveContestState(state: ContestState): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(state, null, 2), "utf-8");
  memoryState = state;
}

export async function resetContestState(): Promise<ContestState> {
  const fresh = JSON.parse(JSON.stringify(INITIAL_STATE));
  await saveContestState(fresh);
  return fresh;
}
