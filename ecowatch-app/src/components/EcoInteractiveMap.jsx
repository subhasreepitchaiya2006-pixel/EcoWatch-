import React, { useEffect, useMemo, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { Circle, CircleMarker, MapContainer, Polygon, Popup, TileLayer, Tooltip, useMap } from "react-leaflet";

const DEFAULT_MARKER_OFFSETS = [
  { offset: [0, 0], label: "Selected location", color: "#ba1a1a" },
  { offset: [0.035, -0.03], label: "Nearby monitoring zone", color: "#d97706" },
  { offset: [-0.025, 0.04], label: "Regional monitoring zone", color: "#006c49" },
];

function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && Array.isArray(center) && center.length === 2 && center.every(Number.isFinite)) {
      const currentZoom = map.getZoom();
      const targetZoom = typeof zoom === "number" ? zoom : currentZoom;
      map.setView(center, targetZoom, { animate: true, duration: 0.75 });
    }
  }, [map, center?.[0], center?.[1], zoom]);
  return null;
}

export default function EcoInteractiveMap({
  className = "h-full w-full",
  center = null,
  zoom = 11,
  markers,
  polygons,
  satellite = false,
  onToggleSatellite,
  showHeat = false,
  onSelectMarker,
  onMarkerClick,
}) {
  const [isSatellite, setIsSatellite] = useState(satellite);
  const [tilesUnavailable, setTilesUnavailable] = useState(false);
  const tileLoadedRef = useRef(false);
  const wrapperPosition = className.split(/\s+/).includes("absolute") ? "" : "relative";
  const hasValidCenter = Array.isArray(center) && center.length === 2 && center.every(Number.isFinite);

  useEffect(() => {
    setIsSatellite(satellite);
  }, [satellite]);

  const visibleMarkers = useMemo(() => {
    const rawList = markers || (hasValidCenter
      ? DEFAULT_MARKER_OFFSETS.map((marker) => ({
        ...marker,
        position: [center[0] + marker.offset[0], center[1] + marker.offset[1]],
      }))
      : []);

    if (!Array.isArray(rawList)) return [];

    return rawList
      .map((marker, idx) => {
        if (!marker) return null;
        let pos = null;
        if (Array.isArray(marker.position) && marker.position.length === 2) {
          const lat = Number(marker.position[0]);
          const lon = Number(marker.position[1]);
          if (Number.isFinite(lat) && Number.isFinite(lon)) {
            pos = [lat, lon];
          }
        } else {
          const lat = Number(marker.lat ?? marker.latitude);
          const lon = Number(marker.lon ?? marker.longitude ?? marker.lng);
          if (Number.isFinite(lat) && Number.isFinite(lon)) {
            pos = [lat, lon];
          }
        }

        if (!pos) return null;

        const defaultColor =
          marker.status === "Urgent" || marker.severity === "CRITICAL"
            ? "#ba1a1a"
            : marker.status === "Investigating" || marker.severity === "WARNING"
            ? "#d97706"
            : "#006c49";

        return {
          ...marker,
          position: pos,
          label: marker.label || marker.title || marker.name || "Incident Marker",
          color: marker.color || defaultColor,
          fillColor: marker.fillColor || marker.color || defaultColor,
        };
      })
      .filter(Boolean);
  }, [markers, hasValidCenter, center]);

  const handleTileLoad = () => {
    tileLoadedRef.current = true;
    setTilesUnavailable(false);
  };

  const handleMarkerSelect = onMarkerClick || onSelectMarker;

  const handleSatelliteToggle = (val) => {
    setIsSatellite(val);
    if (onToggleSatellite) onToggleSatellite(val);
  };

  if (!hasValidCenter) {
    return (
      <div className={`${wrapperPosition} overflow-hidden ${className} flex items-center justify-center bg-surface-container-low px-4 text-center text-body-sm text-on-surface-variant`}>
        Set a location or allow live location to view the map.
      </div>
    );
  }

  // Calculate heat circle radius in meters (default to ~2.8km around municipal coordinate)
  const heatRadiusMeters = typeof showHeat === "number" ? showHeat : 2800;

  return (
    <div className={`${wrapperPosition} overflow-hidden ${className}`}>
      <MapContainer
        center={hasValidCenter ? center : [0, 0]}
        zoom={zoom}
        minZoom={3}
        maxZoom={18}
        className="h-full w-full"
        style={{
          backgroundColor: "#e8f0f3",
          backgroundImage: "linear-gradient(rgba(0,74,198,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,74,198,.08) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
        scrollWheelZoom
      >
        {!isSatellite ? (
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

        <MapController center={hasValidCenter ? center : [0, 0]} zoom={zoom} />

        {/* GIS Sector Polygons Vector Layer */}
        {polygons && polygons.length > 0 && polygons.map((poly, idx) => (
          (Array.isArray(poly.positions) && poly.positions.length > 0 && poly.positions.every((pt) => Array.isArray(pt) && pt.length === 2 && pt.every(Number.isFinite))) ? (
            <Polygon
              key={poly.id || `poly-${idx}`}
              positions={poly.positions}
              pathOptions={{
                color: poly.color || "#006c49",
                fillColor: poly.fillColor || poly.color || "#10b981",
                fillOpacity: poly.fillOpacity ?? (poly.isSelected ? 0.45 : 0.22),
                weight: poly.weight || (poly.isSelected ? 3 : 1.5),
                dashArray: poly.dashArray || (poly.isSelected ? undefined : "3 3"),
              }}
              eventHandlers={{
                click: () => poly.onClick && poly.onClick(poly),
              }}
            >
              {poly.label && (
                <Tooltip sticky>
                  <div className="text-[11px] font-semibold">
                    <div>{poly.label}</div>
                    {poly.subLabel && <div className="text-[10px] text-gray-500 font-normal">{poly.subLabel}</div>}
                  </div>
                </Tooltip>
              )}
              {poly.popup && (
                <Popup>
                  <div className="text-xs p-1">{poly.popup}</div>
                </Popup>
              )}
            </Polygon>
          ) : null
        ))}

        {/* Thermal / Geospatial Heat Coverage Overlay */}
        {showHeat && hasValidCenter && (
          <Circle
            center={center}
            radius={heatRadiusMeters}
            pathOptions={{
              color: "#f97316",
              fillColor: "#ea580c",
              fillOpacity: 0.16,
              weight: 1.5,
              dashArray: "4 4",
            }}
          />
        )}

        {/* Telemetry Markers */}
        {visibleMarkers.map((marker, mIdx) => (
          <CircleMarker
            key={marker.id ? `marker-${marker.id}` : `marker-${marker.position[0]}-${marker.position[1]}-${mIdx}`}
            center={marker.position}
            radius={marker.radius || (marker.isSelected ? 10 : 7)}
            pathOptions={{
              color: marker.isSelected ? "#ffffff" : marker.color,
              fillColor: marker.fillColor || marker.color,
              fillOpacity: 0.9,
              weight: marker.isSelected ? 3 : 2,
            }}
            eventHandlers={{
              click: () => {
                if (marker.onClick) marker.onClick(marker);
                if (handleMarkerSelect) handleMarkerSelect(marker);
              },
            }}
          >
            {marker.label && (
              <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
                <div className="text-[11px] font-semibold">{marker.label}</div>
              </Tooltip>
            )}
            <Popup>
              {marker.popupContent ? (
                <div
                  className="text-xs p-1"
                  dangerouslySetInnerHTML={{ __html: marker.popupContent }}
                />
              ) : (
                <div className="text-xs p-1">
                  <strong>{marker.label}</strong>
                  {marker.details && <p className="text-[11px] mt-1 text-gray-600">{marker.details}</p>}
                </div>
              )}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {tilesUnavailable && (
        <div className="absolute bottom-3 left-3 z-[400] flex items-center gap-2 rounded-lg bg-surface/95 px-3 py-1.5 text-xs text-on-surface-variant shadow-md border border-outline-variant/40 backdrop-blur">
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

      {/* Map Layer Switcher */}
      <div className="absolute right-3 top-3 z-[400] flex overflow-hidden rounded-lg border border-white/70 bg-white/95 shadow-md">
        <button
          type="button"
          onClick={() => handleSatelliteToggle(false)}
          className={`px-3 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
            !isSatellite ? "bg-primary text-white" : "text-on-surface hover:bg-gray-100"
          }`}
        >
          Standard
        </button>
        <button
          type="button"
          onClick={() => handleSatelliteToggle(true)}
          className={`px-3 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
            isSatellite ? "bg-primary text-white" : "text-on-surface hover:bg-gray-100"
          }`}
        >
          Satellite
        </button>
      </div>
    </div>
  );
}
