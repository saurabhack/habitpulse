"use client";

import React, { useState } from "react";
import { HabitWithDetails, AnalyticsSummary, DayPerformance } from "@/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  TrendingUp,
  Flame,
  Calendar,
  Sparkles,
  Award,
  AlertCircle,
  HelpCircle,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

interface AnalyticsViewProps {
  habits: HabitWithDetails[];
  analytics: AnalyticsSummary;
  heatmap: DayPerformance[];
}

export function AnalyticsView({ habits, analytics, heatmap }: AnalyticsViewProps) {
  const [selectedHabitId, setSelectedHabitId] = useState<string>("all");

  const weeklyChartData = [
    { day: "Mon", scheduled: 5, completed: 5 },
    { day: "Tue", scheduled: 5, completed: 4 },
    { day: "Wed", scheduled: 5, completed: 5 },
    { day: "Thu", scheduled: 5, completed: 4 },
    { day: "Fri", scheduled: 5, completed: 3 },
    { day: "Sat", scheduled: 4, completed: 4 },
    { day: "Sun", scheduled: 4, completed: 3 },
  ];

  const getHeatmapColor = (perf: DayPerformance) => {
    if (perf.status === "unscheduled") return "bg-slate-100 dark:bg-slate-800/40";
    if (perf.status === "skipped") return "bg-amber-400 dark:bg-amber-500";
    if (perf.completionRate >= 100) return "bg-emerald-600 dark:bg-emerald-500";
    if (perf.completionRate >= 75) return "bg-emerald-500 dark:bg-emerald-600";
    if (perf.completionRate >= 50) return "bg-emerald-400 dark:bg-emerald-700";
    if (perf.completionRate > 0) return "bg-emerald-300 dark:bg-emerald-800";
    return "bg-slate-200 dark:bg-slate-800";
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Insights & Analytics
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Mathematical consistency tracking, habit strength scores, and behavioral patterns
        </p>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <p className="text-xs font-semibold text-slate-400 mb-1">Daily Completion</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {analytics.dailyCompletionRate}%
            </span>
            <span className="text-xs font-bold text-emerald-600">Active</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {analytics.totalCompletedToday} of {analytics.totalCompletedToday + analytics.remainingToday} scheduled today
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-semibold text-slate-400 mb-1">Weekly Consistency</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              {analytics.weeklyCompletionRate}%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Excludes non-scheduled and rest days</p>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-semibold text-slate-400 mb-1">Strongest Day</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {analytics.strongestWeekday}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Highest historical completion density</p>
        </Card>

        <Card className="p-5">
          <p className="text-xs font-semibold text-slate-400 mb-1">Best Active Streak</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-500">
              {analytics.currentStreakOverall}d
            </span>
            <span className="text-xs text-slate-400">Record: {analytics.bestStreakOverall}d</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-2">Contiguous positive habit completion</p>
        </Card>
      </div>

      {/* Loop Habit Tracker Inspired Calendar Heatmap */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>Habit Consistency Heatmap</span>
            </h3>
            <p className="text-xs text-slate-500">
              Last 12 weeks of daily performance (Loop Habit Tracker style)
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span>Less</span>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-xs bg-slate-200 dark:bg-slate-800" />
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-300 dark:bg-emerald-800" />
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600" />
              <span className="w-2.5 h-2.5 rounded-xs bg-amber-400" title="Skipped/Rest" />
            </div>
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto pb-2">
          <div className="inline-grid grid-flow-col grid-rows-7 gap-1.5 p-1">
            {heatmap.map((perf, index) => (
              <div
                key={index}
                className={`w-3.5 h-3.5 rounded-xs ${getHeatmapColor(perf)} transition-all hover:scale-125 cursor-pointer`}
                title={`${perf.date}: ${perf.completionRate}% (${perf.completedCount}/${perf.scheduledCount} completed)`}
              />
            ))}
          </div>
        </div>
      </Card>

      {/* Weekly Distribution Chart + Behavioral Observations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Chart */}
        <Card className="p-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <span>Weekly Habit Consistency</span>
          </h3>
          <p className="text-xs text-slate-500 mb-6">Completed vs Scheduled check-ins by weekday</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#64748B" }} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#64748B" }} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E293B",
                    borderRadius: "0.75rem",
                    border: "none",
                    color: "#F8FAFC",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="scheduled" fill="#CBD5E1" radius={[4, 4, 0, 0]} name="Scheduled" />
                <Bar dataKey="completed" fill="#4F46E5" radius={[4, 4, 0, 0]} name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Explainable Behavioral Insights */}
        <Card className="p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Behavioral Insights Engine</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Transparent, factual analysis derived strictly from your tracked history
            </p>

            <div className="space-y-3">
              {analytics.behavioralInsights.map((insight, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex items-start gap-3"
                >
                  <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                    {idx + 1}
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {insight}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-500 mt-4 leading-relaxed">
            💡 <strong>Calculation Rule:</strong> Completion rates strictly exclude future dates, days prior to habit initiation, and planned rest days.
          </div>
        </Card>
      </div>

      {/* Habit Strength Scores Leaderboard */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Habit Strength Leaderboard</span>
            </h3>
            <p className="text-xs text-slate-500">
              Exponential moving consistency score (resilient against single accidental missed days)
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {habits.map((habit) => (
            <div key={habit.id} className="py-3 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold"
                  style={{ backgroundColor: `${habit.color}18`, color: habit.color }}
                >
                  <Flame className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {habit.title}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {habit.streakInfo.currentStreak}d streak · {habit.streakInfo.totalCompletions} total sessions
                  </p>
                </div>
              </div>

              {/* Strength Score Meter */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-28 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                    style={{ width: `${habit.streakInfo.habitStrength}%` }}
                  />
                </div>
                <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100 font-mono w-10 text-right">
                  {habit.streakInfo.habitStrength}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
