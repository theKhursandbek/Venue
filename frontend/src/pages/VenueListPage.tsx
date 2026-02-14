import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, SlidersHorizontal, X, ArrowRight, Sparkles, TrendingUp } from "lucide-react";
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
      {/* ═══ Hero Header ═══ */}
      <div className="relative">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="size-5 text-primary-400" />
          <span className="text-xs font-bold text-primary-500 tracking-widest uppercase">Discover</span>
        </div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          Найдите <span className="gradient-text">площадку</span>
        </h1>
        <p className="text-sm text-gray-400 mt-1.5 font-medium">
          {!loading && !error && (
            <span className="inline-flex items-center gap-1.5">
              <TrendingUp className="size-3.5 text-success-500" />
              {venues.length} доступных площадок
            </span>
          )}
        </p>
      </div>

      {/* ═══ Search — Premium ═══ */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-linear-to-r from-primary-500/10 via-accent-500/10 to-primary-500/10 rounded-[22px] blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
        <div className="relative flex items-center">
          <Search className="absolute left-4 size-5 text-gray-300 group-focus-within:text-primary-400 transition-colors" />
          <input
            type="text"
            placeholder="Поиск по названию или адресу..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-14 py-4 rounded-2xl border-2 border-gray-100 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-300 focus:bg-white transition-all text-[15px] font-medium"
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`absolute right-3 p-2.5 rounded-xl transition-all duration-200 ${
              hasActiveFilters
                ? "bg-linear-to-br from-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/25"
                : showFilters
                ? "bg-primary-50 text-primary-600"
                : "text-gray-300 hover:bg-gray-50 hover:text-gray-500"
            }`}
          >
            <SlidersHorizontal className="size-4.5" />
          </button>
        </div>
      </div>

      {/* ═══ Filters panel ═══ */}
      {showFilters && (
        <div className="bg-white/80 backdrop-blur-xl rounded-[22px] border border-gray-100/80 p-5 space-y-4 shadow-xl shadow-gray-900/[0.03] animate-scale-in">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <span className="size-7 bg-amber-50 rounded-lg flex items-center justify-center text-base">💰</span>
              Цена за час (сум)
            </span>
            {hasActiveFilters && (
              <button
                onClick={() => { setMinPrice(""); setMaxPrice(""); }}
                className="text-xs text-primary-500 hover:text-primary-700 font-bold bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors"
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
              className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-100 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-300 transition-all"
            />
            <div className="flex items-center text-gray-200 font-bold">—</div>
            <input
              type="number"
              placeholder="До"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-100 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-300 transition-all"
            />
          </div>
        </div>
      )}

      {/* ═══ Active filter chips ═══ */}
      {hasActiveFilters && !showFilters && (
        <div className="flex items-center gap-2 animate-fade-in">
          {minPrice && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-linear-to-r from-primary-50 to-primary-100/50 text-primary-700 px-3.5 py-2 rounded-xl border border-primary-200/50 shadow-sm">
              От {Number(minPrice).toLocaleString("ru-RU")}
              <button onClick={() => setMinPrice("")} className="hover:text-primary-900"><X className="size-3" /></button>
            </span>
          )}
          {maxPrice && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-linear-to-r from-primary-50 to-primary-100/50 text-primary-700 px-3.5 py-2 rounded-xl border border-primary-200/50 shadow-sm">
              До {Number(maxPrice).toLocaleString("ru-RU")}
              <button onClick={() => setMaxPrice("")} className="hover:text-primary-900"><X className="size-3" /></button>
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
          <div className="relative inline-block mb-5">
            <div className="absolute inset-[-6px] bg-gray-200/30 rounded-[22px] blur-lg" />
            <div className="relative size-20 bg-white rounded-[22px] flex items-center justify-center shadow-lg border border-gray-100">
              <MapPin className="size-9 text-gray-300" />
            </div>
          </div>
          <p className="font-bold text-gray-500 text-lg">Площадки не найдены</p>
          <p className="text-sm text-gray-400 mt-1.5 font-medium">Попробуйте изменить параметры поиска</p>
        </div>
      ) : (
        <div className="space-y-5 stagger-children">
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
      className="w-full bg-white rounded-[22px] overflow-hidden shadow-lg shadow-gray-900/[0.04] card-premium text-left group border border-gray-100/50"
    >
      {/* Image */}
      <div className="h-48 bg-gray-100 relative overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={venue.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center mesh-gradient">
            <MapPin className="size-12 text-primary-200" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Price badge */}
        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xl px-3.5 py-2 rounded-xl shadow-xl border border-white/50">
          <span className="text-sm font-black text-primary-700">{price}</span>
        </div>

        {/* Image count */}
        {venue.image_count > 1 && (
          <div className="absolute top-3 right-3 bg-black/30 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1.5 rounded-xl">
            📷 {venue.image_count}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-extrabold text-gray-900 text-[17px] group-hover:text-primary-600 transition-colors leading-tight">
            {venue.name}
          </h3>
          <div className="size-8 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary-50 transition-colors">
            <ArrowRight className="size-4 text-gray-300 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>

        <p className="text-sm text-gray-400 flex items-center gap-2 font-medium">
          <div className="size-6 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
            <MapPin className="size-3.5 text-primary-400" />
          </div>
          <span className="truncate">{venue.address}</span>
        </p>

        {/* Amenities */}
        {venue.amenities && venue.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {venue.amenities.slice(0, 3).map((amenity) => (
              <span
                key={amenity}
                className="text-[11px] bg-gray-50 text-gray-500 px-2.5 py-1.5 rounded-lg border border-gray-100/80 font-semibold"
              >
                {amenity}
              </span>
            ))}
            {venue.amenities.length > 3 && (
              <span className="text-[11px] text-primary-400 font-bold px-2 py-1.5">
                +{venue.amenities.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}
