import { CalendarWeek, TestDefinition, Student } from "@/types/contest";

export const OFFICIAL_TESTS: TestDefinition[] = [
  {
    id: "obras",
    name: "Práctica de Obras (Factor ×2)",
    shortName: "Obras (×2)",
    badge: "Motor Principal",
    description: "2 PTS / semana estimada al terminar una obra. Ventaja si terminas antes.",
    rules: "Cada alumno lleva 2 obras simultáneas. Al terminarla, otorga el doble de puntos de las semanas estimadas (ej: obra de 3 semanas = 6 pts; 4 semanas = 8 pts). Las ausencias siguen contando en la obra.",
    maxWeeklyScore: 16,
    activeWeeks: "all",
  },
  {
    id: "tecnica",
    name: "Técnica Semanal Fija",
    shortName: "Técnica Fija",
    badge: "Todas las semanas",
    description: "2 ejercicios pequeños de técnica adaptados a nivel. 1 PT por ejercicio (Máx 2 PTS/sem).",
    rules: "Máximo de 4 oportunidades en clase para pasar cada ejercicio a la velocidad y limpieza requeridas. 1 punto por ejercicio superado.",
    maxWeeklyScore: 2,
    activeWeeks: "all",
  },
  {
    id: "ritmo",
    name: "Reto: Lectura Musical y Ritmo",
    shortName: "Reto Ritmo",
    badge: "Semanas Impares",
    description: "4 ejercicios rítmicos al azar con cambio de clave. 1 PT por ejercicio (Máx 4 PTS/sem).",
    rules: "Ejercicios al azar de las últimas 10 páginas con cambio de clave en el medio. Cuenta con 1 comodín semanal para repetir un ejercicio fallado.",
    maxWeeklyScore: 4,
    isRotary: true,
    activeWeeks: "odd",
  },
  {
    id: "notas",
    name: "Reto: Lectura de Notas y Claves",
    shortName: "Reto Claves",
    badge: "Semanas Pares",
    description: "4 líneas alternando claves con tiempo límite por nivel. 0,5 pts/línea (Máx 2 PTS/sem).",
    rules: "Tiempo máximo según nivel: Iniciación (20s), Intermedio (15s), Avanzado (10s). Cuenta con 1 comodín semanal para repetir una línea fallada o fuera de tiempo.",
    maxWeeklyScore: 2,
    isRotary: true,
    activeWeeks: "even",
  },
];

export const OFFICIAL_CALENDAR: CalendarWeek[] = [
  {
    weekNumber: 1,
    dates: "16 nov - 21 nov",
    challengeType: "ritmo",
    challengeTitle: "Lectura Musical (Ritmo)",
    description: "4 ejercicios rítmicos al azar con cambio de clave • 1 comodín • Hasta 4 pts",
  },
  {
    weekNumber: 2,
    dates: "23 nov - 28 nov",
    challengeType: "notas",
    challengeTitle: "Lectura de Notas (Claves)",
    description: "4 líneas alternando claves (0,5 pts por línea) • Con tiempo límite • 1 comodín",
  },
  {
    weekNumber: 3,
    dates: "30 nov - 5 dic",
    challengeType: "ritmo",
    challengeTitle: "Lectura Musical (Ritmo)",
    description: "4 ejercicios rítmicos al azar con cambio de clave • 1 comodín • Hasta 4 pts",
  },
  {
    weekNumber: 4,
    dates: "7 dic - 12 dic",
    challengeType: "notas",
    challengeTitle: "Lectura de Notas (Claves)",
    description: "4 líneas alternando claves (0,5 pts por línea) • Con tiempo límite • 1 comodín",
  },
  {
    weekNumber: 5,
    dates: "14 dic - 19 dic",
    challengeType: "ritmo",
    challengeTitle: "Lectura Musical (Ritmo)",
    description: "4 ejercicios rítmicos al azar con cambio de clave • 1 comodín • Hasta 4 pts",
  },
  {
    weekNumber: 6,
    dates: "11 ene - 16 ene",
    challengeType: "notas",
    challengeTitle: "Lectura de Notas (Claves)",
    description: "4 líneas alternando claves (0,5 pts por línea) • Con tiempo límite • 1 comodín",
  },
  {
    weekNumber: 7,
    dates: "18 ene - 23 ene",
    challengeType: "ritmo",
    challengeTitle: "Lectura Musical (Ritmo)",
    description: "4 ejercicios rítmicos al azar con cambio de clave • 1 comodín • Hasta 4 pts",
  },
  {
    weekNumber: 8,
    dates: "25 ene - 30 ene",
    challengeType: "notas",
    challengeTitle: "Lectura de Notas (Claves)",
    description: "4 líneas alternando claves (0,5 pts por línea) • Con tiempo límite • 1 comodín",
  },
  {
    weekNumber: 9,
    dates: "1 feb - 6 feb",
    challengeType: "ritmo",
    challengeTitle: "Lectura Musical (Ritmo)",
    description: "4 ejercicios rítmicos al azar con cambio de clave • 1 comodín • Hasta 4 pts",
  },
  {
    weekNumber: 10,
    dates: "8 feb - 13 feb",
    challengeType: "notas",
    challengeTitle: "Lectura de Notas (Claves)",
    description: "4 líneas alternando claves (0,5 pts por línea) • Con tiempo límite • 1 comodín",
  },
  {
    weekNumber: 11,
    dates: "15 feb - 20 feb",
    challengeType: "ritmo",
    challengeTitle: "Lectura Musical (Ritmo)",
    description: "4 ejercicios rítmicos al azar con cambio de clave • 1 comodín • Hasta 4 pts",
  },
  {
    weekNumber: 12,
    dates: "22 feb - 27 feb",
    challengeType: "notas",
    challengeTitle: "Lectura de Notas (Claves)",
    description: "4 líneas alternando claves (0,5 pts por línea) • Con tiempo límite • 1 comodín",
  },
  {
    weekNumber: 13,
    dates: "1 mar - 6 mar",
    challengeType: "ritmo",
    challengeTitle: "Lectura Musical (Ritmo)",
    description: "4 ejercicios rítmicos al azar con cambio de clave • 1 comodín • Hasta 4 pts",
  },
  {
    weekNumber: 14,
    dates: "8 mar - 13 mar",
    challengeType: "notas",
    challengeTitle: "Lectura de Notas (Claves)",
    description: "4 líneas alternando claves (0,5 pts por línea) • Con tiempo límite • 1 comodín",
  },
  {
    weekNumber: 15,
    dates: "15 mar - 20 mar",
    challengeType: "ritmo",
    challengeTitle: "Lectura Musical (Ritmo)",
    description: "4 ejercicios rítmicos al azar con cambio de clave • 1 comodín • Hasta 4 pts",
  },
  {
    weekNumber: 16,
    dates: "30 mar - 4 abr",
    challengeType: "notas",
    challengeTitle: "Lectura de Notas (Claves)",
    description: "4 líneas alternando claves (0,5 pts por línea) • Con tiempo límite • 1 comodín",
  },
  {
    weekNumber: 17,
    dates: "6 abr - 11 abr",
    challengeType: "ritmo",
    challengeTitle: "Lectura Musical (Ritmo)",
    description: "4 ejercicios rítmicos al azar con cambio de clave • 1 comodín • Hasta 4 pts",
  },
  {
    weekNumber: 18,
    dates: "13 abr - 18 abr",
    challengeType: "notas",
    challengeTitle: "Lectura de Notas (Claves)",
    description: "4 líneas alternando claves (0,5 pts por línea) • Con tiempo límite • 1 comodín",
  },
  {
    weekNumber: 19,
    dates: "20 abr - 25 abr",
    challengeType: "ritmo",
    challengeTitle: "Lectura Musical (Ritmo)",
    description: "4 ejercicios rítmicos al azar con cambio de clave • 1 comodín • Hasta 4 pts",
  },
  {
    weekNumber: 20,
    dates: "27 abr - 2 may",
    challengeType: "notas",
    challengeTitle: "Lectura de Notas (Claves)",
    description: "4 líneas alternando claves (0,5 pts por línea) • Con tiempo límite • 1 comodín",
  },
  {
    weekNumber: 21,
    dates: "4 may - 9 may",
    challengeType: "ritmo",
    challengeTitle: "Lectura Musical (Ritmo)",
    description: "4 ejercicios rítmicos al azar con cambio de clave • 1 comodín • Hasta 4 pts",
  },
  {
    weekNumber: 22,
    dates: "11 may - 16 may",
    challengeType: "notas",
    challengeTitle: "Lectura de Notas (Claves)",
    description: "4 líneas alternando claves (0,5 pts por línea) • Con tiempo límite • 1 comodín",
  },
  {
    weekNumber: 23,
    dates: "18 may - 23 may",
    challengeType: "ritmo",
    challengeTitle: "Lectura Musical (Ritmo)",
    description: "4 ejercicios rítmicos al azar con cambio de clave • 1 comodín • Hasta 4 pts",
  },
  {
    weekNumber: 24,
    dates: "25 may - 30 may",
    challengeType: "notas",
    challengeTitle: "Lectura de Notas (Claves)",
    description: "4 líneas alternando claves (0,5 pts por línea) • Con tiempo límite • 1 comodín",
  },
  {
    weekNumber: 25,
    dates: "1 jun - 6 jun",
    challengeType: "ritmo",
    challengeTitle: "Lectura Musical (Ritmo)",
    description: "4 ejercicios rítmicos al azar con cambio de clave • 1 comodín • Hasta 4 pts",
  },
  {
    weekNumber: 26,
    dates: "8 jun - 13 jun",
    challengeType: "notas",
    challengeTitle: "Lectura de Notas (Claves)",
    description: "4 líneas alternando claves (0,5 pts por línea) • Con tiempo límite • 1 comodín",
  },
  {
    weekNumber: 27,
    dates: "15 jun - 20 jun",
    challengeType: "ritmo",
    challengeTitle: "Lectura Musical (Ritmo)",
    description: "Última semana puntuable: Ritmo 4 ejers con cambio de clave",
  },
];

// Lista oficial de alumnos de la competición
const STUDENT_NAMES = [
  "Laura",
  "Laura C.",
  "Pilar",
  "Ana",
  "Cristina",
  "Cris",
  "Ángel",
  "Ángela",
  "Javi",
  "Edu",
  "Antonio",
  "Jenni",
  "Tatiana",
  "Jenny",
  "Nicole",
  "Lucas",
  "Lurdes",
  "Fátima",
  "Alejandra",
  "Ramón",
  "Casandra",
  "Jesyca",
];

const AVATARS = [
  "🎹", "🎼", "🌟", "🎵", "🎶", "🎻", "✨", "🔥", "🌸", "🎺",
  "⚡", "💫", "🎀", "🎯", "🥇", "🎨", "🚀", "💎", "🏆", "🎸",
  "🥁", "🪕", "🪄", "🌈", "🍀", "🌺", "🪐", "👑"
];

// Lista de PINs únicos e impredecibles para los alumnos
const STUDENT_PINS = [
  "7429", // Laura
  "3185", // Laura C.
  "9042", // Pilar
  "6518", // Ana
  "2834", // Cristina
  "8190", // Cris
  "4721", // Ángel
  "5368", // Ángela
  "1947", // Javi
  "8603", // Edu
  "3452", // Antonio
  "6781", // Jenni
  "2194", // Tatiana
  "5038", // Jenny
  "9821", // Nicole
  "4163", // Lucas
  "7509", // Lurdes
  "1384", // Fátima
  "8927", // Alejandra
  "6241", // Ramón
  "3970", // Casandra
  "9432", // Jesyca
];

export function generateInitial28Students(): Student[] {
  return STUDENT_NAMES.map((fullName, index) => {
    const pin = STUDENT_PINS[index] || (1001 + index).toString();
    const id = fullName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    const avatar = AVATARS[index % AVATARS.length];
    const level: Student["level"] = index < 7 ? "Avanzado" : index < 15 ? "Intermedio" : "Iniciación";

    return {
      id: id || `alumno-${index + 1}`,
      name: fullName,
      pin,
      avatar,
      level,
      scoresByWeek: {},
    };
  });
}
