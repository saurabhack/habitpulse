import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/db/store";
import { z } from "zod";

const updateRoutineSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  preferred_time: z.enum(["morning", "afternoon", "evening"]).optional(),
  target_duration_minutes: z.number().positive().optional(),
  habit_ids: z.array(z.string()).optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const validated = updateRoutineSchema.parse(body);

    const { habit_ids, ...routineData } = validated;

    const updated = dbStore.updateRoutine(params.id, routineData, habit_ids);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Routine not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const deleted = dbStore.deleteRoutine(params.id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Routine not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Routine deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
