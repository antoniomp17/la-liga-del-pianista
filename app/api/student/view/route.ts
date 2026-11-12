import { NextRequest, NextResponse } from "next/server";
import { getContestState } from "@/lib/storage";
import { getStudentLeaderboardView } from "@/lib/ranking";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pin = searchParams.get("pin");
    const id = searchParams.get("id");

    const query = pin || id;
    if (!query) {
      return NextResponse.json(
        { error: "Debes proporcionar un PIN o identificador de alumno." },
        { status: 400 }
      );
    }

    const state = await getContestState();
    const studentView = getStudentLeaderboardView(state, query.trim());

    if (!studentView) {
      return NextResponse.json(
        { error: "No se ha encontrado ningún alumno con ese PIN." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: studentView });
  } catch (error: any) {
    if (error?.digest === "NEXT_PRERENDER_INTERRUPTED") {
      throw error;
    }
    console.error("Error al obtener datos del alumno:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al procesar la clasificación." },
      { status: 500 }
    );
  }
}
