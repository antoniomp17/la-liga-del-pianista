import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StudentLogin } from "@/components/StudentLogin";
import { Podium } from "@/components/Podium";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { PointsToNextRankCard } from "@/components/PointsToNextRankCard";
import { TestBreakdownCards } from "@/components/TestBreakdownCards";
import { RulesAndCalendarModal } from "@/components/RulesAndCalendarModal";
import { OFFICIAL_TESTS } from "@/lib/contestData";
import { CurrentStudentDetails, StudentRankItem } from "@/types/contest";

describe("UI Components Unit Tests", () => {
  describe("StudentLogin Component", () => {
    it("renders form elements and handles pin input and submission", () => {
      const handleLogin = vi.fn().mockResolvedValue(undefined);
      render(<StudentLogin onLogin={handleLogin} isLoading={false} isMuted={true} />);

      expect(screen.getByText("LA LIGA DEL PIANISTA 🎹")).toBeInTheDocument();
      const input = screen.getByPlaceholderText("••••");
      expect(input).toBeInTheDocument();

      fireEvent.change(input, { target: { value: "7429" } });
      const submitButton = screen.getByRole("button", { name: /Acceder a mi Clasificación/i });
      fireEvent.click(submitButton);

      expect(handleLogin).toHaveBeenCalledWith("7429");
    });

    it("displays error message when provided", () => {
      render(
        <StudentLogin
          onLogin={vi.fn()}
          isLoading={false}
          errorMessage="PIN incorrecto"
          isMuted={true}
        />
      );

      expect(screen.getByText("PIN incorrecto")).toBeInTheDocument();
    });
  });

  describe("Podium Component", () => {
    const top3: StudentRankItem[] = [
      { rank: 1, name: "Lucas", avatar: "🎹", totalScore: 45, isCurrentStudent: false },
      { rank: 2, name: "Sofía", avatar: "✨", totalScore: 40, isCurrentStudent: true },
      { rank: 3, name: "Mateo", avatar: "🎼", totalScore: 38, isCurrentStudent: false },
    ];

    it("renders the 3 medalists and highlights current student with '¡Tú!'", () => {
      render(<Podium top3={top3} />);

      expect(screen.getByText("Lucas")).toBeInTheDocument();
      expect(screen.getByText("45 pts")).toBeInTheDocument();

      expect(screen.getByText("Sofía")).toBeInTheDocument();
      expect(screen.getByText("40 pts")).toBeInTheDocument();
      expect(screen.getByText("¡Tú!")).toBeInTheDocument(); // Sofía isCurrentStudent

      expect(screen.getByText("Mateo")).toBeInTheDocument();
      expect(screen.getByText("38 pts")).toBeInTheDocument();
    });

    it("returns null if less than 3 students", () => {
      const { container } = render(<Podium top3={[]} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe("PointsToNextRankCard Component", () => {
    it("renders leader state when rank is 1", () => {
      const leaderStudent: CurrentStudentDetails = {
        id: "s1",
        name: "Líder Supremo",
        avatar: "👑",
        rank: 1,
        previousRank: 1,
        rankChange: 0,
        totalScore: 50,
        scoresByTest: {},
        pointsToNextRank: 0,
        isInTop10: true,
      };

      render(<PointsToNextRankCard currentStudent={leaderStudent} />);
      expect(screen.getByText("Líder de la Liga")).toBeInTheDocument();
      expect(screen.getByText(/¡Vas en 1ª posición!/i)).toBeInTheDocument();
    });

    it("renders chaser state with target name and points needed", () => {
      const chaserStudent: CurrentStudentDetails = {
        id: "s2",
        name: "Perseguidor",
        avatar: "🎹",
        rank: 2,
        previousRank: 3,
        rankChange: 1,
        totalScore: 42,
        scoresByTest: {},
        pointsToNextRank: 9,
        nextRankTargetName: "Líder Supremo",
        nextRankTargetScore: 50,
        isInTop10: true,
      };

      render(<PointsToNextRankCard currentStudent={chaserStudent} />);
      expect(screen.getByText("Objetivo Próxima Posición")).toBeInTheDocument();
      expect(screen.getByText("9")).toBeInTheDocument();
      expect(screen.getByText("puntos")).toBeInTheDocument();
      expect(screen.getByText(/Líder Supremo/i)).toBeInTheDocument();
    });
  });

  describe("LeaderboardTable Component", () => {
    it("renders top 10 items and pinned card for student outside top 10", () => {
      const top10: StudentRankItem[] = Array.from({ length: 10 }, (_, i) => ({
        rank: i + 1,
        name: `Top Alumno ${i + 1}`,
        avatar: "🎹",
        totalScore: 50 - i * 2,
        isCurrentStudent: false,
      }));

      const outsideStudent: CurrentStudentDetails = {
        id: "s18",
        name: "Alumno Dieciocho",
        avatar: "🎵",
        rank: 18,
        previousRank: 20,
        rankChange: 2,
        totalScore: 16,
        scoresByTest: {},
        pointsToNextRank: 3,
        isInTop10: false,
      };

      render(<LeaderboardTable top10={top10} currentStudent={outsideStudent} />);

      expect(screen.getByText("Top 10 de Honor")).toBeInTheDocument();
      expect(screen.getByText("Top Alumno 1")).toBeInTheDocument();
      expect(screen.getByText("Top Alumno 10")).toBeInTheDocument();

      // Pinned card for outside student
      expect(screen.getByText("¡Tu Puesto!")).toBeInTheDocument();
      expect(screen.getByText("#18")).toBeInTheDocument();
      expect(screen.getByText("Alumno Dieciocho")).toBeInTheDocument();
    });
  });

  describe("TestBreakdownCards Component", () => {
    it("renders all 4 test categories and assigned scores", () => {
      const scores = { obras: 14, tecnica: 3, ritmo: 4, notas: 2 };
      render(<TestBreakdownCards tests={OFFICIAL_TESTS} scoresByTest={scores} />);

      expect(screen.getByText("Tu Puntuación en los Frentes Oficiales")).toBeInTheDocument();
      expect(screen.getByText("Práctica de Obras (Factor ×2)")).toBeInTheDocument();
      expect(screen.getByText("14")).toBeInTheDocument();
      expect(screen.getByText("Técnica Semanal Fija")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("Reto: Lectura Musical y Ritmo")).toBeInTheDocument();
      expect(screen.getByText("4")).toBeInTheDocument();
      expect(screen.getByText("Reto: Lectura de Notas y Claves")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });

  describe("RulesAndCalendarModal Component", () => {
    it("allows switching between Bases and Calendario tabs", () => {
      const handleClose = vi.fn();
      render(<RulesAndCalendarModal currentWeek={3} onClose={handleClose} />);

      expect(screen.getByText("Bases Oficiales & Calendario de Competición")).toBeInTheDocument();
      expect(screen.getByText("1. Fuentes de Puntos")).toBeInTheDocument();

      // Click Calendario tab
      const calTab = screen.getByText(/2\. Calendario/i);
      fireEvent.click(calTab);

      // Check week highlight or calendar items
      expect(screen.getByText(/Semana Actual: #3/i)).toBeInTheDocument();
      expect(screen.getByText("En curso")).toBeInTheDocument();

      // Click close button
      const closeBtn = screen.getByRole("button", { name: /Cerrar modal/i });
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalled();
    });
  });
});
