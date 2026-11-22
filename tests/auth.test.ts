import { describe, it, expect } from "vitest";
import { dbStore } from "../lib/db/store";

describe("Authentication & User Management Module", () => {
  it("should have pre-seeded Saurabh profile", () => {
    const profile = dbStore.getProfile();
    expect(profile).toBeDefined();
    expect(profile?.display_name).toBe("Saurabh");
    expect(profile?.email).toBe("demo@habitpulse.app");
  });

  it("should register a new user successfully", () => {
    const testEmail = `newuser_${Date.now()}@example.com`;
    const result = dbStore.registerUser(testEmail, "secret123", "Alex Morgan");

    expect(result.user).toBeDefined();
    expect(result.user.email).toBe(testEmail);
    expect(result.profile.display_name).toBe("Alex Morgan");

    // Verify profile lookup
    const profile = dbStore.getProfile(result.user.id);
    expect(profile?.display_name).toBe("Alex Morgan");
  });

  it("should reject registration with duplicate email", () => {
    const duplicateEmail = "demo@habitpulse.app";
    expect(() => {
      dbStore.registerUser(duplicateEmail, "pass123", "Duplicate User");
    }).toThrow(/already exists/i);
  });

  it("should authenticate existing user with correct password", () => {
    const result = dbStore.authenticateUser("demo@habitpulse.app", "password123");
    expect(result.user).toBeDefined();
    expect(result.profile.display_name).toBe("Saurabh");
  });

  it("should reject authentication with wrong password", () => {
    expect(() => {
      dbStore.authenticateUser("demo@habitpulse.app", "wrongpassword");
    }).toThrow(/invalid email or password/i);
  });

  it("should update profile details properly", () => {
    const updated = dbStore.updateProfile(undefined, {
      display_name: "Saurabh Senior Architect",
      bio: "Engineering high performance software and consistent habits.",
      timezone: "Asia/Kolkata",
    });

    expect(updated.display_name).toBe("Saurabh Senior Architect");
    expect(updated.timezone).toBe("Asia/Kolkata");

    // Clean up
    dbStore.updateProfile(undefined, { display_name: "Saurabh" });
  });
});
