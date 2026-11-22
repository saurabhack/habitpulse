"use client";

import React, { useState, useEffect, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { HabitWithDetails } from "@/types";
import { Play, Pause, RotateCcw, CheckCircle2, BellRing, Sparkles } from "lucide-react";
import { formatTime } from "@/lib/utils";
import confetti from "canvas-confetti";

interface FocusTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  habits: HabitWithDetails[];
  onSessionComplete?: () => void;
}

export function FocusTimerModal({ isOpen, onClose, habits, onSessionComplete }: FocusTimerModalProps) {
  const [selectedDurationMinutes, setSelectedDurationMinutes] = useState<number>(25);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(25 * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [selectedHabitId, setSelectedHabitId] = useState<string>("");
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<string | null>(null);

  // Play synthetic pleasant beep using Web Audio API
  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch {
      // Audio fallback
    }
  };

  useEffect(() => {
    setSecondsRemaining(selectedDurationMinutes * 60);
    setIsActive(false);
    setIsCompleted(false);
  }, [selectedDurationMinutes, isOpen]);

  useEffect(() => {
    if (isActive && secondsRemaining > 0) {
      if (!startTimeRef.current) {
        startTimeRef.current = new Date().toISOString();
      }
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && isActive) {
      setIsActive(false);
      setIsCompleted(true);
      playChime();
      confetti({ particleCount: 80, spread: 60 });
      handleRecordSession();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, secondsRemaining]);

  const handleRecordSession = async () => {
    try {
      await fetch("/api/focus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habit_id: selectedHabitId || null,
          duration_seconds: selectedDurationMinutes * 60,
          completed: true,
          started_at: startTimeRef.current || new Date().toISOString(),
          ended_at: new Date().toISOString(),
        }),
      });
      if (onSessionComplete) onSessionComplete();
    } catch (e) {
      console.error("Failed to record focus session:", e);
    }
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsCompleted(false);
    setSecondsRemaining(selectedDurationMinutes * 60);
    startTimeRef.current = null;
  };

  const totalSeconds = selectedDurationMinutes * 60;
  const progressPercent = Math.round(((totalSeconds - secondsRemaining) / totalSeconds) * 100);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Focus Pomodoro Session"
      description="Deep work and intentional focus paired with your habits."
      maxWidth="md"
    >
      <div className="flex flex-col items-center py-4">
        {/* Preset Duration Buttons */}
        <div className="flex items-center gap-2 mb-6">
          {[15, 25, 45, 60].map((mins) => (
            <button
              key={mins}
              onClick={() => {
                setSelectedDurationMinutes(mins);
              }}
              disabled={isActive}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                selectedDurationMinutes === mins
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              {mins}m
            </button>
          ))}
        </div>

        {/* Circular Display */}
        <div className="relative flex items-center justify-center my-2 select-none">
          <svg width={200} height={200} className="transform -rotate-90">
            <circle
              cx={100}
              cy={100}
              r={86}
              stroke="currentColor"
              strokeWidth={10}
              className="text-slate-100 dark:text-slate-800"
              fill="transparent"
            />
            <circle
              cx={100}
              cy={100}
              r={86}
              stroke="#6366F1"
              strokeWidth={10}
              strokeDasharray={2 * Math.PI * 86}
              strokeDashoffset={2 * Math.PI * 86 - (progressPercent / 100) * (2 * Math.PI * 86)}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-500 ease-linear"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 font-mono">
              {formatTime(secondsRemaining)}
            </span>
            <span className="text-xs text-slate-400 mt-1">
              {isActive ? "Flow state active" : isCompleted ? "Completed!" : "Ready"}
            </span>
          </div>
        </div>

        {/* Habit association picker */}
        <div className="w-full max-w-xs mt-6">
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 text-center">
            Associate with Habit (Optional)
          </label>
          <select
            value={selectedHabitId}
            onChange={(e) => setSelectedHabitId(e.target.value)}
            disabled={isActive}
            className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">None (Independent Focus)</option>
            {habits
              .filter((h) => h.status === "active")
              .map((h) => (
                <option key={h.id} value={h.id}>
                  {h.title} ({h.target_value} {h.target_unit})
                </option>
              ))}
          </select>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-3 mt-6">
          <Button
            variant="outline"
            size="md"
            onClick={resetTimer}
            className="rounded-2xl"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </Button>

          <Button
            variant={isActive ? "secondary" : "primary"}
            size="lg"
            onClick={toggleTimer}
            className="rounded-2xl px-8 shadow-md"
          >
            {isActive ? (
              <>
                <Pause className="w-5 h-5 mr-1" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-1 fill-current" />
                <span>Start</span>
              </>
            )}
          </Button>
        </div>

        {isCompleted && (
          <div className="mt-4 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 flex items-center gap-2 text-xs font-semibold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Focus session completed and recorded to your productivity log!</span>
          </div>
        )}
      </div>
    </Modal>
  );
}
