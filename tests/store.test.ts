import { describe, it, expect } from "vitest";
import { dbStore } from "../lib/db/store";

describe("Data Store Operations & Integration", () => {
  it("should list pre-seeded habits with accurate details", () => {
    const habits = dbStore.getAllHabitsWithDetails();
    expect(habits.length).toBeGreaterThanOrEqual(5);

    const workout = habits.find((h) => h.id === "hab-1");
    expect(workout).toBeDefined();
    expect(workout?.title).toBe("Morning 20-Min Workout");
    expect(workout?.streakInfo).toBeDefined();
  });

  it("should record entries and update daily recorded value", () => {
    const todayStr = "2026-11-22";
    // Check initial water value
    const waterBefore = dbStore.getHabitWithDetails("hab-3", todayStr);
    const prevValue = waterBefore?.todayRecordedValue || 0;

    // Record an entry
    dbStore.recordEntry("hab-3", 2, todayStr, "Drank 2 glasses after lunch");

    const waterAfter = dbStore.getHabitWithDetails("hab-3", todayStr);
    expect(waterAfter?.todayRecordedValue).toBe(prevValue + 2);
  });

  it("should set and clear day overrides without corrupting streaks", () => {
    const todayStr = "2026-11-22";

    // Set skip override
    dbStore.setOverride("hab-2", "skipped", todayStr, "Rest day");
    const habitSkipped = dbStore.getHabitWithDetails("hab-2", todayStr);
    expect(habitSkipped?.todayStatus).toBe("skipped");

    // Clear override
    dbStore.clearOverride("hab-2", todayStr);
    const habitCleared = dbStore.getHabitWithDetails("hab-2", todayStr);
    expect(habitCleared?.todayStatus).not.toBe("skipped");
  });

  it("should update goal progress and track milestone completion", () => {
    const goals = dbStore.getGoals();
    expect(goals.length).toBeGreaterThan(0);
    const goal = goals[0];

    const prevVal = goal.current_value;
    const updated = dbStore.updateGoalProgress(goal.id, 2);
    expect(updated?.current_value).toBe(prevVal + 2);
  });

  it("should export CSV and JSON formatted records", () => {
    const csv = dbStore.exportCSV();
    expect(csv).toContain("Entry ID");
    expect(csv).toContain("Habit ID");

    const json = dbStore.exportJSON() as any;
    expect(json.exported_at).toBeDefined();
    expect(Array.isArray(json.habits)).toBe(true);
    expect(Array.isArray(json.entries)).toBe(true);
  });
});
