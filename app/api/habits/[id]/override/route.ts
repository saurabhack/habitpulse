import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/db/store";
import { z } from "zod";

const overrideSchema = z.object({
  status: z.enum(["skipped", "sick", "vacation", "clear"]),
  date: z.string().optional(),
  note: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { status, date, note } = overrideSchema.parse(body);

    if (status === "clear") {
      dbStore.clearOverride(params.id, date);
    } else {
      dbStore.setOverride(params.id, status, date, note);
    }

    const habit = dbStore.getHabitWithDetails(params.id, date);
    return NextResponse.json({ success: true, data: habit });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
