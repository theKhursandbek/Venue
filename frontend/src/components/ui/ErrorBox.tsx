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
    <div className="flex flex-col items-center justify-center min-h-[40vh] px-4 animate-fade-in text-center">
      <div className="size-14 rounded-2xl bg-danger-500/10 border border-danger-500/20 flex items-center justify-center mb-4">
        <AlertCircle className="size-6 text-danger-400" />
      </div>
      <p className="text-surface-100 font-semibold text-[15px] mb-1">{message}</p>
      <p className="text-surface-400 text-[13px] mb-5">Проверьте соединение и попробуйте снова</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} size="sm">
          <RefreshCw className="size-3.5" />
          Повторить
        </Button>
      )}
    </div>
  );
}
