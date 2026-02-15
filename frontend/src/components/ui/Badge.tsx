import { clsx } from "clsx";
import type { ReactNode } from "react";

interface BadgeProps {
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
  children: ReactNode;
  className?: string;
}

const variants = {
  success: "bg-success-500/10 text-success-400",
  warning: "bg-warning-500/10 text-warning-400",
  danger: "bg-danger-500/10 text-danger-400",
  info: "bg-primary-500/10 text-primary-400",
  neutral: "bg-surface-800 text-surface-400",
};

export default function Badge({
  variant = "neutral",
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
