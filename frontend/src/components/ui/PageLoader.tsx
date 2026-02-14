import Spinner from "./Spinner";

export default function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
      <div className="relative">
        <div className="absolute inset-0 bg-primary-400/20 rounded-full blur-xl animate-pulse-soft" />
        <Spinner className="size-10! text-primary-500 relative" />
      </div>
      <p className="text-sm text-gray-400 mt-4 font-medium">Загрузка...</p>
    </div>
  );
}
