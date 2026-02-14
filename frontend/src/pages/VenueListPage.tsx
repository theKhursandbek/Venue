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
      {/* ═══ Header ═══ */}
      <div>
        <p className="text-[10px] font-medium text-primary-500 tracking-widest uppercase mb-0.5">Discover</p>
        <h1 className="text-xl font-semibold text-surface-100 tracking-tight">
          Найдите <span className="gradient-text">площадку</span>
        </h1>
        {!loading && !error && (
          <p className="text-xs text-surface-500 mt-0.5">
            {venues.length} доступных площадок
          </p>
        )}
      </div>

      {/* ═══ Search ═══ */}
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 size-3.5 text-surface-500" />
        <input
          type="text"
          placeholder="Поиск по названию или адресу..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-surface-700/30 bg-surface-900/80 text-surface-200 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/15 focus:border-primary-500/30 transition-all text-sm"
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`absolute right-2 p-1.5 rounded-md transition-all duration-200 ${
            hasActiveFilters
              ? "bg-primary-500 text-surface-950"
              : showFilters
              ? "bg-surface-700 text-surface-200"
              : "text-surface-500 hover:bg-white/[0.04] hover:text-surface-300"
          }`}
        >
          <SlidersHorizontal className="size-3.5" />
        </button>
      </div>

      {/* ═══ Filters panel ═══ */}
      {showFilters && (
        <div className="bg-surface-900/80 border border-surface-700/30 rounded-lg p-4 space-y-3 animate-scale-in inner-light">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-surface-300">Цена за час (сум)</span>
            {hasActiveFilters && (
              <button
                onClick={() => { setMinPrice(""); setMaxPrice(""); }}
                className="text-[10px] text-primary-400 hover:text-primary-300 font-medium px-2 py-0.5 rounded hover:bg-white/[0.04] transition-colors"
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
              className="flex-1 px-3 py-2 rounded-md border border-surface-700/40 bg-surface-850 text-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/15 focus:border-primary-500/30 transition-all"
            />
            <div className="flex items-center text-surface-600 text-xs">—</div>
            <input
              type="number"
              placeholder="До"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="flex-1 px-3 py-2 rounded-md border border-surface-700/40 bg-surface-850 text-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/15 focus:border-primary-500/30 transition-all"
            />
          </div>
        </div>
      )}

      {/* ═══ Active filter chips ═══ */}
      {hasActiveFilters && !showFilters && (
        <div className="flex items-center gap-1.5 animate-fade-in">
          {minPrice && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-surface-850 text-primary-400 px-2 py-1 rounded-md border border-primary-500/15">
              От {Number(minPrice).toLocaleString("ru-RU")}
              <button onClick={() => setMinPrice("")} className="hover:text-primary-300"><X className="size-2.5" /></button>
            </span>
          )}
          {maxPrice && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-surface-850 text-primary-400 px-2 py-1 rounded-md border border-primary-500/15">
              До {Number(maxPrice).toLocaleString("ru-RU")}
              <button onClick={() => setMaxPrice("")} className="hover:text-primary-300"><X className="size-2.5" /></button>
            </span>
          )}
        </div>
      )}

      {/* ═══ Content ═══ */}
      {loading ? (
        <PageLoader />
      ) : error ? (
        <ErrorBox message={error} onRetry={fetchVenues} />
      ) : venues.length === 0 ? (
        <div className="text-center py-16 animate-fade-in">
          <div className="size-12 bg-surface-850 border border-surface-700/30 rounded-xl flex items-center justify-center mx-auto mb-3">
            <MapPin className="size-5 text-surface-500" />
          </div>
          <p className="font-medium text-surface-300 text-sm">Площадки не найдены</p>
          <p className="text-xs text-surface-500 mt-0.5">Попробуйте изменить параметры поиска</p>
        </div>
      ) : (
        <div className="space-y-3 stagger-children">
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
      className="w-full bg-surface-900/80 rounded-xl overflow-hidden border border-surface-700/25 card-dark glow-border text-left group inner-light"
    >
      {/* Image */}
      <div className="h-36 bg-surface-850 relative overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={venue.name}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-850">
            <MapPin className="size-8 text-surface-600" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface-950/70 via-transparent to-transparent" />

        {/* Price badge */}
        <div className="absolute bottom-2.5 right-2.5 bg-surface-950/70 backdrop-blur-lg px-2.5 py-1 rounded-md border border-white/[0.06]">
          <span className="text-xs font-semibold text-primary-400">{price}</span>
        </div>

        {/* Image count */}
        {venue.image_count > 1 && (
          <div className="absolute top-2.5 right-2.5 bg-surface-950/50 backdrop-blur-md text-surface-300 text-[10px] font-medium px-2 py-0.5 rounded-md border border-white/[0.06]">
            📷 {venue.image_count}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3.5 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-surface-200 text-sm group-hover:text-primary-400 transition-colors duration-300 leading-snug">
            {venue.name}
          </h3>
          <div className="size-6 bg-surface-800/80 rounded-md flex items-center justify-center shrink-0 group-hover:bg-primary-500/10 transition-all duration-300">
            <ArrowRight className="size-3 text-surface-500 group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all duration-300" />
          </div>
        </div>

        <p className="text-xs text-surface-500 flex items-center gap-1.5">
          <MapPin className="size-3 text-surface-600 shrink-0" />
          <span className="truncate">{venue.address}</span>
        </p>

        {/* Amenities */}
        {venue.amenities && venue.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {venue.amenities.slice(0, 3).map((amenity) => (
              <span
                key={amenity}
                className="text-[10px] bg-surface-850 text-surface-400 px-1.5 py-0.5 rounded border border-surface-700/30 font-medium"
              >
                {amenity}
              </span>
            ))}
            {venue.amenities.length > 3 && (
              <span className="text-[10px] text-primary-500/80 font-medium px-1.5 py-0.5">
                +{venue.amenities.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}
