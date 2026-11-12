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
  Lock,
  LogOut,
  RefreshCw,
  Search,
  CheckCircle2,
  Trash2,
  Calendar,
  Sparkles,
} from "lucide-react";
import { ContestSettings, Student, TestDefinition } from "@/types/contest";
import { FullRankedStudent } from "@/lib/ranking";
import { OFFICIAL_CALENDAR } from "@/lib/contestData";

interface AdminDashboardProps {
  onLogout: () => void;
  onOpenRules?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, onOpenRules }) => {
  const [adminPin, setAdminPin] = useState("");
  const [adminToken, setAdminToken] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Datos del concurso
  const [settings, setSettings] = useState<ContestSettings | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [fullRanking, setFullRanking] = useState<FullRankedStudent[]>([]);
  const [activeTab, setActiveTab] = useState<"ranking" | "scores" | "students" | "settings">("scores");

  // Estado para la carga semanal
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [weeklyScoresInput, setWeeklyScoresInput] = useState<{
    [studentId: string]: { [testId: string]: number | string };
  }>({});
  const [saveSuccessMessage, setSaveSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Estado para nuevo alumno
  const [newStudent, setNewStudent] = useState({
    name: "",
    pin: "",
    avatar: "🎹",
    phone: "",
    level: "Intermedio",
  });

  useEffect(() => {
    const savedToken = sessionStorage.getItem("admin_token");
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
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

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
        headers: { "x-admin-token": adminToken },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      alert(`🎉 ${data.message}\nSubieron: ${data.summary.climbersCount} alumnos\nBajaron: ${data.summary.droppersCount} alumnos\nSe mantuvieron: ${data.summary.steadyCount}`);
      await fetchAdminData(adminToken);
    } catch (err: unknown) {
      const error = err as Error;
      alert("Error: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.pin) {
      alert("Introduce nombre y PIN del alumno.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify(newStudent),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setNewStudent({ name: "", pin: "", avatar: "🎹", phone: "", level: "Intermedio" });
      alert("Alumno añadido correctamente");
      await fetchAdminData(adminToken);
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message);
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
      `🏆 Posición: Puesto #${student.rank} (de 28 alumnos)\n` +
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

  const handleLogoutAdmin = () => {
    sessionStorage.removeItem("admin_token");
    setIsAuthenticated(false);
    setAdminPin("");
    setAdminToken("");
    onLogout();
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-4 sm:my-12 p-4 sm:p-8 bg-slate-900/95 rounded-3xl border border-slate-800 shadow-2xl text-slate-100">
        <div className="text-center mb-5">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-2.5 shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white">Panel de Profesora</h2>
          <p className="text-xs text-slate-400 mt-1">
            Gestión de las 27 semanas, obras, técnica y retos rotativos.
          </p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Contraseña / PIN Maestro
            </label>
            <input
              type="password"
              value={adminPin}
              onChange={(e) => setAdminPin(e.target.value)}
              placeholder="Introduce tu PIN maestro"
              className="w-full text-center text-xl font-mono tracking-wider py-3 px-4 bg-slate-950 rounded-xl border border-slate-700 text-indigo-300 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {loginError && (
            <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs text-center font-medium">
              {loginError}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !adminPin.trim()}
            className="w-full py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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

  const filteredRanking = fullRanking.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.pin.includes(searchTerm)
  );

  return (
    <div className="max-w-6xl mx-auto my-3 sm:my-6 px-2 sm:px-4 text-slate-100">
      {/* Barra superior de pestañas del panel */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-2 sm:p-3 mb-4 sm:mb-6 shadow-xl flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
          <button
            onClick={() => setActiveTab("scores")}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "scores"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Carga de Notas Semanales</span>
            <span className="sm:hidden">Notas</span>
          </button>

          <button
            onClick={() => setActiveTab("ranking")}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "ranking"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Clasificación ({students.length})</span>
            <span className="sm:hidden">Ranking</span>
          </button>

          <button
            onClick={() => setActiveTab("students")}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "students"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Alumnos ({students.length})</span>
            <span className="sm:hidden">Alumnos</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "settings"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                : "text-slate-300 hover:bg-slate-800"
            }`}
          >
            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Configuración</span>
            <span className="sm:hidden">Ajustes</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {onOpenRules && (
            <button
              onClick={onOpenRules}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-xs text-amber-300 hover:bg-amber-500/25 transition-colors"
            >
              <span>📜 Bases PDF</span>
            </button>
          )}

          <button
            onClick={handleLogoutAdmin}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 border border-slate-700 text-xs text-slate-400 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Salir</span>
          </button>
        </div>
      </div>

      {/* PESTAÑA 1: CARGA SEMANAL DE NOTAS */}
      {activeTab === "scores" && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-400" />
                <h3 className="text-xl font-black text-white">
                  Semana {selectedWeek}: {currentCalInfo?.dates || "Fechas oficiales"}
                </h3>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    isOddWeek
                      ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                      : "bg-cyan-500/15 text-cyan-300 border-cyan-500/30"
                  }`}
                >
                  {isOddWeek ? "🥁 Reto Activo: Ritmo (4 ejers • Máx 4 pts)" : "🎼 Reto Activo: Claves (4 líneas • Máx 2 pts)"}
                </span>
                <span className="text-xs text-slate-400">
                  + Obras (Factor ×2) + Técnica (Máx 2 pts)
                </span>
              </div>
            </div>

            {/* Selector de Semanas 1 a 27 */}
            <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
              <span className="text-xs font-semibold text-slate-400 px-1">Semana:</span>
              <select
                value={selectedWeek}
                onChange={(e) => handleWeekChange(Number(e.target.value))}
                className="bg-slate-900 text-amber-300 font-mono text-xs font-bold py-1 px-3 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
              >
                {OFFICIAL_CALENDAR.map((cal) => (
                  <option key={cal.weekNumber} value={cal.weekNumber}>
                    Semana {cal.weekNumber} ({cal.dates}) - {cal.challengeType === "ritmo" ? "🥁 Ritmo" : "🎼 Claves"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Confirmación al guardar */}
          {saveSuccessMessage && (
            <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5" />
              <span>{saveSuccessMessage}</span>
            </div>
          )}

          {/* Tabla de entrada de notas de los 28 alumnos */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950 text-xs text-slate-300 uppercase tracking-wider border-b border-slate-800 sticky top-0 z-10">
                  <tr>
                    <th className="py-3 px-4">Alumno (28)</th>
                    <th className="py-3 px-2 text-center">Nivel</th>
                    <th className="py-3 px-3 text-center text-rose-300">
                      🎼 Obras (Factor ×2)
                    </th>
                    <th className="py-3 px-3 text-center text-emerald-300">
                      🛠️ Técnica (Máx 2)
                    </th>
                    <th
                      className={`py-3 px-3 text-center ${
                        isOddWeek ? "text-amber-300 bg-amber-500/10 font-bold" : "text-slate-500"
                      }`}
                    >
                      🥁 Ritmo (Máx 4)
                    </th>
                    <th
                      className={`py-3 px-3 text-center ${
                        !isOddWeek ? "text-cyan-300 bg-cyan-500/10 font-bold" : "text-slate-500"
                      }`}
                    >
                      🎼 Claves (Máx 2)
                    </th>
                    <th className="py-3 px-4 text-center font-bold text-amber-400">Total Sem.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {students.map((student) => {
                    const rowScores = weeklyScoresInput[student.id] || {};
                    const sObras = Number(rowScores["obras"]) || 0;
                    const sTec = Number(rowScores["tecnica"]) || 0;
                    const sRitmo = Number(rowScores["ritmo"]) || 0;
                    const sNotas = Number(rowScores["notas"]) || 0;
                    const weekTotal = sObras + sTec + sRitmo + sNotas;

                    return (
                      <tr key={student.id} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-4 font-medium flex items-center gap-2">
                          <span className="text-base">{student.avatar}</span>
                          <span className="text-slate-100 truncate max-w-[150px]">{student.name}</span>
                          <span className="text-[10px] text-slate-500 font-mono">PIN:{student.pin}</span>
                        </td>
                        <td className="py-2.5 px-2 text-center text-[10px] text-slate-400">
                          {student.level || "Intermedio"}
                        </td>
                        {/* Obras */}
                        <td className="py-2 px-2 text-center">
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
                            className="w-16 text-center py-1.5 px-1 bg-slate-950 rounded-lg border border-slate-700 text-rose-300 font-mono text-sm focus:ring-1 focus:ring-rose-500"
                          />
                        </td>
                        {/* Técnica */}
                        <td className="py-2 px-2 text-center">
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
                            className="w-14 text-center py-1.5 px-1 bg-slate-950 rounded-lg border border-slate-700 text-emerald-300 font-mono text-sm focus:ring-1 focus:ring-emerald-500"
                          />
                        </td>
                        {/* Ritmo */}
                        <td className={`py-2 px-2 text-center ${isOddWeek ? "bg-amber-500/5" : "opacity-60"}`}>
                          <input
                            type="number"
                            min="0"
                            max="4"
                            value={rowScores["ritmo"] ?? ""}
                            onChange={(e) => {
                              const val = e.target.value === "" ? "" : Number(e.target.value);
                              setWeeklyScoresInput((prev) => ({
                                ...prev,
                                [student.id]: { ...prev[student.id], ritmo: val },
                              }));
                            }}
                            placeholder={isOddWeek ? "0" : "-"}
                            className="w-14 text-center py-1.5 px-1 bg-slate-950 rounded-lg border border-slate-700 text-amber-300 font-mono text-sm focus:ring-1 focus:ring-amber-500"
                          />
                        </td>
                        {/* Claves */}
                        <td className={`py-2 px-2 text-center ${!isOddWeek ? "bg-cyan-500/5" : "opacity-60"}`}>
                          <input
                            type="number"
                            min="0"
                            max="2"
                            step="0.5"
                            value={rowScores["notas"] ?? ""}
                            onChange={(e) => {
                              const val = e.target.value === "" ? "" : Number(e.target.value);
                              setWeeklyScoresInput((prev) => ({
                                ...prev,
                                [student.id]: { ...prev[student.id], notas: val },
                              }));
                            }}
                            placeholder={!isOddWeek ? "0" : "-"}
                            className="w-14 text-center py-1.5 px-1 bg-slate-950 rounded-lg border border-slate-700 text-cyan-300 font-mono text-sm focus:ring-1 focus:ring-cyan-500"
                          />
                        </td>
                        <td className="py-2.5 px-4 text-center font-mono font-bold text-amber-400">
                          {weekTotal} pts
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Acciones */}
            <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs text-slate-400">
                Semana oficial en curso: <strong>Semana {settings?.currentWeek}</strong> · Total: 28 alumnos
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveScores}
                  disabled={isLoading}
                  className="py-2.5 px-5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Notas Semana {selectedWeek}</span>
                </button>

                <button
                  onClick={handlePublishWeek}
                  disabled={isLoading}
                  className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>Publicar Resultados Oficiales</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: CLASIFICACIÓN COMPLETA */}
      {activeTab === "ranking" && (
        <div className="space-y-4">
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                Clasificación General Oficial (28 Alumnos)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                La profesora ve el 100% de los 28 puestos y puede enviar aviso personalizado a cada alumno en WhatsApp.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar alumno o PIN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-950 rounded-xl border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800 sticky top-0 z-10">
                  <tr>
                    <th className="py-3 px-4">Puesto</th>
                    <th className="py-3 px-4">Alumno</th>
                    <th className="py-3 px-3 text-center">PIN</th>
                    <th className="py-3 px-3 text-center">Tendencia</th>
                    <th className="py-3 px-4 text-right">Puntos Totales</th>
                    <th className="py-3 px-4 text-center">Aviso WhatsApp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredRanking.map((student) => {
                    const isTop10 = student.rank <= 10;

                    return (
                      <tr
                        key={student.id}
                        className={`hover:bg-slate-800/40 transition-colors ${
                          isTop10 ? "bg-amber-500/[0.03]" : ""
                        }`}
                      >
                        <td className="py-3 px-4 font-mono font-bold">
                          <span
                            className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs ${
                              student.rank === 1
                                ? "bg-amber-400 text-slate-950 font-black"
                                : student.rank === 2
                                ? "bg-slate-300 text-slate-950 font-black"
                                : student.rank === 3
                                ? "bg-amber-700 text-amber-100 font-black"
                                : isTop10
                                ? "bg-slate-800 text-amber-300 font-bold border border-amber-500/30"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            #{student.rank}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{student.avatar}</span>
                            <div>
                              <p className="font-bold text-slate-100">{student.name}</p>
                              {student.rank > 1 && (
                                <p className="text-[11px] text-slate-400">
                                  A {student.pointsToNextRank} pts del #{student.rank - 1}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-xs text-indigo-300">
                          {student.pin}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {student.rankChange > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                              <TrendingUp className="w-3 h-3" />+{student.rankChange}
                            </span>
                          )}
                          {student.rankChange < 0 && (
                            <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">
                              <TrendingDown className="w-3 h-3" />
                              {student.rankChange}
                            </span>
                          )}
                          {student.rankChange === 0 && (
                            <span className="text-slate-500 text-xs">➖</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-base text-amber-400">
                          {student.totalScore} pts
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => openWhatsApp(student)}
                            title="Enviar actualización por WhatsApp"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-sm cursor-pointer"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
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
        </div>
      )}

      {/* PESTAÑA 3: GESTIÓN DE ALUMNOS */}
      {activeTab === "students" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl h-fit">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <PlusCircle className="w-5 h-5 text-indigo-400" />
              Nuevo Alumno
            </h3>

            <form onSubmit={handleAddStudent} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre</label>
                <input
                  type="text"
                  placeholder="Ej: Laura Gómez"
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                  className="w-full py-2 px-3 bg-slate-950 rounded-xl border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  PIN de Acceso (4 dígitos)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Ej: 1029"
                  value={newStudent.pin}
                  onChange={(e) => setNewStudent({ ...newStudent, pin: e.target.value })}
                  className="w-full py-2 px-3 bg-slate-950 rounded-xl border border-slate-700 text-xs text-amber-300 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nivel de Lectura
                </label>
                <select
                  value={newStudent.level}
                  onChange={(e) => setNewStudent({ ...newStudent, level: e.target.value })}
                  className="w-full py-2 px-3 bg-slate-950 rounded-xl border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Iniciación">Iniciación (20s tiempo límite)</option>
                  <option value="Intermedio">Intermedio (15s tiempo límite)</option>
                  <option value="Avanzado">Avanzado (10s tiempo límite)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Avatar Musical
                </label>
                <div className="flex gap-2 flex-wrap">
                  {["🎹", "🎼", "🎵", "🎶", "🎻", "🎷", "🎺", "🌟", "🔥", "🎀"].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewStudent({ ...newStudent, avatar: emoji })}
                      className={`w-9 h-9 rounded-lg border text-base flex items-center justify-center transition-all ${
                        newStudent.avatar === emoji
                          ? "border-amber-400 bg-amber-500/20"
                          : "border-slate-700 bg-slate-800 hover:bg-slate-700"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Añadir al Concurso
              </button>
            </form>
          </div>

          <div className="md:col-span-2 bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-4">
              Alumnos Registrados ({students.length})
            </h3>

            <div className="divide-y divide-slate-800/80 max-h-[500px] overflow-y-auto pr-1">
              {students.map((st) => (
                <div key={st.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{st.avatar}</span>
                    <div>
                      <p className="font-bold text-sm text-slate-100">{st.name}</p>
                      <p className="text-xs text-slate-400">
                        PIN: <code className="text-amber-400 font-mono">{st.pin}</code> · Nivel: {st.level || "Intermedio"}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteStudent(st.id, st.name)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Eliminar alumno"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PESTAÑA 4: CONFIGURACIÓN */}
      {activeTab === "settings" && (
        <div className="max-w-2xl bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-6">
          <div>
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-400" />
              Configuración de LA LIGA DEL PIANISTA
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Bases oficiales de competición: 27 semanas · 28 alumnos
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Título del Evento
              </label>
              <input
                type="text"
                value={settings?.title || ""}
                onChange={(e) =>
                  setSettings((prev) => (prev ? { ...prev, title: e.target.value } : null))
                }
                className="w-full py-2 px-3 bg-slate-950 rounded-xl border border-slate-700 text-sm text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
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
                className="w-32 py-2 px-3 bg-slate-950 rounded-xl border border-slate-700 text-sm text-amber-300 font-mono"
              />
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
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
                className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
              >
                Guardar Configuración
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (confirm("¿Restaurar los datos oficiales del concurso (28 alumnos y bases oficiales)?")) {
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
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-rose-950/50 text-slate-400 hover:text-rose-300 text-xs flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Restaurar Datos Oficiales</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
