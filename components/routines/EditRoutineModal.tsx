"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Routine, RoutineHabitItem, HabitWithDetails } from "@/types";
import { CheckCircle2 } from "lucide-react";

interface EditRoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
  routine: (Routine & { items: RoutineHabitItem[] }) | null;
  habits: HabitWithDetails[];
  onRoutineUpdated: () => void;
}

export function EditRoutineModal({
  isOpen,
  onClose,
  routine,
  habits,
  onRoutineUpdated,
}: EditRoutineModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [preferredTime, setPreferredTime] = useState<"morning" | "afternoon" | "evening">("morning");
  const [targetDuration, setTargetDuration] = useState(30);
  const [selectedHabitIds, setSelectedHabitIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (routine) {
      setTitle(routine.title);
      setDescription(routine.description || "");
      setPreferredTime(routine.preferred_time as any);
      setTargetDuration(routine.target_duration_minutes);
      setSelectedHabitIds(routine.items.map((i) => i.habit_id));
      setErrorMsg("");
    }
  }, [routine, isOpen]);

  if (!isOpen || !routine) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg("Routine title is required.");
      return;
    }
    if (selectedHabitIds.length === 0) {
      setErrorMsg("Please select at least one habit for this routine.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch(`/api/routines/${routine.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          preferred_time: preferredTime,
          target_duration_minutes: Number(targetDuration),
          habit_ids: selectedHabitIds,
        }),
      });

      if (res.ok) {
        onRoutineUpdated();
        onClose();
      } else {
        const json = await res.json();
        setErrorMsg(json.error || "Failed to update routine.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error updating routine.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Routine" description="Update ritual sequence and parameters" maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4 py-2">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs border border-rose-200">
            {errorMsg}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Routine Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
              Duration (Mins)
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

        {/* Habit Sequence */}
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
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" disabled={isSubmitting || selectedHabitIds.length === 0}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
