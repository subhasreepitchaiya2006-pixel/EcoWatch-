import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { apiRequest, fetchSatelliteRisk } from "../lib/api";
import safeStorage from "../lib/safeStorage";

const SatelliteDataContext = createContext(null);
const LOCATION_STORAGE_KEY = "ecowatch-location";

function readSavedLocation() {
  try {
    const raw = safeStorage.getItem(LOCATION_STORAGE_KEY, "null");
    const saved = JSON.parse(raw || "null");
    const lat = Number(saved?.coordinates?.lat);
    const lon = Number(saved?.coordinates?.lon);
    if (saved?.name && Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
      return { name: saved.name, coordinates: { lat, lon } };
    }
  } catch {
    return null;
  }
  return null;
}

async function reverseGeocodeLocation(lat, lon) {
  // 1. Try BigDataCloud free client-side reverse geocoding (fast, accurate administrative locality)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (response.ok) {
      const data = await response.json();
      const adminList = Array.isArray(data.localityInfo?.administrative) ? data.localityInfo.administrative : [];
      const districtObj = adminList.find(
        (a) => a.adminLevel === 5 || /district/i.test(a.description || "") || /district/i.test(a.name || "")
      );
      const district = districtObj ? districtObj.name.replace(/\s+district/i, "").trim() : null;
      const place = data.locality || data.city || district || data.principalSubdivision;
      const secondary = (district && district !== place) ? district : null;
      const state = (data.principalSubdivision && data.principalSubdivision !== place && data.principalSubdivision !== secondary) ? data.principalSubdivision : null;
      const country = data.countryName || "";
      const formatted = [place, secondary, state, country].filter(Boolean).filter((v, i, a) => a.indexOf(v) === i).join(", ");
      if (formatted) return formatted;
    }
  } catch {
    // Proceed to next fallback
  }

  // 2. Try Photon Komoot reverse geocoding
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(`https://photon.komoot.io/reverse?lat=${lat}&lon=${lon}&limit=1`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (response.ok) {
      const data = await response.json();
      const properties = data.features?.[0]?.properties || {};
      const sub = properties.name;
      const rawDistrict = properties.city || properties.district || properties.county;
      const district = rawDistrict === "Palayamkottai" ? "Tirunelveli" : rawDistrict;
      const name = [sub, (district && district !== sub) ? district : null, properties.state, properties.country]
        .filter(Boolean)
        .filter((value, index, values) => values.indexOf(value) === index)
        .join(", ");
      if (name) return name;
    }
  } catch {
    // Coordinates remain usable
  }

  return `Monitored Sector (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
}

const DEFAULT_COORDINATES = { lat: 13.0827, lon: 80.2707 };
const DEFAULT_LOCATION_NAME = "Chennai, Tamil Nadu";


export function SatelliteDataProvider({ children }) {
  const [aqi, setAqi] = useState(42);
  const [temperature, setTemperature] = useState(31);
  const [humidity, setHumidity] = useState(68);
  const [windSpeed, setWindSpeed] = useState(14);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState("Waiting for environmental data");
  const [savedLocation] = useState(() => readSavedLocation() || { name: DEFAULT_LOCATION_NAME, coordinates: DEFAULT_COORDINATES });
  const [currentLocation, setCurrentLocation] = useState(savedLocation?.name || DEFAULT_LOCATION_NAME);
  const [coordinates, setCoordinates] = useState(savedLocation?.coordinates || DEFAULT_COORDINATES);
  const [locationStatus, setLocationStatus] = useState("ready");
  const [locationError, setLocationError] = useState(null);
  const [eriData, setEriData] = useState(null);
  const [remoteSensingData, setRemoteSensingData] = useState(null);
  const [databaseStatus, setDatabaseStatus] = useState(null);
  const [isAcquiringScene, setIsAcquiringScene] = useState(false);
  const coordinatesRef = useRef(savedLocation?.coordinates || DEFAULT_COORDINATES);


  const refreshRisk = async (lat = coordinatesRef.current?.lat, lon = coordinatesRef.current?.lon) => {
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
    try {
      const data = await fetchSatelliteRisk(lat, lon);
      if (!data?.offlineFallback) setEriData(data);
    } catch {
      // Keep the calculated risk when telemetry is unavailable.
    }
  };

  const fetchRemoteSensing = async (lat = coordinatesRef.current?.lat, lon = coordinatesRef.current?.lon) => {
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
    try {
      const res = await apiRequest(`/satellite/remote-sensing?lat=${lat}&lon=${lon}`);
      if (res && !res.offlineFallback) {
        setRemoteSensingData(res);
      }
    } catch {
      // Non-fatal
    }
  };

  const acquireScene = async (satelliteId = "Sentinel-2A") => {
    if (!coordinatesRef.current) throw new Error("Choose or detect a location before fetching satellite telemetry.");
    setIsAcquiringScene(true);
    try {
      const res = await apiRequest("/satellite/fetch-scene", {
        method: "POST",
        body: JSON.stringify({
          lat: coordinatesRef.current.lat,
          lon: coordinatesRef.current.lon,
          satelliteId,
        }),
      });
      if (res?.scene) {
        setRemoteSensingData(res.scene);
      }
      return res;
    } finally {
      setIsAcquiringScene(false);
    }
  };

  const refreshDatabaseStatus = async () => {
    try {
      const db = await apiRequest("/database/status");
      if (db && !db.offlineFallback) setDatabaseStatus(db);
    } catch {
      // Non-fatal
    }
  };

  const refreshData = async (lat = coordinatesRef.current?.lat, lon = coordinatesRef.current?.lon) => {
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
    setIsLoading(true);
    try {
      const data = await apiRequest(`/environment?lat=${lat}&lon=${lon}`);
      if (data && !data.offlineFallback) {
        setAqi(data.aqi ?? 42);
        setTemperature(data.temperature ?? 31);
        setHumidity(data.humidity ?? 68);
        setWindSpeed(data.windSpeed ?? 14);
        setDataSource(data.dataSource || "Environmental data source unavailable");
        setLastUpdated(new Date());
        setError(null);
      }
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const changeLocation = (locationName, lat, lon) => {
    const targetLat = Number(lat);
    const targetLon = Number(lon);
    if (!locationName?.trim() || !Number.isFinite(targetLat) || !Number.isFinite(targetLon) || Math.abs(targetLat) > 90 || Math.abs(targetLon) > 180) return false;

    const nextCoordinates = { lat: targetLat, lon: targetLon };
    setCurrentLocation(locationName.trim());
    coordinatesRef.current = nextCoordinates;
    setCoordinates(nextCoordinates);
    setLocationStatus("ready");
    setLocationError(null);
    safeStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify({ name: locationName.trim(), coordinates: nextCoordinates }));
    setLastUpdated(new Date());
    refreshData(targetLat, targetLon);
    refreshRisk(targetLat, targetLon);
    fetchRemoteSensing(targetLat, targetLon);
    return true;
  };

  const requestCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus(coordinatesRef.current ? "ready" : "manual");
      setLocationError("Location detection is unavailable. Search for a place to continue.");
      return Promise.resolve(false);
    }

    setLocationStatus("locating");
    setLocationError(null);
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(async ({ coords: position }) => {
        const name = await reverseGeocodeLocation(position.latitude, position.longitude);
        resolve(changeLocation(name, position.latitude, position.longitude));
      }, (error) => {
        setLocationStatus(coordinatesRef.current ? "ready" : "manual");
        setLocationError(error.code === error.PERMISSION_DENIED
          ? "Location permission was denied. Search for a place to continue."
          : "Could not detect your location. Search for a place to continue.");
        resolve(false);
      }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
    });
  };


  useEffect(() => {
    if (coordinatesRef.current) {
      refreshData();
      refreshRisk();
      fetchRemoteSensing();
    } else {
      requestCurrentLocation();
    }
    refreshDatabaseStatus();

    const refreshInterval = window.setInterval(() => {
      refreshData();
      fetchRemoteSensing();
    }, 30000);

    const riskInterval = window.setInterval(() => {
      refreshRisk();
    }, 30000);

    return () => {
      window.clearInterval(refreshInterval);
      window.clearInterval(riskInterval);
    };
  }, []);

  const aqiStatus = useMemo(() => {
    if (aqi <= 50) return { label: "Good", className: "status-good" };
    if (aqi <= 100) return { label: "Moderate", className: "status-moderate" };
    return { label: "Poor", className: "status-poor" };
  }, [aqi]);

  const heatStatus = useMemo(() => {
    if (temperature < 25) return { label: "Cool", className: "status-good" };
    if (temperature < 33) return { label: "Warm", className: "status-moderate" };
    return { label: "Extreme Heat", className: "status-poor" };
  }, [temperature]);

  const calculatedRiskIndex = useMemo(() => Math.round(
    Math.min(35, (aqi / 180) * 35) + Math.min(25, (Math.max(0, temperature - 15) / 25) * 25) + Math.min(20, (humidity / 100) * 20) + Math.min(20, (windSpeed / 30) * 20)
  ), [aqi, temperature, humidity, windSpeed]);

  const environmentalRiskIndex = eriData?.eriScore ?? calculatedRiskIndex;

  const riskLevel = useMemo(() => {
    if (environmentalRiskIndex < 35) return { label: "Low Risk", level: "SAFE", color: "text-secondary", bg: "bg-secondary-container/20", border: "border-secondary", badgeClass: "status-good" };
    if (environmentalRiskIndex < 60) return { label: "Moderate Risk", level: "MONITOR", color: "text-tertiary", bg: "bg-tertiary-fixed/30", border: "border-tertiary", badgeClass: "status-moderate" };
    if (environmentalRiskIndex < 80) return { label: "High Risk", level: "WARNING", color: "text-amber-700", bg: "bg-amber-100", border: "border-amber-500", badgeClass: "status-moderate" };
    return { label: "Severe Hazard", level: "CRITICAL", color: "text-error", bg: "bg-error-container/30", border: "border-error", badgeClass: "status-poor" };
  }, [environmentalRiskIndex]);

  const aiRecommendations = useMemo(() => ({
    citizen: [humidity > 70 && windSpeed > 10 ? "Precipitation and wind surge predicted; carry rain gear and avoid flood-prone subways." : "Weather conditions stable; ideal for routine outdoor travel.", aqi > 90 ? `Air Quality is elevated (${aqi} AQI); sensitive individuals should wear N95 masks.` : `Air quality is ${aqiStatus.label.toLowerCase()} (${aqi} AQI).`, temperature >= 33 ? `High temperature detected (${temperature}°C); stay hydrated.` : `Temperature is comfortable (${temperature}°C).`],
    community: ["Maintain standard community disaster readiness monitoring.", "Outdoor community events should follow local air-quality guidance.", "Thermal index monitoring is active."],
    decisionMaker: ["Routine telemetry active; review emergency mobilization thresholds.", "Monitor industrial emission outputs during peak hours.", "No thermal stress escalation is active."],
  }), [humidity, windSpeed, aqi, temperature, aqiStatus.label]);

  const value = {
    aqi,
    temperature,
    humidity,
    windSpeed,
    lastUpdated,
    isLoading,
    error,
    dataSource,
    currentLocation,
    coordinates,
    locationStatus,
    locationError,
    changeLocation,
    requestCurrentLocation,
    refreshData,
    aqiStatus,
    heatStatus,
    environmentalRiskIndex,
    riskLevel,
    aiRecommendations,
    eriData,
    remoteSensingData,
    acquireScene,
    isAcquiringScene,
    databaseStatus,
    refreshDatabaseStatus,
    fetchRemoteSensing,
  };
  return <SatelliteDataContext.Provider value={value}>{children}</SatelliteDataContext.Provider>;
}


export function useSatelliteData() {
  const context = useContext(SatelliteDataContext);
  if (!context) throw new Error("useSatelliteData must be used inside <SatelliteDataProvider>");
  return context;
}
