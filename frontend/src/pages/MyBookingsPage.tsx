import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Clock, MapPin, X, AlertCircle } from "lucide-react";
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
      toast.error(
        axiosErr.response?.data?.error?.message || "Ошибка отмены бронирования"
      );
    } finally {
      setCancellingId(null);
    }
  };

  const canCancel = (booking: Booking) => {
    return booking.status === "pending" || booking.status === "confirmed";
  };

  const formatDate = (dateStr: string) => {
    return format(parseISO(dateStr), "d MMMM, EEEE", { locale: ru });
  };

  const formatTime = (time: string) => time.slice(0, 5);

  if (loading) return <PageLoader />;
  if (error) return <ErrorBox message={error} onRetry={fetchBookings} />;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Мои бронирования</h1>

      {bookings.length === 0 ? (
        <div className="text-center py-12">
          <CalendarDays className="size-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Нет бронирований</p>
          <p className="text-sm text-gray-400 mt-1">
            Найдите площадку и забронируйте время
          </p>
          <Link
            to="/"
            className="inline-block mt-4 text-primary-600 font-medium text-sm hover:underline"
          >
            Перейти к площадкам
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => {
            const status = STATUS_MAP[booking.status] || {
              label: booking.status,
              variant: "neutral" as const,
            };

            return (
              <div
                key={booking.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="p-4 space-y-3">
                  {/* Header: venue name + status */}
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      to={`/venues/${booking.venue}`}
                      className="font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                    >
                      {booking.venue_name || `Площадка #${booking.venue}`}
                    </Link>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>

                  {/* Details */}
                  <div className="flex flex-col gap-1.5 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="size-3.5" />
                      {formatDate(booking.booking_date)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="size-3.5" />
                      {formatTime(booking.start_time)} —{" "}
                      {formatTime(booking.end_time)}
                    </div>
                  </div>

                  {/* Price + Cancel */}
                  <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                    <span className="font-bold text-primary-700">
                      {Number(booking.total_price).toLocaleString("ru-RU")} сум
                    </span>

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
