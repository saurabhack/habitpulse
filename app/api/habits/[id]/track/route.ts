import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/db/store";
import { supabaseRecordEntry } from "@/lib/supabase/service";
import { z } from "zod";

const trackSchema = z.object({
  value: z.number().nonnegative(),
  isAbsolute: z.boolean().default(true), // true: set today's total; false: increment delta
  date: z.string().optional(),
  note: z.string().optional(),
  source: z.enum(["manual", "timer", "routine", "api"]).default("manual"),
  idempotencyKey: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const currentUserId = dbStore.getCurrentUserId();
    const body = await req.json();
    const { value, isAbsolute, date, note, source, idempotencyKey } = trackSchema.parse(body);

    let habit: any;

    if (isAbsolute) {
      habit = dbStore.setHabitProgress(params.id, value, date);
    } else {
      const entry = dbStore.recordEntry(params.id, value, date, note, source, idempotencyKey);
      if (currentUserId && entry) {
        await supabaseRecordEntry(entry, currentUserId);
      }
      habit = dbStore.getHabitWithDetails(params.id, date);
    }

    if (!habit) {
      return NextResponse.json({ success: false, error: "Habit not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: habit });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
