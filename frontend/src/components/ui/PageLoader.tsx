import Spinner from "./Spinner";

export default function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
      <div className="size-10 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center mb-3">
        <Spinner className="size-5! text-primary-400" />
      </div>
      <p className="text-[13px] text-surface-400 font-medium">Загрузка...</p>
    </div>
  );
}
