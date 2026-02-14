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
  { label: string; variant: "success" | "warning" | "danger" | "info" | "neutral"; emoji: string }
> = {
  pending: { label: "Ожидает", variant: "warning", emoji: "⏳" },
  confirmed: { label: "Подтверждено", variant: "success", emoji: "✅" },
  cancelled: { label: "Отменено", variant: "danger", emoji: "❌" },
  completed: { label: "Завершено", variant: "info", emoji: "🏆" },
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
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">
          Мои <span className="gradient-text">бронирования</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {bookings.length > 0
            ? `${bookings.length} бронирован${bookings.length === 1 ? "ие" : "ий"}`
            : "Пока пусто"}
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16 animate-fade-in">
          <div className="size-20 bg-linear-to-br from-primary-50 to-purple-50 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-inner">
            <CalendarDays className="size-9 text-primary-300" />
          </div>
          <p className="font-semibold text-gray-600 text-lg">Нет бронирований</p>
          <p className="text-sm text-gray-400 mt-1">Найдите площадку и забронируйте время</p>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 mt-5 text-primary-600 font-semibold text-sm bg-primary-50 hover:bg-primary-100 px-4 py-2.5 rounded-2xl transition-colors"
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
              emoji: "•",
            };

            return (
              <div
                key={booking.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden card-hover"
              >
                {/* Status accent bar */}
                <div
                  className={`h-1 ${
                    booking.status === "confirmed"
                      ? "bg-linear-to-r from-green-400 to-emerald-500"
                      : booking.status === "pending"
                      ? "bg-linear-to-r from-amber-400 to-yellow-500"
                      : booking.status === "cancelled"
                      ? "bg-linear-to-r from-red-400 to-rose-500"
                      : "bg-linear-to-r from-blue-400 to-indigo-500"
                  }`}
                />

                <div className="p-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      to={`/venues/${booking.venue}`}
                      className="font-bold text-gray-900 hover:text-primary-600 transition-colors text-[15px] flex items-center gap-1"
                    >
                      {booking.venue_name || `Площадка #${booking.venue}`}
                      <ArrowRight className="size-3.5 text-gray-300" />
                    </Link>
                    <Badge variant={status.variant}>
                      {status.emoji} {status.label}
                    </Badge>
                  </div>

                  {/* Details */}
                  <div className="flex flex-wrap gap-3 text-sm">
                    <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                      <CalendarDays className="size-3.5 text-primary-500" />
                      <span className="font-medium text-gray-700">{formatDate(booking.booking_date)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                      <Clock className="size-3.5 text-primary-500" />
                      <span className="font-medium text-gray-700">
                        {formatTime(booking.start_time)} — {formatTime(booking.end_time)}
                      </span>
                    </div>
                  </div>

                  {/* Price + Cancel */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                    <span className="font-extrabold text-primary-700 text-lg">
                      {Number(booking.total_price).toLocaleString("ru-RU")} сум
                    </span>

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
