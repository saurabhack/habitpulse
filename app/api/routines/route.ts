import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/db/store";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createRoutineSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  preferred_time: z.enum(["morning", "afternoon", "evening"]).default("morning"),
  target_duration_minutes: z.number().positive().default(30),
  habit_ids: z.array(z.string()),
});

export async function GET() {
  try {
    const routines = dbStore.getRoutines();
    return NextResponse.json({ success: true, data: routines });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { habit_ids, ...routineData } = createRoutineSchema.parse(body);

    const routine = dbStore.createRoutine(routineData, habit_ids);
    return NextResponse.json({ success: true, data: routine }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
