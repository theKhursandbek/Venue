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
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer";

  const variants = {
    primary:
      "bg-linear-to-r from-primary-600 to-primary-500 text-white hover:from-primary-700 hover:to-primary-600 shadow-md shadow-primary-500/20 hover:shadow-lg hover:shadow-primary-500/30",
    secondary:
      "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm",
    danger:
      "bg-linear-to-r from-danger-500 to-red-500 text-white hover:from-danger-600 hover:to-red-600 shadow-md shadow-danger-500/20",
    ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm gap-1.5",
    md: "px-4 py-2.5 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2",
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
