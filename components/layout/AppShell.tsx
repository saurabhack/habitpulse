"use client";

import React, { useState } from "react";
import { Sidebar, NavItemKey } from "./Sidebar";
import { Header } from "./Header";
import { OverviewView } from "@/components/dashboard/OverviewView";
import { TodayView } from "@/components/habits/TodayView";
import { HabitList } from "@/components/habits/HabitList";
import { RoutinesView } from "@/components/routines/RoutinesView";
import { GoalsView } from "@/components/goals/GoalsView";
import { CalendarView } from "@/components/calendar/CalendarView";
import { AnalyticsView } from "@/components/analytics/AnalyticsView";
import { JournalView } from "@/components/journal/JournalView";
import { SettingsView } from "@/components/settings/SettingsView";
import { ProfileView } from "@/components/profile/ProfileView";
import { HabitWizardModal } from "@/components/habits/HabitWizardModal";
import { FocusTimerModal } from "@/components/focus/FocusTimerModal";
import { AuthModal } from "@/components/auth/AuthModal";
import { LandingView } from "@/components/landing/LandingView";
import { FirstStreakFeedbackModal } from "@/components/feedback/FirstStreakFeedbackModal";
import { useAuth } from "@/components/providers/AuthProvider";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  HabitWithDetails,
  Category,
  Goal,
  Routine,
  RoutineHabitItem,
  JournalEntry,
  UserSettings,
  AnalyticsSummary,
  DayPerformance,
} from "@/types";
import { Flame } from "lucide-react";

export function AppShell() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<NavItemKey>("overview");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isNewHabitOpen, setIsNewHabitOpen] = useState(false);
  const [isFocusTimerOpen, setIsFocusTimerOpen] = useState(false);

  // First Streak Feedback Modal state
  const [feedbackHabit, setFeedbackHabit] = useState<HabitWithDetails | null>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const queryClient = useQueryClient();

  // Queries - strictly gated to authenticated user
  const { data: habits = [], refetch: refetchHabits } = useQuery<HabitWithDetails[]>({
    queryKey: ["habits", user?.id],
    queryFn: async () => {
      const res = await fetch("/api/habits");
      const json = await res.json();
      return json.data || [];
    },
    enabled: !!user,
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      const json = await res.json();
      return json.data || [];
    },
    enabled: !!user,
  });

  const { data: goals = [], refetch: refetchGoals } = useQuery<Goal[]>({
    queryKey: ["goals", user?.id],
    queryFn: async () => {
      const res = await fetch("/api/goals");
      const json = await res.json();
      return json.data || [];
    },
    enabled: !!user,
  });

  const { data: routines = [], refetch: refetchRoutines } = useQuery<(Routine & { items: RoutineHabitItem[] })[]>({
    queryKey: ["routines", user?.id],
    queryFn: async () => {
      const res = await fetch("/api/routines");
      const json = await res.json();
      return json.data || [];
    },
    enabled: !!user,
  });

  const { data: journal = [], refetch: refetchJournal } = useQuery<JournalEntry[]>({
    queryKey: ["journal", user?.id],
    queryFn: async () => {
      const res = await fetch("/api/journal");
      const json = await res.json();
      return json.data || [];
    },
    enabled: !!user,
  });

  const { data: analyticsData, refetch: refetchAnalytics } = useQuery<{
    summary: AnalyticsSummary;
    heatmap: DayPerformance[];
  }>({
    queryKey: ["analytics", user?.id],
    queryFn: async () => {
      const res = await fetch("/api/analytics");
      const json = await res.json();
      return json.data;
    },
    enabled: !!user,
  });

  const {
    data: settings = {
      id: "set-default",
      user_id: user?.id || "default",
      theme: "light",
      timezone: "UTC",
      week_starts_on: "monday",
      notification_preferences: { email: true, push: true, daily_digest: true },
      sound_effects: true,
      analytics_consent: true,
    },
    refetch: refetchSettings,
  } = useQuery<UserSettings>({
    queryKey: ["settings", user?.id],
    queryFn: async () => {
      const res = await fetch("/api/settings");
      const json = await res.json();
      return json.data;
    },
    enabled: !!user,
  });

  const handleGlobalRefresh = () => {
    refetchHabits();
    refetchGoals();
    refetchRoutines();
    refetchJournal();
    refetchAnalytics();
  };

  const handleHabitCompleted = (completedHabit: HabitWithDetails) => {
    if (!user) return;
    const storageKey = `habitpulse_first_streak_feedback_${user.id}`;
    const alreadyGiven = localStorage.getItem(storageKey);
    if (!alreadyGiven) {
      setFeedbackHabit(completedHabit);
      setIsFeedbackOpen(true);
    }
  };

  // Loading Screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <div className="w-14 h-14 rounded-3xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-pulse mb-4">
          <Flame className="w-8 h-8 fill-white text-white" />
        </div>
        <p className="text-sm font-bold tracking-tight text-slate-600 dark:text-slate-400">
          Loading HabitPulse...
        </p>
      </div>
    );
  }

  // 1 & 3: Logged-out State -> Dedicated High-Converting Public SaaS Landing Page
  if (!user) {
    return (
      <>
        <LandingView />
        <AuthModal />
      </>
    );
  }

  // 2: Logged-in State -> Full Productivity Workspace
  const defaultSummary: AnalyticsSummary = {
    dailyCompletionRate: 0,
    weeklyCompletionRate: 0,
    monthlyCompletionRate: 0,
    activeHabitsCount: habits.length,
    totalCompletedToday: 0,
    remainingToday: 0,
    perfectDaysCount: 0,
    bestStreakOverall: 0,
    currentStreakOverall: 0,
    strongestWeekday: "Tuesday",
    weakestWeekday: "Sunday",
    behavioralInsights: [
      "Consistent habits form the architecture of daily achievement.",
    ],
  };

  const summary = analyticsData?.summary || defaultSummary;
  const heatmap = analyticsData?.heatmap || [];

  return (
    <div className="flex min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onOpenMobileMenu={() => setIsMobileOpen(true)}
          onOpenNewHabit={() => setIsNewHabitOpen(true)}
          onOpenFocusTimer={() => setIsFocusTimerOpen(true)}
          onNavigateToProfile={() => setActiveTab("profile")}
          onNavigateToSettings={() => setActiveTab("settings")}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {activeTab === "overview" && (
            <OverviewView
              habits={habits}
              analytics={summary}
              onNavigate={setActiveTab}
              onOpenNewHabit={() => setIsNewHabitOpen(true)}
              onOpenFocusTimer={() => setIsFocusTimerOpen(true)}
              onRefresh={handleGlobalRefresh}
              onHabitCompleted={handleHabitCompleted}
            />
          )}

          {activeTab === "today" && (
            <TodayView
              habits={habits}
              onRefresh={handleGlobalRefresh}
              onOpenNewHabit={() => setIsNewHabitOpen(true)}
              onHabitCompleted={handleHabitCompleted}
            />
          )}

          {activeTab === "habits" && (
            <HabitList
              habits={habits}
              categories={categories}
              onRefresh={handleGlobalRefresh}
              onOpenNewHabit={() => setIsNewHabitOpen(true)}
            />
          )}

          {activeTab === "routines" && (
            <RoutinesView
              routines={routines}
              habits={habits}
              onRefresh={handleGlobalRefresh}
            />
          )}

          {activeTab === "goals" && (
            <GoalsView
              goals={goals}
              habits={habits}
              categories={categories}
              onRefresh={handleGlobalRefresh}
            />
          )}

          {activeTab === "calendar" && (
            <CalendarView
              habits={habits}
              onRefresh={handleGlobalRefresh}
            />
          )}

          {activeTab === "analytics" && (
            <AnalyticsView
              habits={habits}
              analytics={summary}
              heatmap={heatmap}
            />
          )}

          {activeTab === "journal" && (
            <JournalView
              entries={journal}
              habits={habits}
              onRefresh={handleGlobalRefresh}
            />
          )}

          {activeTab === "profile" && (
            <ProfileView
              habits={habits}
            />
          )}

          {activeTab === "settings" && (
            <SettingsView
              settings={settings}
              onRefresh={refetchSettings}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <HabitWizardModal
        isOpen={isNewHabitOpen}
        onClose={() => setIsNewHabitOpen(false)}
        categories={categories}
        onHabitCreated={handleGlobalRefresh}
      />

      <FocusTimerModal
        isOpen={isFocusTimerOpen}
        onClose={() => setIsFocusTimerOpen(false)}
        habits={habits}
        onSessionComplete={handleGlobalRefresh}
      />

      <FirstStreakFeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        habitTitle={feedbackHabit?.title}
        userId={user?.id}
        onSubmitted={handleGlobalRefresh}
      />

      <AuthModal />
    </div>
  );
}