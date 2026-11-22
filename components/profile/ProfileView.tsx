"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { HabitWithDetails } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  User,
  Mail,
  Calendar,
  CheckCircle2,
  Flame,
  Globe,
  Lock,
  LogOut,
  LogIn,
  UserPlus,
  UserX,
  Sparkles,
  Save,
  ShieldCheck,
  Award,
} from "lucide-react";
import { format } from "date-fns";

interface ProfileViewProps {
  habits: HabitWithDetails[];
}

export function ProfileView({ habits }: ProfileViewProps) {
  const { profile, user, updateProfile, logout, openAuthModal } = useAuth();

  const [displayName, setDisplayName] = useState(profile?.display_name || "Saurabh");
  const [bio, setBio] = useState(profile?.bio || "");
  const [timezone, setTimezone] = useState(profile?.timezone || "UTC");
  const [isUpdating, setIsUpdating] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  React.useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setBio(profile.bio || "");
      setTimezone(profile.timezone || "UTC");
    }
  }, [profile]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    const res = await updateProfile({
      display_name: displayName,
      bio,
      timezone,
    });
    setIsUpdating(false);
    if (res.success) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    }
  };

  const activeHabitsCount = habits.filter((h) => h.status === "active").length;
  const totalCompletions = habits.reduce((acc, h) => acc + h.streakInfo.totalCompletions, 0);
  const maxStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.streakInfo.bestStreak)) : 0;

  if (!user) {
    return (
      <div className="space-y-6 max-w-lg mx-auto py-12 text-center animate-in fade-in">
        <Card className="p-8">
          <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 mx-auto flex items-center justify-center mb-4">
            <UserX className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            You Are Currently Signed Out
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
            Sign in to access your personal habits, synchronize routines, review analytics, and manage your account.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button variant="primary" size="md" onClick={() => openAuthModal("login")} className="w-full sm:w-auto rounded-xl">
              <LogIn className="w-4 h-4 mr-1.5" />
              <span>Sign In to Account</span>
            </Button>
            <Button variant="outline" size="md" onClick={() => openAuthModal("register")} className="w-full sm:w-auto rounded-xl">
              <UserPlus className="w-4 h-4 mr-1.5" />
              <span>Create New Account</span>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          User Profile & Identity
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage your personal credentials, identity, and personal productivity profile
        </p>
      </div>

      {/* 1. Identity Hero Banner */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-500 flex items-center justify-center text-white text-2xl font-extrabold shadow-lg shadow-indigo-500/25 shrink-0">
              {(profile?.display_name || "S")[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {profile?.display_name || "Saurabh"}
                </h3>
                <Badge variant="success" className="gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified</span>
                </Badge>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <Mail className="w-3.5 h-3.5" />
                {profile?.email || "demo@habitpulse.app"}
              </p>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                <Calendar className="w-3.5 h-3.5" />
                Member since {profile?.created_at ? format(new Date(profile.created_at), "MMMM yyyy") : "Recent"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openAuthModal("login")}
              className="rounded-xl text-xs"
            >
              Switch Account
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={logout}
              className="rounded-xl text-xs flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </Button>
          </div>
        </div>

        {/* Lifetime Productivity Stats */}
        <div className="grid grid-cols-3 gap-3 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 text-center">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <span className="text-[10px] font-semibold text-slate-400 block mb-1">Active Habits</span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
              {activeHabitsCount}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <span className="text-[10px] font-semibold text-slate-400 block mb-1">Check-in Sessions</span>
            <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
              {totalCompletions}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <span className="text-[10px] font-semibold text-slate-400 block mb-1">Best Streak Record</span>
            <span className="text-xl font-extrabold text-amber-500 flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 fill-amber-500" />
              {maxStreak}d
            </span>
          </div>
        </div>
      </Card>

      {/* 2. Edit Profile Details */}
      <Card className="p-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-600" />
          <span>Profile Details</span>
        </h3>
        <p className="text-xs text-slate-500 mb-6">Update your display information and personal preferences</p>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address (Primary Identity)
              </label>
              <input
                type="email"
                value={profile?.email || ""}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/60 text-sm text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Bio / Personal Mission
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Tell us about your productivity goals..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Account Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="UTC">UTC (Coordinated Universal Time)</option>
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
            </select>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={isUpdating}
              className="rounded-xl flex items-center gap-1.5"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>Profile Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isUpdating ? "Saving..." : "Save Changes"}</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
