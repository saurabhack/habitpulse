import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/db/store";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createHabitSchema = z.object({
  title: z.string().min(1, "Habit title is required"),
  description: z.string().optional(),
  category_id: z.string().optional().nullable(),
  habit_type: z.enum(["positive", "negative"]),
  tracking_type: z.enum(["boolean", "numeric", "duration"]),
  target_operator: z.enum(["gte", "lte"]).default("gte"),
  target_value: z.number().positive(),
  target_unit: z.string(),
  icon: z.string().default("CheckCircle"),
  color: z.string().default("#4F46E5"),
  time_of_day: z.enum(["anytime", "morning", "afternoon", "evening"]).default("anytime"),
  start_date: z.string(),
  end_date: z.string().optional().nullable(),
  schedule: z
    .object({
      recurrence_type: z.enum(["daily", "weekdays", "interval", "weekly_frequency", "monthly_target"]),
      days_of_week: z.array(z.number()).optional(),
      interval_days: z.number().optional(),
      weekly_target_count: z.number().optional(),
    })
    .optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || undefined;
    const habits = dbStore.getAllHabitsWithDetails(undefined, date);
    return NextResponse.json({ success: true, data: habits });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = createHabitSchema.parse(body);

    const { schedule, ...habitData } = validated;

    const created = dbStore.createHabit(
      {
        ...habitData,
        status: "active",
      },
      schedule
    );

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
