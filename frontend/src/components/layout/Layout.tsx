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
      <header className="sticky top-0 z-40 bg-surface-950/95 backdrop-blur-[1px]">
        <div className="px-5 h-12 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2">
            <span className="text-[15px] font-bold text-surface-50 tracking-tight">venue</span>
          </NavLink>
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="text-surface-500 hover:text-surface-300 transition-colors active:scale-90"
              title="Выйти"
            >
              <LogOut className="size-4" />
            </button>
          )}
        </div>
        <div className="divider" />
      </header>

      <main className="flex-1 w-full px-5 py-4 pb-20">
        <Outlet />
      </main>

      {isAuthenticated && (
        <div className="fixed bottom-0 left-0 right-0 z-40 safe-area-bottom">
          <div className="divider" />
          <nav className="flex items-center bg-surface-950/95 backdrop-blur-[1px] py-1">
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
          "flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors relative",
          isActive
            ? "text-primary-400"
            : "text-surface-500 hover:text-surface-300 active:scale-95"
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[1.5px] bg-primary-400 rounded-full animate-line-expand" />
          )}
          <Icon className="size-[18px] stroke-[1.5]" />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  );
}
