import { clsx } from "clsx";
import type { ReactNode } from "react";

interface BadgeProps {
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
  children: ReactNode;
  className?: string;
}

const variants = {
  success: "bg-success-500/15 text-success-400 border-success-500/20",
  warning: "bg-warning-500/15 text-warning-400 border-warning-500/20",
  danger: "bg-danger-500/15 text-danger-400 border-danger-500/20",
  info: "bg-primary-500/15 text-primary-300 border-primary-500/20",
  neutral: "bg-surface-750/60 text-surface-300 border-surface-600/30",
};

export default function Badge({
  variant = "neutral",
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-semibold border",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
