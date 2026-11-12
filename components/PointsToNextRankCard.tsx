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
      className={`relative overflow-hidden rounded-2xl p-3.5 sm:p-5 border shadow-xl transition-all ${
        isLeader
          ? "bg-gradient-to-br from-amber-950/70 via-slate-900 to-amber-950/40 border-amber-500/50 shadow-amber-500/10"
          : "bg-gradient-to-br from-slate-900 via-slate-900/95 to-indigo-950/50 border-indigo-500/30 shadow-indigo-500/10"
      }`}
    >
      {/* Resplandor decorativo */}
      <div
        className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full blur-2xl pointer-events-none opacity-20 ${
          isLeader ? "bg-amber-400" : "bg-indigo-500"
        }`}
      />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3.5 sm:gap-6">
        {/* Info y Puntos */}
        <div className="space-y-1.5 sm:space-y-2.5">
          <div className="inline-flex items-center gap-1.5 rounded-full text-[10px] sm:text-xs font-bold tracking-wide uppercase">
            {isLeader ? (
              <span className="flex items-center gap-1 text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                <Trophy className="w-3 h-3 text-amber-400" />
                <span>Líder de la Liga</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/30">
                <Target className="w-3 h-3 text-indigo-400" />
                <span>Objetivo Próxima Posición</span>
              </span>
            )}
          </div>

          <div>
            {isLeader ? (
              <div>
                <h3 className="text-lg sm:text-2xl font-black text-amber-300 flex items-center gap-1.5">
                  ¡Vas en 1ª Posición! 🏆
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  ¡Eres el número 1 con <strong>{totalScore} pts</strong>! Defiende la corona esta semana.
                </p>
              </div>
            ) : (
              <div>
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-xs sm:text-sm font-semibold text-slate-400">Te faltan</span>
                  <span className="text-2xl sm:text-4xl font-black text-amber-400 font-mono tracking-tight">
                    {pointsToNextRank}
                  </span>
                  <span className="text-sm sm:text-lg font-bold text-slate-200">
                    {pointsToNextRank === 1 ? "punto" : "puntos"}
                  </span>
                  <span className="text-xs sm:text-sm text-slate-300">
                    para el <strong>Puesto #{rank - 1}</strong>
                    {nextRankTargetName ? ` (${nextRankTargetName})` : ""}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-1">
                  ¡Una buena puntuación en el reto semanal y adelantarás!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Comparativa y Barra de Progreso en móvil */}
        {!isLeader && (
          <div className="w-full md:w-72 bg-slate-950/70 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[10px] sm:text-xs font-medium">
              <span className="flex items-center gap-1 text-cyan-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" />
                Tú (#{rank}): <strong>{totalScore} pts</strong>
              </span>
              <span className="flex items-center gap-1 text-amber-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                #{rank - 1}: <strong>{nextRankTargetScore ?? totalScore + pointsToNextRank} pts</strong>
              </span>
            </div>

            {/* Barra animada */}
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-amber-400 transition-all duration-1000 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <Zap className="w-2.5 h-2.5" />
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
