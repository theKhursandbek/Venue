import Spinner from "./Spinner";

export default function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-3">
        <Spinner className="!size-8 mx-auto" />
        <p className="text-sm text-gray-500">Загрузка...</p>
      </div>
    </div>
  );
}
