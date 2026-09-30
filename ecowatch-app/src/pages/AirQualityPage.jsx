import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import EcoInteractiveMap from "../components/EcoInteractiveMap";
import { fetchAirQuality } from "../lib/api";
import { useSatelliteData } from "../context/SatelliteDataContext";

export default function AirQualityPage() {
  const navigate = useNavigate();
  const [airQuality, setAirQuality] = useState(null);
  const { coordinates, currentLocation } = useSatelliteData();

  useEffect(() => {
    let isCurrent = true;
    fetchAirQuality(coordinates.lat, coordinates.lon).then((data) => {
      if (isCurrent && !data?.offlineFallback) setAirQuality(data);
    }).catch(() => {});
    return () => { isCurrent = false; };
  }, [coordinates.lat, coordinates.lon]);

  const currentAqi = airQuality?.aqi ?? "--";
  const currentCategory = airQuality?.category ?? "Unavailable";
  const livePollutants = airQuality?.pollutantsDetail || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <nav className="mb-2 flex items-center gap-2 text-body-sm text-on-surface-variant">
              <span>Regions</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              <span>India</span>
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              <span className="font-medium text-primary">Chennai</span>
            </nav>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Air Quality Intelligence</h1>
            <p className="mt-1 font-body-md text-body-md text-on-surface-variant">
              Real-time monitoring of pollution, health risk, and atmospheric conditions across Chennai Metro.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => navigate("/reports?type=air-quality")} className="flex items-center gap-2 rounded-xl border border-outline-variant bg-surface px-4 py-2 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container">
              <span className="material-symbols-outlined text-[20px]">equalizer</span>
              Compare Zones
            </button>
            <button
              onClick={() => navigate("/reports?type=air-quality")}
              className="flex items-center gap-2 rounded-xl border border-outline-variant bg-surface px-4 py-2 font-label-md text-label-md text-on-surface transition-colors hover:bg-surface-container active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">ios_share</span>
              Export Air Report
            </button>
            <button
              onClick={() => navigate("/reports?type=air-quality")}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 font-label-md text-label-md text-on-primary transition-opacity hover:opacity-90 active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">lab_profile</span>
              Generate TROPOMI Audit
            </button>

          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="xl:col-span-8 rounded-card border border-outline-variant bg-surface-container-lowest p-6 shadow-ambient relative overflow-hidden">
            <div className="absolute right-0 top-0 p-4">
              <a className="rounded-full bg-tertiary-fixed px-3 py-1 text-[10px] font-bold text-on-tertiary-fixed" href="https://open-meteo.com/en/docs/air-quality-api" target="_blank" rel="noreferrer">
                {airQuality?.dataSource || "Waiting for data"}
              </a>
            </div>

            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <div className="relative flex h-48 w-48 shrink-0 items-center justify-center">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 220 220">
                  <circle cx="110" cy="110" r="80" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-surface-container-high" />
                  <circle
                    cx="110"
                    cy="110"
                    r="80"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="12"
                    strokeDasharray="502.6"
                    strokeDashoffset="251"
                    className="text-tertiary-fixed-dim"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="font-display-lg text-display-lg leading-none text-on-surface">{currentAqi}</span>
                  <span className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant">AQI</span>
                </div>
              </div>

              <div className="flex-1">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-tertiary-container/10 px-4 py-1 text-tertiary">
                  <span className="material-symbols-outlined text-sm">warning</span>
                  <span className="font-label-sm text-label-sm">{currentCategory}{airQuality ? " Risk" : ""}</span>
                </div>
                <h2 className="mb-2 font-headline-md text-headline-md text-on-surface">{airQuality ? `${currentCategory} Air Quality` : "Air quality data unavailable"}</h2>
                <p className="mb-6 max-w-lg font-body-md text-body-md text-on-surface-variant">
                  {airQuality?.advisory || "No current provider reading is available for this location."}
                </p>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-surface-container p-3">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">Primary Pollutant</p>
                    <p className="font-headline-sm text-headline-sm text-on-surface">{livePollutants.find((item) => item.name === "PM2.5")?.value ?? "--"}</p>
                  </div>
                  <div className="rounded-xl bg-surface-container p-3">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">Humidity</p>
                    <p className="font-headline-sm text-headline-sm text-on-surface">{currentLocation}</p>
                  </div>
                  <div className="rounded-xl bg-surface-container p-3">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">Wind Speed</p>
                    <p className="font-headline-sm text-headline-sm text-on-surface">{airQuality?.coordinates ? `${airQuality.coordinates.lat.toFixed(2)}, ${airQuality.coordinates.lon.toFixed(2)}` : "--"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="xl:col-span-4 rounded-card bg-primary-container p-6 text-white shadow-ambient">
            <div className="mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">psychology</span>
              <h3 className="font-headline-sm text-headline-sm">AI Insights</h3>
            </div>
            <div className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur-sm">
                <p className="mb-1 font-label-md text-label-md">Pollution Trend</p>
                <p className="font-body-sm text-body-sm text-white/80">AQI expected to improve after 8 PM as sea breeze intensifies from the East.</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur-sm">
                <p className="mb-1 font-label-md text-label-md">Atmospheric Logic</p>
                <p className="font-body-sm text-body-sm text-white/80">Offshore winds likely to reduce PM2.5 concentrations in coastal zones by 15% tonight.</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/10 p-3 backdrop-blur-sm">
                <p className="mb-1 font-label-md text-label-md">Health Alert</p>
                <p className="font-body-sm text-body-sm text-white/80">Ozone (O3) peaking near Anna Salai due to high solar radiation and traffic volume.</p>
              </div>
            </div>
            <button className="mt-6 w-full rounded-xl bg-white px-4 py-2 font-bold text-primary transition-all hover:bg-opacity-90">View Full Forecast</button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {livePollutants.length ? livePollutants.map((item) => (
            <div key={item.name} className="rounded-card border-l-4 border-outline-variant bg-white p-4 shadow-ambient">
              <div className="mb-2 flex items-start justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">{item.name}</span>
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">trending_up</span>
              </div>
              <p className="font-headline-sm text-headline-sm text-on-surface">{item.value}</p>
              <p className="mt-1 text-[10px] font-bold uppercase text-on-surface-variant">{item.status}</p>
            </div>
          )) : <p className="col-span-full py-6 text-center text-body-sm text-on-surface-variant">Current pollutant readings are not available.</p>}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="xl:col-span-8 rounded-card bg-white p-5 shadow-ambient">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-headline-sm text-headline-sm text-on-surface">
                <span className="material-symbols-outlined text-primary">location_on</span>
                Metro Monitoring Map
              </h3>
              <div className="flex items-center gap-2">
                <div className="flex overflow-hidden rounded-lg border border-outline-variant">
                  <button className="bg-surface-container px-3 py-1 font-label-sm text-label-sm text-on-surface">Standard</button>
                  <button className="bg-white px-3 py-1 font-label-sm text-label-sm text-on-surface-variant">Satellite</button>
                </div>
                <button className="rounded-lg border border-outline-variant bg-surface p-2 material-symbols-outlined text-[20px] text-on-surface-variant">fullscreen</button>
              </div>
            </div>

            <EcoInteractiveMap className="h-[420px] rounded-xl" showHeat center={[coordinates.lat, coordinates.lon]} zoom={11} />
          </div>

          <div className="xl:col-span-4 rounded-card bg-white p-5 shadow-ambient">
            <h3 className="mb-4 font-headline-sm text-headline-sm text-on-surface">Current Observation</h3>
            <div className="rounded-xl bg-surface p-4">
              <p className="font-label-md text-on-surface">{currentLocation}</p>
              <p className="mt-2 text-body-sm text-on-surface-variant">AQI {currentAqi} · {currentCategory}</p>
              <p className="mt-1 text-[11px] text-on-surface-variant">{airQuality?.dataSource || "No provider data"}</p>
              <p className="mt-1 text-[11px] text-on-surface-variant">Updated {airQuality?.updatedAt ? new Date(airQuality.updatedAt).toLocaleTimeString() : "--"}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-card bg-white p-5 shadow-ambient">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">24-Hour Trend</h3>
              <select className="rounded-lg border border-outline-variant bg-surface-container px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-on-surface">
                <option>Main AQI</option>
                <option>PM 2.5</option>
                <option>Nitrogen Dioxide</option>
              </select>
            </div>

            <div className="relative flex h-48 items-end gap-2 overflow-hidden rounded-xl bg-surface-container p-4">
              {[40, 35, 30, 55, 60, 65, 80, 95, 90, 75, 60, 50].map((height, index) => (
                <div
                  key={index}
                  className={`flex-1 rounded-t ${index >= 6 ? "bg-error" : index >= 3 ? "bg-tertiary-fixed-dim" : "bg-secondary"}`}
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
            <div className="mt-4 flex justify-between text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
              <span>06:00 AM</span>
              <span>12:00 PM</span>
              <span>06:00 PM</span>
              <span>12:00 AM</span>
            </div>
          </div>

          <div className="rounded-card bg-white p-5 shadow-ambient">
            <h3 className="mb-6 font-headline-sm text-headline-sm text-on-surface">Health Advice</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex gap-4 rounded-2xl border border-tertiary/10 bg-tertiary-container/5 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-tertiary/10 text-tertiary">
                  <span className="material-symbols-outlined text-[28px]">masks</span>
                </div>
                <div>
                  <h4 className="font-label-md text-label-md text-on-surface">Mask Recommended</h4>
                  <p className="mt-1 text-[11px] text-on-surface-variant">Use N95 masks if outdoors for more than 30 minutes in central areas.</p>
                </div>
              </div>

              <div className="flex gap-4 rounded-2xl border border-primary/10 bg-primary/5 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <span className="material-symbols-outlined text-[28px]">air_purifier_gen</span>
                </div>
                <div>
                  <h4 className="font-label-md text-label-md text-on-surface">Purifier Usage</h4>
                  <p className="mt-1 text-[11px] text-on-surface-variant">Optimal time to run indoor filtration. Keep windows closed during peak hours.</p>
                </div>
              </div>

              <div className="flex gap-4 rounded-2xl border border-error/10 bg-error/5 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-error/10 text-error">
                  <span className="material-symbols-outlined text-[28px]">running_with_errors</span>
                </div>
                <div>
                  <h4 className="font-label-md text-label-md text-on-surface">Limit Exertion</h4>
                  <p className="mt-1 text-[11px] text-on-surface-variant">Sensitive groups should avoid outdoor activities during peak traffic hours.</p>
                </div>
              </div>

              <div className="flex gap-4 rounded-2xl border border-secondary/10 bg-secondary/5 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                  <span className="material-symbols-outlined text-[28px]">eco</span>
                </div>
                <div>
                  <h4 className="font-label-md text-label-md text-on-surface">Coastal Safety</h4>
                  <p className="mt-1 text-[11px] text-on-surface-variant">Beachfront areas currently offer the best air quality in the city.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="xl:col-span-7 rounded-card bg-white p-5 shadow-ambient">
            <h3 className="mb-6 font-headline-sm text-headline-sm text-on-surface">7-Day AQI Forecast</h3>
            <div className="space-y-4">
              {[
                ["Tomorrow", 72, "MODERATE", "bg-tertiary-fixed-dim"],
                ["Wed, 24", 48, "GOOD", "bg-secondary"],
                ["Thu, 25", 52, "MODERATE", "bg-tertiary-fixed-dim"],
                ["Fri, 26", 112, "UNHEALTHY-S", "bg-tertiary"],
                ["Sat, 27", 154, "POOR", "bg-error"],
              ].map(([label, value, tone, color]) => (
                <div key={label} className="flex items-center gap-4 border-b border-outline-variant/30 py-2 last:border-b-0 last:pb-0">
                  <span className="w-20 font-label-md text-label-md text-on-surface">{label}</span>
                  <div className="flex flex-1 items-center gap-4">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-container">
                      <div className={`h-full ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
                    </div>
                    <span className="w-8 font-label-md text-label-md text-on-surface">{value}</span>
                  </div>
                  <span className={`w-24 rounded-full px-3 py-1 text-center text-[10px] font-bold ${tone === "GOOD" ? "bg-secondary/20 text-secondary" : tone === "POOR" ? "bg-error/20 text-error" : tone === "UNHEALTHY-S" ? "bg-tertiary/20 text-tertiary" : "bg-tertiary-fixed-dim/20 text-tertiary"}`}>{tone}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="xl:col-span-5 rounded-card bg-white p-5 shadow-ambient">
            <h3 className="mb-6 font-headline-sm text-headline-sm text-on-surface">Pollution Attribution</h3>
            <div className="space-y-6">
              {[
                ["Traffic Emission", 42],
                ["Industrial Activity", 28],
                ["Dust & Construction", 15],
                ["Marine Aerosols", 10],
                ["Biomass Burning", 5],
              ].map(([label, value]) => (
                <div key={label}>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-2 font-label-md text-label-md text-on-surface">
                      <span className="material-symbols-outlined text-primary text-[20px]">{label.includes("Traffic") ? "directions_car" : label.includes("Industrial") ? "factory" : label.includes("Dust") ? "cloud_sync" : label.includes("Marine") ? "waves" : "forest"}</span>
                      {label}
                    </span>
                    <span className="font-bold text-primary">{value}%</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-surface-container">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <footer className="mt-2 flex flex-col items-center justify-between gap-4 border-t border-outline-variant/30 py-4 text-sm text-on-surface-variant md:flex-row">
            <p>© 2024 EcoWatch Intelligence Platform. Data derived from live satellite telemetry and remote-sensing models.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">API Documentation</a>
            <a href="#" className="hover:text-primary transition-colors">Satellite Observation Network</a>
          </div>
        </footer>
      </div>
    </DashboardLayout>
  );
}
