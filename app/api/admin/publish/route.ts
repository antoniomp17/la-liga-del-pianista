import { NextRequest, NextResponse } from "next/server";
import { getContestState, saveContestState } from "@/lib/storage";
import { calculateRanking } from "@/lib/ranking";
import { verifyAdminToken, secureCompare } from "@/lib/security";
import { sendBroadcastPushNotification } from "@/lib/pushNotifications";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("x-admin-token") || request.headers.get("x-admin-pin");
    const state = await getContestState();

    const isAuthorized =
      verifyAdminToken(authHeader) ||
      (authHeader ? secureCompare(authHeader, state.settings.adminPin) : false);

    if (!isAuthorized) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    let body: any = {};
    try {
      body = await request.json();
    } catch {}

    if (body.targetWeek) {
      const parsedWeek = Number(body.targetWeek);
      if (parsedWeek >= 1 && parsedWeek <= state.settings.totalWeeks) {
        state.settings.currentWeek = parsedWeek;
      }
    }

    state.settings.isResultsPublished = true;
    await saveContestState(state);

    const fullRanking = calculateRanking(state, state.settings.currentWeek);

    const climbers = fullRanking.filter((s) => s.rankChange > 0);
    const droppers = fullRanking.filter((s) => s.rankChange < 0);
    const steady = fullRanking.filter((s) => s.rankChange === 0);

    // Enviar notificación push automática a todos los móviles registrados
    const pushResult = await sendBroadcastPushNotification({
      title: "🎹 ¡Nuevas Notas Publicadas!",
      body: `Semana ${state.settings.currentWeek} publicada. ¡Entra a ver tu nuevo puesto en la Liga!`,
      url: "/",
    }).catch((err) => {
      console.warn("Aviso: Error enviando push notifications:", err);
      return { sent: 0, failed: 0 };
    });

    return NextResponse.json({
      success: true,
      currentWeek: state.settings.currentWeek,
      message: `¡Resultados de la Semana ${state.settings.currentWeek} publicados oficialmente!`,
      pushResult,
      summary: {
        totalStudents: fullRanking.length,
        climbersCount: climbers.length,
        droppersCount: droppers.length,
        steadyCount: steady.length,
      },
    });
  } catch (error) {
    console.error("Error al publicar resultados:", error);
    return NextResponse.json(
      { error: "Error al publicar los resultados." },
      { status: 500 }
    );
  }
}
