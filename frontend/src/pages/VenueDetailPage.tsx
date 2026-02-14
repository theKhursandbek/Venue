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
    <div className="space-y-5 -mx-4 -mt-5 animate-fade-in">
      {/* Image Gallery */}
      <div className="relative h-64 bg-linear-to-br from-gray-100 to-gray-50">
        {images.length > 0 ? (
          <>
            <img
              src={images[currentImage]}
              alt={venue.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent" />
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImage((currentImage - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 size-9 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  onClick={() => setCurrentImage((currentImage + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 size-9 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  <ChevronRight className="size-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImage(i)}
                      className={`rounded-full transition-all ${
                        i === currentImage
                          ? "w-6 h-1.5 bg-white"
                          : "w-1.5 h-1.5 bg-white/50 hover:bg-white/70"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary-50 to-purple-50">
            <MapPin className="size-14 text-primary-200" />
          </div>
        )}

        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 size-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          <ArrowLeft className="size-5" />
        </button>

        {images.length > 1 && (
          <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1 rounded-xl">
            {currentImage + 1}/{images.length}
          </div>
        )}
      </div>

      <div className="px-4 space-y-6">
        {/* Title & Info */}
        <div className="space-y-3">
          <h1 className="text-2xl font-extrabold text-gray-900">{venue.name}</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <MapPin className="size-4 text-primary-500" />
              <span>{venue.address}</span>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 bg-linear-to-r from-primary-50 to-indigo-50 border border-primary-100 px-4 py-2 rounded-2xl">
            <CreditCard className="size-4 text-primary-600" />
            <span className="text-lg font-extrabold text-primary-700">
              {Number(venue.price_per_hour).toLocaleString("ru-RU")}
            </span>
            <span className="text-sm text-primary-500 font-medium">сум/час</span>
          </div>
        </div>

        {/* Description */}
        {venue.description && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <p className="text-sm text-gray-600 leading-relaxed">{venue.description}</p>
          </div>
        )}

        {/* Amenities */}
        {venue.amenities && venue.amenities.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">
              <Zap className="size-4 text-yellow-500" />
              Удобства
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {venue.amenities.map((amenity) => (
                <div
                  key={amenity}
                  className="flex items-center gap-2 text-sm bg-white border border-gray-100 text-gray-700 px-3 py-2.5 rounded-xl shadow-sm"
                >
                  <div className="size-5 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                    <Check className="size-3 text-green-600" />
                  </div>
                  <span className="font-medium truncate">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Date Selector */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
            <CalendarDays className="size-4 text-primary-500" />
            Выберите дату
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeDate(-1)}
              disabled={isBefore(addDays(new Date(selectedDate), -1), startOfToday())}
              className="p-2.5 rounded-xl border-2 border-gray-100 hover:bg-gray-50 disabled:opacity-20 transition-all"
            >
              <ChevronLeft className="size-4" />
            </button>
            <div className="flex-1 text-center bg-primary-50/50 border border-primary-100 rounded-xl py-2.5 px-3">
              <p className="font-bold text-gray-900 text-[15px]">
                {format(new Date(selectedDate), "d MMMM", { locale: ru })}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {format(new Date(selectedDate), "EEEE", { locale: ru })}
              </p>
            </div>
            <button
              onClick={() => changeDate(1)}
              className="p-2.5 rounded-xl border-2 border-gray-100 hover:bg-gray-50 transition-all"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        {/* Time Slots */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
              <Clock className="size-4 text-primary-500" />
              Выберите время
            </h3>
            {!slotsLoading && slots.length > 0 && (
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
                {availableCount} свободных
              </span>
            )}
          </div>

          {slotsLoading ? (
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-11 skeleton rounded-xl" />
              ))}
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-6">
              <Clock className="size-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400 font-medium">Нет доступных слотов</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot.start_time}
                  onClick={() => handleSlotClick(slot)}
                  disabled={!slot.is_available}
                  className={`py-2.5 px-1 rounded-xl text-sm font-semibold transition-all ${
                    isSlotSelected(slot)
                      ? "bg-linear-to-r from-primary-600 to-primary-500 text-white shadow-md shadow-primary-500/25 scale-[1.02]"
                      : slot.is_available
                      ? "bg-gray-50 border-2 border-gray-100 text-gray-700 hover:border-primary-200 hover:bg-primary-50/50"
                      : "bg-gray-50 text-gray-300 cursor-not-allowed line-through"
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
          <div className="bg-linear-to-br from-primary-50 via-primary-50 to-indigo-50 rounded-3xl p-5 space-y-4 border border-primary-100 shadow-sm animate-scale-in">
            <h3 className="text-sm font-bold text-primary-800 flex items-center gap-1.5">
              <Zap className="size-4" />
              Итоги бронирования
            </h3>

            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 flex items-center gap-1.5">
                  <Timer className="size-3.5" /> Время
                </span>
                <span className="font-bold text-gray-900">
                  {selectedStart.slice(0, 5)} — {selectedEnd.slice(0, 5)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 flex items-center gap-1.5">
                  <Clock className="size-3.5" /> Длительность
                </span>
                <span className="font-bold text-gray-900">{priceInfo.hours} ч</span>
              </div>
              <div className="flex justify-between items-center pt-2.5 border-t border-primary-200/50">
                <span className="text-sm font-semibold text-gray-700">Итого</span>
                <span className="font-extrabold text-primary-700 text-xl">{priceInfo.total} сум</span>
              </div>
            </div>

            <Button
              onClick={handleBook}
              loading={booking}
              className="w-full rounded-2xl! py-4! text-[15px]!"
              size="lg"
            >
              ⚡ Забронировать
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
