"use client";

import React from "react";
import { Music, Volume2, VolumeX, Shield, User, BookOpen, LogOut } from "lucide-react";

interface NavbarProps {
  contestTitle: string;
  currentWeek: number;
  viewMode: "student" | "admin";
  onSwitchView: (mode: "student" | "admin") => void;
  isMuted: boolean;
  onToggleMute: () => void;
  currentStudentName?: string;
  onLogoutStudent?: () => void;
  onOpenRules?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  contestTitle,
  currentWeek,
  viewMode,
  onSwitchView,
  isMuted,
  onToggleMute,
  currentStudentName,
  onLogoutStudent,
  onOpenRules,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-lg">
      {/* Línea decorativa sutil y elegante en el borde superior */}
      <div className="h-[2px] w-full bg-gradient-to-r from-amber-500/10 via-amber-400/60 to-amber-500/10" />

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2">
        {/* Título & Logo en Móvil */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 shrink-0">
            <Music className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="font-black text-sm sm:text-base leading-tight tracking-tight text-slate-100 truncate">
                LIGA PIANISTA
              </h1>
              <span className="text-[10px] sm:text-xs font-bold px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0 font-mono">
                Sem {currentWeek}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate hidden xs:block">
              28 Alumnos · 16 Nov - Jun
            </p>
          </div>
        </div>

        {/* Acciones & Controles Móvil */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Botón Bases y Calendario */}
          {onOpenRules && (
            <button
              onClick={onOpenRules}
              title="Bases Oficiales y Calendario"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bases</span>
            </button>
          )}

          {/* Botón Silenciar/Activar Sonido */}
          <button
            onClick={onToggleMute}
            title={isMuted ? "Activar sonido de piano" : "Silenciar sonido"}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 active:scale-95"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-slate-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* Info y Salir del alumno en móvil */}
          {viewMode === "student" && currentStudentName && onLogoutStudent && (
            <button
              onClick={onLogoutStudent}
              title={`Cerrar sesión de ${currentStudentName}`}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 text-xs font-semibold border border-slate-700 transition-colors active:scale-95"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden md:inline truncate max-w-[80px]">{currentStudentName}</span>
              <span className="text-[11px] md:hidden">Salir</span>
            </button>
          )}

          {/* Selector de Modo: Alumnos / Profesora */}
          <div className="flex bg-slate-800/90 p-0.5 rounded-xl border border-slate-700">
            <button
              onClick={() => onSwitchView("student")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === "student"
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <User className="w-3 h-3" />
              <span className="hidden sm:inline">Alumnos</span>
            </button>
            <button
              onClick={() => onSwitchView("admin")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === "admin"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Shield className="w-3 h-3" />
              <span className="hidden sm:inline">Profe</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
