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

// Generador de los 28 alumnos oficiales de la competición
const STUDENT_NAMES = [
  "Clara Schumann",
  "Mateo Bach",
  "Sofía Mozart",
  "Lucas Chopin",
  "Elena Beethoven",
  "Daniel Debussy",
  "Valeria Ravel",
  "Hugo Liszt",
  "Carmen Albéniz",
  "Alejandro Granados",
  // Posiciones 11 a 28 (Fuera de Top 10)
  "Martín Satie",
  "Paula Falla",
  "Marcos Brahms",
  "Lucía Tchaikovsky",
  "Adrián Haydn",
  "Sara Schubert",
  "Pablo Rachmaninoff",
  "Noa Mendelssohn",
  "Javier Prokofiev",
  "Emma Vivaldi",
  "Iker Scarlatti",
  "Alba Bartók",
  "David Handel",
  "Carla Grieg",
  "Álvaro Saint-Saëns",
  "Irene Sibelius",
  "Gonzalo Puccini",
  "Nerea Bizet",
];

const AVATARS = ["🎹", "🎼", "🌟", "🎵", "🎶", "🎻", "✨", "🔥", "🌸", "🎺", "⚡", "💫", "🎀", "🎯", "🥇", "🎨", "🚀", "💎", "🏆", "🎸", "🥁", "🪕", "🪄", "🌈", "🍀", "🌺", "🪐", "👑"];

// Lista de PINs únicos e impredecibles para los 28 alumnos (no correlativos para evitar adivinación)
const STUDENT_PINS = [
  "7429", "3185", "9042", "6518", "2834", "8190", "4721", "5368", "1947", "8603",
  "3452", "6781", "2194", "5038", "9821", "4163", "7509", "1384", "8927", "6241",
  "3970", "5814", "9432", "2765", "8051", "4693", "1528", "7346",
];

export function generateInitial28Students(): Student[] {
  return STUDENT_NAMES.map((fullName, index) => {
    const pin = STUDENT_PINS[index] || (1001 + index).toString();
    const id = fullName.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const avatar = AVATARS[index % AVATARS.length];
    const level: Student["level"] = index < 8 ? "Avanzado" : index < 18 ? "Intermedio" : "Iniciación";

    // Puntuaciones simuladas realistas para las semanas 1, 2 y 3 (Semana 1: Ritmo, Semana 2: Notas, Semana 3: Ritmo)
    // Puntos Obras (entre 0 y 8), Técnica (0 a 2), Ritmo sem 1 y 3 (0 a 4), Notas sem 2 (0 a 2)
    const baseSkill = 28 - index; // alumnos superiores tienen un poco más de consistencia
    const obrasW1 = baseSkill > 20 ? 6 : baseSkill > 10 ? 4 : 0;
    const obrasW2 = baseSkill > 22 ? 8 : baseSkill > 14 ? 6 : 0;
    const obrasW3 = baseSkill > 18 ? 6 : baseSkill > 8 ? 4 : 0;

    const tecW1 = baseSkill > 15 ? 2 : 1;
    const tecW2 = baseSkill > 12 ? 2 : 1;
    const tecW3 = baseSkill > 14 ? 2 : 1;

    const ritmoW1 = Math.min(4, Math.max(1, Math.round((baseSkill / 28) * 4)));
    const notasW2 = Math.min(2, Math.max(0.5, Math.round(((baseSkill / 28) * 2) * 2) / 2));
    const ritmoW3 = Math.min(4, Math.max(1, Math.round((baseSkill / 28) * 4)));

    return {
      id,
      name: fullName,
      pin,
      avatar,
      level,
      scoresByWeek: {
        1: { obras: obrasW1, tecnica: tecW1, ritmo: ritmoW1, notas: 0 },
        2: { obras: obrasW2, tecnica: tecW2, ritmo: 0, notas: notasW2 },
        3: { obras: obrasW3, tecnica: tecW3, ritmo: ritmoW3, notas: 0 },
      },
    };
  });
}
