import { createClient } from "@supabase/supabase-js";
import { Habit, Goal, Routine, HabitEntry, UserFeedback } from "@/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  !supabaseUrl.includes("placeholder") &&
  !supabaseUrl.includes("your-project") &&
  supabaseAnonKey &&
  !supabaseAnonKey.includes("placeholder")
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Register user in Supabase Auth & public.profiles table
 */
export async function supabaseRegister(email: string, password: string, displayName: string) {
  if (!supabase) return { success: false, error: "Supabase not configured" };

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    });

    if (error) {
      console.warn("Supabase Auth signUp notice:", error.message);
      return { success: false, error: error.message };
    }

    if (data?.user?.id) {
      // Also attempt to write to public.profiles if the table exists
      try {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          email,
          display_name: displayName,
          timezone: "UTC",
        });
      } catch (profileErr: any) {
        console.warn("Could not write to public.profiles table yet:", profileErr.message);
      }
    }

    return { success: true, user: data.user, session: data.session };
  } catch (err: any) {
    console.warn("Supabase auth exception:", err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Log in user via Supabase Auth
 */
export async function supabaseLogin(email: string, password: string) {
  if (!supabase) return { success: false, error: "Supabase not configured" };

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user, session: data.session };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Sync Habit to Supabase public.habits
 */
export async function supabaseInsertHabit(habit: Habit) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from("habits").insert({
      id: habit.id,
      user_id: habit.user_id,
      title: habit.title,
      description: habit.description || null,
      habit_type: habit.habit_type,
      tracking_type: habit.tracking_type,
      target_operator: habit.target_operator,
      target_value: habit.target_value,
      target_unit: habit.target_unit,
      icon: habit.icon,
      color: habit.color,
      status: habit.status,
      time_of_day: habit.time_of_day,
      start_date: habit.start_date,
    });
    if (error) console.warn("Supabase insert habit notice:", error.message);
    return data;
  } catch (err: any) {
    console.warn("Supabase insert habit exception:", err.message);
    return null;
  }
}

export async function supabaseUpdateHabit(habitId: string, updates: Partial<Habit>) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from("habits").update(updates).eq("id", habitId);
    if (error) console.warn("Supabase update habit notice:", error.message);
    return data;
  } catch (err: any) {
    console.warn("Supabase update habit exception:", err.message);
    return null;
  }
}

export async function supabaseDeleteHabit(habitId: string) {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from("habits").delete().eq("id", habitId);
    if (error) console.warn("Supabase delete habit notice:", error.message);
    return !error;
  } catch (err: any) {
    console.warn("Supabase delete habit exception:", err.message);
    return false;
  }
}

/**
 * Sync Daily Check-in to Supabase public.habit_entries
 */
export async function supabaseRecordEntry(entry: HabitEntry, userId: string) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from("habit_entries").upsert({
      id: entry.id,
      habit_id: entry.habit_id,
      user_id: userId,
      entry_date: entry.local_date,
      value: entry.recorded_value,
      is_completed: entry.recorded_value > 0,
      notes: entry.note || null,
    }, { onConflict: "habit_id,entry_date" });
    if (error) console.warn("Supabase record entry notice:", error.message);
    return data;
  } catch (err: any) {
    console.warn("Supabase record entry exception:", err.message);
    return null;
  }
}

/**
 * Sync Goals to Supabase public.goals
 */
export async function supabaseInsertGoal(goal: Goal) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from("goals").insert({
      id: goal.id,
      user_id: goal.user_id,
      title: goal.title,
      description: goal.description || null,
      target_value: goal.target_value,
      current_value: goal.current_value,
      unit: goal.unit,
      status: goal.status,
      deadline: goal.target_date || null,
    });
    if (error) console.warn("Supabase insert goal notice:", error.message);
    return data;
  } catch (err: any) {
    console.warn("Supabase insert goal exception:", err.message);
    return null;
  }
}

export async function supabaseUpdateGoal(goalId: string, updates: Partial<Goal>) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from("goals").update(updates).eq("id", goalId);
    if (error) console.warn("Supabase update goal notice:", error.message);
    return data;
  } catch (err: any) {
    console.warn("Supabase update goal exception:", err.message);
    return null;
  }
}

export async function supabaseDeleteGoal(goalId: string) {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from("goals").delete().eq("id", goalId);
    if (error) console.warn("Supabase delete goal notice:", error.message);
    return !error;
  } catch (err: any) {
    console.warn("Supabase delete goal exception:", err.message);
    return false;
  }
}

/**
 * Sync Routines to Supabase public.routines
 */
export async function supabaseInsertRoutine(routine: Routine) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from("routines").insert({
      id: routine.id,
      user_id: routine.user_id,
      title: routine.title,
      description: routine.description || null,
      time_of_day: routine.preferred_time,
      estimated_duration_minutes: routine.target_duration_minutes,
    });
    if (error) console.warn("Supabase insert routine notice:", error.message);
    return data;
  } catch (err: any) {
    console.warn("Supabase insert routine exception:", err.message);
    return null;
  }
}

export async function supabaseUpdateRoutine(routineId: string, updates: Partial<Routine>) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from("routines").update(updates).eq("id", routineId);
    if (error) console.warn("Supabase update routine notice:", error.message);
    return data;
  } catch (err: any) {
    console.warn("Supabase update routine exception:", err.message);
    return null;
  }
}

export async function supabaseDeleteRoutine(routineId: string) {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from("routines").delete().eq("id", routineId);
    if (error) console.warn("Supabase delete routine notice:", error.message);
    return !error;
  } catch (err: any) {
    console.warn("Supabase delete routine exception:", err.message);
    return false;
  }
}

/**
 * Sync Feedback to Supabase public.user_feedback
 */
export async function supabaseInsertFeedback(feedback: UserFeedback) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from("user_feedback").insert({
      id: feedback.id,
      user_id: feedback.user_id,
      rating: feedback.rating,
      tags: feedback.tags,
      comment: feedback.comment || null,
      habit_id: feedback.habit_id || null,
    });
    if (error) console.warn("Supabase insert feedback notice:", error.message);
    return data;
  } catch (err: any) {
    console.warn("Supabase insert feedback exception:", err.message);
    return null;
  }
}
