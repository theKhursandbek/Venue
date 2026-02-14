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
      <div className="bg-surface-900 border border-surface-700/20 rounded-lg p-5 text-center max-w-xs v-edge">
        <div className="size-8 bg-danger-50 border border-danger-500/15 rounded flex items-center justify-center mx-auto mb-2.5">
          <AlertCircle className="size-4 text-danger-400" />
        </div>
        <p className="text-surface-200 font-medium text-[13px] mb-3">{message}</p>
        {onRetry && (
          <Button variant="secondary" onClick={onRetry} size="sm">
            <RefreshCw className="size-3" />
            Повторить
          </Button>
        )}
      </div>
    </div>
  );
}
