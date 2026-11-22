import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/db/store";
import { z } from "zod";

const createGoalSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category_id: z.string().optional().nullable(),
  target_value: z.number().positive(),
  current_value: z.number().nonnegative().default(0),
  unit: z.string(),
  start_date: z.string(),
  target_date: z.string(),
  linked_habit_ids: z.array(z.string()).optional(),
});

export async function GET() {
  try {
    const goals = dbStore.getGoals();
    return NextResponse.json({ success: true, data: goals });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = createGoalSchema.parse(body);

    const goal = dbStore.createGoal({
      ...validated,
      status: "in_progress",
    });

    return NextResponse.json({ success: true, data: goal }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
