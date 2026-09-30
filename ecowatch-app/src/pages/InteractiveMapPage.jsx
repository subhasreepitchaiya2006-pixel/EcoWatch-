import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import DashboardLayout from "../layouts/DashboardLayout";
import { useSatelliteData } from "../context/SatelliteDataContext";
import { fetchSatelliteOrbits, fetchSatelliteRisk, fetchSatelliteTelemetryData } from "../lib/api";
import { useLocationSearch } from "../hooks/useLocationSearch";

const LAYERS = [
  "Precipitation",
  "NDVI (Vegetation)",
  "Temperature",
  "Air Quality (AQI)",
  "Soil Moisture",
];

const DEFAULT_LAYER_STATE = {
  Precipitation: true,
  "NDVI (Vegetation)": false,
  Temperature: false,
  "Air Quality (AQI)": false,
  "Soil Moisture": false,
  "Satellite View": false,
};

function getHazardMarkers([lat, lon]) {
  return [
    { position: [lat + 0.012, lon - 0.015], title: "Thermal Hotspot Anomaly", description: "Landsat-9 infrared thermal variance (Level 4)", color: "#ba1a1a" },
    { position: [lat - 0.014, lon + 0.018], title: "Atmospheric NO2 Concentration", description: "Sentinel-5P elevated combustion column", color: "#d97706" },
    { position: [lat + 0.008, lon + 0.012], title: "Environmental Safe Zone", description: "Copernicus Air Quality Standard Hub", color: "#006c49" },
  ];
}

function MapViewport({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    map.setZoom(zoom);
    map.setView(center, zoom);
  }, [map, center, zoom]);

  return null;
}

function MapMarkers({ activeLayers, orbitTracks = [], center }) {
  const [latitude, longitude] = center;
  const hazardMarkers = getHazardMarkers(center);
  return (
    <>
      {hazardMarkers.map((marker) => (
        <CircleMarker
          key={marker.title}
          center={marker.position}
          radius={10}
          pathOptions={{ color: marker.color, fillColor: marker.color, fillOpacity: 0.8, weight: 3 }}
        >
          <Popup>
            <strong>{marker.title}</strong>
            <br />
            {marker.description}
          </Popup>
        </CircleMarker>
      ))}

      {activeLayers.Precipitation && (
        <CircleMarker center={center} radius={52} pathOptions={{ color: "#2563eb", fillColor: "#60a5fa", fillOpacity: 0.2, weight: 1 }} />
      )}
      {activeLayers["Air Quality (AQI)"] && (
        <CircleMarker center={[latitude + 0.01, longitude + 0.01]} radius={34} pathOptions={{ color: "#d97706", fillColor: "#fbbf24", fillOpacity: 0.25, weight: 1 }} />
      )}
      {orbitTracks.map((orbit) => (
        <CircleMarker key={orbit.satelliteId} center={[orbit.currentLat, orbit.currentLon]} radius={6} pathOptions={{ color: "#004ac6", fillColor: "#60a5fa", fillOpacity: 0.9 }}>
          <Popup>{orbit.satelliteId} live orbital position</Popup>
        </CircleMarker>
      ))}
    </>
  );
}

export default function InteractiveMapPage() {
  const navigate = useNavigate();
  const {
    aqi,
    aqiStatus,
    temperature,
    windSpeed,
    currentLocation,
    coordinates,
    changeLocation,
    remoteSensingData,
    acquireScene,
    isAcquiringScene,
  } = useSatelliteData();

  const [activeLayers, setActiveLayers] = useState(DEFAULT_LAYER_STATE);
  const [zoom, setZoom] = useState(13);
  const [searchLocation, setSearchLocation] = useState(currentLocation);
  const [searchOpen, setSearchOpen] = useState(false);
  const { results: locationResults, isSearching } = useLocationSearch(searchLocation, searchOpen);
  const [selectedSatelliteFilter, setSelectedSatelliteFilter] = useState("All Satellites");
  const [satelliteIdInput, setSatelliteIdInput] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [orbitTracks, setOrbitTracks] = useState([]);
  const [satelliteRisk, setSatelliteRisk] = useState(null);
  const [satelliteTelemetry, setSatelliteTelemetry] = useState(null);
  const [tilesUnavailable, setTilesUnavailable] = useState(false);
  const tileLoadedRef = useRef(false);

  useEffect(() => {
    const fallbackTimer = window.setTimeout(() => {
      if (!tileLoadedRef.current) setTilesUnavailable(true);
    }, 3500);
    return () => window.clearTimeout(fallbackTimer);
  }, []);

  const handleTileLoad = () => {
    tileLoadedRef.current = true;
    setTilesUnavailable(false);
  };

  useEffect(() => {
    Promise.all([fetchSatelliteOrbits(), fetchSatelliteRisk(), fetchSatelliteTelemetryData()])
      .then(([orbits, risk, telemetry]) => {
        if (!orbits?.offlineFallback) setOrbitTracks(orbits.orbitTracks || []);
        if (!risk?.offlineFallback) setSatelliteRisk(risk);
        if (!telemetry?.offlineFallback) setSatelliteTelemetry(telemetry);
      })
      .catch(() => {});
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const toggleLayer = (layer) => {
    setActiveLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
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

      {/* Full Page Map Canvas Area */}
      <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-surface-container">
        <MapContainer center={[coordinates.lat, coordinates.lon]} zoom={zoom} minZoom={3} maxZoom={18} className="absolute inset-0 z-0 h-full w-full" scrollWheelZoom>
          {!activeLayers["Satellite View"] ? (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              eventHandlers={{ tileerror: () => setTilesUnavailable(true), load: handleTileLoad }}
            />
          ) : (
            <TileLayer
              attribution="Tiles &copy; Esri"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              eventHandlers={{ tileerror: () => setTilesUnavailable(true), load: handleTileLoad }}
            />
          )}
          <MapViewport center={[coordinates.lat, coordinates.lon]} zoom={zoom} />
          <MapMarkers activeLayers={activeLayers} orbitTracks={orbitTracks} center={[coordinates.lat, coordinates.lon]} />
        </MapContainer>
        {tilesUnavailable && <div className="pointer-events-none absolute inset-0 z-[10] flex items-center justify-center"><div className="rounded-lg bg-white/90 px-4 py-3 text-center text-xs text-on-surface-variant shadow"><strong className="block text-on-surface">Map preview</strong><span>External map tiles are unavailable. Location markers and telemetry remain active.</span></div></div>}

        {/* Left Control Column: Search, Satellite Feed Filter & Location Intelligence Card */}
        <div className="absolute top-6 left-6 z-20 flex flex-col gap-2.5 w-[340px] max-h-[calc(100%-48px)] overflow-y-auto custom-scrollbar pr-1">
          {/* Search Box */}
          <div className="map-overlay relative z-30 bg-white/95 backdrop-blur rounded-xl shadow-lg border border-outline-variant/10 px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                onFocus={() => setSearchOpen(true)}
                placeholder="Search location..."
                className="w-full bg-transparent border-none outline-none text-body-sm font-medium text-on-surface"
              />
            </div>
            <button
              onClick={() => showToast("Search filter controls opened")}
              className="p-1 hover:bg-surface-container rounded-lg text-on-surface-variant transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">tune</span>
            </button>
          </div>
          {searchOpen && locationResults.length > 0 && (
            <div className="relative z-40 -mt-2 overflow-hidden rounded-lg border border-outline-variant bg-white shadow-xl">
              {locationResults.map((result) => (
                <button key={result.id} type="button" onClick={() => { changeLocation(result.label, result.lat, result.lon); setSearchLocation(result.label); setSearchOpen(false); }} className="block w-full border-b border-outline-variant/30 px-3 py-2 text-left last:border-b-0 hover:bg-surface-container">
                  <span className="block text-label-sm font-semibold text-on-surface">{result.label}</span>
                  <span className="block text-[11px] text-on-surface-variant">{result.lat.toFixed(5)}, {result.lon.toFixed(5)}</span>
                </button>
              ))}
            </div>
          )}
          {searchOpen && isSearching && <div className="relative z-40 -mt-2 rounded-lg bg-white px-3 py-2 text-[11px] text-outline shadow">Searching locations...</div>}

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
                placeholder="Satellite ID / Band..."
                className="w-full bg-transparent border-none outline-none text-body-xs text-on-surface"
              />
            </div>
          </div>

          {/* Location Intelligence Card */}
          <div className="map-overlay bg-white rounded-2xl shadow-2xl overflow-hidden border border-outline-variant/10 w-full mt-0.5">
            {/* Header Banner */}
            <div className="bg-[#004ac6] text-white p-4">
              <h3 className="font-headline-sm text-headline-sm text-white font-bold">{searchLocation}</h3>
              <p className="text-[12px] text-white/80 mt-0.5">Location Info • {coordinates.lat.toFixed(5)}°, {coordinates.lon.toFixed(5)}°</p>
              <p className="mt-1 text-[11px] text-white/70">ERI {satelliteRisk?.eriScore ?? "--"} · {satelliteTelemetry?.constellationStatus || "Connecting to constellation"}</p>
            </div>

            {/* Content Body */}
            <div className="p-4 space-y-3">
              {/* 2x2 Metrics Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-[#f2f4f6] p-3 rounded-xl">
                  <p className="text-[11px] font-medium text-on-surface-variant">Temperature</p>
                  <p className="text-[18px] font-bold text-[#004ac6]">{Math.round((temperature * 9/5) + 32)}°F</p>
                </div>
                <div className="bg-[#f2f4f6] p-3 rounded-xl">
                  <p className="text-[11px] font-medium text-on-surface-variant">Air Quality (AQI)</p>
                  <p className="text-[18px] font-bold text-[#006c49]">{aqi} ({aqiStatus.label})</p>
                </div>
                <div className="bg-[#f2f4f6] p-3 rounded-xl">
                  <p className="text-[11px] font-medium text-on-surface-variant">Wind Speed</p>
                  <p className="text-[18px] font-bold text-[#004ac6]">{windSpeed} mph</p>
                </div>
                <div className="bg-[#f2f4f6] p-3 rounded-xl">
                  <p className="text-[11px] font-medium text-on-surface-variant">Active Alerts</p>
                  <p className="text-[18px] font-bold text-[#ba1a1a]">{satelliteRisk?.category || "Monitoring"}</p>
                </div>
              {/* Remote Sensing Spectral Indices */}
              {remoteSensingData?.remoteSensingIndices && (
                <div className="grid grid-cols-2 gap-2 bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/20 text-xs">
                  <div>
                    <span className="text-[10px] text-on-surface-variant font-bold uppercase">NDVI Canopy</span>
                    <p className="font-extrabold text-[#15803d]">{remoteSensingData.remoteSensingIndices.ndvi} ({remoteSensingData.remoteSensingIndices.healthScore}%)</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-on-surface-variant font-bold uppercase">NDWI Water</span>
                    <p className="font-extrabold text-[#0284c7]">{remoteSensingData.remoteSensingIndices.ndwi}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-on-surface-variant font-bold uppercase">NDBI Built-Up</span>
                    <p className="font-extrabold text-amber-600">{remoteSensingData.remoteSensingIndices.ndbi}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-on-surface-variant font-bold uppercase">LST Heat Index</span>
                    <p className="font-extrabold text-error">{remoteSensingData.remoteSensingIndices.lst}°C</p>
                  </div>
                </div>
              )}

              {/* AI Environmental Intelligence Box */}
              <div className="bg-[#2563eb]/5 border border-[#2563eb]/20 p-3 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-[#004ac6]">
                  <span className="material-symbols-outlined text-[16px]">psychology</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider">AI Environmental Intelligence</span>
                </div>
                <h4 className="font-label-md font-bold text-on-surface text-[13px]">
                  {remoteSensingData?.environmentalRisk?.riskCategory || "Satellite Telemetry Active"}
                </h4>
                <p className="text-[11px] text-on-surface-variant leading-snug">
                  {remoteSensingData?.environmentalRisk?.summary || "Sentinel-2 & Landsat-9 radiometric indices within safe regional tolerances."}
                </p>
              </div>

              {/* Action Buttons: Live Satellite Scene Fetch, Sector Report, and Forecast */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={async () => {
                    showToast(`Acquiring live ${selectedSatelliteFilter} telemetry...`);
                    const res = await acquireScene(selectedSatelliteFilter);
                    showToast(`✓ Downlinked scene ${res?.scene?.sceneMetadata?.sceneId || "S2A-PASS"}`);
                  }}
                  disabled={isAcquiringScene}
                  className="w-full bg-[#004ac6] text-white py-2 rounded-xl font-bold text-[12px] flex items-center justify-center gap-1.5 hover:bg-[#2563eb] active:scale-95 transition-all shadow-md disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">{isAcquiringScene ? "sync" : "satellite_alt"}</span>
                  {isAcquiringScene ? "Acquiring Orbital Scene..." : "Fetch Live Satellite Telemetry"}
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(`/reports?lat=${coordinates.lat}&lon=${coordinates.lon}&type=sector`)}
                    className="border border-[#004ac6] text-[#004ac6] py-2 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1 hover:bg-[#004ac6]/10 active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-[15px]">lab_profile</span>
                    Generate Report
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/weather")}
                    className="bg-surface-container border border-outline-variant/30 text-on-surface py-2 rounded-xl font-bold text-[11px] flex items-center justify-center gap-1 hover:bg-surface-container-high active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-[15px]">cloud</span>
                    Forecast
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Top-Right Drawing / Polygon Toolbar */}
        <div className="map-overlay absolute top-6 right-6 z-20 bg-white/95 backdrop-blur p-2 rounded-2xl shadow-xl border border-outline-variant/10 flex flex-col gap-2 items-center w-10">
          <button
            onClick={() => showToast("Polygon tool selected")}
            className="p-1 hover:bg-surface-container rounded-lg text-on-surface-variant transition-colors"
            title="Polygon Select"
          >
            <span className="material-symbols-outlined text-[18px]">pentagon</span>
          </button>
          <button
            onClick={() => showToast("Circle select tool active")}
            className="p-1 hover:bg-surface-container rounded-lg text-on-surface-variant transition-colors"
            title="Circle Select"
          >
            <span className="material-symbols-outlined text-[18px]">circle</span>
          </button>
          <button
            onClick={() => showToast("Distance measure tool active")}
            className="p-1 hover:bg-surface-container rounded-lg text-on-surface-variant transition-colors"
            title="Line Tool"
          >
            <span className="material-symbols-outlined text-[18px]">horizontal_rule</span>
          </button>
          <button
            onClick={() => showToast("Cleared map annotations")}
            className="p-1 hover:bg-surface-container rounded-lg text-on-surface-variant transition-colors border-t border-outline-variant/20 pt-1.5"
            title="Clear Draw"
          >
            <span className="material-symbols-outlined text-[18px]">visibility_off</span>
          </button>
        </div>

        {/* Top-Right Floating "Map Layers" Card */}
        <div className="absolute top-6 right-20 z-20 w-[240px]">
          <div className="map-overlay bg-white/95 backdrop-blur rounded-2xl shadow-xl p-4 border border-outline-variant/10 space-y-3">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Map Layers</h3>
              <span className="material-symbols-outlined text-on-surface-variant">layers</span>
            </div>

            <div className="space-y-2">
              {LAYERS.map((layer) => (
                <label key={layer} className="flex items-center justify-between cursor-pointer py-0.5">
                  <span className="text-body-sm text-on-surface-variant hover:text-on-surface transition-colors font-medium">
                    {layer}
                  </span>
                  <input
                    type="checkbox"
                    checked={!!activeLayers[layer]}
                    onChange={() => toggleLayer(layer)}
                    className="h-4 w-4 rounded border-outline-variant text-[#004ac6] focus:ring-[#004ac6]"
                  />
                </label>
              ))}
            </div>

            <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between">
              <span className="text-body-sm font-bold text-on-surface">Satellite View</span>
              <button
                type="button"
                onClick={() => toggleLayer("Satellite View")}
                className={`w-10 h-5 rounded-full relative transition-colors ${
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
        <div className="map-overlay absolute top-[235px] right-6 z-20 bg-white/95 backdrop-blur rounded-xl shadow-lg border border-outline-variant/10 flex flex-col items-center divide-y divide-outline-variant/20 w-10">
          <button
            onClick={() => setZoom((z) => Math.min(18, z + 1))}
            className="p-2 hover:bg-surface-container text-on-surface transition-colors"
            title="Zoom In"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(3, z - 1))}
            className="p-2 hover:bg-surface-container text-on-surface transition-colors"
            title="Zoom Out"
          >
            <span className="material-symbols-outlined text-[18px]">remove</span>
          </button>
          <button
            onClick={() => showToast("Toggled 3D Map View")}
            className="p-2 hover:bg-surface-container text-on-surface-variant transition-colors"
            title="3D Tilt View"
          >
            <span className="material-symbols-outlined text-[16px]">3d_rotation</span>
          </button>
        </div>

        {/* Bottom-Right "Radiation Levels" Legend Card */}
        <div className="absolute bottom-20 right-6 z-20 w-[200px]">
          <div className="map-overlay bg-white/95 backdrop-blur rounded-xl shadow-lg p-3.5 border border-outline-variant/10 space-y-2">
            <h4 className="font-label-sm font-bold text-on-surface">Radiation Levels</h4>
            <div className="space-y-1.5 text-body-sm text-on-surface-variant">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-amber-400" />
                <span className="text-[12px]">Safe</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-orange-500" />
                <span className="text-[12px]">Monitor</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-red-700" />
                <span className="text-[12px]">Hazard</span>
              </div>
            </div>
            <div className="w-full h-1.5 rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-700 mt-2" />
          </div>
        </div>

        {/* Bottom-Right Floating "Report Incident" Button */}
        <button
          onClick={() => navigate("/community-reports")}
          className="absolute bottom-6 right-6 z-30 bg-[#004ac6] text-white px-5 py-2.5 rounded-full font-bold font-label-md shadow-xl flex items-center gap-2 hover:bg-[#2563eb] active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">add_alert</span>
          Report Incident
        </button>

      </div>
      </div>
    </DashboardLayout>
  );
}
