"use client";

import React, { useState } from "react";
import { Routine, RoutineHabitItem, HabitWithDetails } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import {
  Workflow,
  Plus,
  Play,
  Clock,
  CheckCircle2,
  Trash2,
  ArrowRight,
  Sun,
  Moon,
  Zap,
  Sparkles,
} from "lucide-react";
import confetti from "canvas-confetti";

interface RoutinesViewProps {
  routines: (Routine & { items: RoutineHabitItem[] })[];
  habits: HabitWithDetails[];
  onRefresh: () => void;
}

export function RoutinesView({ routines, habits, onRefresh }: RoutinesViewProps) {
  const [activeRoutineToRun, setActiveRoutineToRun] = useState<(Routine & { items: RoutineHabitItem[] }) | null>(null);
  const [runningStepIndex, setRunningStepIndex] = useState(0);

  // New Routine Form
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [preferredTime, setPreferredTime] = useState<"morning" | "afternoon" | "evening">("morning");
  const [targetDuration, setTargetDuration] = useState(30);
  const [selectedHabitIds, setSelectedHabitIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStartRoutine = (routine: Routine & { items: RoutineHabitItem[] }) => {
    setActiveRoutineToRun(routine);
    setRunningStepIndex(0);
  };

  const handleStepComplete = async (habitId: string) => {
    try {
      const habit = habits.find((h) => h.id === habitId);
      if (habit) {
        await fetch(`/api/habits/${habitId}/track`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            value: habit.target_value,
            isAbsolute: true,
            source: "routine",
          }),
        });
      }
    } catch (e) {
      console.error(e);
    }

    if (activeRoutineToRun && runningStepIndex + 1 < activeRoutineToRun.items.length) {
      setRunningStepIndex((prev) => prev + 1);
    } else {
      confetti({ particleCount: 80, spread: 70 });
      setActiveRoutineToRun(null);
      onRefresh();
    }
  };

  const handleCreateRoutine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || selectedHabitIds.length === 0) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/routines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: description || undefined,
          preferred_time: preferredTime,
          target_duration_minutes: Number(targetDuration),
          habit_ids: selectedHabitIds,
        }),
      });

      if (res.ok) {
        setIsCreateModalOpen(false);
        setTitle("");
        setDescription("");
        setSelectedHabitIds([]);
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRoutine = async (routineId: string) => {
    if (!confirm("Are you sure you want to delete this routine?")) return;
    try {
      await fetch(`/api/routines/${routineId}`, { method: "DELETE" });
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
            Routines & Stacking
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Fabulous-inspired habitual chains: string together rituals for seamless execution
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={() => setIsCreateModalOpen(true)} className="rounded-xl">
          <Plus className="w-4 h-4 mr-1" />
          <span>New Routine</span>
        </Button>
      </div>

      {/* Routine Cards */}
      {routines.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <Workflow className="w-10 h-10 text-indigo-500 mx-auto mb-2 opacity-60" />
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">No Routines Configured</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Group your morning or evening habits into step-by-step rituals.
          </p>
          <Button variant="outline" size="sm" onClick={() => setIsCreateModalOpen(true)}>
            Build Routine
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {routines.map((routine) => {
            const completedCount = routine.items.filter((item) => {
              const h = habits.find((h) => h.id === item.habit_id);
              return h && h.todayStatus === "completed";
            }).length;

            const percent = routine.items.length > 0 ? Math.round((completedCount / routine.items.length) * 100) : 0;

            return (
              <Card key={routine.id} className="p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center shrink-0">
                        {routine.preferred_time === "morning" ? (
                          <Sun className="w-5 h-5 text-amber-500" />
                        ) : routine.preferred_time === "evening" ? (
                          <Moon className="w-5 h-5 text-purple-500" />
                        ) : (
                          <Zap className="w-5 h-5 text-indigo-500" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                          {routine.title}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          ~{routine.target_duration_minutes} mins · {routine.items.length} steps
                        </p>
                      </div>
                    </div>

                    <Badge variant={percent === 100 ? "success" : "default"}>
                      {percent}% Completed
                    </Badge>
                  </div>

                  {routine.description && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                      {routine.description}
                    </p>
                  )}

                  {/* Sequential Chain of Habits */}
                  <div className="space-y-2 mb-4">
                    {routine.items.map((item, index) => {
                      const h = habits.find((habit) => habit.id === item.habit_id);
                      const isCompleted = h && h.todayStatus === "completed";

                      return (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition ${
                            isCompleted
                              ? "bg-slate-50 dark:bg-slate-800/40 border-emerald-500/30 text-slate-500"
                              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono text-[10px] flex items-center justify-center font-bold">
                              {index + 1}
                            </span>
                            <span className={`font-semibold ${isCompleted ? "line-through" : ""}`}>
                              {h?.title || "Habit"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400">{item.estimated_minutes}m</span>
                            {isCompleted && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleStartRoutine(routine)}
                    className="rounded-xl flex items-center gap-1.5 shadow-sm text-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Start Ritual</span>
                  </Button>

                  <button
                    onClick={() => handleDeleteRoutine(routine.id)}
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

      {/* Routine Runner Modal (Fabulous Style Step by Step Flow) */}
      {activeRoutineToRun && (
        <Modal
          isOpen={true}
          onClose={() => setActiveRoutineToRun(null)}
          title={`Ritual: ${activeRoutineToRun.title}`}
          description={`Step ${runningStepIndex + 1} of ${activeRoutineToRun.items.length}`}
          maxWidth="md"
        >
          {(() => {
            const currentItem = activeRoutineToRun.items[runningStepIndex];
            const habit = habits.find((h) => h.id === currentItem.habit_id);

            return (
              <div className="py-6 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center mb-4 shadow-sm animate-pulse">
                  <Sparkles className="w-8 h-8" />
                </div>

                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">
                  Focus Step {runningStepIndex + 1}
                </span>

                <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">
                  {habit?.title || "Complete Habit"}
                </h3>

                <p className="text-sm text-slate-500 max-w-xs mb-6">
                  {habit?.description || `Target: ${habit?.target_value} ${habit?.target_unit}`}
                </p>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 mb-8 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-500" />
                  <span>Estimated time: {currentItem.estimated_minutes} minutes</span>
                </div>

                <div className="w-full flex items-center justify-between gap-3">
                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => {
                      if (runningStepIndex + 1 < activeRoutineToRun.items.length) {
                        setRunningStepIndex((prev) => prev + 1);
                      } else {
                        setActiveRoutineToRun(null);
                      }
                    }}
                    className="flex-1 rounded-xl"
                  >
                    Skip Step
                  </Button>

                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => handleStepComplete(currentItem.habit_id)}
                    className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    <span>Done & Next</span>
                  </Button>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}

      {/* New Routine Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Routine"
        description="Stack habits in an uninterrupted flow to minimize decision fatigue."
        maxWidth="md"
      >
        <form onSubmit={handleCreateRoutine} className="space-y-4 py-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Routine Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Morning Miracle, Post-Work Wind-Down"
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
              placeholder="What is the objective of this ritual?"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Preferred Time
              </label>
              <select
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Total Duration (Mins)
              </label>
              <input
                type="number"
                min={5}
                value={targetDuration}
                onChange={(e) => setTargetDuration(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          {/* Select Habit Sequence */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Select Habits in Desired Sequence *
            </label>
            <div className="max-h-44 overflow-y-auto space-y-1.5 border border-slate-200 dark:border-slate-800 rounded-xl p-2 bg-slate-50 dark:bg-slate-800/40">
              {habits.map((h) => {
                const isSelected = selectedHabitIds.includes(h.id);
                const orderIndex = selectedHabitIds.indexOf(h.id);

                return (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => {
                      setSelectedHabitIds((prev) =>
                        prev.includes(h.id) ? prev.filter((id) => id !== h.id) : [...prev, h.id]
                      );
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition ${
                      isSelected
                        ? "bg-indigo-600 text-white font-semibold"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    <span>{h.title}</span>
                    {isSelected && (
                      <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
                        Step #{orderIndex + 1}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={isSubmitting || selectedHabitIds.length === 0}
            >
              {isSubmitting ? "Creating..." : "Save Routine"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
