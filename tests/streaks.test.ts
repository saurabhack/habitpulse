import { describe, it, expect } from "vitest";
import { calculateHabitStreaks } from "../lib/engine/streaks";
import { Habit, HabitSchedule, HabitEntry, HabitDayOverride } from "../types";

describe("Streaks & Habit Strength Engine", () => {
  const habit: Habit = {
    id: "h-test",
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
    start_date: "2026-11-15",
  };

  const schedules: HabitSchedule[] = [
    {
      id: "sch-test",
      habit_id: "h-test",
      recurrence_type: "daily",
      days_of_week: [0, 1, 2, 3, 4, 5, 6],
      effective_from: "2026-11-15",
    },
  ];

  it("should calculate correct active streak and best streak", () => {
    // 3 consecutive days completed
    const entries: HabitEntry[] = [
      { id: "1", user_id: "usr-1", habit_id: "h-test", local_date: "2026-11-18", recorded_value: 1, source: "manual", occurred_at: "" },
      { id: "2", user_id: "usr-1", habit_id: "h-test", local_date: "2026-11-19", recorded_value: 1, source: "manual", occurred_at: "" },
      { id: "3", user_id: "usr-1", habit_id: "h-test", local_date: "2026-11-20", recorded_value: 1, source: "manual", occurred_at: "" },
    ];

    const result = calculateHabitStreaks(habit, schedules, entries, [], "2026-11-20");
    expect(result.currentStreak).toBe(3);
    expect(result.bestStreak).toBe(3);
    expect(result.totalCompletions).toBe(3);
  });

  it("should NOT break streak when a day is marked skipped/rest", () => {
    // Completed Nov 18, Skipped Nov 19, Completed Nov 20
    const entries: HabitEntry[] = [
      { id: "1", user_id: "usr-1", habit_id: "h-test", local_date: "2026-11-18", recorded_value: 1, source: "manual", occurred_at: "" },
      { id: "3", user_id: "usr-1", habit_id: "h-test", local_date: "2026-11-20", recorded_value: 1, source: "manual", occurred_at: "" },
    ];

    const overrides: HabitDayOverride[] = [
      { id: "ov-1", user_id: "usr-1", habit_id: "h-test", local_date: "2026-11-19", status: "skipped" },
    ];

    const result = calculateHabitStreaks(habit, schedules, entries, overrides, "2026-11-20");
    // Nov 19 skipped preserves streak!
    expect(result.currentStreak).toBe(2);
    expect(result.totalSkipped).toBe(1);
    expect(result.completionRate).toBe(40); // 2 of 5 scheduled days
  });

  it("should calculate positive Loop Habit Strength score with memory damping", () => {
    const entries: HabitEntry[] = [
      { id: "1", user_id: "usr-1", habit_id: "h-test", local_date: "2026-11-16", recorded_value: 1, source: "manual", occurred_at: "" },
      { id: "2", user_id: "usr-1", habit_id: "h-test", local_date: "2026-11-17", recorded_value: 1, source: "manual", occurred_at: "" },
      { id: "3", user_id: "usr-1", habit_id: "h-test", local_date: "2026-11-18", recorded_value: 1, source: "manual", occurred_at: "" },
      { id: "4", user_id: "usr-1", habit_id: "h-test", local_date: "2026-11-19", recorded_value: 1, source: "manual", occurred_at: "" },
      { id: "5", user_id: "usr-1", habit_id: "h-test", local_date: "2026-11-20", recorded_value: 1, source: "manual", occurred_at: "" },
    ];

    const result = calculateHabitStreaks(habit, schedules, entries, [], "2026-11-20");
    expect(result.habitStrength).toBeGreaterThan(0);
    expect(result.habitStrength).toBeLessThanOrEqual(100);
  });
});
