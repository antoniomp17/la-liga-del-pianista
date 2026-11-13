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
    icon: <Music2 className="w-5 h-5 text-rose-400" />,
    color: "from-rose-500/15 via-slate-900 to-slate-950 border-rose-500/30",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  },
  tecnica: {
    icon: <Wrench className="w-5 h-5 text-emerald-400" />,
    color: "from-emerald-500/15 via-slate-900 to-slate-950 border-emerald-500/30",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  ritmo: {
    icon: <Drum className="w-5 h-5 text-amber-400" />,
    color: "from-amber-500/15 via-slate-900 to-slate-950 border-amber-500/30",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  },
  notas: {
    icon: <KeyRound className="w-5 h-5 text-cyan-400" />,
    color: "from-cyan-500/15 via-slate-900 to-slate-950 border-cyan-500/30",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  },
};

export const TestBreakdownCards: React.FC<TestBreakdownCardsProps> = ({
  tests,
  scoresByTest,
}) => {
  return (
    <div className="my-5 sm:my-8">
      {/* Cabecera de la sección */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3.5 sm:mb-4 px-1">
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

      {/* Grid responsivo: 1 columna en móvil para máxima legibilidad, 2 en tablet, 4 en desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {tests.map((test) => {
          const score = scoresByTest[test.id] || 0;
          const meta = TEST_META[test.id] || {
            icon: <Music2 className="w-5 h-5 text-amber-400" />,
            color: "from-slate-800 to-slate-900 border-slate-700",
            badgeColor: "bg-slate-800 text-slate-300 border-slate-700",
          };

          return (
            <div
              key={test.id}
              className={`rounded-2xl p-4 sm:p-5 border bg-gradient-to-b ${meta.color} shadow-lg transition-all group flex flex-col justify-between`}
            >
              <div>
                {/* Cabecera centrada: icono, badge y título */}
                <div className="flex flex-col items-center text-center gap-2 mb-3">
                  <div className="p-2 sm:p-2.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-inner">
                    {meta.icon}
                  </div>
                  <div>
                    <span
                      className={`inline-block text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${meta.badgeColor}`}
                    >
                      {test.badge || test.shortName}
                    </span>
                  </div>
                  <h4 className="font-black text-sm sm:text-base text-slate-100 leading-snug px-1">
                    {test.name}
                  </h4>
                </div>

                {/* Descripción completa sin cortes ni truncado */}
                <p className="text-xs text-slate-300 leading-relaxed text-center px-1">
                  {test.description}
                </p>
              </div>

              {/* Puntuación sumada en este frente */}
              <div className="mt-4 pt-3 border-t border-slate-800/80">
                <div className="flex items-center justify-between px-3 py-2 bg-slate-950/60 border border-slate-800/80 rounded-xl">
                  <span className="text-xs text-slate-400 font-medium">
                    Puntos sumados
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl sm:text-2xl font-black font-mono text-amber-400">
                      {score}
                    </span>
                    <span className="text-xs text-slate-400">pts</span>
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
