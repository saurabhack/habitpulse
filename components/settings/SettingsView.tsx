"use client";

import React, { useState } from "react";
import { UserSettings } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/components/providers/ThemeProvider";
import {
  Settings,
  Download,
  Moon,
  Sun,
  Laptop,
  Shield,
  Volume2,
  Calendar,
  Trash2,
  Check,
  FileSpreadsheet,
  FileCode,
} from "lucide-react";

interface SettingsViewProps {
  settings: UserSettings;
  onRefresh: () => void;
}

export function SettingsView({ settings, onRefresh }: SettingsViewProps) {
  const { theme, setTheme } = useTheme();
  const [weekStartsOn, setWeekStartsOn] = useState(settings.week_starts_on || "monday");
  const [soundEffects, setSoundEffects] = useState(settings.sound_effects ?? true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          week_starts_on: weekStartsOn,
          sound_effects: soundEffects,
          theme,
        }),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
        onRefresh();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = (format: "csv" | "json") => {
    window.location.href = `/api/export?format=${format}`;
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Preferences & Data Governance
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Personalize interface behaviors, export historical records, and manage privacy
        </p>
      </div>

      {/* 1. Interface & Theme */}
      <Card className="p-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Sun className="w-4 h-4 text-amber-500" />
          <span>Appearance & Theme</span>
        </h3>

        <div className="grid grid-cols-3 gap-3 max-w-md">
          <button
            type="button"
            onClick={() => setTheme("light")}
            className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
              theme === "light"
                ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold"
                : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
            }`}
          >
            <Sun className="w-5 h-5 text-amber-500" />
            <span className="text-xs">Light</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme("dark")}
            className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
              theme === "dark"
                ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold"
                : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
            }`}
          >
            <Moon className="w-5 h-5 text-indigo-400" />
            <span className="text-xs">Dark</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme("system")}
            className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
              theme === "system"
                ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold"
                : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
            }`}
          >
            <Laptop className="w-5 h-5 text-slate-500" />
            <span className="text-xs">System</span>
          </button>
        </div>
      </Card>

      {/* 2. Schedule & Audio Preferences */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span>Regional & Calendar Preferences</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              First Day of the Week
            </label>
            <select
              value={weekStartsOn}
              onChange={(e) => setWeekStartsOn(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="monday">Monday (Standard)</option>
              <option value="sunday">Sunday (US / Traditional)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Timezone
            </label>
            <input
              type="text"
              value={Intl.DateTimeFormat().resolvedOptions().timeZone}
              disabled
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-indigo-600" />
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Auditory Completion Feedback
              </p>
              <p className="text-[11px] text-slate-500">Play celebratory tones on habit completion</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={soundEffects}
            onChange={(e) => setSoundEffects(e.target.checked)}
            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
          />
        </div>

        <div className="pt-2">
          <Button variant="primary" size="sm" onClick={handleSaveSettings} disabled={isSaving}>
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4 mr-1 text-emerald-300" />
                <span>Saved!</span>
              </>
            ) : (
              <span>{isSaving ? "Saving..." : "Save Preferences"}</span>
            )}
          </Button>
        </div>
      </Card>

      {/* 3. Data Export & Portability */}
      <Card className="p-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
          <Download className="w-4 h-4 text-emerald-600" />
          <span>Data Portability & Export</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Your habit and journal records are strictly your personal property. Download full backups anytime.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("csv")}
            className="rounded-xl flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Download Habit History (CSV)</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport("json")}
            className="rounded-xl flex items-center gap-1.5"
          >
            <FileCode className="w-4 h-4 text-indigo-600" />
            <span>Complete Account Backup (JSON)</span>
          </Button>
        </div>
      </Card>

      {/* 4. Privacy & Data Isolation */}
      <Card className="p-6 border-rose-200 dark:border-rose-950/60 bg-rose-50/20 dark:bg-rose-950/10">
        <h3 className="text-base font-bold text-rose-800 dark:text-rose-300 mb-1 flex items-center gap-2">
          <Shield className="w-4 h-4 text-rose-600" />
          <span>Security & Data Isolation</span>
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
          Protected by PostgreSQL Row Level Security (RLS) and encrypted database storage. Your habit check-ins and private reflections are never shared with third parties or monetized.
        </p>
      </Card>
    </div>
  );
}
