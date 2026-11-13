"use client";

import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { Sparkles, TrendingUp, TrendingDown, Bell, CheckCircle2, X, Smartphone } from "lucide-react";
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

    // Detectar si ya tenía permiso concedido o si es iOS
    if (typeof window !== "undefined") {
      if ("Notification" in window && Notification.permission === "granted") {
        setPushStatus("granted");
      }
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
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
        alert(
          "📱 En iPhone: Para recibir avisos automáticos, primero pulsa el botón Compartir en Safari (icono de la flecha hacia arriba) y selecciona 'Añadir a pantalla de inicio'."
        );
      } else {
        alert("Tu navegador no admite notificaciones push automáticas.");
      }
      return;
    }

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

          // Enviar la suscripción al servidor para que el profesor pueda alertar a todos los alumnos con 1 clic
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

      // Feedback local inmediato
      try {
        new Notification("🎹 La Liga del Pianista", {
          body: `¡Avisos automáticos activados para ${name}! Te avisaremos cada vez que se publiquen nuevas notas.`,
          icon: "/favicon.ico",
        });
      } catch {}
    } catch {
      setPushStatus("denied");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm sm:max-w-md max-h-[90dvh] overflow-y-auto bg-slate-900 border border-slate-700/80 rounded-3xl p-4 sm:p-6 shadow-2xl text-slate-100">
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

        {/* Sección de Notificaciones Push Web */}
        <div className="mt-3 p-3 sm:p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <h4 className="text-xs font-bold text-slate-200">
              Avisos automáticos al móvil
            </h4>
          </div>
          <p className="text-[11px] text-slate-400 leading-snug">
            Activa los avisos para que tu teléfono te notifique automáticamente en cuanto la profesora publique nuevas notas.
          </p>

          {isIOSWithoutPWA && (
            <div className="p-2 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-[10px] text-indigo-300 flex items-start gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                <strong>Tip para iPhone:</strong> Pulsa Compartir en Safari ➔ <em>"Añadir a pantalla de inicio"</em> para recibir avisos incluso con la app cerrada.
              </span>
            </div>
          )}

          {pushStatus === "granted" ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold pt-1">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>¡Notificaciones push activadas en este dispositivo!</span>
            </div>
          ) : (
            <button
              onClick={handleRequestPush}
              className="w-full mt-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-amber-300 border border-amber-500/30 hover:border-amber-400 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Bell className="w-3.5 h-3.5 shrink-0" />
              <span>Activar Notificaciones en mi Pantalla</span>
            </button>
          )}
        </div>

        {/* Botón Aceptar */}
        <button
          onClick={onClose}
          className="w-full mt-4 py-2.5 sm:py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
        >
          ¡Entendido, ver clasificación!
        </button>
      </div>
    </div>
  );
};
