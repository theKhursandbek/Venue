import Spinner from "./Spinner";

export default function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      <div className="size-8 bg-surface-900 border border-surface-700/20 rounded flex items-center justify-center">
        <Spinner className="size-4! text-primary-400" />
      </div>
      <p className="text-[11px] text-surface-500 mt-3 font-medium">Загрузка...</p>
    </div>
  );
}
