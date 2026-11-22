import { NextResponse } from "next/server";
import { dbStore } from "@/lib/db/store";

export async function POST() {
  try {
    dbStore.logout();
    return NextResponse.json({ success: true, message: "Logged out successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
