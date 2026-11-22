"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserProfile, AuthSession } from "@/types";

interface AuthContextType {
  user: { id: string; email: string } | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: "login" | "register" | "forgot-password";
  openAuthModal: (mode?: "login" | "register" | "forgot-password") => void;
  closeAuthModal: () => void;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, displayName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isLoading: true,
  isAuthModalOpen: false,
  authModalMode: "login",
  openAuthModal: () => {},
  closeAuthModal: () => {},
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
  updateProfile: async () => ({ success: false }),
  refreshSession: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register" | "forgot-password">("login");

  const refreshSession = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const json = await res.json();
      if (json.success && json.data) {
        setUser(json.data.user);
        setProfile(json.data.profile);
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch (e) {
      console.error("Failed to load auth session:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const openAuthModal = (mode: "login" | "register" | "forgot-password" = "login") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (email: string, password?: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: password || "demo" }),
      });
      const json = await res.json();
      if (json.success) {
        setUser(json.data.user);
        setProfile(json.data.profile);
        setIsAuthModalOpen(false);
        return { success: true };
      }
      return { success: false, error: json.error || "Login failed" };
    } catch (e: any) {
      return { success: false, error: e.message || "Network error" };
    }
  };

  const register = async (email: string, password: string, displayName: string) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, displayName }),
      });
      const json = await res.json();
      if (json.success) {
        setUser(json.data.user);
        setProfile(json.data.profile);
        setIsAuthModalOpen(false);
        return { success: true };
      }
      return { success: false, error: json.error || "Registration failed" };
    } catch (e: any) {
      return { success: false, error: e.message || "Network error" };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setProfile(null);
    } catch (e) {
      console.error("Failed to logout:", e);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        setProfile(json.data);
        return { success: true };
      }
      return { success: false, error: json.error || "Update failed" };
    } catch (e: any) {
      return { success: false, error: e.message || "Network error" };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        updateProfile,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
