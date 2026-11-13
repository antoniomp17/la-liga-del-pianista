import { NextResponse } from "next/server";
import { getContestState } from "@/lib/storage";

export async function GET() {
  try {
    const state = await getContestState();
    return NextResponse.json({
      success: true,
      data: {
        title: state.settings.title,
        subtitle: state.settings.subtitle,
        currentWeek: state.settings.currentWeek,
        totalWeeks: state.settings.totalWeeks,
        isResultsPublished: state.settings.isResultsPublished,
      },
    });
  } catch (error: any) {
    if (error?.digest === "NEXT_PRERENDER_INTERRUPTED") {
      throw error;
    }
    return NextResponse.json(
      { error: "Error al obtener información pública del concurso." },
      { status: 500 }
    );
  }
}
