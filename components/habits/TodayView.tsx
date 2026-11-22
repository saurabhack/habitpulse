"use client";

import React, { useState } from "react";
import { HabitWithDetails, TimeOfDay } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Check,
  Plus,
  Minus,
  Flame,
  Clock,
  Sparkles,
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  CalendarX,
  FileText,
  Sun,
  Sunset,
  Moon,
  Zap,
} from "lucide-react";
import confetti from "canvas-confetti";
import { format } from "date-fns";

interface TodayViewProps {
  habits: HabitWithDetails[];
  onRefresh: () => void;
  onOpenNewHabit: () => void;
  onHabitCompleted?: (habit: HabitWithDetails) => void;
}

export function TodayView({ habits, onRefresh, onOpenNewHabit, onHabitCompleted }: TodayViewProps) {
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [noteModalHabit, setNoteModalHabit] = useState<HabitWithDetails | null>(null);
  const [noteText, setNoteText] = useState("");

  const todayStr = format(new Date(), "yyyy-MM-dd");

  const handleToggleBoolean = async (habit: HabitWithDetails) => {
    setUpdatingId(habit.id);
    try {
      const isCurrentlyCompleted = habit.todayStatus === "completed";
      const targetVal = isCurrentlyCompleted ? 0 : habit.target_value;

      const res = await fetch(`/api/habits/${habit.id}/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          value: targetVal,
          isAbsolute: true,
          date: todayStr,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const updated = json.data || habit;
        if (!isCurrentlyCompleted) {
          confetti({
            particleCount: 50,
            spread: 50,
            origin: { y: 0.7 },
          });
          if (onHabitCompleted) {
            onHabitCompleted(updated);
          }
        }
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateNumeric = async (habit: HabitWithDetails, delta: number) => {
    setUpdatingId(habit.id);
    try {
      const current = habit.todayRecordedValue || 0;
      const nextVal = Math.max(0, current + delta);

      const res = await fetch(`/api/habits/${habit.id}/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          value: nextVal,
          isAbsolute: true,
          date: todayStr,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const updated = json.data || habit;
        if (nextVal >= habit.target_value && current < habit.target_value) {
          confetti({ particleCount: 40, spread: 45 });
          if (onHabitCompleted) {
            onHabitCompleted(updated);
          }
        }
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSkipDay = async (habit: HabitWithDetails) => {
    setUpdatingId(habit.id);
    try {
      const isAlreadySkipped = habit.todayStatus === "skipped";
      const res = await fetch(`/api/habits/${habit.id}/override`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: isAlreadySkipped ? "clear" : "skipped",
          date: todayStr,
        }),
      });

      if (res.ok) {
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSaveNote = async () => {
    if (!noteModalHabit) return;
    try {
      await fetch(`/api/habits/${noteModalHabit.id}/track`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          value: noteModalHabit.todayRecordedValue,
          isAbsolute: true,
          note: noteText,
          date: todayStr,
        }),
      });
      setNoteModalHabit(null);
      setNoteText("");
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const activeHabits = habits.filter((h) => h.status === "active");

  const filteredHabits = activeHabits.filter((h) => {
    if (filter === "completed") return h.todayStatus === "completed";
    if (filter === "pending") return h.todayStatus !== "completed";
    return true;
  });

  const timeSlots: { slot: TimeOfDay; label: string; icon: React.ElementType }[] = [
    { slot: "morning", label: "Morning Protocol", icon: Sun },
    { slot: "afternoon", label: "Afternoon Focus", icon: Zap },
    { slot: "evening", label: "Evening Wind-Down", icon: Moon },
    { slot: "anytime", label: "Anytime", icon: Sunset },
  ];

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Today's Focus
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {format(new Date(), "EEEE, MMMM d")} · Maintain your streaks
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-800">
          {(["all", "pending", "completed"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                filter === tab
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Habit Time Groups */}
      {filteredHabits.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 mx-auto flex items-center justify-center mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
            {filter === "completed" ? "No completed habits yet" : "All caught up for today!"}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            {filter === "completed"
              ? "Mark habits as completed to see them listed here."
              : "Great job! Check your routines or create new habits to expand your consistency."}
          </p>
          <Button variant="outline" size="sm" onClick={onOpenNewHabit}>
            <Plus className="w-4 h-4 mr-1" />
            Add New Habit
          </Button>
        </Card>
      ) : (
        <div className="space-y-8">
          {timeSlots.map(({ slot, label, icon: Icon }) => {
            const habitsInSlot = filteredHabits.filter((h) => h.time_of_day === slot);
            if (habitsInSlot.length === 0) return null;

            return (
              <div key={slot} className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <Icon className="w-4 h-4 text-indigo-500" />
                  <span>{label}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600">
                    {habitsInSlot.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {habitsInSlot.map((habit) => {
                    const isCompleted = habit.todayStatus === "completed";
                    const isSkipped = habit.todayStatus === "skipped";

                    return (
                      <Card
                        key={habit.id}
                        className={`p-4 transition-all duration-200 ${
                          isCompleted
                            ? "bg-slate-50/70 dark:bg-slate-900/40 border-emerald-500/30"
                            : isSkipped
                            ? "opacity-60 bg-slate-50 dark:bg-slate-900/20 border-dashed"
                            : "hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          {/* Left: Info */}
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div
                              className="h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs"
                              style={{
                                backgroundColor: `${habit.color}15`,
                                color: habit.color,
                              }}
                            >
                              <Sparkles className="w-5 h-5" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 mb-0.5">
                                <h4
                                  className={`text-sm font-bold truncate ${
                                    isCompleted
                                      ? "text-slate-600 dark:text-slate-400 line-through"
                                      : "text-slate-900 dark:text-slate-100"
                                  }`}
                                >
                                  {habit.title}
                                </h4>
                                {habit.category && (
                                  <span
                                    className="text-[10px] px-1.5 py-0.5 rounded-md font-medium shrink-0"
                                    style={{
                                      backgroundColor: `${habit.category.color}15`,
                                      color: habit.category.color,
                                    }}
                                  >
                                    {habit.category.name}
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-slate-500 truncate mb-2">
                                {habit.description || `${habit.target_value} ${habit.target_unit} daily`}
                              </p>

                              {/* Streak & Status Indicators */}
                              <div className="flex items-center gap-2 text-xs">
                                <div className="flex items-center gap-1 text-amber-500 font-semibold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-lg text-[11px]">
                                  <Flame className="w-3.5 h-3.5 fill-amber-500" />
                                  <span>{habit.streakInfo.currentStreak}d streak</span>
                                </div>

                                <div className="text-[11px] text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                                  Score: {habit.streakInfo.habitStrength}%
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Right: Quick Action Controls */}
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            {/* Boolean Tracking */}
                            {habit.tracking_type === "boolean" && (
                              <button
                                onClick={() => handleToggleBoolean(habit)}
                                disabled={updatingId === habit.id}
                                className={`w-9 h-9 rounded-2xl border-2 flex items-center justify-center transition-all ${
                                  isCompleted
                                    ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                                    : "border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-transparent"
                                }`}
                              >
                                <Check className="w-5 h-5 stroke-[3]" />
                              </button>
                            )}

                            {/* Numeric Tracking */}
                            {habit.tracking_type === "numeric" && (
                              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
                                <button
                                  onClick={() => handleUpdateNumeric(habit, -1)}
                                  disabled={habit.todayRecordedValue <= 0 || updatingId === habit.id}
                                  className="w-7 h-7 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="text-xs font-bold px-1.5 min-w-[40px] text-center text-slate-800 dark:text-slate-200">
                                  {habit.todayRecordedValue} / {habit.target_value}
                                </span>
                                <button
                                  onClick={() => handleUpdateNumeric(habit, 1)}
                                  disabled={updatingId === habit.id}
                                  className="w-7 h-7 rounded-xl flex items-center justify-center bg-indigo-600 text-white hover:bg-indigo-700"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}

                            {/* Duration Tracking */}
                            {habit.tracking_type === "duration" && (
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleUpdateNumeric(habit, 5)}
                                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100"
                                >
                                  +5m
                                </button>
                                <button
                                  onClick={() => handleUpdateNumeric(habit, 15)}
                                  className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs"
                                >
                                  +15m
                                </button>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-1">
                                  {habit.todayRecordedValue}m
                                </span>
                              </div>
                            )}

                            {/* Auxiliary Controls (Skip / Note) */}
                            <div className="flex items-center gap-1 mt-1">
                              <button
                                onClick={() => handleSkipDay(habit)}
                                title={isSkipped ? "Unskip today" : "Skip today (Planned rest)"}
                                className={`p-1.5 rounded-lg text-xs font-medium transition ${
                                  isSkipped
                                    ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                                }`}
                              >
                                <CalendarX className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => {
                                  setNoteModalHabit(habit);
                                  setNoteText("");
                                }}
                                title="Add reflection note"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Note Modal */}
      {noteModalHabit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
              Add Note for {noteModalHabit.title}
            </h3>
            <p className="text-xs text-slate-500 mb-3">Record context, reflections, or obstacles.</p>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="e.g. Completed during lunch break, felt energized..."
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-4"
              autoFocus
            />
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setNoteModalHabit(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveNote}>
                Save Note
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
