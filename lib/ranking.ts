import {
  ContestState,
  CurrentStudentDetails,
  Student,
  StudentLeaderboardResponse,
  StudentRankItem,
} from "@/types/contest";

export interface FullRankedStudent {
  id: string;
  name: string;
  avatar: string;
  pin: string;
  phone?: string;
  rank: number;
  previousRank: number | null;
  rankChange: number; // >0 subió, <0 bajó, 0 igual
  totalScore: number;
  latestWeekScore: number;
  scoresByTest: { [testId: string]: number };
  pointsToNextRank: number;
  nextRankTargetName?: string;
  nextRankTargetScore?: number;
}

/**
 * Calcula la puntuación acumulada de un alumno hasta una semana específica.
 */
export function calculateStudentTotals(student: Student, maxWeek: number) {
  let totalScore = 0;
  const scoresByTest: { [testId: string]: number } = {};
  let latestWeekScore = 0;

  for (let w = 1; w <= maxWeek; w++) {
    const weekScores = student.scoresByWeek[w];
    if (weekScores) {
      let weekSum = 0;
      for (const [testId, score] of Object.entries(weekScores)) {
        const val = Number(score) || 0;
        scoresByTest[testId] = (scoresByTest[testId] || 0) + val;
        weekSum += val;
        totalScore += val;
      }
      if (w === maxWeek) {
        latestWeekScore = weekSum;
      }
    }
  }

  return { totalScore, scoresByTest, latestWeekScore };
}

/**
 * Calcula el ranking completo con gestión de empates y tendencia histórica.
 */
export function calculateRanking(
  state: ContestState,
  weekNumber?: number
): FullRankedStudent[] {
  const currentWeek = weekNumber ?? state.settings.currentWeek;
  const previousWeek = currentWeek > 1 ? currentWeek - 1 : null;

  // 1. Calcular puntuaciones de la semana previa para la tendencia
  const previousRanks = new Map<string, number>();
  if (previousWeek) {
    const prevSorted = state.students
      .map((st) => ({
        id: st.id,
        total: calculateStudentTotals(st, previousWeek).totalScore,
      }))
      .sort((a, b) => b.total - a.total);

    let currentRank = 1;
    for (let i = 0; i < prevSorted.length; i++) {
      if (i > 0 && prevSorted[i].total < prevSorted[i - 1].total) {
        currentRank = i + 1;
      }
      previousRanks.set(prevSorted[i].id, currentRank);
    }
  }

  // 2. Calcular puntuaciones acumuladas actuales
  const computedList = state.students.map((st) => {
    const { totalScore, scoresByTest, latestWeekScore } = calculateStudentTotals(
      st,
      currentWeek
    );
    return {
      student: st,
      totalScore,
      scoresByTest,
      latestWeekScore,
    };
  });

  // Ordenar descendente por puntuación
  computedList.sort((a, b) => b.totalScore - a.totalScore);

  // 3. Asignar puestos (con empates estándar olímpico)
  const rankedItems: Array<{
    item: (typeof computedList)[0];
    rank: number;
  }> = [];

  let assignedRank = 1;
  for (let i = 0; i < computedList.length; i++) {
    if (i > 0 && computedList[i].totalScore < computedList[i - 1].totalScore) {
      assignedRank = i + 1;
    }
    rankedItems.push({
      item: computedList[i],
      rank: assignedRank,
    });
  }

  // 4. Calcular puntos necesarios para alcanzar el puesto superior
  const result: FullRankedStudent[] = [];

  for (let i = 0; i < rankedItems.length; i++) {
    const current = rankedItems[i];
    const prevRank = previousRanks.get(current.item.student.id) ?? null;
    const rankChange = prevRank !== null ? prevRank - current.rank : 0;

    let pointsToNextRank = 0;
    let nextRankTargetName: string | undefined = undefined;
    let nextRankTargetScore: number | undefined = undefined;

    if (current.rank > 1) {
      // Buscar el alumno inmediatamente por encima que tenga un puesto mejor
      for (let j = i - 1; j >= 0; j--) {
        if (rankedItems[j].rank < current.rank) {
          const superior = rankedItems[j];
          nextRankTargetName = superior.item.student.name;
          nextRankTargetScore = superior.item.totalScore;
          // Puntos necesarios para superar o alcanzar la posición
          pointsToNextRank = Math.max(0, superior.item.totalScore - current.item.totalScore + 1);
          break;
        }
      }
    }

    result.push({
      id: current.item.student.id,
      name: current.item.student.name,
      avatar: current.item.student.avatar,
      pin: current.item.student.pin,
      phone: current.item.student.phone,
      rank: current.rank,
      previousRank: prevRank,
      rankChange,
      totalScore: current.item.totalScore,
      latestWeekScore: current.item.latestWeekScore,
      scoresByTest: current.item.scoresByTest,
      pointsToNextRank,
      nextRankTargetName,
      nextRankTargetScore,
    });
  }

  return result;
}

/**
 * Genera la vista sanitizada y privada para el alumno.
 * Sólo devuelve el Top 10 + los datos propios del alumno.
 */
export function getStudentLeaderboardView(
  state: ContestState,
  studentIdOrPin: string
): StudentLeaderboardResponse | null {
  const fullRanking = calculateRanking(state);

  const matched = fullRanking.find(
    (s) => s.id === studentIdOrPin || s.pin === studentIdOrPin
  );

  if (!matched) {
    return null;
  }

  // Filtrar estrictamente el Top 10 (alumnos con rank <= 10 o los 10 primeros registros)
  const top10List = fullRanking.slice(0, 10);

  const top10Items: StudentRankItem[] = top10List.map((st) => ({
    rank: st.rank,
    name: st.name,
    avatar: st.avatar,
    totalScore: st.totalScore,
    isCurrentStudent: st.id === matched.id,
    rankChange: st.rankChange,
  }));

  const isInTop10 = top10List.some((s) => s.id === matched.id);

  const currentStudentDetails: CurrentStudentDetails = {
    id: matched.id,
    name: matched.name,
    avatar: matched.avatar,
    rank: matched.rank,
    previousRank: matched.previousRank,
    rankChange: matched.rankChange,
    totalScore: matched.totalScore,
    scoresByTest: matched.scoresByTest,
    pointsToNextRank: matched.pointsToNextRank,
    nextRankTargetName: matched.nextRankTargetName,
    nextRankTargetScore: matched.nextRankTargetScore,
    isInTop10,
  };

  return {
    contestTitle: state.settings.title,
    contestSubtitle: state.settings.subtitle,
    currentWeek: state.settings.currentWeek,
    totalWeeks: state.settings.totalWeeks,
    tests: state.settings.tests,
    top10: top10Items,
    currentStudent: currentStudentDetails,
    totalParticipants: fullRanking.length,
  };
}
