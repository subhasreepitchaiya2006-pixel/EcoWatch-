import React, { useEffect, useState } from "react";
import EcoInteractiveMap from "../components/EcoInteractiveMap";
import { fetchWeather } from "../lib/api";

const weatherCodeMap = {
  0: { label: "Clear sky", icon: "sunny" },
  1: { label: "Mainly clear", icon: "partly_cloudy_day" },
  2: { label: "Partly cloudy", icon: "partly_cloudy_day" },
  3: { label: "Overcast", icon: "cloud" },
  45: { label: "Fog", icon: "foggy" },
  48: { label: "Depositing rime fog", icon: "foggy" },
  51: { label: "Light drizzle", icon: "rainy" },
  53: { label: "Moderate drizzle", icon: "rainy" },
  55: { label: "Dense drizzle", icon: "rainy" },
  61: { label: "Slight rain", icon: "rainy" },
  63: { label: "Moderate rain", icon: "rainy" },
  65: { label: "Heavy rain", icon: "rainy" },
  71: { label: "Slight snow", icon: "cloudy_snowing" },
  73: { label: "Moderate snow", icon: "cloudy_snowing" },
  75: { label: "Heavy snow", icon: "cloudy_snowing" },
  95: { label: "Thunderstorm", icon: "thunderstorm" },
};

function getWeatherDisplay(code) {
  return weatherCodeMap[code] || { label: "Current Conditions", icon: "partly_cloudy_day" };
}

export default function PublicWeatherPage() {
  const [coords, setCoords] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ latitude, longitude });
      },
      () => {
        setError("Unable to retrieve location. Showing default coordinates.");
        setCoords({ latitude: 13.0827, longitude: 80.2707 });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  useEffect(() => {
    async function fetchWeather() {
      if (!coords) return;
      setLoading(true);
      setError(null);
      try {
        const data = await fetchWeather("Current location", coords.latitude, coords.longitude);
        if (!data?.offlineFallback) setWeather(data);
        else setError("Weather service is unavailable.");
      } catch (e) {
        setError("Failed to fetch weather data");
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, [coords]);

  const currentConditions = weather ? getWeatherDisplay(weather.weatherCode) : null;

  return (
    <div className="weather-page bg-surface-bright text-on-surface min-h-screen flex flex-col">
      <main className="w-full flex-grow p-gutter max-w-[1600px] mx-auto">
        <header className="mb-gutter flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-headline-lg font-bold text-on-surface">Satellite-Based Weather Intelligence</h1>
            <p className="text-body-md text-on-surface-variant font-medium mt-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">satellite_alt</span>
              Real-time Orbital Data &amp; Multi-Regional Telemetry
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg flex items-center gap-2 border border-primary/20">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              <span className="text-label-md font-bold uppercase tracking-wider">{weather?.dataSource || "Locating weather data"}</span>
            </div>
            <button className="bg-white border border-outline-variant/50 p-2 rounded-lg hover:bg-surface-container-low transition-colors shadow-sm">
              <span className="material-symbols-outlined text-on-surface-variant">download</span>
            </button>
            <button className="bg-white border border-outline-variant/50 p-2 rounded-lg hover:bg-surface-container-low transition-colors shadow-sm">
              <span className="material-symbols-outlined text-on-surface-variant">settings</span>
            </button>
          </div>
        </header>

        <section className="mb-gutter">
          <div className="relative w-full h-[320px] rounded-[20px] overflow-hidden shadow-[0px_4px_20px_rgba(15,23,42,0.06)] bg-white border border-outline-variant/30">
            <div className="absolute inset-0 z-0 bg-slate-100 dark:bg-surface-container-high">
              <img
                alt="Atmospheric View"
                className="w-full h-full object-cover opacity-30 dark:opacity-50"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKG4gqax3qNrhnhlDmEsfxrts9AfMLNnLdvkfTVELQlOE3uiXoSRrTBIaEpNyZrlNmzg92mSSQwwFU-BvIwnJoBzP9GQCXgstasw_Os1UniZb20h9g_em67RcVUsaI0mfa3SsveIX9NmfbrTtsdYJyMVQ05DIb-8T9VjKhY4DuQQrrdM6MDo34EfKRNl3ckMowl_zjdJgKKlgY-A5uv8pXx91M66TaLnVztWF6L9fineKh-v9pqbxsNA"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent dark:from-surface dark:via-surface/90 dark:to-transparent" />
            </div>

            <div className="relative z-10 h-full flex flex-col justify-between p-stack_lg md:p-12">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      Live Satellite Feed
                    </span>
                    <h2 className="text-headline-md font-bold text-on-surface">
                      {coords ? `Current Coordinates: ${coords.latitude.toFixed(4)}° N, ${coords.longitude.toFixed(4)}° E` : "Locating..."}
                    </h2>
                  </div>
                  <p className="text-on-surface-variant font-medium">Orbital Pass Timestamp: {new Date().toISOString()}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-end gap-12">
                <div className="flex items-center gap-6">
                  <span className="material-symbols-outlined text-[100px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {currentConditions ? currentConditions.icon : "cloud"}
                  </span>
                  <div>
                    <div className="flex items-start">
                      <span className="text-[84px] font-extrabold leading-none text-on-surface">
                        {loading ? "--" : weather ? Math.round(weather.temperature) : "--"}
                      </span>
                      <span className="text-[32px] font-bold mt-2 text-primary">°C</span>
                    </div>
                    <p className="text-headline-sm font-semibold text-on-surface-variant">
                      {currentConditions ? currentConditions.label : loading ? "Loading…" : error ? "Unavailable" : "Locating"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-8 border-l border-outline-variant/30 pl-8 flex-wrap">
                  <div className="flex flex-col gap-1">
                    <span className="text-label-sm text-on-surface-variant/60 uppercase">Surface Temp</span>
                    <span className="text-headline-sm font-bold text-on-surface">{weather ? `${Math.round(weather.temperature)}°C` : "--"}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-label-sm text-on-surface-variant/60 uppercase">Atmospheric Moisture</span>
                    <span className="text-headline-sm font-bold text-on-surface">{weather ? `${Math.round(weather.humidity)}%` : "--"}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-label-sm text-on-surface-variant/60 uppercase">Wind Velocity</span>
                    <span className="text-headline-sm font-bold text-on-surface">{weather ? `${Math.round(weather.windSpeed)} km/h` : "--"}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-label-sm text-on-surface-variant/60 uppercase">Solar Radiation</span>
                    <div className="flex items-center gap-2">
                      <span className="text-headline-sm font-bold text-on-surface">{weather ? "8" : "--"}</span>
                      <span className="bg-error/10 text-error text-[10px] font-bold px-1.5 py-0.5 rounded">High</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter mb-gutter">
          <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(15,23,42,0.06)] border border-outline-variant/30 overflow-hidden flex flex-col">
            <div className="p-6 flex items-center justify-between border-b border-outline-variant/20">
              <h3 className="font-bold text-headline-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">satellite</span>
                Multi-Spectral Radar
              </h3>
              <div className="flex gap-1 bg-surface-container rounded-lg p-1">
                <button className="bg-white shadow-sm text-primary text-[12px] font-bold px-3 py-1 rounded-md">Thermal</button>
                <button className="text-on-surface-variant text-[12px] font-bold px-3 py-1 rounded-md hover:bg-white/50">Precip</button>
                <button className="text-on-surface-variant text-[12px] font-bold px-3 py-1 rounded-md hover:bg-white/50">Vector</button>
              </div>
            </div>
            <div className="relative flex-grow min-h-[300px]">
              <EcoInteractiveMap className="absolute inset-0" center={[13.0827, 80.2707]} zoom={10} showHeat />
              <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                <button className="w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-on-surface-variant"><span className="material-symbols-outlined">add</span></button>
                <button className="w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-on-surface-variant"><span className="material-symbols-outlined">remove</span></button>
              </div>
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur shadow-md px-3 py-2 rounded-lg border border-outline-variant/30">
                <p className="text-[10px] font-bold text-primary uppercase mb-1">Telemetry Opacity</p>
                <div className="w-24 h-1 bg-primary/20 rounded-full overflow-hidden">
                  <div className="w-[60%] h-full bg-primary" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(15,23,42,0.06)] border border-outline-variant/30 p-6">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-headline-sm">Orbital Projection: 24h</h3>
              <span className="text-primary font-semibold text-[14px] cursor-pointer hover:underline">View Model Data</span>
            </div>
            <div className="flex flex-col h-[280px]">
              <div className="flex-grow relative flex items-end gap-2 pb-6">
                {[30, 31, 30, 29, 28, 27, 26].map((value, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center justify-end group cursor-pointer h-full">
                    <span className="text-[12px] font-bold text-on-surface mb-2 opacity-0 group-hover:opacity-100 transition-opacity">{value}°</span>
                    <div className="w-full bg-primary/10 rounded-t-lg transition-all group-hover:bg-primary/20" style={{ height: `${60 + value - 26}%` }} />
                    <span className="text-[10px] text-on-surface-variant mt-3 font-medium">{14 + index}:00</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-outline-variant/30 pt-4 px-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-sm">water_drop</span>
                  <span className="text-[12px] font-semibold text-on-surface">Precipitation Probability: 12%</span>
                </div>
                <div className="w-24 h-1.5 bg-surface-container rounded-full overflow-hidden">
                  <div className="w-[12%] h-full bg-secondary" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(15,23,42,0.06)] border border-outline-variant/30 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-headline-sm">Extended Satellite Modeling</h3>
              <span className="material-symbols-outlined text-on-surface-variant/40">calendar_month</span>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { day: "Mon", icon: "partly_cloudy_day", temp: "32° / 24°", rain: "10%", width: "80%" },
                { day: "Tue", icon: "sunny", temp: "34° / 25°", rain: "5%", width: "90%", active: true },
                { day: "Wed", icon: "cloudy_snowing", temp: "29° / 23°", rain: "65%", width: "40%" },
                { day: "Thu", icon: "rainy", temp: "28° / 22°", rain: "80%", width: "30%" },
              ].map((item) => (
                <div key={item.day} className={`flex items-center justify-between p-3 rounded-xl border ${item.active ? "bg-primary/5 border-primary/10" : "hover:bg-surface-container-low border-transparent"}`}>
                  <span className="w-12 font-bold text-on-surface">{item.day}</span>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>{item.icon}</span>
                    <span className="text-[12px] font-medium text-on-surface-variant/60">{item.temp}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-secondary text-[16px]">water_drop</span>
                      <span className="text-[12px] font-bold">{item.rain}</span>
                    </div>
                    <div className="w-16 h-1 bg-surface-container rounded-full overflow-hidden">
                      <div className={`h-full bg-primary mx-auto`} style={{ width: item.width }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-gutter mb-gutter">
          <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(15,23,42,0.06)] border border-outline-variant/30 p-6">
            <h3 className="font-bold text-headline-sm mb-6">Environmental Telemetry</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { icon: "air", title: "AQI (Satellite Est)", value: "42", badge: "Good", color: "text-secondary" },
                { icon: "wb_sunny", title: "UV Index", value: "8", badge: "High", color: "text-error" },
                { icon: "psychology", title: "Aerosol Optical Depth", value: "Low", color: "text-on-surface" },
                { icon: "visibility", title: "Atmospheric Vis", value: "10 km", color: "text-on-surface" },
                { icon: "thermostat", title: "Thermal Index", value: "36°C", color: "text-on-surface" },
                { icon: "opacity", title: "Dew Point", value: "22°C", color: "text-on-surface" },
              ].map((item) => (
                <div key={item.title} className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
                  <div className="flex items-center gap-2 mb-2 text-on-surface-variant/70">
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    <span className="text-label-sm uppercase">{item.title}</span>
                  </div>
                  <p className={`text-headline-sm font-bold ${item.color}`}>
                    {item.value}
                    {item.badge ? <span className="text-label-sm font-semibold opacity-60"> {item.badge}</span> : null}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-primary border border-primary-container shadow-[0px_4px_20px_rgba(37,99,235,0.1)] rounded-[16px] p-6 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <span className="material-symbols-outlined text-[160px]">auto_awesome</span>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <span className="material-symbols-outlined text-white">memory</span>
                </div>
                <h3 className="font-bold text-headline-sm">Orbital AI Insights</h3>
              </div>
              <div className="space-y-4">
                {[
                  { icon: "info", title: "Atmospheric Moisture Spike", text: "Satellite imagery indicates high moisture bands moving into the sector after 6 PM today." },
                  { icon: "check_circle", title: "Clear Optical Window", text: "Low cloud cover probability for the next 4 hours." },
                  { icon: "warning", title: "Solar Radiation Alert", text: "Ozone layer monitoring shows elevated UV transmission during 11 AM - 3 PM." },
                  { icon: "potted_plant", title: "Vegetation Health Alert", text: "Satellite imagery detects a 5% increase in biomass density in the northern sector." },
                  { icon: "agriculture", title: "Crop Water Stress Index", text: "Moisture levels in localized agricultural zones remain optimal." },
                ].map((item) => (
                  <div key={item.title} className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 flex items-start gap-4">
                    <span className="material-symbols-outlined text-white/70">{item.icon}</span>
                    <div>
                      <p className="font-semibold text-body-md">{item.title}</p>
                      <p className="text-white/70 text-body-sm mt-1">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-gutter lg:grid-cols-3">
          <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(15,23,42,0.06)] border border-outline-variant/30 p-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-bold text-headline-sm">Rainfall Analytics</h3>
                <p className="text-label-sm text-on-surface-variant/60">Satellite-Estimated Rainfall (mm)</p>
              </div>
              <div className="text-right">
                <p className="text-headline-md font-bold text-primary">124 mm</p>
                <p className="text-label-sm text-secondary font-bold">Satellite-Estimated Rainfall</p>
              </div>
            </div>
            <div className="flex gap-6 mb-6 px-2">
              <div className="flex flex-col">
                <span className="text-label-sm text-on-surface-variant/60 uppercase">Peak Intensity</span>
                <span className="text-body-md font-bold text-on-surface">18mm/h</span>
              </div>
              <div className="flex flex-col">
                <span className="text-label-sm text-on-surface-variant/60 uppercase">24h Total</span>
                <span className="text-body-md font-bold text-on-surface">42mm</span>
              </div>
            </div>
            <div className="h-48 flex items-end gap-3 px-2">
              {[12, 8, 45, 30, 5, 22, 2].map((value, index) => (
                <div key={index} className="flex-1 flex flex-col justify-end h-full group relative">
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-inverse-surface text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">{value}mm</div>
                  <div className="w-full bg-primary/40 rounded-t-md transition-all group-hover:bg-primary/60" style={{ height: `${Math.max(value, 5)}%` }} />
                  <span className="mt-2 text-[10px] text-on-surface-variant font-bold text-center">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(15,23,42,0.06)] border border-outline-variant/30 p-6">
            <h3 className="font-bold text-headline-sm mb-6">Vegetation Intelligence</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { icon: "eco", title: "NDVI", value: "0.68", badge: "Healthy", color: "text-secondary" },
                { icon: "grass", title: "Biomass Density", value: "4.2", badge: "kg/m²", color: "text-on-surface" },
                { icon: "water_drop", title: "Canopy Water", value: "12%", color: "text-on-surface" },
              ].map((item) => (
                <div key={item.title} className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
                  <div className="flex items-center gap-2 mb-2 text-on-surface-variant/70">
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                    <span className="text-label-sm uppercase">{item.title}</span>
                  </div>
                  <p className={`text-headline-sm font-bold ${item.color}`}>
                    {item.value}
                    {item.badge ? <span className="text-label-sm font-semibold opacity-60"> {item.badge}</span> : null}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(15,23,42,0.06)] border border-outline-variant/30 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-headline-sm">Regional Anomaly Alerts</h3>
              <div className="flex items-center gap-2 px-3 py-1 bg-error/10 text-error rounded-full text-[12px] font-bold">
                <span className="material-symbols-outlined text-[16px] animate-pulse">warning</span>
                2 Active Signatures
              </div>
            </div>
            <div className="space-y-4">
              <div className="anomaly-card flex items-start gap-4 p-4 bg-[#FFFBEC] border border-[#FFDC72] rounded-xl">
                <div className="w-10 h-10 bg-[#FFDC72] rounded-lg flex items-center justify-center text-[#996100]">
                  <span className="material-symbols-outlined">thermostat_auto</span>
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-on-surface">Thermal Anomaly Detected</h4>
                    <span className="text-[10px] font-bold text-on-surface-variant/60">Expires in 4h</span>
                  </div>
                  <p className="text-body-sm text-on-surface-variant/80 mt-1">Thermal satellite radiometers indicate surface temperatures reaching 36°C with 75% relative humidity in monitored sector.</p>
                </div>
              </div>
              <div className="anomaly-card flex items-start gap-4 p-4 bg-[#FFF4F2] border border-[#FFDAD6] rounded-xl">
                <div className="w-10 h-10 bg-[#FFDAD6] rounded-lg flex items-center justify-center text-[#93000a]">
                  <span className="material-symbols-outlined">storm</span>
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-on-surface">Convective Cell Formation</h4>
                    <span className="text-[10px] font-bold text-on-surface-variant/60">Starts tomorrow 6 AM</span>
                  </div>
                  <p className="text-body-sm text-on-surface-variant/80 mt-1">Satellite radar detects increasing convective activity. Expect sustained precipitation up to 40mm.</p>
                </div>
              </div>
              <button className="w-full py-3 text-on-surface-variant font-bold text-[14px] border border-outline-variant/30 rounded-xl hover:bg-surface-container-low transition-colors">
                View Complete Telemetry Logs
              </button>
            </div>
          </div>
        </section>

        <div className="mt-6">
          <button
            onClick={() => {
              requestLocation();
            }}
            className="px-4 py-2 rounded-lg bg-primary text-on-primary"
          >
            Refresh Location
          </button>

          <div className="mt-4 text-sm text-on-surface-variant">
            {error ? <div className="text-error">{error}</div> : null}
            <div>Note: This public view shows current weather for your browser location. No account required.</div>
          </div>
        </div>
      </main>

      <footer className="p-gutter border-t border-outline-variant/10 flex items-center justify-between text-on-surface-variant/40 max-w-[1600px] mx-auto w-full flex-wrap gap-3">
        <p className="text-label-sm">© 2023 Satellite Weather Intelligence. All Rights Reserved.</p>
        <div className="flex gap-6">
          <a className="text-label-sm hover:text-primary transition-colors" href="#">System Status</a>
          <a className="text-label-sm hover:text-primary transition-colors" href="#">API Docs</a>
          <a className="text-label-sm hover:text-primary transition-colors" href="#">Telemetry Policy</a>
        </div>
      </footer>
    </div>
  );
}
