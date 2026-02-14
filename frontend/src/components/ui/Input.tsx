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
    <div className="space-y-1.5">
      {label && (
        <label className="text-xs font-medium text-surface-400 tracking-wide">{label}</label>
      )}
      <input
        className={clsx(
          "w-full px-3.5 py-2.5 rounded-lg border bg-surface-850 text-surface-100 placeholder:text-surface-500 transition-all duration-200 text-sm",
          "focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/40",
          error ? "border-danger-500/40 ring-1 ring-danger-500/15" : "border-surface-700/40 hover:border-surface-600/60",
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-xs text-danger-400 font-medium flex items-center gap-1">
          <span className="size-1 rounded-full bg-danger-500 inline-block" />
          {error}
        </p>
      )}
    </div>
  );
}
