import React, { useRef, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const NAV_ITEMS = [
  { to: "/dashboard", icon: "dashboard", label: "Dashboard" },
  { to: "/weather", icon: "wb_sunny", label: "Weather" },
  { to: "/map", icon: "map", label: "Interactive Map" },
  { to: "/air-quality", icon: "air", label: "Air Quality" },
  { to: "/community-reports", icon: "groups", label: "Community Reports" },
  { to: "/disaster-alerts", icon: "warning", label: "Disaster Alerts" },
  { to: "/analytics", icon: "analytics", label: "Analytics" },
];

const BOTTOM_ITEMS = [
  { to: "/profile", icon: "person", label: "Profile" },
  { to: "/settings", icon: "settings", label: "Settings" },
];

export default function DashboardLayout({ children, noPadding = false }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();

  // useRef: direct handle to the search input so we can focus it with a
  // keyboard shortcut without needing state (a ref change never re-renders).
  const searchInputRef = useRef(null);

  // useCallback: stable handler passed down; avoids recreating this
  // function identity on every render of the layout.
  const focusSearch = useCallback(() => {
    searchInputRef.current?.focus();
  }, []);

  const handleLogoutClick = useCallback(() => {
    navigate("/logout");
  }, [navigate]);

  return (
    <div className="bg-background text-on-surface min-h-screen">
      {/* TopNavBar */}
      <header className="fixed top-0 w-full h-nav_height z-50 flex items-center justify-between px-container_padding bg-surface-container-lowest shadow-sm">
        <div className="flex items-center gap-stack_md">
          <span className="text-headline-md font-headline-md font-bold text-primary">
            EcoWatch Intelligence
          </span>
          <div className="hidden md:flex items-center bg-surface-container rounded-full px-4 py-2 w-80">
            <span className="material-symbols-outlined text-on-surface-variant mr-2 text-[20px]">
              search
            </span>
            <input
              ref={searchInputRef}
              className="bg-transparent border-none focus:ring-0 text-body-sm w-full outline-none"
              placeholder="Search satellite feeds or locations..."
              type="text"
              onFocus={focusSearch}
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Live location + Change location — visible on large screens */}
          <div className="hidden lg:flex items-center gap-2 mr-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors font-label-md">
              <span className="material-symbols-outlined text-[18px]">my_location</span>
              Live
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-outline-variant hover:bg-surface-container transition-colors font-label-md text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px]">edit_location_alt</span>
              Change Location
            </button>
          </div>
          {/* Theme toggle — flips ThemeContext's state, which the
              context's useEffect syncs to <html class="dark"> */}
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-surface-container rounded-full transition-colors"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            <span className="material-symbols-outlined text-on-surface-variant">
              {isDark ? "light_mode" : "dark_mode"}
            </span>
          </button>
          <button className="p-2 hover:bg-surface-container rounded-full transition-colors relative">
            <span className="material-symbols-outlined text-on-surface-variant">
              notifications
            </span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
          </button>
          <div
            className="h-8 w-8 rounded-full bg-primary-fixed overflow-hidden border border-outline-variant flex items-center justify-center cursor-pointer"
            onClick={() => navigate("/profile")}
          >
            <span className="material-symbols-outlined text-primary text-[18px]">
              person
            </span>
          </div>
        </div>
      </header>

      {/* SideNavBar */}
      <aside className="fixed left-0 top-nav_height h-[calc(100vh-64px)] w-sidebar_width flex flex-col p-stack_md bg-surface-bright border-r border-outline-variant/30 overflow-y-auto custom-scrollbar">
        <div className="mb-stack_lg px-2">
          <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
            EcoWatch
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Intelligence Platform
          </p>
        </div>
        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? "text-primary font-bold bg-surface-container-high"
                    : "text-on-surface-variant hover:bg-surface-container"
                }`
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-label-md text-label-md">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto border-t border-outline-variant pt-4 space-y-1">
          {BOTTOM_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? "text-primary font-bold bg-surface-container-high"
                    : "text-on-surface-variant hover:bg-surface-container"
                }`
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-label-md text-label-md">{item.label}</span>
            </NavLink>
          ))}
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-error hover:bg-error-container/20 transition-all"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-md text-label-md">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content slot */}
      <main className={`ml-sidebar_width mt-nav_height ${noPadding ? "p-0 overflow-hidden" : "p-container_padding"} min-h-[calc(100vh-64px)]`}>
        {children}
      </main>
    </div>
  );
}
