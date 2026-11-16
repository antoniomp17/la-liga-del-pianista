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
import { RefreshCw, BookOpen, Sparkles, Bell } from "lucide-react";
import { OFFICIAL_CALENDAR } from "@/lib/contestData";

function ContestAppContent() {
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<"student" | "admin">("student");
  const [isMuted, setIsMuted] = useState(false);
  const [publicContestWeek, setPublicContestWeek] = useState<number>(1);

  // Modal de Bases y Calendario Oficial
  const [showRulesModal, setShowRulesModal] = useState(false);

  // Cargar semana oficial pública del concurso, registrar Service Worker y restaurar sesión persistente
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    fetch("/api/contest/info")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.currentWeek) {
          setPublicContestWeek(json.data.currentWeek);
        }
      })
      .catch(() => {});

    // Comprobar si hay PIN en URL o guardado en el dispositivo
    const pinFromUrl = searchParams.get("pin");
    const savedPin = typeof window !== "undefined" ? localStorage.getItem("piano_student_pin") : null;
    const pinToUse = pinFromUrl || savedPin;

    if (pinToUse) {
      // Auto-login: no forzar apertura del modal en recargas de página
      handleStudentLogin(pinToUse, !savedPin || !!pinFromUrl);
    }
  }, [searchParams]);

  // Datos del alumno logueado
  const [studentData, setStudentData] = useState<StudentLeaderboardResponse | null>(null);
  const [isLoadingStudent, setIsLoadingStudent] = useState(false);
  const [studentError, setStudentError] = useState("");
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  // Manejar el login de alumno por PIN
  const handleStudentLogin = async (pin: string, openModal = true) => {
    setIsLoadingStudent(true);
    setStudentError("");

    try {
      const res = await fetch(`/api/student/view?pin=${encodeURIComponent(pin)}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("piano_student_pin");
        }
        throw new Error(data.error || "Código PIN no válido.");
      }

      // Guardar PIN en localStorage para mantener sesión al recargar
      if (typeof window !== "undefined") {
        localStorage.setItem("piano_student_pin", pin);
      }

      setStudentData(data.data);
      if (data.data.currentWeek) {
        setPublicContestWeek(data.data.currentWeek);
      }

      // Solo abrir modal si es login manual y no lo había visto aún en esta semana
      const seenKey = `piano_notif_seen_${pin}_w${data.data.currentWeek}`;
      const alreadySeen = typeof window !== "undefined" && localStorage.getItem(seenKey) === "true";

      if (openModal && !alreadySeen) {
        setShowNotificationModal(true);
        if (typeof window !== "undefined") {
          localStorage.setItem(seenKey, "true");
        }
      }
    } catch (err: unknown) {
      const error = err as Error;
      setStudentError(error.message || "Error al conectar con el servidor.");
    } finally {
      setIsLoadingStudent(false);
    }
  };

  const handleLogoutStudent = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("piano_student_pin");
    }
    setStudentData(null);
    setStudentError("");
    setShowNotificationModal(false);
    if (typeof window !== "undefined") {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  };

  const currentWeekNumber = studentData?.currentWeek || publicContestWeek || 1;
  const currentWeekInfo = OFFICIAL_CALENDAR.find((c) => c.weekNumber === currentWeekNumber);
  const top3 = studentData ? studentData.top10.slice(0, 3) : [];

  return (
    <div className="min-h-screen bg-[#faf8f5] text-slate-800 flex flex-col font-sans selection:bg-amber-200 selection:text-amber-950">
      {/* Barra de navegación superior */}
      <Navbar
        contestTitle={studentData?.contestTitle || "LA LIGA DEL PIANISTA"}
        currentWeek={currentWeekNumber}
        viewMode={viewMode}
        onSwitchView={(mode) => setViewMode(mode)}
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
            onWeekUpdated={(w) => setPublicContestWeek(w)}
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
                    className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-white hover:bg-amber-50/70 border border-amber-200 text-xs text-amber-800 font-semibold transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Ver Bases Oficiales y Calendario Anual</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300">
                {/* Cabecera del Concurso con fechas oficiales y reto activo */}
                <div className="text-center py-2 sm:py-4 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-center gap-1.5">
                    <span className="text-[10px] sm:text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white border border-amber-200/80 text-amber-800 font-mono uppercase tracking-wider shadow-2xs">
                      16 NOV - JUNIO · LIGA OFICIAL
                    </span>
                    {currentWeekInfo && (
                      <span className="text-[10px] sm:text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center gap-1 shadow-2xs">
                        <Sparkles className="w-3 h-3 text-indigo-500 shrink-0" />
                        <span>Sem {currentWeekNumber}: {currentWeekInfo.challengeTitle}</span>
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowNotificationModal(true)}
                      className="text-[10px] sm:text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white border border-amber-200 text-amber-800 hover:bg-amber-50 transition-colors flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
                      title="Ver avisos y notificaciones móviles"
                    >
                      <Bell className="w-3 h-3 text-amber-600 shrink-0" />
                      <span>Avisos</span>
                    </button>
                  </div>

                  <h2 className="text-xl sm:text-3xl font-black text-slate-800 tracking-tight px-1">
                    {studentData.contestTitle}
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-500 max-w-xl mx-auto px-2">
                    {studentData.contestSubtitle} · Semana {studentData.currentWeek} de {studentData.totalWeeks} ({currentWeekInfo?.dates || ""})
                  </p>

                  {/* Tarjeta destacada: Identificación y Posición Inmediata del Alumno */}
                  <div className="pt-2 flex justify-center">
                    <div className="inline-flex items-center gap-2.5 sm:gap-3.5 px-3.5 sm:px-4 py-2 rounded-2xl bg-white border border-amber-200/90 shadow-xs text-slate-800 max-w-full">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-100 to-rose-100 border border-amber-200 flex items-center justify-center text-base sm:text-lg shrink-0 shadow-2xs">
                        {studentData.currentStudent.avatar}
                      </div>
                      <div className="text-left min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-xs sm:text-sm text-slate-800 truncate">
                            {studentData.currentStudent.name}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-black text-[11px] sm:text-xs shadow-2xs border ${
                              studentData.currentStudent.rank === 1
                                ? "bg-amber-100 text-amber-900 border-amber-300"
                                : studentData.currentStudent.rank === 2
                                ? "bg-slate-100 text-slate-700 border-slate-300"
                                : studentData.currentStudent.rank === 3
                                ? "bg-orange-100 text-orange-800 border-orange-300"
                                : "bg-sky-50 text-sky-900 border-sky-200"
                            }`}
                          >
                            <span>
                              {studentData.currentStudent.rank === 1
                                ? "🥇"
                                : studentData.currentStudent.rank === 2
                                ? "🥈"
                                : studentData.currentStudent.rank === 3
                                ? "🥉"
                                : "🏅"}
                            </span>
                            <span>
                              {studentData.currentStudent.rank === 1
                                ? "1ª Posición"
                                : studentData.currentStudent.rank === 2
                                ? "2ª Posición"
                                : studentData.currentStudent.rank === 3
                                ? "3ª Posición"
                                : `Puesto #${studentData.currentStudent.rank}`}
                            </span>
                          </span>
                        </div>
                        <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1.5 flex-wrap">
                          <span>
                            Puntuación:{" "}
                            <strong className="text-slate-700 font-mono font-bold">
                              {studentData.currentStudent.totalScore} pts
                            </strong>
                          </span>
                          {studentData.currentStudent.rankChange > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[10px]">
                              ▲ +{studentData.currentStudent.rankChange} esta semana
                            </span>
                          )}
                          {studentData.currentStudent.rankChange < 0 && (
                            <span className="inline-flex items-center gap-0.5 text-rose-700 font-bold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 text-[10px]">
                              ▼ {studentData.currentStudent.rankChange} esta semana
                            </span>
                          )}
                          {studentData.currentStudent.rankChange === 0 && (
                            <span className="text-slate-400 text-[10px]">
                              · Mantienes puesto
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
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
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-amber-50/80 border border-amber-200 text-xs text-amber-800 font-semibold transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                    <span>Reglamento & Calendario</span>
                  </button>

                  <button
                    onClick={handleLogoutStudent}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs text-slate-600 hover:text-slate-900 transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
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
      <footer className="border-t border-slate-100 bg-[#faf8f5] py-3 text-center text-[11px] text-slate-400 px-2">
        <p>🎹 LA LIGA INDIVIDUAL DEL PIANISTA · Competición Anual</p>
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
