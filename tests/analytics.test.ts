import { describe, it, expect } from "vitest";
import { computeAnalyticsSummary, generateHeatmapData } from "../lib/engine/analytics";
import { HabitWithDetails } from "../types";

describe("Analytics Engine", () => {
  const mockHabits: HabitWithDetails[] = [
    {
      id: "h1",
      user_id: "usr-1",
      title: "Morning Workout",
      habit_type: "positive",
      tracking_type: "duration",
      target_operator: "gte",
      target_value: 20,
      target_unit: "mins",
      icon: "Dumbbell",
      color: "#10B981",
      status: "active",
      time_of_day: "morning",
      start_date: "2026-11-01",
      schedules: [],
      streakInfo: {
        currentStreak: 5,
        bestStreak: 12,
        habitStrength: 85,
        totalCompletions: 20,
        totalScheduled: 22,
        totalSkipped: 1,
        completionRate: 91,
      },
      todayStatus: "completed",
      todayRecordedValue: 20,
    },
    {
      id: "h2",
      user_id: "usr-1",
      title: "Meditation",
      habit_type: "positive",
      tracking_type: "boolean",
      target_operator: "gte",
      target_value: 1,
      target_unit: "session",
      icon: "Sparkles",
      color: "#8B5CF6",
      status: "active",
      time_of_day: "morning",
      start_date: "2026-11-01",
      schedules: [],
      streakInfo: {
        currentStreak: 2,
        bestStreak: 8,
        habitStrength: 60,
        totalCompletions: 12,
        totalScheduled: 22,
        totalSkipped: 0,
        completionRate: 55,
      },
      todayStatus: "missed",
      todayRecordedValue: 0,
    },
  ];

  it("should calculate correct daily completion and streaks across habits", () => {
    const summary = computeAnalyticsSummary(mockHabits, 30, "2026-11-22");

    expect(summary.activeHabitsCount).toBe(2);
    expect(summary.totalCompletedToday).toBe(1);
    expect(summary.remainingToday).toBe(1);
    expect(summary.dailyCompletionRate).toBe(50);
    expect(summary.bestStreakOverall).toBe(12);
    expect(summary.currentStreakOverall).toBe(5);
    expect(summary.behavioralInsights.length).toBeGreaterThan(0);
  });

  it("should generate proper heatmap points for the specified interval", () => {
    const heatmap = generateHeatmapData(mockHabits, 14, "2026-11-22");
    expect(heatmap.length).toBe(14);
    expect(heatmap[heatmap.length - 1].date).toBe("2026-11-22");
  });
});
