import { create } from "zustand";
import { persist } from "zustand/middleware";
import i18n from "@/i18n";

export type Language = "uz" | "ru" | "en";

const LANGS: Language[] = ["uz", "ru", "en"];
const LABELS: Record<Language, string> = { uz: "UZ", ru: "RU", en: "EN" };

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  cycle: () => void;
  label: () => string;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: (localStorage.getItem("language") as Language) || "uz",
      setLanguage: (lang) => {
        i18n.changeLanguage(lang);
        localStorage.setItem("language", lang);
        set({ language: lang });
      },
      cycle: () => {
        const current = get().language;
        const idx = LANGS.indexOf(current);
        const next = LANGS[(idx + 1) % LANGS.length];
        get().setLanguage(next);
      },
      label: () => LABELS[get().language],
    }),
    {
      name: "venue-language",
      onRehydrateStorage: () => {
        return (state?: LanguageState) => {
          if (state) {
            i18n.changeLanguage(state.language);
            localStorage.setItem("language", state.language);
          }
        };
      },
    }
  )
);
