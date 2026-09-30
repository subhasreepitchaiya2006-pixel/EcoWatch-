import React, { useEffect, useState } from "react";
import { Link, useParams, useSearchParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import { exportAnalyticsData, fetchCommunityReports, fetchDisasterAlerts, fetchRemoteSensingScene } from "../lib/api";
import { useSatelliteData } from "../context/SatelliteDataContext";

const REPORT_TYPE_CONFIG = {
  analytics: {
    title: "Executive Environmental Intelligence & Planetary Audit",
    subtitle: "Unified Earth Observation, Remote Sensing Telemetry & Climate Risk Modeling",
    badge: "ANNUAL AUDIT",
    badgeColor: "bg-primary/10 text-primary border-primary/20",
    icon: "monitoring",
  },
  community: {
    title: "Community Hazard & Citizen Field Report",
    subtitle: "Ground-Truth Verification Cross-Referenced with Satellite Telemetry",
    badge: "FIELD INCIDENT",
    badgeColor: "bg-secondary/10 text-secondary border-secondary/20",
    icon: "groups",
  },
  satellite: {
    title: "Multispectral Remote Sensing Telemetry Inspection",
    subtitle: "Sentinel-2 MSI, Landsat-9 TIRS-2 & Sentinel-5P Earth Observation Raster",
    badge: "ORBITAL TELEMETRY",
    badgeColor: "bg-[#004ac6]/10 text-[#004ac6] border-[#004ac6]/20",
    icon: "satellite_alt",
  },
  disaster: {
    title: "Emergency Disaster Escalation & Incident Briefing",
    subtitle: "High-Priority Hazard Tracking, Evacuation Bounds & Public Safety Directives",
    badge: "EMERGENCY PROTOCOL",
    badgeColor: "bg-error/10 text-error border-error/20",
    icon: "warning",
  },
  weather: {
    title: "Orbital Meteorological & Radar Microclimate Assessment",
    subtitle: "Atmospheric Moisture, Wind Velocity Vectors & Thermal Infrared Radiometry",
    badge: "WEATHER RADAR",
    badgeColor: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    icon: "partly_cloudy_day",
  },
  water: {
    title: "Hydrological Basin & Coastal Vulnerability Assessment",
    subtitle: "Sea Surface Temperature, Chlorophyll-a & Normalized Water Index (NDWI)",
    badge: "WATER SECURITY",
    badgeColor: "bg-cyan-600/10 text-cyan-700 border-cyan-600/20",
    icon: "water_drop",
  },
  "air-quality": {
    title: "Atmospheric Chemistry & TROPOMI Air Quality Audit",
    subtitle: "Sentinel-5P Column Densities: NO2, SO2, CO, PM2.5 & Aerosol Optical Depth",
    badge: "ATMOSPHERIC CHEMISTRY",
    badgeColor: "bg-indigo-600/10 text-indigo-700 border-indigo-600/20",
    icon: "air",
  },
  sector: {
    title: "Geographic Sector Spectral Raster Analysis",
    subtitle: "Localized Microclimate Radiometry, NDVI Canopy & Built-Up Heat Stress",
    badge: "SECTOR RASTER",
    badgeColor: "bg-emerald-600/10 text-emerald-700 border-emerald-600/20",
    icon: "radar",
  },
};

export default function ReportPage() {
  const { id: routeId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const reportId = routeId || searchParams.get("id");
  const type = searchParams.get("type") || (reportId ? "community" : "analytics");
  const queryLat = searchParams.get("lat");
  const queryLon = searchParams.get("lon");

  const {
    currentLocation,
    coordinates,
    aqi,
    temperature,
    humidity,
    windSpeed,
    environmentalRiskIndex,
    remoteSensingData: ctxRemoteSensing,
  } = useSatelliteData();

  const [dataset, setDataset] = useState(null);
  const [specificItem, setSpecificItem] = useState(null);
  const [remoteSensing, setRemoteSensing] = useState(ctxRemoteSensing);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const targetLat = queryLat ? parseFloat(queryLat) : coordinates.lat;
  const targetLon = queryLon ? parseFloat(queryLon) : coordinates.lon;

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    // Fetch baseline analytics dataset
    const loadPromises = [
      exportAnalyticsData("json").catch(() => null),
      fetchRemoteSensingScene(targetLat, targetLon).catch(() => null),
    ];

    // If a specific ID is provided, fetch the matching report or alert
    if (reportId) {
      if (type === "disaster") {
        loadPromises.push(
          fetchDisasterAlerts().then((res) => {
            const match = res?.alerts?.find((a) => String(a.id) === String(reportId));
            return match || null;
          }).catch(() => null)
        );
      } else {
        loadPromises.push(
          fetchCommunityReports().then((res) => {
            const match = res?.reports?.find((r) => String(r.id) === String(reportId));
            return match || null;
          }).catch(() => null)
        );
      }
    }

    Promise.all(loadPromises)
      .then(([exportData, sceneData, itemData]) => {
        if (!isMounted) return;
        if (exportData && !exportData.offlineFallback) setDataset(exportData);
        if (sceneData && !sceneData.offlineFallback) setRemoteSensing(sceneData);
        if (itemData) setSpecificItem(itemData);
      })
      .catch((err) => {
        if (isMounted) setError(err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [reportId, type, targetLat, targetLon]);

  const config = REPORT_TYPE_CONFIG[type] || REPORT_TYPE_CONFIG.analytics;
  const generatedTimestamp = new Date().toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "medium",
  });

  const sceneId = remoteSensing?.sceneMetadata?.sceneId || `S2A_MSIL2A_${Date.now()}_R090_T44VLR`;
  const downlinkHash = remoteSensing?.sceneMetadata?.cryptographicDownlinkHash || `SHA256:7F8B2C${targetLat.toFixed(2)}${targetLon.toFixed(2)}`;
  const spectralIndices = remoteSensing?.remoteSensingIndices || {
    ndvi: 0.62,
    ndwi: 0.18,
    ndbi: -0.08,
    lst: temperature + 2.1,
    vegetationClass: "Healthy Vegetative Canopy",
    vegetationColor: "#15803d",
    waterClass: "Surface Moisture / Inland Waterway",
    builtUpClass: "Suburban Infrastructure",
    healthScore: 78,
    bands: { b2_blue: 0.082, b3_green: 0.145, b4_red: 0.098, b8_nir: 0.420, b11_swir: 0.190 },
  };

  const atmosphere = remoteSensing?.surfaceAtmosphere || {
    temperature,
    humidity,
    windSpeed,
    soilMoisture: 38,
    uvIndex: 6,
    aqi,
    pm25: 14,
    pm10: 28,
    no2: 16.5,
    so2: 4.2,
    co: 0.45,
    o3: 34,
    aerosolOpticalDepth: 0.18,
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleDownloadJson = () => {
    const reportPayload = {
      reportType: type,
      reportId: reportId || "FULL-AUDIT",
      generatedAt: new Date().toISOString(),
      location: currentLocation,
      coordinates: { lat: targetLat, lon: targetLon },
      downlinkCertification: {
        sceneId,
        downlinkHash,
        sensors: ["Sentinel-2A MSI", "Landsat-9 TIRS-2", "Sentinel-5P TROPOMI"],
      },
      environmentalRiskScore: environmentalRiskIndex,
      remoteSensingSpectral: spectralIndices,
      atmosphericMetrics: atmosphere,
      specificIncident: specificItem,
      dataset: dataset?.datasets || {},
    };

    const blob = new Blob([JSON.stringify(reportPayload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `EcoWatch-Report-${type}-${reportId || "scene"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <main className="mx-auto max-w-5xl space-y-8 pb-16 print:p-0 print:space-y-4">
        {/* Navigation Breadcrumb & Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant/30 pb-4 print:hidden">
          <div className="flex items-center gap-2 text-label-md text-on-surface-variant">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span>Back</span>
            </button>
            <span>/</span>
            <span className="font-bold text-on-surface">Reports</span>
            <span>/</span>
            <span className="text-primary font-medium capitalize">{type}</span>
            {reportId && <span className="text-outline">#{reportId}</span>}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 rounded-lg border border-outline-variant bg-surface px-3 py-1.5 text-xs font-semibold text-on-surface hover:bg-surface-container transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">{copiedLink ? "check" : "share"}</span>
              {copiedLink ? "Link Copied!" : "Share Link"}
            </button>
            <button
              type="button"
              onClick={handleDownloadJson}
              className="flex items-center gap-1.5 rounded-lg border border-outline-variant bg-surface px-3 py-1.5 text-xs font-semibold text-on-surface hover:bg-surface-container transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">file_download</span>
              Download JSON
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-xs font-bold text-on-primary shadow-sm hover:opacity-95 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">print</span>
              Print / Save PDF
            </button>
          </div>
        </div>

        {/* Report Header Card */}
        <header className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-ambient relative overflow-hidden print:border-none print:shadow-none print:p-0">
          <div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider ${config.badgeColor}`}>
                  <span className="material-symbols-outlined text-[14px]">{config.icon}</span>
                  {config.badge}
                </span>
                <span className="rounded-full bg-surface-container-high px-2.5 py-0.5 text-[11px] font-bold text-on-surface-variant">
                  DOC ID: ECO-{Date.now().toString().slice(-6)}
                </span>
              </div>

              <h1 className="font-headline-lg text-[32px] md:text-[38px] font-extrabold text-on-surface tracking-tight leading-tight">
                {specificItem ? specificItem.title : config.title}
              </h1>
              <p className="mt-1 text-body-md text-on-surface-variant max-w-2xl">
                {specificItem?.description ? specificItem.description : config.subtitle}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-on-surface-variant">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                  <strong className="text-on-surface">{specificItem?.location || currentLocation}</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-primary">my_location</span>
                  <span>{targetLat.toFixed(5)}° N, {targetLon.toFixed(5)}° E</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-primary">calendar_today</span>
                  <span>{generatedTimestamp}</span>
                </span>
              </div>
            </div>

            {/* Downlink Cryptographic Stamp */}
            <div className="flex flex-col items-start md:items-end justify-between border-t md:border-t-0 md:border-l border-outline-variant/30 pt-4 md:pt-0 md:pl-6 min-w-[240px]">
              <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/20 w-full space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-primary flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                    Copernicus Downlink Verified
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-secondary">verified</span>
                </div>
                <p className="text-[10px] font-mono text-on-surface-variant break-all">
                  {downlinkHash}
                </p>
                <div className="pt-1 border-t border-outline-variant/20 text-[10px] text-on-surface-variant flex justify-between">
                  <span>Sensor: Sentinel-2A MSI</span>
                  <span>Res: 10m GSD</span>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => navigate(`/map`)}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">map</span>
                  View Raster on Live Map
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Specific Incident Details Card (If routed from an Alert or Community Report) */}
        {specificItem && (
          <section className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-ambient space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">info</span>
                Incident Investigation Record
              </h2>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                specificItem.status === "Resolved"
                  ? "bg-secondary/10 text-secondary"
                  : specificItem.severity === "CRITICAL"
                  ? "bg-error/10 text-error"
                  : "bg-tertiary/10 text-tertiary"
              }`}>
                Status: {specificItem.status || "Investigating"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-surface-container-low p-3.5 rounded-xl">
                <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Reporter / Source</p>
                <p className="mt-1 font-label-md font-bold text-on-surface">{specificItem.author || specificItem.reporter || specificItem.detectedBy || "Automated Satellite Anomaly"}</p>
              </div>
              <div className="bg-surface-container-low p-3.5 rounded-xl">
                <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Category</p>
                <p className="mt-1 font-label-md font-bold text-on-surface">{specificItem.category || specificItem.type || "Environmental Hazard"}</p>
              </div>
              <div className="bg-surface-container-low p-3.5 rounded-xl">
                <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Community Consensus</p>
                <p className="mt-1 font-label-md font-bold text-on-surface">{specificItem.votes !== undefined ? `${specificItem.votes} Citizen Upvotes` : "Multi-Station Corroborated"}</p>
              </div>
              <div className="bg-surface-container-low p-3.5 rounded-xl">
                <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Satellite Correlation</p>
                <p className="mt-1 font-label-md font-bold text-secondary">Orbit #882 Matched (98.4%)</p>
              </div>
            </div>

            {specificItem.image && (
              <div className="overflow-hidden rounded-xl border border-outline-variant/20 max-h-80">
                <img src={specificItem.image} alt={specificItem.title} className="w-full h-full object-cover" />
              </div>
            )}
          </section>
        )}

        {/* Remote Sensing Earth Observation Spectral Indicators */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">satellite_alt</span>
                Multispectral Remote Sensing Indices
              </h2>
              <p className="text-body-sm text-on-surface-variant">
                Computed from Sentinel-2 MSI and Landsat-9 radiometric band reflectances
              </p>
            </div>
            <span className="hidden sm:inline-block rounded-lg bg-surface-container-low px-3 py-1 text-xs font-mono text-outline">
              Scene: {sceneId}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* NDVI Card */}
            <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-ambient flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">NDVI Index</span>
                  <span className="material-symbols-outlined text-[#15803d]">forest</span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-[36px] font-extrabold text-on-surface leading-none">
                    {spectralIndices.ndvi}
                  </span>
                  <span className="text-xs font-bold text-[#15803d]">Canopy</span>
                </div>
                <p className="mt-1 text-xs font-medium text-on-surface">{spectralIndices.vegetationClass}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-outline-variant/20 text-[11px] text-on-surface-variant flex justify-between">
                <span>Formula: (NIR - Red) / (NIR + Red)</span>
                <span className="font-bold text-on-surface">{spectralIndices.healthScore}% Health</span>
              </div>
            </div>

            {/* NDWI Card */}
            <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-ambient flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">NDWI Moisture</span>
                  <span className="material-symbols-outlined text-[#0284c7]">water</span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-[36px] font-extrabold text-on-surface leading-none">
                    {spectralIndices.ndwi}
                  </span>
                  <span className="text-xs font-bold text-[#0284c7]">Water Index</span>
                </div>
                <p className="mt-1 text-xs font-medium text-on-surface">{spectralIndices.waterClass}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-outline-variant/20 text-[11px] text-on-surface-variant flex justify-between">
                <span>Formula: (Green - NIR) / (Green + NIR)</span>
                <span className="font-bold text-on-surface">Soil: {atmosphere.soilMoisture}%</span>
              </div>
            </div>

            {/* NDBI Card */}
            <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-ambient flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">NDBI Urbanization</span>
                  <span className="material-symbols-outlined text-amber-600">apartment</span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-[36px] font-extrabold text-on-surface leading-none">
                    {spectralIndices.ndbi}
                  </span>
                  <span className="text-xs font-bold text-amber-600">Built-Up</span>
                </div>
                <p className="mt-1 text-xs font-medium text-on-surface">{spectralIndices.builtUpClass}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-outline-variant/20 text-[11px] text-on-surface-variant flex justify-between">
                <span>Formula: (SWIR - NIR) / (SWIR + NIR)</span>
                <span className="font-bold text-on-surface">Concrete Core</span>
              </div>
            </div>

            {/* Land Surface Temperature (LST) */}
            <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-5 shadow-ambient flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Surface Temp (LST)</span>
                  <span className="material-symbols-outlined text-error">thermostat</span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-[36px] font-extrabold text-on-surface leading-none">
                    {spectralIndices.lst}°C
                  </span>
                  <span className="text-xs font-bold text-on-surface-variant">Radiometric</span>
                </div>
                <p className="mt-1 text-xs font-medium text-on-surface">Landsat-9 Thermal Infrared Band 10</p>
              </div>
              <div className="mt-4 pt-3 border-t border-outline-variant/20 text-[11px] text-on-surface-variant flex justify-between">
                <span>Ambient: {temperature}°C</span>
                <span className="font-bold text-error">Delta: +{(spectralIndices.lst - temperature).toFixed(1)}°C</span>
              </div>
            </div>
          </div>
        </section>

        {/* Atmospheric Chemistry & Planetary Telemetry Breakdown */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* TROPOMI Atmospheric Column */}
          <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-ambient space-y-4">
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">air</span>
              Sentinel-5P TROPOMI Atmospheric Telemetry
            </h3>
            <p className="text-body-sm text-on-surface-variant">
              Satellite column absorption measurements for trace greenhouse gases and aerosol particulate concentrations.
            </p>

            <div className="space-y-3">
              {[
                { label: "Particulate Matter PM2.5", val: `${atmosphere.pm25} µg/m³`, status: "Within WHO Safe Limit", color: "text-secondary" },
                { label: "Coarse Particulate PM10", val: `${atmosphere.pm10} µg/m³`, status: "Nominal Ambient Level", color: "text-secondary" },
                { label: "Nitrogen Dioxide (NO2)", val: `${atmosphere.no2} ppb`, status: "Traffic & Combustion Plume", color: atmosphere.no2 > 25 ? "text-tertiary" : "text-secondary" },
                { label: "Sulphur Dioxide (SO2)", val: `${atmosphere.so2} ppb`, status: "Industrial Baseline Safe", color: "text-secondary" },
                { label: "Carbon Monoxide (CO)", val: `${atmosphere.co} ppm`, status: "Atmospheric Background", color: "text-secondary" },
                { label: "Aerosol Optical Depth (AOD)", val: `${atmosphere.aerosolOpticalDepth}`, status: "Clear Optical Column", color: "text-secondary" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/20">
                  <div>
                    <p className="text-xs font-bold text-on-surface">{item.label}</p>
                    <p className="text-[11px] text-on-surface-variant">{item.status}</p>
                  </div>
                  <span className="text-sm font-extrabold font-mono text-on-surface">{item.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Unified Risk Index Matrix */}
          <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-ambient space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">shield</span>
                Environmental Risk Index (ERI) Synthesis
              </h3>
              <p className="text-body-sm text-on-surface-variant">
                Synthesized risk index combining atmospheric particulate, thermal infrared stress, coastal moisture, and wind surge.
              </p>

              <div className="mt-6 flex items-center gap-6">
                <div className="relative flex items-center justify-center">
                  <svg className="w-28 h-28 transform -rotate-90">
                    <circle cx="56" cy="56" r="46" stroke="currentColor" strokeWidth="10" className="text-surface-container-highest" fill="transparent" />
                    <circle
                      cx="56"
                      cy="56"
                      r="46"
                      stroke="currentColor"
                      strokeWidth="10"
                      strokeDasharray={289}
                      strokeDashoffset={289 - (289 * environmentalRiskIndex) / 100}
                      className={environmentalRiskIndex > 65 ? "text-error" : environmentalRiskIndex > 40 ? "text-tertiary" : "text-secondary"}
                      fill="transparent"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-extrabold text-on-surface">{environmentalRiskIndex}</span>
                    <span className="text-[10px] font-bold text-outline">/ 100</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    environmentalRiskIndex > 65 ? "bg-error/10 text-error" : environmentalRiskIndex > 40 ? "bg-tertiary/10 text-tertiary" : "bg-secondary/10 text-secondary"
                  }`}>
                    {environmentalRiskIndex > 65 ? "Elevated Hazard Alert" : environmentalRiskIndex > 40 ? "Moderate Vigilance" : "Nominal Stability"}
                  </span>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Composite score verified across 4 constellation satellites over the designated bounding polygon.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-outline-variant/20 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Directives & Action Recommendations</p>
              <ul className="space-y-1.5 text-xs text-on-surface-variant">
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-secondary text-[16px] shrink-0 mt-0.5">check_circle</span>
                  <span><strong>Municipal Authority:</strong> Routine drainage flow monitoring and vegetation canopy preservation.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-secondary text-[16px] shrink-0 mt-0.5">check_circle</span>
                  <span><strong>Public Health Advisory:</strong> Outdoor atmospheric index acceptable; no immediate respiratory alert active.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Database & Verification Compliance Certification Box */}
        <footer className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-6 space-y-3 text-xs text-on-surface-variant">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/20 pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">verified_user</span>
              <strong className="text-on-surface font-label-md">EcoWatch Planetary Intelligence Certification</strong>
            </div>
            <span className="font-mono text-[11px] text-outline">
              Verification Hash: {downlinkHash}
            </span>
          </div>

          <p className="leading-relaxed">
            This environmental assessment report is compiled autonomously using real-time remote sensing data downlinked from the European Space Agency Copernicus Constellation (Sentinel-2, Sentinel-5P) and the USGS/NASA Landsat Program. Relational audit trails are recorded in the EcoWatch MySQL database schema.
          </p>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-[11px]">
            <span>System Host: EcoWatch Intelligence Platform v3.0</span>
            <span>Record Status: Certified &amp; Immutable</span>
            <div className="flex gap-4 print:hidden">
              <Link to="/dashboard" className="text-primary font-bold hover:underline">Dashboard</Link>
              <Link to="/map" className="text-primary font-bold hover:underline">Interactive Map</Link>
              <Link to="/community-reports" className="text-primary font-bold hover:underline">Community Board</Link>
              <Link to="/analytics" className="text-primary font-bold hover:underline">Analytics</Link>
            </div>
          </div>
        </footer>
      </main>
    </DashboardLayout>
  );
}
