"use client";

import React from "react";
import {
  LayoutDashboard,
  CheckCircle2,
  ListTodo,
  Workflow,
  Target,
  CalendarDays,
  LineChart,
  BookMarked,
  Settings,
  Sparkles,
  Flame,
  UserCheck,
  LogOut,
  LogIn,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/AuthProvider";

export type NavItemKey =
  | "overview"
  | "today"
  | "habits"
  | "routines"
  | "goals"
  | "calendar"
  | "analytics"
  | "journal"
  | "profile"
  | "settings";

interface SidebarProps {
  activeTab: NavItemKey;
  onSelectTab: (tab: NavItemKey) => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ activeTab, onSelectTab, isMobileOpen, onCloseMobile }: SidebarProps) {
  const { user, profile, logout, openAuthModal } = useAuth();

  const navItems: { key: NavItemKey; label: string; icon: React.ElementType }[] = [
    { key: "overview", label: "Overview", icon: LayoutDashboard },
    { key: "today", label: "Today", icon: CheckCircle2 },
    { key: "habits", label: "My Habits", icon: ListTodo },
    { key: "routines", label: "Routines", icon: Workflow },
    { key: "goals", label: "Goals", icon: Target },
    { key: "calendar", label: "Calendar", icon: CalendarDays },
    { key: "analytics", label: "Insights & Analytics", icon: LineChart },
    { key: "journal", label: "Journal", icon: BookMarked },
    { key: "profile", label: "Profile", icon: UserCheck },
    { key: "settings", label: "Settings", icon: Settings },
  ];

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "User";
  const initials = displayName[0]?.toUpperCase() || "U";

  const content = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 w-64 p-4 select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-3 py-4 mb-4">
        <div className="h-10 w-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
          <Flame className="w-6 h-6 fill-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            HabitPulse
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              PRO
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">Personal Productivity</p>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => {
                onSelectTab(item.key);
                if (onCloseMobile) onCloseMobile();
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-left",
                isActive
                  ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-200"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 transition-colors",
                  isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"
                )}
              />
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Bottom User Status & Logout */}
      <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800">
        {user ? (
          <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
            <div
              onClick={() => {
                onSelectTab("profile");
                if (onCloseMobile) onCloseMobile();
              }}
              className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {displayName}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {profile?.email || user.email}
                </p>
              </div>
            </div>

            <button
              onClick={async (e) => {
                e.stopPropagation();
                await logout();
              }}
              title="Sign Out"
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition shrink-0 ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              openAuthModal("login");
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 transition border border-indigo-200/60 dark:border-indigo-800/60"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Account</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex shrink-0 h-screen sticky top-0">{content}</aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onCloseMobile} />
          <div className="relative z-10 w-64 h-full shadow-2xl animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
