export interface TestDefinition {
  id: string; // "obras", "tecnica", "ritmo", "notas"
  name: string;
  shortName: string;
  badge: string;
  description: string;
  rules: string;
  maxWeeklyScore?: number;
  isRotary?: boolean;
  activeWeeks?: "all" | "odd" | "even"; // odd = impares (Ritmo), even = pares (Notas)
}

export type WeeklyScores = {
  [testId: string]: number;
};

export interface Student {
  id: string;
  name: string;
  pin: string; // 4 dígitos
  avatar: string;
  phone?: string;
  level?: "Iniciación" | "Intermedio" | "Avanzado";
  scoresByWeek: {
    [weekNumber: number]: WeeklyScores;
  };
}

export interface CalendarWeek {
  weekNumber: number;
  dates: string;
  challengeType: "ritmo" | "notas" | "vacaciones" | "final";
  challengeTitle: string;
  description: string;
}

export interface ContestSettings {
  title: string;
  subtitle: string;
  adminPin: string;
  currentWeek: number;
  totalWeeks: number;
  tests: TestDefinition[];
  isResultsPublished: boolean;
}

export interface ContestState {
  settings: ContestSettings;
  students: Student[];
}

export interface StudentRankItem {
  rank: number;
  name: string;
  avatar: string;
  totalScore: number;
  isCurrentStudent: boolean;
  rankChange?: number; // >0 subió, <0 bajó, 0 se mantuvo
}

export interface CurrentStudentDetails {
  id: string;
  name: string;
  avatar: string;
  pin: string;
  rank: number;
  previousRank: number | null;
  rankChange: number;
  totalScore: number;
  scoresByTest: { [testId: string]: number };
  pointsToNextRank: number;
  nextRankTargetName?: string;
  nextRankTargetScore?: number;
  isInTop10: boolean;
}

export interface StudentLeaderboardResponse {
  contestTitle: string;
  contestSubtitle: string;
  currentWeek: number;
  totalWeeks: number;
  tests: TestDefinition[];
  top10: StudentRankItem[];
  currentStudent: CurrentStudentDetails;
  totalParticipants: number;
  activeWeeklyChallenge?: string;
}
