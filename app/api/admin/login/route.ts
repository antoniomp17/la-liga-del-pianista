import { NextRequest, NextResponse } from "next/server";
import { getContestState } from "@/lib/storage";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { createAdminToken, secureCompare } from "@/lib/security";

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);

    // Rate Limit: máximo 5 intentos por minuto para la clave maestra
    const rateCheck = checkRateLimit(`admin_${ip}`, 5, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: `Acceso bloqueado temporalmente por demasiados intentos. Espera ${rateCheck.resetInSeconds} segundos.`,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { adminPin } = body;

    const state = await getContestState();

    if (!adminPin || !secureCompare(adminPin.trim(), state.settings.adminPin)) {
      return NextResponse.json(
        { error: "PIN de profesora incorrecto." },
        { status: 401 }
      );
    }

    // Generar un token criptográfico firmado para la sesión de la profesora
    const adminToken = createAdminToken();

    return NextResponse.json({
      success: true,
      token: adminToken,
      message: "Acceso concedido al panel de profesora.",
    });
  } catch (error) {
    console.error("Error en login admin:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
