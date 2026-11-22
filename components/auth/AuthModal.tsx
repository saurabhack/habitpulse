"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Flame,
} from "lucide-react";

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authModalMode, openAuthModal, login, register } = useAuth();

  const [mode, setMode] = useState<"login" | "register" | "forgot-password">(authModalMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync mode with parent openAuthModal calls
  React.useEffect(() => {
    setMode(authModalMode);
    setErrorMsg("");
    setSuccessMsg("");
  }, [authModalMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    const res = await login(email, password);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.error || "Login failed. Please check your credentials.");
    } else {
      closeAuthModal();
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    const res = await register(email, password, displayName);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.error || "Registration failed.");
    } else {
      closeAuthModal();
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      setIsSubmitting(false);

      if (json.success) {
        setSuccessMsg(json.message);
      } else {
        setErrorMsg(json.error || "Failed to send reset link.");
      }
    } catch {
      setIsSubmitting(false);
      setErrorMsg("Network error occurred.");
    }
  };

  const handleQuickDemoLogin = async () => {
    setIsSubmitting(true);
    const res = await login("demo@habitpulse.app", "password123");
    setIsSubmitting(false);
    if (res.success) {
      closeAuthModal();
    }
  };

  return (
    <Modal
      isOpen={isAuthModalOpen}
      onClose={closeAuthModal}
      maxWidth="md"
    >
      <div className="py-2">
        {/* Brand Icon Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 mx-auto flex items-center justify-center text-white shadow-md shadow-indigo-500/20 mb-3">
            <Flame className="w-7 h-7 fill-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {mode === "login"
              ? "Welcome Back to HabitPulse"
              : mode === "register"
              ? "Create Your Productivity Account"
              : "Reset Password"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {mode === "login"
              ? "Access your personal habits, streaks, and routines"
              : mode === "register"
              ? "Start building lasting positive habits today"
              : "Enter your email to receive recovery instructions"}
          </p>
        </div>

        {/* Error / Success Alerts */}
        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 1. Login Form */}
        {mode === "login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-4 animate-in fade-in">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setMode("forgot-password")}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-500"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl shadow-md font-semibold"
            >
              {isSubmitting ? "Signing in..." : "Sign In to Account"}
            </Button>

            {/* Quick Demo Login Option */}
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={handleQuickDemoLogin}
                disabled={isSubmitting}
                className="w-full rounded-xl border-dashed text-xs flex items-center justify-center gap-1.5 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-100"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Instant Demo Login (Saurabh)</span>
              </Button>
            </div>

            {/* Switch to Register */}
            <p className="text-center text-xs text-slate-500 pt-3">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("register")}
                className="font-bold text-indigo-600 hover:underline"
              >
                Create Account
              </button>
            </p>
          </form>
        )}

        {/* 2. Registration Form */}
        {mode === "register" && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-in fade-in">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Display Name / Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex Johnson"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl shadow-md font-semibold bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </Button>

            <p className="text-center text-xs text-slate-500 pt-3">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="font-bold text-indigo-600 hover:underline"
              >
                Sign In
              </button>
            </p>
          </form>
        )}

        {/* 3. Password Reset Form */}
        {mode === "forgot-password" && (
          <form onSubmit={handleResetSubmit} className="space-y-4 animate-in fade-in">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Account Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl shadow-md font-semibold"
            >
              {isSubmitting ? "Dispatching..." : "Send Reset Link"}
            </Button>

            <p className="text-center text-xs text-slate-500 pt-3">
              Remembered your credentials?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="font-bold text-indigo-600 hover:underline"
              >
                Back to Sign In
              </button>
            </p>
          </form>
        )}
      </div>
    </Modal>
  );
}
