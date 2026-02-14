import { AlertCircle, RefreshCw } from "lucide-react";
import Button from "./Button";

interface ErrorBoxProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorBox({
  message = "Произошла ошибка. Попробуйте снова.",
  onRetry,
}: ErrorBoxProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] px-4 animate-fade-in">
      <div className="bg-surface-900/80 border border-surface-700/25 rounded-xl p-6 text-center max-w-sm inner-light backdrop-blur-sm">
        <div className="size-11 bg-danger-50 border border-danger-500/15 rounded-lg flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="size-5 text-danger-400" />
        </div>
        <p className="text-surface-200 font-medium text-sm mb-4">{message}</p>
        {onRetry && (
          <Button variant="secondary" onClick={onRetry} size="sm">
            <RefreshCw className="size-3.5" />
            Повторить
          </Button>
        )}
      </div>
    </div>
  );
}
