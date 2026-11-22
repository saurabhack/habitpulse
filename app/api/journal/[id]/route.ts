import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/db/store";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const deleted = dbStore.deleteJournalEntry(params.id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: "Journal entry not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Journal entry deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
