"use client";

import React, { useState, useEffect } from "react";
import {
  Trophy,
  Users,
  Edit3,
  Settings,
  PlusCircle,
  Save,
  Send,
  MessageCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Lock,
  LogOut,
  RefreshCw,
  Search,
  CheckCircle2,
  Trash2,
  Sparkles,
  LayoutGrid,
  Table as TableIcon,
  Bell,
  Pencil,
  X,
} from "lucide-react";
import { ContestSettings, Student } from "@/types/contest";
import { FullRankedStudent } from "@/lib/ranking";
import { OFFICIAL_CALENDAR } from "@/lib/contestData";

interface AdminDashboardProps {
  onLogout: () => void;
  onOpenRules?: () => void;
  onWeekUpdated?: (newWeek: number) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onLogout,
  onOpenRules,
  onWeekUpdated,
}) => {
  const [adminPin, setAdminPin] = useState("");
  const [adminToken, setAdminToken] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Datos del concurso
  const [settings, setSettings] = useState<ContestSettings | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [fullRanking, setFullRanking] = useState<FullRankedStudent[]>([]);
  const [activeTab, setActiveTab] = useState<"scores" | "ranking" | "students" | "settings">("scores");

  // Estado para la carga semanal
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [weeklyScoresInput, setWeeklyScoresInput] = useState<{
    [studentId: string]: { [testId: string]: number | string };
  }>({});
  const [saveSuccessMessage, setSaveSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [mobileScoresView, setMobileScoresView] = useState<"cards" | "table">("cards");
  const [rankingView, setRankingView] = useState<"cards" | "table">("cards");

  // Estado para gestión y edición de alumnos
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [studentFormData, setStudentFormData] = useState({
    name: "",
    pin: "",
    avatar: "🎹",
    phone: "",
    level: "Intermedio",
  });

  useEffect(() => {
    const savedToken =
      typeof window !== "undefined"
        ? localStorage.getItem("admin_token") || sessionStorage.getItem("admin_token")
        : null;
    if (savedToken) {
      setAdminToken(savedToken);
      fetchAdminData(savedToken);
    }
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPin.trim()) return;
    setIsLoading(true);
    setLoginError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminPin: adminPin.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "PIN incorrecto");
      }

      if (data.token) {
        localStorage.setItem("admin_token", data.token);
        sessionStorage.setItem("admin_token", data.token);
        setAdminToken(data.token);
        await fetchAdminData(data.token);
      }
    } catch (err: unknown) {
      const error = err as Error;
      setLoginError(error.message || "Error al autenticar");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoutAdmin = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_token");
      sessionStorage.removeItem("admin_token");
    }
    setAdminToken("");
    setIsAuthenticated(false);
    onLogout();
  };

  const fetchAdminData = async (tokenToUse?: string) => {
    const token = tokenToUse || adminToken;
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/data", {
        headers: { "x-admin-token": token },
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        setIsAuthenticated(true);
        setSettings(resData.data.settings);
        setStudents(resData.data.students);
        setFullRanking(resData.data.fullRanking);
        setSelectedWeek(resData.data.settings.currentWeek);
        onWeekUpdated?.(resData.data.settings.currentWeek);

        initWeeklyScoresInput(resData.data.students, resData.data.settings.currentWeek);
      } else {
        setIsAuthenticated(false);
        setLoginError(resData.error || "No autorizado");
      }
    } catch {
      setIsAuthenticated(false);
      setLoginError("Error de conexión al cargar datos");
    } finally {
      setIsLoading(false);
    }
  };

  const initWeeklyScoresInput = (studentList: Student[], week: number) => {
    const initial: { [studentId: string]: { [testId: string]: number | string } } = {};
    for (const student of studentList) {
      initial[student.id] = {};
      const weekData = student.scoresByWeek?.[week] || {};
      initial[student.id]["obras"] = weekData["obras"] ?? "";
      initial[student.id]["tecnica"] = weekData["tecnica"] ?? "";
      initial[student.id]["ritmo"] = weekData["ritmo"] ?? "";
      initial[student.id]["notas"] = weekData["notas"] ?? "";
    }
    setWeeklyScoresInput(initial);
  };

  const handleWeekChange = (week: number) => {
    setSelectedWeek(week);
    initWeeklyScoresInput(students, week);
  };

  const handleSaveScores = async () => {
    setIsLoading(true);
    setSaveSuccessMessage("");
    try {
      const res = await fetch("/api/admin/scores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify({
          weekNumber: selectedWeek,
          scores: weeklyScoresInput,
          setAsCurrentWeek: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.currentWeek) {
        onWeekUpdated?.(data.currentWeek);
      }

      setSaveSuccessMessage(`¡Puntuaciones de la Semana ${selectedWeek} guardadas con éxito!`);
      await fetchAdminData(adminToken);
      setTimeout(() => setSaveSuccessMessage(""), 4000);
    } catch (err: unknown) {
      const error = err as Error;
      alert("Error al guardar: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishWeek = async () => {
    if (!confirm(`¿Publicar oficialmente los resultados de la Semana ${selectedWeek}? Los alumnos verán su nueva posición y notificaciones de subida/bajada.`)) {
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify({ targetWeek: selectedWeek }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.currentWeek) {
        onWeekUpdated?.(data.currentWeek);
      }

      const pushText = data.pushResult ? `\n📲 Notificaciones Push enviadas a móviles: ${data.pushResult.sent}` : "";
      alert(`🎉 ${data.message}\nSubieron: ${data.summary.climbersCount} alumnos\nBajaron: ${data.summary.droppersCount} alumnos\nSe mantuvieron: ${data.summary.steadyCount}${pushText}`);
      await fetchAdminData(adminToken);
    } catch (err: unknown) {
      const error = err as Error;
      alert("Error: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetOfficialWeek = async (weekToSet: number) => {
    if (!settings) return;
    setIsLoading(true);
    try {
      const updated = { ...settings, currentWeek: weekToSet };
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSettings(updated);
      onWeekUpdated?.(weekToSet);
      alert(`✅ La Semana ${weekToSet} es ahora la Semana Oficial de la Liga.`);
      await fetchAdminData(adminToken);
    } catch (err: unknown) {
      const error = err as Error;
      alert("Error al fijar semana: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const [testPushStatus, setTestPushStatus] = useState<string>("");
  const handleTestBroadcastPush = async () => {
    setTestPushStatus("Enviando aviso de prueba...");
    try {
      const res = await fetch("/api/notifications/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (res.ok) {
        setTestPushStatus(`✅ ${data.message}`);
      } else {
        setTestPushStatus(`❌ ${data.error || "Error al enviar"}`);
      }
    } catch {
      setTestPushStatus("❌ Error de conexión al probar notificaciones");
    }
  };

  const handleStartEdit = (student: Student) => {
    setEditingStudentId(student.id);
    setStudentFormData({
      name: student.name,
      pin: student.pin,
      avatar: student.avatar || "🎹",
      phone: student.phone || "",
      level: student.level || "Intermedio",
    });
    // Desplazar suavemente hacia el formulario
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingStudentId(null);
    setStudentFormData({
      name: "",
      pin: "",
      avatar: "🎹",
      phone: "",
      level: "Intermedio",
    });
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentFormData.name.trim() || !studentFormData.pin.trim()) {
      alert("Introduce nombre y PIN del alumno.");
      return;
    }
    setIsLoading(true);
    try {
      if (editingStudentId) {
        // Modo Edición: Actualizar alumno con PUT
        const res = await fetch("/api/admin/students", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-admin-token": adminToken,
          },
          body: JSON.stringify({
            id: editingStudentId,
            ...studentFormData,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        alert(`✅ Alumno "${studentFormData.name}" actualizado correctamente.`);
        handleCancelEdit();
        await fetchAdminData(adminToken);
      } else {
        // Modo Creación: Añadir nuevo alumno con POST
        const res = await fetch("/api/admin/students", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-token": adminToken,
          },
          body: JSON.stringify(studentFormData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);

        alert(`✅ Alumno "${studentFormData.name}" añadido al concurso.`);
        handleCancelEdit();
        await fetchAdminData(adminToken);
      }
    } catch (err: unknown) {
      const error = err as Error;
      alert("Error: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStudent = async (id: string, name: string) => {
    if (!confirm(`¿Seguro que deseas eliminar a ${name}? Se borrarán sus puntuaciones.`)) {
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/students?id=${id}`, {
        method: "DELETE",
        headers: { "x-admin-token": adminToken },
      });
      if (!res.ok) throw new Error("Error al eliminar alumno");
      await fetchAdminData(adminToken);
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const openWhatsApp = (student: FullRankedStudent) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const directUrl = `${origin}/?pin=${student.pin}`;

    let statusText = `¡Has sumado un total de ${student.totalScore} puntos en la Liga!`;
    if (student.rankChange > 0) {
      statusText = `¡Felicidades! Has subido ${student.rankChange} ${
        student.rankChange === 1 ? "puesto" : "puestos"
      } y estás en el puesto #${student.rank} de la Liga 🚀`;
    } else if (student.rankChange < 0) {
      statusText = `Estás en el puesto #${student.rank}. ¡A solo ${student.pointsToNextRank} puntos de volver a subir! 💪`;
    } else {
      statusText = `Mantienes tu sólida posición en el puesto #${student.rank} 🎯`;
    }

    const message = `¡Hola ${student.name}! 🎹 Aquí tienes tu actualización de LA LIGA DEL PIANISTA:\n\n` +
      `🏆 Posición: Puesto #${student.rank}\n` +
      `⭐ Puntuación Acumulada: ${student.totalScore} pts\n` +
      `💡 ${statusText}\n` +
      (student.rank > 1 ? `🎯 Te faltan ${student.pointsToNextRank} pts para alcanzar el Puesto #${student.rank - 1}\n\n` : "\n") +
      `Consulta tu clasificación con tu PIN (${student.pin}) aquí:\n${directUrl}`;

    const encoded = encodeURIComponent(message);
    const phoneClean = student.phone ? student.phone.replace(/[^0-9+]/g, "") : "";
    const waUrl = phoneClean
      ? `https://api.whatsapp.com/send?phone=${phoneClean}&text=${encoded}`
      : `https://api.whatsapp.com/send?text=${encoded}`;

    window.open(waUrl, "_blank");
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-3 sm:my-10 p-4 sm:p-8 bg-white/95 rounded-3xl border border-purple-100 shadow-xl shadow-purple-900/5 text-slate-800">
        <div className="text-center mb-5">
          <div className="inline-flex p-3 rounded-2xl bg-purple-100/80 border border-purple-200 text-purple-700 mb-2.5 shadow-xs">
            <Lock className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800">Panel de Profesora</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            Gestión oficial de semanas, notas, obras, técnica y retos.
          </p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider text-center">
              Contraseña / PIN Maestro
            </label>
            <input
              type="password"
              value={adminPin}
              onChange={(e) => setAdminPin(e.target.value)}
              placeholder="Introduce tu PIN maestro"
              suppressHydrationWarning
              className="w-full text-center text-lg sm:text-xl font-mono tracking-wider py-3 px-4 bg-purple-50/30 rounded-xl border border-purple-200 text-purple-950 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-300 shadow-inner"
            />
          </div>

          {loginError && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center font-medium">
              {loginError}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !adminPin.trim()}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-bold rounded-xl shadow-md shadow-purple-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95 text-sm"
          >
            {isLoading ? "Entrando..." : "Acceder al Panel"}
          </button>
        </form>
      </div>
    );
  }

  // Información del calendario para la semana seleccionada
  const currentCalInfo = OFFICIAL_CALENDAR.find((c) => c.weekNumber === selectedWeek);
  const isOddWeek = selectedWeek % 2 !== 0;

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.pin.includes(searchTerm)
  );

  const filteredRanking = fullRanking.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.pin.includes(searchTerm)
  );

  return (
    <div className="max-w-5xl mx-auto my-2 sm:my-6 px-1 sm:px-4 text-slate-800 pb-20 sm:pb-8">
      {/* Barra de navegación de pestañas (Mobile First & Anti-Colapso) */}
      <div className="bg-white/95 rounded-2xl border border-slate-200/90 p-2 sm:p-2.5 mb-3 sm:mb-6 shadow-xs space-y-2 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-2">
        {/* Cabecera superior en móvil: Indicador del modo y botones de Bases / Salir */}
        <div className="flex items-center justify-between gap-2 sm:hidden border-b border-slate-100 pb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="text-[11px] font-black tracking-wider uppercase text-slate-700 truncate">
              Panel Profesora
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onOpenRules && (
              <button
                type="button"
                onClick={onOpenRules}
                title="Ver Bases Oficiales"
                className="py-1 px-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold hover:bg-amber-100/70 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <span>📜 Bases</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleLogoutAdmin}
              title="Cerrar sesión"
              className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-700 border border-slate-200 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-500" />
            </button>
          </div>
        </div>

        {/* 4 Pestañas al 100% de ancho en móvil, sin compresión ni desbordamiento */}
        <div className="w-full sm:w-auto grid grid-cols-4 sm:flex gap-1 sm:gap-1.5 bg-slate-50 sm:bg-transparent p-1 sm:p-0 rounded-xl border border-slate-200/80 sm:border-0">
          <button
            type="button"
            onClick={() => setActiveTab("scores")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2 px-1 sm:px-3 rounded-lg sm:rounded-xl text-center transition-all cursor-pointer ${
              activeTab === "scores"
                ? "bg-purple-100 text-purple-900 shadow-2xs font-black border border-purple-200"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-semibold"
            }`}
          >
            <Edit3 className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="text-[10px] sm:text-xs">Notas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("ranking")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2 px-1 sm:px-3 rounded-lg sm:rounded-xl text-center transition-all cursor-pointer ${
              activeTab === "ranking"
                ? "bg-purple-100 text-purple-900 shadow-2xs font-black border border-purple-200"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-semibold"
            }`}
          >
            <Trophy className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="text-[10px] sm:text-xs">Ranking</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("students")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2 px-1 sm:px-3 rounded-lg sm:rounded-xl text-center transition-all cursor-pointer ${
              activeTab === "students"
                ? "bg-purple-100 text-purple-900 shadow-2xs font-black border border-purple-200"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-semibold"
            }`}
          >
            <Users className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="text-[10px] sm:text-xs">Alumnos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2 px-1 sm:px-3 rounded-lg sm:rounded-xl text-center transition-all cursor-pointer ${
              activeTab === "settings"
                ? "bg-purple-100 text-purple-900 shadow-2xs font-black border border-purple-200"
                : "text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-semibold"
            }`}
          >
            <Settings className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="text-[10px] sm:text-xs">Ajustes</span>
          </button>
        </div>

        {/* Acciones de escritorio a la derecha */}
        <div className="hidden sm:flex items-center gap-1.5 ml-auto shrink-0">
          {onOpenRules && (
            <button
              type="button"
              onClick={onOpenRules}
              title="Ver Bases Oficiales"
              className="py-1.5 px-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold hover:bg-amber-100/70 transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
            >
              <span>📜 Bases</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleLogoutAdmin}
            title="Cerrar sesión"
            className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-700 border border-slate-200 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-500" />
          </button>
        </div>
      </div>

      {/* PESTAÑA 1: CARGA SEMANAL DE NOTAS */}
      {activeTab === "scores" && (
        <div className="space-y-3 sm:space-y-4">
          {/* Cabecera con selector de semana */}
          <div className="bg-white/95 rounded-2xl border border-slate-200/90 p-3 sm:p-5 shadow-xs space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 shrink-0" />
                  <h3 className="text-base sm:text-lg font-black text-slate-800">
                    Semana {selectedWeek}: {currentCalInfo?.dates || "Fechas oficiales"}
                  </h3>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <span
                    className={`text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                      isOddWeek
                        ? "bg-amber-100 text-amber-800 border-amber-200"
                        : "bg-sky-100 text-sky-800 border-sky-200"
                    }`}
                  >
                    {isOddWeek ? "🥁 Reto: Ritmo (Máx 4 pts)" : "🎼 Reto: Claves (Máx 2 pts)"}
                  </span>
                  <span className="text-[10px] sm:text-xs text-slate-500">
                    + Obras (×2) + Técnica (Máx 2)
                  </span>
                </div>
              </div>

              {/* Selector de Semanas 1 a 27 y fijar semana activa */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200 w-full sm:w-auto shadow-2xs">
                  <span className="text-xs font-semibold text-slate-500 px-1 shrink-0">Semana:</span>
                  <select
                    value={selectedWeek}
                    onChange={(e) => handleWeekChange(Number(e.target.value))}
                    className="bg-white text-amber-800 font-mono text-xs font-bold py-1.5 px-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer w-full"
                  >
                    {OFFICIAL_CALENDAR.map((cal) => (
                      <option key={cal.weekNumber} value={cal.weekNumber}>
                        Semana {cal.weekNumber} ({cal.dates}) · {cal.challengeType === "ritmo" ? "🥁 Ritmo" : "🎼 Claves"}
                      </option>
                    ))}
                  </select>
                </div>

                {settings && (
                  <div className="flex items-center justify-between sm:justify-start gap-1.5 bg-slate-50/80 px-2 py-1.5 rounded-xl border border-slate-200 shrink-0">
                    <span className="text-[10px] text-slate-500">Oficial:</span>
                    <span className="text-[11px] font-bold font-mono text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200">
                      Sem. {settings.currentWeek}
                    </span>
                    {selectedWeek !== settings.currentWeek && (
                      <button
                        type="button"
                        onClick={() => handleSetOfficialWeek(selectedWeek)}
                        disabled={isLoading}
                        className="text-[10px] font-bold px-2 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-all cursor-pointer active:scale-95 disabled:opacity-50 shadow-2xs"
                        title="Hacer que esta semana sea la activa oficial para todos los alumnos"
                      >
                        Fijar Sem. {selectedWeek} como Oficial
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Barra de Búsqueda y Conmutador de vista Tarjetas/Tabla en móvil */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar alumno..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-300"
                />
              </div>

              <div className="flex items-center bg-slate-50 p-0.5 rounded-xl border border-slate-200 shrink-0 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setMobileScoresView("cards")}
                  className={`flex items-center gap-1 py-1 px-2 rounded-lg text-xs font-semibold transition-colors ${
                    mobileScoresView === "cards" ? "bg-white text-purple-900 shadow-xs border border-purple-100" : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Vista Tarjetas (Táctil)"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline sm:inline">Tarjetas</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMobileScoresView("table")}
                  className={`flex items-center gap-1 py-1 px-2 rounded-lg text-xs font-semibold transition-colors ${
                    mobileScoresView === "table" ? "bg-white text-purple-900 shadow-xs border border-purple-100" : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Vista Tabla (Spreadsheet)"
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline sm:inline">Tabla</span>
                </button>
              </div>
            </div>
          </div>

          {/* Confirmación al guardar */}
          {saveSuccessMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{saveSuccessMessage}</span>
            </div>
          )}

          {/* Selector de modo y contenido */}
          {mobileScoresView === "cards" ? (
            /* VISTA 1: TARJETAS TÁCTILES RÁPIDAS (Thumb-Friendly, Mobile First) */
            <div className="space-y-2.5">
              {filteredStudents.map((student) => {
                const rowScores = weeklyScoresInput[student.id] || {};
                const sObras = Number(rowScores["obras"]) || 0;
                const sTec = Number(rowScores["tecnica"]) || 0;
                const sRitmo = Number(rowScores["ritmo"]) || 0;
                const sNotas = Number(rowScores["notas"]) || 0;
                const weekTotal = sObras + sTec + sRitmo + sNotas;

                return (
                  <div
                    key={student.id}
                    className="bg-white rounded-2xl border border-slate-200/90 p-3 shadow-xs space-y-2.5"
                  >
                    {/* Cabecera del alumno */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xl shrink-0">{student.avatar}</span>
                        <div className="min-w-0">
                          <p className="font-bold text-xs sm:text-sm text-slate-800 truncate">
                            {student.name}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            PIN: <span className="text-amber-700 font-bold">{student.pin}</span> · {student.level || "Intermedio"}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-black font-mono text-amber-700">
                          {weekTotal} pts
                        </span>
                        <span className="text-[9px] text-slate-400 block">Total Sem.</span>
                      </div>
                    </div>

                    {/* Entradas táctiles de notas adaptadas a móvil y escritorio */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100">
                      {/* Obras (Factor x2 con botones de paso rápido +2 / -2) */}
                      <div className="bg-rose-50/60 p-2 rounded-xl border border-rose-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-rose-800">
                            🎼 Obras (×2)
                          </span>
                          <span className="text-[10px] font-mono font-bold text-rose-700">
                            {sObras} pts
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              const current = Number(rowScores["obras"]) || 0;
                              const next = Math.max(0, current - 2);
                              setWeeklyScoresInput((prev) => ({
                                ...prev,
                                [student.id]: { ...prev[student.id], obras: next === 0 ? "" : next },
                              }));
                            }}
                            className="w-7 h-7 rounded-lg bg-white hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold text-xs flex items-center justify-center shrink-0 active:scale-95 cursor-pointer shadow-2xs"
                          >
                            -2
                          </button>
                          <input
                            type="number"
                            min="0"
                            max="20"
                            step="2"
                            value={rowScores["obras"] ?? ""}
                            onChange={(e) => {
                              const val = e.target.value === "" ? "" : Number(e.target.value);
                              setWeeklyScoresInput((prev) => ({
                                ...prev,
                                [student.id]: { ...prev[student.id], obras: val },
                              }));
                            }}
                            placeholder="0"
                            className="w-full text-center py-1 bg-white rounded-lg border border-rose-200 text-rose-800 font-mono text-xs font-bold"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const current = Number(rowScores["obras"]) || 0;
                              const next = Math.min(20, current + 2);
                              setWeeklyScoresInput((prev) => ({
                                ...prev,
                                [student.id]: { ...prev[student.id], obras: next },
                              }));
                            }}
                            className="w-7 h-7 rounded-lg bg-white hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold text-xs flex items-center justify-center shrink-0 active:scale-95 cursor-pointer shadow-2xs"
                          >
                            +2
                          </button>
                        </div>
                      </div>

                      {/* Técnica (0-2) */}
                      <div className="bg-emerald-50/60 p-2 rounded-xl border border-emerald-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-emerald-800">
                            🛠️ Técnica (Máx 2)
                          </span>
                          <span className="text-[10px] font-mono font-bold text-emerald-700">
                            {sTec} pts
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          {[0, 1, 2].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => {
                                setWeeklyScoresInput((prev) => ({
                                  ...prev,
                                  [student.id]: { ...prev[student.id], tecnica: num },
                                }));
                              }}
                              className={`py-1 rounded-md text-xs font-mono font-bold transition-all ${
                                sTec === num && rowScores["tecnica"] !== ""
                                  ? "bg-emerald-500 text-white shadow-xs"
                                  : "bg-white text-slate-600 border border-slate-200 hover:bg-emerald-50"
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Reto Rotativo: Ritmo (Semanas impares) */}
                      <div
                        className={`col-span-2 p-2 rounded-xl border ${
                          isOddWeek
                            ? "bg-amber-50/60 border-amber-200"
                            : "bg-slate-50 border-slate-200 opacity-60"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-amber-800">
                            🥁 Reto Ritmo (Semanas Impares · Máx 4 pts)
                          </span>
                          <span className="text-[10px] font-mono font-bold text-amber-700">
                            {sRitmo} pts
                          </span>
                        </div>
                        <div className="grid grid-cols-5 gap-1">
                          {[0, 1, 2, 3, 4].map((num) => (
                            <button
                              key={num}
                              type="button"
                              disabled={!isOddWeek}
                              onClick={() => {
                                setWeeklyScoresInput((prev) => ({
                                  ...prev,
                                  [student.id]: { ...prev[student.id], ritmo: num },
                                }));
                              }}
                              className={`py-1 rounded-md text-xs font-mono font-bold transition-all ${
                                sRitmo === num && rowScores["ritmo"] !== ""
                                  ? "bg-amber-400 text-amber-950 font-black shadow-xs"
                                  : "bg-white text-slate-600 border border-slate-200 hover:bg-amber-50 disabled:opacity-40"
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Reto Rotativo: Claves (Semanas pares) */}
                      <div
                        className={`col-span-2 p-2 rounded-xl border ${
                          !isOddWeek
                            ? "bg-sky-50/60 border-sky-200"
                            : "bg-slate-50 border-slate-200 opacity-60"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold text-sky-900">
                            🎼 Reto Claves (Semanas Pares · Máx 2 pts)
                          </span>
                          <span className="text-[10px] font-mono font-bold text-sky-700">
                            {sNotas} pts
                          </span>
                        </div>
                        <div className="grid grid-cols-5 gap-1">
                          {[0, 0.5, 1.0, 1.5, 2.0].map((num) => (
                            <button
                              key={num}
                              type="button"
                              disabled={isOddWeek}
                              onClick={() => {
                                setWeeklyScoresInput((prev) => ({
                                  ...prev,
                                  [student.id]: { ...prev[student.id], notas: num },
                                }));
                              }}
                              className={`py-1 rounded-md text-[11px] font-mono font-bold transition-all ${
                                sNotas === num && rowScores["notas"] !== ""
                                  ? "bg-sky-400 text-sky-950 font-black shadow-xs"
                                  : "bg-white text-slate-600 border border-slate-200 hover:bg-sky-50 disabled:opacity-40"
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* VISTA 2: TABLA SPREADSHEET */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 text-[11px] sm:text-xs text-slate-600 uppercase tracking-wider border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                      <th className="py-2.5 px-3 sm:px-4">Alumno</th>
                      <th className="py-2.5 px-2 text-center text-rose-700">🎼 Obras (×2)</th>
                      <th className="py-2.5 px-2 text-center text-emerald-700">🛠️ Técnica (2)</th>
                      <th className={`py-2.5 px-2 text-center ${isOddWeek ? "text-amber-800 bg-amber-50" : "text-slate-400"}`}>
                        🥁 Ritmo (4)
                      </th>
                      <th className={`py-2.5 px-2 text-center ${!isOddWeek ? "text-sky-800 bg-sky-50" : "text-slate-400"}`}>
                        🎼 Claves (2)
                      </th>
                      <th className="py-2.5 px-3 text-center text-amber-700 font-bold">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map((student) => {
                      const rowScores = weeklyScoresInput[student.id] || {};
                      const sObras = Number(rowScores["obras"]) || 0;
                      const sTec = Number(rowScores["tecnica"]) || 0;
                      const sRitmo = Number(rowScores["ritmo"]) || 0;
                      const sNotas = Number(rowScores["notas"]) || 0;
                      const weekTotal = sObras + sTec + sRitmo + sNotas;

                      return (
                        <tr key={student.id} className="hover:bg-slate-50/70">
                          <td className="py-2 px-3 font-medium">
                            <div className="flex items-center gap-1.5">
                              <span>{student.avatar}</span>
                              <span className="truncate max-w-[120px] text-slate-800">{student.name}</span>
                            </div>
                          </td>
                          <td className="py-1.5 px-1 text-center">
                            <input
                              type="number"
                              min="0"
                              max="20"
                              step="2"
                              value={rowScores["obras"] ?? ""}
                              onChange={(e) => {
                                const val = e.target.value === "" ? "" : Number(e.target.value);
                                setWeeklyScoresInput((prev) => ({
                                  ...prev,
                                  [student.id]: { ...prev[student.id], obras: val },
                                }));
                              }}
                              placeholder="0"
                              className="w-12 text-center py-1 bg-white rounded-lg border border-slate-200 text-rose-700 font-mono text-xs"
                            />
                          </td>
                          <td className="py-1.5 px-1 text-center">
                            <input
                              type="number"
                              min="0"
                              max="2"
                              value={rowScores["tecnica"] ?? ""}
                              onChange={(e) => {
                                const val = e.target.value === "" ? "" : Number(e.target.value);
                                setWeeklyScoresInput((prev) => ({
                                  ...prev,
                                  [student.id]: { ...prev[student.id], tecnica: val },
                                }));
                              }}
                              placeholder="0"
                              className="w-12 text-center py-1 bg-white rounded-lg border border-slate-200 text-emerald-700 font-mono text-xs"
                            />
                          </td>
                          <td className={`py-1.5 px-1 text-center ${isOddWeek ? "bg-amber-50/40" : "opacity-40"}`}>
                            <input
                              type="number"
                              min="0"
                              max="4"
                              disabled={!isOddWeek}
                              value={rowScores["ritmo"] ?? ""}
                              onChange={(e) => {
                                const val = e.target.value === "" ? "" : Number(e.target.value);
                                setWeeklyScoresInput((prev) => ({
                                  ...prev,
                                  [student.id]: { ...prev[student.id], ritmo: val },
                                }));
                              }}
                              placeholder={isOddWeek ? "0" : "-"}
                              className="w-12 text-center py-1 bg-white rounded-lg border border-slate-200 text-amber-800 font-mono text-xs"
                            />
                          </td>
                          <td className={`py-1.5 px-1 text-center ${!isOddWeek ? "bg-sky-50/40" : "opacity-40"}`}>
                            <input
                              type="number"
                              min="0"
                              max="2"
                              step="0.5"
                              disabled={isOddWeek}
                              value={rowScores["notas"] ?? ""}
                              onChange={(e) => {
                                const val = e.target.value === "" ? "" : Number(e.target.value);
                                setWeeklyScoresInput((prev) => ({
                                  ...prev,
                                  [student.id]: { ...prev[student.id], notas: val },
                                }));
                              }}
                              placeholder={!isOddWeek ? "0" : "-"}
                              className="w-12 text-center py-1 bg-white rounded-lg border border-slate-200 text-sky-800 font-mono text-xs"
                            />
                          </td>
                          <td className="py-2 px-3 text-center font-mono font-bold text-amber-700">
                            {weekTotal}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Barra de acción fija inferior en Móvil */}
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-2.5 sm:relative sm:bg-transparent sm:border-0 sm:p-0 shadow-lg sm:shadow-none">
            <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
              <button
                onClick={handleSaveScores}
                disabled={isLoading}
                className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-300 via-rose-200 to-pink-200 hover:from-amber-200 hover:to-pink-300 text-slate-800 font-bold text-xs sm:text-sm border border-amber-200/60 shadow-md shadow-rose-100 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
              >
                <Save className="w-4 h-4 shrink-0" />
                <span>Guardar Sem. {selectedWeek}</span>
              </button>

              <button
                onClick={handlePublishWeek}
                disabled={isLoading}
                className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
              >
                <Send className="w-4 h-4 shrink-0" />
                <span>Publicar Notas</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: CLASIFICACIÓN COMPLETA (Mobile First) */}
      {activeTab === "ranking" && (
        <div className="space-y-3 sm:space-y-4">
          <div className="bg-white/95 rounded-2xl border border-slate-200/90 p-3 sm:p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-black text-slate-800 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Clasificación General</span>
              </h3>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar alumno o PIN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-300"
                />
              </div>

              <div className="flex items-center bg-slate-50 p-0.5 rounded-xl border border-slate-200 shrink-0 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setRankingView("cards")}
                  className={`flex items-center gap-1 py-1 px-2 rounded-lg text-xs font-semibold transition-colors ${
                    rankingView === "cards" ? "bg-white text-purple-900 shadow-xs border border-purple-100" : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Vista Tarjetas (Táctil)"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline sm:inline">Tarjetas</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRankingView("table")}
                  className={`flex items-center gap-1 py-1 px-2 rounded-lg text-xs font-semibold transition-colors ${
                    rankingView === "table" ? "bg-white text-purple-900 shadow-xs border border-purple-100" : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Vista Tabla (Spreadsheet)"
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline sm:inline">Tabla</span>
                </button>
              </div>
            </div>
          </div>

          {rankingView === "cards" ? (
            /* LISTA NATIVA DE TARJETAS (Mobile First & Touch Friendly) */
            <div className="space-y-2">
              {filteredRanking.map((student) => {
                const isTop10 = student.rank <= 10;

                return (
                  <div
                    key={student.id}
                    className={`p-3 rounded-2xl border bg-white transition-colors shadow-2xs ${
                      student.rank === 1
                        ? "border-amber-300 bg-amber-50/40"
                        : isTop10
                        ? "border-slate-200"
                        : "border-slate-200/60 opacity-90"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      {/* Puesto & Avatar & Nombre */}
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center shrink-0 ${
                            student.rank === 1
                              ? "bg-amber-100 text-amber-800 border border-amber-300 font-black"
                              : student.rank === 2
                              ? "bg-slate-100 text-slate-700 border border-slate-300 font-black"
                              : student.rank === 3
                              ? "bg-orange-100 text-orange-800 border border-orange-300 font-black"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          #{student.rank}
                        </span>

                        <span className="text-lg shrink-0">{student.avatar}</span>

                        <div className="min-w-0">
                          <p className="font-bold text-xs text-slate-800 truncate">
                            {student.name}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            PIN: <span className="font-mono text-purple-700 font-bold">{student.pin}</span>
                            {student.rank > 1 && (
                              <span className="text-slate-400 ml-1">· A {student.pointsToNextRank} pts #{student.rank - 1}</span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Puntos y Tendencia */}
                      <div className="text-right shrink-0">
                        <span className="text-sm font-mono font-black text-amber-700">
                          {student.totalScore} pts
                        </span>
                        <div className="flex justify-end mt-0.5">
                          {student.rankChange > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded-full border border-emerald-200">
                              <TrendingUp className="w-2.5 h-2.5" />+{student.rankChange}
                            </span>
                          )}
                          {student.rankChange < 0 && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-rose-700 bg-rose-50 px-1 py-0.2 rounded-full border border-rose-200">
                              <TrendingDown className="w-2.5 h-2.5" />
                              {student.rankChange}
                            </span>
                          )}
                          {student.rankChange === 0 && (
                            <span className="inline-flex items-center text-[9px] text-slate-400 bg-slate-100 px-1 py-0.5 rounded-full">
                              <Minus className="w-2 h-2" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Botón WhatsApp 1-Tap para móvil */}
                    <div className="mt-2.5 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => openWhatsApp(student)}
                        className="w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-200 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Enviar Puesto por WhatsApp</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* TABLA COMPLETA */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs text-slate-600 uppercase tracking-wider border-b border-slate-200 sticky top-0 z-10">
                    <tr>
                      <th className="py-3 px-4">Puesto</th>
                      <th className="py-3 px-4">Alumno</th>
                      <th className="py-3 px-3 text-center">PIN</th>
                      <th className="py-3 px-3 text-center">Tendencia</th>
                      <th className="py-3 px-4 text-right">Puntos Totales</th>
                      <th className="py-3 px-4 text-center">Aviso WhatsApp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRanking.map((student) => {
                      const isTop10 = student.rank <= 10;

                      return (
                        <tr
                          key={student.id}
                          className={`hover:bg-slate-50/70 transition-colors ${
                            isTop10 ? "bg-amber-50/20" : ""
                          }`}
                        >
                          <td className="py-3 px-4 font-mono font-bold">
                            <span
                              className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs ${
                                student.rank === 1
                                  ? "bg-amber-100 text-amber-800 border border-amber-300 font-black"
                                  : student.rank === 2
                                  ? "bg-slate-100 text-slate-700 border border-slate-300 font-black"
                                  : student.rank === 3
                                  ? "bg-orange-100 text-orange-800 border border-orange-300 font-black"
                                  : isTop10
                                  ? "bg-amber-50 text-amber-900 font-bold border border-amber-200"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              #{student.rank}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{student.avatar}</span>
                              <div>
                                <p className="font-bold text-slate-800">{student.name}</p>
                                {student.rank > 1 && (
                                  <p className="text-[11px] text-slate-400">
                                    A {student.pointsToNextRank} pts del #{student.rank - 1}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-xs text-purple-700 font-bold">
                            {student.pin}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {student.rankChange > 0 && (
                              <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <TrendingUp className="w-3 h-3 text-emerald-600" />+{student.rankChange}
                              </span>
                            )}
                            {student.rankChange < 0 && (
                              <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                                <TrendingDown className="w-3 h-3 text-rose-600" />
                                {student.rankChange}
                              </span>
                            )}
                            {student.rankChange === 0 && (
                              <span className="text-slate-400 text-xs">➖</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-base text-amber-700">
                            {student.totalScore} pts
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => openWhatsApp(student)}
                              title="Enviar actualización por WhatsApp"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold text-xs transition-all shadow-2xs cursor-pointer"
                            >
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span>WhatsApp</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PESTAÑA 3: GESTIÓN Y EDICIÓN DE ALUMNOS */}
      {activeTab === "students" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Formulario de Creación / Edición */}
          <div className="bg-white/95 rounded-2xl border border-slate-200/90 p-4 shadow-xs h-fit">
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-base font-bold flex items-center gap-2 ${editingStudentId ? "text-amber-800" : "text-slate-800"}`}>
                {editingStudentId ? (
                  <>
                    <Edit3 className="w-4 h-4 text-amber-600" />
                    <span>Editar Alumno</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4 text-purple-600" />
                    <span>Nuevo Alumno</span>
                  </>
                )}
              </h3>
              {editingStudentId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded-lg transition-colors"
                >
                  <X className="w-3 h-3" />
                  <span>Cancelar</span>
                </button>
              )}
            </div>

            {editingStudentId && (
              <div className="mb-3 p-2 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 flex items-center justify-between">
                <span>Modificando a: <strong>{studentFormData.name}</strong></span>
              </div>
            )}

            <form onSubmit={handleSaveStudent} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nombre</label>
                <input
                  type="text"
                  placeholder="Ej: Laura Gómez"
                  value={studentFormData.name}
                  onChange={(e) => setStudentFormData({ ...studentFormData, name: e.target.value })}
                  className="w-full py-2 px-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-300"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  PIN de Acceso (4 dígitos)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Ej: 1029"
                  value={studentFormData.pin}
                  onChange={(e) => setStudentFormData({ ...studentFormData, pin: e.target.value })}
                  className="w-full py-2 px-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-amber-700 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-purple-300"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Nivel de Lectura
                </label>
                <select
                  value={studentFormData.level}
                  onChange={(e) => setStudentFormData({ ...studentFormData, level: e.target.value })}
                  className="w-full py-2 px-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-300 cursor-pointer"
                >
                  <option value="Iniciación">Iniciación (20s tiempo límite)</option>
                  <option value="Intermedio">Intermedio (15s tiempo límite)</option>
                  <option value="Avanzado">Avanzado (10s tiempo límite)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Avatar Musical
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  {["🎹", "🎼", "🎵", "🎶", "🎻", "🎷", "🎺", "🌟", "🔥", "🎀"].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setStudentFormData({ ...studentFormData, avatar: emoji })}
                      className={`w-8 h-8 rounded-lg border text-sm flex items-center justify-center transition-all cursor-pointer ${
                        studentFormData.avatar === emoji
                          ? "border-amber-300 bg-amber-100/70"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95 disabled:opacity-50 ${
                    editingStudentId
                      ? "bg-gradient-to-r from-amber-300 to-rose-200 hover:from-amber-200 hover:to-rose-300 text-slate-800 border border-amber-200"
                      : "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-200"
                  }`}
                >
                  {editingStudentId ? "Guardar Cambios" : "Añadir al Concurso"}
                </button>
                {editingStudentId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Lista de Alumnos con Búsqueda y Botones de Editar y Eliminar */}
          <div className="md:col-span-2 bg-white/95 rounded-2xl border border-slate-200/90 p-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-purple-600" />
                  <span>Alumnos Registrados</span>
                </h3>

                {/* Filtro rápido de alumnos */}
                <div className="relative w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar alumno o PIN..."
                    value={studentSearchTerm}
                    onChange={(e) => setStudentSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-300"
                  />
                </div>
              </div>

              <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto pr-1">
                {students
                  .filter((st) =>
                    st.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
                    st.pin.includes(studentSearchTerm)
                  )
                  .map((st) => {
                    const isBeingEdited = editingStudentId === st.id;
                    return (
                      <div
                        key={st.id}
                        className={`py-2.5 px-2 flex items-center justify-between gap-2 transition-colors rounded-xl ${
                          isBeingEdited ? "bg-amber-50/80 border border-amber-200" : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xl shrink-0">{st.avatar}</span>
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-slate-800 truncate flex items-center gap-1.5">
                              <span>{st.name}</span>
                              {isBeingEdited && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200">
                                  Editando
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              PIN: <code className="text-amber-700 font-mono font-bold">{st.pin}</code> · {st.level || "Intermedio"}
                            </p>
                          </div>
                        </div>

                        {/* Botones de acción: Editar y Eliminar */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(st)}
                            className="flex items-center gap-1 py-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 text-xs font-semibold transition-all cursor-pointer active:scale-95 shadow-2xs"
                            title={`Editar datos de ${st.name}`}
                          >
                            <Pencil className="w-3.5 h-3.5 text-amber-600" />
                            <span className="hidden xs:inline sm:inline">Editar</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteStudent(st.id, st.name)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-700 border border-slate-200 transition-all cursor-pointer active:scale-95 shrink-0 shadow-2xs"
                            title={`Eliminar ${st.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 4: CONFIGURACIÓN */}
      {activeTab === "settings" && (
        <div className="max-w-2xl bg-white/95 rounded-2xl border border-slate-200/90 p-4 sm:p-6 shadow-xs space-y-4">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-2">
              <Settings className="w-4 h-4 text-purple-600" />
              Configuración de LA LIGA DEL PIANISTA
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Bases oficiales de competición: 27 semanas
            </p>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Título del Evento
              </label>
              <input
                type="text"
                value={settings?.title || ""}
                onChange={(e) =>
                  setSettings((prev) => (prev ? { ...prev, title: e.target.value } : null))
                }
                className="w-full py-2 px-3 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-purple-300"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Semana Actual de Competición
              </label>
              <input
                type="number"
                min="1"
                max="27"
                value={settings?.currentWeek || 1}
                onChange={(e) =>
                  setSettings((prev) =>
                    prev ? { ...prev, currentWeek: Number(e.target.value) } : null
                  )
                }
                className="w-28 py-2 px-3 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm text-amber-800 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-purple-300"
              />
            </div>

            {/* Sección de Notificaciones Push a Móviles */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800">
                <Bell className="w-4 h-4 text-amber-600" />
                <span>Notificaciones Push a Móviles</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Prueba el envío automático a todos los móviles suscritos (con la pantalla apagada o el navegador cerrado).
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestBroadcastPush}
                  className="py-2 px-3 rounded-xl bg-white hover:bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-2xs"
                >
                  <Send className="w-3.5 h-3.5 text-amber-600" />
                  <span>Enviar Aviso de Prueba a Todos los Móviles</span>
                </button>
              </div>
              {testPushStatus && (
                <p className="text-[11px] text-amber-800 font-medium">
                  {testPushStatus}
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={async () => {
                  if (!settings) return;
                  await fetch("/api/admin/settings", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "x-admin-token": adminToken,
                    },
                    body: JSON.stringify(settings),
                  });
                  alert("Configuración guardada correctamente");
                  fetchAdminData(adminToken);
                }}
                className="py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer active:scale-95 shadow-xs shadow-purple-200"
              >
                Guardar Configuración
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (confirm("¿Restaurar los datos oficiales del concurso y bases oficiales?")) {
                    await fetch("/api/admin/settings", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        "x-admin-token": adminToken,
                      },
                      body: JSON.stringify({ reset: true }),
                    });
                    alert("Datos oficiales restaurados");
                    fetchAdminData(adminToken);
                  }
                }}
                className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs border border-slate-200 flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <RefreshCw className="w-3 h-3 text-slate-500" />
                <span>Restaurar Datos Oficiales</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
