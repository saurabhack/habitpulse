import { Habit, HabitSchedule, HabitEntry, HabitDayOverride, HabitStreakInfo } from "@/types";
import { isHabitScheduledForDate, isHabitCompleted } from "./scheduler";
import { format, subDays, parseISO, isBefore, isAfter, startOfDay, differenceInDays } from "date-fns";

export function calculateHabitStreaks(
  habit: Habit,
  schedules: HabitSchedule[],
  entries: HabitEntry[],
  overrides: HabitDayOverride[],
  todayStr: string = format(new Date(), "yyyy-MM-dd")
): HabitStreakInfo {
  // Aggregate entries by date
  const valueByDate = new Map<string, number>();
  for (const entry of entries) {
    if (entry.habit_id === habit.id) {
      const prev = valueByDate.get(entry.local_date) || 0;
      valueByDate.set(entry.local_date, prev + Number(entry.recorded_value));
    }
  }

  // Aggregate overrides by date
  const overrideByDate = new Map<string, string>();
  for (const ov of overrides) {
    if (ov.habit_id === habit.id) {
      overrideByDate.set(ov.local_date, ov.status);
    }
  }

  const startDate = startOfDay(parseISO(habit.start_date));
  const today = startOfDay(parseISO(todayStr));

  // If start date is in the future
  if (isAfter(startDate, today)) {
    return {
      currentStreak: 0,
      bestStreak: 0,
      habitStrength: 0,
      totalCompletions: 0,
      totalScheduled: 0,
      totalSkipped: 0,
      completionRate: 0,
    };
  }

  const totalDays = differenceInDays(today, startDate) + 1;
  let totalScheduled = 0;
  let totalCompletions = 0;
  let totalSkipped = 0;

  // Track daily completion array from start date to today
  interface DayRecord {
    dateStr: string;
    isScheduled: boolean;
    isSkipped: boolean;
    isCompleted: boolean;
  }

  const chronologicalRecords: DayRecord[] = [];

  for (let i = totalDays - 1; i >= 0; i--) {
    const d = subDays(today, i);
    const dateStr = format(d, "yyyy-MM-dd");

    const isScheduled = isHabitScheduledForDate(habit, schedules, dateStr);
    const isSkipped = overrideByDate.get(dateStr) === "skipped" || overrideByDate.get(dateStr) === "vacation";
    const recordedVal = valueByDate.get(dateStr) || 0;

    const { completed } = isHabitCompleted(habit, recordedVal, isScheduled, isSkipped);

    if (isScheduled && !isSkipped) {
      totalScheduled++;
      if (completed) {
        totalCompletions++;
      }
    } else if (isSkipped) {
      totalSkipped++;
    }

    chronologicalRecords.push({
      dateStr,
      isScheduled,
      isSkipped,
      isCompleted: completed,
    });
  }

  // Calculate best streak across all chronological records
  let bestStreak = 0;
  let tempStreak = 0;

  for (const rec of chronologicalRecords) {
    if (!rec.isScheduled) {
      continue; // Unscheduled days don't break streak
    }
    if (rec.isSkipped) {
      continue; // Skipped days don't break streak
    }
    if (rec.isCompleted) {
      tempStreak++;
      if (tempStreak > bestStreak) {
        bestStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
    }
  }

  // Calculate current streak backwards from today
  let currentStreak = 0;
  let hasBroken = false;

  // Check today first
  const todayRec = chronologicalRecords[chronologicalRecords.length - 1];
  let startIndex = chronologicalRecords.length - 1;

  if (todayRec) {
    if (todayRec.isScheduled && !todayRec.isSkipped) {
      if (todayRec.isCompleted) {
        currentStreak++;
        startIndex = chronologicalRecords.length - 2;
      } else {
        // Today is scheduled but not completed yet; check if today is still ongoing
        // If yesterday was completed, current streak stays active until end of today!
        startIndex = chronologicalRecords.length - 2;
      }
    } else {
      // Not scheduled today or skipped today; streak continues from yesterday
      startIndex = chronologicalRecords.length - 2;
    }
  }

  for (let i = startIndex; i >= 0; i--) {
    const rec = chronologicalRecords[i];
    if (!rec.isScheduled || rec.isSkipped) {
      continue; // Maintains continuity
    }
    if (rec.isCompleted) {
      currentStreak++;
    } else {
      hasBroken = true;
      break;
    }
  }

  // Update bestStreak if currentStreak is higher
  if (currentStreak > bestStreak) {
    bestStreak = currentStreak;
  }

  // Loop-inspired Habit Strength Score calculation (0 to 100)
  // S_t = S_{t-1} * alpha + (1 - alpha) * V_t (where alpha = 0.95)
  let strength = 0;
  const alpha = 0.95;

  for (const rec of chronologicalRecords) {
    if (!rec.isScheduled) {
      continue;
    }
    if (rec.isSkipped) {
      // Very slight damping on skipped days to maintain score
      strength = strength * 0.99;
      continue;
    }
    const val = rec.isCompleted ? 1.0 : 0.0;
    strength = strength * alpha + (1.0 - alpha) * val;
  }

  const habitStrength = Math.min(100, Math.round(strength * 100));

  const completionRate = totalScheduled > 0
    ? Math.round((totalCompletions / totalScheduled) * 100)
    : 0;

  return {
    currentStreak,
    bestStreak,
    habitStrength,
    totalCompletions,
    totalScheduled,
    totalSkipped,
    completionRate,
  };
}
