"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Category, HabitType, TrackingType, RecurrenceType, TimeOfDay } from "@/types";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  ShieldAlert,
  Hash,
  Clock,
  Calendar,
  Bell,
  Check,
} from "lucide-react";
import { format } from "date-fns";

interface HabitWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onHabitCreated: () => void;
}

const ICONS = ["CheckCircle", "Dumbbell", "BookOpen", "Droplets", "Smile", "Sun", "Flame", "Zap", "Heart", "Briefcase"];
const COLORS = ["#4F46E5", "#10B981", "#3B82F6", "#8B5CF6", "#F59E0B", "#EF4444", "#06B6D4", "#EC4899"];

export function HabitWizardModal({ isOpen, onClose, categories, onHabitCreated }: HabitWizardModalProps) {
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [icon, setIcon] = useState("CheckCircle");
  const [color, setColor] = useState("#4F46E5");
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("anytime");

  const [habitType, setHabitType] = useState<HabitType>("positive");
  const [trackingType, setTrackingType] = useState<TrackingType>("boolean");
  const [targetOperator, setTargetOperator] = useState<"gte" | "lte">("gte");
  const [targetValue, setTargetValue] = useState<number>(1);
  const [targetUnit, setTargetUnit] = useState<string>("times");

  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>("daily");
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [intervalDays, setIntervalDays] = useState<number>(2);
  const [startDate, setStartDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState<string>("");

  const [reminderTime, setReminderTime] = useState<string>("09:00");
  const [enableReminder, setEnableReminder] = useState<boolean>(true);

  const resetForm = () => {
    setStep(1);
    setTitle("");
    setDescription("");
    setCategoryId("");
    setIcon("CheckCircle");
    setColor("#4F46E5");
    setTimeOfDay("anytime");
    setHabitType("positive");
    setTrackingType("boolean");
    setTargetOperator("gte");
    setTargetValue(1);
    setTargetUnit("times");
    setRecurrenceType("daily");
    setDaysOfWeek([0, 1, 2, 3, 4, 5, 6]);
    setStartDate(format(new Date(), "yyyy-MM-dd"));
    setEndDate("");
  };

  const handleNext = () => {
    if (step === 1 && !title.trim()) return;
    setStep((prev) => Math.min(prev + 1, 6));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        title,
        description: description || undefined,
        category_id: categoryId || null,
        habit_type: habitType,
        tracking_type: trackingType,
        target_operator: targetOperator,
        target_value: Number(targetValue),
        target_unit: targetUnit,
        icon,
        color,
        time_of_day: timeOfDay,
        start_date: startDate,
        end_date: endDate || null,
        schedule: {
          recurrence_type: recurrenceType,
          days_of_week: daysOfWeek,
          interval_days: recurrenceType === "interval" ? intervalDays : undefined,
        },
      };

      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        resetForm();
        onClose();
        onHabitCreated();
      }
    } catch (e) {
      console.error("Failed to create habit:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDay = (day: number) => {
    if (daysOfWeek.includes(day)) {
      if (daysOfWeek.length > 1) {
        setDaysOfWeek(daysOfWeek.filter((d) => d !== day));
      }
    } else {
      setDaysOfWeek([...daysOfWeek, day].sort());
    }
  };

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Habit"
      description={`Step ${step} of 6 — ${
        step === 1
          ? "Basic Information"
          : step === 2
          ? "Habit Type"
          : step === 3
          ? "Tracking Method & Goal"
          : step === 4
          ? "Scheduling & Cadence"
          : step === 5
          ? "Reminders"
          : "Summary & Confirmation"
      }`}
      maxWidth="lg"
    >
      <div className="py-2">
        {/* Progress Dots */}
        <div className="flex items-center gap-1.5 mb-6">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full flex-1 transition-all ${
                s <= step ? "bg-indigo-600" : "bg-slate-200 dark:bg-slate-800"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Basic Information */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Habit Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Read 20 Pages, Morning Run, Meditation"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Why do you want to build this habit?"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">General</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Preferred Time of Day
                </label>
                <select
                  value={timeOfDay}
                  onChange={(e) => setTimeOfDay(e.target.value as TimeOfDay)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="anytime">Anytime</option>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                </select>
              </div>
            </div>

            {/* Color Accent Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Color Accent
              </label>
              <div className="flex items-center gap-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center ${
                      color === c ? "border-slate-900 dark:border-white scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: c }}
                  >
                    {color === c && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Habit Type (Positive vs Negative) */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Specify whether this is a positive habit you want to cultivate or a negative habit you want to reduce or eliminate.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                type="button"
                onClick={() => {
                  setHabitType("positive");
                  setTargetOperator("gte");
                }}
                className={`p-4 rounded-2xl border-2 text-left transition flex flex-col justify-between h-36 ${
                  habitType === "positive"
                    ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                }`}
              >
                <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Positive Habit</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Build consistency: exercise, reading, water.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setHabitType("negative");
                  setTargetOperator("lte");
                }}
                className={`p-4 rounded-2xl border-2 text-left transition flex flex-col justify-between h-36 ${
                  habitType === "negative"
                    ? "border-rose-500 bg-rose-50/50 dark:bg-rose-950/30"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                }`}
              >
                <div className="h-10 w-10 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Negative Habit</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Eliminate or limit: social media, caffeine.
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Tracking Method */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select how you will record progress for this habit.
            </p>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setTrackingType("boolean");
                  setTargetValue(1);
                  setTargetUnit("times");
                }}
                className={`p-3 rounded-2xl border-2 text-center transition ${
                  trackingType === "boolean"
                    ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                <CheckCircle className="w-6 h-6 mx-auto mb-1 text-indigo-600" />
                <span className="text-xs font-bold block text-slate-900 dark:text-slate-100">Yes / No</span>
                <span className="text-[10px] text-slate-500">Binary check</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTrackingType("numeric");
                  setTargetValue(8);
                  setTargetUnit("glasses");
                }}
                className={`p-3 rounded-2xl border-2 text-center transition ${
                  trackingType === "numeric"
                    ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                <Hash className="w-6 h-6 mx-auto mb-1 text-indigo-600" />
                <span className="text-xs font-bold block text-slate-900 dark:text-slate-100">Numeric</span>
                <span className="text-[10px] text-slate-500">Count, pages</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTrackingType("duration");
                  setTargetValue(30);
                  setTargetUnit("minutes");
                }}
                className={`p-3 rounded-2xl border-2 text-center transition ${
                  trackingType === "duration"
                    ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40"
                    : "border-slate-200 dark:border-slate-800"
                }`}
              >
                <Clock className="w-6 h-6 mx-auto mb-1 text-indigo-600" />
                <span className="text-xs font-bold block text-slate-900 dark:text-slate-100">Duration</span>
                <span className="text-[10px] text-slate-500">Timer, mins</span>
              </button>
            </div>

            {/* Target configuration */}
            {trackingType !== "boolean" && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Daily Target Value
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={targetValue}
                    onChange={(e) => setTargetValue(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Unit of Measurement
                  </label>
                  <input
                    type="text"
                    value={targetUnit}
                    onChange={(e) => setTargetUnit(e.target.value)}
                    placeholder="e.g. pages, minutes, km"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Scheduling */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              When do you plan to perform this habit?
            </p>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setRecurrenceType("daily")}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                  recurrenceType === "daily"
                    ? "bg-indigo-600 text-white border-transparent"
                    : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                Every Day
              </button>
              <button
                type="button"
                onClick={() => {
                  setRecurrenceType("weekdays");
                  setDaysOfWeek([1, 2, 3, 4, 5]);
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                  recurrenceType === "weekdays"
                    ? "bg-indigo-600 text-white border-transparent"
                    : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                Weekdays (M-F)
              </button>
              <button
                type="button"
                onClick={() => setRecurrenceType("interval")}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition ${
                  recurrenceType === "interval"
                    ? "bg-indigo-600 text-white border-transparent"
                    : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                Interval / X Days
              </button>
            </div>

            {/* Custom Day Chips */}
            {recurrenceType !== "interval" && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Scheduled Days
                </label>
                <div className="flex items-center justify-between gap-1">
                  {dayLabels.map((lbl, idx) => {
                    const isSelected = daysOfWeek.includes(idx);
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleDay(idx)}
                        className={`h-9 w-9 rounded-xl text-xs font-bold transition flex items-center justify-center ${
                          isSelected
                            ? "bg-indigo-600 text-white shadow-xs"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {lbl[0]}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Reminders */}
        {step === 5 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Daily Reminder</h4>
                  <p className="text-xs text-slate-500">Receive a timely push prompt</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={enableReminder}
                onChange={(e) => setEnableReminder(e.target.checked)}
                className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </div>

            {enableReminder && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reminder Time
                </label>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}
          </div>
        )}

        {/* Step 6: Confirmation & Summary */}
        {step === 6 && (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Habit Name</span>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Type</span>
                <span className="text-xs font-semibold capitalize px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-600">
                  {habitType} Habit
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Target</span>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {trackingType === "boolean" ? "Completion (1 session)" : `${targetValue} ${targetUnit}`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Schedule</span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
                  {recurrenceType}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Start Date</span>
                <span className="text-xs font-mono text-slate-600 dark:text-slate-400">{startDate}</span>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800 mt-6">
          {step > 1 ? (
            <Button variant="outline" size="sm" onClick={handleBack} className="rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span>Back</span>
            </Button>
          ) : (
            <div />
          )}

          {step < 6 ? (
            <Button
              variant="primary"
              size="sm"
              onClick={handleNext}
              disabled={step === 1 && !title.trim()}
              className="rounded-xl"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={isSubmitting}
              className="rounded-xl px-6 bg-emerald-600 hover:bg-emerald-700"
            >
              <Check className="w-4 h-4 mr-1" />
              <span>{isSubmitting ? "Creating..." : "Save Habit"}</span>
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
