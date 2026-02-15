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
}: Readonly<InputProps>) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-[12px] font-semibold text-surface-600 uppercase tracking-wider">{label}</label>
      )}
      <input
        className={clsx(
          "w-full px-4 py-3 rounded-xl glass text-surface-900 placeholder:text-surface-400 transition-all duration-300 text-[14px] input-glow",
          "focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/30 focus:scale-[1.01]",
          error && "ring-2 ring-danger-500/30 animate-shake",
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-[11px] text-danger-600 font-medium">{error}</p>
      )}
    </div>
  );
}
