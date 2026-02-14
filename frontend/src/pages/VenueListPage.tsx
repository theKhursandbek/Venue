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
    <div className="space-y-6 animate-fade-in">
      {/* ═══ Header ═══ */}
      <div>
        <p className="text-xs font-semibold text-primary-500 tracking-widest uppercase mb-1">Discover</p>
        <h1 className="text-2xl font-bold text-surface-50 tracking-tight">
          Найдите <span className="gradient-text">площадку</span>
        </h1>
        {!loading && !error && (
          <p className="text-sm text-surface-500 mt-1">
            {venues.length} доступных площадок
          </p>
        )}
      </div>

      {/* ═══ Search ═══ */}
      <div className="relative flex items-center">
        <Search className="absolute left-4 size-4.5 text-surface-500" />
        <input
          type="text"
          placeholder="Поиск по названию или адресу..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-surface-700/50 bg-surface-900 text-surface-100 placeholder:text-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/40 transition-all text-sm"
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`absolute right-2.5 p-2 rounded-lg transition-all duration-200 ${
            hasActiveFilters
              ? "bg-primary-500 text-surface-950"
              : showFilters
              ? "bg-surface-700 text-surface-200"
              : "text-surface-500 hover:bg-surface-800 hover:text-surface-300"
          }`}
        >
          <SlidersHorizontal className="size-4" />
        </button>
      </div>

      {/* ═══ Filters panel ═══ */}
      {showFilters && (
        <div className="bg-surface-900 border border-surface-700/50 rounded-xl p-5 space-y-4 animate-scale-in">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-surface-200">Цена за час (сум)</span>
            {hasActiveFilters && (
              <button
                onClick={() => { setMinPrice(""); setMaxPrice(""); }}
                className="text-xs text-primary-400 hover:text-primary-300 font-semibold px-2.5 py-1 rounded-md hover:bg-surface-800 transition-colors"
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
              className="flex-1 px-4 py-3 rounded-lg border border-surface-600/50 bg-surface-800 text-surface-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/40 transition-all"
            />
            <div className="flex items-center text-surface-600 font-bold">—</div>
            <input
              type="number"
              placeholder="До"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="flex-1 px-4 py-3 rounded-lg border border-surface-600/50 bg-surface-800 text-surface-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/40 transition-all"
            />
          </div>
        </div>
      )}

      {/* ═══ Active filter chips ═══ */}
      {hasActiveFilters && !showFilters && (
        <div className="flex items-center gap-2 animate-fade-in">
          {minPrice && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-surface-800 text-primary-400 px-3 py-1.5 rounded-lg border border-primary-500/20">
              От {Number(minPrice).toLocaleString("ru-RU")}
              <button onClick={() => setMinPrice("")} className="hover:text-primary-300"><X className="size-3" /></button>
            </span>
          )}
          {maxPrice && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-surface-800 text-primary-400 px-3 py-1.5 rounded-lg border border-primary-500/20">
              До {Number(maxPrice).toLocaleString("ru-RU")}
              <button onClick={() => setMaxPrice("")} className="hover:text-primary-300"><X className="size-3" /></button>
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
        <div className="text-center py-24 animate-fade-in">
          <div className="size-16 bg-surface-800 border border-surface-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MapPin className="size-7 text-surface-500" />
          </div>
          <p className="font-semibold text-surface-300">Площадки не найдены</p>
          <p className="text-sm text-surface-500 mt-1">Попробуйте изменить параметры поиска</p>
        </div>
      ) : (
        <div className="space-y-4 stagger-children">
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
      className="w-full bg-surface-900 rounded-2xl overflow-hidden border border-surface-700/40 card-dark glow-border text-left group"
    >
      {/* Image */}
      <div className="h-44 bg-surface-800 relative overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={venue.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-800">
            <MapPin className="size-10 text-surface-600" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-surface-950/80 via-transparent to-transparent" />

        {/* Price badge */}
        <div className="absolute bottom-3 right-3 bg-surface-950/80 backdrop-blur-xl px-3 py-1.5 rounded-lg border border-white/10">
          <span className="text-sm font-bold text-primary-400">{price}</span>
        </div>

        {/* Image count */}
        {venue.image_count > 1 && (
          <div className="absolute top-3 right-3 bg-surface-950/50 backdrop-blur-md text-surface-200 text-xs font-semibold px-2.5 py-1 rounded-lg border border-white/10">
            📷 {venue.image_count}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 space-y-2.5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-bold text-surface-100 text-base group-hover:text-primary-400 transition-colors leading-tight">
            {venue.name}
          </h3>
          <div className="size-7 bg-surface-800 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-primary-500/10 transition-colors">
            <ArrowRight className="size-3.5 text-surface-500 group-hover:text-primary-400 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>

        <p className="text-sm text-surface-500 flex items-center gap-2">
          <MapPin className="size-3.5 text-surface-600 shrink-0" />
          <span className="truncate">{venue.address}</span>
        </p>

        {/* Amenities */}
        {venue.amenities && venue.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {venue.amenities.slice(0, 3).map((amenity) => (
              <span
                key={amenity}
                className="text-[11px] bg-surface-800 text-surface-400 px-2 py-1 rounded-md border border-surface-700/50 font-medium"
              >
                {amenity}
              </span>
            ))}
            {venue.amenities.length > 3 && (
              <span className="text-[11px] text-primary-500 font-semibold px-2 py-1">
                +{venue.amenities.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}
