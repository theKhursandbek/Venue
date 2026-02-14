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
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2">
            <div className="size-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">VB</span>
            </div>
            <span className="font-bold text-gray-900">VenueBook</span>
          </NavLink>

          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Выйти"
            >
              <LogOut className="size-5" />
            </button>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-4 pb-24">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      {isAuthenticated && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40 safe-area-bottom">
          <div className="max-w-lg mx-auto flex">
            <NavItem to="/" icon={Home} label="Площадки" />
            <NavItem to="/bookings" icon={CalendarDays} label="Брони" />
            <NavItem to="/profile" icon={User} label="Профиль" />
          </div>
        </nav>
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
          "flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors",
          isActive ? "text-primary-600" : "text-gray-400"
        )
      }
    >
      <Icon className="size-5" />
      {label}
    </NavLink>
  );
}
