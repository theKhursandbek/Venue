import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorBoxProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorBox({
  message = "Произошла ошибка. Попробуйте снова.",
  onRetry,
}: ErrorBoxProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] px-4 animate-fade-in text-center">
      <AlertCircle className="size-5 text-danger-400 mb-2" />
      <p className="text-surface-200 font-medium text-[13px] mb-1">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-surface-200 text-[12px] font-medium hover:text-surface-50 mt-2 flex items-center gap-1 mx-auto transition-colors"
        >
          <RefreshCw className="size-3" />
          Повторить
        </button>
      )}
    </div>
  );
}
