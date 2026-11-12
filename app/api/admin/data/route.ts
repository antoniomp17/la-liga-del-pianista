import { NextRequest, NextResponse } from "next/server";
import { getContestState } from "@/lib/storage";
import { calculateRanking } from "@/lib/ranking";
import { verifyAdminToken, secureCompare } from "@/lib/security";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("x-admin-token") || request.headers.get("x-admin-pin");
    const state = await getContestState();

    const isTokenValid = verifyAdminToken(authHeader);
    const isPinValid = authHeader ? secureCompare(authHeader, state.settings.adminPin) : false;

    if (!isTokenValid && !isPinValid) {
      return NextResponse.json(
        { error: "No autorizado. Sesión de profesora inválida o expirada." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const weekParam = searchParams.get("week");
    const targetWeek = weekParam ? parseInt(weekParam, 10) : state.settings.currentWeek;

    const fullRanking = calculateRanking(state, targetWeek);

    return NextResponse.json({
      success: true,
      data: {
        settings: state.settings,
        students: state.students,
        fullRanking,
        targetWeek,
      },
    });
  } catch (error: any) {
    if (error?.digest === "NEXT_PRERENDER_INTERRUPTED") {
      throw error;
    }
    console.error("Error al obtener datos admin:", error);
    return NextResponse.json(
      { error: "Error al cargar la información del concurso." },
      { status: 500 }
    );
  }
}
