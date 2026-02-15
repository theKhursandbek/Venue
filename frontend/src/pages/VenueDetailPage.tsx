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
import { ru } from "date-fns/locale";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import PageLoader from "@/components/ui/PageLoader";
import ErrorBox from "@/components/ui/ErrorBox";
import { venueService } from "@/services/venueService";
import { bookingService } from "@/services/bookingService";
import type { Venue, TimeSlot } from "@/types";
import type { AxiosError } from "axios";
import type { APIError } from "@/types";

export default function VenueDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

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
        setError("Не удалось загрузить площадку");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

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
  }, [id, selectedDate]);

  const handleSlotClick = (slot: TimeSlot) => {
    if (!slot.is_available) return;
    if (!selectedStart || (selectedStart && selectedEnd)) {
      setSelectedStart(slot.start_time);
      setSelectedEnd(slot.end_time);
    } else {
      if (slot.start_time >= selectedStart) {
        const startIdx = slots.findIndex((s) => s.start_time === selectedStart);
        const endIdx = slots.findIndex((s) => s.start_time === slot.start_time);
        const allAvailable = slots.slice(startIdx, endIdx + 1).every((s) => s.is_available);
        if (allAvailable) {
          setSelectedEnd(slot.end_time);
        } else {
          setSelectedStart(slot.start_time);
          setSelectedEnd(slot.end_time);
        }
      } else {
        setSelectedStart(slot.start_time);
        setSelectedEnd(slot.end_time);
      }
    }
  };

  const isSlotSelected = (slot: TimeSlot) => {
    if (!selectedStart || !selectedEnd) return false;
    return slot.start_time >= selectedStart && slot.end_time <= selectedEnd;
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
      toast.success("Бронирование создано! 🎉");
      navigate("/bookings");
    } catch (err) {
      const axiosErr = err as AxiosError<APIError>;
      toast.error(axiosErr.response?.data?.error?.message || "Ошибка создания бронирования");
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
    return { hours, total: total.toLocaleString("ru-RU") };
  };

  const priceInfo = calculatePrice();
  const images = venue?.all_image_urls || venue?.images || [];
  const availableCount = slots.filter((s) => s.is_available).length;

  if (loading) return <PageLoader />;
  if (error || !venue) return <ErrorBox message={error} onRetry={() => navigate(0)} />;

  return (
    <div className="-mt-5 animate-fade-in">
      {/* Gallery */}
      <div className="relative h-64 bg-surface-200">
        {images.length > 0 ? (
          <>
            <img src={images[currentImage]} alt={venue.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20" />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImage((currentImage - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 size-9 bg-black/40 backdrop-blur-sm rounded-xl flex items-center justify-center text-white/90 active:scale-90"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  onClick={() => setCurrentImage((currentImage + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 size-9 bg-black/40 backdrop-blur-sm rounded-xl flex items-center justify-center text-white/90 active:scale-90"
                >
                  <ChevronRight className="size-4" />
                </button>
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImage(i)}
                      className={`rounded-full transition-all ${
                        i === currentImage ? "w-6 h-1.5 bg-primary-400" : "w-1.5 h-1.5 bg-white/30"
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
          className="absolute top-4 left-4 size-10 bg-black/40 backdrop-blur-sm rounded-xl flex items-center justify-center text-white/90 active:scale-90"
        >
          <ArrowLeft className="size-4" />
        </button>

        {images.length > 1 && (
          <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm text-white/80 text-[11px] font-semibold px-3 py-1.5 rounded-xl">
            {currentImage + 1}/{images.length}
          </div>
        )}

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
          <h1 className="text-xl font-bold text-white leading-snug">{venue.name}</h1>
          <p className="text-[13px] text-white/50 flex items-center gap-1.5 mt-1">
            <MapPin className="size-3.5" />
            {venue.address}
          </p>
        </div>
      </div>

      <div className="pt-4 space-y-3">
        {/* Price card */}
        <div className="glass rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-surface-500 uppercase tracking-wider mb-0.5">Стоимость</p>
            <span className="text-2xl font-bold gradient-text">{Number(venue.price_per_hour).toLocaleString("ru-RU")}</span>
          </div>
          <span className="text-[13px] text-surface-500 glass rounded-xl px-3 py-1.5">сум / час</span>
        </div>

        {/* Description */}
        {venue.description && (
          <div className="glass rounded-2xl p-4">
            <p className="text-[13px] text-surface-600 leading-relaxed">{venue.description}</p>
          </div>
        )}

        {/* Amenities */}
        {venue.amenities && venue.amenities.length > 0 && (
          <div className="glass rounded-2xl p-4">
            <p className="text-[12px] font-semibold text-surface-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-accent-500" />
              Удобства
            </p>
            <div className="flex flex-wrap gap-2">
              {venue.amenities.map((amenity) => (
                <span key={amenity} className="text-[12px] text-surface-700 bg-primary-500/8 border border-primary-500/15 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <Check className="size-3 text-primary-500" />
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Date selector */}
        <div className="glass rounded-2xl p-4">
          <p className="text-[12px] font-semibold text-surface-600 uppercase tracking-wider mb-3">Дата</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => changeDate(-1)}
              disabled={isBefore(addDays(new Date(selectedDate), -1), startOfToday())}
              className="size-10 rounded-xl glass flex items-center justify-center disabled:opacity-15 active:scale-90 transition-all"
            >
              <ChevronLeft className="size-4 text-surface-500" />
            </button>
            <div className="flex-1 text-center">
              <p className="font-bold text-surface-900 text-[16px]">
                {format(new Date(selectedDate), "d MMMM", { locale: ru })}
              </p>
              <p className="text-[12px] text-surface-500 capitalize mt-0.5">
                {format(new Date(selectedDate), "EEEE", { locale: ru })}
              </p>
            </div>
            <button
              onClick={() => changeDate(1)}
              className="size-10 rounded-xl glass flex items-center justify-center active:scale-90 transition-all"
            >
              <ChevronRight className="size-4 text-surface-500" />
            </button>
          </div>
        </div>

        {/* Time slots */}
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[12px] font-semibold text-surface-600 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="size-3.5 text-primary-500" />
              Время
            </p>
            {!slotsLoading && slots.length > 0 && (
              <span className="text-[11px] text-primary-600 font-semibold bg-primary-500/10 border border-primary-500/15 px-2.5 py-1 rounded-lg">
                {availableCount} свободных
              </span>
            )}
          </div>

          {slotsLoading ? (
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-10 skeleton rounded-xl" />
              ))}
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[13px] text-surface-500">Нет доступных слотов</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot.start_time}
                  onClick={() => handleSlotClick(slot)}
                  disabled={!slot.is_available}
                  className={`py-2.5 rounded-xl text-[13px] font-semibold transition-all active:scale-95 ${
                    isSlotSelected(slot)
                      ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25"
                      : slot.is_available
                      ? "glass text-surface-900 hover:text-primary-600 hover:border-primary-500/20"
                      : "text-surface-400 cursor-not-allowed line-through opacity-50"
                  }`}
                >
                  {slot.start_time.slice(0, 5)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Booking summary */}
        {selectedStart && selectedEnd && priceInfo && (
          <div className="glass rounded-2xl p-5 border-primary-500/20 animate-scale-in space-y-3">
            <p className="text-[12px] font-semibold text-primary-600 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="size-3.5" />
              Итого
            </p>
            <div className="flex justify-between text-[13px]">
              <span className="text-surface-500">Время</span>
              <span className="text-surface-800 font-semibold">{selectedStart.slice(0, 5)} — {selectedEnd.slice(0, 5)}</span>
            </div>
            <div className="flex justify-between text-[13px]">
              <span className="text-surface-500">Длительность</span>
              <span className="text-surface-800 font-semibold">{priceInfo.hours} ч</span>
            </div>
            <div className="h-px bg-surface-300/50 my-1" />
            <div className="flex justify-between items-baseline">
              <span className="text-[13px] text-surface-500">К оплате</span>
              <span className="text-xl font-bold gradient-text">{priceInfo.total} сум</span>
            </div>
            <Button onClick={handleBook} loading={booking} className="w-full" size="lg">
              Забронировать
            </Button>
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
