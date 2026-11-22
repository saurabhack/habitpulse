import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/db/store";
import { supabaseUpdateGoal, supabaseDeleteGoal } from "@/lib/supabase/service";
import { z } from "zod";

const updateGoalSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  target_value: z.number().positive().optional(),
  current_value: z.number().nonnegative().optional(),
  unit: z.string().optional(),
  target_date: z.string().optional(),
  status: z.enum(["not_started", "in_progress", "completed", "abandoned"]).optional(),
  linked_habit_ids: z.array(z.string()).optional(),
  progressDelta: z.number().optional(),
  currentValue: z.number().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const validated = updateGoalSchema.parse(body);

    const { progressDelta, currentValue, ...updates } = validated;

    let updatedGoal;

    // Apply attribute updates if any
    if (Object.keys(updates).length > 0) {
      updatedGoal = dbStore.updateGoal(params.id, updates as any);
    }

    // Apply progress updates if specified
    if (currentValue !== undefined) {
      updatedGoal = dbStore.updateGoalProgress(params.id, currentValue, true);
    } else if (progressDelta !== undefined) {
      updatedGoal = dbStore.updateGoalProgress(params.id, progressDelta, false);
    }

    if (!updatedGoal) {
      return NextResponse.json({ success: false, error: "Goal not found" }, { status: 404 });
    }

    await supabaseUpdateGoal(params.id, updatedGoal);

    return NextResponse.json({ success: true, data: updatedGoal });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const deleted = dbStore.deleteGoal(params.id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Goal not found" }, { status: 404 });
    }
    await supabaseDeleteGoal(params.id);
    return NextResponse.json({ success: true, message: "Goal deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
