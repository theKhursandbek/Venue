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
      <div className="bg-surface-900 border border-surface-700/50 rounded-2xl p-8 text-center max-w-sm">
        <div className="size-14 bg-danger-50 border border-danger-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="size-7 text-danger-400" />
        </div>
        <p className="text-surface-200 font-medium mb-5">{message}</p>
        {onRetry && (
          <Button variant="secondary" onClick={onRetry} size="sm">
            <RefreshCw className="size-4" />
            Повторить
          </Button>
        )}
      </div>
    </div>
  );
}
