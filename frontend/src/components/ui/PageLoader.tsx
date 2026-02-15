import Spinner from "./Spinner";

export default function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
      <div className="size-14 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center mb-4 animate-levitate">
        <Spinner className="size-6! text-primary-400" />
      </div>
      <p className="text-[13px] text-surface-500 font-medium">Загрузка...</p>
      <div className="flex gap-1.5 mt-3">
        <span className="size-2 rounded-full bg-primary-500/40 animate-elastic-pulse" style={{animationDelay: '0ms'}} />
        <span className="size-2 rounded-full bg-primary-500/40 animate-elastic-pulse" style={{animationDelay: '150ms'}} />
        <span className="size-2 rounded-full bg-primary-500/40 animate-elastic-pulse" style={{animationDelay: '300ms'}} />
      </div>
    </div>
  );
}
