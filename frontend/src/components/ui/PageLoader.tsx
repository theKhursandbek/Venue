import Spinner from "./Spinner";

export default function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
      <div className="relative">
        <div className="absolute -inset-4 bg-primary-500/8 rounded-full blur-2xl animate-pulse-soft" />
        <div className="relative size-14 bg-surface-800 border border-surface-600/50 rounded-2xl flex items-center justify-center">
          <Spinner className="size-7! text-primary-400" />
        </div>
      </div>
      <p className="text-sm text-surface-500 mt-5 font-medium tracking-wide">Загрузка...</p>
    </div>
  );
}
