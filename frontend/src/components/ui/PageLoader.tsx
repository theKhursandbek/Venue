import Spinner from "./Spinner";

export default function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
      <div className="relative">
        <div className="absolute -inset-3 bg-primary-500/6 rounded-full blur-2xl animate-breathe" />
        <div className="relative size-11 bg-surface-850 border border-surface-700/25 rounded-xl flex items-center justify-center">
          <Spinner className="size-5! text-primary-400" />
        </div>
      </div>
      <p className="text-xs text-surface-500 mt-4 font-medium tracking-wide">Загрузка...</p>
    </div>
  );
}
