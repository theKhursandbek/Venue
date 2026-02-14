import { clsx } from "clsx";
import type { ReactNode } from "react";

interface BadgeProps {
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
  children: ReactNode;
  className?: string;
}

const variants = {
  success:
    "bg-success-50 text-success-400 border border-success-500/20",
  warning:
    "bg-warning-50 text-warning-400 border border-warning-500/20",
  danger:
    "bg-danger-50 text-danger-400 border border-danger-500/20",
  info:
    "bg-surface-800 text-accent-400 border border-accent-500/20",
  neutral:
    "bg-surface-800 text-surface-300 border border-surface-600/50",
};

export default function Badge({
  variant = "neutral",
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold tracking-wide",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
