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
    "relative inline-flex items-center justify-center font-medium rounded-lg transition-all duration-250 active:scale-[0.95] disabled:opacity-35 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer overflow-hidden";

  const variants = {
    primary:
      "bg-gradient-to-r from-primary-500 to-primary-400 text-surface-950 shadow-md shadow-primary-500/15 hover:shadow-lg hover:shadow-primary-400/25 hover:brightness-110",
    secondary:
      "bg-surface-800/80 text-surface-200 border border-surface-600/40 hover:border-surface-500/60 hover:bg-surface-750",
    danger:
      "bg-danger-600/90 text-white shadow-md shadow-danger-600/15 hover:bg-danger-500 hover:shadow-lg",
    ghost: "text-surface-400 hover:bg-white/[0.04] hover:text-surface-200",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-1.5",
    lg: "px-5 py-2.5 text-sm gap-2",
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
