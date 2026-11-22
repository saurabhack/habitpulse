"use client";

import React, { useState } from "react";
import { HabitWithDetails, HabitStatus, Category } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Plus,
  Flame,
  Pause,
  Play,
  Archive,
  Trash2,
  Calendar,
  Sparkles,
  Search,
  Filter,
} from "lucide-react";

interface HabitListProps {
  habits: HabitWithDetails[];
  categories: Category[];
  onRefresh: () => void;
  onOpenNewHabit: () => void;
}

export function HabitList({ habits, categories, onRefresh, onOpenNewHabit }: HabitListProps) {
  const [statusFilter, setStatusFilter] = useState<HabitStatus | "all">("active");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleTogglePause = async (habit: HabitWithDetails) => {
    const nextStatus = habit.status === "active" ? "paused" : "active";
    try {
      await fetch(`/api/habits/${habit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleArchive = async (habit: HabitWithDetails) => {
    if (!confirm(`Are you sure you want to archive "${habit.title}"? Your history will remain safe.`)) return;
    try {
      await fetch(`/api/habits/${habit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "archived" }),
      });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (habit: HabitWithDetails) => {
    if (!confirm(`Permanently delete "${habit.title}"? This cannot be undone.`)) return;
    try {
      await fetch(`/api/habits/${habit.id}`, { method: "DELETE" });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredHabits = habits.filter((h) => {
    if (statusFilter !== "all" && h.status !== statusFilter) return false;
    if (categoryFilter !== "all" && h.category_id !== categoryFilter) return false;
    if (searchQuery.trim() && !h.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            My Habits
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Configure, manage and review your complete habit portfolio
          </p>
        </div>

        <Button variant="primary" size="sm" onClick={onOpenNewHabit} className="rounded-xl">
          <Plus className="w-4 h-4 mr-1" />
          <span>New Habit</span>
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search habits..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          {(["active", "paused", "archived", "all"] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition ${
                statusFilter === st
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs"
                  : "text-slate-600 dark:text-slate-400"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Habit Cards Grid */}
      {filteredHabits.length === 0 ? (
        <Card className="p-12 text-center border-dashed">
          <p className="text-sm text-slate-500">No habits match your criteria.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHabits.map((habit) => (
            <Card
              key={habit.id}
              className={`p-5 flex flex-col justify-between transition hover:shadow-md ${
                habit.status === "archived" ? "opacity-60 bg-slate-50 dark:bg-slate-900/30" : ""
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${habit.color}18`, color: habit.color }}
                  >
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant={habit.status === "active" ? "success" : "secondary"}>
                      {habit.status}
                    </Badge>
                  </div>
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-1">
                  {habit.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                  {habit.description || `${habit.target_value} ${habit.target_unit} daily`}
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 mb-4 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Streak</span>
                    <span className="text-xs font-bold text-amber-500 flex items-center justify-center gap-0.5">
                      <Flame className="w-3 h-3 fill-amber-500" />
                      {habit.streakInfo.currentStreak}d
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Best</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {habit.streakInfo.bestStreak}d
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Strength</span>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {habit.streakInfo.habitStrength}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                  <Calendar className="w-3 h-3" />
                  Since {habit.start_date}
                </span>

                <div className="flex items-center gap-1">
                  {habit.status !== "archived" && (
                    <button
                      onClick={() => handleTogglePause(habit)}
                      title={habit.status === "active" ? "Pause Habit" : "Resume Habit"}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      {habit.status === "active" ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-500" />}
                    </button>
                  )}

                  {habit.status !== "archived" && (
                    <button
                      onClick={() => handleArchive(habit)}
                      title="Archive Habit"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(habit)}
                    title="Delete Habit"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
