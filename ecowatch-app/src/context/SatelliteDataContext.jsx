import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { apiRequest, fetchSatelliteRisk } from "../lib/api";

const SatelliteDataContext = createContext(null);

// Geocoding coordinates mapping for common locations
const LOCATION_COORDINATES = {
  "Tirunelveli, Tamil Nadu, India": { lat: 8.7139, lon: 77.7567, temp: 34, aqi: 42, humidity: 68, wind: 14 },
  "San Francisco, CA, USA": { lat: 37.7749, lon: -122.4194, temp: 18, aqi: 28, humidity: 82, wind: 18 },
  "Tokyo, Kanto, Japan": { lat: 35.6762, lon: 139.6503, temp: 24, aqi: 35, humidity: 62, wind: 10 },
  "London, Greater London, UK": { lat: 51.5074, lon: -0.1278, temp: 16, aqi: 31, humidity: 75, wind: 15 },
  "Sydney, NSW, Australia": { lat: -33.8688, lon: 151.2093, temp: 22, aqi: 25, humidity: 55, wind: 16 },
};

export function SatelliteDataProvider({ children }) {
  const [aqi, setAqi] = useState(42);
  const [temperature, setTemperature] = useState(31);
  const [humidity, setHumidity] = useState(68);
  const [windSpeed, setWindSpeed] = useState(14);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState("Waiting for environmental data");
  const [currentLocation, setCurrentLocation] = useState("Tirunelveli, Tamil Nadu, India");
  const [coordinates, setCoordinates] = useState({ lat: 8.7139, lon: 77.7567 });
  const [eriData, setEriData] = useState(null);
  const [remoteSensingData, setRemoteSensingData] = useState(null);
  const [databaseStatus, setDatabaseStatus] = useState(null);
  const [isAcquiringScene, setIsAcquiringScene] = useState(false);
  const coordinatesRef = useRef(coordinates);

  const refreshRisk = async (lat = coordinatesRef.current.lat, lon = coordinatesRef.current.lon) => {
    try {
      const data = await fetchSatelliteRisk(lat, lon);
      if (!data?.offlineFallback) setEriData(data);
    } catch {
      // Keep the calculated risk when telemetry is unavailable.
    }
  };

  const fetchRemoteSensing = async (lat = coordinatesRef.current.lat, lon = coordinatesRef.current.lon) => {
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

  const refreshData = async (lat = coordinatesRef.current.lat, lon = coordinatesRef.current.lon) => {
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

  useEffect(() => {
    refreshData();
    refreshRisk();
    fetchRemoteSensing();
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


  const changeLocation = (locationName, lat, lon) => {
    const known = LOCATION_COORDINATES[locationName];
    const targetLat = Number.isFinite(Number(lat)) ? Number(lat) : known?.lat;
    const targetLon = Number.isFinite(Number(lon)) ? Number(lon) : known?.lon;
    if (!Number.isFinite(targetLat) || !Number.isFinite(targetLon)) return false;

    setCurrentLocation(locationName);
    coordinatesRef.current = { lat: targetLat, lon: targetLon };
    setCoordinates(coordinatesRef.current);
    if (known && !lat && !lon) {
      setTemperature(known.temp);
      setAqi(known.aqi);
      setHumidity(known.humidity);
      setWindSpeed(known.wind);
    }
    setLastUpdated(new Date());
    refreshData(targetLat, targetLon);
    refreshRisk(targetLat, targetLon);
    fetchRemoteSensing(targetLat, targetLon);
    return true;
  };

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
    changeLocation,
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
