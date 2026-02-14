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
      {/* Header — crisp line, no blur */}
      <header className="bg-surface-950 border-b border-surface-700/40 sticky top-0 z-40">
        <div className="px-4 h-11 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2 group">
            <div className="size-6 bg-primary-500 rounded flex items-center justify-center">
              <span className="text-white font-bold text-[10px]">V</span>
            </div>
            <span className="font-semibold text-surface-200 text-[13px] tracking-tight">
              Venue<span className="gradient-text">Book</span>
            </span>
          </NavLink>

          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="p-1.5 text-surface-500 hover:text-danger-400 rounded transition-colors duration-150 active:scale-90"
              title="Выйти"
            >
              <LogOut className="size-3.5" />
            </button>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 w-full px-4 py-3 pb-16">
        <Outlet />
      </main>

      {/* Bottom Navigation — solid, no blur */}
      {isAuthenticated && (
        <div className="fixed bottom-0 left-0 right-0 z-40 safe-area-bottom">
          <nav className="flex items-center bg-surface-950 border-t border-surface-700/40">
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
          "flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors duration-150 relative",
          isActive
            ? "text-primary-400"
            : "text-surface-500 hover:text-surface-300 active:scale-90"
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-primary-500 rounded-full animate-line-expand" />
          )}
          <Icon className="size-4" />
          <span className="tracking-wide">{label}</span>
        </>
      )}
    </NavLink>
  );
}
