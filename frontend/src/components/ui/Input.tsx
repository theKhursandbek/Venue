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
        <label className="text-[12px] font-semibold text-surface-300 uppercase tracking-wider">{label}</label>
      )}
      <input
        className={clsx(
          "w-full px-4 py-3 rounded-xl glass text-surface-100 placeholder:text-surface-500 transition-all text-[14px]",
          "focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/30",
          error && "ring-2 ring-danger-500/30",
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-[11px] text-danger-400 font-medium">{error}</p>
      )}
    </div>
  );
}
