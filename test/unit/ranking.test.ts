import { describe, it, expect } from "vitest";
import {
  calculateStudentTotals,
  calculateRanking,
  getStudentLeaderboardView,
} from "@/lib/ranking";
import { ContestState, Student } from "@/types/contest";
import { OFFICIAL_TESTS } from "@/lib/contestData";

describe("Ranking System & Mathematical Logic", () => {
  const createMockStudent = (
    id: string,
    name: string,
    pin: string,
    scoresByWeek: Student["scoresByWeek"] = {}
  ): Student => ({
    id,
    name,
    pin,
    avatar: "🎹",
    level: "Intermedio",
    scoresByWeek,
  });

  const baseSettings: ContestState["settings"] = {
    title: "LA LIGA INDIVIDUAL DEL PIANISTA",
    subtitle: "Prueba Test",
    adminPin: "piano1234",
    currentWeek: 2,
    totalWeeks: 27,
    tests: OFFICIAL_TESTS,
    isResultsPublished: true,
  };

  describe("calculateStudentTotals", () => {
    it("correctly sums scores across multiple weeks and captures latest week score", () => {
      const student = createMockStudent("s1", "Ana", "1001", {
        1: { obras: 6, tecnica: 2, ritmo: 4 },
        2: { obras: 4, tecnica: 1, notas: 2 },
      });

      const { totalScore, scoresByTest, latestWeekScore } = calculateStudentTotals(student, 2);

      expect(totalScore).toBe(19);
      expect(latestWeekScore).toBe(7); // 4 + 1 + 2
      expect(scoresByTest.obras).toBe(10);
      expect(scoresByTest.tecnica).toBe(3);
      expect(scoresByTest.ritmo).toBe(4);
      expect(scoresByTest.notas).toBe(2);
    });

    it("handles absent weeks or missing tests gracefully without NaN", () => {
      const student = createMockStudent("s2", "Bruno", "1002", {
        1: { obras: 4 },
        // week 2 missing
      });

      const { totalScore, scoresByTest, latestWeekScore } = calculateStudentTotals(student, 2);

      expect(totalScore).toBe(4);
      expect(latestWeekScore).toBe(0);
      expect(scoresByTest.obras).toBe(4);
      expect(scoresByTest.tecnica).toBeUndefined();
    });
  });

  describe("calculateRanking (Olympic Ties & Rank Changes)", () => {
    it("handles Olympic tie-breaking correctly (e.g., 1, 1, 3)", () => {
      const students: Student[] = [
        createMockStudent("s1", "Carlos", "1111", { 1: { obras: 10 } }),
        createMockStudent("s2", "Diana", "2222", { 1: { obras: 10 } }),
        createMockStudent("s3", "Elena", "3333", { 1: { obras: 5 } }),
      ];

      const state: ContestState = {
        settings: { ...baseSettings, currentWeek: 1 },
        students,
      };

      const ranking = calculateRanking(state);

      expect(ranking[0].rank).toBe(1);
      expect(ranking[1].rank).toBe(1);
      expect(ranking[2].rank).toBe(3); // Olympic tie skips rank 2
    });

    it("handles three-way ties (e.g., 1, 2, 2, 2, 5)", () => {
      const students: Student[] = [
        createMockStudent("s1", "Top", "1111", { 1: { obras: 20 } }),
        createMockStudent("s2", "TiedA", "2222", { 1: { obras: 15 } }),
        createMockStudent("s3", "TiedB", "3333", { 1: { obras: 15 } }),
        createMockStudent("s4", "TiedC", "4444", { 1: { obras: 15 } }),
        createMockStudent("s5", "Fifth", "5555", { 1: { obras: 10 } }),
      ];

      const state: ContestState = {
        settings: { ...baseSettings, currentWeek: 1 },
        students,
      };

      const ranking = calculateRanking(state);

      expect(ranking[0].rank).toBe(1);
      expect(ranking[1].rank).toBe(2);
      expect(ranking[2].rank).toBe(2);
      expect(ranking[3].rank).toBe(2);
      expect(ranking[4].rank).toBe(5);
    });

    it("calculates positive, negative, and zero rankChange between weeks", () => {
      const students: Student[] = [
        createMockStudent("s1", "Subidor", "1111", {
          1: { obras: 5 }, // Week 1: 5 pts (Rank 2)
          2: { obras: 20 }, // Week 2 total: 25 pts (Rank 1)
        }),
        createMockStudent("s2", "Bajador", "2222", {
          1: { obras: 10 }, // Week 1: 10 pts (Rank 1)
          2: { obras: 0 }, // Week 2 total: 10 pts (Rank 2)
        }),
      ];

      const state: ContestState = {
        settings: { ...baseSettings, currentWeek: 2 },
        students,
      };

      const ranking = calculateRanking(state, 2);

      const subidor = ranking.find((r) => r.id === "s1")!;
      const bajador = ranking.find((r) => r.id === "s2")!;

      expect(subidor.rank).toBe(1);
      expect(subidor.previousRank).toBe(2);
      expect(subidor.rankChange).toBe(1); // subió 1 puesto

      expect(bajador.rank).toBe(2);
      expect(bajador.previousRank).toBe(1);
      expect(bajador.rankChange).toBe(-1); // bajó 1 puesto
    });

    it("calculates points needed to reach the next superior rank", () => {
      const students: Student[] = [
        createMockStudent("s1", "Líder", "1111", { 1: { obras: 30 } }),
        createMockStudent("s2", "Segundo", "2222", { 1: { obras: 24 } }),
        createMockStudent("s3", "Tercero", "3333", { 1: { obras: 20 } }),
      ];

      const state: ContestState = {
        settings: { ...baseSettings, currentWeek: 1 },
        students,
      };

      const ranking = calculateRanking(state, 1);

      const lider = ranking.find((r) => r.id === "s1")!;
      const segundo = ranking.find((r) => r.id === "s2")!;
      const tercero = ranking.find((r) => r.id === "s3")!;

      expect(lider.pointsToNextRank).toBe(0);
      expect(lider.nextRankTargetName).toBeUndefined();

      // Segundo has 24 pts, Líder has 30 pts -> Needs 30 - 24 + 1 = 7 pts
      expect(segundo.pointsToNextRank).toBe(7);
      expect(segundo.nextRankTargetName).toBe("Líder");
      expect(segundo.nextRankTargetScore).toBe(30);

      // Tercero has 20 pts, Segundo has 24 pts -> Needs 24 - 20 + 1 = 5 pts
      expect(tercero.pointsToNextRank).toBe(5);
      expect(tercero.nextRankTargetName).toBe("Segundo");
      expect(tercero.nextRankTargetScore).toBe(24);
    });
  });

  describe("getStudentLeaderboardView (Privacy & Sanitization)", () => {
    it("returns strictly top 10 items without leaking PINs or phone numbers", () => {
      // 15 students
      const students: Student[] = Array.from({ length: 15 }, (_, i) =>
        createMockStudent(`s${i + 1}`, `Alumno ${i + 1}`, `pin${i + 1}`, {
          1: { obras: 30 - i },
        })
      );

      const state: ContestState = {
        settings: { ...baseSettings, currentWeek: 1 },
        students,
      };

      // Request as Alumno 12 (outside top 10)
      const view = getStudentLeaderboardView(state, "pin12");

      expect(view).not.toBeNull();
      if (!view) return;

      expect(view.top10.length).toBe(10);
      expect(view.totalParticipants).toBe(15);
      expect(view.currentStudent.id).toBe("s12");
      expect(view.currentStudent.rank).toBe(12);
      expect(view.currentStudent.isInTop10).toBe(false);

      // Verify privacy: top10 items must NOT contain pin or phone
      for (const item of view.top10) {
        expect((item as unknown as { pin?: string }).pin).toBeUndefined();
        expect((item as unknown as { phone?: string }).phone).toBeUndefined();
      }
    });

    it("correctly marks isInTop10 = true when student is among top 10", () => {
      const students: Student[] = Array.from({ length: 12 }, (_, i) =>
        createMockStudent(`s${i + 1}`, `Alumno ${i + 1}`, `pin${i + 1}`, {
          1: { obras: 30 - i },
        })
      );

      const state: ContestState = {
        settings: { ...baseSettings, currentWeek: 1 },
        students,
      };

      const view = getStudentLeaderboardView(state, "pin2");
      expect(view).not.toBeNull();
      expect(view?.currentStudent.isInTop10).toBe(true);
      expect(view?.currentStudent.rank).toBe(2);
    });

    it("returns null when an unknown PIN is provided", () => {
      const state: ContestState = {
        settings: baseSettings,
        students: [createMockStudent("s1", "A", "1111")],
      };

      const view = getStudentLeaderboardView(state, "9999");
      expect(view).toBeNull();
    });
  });
});
