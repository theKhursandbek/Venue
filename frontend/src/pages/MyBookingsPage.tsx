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
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-baseline justify-between">
        <h1 className="text-xl font-bold text-surface-50 tracking-tight">Мои бронирования</h1>
        {bookings.length > 0 && (
          <span className="text-[11px] text-surface-500">
            {bookings.length} бронирован{bookings.length === 1 ? "ие" : "ий"}
          </span>
        )}
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16 animate-fade-in">
          <CalendarDays className="size-5 text-surface-600 mx-auto mb-2" />
          <p className="text-surface-300 text-[13px]">Нет бронирований</p>
          <p className="text-[11px] text-surface-500 mt-0.5">Найдите площадку и забронируйте</p>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 mt-4 text-primary-400 font-medium text-[12px] hover:text-primary-300 transition-colors"
          >
            Перейти к площадкам
            <ArrowRight className="size-3" />
          </Link>
        </div>
      ) : (
        <div className="stagger-children">
          {bookings.map((booking) => {
            const status = STATUS_MAP[booking.status] || {
              label: booking.status,
              variant: "neutral" as const,
            };

            return (
              <div
                key={booking.id}
                className="py-3.5 border-b border-surface-850 last:border-0"
              >
                <div className="flex items-start justify-between gap-2">
                  <Link
                    to={`/venues/${booking.venue}`}
                    className="font-semibold text-surface-100 hover:text-primary-400 transition-colors text-[14px] flex items-center gap-1 group"
                  >
                    {booking.venue_name || `Площадка #${booking.venue}`}
                    <ArrowRight className="size-3 text-surface-600 group-hover:text-primary-400 transition-colors" />
                  </Link>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>

                <div className="flex items-center gap-3 mt-1.5 text-[12px] text-surface-400">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="size-3" />
                    {formatDate(booking.booking_date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" />
                    {formatTime(booking.start_time)} — {formatTime(booking.end_time)}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold text-surface-50 text-[15px]">
                    {Number(booking.total_price).toLocaleString("ru-RU")} <span className="font-normal text-surface-500 text-[12px]">сум</span>
                  </span>
                  {canCancel(booking) && (
                    <Button
                      variant="danger"
                      size="sm"
                      loading={cancellingId === booking.id}
                      onClick={() => handleCancel(booking.id)}
                    >
                      <X className="size-3" />
                      Отменить
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
