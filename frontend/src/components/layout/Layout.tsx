import { Outlet, NavLink } from "react-router-dom";
import { CalendarDays, User, Sun, Moon, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";
import { useThemeStore } from "@/store/themeStore";
import { useLanguageStore } from "@/store/languageStore";
import { clsx } from "clsx";

export default function Layout() {
  const { isAuthenticated } = useAuthStore();
  const { theme, toggle: toggleTheme } = useThemeStore();
  const { cycle, label } = useLanguageStore();
  const { t } = useTranslation();

  return (
    <div className="min-h-dvh flex flex-col relative">
      {/* Gradient mesh background */}
      <div className="mesh-bg" />

      <main className="flex-1 w-full px-32 pt-10 pb-28">
        <Outlet />
      </main>

      {/* Floating pill nav */}
      {isAuthenticated && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 safe-area-bottom animate-bounce-in">
          <nav className="flex items-center gap-1.5 glass-strong rounded-2xl px-2.5 py-2 shadow-xl shadow-black/8">
            {/* Logo */}
            <NavLink to="/" className="flex items-center justify-center size-9 rounded-xl mr-1 group">
              <div className="size-7 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-md shadow-primary-500/20 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 animate-float">
                <span className="text-white text-[11px] font-black">V</span>
              </div>
            </NavLink>

            <div className="w-px h-6 bg-surface-300/40 mr-0.5" />

            <NavPill to="/bookings" icon={CalendarDays} label={t("nav.bookings")} />
            <NavPill to="/profile" icon={User} label={t("nav.profile")} />

            <div className="w-px h-6 bg-surface-300/40 ml-0.5" />

            <button
              onClick={toggleTheme}
              className="flex items-center justify-center size-9 rounded-xl text-surface-500 hover:text-surface-700 transition-all duration-300 active:scale-90 hover:rotate-12 hover:bg-surface-200/60"
              title={theme === "light" ? t("nav.darkTheme") : t("nav.lightTheme")}
            >
              {theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
            </button>

            <button
              onClick={cycle}
              className="flex items-center justify-center h-9 px-2.5 rounded-xl text-[11px] font-bold text-surface-500 hover:text-surface-700 transition-all duration-300 active:scale-90 hover:bg-surface-200/60 tracking-wide"
              title="Language"
            >
              <Globe className="size-3.5 mr-1 opacity-50" />
              {label()}
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}

function NavPill({
  to,
  icon: Icon,
  label,
}: {
  to: string;
  icon: typeof CalendarDays;
  label: string;
}) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        clsx(
          "flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-medium transition-all duration-300 nav-hover",
          isActive
            ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25 animated-gradient"
            : "text-surface-500 hover:text-surface-800 hover:bg-surface-200/60 active:scale-95"
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon className={clsx("size-[16px] transition-transform duration-300", isActive ? "scale-110" : "group-hover:scale-110")} />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
}
