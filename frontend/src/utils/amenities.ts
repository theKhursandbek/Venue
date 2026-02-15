/**
 * Amenity translation map.
 *
 * Amenities are stored in the database as Russian strings inside a Postgres
 * ArrayField, which `modeltranslation` cannot handle.  We therefore translate
 * them on the frontend using a simple lookup table keyed by the Russian value.
 */

const AMENITY_MAP: Record<string, Record<string, string>> = {
  /* ── sports & fitness ── */
  "Душ":              { uz: "Dush",             en: "Shower",            ru: "Душ" },
  "Раздевалка":       { uz: "Kiyinish xonasi",  en: "Changing Room",     ru: "Раздевалка" },
  "Парковка":         { uz: "Avtoturargoh",     en: "Parking",           ru: "Парковка" },
  "Тренер":           { uz: "Murabbiy",         en: "Trainer",           ru: "Тренер" },
  "Мячи":             { uz: "To'plar",          en: "Balls",             ru: "Мячи" },
  "Манишки":          { uz: "Nishonlar",        en: "Bibs",              ru: "Манишки" },
  "Аренда ракеток":   { uz: "Raketka ijarasi",  en: "Racket Rental",     ru: "Аренда ракеток" },
  "Коврики":          { uz: "Gilamchalar",      en: "Mats",              ru: "Коврики" },
  "Зеркала":          { uz: "Ko'zgular",        en: "Mirrors",           ru: "Зеркала" },

  /* ── general comfort ── */
  "WiFi":             { uz: "WiFi",             en: "WiFi",              ru: "WiFi" },
  "Wi-Fi":            { uz: "Wi-Fi",            en: "Wi-Fi",             ru: "Wi-Fi" },
  "Кондиционер":      { uz: "Konditsioner",     en: "Air Conditioning",  ru: "Кондиционер" },
  "Освещение":        { uz: "Yoritish",         en: "Lighting",          ru: "Освещение" },
  "Кофе":             { uz: "Qahva",            en: "Coffee",            ru: "Кофе" },
  "Чай":              { uz: "Choy",             en: "Tea",               ru: "Чай" },
  "Кофе-брейк":       { uz: "Qahva tanaffus",   en: "Coffee Break",      ru: "Кофе-брейк" },
  "Вода":             { uz: "Suv",              en: "Water",             ru: "Вода" },
  "Бар":              { uz: "Bar",              en: "Bar",               ru: "Бар" },
  "Кафе":             { uz: "Kafe",             en: "Café",              ru: "Кафе" },
  "Кальян":           { uz: "Qalyon",           en: "Hookah",            ru: "Кальян" },
  "Кейтеринг":        { uz: "Keytering",        en: "Catering",          ru: "Кейтеринг" },

  /* ── events & conference ── */
  "Проектор":         { uz: "Proektor",         en: "Projector",         ru: "Проектор" },
  "Микрофоны":        { uz: "Mikrofonlar",      en: "Microphones",       ru: "Микрофоны" },
  "Звук":             { uz: "Ovoz tizimi",      en: "Sound System",      ru: "Звук" },
  "Сцена":            { uz: "Sahna",            en: "Stage",             ru: "Сцена" },
  "Переговорная":     { uz: "Muzokara xonasi",  en: "Meeting Room",      ru: "Переговорная" },
  "Принтер":          { uz: "Printer",          en: "Printer",           ru: "Принтер" },
  "Музыка":           { uz: "Musiqa",           en: "Music",             ru: "Музыка" },

  /* ── photo / studio ── */
  "Студийный свет":   { uz: "Studiya yorug'ligi", en: "Studio Lighting", ru: "Студийный свет" },
  "Фоны":             { uz: "Fonlar",           en: "Backdrops",         ru: "Фоны" },
  "Реквизит":         { uz: "Rekvizitlar",      en: "Props",             ru: "Реквизит" },
  "Гримерка":         { uz: "Grimyorxona",      en: "Dressing Room",     ru: "Гримерка" },

  /* ── other ── */
  "Трибуна":          { uz: "Tribuna",          en: "Stands",            ru: "Трибуна" },
  "Аренда формы":     { uz: "Forma ijarasi",    en: "Uniform Rental",    ru: "Аренда формы" },
  "Табло":            { uz: "Tablo",            en: "Scoreboard",        ru: "Табло" },
  "Полотенца":        { uz: "Sochiqlar",        en: "Towels",            ru: "Полотенца" },
  "Сауна":            { uz: "Sauna",            en: "Sauna",             ru: "Сауна" },
  "Бассейн":          { uz: "Hovuz",            en: "Pool",              ru: "Бассейн" },
  "Шкафчики":         { uz: "Shkafchalar",      en: "Lockers",           ru: "Шкафчики" },
  "Аптечка":          { uz: "Tibbiy quti",      en: "First Aid Kit",     ru: "Аптечка" },
  "Камера хранения":  { uz: "Saqlash kamerasi",  en: "Storage",          ru: "Камера хранения" },
};

/**
 * Translate an amenity string coming from the API (Russian) into the
 * current UI language.  Falls back to the original value when no
 * translation is found.
 */
export function translateAmenity(amenity: string, lang: string): string {
  return AMENITY_MAP[amenity]?.[lang] ?? amenity;
}
