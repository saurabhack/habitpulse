import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/db/store";
import { supabaseLogin } from "@/lib/supabase/service";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    // Optional Supabase Auth attempt
    await supabaseLogin(email, password);

    const result = dbStore.authenticateUser(email, password);
    return NextResponse.json({
      success: true,
      data: {
        user: { id: result.user.id, email: result.user.email },
        profile: result.profile,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 401 });
  }
}
