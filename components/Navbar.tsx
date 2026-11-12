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
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-lg select-none">
      {/* Línea decorativa sutil en el borde superior */}
      <div className="h-[2px] w-full bg-gradient-to-r from-amber-500/20 via-amber-400/70 to-amber-500/20" />

      <div className="w-full max-w-6xl mx-auto px-2.5 sm:px-4 py-2 flex items-center justify-between gap-1.5 sm:gap-3">
        {/* Logo & Título */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 shrink">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 shrink-0">
            <Music className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
          </div>
          <div className="min-w-0 flex items-center gap-1 sm:gap-2">
            <h1 className="font-black text-xs sm:text-sm tracking-tight text-white truncate">
              LIGA PIANISTA
            </h1>
            <span className="text-[9px] sm:text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0 font-mono">
              Sem {currentWeek}
            </span>
          </div>
        </div>

        {/* Acciones & Controles adaptados a móvil */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Botón Bases Oficiales */}
          {onOpenRules && (
            <button
              onClick={onOpenRules}
              title="Bases Oficiales y Calendario"
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[11px] sm:text-xs font-bold transition-all cursor-pointer active:scale-95"
            >
              <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="hidden xs:inline sm:inline">Bases</span>
            </button>
          )}

          {/* Sonido */}
          <button
            onClick={onToggleMute}
            title={isMuted ? "Activar sonido" : "Silenciar sonido"}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 active:scale-95 transition-colors"
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            )}
          </button>

          {/* Salir (si alumno logueado) */}
          {viewMode === "student" && currentStudentName && onLogoutStudent && (
            <button
              onClick={onLogoutStudent}
              title={`Cerrar sesión de ${currentStudentName}`}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-700 text-[11px] font-semibold transition-colors active:scale-95"
            >
              <LogOut className="w-3 h-3 text-rose-400 shrink-0" />
              <span className="hidden sm:inline truncate max-w-[60px]">{currentStudentName.split(" ")[0]}</span>
            </button>
          )}

          {/* Segmented Control: Alumnos / Profe */}
          <div className="flex bg-slate-800/90 p-0.5 rounded-lg border border-slate-700">
            <button
              onClick={() => onSwitchView("student")}
              title="Vista Alumnos"
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] sm:text-xs font-bold transition-all ${
                viewMode === "student"
                  ? "bg-amber-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <User className="w-3 h-3" />
              <span className="hidden sm:inline">Alumnos</span>
            </button>
            <button
              onClick={() => onSwitchView("admin")}
              title="Vista Profesora"
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] sm:text-xs font-bold transition-all ${
                viewMode === "admin"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
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
