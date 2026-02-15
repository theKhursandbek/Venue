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
    "relative inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 active:scale-[0.97] disabled:opacity-25 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer";

  const variants = {
    primary:
      "bg-primary-500 text-white hover:bg-primary-400 font-semibold",
    secondary:
      "bg-surface-850 text-surface-200 hover:bg-surface-800",
    danger:
      "bg-danger-500/15 text-danger-400 hover:bg-danger-500/25",
    ghost: "text-surface-400 hover:text-surface-200",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-[12px] gap-1",
    md: "px-4 py-2 text-[13px] gap-1.5",
    lg: "px-5 py-2.5 text-[13px] gap-1.5",
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
