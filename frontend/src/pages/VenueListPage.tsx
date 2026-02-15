import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, SlidersHorizontal, X, Sparkles } from "lucide-react";
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
    Number(price).toLocaleString("ru-RU");

  const getImage = (venue: Venue) => {
    if (venue.primary_image) return venue.primary_image;
    if (venue.all_image_urls?.length > 0) return venue.all_image_urls[0];
    return null;
  };

  const hasActiveFilters = minPrice || maxPrice;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Hero header */}
      <div className="pt-1">
        <h1 className="text-2xl font-bold text-surface-50 tracking-tight">Найди свою<br /><span className="gradient-text">площадку</span></h1>
        {!loading && !error && (
          <p className="text-[13px] text-surface-400 mt-1">{venues.length} мест доступно</p>
        )}
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-surface-500" />
          <input
            type="text"
            placeholder="Поиск площадок..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl glass text-surface-100 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-[14px]"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`size-12 rounded-xl flex items-center justify-center transition-all ${
            hasActiveFilters
              ? "bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/20"
              : "glass text-surface-400 hover:text-surface-200"
          }`}
        >
          <SlidersHorizontal className="size-4" />
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="glass rounded-2xl p-4 space-y-3 animate-scale-in">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-surface-200">Цена за час</span>
            {hasActiveFilters && (
              <button
                onClick={() => { setMinPrice(""); setMaxPrice(""); }}
                className="text-[12px] text-primary-400 font-semibold hover:text-primary-300"
              >
                Сбросить
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <input
              type="number"
              placeholder="От"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-surface-800/50 text-surface-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary-500/30 border border-surface-700/30"
            />
            <input
              type="number"
              placeholder="До"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-surface-800/50 text-surface-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary-500/30 border border-surface-700/30"
            />
          </div>
        </div>
      )}

      {/* Active filter chips */}
      {hasActiveFilters && !showFilters && (
        <div className="flex items-center gap-2 animate-fade-in">
          {minPrice && (
            <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-primary-300 bg-primary-500/10 border border-primary-500/20 px-3 py-1.5 rounded-xl">
              от {Number(minPrice).toLocaleString("ru-RU")}
              <button onClick={() => setMinPrice("")} className="hover:text-primary-200"><X className="size-3.5" /></button>
            </span>
          )}
          {maxPrice && (
            <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-primary-300 bg-primary-500/10 border border-primary-500/20 px-3 py-1.5 rounded-xl">
              до {Number(maxPrice).toLocaleString("ru-RU")}
              <button onClick={() => setMaxPrice("")} className="hover:text-primary-200"><X className="size-3.5" /></button>
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
        <div className="text-center py-20 animate-fade-in">
          <div className="size-16 rounded-2xl glass flex items-center justify-center mx-auto mb-4">
            <MapPin className="size-7 text-surface-500" />
          </div>
          <p className="text-surface-200 font-semibold text-[15px]">Площадки не найдены</p>
          <p className="text-[13px] text-surface-400 mt-1">Попробуйте другие параметры поиска</p>
        </div>
      ) : (
        <div className="space-y-4 stagger">
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
      className="w-full text-left group rounded-2xl overflow-hidden relative"
    >
      {/* Large hero image */}
      <div className="h-44 bg-surface-850 relative overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={venue.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-800 to-surface-850">
            <MapPin className="size-8 text-surface-600" />
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-950/20 to-transparent" />

        {/* Price badge */}
        <div className="absolute top-3 right-3 glass-strong px-3 py-1.5 rounded-xl">
          <span className="text-[13px] font-bold text-surface-50">{price}</span>
          <span className="text-[11px] text-surface-400 ml-1">сум/ч</span>
        </div>

        {/* Bottom text overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-bold text-white text-[16px] leading-snug group-hover:text-primary-200 transition-colors">
            {venue.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-1">
            <MapPin className="size-3 text-surface-300" />
            <p className="text-[12px] text-surface-300 truncate">{venue.address}</p>
          </div>
        </div>
      </div>

      {/* Amenities bar */}
      {venue.amenities && venue.amenities.length > 0 && (
        <div className="glass-strong px-4 py-2.5 flex items-center gap-2">
          <Sparkles className="size-3 text-accent-400 shrink-0" />
          <div className="flex gap-1.5 overflow-x-auto">
            {venue.amenities.slice(0, 3).map((a) => (
              <span key={a} className="text-[11px] text-surface-300 bg-surface-750/60 px-2 py-0.5 rounded-lg whitespace-nowrap">{a}</span>
            ))}
            {venue.amenities.length > 3 && (
              <span className="text-[11px] text-surface-500 px-1">+{venue.amenities.length - 3}</span>
            )}
          </div>
        </div>
      )}
    </button>
  );
}
