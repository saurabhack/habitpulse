import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/db/store";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const deleted = dbStore.deleteRoutine(params.id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Routine not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Routine deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
