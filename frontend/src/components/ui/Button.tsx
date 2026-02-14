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
    "relative inline-flex items-center justify-center font-semibold rounded-2xl transition-all duration-300 active:scale-[0.96] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer overflow-hidden";

  const variants = {
    primary:
      "bg-linear-to-r from-primary-600 via-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 hover:brightness-110",
    secondary:
      "bg-white text-gray-700 border border-gray-200/80 hover:border-primary-200 hover:bg-primary-50/50 shadow-sm hover:shadow-md",
    danger:
      "bg-linear-to-r from-danger-500 to-rose-500 text-white shadow-lg shadow-danger-500/25 hover:shadow-xl hover:shadow-danger-500/30 hover:brightness-110",
    ghost: "text-gray-600 hover:bg-primary-50 hover:text-primary-700",
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
