"use client";

import React, { useState } from "react";
import { BookOpen, Calendar, X, Sparkles } from "lucide-react";
import { OFFICIAL_CALENDAR } from "@/lib/contestData";

interface RulesAndCalendarModalProps {
  currentWeek: number;
  onClose: () => void;
}

export const RulesAndCalendarModal: React.FC<RulesAndCalendarModalProps> = ({
  currentWeek,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"bases" | "calendario">("bases");

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-[90dvh] sm:h-auto sm:max-h-[85vh] bg-slate-900 border border-slate-700/80 rounded-t-3xl sm:rounded-3xl shadow-2xl text-slate-100 flex flex-col overflow-hidden">
        {/* Cabecera del Modal Móvil */}
        <div className="p-3.5 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/90 shrink-0">
          <div className="min-w-0 pr-2">
            <span className="text-[9px] sm:text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
              16 Nov - Finales Junio · 28 Alumnos
            </span>
            <h2 className="text-base sm:text-xl font-black text-white mt-1 truncate">
              LA LIGA DEL PIANISTA
            </h2>
            <p className="text-[10px] sm:text-[11px] text-slate-400">
              Bases Oficiales & Calendario de Competición
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors active:scale-95 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pestañas fijas */}
        <div className="flex border-b border-slate-800 bg-slate-950/70 px-2 sm:px-5 pt-1 gap-1 sm:gap-2 shrink-0">
          <button
            onClick={() => setActiveTab("bases")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 py-2.5 px-3 font-bold text-xs sm:text-sm border-b-2 transition-all ${
              activeTab === "bases"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span>1. Fuentes de Puntos</span>
          </button>

          <button
            onClick={() => setActiveTab("calendario")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 py-2.5 px-3 font-bold text-xs sm:text-sm border-b-2 transition-all ${
              activeTab === "calendario"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>2. Calendario (27 Sem)</span>
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-3.5 sm:space-y-5">
          {activeTab === "bases" && (
            <div className="space-y-3.5">
              {/* 1. Obras */}
              <div className="bg-slate-950/70 p-3.5 sm:p-5 rounded-2xl border border-rose-500/30 shadow-md space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🎼</span>
                    <h3 className="text-sm sm:text-base font-black text-rose-300">
                      1. PRÁCTICA DE OBRAS (Factor ×2)
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    2 PTS / sem estimada
                  </span>
                </div>

                <ul className="text-xs sm:text-sm text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
                  <li>
                    <strong>Dos obras simultáneas</strong> por alumno. Se fija un plazo estimado según nivel.
                  </li>
                  <li>
                    <strong>Asignación de puntos (Factor ×2):</strong> Al terminar una obra, otorga el <strong>doble de puntos</strong> de las semanas estimadas (ej: obra 3 sem = <strong>6 pts</strong>; 4 sem = <strong>8 pts</strong>).
                  </li>
                  <li>
                    <strong>Ritmo y ventaja:</strong> Si terminas antes de tiempo, sumas tus puntos de golpe y arrancas la siguiente obra para tomar ventaja.
                  </li>
                  <li>
                    <strong>Ausencias:</strong> Siguen contando en la obra (se asume práctica en casa).
                  </li>
                </ul>
              </div>

              {/* 2. Técnica */}
              <div className="bg-slate-950/70 p-3.5 sm:p-5 rounded-2xl border border-emerald-500/30 shadow-md space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🛠️</span>
                    <h3 className="text-sm sm:text-base font-black text-emerald-300">
                      2. TÉCNICA SEMANAL (Todas las semanas)
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Máx 2 PTS/sem
                  </span>
                </div>

                <ul className="text-xs sm:text-sm text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
                  <li>
                    Cada semana: <strong>2 ejercicios pequeños</strong> adaptados a tu nivel.
                  </li>
                  <li>
                    Dispones de <strong>máximo 4 intentos</strong> en clase para pasar cada ejercicio a velocidad y limpieza.
                  </li>
                  <li>
                    Cada ejercicio superado otorga <strong>1 punto</strong> (máximo 2 puntos semanales).
                  </li>
                </ul>
              </div>

              {/* 3. Retos Rotativos */}
              <div className="bg-slate-950/70 p-3.5 sm:p-5 rounded-2xl border border-cyan-500/30 shadow-md space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🔄</span>
                    <h3 className="text-sm sm:text-base font-black text-cyan-300">
                      3. RETOS DE LECTURA (Semanas Alternas)
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Hasta 4 PTS/sem
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                  {/* Reto Ritmo */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/30 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🥁</span>
                      <h4 className="font-bold text-amber-300 text-xs sm:text-sm">
                        A) Semana de Ritmo (Semanas Impares)
                      </h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      <strong>4 ejercicios rítmicos</strong> al azar con cambio de clave. <strong>1 pt por ejercicio</strong> (hasta 4 pts).
                    </p>
                    <div className="mt-1.5 p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-300 flex items-center gap-1 font-semibold">
                      <Sparkles className="w-3 h-3 shrink-0" />
                      <span>1 comodín semanal para repetir un ejercicio fallado.</span>
                    </div>
                  </div>

                  {/* Reto Notas */}
                  <div className="p-3 rounded-xl bg-slate-900 border border-cyan-500/30 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🎼</span>
                      <h4 className="font-bold text-cyan-300 text-xs sm:text-sm">
                        B) Lectura de Notas / Claves (Semanas Pares)
                      </h4>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      <strong>4 líneas alternando claves</strong> con tiempo límite según nivel:
                      <br />
                      • Iniciación: 20s · Intermedio: 15s · Avanzado: 10s.
                      <br />
                      0,5 pts/línea (máx 2 pts/sem).
                    </p>
                    <div className="mt-1.5 p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-[10px] text-cyan-300 flex items-center gap-1 font-semibold">
                      <Sparkles className="w-3 h-3 shrink-0" />
                      <span>1 comodín semanal para repetir una línea fallada.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "calendario" && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Calendario oficial de 27 semanas</span>
                <span className="text-amber-400 font-bold">Semana Actual: #{currentWeek}</span>
              </div>

              <div className="divide-y divide-slate-800 border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/60">
                {OFFICIAL_CALENDAR.map((cal) => {
                  const isCurrent = cal.weekNumber === currentWeek;
                  const isRitmo = cal.challengeType === "ritmo";

                  return (
                    <div
                      key={cal.weekNumber}
                      className={`p-2.5 sm:p-3 flex items-center justify-between gap-2 transition-colors ${
                        isCurrent
                          ? "bg-amber-500/15 border-l-4 border-amber-400"
                          : "hover:bg-slate-900/60"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg font-mono font-bold text-[11px] sm:text-xs flex items-center justify-center shrink-0 ${
                            isCurrent
                              ? "bg-amber-400 text-slate-950"
                              : "bg-slate-800 text-slate-300"
                          }`}
                        >
                          S{cal.weekNumber}
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-slate-200 truncate flex items-center gap-1.5">
                            <span>{cal.dates}</span>
                            {isCurrent && (
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 uppercase shrink-0">
                                En curso
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">{cal.challengeTitle}</p>
                        </div>
                      </div>

                      <span
                        className={`text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 border ${
                          isRitmo
                            ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                            : "bg-cyan-500/10 text-cyan-300 border-cyan-500/20"
                        }`}
                      >
                        {isRitmo ? "🥁 Ritmo (4 pts)" : "🎼 Claves (2 pts)"}
                      </span>
                    </div>
                  );
                })}

                {/* Parón de Semana Santa */}
                <div className="p-3 bg-indigo-950/30 border-y border-indigo-500/20 flex items-center gap-2 text-indigo-300 text-xs">
                  <span className="text-base shrink-0">✝️</span>
                  <div>
                    <span className="font-bold">22 mar - 29 mar: Semana Santa</span>
                    <span className="text-indigo-400/80 block text-[10px]">
                      Pausa de retos · Continúa práctica en casa
                    </span>
                  </div>
                </div>

                {/* Gran Final */}
                <div className="p-3 bg-gradient-to-r from-amber-500/20 via-slate-900 to-amber-500/10 flex items-center gap-2.5 border-t-2 border-amber-400">
                  <span className="text-xl shrink-0">🏆</span>
                  <div>
                    <p className="font-black text-xs sm:text-sm text-amber-300">
                      GRAN FINAL: 22 jun - 27 jun
                    </p>
                    <p className="text-[10px] text-slate-300">
                      Recuento final y entrega de premios oficiales
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botón cerrar inferior adaptado a móvil */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition-colors active:scale-95 text-center cursor-pointer shadow-md"
          >
            Cerrar Bases
          </button>
        </div>
      </div>
    </div>
  );
};
