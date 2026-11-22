import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/db/store";
import { z } from "zod";

export const dynamic = "force-dynamic";

const createJournalSchema = z.object({
  entry_date: z.string(),
  content: z.string().min(1),
  mood: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]).optional(),
  habit_id: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
});

export async function GET() {
  try {
    const entries = dbStore.getJournalEntries();
    return NextResponse.json({ success: true, data: entries });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = createJournalSchema.parse(body);

    const entry = dbStore.createJournalEntry(validated);
    return NextResponse.json({ success: true, data: entry }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
