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
    <div className="my-4 sm:my-6 bg-white/95 rounded-2xl border border-slate-200/90 shadow-md overflow-hidden">
      {/* Encabezado */}
      <div className="px-3.5 py-3 sm:p-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
          <h3 className="font-extrabold text-sm sm:text-base text-slate-800">
            Top 10 de Honor
          </h3>
        </div>
        <span className="text-[10px] sm:text-xs text-slate-500 font-medium flex items-center gap-1 shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>Privacidad activa</span>
        </span>
      </div>

      {/* Lista de filas del Top 10 */}
      <div className="divide-y divide-slate-100">
        {top10.map((student) => {
          const isCurrent = student.isCurrentStudent;

          let rankBadge = (
            <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center font-mono shrink-0">
              #{student.rank}
            </span>
          );

          if (student.rank === 1) {
            rankBadge = (
              <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 border border-amber-300 font-black text-xs flex items-center justify-center shadow-2xs shrink-0">
                🥇
              </span>
            );
          } else if (student.rank === 2) {
            rankBadge = (
              <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 border border-slate-300 font-black text-xs flex items-center justify-center shadow-2xs shrink-0">
                🥈
              </span>
            );
          } else if (student.rank === 3) {
            rankBadge = (
              <span className="w-6 h-6 rounded-lg bg-orange-100 text-orange-800 border border-orange-300 font-black text-xs flex items-center justify-center shadow-2xs shrink-0">
                🥉
              </span>
            );
          }

          return (
            <div
              key={student.rank + "-" + student.name}
              className={`px-3 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between gap-2 transition-colors ${
                isCurrent
                  ? "bg-amber-50/90 border-l-4 border-amber-400"
                  : "hover:bg-slate-50/80"
              }`}
            >
              {/* Posición & Avatar & Nombre */}
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                {rankBadge}

                <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-base shrink-0 shadow-2xs">
                  {student.avatar}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p
                      className={`font-bold text-xs sm:text-sm truncate ${
                        isCurrent ? "text-amber-950 font-extrabold" : "text-slate-800"
                      }`}
                    >
                      {student.name}
                    </p>
                    {isCurrent && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300 uppercase tracking-wider shrink-0 flex items-center gap-0.5 shadow-2xs">
                        <UserCheck className="w-2.5 h-2.5" />
                        ¡Tú!
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400">Puesto #{student.rank}</p>
                </div>
              </div>

              {/* Puntuación y Tendencia (Stack vertical en móvil para maximizar espacio de nombre) */}
              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-0.5 sm:gap-3 shrink-0 text-right">
                <div>
                  <span className="text-sm sm:text-base font-mono font-black text-slate-800">
                    {student.totalScore}
                  </span>
                  <span className="text-[10px] text-slate-400 ml-0.5">pts</span>
                </div>

                {student.rankChange !== undefined && (
                  <div className="flex justify-end">
                    {student.rankChange > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                        <TrendingUp className="w-2.5 h-2.5" />+{student.rankChange}
                      </span>
                    )}
                    {student.rankChange < 0 && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-full border border-rose-200">
                        <TrendingDown className="w-2.5 h-2.5" />
                        {student.rankChange}
                      </span>
                    )}
                    {student.rankChange === 0 && (
                      <span className="inline-flex items-center text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
                        <Minus className="w-2 h-2" />
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CASO: El alumno NO está en el Top 10 (Puestos 11 al 28) */}
      {!isStudentInTop10 && (
        <div className="bg-slate-50/80 border-t-2 border-dashed border-slate-200">
          {/* Separador de privacidad */}
          <div className="py-2 px-3 text-center text-slate-400 text-[10px] font-mono tracking-wider bg-slate-100/60">
            · · · 🎵 Otras posiciones intermedias (protegidas) 🎵 · · ·
          </div>

          {/* Tarjeta personal destacada en móvil */}
          <div className="px-3 py-3 sm:px-4 sm:py-3.5 bg-gradient-to-r from-sky-50 via-white to-indigo-50 border-l-4 border-sky-400 flex items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <span className="w-7 h-7 rounded-xl bg-sky-100 text-sky-800 border border-sky-300 font-mono font-black text-xs flex items-center justify-center shrink-0">
                #{currentStudent.rank}
              </span>

              <div className="w-8 h-8 rounded-xl bg-white border border-sky-200 flex items-center justify-center text-base shrink-0 shadow-2xs">
                {currentStudent.avatar}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="font-black text-xs sm:text-sm text-sky-950 truncate">
                    {currentStudent.name}
                  </p>
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-sky-200 text-sky-900 border border-sky-300 uppercase tracking-wider shrink-0 flex items-center gap-0.5 shadow-2xs">
                    <UserCheck className="w-2.5 h-2.5" />
                    ¡Tu Puesto!
                  </span>
                </div>
                <p className="text-[10px] text-sky-700 truncate">
                  A {currentStudent.pointsToNextRank} pts del #{currentStudent.rank - 1}
                </p>
              </div>
            </div>

            {/* Puntos y Tendencia */}
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-0.5 sm:gap-3 shrink-0 text-right">
              <div>
                <span className="text-sm sm:text-base font-mono font-black text-sky-900">
                  {currentStudent.totalScore}
                </span>
                <span className="text-[10px] text-slate-400 ml-0.5">pts</span>
              </div>

              <div className="flex justify-end">
                {currentStudent.rankChange > 0 && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                    <TrendingUp className="w-2.5 h-2.5" />+{currentStudent.rankChange}
                  </span>
                )}
                {currentStudent.rankChange < 0 && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded-full border border-rose-200">
                    <TrendingDown className="w-2.5 h-2.5" />
                    {currentStudent.rankChange}
                  </span>
                )}
                {currentStudent.rankChange === 0 && (
                  <span className="inline-flex items-center text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
                    <Minus className="w-2 h-2" />
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
