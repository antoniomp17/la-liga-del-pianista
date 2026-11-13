import { NextRequest, NextResponse } from "next/server";
import { getContestState, saveContestState } from "@/lib/storage";
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

    const body = await request.json();
    const { weekNumber, scores, setAsCurrentWeek } = body;

    if (!weekNumber || typeof scores !== "object") {
      return NextResponse.json(
        { error: "Datos de puntuación incompletos o inválidos." },
        { status: 400 }
      );
    }

    const week = Number(weekNumber);

    for (const student of state.students) {
      if (scores[student.id]) {
        if (!student.scoresByWeek) {
          student.scoresByWeek = {};
        }
        student.scoresByWeek[week] = {
          ...student.scoresByWeek[week],
          ...scores[student.id],
        };
      }
    }

    if (setAsCurrentWeek || week > state.settings.currentWeek) {
      state.settings.currentWeek = week;
    }

    await saveContestState(state);

    return NextResponse.json({
      success: true,
      currentWeek: state.settings.currentWeek,
      message: `Puntuaciones de la Semana ${week} guardadas correctamente.`,
    });
  } catch (error) {
    console.error("Error al guardar puntuaciones:", error);
    return NextResponse.json(
      { error: "Error interno al guardar las puntuaciones." },
      { status: 500 }
    );
  }
}
