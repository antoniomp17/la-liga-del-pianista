import { NextRequest, NextResponse } from "next/server";
import { getContestState } from "@/lib/storage";
import { getStudentLeaderboardView } from "@/lib/ranking";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);

    // Rate Limit: máximo 6 intentos por minuto por IP para evitar ataques de fuerza bruta
    const rateCheck = checkRateLimit(ip, 6, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Demasiados intentos fallidos. Por seguridad, espera ${rateCheck.resetInSeconds} segundos antes de volver a intentarlo.`,
        },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(request.url);
    const pin = searchParams.get("pin");
    const id = searchParams.get("id");

    const query = pin || id;
    if (!query) {
      return NextResponse.json(
        { error: "Debes proporcionar tu PIN de 4 dígitos." },
        { status: 400 }
      );
    }

    const state = await getContestState();
    const studentView = getStudentLeaderboardView(state, query.trim());

    if (!studentView) {
      return NextResponse.json(
        { error: "Código PIN incorrecto o no encontrado." },
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
