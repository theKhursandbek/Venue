import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Home, CalendarDays, User, LogOut, Zap } from "lucide-react";
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
    <div className="min-h-dvh flex flex-col bg-gray-50">
      {/* Header */}
      <header className="glass border-b border-white/40 sticky top-0 z-40 shadow-sm shadow-primary-500/3">
        <div className="max-w-lg mx-auto px-4 h-15 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary-500/20 rounded-2xl blur-lg group-hover:bg-primary-500/30 transition-all" />
              <div className="relative size-10 bg-linear-to-br from-primary-600 via-primary-500 to-accent-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30 group-hover:shadow-xl group-hover:shadow-primary-500/40 transition-all group-hover:scale-105">
                <Zap className="size-5 text-white drop-shadow-sm" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-gray-900 text-lg tracking-tight leading-none">
                Venue<span className="gradient-text">Book</span>
              </span>
              <span className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase leading-none mt-0.5">Premium</span>
            </div>
          </NavLink>

          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="p-2.5 text-gray-400 hover:text-danger-500 hover:bg-danger-50 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
              title="Выйти"
            >
              <LogOut className="size-5" />
            </button>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6 pb-28">
        <Outlet />
      </main>

      {/* Bottom Navigation — Floating Pill */}
      {isAuthenticated && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40">
          <nav className="flex items-center gap-1 bg-white/80 backdrop-blur-2xl border border-white/60 rounded-[22px] px-2 py-1.5 shadow-xl shadow-gray-900/8">
            <NavItem to="/" icon={Home} label="Площадки" />
            <NavItem to="/bookings" icon={CalendarDays} label="Брони" />
            <NavItem to="/profile" icon={User} label="Профиль" />
          </nav>
        </div>
      )}
    </div>
  );
}

function NavItem({
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
          "flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-300",
          isActive
            ? "bg-linear-to-r from-primary-600 via-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/25"
            : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon className="size-4.5" />
          {isActive && <span>{label}</span>}
        </>
      )}
    </NavLink>
  );
}
