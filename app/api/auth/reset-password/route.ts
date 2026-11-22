import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const resetSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = resetSchema.parse(body);

    // In a live Supabase project, calls supabase.auth.resetPasswordForEmail(email)
    // Here we simulate successful password recovery dispatch
    return NextResponse.json({
      success: true,
      message: `Password reset instructions have been dispatched to ${email}. Please check your inbox.`,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
