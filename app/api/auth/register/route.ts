import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/db/store";
import { supabaseRegister } from "@/lib/supabase/service";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  displayName: z.string().min(1, "Display name is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, displayName } = registerSchema.parse(body);

    // 1. Sync to Supabase Auth & PostgreSQL
    const supaResult = await supabaseRegister(email, password, displayName);

    // 2. Sync to local session & store
    const result = dbStore.registerUser(email, password, displayName, supaResult?.user?.id);
    return NextResponse.json({
      success: true,
      data: {
        user: { id: result.user.id, email: result.user.email },
        profile: result.profile,
        supabaseConnected: supaResult.success,
      },
    }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
