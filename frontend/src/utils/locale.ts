/** Map i18n language code to a BCP-47 number/date locale string. */
const LOCALE_MAP: Record<string, string> = {
  uz: "uz-UZ",
  ru: "ru-RU",
  en: "en-US",
};

export function getNumberLocale(lang: string): string {
  return LOCALE_MAP[lang] || "uz-UZ";
}
