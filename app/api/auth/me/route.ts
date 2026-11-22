import { NextResponse } from "next/server";
import { dbStore } from "@/lib/db/store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = dbStore.getCurrentSession();
    return NextResponse.json({ success: true, data: session });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
