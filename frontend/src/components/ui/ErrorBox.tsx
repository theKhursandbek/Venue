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
      <div className="bg-linear-to-br from-danger-50 to-rose-50 rounded-3xl p-8 text-center max-w-sm border border-danger-100/50 shadow-lg shadow-danger-500/5">
        <div className="size-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
          <AlertCircle className="size-8 text-danger-400" />
        </div>
        <p className="text-gray-700 font-medium mb-5">{message}</p>
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
