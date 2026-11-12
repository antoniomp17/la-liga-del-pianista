"use client";

import React from "react";
import { Music2, Wrench, Drum, KeyRound, Layers } from "lucide-react";
import { TestDefinition } from "@/types/contest";

interface TestBreakdownCardsProps {
  tests: TestDefinition[];
  scoresByTest: { [testId: string]: number };
}

const TEST_META: { [key: string]: { icon: React.ReactNode; color: string; badgeColor: string } } = {
  obras: {
    icon: <Music2 className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" />,
    color: "from-rose-500/20 to-slate-900 border-rose-500/30",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  },
  tecnica: {
    icon: <Wrench className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />,
    color: "from-emerald-500/20 to-slate-900 border-emerald-500/30",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  ritmo: {
    icon: <Drum className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />,
    color: "from-amber-500/20 to-slate-900 border-amber-500/30",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  },
  notas: {
    icon: <KeyRound className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />,
    color: "from-cyan-500/20 to-slate-900 border-cyan-500/30",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  },
};

export const TestBreakdownCards: React.FC<TestBreakdownCardsProps> = ({
  tests,
  scoresByTest,
}) => {
  return (
    <div className="my-4 sm:my-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
          <h3 className="font-bold text-sm sm:text-base text-slate-100">
            Tu Puntuación en los Frentes Oficiales
          </h3>
        </div>
        <span className="text-[11px] sm:text-xs text-slate-400">
          Suma acumulada de obras, técnica y retos rotativos
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {tests.map((test) => {
          const score = scoresByTest[test.id] || 0;
          const meta = TEST_META[test.id] || {
            icon: <Music2 className="w-4 h-4 text-amber-400" />,
            color: "from-slate-800 to-slate-900 border-slate-700",
            badgeColor: "bg-slate-800 text-slate-300 border-slate-700",
          };

          return (
            <div
              key={test.id}
              className={`rounded-2xl p-3 sm:p-4 border bg-gradient-to-b ${meta.color} shadow-lg transition-all group flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 sm:p-2 rounded-xl bg-slate-900/90 border border-slate-700/80">
                    {meta.icon}
                  </div>
                  <span
                    className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full border uppercase tracking-wider ${meta.badgeColor}`}
                  >
                    {test.badge || test.shortName}
                  </span>
                </div>

                <h4 className="font-bold text-xs sm:text-sm text-slate-100 leading-snug truncate">
                  {test.name}
                </h4>
                <p className="text-[10px] sm:text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {test.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80">
                <div className="flex items-baseline justify-between">
                  <span className="text-[10px] sm:text-xs text-slate-400 font-medium">Sumados</span>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-xl sm:text-2xl font-black font-mono text-amber-400">
                      {score}
                    </span>
                    <span className="text-[10px] text-slate-400">pts</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
