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
        <label className="text-sm font-semibold text-gray-700 tracking-wide">{label}</label>
      )}
      <input
        className={clsx(
          "w-full px-4 py-3.5 rounded-2xl border-2 bg-white text-gray-900 placeholder:text-gray-400 transition-all duration-200",
          "focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 focus:bg-white",
          error ? "border-danger-300 ring-2 ring-danger-500/10" : "border-gray-100 hover:border-gray-200",
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-danger-500 font-medium flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-danger-500 inline-block" />
          {error}
        </p>
      )}
    </div>
  );
}
