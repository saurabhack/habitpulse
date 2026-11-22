import * as React from "react";
import { cn } from "@/lib/utils";

interface CircularProgressProps {
  value: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  sublabel?: string;
  className?: string;
}

export function CircularProgress({
  value,
  size = 140,
  strokeWidth = 12,
  color = "#4F46E5",
  label,
  sublabel,
  className,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedValue = Math.min(100, Math.max(0, value));
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center select-none", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-100 dark:text-slate-800"
          fill="transparent"
        />
        {/* Progress Fill */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {/* Central Content */}
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {label ?? `${Math.round(clampedValue)}%`}
        </span>
        {sublabel && (
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 max-w-[80px]">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
