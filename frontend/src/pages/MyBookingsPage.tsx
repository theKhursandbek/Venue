import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Clock, X, ArrowRight, Ticket, Sparkles } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import toast from "react-hot-toast";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import PageLoader from "@/components/ui/PageLoader";
import ErrorBox from "@/components/ui/ErrorBox";
import { bookingService } from "@/services/bookingService";
import type { Booking } from "@/types";
import type { AxiosError } from "axios";
import type { APIError } from "@/types";

const STATUS_MAP: Record<
  string,
  { label: string; variant: "success" | "warning" | "danger" | "info" | "neutral"; emoji: string; gradient: string }
> = {
  pending: { label: "Ожидает", variant: "warning", emoji: "⏳", gradient: "from-amber-400 via-orange-400 to-amber-500" },
  confirmed: { label: "Подтверждено", variant: "success", emoji: "✅", gradient: "from-emerald-400 via-green-400 to-emerald-500" },
  cancelled: { label: "Отменено", variant: "danger", emoji: "❌", gradient: "from-rose-400 via-red-400 to-rose-500" },
  completed: { label: "Завершено", variant: "info", emoji: "🏆", gradient: "from-violet-400 via-purple-400 to-violet-500" },
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await bookingService.list();
      setBookings(data.results);
    } catch {
      setError("Не удалось загрузить бронирования");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id: number) => {
    setCancellingId(id);
    try {
      await bookingService.cancel(id);
      toast.success("Бронирование отменено");
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b))
      );
    } catch (err) {
      const axiosErr = err as AxiosError<APIError>;
      toast.error(axiosErr.response?.data?.error?.message || "Ошибка отмены");
    } finally {
      setCancellingId(null);
    }
  };

  const canCancel = (booking: Booking) =>
    booking.status === "pending" || booking.status === "confirmed";

  const formatDate = (dateStr: string) =>
    format(parseISO(dateStr), "d MMMM, EEEE", { locale: ru });

  const formatTime = (time: string) => time.slice(0, 5);

  if (loading) return <PageLoader />;
  if (error) return <ErrorBox message={error} onRetry={fetchBookings} />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Ticket className="size-5 text-primary-400" />
          <span className="text-xs font-bold text-primary-500 tracking-widest uppercase">History</span>
        </div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          Мои <span className="gradient-text">бронирования</span>
        </h1>
        <p className="text-sm text-gray-400 mt-1.5 font-medium">
          {bookings.length > 0
            ? `${bookings.length} бронирован${bookings.length === 1 ? "ие" : "ий"}`
            : "Пока пусто"}
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-20 animate-fade-in">
          <div className="relative inline-block mb-5">
            <div className="absolute inset-[-8px] bg-primary-200/20 rounded-[22px] blur-xl animate-pulse-soft" />
            <div className="relative size-20 mesh-gradient rounded-[22px] flex items-center justify-center shadow-lg border border-primary-100/30">
              <CalendarDays className="size-9 text-primary-300" />
            </div>
          </div>
          <p className="font-bold text-gray-600 text-lg">Нет бронирований</p>
          <p className="text-sm text-gray-400 mt-1.5 font-medium">Найдите площадку и забронируйте время</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 mt-6 text-white font-bold text-sm bg-linear-to-r from-primary-600 via-primary-500 to-accent-500 hover:brightness-110 px-6 py-3 rounded-2xl transition-all shadow-lg shadow-primary-500/25"
          >
            <Sparkles className="size-4" />
            Перейти к площадкам
            <ArrowRight className="size-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4 stagger-children">
          {bookings.map((booking) => {
            const status = STATUS_MAP[booking.status] || {
              label: booking.status,
              variant: "neutral" as const,
              emoji: "•",
              gradient: "from-gray-400 to-gray-500",
            };

            return (
              <div
                key={booking.id}
                className="bg-white rounded-[22px] border border-gray-100/60 shadow-lg shadow-gray-900/[0.04] overflow-hidden card-premium"
              >
                {/* Status accent bar */}
                <div className={`h-1 bg-linear-to-r ${status.gradient}`} />

                <div className="p-5 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      to={`/venues/${booking.venue}`}
                      className="font-extrabold text-gray-900 hover:text-primary-600 transition-colors text-base flex items-center gap-1.5 group"
                    >
                      {booking.venue_name || `Площадка #${booking.venue}`}
                      <ArrowRight className="size-3.5 text-gray-200 group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all" />
                    </Link>
                    <Badge variant={status.variant}>
                      {status.emoji} {status.label}
                    </Badge>
                  </div>

                  {/* Details */}
                  <div className="flex flex-wrap gap-2.5">
                    <div className="flex items-center gap-2 bg-gray-50 px-3.5 py-2 rounded-xl">
                      <div className="size-5 bg-primary-100 rounded-md flex items-center justify-center">
                        <CalendarDays className="size-3 text-primary-500" />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">{formatDate(booking.booking_date)}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 px-3.5 py-2 rounded-xl">
                      <div className="size-5 bg-primary-100 rounded-md flex items-center justify-center">
                        <Clock className="size-3 text-primary-500" />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        {formatTime(booking.start_time)} — {formatTime(booking.end_time)}
                      </span>
                    </div>
                  </div>

                  {/* Price + Cancel */}
                  <div className="flex items-center justify-between pt-3.5 border-t border-gray-50">
                    <div>
                      <p className="text-xs text-gray-400 font-semibold">Итого</p>
                      <span className="font-black text-primary-600 text-xl">
                        {Number(booking.total_price).toLocaleString("ru-RU")} сум
                      </span>
                    </div>

                    {canCancel(booking) && (
                      <Button
                        variant="danger"
                        size="sm"
                        loading={cancellingId === booking.id}
                        onClick={() => handleCancel(booking.id)}
                        className="rounded-xl!"
                      >
                        <X className="size-3.5" />
                        Отменить
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
