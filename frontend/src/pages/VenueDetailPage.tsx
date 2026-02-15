import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
  Sparkles,
  Zap,
} from "lucide-react";
import { format, addDays, isBefore, startOfToday } from "date-fns";
import { ru, enUS, uz } from "date-fns/locale";
import type { Locale } from "date-fns";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import PageLoader from "@/components/ui/PageLoader";
import ErrorBox from "@/components/ui/ErrorBox";
import { useReveal } from "@/hooks/useReveal";
import { venueService } from "@/services/venueService";
import { bookingService } from "@/services/bookingService";
import type { Venue, TimeSlot, APIError } from "@/types";
import type { AxiosError } from "axios";
import { getNumberLocale } from "@/utils/locale";

const DATE_LOCALES: Record<string, Locale> = { ru, en: enUS, uz };

export default function VenueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const dateLocale = DATE_LOCALES[i18n.language] || uz;

  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedDate, setSelectedDate] = useState(
    format(addDays(new Date(), 1), "yyyy-MM-dd")
  );
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedStart, setSelectedStart] = useState<string | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await venueService.detail(Number(id));
        setVenue(data);
      } catch {
        setError(t("venueDetail.loadError"));
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, i18n.language]);

  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      setSlotsLoading(true);
      try {
        const { data } = await venueService.availability(Number(id), selectedDate);
        setSlots(data.time_slots);
        setSelectedStart(null);
        setSelectedEnd(null);
      } catch {
        setSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };
    fetch();
  }, [id, selectedDate, i18n.language]);

  const handleSlotClick = (slot: TimeSlot) => {
    if (!slot.is_available) return;

    const selectSlot = () => {
      setSelectedStart(slot.start_time);
      setSelectedEnd(slot.end_time);
    };

    if (!selectedStart || (selectedStart && selectedEnd)) {
      selectSlot();
    } else if (slot.start_time >= selectedStart) {
      const startIdx = slots.findIndex((s) => s.start_time === selectedStart);
      const endIdx = slots.findIndex((s) => s.start_time === slot.start_time);
      const allAvailable = slots.slice(startIdx, endIdx + 1).every((s) => s.is_available);
      if (allAvailable) {
        setSelectedEnd(slot.end_time);
      } else {
        selectSlot();
      }
    } else {
      selectSlot();
    }
  };

  const isSlotSelected = (slot: TimeSlot) => {
    if (!selectedStart || !selectedEnd) return false;
    return slot.start_time >= selectedStart && slot.end_time <= selectedEnd;
  };

  const getSlotClassName = (slot: TimeSlot) => {
    if (isSlotSelected(slot)) {
      return "bg-linear-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25 scale-105 animated-gradient";
    }
    if (slot.is_available) {
      return "glass text-surface-900 hover:text-primary-600 hover:border-primary-500/20 hover:scale-105 hover:shadow-md";
    }
    return "text-surface-400 cursor-not-allowed line-through opacity-50";
  };

  const handleBook = async () => {
    if (!selectedStart || !selectedEnd || !id) return;
    setBooking(true);
    try {
      await bookingService.create({
        venue: Number(id),
        booking_date: selectedDate,
        start_time: selectedStart,
        end_time: selectedEnd,
      });
      toast.success(t("venueDetail.bookingCreated"));
      navigate("/bookings");
    } catch (err) {
      const axiosErr = err as AxiosError<APIError>;
      toast.error(axiosErr.response?.data?.error?.message || t("venueDetail.bookingError"));
    } finally {
      setBooking(false);
    }
  };

  const changeDate = (days: number) => {
    const newDate = addDays(new Date(selectedDate), days);
    if (!isBefore(newDate, startOfToday())) {
      setSelectedDate(format(newDate, "yyyy-MM-dd"));
    }
  };

  const calculatePrice = () => {
    if (!selectedStart || !selectedEnd || !venue) return null;
    const start = timeToMinutes(selectedStart);
    const end = timeToMinutes(selectedEnd);
    const hours = (end - start) / 60;
    const total = hours * Number(venue.price_per_hour);
    return { hours, total: total.toLocaleString(getNumberLocale(i18n.language)) };
  };

  const priceInfo = calculatePrice();
  const images = venue?.all_image_urls || venue?.images || [];
  const availableCount = slots.filter((s) => s.is_available).length;

  const priceRef = useReveal<HTMLDivElement>();
  const descRef = useReveal<HTMLDivElement>();
  const amenitiesRef = useReveal<HTMLDivElement>();
  const dateRef = useReveal<HTMLDivElement>();
  const slotsRef = useReveal<HTMLDivElement>();

  if (loading) return <PageLoader />;
  if (error || !venue) return <ErrorBox message={error} onRetry={() => navigate(0)} />;

  return (
    <div className="-mt-5 animate-page-enter">
      {/* Gallery */}
      <div className="relative h-64 bg-surface-200 overflow-hidden" data-scroll="scale">
        {images.length > 0 ? (
          <>
            <img src={images[currentImage]} alt={venue.name} className="w-full h-full object-cover transition-all duration-700 hover:scale-105" />
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-black/20" />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImage((currentImage - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 size-9 bg-black/40 backdrop-blur-sm rounded-xl flex items-center justify-center text-white/90 active:scale-90 transition-all duration-300 hover:bg-black/60 hover:scale-110 animate-slide-left"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  onClick={() => setCurrentImage((currentImage + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 size-9 bg-black/40 backdrop-blur-sm rounded-xl flex items-center justify-center text-white/90 active:scale-90 transition-all duration-300 hover:bg-black/60 hover:scale-110 animate-slide-right"
                >
                  <ChevronRight className="size-4" />
                </button>
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((imgUrl, i) => (
                    <button
                      key={imgUrl}
                      onClick={() => setCurrentImage(i)}
                      className={`rounded-full transition-all duration-500 ${
                        i === currentImage ? "w-6 h-1.5 bg-primary-400 animate-breathe" : "w-1.5 h-1.5 bg-white/30 hover:bg-white/60"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="size-10 text-surface-400" />
          </div>
        )}

        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 size-10 bg-black/40 backdrop-blur-sm rounded-xl flex items-center justify-center text-white/90 active:scale-90 transition-all duration-300 hover:bg-black/60 hover:scale-110 animate-slide-left"
        >
          <ArrowLeft className="size-4" />
        </button>

        {images.length > 1 && (
          <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm text-white/80 text-[11px] font-semibold px-3 py-1.5 rounded-xl animate-slide-right">
            {currentImage + 1}/{images.length}
          </div>
        )}

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5" data-scroll="up">
          <h1 className="text-xl font-bold text-white leading-snug">{venue.name}</h1>
          <p className="text-[13px] text-white/50 flex items-center gap-1.5 mt-1">
            <MapPin className="size-3.5" />
            {venue.address}
          </p>
        </div>
      </div>

      <div className="pt-4 space-y-3">
        {/* Price card */}
        <div ref={priceRef} className="glass rounded-2xl p-4 flex items-center justify-between tilt-card shimmer-line aurora-glow reveal-scale" data-scroll="flip">
          <div>
            <p className="text-[11px] text-surface-500 uppercase tracking-wider mb-0.5">{t("venueDetail.price")}</p>
            <span className="text-2xl font-bold gradient-text-animated neon-text">{Number(venue.price_per_hour).toLocaleString(getNumberLocale(i18n.language))}</span>
          </div>
          <span className="text-[13px] text-surface-500 glass rounded-xl px-3 py-1.5">{t("venueDetail.perHour")}</span>
        </div>

        {/* Description */}
        {venue.description && (
          <div ref={descRef} className="glass rounded-2xl p-4 tilt-card reveal-up" data-scroll="up">
            <p className="text-[13px] text-surface-600 leading-relaxed">{venue.description}</p>
          </div>
        )}

        {/* Amenities */}
        {venue.amenities && venue.amenities.length > 0 && (
          <div ref={amenitiesRef} className="glass rounded-2xl p-4 tilt-card reveal-left" data-scroll="left">
            <p className="text-[12px] font-semibold text-surface-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-accent-500 animate-pendulum" />
              {t("venueDetail.amenities")}
            </p>
            <div className="flex flex-wrap gap-2">
              {venue.amenities.map((amenity, i) => (
                <span key={amenity} className="text-[12px] text-surface-700 bg-primary-500/8 border border-primary-500/15 px-3 py-1.5 rounded-xl flex items-center gap-1.5 animate-scale-in transition-all duration-300 hover:scale-105 hover:bg-primary-500/15 hover:border-primary-500/30" style={{animationDelay: `${i * 60}ms`}}>
                  <Check className="size-3 text-primary-500" />
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Date selector */}
        <div ref={dateRef} className="glass rounded-2xl p-4 tilt-card reveal-right" data-scroll="right">
          <p className="text-[12px] font-semibold text-surface-600 uppercase tracking-wider mb-3">{t("venueDetail.date")}</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => changeDate(-1)}
              disabled={isBefore(addDays(new Date(selectedDate), -1), startOfToday())}
              className="size-10 rounded-xl glass flex items-center justify-center disabled:opacity-15 active:scale-90 transition-all duration-300 hover:scale-110 hover:bg-primary-500/10"
            >
              <ChevronLeft className="size-4 text-surface-500" />
            </button>
            <div className="flex-1 text-center">
              <p className="font-bold text-surface-900 text-[16px] animate-fade-in" key={selectedDate}>
                {format(new Date(selectedDate), "d MMMM", { locale: dateLocale })}
              </p>
              <p className="text-[12px] text-surface-500 capitalize mt-0.5">
                {format(new Date(selectedDate), "EEEE", { locale: dateLocale })}
              </p>
            </div>
            <button
              onClick={() => changeDate(1)}
              className="size-10 rounded-xl glass flex items-center justify-center active:scale-90 transition-all duration-300 hover:scale-110 hover:bg-primary-500/10"
            >
              <ChevronRight className="size-4 text-surface-500" />
            </button>
          </div>
        </div>

        {/* Time slots */}
        <div ref={slotsRef} className="glass rounded-2xl p-4 tilt-card reveal-up" data-scroll="up">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[12px] font-semibold text-surface-600 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="size-3.5 text-primary-500" />
              {t("venueDetail.time")}
            </p>
            {!slotsLoading && slots.length > 0 && (
              <span className="text-[11px] text-primary-600 font-semibold bg-primary-500/10 border border-primary-500/15 px-2.5 py-1 rounded-lg animate-scale-in">
                {availableCount} {t("venueDetail.available")}
              </span>
            )}
          </div>

          {slotsLoading && (
            <div className="grid grid-cols-4 gap-2">
              {(["s1","s2","s3","s4","s5","s6","s7","s8","s9","s10","s11","s12"] as const).map((skeletonId, i) => (
                <div key={skeletonId} className="h-10 skeleton rounded-xl" style={{animationDelay: `${i * 50}ms`}} />
              ))}
            </div>
          )}
          {!slotsLoading && slots.length === 0 && (
            <div className="text-center py-8" data-scroll="up">
              <p className="text-[13px] text-surface-500">{t("venueDetail.noSlots")}</p>
            </div>
          )}
          {!slotsLoading && slots.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {slots.map((slot, i) => (
                <button
                  key={slot.start_time}
                  onClick={() => handleSlotClick(slot)}
                  disabled={!slot.is_available}
                  className={`py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-300 active:scale-95 animate-scale-in ${getSlotClassName(slot)}`}
                  style={{animationDelay: `${i * 30}ms`}}
                >
                  {slot.start_time.slice(0, 5)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Booking summary */}
        {selectedStart && selectedEnd && priceInfo && (
          <div className="glass rounded-2xl p-5 border-primary-500/20 aurora-glow space-y-3" data-scroll="scale">
            <p className="text-[12px] font-semibold text-primary-600 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="size-3.5 animate-heartbeat" />
              {t("venueDetail.summary")}
            </p>
            <div className="flex justify-between text-[13px] animate-slide-left" style={{animationDelay: '100ms'}}>
              <span className="text-surface-500">{t("venueDetail.timeRange")}</span>
              <span className="text-surface-800 font-semibold">{selectedStart.slice(0, 5)} — {selectedEnd.slice(0, 5)}</span>
            </div>
            <div className="flex justify-between text-[13px] animate-slide-right" style={{animationDelay: '150ms'}}>
              <span className="text-surface-500">{t("venueDetail.duration")}</span>
              <span className="text-surface-800 font-semibold">{priceInfo.hours} {t("venueDetail.hours")}</span>
            </div>
            <div className="h-px bg-surface-300/50 my-1" />
            <div className="flex justify-between items-baseline animate-scale-in" style={{animationDelay: '200ms'}}>
              <span className="text-[13px] text-surface-500">{t("venueDetail.totalPrice")}</span>
              <span className="text-xl font-bold gradient-text-animated neon-text">{priceInfo.total} {t("venueDetail.currency")}</span>
            </div>
            <div className="animate-bounce-in" style={{animationDelay: '250ms'}}>
              <Button onClick={handleBook} loading={booking} className="w-full" size="lg">
                {t("venueDetail.book")}
              </Button>
            </div>
          </div>
        )}

        <div className="h-6" />
      </div>
    </div>
  );
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}
