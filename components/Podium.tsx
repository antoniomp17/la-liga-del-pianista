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
    <div className="my-4 sm:my-6 px-1">
      <div className="text-center mb-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold bg-amber-100/80 text-amber-800 border border-amber-200/90 uppercase tracking-widest shadow-xs">
          <Sparkles className="w-3 h-3 text-amber-500" />
          Podio de Honor
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-xs sm:max-w-md mx-auto items-end pt-5 pb-1">
        {/* Puesto 2: Plata (Izquierda) */}
        {second && (
          <div className="flex flex-col items-center min-w-0">
            {second.isCurrentStudent && (
              <span className="mb-1 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300 uppercase tracking-wider animate-pulse shadow-2xs">
                ¡Tú!
              </span>
            )}
            <div
              className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-md border-2 ${
                second.isCurrentStudent
                  ? "border-sky-300 bg-sky-50 shadow-sky-200/40"
                  : "border-slate-300 bg-white shadow-slate-200/50"
              }`}
            >
              <span>{second.avatar}</span>
            </div>
            <p className="font-bold text-[11px] sm:text-xs text-slate-700 mt-1.5 text-center truncate w-full px-1">
              {second.name}
            </p>
            <p className="text-[10px] sm:text-xs font-mono font-bold text-slate-600">
              {second.totalScore} pts
            </p>

            {/* Pedestal Puesto 2 */}
            <div className="w-full h-16 sm:h-24 mt-1.5 rounded-t-xl sm:rounded-t-2xl bg-gradient-to-b from-slate-200/90 via-slate-100 to-slate-50 border-t-2 border-x border-slate-300 flex flex-col items-center justify-start pt-1.5 shadow-sm">
              <span className="text-lg sm:text-2xl font-black text-slate-600">2º</span>
              <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold">
                Plata
              </span>
            </div>
          </div>
        )}

        {/* Puesto 1: Oro (Centro, más alto) */}
        {first && (
          <div className="flex flex-col items-center min-w-0 -mt-3">
            <div className="relative">
              <Crown className="w-5 h-5 sm:w-7 sm:h-7 text-amber-500 animate-bounce absolute -top-6 left-1/2 -translate-x-1/2 drop-shadow-sm" />
              {first.isCurrentStudent && (
                <span className="mb-1 text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 border border-amber-300 uppercase tracking-wider shadow-2xs">
                  ¡Tú!
                </span>
              )}
              <div
                className={`w-14 h-14 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl shadow-lg border-2 sm:border-3 ${
                  first.isCurrentStudent
                    ? "border-amber-400 bg-gradient-to-b from-amber-100 to-amber-50 shadow-amber-200/60"
                    : "border-amber-300 bg-gradient-to-b from-amber-100/70 to-white shadow-amber-200/40"
                }`}
              >
                <span>{first.avatar}</span>
              </div>
            </div>
            <p className="font-black text-xs sm:text-sm text-amber-900 mt-1.5 text-center truncate w-full px-1">
              {first.name}
            </p>
            <p className="text-[11px] sm:text-xs font-mono font-black text-amber-700">
              {first.totalScore} pts
            </p>

            {/* Pedestal Puesto 1 */}
            <div className="w-full h-24 sm:h-32 mt-1.5 rounded-t-xl sm:rounded-t-2xl bg-gradient-to-b from-amber-200/90 via-amber-100 to-amber-50 border-t-2 border-x border-amber-300 flex flex-col items-center justify-start pt-2 shadow-md">
              <span className="text-2xl sm:text-3xl font-black text-amber-600">1º</span>
              <span className="text-[9px] uppercase tracking-wider text-amber-700 font-black">
                Oro
              </span>
            </div>
          </div>
        )}

        {/* Puesto 3: Bronce (Derecha) */}
        {third && (
          <div className="flex flex-col items-center min-w-0">
            {third.isCurrentStudent && (
              <span className="mb-1 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-300 uppercase tracking-wider animate-pulse shadow-2xs">
                ¡Tú!
              </span>
            )}
            <div
              className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-md border-2 ${
                third.isCurrentStudent
                  ? "border-sky-300 bg-sky-50 shadow-sky-200/40"
                  : "border-orange-200 bg-white shadow-orange-200/40"
              }`}
            >
              <span>{third.avatar}</span>
            </div>
            <p className="font-bold text-[11px] sm:text-xs text-slate-700 mt-1.5 text-center truncate w-full px-1">
              {third.name}
            </p>
            <p className="text-[10px] sm:text-xs font-mono font-bold text-orange-800">
              {third.totalScore} pts
            </p>

            {/* Pedestal Puesto 3 */}
            <div className="w-full h-12 sm:h-16 mt-1.5 rounded-t-xl sm:rounded-t-2xl bg-gradient-to-b from-orange-200/80 via-orange-100 to-orange-50 border-t-2 border-x border-orange-300 flex flex-col items-center justify-start pt-1 shadow-sm">
              <span className="text-lg sm:text-2xl font-black text-orange-700">3º</span>
              <span className="text-[9px] uppercase tracking-wider text-orange-700 font-bold">
                Bronce
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
