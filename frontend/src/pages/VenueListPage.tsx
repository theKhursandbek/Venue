import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, SlidersHorizontal, X, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import { venueService } from "@/services/venueService";
import { useRevealChildren } from "@/hooks/useReveal";
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
  const { t } = useTranslation();

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
      setError(t("venues.loadError"));
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
  const venueGridRef = useRevealChildren<HTMLDivElement>(0.05, 100);

  return (
    <div className="space-y-4 animate-page-enter stagger-children">
      {/* Hero section */}
      <div className="hero-section glass rounded-2xl p-5 pb-4 relative" data-scroll="scale">
        {/* Floating particles */}
        <div className="hero-particle" />
        <div className="hero-particle" />
        <div className="hero-particle" />
        <div className="hero-particle" />
        <div className="hero-particle" />

        <div className="flex items-center gap-4">
          {/* Hero animated V */}
          <div className="relative shrink-0 size-14 flex items-center justify-center animate-levitate">
            <svg className="hero-v-svg" viewBox="0 0 48 48" width="40" height="40" fill="none">
              <path
                className="hero-v-path"
                d="M4,4 L17,4 L24,28 L31,4 L44,4 L29,44 C27.5,47 20.5,47 19,44 Z"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="absolute -inset-2.5 hero-ring" />
          </div>

          {/* Hero text with staggered reveal */}
          <div className="flex-1 min-w-0">
            <div className="hero-text-line">
              <span className="text-[13px] font-semibold text-primary-500 uppercase tracking-widest">{t("venues.heroLabel")}</span>
            </div>
            <div className="hero-text-line">
              <h1 className="text-2xl font-bold text-surface-900 tracking-tight leading-tight">{t("venues.heroTitle")} <span className="gradient-text-animated">{t("venues.heroTitleEnd")}</span></h1>
            </div>
            <div className="hero-text-line">
              {!loading && !error && (
                <p className="text-[13px] text-surface-500 mt-0.5 flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-success-500 animate-breathe" />
                  {venues.length} {t("venues.available")}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Accent line */}
        <div className="hero-accent-line w-24 mt-3" />
      </div>

      {/* Search */}
      <div className="flex gap-2" data-scroll="up">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-surface-500" />
          <input
            type="text"
            placeholder={t("venues.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl glass text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-[14px] input-glow transition-all duration-300 focus:scale-[1.01]"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`size-12 rounded-xl flex items-center justify-center transition-all duration-300 hover:-translate-y-0.5 active:scale-95 ${
            hasActiveFilters
              ? "bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/20"
              : "glass text-surface-500 hover:text-surface-700"
          }`}
        >
          <SlidersHorizontal className={`size-4 transition-transform duration-300 ${showFilters ? "rotate-90" : ""}`} />
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="glass rounded-2xl p-4 space-y-3 animate-scale-in" data-scroll="up">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-surface-700 flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-primary-500 animate-pendulum" />
              {t("venues.pricePerHour")}
            </span>
            {hasActiveFilters && (
              <button
                onClick={() => { setMinPrice(""); setMaxPrice(""); }}
                className="text-[12px] text-primary-500 font-semibold hover:text-primary-600 transition-colors hover:scale-105"
              >
                {t("venues.reset")}
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <input
              type="number"
              placeholder={t("venues.from")}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-surface-100 text-surface-800 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary-500/30 border border-surface-300 input-glow transition-all duration-300"
            />
            <input
              type="number"
              placeholder={t("venues.to")}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-surface-100 text-surface-800 text-[13px] focus:outline-none focus:ring-2 focus:ring-primary-500/30 border border-surface-300 input-glow transition-all duration-300"
            />
          </div>
        </div>
      )}

      {/* Active filter chips */}
      {hasActiveFilters && !showFilters && (
        <div className="flex items-center gap-2" data-scroll="left">
          {minPrice && (
            <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-primary-600 bg-primary-500/10 border border-primary-500/20 px-3 py-1.5 rounded-xl animate-scale-in hover:scale-105 transition-transform">
              {t("venues.from").toLowerCase()} {Number(minPrice).toLocaleString("ru-RU")}
              <button onClick={() => setMinPrice("")} className="hover:text-primary-700 hover:rotate-90 transition-transform"><X className="size-3.5" /></button>
            </span>
          )}
          {maxPrice && (
            <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-primary-600 bg-primary-500/10 border border-primary-500/20 px-3 py-1.5 rounded-xl animate-scale-in hover:scale-105 transition-transform" style={{animationDelay: '100ms'}}>
              {t("venues.to").toLowerCase()} {Number(maxPrice).toLocaleString("ru-RU")}
              <button onClick={() => setMaxPrice("")} className="hover:text-primary-700 hover:rotate-90 transition-transform"><X className="size-3.5" /></button>
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
        <div className="text-center py-20" data-scroll="scale">
          <div className="size-16 rounded-2xl glass flex items-center justify-center mx-auto mb-4 animate-levitate">
            <MapPin className="size-7 text-surface-500" />
          </div>
          <p className="text-surface-700 font-semibold text-[15px]">{t("venues.notFound")}</p>
          <p className="text-[13px] text-surface-500 mt-1">{t("venues.tryOther")}</p>
        </div>
      ) : (
        <div ref={venueGridRef} className="grid grid-cols-2 gap-2.5" data-scroll-stagger>
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
      className="w-full text-left group rounded-2xl overflow-hidden glass tilt-card shimmer-line reveal-item"
      data-scroll-child
    >
      {/* Image */}
      <div className="h-28 bg-surface-850 relative overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={venue.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-surface-200">
            <MapPin className="size-6 text-surface-400" />
          </div>
        )}
        {/* Price badge */}
        <div className="absolute top-2 right-2 glass-strong px-2 py-1 rounded-lg">
          <span className="text-[11px] font-bold text-surface-900">{price}</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">
        <h3 className="font-bold text-surface-900 text-[13px] leading-snug line-clamp-1 group-hover:text-primary-600 transition-colors duration-300">
          {venue.name}
        </h3>
        <div className="flex items-center gap-1">
          <MapPin className="size-2.5 text-surface-500 shrink-0 group-hover:text-primary-500 transition-colors" />
          <p className="text-[11px] text-surface-500 truncate">{venue.address}</p>
        </div>
        {venue.amenities && venue.amenities.length > 0 && (
          <div className="flex gap-1 pt-0.5">
            {venue.amenities.slice(0, 2).map((a, i) => (
              <span key={a} className="text-[10px] text-primary-600 bg-primary-500/8 border border-primary-500/15 px-1.5 py-0.5 rounded-md whitespace-nowrap transition-all duration-300 hover:scale-110 hover:bg-primary-500/15" style={{animationDelay: `${i * 80}ms`}}>{a}</span>
            ))}
            {venue.amenities.length > 2 && (
              <span className="text-[10px] text-surface-500">+{venue.amenities.length - 2}</span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}
