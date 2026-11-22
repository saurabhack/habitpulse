import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/db/store";
import { z } from "zod";

const createCategorySchema = z.object({
  name: z.string().min(1),
  color: z.string().default("#4F46E5"),
  icon: z.string().default("Tag"),
});

export async function GET() {
  try {
    const categories = dbStore.getCategories();
    return NextResponse.json({ success: true, data: categories });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = createCategorySchema.parse(body);

    const category = dbStore.createCategory({
      ...validated,
      user_id: null,
      is_system: false,
    });

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
