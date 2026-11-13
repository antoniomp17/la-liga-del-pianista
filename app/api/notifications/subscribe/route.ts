import { NextRequest, NextResponse } from "next/server";
import { saveSubscription } from "@/lib/pushNotifications";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { subscription, studentId, studentName } = body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { error: "Suscripción push no válida." },
        { status: 400 }
      );
    }

    await saveSubscription(subscription, studentId, studentName);

    return NextResponse.json({
      success: true,
      message: "Dispositivo registrado para recibir notificaciones automáticas.",
    });
  } catch (error) {
    console.error("Error al registrar suscripción push:", error);
    return NextResponse.json(
      { error: "Error al procesar la suscripción." },
      { status: 500 }
    );
  }
}
