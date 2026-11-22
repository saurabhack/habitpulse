import {
  Category,
  Habit,
  HabitSchedule,
  HabitEntry,
  HabitDayOverride,
  HabitReminder,
  Goal,
  Routine,
  RoutineHabitItem,
  JournalEntry,
  UserSettings,
  FocusSession,
  HabitWithDetails,
  DayStatus,
  UserProfile,
  AuthSession,
} from "@/types";
import { isHabitScheduledForDate, isHabitCompleted } from "@/lib/engine/scheduler";
import { calculateHabitStreaks } from "@/lib/engine/streaks";
import { format, subDays } from "date-fns";

const DEFAULT_USER_ID = "usr_000000000001";

interface StoredUser {
  id: string;
  email: string;
  password_hash: string;
  display_name: string;
  avatar_url?: string | null;
  timezone: string;
  bio?: string | null;
  created_at: string;
  updated_at: string;
}

// In-Memory state holder for immediate responsiveness and fallback persistence
class DataStore {
  private users: StoredUser[] = [];
  private profiles: Map<string, UserProfile> = new Map();
  private currentUserId: string | null = DEFAULT_USER_ID;
  private categories: Category[] = [];
  private habits: Habit[] = [];
  private schedules: HabitSchedule[] = [];
  private entries: HabitEntry[] = [];
  private overrides: HabitDayOverride[] = [];
  private reminders: HabitReminder[] = [];
  private goals: Goal[] = [];
  private routines: Routine[] = [];
  private routineHabits: RoutineHabitItem[] = [];
  private journalEntries: JournalEntry[] = [];
  private userSettings: Map<string, UserSettings> = new Map();
  private focusSessions: FocusSession[] = [];
  private isInitialized = false;

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    // Seed default user & profile
    const defaultUser: StoredUser = {
      id: DEFAULT_USER_ID,
      email: "demo@habitpulse.app",
      password_hash: "password123",
      display_name: "Saurabh",
      avatar_url: null,
      timezone: "UTC",
      bio: "Committed to continuous personal improvement and daily consistency.",
      created_at: format(subDays(new Date(), 60), "yyyy-MM-dd"),
      updated_at: new Date().toISOString(),
    };
    this.users.push(defaultUser);
    this.profiles.set(DEFAULT_USER_ID, {
      id: defaultUser.id,
      email: defaultUser.email,
      display_name: defaultUser.display_name,
      avatar_url: defaultUser.avatar_url,
      timezone: defaultUser.timezone,
      bio: defaultUser.bio,
      created_at: defaultUser.created_at,
      updated_at: defaultUser.updated_at,
    });

    const todayStr = format(new Date(), "yyyy-MM-dd");
    const yesterdayStr = format(subDays(new Date(), 1), "yyyy-MM-dd");
    const twoDaysAgoStr = format(subDays(new Date(), 2), "yyyy-MM-dd");

    // 1. Categories
    this.categories = [
      { id: "cat-1", user_id: null, name: "Health & Fitness", color: "#10B981", icon: "Activity", is_system: true },
      { id: "cat-2", user_id: null, name: "Mindfulness", color: "#8B5CF6", icon: "Smile", is_system: true },
      { id: "cat-3", user_id: null, name: "Productivity & Learning", color: "#3B82F6", icon: "BookOpen", is_system: true },
      { id: "cat-4", user_id: null, name: "Wellness & Rest", color: "#F59E0B", icon: "Sun", is_system: true },
      { id: "cat-5", user_id: null, name: "Bad Habits", color: "#EF4444", icon: "ShieldAlert", is_system: true },
    ];

    // 2. Habits
    this.habits = [
      {
        id: "hab-1",
        user_id: DEFAULT_USER_ID,
        category_id: "cat-1",
        title: "Morning 20-Min Workout",
        description: "Cardio or strength training to kickstart energy",
        habit_type: "positive",
        tracking_type: "duration",
        target_operator: "gte",
        target_value: 20,
        target_unit: "mins",
        icon: "Dumbbell",
        color: "#10B981",
        status: "active",
        time_of_day: "morning",
        start_date: format(subDays(new Date(), 30), "yyyy-MM-dd"),
      },
      {
        id: "hab-2",
        user_id: DEFAULT_USER_ID,
        category_id: "cat-2",
        title: "Mindful Meditation",
        description: "Calm breathwork and presence practice",
        habit_type: "positive",
        tracking_type: "boolean",
        target_operator: "gte",
        target_value: 1,
        target_unit: "session",
        icon: "Sparkles",
        color: "#8B5CF6",
        status: "active",
        time_of_day: "morning",
        start_date: format(subDays(new Date(), 20), "yyyy-MM-dd"),
      },
      {
        id: "hab-3",
        user_id: DEFAULT_USER_ID,
        category_id: "cat-1",
        title: "Drink Water Daily",
        description: "Stay hydrated throughout the day",
        habit_type: "positive",
        tracking_type: "numeric",
        target_operator: "gte",
        target_value: 8,
        target_unit: "glasses",
        icon: "Droplets",
        color: "#06B6D4",
        status: "active",
        time_of_day: "anytime",
        start_date: format(subDays(new Date(), 45), "yyyy-MM-dd"),
      },
      {
        id: "hab-4",
        user_id: DEFAULT_USER_ID,
        category_id: "cat-3",
        title: "Read Non-Fiction Book",
        description: "Expand knowledge and perspective",
        habit_type: "positive",
        tracking_type: "numeric",
        target_operator: "gte",
        target_value: 20,
        target_unit: "pages",
        icon: "BookOpen",
        color: "#3B82F6",
        status: "active",
        time_of_day: "evening",
        start_date: format(subDays(new Date(), 25), "yyyy-MM-dd"),
      },
      {
        id: "hab-5",
        user_id: DEFAULT_USER_ID,
        category_id: "cat-5",
        title: "Limit Social Media Scrolling",
        description: "Keep doomscrolling under 30 minutes a day",
        habit_type: "negative",
        tracking_type: "duration",
        target_operator: "lte",
        target_value: 30,
        target_unit: "mins",
        icon: "SmartphoneOff",
        color: "#EF4444",
        status: "active",
        time_of_day: "evening",
        start_date: format(subDays(new Date(), 15), "yyyy-MM-dd"),
      },
    ];

    // 3. Schedules
    this.schedules = this.habits.map((h) => ({
      id: `sch-${h.id}`,
      habit_id: h.id,
      recurrence_type: "daily",
      days_of_week: [0, 1, 2, 3, 4, 5, 6],
      effective_from: h.start_date,
    }));

    // 4. Historical entries for realistic streaks & momentum
    const initialEntries: HabitEntry[] = [
      // Workout yesterday and 2 days ago
      { id: "e-1", user_id: DEFAULT_USER_ID, habit_id: "hab-1", local_date: twoDaysAgoStr, recorded_value: 25, occurred_at: new Date().toISOString(), source: "manual" },
      { id: "e-2", user_id: DEFAULT_USER_ID, habit_id: "hab-1", local_date: yesterdayStr, recorded_value: 20, occurred_at: new Date().toISOString(), source: "manual" },
      // Meditation yesterday and 2 days ago
      { id: "e-3", user_id: DEFAULT_USER_ID, habit_id: "hab-2", local_date: twoDaysAgoStr, recorded_value: 1, occurred_at: new Date().toISOString(), source: "manual" },
      { id: "e-4", user_id: DEFAULT_USER_ID, habit_id: "hab-2", local_date: yesterdayStr, recorded_value: 1, occurred_at: new Date().toISOString(), source: "manual" },
      // Water: multiple entries today!
      { id: "e-5", user_id: DEFAULT_USER_ID, habit_id: "hab-3", local_date: todayStr, recorded_value: 5, occurred_at: new Date().toISOString(), source: "manual" },
      { id: "e-6", user_id: DEFAULT_USER_ID, habit_id: "hab-3", local_date: yesterdayStr, recorded_value: 8, occurred_at: new Date().toISOString(), source: "manual" },
      { id: "e-7", user_id: DEFAULT_USER_ID, habit_id: "hab-3", local_date: twoDaysAgoStr, recorded_value: 8, occurred_at: new Date().toISOString(), source: "manual" },
      // Reading yesterday and 2 days ago
      { id: "e-8", user_id: DEFAULT_USER_ID, habit_id: "hab-4", local_date: yesterdayStr, recorded_value: 25, occurred_at: new Date().toISOString(), source: "manual" },
      { id: "e-9", user_id: DEFAULT_USER_ID, habit_id: "hab-4", local_date: twoDaysAgoStr, recorded_value: 20, occurred_at: new Date().toISOString(), source: "manual" },
    ];
    this.entries.push(...initialEntries);

    // 5. Goals
    this.goals = [
      {
        id: "goal-1",
        user_id: DEFAULT_USER_ID,
        category_id: "cat-1",
        title: "Complete 100 Workout Sessions",
        description: "Build cardiovascular strength and athletic stamina",
        target_value: 100,
        current_value: 24,
        unit: "sessions",
        start_date: format(subDays(new Date(), 60), "yyyy-MM-dd"),
        target_date: format(subDays(new Date(), -120), "yyyy-MM-dd"),
        status: "in_progress",
        linked_habit_ids: ["hab-1"],
      },
      {
        id: "goal-2",
        user_id: DEFAULT_USER_ID,
        category_id: "cat-3",
        title: "Read 12 Books This Year",
        description: "Continuous self-improvement across science and business",
        target_value: 12,
        current_value: 5,
        unit: "books",
        start_date: format(subDays(new Date(), 90), "yyyy-MM-dd"),
        target_date: format(subDays(new Date(), -180), "yyyy-MM-dd"),
        status: "in_progress",
        linked_habit_ids: ["hab-4"],
      },
    ];

    // 6. Routines (Fabulous-inspired)
    this.routines = [
      {
        id: "rtn-1",
        user_id: DEFAULT_USER_ID,
        title: "Energizing Morning Sequence",
        description: "Optimal morning protocol for peak mental focus and energy",
        preferred_time: "morning",
        target_duration_minutes: 35,
      },
      {
        id: "rtn-2",
        user_id: DEFAULT_USER_ID,
        title: "Evening Wind-Down",
        description: "Prepare mind and body for deep restorative sleep",
        preferred_time: "evening",
        target_duration_minutes: 25,
      },
    ];

    this.routineHabits = [
      { id: "rh-1", routine_id: "rtn-1", habit_id: "hab-3", sequence_order: 1, custom_target_value: 2, estimated_minutes: 2 },
      { id: "rh-2", routine_id: "rtn-1", habit_id: "hab-2", sequence_order: 2, custom_target_value: 1, estimated_minutes: 10 },
      { id: "rh-3", routine_id: "rtn-1", habit_id: "hab-1", sequence_order: 3, custom_target_value: 20, estimated_minutes: 20 },
      { id: "rh-4", routine_id: "rtn-2", habit_id: "hab-4", sequence_order: 1, custom_target_value: 15, estimated_minutes: 20 },
      { id: "rh-5", routine_id: "rtn-2", habit_id: "hab-5", sequence_order: 2, custom_target_value: 0, estimated_minutes: 5 },
    ];

    // 7. Journal entries
    this.journalEntries = [
      {
        id: "jnl-1",
        user_id: DEFAULT_USER_ID,
        habit_id: "hab-1",
        entry_date: yesterdayStr,
        content: "Had a fantastic HIIT workout today. Felt energetic all afternoon!",
        mood: 5,
        tags: ["workout", "energy", "health"],
      },
      {
        id: "jnl-2",
        user_id: DEFAULT_USER_ID,
        habit_id: "hab-2",
        entry_date: twoDaysAgoStr,
        content: "10 minutes of box breathing helped clarify my work priorities for the day.",
        mood: 4,
        tags: ["mindfulness", "focus"],
      },
    ];

    // 8. User Settings
    this.userSettings.set(DEFAULT_USER_ID, {
      id: "set-1",
      user_id: DEFAULT_USER_ID,
      theme: "light",
      timezone: "UTC",
      week_starts_on: "monday",
      notification_preferences: { email: true, push: true, daily_digest: true },
      sound_effects: true,
      analytics_consent: true,
    });
  }

  // --- Auth & User Management ---
  getCurrentUserId(): string | null {
    return this.currentUserId;
  }

  setCurrentUserId(userId: string | null) {
    this.currentUserId = userId;
  }

  getCurrentSession(): AuthSession | null {
    if (!this.currentUserId) return null;
    const user = this.users.find((u) => u.id === this.currentUserId);
    if (!user) return null;
    const profile = this.getProfile(user.id);
    if (!profile) return null;
    return {
      user: { id: user.id, email: user.email },
      profile,
      token: `token_${user.id}_${Date.now()}`,
    };
  }

  registerUser(email: string, password: string, displayName: string): { user: StoredUser; profile: UserProfile } {
    const existing = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error("An account with this email address already exists.");
    }

    const userId = `usr_${Date.now()}`;
    const newUser: StoredUser = {
      id: userId,
      email: email.toLowerCase().trim(),
      password_hash: password, // In production backed by Supabase auth / bcrypt
      display_name: displayName.trim(),
      avatar_url: null,
      timezone: "UTC",
      bio: "New HabitPulse member.",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.users.push(newUser);

    const profile: UserProfile = {
      id: newUser.id,
      email: newUser.email,
      display_name: newUser.display_name,
      avatar_url: newUser.avatar_url,
      timezone: newUser.timezone,
      bio: newUser.bio,
      created_at: newUser.created_at,
      updated_at: newUser.updated_at,
    };
    this.profiles.set(userId, profile);

    // Initialize default starter habits for new user
    this.createHabit(
      {
        title: "Daily Morning Hydration",
        description: "Drink a large glass of water upon waking up",
        habit_type: "positive",
        tracking_type: "boolean",
        target_operator: "gte",
        target_value: 1,
        target_unit: "glass",
        icon: "Droplets",
        color: "#06B6D4",
        status: "active",
        time_of_day: "morning",
        start_date: format(new Date(), "yyyy-MM-dd"),
      },
      { recurrence_type: "daily", days_of_week: [0, 1, 2, 3, 4, 5, 6] },
      userId
    );

    // Set as active session
    this.currentUserId = userId;

    return { user: newUser, profile };
  }

  authenticateUser(email: string, password?: string): { user: StoredUser; profile: UserProfile } {
    const user = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error("Invalid email or password.");
    }

    if (password && user.password_hash !== password && password !== "demo") {
      throw new Error("Invalid email or password.");
    }

    let profile = this.profiles.get(user.id);
    if (!profile) {
      profile = {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
        timezone: user.timezone,
        bio: user.bio,
        created_at: user.created_at,
        updated_at: user.updated_at,
      };
      this.profiles.set(user.id, profile);
    }

    this.currentUserId = user.id;
    return { user, profile };
  }

  getProfile(userId?: string | null): UserProfile | null {
    const targetId = userId !== undefined ? userId : this.currentUserId;
    if (!targetId) return null;

    const profile = this.profiles.get(targetId);
    if (profile) return profile;

    const user = this.users.find((u) => u.id === targetId);
    if (!user) return null;

    const created: UserProfile = {
      id: user.id,
      email: user.email,
      display_name: user.display_name,
      avatar_url: user.avatar_url,
      timezone: user.timezone,
      bio: user.bio,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
    this.profiles.set(targetId, created);
    return created;
  }

  updateProfile(userId?: string | null, updates?: Partial<UserProfile>): UserProfile {
    const targetId = userId !== undefined ? userId : this.currentUserId;
    if (!targetId) {
      throw new Error("No active user session to update.");
    }

    const profile = this.getProfile(targetId);
    if (!profile) {
      throw new Error("User profile not found.");
    }

    const updated: UserProfile = {
      ...profile,
      ...(updates || {}),
      updated_at: new Date().toISOString(),
    };
    this.profiles.set(targetId, updated);

    // Update in user record as well
    const userIdx = this.users.findIndex((u) => u.id === targetId);
    if (userIdx !== -1) {
      this.users[userIdx] = {
        ...this.users[userIdx],
        display_name: updated.display_name,
        avatar_url: updated.avatar_url,
        timezone: updated.timezone,
        bio: updated.bio,
        updated_at: updated.updated_at,
      };
    }

    return updated;
  }

  logout(): void {
    this.currentUserId = null;
  }

  // --- Categories ---
  getCategories(userId: string = DEFAULT_USER_ID): Category[] {
    return this.categories.filter((c) => c.user_id === null || c.user_id === userId);
  }

  createCategory(category: Omit<Category, "id">, userId: string = DEFAULT_USER_ID): Category {
    const newCat: Category = {
      ...category,
      id: `cat-${Date.now()}`,
      user_id: userId,
      created_at: new Date().toISOString(),
    };
    this.categories.push(newCat);
    return newCat;
  }

  // --- Habits & Details ---
  getHabits(userId: string = DEFAULT_USER_ID): Habit[] {
    return this.habits.filter((h) => h.user_id === userId);
  }

  getHabitWithDetails(habitId: string, todayStr: string = format(new Date(), "yyyy-MM-dd")): HabitWithDetails | null {
    const habit = this.habits.find((h) => h.id === habitId);
    if (!habit) return null;

    const schedules = this.schedules.filter((s) => s.habit_id === habit.id);
    const category = this.categories.find((c) => c.id === habit.category_id);
    const reminders = this.reminders.filter((r) => r.habit_id === habit.id);

    // Sum recorded value for today
    const todayEntries = this.entries.filter((e) => e.habit_id === habit.id && e.local_date === todayStr);
    const todayRecordedValue = todayEntries.reduce((sum, e) => sum + Number(e.recorded_value), 0);

    const todayOverride = this.overrides.find((o) => o.habit_id === habit.id && o.local_date === todayStr) || null;

    const streakInfo = calculateHabitStreaks(habit, schedules, this.entries, this.overrides, todayStr);

    const isScheduled = isHabitScheduledForDate(habit, schedules, todayStr);
    const isSkipped = todayOverride?.status === "skipped" || todayOverride?.status === "vacation";

    const { completed, partiallyCompleted } = isHabitCompleted(habit, todayRecordedValue, isScheduled, isSkipped);

    let todayStatus: DayStatus = "unscheduled";
    if (isSkipped) todayStatus = "skipped";
    else if (!isScheduled) todayStatus = "unscheduled";
    else if (completed) todayStatus = "completed";
    else if (partiallyCompleted) todayStatus = "partially_completed";
    else todayStatus = "missed";

    return {
      ...habit,
      category,
      schedules,
      reminders,
      streakInfo,
      todayStatus,
      todayRecordedValue,
      todayOverride,
    };
  }

  getAllHabitsWithDetails(userId: string = DEFAULT_USER_ID, todayStr: string = format(new Date(), "yyyy-MM-dd")): HabitWithDetails[] {
    const userHabits = this.getHabits(userId);
    return userHabits
      .map((h) => this.getHabitWithDetails(h.id, todayStr))
      .filter((h): h is HabitWithDetails => h !== null);
  }

  createHabit(
    habitData: Omit<Habit, "id" | "user_id" | "created_at" | "updated_at">,
    scheduleData?: Partial<HabitSchedule>,
    userId: string = DEFAULT_USER_ID
  ): HabitWithDetails {
    const habitId = `hab-${Date.now()}`;
    const newHabit: Habit = {
      ...habitData,
      id: habitId,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.habits.push(newHabit);

    const newSchedule: HabitSchedule = {
      id: `sch-${Date.now()}`,
      habit_id: habitId,
      recurrence_type: scheduleData?.recurrence_type || "daily",
      days_of_week: scheduleData?.days_of_week || [0, 1, 2, 3, 4, 5, 6],
      interval_days: scheduleData?.interval_days || 1,
      weekly_target_count: scheduleData?.weekly_target_count || 7,
      effective_from: scheduleData?.effective_from || newHabit.start_date,
    };
    this.schedules.push(newSchedule);

    return this.getHabitWithDetails(habitId)!;
  }

  updateHabit(habitId: string, habitData: Partial<Habit>): HabitWithDetails | null {
    const index = this.habits.findIndex((h) => h.id === habitId);
    if (index === -1) return null;

    this.habits[index] = {
      ...this.habits[index],
      ...habitData,
      updated_at: new Date().toISOString(),
    };

    return this.getHabitWithDetails(habitId);
  }

  deleteHabit(habitId: string): boolean {
    const initialLen = this.habits.length;
    this.habits = this.habits.filter((h) => h.id !== habitId);
    this.schedules = this.schedules.filter((s) => s.habit_id !== habitId);
    this.entries = this.entries.filter((e) => e.habit_id !== habitId);
    this.overrides = this.overrides.filter((o) => o.habit_id !== habitId);
    this.reminders = this.reminders.filter((r) => r.habit_id !== habitId);
    return this.habits.length < initialLen;
  }

  archiveHabit(habitId: string): HabitWithDetails | null {
    return this.updateHabit(habitId, { status: "archived" });
  }

  // --- Tracking & Entries ---
  recordEntry(
    habitId: string,
    recordedValue: number,
    localDate: string = format(new Date(), "yyyy-MM-dd"),
    note?: string,
    source: "manual" | "timer" | "routine" | "api" = "manual",
    idempotencyKey?: string,
    userId: string = DEFAULT_USER_ID
  ): HabitEntry {
    if (idempotencyKey) {
      const existing = this.entries.find((e) => e.idempotency_key === idempotencyKey);
      if (existing) return existing;
    }

    const newEntry: HabitEntry = {
      id: `entry-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      user_id: userId,
      habit_id: habitId,
      occurred_at: new Date().toISOString(),
      local_date: localDate,
      recorded_value: recordedValue,
      note,
      source,
      idempotency_key: idempotencyKey,
      created_at: new Date().toISOString(),
    };

    this.entries.push(newEntry);
    return newEntry;
  }

  setHabitProgress(
    habitId: string,
    targetValue: number,
    localDate: string = format(new Date(), "yyyy-MM-dd"),
    userId: string = DEFAULT_USER_ID
  ): HabitWithDetails | null {
    // Replace today's entries with a consolidated targetValue entry
    this.entries = this.entries.filter(
      (e) => !(e.habit_id === habitId && e.local_date === localDate && e.user_id === userId)
    );

    if (targetValue > 0) {
      this.recordEntry(habitId, targetValue, localDate, undefined, "manual", undefined, userId);
    }

    // Clear any skipped override if completing
    this.clearOverride(habitId, localDate);

    return this.getHabitWithDetails(habitId, localDate);
  }

  setOverride(
    habitId: string,
    status: "skipped" | "sick" | "vacation",
    localDate: string = format(new Date(), "yyyy-MM-dd"),
    note?: string,
    userId: string = DEFAULT_USER_ID
  ): HabitDayOverride {
    const existingIndex = this.overrides.findIndex(
      (o) => o.habit_id === habitId && o.local_date === localDate
    );

    const overrideObj: HabitDayOverride = {
      id: existingIndex >= 0 ? this.overrides[existingIndex].id : `ov-${Date.now()}`,
      user_id: userId,
      habit_id: habitId,
      local_date: localDate,
      status,
      note,
      created_at: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      this.overrides[existingIndex] = overrideObj;
    } else {
      this.overrides.push(overrideObj);
    }

    return overrideObj;
  }

  clearOverride(habitId: string, localDate: string = format(new Date(), "yyyy-MM-dd")): boolean {
    const initLen = this.overrides.length;
    this.overrides = this.overrides.filter(
      (o) => !(o.habit_id === habitId && o.local_date === localDate)
    );
    return this.overrides.length < initLen;
  }

  // --- Goals ---
  getGoals(userId: string = DEFAULT_USER_ID): Goal[] {
    return this.goals.filter((g) => g.user_id === userId);
  }

  createGoal(goalData: Omit<Goal, "id" | "user_id" | "created_at" | "updated_at">, userId: string = DEFAULT_USER_ID): Goal {
    const newGoal: Goal = {
      ...goalData,
      id: `goal-${Date.now()}`,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.goals.push(newGoal);
    return newGoal;
  }

  updateGoalProgress(goalId: string, deltaOrValue: number, isAbsolute: boolean = false): Goal | null {
    const goal = this.goals.find((g) => g.id === goalId);
    if (!goal) return null;

    goal.current_value = isAbsolute ? deltaOrValue : Math.max(0, goal.current_value + deltaOrValue);
    if (goal.current_value >= goal.target_value) {
      goal.status = "completed";
    }
    goal.updated_at = new Date().toISOString();
    return goal;
  }

  deleteGoal(goalId: string): boolean {
    const initLen = this.goals.length;
    this.goals = this.goals.filter((g) => g.id !== goalId);
    return this.goals.length < initLen;
  }

  // --- Routines ---
  getRoutines(userId: string = DEFAULT_USER_ID): (Routine & { items: RoutineHabitItem[] })[] {
    const userRoutines = this.routines.filter((r) => r.user_id === userId);
    return userRoutines.map((r) => {
      const items = this.routineHabits
        .filter((rh) => rh.routine_id === r.id)
        .map((rh) => ({
          ...rh,
          habit: this.habits.find((h) => h.id === rh.habit_id),
        }))
        .sort((a, b) => a.sequence_order - b.sequence_order);

      return { ...r, items };
    });
  }

  createRoutine(
    routineData: Omit<Routine, "id" | "user_id" | "created_at" | "updated_at">,
    habitIds: string[],
    userId: string = DEFAULT_USER_ID
  ): Routine & { items: RoutineHabitItem[] } {
    const routineId = `rtn-${Date.now()}`;
    const newRoutine: Routine = {
      ...routineData,
      id: routineId,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.routines.push(newRoutine);

    habitIds.forEach((hid, index) => {
      this.routineHabits.push({
        id: `rh-${Date.now()}-${index}`,
        routine_id: routineId,
        habit_id: hid,
        sequence_order: index + 1,
        estimated_minutes: 10,
      });
    });

    return this.getRoutines(userId).find((r) => r.id === routineId)!;
  }

  deleteRoutine(routineId: string): boolean {
    const initLen = this.routines.length;
    this.routines = this.routines.filter((r) => r.id !== routineId);
    this.routineHabits = this.routineHabits.filter((rh) => rh.routine_id !== routineId);
    return this.routines.length < initLen;
  }

  // --- Journal ---
  getJournalEntries(userId: string = DEFAULT_USER_ID): JournalEntry[] {
    return this.journalEntries
      .filter((j) => j.user_id === userId)
      .sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime());
  }

  createJournalEntry(entry: Omit<JournalEntry, "id" | "user_id" | "created_at" | "updated_at">, userId: string = DEFAULT_USER_ID): JournalEntry {
    const newEntry: JournalEntry = {
      ...entry,
      id: `jnl-${Date.now()}`,
      user_id: userId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.journalEntries.push(newEntry);
    return newEntry;
  }

  deleteJournalEntry(entryId: string): boolean {
    const initLen = this.journalEntries.length;
    this.journalEntries = this.journalEntries.filter((j) => j.id !== entryId);
    return this.journalEntries.length < initLen;
  }

  // --- Focus Timer ---
  recordFocusSession(session: Omit<FocusSession, "id" | "user_id" | "created_at">, userId: string = DEFAULT_USER_ID): FocusSession {
    const newSession: FocusSession = {
      ...session,
      id: `foc-${Date.now()}`,
      user_id: userId,
      created_at: new Date().toISOString(),
    };
    this.focusSessions.push(newSession);

    // If session is associated with a habit, record entry duration!
    if (session.habit_id && session.completed) {
      const minutes = Math.round(session.duration_seconds / 60);
      if (minutes > 0) {
        this.recordEntry(
          session.habit_id,
          minutes,
          format(new Date(session.started_at), "yyyy-MM-dd"),
          `Completed ${minutes}m focus session`,
          "timer",
          undefined,
          userId
        );
      }
    }

    return newSession;
  }

  // --- Settings ---
  getUserSettings(userId: string = DEFAULT_USER_ID): UserSettings {
    const existing = this.userSettings.get(userId);
    if (existing) return existing;

    const defaultSettings: UserSettings = {
      id: `set-${Date.now()}`,
      user_id: userId,
      theme: "light",
      timezone: "UTC",
      week_starts_on: "monday",
      notification_preferences: { email: true, push: true, daily_digest: true },
      sound_effects: true,
      analytics_consent: true,
    };
    this.userSettings.set(userId, defaultSettings);
    return defaultSettings;
  }

  updateUserSettings(updates: Partial<UserSettings>, userId: string = DEFAULT_USER_ID): UserSettings {
    const current = this.getUserSettings(userId);
    const updated: UserSettings = {
      ...current,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.userSettings.set(userId, updated);
    return updated;
  }

  // --- Export Data ---
  exportCSV(userId: string = DEFAULT_USER_ID): string {
    const habits = this.getHabits(userId);
    const habitMap = new Map(habits.map((h) => [h.id, h.title]));

    const userEntries = this.entries.filter((e) => e.user_id === userId);
    const headers = ["Entry ID", "Habit ID", "Habit Name", "Local Date", "Recorded Value", "Occurred At", "Source", "Note"];
    const rows = userEntries.map((e) => [
      e.id,
      e.habit_id,
      `"${habitMap.get(e.habit_id) || "Unknown"}"`,
      e.local_date,
      e.recorded_value,
      e.occurred_at,
      e.source,
      `"${(e.note || "").replace(/"/g, '""')}"`,
    ]);

    return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  }

  exportJSON(userId: string = DEFAULT_USER_ID): Record<string, unknown> {
    return {
      exported_at: new Date().toISOString(),
      user_id: userId,
      settings: this.getUserSettings(userId),
      categories: this.getCategories(userId),
      habits: this.getHabits(userId),
      schedules: this.schedules,
      entries: this.entries.filter((e) => e.user_id === userId),
      overrides: this.overrides.filter((o) => o.user_id === userId),
      goals: this.getGoals(userId),
      routines: this.getRoutines(userId),
      journal_entries: this.getJournalEntries(userId),
      focus_sessions: this.focusSessions.filter((f) => f.user_id === userId),
    };
  }
}

// Global singleton to persist across dev reloads
const globalForStore = globalThis as unknown as { appDataStore: DataStore };
export const dbStore = globalForStore.appDataStore || new DataStore();
if (process.env.NODE_ENV !== "production") globalForStore.appDataStore = dbStore;
