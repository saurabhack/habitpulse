import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/db/store";
import { computeAnalyticsSummary, generateHeatmapData } from "@/lib/engine/analytics";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || undefined;

    const habits = dbStore.getAllHabitsWithDetails(undefined, date);
    const summary = computeAnalyticsSummary(habits, 30, date);
    const heatmap = generateHeatmapData(habits, 84, date);

    return NextResponse.json({
      success: true,
      data: {
        summary,
        heatmap,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
