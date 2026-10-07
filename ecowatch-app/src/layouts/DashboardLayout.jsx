import React, { useEffect, useRef, useCallback, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage, LANGUAGE_OPTIONS } from "../context/LanguageContext";
import { useSatelliteData } from "../context/SatelliteDataContext";
import { useLocationSearch } from "../hooks/useLocationSearch";
import { getRecentAccess } from "../lib/recentAccess";

const NAV_ITEMS = [
  { to: "/dashboard", icon: "dashboard", labelKey: "dashboard" },
  { to: "/weather", icon: "wb_sunny", labelKey: "weather" },
  { to: "/map", icon: "map", labelKey: "map" },
  { to: "/air-quality", icon: "air", labelKey: "airQuality" },
  { to: "/community-reports", icon: "groups", labelKey: "communityReports" },
  { to: "/disaster-alerts", icon: "warning", labelKey: "disasterAlerts" },
  { to: "/analytics", icon: "analytics", labelKey: "analytics" },
];

const BOTTOM_ITEMS = [
  { to: "/profile", icon: "person", labelKey: "profile" },
];

const ROLE_NAV_BADGES = {
  "System Admin": {
    "/admin": { label: "ADMIN", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300 border-purple-200" },
    "/settings": { label: "SECURITY", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300 border-purple-200" },
  },
  "Analyst": {
    "/analytics": { label: "TELEMETRY", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 border-emerald-200" },
    "/map": { label: "ORBITAL", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 border-emerald-200" },
  },
  "Scientist": {
    "/air-quality": { label: "TRACE GAS", color: "bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300 border-sky-200" },
    "/analytics": { label: "RESEARCH", color: "bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300 border-sky-200" },
  },
  "Emergency Responder": {
    "/disaster-alerts": { label: "CRITICAL", color: "bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300 border-rose-200 animate-pulse font-extrabold" },
    "/weather": { label: "RADAR", color: "bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300 border-rose-200" },
  },
  "Inspector": {
    "/community-reports": { label: "AUDITING", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300 border-amber-200" },
  },
};

const ROLE_BADGE_STYLES = {
  "Citizen": "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950/50 dark:text-teal-300 dark:border-teal-800",
  "System Admin": "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800",
  "Analyst": "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
  "Scientist": "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800",
  "Emergency Responder": "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
  "Inspector": "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
};

export default function DashboardLayout({ children, noPadding = false }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const { translate: t, language, setLanguage } = useLanguage();
  const [recentList, setRecentList] = useState([]);
  const [citizenNotifOpen, setCitizenNotifOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setCitizenNotifOpen(false);
      }
    }
    if (citizenNotifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [citizenNotifOpen]);

  useEffect(() => {
    const update = () => setRecentList(getRecentAccess(user?.id));
    update();
    window.addEventListener("ecowatch-recent-access", update);
    return () => window.removeEventListener("ecowatch-recent-access", update);
  }, [user?.id]);

  const { currentLocation, changeLocation, requestCurrentLocation, locationStatus, locationError } = useSatelliteData();
  const [searchQuery, setSearchQuery] = useState(currentLocation);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const { results: locationResults, isSearching } = useLocationSearch(searchQuery, isSearchOpen || isLocationPickerOpen);

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

  useEffect(() => {
    setSearchQuery(currentLocation);
  }, [currentLocation]);

  const handleLocationSelect = useCallback((location) => {
    changeLocation(location.label, location.lat, location.lon);
    setSearchQuery(location.label);
    setIsSearchOpen(false);
    setIsLocationPickerOpen(false);
  }, [changeLocation]);

  const handleChangeLocation = useCallback(() => {
    setIsSearchOpen(true);
    searchInputRef.current?.focus();
    searchInputRef.current?.select();
  }, []);

  return (
    <div className="bg-background text-on-surface min-h-screen">
      {/* TopNavBar */}
      <header className="fixed top-0 w-full h-nav_height z-50 flex items-center justify-between px-container_padding bg-surface-container-lowest shadow-sm">
        <div className="flex items-center gap-stack_md">
          <span className="text-headline-md font-headline-md font-bold text-primary">
            EcoWatch Intelligence
          </span>
          <div className="relative hidden md:flex items-center bg-surface-container rounded-full px-4 py-2 w-80">
            <span className="material-symbols-outlined text-on-surface-variant mr-2 text-[20px]">
              search
            </span>
            <input
              ref={searchInputRef}
              className="bg-transparent border-none focus:ring-0 text-body-sm w-full outline-none"
              placeholder={t("search")}
              translate="no"
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onFocus={() => { focusSearch(); setIsSearchOpen(true); }}
              onKeyDown={async (event) => {
                if (event.key === "Escape") setIsSearchOpen(false);
                if (event.key === "Enter") {
                  if (locationResults[0]) {
                    handleLocationSelect(locationResults[0]);
                  } else if (searchQuery.trim().length >= 2) {
                    try {
                      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery.trim())}&count=1&language=en&format=json`);
                      const data = await res.json();
                      if (data.results?.[0]) {
                        const top = data.results[0];
                        handleLocationSelect({
                          label: [top.name, top.admin1, top.country].filter(Boolean).join(", "),
                          lat: top.latitude,
                          lon: top.longitude,
                        });
                      }
                    } catch {}
                  }
                }
              }}
            />
            {isSearchOpen && (isSearching || locationResults.length > 0) && (
              <div className="absolute left-0 right-0 top-full z-[70] mt-2 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-xl">
                {isSearching && <p className="px-4 py-3 text-label-sm text-on-surface-variant">Searching locations...</p>}
                {locationResults.map((location) => (
                  <button
                    key={location.id}
                    type="button"
                    onClick={() => handleLocationSelect(location)}
                    className="block w-full border-b border-outline-variant/30 px-4 py-2.5 text-left last:border-b-0 hover:bg-surface-container"
                  >
                    <span className="block text-label-sm font-semibold text-on-surface">{location.label}</span>
                    <span className="block text-[11px] text-on-surface-variant">{location.lat.toFixed(5)}, {location.lon.toFixed(5)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {/* Live location status */}
          <div className="hidden lg:flex items-center gap-2 mr-2">
            <button onClick={requestCurrentLocation} disabled={locationStatus === "locating"} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors font-label-md disabled:opacity-60" title="Sync live GPS location">
              <span className="material-symbols-outlined text-[18px]">my_location</span>
              {locationStatus === "locating" ? "Locating..." : "Live"}
            </button>
          </div>
          <div className="flex lg:hidden items-center gap-1">
            <button onClick={requestCurrentLocation} disabled={locationStatus === "locating"} className="p-2 text-secondary disabled:opacity-60" title="Use current location">
              <span className="material-symbols-outlined">my_location</span>
            </button>
          </div>
          {/* Recently Accessed quick-jump pills */}
          {recentList.length > 0 && (
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container/60 border border-outline-variant/30 text-xs">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">history</span>
                Recent:
              </span>
              {recentList.slice(0, 3).map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="px-2 py-0.5 rounded-full bg-surface hover:bg-primary hover:text-white transition-all text-[11px] font-medium text-on-surface border border-outline-variant/30 truncate max-w-[120px]"
                  title={item.title}
                >
                  {item.title}
                </button>
              ))}
            </div>
          )}

          {/* Multilingual Selector */}
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full border border-outline-variant/60 bg-surface text-xs font-semibold hover:border-primary transition-all">
            <span className="material-symbols-outlined text-[16px] text-primary">translate</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent border-none outline-none text-xs text-on-surface cursor-pointer font-medium"
              title="Select Language"
            >
              {LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Theme toggle — flips ThemeContext's state, which the
              context's useEffect syncs the selected color or black mode to the whole document */}
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-surface-container rounded-full transition-colors"
            title={isDark ? "Switch to EcoWatch color theme" : "Switch to black theme"}
          >
            <span className="material-symbols-outlined text-on-surface-variant">
              {isDark ? "light_mode" : "dark_mode"}
            </span>
          </button>
          {/* Notification Button */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                if (user?.role === "Citizen") {
                  setCitizenNotifOpen((prev) => !prev);
                } else {
                  navigate("/disaster-alerts");
                }
              }}
              className="p-2 hover:bg-surface-container rounded-full transition-colors relative"
              title={user?.role === "Citizen" ? "Citizen Notifications & Community Initiatives" : "Active Disaster Alerts"}
            >
              <span className={`material-symbols-outlined ${user?.role === "Citizen" ? "text-emerald-600 dark:text-emerald-400" : "text-on-surface-variant"}`}>
                {user?.role === "Citizen" ? "notifications_active" : "notifications"}
              </span>
              {user?.role === "Citizen" ? (
                <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600" />
                </span>
              ) : (
                <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full" />
              )}
            </button>

            {/* Citizen Exclusive Notification Popover */}
            {user?.role === "Citizen" && citizenNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-surface-container-lowest border border-emerald-500/30 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[16px]">groups</span>
                    </div>
                    <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
                      Citizen Notifications
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                    1 Active Working Group
                  </span>
                </div>

                <div className="py-3">
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/40 transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Community Working in Your Area
                      </span>
                      <span className="text-[10px] text-on-surface-variant/70 font-mono">Live</span>
                    </div>
                    <h4 className="font-bold text-xs text-on-surface mt-1">
                      Severe Stormwater Inundation - Main Corridor
                    </h4>
                    <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
                      📍 KTC Nagar, Tirunelveli • <strong>42 neighbors</strong> are actively collaborating on clearing drains and logging waterlogged points. Join this community initiative!
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setCitizenNotifOpen(false);
                          navigate("/community-reports?highlight=101&join=true");
                        }}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-xs transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">how_to_reg</span>
                        Join Community Report
                      </button>
                      <button
                        onClick={() => {
                          setCitizenNotifOpen(false);
                          navigate("/community-reports");
                        }}
                        className="py-1.5 px-3 rounded-lg border border-outline-variant/50 hover:bg-surface-container text-on-surface text-[11px] font-medium transition-colors"
                      >
                        View All
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-outline-variant/30 flex items-center justify-between text-[11px]">
                  <span className="text-[10px] text-on-surface-variant">Role: Citizen Collaboration Alerts</span>
                  <button
                    onClick={() => setCitizenNotifOpen(false)}
                    className="text-primary font-bold hover:underline text-[11px]"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}
          </div>
          <div
            className="flex items-center gap-2 pl-2 border-l border-outline-variant/40 cursor-pointer"
            onClick={() => navigate("/profile")}
            title={`Signed in as ${user?.name || user?.email} (${user?.role || "User"})`}
          >
            <div className="h-8 w-8 rounded-full bg-primary/10 overflow-hidden border border-primary/30 flex items-center justify-center">
              {user?.picture ? (
                <img src={user.picture} alt={user?.name || "Avatar"} className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-primary text-[18px]">
                  person
                </span>
              )}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-bold text-on-surface leading-tight truncate max-w-[120px]">
                {user?.name?.split(" ")[0] || "User"}
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border leading-tight ${ROLE_BADGE_STYLES[user?.role] || ROLE_BADGE_STYLES["Analyst"]}`}>
                {user?.role || "Analyst"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {isLocationPickerOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-20 sm:items-center sm:pt-4">
          <button type="button" aria-label="Close location picker" className="absolute inset-0 bg-black/40" onClick={() => setIsLocationPickerOpen(false)} />
          <section className="relative z-10 w-full max-w-md rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">Set location</h2>
              <button type="button" onClick={() => setIsLocationPickerOpen(false)} title="Close" className="p-1 text-on-surface-variant">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <input
              autoFocus
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search city, town, or address"
              className="w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-body-sm text-on-surface outline-none focus:border-primary"
            />
            {isSearching && <p className="py-3 text-label-sm text-on-surface-variant">Searching locations...</p>}
            <div className="mt-2 max-h-64 overflow-y-auto">
              {locationResults.map((location) => (
                <button key={location.id} type="button" onClick={() => handleLocationSelect(location)} className="block w-full border-b border-outline-variant/30 px-2 py-3 text-left last:border-b-0 hover:bg-surface-container">
                  <span className="block text-label-sm font-semibold text-on-surface">{location.label}</span>
                  <span className="block text-[11px] text-on-surface-variant">{location.lat.toFixed(5)}, {location.lon.toFixed(5)}</span>
                </button>
              ))}
            </div>
            {locationError && <p className="mt-2 text-label-sm text-error" role="status">{locationError}</p>}
          </section>
        </div>
      )}

      {/* SideNavBar */}
      <aside className="fixed left-0 top-nav_height h-[calc(100vh-64px)] w-sidebar_width flex flex-col p-stack_md bg-surface-bright border-r border-outline-variant/30 overflow-y-auto custom-scrollbar">
        <div className="mb-stack_lg px-2">
          <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
            EcoWatch
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Intelligence Platform
          </p>
          <div className="mt-2 flex items-center">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${ROLE_BADGE_STYLES[user?.role] || ROLE_BADGE_STYLES["Analyst"]}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {user?.role || "Analyst"}
            </span>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map((item) => {
            const roleBadge = ROLE_NAV_BADGES[user?.role]?.[item.to];
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                    isActive
                      ? "text-primary font-bold bg-surface-container-high"
                      : "text-on-surface-variant hover:bg-surface-container"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span className="font-label-md text-label-md" translate="no">{t(item.labelKey)}</span>
                </div>
                {roleBadge && (
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider border ${roleBadge.color}`}>
                    {roleBadge.label}
                  </span>
                )}
              </NavLink>
            );
          })}
          {user?.role === "System Admin" && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center justify-between rounded-lg px-3 py-2.5 transition-all ${
                  isActive ? "bg-surface-container-high font-bold text-primary" : "text-on-surface-variant hover:bg-surface-container"
                }`
              }
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined">admin_panel_settings</span>
                <span className="font-label-md text-label-md">Admin Dashboard</span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider border bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300 border-purple-200">
                ADMIN
              </span>
            </NavLink>
          )}
        </nav>
        <div className="mt-auto border-t border-outline-variant pt-4 space-y-1">
          {BOTTOM_ITEMS.map((item) => {
            const roleBadge = ROLE_NAV_BADGES[user?.role]?.[item.to];
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                    isActive
                      ? "text-primary font-bold bg-surface-container-high"
                      : "text-on-surface-variant hover:bg-surface-container"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span className="font-label-md text-label-md" translate="no">{t(item.labelKey)}</span>
                </div>
                {roleBadge && (
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider border ${roleBadge.color}`}>
                    {roleBadge.label}
                  </span>
                )}
              </NavLink>
            );
          })}
          {user?.role === "System Admin" && (
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? "text-primary font-bold bg-surface-container-high"
                    : "text-on-surface-variant hover:bg-surface-container"
                }`
              }
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined">settings</span>
                <span className="font-label-md text-label-md" translate="no">{t("settings")}</span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider border bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300 border-purple-200">
                ADMIN
              </span>
            </NavLink>
          )}
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-error hover:bg-error-container/20 transition-all"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-md text-label-md" translate="no">{t("logout")}</span>
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
