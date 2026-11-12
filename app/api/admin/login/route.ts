import { NextRequest, NextResponse } from "next/server";
import { getContestState } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminPin } = body;

    const state = await getContestState();

    if (!adminPin || adminPin.trim() !== state.settings.adminPin) {
      return NextResponse.json(
        { error: "PIN de profesora incorrecto." },
        { status: 401 }
      );
    }

    // Retornamos éxito (el cliente almacena la sesión o token)
    return NextResponse.json({
      success: true,
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
