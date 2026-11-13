"use client";

import React, { useState, useEffect } from "react";
import { KeyRound, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { playPianoKey } from "@/lib/audio";

interface StudentLoginProps {
  onLogin: (pin: string) => Promise<void>;
  isLoading: boolean;
  errorMessage?: string;
  isMuted?: boolean;
}

export const StudentLogin: React.FC<StudentLoginProps> = ({
  onLogin,
  isLoading,
  errorMessage,
  isMuted,
}) => {
  const [pin, setPin] = useState("");
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("demo") === "true" || params.get("demo") === "1") {
        setIsDemoMode(true);
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) return;
    if (!isMuted) playPianoKey("C5");
    onLogin(pin.trim());
  };

  const handleQuickTest = (quickPin: string) => {
    setPin(quickPin);
    if (!isMuted) playPianoKey("E4");
    onLogin(quickPin);
  };

  return (
    <div className="max-w-md mx-auto my-3 sm:my-8 p-4 sm:p-6 bg-slate-900/95 rounded-2xl border border-slate-800 shadow-2xl text-slate-100">
      {/* Cabecera del formulario */}
      <div className="text-center mb-4 sm:mb-6">
        <div className="inline-flex p-2.5 sm:p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-2.5 shadow-inner">
          <KeyRound className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center justify-center gap-1.5">
          LA LIGA DEL PIANISTA 🎹
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
          Introduce tu PIN de 4 dígitos para ver tu puntuación y tu puesto en la Liga.
        </p>
      </div>

      {/* Formulario de entrada */}
      <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
        <div>
          <label className="block text-[11px] font-semibold text-slate-300 mb-1 uppercase tracking-wider text-center">
            Código PIN del Alumno
          </label>
          <div className="relative">
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.trim())}
              placeholder="••••"
              suppressHydrationWarning
              className="w-full text-center text-2xl sm:text-3xl font-mono tracking-widest py-2.5 sm:py-3 px-3 bg-slate-950 rounded-xl border border-slate-700 text-amber-300 placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all shadow-inner"
            />
          </div>
          <div className="flex items-center justify-center gap-1 mt-1.5 text-[10px] sm:text-[11px] text-slate-500">
            <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
            <span>Acceso seguro protegido contra intentos</span>
          </div>
        </div>

        {errorMessage && (
          <div className="p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs text-center font-medium">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !pin.trim()}
          className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer text-sm active:scale-95"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Acceder a mi Clasificación</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      {/* Modo Demo habilitado con ?demo=true */}
      {isDemoMode && (
        <div className="mt-6 pt-4 border-t border-slate-800 animate-in fade-in">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Demo (Acceso Rápido):
            </span>
            <span className="text-[9px] text-slate-500 font-mono">Privado</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => handleQuickTest("7429")}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-amber-500/30 text-slate-200 text-left transition-all hover:border-amber-400 flex items-center gap-1.5"
            >
              <span className="text-sm">🥇</span>
              <div className="min-w-0">
                <p className="font-semibold text-amber-300 truncate text-[11px]">Clara S. (Top 1)</p>
                <p className="text-[9px] text-slate-400">En Top 10</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickTest("9042")}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-amber-500/30 text-slate-200 text-left transition-all hover:border-amber-400 flex items-center gap-1.5"
            >
              <span className="text-sm">🥉</span>
              <div className="min-w-0">
                <p className="font-semibold text-amber-300 truncate text-[11px]">Sofía M. (Top 3)</p>
                <p className="text-[9px] text-slate-400">En Top 10</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickTest("3452")}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-cyan-500/30 text-slate-200 text-left transition-all hover:border-cyan-400 flex items-center gap-1.5"
            >
              <span className="text-sm">🎹</span>
              <div className="min-w-0">
                <p className="font-semibold text-cyan-300 truncate text-[11px]">Martín S. (#11)</p>
                <p className="text-[9px] text-slate-400">Fuera Top 10</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickTest("6241")}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-cyan-500/30 text-slate-200 text-left transition-all hover:border-cyan-400 flex items-center gap-1.5"
            >
              <span className="text-sm">🎶</span>
              <div className="min-w-0">
                <p className="font-semibold text-cyan-300 truncate text-[11px]">Emma V. (#19)</p>
                <p className="text-[9px] text-slate-400">Fuera Top 10</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
