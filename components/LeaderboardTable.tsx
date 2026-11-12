"use client";

import React from "react";
import { Trophy, TrendingUp, TrendingDown, Minus, UserCheck, ShieldCheck } from "lucide-react";
import { CurrentStudentDetails, StudentRankItem } from "@/types/contest";

interface LeaderboardTableProps {
  top10: StudentRankItem[];
  currentStudent: CurrentStudentDetails;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  top10,
  currentStudent,
}) => {
  const isStudentInTop10 = currentStudent.isInTop10;

  return (
    <div className="my-5 bg-slate-900/95 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
      {/* Encabezado */}
      <div className="p-3.5 sm:p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
          <h3 className="font-extrabold text-sm sm:text-lg text-slate-100">
            Top 10 de Honor
          </h3>
        </div>
        <span className="text-[11px] sm:text-xs text-slate-400 font-medium flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Privacidad activa</span>
        </span>
      </div>

      {/* Lista de filas */}
      <div className="divide-y divide-slate-800/60">
        {top10.map((student) => {
          const isCurrent = student.isCurrentStudent;

          let rankBadge = (
            <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center font-mono shrink-0">
              #{student.rank}
            </span>
          );

          if (student.rank === 1) {
            rankBadge = (
              <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/40 font-black text-xs flex items-center justify-center shadow-sm shrink-0">
                🥇 1
              </span>
            );
          } else if (student.rank === 2) {
            rankBadge = (
              <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-300/20 text-slate-200 border border-slate-300/40 font-black text-xs flex items-center justify-center shadow-sm shrink-0">
                🥈 2
              </span>
            );
          } else if (student.rank === 3) {
            rankBadge = (
              <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-amber-700/20 text-amber-400 border border-amber-700/40 font-black text-xs flex items-center justify-center shadow-sm shrink-0">
                🥉 3
              </span>
            );
          }

          return (
            <div
              key={student.rank + "-" + student.name}
              className={`p-2.5 sm:p-4 flex items-center justify-between gap-2 transition-colors ${
                isCurrent
                  ? "bg-gradient-to-r from-amber-500/15 via-slate-800/90 to-amber-500/10 border-l-4 border-amber-400"
                  : "hover:bg-slate-800/40"
              }`}
            >
              {/* Posición & Avatar & Nombre */}
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                {rankBadge}

                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-base sm:text-lg shrink-0 shadow-inner">
                  {student.avatar}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p
                      className={`font-bold text-xs sm:text-sm truncate ${
                        isCurrent ? "text-amber-300 font-extrabold" : "text-slate-200"
                      }`}
                    >
                      {student.name}
                    </p>
                    {isCurrent && (
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 uppercase tracking-wider shrink-0 flex items-center gap-0.5">
                        <UserCheck className="w-2.5 h-2.5" />
                        ¡Tú!
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400">Puesto #{student.rank}</p>
                </div>
              </div>

              {/* Puntuación y Tendencia */}
              <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                {student.rankChange !== undefined && (
                  <div>
                    {student.rankChange > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] sm:text-xs font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                        <TrendingUp className="w-2.5 h-2.5" />+{student.rankChange}
                      </span>
                    )}
                    {student.rankChange < 0 && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] sm:text-xs font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded-full border border-rose-500/20">
                        <TrendingDown className="w-2.5 h-2.5" />
                        {student.rankChange}
                      </span>
                    )}
                    {student.rankChange === 0 && (
                      <span className="inline-flex items-center text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded-full">
                        <Minus className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                )}

                <div className="text-right min-w-[55px] sm:min-w-[70px]">
                  <span className="text-sm sm:text-lg font-mono font-black text-slate-100">
                    {student.totalScore}
                  </span>
                  <span className="text-[10px] sm:text-xs text-slate-400 ml-0.5">pts</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CASO: El alumno NO está en el Top 10 (Puestos 11 al 28) */}
      {!isStudentInTop10 && (
        <div className="bg-slate-950 border-t-2 border-dashed border-slate-700/80">
          {/* Separador de privacidad */}
          <div className="py-2 px-3 text-center text-slate-500 text-[10px] sm:text-xs font-mono tracking-wider bg-slate-900/70">
            · · · 🎵 Otras posiciones intermedias (protegidas) 🎵 · · ·
          </div>

          {/* Tarjeta personal destacada en móvil */}
          <div className="p-3 sm:p-4 bg-gradient-to-r from-cyan-950/60 via-slate-900 to-indigo-950/60 border-l-4 border-cyan-400 flex items-center justify-between gap-2 shadow-inner">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-mono font-black text-xs sm:text-sm flex items-center justify-center shrink-0">
                #{currentStudent.rank}
              </span>

              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-800 border border-cyan-400/50 flex items-center justify-center text-lg sm:text-xl shrink-0 shadow-md">
                {currentStudent.avatar}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-black text-xs sm:text-base text-cyan-200 truncate">
                    {currentStudent.name}
                  </p>
                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-cyan-400 text-slate-950 uppercase tracking-wider shrink-0 flex items-center gap-0.5">
                    <UserCheck className="w-2.5 h-2.5" />
                    ¡Tu Puesto!
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-cyan-300/80 truncate">
                  A solo {currentStudent.pointsToNextRank} pts del #{currentStudent.rank - 1}
                </p>
              </div>
            </div>

            {/* Puntos y Tendencia */}
            <div className="flex items-center gap-2 shrink-0">
              {currentStudent.rankChange > 0 && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                  <TrendingUp className="w-2.5 h-2.5" />+{currentStudent.rankChange}
                </span>
              )}
              {currentStudent.rankChange < 0 && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded-full border border-rose-500/20">
                  <TrendingDown className="w-2.5 h-2.5" />
                  {currentStudent.rankChange}
                </span>
              )}
              {currentStudent.rankChange === 0 && (
                <span className="text-slate-500 text-[10px]">➖</span>
              )}

              <div className="text-right min-w-[55px] sm:min-w-[70px]">
                <span className="text-base sm:text-xl font-mono font-black text-cyan-300">
                  {currentStudent.totalScore}
                </span>
                <span className="text-[10px] sm:text-xs text-slate-400 ml-0.5">pts</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
