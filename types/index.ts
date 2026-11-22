export type HabitType = "positive" | "negative";
export type TrackingType = "boolean" | "numeric" | "duration";
export type TargetOperator = "gte" | "lte";
export type HabitStatus = "active" | "paused" | "archived";
export type TimeOfDay = "anytime" | "morning" | "afternoon" | "evening";
export type RecurrenceType = "daily" | "weekdays" | "interval" | "weekly_frequency" | "monthly_target";
export type OverrideStatus = "skipped" | "sick" | "vacation";
export type GoalStatus = "in_progress" | "completed" | "abandoned";
export type MoodScore = 1 | 2 | 3 | 4 | 5; // 1: Terrible, 2: Bad, 3: Neutral, 4: Good, 5: Awesome
export type DayStatus = "completed" | "partially_completed" | "missed" | "skipped" | "unscheduled" | "future";

export interface UserProfile {
  id: string;
  email: string;
  display_name: string;
  avatar_url?: string | null;
  timezone: string;
  bio?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthSession {
  user: {
    id: string;
    email: string;
  };
  profile: UserProfile;
  token?: string;
}

export interface UserFeedback {
  id: string;
  user_id: string;
  rating: number; // 1-5
  tags: string[];
  comment: string;
  habit_id?: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  user_id: string | null;
  name: string;
  color: string;
  icon: string;
  is_system: boolean;
  created_at?: string;
}

export interface HabitSchedule {
  id: string;
  habit_id: string;
  recurrence_type: RecurrenceType;
  days_of_week: number[]; // 0 = Sun, 1 = Mon ... 6 = Sat
  interval_days?: number;
  weekly_target_count?: number;
  effective_from: string; // YYYY-MM-DD
  effective_until?: string | null;
  created_at?: string;
}

export interface Habit {
  id: string;
  user_id: string;
  category_id?: string | null;
  title: string;
  description?: string | null;
  habit_type: HabitType;
  tracking_type: TrackingType;
  target_operator: TargetOperator;
  target_value: number;
  target_unit: string;
  icon: string;
  color: string;
  status: HabitStatus;
  time_of_day: TimeOfDay;
  start_date: string; // YYYY-MM-DD
  end_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface HabitEntry {
  id: string;
  user_id: string;
  habit_id: string;
  occurred_at: string;
  local_date: string; // YYYY-MM-DD
  recorded_value: number;
  note?: string | null;
  source: "manual" | "timer" | "routine" | "api";
  idempotency_key?: string | null;
  created_at?: string;
}

export interface HabitDayOverride {
  id: string;
  user_id: string;
  habit_id: string;
  local_date: string; // YYYY-MM-DD
  status: OverrideStatus;
  note?: string | null;
  created_at?: string;
}

export interface HabitReminder {
  id: string;
  habit_id: string;
  reminder_time: string; // HH:mm
  repeat_days: number[];
  timezone: string;
  message: string;
  enabled: boolean;
  created_at?: string;
}

export interface Goal {
  id: string;
  user_id: string;
  category_id?: string | null;
  title: string;
  description?: string | null;
  target_value: number;
  current_value: number;
  unit: string;
  start_date: string;
  target_date: string;
  status: GoalStatus;
  created_at?: string;
  updated_at?: string;
  linked_habit_ids?: string[];
}

export interface Routine {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  preferred_time: "morning" | "afternoon" | "evening";
  target_duration_minutes: number;
  created_at?: string;
  updated_at?: string;
}

export interface RoutineHabitItem {
  id: string;
  routine_id: string;
  habit_id: string;
  sequence_order: number;
  custom_target_value?: number | null;
  estimated_minutes: number;
  habit?: Habit;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  habit_id?: string | null;
  entry_date: string; // YYYY-MM-DD
  content: string;
  mood?: MoodScore | null;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  theme: "light" | "dark" | "system";
  timezone: string;
  week_starts_on: "sunday" | "monday";
  notification_preferences: {
    email: boolean;
    push: boolean;
    daily_digest: boolean;
  };
  sound_effects: boolean;
  analytics_consent: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FocusSession {
  id: string;
  user_id: string;
  habit_id?: string | null;
  duration_seconds: number;
  completed: boolean;
  started_at: string;
  ended_at: string;
  created_at?: string;
}

export interface HabitStreakInfo {
  currentStreak: number;
  bestStreak: number;
  habitStrength: number; // 0 to 100 Loop-style memory score
  totalCompletions: number;
  totalScheduled: number;
  totalSkipped: number;
  completionRate: number; // 0 to 100
}

export interface HabitWithDetails extends Habit {
  category?: Category;
  schedules: HabitSchedule[];
  reminders?: HabitReminder[];
  streakInfo: HabitStreakInfo;
  todayStatus: DayStatus;
  todayRecordedValue: number;
  todayOverride?: HabitDayOverride | null;
}

export interface DayPerformance {
  date: string; // YYYY-MM-DD
  dayOfWeek: number; // 0-6
  scheduledCount: number;
  completedCount: number;
  skippedCount: number;
  completionRate: number;
  status: DayStatus;
}

export interface AnalyticsSummary {
  dailyCompletionRate: number;
  weeklyCompletionRate: number;
  monthlyCompletionRate: number;
  activeHabitsCount: number;
  totalCompletedToday: number;
  remainingToday: number;
  perfectDaysCount: number;
  bestStreakOverall: number;
  currentStreakOverall: number;
  strongestWeekday: string;
  weakestWeekday: string;
  bestPerformingHabit?: { id: string; title: string; rate: number };
  habitDecliningConsistency?: { id: string; title: string; rate: number };
  behavioralInsights: string[];
}
