/**
 * Amenity translation map.
 *
 * Amenities are stored in the database as Russian strings inside a Postgres
 * ArrayField, which `modeltranslation` cannot handle.  We therefore translate
 * them on the frontend using a simple lookup table keyed by the Russian value.
 */

const AMENITY_MAP: Record<string, Record<string, string>> = {
  /* ── common sports-venue amenities ── */
  "Душ":            { uz: "Dush",           en: "Shower",           ru: "Душ" },
  "Раздевалка":     { uz: "Kiyinish xonasi", en: "Changing Room",  ru: "Раздевалка" },
  "Парковка":       { uz: "Avtoturargoh",   en: "Parking",          ru: "Парковка" },
  "Тренер":         { uz: "Murabbiy",       en: "Trainer",          ru: "Тренер" },
  "Wi-Fi":          { uz: "Wi-Fi",          en: "Wi-Fi",            ru: "Wi-Fi" },
  "Кафе":           { uz: "Kafe",           en: "Café",             ru: "Кафе" },
  "Освещение":      { uz: "Yoritish",       en: "Lighting",         ru: "Освещение" },
  "Кондиционер":    { uz: "Konditsioner",   en: "Air Conditioning", ru: "Кондиционер" },
  "Трибуна":        { uz: "Tribuna",        en: "Stands",           ru: "Трибуна" },
  "Мячи":           { uz: "To'plar",        en: "Balls",            ru: "Мячи" },
  "Аренда формы":   { uz: "Forma ijarasi",  en: "Uniform Rental",   ru: "Аренда формы" },
  "Табло":          { uz: "Tablo",          en: "Scoreboard",       ru: "Табло" },
  "Вода":           { uz: "Suv",            en: "Water",            ru: "Вода" },
  "Музыка":         { uz: "Musiqa",         en: "Music",            ru: "Музыка" },
  "Полотенца":      { uz: "Sochiqlar",      en: "Towels",           ru: "Полотенца" },
  "Сауна":          { uz: "Sauna",          en: "Sauna",            ru: "Сауна" },
  "Бассейн":        { uz: "Hovuz",          en: "Pool",             ru: "Бассейн" },
  "Шкафчики":       { uz: "Shkafchalar",    en: "Lockers",          ru: "Шкафчики" },
  "Аптечка":        { uz: "Tibbiy quti",    en: "First Aid Kit",    ru: "Аптечка" },
  "Камера хранения": { uz: "Saqlash kamerasi", en: "Storage",       ru: "Камера хранения" },
};

/**
 * Translate an amenity string coming from the API (Russian) into the
 * current UI language.  Falls back to the original value when no
 * translation is found.
 */
export function translateAmenity(amenity: string, lang: string): string {
  return AMENITY_MAP[amenity]?.[lang] ?? amenity;
}
