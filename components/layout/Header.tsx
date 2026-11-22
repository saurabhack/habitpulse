"use client";

import React, { useState, useRef, useEffect } from "react";
import { Menu, Plus, Timer, Moon, Sun, User, LogOut, LogIn, UserPlus, Settings, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useAuth } from "@/components/providers/AuthProvider";
import { format } from "date-fns";

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenNewHabit: () => void;
  onOpenFocusTimer: () => void;
  onNavigateToProfile?: () => void;
  onNavigateToSettings?: () => void;
}

export function Header({
  onOpenMobileMenu,
  onOpenNewHabit,
  onOpenFocusTimer,
  onNavigateToProfile,
  onNavigateToSettings,
}: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { profile, user, logout, openAuthModal } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentDateStr = format(new Date(), "EEEE, MMMM d, yyyy");

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = profile?.display_name || "Saurabh";
  const initials = displayName[0]?.toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
      {/* Mobile Toggle + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 md:hidden hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            Daily Workspace
          </p>
          <h2 className="text-sm md:text-base font-bold text-slate-800 dark:text-slate-200">
            {currentDateStr}
          </h2>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5">
        {/* Focus Timer Trigger */}
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenFocusTimer}
          className="hidden sm:inline-flex items-center gap-2 rounded-xl"
        >
          <Timer className="w-4 h-4 text-amber-500" />
          <span>Focus Timer</span>
        </Button>

        {/* Quick Add Habit */}
        <Button
          variant="primary"
          size="sm"
          onClick={onOpenNewHabit}
          className="rounded-xl flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Habit</span>
        </Button>

        {/* Dark/Light Theme Toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          title="Toggle Theme"
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Account Dropdown */}
        <div className="relative pl-2 border-l border-slate-200 dark:border-slate-800" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 p-1 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition focus:outline-none"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-xs">
              {initials}
            </div>
            <span className="hidden lg:inline text-xs font-bold text-slate-700 dark:text-slate-300">
              {displayName}
            </span>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {displayName}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {profile?.email || "demo@habitpulse.app"}
                </p>
              </div>

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  if (onNavigateToProfile) onNavigateToProfile();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition"
              >
                <User className="w-4 h-4 text-indigo-600" />
                <span>My Profile</span>
              </button>

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  if (onNavigateToSettings) onNavigateToSettings();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition"
              >
                <Settings className="w-4 h-4 text-slate-500" />
                <span>Preferences</span>
              </button>

              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  openAuthModal("login");
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition"
              >
                <LogIn className="w-4 h-4 text-emerald-600" />
                <span>Sign In / Switch</span>
              </button>

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  openAuthModal("register");
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition"
              >
                <UserPlus className="w-4 h-4 text-indigo-600" />
                <span>Register New Account</span>
              </button>

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
