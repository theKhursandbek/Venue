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
    <div className="space-y-3 -mx-4 -mt-3 animate-fade-in">
      {/* Image Gallery */}
      <div className="relative h-48 bg-surface-850">
        {images.length > 0 ? (
          <>
            <img
              src={images[currentImage]}
              alt={venue.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-950/80 via-transparent to-surface-950/20" />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImage((currentImage - 1 + images.length) % images.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 size-7 bg-black/50 rounded flex items-center justify-center text-white/80 hover:bg-black/70 transition-colors active:scale-90"
                >
                  <ChevronLeft className="size-3.5" />
                </button>
                <button
                  onClick={() => setCurrentImage((currentImage + 1) % images.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 size-7 bg-black/50 rounded flex items-center justify-center text-white/80 hover:bg-black/70 transition-colors active:scale-90"
                >
                  <ChevronRight className="size-3.5" />
                </button>
                <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImage(i)}
                      className={`rounded-full transition-all duration-200 ${
                        i === currentImage ? "w-4 h-1 bg-primary-400" : "w-1 h-1 bg-white/30"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="size-8 text-surface-600" />
          </div>
        )}

        <button
          onClick={() => navigate(-1)}
          className="absolute top-2.5 left-2.5 size-7 bg-black/50 rounded flex items-center justify-center text-white/80 hover:bg-black/70 transition-colors active:scale-90"
        >
          <ArrowLeft className="size-3.5" />
        </button>

        {images.length > 1 && (
          <div className="absolute top-2.5 right-2.5 bg-black/50 text-surface-300 text-[10px] font-medium px-1.5 py-0.5 rounded">
            {currentImage + 1}/{images.length}
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-3.5">
          <h1 className="text-base font-semibold text-white leading-snug">{venue.name}</h1>
          <p className="text-[11px] text-white/50 flex items-center gap-1 mt-0.5">
            <MapPin className="size-2.5" />
            {venue.address}
          </p>
        </div>
      </div>

      <div className="px-4 space-y-2.5">
        {/* Price */}
        <div className="bg-surface-900 rounded-md border border-surface-700/20 p-3 v-edge flex items-center gap-2.5">
          <div className="size-7 bg-primary-500/10 border border-primary-500/15 rounded flex items-center justify-center">
            <CreditCard className="size-3 text-primary-400" />
          </div>
          <div>
            <p className="text-[10px] text-surface-500 font-medium uppercase tracking-wider">Стоимость</p>
            <div className="flex items-baseline gap-1">
              <span className="text-[15px] font-semibold text-surface-100">{Number(venue.price_per_hour).toLocaleString("ru-RU")}</span>
              <span className="text-[11px] text-surface-500">сум/час</span>
            </div>
          </div>
        </div>

        {/* Description */}
        {venue.description && (
          <div className="bg-surface-900 rounded-md border border-surface-700/20 p-3">
            <p className="text-[12px] text-surface-400 leading-relaxed">{venue.description}</p>
          </div>
        )}

        {/* Amenities */}
        {venue.amenities && venue.amenities.length > 0 && (
          <div>
            <h3 className="text-[11px] font-medium text-surface-400 mb-1.5">Удобства</h3>
            <div className="grid grid-cols-2 gap-1">
              {venue.amenities.map((amenity) => (
                <div
                  key={amenity}
                  className="flex items-center gap-1.5 text-[12px] bg-surface-900 border border-surface-700/20 text-surface-400 px-2.5 py-1.5 rounded"
                >
                  <Check className="size-2.5 text-success-500 shrink-0" />
                  <span className="truncate">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Date */}
        <div className="bg-surface-900 rounded-md border border-surface-700/20 p-3 space-y-2 v-edge">
          <h3 className="text-[11px] font-medium text-surface-400 flex items-center gap-1.5">
            <CalendarDays className="size-3 text-primary-400" />
            Дата
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeDate(-1)}
              disabled={isBefore(addDays(new Date(selectedDate), -1), startOfToday())}
              className="p-1.5 rounded border border-surface-700/30 bg-surface-850 hover:bg-surface-800 disabled:opacity-15 transition-colors active:scale-90"
            >
              <ChevronLeft className="size-3 text-surface-400" />
            </button>
            <div className="flex-1 text-center bg-surface-850 border border-surface-700/30 rounded py-1.5 px-2.5">
              <p className="font-semibold text-surface-200 text-[13px]">
                {format(new Date(selectedDate), "d MMMM", { locale: ru })}
              </p>
              <p className="text-[10px] text-surface-500 capitalize">
                {format(new Date(selectedDate), "EEEE", { locale: ru })}
              </p>
            </div>
            <button
              onClick={() => changeDate(1)}
              className="p-1.5 rounded border border-surface-700/30 bg-surface-850 hover:bg-surface-800 transition-colors active:scale-90"
            >
              <ChevronRight className="size-3 text-surface-400" />
            </button>
          </div>
        </div>

        {/* Time Slots */}
        <div className="bg-surface-900 rounded-md border border-surface-700/20 p-3 space-y-2 v-edge">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-medium text-surface-400 flex items-center gap-1.5">
              <Clock className="size-3 text-primary-400" />
              Время
            </h3>
            {!slotsLoading && slots.length > 0 && (
              <span className="text-[10px] font-medium text-success-400 bg-success-50 px-1.5 py-px rounded border border-success-500/15">
                {availableCount} свободных
              </span>
            )}
          </div>

          {slotsLoading ? (
            <div className="grid grid-cols-4 gap-1">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-8 skeleton rounded" />
              ))}
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-5">
              <Clock className="size-4 text-surface-600 mx-auto mb-1" />
              <p className="text-[11px] text-surface-500">Нет слотов</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-1">
              {slots.map((slot) => (
                <button
                  key={slot.start_time}
                  onClick={() => handleSlotClick(slot)}
                  disabled={!slot.is_available}
                  className={`py-1.5 rounded text-[12px] font-medium transition-colors duration-150 active:scale-90 ${
                    isSlotSelected(slot)
                      ? "bg-primary-500 text-white"
                      : slot.is_available
                      ? "bg-surface-850 border border-surface-700/30 text-surface-300 hover:border-primary-500/25 hover:text-primary-400"
                      : "bg-surface-850/30 text-surface-600 cursor-not-allowed line-through opacity-30"
                  }`}
                >
                  {slot.start_time.slice(0, 5)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Booking Summary */}
        {selectedStart && selectedEnd && priceInfo && (
          <div className="bg-surface-900 rounded-md border border-primary-500/15 p-3 space-y-2.5 animate-scale-in v-edge">
            <h3 className="text-[11px] font-medium text-surface-400">Итоги</h3>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-surface-500 flex items-center gap-1">
                  <Timer className="size-2.5" /> Время
                </span>
                <span className="font-medium text-surface-200 text-[13px]">
                  {selectedStart.slice(0, 5)} — {selectedEnd.slice(0, 5)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] text-surface-500 flex items-center gap-1">
                  <Clock className="size-2.5" /> Длительность
                </span>
                <span className="font-medium text-surface-200 text-[13px]">{priceInfo.hours} ч</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-surface-700/30">
                <span className="text-[11px] font-medium text-surface-400">Итого</span>
                <span className="font-semibold text-primary-400 text-base">{priceInfo.total} сум</span>
              </div>
            </div>
            <Button onClick={handleBook} loading={booking} className="w-full" size="lg">
              Забронировать
            </Button>
          </div>
        )}

        <div className="h-1" />
      </div>
    </div>
  );
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}
