import { NextRequest, NextResponse } from "next/server";
import { getContestState, saveContestState } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("x-admin-pin");
    const state = await getContestState();

    if (!authHeader || authHeader !== state.settings.adminPin) {
      return NextResponse.json(
        { error: "No autorizado." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { weekNumber, scores } = body;
    // scores is an object: { [studentId: string]: { [testId: string]: number } }

    if (!weekNumber || typeof scores !== "object") {
      return NextResponse.json(
        { error: "Datos de puntuación incompletos o inválidos." },
        { status: 400 }
      );
    }

    const week = Number(weekNumber);

    // Actualizar las puntuaciones en el estado
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

    // Si la semana guardada es superior a la actual, podemos actualizar el currentWeek
    if (week > state.settings.currentWeek) {
      state.settings.currentWeek = week;
    }

    await saveContestState(state);

    return NextResponse.json({
      success: true,
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
