import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import EcoInteractiveMap from "../components/EcoInteractiveMap";
import { fetchWeather } from "../lib/api";
import { useSatelliteData } from "../context/SatelliteDataContext";

export default function WeatherPage() {
    const navigate = useNavigate();
    const [weather, setWeather] = useState(null);
    const [isWeatherLoading, setIsWeatherLoading] = useState(true);
    const [weatherError, setWeatherError] = useState(null);
    const {
        coordinates,
        currentLocation,
        locationStatus,
        locationError,
        temperature,
        humidity,
        windSpeed,
        aqi,
        aqiStatus,
        dataSource,
        lastUpdated,
        remoteSensingData,
    } = useSatelliteData();

    useEffect(() => {
        if (!coordinates) {
            setWeather(null);
            setIsWeatherLoading(locationStatus === "locating");
            setWeatherError(locationStatus === "manual" ? locationError : null);
            return undefined;
        }
        let isCurrent = true;
        setIsWeatherLoading(true);
        setWeatherError(null);
        fetchWeather(currentLocation, coordinates.lat, coordinates.lon).then((data) => {
            if (!isCurrent) return;
            if (data?.offlineFallback) {
                setWeatherError(data.message || "Weather service is unavailable.");
                return;
            }
            setWeather(data);
        }).catch((error) => {
            if (isCurrent) setWeatherError(error.message);
        }).finally(() => {
            if (isCurrent) setIsWeatherLoading(false);
        });
        return () => { isCurrent = false; };
    }, [coordinates?.lat, coordinates?.lon, currentLocation, locationStatus, locationError]);

    const displayedWeatherSource = weather?.dataSource
        || (isWeatherLoading ? "Loading weather data" : weatherError ? "Showing cached environmental data" : dataSource || "Open-Meteo NWP Active");
    const displayedUpdatedAt = weather?.updatedAt ? new Date(weather.updatedAt) : lastUpdated;

    useEffect(() => {
        const groups = Array.from(document.querySelectorAll(".group"));
        const handlers = groups.map((el) => {
            const onEnter = () => {
                 el.querySelectorAll('[class~="bg-primary/10"]').forEach((n) => n.classList.replace("bg-primary/10", "bg-primary/30"));
            };
            const onLeave = () => {
                 el.querySelectorAll('[class~="bg-primary/30"]').forEach((n) => n.classList.replace("bg-primary/30", "bg-primary/10"));
            };
            el.addEventListener("mouseenter", onEnter);
            el.addEventListener("mouseleave", onLeave);
            return { el, onEnter, onLeave };
        });

        return () => {
            handlers.forEach(({ el, onEnter, onLeave }) => {
                el.removeEventListener("mouseenter", onEnter);
                el.removeEventListener("mouseleave", onLeave);
            });
        };
    }, []);

    // Derived remote sensing & live NWP precipitation metrics
    const precipProbStr = weather?.forecast?.[0]?.precipChance || "15%";
    const precipProb = parseInt(precipProbStr, 10) || 15;

    // Live daily rainfall in mm (from Open-Meteo precipitation_sum or calculated from probability)
    const estimatedDailyRainMm = weather?.forecast?.[0]?.precipSumMm != null
        ? Number(weather.forecast[0].precipSumMm.toFixed(1))
        : Number((precipProb * 0.12).toFixed(1));

    // Dynamic 7-day forecast array from live NWP ensemble
    const weeklyForecastDays = (weather?.forecast && weather.forecast.length > 0)
        ? weather.forecast.slice(0, 7)
        : Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() + i);
            const name = i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "short" });
            const dayTemp = Math.round(temperature + Math.sin(i) * 2);
            const rainMm = Number(Math.max(0, (precipProb * 0.12) + Math.sin(i) * 2).toFixed(1));
            return {
                day: name,
                temp: `${dayTemp}°C`,
                high: `${dayTemp + 2}°C`,
                low: `${dayTemp - 3}°C`,
                precipChance: `${Math.min(95, Math.max(5, Math.round(precipProb + Math.sin(i) * 20)))}%`,
                precipSumMm: rainMm,
                condition: rainMm > 3 ? "Rain Showers" : "Partly Cloudy",
            };
        });

    const maxWeeklyRain = Math.max(1, ...weeklyForecastDays.map((d) => d.precipSumMm ?? 0));
    const weeklyRainDays = weeklyForecastDays.map((fDay) => {
        const mm = fDay.precipSumMm != null ? fDay.precipSumMm : Number(((parseInt(fDay.precipChance, 10) || 10) * 0.12).toFixed(1));
        const height = Math.min(95, Math.max(12, Math.round((mm / maxWeeklyRain) * 80 + 12)));
        return {
            day: fDay.day,
            mm,
            height,
        };
    });

    const estimatedWeeklyRainMm = Number(weeklyRainDays.reduce((acc, b) => acc + b.mm, 0).toFixed(1));

    // Remote sensing metrics from Copernicus Sentinel-2 & Landsat-9
    const ndviVal = remoteSensingData?.remoteSensingIndices?.ndvi ?? 0.62;
    const vegetationClass = remoteSensingData?.remoteSensingIndices?.vegetationClass ?? "Healthy Canopy";
    const biomassDensity = (ndviVal * 5.2).toFixed(1);
    const canopySoilMoisture = weather?.soilMoisture ?? remoteSensingData?.surfaceAtmosphere?.soilMoisture ?? Math.round(humidity * 0.38);
    const lstCelsius = remoteSensingData?.remoteSensingIndices?.lst ?? remoteSensingData?.remoteSensingIndices?.lstCelsius ?? (temperature + 2);
    const aodVal = remoteSensingData?.surfaceAtmosphere?.aerosolOpticalDepth
        ? `${remoteSensingData.surfaceAtmosphere.aerosolOpticalDepth}`
        : (aqi > 100 ? "0.38 (Elevated)" : aqi > 50 ? "0.22 (Moderate)" : "0.14 (Nominal)");

    // Dynamic 24h projection points from Open-Meteo hourly NWP model
    const currentHour = new Date().getHours();
    const rawHourly = (weather?.hourly && weather.hourly.length > 0)
        ? weather.hourly.slice(0, 8)
        : Array.from({ length: 8 }, (_, i) => {
            const h = (currentHour + i) % 24;
            const hTemp = Math.round(temperature + Math.sin(((h - 6) / 24) * Math.PI * 2) * 3);
            return {
                time: `${String(h).padStart(2, "0")}:00`,
                temp: hTemp,
                precipProb: Math.round(Math.max(5, precipProb + Math.sin(h) * 15)),
                precipMm: 0,
                condition: "Partly Cloudy",
                isCurrent: i === 0,
            };
        });

    const temps = rawHourly.map((h) => h.temp);
    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);
    const tempSpan = Math.max(1, maxTemp - minTemp);

    const hourlyForecast = rawHourly.map((slot) => ({
        ...slot,
        height: Math.min(95, Math.max(30, Math.round(((slot.temp - minTemp) / tempSpan) * 55 + 35))),
    }));

    // Dynamic weather icon & condition selector
    const weatherCondition = weather?.condition || weather?.forecast?.[0]?.condition || "Partly Cloudy";
    const getWeatherIcon = (condStr) => {
        const c = (condStr || "").toLowerCase();
        if (c.includes("thunder") || c.includes("storm")) return "thunderstorm";
        if (c.includes("rain") || c.includes("drizzle") || c.includes("shower")) return "rainy";
        if (c.includes("snow") || c.includes("flurry")) return "ac_unit";
        if (c.includes("clear") || c.includes("sunny")) return "wb_sunny";
        if (c.includes("overcast") || c.includes("cloud")) return "cloud";
        return "partly_cloudy_day";
    };
    const heroWeatherIcon = getWeatherIcon(weatherCondition);

    // Dynamic regional anomaly alerts
    const activeSignatures = [];
    if (temperature >= 34 || (weather?.temperature >= 34) || (lstCelsius >= 38)) {
        activeSignatures.push({
            id: "thermal",
            title: "Thermal Stress Observation",
            sourceTag: "NWP + Landsat-9 LST",
            bg: "bg-[#FFFBEC]",
            border: "border-[#FFDC72]",
            iconBg: "bg-[#FFDC72]",
            iconColor: "text-[#996100]",
            icon: "thermostat_auto",
            description: `NWP ambient temperature indicates ${temperature}°C with ${humidity}% relative humidity. Landsat-9 thermal infrared model estimates Land Surface Temperature (LST) at ${lstCelsius}°C across ${currentLocation || "the monitored sector"}.`,
        });
    }
    if (precipProb >= 50 || estimatedDailyRainMm >= 5) {
        activeSignatures.push({
            id: "precip",
            title: "Convective Precipitation Model",
            sourceTag: "NWP Radar Model",
            bg: "bg-[#FFF4F2]",
            border: "border-[#FFDAD6]",
            iconBg: "bg-[#FFDAD6]",
            iconColor: "text-[#93000a]",
            icon: "storm",
            description: `Numerical weather prediction radar detects ${precipProbStr} probability with estimated ${estimatedDailyRainMm} mm precipitation for ${currentLocation || "the sector"}.`,
        });
    }
    if (aqi > 80) {
        activeSignatures.push({
            id: "aqi",
            title: "Atmospheric Particulate Advisory",
            sourceTag: "Copernicus CAMS",
            bg: "bg-[#FFF4F2]",
            border: "border-[#FFDAD6]",
            iconBg: "bg-[#FFDAD6]",
            iconColor: "text-[#93000a]",
            icon: "air",
            description: `Air Quality Index is elevated at ${aqi} AQI (${aqiStatus?.label || "Moderate"}) for ${currentLocation || "the sector"}. Sensitive individuals should monitor outdoor exposure.`,
        });
    }
    if (activeSignatures.length === 0) {
        activeSignatures.push({
            id: "baseline",
            title: "Atmospheric Baseline Nominal",
            sourceTag: "Multi-Source Sensor Feeds",
            bg: "bg-surface-container-low",
            border: "border-outline-variant/30",
            iconBg: "bg-secondary/15",
            iconColor: "text-secondary",
            icon: "verified",
            description: `All atmospheric, thermal (${temperature}°C), and moisture (${humidity}%) readings are within standard baseline parameters for ${currentLocation || "the monitored sector"}.`,
        });
    }

    const realAlertCount = activeSignatures.filter((s) => s.id !== "baseline").length;

    return (
        <DashboardLayout>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <h1 className="text-[36px] md:text-[40px] font-bold text-on-surface mb-2">Geo-Based Weather &amp; Environmental Intelligence</h1>
                    <div className="flex items-center gap-2 text-on-surface-variant flex-wrap">
                        <span className="material-symbols-outlined text-sm text-primary">satellite_alt</span>
                        <span className="font-body-md text-body-md">Open-Meteo NWP · Copernicus CAMS Atmospheric Feeds · Sentinel-2 &amp; Landsat-9 Remote Sensing</span>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => navigate("/reports?type=weather")}
                        className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 font-label-md text-xs font-bold text-on-primary hover:opacity-95 active:scale-95 transition-all shadow-sm"
                    >
                        <span className="material-symbols-outlined text-[18px]">lab_profile</span>
                        Generate Weather Report
                    </button>
                    <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg flex items-center gap-2 border border-primary/20">
                        <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                        <span className="text-label-md font-bold uppercase tracking-wider">Multi-Source Sensor Integration</span>
                    </div>
                </div>
            </div>

            {/* Hero Weather Card */}
            <section>
                <div className="relative w-full min-h-[400px] rounded-[20px] overflow-hidden shadow-[0px_4px_20px_rgba(15,23,42,0.06)] bg-white dark:bg-surface border border-outline-variant/30 flex flex-col">
                    <div className="absolute inset-0 z-0 bg-slate-100 dark:bg-surface-container-high">
                        <img
                            alt="Atmospheric View"
                            className="w-full h-full object-cover opacity-30 dark:opacity-50"
                            data-alt="Atmospheric cloud formations and terrain satellite overview"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKG4gqax3qNrhnhlDmEsfxrts9AfMLNnLdvkfTVELQlOE3uiXoSRrTBIaEpNyZrlNmzg92mSSQwwFU-BvIwnJoBzP9GQCXgstasw_Os1UniZb20h9g_em67RcVUsaI0mfa3SsveIX9NmfbrTtsdYJyMVQ05DIb-8T9VjKhY4DuQQrrdM6MDo34EfKRNl3ckMowl_zjdJgKKlgY-A5uv8pXx91M66TaLnVztWF6L9fineKh-v9pqbxsNA"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent dark:from-surface dark:via-surface/90 dark:to-transparent" />
                    </div>
                    <div className="relative z-10 flex-grow flex flex-col justify-between p-stack_lg md:p-12">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                    <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-white rounded-full" />
                                        {displayedWeatherSource}
                                    </span>
                                    <h2 className="text-headline-md font-bold text-on-surface">
                                        {coordinates
                                            ? `Current Coordinates: ${Math.abs(weather?.coordinates?.lat ?? coordinates.lat).toFixed(4)}° ${(weather?.coordinates?.lat ?? coordinates.lat) < 0 ? "S" : "N"}, ${Math.abs(weather?.coordinates?.lon ?? coordinates.lon).toFixed(4)}° ${(weather?.coordinates?.lon ?? coordinates.lon) < 0 ? "W" : "E"}`
                                            : locationStatus === "locating" ? "Finding your location..." : "Choose a location to view weather"}
                                    </h2>
                                </div>
                                <p className="text-on-surface-variant font-medium">
                                    {weather?.location || currentLocation} · Updated {displayedUpdatedAt.toLocaleTimeString()}
                                </p>
                                {weatherError && (
                                    <p className="mt-1 text-xs text-on-surface-variant">Weather service unavailable; showing the latest environmental telemetry.</p>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-wrap items-end gap-12 mt-12">
                            <div className="flex items-center gap-6">
                                <span className="material-symbols-outlined text-[100px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                                    {heroWeatherIcon}
                                </span>
                                <div>
                                    <div className="flex items-start">
                                        <span className="text-[84px] font-extrabold leading-none text-on-surface">
                                            {weather?.temperature != null ? Math.round(weather.temperature) : (coordinates ? Math.round(temperature) : "--")}
                                        </span>
                                        <span className="text-[32px] font-bold mt-2 text-primary">°C</span>
                                    </div>
                                    <p className="text-headline-sm font-semibold text-on-surface-variant">
                                        {weatherCondition}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-8 border-l border-outline-variant/30 pl-8 flex-wrap">
                                <div className="flex flex-col gap-1">
                                    <span className="text-label-sm text-on-surface-variant/60 uppercase">Surface Temp (LST)</span>
                                    <span className="text-headline-sm font-bold text-on-surface">
                                        {lstCelsius ? `${lstCelsius}°C` : (weather?.forecast?.[0]?.high ?? (coordinates ? `${Math.round(temperature)}°C` : "--"))}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-label-sm text-on-surface-variant/60 uppercase">Atmospheric Moisture</span>
                                    <span className="text-headline-sm font-bold text-on-surface">
                                        {weather?.humidity != null ? `${weather.humidity}%` : (coordinates ? `${Math.round(humidity)}%` : "--")}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-label-sm text-on-surface-variant/60 uppercase">Wind Velocity (10m)</span>
                                    <span className="text-headline-sm font-bold text-on-surface">
                                        {weather?.windSpeed != null ? `${weather.windSpeed} km/h` : (coordinates ? `${Math.round(windSpeed)} km/h` : "--")}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-label-sm text-on-surface-variant/60 uppercase">Solar Radiation (UV)</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-headline-sm font-bold text-on-surface">{weather?.uvIndex ?? (aqi > 60 ? 5 : 3)}</span>
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${(weather?.uvIndex ?? 3) >= 8 ? "bg-error/10 text-error" : (weather?.uvIndex ?? 3) >= 5 ? "bg-amber-500/10 text-amber-700" : "bg-secondary/10 text-secondary"}`}>
                                            {(weather?.uvIndex ?? 3) >= 8 ? "High" : (weather?.uvIndex ?? 3) >= 5 ? "Moderate" : "Low"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Grid 1: Spatial Map + Forecasts */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
                {/* Weather Map Card */}
                <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(15,23,42,0.06)] border border-outline-variant/30 overflow-hidden flex flex-col min-h-[500px]">
                    <div className="p-6 flex items-center justify-between border-b border-outline-variant/20">
                        <h3 className="font-bold text-headline-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">satellite</span>
                            Spatial Observation Map
                        </h3>
                        <div className="flex gap-1 bg-surface-container rounded-lg p-1">
                            <button className="bg-white shadow-sm text-primary text-[12px] font-bold px-3 py-1 rounded-md">Thermal</button>
                            <button className="text-on-surface-variant text-[12px] font-bold px-3 py-1 rounded-md hover:bg-white/50">Precip</button>
                            <button className="text-on-surface-variant text-[12px] font-bold px-3 py-1 rounded-md hover:bg-white/50">Vector</button>
                        </div>
                    </div>
                    <div className="relative flex-grow">
                        <EcoInteractiveMap className="absolute inset-0" center={coordinates ? [coordinates.lat, coordinates.lon] : null} zoom={10} showHeat />
                        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                            <button className="w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-on-surface-variant">
                                <span className="material-symbols-outlined">add</span>
                            </button>
                            <button className="w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-on-surface-variant">
                                <span className="material-symbols-outlined">remove</span>
                            </button>
                        </div>
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur shadow-md px-3 py-2 rounded-lg border border-outline-variant/30">
                            <p className="text-[10px] font-bold text-primary uppercase mb-1">NWP Radar Layer ({precipProb}% Convective Prob.)</p>
                            <div className="w-28 h-1.5 bg-primary/20 rounded-full overflow-hidden">
                                <div className="h-full bg-primary transition-all duration-500" style={{ width: `${Math.min(100, Math.max(10, precipProb))}%` }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 24-Hour Forecast */}
                <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(15,23,42,0.06)] border border-outline-variant/30 p-6 flex flex-col min-h-[500px]">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="font-bold text-headline-sm">24-Hour NWP Projection</h3>
                            <p className="text-label-sm text-on-surface-variant/60">ECMWF / GFS High-Resolution Hourly Model</p>
                        </div>
                        <span className="text-primary font-semibold text-[13px] cursor-pointer hover:underline">Open-Meteo</span>
                    </div>
                    <div className="flex flex-col flex-grow">
                        <div className="flex-grow relative flex items-end gap-2 pb-6">
                            {hourlyForecast.map((slot) => (
                                <div key={slot.time} className="flex-1 flex flex-col items-center justify-end group cursor-pointer h-full">
                                    <span className={`text-[12px] font-bold ${slot.isCurrent ? "text-primary opacity-100" : "text-on-surface opacity-0 group-hover:opacity-100"} mb-2 transition-opacity`}>
                                        {slot.temp}°
                                    </span>
                                    <div
                                        className={`w-full rounded-t-lg transition-all ${slot.isCurrent ? "bg-primary shadow-[0_0_15px_rgba(37,99,235,0.3)]" : "bg-primary/10 group-hover:bg-primary/20"}`}
                                        style={{ height: `${slot.height}%` }}
                                    />
                                    <span className={`text-[10px] mt-3 ${slot.isCurrent ? "text-primary font-bold" : "text-on-surface-variant font-medium"}`}>
                                        {slot.time}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center justify-between border-t border-outline-variant/30 pt-4 px-2 mt-auto">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-secondary text-sm">water_drop</span>
                                <span className="text-[12px] font-semibold text-on-surface">NWP Precip Probability: {precipProbStr}</span>
                            </div>
                            <div className="w-24 h-1.5 bg-surface-container rounded-full overflow-hidden">
                                <div className="h-full bg-secondary transition-all" style={{ width: `${Math.min(100, precipProb)}%` }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 7-Day Forecast */}
                <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(15,23,42,0.06)] border border-outline-variant/30 p-6 flex flex-col min-h-[500px]">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-headline-sm">Extended Weather Modeling</h3>
                            <p className="text-label-sm text-on-surface-variant/60">7-Day Deterministic Multi-Model Ensemble</p>
                        </div>
                        <span className="material-symbols-outlined text-on-surface-variant/40">calendar_month</span>
                    </div>
                    <div className="flex flex-col gap-2.5 flex-grow justify-between">
                        {weeklyForecastDays.map((fDay, index) => (
                            <div key={fDay.day + index} className={`flex items-center justify-between p-3 rounded-xl transition-colors cursor-default border ${index === 0 ? "bg-primary/5 border-primary/15" : "hover:bg-surface-container-low border-transparent hover:border-outline-variant/20"}`}>
                                <span className="w-20 font-bold text-on-surface text-body-sm">{fDay.day}</span>
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-[22px]">
                                        {getWeatherIcon(fDay.condition)}
                                    </span>
                                    <span className="text-[13px] font-medium text-on-surface-variant">{fDay.high} / {fDay.low}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 text-secondary">
                                        <span className="material-symbols-outlined text-[16px]">water_drop</span>
                                        <span className="text-[12px] font-bold">{fDay.precipChance}</span>
                                    </div>
                                    <div className="w-12 h-1 bg-surface-container rounded-full overflow-hidden hidden sm:block">
                                        <div className="h-full bg-primary" style={{ width: `${Math.min(100, parseInt(fDay.precipChance, 10) || 15)}%` }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Grid 2: Atmospheric Telemetry + AI Engine */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
                <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(15,23,42,0.06)] border border-outline-variant/30 p-6 flex flex-col min-h-[400px]">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-headline-sm">Environmental Telemetry</h3>
                            <p className="text-label-sm text-on-surface-variant/60">Atmospheric Chemistry &amp; Psychrometric Metrics</p>
                        </div>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">Copernicus CAMS</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 flex-grow">
                        <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10 flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-2 text-on-surface-variant/70">
                                <span className="material-symbols-outlined text-[20px]">air</span>
                                <span className="text-label-sm uppercase">Air Quality (AQI)</span>
                            </div>
                            <p className="text-headline-sm font-bold text-secondary">{aqi ?? 42} <span className="text-label-sm font-semibold opacity-60">{aqiStatus?.label || "Good"}</span></p>
                        </div>
                        <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10 flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-2 text-on-surface-variant/70">
                                <span className="material-symbols-outlined text-[20px]">wb_sunny</span>
                                <span className="text-label-sm uppercase">UV Index (NWP)</span>
                            </div>
                            <p className={`text-headline-sm font-bold ${(weather?.uvIndex ?? 3) >= 8 ? "text-error" : (weather?.uvIndex ?? 3) >= 5 ? "text-amber-700" : "text-secondary"}`}>{weather?.uvIndex ?? 3} <span className="text-label-sm font-semibold opacity-60">{(weather?.uvIndex ?? 3) >= 8 ? "High" : (weather?.uvIndex ?? 3) >= 5 ? "Moderate" : "Low"}</span></p>
                        </div>
                        <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10 flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-2 text-on-surface-variant/70">
                                <span className="material-symbols-outlined text-[20px]">psychology</span>
                                <span className="text-label-sm uppercase">Aerosol Opt. Depth</span>
                            </div>
                            <p className="text-headline-sm font-bold text-on-surface">{aodVal}</p>
                        </div>
                        <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10 flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-2 text-on-surface-variant/70">
                                <span className="material-symbols-outlined text-[20px]">visibility</span>
                                <span className="text-label-sm uppercase">Atmospheric Vis</span>
                            </div>
                            <p className="text-headline-sm font-bold text-on-surface">{weather?.visibilityKm ? `${weather.visibilityKm} km` : "10 km"}</p>
                        </div>
                        <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10 flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-2 text-on-surface-variant/70">
                                <span className="material-symbols-outlined text-[20px]">thermostat</span>
                                <span className="text-label-sm uppercase">Heat Index</span>
                            </div>
                            <p className="text-headline-sm font-bold text-on-surface">{weather?.feelsLike || `${Math.round(temperature)}°C`}</p>
                        </div>
                        <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10 flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-2 text-on-surface-variant/70">
                                <span className="material-symbols-outlined text-[20px]">opacity</span>
                                <span className="text-label-sm uppercase">Dew Point</span>
                            </div>
                            <p className="text-headline-sm font-bold text-on-surface">{Math.round(temperature - ((100 - humidity) / 5))}°C</p>
                        </div>
                    </div>
                </div>

                <div className="bg-primary border border-primary-container shadow-[0px_4px_20px_rgba(37,99,235,0.1)] rounded-[16px] p-6 text-white overflow-hidden relative flex flex-col min-h-[400px]">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <span className="material-symbols-outlined text-[200px]">auto_awesome</span>
                    </div>
                    <div className="relative z-10 flex flex-col flex-grow">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                <span className="material-symbols-outlined text-white">memory</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-headline-sm">EcoWatch Intelligence Engine</h3>
                                <p className="text-white/70 text-xs">Synthesis of NWP Weather, CAMS Air Quality &amp; Sentinel-2 Surface Feeds</p>
                            </div>
                        </div>
                        <div className="space-y-4 flex-grow flex flex-col justify-between">
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/10 flex items-start gap-4">
                                <span className="material-symbols-outlined text-white/70 text-[24px]">info</span>
                                <div>
                                    <p className="font-semibold text-body-md">Atmospheric Moisture &amp; Weather Analysis</p>
                                    <p className="text-white/70 text-body-sm mt-1">
                                        Numerical weather prediction (Open-Meteo ECMWF/GFS) indicates atmospheric relative humidity at {humidity}% and {weatherCondition} conditions across {currentLocation || "the sector"}.
                                    </p>
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/10 flex items-start gap-4">
                                <span className="material-symbols-outlined text-white/70 text-[24px]">check_circle</span>
                                <div>
                                    <p className="font-semibold text-body-md">Optical Window &amp; Remote Sensing Feeds</p>
                                    <p className="text-white/70 text-body-sm mt-1">
                                        Copernicus Sentinel-2 MSI and Landsat-9 multispectral radiometers calibrate cloud reflectance ({remoteSensingData?.sceneMetadata?.cloudCoveragePercent ?? 12}%) and optical canopy transmittance ({vegetationClass}) for {currentLocation || "the sector"}.
                                    </p>
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/10 flex items-start gap-4">
                                <span className="material-symbols-outlined text-white/70 text-[24px]">warning</span>
                                <div>
                                    <p className="font-semibold text-body-md">Solar UV &amp; Thermal Exposure</p>
                                    <p className="text-white/70 text-body-sm mt-1">
                                        Solar radiation index measured at {weather?.uvIndex ?? 3} with ambient temperature at {Math.round(temperature)}°C and LST surface thermal at {lstCelsius}°C for {currentLocation || "the sector"}.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Grid 3: Rainfall Analytics + Vegetation Intelligence + Regional Anomaly Alerts */}
            <section className="grid grid-cols-1 gap-gutter lg:grid-cols-3">
                {/* Rainfall Analytics */}
                <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(15,23,42,0.06)] border border-outline-variant/30 p-6 flex flex-col min-h-[400px]">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="font-bold text-headline-sm">Precipitation Analytics</h3>
                            <p className="text-label-sm text-on-surface-variant/60">NWP Model &amp; Radar Estimates (Open-Meteo)</p>
                        </div>
                        <div className="text-right">
                            <p className="text-headline-md font-bold text-primary">{estimatedWeeklyRainMm} mm</p>
                            <p className="text-label-sm text-secondary font-bold">7-Day Cumulative Est.</p>
                        </div>
                    </div>

                    <div className="flex gap-6 mb-8 px-2">
                        <div className="flex flex-col">
                            <span className="text-label-sm text-on-surface-variant/60 uppercase">24h Quantitative Est.</span>
                            <span className="text-body-md font-bold text-on-surface">{estimatedDailyRainMm} mm</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-label-sm text-on-surface-variant/60 uppercase">Precip Probability</span>
                            <span className="text-body-md font-bold text-on-surface">{precipProbStr}</span>
                        </div>
                    </div>

                    <div className="flex-grow flex items-end gap-4 px-2">
                        {weeklyRainDays.map((bar) => (
                            <div key={bar.day} className="flex-1 flex flex-col justify-end h-full group relative">
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-inverse-surface text-white text-[12px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md z-20">
                                    {bar.mm} mm
                                </div>
                                <div
                                    className="w-full bg-primary/60 rounded-t-md transition-all group-hover:bg-primary/90"
                                    style={{ height: `${bar.height}%` }}
                                />
                                <span className="mt-3 text-[12px] text-on-surface-variant font-bold text-center">{bar.day}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Vegetation Intelligence */}
                <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(15,23,42,0.06)] border border-outline-variant/30 p-6 flex flex-col min-h-[400px]">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-headline-sm">Vegetation Intelligence</h3>
                            <p className="text-label-sm text-on-surface-variant/60">Copernicus Sentinel-2 MSI Surface Model</p>
                        </div>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-secondary/10 text-secondary">Sentinel-2 MSI</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-1 gap-6 flex-grow">
                        <div className="p-6 bg-surface-container-low rounded-xl border border-outline-variant/10 flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-3 text-on-surface-variant/70">
                                <span className="material-symbols-outlined text-[24px]">eco</span>
                                <span className="text-label-sm uppercase">Normalized Difference Veg. Index (NDVI)</span>
                            </div>
                            <p className="text-[32px] font-bold text-secondary leading-none">
                                {ndviVal} <span className="text-label-sm font-semibold opacity-60 ml-2">{vegetationClass}</span>
                            </p>
                        </div>
                        <div className="p-6 bg-surface-container-low rounded-xl border border-outline-variant/10 flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-3 text-on-surface-variant/70">
                                <span className="material-symbols-outlined text-[24px]">grass</span>
                                <span className="text-label-sm uppercase">Biomass Density (Sentinel-2 Derived)</span>
                            </div>
                            <p className="text-[32px] font-bold text-on-surface leading-none">
                                {biomassDensity} <span className="text-label-sm font-semibold opacity-60 ml-2">kg/m²</span>
                            </p>
                        </div>
                        <div className="p-6 bg-surface-container-low rounded-xl border border-outline-variant/10 flex flex-col justify-center">
                            <div className="flex items-center gap-2 mb-3 text-on-surface-variant/70">
                                <span className="material-symbols-outlined text-[24px]">water_drop</span>
                                <span className="text-label-sm uppercase">Canopy &amp; Soil Moisture (NDWI Model)</span>
                            </div>
                            <p className="text-[32px] font-bold text-on-surface leading-none">{canopySoilMoisture}%</p>
                        </div>
                    </div>
                </div>

                {/* Regional Anomaly Alerts */}
                <div className="bg-white rounded-[16px] shadow-[0px_4px_20px_rgba(15,23,42,0.06)] border border-outline-variant/30 p-6 flex flex-col min-h-[400px]">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-headline-sm">Regional Anomaly Alerts</h3>
                            <p className="text-label-sm text-on-surface-variant/60">Automated Threat &amp; Variance Detection</p>
                        </div>
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold ${realAlertCount > 0 ? "bg-error/10 text-error" : "bg-secondary/10 text-secondary"}`}>
                            <span className="material-symbols-outlined text-[16px] animate-pulse">
                                {realAlertCount > 0 ? "warning" : "verified"}
                            </span>
                            {realAlertCount > 0 ? `${realAlertCount} Active Signature${realAlertCount > 1 ? "s" : ""}` : "Baseline Nominal"}
                        </div>
                    </div>
                    <div className="space-y-4 flex-grow flex flex-col">
                        {activeSignatures.map((sig) => (
                            <div key={sig.id} className={`anomaly-card flex items-start gap-4 p-4 ${sig.bg} border ${sig.border} rounded-xl flex-grow`}>
                                <div className={`w-10 h-10 ${sig.iconBg} rounded-lg flex items-center justify-center ${sig.iconColor} shrink-0`}>
                                    <span className="material-symbols-outlined text-[22px]">{sig.icon}</span>
                                </div>
                                <div className="flex-grow">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="font-bold text-on-surface text-[15px]">{sig.title}</h4>
                                        <span className="text-[11px] font-bold text-on-surface-variant/60">{sig.sourceTag}</span>
                                    </div>
                                    <p className="text-body-sm text-on-surface-variant/80">{sig.description}</p>
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={() => navigate("/analytics")}
                            className="w-full py-3 mt-auto text-on-surface-variant font-bold text-[14px] border border-outline-variant/30 rounded-xl hover:bg-surface-container-low transition-colors"
                        >
                            View Complete Telemetry Logs &amp; ERI Synthesis
                        </button>
                    </div>
                </div>
            </section>

            <footer className="p-gutter border-t border-outline-variant/10 flex items-center justify-between text-on-surface-variant/40 max-w-[1600px] mx-auto w-full mt-auto py-8">
                <p className="text-label-sm">© 2026 EcoWatch Geo-Based Environmental Intelligence Platform. All Rights Reserved.</p>
                <div className="flex gap-6">
                    <span className="text-label-sm">Open-Meteo NWP ECMWF/GFS</span>
                    <span className="text-label-sm">Copernicus CAMS</span>
                    <span className="text-label-sm">Sentinel-2 MSI &amp; Landsat-9</span>
                </div>
            </footer>
        </DashboardLayout>
    );
}