import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, SlidersHorizontal, X, ArrowRight } from "lucide-react";
import { venueService } from "@/services/venueService";
import PageLoader from "@/components/ui/PageLoader";
import ErrorBox from "@/components/ui/ErrorBox";
import type { Venue } from "@/types";

export default function VenueListPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const navigate = useNavigate();

  const fetchVenues = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await venueService.list({
        search: search || undefined,
        min_price: minPrice ? Number(minPrice) : undefined,
        max_price: maxPrice ? Number(maxPrice) : undefined,
      });
      setVenues(data.results);
    } catch {
      setError("Не удалось загрузить площадки");
    } finally {
      setLoading(false);
    }
  }, [search, minPrice, maxPrice]);

  useEffect(() => {
    const timer = setTimeout(fetchVenues, 300);
    return () => clearTimeout(timer);
  }, [fetchVenues]);

  const formatPrice = (price: string) =>
    Number(price).toLocaleString("ru-RU") + " сум/час";

  const getImage = (venue: Venue) => {
    if (venue.primary_image) return venue.primary_image;
    if (venue.all_image_urls?.length > 0) return venue.all_image_urls[0];
    return null;
  };

  const hasActiveFilters = minPrice || maxPrice;

  return (
    <div className="space-y-3 animate-fade-in">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-lg font-semibold text-surface-100 tracking-tight">
            Площадки
          </h1>
          {!loading && !error && (
            <p className="text-[11px] text-surface-500 mt-0.5">
              {venues.length} доступных
            </p>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-1.5 rounded-md border transition-colors duration-150 ${
            hasActiveFilters
              ? "bg-primary-500 text-white border-primary-500"
              : showFilters
              ? "bg-surface-800 text-surface-200 border-surface-600/40"
              : "text-surface-500 border-surface-700/30 hover:text-surface-300"
          }`}
        >
          <SlidersHorizontal className="size-3.5" />
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-surface-500" />
        <input
          type="text"
          placeholder="Поиск..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-8 pr-3 py-2 rounded-md border border-surface-700/30 bg-surface-900 text-surface-200 placeholder:text-surface-500 focus:outline-none focus:ring-1 focus:ring-primary-500/30 focus:border-primary-500/40 transition-colors text-[13px]"
        />
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-surface-900 border border-surface-700/30 rounded-md p-3 space-y-2 animate-scale-in v-edge">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-surface-300">Цена за час</span>
            {hasActiveFilters && (
              <button
                onClick={() => { setMinPrice(""); setMaxPrice(""); }}
                className="text-[10px] text-primary-400 hover:text-primary-300 font-medium"
              >
                Сбросить
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="От"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="flex-1 px-2.5 py-1.5 rounded border border-surface-700/30 bg-surface-850 text-surface-200 text-[12px] focus:outline-none focus:ring-1 focus:ring-primary-500/30"
            />
            <span className="text-surface-600 text-[11px] self-center">—</span>
            <input
              type="number"
              placeholder="До"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="flex-1 px-2.5 py-1.5 rounded border border-surface-700/30 bg-surface-850 text-surface-200 text-[12px] focus:outline-none focus:ring-1 focus:ring-primary-500/30"
            />
          </div>
        </div>
      )}

      {/* Active chips */}
      {hasActiveFilters && !showFilters && (
        <div className="flex items-center gap-1 animate-fade-in">
          {minPrice && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-surface-850 text-primary-400 px-2 py-0.5 rounded border border-primary-500/15">
              от {Number(minPrice).toLocaleString("ru-RU")}
              <button onClick={() => setMinPrice("")}><X className="size-2.5" /></button>
            </span>
          )}
          {maxPrice && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-surface-850 text-primary-400 px-2 py-0.5 rounded border border-primary-500/15">
              до {Number(maxPrice).toLocaleString("ru-RU")}
              <button onClick={() => setMaxPrice("")}><X className="size-2.5" /></button>
            </span>
          )}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <PageLoader />
      ) : error ? (
        <ErrorBox message={error} onRetry={fetchVenues} />
      ) : venues.length === 0 ? (
        <div className="text-center py-12 animate-fade-in">
          <MapPin className="size-6 text-surface-600 mx-auto mb-2" />
          <p className="font-medium text-surface-300 text-[13px]">Площадки не найдены</p>
          <p className="text-[11px] text-surface-500 mt-0.5">Попробуйте изменить параметры</p>
        </div>
      ) : (
        <div className="space-y-2 stagger-children">
          {venues.map((venue) => (
            <VenueCard
              key={venue.id}
              venue={venue}
              image={getImage(venue)}
              price={formatPrice(venue.price_per_hour)}
              onClick={() => navigate(`/venues/${venue.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function VenueCard({
  venue,
  image,
  price,
  onClick,
}: {
  venue: Venue;
  image: string | null;
  price: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex bg-surface-900 rounded-lg overflow-hidden border border-surface-700/20 v-card v-glow text-left group"
    >
      {/* Image — square left side */}
      <div className="w-28 min-h-[5.5rem] bg-surface-850 relative overflow-hidden shrink-0">
        {image ? (
          <img
            src={image}
            alt={venue.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="size-5 text-surface-600" />
          </div>
        )}
        {/* Image count */}
        {venue.image_count > 1 && (
          <div className="absolute top-1.5 left-1.5 bg-black/60 text-surface-300 text-[9px] font-medium px-1.5 py-px rounded">
            {venue.image_count} фото
          </div>
        )}
      </div>

      {/* Info — right side */}
      <div className="flex-1 p-2.5 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-start justify-between gap-1.5">
            <h3 className="font-semibold text-surface-200 text-[13px] leading-tight group-hover:text-primary-400 transition-colors duration-150 truncate">
              {venue.name}
            </h3>
            <ArrowRight className="size-3 text-surface-600 group-hover:text-primary-400 shrink-0 mt-0.5 transition-colors" />
          </div>
          <p className="text-[11px] text-surface-500 flex items-center gap-1 mt-0.5 truncate">
            <MapPin className="size-2.5 shrink-0" />
            {venue.address}
          </p>
        </div>

        <div className="flex items-end justify-between mt-1.5">
          {/* Amenities */}
          <div className="flex gap-1 overflow-hidden">
            {venue.amenities && venue.amenities.slice(0, 2).map((amenity) => (
              <span
                key={amenity}
                className="text-[9px] bg-surface-800 text-surface-400 px-1.5 py-px rounded border border-surface-700/20 font-medium truncate max-w-[4.5rem]"
              >
                {amenity}
              </span>
            ))}
            {venue.amenities && venue.amenities.length > 2 && (
              <span className="text-[9px] text-surface-500 font-medium self-center">+{venue.amenities.length - 2}</span>
            )}
          </div>
          {/* Price */}
          <span className="text-[12px] font-semibold text-primary-400 whitespace-nowrap">{price}</span>
        </div>
      </div>
    </button>
  );
}
