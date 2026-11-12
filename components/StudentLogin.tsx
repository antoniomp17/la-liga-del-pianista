"use client";

import React, { useState } from "react";
import { KeyRound, Sparkles, ArrowRight } from "lucide-react";
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
    <div className="max-w-md mx-auto my-8 p-6 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-2xl text-slate-100">
      {/* Cabecera del formulario */}
      <div className="text-center mb-6">
        <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-3 shadow-inner">
          <KeyRound className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
          LA LIGA DEL PIANISTA 🎹
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
          Introduce tu código PIN de 4 dígitos para ver tu puntuación en la Liga, el Top 10 y los puntos que necesitas para subir de puesto.
        </p>
      </div>

      {/* Formulario de entrada */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
            PIN del Alumno (1001 al 1028)
          </label>
          <div className="relative">
            <input
              type="text"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.toUpperCase())}
              placeholder="Ej: 1001"
              className="w-full text-center text-2xl font-mono tracking-widest py-3 px-4 bg-slate-950 rounded-xl border border-slate-700 text-amber-300 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all shadow-inner"
            />
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs text-center font-medium">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !pin.trim()}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Ver mi Clasificación</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      {/* Botones de prueba rápida para la clienta / evaluador */}
      <div className="mt-8 pt-6 border-t border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Acceso Rápido de Prueba:
          </span>
          <span className="text-[10px] text-slate-500 font-mono">Total: 28 alumnos</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleQuickTest("1001")}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-amber-500/30 text-slate-200 text-left transition-all hover:border-amber-400 flex items-center gap-2"
          >
            <span className="text-base">🥇</span>
            <div>
              <p className="font-semibold text-amber-300 truncate">Clara S. (Top 1)</p>
              <p className="text-[10px] text-slate-400">PIN: 1001 (En Top 10)</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickTest("1003")}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-amber-500/30 text-slate-200 text-left transition-all hover:border-amber-400 flex items-center gap-2"
          >
            <span className="text-base">🥉</span>
            <div>
              <p className="font-semibold text-amber-300 truncate">Sofía M. (Top 3)</p>
              <p className="text-[10px] text-slate-400">PIN: 1003 (En Top 10)</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickTest("1011")}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-cyan-500/30 text-slate-200 text-left transition-all hover:border-cyan-400 flex items-center gap-2"
          >
            <span className="text-base">🎹</span>
            <div>
              <p className="font-semibold text-cyan-300 truncate">Martín S. (#11)</p>
              <p className="text-[10px] text-slate-400">PIN: 1011 (Fuera Top 10)</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickTest("1020")}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-cyan-500/30 text-slate-200 text-left transition-all hover:border-cyan-400 flex items-center gap-2"
          >
            <span className="text-base">🎶</span>
            <div>
              <p className="font-semibold text-cyan-300 truncate">Emma V. (#20)</p>
              <p className="text-[10px] text-slate-400">PIN: 1020 (Fuera Top 10)</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
