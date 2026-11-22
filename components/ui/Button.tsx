import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50 select-none";

    const variantStyles = {
      primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm active:scale-[0.98]",
      secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700",
      outline: "border border-slate-300 dark:border-slate-700 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200",
      ghost: "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300",
      danger: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm active:scale-[0.98]",
      success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm active:scale-[0.98]",
    };

    const sizeStyles = {
      sm: "text-xs px-2.5 py-1.5 rounded-lg gap-1.5",
      md: "text-sm px-4 py-2 rounded-xl gap-2",
      lg: "text-base px-5 py-2.5 rounded-xl gap-2.5",
      icon: "h-9 w-9 p-1.5 rounded-xl",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
