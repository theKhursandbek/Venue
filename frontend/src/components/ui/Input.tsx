import { clsx } from "clsx";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({
  label,
  error,
  className,
  ...props
}: InputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-semibold text-surface-300 tracking-wide">{label}</label>
      )}
      <input
        className={clsx(
          "w-full px-4 py-3.5 rounded-xl border bg-surface-800 text-surface-50 placeholder:text-surface-500 transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50",
          error ? "border-danger-500/50 ring-1 ring-danger-500/20" : "border-surface-600/50 hover:border-surface-500",
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-danger-400 font-medium flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-danger-500 inline-block" />
          {error}
        </p>
      )}
    </div>
  );
}
