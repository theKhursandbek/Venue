import { clsx } from "clsx";
import Spinner from "./Spinner";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: ReactNode;
}

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 active:scale-[0.96] disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer";

  const variants = {
    primary:
      "bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-400 hover:to-primary-500 shadow-lg shadow-primary-500/20",
    secondary:
      "glass text-surface-200 hover:text-surface-50 hover:bg-surface-750/60",
    danger:
      "bg-danger-500/15 text-danger-400 hover:bg-danger-500/25 border border-danger-500/20",
    ghost: "text-surface-400 hover:text-surface-200 hover:bg-surface-800/40",
  };

  const sizes = {
    sm: "px-3.5 py-1.5 text-[12px] gap-1.5",
    md: "px-5 py-2.5 text-[13px] gap-2",
    lg: "px-6 py-3 text-[14px] gap-2",
  };

  return (
    <button
      className={clsx(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner className="size-4!" />}
      {children}
    </button>
  );
}
