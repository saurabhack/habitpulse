"use client";

import React, { useState } from "react";
import { Goal, HabitWithDetails, Category } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import {
  Target,
  Plus,
  Trophy,
  Calendar,
  CheckCircle2,
  Trash2,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import confetti from "canvas-confetti";
import { format } from "date-fns";

interface GoalsViewProps {
  goals: Goal[];
  habits: HabitWithDetails[];
  categories: Category[];
  onRefresh: () => void;
}

export function GoalsView({ goals, habits, categories, onRefresh }: GoalsViewProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetValue, setTargetValue] = useState(10);
  const [unit, setUnit] = useState("sessions");
  const [targetDate, setTargetDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedHabitIds, setSelectedHabitIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || undefined,
          target_value: Number(targetValue),
          current_value: 0,
          unit,
          start_date: format(new Date(), "yyyy-MM-dd"),
          target_date: targetDate,
          linked_habit_ids: selectedHabitIds,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setTitle("");
        setDescription("");
        setTargetValue(10);
        setSelectedHabitIds([]);
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProgress = async (goal: Goal, delta: number) => {
    try {
      const res = await fetch(`/api/goals/${goal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progressDelta: delta }),
      });

      if (res.ok) {
        if (goal.current_value + delta >= goal.target_value) {
          confetti({ particleCount: 70, spread: 60 });
        }
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm("Are you sure you want to delete this goal?")) return;
    try {
      await fetch(`/api/goals/${goalId}`, { method: "DELETE" });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Goals & Milestones
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Define long-term measurable outcomes powered by your daily habits
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)} className="rounded-xl">
          <Plus className="w-4 h-4 mr-1" />
          <span>Set New Goal</span>
        </Button>
      </div>

      {/* Goal Cards */}
      {goals.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <Target className="w-10 h-10 text-indigo-500 mx-auto mb-2 opacity-60" />
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">No Goals Established Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Connect your daily habits with long-term milestones to track tangible achievements.
          </p>
          <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)}>
            Create First Goal
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {goals.map((goal) => {
            const percent = Math.min(100, Math.round((goal.current_value / goal.target_value) * 100));
            const isCompleted = goal.status === "completed" || percent >= 100;

            return (
              <Card key={goal.id} className="p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                          isCompleted
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-600"
                            : "bg-indigo-50 dark:bg-indigo-950 text-indigo-600"
                        }`}
                      >
                        <Trophy className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                          {goal.title}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Target: {goal.target_date}
                        </p>
                      </div>
                    </div>

                    <Badge variant={isCompleted ? "success" : "default"}>
                      {isCompleted ? "Achieved" : `${percent}%`}
                    </Badge>
                  </div>

                  {goal.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                      {goal.description}
                    </p>
                  )}

                  {/* Progress Bar */}
                  <div className="space-y-1.5 mb-4">
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span>Progress</span>
                      <span>
                        {goal.current_value} / {goal.target_value} {goal.unit}
                      </span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted ? "bg-emerald-500" : "bg-indigo-600"
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Linked Habits */}
                  {goal.linked_habit_ids && goal.linked_habit_ids.length > 0 && (
                    <div className="mb-4">
                      <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                        Driven By Habits:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {goal.linked_habit_ids.map((hid) => {
                          const h = habits.find((item) => item.id === hid);
                          return h ? (
                            <span
                              key={hid}
                              className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                            >
                              {h.title}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress Buttons & Deletion */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateProgress(goal, 1)}
                      className="text-xs py-1 px-2.5 h-8 rounded-xl"
                    >
                      +1 {goal.unit}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateProgress(goal, 5)}
                      className="text-xs py-1 px-2.5 h-8 rounded-xl"
                    >
                      +5 {goal.unit}
                    </Button>
                  </div>

                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* New Goal Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Goal"
        description="Set a measurable milestone that guides your consistency."
        maxWidth="md"
      >
        <form onSubmit={handleCreateGoal} className="space-y-4 py-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Goal Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Read 12 Books, Run 500 km, Complete 100 Workouts"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Why does this goal matter to you?"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Value
              </label>
              <input
                type="number"
                min={1}
                value={targetValue}
                onChange={(e) => setTargetValue(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Unit
              </label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. books, workouts, km"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Target Date
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Habit Linking */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Link Habits (Optional)
            </label>
            <div className="max-h-36 overflow-y-auto space-y-1.5 border border-slate-200 dark:border-slate-800 rounded-xl p-2 bg-slate-50 dark:bg-slate-800/40">
              {habits.map((h) => {
                const isSelected = selectedHabitIds.includes(h.id);
                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => {
                      setSelectedHabitIds((prev) =>
                        prev.includes(h.id) ? prev.filter((id) => id !== h.id) : [...prev, h.id]
                      );
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition ${
                      isSelected
                        ? "bg-indigo-600 text-white"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    <span>{h.title}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Save Goal"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
