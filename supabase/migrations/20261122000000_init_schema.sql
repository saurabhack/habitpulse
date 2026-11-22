-- ====================================================================
-- HABITPULSE SUPABASE POSTGRESQL SCHEMA INITIALIZATION
-- Full Relational Schema with Row Level Security (RLS), Indexes & Triggers
-- ====================================================================

-- 1. Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Function to update modified timestamps automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- --------------------------------------------------------------------
-- 2. Profiles Table (1-to-1 with auth.users)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    timezone TEXT DEFAULT 'UTC',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------------------
-- 3. Categories Table
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#4F46E5',
    icon TEXT NOT NULL DEFAULT 'Tag',
    is_system BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view system categories or their own"
    ON public.categories FOR SELECT
    USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Users can insert their own categories"
    ON public.categories FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
    ON public.categories FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
    ON public.categories FOR DELETE
    USING (auth.uid() = user_id);

CREATE INDEX idx_categories_user_id ON public.categories(user_id);

-- --------------------------------------------------------------------
-- 4. Habits Table
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    habit_type TEXT NOT NULL CHECK (habit_type IN ('positive', 'negative')),
    tracking_type TEXT NOT NULL CHECK (tracking_type IN ('boolean', 'numeric', 'duration')),
    target_operator TEXT NOT NULL DEFAULT 'gte' CHECK (target_operator IN ('gte', 'lte')),
    target_value NUMERIC(10, 2) NOT NULL DEFAULT 1.0,
    target_unit TEXT NOT NULL DEFAULT 'count',
    icon TEXT NOT NULL DEFAULT 'CheckCircle',
    color TEXT NOT NULL DEFAULT '#4F46E5',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
    time_of_day TEXT NOT NULL DEFAULT 'anytime' CHECK (time_of_day IN ('anytime', 'morning', 'afternoon', 'evening')),
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own habits"
    ON public.habits FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habits"
    ON public.habits FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits"
    ON public.habits FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits"
    ON public.habits FOR DELETE
    USING (auth.uid() = user_id);

CREATE INDEX idx_habits_user_id ON public.habits(user_id);
CREATE INDEX idx_habits_category_id ON public.habits(category_id);
CREATE INDEX idx_habits_status ON public.habits(status);

CREATE TRIGGER trg_habits_updated_at
    BEFORE UPDATE ON public.habits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------------------
-- 5. Habit Schedules Table
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.habit_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
    recurrence_type TEXT NOT NULL CHECK (recurrence_type IN ('daily', 'weekdays', 'interval', 'weekly_frequency', 'monthly_target')),
    days_of_week INT[] DEFAULT '{0,1,2,3,4,5,6}', -- 0 = Sunday, 6 = Saturday
    interval_days INT DEFAULT 1,
    weekly_target_count INT DEFAULT 7,
    effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
    effective_until DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.habit_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view schedules of their habits"
    ON public.habit_schedules FOR SELECT
    USING (EXISTS (SELECT 1 FROM public.habits WHERE habits.id = habit_schedules.habit_id AND habits.user_id = auth.uid()));

CREATE POLICY "Users can manage schedules of their habits"
    ON public.habit_schedules FOR ALL
    USING (EXISTS (SELECT 1 FROM public.habits WHERE habits.id = habit_schedules.habit_id AND habits.user_id = auth.uid()));

CREATE INDEX idx_habit_schedules_habit_id ON public.habit_schedules(habit_id);

-- --------------------------------------------------------------------
-- 6. Habit Entries (Check-ins & Progress)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.habit_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
    occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    local_date DATE NOT NULL,
    recorded_value NUMERIC(10, 2) NOT NULL DEFAULT 1.0,
    note TEXT,
    source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'timer', 'routine', 'api')),
    idempotency_key TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.habit_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own habit entries"
    ON public.habit_entries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habit entries"
    ON public.habit_entries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habit entries"
    ON public.habit_entries FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habit entries"
    ON public.habit_entries FOR DELETE
    USING (auth.uid() = user_id);

CREATE INDEX idx_habit_entries_user_date ON public.habit_entries(user_id, local_date);
CREATE INDEX idx_habit_entries_habit_date ON public.habit_entries(habit_id, local_date);
CREATE UNIQUE INDEX idx_habit_entries_idempotency ON public.habit_entries(user_id, idempotency_key) WHERE idempotency_key IS NOT NULL;

-- --------------------------------------------------------------------
-- 7. Habit Day Overrides (Skipped, Rest, Vacation)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.habit_day_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
    local_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('skipped', 'sick', 'vacation')),
    note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (habit_id, local_date)
);

ALTER TABLE public.habit_day_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own habit overrides"
    ON public.habit_day_overrides FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own habit overrides"
    ON public.habit_day_overrides FOR ALL
    USING (auth.uid() = user_id);

CREATE INDEX idx_habit_day_overrides_lookup ON public.habit_day_overrides(habit_id, local_date);

-- --------------------------------------------------------------------
-- 8. Goals Table
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    target_value NUMERIC(12, 2) NOT NULL,
    current_value NUMERIC(12, 2) NOT NULL DEFAULT 0.0,
    unit TEXT NOT NULL DEFAULT 'units',
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    target_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and manage their goals"
    ON public.goals FOR ALL
    USING (auth.uid() = user_id);

CREATE INDEX idx_goals_user_id ON public.goals(user_id);
CREATE TRIGGER trg_goals_updated_at
    BEFORE UPDATE ON public.goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Goal-Habit Relationships (Many-to-Many with Contribution Weight)
CREATE TABLE IF NOT EXISTS public.goal_habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
    habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
    contribution_weight NUMERIC(4, 2) NOT NULL DEFAULT 1.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (goal_id, habit_id)
);

ALTER TABLE public.goal_habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage goal habits"
    ON public.goal_habits FOR ALL
    USING (EXISTS (SELECT 1 FROM public.goals WHERE goals.id = goal_habits.goal_id AND goals.user_id = auth.uid()));

-- --------------------------------------------------------------------
-- 9. Routines Table (Fabulous-Style Sequence)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.routines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    preferred_time TEXT NOT NULL DEFAULT 'morning' CHECK (preferred_time IN ('morning', 'afternoon', 'evening')),
    target_duration_minutes INT NOT NULL DEFAULT 30,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their routines"
    ON public.routines FOR ALL
    USING (auth.uid() = user_id);

CREATE TRIGGER trg_routines_updated_at
    BEFORE UPDATE ON public.routines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Routine Habits Linking Table
CREATE TABLE IF NOT EXISTS public.routine_habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    routine_id UUID NOT NULL REFERENCES public.routines(id) ON DELETE CASCADE,
    habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
    sequence_order INT NOT NULL DEFAULT 0,
    custom_target_value NUMERIC(10, 2),
    estimated_minutes INT NOT NULL DEFAULT 10,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (routine_id, habit_id)
);

ALTER TABLE public.routine_habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage routine habits"
    ON public.routine_habits FOR ALL
    USING (EXISTS (SELECT 1 FROM public.routines WHERE routines.id = routine_habits.routine_id AND routines.user_id = auth.uid()));

-- --------------------------------------------------------------------
-- 10. Journal & Daily Reflection Entries
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    habit_id UUID REFERENCES public.habits(id) ON DELETE SET NULL,
    entry_date DATE NOT NULL,
    content TEXT NOT NULL,
    mood INT CHECK (mood BETWEEN 1 AND 5), -- 1: Terrible, 2: Bad, 3: Neutral, 4: Good, 5: Awesome
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their journal entries"
    ON public.journal_entries FOR ALL
    USING (auth.uid() = user_id);

CREATE INDEX idx_journal_user_date ON public.journal_entries(user_id, entry_date);
CREATE TRIGGER trg_journal_updated_at
    BEFORE UPDATE ON public.journal_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------------------
-- 11. Reminders Table
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
    reminder_time TIME NOT NULL,
    repeat_days INT[] DEFAULT '{0,1,2,3,4,5,6}',
    timezone TEXT NOT NULL DEFAULT 'UTC',
    message TEXT NOT NULL DEFAULT 'Time to complete your habit!',
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their habit reminders"
    ON public.reminders FOR ALL
    USING (EXISTS (SELECT 1 FROM public.habits WHERE habits.id = reminders.habit_id AND habits.user_id = auth.uid()));

-- --------------------------------------------------------------------
-- 12. User Settings Table
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    theme TEXT NOT NULL DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    timezone TEXT NOT NULL DEFAULT 'UTC',
    week_starts_on TEXT NOT NULL DEFAULT 'monday' CHECK (week_starts_on IN ('sunday', 'monday')),
    notification_preferences JSONB NOT NULL DEFAULT '{"email": true, "push": true, "daily_digest": true}',
    sound_effects BOOLEAN NOT NULL DEFAULT TRUE,
    analytics_consent BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their user settings"
    ON public.user_settings FOR ALL
    USING (auth.uid() = user_id);

CREATE TRIGGER trg_user_settings_updated_at
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------------------
-- 13. Focus Sessions Table (Pomodoro Integration)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.focus_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    habit_id UUID REFERENCES public.habits(id) ON DELETE SET NULL,
    duration_seconds INT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT TRUE,
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their focus sessions"
    ON public.focus_sessions FOR ALL
    USING (auth.uid() = user_id);

CREATE INDEX idx_focus_sessions_user_date ON public.focus_sessions(user_id, started_at);
