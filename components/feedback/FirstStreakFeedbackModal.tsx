"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Star, Flame, Sparkles, CheckCircle2, MessageSquare, Heart } from "lucide-react";
import confetti from "canvas-confetti";

interface FirstStreakFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  habitTitle?: string;
  userId?: string;
  onSubmitted?: () => void;
}

const TAG_OPTIONS = [
  "✨ Super clean UI",
  "🔥 Highly motivating",
  "⚡ Quick & effortless check-ins",
  "⏱️ Loved the focus timer",
  "📊 Meaningful analytics",
  "🌱 Easy habit routines",
];

const RATING_LABELS = ["Needs Work", "Fair", "Good", "Great!", "Incredible! 🚀"];

export function FirstStreakFeedbackModal({
  isOpen,
  onClose,
  habitTitle = "your habit",
  userId,
  onSubmitted,
}: FirstStreakFeedbackModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>(["✨ Super clean UI", "🔥 Highly motivating"]);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const storageKey = userId ? `habitpulse_first_streak_feedback_${userId}` : "habitpulse_first_streak_feedback_done";

  const handleDismiss = () => {
    localStorage.setItem(storageKey, "dismissed");
    onClose();
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          tags: selectedTags,
          comment,
        }),
      });

      // Mark locally so it never appears again for this user
      localStorage.setItem(storageKey, "true");

      setIsSubmitted(true);
      confetti({ particleCount: 70, spread: 60 });

      setTimeout(() => {
        setIsSubmitted(false);
        onClose();
        if (onSubmitted) onSubmitted();
      }, 1500);
    } catch (e) {
      console.error("Failed to submit feedback:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleDismiss} maxWidth="md">
      {isSubmitted ? (
        <div className="py-8 text-center animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 mx-auto flex items-center justify-center mb-3">
            <Heart className="w-8 h-8 fill-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
            Thank You for Your Feedback!
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Your insights help us craft the ultimate habit building experience. Keep that momentum going!
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="py-2 space-y-5">
          {/* Milestone Header */}
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-bold mb-3 shadow-xs">
              <Flame className="w-4 h-4 fill-amber-500 text-amber-500 animate-bounce" />
              <span>First Habit Streak Completed!</span>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Momentum in Motion!
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              You just locked in your first consecutive consistency streak on <strong>"{habitTitle}"</strong>. How was your experience today?
            </p>
          </div>

          {/* Interactive Star Rating */}
          <div className="flex flex-col items-center gap-1.5 py-2">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = (hoverRating || rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 text-slate-300 dark:text-slate-700 hover:scale-125 transition-transform"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        isFilled
                          ? "text-amber-400 fill-amber-400 drop-shadow-sm"
                          : "text-slate-300 dark:text-slate-700"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              {RATING_LABELS[(hoverRating || rating) - 1]}
            </span>
          </div>

          {/* Tag Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 text-center">
              What did you enjoy most?
            </label>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {TAG_OPTIONS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                      isSelected
                        ? "bg-indigo-600 text-white font-semibold shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Comments Box */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Personal Note or Suggestions (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us what you loved or what feature you'd like to see next..."
              rows={2}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleDismiss}
              className="text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Skip for now
            </button>

            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl px-6 bg-indigo-600 hover:bg-indigo-700 shadow-md text-xs font-bold"
            >
              {isSubmitting ? "Submitting..." : "Submit & Keep Streak"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
