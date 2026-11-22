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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { HabitWithDetails, Category, Goal, Routine, RoutineHabitItem, JournalEntry, UserSettings, AnalyticsSummary, DayPerformance } from "@/types";

export function AppShell() {
  const [activeTab, setActiveTab] = useState<NavItemKey>("overview");
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isNewHabitOpen, setIsNewHabitOpen] = useState(false);
  const [isFocusTimerOpen, setIsFocusTimerOpen] = useState(false);

  const queryClient = useQueryClient();

  // Queries
  const { data: habits = [], refetch: refetchHabits } = useQuery<HabitWithDetails[]>({
    queryKey: ["habits"],
    queryFn: async () => {
      const res = await fetch("/api/habits");
      const json = await res.json();
      return json.data || [];
    },
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      const json = await res.json();
      return json.data || [];
    },
  });

  const { data: goals = [], refetch: refetchGoals } = useQuery<Goal[]>({
    queryKey: ["goals"],
    queryFn: async () => {
      const res = await fetch("/api/goals");
      const json = await res.json();
      return json.data || [];
    },
  });

  const { data: routines = [], refetch: refetchRoutines } = useQuery<(Routine & { items: RoutineHabitItem[] })[]>({
    queryKey: ["routines"],
    queryFn: async () => {
      const res = await fetch("/api/routines");
      const json = await res.json();
      return json.data || [];
    },
  });

  const { data: journal = [], refetch: refetchJournal } = useQuery<JournalEntry[]>({
    queryKey: ["journal"],
    queryFn: async () => {
      const res = await fetch("/api/journal");
      const json = await res.json();
      return json.data || [];
    },
  });

  const { data: analyticsData, refetch: refetchAnalytics } = useQuery<{
    summary: AnalyticsSummary;
    heatmap: DayPerformance[];
  }>({
    queryKey: ["analytics"],
    queryFn: async () => {
      const res = await fetch("/api/analytics");
      const json = await res.json();
      return json.data;
    },
  });

  const { data: settings = {
    id: "set-default",
    user_id: "default",
    theme: "light",
    timezone: "UTC",
    week_starts_on: "monday",
    notification_preferences: { email: true, push: true, daily_digest: true },
    sound_effects: true,
    analytics_consent: true,
  }, refetch: refetchSettings } = useQuery<UserSettings>({
    queryKey: ["settings"],
    queryFn: async () => {
      const res = await fetch("/api/settings");
      const json = await res.json();
      return json.data;
    },
  });

  const handleGlobalRefresh = () => {
    refetchHabits();
    refetchGoals();
    refetchRoutines();
    refetchJournal();
    refetchAnalytics();
  };

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
            />
          )}

          {activeTab === "today" && (
            <TodayView
              habits={habits}
              onRefresh={handleGlobalRefresh}
              onOpenNewHabit={() => setIsNewHabitOpen(true)}
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

      <AuthModal />
    </div>
  );
}
