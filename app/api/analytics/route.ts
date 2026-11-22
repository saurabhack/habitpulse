import { NextRequest, NextResponse } from "next/server";
import { dbStore } from "@/lib/db/store";
import { computeAnalyticsSummary, generateHeatmapData } from "@/lib/engine/analytics";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date") || undefined;

    const currentUserId = dbStore.getCurrentUserId();
    if (!currentUserId) {
      return NextResponse.json({
        success: true,
        data: {
          summary: {
            dailyCompletionRate: 0,
            weeklyCompletionRate: 0,
            monthlyCompletionRate: 0,
            activeHabitsCount: 0,
            totalCompletedToday: 0,
            remainingToday: 0,
            perfectDaysCount: 0,
            bestStreakOverall: 0,
            currentStreakOverall: 0,
            strongestWeekday: "N/A",
            weakestWeekday: "N/A",
            behavioralInsights: [],
          },
          heatmap: [],
        },
      });
    }

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
