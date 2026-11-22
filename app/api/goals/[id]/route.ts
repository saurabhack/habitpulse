import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/db/store";
import { z } from "zod";

const updateGoalSchema = z.object({
  progressDelta: z.number().optional(),
  currentValue: z.number().optional(),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { progressDelta, currentValue } = updateGoalSchema.parse(body);

    let updatedGoal;
    if (currentValue !== undefined) {
      updatedGoal = dbStore.updateGoalProgress(params.id, currentValue, true);
    } else if (progressDelta !== undefined) {
      updatedGoal = dbStore.updateGoalProgress(params.id, progressDelta, false);
    }

    if (!updatedGoal) {
      return NextResponse.json({ success: false, error: "Goal not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updatedGoal });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const deleted = dbStore.deleteGoal(params.id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Goal not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Goal deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
