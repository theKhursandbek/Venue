import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Home, CalendarDays, User, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { clsx } from "clsx";

export default function Layout() {
  const { isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-dvh flex flex-col relative">
      {/* Gradient mesh background */}
      <div className="mesh-bg" />

      {/* Top bar */}
      <header className="sticky top-0 z-40 glass-strong">
        <div className="px-5 h-14 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2.5">
            <div className="size-7 rounded-lg bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center">
              <span className="text-white text-[11px] font-black">V</span>
            </div>
            <span className="text-[16px] font-bold text-surface-50 tracking-tight">Venue</span>
          </NavLink>
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="size-9 rounded-xl glass flex items-center justify-center text-surface-400 hover:text-surface-200 transition-colors active:scale-90"
              title="Выйти"
            >
              <LogOut className="size-4" />
            </button>
          )}
        </div>
      </header>

      <main className="flex-1 w-full max-w-lg mx-auto px-5 py-5 pb-28">
        <Outlet />
      </main>

      {/* Floating pill nav */}
      {isAuthenticated && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 safe-area-bottom">
          <nav className="flex items-center gap-1 glass-strong rounded-2xl px-2 py-2 shadow-2xl shadow-black/40">
            <NavPill to="/" icon={Home} label="Площадки" />
            <NavPill to="/bookings" icon={CalendarDays} label="Брони" />
            <NavPill to="/profile" icon={User} label="Профиль" />
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
  icon: typeof Home;
  label: string;
}) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        clsx(
          "flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-medium transition-all duration-200",
          isActive
            ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25"
            : "text-surface-400 hover:text-surface-200 hover:bg-surface-800/50 active:scale-95"
        )
      }
    >
      <Icon className="size-[16px]" />
      <span>{label}</span>
    </NavLink>
  );
}
