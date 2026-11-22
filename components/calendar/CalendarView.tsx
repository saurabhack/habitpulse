"use client";

import React, { useState } from "react";
import { HabitWithDetails } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  CalendarX,
  XCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
} from "date-fns";

interface CalendarViewProps {
  habits: HabitWithDetails[];
  onRefresh: () => void;
}

export function CalendarView({ habits, onRefresh }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const daysInGrid = eachDayOfInterval({ start: startDate, end: endDate });

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const jumpToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Calendar Overview
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Review historical consistency and explore daily check-ins
          </p>
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={jumpToday} className="rounded-xl text-xs">
            Today
          </Button>
          <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-0.5">
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold px-3 min-w-[120px] text-center text-slate-800 dark:text-slate-200">
              {format(currentMonth, "MMMM yyyy")}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid (2 Cols on Desktop) */}
        <Card className="p-6 lg:col-span-2">
          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <span key={day} className="text-xs font-bold text-slate-400 py-1 uppercase">
                {day}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {daysInGrid.map((day, i) => {
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isTodayDate = isToday(day);

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(day)}
                  className={`min-h-[70px] p-2 rounded-2xl border text-left transition flex flex-col justify-between ${
                    isSelected
                      ? "border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-950/30"
                      : isCurrentMonth
                      ? "border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900"
                      : "opacity-40 border-transparent bg-slate-50/50 dark:bg-slate-950/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                        isTodayDate
                          ? "bg-indigo-600 text-white"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {format(day, "d")}
                    </span>
                  </div>

                  {/* Status Indicator Dots */}
                  <div className="flex items-center gap-1 mt-auto pt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Selected Day Details Panel */}
        <Card className="p-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
            <div>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold uppercase tracking-wider">
                Day Breakdown
              </p>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {format(selectedDate, "EEEE, MMMM d")}
              </h3>
            </div>
            {isToday(selectedDate) && <Badge variant="success">Today</Badge>}
          </div>

          <div className="space-y-3">
            {habits
              .filter((h) => h.status === "active")
              .map((habit) => {
                // If selected date is today, show todayStatus
                const isSelectedToday = isSameDay(selectedDate, new Date());
                const status = isSelectedToday ? habit.todayStatus : "completed";

                return (
                  <div
                    key={habit.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${habit.color}15`, color: habit.color }}
                      >
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {habit.title}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Target: {habit.target_value} {habit.target_unit}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase shrink-0 ${
                        status === "completed"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                          : status === "skipped"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                );
              })}
          </div>
        </Card>
      </div>
    </div>
  );
}
