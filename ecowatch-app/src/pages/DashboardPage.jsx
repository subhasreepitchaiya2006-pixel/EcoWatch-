import React, {
  useState,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useCallback,
} from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { useSatelliteData } from "../context/SatelliteDataContext";
import { useAuth } from "../context/AuthContext";
import { initialAlertsState, alertsReducer } from "../reducers/alertsReducer";

const ALERT_ICONS = {
  flood: "flood",
  water_drop: "water_drop",
  thermostat: "thermostat",
};

const INITIAL_LAYERS = { Precipitation: true, "Wind Speed": false, "Heat Map": false };

const REPORT_TYPES = [
  { icon: "water_damage", label: "Waterlogging" },
  { icon: "cloud_circle", label: "Air Quality" },
  { icon: "thunderstorm", label: "Power / Storm" },
  { icon: "groups", label: "Other Community Issue" },
];

const POPULAR_LOCATIONS = [
  { name: "Tirunelveli, Tamil Nadu, India", lat: 8.7139, lon: 77.7567 },
  { name: "San Francisco, CA, USA", lat: 37.7749, lon: -122.4194 },
  { name: "Tokyo, Kanto, Japan", lat: 35.6762, lon: 139.6503 },
  { name: "London, Greater London, UK", lat: 51.5074, lon: -0.1278 },
  { name: "Sydney, NSW, Australia", lat: -33.8688, lon: 151.2093 },
];

export default function DashboardPage() {
  const {
    aqi,
    aqiStatus,
    temperature,
    humidity,
    windSpeed,
    heatStatus,
    lastUpdated,
    currentLocation,
    changeLocation,
    environmentalRiskIndex,
    riskLevel,
    aiRecommendations,
  } = useSatelliteData();
  const { user } = useAuth();

  const displayName = user?.fullName || "Sree";

  const [zoom, setZoom] = useState(1);
  const [activeLayers, setActiveLayers] = useState(INITIAL_LAYERS);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [customLocation, setCustomLocation] = useState("");
  const [stakeholderMode, setStakeholderMode] = useState("citizen");
  const [now, setNow] = useState(new Date());
  const [pulse, setPulse] = useState(false);

  const [state, dispatch] = useReducer(alertsReducer, initialAlertsState);
  const clockRef = useRef(null);

  useEffect(() => {
    clockRef.current = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(clockRef.current);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 600);
    return () => clearTimeout(t);
  }, [pulse]);

  const zoomIn = useCallback(() => setZoom((z) => Math.min(2, z + 0.1)), []);
  const zoomOut = useCallback(() => setZoom((z) => Math.max(0.8, z - 0.1)), []);
  const toggleLayer = useCallback((layer) => {
    setActiveLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  }, []);
  const openReport = useCallback(() => setIsReportOpen(true), []);
  const closeReport = useCallback(() => setIsReportOpen(false), []);
  const resolveAlert = useCallback((id) => {
    dispatch({ type: "RESOLVE", payload: id });
  }, []);

  const activeAlerts = useMemo(
    () => state.alerts.filter((a) => a.status !== "Resolved"),
    [state.alerts]
  );

  const activeLayerCount = useMemo(
    () => Object.values(activeLayers).filter(Boolean).length,
    [activeLayers]
  );

  const gaugeOffset = useMemo(() => {
    const clamped = Math.min(180, Math.max(15, aqi));
    const pct = (clamped - 15) / (180 - 15);
    return Math.round(251.2 - 251.2 * pct * 0.4);
  }, [aqi]);

  const greeting = useMemo(() => {
    const h = now.getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  }, [now]);

  const dateLabel = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const pressure = useMemo(() => 1012 + Math.round((humidity - 78) * 0.8), [humidity]);
  const visibility = useMemo(() => Math.max(4, Math.round(10 - windSpeed / 5)), [windSpeed]);

  const tempChart = [
    { day: "Mon", h: 60, temp: 58 },
    { day: "Tue", h: 75, temp: 62 },
    { day: "Wed", h: 85, temp: 66 },
    { day: "Thu", h: 95, temp: temperature },
    { day: "Fri", h: 80, temp: 68 },
    { day: "Sat", h: 65, temp: 60 },
    { day: "Sun", h: 50, temp: 52 },
  ];

  const rainfall = [20, 10, 40, 15, 85, 30, 45];

  const reports = [
    {
      icon: "water_damage",
      title: "Waterlogging reported near Nellaiappar Temple",
      meta: "Reported by Sarah J. • 12 mins ago",
      status: "Assigned",
      statusClass: "text-primary",
      badge: "thumb_up",
      badgeText: "24",
    },
    {
      icon: "cloud_circle",
      title: "Silt levels rising in Thamirabarani River",
      meta: "Detected by Sentinel-2 Orbit #882 • 45 mins ago",
      status: "Investigating",
      statusClass: "text-tertiary",
      badge: "verified",
      badgeText: "Satellite",
    },
    {
      icon: "thunderstorm",
      title: "Power outage reported in Palayamkottai",
      meta: "Reported by CityBot • 1 hour ago",
      status: "En Route",
      statusClass: "text-error",
      badge: "priority_high",
      badgeText: "Critical",
    },
  ];

  const handleLocationSubmit = (e) => {
    e.preventDefault();
    if (customLocation.trim()) {
      changeLocation(customLocation.trim());
      setCustomLocation("");
      setIsLocationModalOpen(false);
    }
  };

  const currentRecommendations = aiRecommendations[stakeholderMode] || aiRecommendations.citizen;

  return (
    <DashboardLayout>
      {/* Welcome Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">
            {greeting}, {displayName}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-on-surface-variant mt-1">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            <span className="text-body-sm">{dateLabel}</span>
            <span className="mx-1 opacity-30">•</span>
            <span className="material-symbols-outlined text-[18px]">location_on</span>
            <span className="text-body-sm font-medium">{currentLocation}</span>
            <button
              onClick={() => setIsLocationModalOpen(true)}
              className="ml-1 p-1 hover:bg-surface-container rounded-full transition-colors flex items-center justify-center"
              title="Change Location"
            >
              <span className="material-symbols-outlined text-[16px] text-primary">edit</span>
            </button>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-[12px] text-on-surface-variant">
            <span className={`inline-block h-2 w-2 rounded-full ${pulse ? "bg-error" : "bg-secondary"} animate-pulse`} />
            Live integrated data feed • updated {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <button
          onClick={openReport}
          className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md flex items-center gap-2 shadow-sm active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Report Issue
        </button>
      </header>

      {/* Integrated Data Stream & Environmental Intelligence Score Bar */}
      <div className="mb-6 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30 shadow-ambient flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
            <span className="material-symbols-outlined text-[28px]">hub</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-label-md font-bold text-on-surface">Integrated Environmental Risk Index (ERI)</h4>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${riskLevel.bg} ${riskLevel.color} border ${riskLevel.border}`}>
                {riskLevel.label} ({riskLevel.level})
              </span>
            </div>
            <p className="text-[12px] text-on-surface-variant">
              Fusing Satellite Remote Sensing, Earth Observation Feeds, Atmospheric Data, Disaster Alerts &amp; Community Reports.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6 border-t lg:border-t-0 pt-3 lg:pt-0 border-outline-variant/20">
          <div className="text-right">
            <span className="text-[24px] font-bold text-on-surface leading-none">{environmentalRiskIndex}</span>
            <span className="text-[12px] text-outline font-medium"> / 100</span>
            <p className="text-[10px] text-outline uppercase font-bold tracking-wider">Unified Risk</p>
          </div>
          <div className="h-8 w-[1px] bg-outline-variant/30 hidden sm:block" />
          <div className="hidden sm:flex gap-3 text-[11px] text-on-surface-variant">
            <div className="flex items-center gap-1.5 bg-surface-container-low px-2.5 py-1 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-secondary" /> Weather: Live
            </div>
            <div className="flex items-center gap-1.5 bg-surface-container-low px-2.5 py-1 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-primary" /> AQI: {aqi}
            </div>
            <div className="flex items-center gap-1.5 bg-surface-container-low px-2.5 py-1 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-error" /> Alerts: {activeAlerts.length}
            </div>
          </div>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-gutter">
        {/* Current Weather */}
        <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest rounded-xl p-stack_lg shadow-ambient border border-outline-variant/20 relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-headline-sm text-headline-sm">Current Weather</h3>
              <p className="text-on-surface-variant text-body-sm">Updated just now</p>
            </div>
            <span className="material-symbols-outlined text-amber-500 text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              wb_sunny
            </span>
          </div>
          <div className="flex items-baseline gap-2 mb-6">
            <span className="text-[56px] font-bold text-on-surface">{temperature}°C</span>
            <span className="text-on-surface-variant text-headline-sm">{heatStatus.label}</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-bright p-3 rounded-lg flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">humidity_percentage</span>
              <div><p className="text-[10px] uppercase text-outline font-bold">Humidity</p><p className="font-label-md">{humidity}%</p></div>
            </div>
            <div className="bg-surface-bright p-3 rounded-lg flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">air</span>
              <div><p className="text-[10px] uppercase text-outline font-bold">Wind</p><p className="font-label-md">{windSpeed} mph</p></div>
            </div>
            <div className="bg-surface-bright p-3 rounded-lg flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">compress</span>
              <div><p className="text-[10px] uppercase text-outline font-bold">Pressure</p><p className="font-label-md">{pressure} mb</p></div>
            </div>
            <div className="bg-surface-bright p-3 rounded-lg flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">visibility</span>
              <div><p className="text-[10px] uppercase text-outline font-bold">Visibility</p><p className="font-label-md">{visibility} mi</p></div>
            </div>
          </div>
        </div>

        {/* Weather & Disaster Alerts */}
        <div className="col-span-12 lg:col-span-5 bg-surface-container-lowest rounded-xl p-stack_lg shadow-ambient border border-outline-variant/20">
          <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4 mb-4">
            <h3 className="font-headline-sm text-headline-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
              Disaster Alerts
            </h3>
            <span className="bg-error-container text-on-error-container px-2 py-0.5 rounded-full text-label-sm">{activeAlerts.length} Active</span>
          </div>
          <div className="space-y-3">
            {state.alerts.map((alert) => {
              const resolved = alert.status === "Resolved";
              return (
                <div
                  key={alert.id}
                  className={`flex items-center justify-between p-3 rounded-lg border-l-4 transition-all ${
                    resolved
                      ? "bg-surface-container border-outline-variant/40"
                      : alert.severity === "CRITICAL"
                      ? "bg-error-container/20 border-error"
                      : alert.severity === "WARNING"
                      ? "bg-tertiary-fixed/30 border-tertiary"
                      : "bg-secondary-container/20 border-secondary"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined ${resolved ? "text-outline" : alert.severity === "CRITICAL" ? "text-error" : alert.severity === "WARNING" ? "text-tertiary" : "text-secondary"}`}>
                      {ALERT_ICONS[alert.icon] || alert.icon}
                    </span>
                    <div>
                      <p className={`font-label-md ${resolved ? "text-on-surface-variant line-through" : "text-on-surface"}`}>{alert.title}</p>
                      <p className="text-[12px] text-on-surface-variant">{alert.location}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`font-bold text-label-sm ${resolved ? "text-outline" : alert.severity === "CRITICAL" ? "text-error" : alert.severity === "WARNING" ? "text-tertiary" : "text-secondary"}`}>
                      {resolved ? "RESOLVED" : alert.severity}
                    </span>
                    {!resolved && (
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="text-[10px] text-primary hover:underline font-semibold"
                      >
                        Mark resolved
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Intelligence & Early Warning Decision Support */}
        <div className="col-span-12 lg:col-span-3 bg-primary-container text-on-primary-container rounded-xl p-stack_lg shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                <h3 className="font-label-md uppercase tracking-widest opacity-90">AI Early Warnings</h3>
              </div>
            </div>

            {/* Stakeholder Role Selector */}
            <div className="flex bg-black/20 p-1 rounded-lg mb-4 text-[11px]">
              <button
                onClick={() => setStakeholderMode("citizen")}
                className={`flex-1 py-1 rounded font-bold transition-all ${stakeholderMode === "citizen" ? "bg-white text-primary shadow" : "opacity-75 hover:opacity-100"}`}
              >
                Citizen
              </button>
              <button
                onClick={() => setStakeholderMode("community")}
                className={`flex-1 py-1 rounded font-bold transition-all ${stakeholderMode === "community" ? "bg-white text-primary shadow" : "opacity-75 hover:opacity-100"}`}
              >
                Community
              </button>
              <button
                onClick={() => setStakeholderMode("decisionMaker")}
                className={`flex-1 py-1 rounded font-bold transition-all ${stakeholderMode === "decisionMaker" ? "bg-white text-primary shadow" : "opacity-75 hover:opacity-100"}`}
              >
                Authority
              </button>
            </div>

            <div className="space-y-3">
              {currentRecommendations.map((text, i) => (
                <div key={i} className="flex gap-2.5">
                  <span className="material-symbols-outlined text-[18px] mt-0.5">
                    {i === 0 ? "warning" : i === 1 ? "air" : "shield"}
                  </span>
                  <p className="text-body-sm leading-snug">{text}</p>
                </div>
              ))}
            </div>
          </div>
          <button className="w-full mt-6 py-2 bg-on-primary-container text-primary-container rounded-lg font-bold text-label-md hover:opacity-90 transition-opacity">
            Full Decision Protocol
          </button>
        </div>

        {/* Interactive Map */}
        <div className="col-span-12 bg-surface-container-lowest rounded-xl h-[480px] shadow-ambient border border-outline-variant/20 relative overflow-hidden group">
          <div
            className="absolute inset-0 z-0 bg-surface-container bg-cover bg-center transition-transform duration-500"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB9EJRmpcHR1RfyklKV4jKT8i0HuqFKxC64uvkRI4S9flcObPbbF5FoPw0IoSgYM-6-7UE-chH72278WygNtT7Wah0m7I0IKCEarQdhJj5DBUx6cIhtPwUwbkFTq26irAGlrnhMu7g-S27PM4v0EOzqO40nEqBwEwxE8lvhsiFkVJEH3LiwSmWiM_mo31xIWSFkO3RBb7yNCmnz9KfCbt5e44_Q-ZZ7tE26jrOwjV4D0CGg3n4zG00TX8mXTvsGnIWgXqB61O-MXnmz')",
              transform: `scale(${zoom})`,
            }}
          />
          {/* Map Controls */}
          <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
            <div className="bg-surface-container-lowest p-1 rounded-lg shadow-lg border border-outline-variant/20 flex flex-col">
              <button onClick={zoomIn} className="p-2 hover:bg-surface-container rounded transition-colors">
                <span className="material-symbols-outlined">add</span>
              </button>
              <button onClick={zoomOut} className="p-2 hover:bg-surface-container rounded transition-colors border-t border-outline-variant/20">
                <span className="material-symbols-outlined">remove</span>
              </button>
            </div>
            <button className="bg-surface-container-lowest p-2 rounded-lg shadow-lg border border-outline-variant/20 hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined">my_location</span>
            </button>
          </div>
          {/* Layer toggles */}
          <div className="absolute top-6 right-6 z-10 flex gap-2">
            <div className="bg-surface-container-lowest px-4 py-2 rounded-lg shadow-lg border border-outline-variant/20 flex items-center gap-4">
              {Object.keys(activeLayers).map((layer) => (
                <label key={layer} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded text-primary focus:ring-primary w-4 h-4"
                    checked={!!activeLayers[layer]}
                    onChange={() => toggleLayer(layer)}
                  />
                  <span className="text-label-sm">{layer}</span>
                </label>
              ))}
            </div>
          </div>
          {/* Layer count */}
          <div className="absolute top-20 right-6 z-10">
            <span className="bg-surface-container-lowest/90 backdrop-blur px-3 py-1.5 rounded-full shadow-lg text-label-sm text-on-surface-variant">
              {activeLayerCount} layer{activeLayerCount === 1 ? "" : "s"} active
            </span>
          </div>
          {/* Legend */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 bg-surface-container-lowest/90 backdrop-blur px-6 py-3 rounded-full shadow-xl border border-white/50 flex items-center gap-4">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-secondary" /><span className="text-label-sm">Safe Zones</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-tertiary" /><span className="text-label-sm">Monitor</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-error" /><span className="text-label-sm">Hazard</span></div>
          </div>
        </div>

        {/* Air Quality */}
        <div className="col-span-12 md:col-span-4 bg-surface-container-lowest rounded-xl p-stack_lg shadow-ambient border border-outline-variant/20">
          <h3 className="font-headline-sm text-headline-sm mb-6">Air Quality</h3>
          <div className="flex items-center gap-6 mb-6">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle className="text-surface-container" cx="48" cy="48" fill="transparent" r="40" stroke="currentColor" strokeWidth="8" />
                <circle
                  className={aqiStatus.className.split(" ")[0]}
                  cx="48"
                  cy="48"
                  fill="transparent"
                  r="40"
                  stroke="currentColor"
                  strokeDasharray="251.2"
                  strokeDashoffset={gaugeOffset}
                  strokeWidth="8"
                  style={{ transition: "stroke-dashoffset 0.8s ease" }}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className={`text-headline-md font-bold leading-none ${aqiStatus.className.split(" ")[0]}`}>{aqi}</span>
                <span className={`text-[10px] font-bold uppercase ${aqiStatus.className.split(" ")[0]}`}>AQI</span>
              </div>
            </div>
            <div>
              <span className={`px-3 py-1 rounded-full text-label-md font-bold ${aqiStatus.className}`}>{aqiStatus.label}</span>
              <p className="text-body-sm text-on-surface-variant mt-2">
                {aqi <= 50 ? "Optimal conditions for outdoor activities." : aqi <= 100 ? "Acceptable; sensitive groups should be cautious." : "Unhealthy; limit prolonged outdoor exertion."}
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-outline-variant/10">
              <span className="text-body-sm text-on-surface-variant">UV Index</span>
              <span className="font-label-md">4 (Moderate)</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-outline-variant/10">
              <span className="text-body-sm text-on-surface-variant">PM2.5</span>
              <span className="font-label-md">12 µg/m³</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-body-sm text-on-surface-variant">Ozone (O3)</span>
              <span className="font-label-md">31 ppb</span>
            </div>
          </div>
        </div>

        {/* Community Observations */}
        <div className="col-span-12 md:col-span-8 bg-surface-container-lowest rounded-xl p-stack_lg shadow-ambient border border-outline-variant/20">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline-sm text-headline-sm">Community Observations</h3>
            <div className="flex gap-4 items-center">
              <button onClick={openReport} className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-label-md flex items-center gap-1 hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-[18px]">add</span>
                Submit a Report
              </button>
              <button className="text-primary font-label-md flex items-center gap-1 hover:underline">
                View Feed
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
          <div className="space-y-1">
            {reports.map((r, i) => (
              <div key={i} className="flex items-center gap-4 p-3 hover:bg-surface-container transition-colors rounded-lg">
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">{r.icon}</span>
                </div>
                <div className="flex-1">
                  <p className="font-label-md text-on-surface">{r.title}</p>
                  <p className="text-[12px] text-on-surface-variant">
                    {r.meta} • <span className={`font-semibold ${r.statusClass}`}>[{r.status}]</span>
                  </p>
                </div>
                <div className="flex items-center gap-1 text-on-surface-variant bg-surface-container-low px-2 py-1 rounded">
                  <span className="material-symbols-outlined text-[16px]">{r.badge}</span>
                  <span className="text-[12px]">{r.badgeText}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Analytics Section */}
        <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-gutter mt-4 mb-8">
          {/* Temperature Trend */}
          <div className="bg-surface-container-lowest p-stack_lg rounded-xl shadow-sm border border-outline-variant/20 relative">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-label-md text-on-surface-variant">Temperature Trend</h4>
              <span className="text-[12px] font-bold text-primary">+2°F vs Avg</span>
            </div>
            <div className="h-32 flex items-end gap-1 px-2 relative">
              <div className="absolute inset-y-0 right-[28%] border-r-2 border-dashed border-outline-variant/50 z-0">
                <div className="absolute -top-4 right-0 transform translate-x-1/2 bg-surface-container px-1 py-0.5 rounded text-[8px] font-bold uppercase text-outline">Now</div>
              </div>
              {tempChart.map((d, i) => {
                const isToday = i === 3;
                return (
                  <div key={d.day} className="flex-1 flex flex-col justify-end items-center relative">
                    {isToday && (
                      <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-primary text-on-primary px-1.5 py-0.5 rounded-full text-[10px] font-bold z-10">{d.temp}°</div>
                    )}
                    <div className={`w-full rounded-t transition-colors ${isToday ? "bg-primary" : "bg-primary/20 hover:bg-primary/40"} ${isToday ? "h-[95%]" : ""}`} style={!isToday ? { height: `${d.h}%` } : undefined} />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-outline px-2 relative z-10">
              {tempChart.map((d) => (
                <span key={d.day}>{d.day}</span>
              ))}
            </div>
          </div>

          {/* AQI History */}
          <div className="bg-surface-container-lowest p-stack_lg rounded-xl shadow-sm border border-outline-variant/20 relative">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-label-md text-on-surface-variant">AQI History</h4>
              <span className="text-[12px] font-bold text-secondary">Healthy</span>
            </div>
            <div className="absolute inset-x-0 bottom-6 top-16 flex flex-col pointer-events-none rounded-lg overflow-hidden mx-6 opacity-30">
              <div className="flex-1 bg-orange-100" />
              <div className="flex-1 bg-yellow-100" />
              <div className="flex-1 bg-green-100" />
            </div>
            <div className="flex h-32">
              <div className="flex flex-col justify-between text-[10px] text-outline pr-2 py-1 text-right w-6 z-10">
                <span>150</span><span>100</span><span>50</span><span>0</span>
              </div>
              <div className="flex-1 flex items-center justify-center relative z-10">
                <svg className="w-full h-full text-secondary" preserveAspectRatio="none" viewBox="0 0 200 60">
                  <path d="M0,45 Q25,30 50,45 T100,20 T150,40 T200,35" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="3" />
                  <circle cx="100" cy="20" fill="currentColor" r="4" />
                </svg>
              </div>
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-outline pl-8">
              <span>12am</span><span>6am</span><span>12pm</span><span>6pm</span>
            </div>
          </div>

          {/* Weekly Rainfall */}
          <div className="bg-surface-container-lowest p-stack_lg rounded-xl shadow-sm border border-outline-variant/20 relative">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-label-md text-on-surface-variant">Weekly Rainfall</h4>
              <span className="text-[12px] font-bold text-on-surface-variant">1.4 in total</span>
            </div>
            <div className="absolute left-6 right-6 top-[55%] border-t-2 border-dotted border-outline-variant/60 z-0 flex items-center">
              <span className="absolute right-0 -mt-4 text-[8px] text-outline bg-surface-container-lowest px-1">Avg</span>
            </div>
            <div className="flex h-32">
              <div className="flex flex-col justify-between text-[10px] text-outline pr-2 py-1 text-right w-6 z-10">
                <span>20mm</span><span>10mm</span><span>0mm</span>
              </div>
              <div className="flex-1 flex items-end justify-between px-2 relative z-10">
                {rainfall.map((h, i) => (
                  <div key={i} className={`w-4 rounded-t relative ${i === 4 ? "bg-primary" : "bg-surface-container"}`} style={{ height: `${h}%` }}>
                    {i === 4 && <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold">18</span>}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-outline pl-8">
              <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
            </div>
          </div>
        </div>
      </div>

      {/* Location Change Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsLocationModalOpen(false)} />
          <div className="relative bg-surface-container-lowest rounded-2xl p-stack_lg w-full max-w-md shadow-modal border border-outline-variant/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Select Location</h3>
              <button onClick={() => setIsLocationModalOpen(false)} className="p-2 hover:bg-surface-container rounded-full transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>
            <p className="text-body-sm text-on-surface-variant mb-4">
              Switch location to aggregate regional weather, air quality, disaster alerts, and satellite feeds.
            </p>
            <div className="space-y-2 mb-4">
              {POPULAR_LOCATIONS.map((loc) => (
                <button
                  key={loc.name}
                  onClick={() => {
                    changeLocation(loc.name, loc.lat, loc.lon);
                    setIsLocationModalOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left border ${
                    currentLocation === loc.name ? "bg-primary/10 border-primary font-bold text-primary" : "hover:bg-surface-container border-outline-variant/20 text-on-surface"
                  }`}
                >
                  <span className="font-label-md">{loc.name}</span>
                  {currentLocation === loc.name && <span className="material-symbols-outlined text-[18px]">check</span>}
                </button>
              ))}
            </div>
            <form onSubmit={handleLocationSubmit} className="flex gap-2">
              <input
                type="text"
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                placeholder="Or enter custom location..."
                className="flex-1 bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-sm outline-none text-on-surface"
              />
              <button type="submit" className="px-4 py-2 bg-primary text-on-primary rounded-lg font-bold text-label-md">
                Set
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Report Issue Modal */}
      {isReportOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeReport} />
          <div className="relative bg-surface-container-lowest rounded-2xl p-stack_lg w-full max-w-md shadow-modal border border-outline-variant/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Report an Issue</h3>
              <button onClick={closeReport} className="p-2 hover:bg-surface-container rounded-full transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant">close</span>
              </button>
            </div>
            <div className="space-y-2 mb-4">
              {REPORT_TYPES.map((t) => (
                <button key={t.label} onClick={closeReport} className="w-full flex items-center gap-3 p-3 hover:bg-surface-container rounded-lg transition-colors text-left border border-outline-variant/20">
                  <span className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">{t.icon}</span>
                  </span>
                  <span className="font-label-md text-on-surface">{t.label}</span>
                </button>
              ))}
            </div>
            <button onClick={closeReport} className="w-full py-2.5 bg-primary text-on-primary rounded-lg font-bold text-label-md active:scale-95 transition-transform">
              Submit Report
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
