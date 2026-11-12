import { NextRequest, NextResponse } from "next/server";
import { getContestState, resetContestState, saveContestState } from "@/lib/storage";
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
    const { title, subtitle, adminPin, currentWeek, totalWeeks, tests, reset } = body;

    if (reset) {
      const fresh = await resetContestState();
      return NextResponse.json({
        success: true,
        message: "Datos restaurados al estado oficial.",
        settings: fresh.settings,
      });
    }

    if (title) state.settings.title = title.trim();
    if (subtitle) state.settings.subtitle = subtitle.trim();
    if (adminPin) state.settings.adminPin = adminPin.trim();
    if (currentWeek) state.settings.currentWeek = Number(currentWeek);
    if (totalWeeks) state.settings.totalWeeks = Number(totalWeeks);
    if (Array.isArray(tests)) state.settings.tests = tests;

    await saveContestState(state);

    return NextResponse.json({
      success: true,
      message: "Configuración actualizada con éxito.",
      settings: state.settings,
    });
  } catch (error) {
    console.error("Error al actualizar configuración:", error);
    return NextResponse.json(
      { error: "Error al actualizar la configuración." },
      { status: 500 }
    );
  }
}
