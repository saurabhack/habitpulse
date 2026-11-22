import { describe, it, expect } from "vitest";
import { isHabitScheduledForDate, isHabitCompleted } from "../lib/engine/scheduler";
import { Habit, HabitSchedule } from "../types";

describe("Habit Scheduler Engine", () => {
  const baseHabit: Habit = {
    id: "test-h1",
    user_id: "usr-1",
    title: "Read Book",
    habit_type: "positive",
    tracking_type: "numeric",
    target_operator: "gte",
    target_value: 20,
    target_unit: "pages",
    icon: "BookOpen",
    color: "#4F46E5",
    status: "active",
    time_of_day: "evening",
    start_date: "2026-11-01",
    end_date: "2026-11-30",
  };

  it("should schedule daily habit every day within start and end date", () => {
    const dailySchedule: HabitSchedule[] = [
      {
        id: "sch-1",
        habit_id: "test-h1",
        recurrence_type: "daily",
        days_of_week: [0, 1, 2, 3, 4, 5, 6],
        effective_from: "2026-11-01",
      },
    ];

    expect(isHabitScheduledForDate(baseHabit, dailySchedule, "2026-11-15")).toBe(true);
    // Before start date
    expect(isHabitScheduledForDate(baseHabit, dailySchedule, "2026-10-31")).toBe(false);
    // After end date
    expect(isHabitScheduledForDate(baseHabit, dailySchedule, "2026-12-01")).toBe(false);
  });

  it("should correctly handle weekday recurrence (Mon-Fri only)", () => {
    const weekdaySchedule: HabitSchedule[] = [
      {
        id: "sch-2",
        habit_id: "test-h1",
        recurrence_type: "weekdays",
        days_of_week: [1, 2, 3, 4, 5],
        effective_from: "2026-11-01",
      },
    ];

    // 2026-11-20 is a Friday -> scheduled
    expect(isHabitScheduledForDate(baseHabit, weekdaySchedule, "2026-11-20")).toBe(true);
    // 2026-11-21 is a Saturday -> not scheduled
    expect(isHabitScheduledForDate(baseHabit, weekdaySchedule, "2026-11-21")).toBe(false);
    // 2026-11-22 is a Sunday -> not scheduled
    expect(isHabitScheduledForDate(baseHabit, weekdaySchedule, "2026-11-22")).toBe(false);
    // 2026-11-23 is a Monday -> scheduled
    expect(isHabitScheduledForDate(baseHabit, weekdaySchedule, "2026-11-23")).toBe(true);
  });

  it("should correctly evaluate habit completion status", () => {
    // Exact target reached
    const result1 = isHabitCompleted(baseHabit, 20, true, false);
    expect(result1.completed).toBe(true);
    expect(result1.isMissed).toBe(false);

    // Exceeded target
    const result2 = isHabitCompleted(baseHabit, 35, true, false);
    expect(result2.completed).toBe(true);

    // Partially completed
    const result3 = isHabitCompleted(baseHabit, 10, true, false);
    expect(result3.completed).toBe(false);
    expect(result3.partiallyCompleted).toBe(true);
    expect(result3.isMissed).toBe(true);

    // Skipped day must not count as missed
    const result4 = isHabitCompleted(baseHabit, 0, true, true);
    expect(result4.completed).toBe(false);
    expect(result4.isMissed).toBe(false);
  });
});
