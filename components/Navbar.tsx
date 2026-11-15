"use client";

import React from "react";
import { Music, Shield, User, BookOpen, LogOut } from "lucide-react";

interface NavbarProps {
  contestTitle: string;
  currentWeek: number;
  viewMode: "student" | "admin";
  onSwitchView: (mode: "student" | "admin") => void;
  currentStudentName?: string;
  onLogoutStudent?: () => void;
  onOpenRules?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  contestTitle,
  currentWeek,
  viewMode,
  onSwitchView,
  currentStudentName,
  onLogoutStudent,
  onOpenRules,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-rose-100/80 text-slate-800 shadow-xs select-none">
      {/* Línea decorativa sutil en el borde superior con suave gradiente pastel */}
      <div className="h-[2px] w-full bg-gradient-to-r from-pink-300/40 via-amber-300/60 to-sky-300/40" />

      <div className="w-full max-w-6xl mx-auto px-2.5 sm:px-4 py-2 flex items-center justify-between gap-1.5 sm:gap-3">
        {/* Logo & Título */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 shrink">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-tr from-amber-300 to-rose-200 flex items-center justify-center text-slate-800 shadow-sm shadow-amber-300/30 shrink-0">
            <Music className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
          </div>
          <div className="min-w-0 flex items-center gap-1 sm:gap-2">
            <h1 className="font-black text-xs sm:text-sm tracking-tight text-slate-800 truncate">
              LIGA PIANISTA
            </h1>
            <span className="text-[9px] sm:text-[11px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100/90 text-amber-800 border border-amber-200/80 shrink-0 font-mono">
              Sem {currentWeek}
            </span>
          </div>
        </div>

        {/* Acciones & Controles adaptados a móvil */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Botón Bases Oficiales */}
          {onOpenRules && (
            <button
              onClick={onOpenRules}
              title="Bases Oficiales y Calendario"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100/70 border border-amber-200 text-amber-800 text-[11px] sm:text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-xs"
            >
              <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 text-amber-600" />
              <span className="hidden xs:inline sm:inline">Bases</span>
            </button>
          )}

          {/* Salir (si alumno logueado) */}
          {viewMode === "student" && currentStudentName && onLogoutStudent && (
            <button
              onClick={onLogoutStudent}
              title={`Cerrar sesión de ${currentStudentName}`}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-semibold transition-colors active:scale-95"
            >
              <LogOut className="w-3 h-3 text-rose-500 shrink-0" />
              <span className="hidden sm:inline truncate max-w-[60px]">{currentStudentName.split(" ")[0]}</span>
            </button>
          )}

          {/* Segmented Control: Alumnos / Profe */}
          <div className="flex bg-slate-100/90 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => onSwitchView("student")}
              title="Vista Alumnos"
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] sm:text-xs font-bold transition-all ${
                viewMode === "student"
                  ? "bg-white text-slate-800 shadow-sm border border-slate-200/60"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <User className="w-3 h-3 text-amber-600" />
              <span className="hidden sm:inline">Alumnos</span>
            </button>
            <button
              onClick={() => onSwitchView("admin")}
              title="Vista Profesora"
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] sm:text-xs font-bold transition-all ${
                viewMode === "admin"
                  ? "bg-purple-100 text-purple-900 shadow-sm border border-purple-200/80"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Shield className="w-3 h-3 text-purple-600" />
              <span className="hidden sm:inline">Profe</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
