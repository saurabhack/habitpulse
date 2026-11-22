"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/components/providers/AuthProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import {
  Flame,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Workflow,
  Timer,
  ShieldCheck,
  Calendar,
  Sun,
  Moon,
  Laptop,
  Check,
  Zap,
} from "lucide-react";
import confetti from "canvas-confetti";

export function LandingView() {
  const { openAuthModal, login } = useAuth();
  const { theme, setTheme } = useTheme();

  // Interactive Live Demo Sample Habit
  const [sampleCompleted, setSampleCompleted] = useState(false);
  const [sampleStreak, setSampleStreak] = useState(6);

  const handleSampleToggle = () => {
    if (!sampleCompleted) {
      setSampleCompleted(true);
      setSampleStreak(7);
      confetti({
        particleCount: 60,
        spread: 55,
        origin: { y: 0.6 },
      });
    } else {
      setSampleCompleted(false);
      setSampleStreak(6);
    }
  };

  const handleInstantDemoLogin = async () => {
    await login("demo@habitpulse.app", "password123");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      {/* 1. Public Navigation Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
              <Flame className="w-5 h-5 fill-white" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-slate-100">
              HabitPulse
            </span>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Toggle Theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => openAuthModal("login")}
              className="text-xs font-semibold rounded-xl"
            >
              Sign In
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => openAuthModal("register")}
              className="text-xs font-bold rounded-xl shadow-md"
            >
              Get Started Free
            </Button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-6 animate-in fade-in slide-in-from-bottom-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>The Intelligent Habit & Productivity System</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 leading-[1.1] mb-6">
            Build Habits That Stick. <br className="hidden sm:inline" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500">
              Driven by Science & Consistency.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            Combines the tactile check-in simplicity of <strong>Streaks</strong>, the resilience formula of <strong>Loop</strong>, the sequencing of <strong>Fabulous</strong>, and milestone tracking of <strong>Strides</strong> in one cohesive workspace.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
            <Button
              variant="primary"
              size="lg"
              onClick={() => openAuthModal("register")}
              className="w-full sm:w-auto px-8 rounded-2xl shadow-lg shadow-indigo-600/20 font-bold text-sm gap-2"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={handleInstantDemoLogin}
              className="w-full sm:w-auto px-8 rounded-2xl text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-sm gap-2"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Explore Instant Demo</span>
            </Button>
          </div>

          {/* Interactive Live Sample Habit Preview */}
          <div className="max-w-md mx-auto">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Try It Live Right Here
            </p>
            <Card className="p-4 sm:p-5 shadow-xl border-indigo-500/20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm transition-all text-left">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold ${sampleCompleted ? "line-through text-slate-500" : "text-slate-900 dark:text-slate-100"}`}>
                      Daily Mindful Meditation
                    </h3>
                    <p className="text-xs text-slate-500">10 mins breathwork · Morning</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-amber-500 font-bold text-xs bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded-xl">
                    <Flame className="w-3.5 h-3.5 fill-amber-500" />
                    <span>{sampleStreak}d</span>
                  </div>

                  <button
                    onClick={handleSampleToggle}
                    className={`w-9 h-9 rounded-2xl border-2 flex items-center justify-center transition-all ${
                      sampleCompleted
                        ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                        : "border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-transparent"
                    }`}
                  >
                    <Check className="w-5 h-5 stroke-[3]" />
                  </button>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span>{sampleCompleted ? "🌟 Completed! Streak updated." : "Tap the checkmark to record progress"}</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">Resilience: 94%</span>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 3. Four Core Value Pillars */}
      <section className="py-16 bg-white dark:bg-slate-900/50 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mb-2">
              Engineered for Long-Term Behavioral Change
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Traditional habit trackers break on a single missed day and demotivate you. HabitPulse uses psychological resilience formulas to help you bounce back.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Pillar 1 */}
            <Card className="p-5 flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center mb-3">
                  <Flame className="w-5 h-5 fill-amber-500" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1">
                  Resilient Habit Strength
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Loop-inspired exponential smoothing score. A planned rest day or single miss gently dampens strength without destroying weeks of hard work.
                </p>
              </div>
            </Card>

            {/* Pillar 2 */}
            <Card className="p-5 flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center mb-3">
                  <Workflow className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1">
                  Routines & Habit Stacking
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Fabulous-inspired sequencing. Chain habits into effortless morning or evening rituals with a step-by-step runner that auto-logs check-ins.
                </p>
              </div>
            </Card>

            {/* Pillar 3 */}
            <Card className="p-5 flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mb-3">
                  <Calendar className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1">
                  12-Week Heatmaps
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  GitHub-style consistency heatmaps, weekday distributions, and factual behavioral observations without invented correlations.
                </p>
              </div>
            </Card>

            {/* Pillar 4 */}
            <Card className="p-5 flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center mb-3">
                  <Timer className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1">
                  Integrated Focus Timer
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Pomodoro sessions with synthesized Web Audio chimes that log completed focus duration straight to linked habits and goals.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 4. Methodology & Privacy Callout */}
      <section className="py-14 max-w-4xl mx-auto px-4 text-center">
        <blockquote className="text-base sm:text-lg font-medium text-slate-700 dark:text-slate-300 italic mb-4">
          "You do not rise to the level of your goals. You fall to the level of your systems."
        </blockquote>
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-8">
          — James Clear, Author of Atomic Habits
        </p>

        <div className="p-6 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-left flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                100% Privacy by Design
              </h4>
              <p className="text-xs text-slate-500">
                Your check-ins and journal entries are secured with PostgreSQL Row Level Security. Never monetized or shared.
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => openAuthModal("register")}
            className="rounded-xl shrink-0 font-bold text-xs"
          >
            Create Your System
          </Button>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="mt-auto py-8 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
        <p>© 2026 HabitPulse · Intelligent Habit Tracking & Personal Productivity Platform</p>
      </footer>
    </div>
  );
}
