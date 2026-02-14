import { clsx } from "clsx";
import type { ReactNode } from "react";

interface BadgeProps {
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
  children: ReactNode;
  className?: string;
}

const variants = {
  success: "bg-linear-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200/60",
  warning: "bg-linear-to-r from-amber-50 to-yellow-50 text-amber-700 border border-amber-200/60",
  danger: "bg-linear-to-r from-red-50 to-rose-50 text-red-700 border border-red-200/60",
  info: "bg-linear-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200/60",
  neutral: "bg-gray-100 text-gray-600 border border-gray-200/60",
};

export default function Badge({
  variant = "neutral",
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
