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
    <div className="flex flex-col items-center justify-center min-h-[40vh] px-4">
      <div className="bg-red-50 rounded-2xl p-8 text-center max-w-sm">
        <AlertCircle className="size-12 text-red-400 mx-auto mb-3" />
        <p className="text-gray-700 mb-4">{message}</p>
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
