import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Check,
  CreditCard,
  Timer,
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
    <div className="space-y-5 -mx-5 -mt-6 animate-fade-in">
      {/* ═══ Image Gallery ═══ */}
      <div className="relative h-64 bg-surface-800">
        {images.length > 0 ? (
          <>
            <img
              src={images[currentImage]}
              alt={venue.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-surface-950/70 via-surface-950/10 to-surface-950/30" />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImage((currentImage - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 size-9 bg-surface-950/40 backdrop-blur-xl rounded-xl flex items-center justify-center text-white hover:bg-surface-950/60 transition-all active:scale-90 border border-white/10"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  onClick={() => setCurrentImage((currentImage + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 size-9 bg-surface-950/40 backdrop-blur-xl rounded-xl flex items-center justify-center text-white hover:bg-surface-950/60 transition-all active:scale-90 border border-white/10"
                >
                  <ChevronRight className="size-4" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImage(i)}
                      className={`rounded-full transition-all duration-300 ${
                        i === currentImage
                          ? "w-6 h-1.5 bg-primary-400"
                          : "w-1.5 h-1.5 bg-white/30 hover:bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-800">
            <MapPin className="size-14 text-surface-600" />
          </div>
        )}

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 size-9 bg-surface-950/40 backdrop-blur-xl rounded-xl flex items-center justify-center text-white hover:bg-surface-950/60 transition-all active:scale-90 border border-white/10"
        >
          <ArrowLeft className="size-4" />
        </button>

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute top-4 right-4 bg-surface-950/40 backdrop-blur-xl text-surface-200 text-xs font-semibold px-2.5 py-1 rounded-lg border border-white/10">
            {currentImage + 1}/{images.length}
          </div>
        )}

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h1 className="text-xl font-bold text-white">{venue.name}</h1>
          <div className="flex items-center gap-1.5 mt-1">
            <MapPin className="size-3 text-white/50" />
            <span className="text-sm text-white/60">{venue.address}</span>
          </div>
        </div>
      </div>

      <div className="px-5 space-y-5">
        {/* ═══ Price Card ═══ */}
        <div className="bg-surface-900 rounded-xl border border-surface-700/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 bg-primary-500/10 border border-primary-500/20 rounded-xl flex items-center justify-center">
                <CreditCard className="size-4.5 text-primary-400" />
              </div>
              <div>
                <p className="text-xs text-surface-500 font-medium uppercase tracking-wider">Стоимость</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold text-surface-50">{Number(venue.price_per_hour).toLocaleString("ru-RU")}</span>
                  <span className="text-sm text-surface-500">сум/час</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ Description ═══ */}
        {venue.description && (
          <div className="bg-surface-900 rounded-xl border border-surface-700/50 p-4">
            <p className="text-sm text-surface-300 leading-relaxed">{venue.description}</p>
          </div>
        )}

        {/* ═══ Amenities ═══ */}
        {venue.amenities && venue.amenities.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-surface-200 mb-3">Удобства</h3>
            <div className="grid grid-cols-2 gap-2">
              {venue.amenities.map((amenity) => (
                <div
                  key={amenity}
                  className="flex items-center gap-2 text-sm bg-surface-900 border border-surface-700/50 text-surface-300 px-3 py-2.5 rounded-xl"
                >
                  <Check className="size-3.5 text-success-500 shrink-0" />
                  <span className="truncate">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ Date Selector ═══ */}
        <div className="bg-surface-900 rounded-xl border border-surface-700/50 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-surface-200 flex items-center gap-2">
            <CalendarDays className="size-4 text-primary-400" />
            Дата
          </h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => changeDate(-1)}
              disabled={isBefore(addDays(new Date(selectedDate), -1), startOfToday())}
              className="p-2.5 rounded-lg border border-surface-600/50 bg-surface-800 hover:bg-surface-700 disabled:opacity-20 transition-all active:scale-90"
            >
              <ChevronLeft className="size-4 text-surface-300" />
            </button>
            <div className="flex-1 text-center bg-surface-800 border border-surface-600/50 rounded-xl py-2.5 px-4">
              <p className="font-bold text-surface-100">
                {format(new Date(selectedDate), "d MMMM", { locale: ru })}
              </p>
              <p className="text-xs text-surface-500 capitalize mt-0.5">
                {format(new Date(selectedDate), "EEEE", { locale: ru })}
              </p>
            </div>
            <button
              onClick={() => changeDate(1)}
              className="p-2.5 rounded-lg border border-surface-600/50 bg-surface-800 hover:bg-surface-700 transition-all active:scale-90"
            >
              <ChevronRight className="size-4 text-surface-300" />
            </button>
          </div>
        </div>

        {/* ═══ Time Slots ═══ */}
        <div className="bg-surface-900 rounded-xl border border-surface-700/50 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-surface-200 flex items-center gap-2">
              <Clock className="size-4 text-primary-400" />
              Время
            </h3>
            {!slotsLoading && slots.length > 0 && (
              <span className="text-xs font-semibold text-success-400 bg-success-50 px-2.5 py-1 rounded-md border border-success-500/20">
                {availableCount} свободных
              </span>
            )}
          </div>

          {slotsLoading ? (
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-11 skeleton rounded-lg" />
              ))}
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-8">
              <div className="size-12 bg-surface-800 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Clock className="size-5 text-surface-600" />
              </div>
              <p className="text-sm text-surface-500">Нет доступных слотов</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot.start_time}
                  onClick={() => handleSlotClick(slot)}
                  disabled={!slot.is_available}
                  className={`py-2.5 px-1 rounded-lg text-sm font-semibold transition-all duration-200 active:scale-90 ${
                    isSlotSelected(slot)
                      ? "bg-primary-500 text-surface-950 shadow-lg shadow-primary-500/25"
                      : slot.is_available
                      ? "bg-surface-800 border border-surface-600/50 text-surface-200 hover:border-primary-500/30 hover:text-primary-400"
                      : "bg-surface-800/50 text-surface-600 cursor-not-allowed line-through"
                  }`}
                >
                  {slot.start_time.slice(0, 5)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ═══ Booking Summary ═══ */}
        {selectedStart && selectedEnd && priceInfo && (
          <div className="bg-surface-900 rounded-xl border border-primary-500/20 p-5 space-y-4 animate-scale-in">
            <h3 className="text-sm font-semibold text-surface-200">Итоги бронирования</h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-surface-500 flex items-center gap-2">
                  <Timer className="size-4" /> Время
                </span>
                <span className="font-semibold text-surface-100">
                  {selectedStart.slice(0, 5)} — {selectedEnd.slice(0, 5)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-surface-500 flex items-center gap-2">
                  <Clock className="size-4" /> Длительность
                </span>
                <span className="font-semibold text-surface-100">{priceInfo.hours} ч</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-surface-700/50">
                <span className="text-sm font-semibold text-surface-300">Итого</span>
                <span className="font-bold text-primary-400 text-xl">{priceInfo.total} сум</span>
              </div>
            </div>

            <Button
              onClick={handleBook}
              loading={booking}
              className="w-full py-4! text-base!"
              size="lg"
            >
              Забронировать
            </Button>
          </div>
        )}

        {/* Spacer for bottom nav */}
        <div className="h-4" />
      </div>
    </div>
  );
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}
