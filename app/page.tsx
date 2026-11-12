"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { StudentLogin } from "@/components/StudentLogin";
import { Podium } from "@/components/Podium";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { PointsToNextRankCard } from "@/components/PointsToNextRankCard";
import { TestBreakdownCards } from "@/components/TestBreakdownCards";
import { NotificationModal } from "@/components/NotificationModal";
import { AdminDashboard } from "@/components/AdminDashboard";
import { RulesAndCalendarModal } from "@/components/RulesAndCalendarModal";
import { StudentLeaderboardResponse } from "@/types/contest";
import { RefreshCw, BookOpen, Sparkles } from "lucide-react";
import { OFFICIAL_CALENDAR } from "@/lib/contestData";

function ContestAppContent() {
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<"student" | "admin">("student");
  const [isMuted, setIsMuted] = useState(false);

  // Modal de Bases y Calendario Oficial
  const [showRulesModal, setShowRulesModal] = useState(false);

  // Datos del alumno logueado
  const [studentData, setStudentData] = useState<StudentLeaderboardResponse | null>(null);
  const [isLoadingStudent, setIsLoadingStudent] = useState(false);
  const [studentError, setStudentError] = useState("");
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  // Leer PIN desde la URL al cargar (ejemplo: ?pin=7429 o ?pin=3452)
  useEffect(() => {
    const pinFromUrl = searchParams.get("pin");
    if (pinFromUrl) {
      handleStudentLogin(pinFromUrl);
    }
  }, [searchParams]);

  // Manejar el login de alumno por PIN
  const handleStudentLogin = async (pin: string) => {
    setIsLoadingStudent(true);
    setStudentError("");

    try {
      const res = await fetch(`/api/student/view?pin=${encodeURIComponent(pin)}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Código PIN no válido.");
      }

      setStudentData(data.data);
      setShowNotificationModal(true);
    } catch (err: unknown) {
      const error = err as Error;
      setStudentError(error.message || "Error al conectar con el servidor.");
    } finally {
      setIsLoadingStudent(false);
    }
  };

  const handleLogoutStudent = () => {
    setStudentData(null);
    setStudentError("");
    setShowNotificationModal(false);
    if (typeof window !== "undefined") {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  };

  const currentWeekNumber = studentData?.currentWeek || 3;
  const currentWeekInfo = OFFICIAL_CALENDAR.find((c) => c.weekNumber === currentWeekNumber);
  const top3 = studentData ? studentData.top10.slice(0, 3) : [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Barra de navegación superior */}
      <Navbar
        contestTitle={studentData?.contestTitle || "LA LIGA DEL PIANISTA"}
        currentWeek={currentWeekNumber}
        viewMode={viewMode}
        onSwitchView={(mode) => setViewMode(mode)}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted((prev) => !prev)}
        currentStudentName={studentData?.currentStudent.name}
        onLogoutStudent={handleLogoutStudent}
        onOpenRules={() => setShowRulesModal(true)}
      />

      <main className="flex-1 w-full max-w-5xl mx-auto px-2.5 sm:px-4 py-3 sm:py-6">
        {/* VISTA 1: PANEL DE PROFESORA (ADMIN) */}
        {viewMode === "admin" && (
          <AdminDashboard
            onLogout={() => setViewMode("student")}
            onOpenRules={() => setShowRulesModal(true)}
          />
        )}

        {/* VISTA 2: VISTA DEL ALUMNO */}
        {viewMode === "student" && (
          <>
            {!studentData ? (
              <div className="py-2 sm:py-6 space-y-4">
                <StudentLogin
                  onLogin={handleStudentLogin}
                  isLoading={isLoadingStudent}
                  errorMessage={studentError}
                  isMuted={isMuted}
                />

                {/* Banner de acceso a Bases y Calendario para alumnos */}
                <div className="max-w-md mx-auto text-center px-2">
                  <button
                    onClick={() => setShowRulesModal(true)}
                    className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-amber-300 font-semibold transition-all shadow-sm cursor-pointer active:scale-95"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Ver Bases Oficiales y Calendario Anual</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300">
                {/* Cabecera del Concurso con fechas oficiales y reto activo */}
                <div className="text-center py-2 sm:py-4 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-center gap-1.5">
                    <span className="text-[10px] sm:text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-amber-300 font-mono uppercase tracking-wider">
                      16 NOV - JUNIO · 28 ALUMNOS
                    </span>
                    {currentWeekInfo && (
                      <span className="text-[10px] sm:text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-indigo-400 shrink-0" />
                        <span>Sem {currentWeekNumber}: {currentWeekInfo.challengeTitle}</span>
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight px-1">
                    {studentData.contestTitle}
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-400 max-w-xl mx-auto px-2">
                    {studentData.contestSubtitle} · Semana {studentData.currentWeek} de {studentData.totalWeeks} ({currentWeekInfo?.dates || ""})
                  </p>
                </div>

                {/* Tarjeta Clave: ¿Cuántos puntos le quedan para la siguiente posición? */}
                <PointsToNextRankCard currentStudent={studentData.currentStudent} />

                {/* Podio de los 3 Primeros (Oro, Plata, Bronce) */}
                <Podium top3={top3} />

                {/* Tabla de Clasificación: Top 10 + Tu Puesto Privado */}
                <LeaderboardTable
                  top10={studentData.top10}
                  currentStudent={studentData.currentStudent}
                />

                {/* Desglose de los Frentes Oficiales (Obras, Técnica, Ritmo, Claves) */}
                <TestBreakdownCards
                  tests={studentData.tests}
                  scoresByTest={studentData.currentStudent.scoresByTest}
                />

                {/* Acciones inferiores */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2 pb-6">
                  <button
                    onClick={() => setShowRulesModal(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/30 text-xs text-amber-300 font-semibold transition-all shadow-md cursor-pointer active:scale-95"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Reglamento & Calendario</span>
                  </button>

                  <button
                    onClick={handleLogoutStudent}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-400 hover:text-white transition-all shadow-md cursor-pointer active:scale-95"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Cambiar de alumno</span>
                  </button>
                </div>

                {/* Modal Notificación de cambio de puesto (Subida/Bajada) */}
                {showNotificationModal && (
                  <NotificationModal
                    currentStudent={studentData.currentStudent}
                    isMuted={isMuted}
                    onClose={() => setShowNotificationModal(false)}
                  />
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Modal global de Bases y Calendario */}
      {showRulesModal && (
        <RulesAndCalendarModal
          currentWeek={currentWeekNumber}
          onClose={() => setShowRulesModal(false)}
        />
      )}

      {/* Pie de página oficial */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-3 text-center text-[11px] text-slate-500 px-2">
        <p>🎹 LA LIGA INDIVIDUAL DEL PIANISTA · Competición Anual · 28 Alumnos</p>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-slate-400 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ContestAppContent />
    </Suspense>
  );
}
