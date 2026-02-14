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
      {/* Header — ultra-thin glass */}
      <header className="glass border-b border-white/[0.04] sticky top-0 z-40">
        <div className="px-4 h-12 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2 group">
            <div className="size-7 bg-gradient-to-br from-primary-400 to-primary-600 rounded-md flex items-center justify-center shadow-sm shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-shadow">
              <span className="text-white font-bold text-xs">V</span>
            </div>
            <span className="font-semibold text-surface-200 text-sm tracking-tight">
              Venue<span className="gradient-text">Book</span>
            </span>
          </NavLink>

          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="p-1.5 text-surface-500 hover:text-danger-400 rounded-md transition-all duration-200 hover:bg-white/[0.03] active:scale-90"
              title="Выйти"
            >
              <LogOut className="size-4" />
            </button>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 w-full px-4 py-4 pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation — sleek glass bar */}
      {isAuthenticated && (
        <div className="fixed bottom-0 left-0 right-0 z-40 safe-area-bottom">
          <nav className="flex items-center glass border-t border-white/[0.04]">
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
          "flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-all duration-300 relative",
          isActive
            ? "text-primary-400"
            : "text-surface-500 hover:text-surface-300 active:scale-90"
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-gradient-to-r from-primary-400 to-primary-500 rounded-full animate-pop" />
          )}
          <Icon className={clsx("transition-all duration-300", isActive ? "size-[18px]" : "size-[18px]")} />
          <span className="tracking-wide">{label}</span>
        </>
      )}
    </NavLink>
  );
}
