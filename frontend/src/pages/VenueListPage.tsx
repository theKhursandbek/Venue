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
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-baseline justify-between">
        <h1 className="text-xl font-bold text-surface-50 tracking-tight">Площадки</h1>
        {!loading && !error && (
          <span className="text-[11px] text-surface-500">{venues.length} доступных</span>
        )}
      </div>

      {/* Search row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-surface-500" />
          <input
            type="text"
            placeholder="Найти..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-surface-850 text-surface-200 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/25 text-[13px] border-none"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-3 rounded-lg transition-colors ${
            hasActiveFilters
              ? "bg-primary-500 text-white"
              : "bg-surface-850 text-surface-400 hover:text-surface-200"
          }`}
        >
          <SlidersHorizontal className="size-4" />
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="space-y-2 animate-scale-in">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-surface-300">Цена за час</span>
            {hasActiveFilters && (
              <button
                onClick={() => { setMinPrice(""); setMaxPrice(""); }}
                className="text-[11px] text-primary-400 font-medium"
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
              className="flex-1 px-3 py-2 rounded-lg bg-surface-850 text-surface-200 text-[12px] focus:outline-none focus:ring-2 focus:ring-primary-500/25 border-none"
            />
            <span className="text-surface-600 self-center">—</span>
            <input
              type="number"
              placeholder="До"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg bg-surface-850 text-surface-200 text-[12px] focus:outline-none focus:ring-2 focus:ring-primary-500/25 border-none"
            />
          </div>
        </div>
      )}

      {/* Active chips */}
      {hasActiveFilters && !showFilters && (
        <div className="flex items-center gap-1.5 animate-fade-in">
          {minPrice && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary-400 bg-primary-500/10 px-2.5 py-1 rounded-full">
              от {Number(minPrice).toLocaleString("ru-RU")}
              <button onClick={() => setMinPrice("")}><X className="size-3" /></button>
            </span>
          )}
          {maxPrice && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary-400 bg-primary-500/10 px-2.5 py-1 rounded-full">
              до {Number(maxPrice).toLocaleString("ru-RU")}
              <button onClick={() => setMaxPrice("")}><X className="size-3" /></button>
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
        <div className="text-center py-16 animate-fade-in">
          <MapPin className="size-5 text-surface-600 mx-auto mb-2" />
          <p className="text-surface-300 text-[13px]">Площадки не найдены</p>
          <p className="text-[11px] text-surface-500 mt-0.5">Измените параметры поиска</p>
        </div>
      ) : (
        <div className="stagger-children">
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
      className="w-full text-left group py-3 border-b border-surface-850 last:border-0 flex gap-3.5 items-start"
    >
      {/* Thumbnail */}
      <div className="w-16 h-16 rounded-lg bg-surface-850 overflow-hidden shrink-0">
        {image ? (
          <img
            src={image}
            alt={venue.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="size-4 text-surface-600" />
          </div>
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-surface-100 text-[14px] leading-snug group-hover:text-primary-400 transition-colors truncate">
            {venue.name}
          </h3>
          <ArrowRight className="size-3.5 text-surface-600 group-hover:text-primary-400 shrink-0 mt-0.5 transition-colors" />
        </div>
        <p className="text-[12px] text-surface-500 mt-0.5 truncate">{venue.address}</p>
        <div className="flex items-center justify-between mt-1.5">
          <div className="flex gap-1.5">
            {venue.amenities?.slice(0, 2).map((a) => (
              <span key={a} className="text-[10px] text-surface-400 bg-surface-850 px-1.5 py-0.5 rounded-full truncate max-w-[5rem]">{a}</span>
            ))}
          </div>
          <span className="text-[12px] font-semibold text-primary-400">{price}</span>
        </div>
      </div>
    </button>
  );
}
