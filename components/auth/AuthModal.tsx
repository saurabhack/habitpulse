"use client";

import React, { useState, useMemo } from "react";
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
  Check,
  X,
} from "lucide-react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authModalMode, login, register } = useAuth();

  const [mode, setMode] = useState<"login" | "register" | "forgot-password">(authModalMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Field touched states for validation
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);

  // Sync mode with parent openAuthModal calls
  React.useEffect(() => {
    setMode(authModalMode);
    setErrorMsg("");
    setSuccessMsg("");
    setEmailTouched(false);
    setPasswordTouched(false);
    setConfirmPasswordTouched(false);
    setNameTouched(false);
  }, [authModalMode, isAuthModalOpen]);

  // Validation rules
  const isEmailValid = useMemo(() => EMAIL_REGEX.test(email.trim()), [email]);
  const isPasswordValid = useMemo(() => password.length >= 6, [password]);
  const isNameValid = useMemo(() => displayName.trim().length >= 2, [displayName]);
  const doPasswordsMatch = useMemo(
    () => password.length > 0 && password === confirmPassword,
    [password, confirmPassword]
  );

  const isLoginValid = isEmailValid && password.length >= 1;
  const isRegisterValid = isNameValid && isEmailValid && isPasswordValid && doPasswordsMatch;

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailTouched(true);
    setPasswordTouched(true);

    if (!isLoginValid) {
      if (!isEmailValid) {
        setErrorMsg("Please enter a valid email address (e.g. name@example.com).");
      } else {
        setErrorMsg("Please enter your password.");
      }
      return;
    }

    setErrorMsg("");
    setIsSubmitting(true);

    const res = await login(email.trim(), password);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.error || "Login failed. Please check your credentials.");
    } else {
      closeAuthModal();
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameTouched(true);
    setEmailTouched(true);
    setPasswordTouched(true);
    setConfirmPasswordTouched(true);

    if (!isRegisterValid) {
      if (!isNameValid) {
        setErrorMsg("Full name must be at least 2 characters.");
      } else if (!isEmailValid) {
        setErrorMsg("Please enter a valid email address (e.g. name@example.com).");
      } else if (!isPasswordValid) {
        setErrorMsg("Password must be at least 6 characters long.");
      } else if (!doPasswordsMatch) {
        setErrorMsg("Passwords do not match.");
      }
      return;
    }

    setErrorMsg("");
    setIsSubmitting(true);
    const res = await register(email.trim(), password, displayName.trim());
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.error || "Registration failed.");
    } else {
      closeAuthModal();
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailTouched(true);

    if (!isEmailValid) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setErrorMsg("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
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
      setErrorMsg("Network error occurred. Please try again.");
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
    <Modal isOpen={isAuthModalOpen} onClose={closeAuthModal} maxWidth="md">
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
          <form onSubmit={handleLoginSubmit} className="space-y-4 animate-in fade-in" noValidate>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMsg) setErrorMsg("");
                  }}
                  onBlur={() => setEmailTouched(true)}
                  placeholder="name@example.com"
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 bg-white dark:bg-slate-800 transition ${
                    emailTouched && !isEmailValid && email.length > 0
                      ? "border-rose-400 focus:ring-rose-500"
                      : "border-slate-200 dark:border-slate-800 focus:ring-indigo-500"
                  }`}
                  required
                />
              </div>
              {emailTouched && !isEmailValid && email.length > 0 && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                  <X className="w-3 h-3" /> Please enter a valid email format (e.g. name@domain.com)
                </p>
              )}
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
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg("");
                  }}
                  onBlur={() => setPasswordTouched(true)}
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
              {passwordTouched && password.length === 0 && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                  <X className="w-3 h-3" /> Password is required
                </p>
              )}
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
                <span>Instant Demo Login</span>
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
          <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-in fade-in" noValidate>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Display Name / Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => {
                    setDisplayName(e.target.value);
                    if (errorMsg) setErrorMsg("");
                  }}
                  onBlur={() => setNameTouched(true)}
                  placeholder="e.g. Alex Johnson"
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 bg-white dark:bg-slate-800 transition ${
                    nameTouched && !isNameValid
                      ? "border-rose-400 focus:ring-rose-500"
                      : "border-slate-200 dark:border-slate-800 focus:ring-indigo-500"
                  }`}
                  required
                />
              </div>
              {nameTouched && !isNameValid && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                  <X className="w-3 h-3" /> Name must be at least 2 characters
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMsg) setErrorMsg("");
                  }}
                  onBlur={() => setEmailTouched(true)}
                  placeholder="name@example.com"
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 bg-white dark:bg-slate-800 transition ${
                    emailTouched && !isEmailValid
                      ? "border-rose-400 focus:ring-rose-500"
                      : "border-slate-200 dark:border-slate-800 focus:ring-indigo-500"
                  }`}
                  required
                />
              </div>
              {emailTouched && !isEmailValid && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                  <X className="w-3 h-3" /> Please enter a valid email format
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMsg) setErrorMsg("");
                    }}
                    onBlur={() => setPasswordTouched(true)}
                    placeholder="Min 6 chars"
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 bg-white dark:bg-slate-800 transition ${
                      passwordTouched && !isPasswordValid
                        ? "border-rose-400 focus:ring-rose-500"
                        : "border-slate-200 dark:border-slate-800 focus:ring-indigo-500"
                    }`}
                    required
                  />
                </div>
                {passwordTouched && !isPasswordValid && (
                  <p className="text-[10px] text-rose-500 mt-1">Min 6 characters</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errorMsg) setErrorMsg("");
                    }}
                    onBlur={() => setConfirmPasswordTouched(true)}
                    placeholder="Confirm"
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 bg-white dark:bg-slate-800 transition ${
                      confirmPasswordTouched && !doPasswordsMatch
                        ? "border-rose-400 focus:ring-rose-500"
                        : "border-slate-200 dark:border-slate-800 focus:ring-indigo-500"
                    }`}
                    required
                  />
                </div>
                {confirmPasswordTouched && !doPasswordsMatch && (
                  <p className="text-[10px] text-rose-500 mt-1">Passwords must match</p>
                )}
                {confirmPasswordTouched && doPasswordsMatch && (
                  <p className="text-[10px] text-emerald-600 mt-1 flex items-center gap-0.5">
                    <Check className="w-3 h-3" /> Passwords match
                  </p>
                )}
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
          <form onSubmit={handleResetSubmit} className="space-y-4 animate-in fade-in" noValidate>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Account Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMsg) setErrorMsg("");
                  }}
                  onBlur={() => setEmailTouched(true)}
                  placeholder="name@example.com"
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 bg-white dark:bg-slate-800 transition ${
                    emailTouched && !isEmailValid
                      ? "border-rose-400 focus:ring-rose-500"
                      : "border-slate-200 dark:border-slate-800 focus:ring-indigo-500"
                  }`}
                  required
                />
              </div>
              {emailTouched && !isEmailValid && (
                <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                  <X className="w-3 h-3" /> Please enter a valid email format
                </p>
              )}
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