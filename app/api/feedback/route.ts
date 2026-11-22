import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/db/store";
import { supabaseInsertFeedback } from "@/lib/supabase/service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const feedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  tags: z.array(z.string()).default([]),
  comment: z.string().default(""),
  habit_id: z.string().nullable().optional(),
});

export async function GET() {
  try {
    const hasSubmitted = dbStore.hasSubmittedFeedback();
    return NextResponse.json({ success: true, data: { hasSubmitted } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const currentUserId = dbStore.getCurrentUserId();
    if (!currentUserId) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const { rating, tags, comment, habit_id } = feedbackSchema.parse(body);

    const feedback = dbStore.recordFeedback(rating, tags, comment, habit_id, currentUserId);
    await supabaseInsertFeedback(feedback);
    return NextResponse.json({ success: true, data: feedback }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
