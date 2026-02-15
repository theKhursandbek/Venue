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
        <label className="text-[12px] font-medium text-surface-400">{label}</label>
      )}
      <input
        className={clsx(
          "w-full px-3.5 py-2.5 rounded-lg bg-surface-850 text-surface-100 placeholder:text-surface-500 transition-colors text-[13px]",
          "border-none focus:outline-none focus:ring-2 focus:ring-primary-500/25",
          error && "ring-2 ring-danger-500/20",
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
