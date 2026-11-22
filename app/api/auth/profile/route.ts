import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/db/store";
import { z } from "zod";

export const dynamic = "force-dynamic";

const updateProfileSchema = z.object({
  display_name: z.string().min(1).optional(),
  avatar_url: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  timezone: z.string().optional(),
});

export async function GET() {
  try {
    const profile = dbStore.getProfile();
    return NextResponse.json({ success: true, data: profile });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = updateProfileSchema.parse(body);

    const updated = dbStore.updateProfile(undefined, validated);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
