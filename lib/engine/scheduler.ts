import { Habit, HabitSchedule, RecurrenceType } from "@/types";
import { parseISO, getDay, differenceInDays, isBefore, isAfter, startOfDay } from "date-fns";

/**
 * Determines whether a habit is scheduled to be performed on a specific target date.
 */
export function isHabitScheduledForDate(
  habit: Habit,
  schedules: HabitSchedule[],
  dateStr: string // 'YYYY-MM-DD'
): boolean {
  if (habit.status === "archived") return false;

  const targetDate = startOfDay(parseISO(dateStr));
  const startDate = startOfDay(parseISO(habit.start_date));

  // Habit has not started yet
  if (isBefore(targetDate, startDate)) {
    return false;
  }

  // Habit has already ended
  if (habit.end_date) {
    const endDate = startOfDay(parseISO(habit.end_date));
    if (isAfter(targetDate, endDate)) {
      return false;
    }
  }

  // If no specific schedule is defined, default to daily
  if (!schedules || schedules.length === 0) {
    return true;
  }

  // Find effective schedule for this date
  const schedule = schedules.find((s) => {
    const effFrom = startOfDay(parseISO(s.effective_from));
    if (isBefore(targetDate, effFrom)) return false;
    if (s.effective_until) {
      const effUntil = startOfDay(parseISO(s.effective_until));
      if (isAfter(targetDate, effUntil)) return false;
    }
    return true;
  }) || schedules[0];

  const dayOfWeek = getDay(targetDate); // 0 = Sun, 1 = Mon ... 6 = Sat

  switch (schedule.recurrence_type) {
    case "daily":
      return true;

    case "weekdays":
      // Mon (1) to Fri (5)
      return dayOfWeek >= 1 && dayOfWeek <= 5;

    case "interval": {
      const interval = schedule.interval_days || 1;
      const daysDiff = differenceInDays(targetDate, startDate);
      return daysDiff >= 0 && daysDiff % interval === 0;
    }

    case "weekly_frequency":
    case "monthly_target":
    default:
      // If days_of_week is specified, check inclusion
      if (schedule.days_of_week && schedule.days_of_week.length > 0) {
        return schedule.days_of_week.includes(dayOfWeek);
      }
      return true;
  }
}

/**
 * Evaluates whether a habit is met on a given date based on recorded progress and overrides.
 */
export function isHabitCompleted(
  habit: Habit,
  recordedValue: number,
  isScheduled: boolean,
  isSkipped: boolean
): { completed: boolean; partiallyCompleted: boolean; isMissed: boolean } {
  if (isSkipped) {
    return { completed: false, partiallyCompleted: false, isMissed: false };
  }

  if (!isScheduled) {
    return { completed: false, partiallyCompleted: false, isMissed: false };
  }

  const target = habit.target_value;
  const isPositive = habit.habit_type === "positive";

  if (isPositive) {
    if (habit.target_operator === "gte") {
      const completed = recordedValue >= target;
      const partiallyCompleted = !completed && recordedValue > 0;
      return { completed, partiallyCompleted, isMissed: !completed };
    } else {
      const completed = recordedValue <= target && recordedValue > 0;
      return { completed, partiallyCompleted: false, isMissed: !completed };
    }
  } else {
    // Negative habit (e.g., maximum social media time)
    // Completed if value is within target threshold (e.g. <= 30 mins)
    const completed = recordedValue <= target;
    return { completed, partiallyCompleted: false, isMissed: !completed };
  }
}
