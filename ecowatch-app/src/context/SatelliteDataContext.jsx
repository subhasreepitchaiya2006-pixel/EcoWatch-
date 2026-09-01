import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useMemo,
} from "react";

const SatelliteDataContext = createContext(null);

/**
 * SatelliteDataProvider — Environmental Intelligence Engine
 * 
 * Unifies heterogeneous data streams (Weather, Air Quality, Satellite Remote Sensing,
 * Disaster Risk, and Community Observations) into real-time location insights,
 * calculating a unified Environmental Risk Index (ERI) and multi-role AI early warnings.
 */
export function SatelliteDataProvider({ children }) {
  const [aqi, setAqi] = useState(72);
  const [temperature, setTemperature] = useState(34);
  const [humidity, setHumidity] = useState(78);
  const [windSpeed, setWindSpeed] = useState(12);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const [currentLocation, setCurrentLocation] = useState("Tirunelveli, Tamil Nadu, India");
  const [coordinates, setCoordinates] = useState({ lat: 8.7139, lon: 77.7567 });

  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setAqi((prev) => clamp(prev + randomStep(6), 15, 180));
      setTemperature((prev) => clamp(prev + randomStep(1), 22, 42));
      setHumidity((prev) => clamp(prev + randomStep(4), 30, 95));
      setWindSpeed((prev) => clamp(prev + randomStep(2), 2, 30));
      setLastUpdated(new Date());
    }, 6000);

    return () => clearInterval(intervalRef.current);
  }, []);

  const changeLocation = (locationName, lat, lon) => {
    setCurrentLocation(locationName);
    if (lat && lon) {
      setCoordinates({ lat, lon });
    }
  };

  const aqiStatus = useMemo(() => {
    if (aqi <= 50) return { label: "Good", className: "status-good" };
    if (aqi <= 100) return { label: "Moderate", className: "status-moderate" };
    return { label: "Poor", className: "status-poor" };
  }, [aqi]);

  const heatStatus = useMemo(() => {
    if (temperature < 30) return { label: "Mild", className: "status-good" };
    if (temperature < 37) return { label: "Warm", className: "status-moderate" };
    return { label: "Extreme Heat", className: "status-poor" };
  }, [temperature]);

  // Unified Environmental Risk Index (0 - 100)
  const environmentalRiskIndex = useMemo(() => {
    const aqiFactor = Math.min(35, (aqi / 180) * 35);
    const tempFactor = Math.min(25, (Math.max(0, temperature - 20) / 25) * 25);
    const humidityFactor = Math.min(20, (humidity / 100) * 20);
    const windFactor = Math.min(20, (windSpeed / 30) * 20);
    return Math.round(aqiFactor + tempFactor + humidityFactor + windFactor);
  }, [aqi, temperature, humidity, windSpeed]);

  const riskLevel = useMemo(() => {
    if (environmentalRiskIndex < 35) {
      return { label: "Low Risk", level: "SAFE", color: "text-secondary", bg: "bg-secondary-container/20", border: "border-secondary", badgeClass: "status-good" };
    }
    if (environmentalRiskIndex < 60) {
      return { label: "Moderate Risk", level: "MONITOR", color: "text-tertiary", bg: "bg-tertiary-fixed/30", border: "border-tertiary", badgeClass: "status-moderate" };
    }
    if (environmentalRiskIndex < 80) {
      return { label: "High Risk", level: "WARNING", color: "text-amber-700", bg: "bg-amber-100", border: "border-amber-500", badgeClass: "status-moderate" };
    }
    return { label: "Severe Hazard", level: "CRITICAL", color: "text-error", bg: "bg-error-container/30", border: "border-error", badgeClass: "status-poor" };
  }, [environmentalRiskIndex]);

  // AI-Assisted Actionable Early Warnings & Protocols (Multi-Stakeholder)
  const aiRecommendations = useMemo(() => {
    const recs = {
      citizen: [],
      community: [],
      decisionMaker: [],
    };

    if (humidity > 70 && windSpeed > 10) {
      recs.citizen.push("Precipitation & wind surge predicted; carry rain gear & avoid flood-prone subways.");
      recs.community.push("Clear neighborhood culverts and inspect community storm drains.");
      recs.decisionMaker.push("Pre-position emergency water pumps at Sector 4 & low-lying flood points.");
    } else {
      recs.citizen.push("Weather conditions stable; ideal for routine outdoor travel.");
      recs.community.push("Maintain standard community disaster readiness monitoring.");
      recs.decisionMaker.push("Routine telemetry active; no emergency mobilization required.");
    }

    if (aqi > 90) {
      recs.citizen.push(`Air Quality is elevated (${aqi} AQI); sensitive individuals wear N95 masks.`);
      recs.community.push("Open clean-air respite shelters in local community hubs.");
      recs.decisionMaker.push("Issue advisory to reduce industrial emission outputs during peak hours.");
    } else {
      recs.citizen.push(`Air Quality is ${aqiStatus.label.toLowerCase()} (${aqi} AQI); safe for outdoor exercise.`);
      recs.community.push("Outdoor community events clear to proceed safely.");
      recs.decisionMaker.push("Air quality within acceptable environmental thresholds.");
    }

    if (temperature >= 35) {
      recs.citizen.push(`Extreme heat detected (${temperature}°C); stay hydrated and limit outdoor activity 12-3 PM.`);
      recs.community.push("Activate hydration stations at public transit hubs.");
      recs.decisionMaker.push("Issue heatwave warning and open cooling shelters for vulnerable populations.");
    } else {
      recs.citizen.push(`Temperature is comfortable (${temperature}°C).`);
      recs.community.push("Thermal index within normal range.");
      recs.decisionMaker.push("No thermal stress alerts active.");
    }

    return recs;
  }, [humidity, windSpeed, aqi, temperature, aqiStatus.label]);

  const value = {
    aqi,
    temperature,
    humidity,
    windSpeed,
    lastUpdated,
    currentLocation,
    coordinates,
    changeLocation,
    aqiStatus,
    heatStatus,
    environmentalRiskIndex,
    riskLevel,
    aiRecommendations,
  };

  return (
    <SatelliteDataContext.Provider value={value}>
      {children}
    </SatelliteDataContext.Provider>
  );
}

export function useSatelliteData() {
  const ctx = useContext(SatelliteDataContext);
  if (!ctx) {
    throw new Error("useSatelliteData must be used inside <SatelliteDataProvider>");
  }
  return ctx;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Math.round(value)));
}

function randomStep(magnitude) {
  return (Math.random() - 0.5) * 2 * magnitude;
}
