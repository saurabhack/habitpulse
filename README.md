# HabitPulse — Intelligent Habit Tracking & Personal Productivity Platform

> A production-grade SaaS web application built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Supabase PostgreSQL (RLS)**, **TanStack Query**, and **Recharts**.

HabitPulse synthesizes the best design patterns of industry-leading habit systems:
- **Streaks**: Minimalist, frictionless daily check-ins and tactile completions.
- **Loop Habit Tracker**: Mathematical habit resilience formula (exponential moving average memory score that prevents accidental demotivation from a single rest day).
- **Strides**: Target vs actual metrics and clear goal milestone linking.
- **Habitify**: Morning, Afternoon, and Evening daily ritual bucketing.
- **Fabulous**: Habit stacking and sequential routine runners.

---

## 1. System Architecture

HabitPulse is built using a **Modular Monolith Architecture**:
- **Frontend**: Next.js 14 App Router, React 18, Tailwind CSS, Lucide Icons, Recharts, Canvas Confetti.
- **Backend Modules**:
  1. `Auth & Profiles`: Secure identity with registration, login, logout, password recovery, session handling, and profile personalization.
  2. `Habit Management`: Full CRUD, active/paused/archived lifecycles, positive vs. negative habits, flexible schedules.
  3. `Habit Tracking`: Multi-entry daily logging, duration tracking, numeric increment/decrement, idempotency keys.
  4. `Day Overrides`: Explicit skip/vacation handling preserving streaks without penalizing consistency percentages.
  5. `Goal Management`: Long-term milestones connected to underlying habit contributions.
  6. `Routine Management`: Fabulous-style step-by-step rituals with sequenced timers.
  7. `Productivity Analytics`: Calendar heatmap (12 weeks), weekly distribution bar charts, habit strength scores, behavioral insights.
  8. `Journal & Reflection`: Mood tracking (1-5 scale), daily reflection notes, tag filtering, habit links.
  9. `Focus Timer`: Pomodoro timer (15/25/45/60m) with synthetic Web Audio API acoustic feedback and auto-logging.
  10. `Data Export & Privacy`: Instant CSV and full JSON account backups.
- **Database & Persistence**:
  - Full relational PostgreSQL schema with Row Level Security (RLS) in `supabase/migrations/20261122000000_init_schema.sql`.
  - Resilient hybrid storage layer with realistic pre-seeded data for immediate exploration.

---

## 2. Database Schema Overview

```
USER / PROFILE (auth.users)
  │
  ├── CATEGORIES (System & User-defined)
  │
  ├── HABITS (Title, Type, Target, Unit, Frequency, Color, Icon)
  │     ├── HABIT_SCHEDULES (Daily, Weekdays, Interval, Custom days)
  │     ├── HABIT_ENTRIES (Timestamped logs, recorded values, source)
  │     ├── HABIT_DAY_OVERRIDES (Skipped, Rest, Vacation)
  │     └── REMINDERS (Time, days, active status)
  │
  ├── GOALS (Target milestones & linked habits)
  ├── ROUTINES & ROUTINE_HABITS (Sequential chains with estimated minutes)
  ├── JOURNAL_ENTRIES (Mood score 1-5, reflections, tags)
  ├── FOCUS_SESSIONS (Pomodoro sessions linked to habits)
  └── USER_SETTINGS (Theme, timezone, week starts on, audio)
```

---

## 3. Mathematical Calculations

### A. Completion Rate Denominator
$$\text{Eligible Days} = \{ d \in [\text{start\_date}, \min(\text{today}, \text{end\_date})] \mid \text{Scheduled}(d) \land d \notin \text{Overrides}_{\text{skipped}} \}$$
- Uncreated dates and future dates are strictly excluded.
- Planned rest/skipped days do not decrement the score.

### B. Loop Habit Strength Score
A memory-based exponential smoothing score measures cumulative consistency:
$$S_t = S_{t-1} \cdot \alpha + (1 - \alpha) \cdot v_t$$
where $\alpha = 0.95$ and $v_t \in [0, 1]$. An accidental missed day causes gentle decay rather than an immediate wipeout of weeks of effort.

---

## 4. Getting Started

### Prerequisites
- Node.js 18+ (tested on Node v25)
- npm or pnpm

### Installation
```bash
git clone <repository_url>
cd habit_tracker
npm install
```

### Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### Running Locally
```bash
# Development server
npm run dev

# Production build & start
npm run build
npm run start
```
The application will be accessible at [http://localhost:3000](http://localhost:3000).

---

## 5. Automated Testing

Run the Vitest test suite covering authentication, user management, the scheduler, streaks calculation, Loop habit strength score, analytics engine, and data store:
```bash
npm run test
```
All 19 unit and integration tests execute with 100% pass rate across 5 test suites.

---

## 6. Supabase Deployment

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Paste the contents of `supabase/migrations/20261122000000_init_schema.sql` and run it.
4. Optionally run `supabase/seed.sql` for starter categories.
5. In your project settings, copy `Project URL` and `anon public key` into `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
