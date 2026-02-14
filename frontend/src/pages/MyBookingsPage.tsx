import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Clock, X, ArrowRight } from "lucide-react";
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
  { label: string; variant: "success" | "warning" | "danger" | "info" | "neutral" }
> = {
  pending: { label: "Ожидает", variant: "warning" },
  confirmed: { label: "Подтверждено", variant: "success" },
  cancelled: { label: "Отменено", variant: "danger" },
  completed: { label: "Завершено", variant: "info" },
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
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold text-primary-500 tracking-widest uppercase mb-1">История</p>
        <h1 className="text-2xl font-bold text-surface-50 tracking-tight">
          Мои <span className="gradient-text">бронирования</span>
        </h1>
        <p className="text-sm text-surface-500 mt-1">
          {bookings.length > 0
            ? `${bookings.length} бронирован${bookings.length === 1 ? "ие" : "ий"}`
            : "Пока пусто"}
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16 animate-fade-in">
          <div className="size-16 bg-surface-800 border border-surface-700/50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <CalendarDays className="size-7 text-surface-600" />
          </div>
          <p className="font-semibold text-surface-300 text-base">Нет бронирований</p>
          <p className="text-sm text-surface-500 mt-1">Найдите площадку и забронируйте время</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 mt-5 text-surface-950 font-semibold text-sm bg-primary-500 hover:bg-primary-400 px-5 py-2.5 rounded-xl transition-all active:scale-95"
          >
            Перейти к площадкам
            <ArrowRight className="size-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3 stagger-children">
          {bookings.map((booking) => {
            const status = STATUS_MAP[booking.status] || {
              label: booking.status,
              variant: "neutral" as const,
            };

            return (
              <div
                key={booking.id}
                className="bg-surface-900 rounded-xl border border-surface-700/50 overflow-hidden"
              >
                <div className="p-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      to={`/venues/${booking.venue}`}
                      className="font-bold text-surface-100 hover:text-primary-400 transition-colors text-sm flex items-center gap-1.5 group"
                    >
                      {booking.venue_name || `Площадка #${booking.venue}`}
                      <ArrowRight className="size-3 text-surface-600 group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all" />
                    </Link>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>

                  {/* Details */}
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-1.5 bg-surface-800 border border-surface-700/50 px-3 py-1.5 rounded-lg">
                      <CalendarDays className="size-3 text-primary-500" />
                      <span className="text-xs font-semibold text-surface-300">{formatDate(booking.booking_date)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-surface-800 border border-surface-700/50 px-3 py-1.5 rounded-lg">
                      <Clock className="size-3 text-primary-500" />
                      <span className="text-xs font-semibold text-surface-300">
                        {formatTime(booking.start_time)} — {formatTime(booking.end_time)}
                      </span>
                    </div>
                  </div>

                  {/* Price + Cancel */}
                  <div className="flex items-center justify-between pt-3 border-t border-surface-700/50">
                    <div>
                      <p className="text-xs text-surface-500 font-medium">Итого</p>
                      <span className="font-bold text-primary-400 text-lg">
                        {Number(booking.total_price).toLocaleString("ru-RU")} сум
                      </span>
                    </div>

                    {canCancel(booking) && (
                      <Button
                        variant="danger"
                        size="sm"
                        loading={cancellingId === booking.id}
                        onClick={() => handleCancel(booking.id)}
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
