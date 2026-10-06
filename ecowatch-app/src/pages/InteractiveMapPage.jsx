import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import {
  Circle,
  CircleMarker,
  MapContainer,
  Polygon,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from "react-leaflet";
import DashboardLayout from "../layouts/DashboardLayout";
import { useSatelliteData } from "../context/SatelliteDataContext";
import {
  fetchCommunityReports,
  fetchDisasterAlerts,
  fetchSatelliteOrbits,
  fetchSatelliteRisk,
  fetchSatelliteTelemetryData,
  fetchWeather,
} from "../lib/api";
import { useLocationSearch } from "../hooks/useLocationSearch";

const LAYERS = [
  "Precipitation",
  "NDVI (Vegetation)",
  "Temperature",
  "Air Quality (AQI)",
  "Soil Moisture",
  "Community Reports",
  "Hazard Alerts",
];

const DEFAULT_LAYER_STATE = {
  Precipitation: true,
  "NDVI (Vegetation)": true,
  Temperature: false,
  "Air Quality (AQI)": true,
  "Soil Moisture": false,
  "Community Reports": true,
  "Hazard Alerts": true,
  "Satellite View": false,
};

function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

function MapViewport({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && Array.isArray(center) && center.length === 2 && Number.isFinite(center[0]) && Number.isFinite(center[1])) {
      map.setView(center, zoom, { animate: true });
    }
  }, [map, center, zoom]);
  return null;
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng);
      }
    },
  });
  return null;
}

export default function InteractiveMapPage() {
  const navigate = useNavigate();
  const {
    aqi,
    aqiStatus,
    temperature,
    windSpeed,
    humidity,
    currentLocation,
    coordinates,
    locationStatus,
    requestCurrentLocation,
    changeLocation,
    remoteSensingData,
    acquireScene,
    isAcquiringScene,
  } = useSatelliteData();

  const [activeLayers, setActiveLayers] = useState(DEFAULT_LAYER_STATE);
  const [zoom, setZoom] = useState(13);
  const [searchLocation, setSearchLocation] = useState(currentLocation || "");
  const [searchOpen, setSearchOpen] = useState(false);
  const { results: locationResults, isSearching } = useLocationSearch(searchLocation, searchOpen);
  const [selectedSatelliteFilter, setSelectedSatelliteFilter] = useState("All Satellites");
  const [satelliteIdInput, setSatelliteIdInput] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [orbitTracks, setOrbitTracks] = useState([]);
  const [satelliteRisk, setSatelliteRisk] = useState(null);
  const [satelliteTelemetry, setSatelliteTelemetry] = useState(null);
  const [communityReports, setCommunityReports] = useState([]);
  const [hazardAlerts, setHazardAlerts] = useState([]);
  const [weatherData, setWeatherData] = useState(null);
  const [tilesUnavailable, setTilesUnavailable] = useState(false);
  const tileLoadedRef = useRef(false);

  // Interactive Tools state
  // activeTool: null | "measure" | "circle" | "polygon"
  const [activeTool, setActiveTool] = useState(null);
  const [inspectedPoint, setInspectedPoint] = useState(null);
  const [measurePoints, setMeasurePoints] = useState([]);
  const [drawnCircles, setDrawnCircles] = useState([]);
  const [polygonPoints, setPolygonPoints] = useState([]);

  const handleTileLoad = () => {
    tileLoadedRef.current = true;
    setTilesUnavailable(false);
  };

  useEffect(() => {
    if (currentLocation) setSearchLocation(currentLocation);
  }, [currentLocation]);

  // Fetch satellite telemetry, orbits, alerts, community reports, and weather
  useEffect(() => {
    if (!coordinates) return undefined;
    let active = true;

    Promise.all([
      fetchSatelliteOrbits().catch(() => null),
      fetchSatelliteRisk(coordinates.lat, coordinates.lon).catch(() => null),
      fetchSatelliteTelemetryData().catch(() => null),
      fetchCommunityReports().catch(() => null),
      fetchDisasterAlerts().catch(() => null),
      fetchWeather(currentLocation, coordinates.lat, coordinates.lon).catch(() => null),
    ]).then(([orbits, risk, telemetry, reports, alerts, weather]) => {
      if (!active) return;
      if (orbits?.orbitTracks) setOrbitTracks(orbits.orbitTracks);
      if (risk && !risk.offlineFallback) setSatelliteRisk(risk);
      if (telemetry && !telemetry.offlineFallback) setSatelliteTelemetry(telemetry);
      if (reports?.reports) setCommunityReports(reports.reports);
      else if (Array.isArray(reports)) setCommunityReports(reports);
      if (alerts?.alerts) setHazardAlerts(alerts.alerts);
      else if (Array.isArray(alerts)) setHazardAlerts(alerts);
      if (weather && !weather.offlineFallback) setWeatherData(weather);
    });

    return () => {
      active = false;
    };
  }, [coordinates?.lat, coordinates?.lon, currentLocation]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const toggleLayer = (layer) => {
    setActiveLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  // Filtered satellite orbits
  const visibleOrbitTracks = useMemo(() => {
    return orbitTracks.filter((orbit) => {
      if (selectedSatelliteFilter === "Sentinel-2 Optical" && orbit.satelliteId !== "Sentinel-2") return false;
      if (selectedSatelliteFilter === "Landsat-9 Thermal" && orbit.satelliteId !== "Landsat-9") return false;
      if (selectedSatelliteFilter === "GOES-16 Geostationary" && orbit.satelliteId !== "GOES-16") return false;
      if (satelliteIdInput.trim()) {
        const query = satelliteIdInput.toLowerCase().trim();
        const matchesId = orbit.satelliteId?.toLowerCase().includes(query);
        const matchesName = orbit.name?.toLowerCase().includes(query);
        if (!matchesId && !matchesName) return false;
      }
      return true;
    });
  }, [orbitTracks, selectedSatelliteFilter, satelliteIdInput]);

  // Derived telemetry metrics
  const precipProb = parseInt(weatherData?.forecast?.[0]?.precipChance || "15%", 10) || 15;
  const estimatedDailyRainMm = weatherData?.forecast?.[0]?.precipSumMm != null
    ? Number(weatherData.forecast[0].precipSumMm.toFixed(1))
    : Number((precipProb * 0.12).toFixed(1));
  const ndviVal = remoteSensingData?.remoteSensingIndices?.ndvi ?? 0.62;
  const vegetationClass = remoteSensingData?.remoteSensingIndices?.vegetationClass ?? "Healthy Canopy";
  const biomassDensity = (ndviVal * 5.2).toFixed(1);
  const lstCelsius = remoteSensingData?.remoteSensingIndices?.lst ?? (temperature + 2);
  const soilMoistureVal = weatherData?.soilMoisture ?? remoteSensingData?.surfaceAtmosphere?.soilMoisture ?? Math.round(humidity * 0.38);

  // Handle map clicks
  const handleMapClick = (latlng) => {
    const lat = Number(latlng.lat.toFixed(5));
    const lon = Number(latlng.lng.toFixed(5));

    if (activeTool === "measure") {
      setMeasurePoints((prev) => {
        if (prev.length >= 2) return [[lat, lon]];
        const next = [...prev, [lat, lon]];
        if (next.length === 2) {
          const dist = calculateDistanceKm(next[0][0], next[0][1], next[1][0], next[1][1]);
          showToast(`Distance measured: ${dist} km`);
        }
        return next;
      });
    } else if (activeTool === "circle") {
      setDrawnCircles((prev) => [...prev, { center: [lat, lon], radiusMeters: 5000, id: Date.now() }]);
      showToast(`Placed 5 km inspection buffer zone at ${lat}°, ${lon}°`);
    } else if (activeTool === "polygon") {
      setPolygonPoints((prev) => [...prev, [lat, lon]]);
    } else {
      // Inspection mode
      setInspectedPoint({ lat, lon });
      if (coordinates) {
        const dist = calculateDistanceKm(coordinates.lat, coordinates.lon, lat, lon);
        showToast(`Inspecting location • ${dist} km from center sector`);
      }
    }
  };

  const clearAnnotations = () => {
    setActiveTool(null);
    setMeasurePoints([]);
    setDrawnCircles([]);
    setPolygonPoints([]);
    setInspectedPoint(null);
    setActiveLayers((previous) => ({
      ...previous,
      ...Object.fromEntries(LAYERS.map((layer) => [layer, false])),
    }));
    showToast("Cleared map drawings, measurements, and data overlays");
  };

  // Center coordinates array
  const centerPos = coordinates ? [coordinates.lat, coordinates.lon] : [8.7522, 77.7414];
  const [centerLat, centerLon] = centerPos;

  // Active Tool Banner
  const renderToolBanner = () => {
    if (!activeTool) return null;
    return (
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 bg-surface/95 backdrop-blur-md px-4 py-2.5 rounded-full shadow-2xl border border-primary/30 flex items-center gap-3 animate-fade-in text-on-surface">
        <span className="material-symbols-outlined text-primary text-[20px]">
          {activeTool === "measure" ? "straighten" : activeTool === "circle" ? "adjust" : "pentagon"}
        </span>
        <span className="text-body-sm font-semibold">
          {activeTool === "measure" && (
            measurePoints.length === 0
              ? "Click on the map to set the first measurement point."
              : measurePoints.length === 1
              ? "Click a second point on the map to calculate linear distance."
              : `Measured: ${calculateDistanceKm(measurePoints[0][0], measurePoints[0][1], measurePoints[1][0], measurePoints[1][1])} km`
          )}
          {activeTool === "circle" && "Click anywhere on the map to drop a 5 km inspection buffer zone."}
          {activeTool === "polygon" && `Click to add vertices (${polygonPoints.length} added). Click Complete when finished.`}
        </span>
        {activeTool === "polygon" && polygonPoints.length >= 3 && (
          <button
            type="button"
            onClick={() => {
              setActiveTool(null);
              showToast(`Polygon region defined with ${polygonPoints.length} vertices.`);
            }}
            className="px-2.5 py-1 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 transition-all"
          >
            Complete
          </button>
        )}
        <button
          type="button"
          onClick={() => setActiveTool(null)}
          className="text-on-surface-variant hover:text-on-surface p-1 rounded-full transition-colors"
          title="Exit tool"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
    );
  };

  return (
    <DashboardLayout noPadding>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 right-8 z-50 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-secondary-fixed">task_alt</span>
          <span className="text-body-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Floating Active Tool Banner */}
      {renderToolBanner()}

      {/* Full Page Map Canvas Area */}
      <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-surface-container">
        {coordinates ? (
          <MapContainer
            center={centerPos}
            zoom={zoom}
            minZoom={3}
            maxZoom={18}
            className="absolute inset-0 z-0 h-full w-full"
            scrollWheelZoom
          >
            {!activeLayers["Satellite View"] ? (
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                eventHandlers={{ tileerror: () => setTilesUnavailable(true), load: handleTileLoad }}
              />
            ) : (
              <TileLayer
                attribution="Tiles &copy; Esri World Imagery"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                eventHandlers={{ tileerror: () => setTilesUnavailable(true), load: handleTileLoad }}
              />
            )}

            <MapViewport center={centerPos} zoom={zoom} />
            <MapClickHandler onMapClick={handleMapClick} />

            {/* Central Monitored Sector Pin */}
            <CircleMarker
              center={centerPos}
              radius={9}
              pathOptions={{ color: "#ffffff", fillColor: "#004ac6", fillOpacity: 1, weight: 3 }}
            >
              <Popup>
                <div className="p-1 space-y-1">
                  <strong className="block text-[13px] text-on-surface">{currentLocation || "Active Monitored Sector"}</strong>
                  <span className="text-[11px] text-on-surface-variant block">
                    {centerLat.toFixed(4)}° N, {centerLon.toFixed(4)}° E
                  </span>
                  <div className="text-[11px] text-primary font-bold pt-1">
                    Ambient {temperature}°C · AQI {aqi} · ERI {satelliteRisk?.eriScore ? Math.round(satelliteRisk.eriScore) : 48}
                  </div>
                </div>
              </Popup>
            </CircleMarker>

            {/* Layer 1: NWP Precipitation Radar */}
            {activeLayers.Precipitation && (
              <CircleMarker
                center={centerPos}
                radius={68}
                pathOptions={{ color: "#2563eb", fillColor: "#60a5fa", fillOpacity: 0.22, weight: 2, dashArray: "4, 4" }}
              >
                <Popup>
                  <div className="space-y-1 text-xs">
                    <strong className="text-primary text-[13px]">NWP Radar Precipitation Layer</strong>
                    <p className="text-on-surface-variant">Convective probability: <span className="font-bold text-on-surface">{precipProb}%</span></p>
                    <p className="text-on-surface-variant">24h Quantitative Rainfall: <span className="font-bold text-on-surface">{estimatedDailyRainMm} mm</span></p>
                    <p className="text-[10px] text-on-surface-variant/70">ECMWF / GFS High-Resolution Radar Calibration</p>
                  </div>
                </Popup>
              </CircleMarker>
            )}

            {/* Layer 2: Sentinel-2 Vegetation Canopy (NDVI) */}
            {activeLayers["NDVI (Vegetation)"] && (
              <CircleMarker
                center={[centerLat + 0.007, centerLon - 0.008]}
                radius={75}
                pathOptions={{ color: "#15803d", fillColor: "#22c55e", fillOpacity: 0.2, weight: 2 }}
              >
                <Popup>
                  <div className="space-y-1 text-xs">
                    <strong className="text-[#15803d] text-[13px]">Copernicus Sentinel-2 MSI Vegetation Canopy</strong>
                    <p className="text-on-surface-variant">Normalized Diff. Veg. Index (NDVI): <span className="font-bold text-on-surface">{ndviVal}</span></p>
                    <p className="text-on-surface-variant">Canopy Health: <span className="font-bold text-on-surface">{vegetationClass}</span></p>
                    <p className="text-on-surface-variant">Biomass Density: <span className="font-bold text-on-surface">{biomassDensity} kg/m²</span></p>
                  </div>
                </Popup>
              </CircleMarker>
            )}

            {/* Layer 3: Landsat-9 Land Surface Temperature (LST) */}
            {activeLayers.Temperature && (
              <CircleMarker
                center={[centerLat - 0.008, centerLon + 0.007]}
                radius={70}
                pathOptions={{ color: "#c2410c", fillColor: "#f97316", fillOpacity: 0.22, weight: 2 }}
              >
                <Popup>
                  <div className="space-y-1 text-xs">
                    <strong className="text-[#c2410c] text-[13px]">Landsat-9 Thermal Infrared Surface Temperature</strong>
                    <p className="text-on-surface-variant">Land Surface Temperature (LST): <span className="font-bold text-on-surface">{lstCelsius}°C</span></p>
                    <p className="text-on-surface-variant">Ambient Atmospheric Temp: <span className="font-bold text-on-surface">{temperature}°C</span></p>
                    <p className="text-[10px] text-on-surface-variant/70">TIRS-2 Radiometer Radiometric Calibration</p>
                  </div>
                </Popup>
              </CircleMarker>
            )}

            {/* Layer 4: Copernicus CAMS Atmospheric Quality (AQI) */}
            {activeLayers["Air Quality (AQI)"] && (
              <CircleMarker
                center={[centerLat + 0.009, centerLon + 0.011]}
                radius={58}
                pathOptions={{ color: "#d97706", fillColor: "#f59e0b", fillOpacity: 0.24, weight: 2 }}
              >
                <Popup>
                  <div className="space-y-1 text-xs">
                    <strong className="text-[#d97706] text-[13px]">Copernicus CAMS Atmospheric Quality</strong>
                    <p className="text-on-surface-variant">Air Quality Index: <span className="font-bold text-on-surface">{aqi} AQI ({aqiStatus?.label || "Good"})</span></p>
                    <p className="text-on-surface-variant">Sensor: Sentinel-5P TROPOMI Tropospheric Plume</p>
                    <p className="text-[10px] text-on-surface-variant/70">Aerosols &amp; trace gases within safe community standard</p>
                  </div>
                </Popup>
              </CircleMarker>
            )}

            {/* Layer 5: NDWI Surface Hydrology & Soil Moisture */}
            {activeLayers["Soil Moisture"] && (
              <CircleMarker
                center={[centerLat - 0.006, centerLon - 0.009]}
                radius={62}
                pathOptions={{ color: "#0284c7", fillColor: "#38bdf8", fillOpacity: 0.24, weight: 2 }}
              >
                <Popup>
                  <div className="space-y-1 text-xs">
                    <strong className="text-[#0284c7] text-[13px]">Soil Moisture &amp; Surface Hydrology (NDWI)</strong>
                    <p className="text-on-surface-variant">Volumetric Soil Water: <span className="font-bold text-on-surface">{soilMoistureVal}%</span></p>
                    <p className="text-on-surface-variant">NDWI Hydrological Index: <span className="font-bold text-on-surface">{remoteSensingData?.remoteSensingIndices?.ndwi ?? 0.18}</span></p>
                    <p className="text-[10px] text-on-surface-variant/70">Sentinel-2 SWIR / NIR Radiometric Absorption Model</p>
                  </div>
                </Popup>
              </CircleMarker>
            )}

            {/* Layer 6: Community Reports Pinned on Map */}
            {activeLayers["Community Reports"] && communityReports.map((report) => {
              const rLat = report.coordinates?.lat || (centerLat + ((report.id % 7 - 3) * 0.008));
              const rLon = report.coordinates?.lon || (centerLon + (((report.id * 3) % 7 - 3) * 0.008));
              return (
                <CircleMarker
                  key={`report-${report.id}`}
                  center={[rLat, rLon]}
                  radius={8}
                  pathOptions={{ color: "#ffffff", fillColor: "#7c3aed", fillOpacity: 0.95, weight: 2 }}
                >
                  <Popup>
                    <div className="space-y-1 text-xs max-w-[200px]">
                      <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">Community Report</span>
                      <strong className="block text-[13px] text-on-surface">{report.title}</strong>
                      <p className="text-on-surface-variant text-[11px]">{report.description}</p>
                      <p className="text-[10px] text-on-surface-variant/70">Category: {report.category} · Status: {report.status}</p>
                      <button
                        type="button"
                        onClick={() => navigate("/community-reports")}
                        className="mt-1 w-full bg-[#7c3aed] text-white py-1 rounded text-[11px] font-bold hover:bg-[#6d28d9] transition-all"
                      >
                        Inspect in Community Hub
                      </button>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}

            {/* Layer 7: Regional Hazard Alerts */}
            {activeLayers["Hazard Alerts"] && hazardAlerts.map((alert, idx) => {
              const aLat = centerLat + ((idx === 0 ? 0.012 : idx === 1 ? -0.014 : 0.008));
              const aLon = centerLon + ((idx === 0 ? -0.015 : idx === 1 ? 0.018 : 0.012));
              const isCrit = alert.severity === "CRITICAL";
              return (
                <CircleMarker
                  key={`alert-${alert.id || idx}`}
                  center={[aLat, aLon]}
                  radius={isCrit ? 11 : 9}
                  pathOptions={{
                    color: "#ffffff",
                    fillColor: isCrit ? "#ba1a1a" : "#d97706",
                    fillOpacity: 0.95,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <div className="space-y-1 text-xs max-w-[210px]">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${isCrit ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                        {alert.severity || "WARNING"}
                      </span>
                      <strong className="block text-[13px] text-on-surface">{alert.type}</strong>
                      <p className="text-on-surface-variant text-[11px]">{alert.description}</p>
                      <p className="text-[10px] text-on-surface-variant/70">Region: {alert.region} · Sensor: {alert.detectedBy}</p>
                      <button
                        type="button"
                        onClick={() => navigate("/disaster-alerts")}
                        className="mt-1 w-full bg-[#ba1a1a] text-white py-1 rounded text-[11px] font-bold hover:bg-[#93000a] transition-all"
                      >
                        Open Disaster Center
                      </button>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}

            {/* Live Satellite Orbits & Trajectories */}
            {visibleOrbitTracks.map((orbit) => {
              const hasPath = Array.isArray(orbit.path) && orbit.path.length > 1;
              const polyPoints = hasPath ? orbit.path.map((p) => [p.lat, p.lon]) : [];
              return (
                <React.Fragment key={orbit.satelliteId}>
                  {hasPath && (
                    <Polyline
                      positions={polyPoints}
                      pathOptions={{ color: "#004ac6", weight: 2, dashArray: "6, 6", opacity: 0.5 }}
                    />
                  )}
                  <CircleMarker
                    center={[orbit.currentLat, orbit.currentLon]}
                    radius={8}
                    pathOptions={{ color: "#ffffff", fillColor: "#004ac6", fillOpacity: 0.95, weight: 2.5 }}
                  >
                    <Popup>
                      <div className="space-y-1 text-xs">
                        <span className="bg-blue-100 text-[#004ac6] text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">Active Constellation Orbit</span>
                        <strong className="block text-[13px] text-on-surface">{orbit.name || orbit.satelliteId}</strong>
                        <p className="text-on-surface-variant">Orbital Altitude: <span className="font-bold text-on-surface">{orbit.altitudeKm} km LEO</span></p>
                        <p className="text-on-surface-variant">Orbital Velocity: <span className="font-bold text-on-surface">{orbit.velocityKmh} km/h</span></p>
                        <p className="text-[10px] text-on-surface-variant/70">Coordinates: {orbit.currentLat.toFixed(2)}°, {orbit.currentLon.toFixed(2)}°</p>
                        <p className="text-[10px] text-[#006c49] font-bold">✓ Telemetry Downlink Synchronized</p>
                      </div>
                    </Popup>
                  </CircleMarker>
                </React.Fragment>
              );
            })}

            {/* Clicked Inspection Marker */}
            {inspectedPoint && (
              <CircleMarker
                center={[inspectedPoint.lat, inspectedPoint.lon]}
                radius={8}
                pathOptions={{ color: "#ba1a1a", fillColor: "#ef4444", fillOpacity: 0.9, weight: 2 }}
              >
                <Popup>
                  <div className="space-y-1.5 text-xs max-w-[210px]">
                    <strong className="block text-[13px] text-on-surface">Inspected Location</strong>
                    <p className="text-on-surface-variant">Coordinates: {inspectedPoint.lat}° N, {inspectedPoint.lon}° E</p>
                    <p className="text-on-surface-variant">
                      Offset from center: <span className="font-bold text-primary">{calculateDistanceKm(centerLat, centerLon, inspectedPoint.lat, inspectedPoint.lon)} km</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        changeLocation(`Sector ${inspectedPoint.lat}, ${inspectedPoint.lon}`, inspectedPoint.lat, inspectedPoint.lon);
                        showToast(`Set monitored sector to ${inspectedPoint.lat}, ${inspectedPoint.lon}`);
                        setInspectedPoint(null);
                      }}
                      className="w-full bg-primary text-white py-1.5 rounded text-[11px] font-bold hover:bg-primary/90 transition-all shadow"
                    >
                      Focus Monitored Sector Here
                    </button>
                  </div>
                </Popup>
              </CircleMarker>
            )}

            {/* Drawn Distance Measurement Line */}
            {measurePoints.length >= 2 && (
              <Polyline
                positions={measurePoints}
                pathOptions={{ color: "#ba1a1a", weight: 3, dashArray: "4, 6" }}
              >
                <Tooltip permanent direction="center" className="measurement-tooltip font-bold text-xs bg-inverse-surface text-white px-2 py-0.5 rounded shadow">
                  {calculateDistanceKm(measurePoints[0][0], measurePoints[0][1], measurePoints[1][0], measurePoints[1][1])} km
                </Tooltip>
              </Polyline>
            )}

            {/* Drawn Inspection Circles */}
            {drawnCircles.map((c) => (
              <Circle
                key={c.id}
                center={c.center}
                radius={c.radiusMeters}
                pathOptions={{ color: "#7c3aed", fillColor: "#a855f7", fillOpacity: 0.2, weight: 2 }}
              >
                <Popup>
                  <div className="text-xs space-y-1">
                    <strong className="text-purple-700">Inspection Buffer Zone</strong>
                    <p>Radius: 5.0 km</p>
                    <p>Ground Area: ~78.5 km²</p>
                  </div>
                </Popup>
              </Circle>
            ))}

            {/* Drawn Polygon Area */}
            {polygonPoints.length >= 3 && (
              <Polygon
                positions={polygonPoints}
                pathOptions={{ color: "#004ac6", fillColor: "#3b82f6", fillOpacity: 0.25, weight: 2 }}
              >
                <Popup>
                  <div className="text-xs space-y-1">
                    <strong className="text-primary">Defined Geodesic Boundary</strong>
                    <p>Vertices: {polygonPoints.length}</p>
                    <p className="text-[10px] text-on-surface-variant">Custom environmental observation zone</p>
                  </div>
                </Popup>
              </Polygon>
            )}
          </MapContainer>
        ) : (
          <div className="absolute inset-0 z-0 flex flex-col items-center justify-center gap-4 bg-surface-container-low text-center">
            <p className="text-body-md text-on-surface-variant">
              {locationStatus === "locating" ? "Finding your live location..." : "Choose or share a location to load the map."}
            </p>
            {locationStatus !== "locating" && (
              <button
                type="button"
                onClick={requestCurrentLocation}
                className="rounded-lg bg-primary px-4 py-2 font-label-md text-on-primary hover:bg-primary/90 transition-all shadow"
              >
                Use current location
              </button>
            )}
          </div>
        )}

        {tilesUnavailable && (
          <div className="absolute bottom-6 right-6 z-[20] flex items-center gap-2 rounded-lg bg-surface/95 px-3 py-1.5 text-xs text-on-surface-variant shadow-md border border-outline-variant/40 backdrop-blur">
            <span className="material-symbols-outlined text-[16px] text-amber-500">wifi_off</span>
            <span>Offline mode · Showing markers & telemetry</span>
            <button
              type="button"
              onClick={() => setTilesUnavailable(false)}
              className="text-on-surface-variant hover:text-on-surface ml-1 text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Left Control Column: Search, Satellite Feed Filter & Location Intelligence Card */}
        <div className="absolute top-6 left-6 z-20 flex flex-col gap-2.5 w-[340px] max-h-[calc(100%-48px)] overflow-y-auto custom-scrollbar pr-1">
          {/* Search Box */}
          <div className="map-overlay relative z-30 bg-white/95 backdrop-blur rounded-xl shadow-lg border border-outline-variant/10 px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => {
                  setSearchLocation(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                placeholder="Search district, city or coordinate..."
                className="w-full bg-transparent border-none outline-none text-body-sm font-medium text-on-surface"
              />
            </div>
            <button
              type="button"
              title="Use current GPS location"
              onClick={requestCurrentLocation}
              className="rounded-md p-1 text-primary hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined text-[19px]">my_location</span>
            </button>
            <button
              type="button"
              onClick={() => showToast("Inspection layer controls ready")}
              className="p-1 hover:bg-surface-container rounded-lg text-on-surface-variant transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">tune</span>
            </button>
          </div>

          {/* Autocomplete Dropdown */}
          {searchOpen && locationResults.length > 0 && (
            <div className="relative z-40 -mt-2 overflow-hidden rounded-lg border border-outline-variant bg-white shadow-xl max-h-60 overflow-y-auto">
              {locationResults.map((result) => (
                <button
                  key={result.id}
                  type="button"
                  onClick={() => {
                    changeLocation(result.label, result.lat, result.lon);
                    setSearchLocation(result.label);
                    setSearchOpen(false);
                    showToast(`Centered on ${result.label}`);
                  }}
                  className="block w-full border-b border-outline-variant/30 px-3 py-2 text-left last:border-b-0 hover:bg-surface-container transition-colors"
                >
                  <span className="block text-label-sm font-semibold text-on-surface">{result.label}</span>
                  <span className="block text-[11px] text-on-surface-variant">
                    {result.lat.toFixed(4)}° N, {result.lon.toFixed(4)}° E
                  </span>
                </button>
              ))}
            </div>
          )}
          {searchOpen && isSearching && (
            <div className="relative z-40 -mt-2 rounded-lg bg-white px-3 py-2 text-[11px] text-outline shadow">
              Searching global coordinates...
            </div>
          )}

          {/* Satellite Feed Filter Bar */}
          <div className="map-overlay bg-white/95 backdrop-blur rounded-xl shadow-lg border border-outline-variant/10 px-3 py-2 flex items-center gap-2 text-body-xs">
            <div className="flex items-center gap-1 text-on-surface font-medium cursor-pointer">
              <span className="material-symbols-outlined text-[#004ac6] text-[18px]">satellite_alt</span>
              <select
                value={selectedSatelliteFilter}
                onChange={(e) => setSelectedSatelliteFilter(e.target.value)}
                className="bg-transparent border-none outline-none text-body-xs font-medium text-on-surface cursor-pointer"
              >
                <option>All Satellites</option>
                <option>Sentinel-2 Optical</option>
                <option>Landsat-9 Thermal</option>
                <option>GOES-16 Geostationary</option>
              </select>
            </div>
            <div className="h-4 w-[1px] bg-outline-variant/30" />
            <div className="flex items-center gap-1.5 flex-1">
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">radar</span>
              <input
                type="text"
                value={satelliteIdInput}
                onChange={(e) => setSatelliteIdInput(e.target.value)}
                placeholder="Filter by satellite ID..."
                className="w-full bg-transparent border-none outline-none text-body-xs text-on-surface"
              />
            </div>
          </div>

          {/* Location Intelligence Card */}
          <div className="map-overlay bg-white rounded-2xl shadow-2xl overflow-hidden border border-outline-variant/10 w-full mt-0.5">
            {/* Header Banner */}
            <div className="bg-[#004ac6] text-white p-4">
              <h3 className="font-headline-sm text-headline-sm text-white font-bold leading-tight">
                {currentLocation || "Target Sector"}
              </h3>
              <p className="text-[12px] text-white/80 mt-0.5">
                {coordinates
                  ? `Spatial Telemetry • ${Math.abs(coordinates.lat).toFixed(4)}° ${coordinates.lat < 0 ? "S" : "N"}, ${Math.abs(coordinates.lon).toFixed(4)}° ${coordinates.lon < 0 ? "W" : "E"}`
                  : "Location is not set"}
              </p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/20 text-[11px] text-white/90">
                <span>ERI Risk Index: <strong className="text-white">{satelliteRisk?.eriScore ? Math.round(satelliteRisk.eriScore) : 48}/100</strong></span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {satelliteTelemetry?.constellationStatus || "Constellation Active"}
                </span>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-4 space-y-3">
              {/* 2x2 Metrics Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-[#f2f4f6] p-3 rounded-xl">
                  <p className="text-[11px] font-medium text-on-surface-variant">Temperature</p>
                  <p className="text-[18px] font-bold text-[#004ac6]">{weatherData?.temperature ?? temperature}°C</p>
                </div>
                <div className="bg-[#f2f4f6] p-3 rounded-xl">
                  <p className="text-[11px] font-medium text-on-surface-variant">Air Quality (AQI)</p>
                  <p className="text-[18px] font-bold text-[#006c49]">{aqi} ({aqiStatus?.label || "Good"})</p>
                </div>
                <div className="bg-[#f2f4f6] p-3 rounded-xl">
                  <p className="text-[11px] font-medium text-on-surface-variant">Wind Velocity</p>
                  <p className="text-[18px] font-bold text-[#004ac6]">{weatherData?.windSpeed ?? windSpeed} km/h</p>
                </div>
                <div className="bg-[#f2f4f6] p-3 rounded-xl">
                  <p className="text-[11px] font-medium text-on-surface-variant">Precipitation</p>
                  <p className="text-[18px] font-bold text-primary">{estimatedDailyRainMm} mm</p>
                </div>
              </div>

              {/* Remote Sensing Spectral Indices */}
              <div className="grid grid-cols-2 gap-2 bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/20 text-xs">
                <div>
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase">NDVI Canopy</span>
                  <p className="font-extrabold text-[#15803d]">{ndviVal} ({vegetationClass})</p>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase">NDWI Water</span>
                  <p className="font-extrabold text-[#0284c7]">{remoteSensingData?.remoteSensingIndices?.ndwi ?? 0.18}</p>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase">NDBI Built-Up</span>
                  <p className="font-extrabold text-amber-600">{remoteSensingData?.remoteSensingIndices?.ndbi ?? 0.12}</p>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase">LST Heat Index</span>
                  <p className="font-extrabold text-error">{lstCelsius}°C</p>
                </div>
              </div>

              {/* AI Environmental Intelligence Box */}
              <div className="bg-[#2563eb]/5 border border-[#2563eb]/20 p-3 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-[#004ac6]">
                  <span className="material-symbols-outlined text-[16px]">psychology</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider">AI Environmental Intelligence</span>
                </div>
                <h4 className="font-label-md font-bold text-on-surface text-[13px]">
                  {satelliteRisk?.category || remoteSensingData?.environmentalRisk?.riskCategory || "Satellite Telemetry Active"}
                </h4>
                <p className="text-[11px] text-on-surface-variant leading-snug">
                  {satelliteRisk?.summary || remoteSensingData?.environmentalRisk?.summary || "Sentinel-2 & Landsat-9 radiometric indices within safe regional tolerances."}
                </p>
              </div>

              {/* Action Buttons: Live Satellite Scene Fetch, Sector Report, and Forecast */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={async () => {
                    showToast(`Acquiring live ${selectedSatelliteFilter} telemetry...`);
                    const res = await acquireScene(selectedSatelliteFilter);
                    showToast(`✓ Downlinked scene ${res?.scene?.sceneMetadata?.sceneId || "S2A-PASS-ACQUIRED"}`);
                  }}
                  disabled={isAcquiringScene}
                  className="w-full bg-[#004ac6] text-white py-2 rounded-xl font-bold text-[12px] flex items-center justify-center gap-1.5 hover:bg-[#2563eb] active:scale-95 transition-all shadow-md disabled:opacity-50 cursor-pointer"
                >
                  <span className={`material-symbols-outlined text-[16px] ${isAcquiringScene ? "animate-spin" : ""}`}>
                    {isAcquiringScene ? "sync" : "satellite_alt"}
                  </span>
                  {isAcquiringScene ? "Acquiring Orbital Scene..." : "Fetch Live Satellite Telemetry"}
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={!coordinates}
                    onClick={() => navigate(`/reports?lat=${coordinates.lat}&lon=${coordinates.lon}&type=sector`)}
                    className="border border-[#004ac6] text-[#004ac6] py-2 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1 hover:bg-[#004ac6]/10 active:scale-95 transition-all disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">lab_profile</span>
                    Generate Report
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/weather")}
                    className="bg-surface-container border border-outline-variant/30 text-on-surface py-2 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1 hover:bg-surface-container-high active:scale-95 transition-all cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">cloud</span>
                    Forecast
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top-Right Drawing / Measurement Toolbar */}
        <div className="map-overlay absolute top-6 right-6 z-[90] bg-white/95 backdrop-blur p-2 rounded-2xl shadow-xl border border-outline-variant/10 flex flex-col gap-2 items-center w-11">
          <button
            type="button"
            onClick={() => {
              if (activeTool === "polygon") {
                setActiveTool(null);
              } else {
                setActiveTool("polygon");
                setPolygonPoints([]);
                showToast("Polygon tool selected. Click on map to add vertices.");
              }
            }}
            className={`p-1.5 rounded-lg transition-all ${activeTool === "polygon" ? "bg-[#004ac6] text-white shadow-md" : "text-on-surface-variant hover:bg-surface-container"}`}
            title="Polygon Select Tool"
          >
            <span className="material-symbols-outlined text-[20px]">pentagon</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (activeTool === "circle") {
                setActiveTool(null);
              } else {
                setActiveTool("circle");
                showToast("Circle Buffer tool selected. Click on map to drop 5 km inspection zone.");
              }
            }}
            className={`p-1.5 rounded-lg transition-all ${activeTool === "circle" ? "bg-[#004ac6] text-white shadow-md" : "text-on-surface-variant hover:bg-surface-container"}`}
            title="Circle Inspection Buffer"
          >
            <span className="material-symbols-outlined text-[20px]">adjust</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (activeTool === "measure") {
                setActiveTool(null);
              } else {
                setActiveTool("measure");
                setMeasurePoints([]);
                showToast("Distance measure tool active. Click two points on map.");
              }
            }}
            className={`p-1.5 rounded-lg transition-all ${activeTool === "measure" ? "bg-[#004ac6] text-white shadow-md" : "text-on-surface-variant hover:bg-surface-container"}`}
            title="Linear Distance Measure"
          >
            <span className="material-symbols-outlined text-[20px]">straighten</span>
          </button>
          <button
            type="button"
            onClick={clearAnnotations}
            className="p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant transition-colors border-t border-outline-variant/20 pt-2"
            title="Clear all map drawings, measurements, and data overlays"
            aria-label="Clear all map drawings, measurements, and data overlays"
          >
            <span className="material-symbols-outlined text-[20px]">visibility_off</span>
          </button>
        </div>

        {/* Top-Right Floating "Map Layers" Card */}
        <div className="absolute top-6 right-20 z-20 w-[240px]">
          <div className="map-overlay bg-white/95 backdrop-blur rounded-2xl shadow-xl p-4 border border-outline-variant/10 space-y-3">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Map Layers</h3>
              <span className="material-symbols-outlined text-on-surface-variant">layers</span>
            </div>

            <div className="space-y-1.5">
              {LAYERS.map((layer) => (
                <label key={layer} className="flex items-center justify-between cursor-pointer py-1 px-1 rounded hover:bg-surface-container-low transition-colors">
                  <span className="text-body-sm text-on-surface-variant hover:text-on-surface transition-colors font-medium">
                    {layer}
                  </span>
                  <input
                    type="checkbox"
                    checked={!!activeLayers[layer]}
                    onChange={() => toggleLayer(layer)}
                    className="h-4 w-4 rounded border-outline-variant text-[#004ac6] focus:ring-[#004ac6] cursor-pointer"
                  />
                </label>
              ))}
            </div>

            <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between">
              <span className="text-body-sm font-bold text-on-surface">Satellite Imagery</span>
              <button
                type="button"
                onClick={() => toggleLayer("Satellite View")}
                className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${
                  activeLayers["Satellite View"] ? "bg-[#004ac6]" : "bg-surface-container-highest"
                }`}
              >
                <span
                  className={`absolute top-[2px] left-[2px] bg-white rounded-full h-4 w-4 transition-transform ${
                    activeLayers["Satellite View"] ? "translate-x-5" : ""
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Right Vertical Zoom Control Strip */}
        <div className="map-overlay absolute top-[280px] right-6 z-20 bg-white/95 backdrop-blur rounded-xl shadow-lg border border-outline-variant/10 flex flex-col items-center divide-y divide-outline-variant/20 w-11">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(18, z + 1))}
            className="p-2 hover:bg-surface-container text-on-surface transition-colors"
            title="Zoom In"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(3, z - 1))}
            className="p-2 hover:bg-surface-container text-on-surface transition-colors"
            title="Zoom Out"
          >
            <span className="material-symbols-outlined text-[20px]">remove</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setZoom(13);
              showToast("Reset map view to default sector");
            }}
            className="p-2 hover:bg-surface-container text-on-surface-variant transition-colors"
            title="Recenter Sector"
          >
            <span className="material-symbols-outlined text-[18px]">center_focus_strong</span>
          </button>
        </div>

        {/* Bottom-Right Dynamic Telemetry Legend Card */}
        <div className="absolute bottom-20 right-6 z-20 w-[220px]">
          <div className="map-overlay bg-white/95 backdrop-blur rounded-xl shadow-lg p-3.5 border border-outline-variant/10 space-y-2">
            <h4 className="font-label-sm font-bold text-on-surface">
              {activeLayers["NDVI (Vegetation)"]
                ? "Vegetation Index (NDVI)"
                : activeLayers["Air Quality (AQI)"]
                ? "Air Quality Scale (AQI)"
                : activeLayers.Temperature
                ? "Thermal LST Scale"
                : activeLayers.Precipitation
                ? "NWP Convective Radar"
                : "Multi-Source Sensor Telemetry"}
            </h4>

            {activeLayers["NDVI (Vegetation)"] ? (
              <div className="space-y-1 text-[11px] text-on-surface-variant">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-emerald-600" /><span>Dense Canopy (&gt; 0.6)</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-lime-500" /><span>Moderate Shrub (0.3 - 0.6)</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-amber-400" /><span>Sparse / Barren (&lt; 0.3)</span></div>
                <div className="w-full h-1.5 rounded-full bg-gradient-to-r from-amber-400 via-lime-500 to-emerald-600 mt-2" />
              </div>
            ) : activeLayers["Air Quality (AQI)"] ? (
              <div className="space-y-1 text-[11px] text-on-surface-variant">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-emerald-600" /><span>Good (0 - 50)</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-amber-500" /><span>Moderate (51 - 100)</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-red-600" /><span>Unhealthy (101+)</span></div>
                <div className="w-full h-1.5 rounded-full bg-gradient-to-r from-emerald-600 via-amber-500 to-red-600 mt-2" />
              </div>
            ) : activeLayers.Temperature ? (
              <div className="space-y-1 text-[11px] text-on-surface-variant">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-sky-500" /><span>Cool (&lt; 25°C)</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-amber-500" /><span>Normal (25° - 34°C)</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-red-600" /><span>Thermal Stress (&gt; 34°C)</span></div>
                <div className="w-full h-1.5 rounded-full bg-gradient-to-r from-sky-500 via-amber-500 to-red-600 mt-2" />
              </div>
            ) : (
              <div className="space-y-1 text-[11px] text-on-surface-variant">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-blue-500" /><span>NWP Convective Radar</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-purple-600" /><span>Community Citizen Report</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-red-600" /><span>Hazard Warning Signal</span></div>
                <div className="w-full h-1.5 rounded-full bg-gradient-to-r from-blue-500 via-purple-600 to-red-600 mt-2" />
              </div>
            )}
          </div>
        </div>

        {/* Bottom-Right Floating "Report Incident" Button */}
        <button
          type="button"
          onClick={() => navigate("/community-reports")}
          className="absolute bottom-6 right-6 z-30 bg-[#004ac6] text-white px-5 py-2.5 rounded-full font-bold font-label-md shadow-xl flex items-center gap-2 hover:bg-[#2563eb] active:scale-95 transition-all cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px]">add_alert</span>
          Report Incident
        </button>
      </div>
    </DashboardLayout>
  );
}
