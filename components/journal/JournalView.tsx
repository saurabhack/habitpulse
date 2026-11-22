"use client";

import React, { useState } from "react";
import { JournalEntry, HabitWithDetails, MoodScore } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  BookMarked,
  Plus,
  Smile,
  Trash2,
  Calendar,
  Sparkles,
  Tag,
} from "lucide-react";
import { format } from "date-fns";

interface JournalViewProps {
  entries: JournalEntry[];
  habits: HabitWithDetails[];
  onRefresh: () => void;
}

const MOODS: { score: MoodScore; emoji: string; label: string }[] = [
  { score: 1, emoji: "😫", label: "Tough" },
  { score: 2, emoji: "🙁", label: "Low" },
  { score: 3, emoji: "😐", label: "Neutral" },
  { score: 4, emoji: "😊", label: "Good" },
  { score: 5, emoji: "🚀", label: "Peak" },
];

export function JournalView({ entries, habits, onRefresh }: JournalViewProps) {
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<MoodScore>(4);
  const [selectedHabitId, setSelectedHabitId] = useState<string>("");
  const [tagInput, setTagInput] = useState("");
  const [entryDate, setEntryDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const tags = tagInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entry_date: entryDate,
          content,
          mood,
          habit_id: selectedHabitId || null,
          tags,
        }),
      });

      if (res.ok) {
        setContent("");
        setTagInput("");
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (entryId: string) => {
    if (!confirm("Delete this journal entry?")) return;
    try {
      await fetch(`/api/journal/${entryId}`, { method: "DELETE" });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Reflective Journal
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Record mental clarity, obstacles, victories, and mood patterns alongside your habits
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* New Reflection Form */}
        <Card className="p-6 lg:col-span-1 h-fit">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
            <BookMarked className="w-4 h-4 text-indigo-600" />
            <span>Today's Reflection</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mood Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                How do you feel today?
              </label>
              <div className="flex items-center justify-between gap-1">
                {MOODS.map((m) => (
                  <button
                    key={m.score}
                    type="button"
                    onClick={() => setMood(m.score)}
                    className={`flex flex-col items-center p-2 rounded-2xl border transition ${
                      mood === m.score
                        ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950 scale-105"
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-xl">{m.emoji}</span>
                    <span className="text-[10px] font-medium text-slate-500 mt-1">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Reflection & Insights *
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What went well today? What friction did you encounter?"
                rows={4}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Associate Habit (Optional)
              </label>
              <select
                value={selectedHabitId}
                onChange={(e) => setSelectedHabitId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">General Daily Reflection</option>
                {habits.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tags (Comma-separated)
              </label>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="e.g. workout, energy, focus"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="w-full rounded-xl"
            >
              {isSubmitting ? "Saving..." : "Save Reflection"}
            </Button>
          </form>
        </Card>

        {/* Reflection Timeline Stream */}
        <div className="lg:col-span-2 space-y-4">
          {entries.length === 0 ? (
            <Card className="p-12 text-center border-dashed">
              <BookMarked className="w-10 h-10 text-indigo-500 mx-auto mb-2 opacity-50" />
              <p className="text-sm text-slate-500">No reflections logged yet.</p>
              <p className="text-xs text-slate-400 mt-1">
                Journaling after completing habits solidifies cognitive reinforcement.
              </p>
            </Card>
          ) : (
            entries.map((entry) => {
              const moodObj = MOODS.find((m) => m.score === entry.mood);
              const habit = habits.find((h) => h.id === entry.habit_id);

              return (
                <Card key={entry.id} className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{moodObj?.emoji || "📝"}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {format(new Date(entry.entry_date), "MMMM d, yyyy")}
                          </span>
                          {habit && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                              {habit.title}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400">Mood: {moodObj?.label || "Neutral"}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pl-8 mb-3 whitespace-pre-wrap">
                    {entry.content}
                  </p>

                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pl-8">
                      {entry.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center gap-1"
                        >
                          <Tag className="w-2.5 h-2.5" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
