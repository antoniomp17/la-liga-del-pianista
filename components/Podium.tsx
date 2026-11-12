"use client";

import React from "react";
import { Crown, Sparkles } from "lucide-react";
import { StudentRankItem } from "@/types/contest";

interface PodiumProps {
  top3: StudentRankItem[];
}

export const Podium: React.FC<PodiumProps> = ({ top3 }) => {
  if (!top3 || top3.length < 3) return null;

  const first = top3[0];
  const second = top3[1];
  const third = top3[2];

  return (
    <div className="my-6 px-1 sm:px-2">
      <div className="text-center mb-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] sm:text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 uppercase tracking-widest">
          <Sparkles className="w-3 h-3 text-amber-400" />
          Podio de Honor
        </span>
      </div>

      <div className="grid grid-cols-3 gap-1.5 sm:gap-4 max-w-lg mx-auto items-end pt-7 pb-1">
        {/* Puesto 2: Plata */}
        {second && (
          <div className="flex flex-col items-center">
            {second.isCurrentStudent && (
              <span className="mb-1 text-[9px] sm:text-[10px] font-black px-1.5 py-0.2 rounded-full bg-cyan-400 text-slate-950 uppercase tracking-wider animate-pulse">
                ¡Tú!
              </span>
            )}
            <div
              className={`w-13 h-13 sm:w-18 sm:h-18 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-lg border-2 ${
                second.isCurrentStudent
                  ? "border-cyan-400 bg-slate-800 shadow-cyan-500/20"
                  : "border-slate-300 bg-slate-800/90 shadow-slate-300/10"
              }`}
            >
              <span>{second.avatar}</span>
            </div>
            <p className="font-bold text-[11px] sm:text-xs text-slate-200 mt-1.5 text-center truncate max-w-[85px] sm:max-w-[120px]">
              {second.name}
            </p>
            <p className="text-[10px] sm:text-xs font-mono font-bold text-slate-300">
              {second.totalScore} pts
            </p>

            {/* Pedestal Puesto 2 */}
            <div className="w-full h-18 sm:h-24 mt-1.5 rounded-t-xl sm:rounded-t-2xl bg-gradient-to-b from-slate-400/25 to-slate-800/60 border-t-2 border-x border-slate-300/60 flex flex-col items-center justify-start pt-2 shadow-md">
              <span className="text-xl sm:text-2xl font-black text-slate-200">2º</span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-slate-300 font-bold">
                Plata
              </span>
            </div>
          </div>
        )}

        {/* Puesto 1: Oro (Más alto en el centro) */}
        {first && (
          <div className="flex flex-col items-center -mt-4">
            <div className="relative">
              <Crown className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400 animate-bounce absolute -top-7 left-1/2 -translate-x-1/2 drop-shadow-md" />
              {first.isCurrentStudent && (
                <span className="mb-1 text-[9px] sm:text-[10px] font-black px-2 py-0.2 rounded-full bg-amber-400 text-slate-950 uppercase tracking-wider shadow-md">
                  ¡Tú!
                </span>
              )}
              <div
                className={`w-16 h-16 sm:w-22 sm:h-22 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl shadow-xl border-3 ${
                  first.isCurrentStudent
                    ? "border-amber-400 bg-gradient-to-b from-amber-900/60 to-slate-900 shadow-amber-500/30"
                    : "border-amber-400 bg-gradient-to-b from-amber-950/40 to-slate-900 shadow-amber-500/20"
                }`}
              >
                <span>{first.avatar}</span>
              </div>
            </div>
            <p className="font-black text-xs sm:text-sm text-amber-300 mt-1.5 text-center truncate max-w-[95px] sm:max-w-[130px]">
              {first.name}
            </p>
            <p className="text-[11px] sm:text-xs font-mono font-black text-amber-400">
              {first.totalScore} pts
            </p>

            {/* Pedestal Puesto 1 */}
            <div className="w-full h-24 sm:h-32 mt-1.5 rounded-t-xl sm:rounded-t-2xl bg-gradient-to-b from-amber-500/30 via-amber-600/20 to-slate-900/60 border-t-2 border-x border-amber-400 flex flex-col items-center justify-start pt-2 shadow-lg">
              <span className="text-2xl sm:text-3xl font-black text-amber-400">1º</span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-amber-300 font-black">
                Oro
              </span>
            </div>
          </div>
        )}

        {/* Puesto 3: Bronce */}
        {third && (
          <div className="flex flex-col items-center">
            {third.isCurrentStudent && (
              <span className="mb-1 text-[9px] sm:text-[10px] font-black px-1.5 py-0.2 rounded-full bg-cyan-400 text-slate-950 uppercase tracking-wider animate-pulse">
                ¡Tú!
              </span>
            )}
            <div
              className={`w-13 h-13 sm:w-18 sm:h-18 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-lg border-2 ${
                third.isCurrentStudent
                  ? "border-cyan-400 bg-slate-800 shadow-cyan-500/20"
                  : "border-amber-700 bg-slate-800/90 shadow-amber-700/10"
              }`}
            >
              <span>{third.avatar}</span>
            </div>
            <p className="font-bold text-[11px] sm:text-xs text-slate-200 mt-1.5 text-center truncate max-w-[85px] sm:max-w-[120px]">
              {third.name}
            </p>
            <p className="text-[10px] sm:text-xs font-mono font-bold text-slate-300">
              {third.totalScore} pts
            </p>

            {/* Pedestal Puesto 3 */}
            <div className="w-full h-15 sm:h-20 mt-1.5 rounded-t-xl sm:rounded-t-2xl bg-gradient-to-b from-amber-800/25 to-slate-800/60 border-t-2 border-x border-amber-700/60 flex flex-col items-center justify-start pt-2 shadow-md">
              <span className="text-xl sm:text-2xl font-black text-amber-600">3º</span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-amber-600 font-bold">
                Bronce
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
