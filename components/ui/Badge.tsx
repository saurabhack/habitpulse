import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "danger" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-transparent",
    secondary: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-transparent",
    success: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-transparent",
    warning: "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-transparent",
    danger: "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-transparent",
    outline: "border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-transparent",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors border",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
