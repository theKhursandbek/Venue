import { clsx } from "clsx";
import type { ReactNode } from "react";

interface BadgeProps {
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
  children: ReactNode;
  className?: string;
}

const variants = {
  success: "bg-success-500/10 text-success-600 border-success-500/20",
  warning: "bg-warning-500/10 text-warning-500 border-warning-500/20",
  danger: "bg-danger-500/10 text-danger-600 border-danger-500/20",
  info: "bg-primary-500/10 text-primary-600 border-primary-500/20",
  neutral: "bg-surface-200/60 text-surface-600 border-surface-300/50",
};

export default function Badge({
  variant = "neutral",
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-semibold border transition-all duration-300 animate-scale-in hover:scale-105",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
