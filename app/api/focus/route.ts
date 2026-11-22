import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/db/store";
import { z } from "zod";

const focusSchema = z.object({
  habit_id: z.string().optional().nullable(),
  duration_seconds: z.number().positive(),
  completed: z.boolean().default(true),
  started_at: z.string(),
  ended_at: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = focusSchema.parse(body);

    const session = dbStore.recordFocusSession(validated);
    return NextResponse.json({ success: true, data: session }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
