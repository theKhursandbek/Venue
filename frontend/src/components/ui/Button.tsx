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
    "relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 active:scale-[0.96] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer overflow-hidden";

  const variants = {
    primary:
      "bg-primary-500 text-surface-950 shadow-lg shadow-primary-500/20 hover:bg-primary-400 hover:shadow-xl hover:shadow-primary-400/25",
    secondary:
      "bg-surface-800 text-surface-100 border border-surface-600/50 hover:border-primary-500/30 hover:bg-surface-700",
    danger:
      "bg-danger-600 text-white shadow-lg shadow-danger-600/20 hover:bg-danger-500 hover:shadow-xl",
    ghost: "text-surface-300 hover:bg-surface-800 hover:text-surface-100",
  };

  const sizes = {
    sm: "px-3.5 py-2 text-sm gap-1.5",
    md: "px-5 py-2.5 text-sm gap-2",
    lg: "px-6 py-3.5 text-base gap-2",
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
