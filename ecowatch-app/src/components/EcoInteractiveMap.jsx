import React, { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";

const DEFAULT_MARKER_OFFSETS = [
  { offset: [0, 0], label: "Selected location", color: "#ba1a1a" },
  { offset: [0.035, -0.03], label: "Nearby monitoring zone", color: "#d97706" },
  { offset: [-0.025, 0.04], label: "Regional monitoring zone", color: "#006c49" },
];

function MapZoom({ zoom }) {
  const map = useMap();
  useEffect(() => {
    if (zoom) map.setZoom(zoom);
  }, [map, zoom]);
  return null;
}

export default function EcoInteractiveMap({
  className = "h-full w-full",
  center = null,
  zoom = 11,
  markers,
  satellite = false,
  showHeat = false,
}) {
  const [isSatellite, setIsSatellite] = useState(satellite);
  const [tilesUnavailable, setTilesUnavailable] = useState(false);
  const tileLoadedRef = useRef(false);
  const wrapperPosition = className.split(/\s+/).includes("absolute") ? "" : "relative";
  const hasValidCenter = Array.isArray(center) && center.length === 2 && center.every(Number.isFinite);
  const visibleMarkers = markers || (hasValidCenter
    ? DEFAULT_MARKER_OFFSETS.map((marker) => ({
      ...marker,
      position: [center[0] + marker.offset[0], center[1] + marker.offset[1]],
    }))
    : []);

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

  if (!hasValidCenter) {
    return (
      <div className={`${wrapperPosition} overflow-hidden ${className} flex items-center justify-center bg-surface-container-low px-4 text-center text-body-sm text-on-surface-variant`}>
        Set a location or allow live location to view the map.
      </div>
    );
  }

  return (
    <div className={`${wrapperPosition} overflow-hidden ${className}`}>
      <MapContainer center={center} zoom={zoom} minZoom={3} maxZoom={18} className="h-full w-full" style={{ backgroundColor: "#e8f0f3", backgroundImage: "linear-gradient(rgba(0,74,198,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,74,198,.08) 1px, transparent 1px)", backgroundSize: "40px 40px" }} scrollWheelZoom>
        {!isSatellite ? (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            eventHandlers={{ tileerror: () => setTilesUnavailable(true), load: handleTileLoad }}
          />
        ) : (
          <TileLayer attribution="Tiles &copy; Esri" url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" eventHandlers={{ tileerror: () => setTilesUnavailable(true), load: handleTileLoad }} />
        )}
        <MapZoom zoom={zoom} />
        {visibleMarkers.map((marker) => (
          <CircleMarker key={`${marker.label}-${marker.position.join("-")}`} center={marker.position} radius={8} pathOptions={{ color: marker.color, fillColor: marker.color, fillOpacity: 0.8, weight: 2 }}>
            <Popup><strong>{marker.label}</strong></Popup>
          </CircleMarker>
        ))}
        {showHeat && <CircleMarker center={center} radius={85} pathOptions={{ color: "#ef4444", fillColor: "#f97316", fillOpacity: 0.25, weight: 1 }} />}
      </MapContainer>
        {tilesUnavailable && <div className="pointer-events-none absolute inset-0 z-[300] flex items-center justify-center"><div className="rounded-lg bg-white/90 px-4 py-3 text-center text-xs text-on-surface-variant shadow"><strong className="block text-on-surface">Map preview</strong><span>External map tiles are unavailable. Location markers and telemetry remain active.</span></div></div>}
      <div className="absolute right-3 top-3 z-[400] flex overflow-hidden rounded-lg border border-white/70 bg-white/95 shadow-lg">
        <button type="button" onClick={() => setIsSatellite(false)} className={`px-3 py-1 text-[11px] font-semibold ${!isSatellite ? "bg-primary text-white" : "text-on-surface"}`}>Standard</button>
        <button type="button" onClick={() => setIsSatellite(true)} className={`px-3 py-1 text-[11px] font-semibold ${isSatellite ? "bg-primary text-white" : "text-on-surface"}`}>Satellite</button>
      </div>
    </div>
  );
}
