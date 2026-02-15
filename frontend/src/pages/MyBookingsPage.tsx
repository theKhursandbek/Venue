import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Clock, X, ArrowRight } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ru, enUS, uz } from "date-fns/locale";
import type { Locale } from "date-fns";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import PageLoader from "@/components/ui/PageLoader";
import ErrorBox from "@/components/ui/ErrorBox";
import { bookingService } from "@/services/bookingService";
import { useRevealChildren } from "@/hooks/useReveal";
import type { Booking, APIError } from "@/types";
import type { AxiosError } from "axios";

const DATE_LOCALES: Record<string, Locale> = { ru, en: enUS, uz };

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const { t, i18n } = useTranslation();
  const dateLocale = DATE_LOCALES[i18n.language] || uz;

  const STATUS_MAP: Record<
    string,
    { label: string; variant: "success" | "warning" | "danger" | "info" | "neutral" }
  > = {
    pending: { label: t("bookings.status.pending"), variant: "warning" },
    confirmed: { label: t("bookings.status.confirmed"), variant: "success" },
    cancelled: { label: t("bookings.status.cancelled"), variant: "danger" },
    completed: { label: t("bookings.status.completed"), variant: "info" },
  };

  const fetchBookings = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await bookingService.list();
      setBookings(data.results);
    } catch {
      setError(t("bookings.loadError"));
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
      toast.success(t("bookings.cancelSuccess"));
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b))
      );
    } catch (err) {
      const axiosErr = err as AxiosError<APIError>;
      toast.error(axiosErr.response?.data?.error?.message || t("bookings.cancelError"));
    } finally {
      setCancellingId(null);
    }
  };

  const canCancel = (booking: Booking) =>
    booking.status === "pending" || booking.status === "confirmed";

  const formatDate = (dateStr: string) =>
    format(parseISO(dateStr), "d MMMM, EEEE", { locale: dateLocale });

  const formatTime = (time: string) => time.slice(0, 5);

  const bookingsGridRef = useRevealChildren<HTMLDivElement>(0.05, 100);

  if (loading) return <PageLoader />;
  if (error) return <ErrorBox message={error} onRetry={fetchBookings} />;

  return (
    <div className="space-y-4 animate-page-enter stagger-children">
      <div className="flex items-end justify-between" data-scroll="left">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 tracking-tight">{t("bookings.title")} <span className="gradient-text-animated">{t("bookings.titleHighlight")}</span></h1>
          {bookings.length > 0 && (
            <p className="text-[12px] text-surface-500 mt-0.5 animate-fade-in" style={{animationDelay: '200ms'}}>
              {bookings.length} {bookings.length === 1 ? t("bookings.count_one") : t("bookings.count_other")}
            </p>
          )}
        </div>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-20" data-scroll="scale">
          <div className="size-16 rounded-2xl glass flex items-center justify-center mx-auto mb-4 animate-levitate">
            <CalendarDays className="size-7 text-surface-500" />
          </div>
          <p className="text-surface-700 text-[15px] font-semibold">{t("bookings.empty")}</p>
          <p className="text-[13px] text-surface-500 mt-1">{t("bookings.emptyHint")}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 mt-5 bg-linear-to-r from-primary-500 to-primary-600 text-white font-semibold text-[13px] px-5 py-2.5 rounded-xl shadow-lg shadow-primary-500/20 hover:shadow-xl transition-all duration-300 shimmer-line hover:-translate-y-0.5"
            data-scroll="up" data-scroll-delay="200"
          >
            {t("bookings.goToVenues")}
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      ) : (
        <div ref={bookingsGridRef} className="grid grid-cols-2 gap-2.5" data-scroll-stagger>
          {bookings.map((booking) => {
            const status = STATUS_MAP[booking.status] || {
              label: booking.status,
              variant: "neutral" as const,
            };

            return (
              <div
                key={booking.id}
                className="glass rounded-2xl p-3 space-y-2 tilt-card shimmer-line reveal-item"
                data-scroll-child
              >
                <div className="flex items-start justify-between gap-1">
                  <Link
                    to={`/venues/${booking.venue}`}
                    className="font-bold text-surface-900 hover:text-primary-600 transition-all duration-300 text-[13px] leading-snug line-clamp-1 group hover:translate-x-0.5"
                  >
                    {booking.venue_name || `#${booking.venue}`}
                  </Link>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>

                <div className="space-y-1 text-[11px] text-surface-500">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="size-3 text-primary-500/60" />
                    {formatDate(booking.booking_date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3 text-primary-500/60" />
                    {formatTime(booking.start_time)} — {formatTime(booking.end_time)}
                  </span>
                </div>

                <div className="pt-1.5 border-t border-surface-300/30">
                  <span className="font-bold text-surface-900 text-[14px] gradient-text-animated">
                    {Number(booking.total_price).toLocaleString("ru-RU")}
                  </span>
                  <span className="font-normal text-surface-500 text-[10px] ml-1">{t("bookings.currency")}</span>
                  {canCancel(booking) && (
                    <div className="mt-2 animate-fade-in">
                      <Button
                        variant="danger"
                        size="sm"
                        loading={cancellingId === booking.id}
                        onClick={() => handleCancel(booking.id)}
                        className="w-full"
                      >
                        <X className="size-3" />
                        {t("bookings.cancel")}
                      </Button>
                    </div>
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
