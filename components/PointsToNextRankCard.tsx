"use client";

import React from "react";
import { Trophy, Target, Zap } from "lucide-react";
import { CurrentStudentDetails } from "@/types/contest";

interface PointsToNextRankCardProps {
  currentStudent: CurrentStudentDetails;
}

export const PointsToNextRankCard: React.FC<PointsToNextRankCardProps> = ({
  currentStudent,
}) => {
  const { rank, pointsToNextRank, totalScore, nextRankTargetScore, nextRankTargetName } =
    currentStudent;

  const isLeader = rank === 1;

  let progressPercentage = 100;
  if (!isLeader && nextRankTargetScore && nextRankTargetScore > 0) {
    progressPercentage = Math.min(
      98,
      Math.max(10, Math.round((totalScore / nextRankTargetScore) * 100))
    );
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-3.5 sm:p-5 border shadow-md transition-all ${
        isLeader
          ? "bg-gradient-to-br from-amber-50 via-yellow-50/50 to-orange-50 border-amber-200/90 shadow-amber-100/60 text-slate-800"
          : "bg-gradient-to-br from-indigo-50/70 via-white to-sky-50/60 border-indigo-100 shadow-indigo-100/40 text-slate-800"
      }`}
    >
      {/* Resplandor decorativo sutil en pastel */}
      <div
        className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full blur-2xl pointer-events-none opacity-30 ${
          isLeader ? "bg-amber-200" : "bg-indigo-200"
        }`}
      />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3.5 sm:gap-6">
        {/* Info y Puntos */}
        <div className="space-y-1.5 sm:space-y-2.5">
          <div className="inline-flex items-center gap-1.5 rounded-full text-[10px] sm:text-xs font-bold tracking-wide uppercase">
            {isLeader ? (
              <span className="flex items-center gap-1 text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                <Trophy className="w-3 h-3 text-amber-600" />
                <span>Líder de la Liga</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-indigo-900 bg-indigo-100 px-2 py-0.5 rounded-full border border-indigo-200">
                <Target className="w-3 h-3 text-indigo-600" />
                <span>Objetivo Próxima Posición</span>
              </span>
            )}
          </div>

          <div>
            {isLeader ? (
              <div>
                <h3 className="text-lg sm:text-2xl font-black text-amber-900 flex items-center gap-1.5">
                  ¡Vas en 1ª Posición! 🏆
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  ¡Eres el número 1 con <strong>{totalScore} pts</strong>! Defiende la corona esta semana.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-xs sm:text-sm font-semibold text-slate-500">Te faltan</span>
                  <span className="text-2xl sm:text-4xl font-black text-amber-600 font-mono tracking-tight">
                    {pointsToNextRank}
                  </span>
                  <span className="text-sm sm:text-lg font-bold text-slate-700">
                    {pointsToNextRank === 1 ? "punto" : "puntos"}
                  </span>
                  <span className="text-xs sm:text-sm text-slate-600">
                    para el <strong>Puesto #{rank - 1}</strong>
                    {nextRankTargetName ? ` (${nextRankTargetName})` : ""}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
                  ¡Una buena puntuación en el reto semanal y adelantarás!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Comparativa y Barra de Progreso en móvil */}
        {!isLeader && (
          <div className="w-full md:w-72 bg-white/90 p-3 rounded-xl border border-indigo-100 shadow-2xs space-y-2">
            <div className="flex items-center justify-between text-[10px] sm:text-xs font-medium">
              <span className="flex items-center gap-1 text-sky-800">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 inline-block" />
                Tú (#{rank}): <strong>{totalScore} pts</strong>
              </span>
              <span className="flex items-center gap-1 text-amber-800">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                #{rank - 1}: <strong>{nextRankTargetScore ?? totalScore + pointsToNextRank} pts</strong>
              </span>
            </div>

            {/* Barra animada suave */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-300 via-indigo-300 to-amber-300 transition-all duration-1000 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span className="flex items-center gap-1 text-emerald-700 font-bold">
                <Zap className="w-2.5 h-2.5 text-emerald-500" />
                {progressPercentage}% completado
              </span>
              <span>¡A tiro de piano! 🎹</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
