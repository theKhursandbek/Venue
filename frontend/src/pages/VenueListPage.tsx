import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, SlidersHorizontal, X } from "lucide-react";
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

  const formatPrice = (price: string) => {
    return Number(price).toLocaleString("ru-RU") + " сум/час";
  };

  const getImage = (venue: Venue) => {
    if (venue.primary_image) return venue.primary_image;
    if (venue.all_image_urls?.length > 0) return venue.all_image_urls[0];
    return null;
  };

  const hasActiveFilters = minPrice || maxPrice;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
        <input
          type="text"
          placeholder="Поиск площадок..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${
            hasActiveFilters
              ? "bg-primary-100 text-primary-600"
              : "text-gray-400 hover:bg-gray-100"
          }`}
        >
          <SlidersHorizontal className="size-5" />
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Цена за час (сум)
            </span>
            {hasActiveFilters && (
              <button
                onClick={() => {
                  setMinPrice("");
                  setMaxPrice("");
                }}
                className="text-xs text-primary-600 hover:text-primary-700"
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
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <input
              type="number"
              placeholder="До"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      )}

      {/* Venue count */}
      {!loading && !error && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {venues.length} площад{venues.length === 1 ? "ка" : "ок"}
          </p>
          {hasActiveFilters && (
            <button
              onClick={() => {
                setMinPrice("");
                setMaxPrice("");
                setSearch("");
                setShowFilters(false);
              }}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
            >
              <X className="size-3" />
              Очистить всё
            </button>
          )}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <PageLoader />
      ) : error ? (
        <ErrorBox message={error} onRetry={fetchVenues} />
      ) : venues.length === 0 ? (
        <div className="text-center py-16">
          <MapPin className="size-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Площадки не найдены</p>
        </div>
      ) : (
        <div className="space-y-3">
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
      className="w-full bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all active:scale-[0.99] text-left"
    >
      {/* Image */}
      <div className="h-40 bg-gray-100 relative">
        {image ? (
          <img
            src={image}
            alt={venue.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapPin className="size-8 text-gray-300" />
          </div>
        )}
        <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg">
          <span className="text-sm font-semibold text-primary-700">
            {price}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1">{venue.name}</h3>
        <p className="text-sm text-gray-500 flex items-center gap-1">
          <MapPin className="size-3.5 flex-shrink-0" />
          <span className="truncate">{venue.address}</span>
        </p>

        {/* Amenities */}
        {venue.amenities && venue.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {venue.amenities.slice(0, 3).map((amenity) => (
              <span
                key={amenity}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md"
              >
                {amenity}
              </span>
            ))}
            {venue.amenities.length > 3 && (
              <span className="text-xs text-gray-400">
                +{venue.amenities.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}
