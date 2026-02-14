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
  Zap,
  CreditCard,
  Timer,
  Star,
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
    <div className="space-y-6 -mx-4 -mt-6 animate-fade-in">
      {/* ═══ Image Gallery — Cinematic ═══ */}
      <div className="relative h-72 bg-gray-100">
        {images.length > 0 ? (
          <>
            <img
              src={images[currentImage]}
              alt={venue.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/50 via-black/5 to-black/20" />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImage((currentImage - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 size-10 bg-white/15 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white hover:bg-white/25 transition-all active:scale-90 border border-white/10"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  onClick={() => setCurrentImage((currentImage + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 size-10 bg-white/15 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white hover:bg-white/25 transition-all active:scale-90 border border-white/10"
                >
                  <ChevronRight className="size-5" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImage(i)}
                      className={`rounded-full transition-all duration-300 ${
                        i === currentImage
                          ? "w-7 h-2 bg-white shadow-lg"
                          : "w-2 h-2 bg-white/40 hover:bg-white/60"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center mesh-gradient">
            <MapPin className="size-16 text-primary-200" />
          </div>
        )}

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 size-11 bg-white/15 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white hover:bg-white/25 transition-all active:scale-90 border border-white/10"
        >
          <ArrowLeft className="size-5" />
        </button>

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute top-4 right-4 bg-black/25 backdrop-blur-xl text-white text-xs font-bold px-3 py-1.5 rounded-xl border border-white/10">
            {currentImage + 1}/{images.length}
          </div>
        )}

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h1 className="text-2xl font-black text-white drop-shadow-lg">{venue.name}</h1>
          <div className="flex items-center gap-2 mt-1.5">
            <MapPin className="size-3.5 text-white/70" />
            <span className="text-sm text-white/80 font-medium">{venue.address}</span>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-6">
        {/* ═══ Price Card ═══ */}
        <div className="relative bg-white rounded-[22px] border border-gray-100/80 p-5 shadow-lg shadow-gray-900/[0.04] overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50/50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-12 bg-linear-to-br from-primary-100 to-primary-50 rounded-2xl flex items-center justify-center">
                <CreditCard className="size-5 text-primary-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Стоимость</p>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-gray-900">{Number(venue.price_per_hour).toLocaleString("ru-RU")}</span>
                  <span className="text-sm text-gray-400 font-semibold">сум/час</span>
                </div>
              </div>
            </div>
            <div className="size-10 bg-amber-50 rounded-2xl flex items-center justify-center">
              <Star className="size-5 text-amber-400 fill-amber-400" />
            </div>
          </div>
        </div>

        {/* ═══ Description ═══ */}
        {venue.description && (
          <div className="bg-white rounded-[22px] border border-gray-100/80 p-5 shadow-sm">
            <p className="text-sm text-gray-500 leading-relaxed font-medium">{venue.description}</p>
          </div>
        )}

        {/* ═══ Amenities ═══ */}
        {venue.amenities && venue.amenities.length > 0 && (
          <div>
            <h3 className="text-sm font-black text-gray-800 mb-3 flex items-center gap-2">
              <div className="size-7 bg-amber-50 rounded-lg flex items-center justify-center">
                <Zap className="size-4 text-amber-500" />
              </div>
              Удобства
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {venue.amenities.map((amenity) => (
                <div
                  key={amenity}
                  className="flex items-center gap-2.5 text-sm bg-white border border-gray-100/80 text-gray-700 px-4 py-3 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="size-6 bg-linear-to-br from-success-50 to-emerald-50 rounded-lg flex items-center justify-center shrink-0">
                    <Check className="size-3.5 text-success-500" />
                  </div>
                  <span className="font-semibold truncate">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ Date Selector ═══ */}
        <div className="bg-white rounded-[22px] border border-gray-100/80 p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-gray-800 flex items-center gap-2">
            <div className="size-7 bg-primary-50 rounded-lg flex items-center justify-center">
              <CalendarDays className="size-4 text-primary-500" />
            </div>
            Выберите дату
          </h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => changeDate(-1)}
              disabled={isBefore(addDays(new Date(selectedDate), -1), startOfToday())}
              className="p-3 rounded-xl border-2 border-gray-100 hover:bg-gray-50 disabled:opacity-20 transition-all active:scale-90"
            >
              <ChevronLeft className="size-4" />
            </button>
            <div className="flex-1 text-center bg-linear-to-r from-primary-50/50 to-primary-50/30 border border-primary-100/50 rounded-2xl py-3 px-4">
              <p className="font-extrabold text-gray-900 text-base">
                {format(new Date(selectedDate), "d MMMM", { locale: ru })}
              </p>
              <p className="text-xs text-gray-400 capitalize font-semibold mt-0.5">
                {format(new Date(selectedDate), "EEEE", { locale: ru })}
              </p>
            </div>
            <button
              onClick={() => changeDate(1)}
              className="p-3 rounded-xl border-2 border-gray-100 hover:bg-gray-50 transition-all active:scale-90"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        {/* ═══ Time Slots ═══ */}
        <div className="bg-white rounded-[22px] border border-gray-100/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-gray-800 flex items-center gap-2">
              <div className="size-7 bg-primary-50 rounded-lg flex items-center justify-center">
                <Clock className="size-4 text-primary-500" />
              </div>
              Выберите время
            </h3>
            {!slotsLoading && slots.length > 0 && (
              <span className="text-xs font-bold text-success-600 bg-success-50 px-3 py-1.5 rounded-xl border border-success-100">
                {availableCount} свободных
              </span>
            )}
          </div>

          {slotsLoading ? (
            <div className="grid grid-cols-4 gap-2.5">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-12 skeleton rounded-xl" />
              ))}
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-8">
              <div className="size-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Clock className="size-7 text-gray-200" />
              </div>
              <p className="text-sm text-gray-400 font-semibold">Нет доступных слотов</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2.5">
              {slots.map((slot) => (
                <button
                  key={slot.start_time}
                  onClick={() => handleSlotClick(slot)}
                  disabled={!slot.is_available}
                  className={`py-3 px-1 rounded-xl text-sm font-bold transition-all duration-200 active:scale-90 ${
                    isSlotSelected(slot)
                      ? "bg-linear-to-r from-primary-600 via-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/30 scale-[1.03]"
                      : slot.is_available
                      ? "bg-gray-50 border-2 border-gray-100 text-gray-700 hover:border-primary-200 hover:bg-primary-50/30"
                      : "bg-gray-50 text-gray-200 cursor-not-allowed line-through"
                  }`}
                >
                  {slot.start_time.slice(0, 5)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ═══ Booking Summary — Premium ═══ */}
        {selectedStart && selectedEnd && priceInfo && (
          <div className="relative bg-white rounded-[22px] p-6 space-y-5 border border-gray-100/80 shadow-xl shadow-primary-500/5 animate-scale-in overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-linear-to-br from-primary-50 to-accent-50/50 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />

            <h3 className="relative text-sm font-black text-gray-800 flex items-center gap-2">
              <div className="size-7 bg-linear-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <Zap className="size-4 text-white" />
              </div>
              Итоги бронирования
            </h3>

            <div className="relative space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400 flex items-center gap-2 font-medium">
                  <Timer className="size-4" /> Время
                </span>
                <span className="font-bold text-gray-900">
                  {selectedStart.slice(0, 5)} — {selectedEnd.slice(0, 5)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400 flex items-center gap-2 font-medium">
                  <Clock className="size-4" /> Длительность
                </span>
                <span className="font-bold text-gray-900">{priceInfo.hours} ч</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <span className="text-sm font-bold text-gray-600">Итого</span>
                <span className="font-black text-primary-600 text-2xl">{priceInfo.total} сум</span>
              </div>
            </div>

            <Button
              onClick={handleBook}
              loading={booking}
              className="w-full rounded-2xl! py-4.5! text-base! font-bold!"
              size="lg"
            >
              ⚡ Забронировать
            </Button>
          </div>
        )}

        {/* Spacer for bottom nav */}
        <div className="h-6" />
      </div>
    </div>
  );
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}
