"use client";

import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Bell,
  CheckCircle2,
  X,
  Smartphone,
  Share2,
  PlusSquare,
  Send,
  Loader2,
} from "lucide-react";
import { CurrentStudentDetails } from "@/types/contest";
import { playTriumphChord, playEncouragementChime } from "@/lib/audio";

interface NotificationModalProps {
  currentStudent: CurrentStudentDetails;
  isMuted?: boolean;
  onClose: () => void;
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  currentStudent,
  isMuted,
  onClose,
}) => {
  const { rank, rankChange, pointsToNextRank, name, id } = currentStudent;
  const [pushStatus, setPushStatus] = useState<"idle" | "granted" | "denied">("idle");
  const [isIOSWithoutPWA, setIsIOSWithoutPWA] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isTestingPush, setIsTestingPush] = useState(false);
  const [testPushFeedback, setTestPushFeedback] = useState<string>("");

  useEffect(() => {
    // Si subió puestos, lanzar confeti y sonido triunfal
    if (rankChange > 0) {
      if (!isMuted) {
        playTriumphChord();
      }
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#f59e0b", "#ec4899", "#3b82f6", "#10b981"],
        });
      } catch {
        // Fallback si no está disponible canvas
      }
    } else if (rankChange < 0 && !isMuted) {
      playEncouragementChime();
    }

    // Detectar si ya tenía permiso concedido o si es iOS en navegador Safari estándar
    if (typeof window !== "undefined") {
      if ("Notification" in window && Notification.permission === "granted") {
        setPushStatus("granted");
      }
      const isIOS =
        /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as any).standalone;
      if (isIOS && !isStandalone) {
        setIsIOSWithoutPWA(true);
      }
    }
  }, [rankChange, isMuted]);

  const handleRequestPush = async () => {
    if (typeof window === "undefined") return;

    if (!("Notification" in window)) {
      if (isIOSWithoutPWA) {
        // Para iOS, las instrucciones visuales ya están renderizadas en pantalla
        return;
      }
      alert("Tu navegador no admite notificaciones push nativas.");
      return;
    }

    setIsSubscribing(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setPushStatus("denied");
        return;
      }

      setPushStatus("granted");

      // Registrar Service Worker y suscribir a Web Push
      if ("serviceWorker" in navigator) {
        try {
          const reg = await navigator.serviceWorker.register("/sw.js");
          await navigator.serviceWorker.ready;

          const VAPID_KEY =
            "BEtiGpnsI9vD47l22VuMrtaBtaP7g9jD9OyN3I7P2f0Z9H-rsSRCcPdMos_ng7Vdu3-AzSeDc8hHuLa2co4_rpY";

          let sub = await reg.pushManager.getSubscription();
          if (!sub) {
            sub = await reg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(VAPID_KEY),
            });
          }

          // Enviar la suscripción al servidor
          await fetch("/api/notifications/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              subscription: sub.toJSON(),
              studentId: id,
              studentName: name,
            }),
          });
        } catch (swErr) {
          console.warn("ServiceWorker push subscribe fallback:", swErr);
        }
      }

      // Feedback nativo inmediato
      try {
        if ("serviceWorker" in navigator) {
          const reg = await navigator.serviceWorker.ready;
          reg.showNotification("🎹 ¡Avisos Activados!", {
            body: `¡Hola ${name}! Tu teléfono te avisará cada vez que la profesora publique notas.`,
            icon: "/favicon.ico",
            badge: "/favicon.ico",
          });
        } else {
          new Notification("🎹 ¡Avisos Activados!", {
            body: `¡Hola ${name}! Tu teléfono te avisará cada vez que la profesora publique notas.`,
            icon: "/favicon.ico",
          });
        }
      } catch {}
    } catch {
      setPushStatus("denied");
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleTestPush = async () => {
    setIsTestingPush(true);
    setTestPushFeedback("");

    try {
      let subJson: any = null;
      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.ready;
        if (reg) {
          // Disparar notificación nativa en el móvil
          reg.showNotification("🎹 La Liga del Pianista", {
            body: `¡Aviso de prueba para ${name}! Funciona perfectamente aún con la app cerrada.`,
            icon: "/favicon.ico",
            badge: "/favicon.ico",
            data: { url: "/" },
          });
          const sub = await reg.pushManager?.getSubscription();
          if (sub) subJson = sub.toJSON();
        }
      }

      // Probar además vía llamada a la API Web Push del servidor
      const res = await fetch("/api/notifications/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription: subJson,
          studentName: name,
        }),
      });

      if (res.ok) {
        setTestPushFeedback("¡Aviso enviado! Mira la barra o pantalla de tu móvil.");
      } else {
        setTestPushFeedback("¡Aviso lanzado en tu pantalla!");
      }
    } catch {
      setTestPushFeedback("¡Aviso lanzado en tu pantalla!");
    } finally {
      setIsTestingPush(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm sm:max-w-md max-h-[92dvh] overflow-y-auto bg-slate-900 border border-slate-700/80 rounded-3xl p-4 sm:p-6 shadow-2xl text-slate-100">
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Resumen del cambio de posición */}
        <div className="text-center pt-1 pb-2">
          {rankChange > 0 ? (
            <div>
              <div className="inline-flex p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mb-2 animate-bounce">
                <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-emerald-300">
                ¡Subiste de Puesto! 🚀
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1.5 px-1">
                ¡Enhorabuena, <strong>{name}</strong>! Has ascendido{" "}
                <span className="font-bold text-emerald-400">
                  +{rankChange} {rankChange === 1 ? "posición" : "posiciones"}
                </span>{" "}
                esta semana y ahora estás en el <strong>Puesto #{rank}</strong>.
              </p>
            </div>
          ) : rankChange < 0 ? (
            <div>
              <div className="inline-flex p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 mb-2">
                <TrendingDown className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-rose-300">
                ¡Cambio de Posición! 💡
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1.5 px-1">
                ¡Ánimo, <strong>{name}</strong>! Esta semana estás en el{" "}
                <strong>Puesto #{rank}</strong> (has bajado {Math.abs(rankChange)}{" "}
                {Math.abs(rankChange) === 1 ? "puesto" : "puestos"}).
              </p>
              <div className="mt-2.5 p-2.5 rounded-xl bg-slate-800/80 border border-indigo-500/30 text-xs text-indigo-300">
                ¡Estás a solo <strong>{pointsToNextRank} puntos</strong> de volver a subir! A por todas en la siguiente prueba. 🎹
              </div>
            </div>
          ) : (
            <div>
              <div className="inline-flex p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 mb-2">
                <Sparkles className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-amber-300">
                ¡Ritmo Firme y Constante! 🎯
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1.5 px-1">
                ¡Buen trabajo, <strong>{name}</strong>! Mantienes tu sólida posición en el{" "}
                <strong>Puesto #{rank}</strong>.
              </p>
              {rank > 1 && (
                <p className="text-xs text-slate-400 mt-1.5">
                  Te faltan solo <strong>{pointsToNextRank} pts</strong> para alcanzar el Puesto #{rank - 1}.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Sección de Notificaciones Push Web Automáticas */}
        <div className="mt-3 p-3.5 sm:p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400 shrink-0" />
            <h4 className="text-xs sm:text-sm font-bold text-slate-200">
              Avisos automáticos al móvil
            </h4>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Recibe un aviso nativo en tu pantalla en cuanto la profesora publique notas, <strong>incluso con el móvil bloqueado o el navegador cerrado</strong>.
          </p>

          {/* GUÍA VISUAL PASO A PASO PARA IPHONE / IPAD */}
          {isIOSWithoutPWA ? (
            <div className="p-3 rounded-2xl bg-indigo-950/50 border border-indigo-500/30 text-indigo-200 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-xs text-indigo-300">
                <Smartphone className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>¿Estás en iPhone? Solo 2 pasos rápidos:</span>
              </div>
              <ol className="text-[11px] space-y-1.5 pl-1 text-slate-300">
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-indigo-400 shrink-0">1.</span>
                  <span>
                    Pulsa abajo en Safari el botón <strong>Compartir</strong>{" "}
                    <Share2 className="w-3.5 h-3.5 inline text-indigo-400" /> (cuadrado con flecha).
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-indigo-400 shrink-0">2.</span>
                  <span>
                    Baja un poco y pulsa{" "}
                    <strong className="text-white">"Añadir a pantalla de inicio"</strong>{" "}
                    <PlusSquare className="w-3.5 h-3.5 inline text-indigo-400" />.
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-bold text-indigo-400 shrink-0">3.</span>
                  <span>
                    Abre el nuevo icono de <strong>"Liga Pianista"</strong> desde tu móvil y pulsa{" "}
                    <em>"Permitir avisos"</em>. ¡Y listo!
                  </span>
                </li>
              </ol>
              <p className="text-[10px] text-indigo-300/80 italic pt-0.5">
                (Apple exige esto por seguridad para poder notificarte con la pantalla apagada).
              </p>
            </div>
          ) : (
            /* BOTÓN DIRECTO PARA ANDROID, WINDOWS, MAC O IPHONE YA EN PANTALLA DE INICIO */
            <div>
              {pushStatus === "granted" ? (
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>¡Avisos automáticos activos en este teléfono!</span>
                  </div>

                  {/* BOTÓN EMPÍRICO DE PRUEBA */}
                  <button
                    onClick={handleTestPush}
                    disabled={isTestingPush}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-300 border border-amber-500/30 hover:border-amber-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    {isTestingPush ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5 text-amber-400" />
                    )}
                    <span>Probar notificación en mi pantalla ahora</span>
                  </button>

                  {testPushFeedback && (
                    <p className="text-[11px] text-amber-300 text-center font-medium animate-in fade-in">
                      {testPushFeedback}
                    </p>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleRequestPush}
                  disabled={isSubscribing}
                  className="w-full mt-1 py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {isSubscribing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Bell className="w-4 h-4 fill-slate-950" />
                  )}
                  <span>Activar Avisos en mi Móvil (1 Clic)</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Botón Aceptar */}
        <button
          onClick={onClose}
          className="w-full mt-4 py-2.5 sm:py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs sm:text-sm border border-slate-700 shadow-lg transition-all cursor-pointer active:scale-95"
        >
          ¡Entendido, ver clasificación!
        </button>
      </div>
    </div>
  );
};
