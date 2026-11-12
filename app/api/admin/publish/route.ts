import { NextRequest, NextResponse } from "next/server";
import { getContestState, saveContestState } from "@/lib/storage";
import { calculateRanking } from "@/lib/ranking";
import { verifyAdminToken, secureCompare } from "@/lib/security";

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

    state.settings.isResultsPublished = true;
    await saveContestState(state);

    const fullRanking = calculateRanking(state);

    const climbers = fullRanking.filter((s) => s.rankChange > 0);
    const droppers = fullRanking.filter((s) => s.rankChange < 0);
    const steady = fullRanking.filter((s) => s.rankChange === 0);

    return NextResponse.json({
      success: true,
      message: `¡Resultados de la Semana ${state.settings.currentWeek} publicados oficialmente!`,
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
