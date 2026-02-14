import Spinner from "./Spinner";

export default function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
      <div className="relative">
        <div className="absolute inset-[-12px] bg-primary-400/15 rounded-full blur-2xl animate-pulse-soft" />
        <div className="absolute inset-[-6px] bg-accent-400/10 rounded-full blur-xl animate-pulse-soft" style={{ animationDelay: "1s" }} />
        <div className="relative size-14 bg-linear-to-br from-primary-100 to-primary-50 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/10">
          <Spinner className="size-7! text-primary-500" />
        </div>
      </div>
      <p className="text-sm text-gray-400 mt-5 font-medium tracking-wide">Загрузка...</p>
    </div>
  );
}
