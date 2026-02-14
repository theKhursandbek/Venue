import { clsx } from "clsx";
import type { ReactNode } from "react";

interface BadgeProps {
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
  children: ReactNode;
  className?: string;
}

const variants = {
  success:
    "bg-linear-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200/60 shadow-sm shadow-emerald-500/5",
  warning:
    "bg-linear-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-200/60 shadow-sm shadow-amber-500/5",
  danger:
    "bg-linear-to-r from-rose-50 to-red-50 text-rose-700 border border-rose-200/60 shadow-sm shadow-rose-500/5",
  info:
    "bg-linear-to-r from-violet-50 to-indigo-50 text-violet-700 border border-violet-200/60 shadow-sm shadow-violet-500/5",
  neutral:
    "bg-gray-100 text-gray-600 border border-gray-200/60",
};

export default function Badge({
  variant = "neutral",
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold tracking-wide",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
