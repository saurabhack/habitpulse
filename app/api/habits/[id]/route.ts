import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/db/store";
import { supabaseUpdateHabit, supabaseDeleteHabit } from "@/lib/supabase/service";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const habit = dbStore.getHabitWithDetails(params.id);
    if (!habit) {
      return NextResponse.json({ success: false, error: "Habit not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: habit });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = dbStore.updateHabit(params.id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Habit not found" }, { status: 404 });
    }
    await supabaseUpdateHabit(params.id, body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const deleted = dbStore.deleteHabit(params.id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Habit not found" }, { status: 404 });
    }
    await supabaseDeleteHabit(params.id);
    return NextResponse.json({ success: true, message: "Habit deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
