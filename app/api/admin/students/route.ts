import { NextRequest, NextResponse } from "next/server";
import { getContestState, saveContestState } from "@/lib/storage";
import { Student } from "@/types/contest";
import { verifyAdminToken, secureCompare } from "@/lib/security";

async function validateAdmin(request: NextRequest) {
  const authHeader = request.headers.get("x-admin-token") || request.headers.get("x-admin-pin");
  const state = await getContestState();
  const isAuthorized =
    verifyAdminToken(authHeader) ||
    (authHeader ? secureCompare(authHeader, state.settings.adminPin) : false);

  if (!isAuthorized) {
    return null;
  }
  return state;
}

export async function POST(request: NextRequest) {
  try {
    const state = await validateAdmin(request);
    if (!state) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const body = await request.json();
    const { name, pin, avatar, phone, level } = body;

    if (!name || !pin) {
      return NextResponse.json(
        { error: "Nombre y PIN son obligatorios." },
        { status: 400 }
      );
    }

    const pinExists = state.students.some((s) => s.pin === pin.trim());
    if (pinExists) {
      return NextResponse.json(
        { error: `El PIN ${pin} ya está asignado a otro alumno.` },
        { status: 400 }
      );
    }

    const id = name.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-" + Math.floor(100 + Math.random() * 900);

    const newStudent: Student = {
      id,
      name: name.trim(),
      pin: pin.trim(),
      avatar: avatar?.trim() || "🎹",
      phone: phone?.trim() || "",
      level: level || "Intermedio",
      scoresByWeek: {},
    };

    state.students.push(newStudent);
    await saveContestState(state);

    return NextResponse.json({
      success: true,
      message: "Alumno añadido con éxito.",
      student: newStudent,
    });
  } catch (error) {
    console.error("Error al crear alumno:", error);
    return NextResponse.json({ error: "Error al crear alumno." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const state = await validateAdmin(request);
    if (!state) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, pin, avatar, phone, level } = body;

    const studentIndex = state.students.findIndex((s) => s.id === id);
    if (studentIndex === -1) {
      return NextResponse.json({ error: "Alumno no encontrado." }, { status: 404 });
    }

    if (pin && pin !== state.students[studentIndex].pin) {
      const pinExists = state.students.some((s) => s.id !== id && s.pin === pin.trim());
      if (pinExists) {
        return NextResponse.json(
          { error: `El PIN ${pin} ya está en uso por otro alumno.` },
          { status: 400 }
        );
      }
    }

    state.students[studentIndex] = {
      ...state.students[studentIndex],
      name: name?.trim() || state.students[studentIndex].name,
      pin: pin?.trim() || state.students[studentIndex].pin,
      avatar: avatar?.trim() || state.students[studentIndex].avatar,
      phone: phone !== undefined ? phone.trim() : state.students[studentIndex].phone,
      level: level || state.students[studentIndex].level,
    };

    await saveContestState(state);

    return NextResponse.json({
      success: true,
      message: "Alumno actualizado correctamente.",
      student: state.students[studentIndex],
    });
  } catch (error) {
    console.error("Error al actualizar alumno:", error);
    return NextResponse.json({ error: "Error al actualizar alumno." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const state = await validateAdmin(request);
    if (!state) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID de alumno requerido." }, { status: 400 });
    }

    const initialLength = state.students.length;
    state.students = state.students.filter((s) => s.id !== id);

    if (state.students.length === initialLength) {
      return NextResponse.json({ error: "Alumno no encontrado." }, { status: 404 });
    }

    await saveContestState(state);

    return NextResponse.json({
      success: true,
      message: "Alumno eliminado correctamente.",
    });
  } catch (error) {
    console.error("Error al eliminar alumno:", error);
    return NextResponse.json({ error: "Error al eliminar alumno." }, { status: 500 });
  }
}
