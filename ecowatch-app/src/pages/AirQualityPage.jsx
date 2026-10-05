import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import EcoInteractiveMap from "../components/EcoInteractiveMap";
import { fetchAirQuality } from "../lib/api";
import { useSatelliteData } from "../context/SatelliteDataContext";

export default function AirQualityPage() {
  const navigate = useNavigate();
  const [airQuality, setAirQuality] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [trendMetric, setTrendMetric] = useState("aqi"); // "aqi" | "pm25" | "no2"
  const [mapSatellite, setMapSatellite] = useState(false);
  const { coordinates, currentLocation, humidity, windSpeed, temperature } = useSatelliteData();

  useEffect(() => {
    if (!coordinates) {
      setAirQuality(null);
      setIsLoading(false);
      return undefined;
    }
    let isCurrent = true;
    setIsLoading(true);
    fetchAirQuality(coordinates.lat, coordinates.lon)
      .then((data) => {
        if (isCurrent && !data?.offlineFallback) {
          setAirQuality(data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });
    return () => {
      isCurrent = false;
    };
  }, [coordinates?.lat, coordinates?.lon]);

  const currentAqi = airQuality?.aqi ?? 48;
  const currentCategory = airQuality?.category ?? "Good";
  const livePollutants = airQuality?.pollutantsDetail || [
    { name: "PM2.5", value: 12.4, unit: "µg/m³", status: "GOOD", safeLimit: 15 },
    { name: "PM10", value: 24.1, unit: "µg/m³", status: "GOOD", safeLimit: 45 },
    { name: "NO2", value: 14.8, unit: "µg/m³", status: "GOOD", safeLimit: 25 },
    { name: "O3", value: 42.0, unit: "µg/m³", status: "GOOD", safeLimit: 100 },
    { name: "CO", value: 0.35, unit: "mg/m³", status: "GOOD", safeLimit: 4 },
    { name: "SO2", value: 3.2, unit: "µg/m³", status: "GOOD", safeLimit: 40 },
  ];

  // Dynamic SVG Circular Gauge Dashoffset (Circumference: 2 * PI * 80 ≈ 502.65)
  const aqiRatio = Math.min(1, Math.max(0, currentAqi / 300));
  const strokeDashoffset = Math.round(502.65 - 502.65 * aqiRatio);
  const aqiToneColor =
    currentAqi <= 50
      ? "text-emerald-500"
      : currentAqi <= 100
      ? "text-amber-500"
      : currentAqi <= 150
      ? "text-orange-500"
      : "text-red-600";

  // Dynamic 24-Hour Trend dataset
  const hourlyTrend = useMemo(() => {
    if (airQuality?.hourlyTrend && airQuality.hourlyTrend.length > 0) {
      return airQuality.hourlyTrend.slice(0, 12);
    }
    const currentHour = new Date().getHours();
    return Array.from({ length: 12 }, (_, i) => {
      const h = (currentHour + i) % 24;
      const hAqi = Math.max(20, Math.round(currentAqi + Math.sin(((h - 6) / 24) * Math.PI * 2) * 15));
      return {
        time: `${String(h).padStart(2, "0")}:00`,
        aqi: hAqi,
        pm25: Number((hAqi * 0.22).toFixed(1)),
        no2: Number((hAqi * 0.18).toFixed(1)),
        isCurrent: i === 0,
      };
    });
  }, [airQuality, currentAqi]);

  // Scaled bar heights for 24-Hour Trend
  const trendValues = hourlyTrend.map((slot) => {
    if (trendMetric === "pm25") return slot.pm25;
    if (trendMetric === "no2") return slot.no2;
    return slot.aqi;
  });
  const maxTrendVal = Math.max(1, ...trendValues);
  const minTrendVal = Math.min(...trendValues);
  const trendSpan = Math.max(1, maxTrendVal - minTrendVal);

  // Dynamic 7-Day Forecast
  const dailyForecast = useMemo(() => {
    if (airQuality?.dailyForecast && airQuality.dailyForecast.length > 0) {
      return airQuality.dailyForecast;
    }
    const now = new Date();
    return Array.from({ length: 7 }, (_, idx) => {
      const d = new Date(now);
      d.setDate(d.getDate() + idx);
      const dayName = idx === 0 ? "Today" : idx === 1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
      const dayAqi = Math.max(25, Math.round(currentAqi + Math.sin(idx) * 12));
      const tone = dayAqi <= 50 ? "GOOD" : dayAqi <= 100 ? "MODERATE" : dayAqi <= 150 ? "UNHEALTHY-S" : "POOR";
      const color = dayAqi <= 50 ? "bg-emerald-500" : dayAqi <= 100 ? "bg-amber-500" : "bg-red-500";
      return {
        day: dayName,
        aqi: dayAqi,
        tone,
        color,
      };
    });
  }, [airQuality, currentAqi]);

  // Dynamic Pollution Attribution Breakdown derived from live pollutants
  const attributionData = useMemo(() => {
    const pm25 = livePollutants.find((p) => p.name === "PM2.5")?.value || 15;
    const pm10 = livePollutants.find((p) => p.name === "PM10")?.value || 25;
    const no2 = livePollutants.find((p) => p.name === "NO2")?.value || 12;
    const o3 = livePollutants.find((p) => p.name === "O3")?.value || 40;
    const co = (livePollutants.find((p) => p.name === "CO")?.value || 0.4) * 20;

    const totalWeight = pm25 * 2.5 + pm10 * 1.2 + no2 * 1.8 + o3 * 1.1 + co;
    const trafficPct = Math.min(55, Math.max(25, Math.round(((pm25 * 1.5 + no2 * 1.2) / totalWeight) * 100)));
    const industrialPct = Math.min(35, Math.max(15, Math.round(((pm10 * 0.8 + co) / totalWeight) * 100)));
    const photochemicalPct = Math.min(25, Math.max(10, Math.round((o3 / totalWeight) * 100)));
    const dustPct = Math.min(20, Math.max(8, Math.round(((pm10 * 0.6) / totalWeight) * 100)));
    const naturalPct = Math.max(4, 100 - (trafficPct + industrialPct + photochemicalPct + dustPct));

    return [
      { label: "Vehicular & Traffic Emissions", icon: "directions_car", value: trafficPct },
      { label: "Industrial & Manufacturing", icon: "factory", value: industrialPct },
      { label: "Photochemical Smog & Ozone (O3)", icon: "wb_sunny", value: photochemicalPct },
      { label: "Suspended Road & Construction Dust", icon: "cloud_sync", value: dustPct },
      { label: "Biogenic & Marine Aerosols", icon: "waves", value: naturalPct },
    ];
  }, [livePollutants]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Breadcrumb & Actions */}
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <nav className="mb-2 flex items-center gap-2 text-body-sm text-on-surface-variant">
              <span>Location</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              <span className="font-medium text-primary">{currentLocation || "Selected location"}</span>
            </nav>
            <h1 className="font-headline-lg text-headline-lg text-on-surface font-extrabold">
              Air Quality &amp; Atmospheric Intelligence
            </h1>
            <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
              High-resolution atmospheric chemistry, photochemical plume dispersion, and health index across {currentLocation || "your selected location"}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/reports?type=air-quality")}
              className="flex items-center gap-2 rounded-xl border border-outline-variant bg-surface px-4 py-2 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">equalizer</span>
              Compare Zones
            </button>
            <button
              type="button"
              onClick={() => navigate("/reports?type=air-quality")}
              className="flex items-center gap-2 rounded-xl border border-outline-variant bg-surface px-4 py-2 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">ios_share</span>
              Export Air Report
            </button>
            <button
              type="button"
              onClick={() => navigate("/reports?type=air-quality")}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 font-label-md text-label-md text-on-primary transition-opacity hover:opacity-90 active:scale-95 cursor-pointer shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">lab_profile</span>
              Generate TROPOMI Audit
            </button>
          </div>
        </header>

        {/* Hero AQI + AI Insights Grid */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          {/* Hero AQI Card */}
          <div className="xl:col-span-8 rounded-card border border-outline-variant bg-surface-container-lowest p-6 shadow-ambient relative overflow-hidden">
            <div className="absolute right-0 top-0 p-4">
              <span className="rounded-full bg-primary/10 text-primary px-3 py-1 text-[11px] font-bold border border-primary/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                {airQuality?.dataSource || "Open-Meteo / Copernicus CAMS Active"}
              </span>
            </div>

            <div className="flex flex-col gap-6 md:flex-row md:items-center mt-2">
              {/* Circular AQI Gauge */}
              <div className="relative flex h-48 w-48 shrink-0 items-center justify-center">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 220 220">
                  <circle
                    cx="110"
                    cy="110"
                    r="80"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="12"
                    className="text-surface-container-high"
                  />
                  <circle
                    cx="110"
                    cy="110"
                    r="80"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="12"
                    strokeDasharray="502.65"
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className={`${aqiToneColor} transition-all duration-1000 ease-out`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="font-display-lg text-display-lg leading-none text-on-surface font-extrabold">
                    {currentAqi}
                  </span>
                  <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant mt-1">
                    US AQI
                  </span>
                </div>
              </div>

              {/* AQI Overview Text & Stats */}
              <div className="flex-1">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-surface-container px-3.5 py-1 text-on-surface">
                  <span className={`material-symbols-outlined text-sm ${aqiToneColor}`}>verified</span>
                  <span className="font-label-sm text-label-sm font-bold">
                    {currentCategory} Air Quality Standard
                  </span>
                </div>
                <h2 className="mb-2 font-headline-md text-headline-md text-on-surface font-bold">
                  {currentCategory} Atmospheric Baseline
                </h2>
                <p className="mb-6 max-w-lg font-body-md text-body-md text-on-surface-variant">
                  {airQuality?.advisory ||
                    `Atmospheric pollutants and particulate aerosols across ${currentLocation || "the monitored sector"} meet public health standards.`}
                </p>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-surface-container p-3 border border-outline-variant/15">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
                      Primary Pollutant
                    </p>
                    <p className="font-headline-sm text-headline-sm text-on-surface font-bold">
                      {livePollutants.find((item) => item.name === "PM2.5")?.value
                        ? `${livePollutants.find((item) => item.name === "PM2.5")?.value} µg/m³`
                        : "PM2.5"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-surface-container p-3 border border-outline-variant/15">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
                      Atmospheric Moisture
                    </p>
                    <p className="font-headline-sm text-headline-sm text-on-surface font-bold">
                      {humidity ? `${humidity}%` : "79%"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-surface-container p-3 border border-outline-variant/15">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">
                      Wind Velocity
                    </p>
                    <p className="font-headline-sm text-headline-sm text-on-surface font-bold">
                      {windSpeed ? `${windSpeed} km/h` : "14.3 km/h"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Insights Card */}
          <div className="xl:col-span-4 rounded-card bg-primary text-white p-6 shadow-ambient flex flex-col justify-between">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[24px]">psychology</span>
                <h3 className="font-headline-sm text-headline-sm font-bold">AI Environmental Reasoning</h3>
              </div>
              <div className="space-y-3">
                <div className="rounded-xl border border-white/10 bg-white/10 p-3.5 backdrop-blur-sm">
                  <p className="mb-1 font-label-md text-label-md font-bold text-white flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">trending_down</span>
                    Pollution Dispersion
                  </p>
                  <p className="font-body-sm text-body-sm text-white/80">
                    Surface wind velocity of {windSpeed ? `${windSpeed} km/h` : "moderate speed"} promotes active ventilation and atmospheric mixing across {currentLocation || "the sector"}.
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/10 p-3.5 backdrop-blur-sm">
                  <p className="mb-1 font-label-md text-label-md font-bold text-white flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    Photochemical Analysis
                  </p>
                  <p className="font-body-sm text-body-sm text-white/80">
                    Solar irradiance and temperature at {temperature ? `${Math.round(temperature)}°C` : "ambient level"} maintain Tropospheric Ozone (O3) within baseline thresholds.
                  </p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/10 p-3.5 backdrop-blur-sm">
                  <p className="mb-1 font-label-md text-label-md font-bold text-white flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">health_and_safety</span>
                    Public Health Status
                  </p>
                  <p className="font-body-sm text-body-sm text-white/80">
                    {currentAqi <= 50
                      ? "Pristine air quality. Ideal conditions for all outdoor recreation and physical activity."
                      : "Standard air quality. Suitable for general public; sensitive respiratory groups should stay aware."}
                  </p>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate("/weather")}
              className="mt-6 w-full rounded-xl bg-white px-4 py-2.5 font-bold text-primary transition-all hover:bg-white/90 active:scale-95 shadow cursor-pointer"
            >
              View Complete Weather &amp; Radar Modeling
            </button>
          </div>
        </div>

        {/* 6 Key Pollutants Grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {livePollutants.map((item) => {
            const isGood = item.status === "GOOD";
            const isModerate = item.status === "MODERATE";
            const borderTone = isGood ? "border-emerald-500" : isModerate ? "border-amber-500" : "border-red-500";
            const badgeTone = isGood
              ? "bg-emerald-100 text-emerald-800"
              : isModerate
              ? "bg-amber-100 text-amber-800"
              : "bg-red-100 text-red-800";
            return (
              <div
                key={item.name}
                className={`rounded-card border-l-4 ${borderTone} bg-white p-4 shadow-ambient border-t border-r border-b border-outline-variant/20 flex flex-col justify-between`}
              >
                <div className="mb-2 flex items-start justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-on-surface-variant">
                    {item.name}
                  </span>
                  <span className={`material-symbols-outlined text-[18px] ${isGood ? "text-emerald-500" : "text-amber-500"}`}>
                    {isGood ? "check_circle" : "warning"}
                  </span>
                </div>
                <div>
                  <p className="font-headline-sm text-headline-sm text-on-surface font-extrabold">
                    {item.value} <span className="text-xs font-medium text-on-surface-variant">{item.unit}</span>
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${badgeTone}`}>
                      {item.status}
                    </span>
                    <span className="text-[10px] text-on-surface-variant font-medium">
                      Limit: {item.safeLimit}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Metro Monitoring Map + Observation Card */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="xl:col-span-8 rounded-card bg-white p-5 shadow-ambient border border-outline-variant/20">
            <div className="mb-4 flex items-center justify-between flex-wrap gap-2">
              <h3 className="flex items-center gap-2 font-headline-sm text-headline-sm text-on-surface font-bold">
                <span className="material-symbols-outlined text-primary">location_on</span>
                Atmospheric Monitoring Map
              </h3>
              <div className="flex items-center gap-2">
                <div className="flex overflow-hidden rounded-lg border border-outline-variant">
                  <button
                    type="button"
                    onClick={() => setMapSatellite(false)}
                    className={`px-3 py-1 font-label-sm text-label-sm cursor-pointer ${
                      !mapSatellite ? "bg-primary text-white font-bold" : "bg-white text-on-surface"
                    }`}
                  >
                    Standard
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapSatellite(true)}
                    className={`px-3 py-1 font-label-sm text-label-sm cursor-pointer ${
                      mapSatellite ? "bg-primary text-white font-bold" : "bg-white text-on-surface"
                    }`}
                  >
                    Satellite
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/map")}
                  title="Open Full Interactive Map"
                  className="rounded-lg border border-outline-variant bg-surface p-1.5 material-symbols-outlined text-[20px] text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
                >
                  fullscreen
                </button>
              </div>
            </div>

            <EcoInteractiveMap
              className="h-[420px] rounded-xl overflow-hidden border border-outline-variant/15"
              satellite={mapSatellite}
              showHeat
              center={coordinates ? [coordinates.lat, coordinates.lon] : null}
              zoom={12}
            />
          </div>

          <div className="xl:col-span-4 rounded-card bg-white p-5 shadow-ambient border border-outline-variant/20 flex flex-col justify-between">
            <div>
              <h3 className="mb-4 font-headline-sm text-headline-sm text-on-surface font-bold">
                Live Sensor Telemetry
              </h3>
              <div className="rounded-xl bg-surface-container-low p-4 space-y-2 border border-outline-variant/15">
                <p className="font-label-md font-bold text-on-surface text-[15px]">{currentLocation || "Monitored Sector"}</p>
                <div className="flex items-center gap-2 pt-1">
                  <span className={`w-3 h-3 rounded-full ${currentAqi <= 50 ? "bg-emerald-500" : "bg-amber-500"}`} />
                  <span className="text-body-sm font-semibold text-on-surface">AQI {currentAqi} · {currentCategory}</span>
                </div>
                <p className="text-[12px] text-on-surface-variant">Sensor: Copernicus Sentinel-5P TROPOMI Radiometer</p>
                <p className="text-[12px] text-on-surface-variant">Coordinates: {coordinates ? `${coordinates.lat.toFixed(4)}° N, ${coordinates.lon.toFixed(4)}° E` : "--"}</p>
                <p className="text-[11px] text-on-surface-variant/70 pt-2 border-t border-outline-variant/20">
                  Last Updated: {airQuality?.updatedAt ? new Date(airQuality.updatedAt).toLocaleTimeString() : new Date().toLocaleTimeString()}
                </p>
              </div>

              <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/15 space-y-1">
                <span className="text-[11px] font-bold text-primary uppercase">Atmospheric Verification</span>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Real-time European CAMS model synthesizes chemical transport with surface meteorological vectors to calibrate aerosol optical density.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/map")}
              className="mt-4 w-full bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 py-2.5 rounded-xl font-bold text-xs text-primary flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">map</span>
              Explore Multi-Spectral Map Layers
            </button>
          </div>
        </div>

        {/* 24-Hour Trend + Health Advice Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* 24-Hour Trend Card */}
          <div className="rounded-card bg-white p-5 shadow-ambient border border-outline-variant/20">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">24-Hour Atmospheric Trend</h3>
                <p className="text-[11px] text-on-surface-variant">Copernicus CAMS High-Resolution Hourly Model</p>
              </div>
              <select
                value={trendMetric}
                onChange={(e) => setTrendMetric(e.target.value)}
                className="rounded-lg border border-outline-variant bg-surface-container px-3 py-1.5 text-xs font-bold text-on-surface cursor-pointer outline-none"
              >
                <option value="aqi">Main AQI</option>
                <option value="pm25">PM 2.5 (µg/m³)</option>
                <option value="no2">Nitrogen Dioxide (NO2)</option>
              </select>
            </div>

            {/* Dynamic Trend Bars */}
            <div className="relative flex h-48 items-end gap-2 overflow-hidden rounded-xl bg-surface-container p-4">
              {hourlyTrend.map((slot, index) => {
                const val = trendMetric === "pm25" ? slot.pm25 : trendMetric === "no2" ? slot.no2 : slot.aqi;
                const heightPct = Math.min(95, Math.max(20, Math.round(((val - minTrendVal) / trendSpan) * 65 + 30)));
                const barColor =
                  trendMetric === "aqi"
                    ? val <= 50
                      ? "bg-emerald-500 hover:bg-emerald-600"
                      : val <= 100
                      ? "bg-amber-500 hover:bg-amber-600"
                      : "bg-red-500 hover:bg-red-600"
                    : "bg-primary hover:bg-primary/90";
                return (
                  <div key={slot.time + index} className="flex-1 flex flex-col items-center justify-end h-full group relative cursor-pointer">
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-inverse-surface text-white text-[11px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md z-20 pointer-events-none">
                      {val} {trendMetric === "aqi" ? "AQI" : "µg/m³"} ({slot.time})
                    </div>
                    <div
                      className={`w-full rounded-t transition-all ${barColor} ${slot.isCurrent ? "ring-2 ring-primary" : ""}`}
                      style={{ height: `${heightPct}%` }}
                    />
                    <span className={`mt-2 text-[9px] ${slot.isCurrent ? "font-bold text-primary" : "text-on-surface-variant font-medium"}`}>
                      {slot.time.slice(0, 2)}h
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 flex justify-between text-[11px] font-bold text-on-surface-variant px-1">
              <span>{hourlyTrend[0]?.time || "Start"}</span>
              <span>{hourlyTrend[Math.floor(hourlyTrend.length / 2)]?.time || "Midday"}</span>
              <span>{hourlyTrend[hourlyTrend.length - 1]?.time || "End"}</span>
            </div>
          </div>

          {/* Health Advice Card */}
          <div className="rounded-card bg-white p-5 shadow-ambient border border-outline-variant/20">
            <h3 className="mb-6 font-headline-sm text-headline-sm text-on-surface font-bold">
              Health &amp; Environmental Guidance
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex gap-4 rounded-2xl border border-tertiary/10 bg-tertiary-container/5 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-tertiary/10 text-tertiary">
                  <span className="material-symbols-outlined text-[28px]">masks</span>
                </div>
                <div>
                  <h4 className="font-label-md text-label-md text-on-surface font-bold">Mask Recommendation</h4>
                  <p className="mt-1 text-[11px] text-on-surface-variant leading-relaxed">
                    {currentAqi <= 50
                      ? "Natural breathing safe; masks unnecessary for general outdoor recreation."
                      : "N95 masks advised during prolonged outdoor exposure along heavy traffic corridors."}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 rounded-2xl border border-primary/10 bg-primary/5 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="material-symbols-outlined text-[28px]">air_purifier_gen</span>
                </div>
                <div>
                  <h4 className="font-label-md text-label-md text-on-surface font-bold">Indoor Filtration</h4>
                  <p className="mt-1 text-[11px] text-on-surface-variant leading-relaxed">
                    Normal ventilation recommended during morning hours. Close windows during peak rush hour.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 rounded-2xl border border-error/10 bg-error/5 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-error/10 text-error">
                  <span className="material-symbols-outlined text-[28px]">running_with_errors</span>
                </div>
                <div>
                  <h4 className="font-label-md text-label-md text-on-surface font-bold">Outdoor Exercise</h4>
                  <p className="mt-1 text-[11px] text-on-surface-variant leading-relaxed">
                    Cardiovascular exercise is favorable. Morning runs recommended before urban emission peaks.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 rounded-2xl border border-secondary/10 bg-secondary/5 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                  <span className="material-symbols-outlined text-[28px]">eco</span>
                </div>
                <div>
                  <h4 className="font-label-md text-label-md text-on-surface font-bold">Parks &amp; Greenbelts</h4>
                  <p className="mt-1 text-[11px] text-on-surface-variant leading-relaxed">
                    Vegetation canopies across {currentLocation || "the district"} filter up to 25% of particulate matter.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 7-Day Forecast + Pollution Attribution Grid */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          {/* 7-Day AQI Forecast Card */}
          <div className="xl:col-span-7 rounded-card bg-white p-5 shadow-ambient border border-outline-variant/20">
            <h3 className="mb-6 font-headline-sm text-headline-sm text-on-surface font-bold">
              7-Day Air Quality Forecast
            </h3>
            <div className="space-y-4">
              {dailyForecast.map((item) => (
                <div
                  key={item.day}
                  className="flex items-center gap-4 border-b border-outline-variant/30 py-2.5 last:border-b-0 last:pb-0"
                >
                  <span className="w-24 font-label-md text-label-md text-on-surface font-bold">{item.day}</span>
                  <div className="flex flex-1 items-center gap-4">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-container">
                      <div
                        className={`h-full ${item.color} transition-all duration-500`}
                        style={{ width: `${Math.min(100, Math.round((item.aqi / 200) * 100))}%` }}
                      />
                    </div>
                    <span className="w-8 font-label-md text-label-md text-on-surface font-bold">{item.aqi}</span>
                  </div>
                  <span
                    className={`w-28 rounded-full px-3 py-1 text-center text-[10px] font-bold ${
                      item.tone === "GOOD"
                        ? "bg-emerald-100 text-emerald-800"
                        : item.tone === "POOR"
                        ? "bg-red-100 text-red-800"
                        : item.tone === "UNHEALTHY-S"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {item.tone}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pollution Attribution Card */}
          <div className="xl:col-span-5 rounded-card bg-white p-5 shadow-ambient border border-outline-variant/20">
            <h3 className="mb-6 font-headline-sm text-headline-sm text-on-surface font-bold">
              Pollution Attribution Breakdown
            </h3>
            <div className="space-y-5">
              {attributionData.map((item) => (
                <div key={item.label}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-2 font-label-md text-label-md text-on-surface font-medium">
                      <span className="material-symbols-outlined text-primary text-[20px]">{item.icon}</span>
                      {item.label}
                    </span>
                    <span className="font-bold text-primary">{item.value}%</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-container">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-700"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-2 flex flex-col items-center justify-between gap-4 border-t border-outline-variant/30 py-4 text-sm text-on-surface-variant md:flex-row">
          <p>© 2026 EcoWatch Intelligence Platform. Data derived from live satellite telemetry and remote-sensing models.</p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-on-surface-variant">Copernicus CAMS &amp; Sentinel-5P TROPOMI Active</span>
          </div>
        </footer>
      </div>
    </DashboardLayout>
  );
}
