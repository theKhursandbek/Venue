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

  // Booking state
  const [selectedDate, setSelectedDate] = useState(
    format(addDays(new Date(), 1), "yyyy-MM-dd")
  );
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedStart, setSelectedStart] = useState<string | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  // Fetch venue
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

  // Fetch availability
  useEffect(() => {
    if (!id) return;
    const fetch = async () => {
      setSlotsLoading(true);
      try {
        const { data } = await venueService.availability(
          Number(id),
          selectedDate
        );
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
      // Start new selection
      setSelectedStart(slot.start_time);
      setSelectedEnd(slot.end_time);
    } else {
      // Extend selection
      if (slot.start_time >= selectedStart) {
        // Check continuity
        const startIdx = slots.findIndex(
          (s) => s.start_time === selectedStart
        );
        const endIdx = slots.findIndex(
          (s) => s.start_time === slot.start_time
        );
        const allAvailable = slots
          .slice(startIdx, endIdx + 1)
          .every((s) => s.is_available);

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
      toast.success("Бронирование создано!");
      navigate("/bookings");
    } catch (err) {
      const axiosErr = err as AxiosError<APIError>;
      const message =
        axiosErr.response?.data?.error?.message ||
        "Ошибка создания бронирования";
      toast.error(message);
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
    return {
      hours,
      total: total.toLocaleString("ru-RU"),
    };
  };

  const priceInfo = calculatePrice();
  const images = venue?.all_image_urls || venue?.images || [];

  if (loading) return <PageLoader />;
  if (error || !venue) return <ErrorBox message={error} onRetry={() => navigate(0)} />;

  return (
    <div className="space-y-4 -mx-4 -mt-4">
      {/* Image Gallery */}
      <div className="relative h-56 bg-gray-100">
        {images.length > 0 ? (
          <>
            <img
              src={images[currentImage]}
              alt={venue.name}
              className="w-full h-full object-cover"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setCurrentImage(
                      (currentImage - 1 + images.length) % images.length
                    )
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 size-8 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  onClick={() =>
                    setCurrentImage((currentImage + 1) % images.length)
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 size-8 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
                >
                  <ChevronRight className="size-5" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {images.map((_, i) => (
                    <div
                      key={i}
                      className={`size-1.5 rounded-full transition-colors ${
                        i === currentImage ? "bg-white" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="size-12 text-gray-300" />
          </div>
        )}

        <button
          onClick={() => navigate(-1)}
          className="absolute top-3 left-3 size-9 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
        >
          <ArrowLeft className="size-5" />
        </button>
      </div>

      <div className="px-4 space-y-5">
        {/* Info */}
        <div>
          <h1 className="text-xl font-bold text-gray-900">{venue.name}</h1>
          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
            <MapPin className="size-3.5" />
            {venue.address}
          </p>
          <p className="text-lg font-bold text-primary-600 mt-2">
            {Number(venue.price_per_hour).toLocaleString("ru-RU")} сум/час
          </p>
        </div>

        {/* Description */}
        {venue.description && (
          <p className="text-sm text-gray-600 leading-relaxed">
            {venue.description}
          </p>
        )}

        {/* Amenities */}
        {venue.amenities && venue.amenities.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Удобства
            </h3>
            <div className="flex flex-wrap gap-2">
              {venue.amenities.map((amenity) => (
                <span
                  key={amenity}
                  className="flex items-center gap-1 text-sm bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg"
                >
                  <Check className="size-3.5 text-green-500" />
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Date Selector */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
            <CalendarDays className="size-4" />
            Выберите дату
          </h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => changeDate(-1)}
              disabled={isBefore(
                addDays(new Date(selectedDate), -1),
                startOfToday()
              )}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30"
            >
              <ChevronLeft className="size-4" />
            </button>
            <div className="flex-1 text-center">
              <p className="font-semibold text-gray-900">
                {format(new Date(selectedDate), "d MMMM, EEEE", {
                  locale: ru,
                })}
              </p>
            </div>
            <button
              onClick={() => changeDate(1)}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>

        {/* Time Slots */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
            <Clock className="size-4" />
            Выберите время
          </h3>

          {slotsLoading ? (
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 bg-gray-100 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : slots.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">
              Нет доступных слотов
            </p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot.start_time}
                  onClick={() => handleSlotClick(slot)}
                  disabled={!slot.is_available}
                  className={`py-2 px-1 rounded-lg text-sm font-medium transition-all ${
                    isSlotSelected(slot)
                      ? "bg-primary-600 text-white shadow-sm"
                      : slot.is_available
                      ? "bg-white border border-gray-200 text-gray-700 hover:border-primary-300"
                      : "bg-gray-100 text-gray-300 cursor-not-allowed line-through"
                  }`}
                >
                  {slot.start_time.slice(0, 5)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Booking Summary & Button */}
        {selectedStart && selectedEnd && priceInfo && (
          <div className="bg-primary-50 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Время</span>
              <span className="font-semibold text-gray-900">
                {selectedStart.slice(0, 5)} — {selectedEnd.slice(0, 5)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Длительность</span>
              <span className="font-semibold text-gray-900">
                {priceInfo.hours} ч
              </span>
            </div>
            <div className="flex justify-between text-sm border-t border-primary-100 pt-2">
              <span className="text-gray-600 font-medium">Итого</span>
              <span className="font-bold text-primary-700 text-base">
                {priceInfo.total} сум
              </span>
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
      </div>
    </div>
  );
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}
