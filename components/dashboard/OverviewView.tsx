"use client";

import React from "react";
import { HabitWithDetails, AnalyticsSummary } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CircularProgress } from "@/components/ui/CircularProgress";
import {
  Flame,
  CheckCircle2,
  Clock,
  TrendingUp,
  Plus,
  Timer,
  Target,
  BookMarked,
  ArrowRight,
  Sparkles,
  Calendar,
} from "lucide-react";
import { getGreeting } from "@/lib/utils";
import { format } from "date-fns";

interface OverviewViewProps {
  habits: HabitWithDetails[];
  analytics: AnalyticsSummary;
  onNavigate: (tab: any) => void;
  onOpenNewHabit: () => void;
  onOpenFocusTimer: () => void;
  onRefresh: () => void;
}

export function OverviewView({
  habits,
  analytics,
  onNavigate,
  onOpenNewHabit,
  onOpenFocusTimer,
  onRefresh,
}: OverviewViewProps) {
  const greeting = getGreeting();
  const todayStr = format(new Date(), "EEEE, MMMM d");

  const activeHabits = habits.filter((h) => h.status === "active");
  const completedToday = habits.filter((h) => h.todayStatus === "completed").length;
  const scheduledToday = habits.filter(
    (h) => h.todayStatus !== "unscheduled" && h.todayStatus !== "skipped"
  ).length;

  const progressPercent = scheduledToday > 0 ? Math.round((completedToday / scheduledToday) * 100) : 100;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white shadow-xl shadow-indigo-600/15">
        <div>
          <div className="flex items-center gap-2 text-indigo-200 text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{todayStr}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {greeting}, Creator!
          </h1>
          <p className="text-sm text-indigo-100/90 mt-1 max-w-xl">
            "We are what we repeatedly do. Excellence, then, is not an act, but a habit."
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenFocusTimer}
            className="rounded-xl shadow-sm text-slate-900 bg-white hover:bg-slate-100"
          >
            <Timer className="w-4 h-4 mr-1 text-amber-500" />
            <span>Focus Timer</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenNewHabit}
            className="rounded-xl shadow-sm text-indigo-700 bg-white hover:bg-slate-100"
          >
            <Plus className="w-4 h-4 mr-1" />
            <span>New Habit</span>
          </Button>
        </div>
      </div>

      {/* 2. Daily Productivity Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Today's Progress</p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              {completedToday} <span className="text-xs font-normal text-slate-400">/ {scheduledToday}</span>
            </p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 fill-amber-500" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Streak</p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              {analytics.currentStreakOverall} <span className="text-xs font-normal text-slate-400">days</span>
            </p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Best Streak</p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              {analytics.bestStreakOverall} <span className="text-xs font-normal text-slate-400">days</span>
            </p>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Weekly Consistency</p>
            <p className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              {analytics.weeklyCompletionRate}%
            </p>
          </div>
        </Card>
      </div>

      {/* 3. Hero Visual Section: Circular Progress & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Circular Progress Indicator Card */}
        <Card className="p-6 flex flex-col items-center justify-center text-center">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-4">
            Daily Completion
          </h3>

          <CircularProgress
            value={progressPercent}
            size={160}
            strokeWidth={14}
            color="#4F46E5"
            sublabel={`${completedToday} of ${scheduledToday} done`}
          />

          <div className="mt-5 text-xs text-slate-500 dark:text-slate-400 max-w-xs">
            {progressPercent >= 100
              ? "🌟 Perfect Day! You've conquered all scheduled goals."
              : `${scheduledToday - completedToday} more habits to complete today's streak.`}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate("today")}
            className="mt-4 rounded-xl text-xs gap-1.5"
          >
            <span>Open Today's View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Card>

        {/* Quick Actions & Behavioral Insights Card */}
        <Card className="p-6 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Behavioral Insights & Momentum
              </h3>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
                Automated
              </span>
            </div>

            <div className="space-y-3 mb-6">
              {analytics.behavioralInsights.slice(0, 3).map((insight, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/80"
                >
                  <div className="w-7 h-7 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {insight}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Launch Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={onOpenNewHabit}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200/60 dark:border-slate-800 text-left transition group"
            >
              <Plus className="w-4 h-4 text-indigo-600 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Add Habit</span>
              <span className="text-[10px] text-slate-400">Build new routine</span>
            </button>

            <button
              onClick={() => onNavigate("goals")}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200/60 dark:border-slate-800 text-left transition group"
            >
              <Target className="w-4 h-4 text-indigo-600 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Set Goal</span>
              <span className="text-[10px] text-slate-400">Milestone targets</span>
            </button>

            <button
              onClick={onOpenFocusTimer}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-slate-200/60 dark:border-slate-800 text-left transition group"
            >
              <Timer className="w-4 h-4 text-amber-500 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Pomodoro</span>
              <span className="text-[10px] text-slate-400">Deep focus timer</span>
            </button>

            <button
              onClick={() => onNavigate("journal")}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-slate-200/60 dark:border-slate-800 text-left transition group"
            >
              <BookMarked className="w-4 h-4 text-purple-600 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Journal</span>
              <span className="text-[10px] text-slate-400">Daily reflection</span>
            </button>
          </div>
        </Card>
      </div>

      {/* 4. Today's Scheduled Quick Preview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Active Habits ({activeHabits.length})
            </h3>
            <p className="text-xs text-slate-500">Quick snapshot of your daily priorities</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onNavigate("today")} className="text-xs gap-1">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {activeHabits.slice(0, 6).map((habit) => (
            <div
              key={habit.id}
              className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${habit.color}20`, color: habit.color }}
                >
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {habit.title}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {habit.streakInfo.currentStreak}d streak · {habit.todayRecordedValue}/{habit.target_value} {habit.target_unit}
                  </p>
                </div>
              </div>

              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase shrink-0 ${
                  habit.todayStatus === "completed"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                    : habit.todayStatus === "skipped"
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                }`}
              >
                {habit.todayStatus}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
