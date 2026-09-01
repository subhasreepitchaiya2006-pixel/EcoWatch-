import React, { useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { useSatelliteData } from "../context/SatelliteDataContext";

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

export default function InteractiveMapPage() {
  const { aqi, aqiStatus, temperature, windSpeed } = useSatelliteData();
  const [activeLayers, setActiveLayers] = useState(DEFAULT_LAYER_STATE);
  const [zoom, setZoom] = useState(1.0);
  const [searchLocation, setSearchLocation] = useState("San Francisco, CA");
  const [selectedSatelliteFilter, setSelectedSatelliteFilter] = useState("All Satellites");
  const [satelliteIdInput, setSatelliteIdInput] = useState("");
  const [toastMessage, setToastMessage] = useState("");

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
        {/* Satellite / Terrain Map Image */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-500"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDnZldrAi7EIUlu4m-yWrfLTABOY4QzFNLvzqk6Fj4CbUY0k9JqP-3eks000MAt8FhExAKvBM4oV6Nl-3QtR8tclaeqpurvPZBVQfecsjMH6tcvCPV-WwPufQ4cICBezfJ8cT_h-ewIVrTsllcLBD0DVMu4NKOeMgPy4vBH9Po9GU8MKMvdzc08xLAqP60KItUBFAIQd3znLIv_DSP2drBb-ug3R53O6ykalb7LSu7228ExxjfuL8CSz7EU7JWU4w7B77Rie2KsHDLA')",
            transform: `scale(${zoom})`,
          }}
        />

        {/* Heatmap Layer Overlays */}
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute left-[25%] top-[20%] h-64 w-64 rounded-full bg-gradient-to-r from-yellow-300/40 via-orange-500/40 to-red-600/50 blur-3xl" />
          <div className="absolute left-[50%] top-[35%] h-72 w-72 rounded-full bg-gradient-to-r from-orange-300/35 via-red-500/40 to-purple-700/45 blur-3xl" />
        </div>

        {/* Left Control Column: Search, Satellite Feed Filter & Location Intelligence Card */}
        <div className="absolute top-6 left-6 z-20 flex flex-col gap-2.5 w-[340px] max-h-[calc(100%-48px)] overflow-y-auto custom-scrollbar pr-1">
          {/* Search Box */}
          <div className="bg-white/95 backdrop-blur rounded-xl shadow-lg border border-outline-variant/10 px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
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

          {/* Satellite Feed Filter Bar */}
          <div className="bg-white/95 backdrop-blur rounded-xl shadow-lg border border-outline-variant/10 px-3 py-2 flex items-center gap-2 text-body-xs">
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
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-outline-variant/10 w-full mt-0.5">
            {/* Header Banner */}
            <div className="bg-[#004ac6] text-white p-4">
              <h3 className="font-headline-sm text-headline-sm text-white font-bold">{searchLocation}</h3>
              <p className="text-[12px] text-white/80 mt-0.5">Location Info • 37.7749° N, 122.4194° W</p>
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
                  <p className="text-[18px] font-bold text-[#ba1a1a]">1 Active</p>
                </div>
              </div>

              {/* AI Environmental Intelligence Box */}
              <div className="bg-[#2563eb]/5 border border-[#2563eb]/20 p-3 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-[#004ac6]">
                  <span className="material-symbols-outlined text-[16px]">psychology</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider">AI Environmental Intelligence</span>
                </div>
                <h4 className="font-label-md font-bold text-on-surface text-[13px]">High flood risk detected</h4>
                <p className="text-[11px] text-on-surface-variant leading-snug">
                  Recommendation: Monitor rainfall intensity in Mission District over the next 4 hours.
                </p>
              </div>

              {/* View Forecast Button */}
              <button
                onClick={() => showToast("Opening detailed forecast protocol...")}
                className="w-full bg-[#004ac6] text-white py-2.5 rounded-xl font-bold text-[13px] hover:bg-[#2563eb] active:scale-95 transition-all shadow-md"
              >
                View Detailed Forecast
              </button>
            </div>
          </div>
        </div>

        {/* Top-Right Drawing / Polygon Toolbar */}
        <div className="absolute top-6 right-6 z-20 bg-white/95 backdrop-blur p-2 rounded-2xl shadow-xl border border-outline-variant/10 flex flex-col gap-2 items-center w-10">
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
          <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-4 border border-outline-variant/10 space-y-3">
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
        <div className="absolute top-[235px] right-6 z-20 bg-white/95 backdrop-blur rounded-xl shadow-lg border border-outline-variant/10 flex flex-col items-center divide-y divide-outline-variant/20 w-10">
          <button
            onClick={() => setZoom((z) => Math.min(2.0, z + 0.15))}
            className="p-2 hover:bg-surface-container text-on-surface transition-colors"
            title="Zoom In"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(0.7, z - 0.15))}
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
          <div className="bg-white/95 backdrop-blur rounded-xl shadow-lg p-3.5 border border-outline-variant/10 space-y-2">
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
          onClick={() => showToast("Opening emergency report incident form...")}
          className="absolute bottom-6 right-6 z-30 bg-[#004ac6] text-white px-5 py-2.5 rounded-full font-bold font-label-md shadow-xl flex items-center gap-2 hover:bg-[#2563eb] active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-[20px]">add_alert</span>
          Report Incident
        </button>

        {/* Map Hazard Pins */}
        <div className="group absolute left-[46%] top-[40%] z-20">
          <div className="relative cursor-pointer animate-bounce">
            <span className="material-symbols-outlined text-3xl text-[#ba1a1a] drop-shadow-md" style={{ fontVariationSettings: '"FILL" 1' }}>
              report
            </span>
            <div className="absolute -inset-2 rounded-full bg-[#ba1a1a] opacity-20 animate-ping" />
          </div>
          <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden w-48 -translate-x-1/2 rounded-lg border border-outline-variant/20 bg-white p-2 shadow-modal group-hover:block">
            <p className="font-label-sm text-label-sm text-error">Critical Hazard Zone</p>
            <p className="font-body-sm text-body-sm">Active Flood Risk (Level 4)</p>
          </div>
        </div>

        <div className="group absolute left-[56%] top-[48%] z-20">
          <div className="relative cursor-pointer">
            <span className="material-symbols-outlined text-3xl text-amber-600 drop-shadow-md" style={{ fontVariationSettings: '"FILL" 1' }}>
              warning
            </span>
          </div>
          <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden w-48 -translate-x-1/2 rounded-lg border border-outline-variant/20 bg-white p-2 shadow-modal group-hover:block">
            <p className="font-label-sm text-label-sm text-tertiary">Weather Warning</p>
            <p className="font-body-sm text-body-sm">High Precipitation Area</p>
          </div>
        </div>

        <div className="group absolute left-[64%] top-[58%] z-20">
          <div className="relative cursor-pointer">
            <span className="material-symbols-outlined text-3xl text-[#006c49] drop-shadow-md" style={{ fontVariationSettings: '"FILL" 1' }}>
              location_on
            </span>
          </div>
          <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden w-48 -translate-x-1/2 rounded-lg border border-outline-variant/20 bg-white p-2 shadow-modal group-hover:block">
            <p className="font-label-sm text-label-sm text-secondary">Safe Zone</p>
            <p className="font-body-sm text-body-sm">Emergency Shelter Alpha</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
