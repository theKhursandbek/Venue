import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import uz from "@/locales/uz.json";
import ru from "@/locales/ru.json";
import en from "@/locales/en.json";

function getSavedLang(): string {
  try {
    const stored = localStorage.getItem("venue-language");
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed?.state?.language || "uz";
    }
  } catch { /* ignore */ }
  return "uz";
}

const savedLang = getSavedLang();

i18n.use(initReactI18next).init({
  resources: {
    uz: { translation: uz },
    ru: { translation: ru },
    en: { translation: en },
  },
  lng: savedLang,
  fallbackLng: "uz",
  interpolation: { escapeValue: false },
});

export default i18n;
