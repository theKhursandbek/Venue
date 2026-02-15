import Spinner from "./Spinner";

export default function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
      <Spinner className="size-5! text-surface-300" />
      <p className="text-[12px] text-surface-500 mt-3">Загрузка...</p>
    </div>
  );
}
