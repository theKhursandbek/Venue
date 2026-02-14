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
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">
          Найдите <span className="gradient-text">площадку</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {!loading && !error && `${venues.length} доступных площадок`}
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
        <input
          type="text"
          placeholder="Поиск по названию или адресу..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-12 py-3.5 rounded-2xl border-2 border-gray-100 bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-300 transition-all text-[15px]"
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${
            hasActiveFilters
              ? "bg-primary-100 text-primary-600 shadow-sm"
              : showFilters
              ? "bg-gray-100 text-gray-600"
              : "text-gray-400 hover:bg-gray-100"
          }`}
        >
          <SlidersHorizontal className="size-5" />
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3 shadow-sm animate-scale-in">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">💰 Цена за час (сум)</span>
            {hasActiveFilters && (
              <button
                onClick={() => { setMinPrice(""); setMaxPrice(""); }}
                className="text-xs text-primary-600 hover:text-primary-700 font-semibold"
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
              className="flex-1 px-3.5 py-2.5 rounded-xl border-2 border-gray-100 text-sm focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-300 transition-all"
            />
            <div className="flex items-center text-gray-300">—</div>
            <input
              type="number"
              placeholder="До"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl border-2 border-gray-100 text-sm focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-300 transition-all"
            />
          </div>
        </div>
      )}

      {/* Active filter chips */}
      {hasActiveFilters && !showFilters && (
        <div className="flex items-center gap-2 animate-fade-in">
          {minPrice && (
            <span className="inline-flex items-center gap-1 text-xs font-medium bg-primary-50 text-primary-700 px-3 py-1.5 rounded-full border border-primary-100">
              От {Number(minPrice).toLocaleString("ru-RU")}
              <button onClick={() => setMinPrice("")}><X className="size-3" /></button>
            </span>
          )}
          {maxPrice && (
            <span className="inline-flex items-center gap-1 text-xs font-medium bg-primary-50 text-primary-700 px-3 py-1.5 rounded-full border border-primary-100">
              До {Number(maxPrice).toLocaleString("ru-RU")}
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
        <div className="text-center py-20 animate-fade-in">
          <div className="size-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <MapPin className="size-9 text-gray-300" />
          </div>
          <p className="font-semibold text-gray-500 text-lg">Площадки не найдены</p>
          <p className="text-sm text-gray-400 mt-1">Попробуйте изменить параметры поиска</p>
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
      className="w-full bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm card-hover text-left group"
    >
      {/* Image */}
      <div className="h-44 bg-linear-to-br from-gray-100 to-gray-50 relative overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={venue.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary-50 to-purple-50">
            <MapPin className="size-10 text-primary-200" />
          </div>
        )}

        {/* Price badge */}
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-lg">
          <span className="text-sm font-bold text-primary-700">{price}</span>
        </div>

        {/* Image count */}
        {venue.image_count > 1 && (
          <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-lg">
            📷 {venue.image_count}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-gray-900 text-[16px] group-hover:text-primary-600 transition-colors">
            {venue.name}
          </h3>
          <ArrowRight className="size-4 text-gray-300 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all mt-0.5 shrink-0" />
        </div>

        <p className="text-sm text-gray-500 flex items-center gap-1.5">
          <MapPin className="size-3.5 shrink-0 text-primary-400" />
          <span className="truncate">{venue.address}</span>
        </p>

        {/* Amenities */}
        {venue.amenities && venue.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {venue.amenities.slice(0, 3).map((amenity) => (
              <span
                key={amenity}
                className="text-xs bg-linear-to-r from-gray-50 to-gray-100 text-gray-600 px-2.5 py-1 rounded-lg border border-gray-100 font-medium"
              >
                {amenity}
              </span>
            ))}
            {venue.amenities.length > 3 && (
              <span className="text-xs text-gray-400 font-medium px-1 py-1">
                +{venue.amenities.length - 3} ещё
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}
