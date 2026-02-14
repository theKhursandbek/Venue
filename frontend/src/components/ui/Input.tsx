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
    <div className="space-y-1">
      {label && (
        <label className="text-[11px] font-medium text-surface-400 tracking-wide">{label}</label>
      )}
      <input
        className={clsx(
          "w-full px-3 py-2 rounded-md border bg-surface-850 text-surface-100 placeholder:text-surface-500 transition-colors duration-150 text-[13px]",
          "focus:outline-none focus:ring-1 focus:ring-primary-500/30 focus:border-primary-500/40",
          error ? "border-danger-500/40" : "border-surface-700/30 hover:border-surface-600/50",
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
