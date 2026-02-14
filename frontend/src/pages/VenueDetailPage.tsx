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
    <div className="space-y-4 -mx-4 -mt-4 animate-fade-in">
      {/* ═══ Image Gallery ═══ */}
      <div className="relative h-52 bg-surface-850">
        {images.length > 0 ? (
          <>
            <img
              src={images[currentImage]}
              alt={venue.name}
              className="w-full h-full object-cover transition-opacity duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-950/80 via-surface-950/5 to-surface-950/20" />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImage((currentImage - 1 + images.length) % images.length)}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 size-7 bg-surface-950/40 backdrop-blur-lg rounded-md flex items-center justify-center text-white/80 hover:bg-surface-950/60 transition-all active:scale-85 border border-white/[0.06]"
                >
                  <ChevronLeft className="size-3.5" />
                </button>
                <button
                  onClick={() => setCurrentImage((currentImage + 1) % images.length)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 size-7 bg-surface-950/40 backdrop-blur-lg rounded-md flex items-center justify-center text-white/80 hover:bg-surface-950/60 transition-all active:scale-85 border border-white/[0.06]"
                >
                  <ChevronRight className="size-3.5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImage(i)}
                      className={`rounded-full transition-all duration-300 ${
                        i === currentImage
                          ? "w-5 h-1 bg-primary-400"
                          : "w-1 h-1 bg-white/25 hover:bg-white/40"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-850">
            <MapPin className="size-10 text-surface-600" />
          </div>
        )}

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-3 left-3 size-7 bg-surface-950/40 backdrop-blur-lg rounded-md flex items-center justify-center text-white/80 hover:bg-surface-950/60 transition-all active:scale-85 border border-white/[0.06]"
        >
          <ArrowLeft className="size-3.5" />
        </button>

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute top-3 right-3 bg-surface-950/40 backdrop-blur-lg text-surface-300 text-[10px] font-medium px-2 py-0.5 rounded-md border border-white/[0.06]">
            {currentImage + 1}/{images.length}
          </div>
        )}

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h1 className="text-lg font-semibold text-white leading-snug">{venue.name}</h1>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="size-2.5 text-white/40" />
            <span className="text-xs text-white/50">{venue.address}</span>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-3.5">
        {/* ═══ Price Card ═══ */}
        <div className="bg-surface-900/80 rounded-lg border border-surface-700/25 p-3.5 inner-light">
          <div className="flex items-center gap-2.5">
            <div className="size-8 bg-primary-500/8 border border-primary-500/15 rounded-md flex items-center justify-center">
              <CreditCard className="size-3.5 text-primary-400" />
            </div>
            <div>
              <p className="text-[10px] text-surface-500 font-medium uppercase tracking-wider">Стоимость</p>
              <div className="flex items-baseline gap-1">
                <span className="text-base font-semibold text-surface-100">{Number(venue.price_per_hour).toLocaleString("ru-RU")}</span>
                <span className="text-xs text-surface-500">сум/час</span>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ Description ═══ */}
        {venue.description && (
          <div className="bg-surface-900/80 rounded-lg border border-surface-700/25 p-3.5">
            <p className="text-xs text-surface-400 leading-relaxed">{venue.description}</p>
          </div>
        )}

        {/* ═══ Amenities ═══ */}
        {venue.amenities && venue.amenities.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-surface-300 mb-2">Удобства</h3>
            <div className="grid grid-cols-2 gap-1.5">
              {venue.amenities.map((amenity) => (
                <div
                  key={amenity}
                  className="flex items-center gap-1.5 text-xs bg-surface-900/60 border border-surface-700/25 text-surface-400 px-2.5 py-2 rounded-md"
                >
                  <Check className="size-3 text-success-500 shrink-0" />
                  <span className="truncate">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ Date Selector ═══ */}
        <div className="bg-surface-900/80 rounded-lg border border-surface-700/25 p-3.5 space-y-2.5 inner-light">
          <h3 className="text-xs font-medium text-surface-300 flex items-center gap-1.5">
            <CalendarDays className="size-3.5 text-primary-400" />
            Дата
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeDate(-1)}
              disabled={isBefore(addDays(new Date(selectedDate), -1), startOfToday())}
              className="p-2 rounded-md border border-surface-700/30 bg-surface-850 hover:bg-surface-800 disabled:opacity-15 transition-all active:scale-85"
            >
              <ChevronLeft className="size-3.5 text-surface-400" />
            </button>
            <div className="flex-1 text-center bg-surface-850 border border-surface-700/30 rounded-lg py-2 px-3">
              <p className="font-semibold text-surface-200 text-sm">
                {format(new Date(selectedDate), "d MMMM", { locale: ru })}
              </p>
              <p className="text-[10px] text-surface-500 capitalize mt-0.5">
                {format(new Date(selectedDate), "EEEE", { locale: ru })}
              </p>
            </div>
            <button
              onClick={() => changeDate(1)}
              className="p-2 rounded-md border border-surface-700/30 bg-surface-850 hover:bg-surface-800 transition-all active:scale-85"
            >
              <ChevronRight className="size-3.5 text-surface-400" />
            </button>
          </div>
        </div>

        {/* ═══ Time Slots ═══ */}
        <div className="bg-surface-900/80 rounded-lg border border-surface-700/25 p-3.5 space-y-2.5 inner-light">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-surface-300 flex items-center gap-1.5">
              <Clock className="size-3.5 text-primary-400" />
              Время
            </h3>
            {!slotsLoading && slots.length > 0 && (
              <span className="text-[10px] font-medium text-success-400 bg-success-50 px-2 py-0.5 rounded border border-success-500/15">
                {availableCount} свободных
              </span>
            )}
          </div>

          {slotsLoading ? (
            <div className="grid grid-cols-4 gap-1.5">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-9 skeleton rounded-md" />
              ))}
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-6">
              <div className="size-10 bg-surface-850 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Clock className="size-4 text-surface-600" />
              </div>
              <p className="text-xs text-surface-500">Нет доступных слотов</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-1.5">
              {slots.map((slot) => (
                <button
                  key={slot.start_time}
                  onClick={() => handleSlotClick(slot)}
                  disabled={!slot.is_available}
                  className={`py-2 px-1 rounded-md text-xs font-medium transition-all duration-200 active:scale-85 ${
                    isSlotSelected(slot)
                      ? "bg-gradient-to-r from-primary-500 to-primary-400 text-surface-950 shadow-md shadow-primary-500/20"
                      : slot.is_available
                      ? "bg-surface-850 border border-surface-700/30 text-surface-300 hover:border-primary-500/25 hover:text-primary-400"
                      : "bg-surface-850/40 text-surface-600 cursor-not-allowed line-through opacity-40"
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
          <div className="bg-surface-900/80 rounded-lg border border-primary-500/15 p-4 space-y-3 animate-scale-in inner-light">
            <h3 className="text-xs font-medium text-surface-300">Итоги бронирования</h3>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-surface-500 flex items-center gap-1.5">
                  <Timer className="size-3" /> Время
                </span>
                <span className="font-medium text-surface-200 text-sm">
                  {selectedStart.slice(0, 5)} — {selectedEnd.slice(0, 5)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-surface-500 flex items-center gap-1.5">
                  <Clock className="size-3" /> Длительность
                </span>
                <span className="font-medium text-surface-200 text-sm">{priceInfo.hours} ч</span>
              </div>
              <div className="flex justify-between items-center pt-2.5 border-t border-surface-700/30">
                <span className="text-xs font-medium text-surface-400">Итого</span>
                <span className="font-semibold text-primary-400 text-lg">{priceInfo.total} сум</span>
              </div>
            </div>

            <Button
              onClick={handleBook}
              loading={booking}
              className="w-full"
              size="lg"
            >
              Забронировать
            </Button>
          </div>
        )}

        <div className="h-2" />
      </div>
    </div>
  );
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}
