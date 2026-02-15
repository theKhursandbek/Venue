import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "light",
      toggle: () => {
        const next = get().theme === "light" ? "dark" : "light";
        document.documentElement.dataset.theme = next;
        set({ theme: next });
      },
      setTheme: (t) => {
        document.documentElement.dataset.theme = t;
        set({ theme: t });
      },
    }),
    { name: "venue-theme" }
  )
);
