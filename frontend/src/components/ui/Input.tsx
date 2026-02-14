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
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <input
        className={clsx(
          "w-full px-4 py-3 rounded-xl border bg-white text-gray-900 placeholder:text-gray-400 transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
          error ? "border-red-300" : "border-gray-200",
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
