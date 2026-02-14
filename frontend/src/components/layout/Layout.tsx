import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Home, CalendarDays, User, LogOut, Sparkles } from "lucide-react";
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
      <header className="glass border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div className="size-9 bg-linear-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md shadow-primary-500/20 group-hover:shadow-lg group-hover:shadow-primary-500/30 transition-shadow">
              <Sparkles className="size-4.5 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">
              Venue<span className="text-primary-600">Book</span>
            </span>
          </NavLink>

          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-danger-500 hover:bg-danger-50 rounded-xl transition-all"
              title="Выйти"
            >
              <LogOut className="size-5" />
            </button>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-5 pb-24">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      {isAuthenticated && (
        <nav className="fixed bottom-0 left-0 right-0 glass border-t border-gray-200/50 z-40 safe-area-bottom">
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
          "flex-1 flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition-all relative",
          isActive ? "text-primary-600" : "text-gray-400 hover:text-gray-600"
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <div className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-linear-to-r from-primary-500 to-purple-500 rounded-full" />
          )}
          <div
            className={clsx(
              "p-1 rounded-xl transition-colors",
              isActive && "bg-primary-50"
            )}
          >
            <Icon className="size-5" />
          </div>
          {label}
        </>
      )}
    </NavLink>
  );
}
