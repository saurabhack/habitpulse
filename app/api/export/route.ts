import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/db/store";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "json";

    if (format === "csv") {
      const csvData = dbStore.exportCSV();
      return new NextResponse(csvData, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="habitpulse-export-${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    const jsonData = dbStore.exportJSON();
    return new NextResponse(JSON.stringify(jsonData, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="habitpulse-backup-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
