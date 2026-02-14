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
    <div className="min-h-dvh flex flex-col bg-surface-950">
      {/* Header */}
      <header className="glass border-b border-white/5 sticky top-0 z-40">
        <div className="px-5 h-14 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div className="size-8 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-surface-950 font-black text-sm">V</span>
            </div>
            <span className="font-bold text-surface-100 text-base tracking-tight">
              Venue<span className="gradient-text">Book</span>
            </span>
          </NavLink>

          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="p-2 text-surface-500 hover:text-danger-400 rounded-lg transition-all duration-200 hover:bg-surface-800 active:scale-95"
              title="Выйти"
            >
              <LogOut className="size-4.5" />
            </button>
          )}
        </div>
      </header>

      {/* Main content — full width */}
      <main className="flex-1 w-full px-5 py-6 pb-24">
        <Outlet />
      </main>

      {/* Bottom Navigation — edge-to-edge dark bar */}
      {isAuthenticated && (
        <div className="fixed bottom-0 left-0 right-0 z-40 safe-area-bottom">
          <nav className="flex items-center glass border-t border-white/5">
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
          "flex-1 flex flex-col items-center gap-1 py-3 text-[10px] font-semibold transition-all duration-200 relative",
          isActive
            ? "text-primary-400"
            : "text-surface-500 hover:text-surface-300"
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary-500 rounded-full" />
          )}
          <Icon className="size-5" />
          <span className="tracking-wide">{label}</span>
        </>
      )}
    </NavLink>
  );
}
