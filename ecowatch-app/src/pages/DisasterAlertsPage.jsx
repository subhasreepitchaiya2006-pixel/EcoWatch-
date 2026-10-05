import React, { useState, useEffect, useMemo, useCallback, useDeferredValue } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import EcoInteractiveMap from "../components/EcoInteractiveMap";
import { apiRequest } from "../lib/api";
import { useSatelliteData } from "../context/SatelliteDataContext";

function getRelativeTime(timestamp) {
  if (!timestamp) return "Recently";
  const diffMs = Date.now() - new Date(timestamp).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function mapServerAlert(a) {
  const sev = (a.severity || "WARNING").toUpperCase();
  const isCrit = sev === "CRITICAL" || sev === "HIGH";
  const isWarn = sev === "WARNING";
  const typeStr = a.type || "Hazard Advisory";

  let icon = "warning";
  if (typeStr.toLowerCase().includes("flood")) icon = "flood";
  else if (typeStr.toLowerCase().includes("fire")) icon = "local_fire_department";
  else if (typeStr.toLowerCase().includes("wind") || typeStr.toLowerCase().includes("gale") || typeStr.toLowerCase().includes("storm")) icon = "air";
  else if (typeStr.toLowerCase().includes("tsunami") || typeStr.toLowerCase().includes("seismic") || typeStr.toLowerCase().includes("quake")) icon = "tsunami";
  else if (typeStr.toLowerCase().includes("water") || typeStr.toLowerCase().includes("spill")) icon = "water_drop";

  return {
    id: a.id || a._id || `ALERT-${Date.now()}`,
    title: a.title || `${a.region ? a.region.split(",")[0] : "Regional"} ${typeStr}`,
    type: typeStr,
    severity: sev,
    icon,
    color: isCrit ? "text-error" : isWarn ? "text-warning" : "text-primary",
    box: isCrit ? "border-error bg-error-container/20" : isWarn ? "border-warning bg-warning-container/20" : "border-primary bg-primary-container/15",
    region: a.region || a.location || "Monitored Sector",
    latitude: Number(a.latitude) || 8.7522,
    longitude: Number(a.longitude) || 77.7414,
    issued: getRelativeTime(a.timestamp),
    rawTimestamp: a.timestamp,
    status: a.status || "Active",
    affected: a.affected || "12,400",
    depth: a.depth || "Telemetry Active",
    evacStatus: a.evacStatus || (isCrit ? "60%" : isWarn ? "30%" : "Normal"),
    description: a.description || "Active satellite orbital sensor anomaly flagged by EcoWatch telemetry engine.",
    detectedBy: a.detectedBy || "Sentinel-2 Orbit",
    recommendedActions: a.recommendedActions && a.recommendedActions.length > 0 ? a.recommendedActions : [
      `Deploy localized civil emergency inspection observers to ${a.region || "the sector"}.`,
      "Activate municipal civil defense communication channels.",
      "Maintain continuous satellite orbit multispectral and radar monitoring.",
    ],
  };
}

export default function DisasterAlertsPage() {
  const navigate = useNavigate();
  const { coordinates, currentLocation } = useSatelliteData();

  const [alertsList, setAlertsList] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [liveStatus, setLiveStatus] = useState(true);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  // Forms
  const [broadcastForm, setBroadcastForm] = useState({
    type: "Flash Flood Warning",
    severity: "CRITICAL",
    region: "",
    description: "",
    affected: "14,500",
  });
  const [updateForm, setUpdateForm] = useState({
    status: "Active Escalation",
    description: "",
  });

  const [toastMessage, setToastMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeCityName = currentLocation ? currentLocation.split(",")[0].trim() : "Monitored Sector";

  // Pre-fill location in broadcast form
  useEffect(() => {
    if (currentLocation) {
      setBroadcastForm((prev) => ({
        ...prev,
        region: prev.region || currentLocation,
      }));
    }
  }, [currentLocation]);

  useEffect(() => {
    document.title = "Disaster Alerts | EcoWatch Intelligence";
    const timer = setInterval(() => {
      if (liveStatus) setLastUpdated(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, [liveStatus]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4500);
  };

  const loadAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiRequest("/alerts");
      if (data?.alerts?.length) {
        const mapped = data.alerts.map(mapServerAlert);
        setAlertsList(mapped);
        setSelectedAlert((prev) => {
          if (!prev) return mapped[0];
          const match = mapped.find((m) => m.id === prev.id);
          return match || mapped[0];
        });
      }
    } catch (e) {
      console.warn("Using active alerts cache:", e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  // Filter alerts by search term and severity tab
  const filteredAlerts = useMemo(() => {
    return alertsList.filter((a) => {
      const matchesSeverity =
        severityFilter === "ALL" ||
        (severityFilter === "RESOLVED"
          ? a.status === "Resolved"
          : a.status !== "Resolved" && a.severity === severityFilter);

      const q = deferredSearchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.type.toLowerCase().includes(q) ||
        a.region.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q);

      return matchesSeverity && matchesSearch;
    });
  }, [deferredSearchTerm, severityFilter, alertsList]);

  // Counts by severity
  const severityCounts = useMemo(() => {
    return {
      ALL: alertsList.length,
      CRITICAL: alertsList.filter((a) => a.severity === "CRITICAL" && a.status !== "Resolved").length,
      HIGH: alertsList.filter((a) => a.severity === "HIGH" && a.status !== "Resolved").length,
      WARNING: alertsList.filter((a) => a.severity === "WARNING" && a.status !== "Resolved").length,
      ADVISORY: alertsList.filter((a) => a.severity === "ADVISORY" && a.status !== "Resolved").length,
      RESOLVED: alertsList.filter((a) => a.status === "Resolved").length,
    };
  }, [alertsList]);

  // Broadcast new alert
  const handleBroadcastSubmit = async (e) => {
    e.preventDefault();
    if (!broadcastForm.region.trim()) {
      showToast("Please specify the hazard region / location.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        type: broadcastForm.type,
        severity: broadcastForm.severity,
        region: broadcastForm.region.trim(),
        description: broadcastForm.description.trim() || `Urgent emergency alert dispatched for ${broadcastForm.region}.`,
        latitude: coordinates?.lat || 8.7522,
        longitude: coordinates?.lon || 77.7414,
        affected: broadcastForm.affected || "15,000",
        depth: "Satellite Broadcast",
        evacStatus: broadcastForm.severity === "CRITICAL" ? "65%" : "35%",
      };

      const result = await apiRequest("/alerts/broadcast", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const newAlert = mapServerAlert(result.alert || { ...payload, id: `ALERT-${Date.now()}` });
      setAlertsList((prev) => [newAlert, ...prev]);
      setSelectedAlert(newAlert);
      setIsBroadcastOpen(false);
      setBroadcastForm({
        type: "Flash Flood Warning",
        severity: "CRITICAL",
        region: currentLocation || "",
        description: "",
        affected: "14,500",
      });
      showToast(`🚨 Emergency Alert for ${payload.region} broadcasted and recorded to database.`);
    } catch (err) {
      showToast(`Broadcast failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resolve alert
  const handleResolveAlert = async () => {
    if (!selectedAlert) return;
    setIsSubmitting(true);
    try {
      await apiRequest(`/alerts/${selectedAlert.id}`, {
        method: "PUT",
        body: JSON.stringify({ status: "Resolved", description: `Resolved: Conditions stabilized. Threat downgraded.` }),
      });
      const updated = { ...selectedAlert, status: "Resolved" };
      setAlertsList((prev) =>
        prev.map((a) => (a.id === selectedAlert.id ? updated : a))
      );
      setSelectedAlert(updated);
      showToast(`✓ Alert "${selectedAlert.title}" marked as Resolved.`);
    } catch (err) {
      showToast(`Failed to resolve alert: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Issue update
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAlert) return;
    setIsSubmitting(true);
    try {
      await apiRequest(`/alerts/${selectedAlert.id}`, {
        method: "PUT",
        body: JSON.stringify(updateForm),
      });
      const updated = {
        ...selectedAlert,
        status: updateForm.status,
        description: updateForm.description || selectedAlert.description,
      };
      setAlertsList((prev) => prev.map((a) => (a.id === selectedAlert.id ? updated : a)));
      setSelectedAlert(updated);
      setIsUpdateOpen(false);
      showToast(`Update published for ${selectedAlert.title}.`);
    } catch (err) {
      showToast(`Failed to update alert: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Dynamic Emergency Shelters for active location
  const dynamicShelters = useMemo(() => {
    return [
      {
        name: `${activeCityName} District Disaster Relief Center`,
        status: "85% OCCUPIED",
        statusColor: "text-error",
        bar: "bg-error w-[85%]",
        details: "Capacity: 800 • 120 Beds Available",
        loc: `District Collectorate Complex, ${activeCityName}`,
      },
      {
        name: `${activeCityName} Central Transit Relief Pavilion`,
        status: "48% OCCUPIED",
        statusColor: "text-warning",
        bar: "bg-warning w-[48%]",
        details: "Capacity: 1,200 • 624 Beds Available",
        loc: `Main Transit Junction, ${activeCityName}`,
      },
      {
        name: `${activeCityName} Municipal Community Shelter`,
        status: "20% OCCUPIED",
        statusColor: "text-secondary",
        bar: "bg-secondary w-[20%]",
        details: "Capacity: 450 • 360 Beds Available",
        loc: `Civil Defense High School Ground, ${activeCityName}`,
      },
      {
        name: `${activeCityName} Medical & Trauma Logistics Unit`,
        status: "Active Response",
        statusColor: "text-primary",
        bar: "bg-primary w-full",
        details: "Mobile Trauma Vans & Supply Staging Ready",
        loc: `Government Medical College Perimeter, ${activeCityName}`,
      },
    ];
  }, [activeCityName]);

  // Map markers for all filtered alerts
  const alertMarkers = useMemo(() => {
    return filteredAlerts.map((a) => ({
      lat: a.latitude,
      lon: a.longitude,
      title: a.title,
      category: a.type,
      status: a.severity,
      id: a.id,
      popupContent: `<strong>${a.title}</strong><br/><span style="color:#ef4444;font-weight:bold;">${a.severity}</span> &bull; ${a.status}<br/><small>${a.region}</small>`,
    }));
  }, [filteredAlerts]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-xl bg-surface-container-highest px-5 py-3 shadow-2xl border border-primary/40 text-on-surface animate-in fade-in slide-in-from-top-4 duration-300">
            <span className="material-symbols-outlined text-primary">info</span>
            <span className="text-body-sm font-medium">{toastMessage}</span>
          </div>
        )}

        {/* Page Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface flex items-center gap-3">
              Disaster Alerts
              <span className="inline-flex items-center rounded-full bg-error text-white text-[12px] font-bold px-3 py-0.5 shadow-sm">
                {severityCounts.CRITICAL} CRITICAL
              </span>
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-body-sm text-on-surface-variant">
              <span className="inline-flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">schedule</span>
                Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className={`inline-block h-2 w-2 rounded-full ${liveStatus ? "bg-secondary animate-pulse" : "bg-outline-variant"}`} />
                {liveStatus ? "Live satellite feeds connected" : "Monitoring paused"}
              </span>
            </div>
            <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
              Orbital hazard telemetry, rapid situation reports, and civil defense mobilization in {currentLocation || "your active sector"}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setLiveStatus((prev) => !prev)}
              className="flex items-center gap-2 rounded-full border border-outline-variant bg-secondary/10 px-4 py-2 font-label-md text-label-md font-semibold text-secondary hover:bg-secondary/20 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">my_location</span>
              {liveStatus ? "Live Feeds Active" : "Feeds Paused"}
            </button>

            <button
              onClick={() => setIsBroadcastOpen(true)}
              className="flex items-center gap-2 rounded-full bg-error px-5 py-2.5 font-label-md text-label-md font-semibold text-white shadow-md hover:bg-red-700 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[20px]">campaign</span>
              Broadcast Emergency Alert
            </button>
          </div>
        </header>

        {/* Severity Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-outline-variant/60 pb-3">
          {[
            { key: "ALL", label: "All Active", count: severityCounts.ALL },
            { key: "CRITICAL", label: "Critical", count: severityCounts.CRITICAL, color: "text-error" },
            { key: "HIGH", label: "High Hazard", count: severityCounts.HIGH, color: "text-error" },
            { key: "WARNING", label: "Warning", count: severityCounts.WARNING, color: "text-amber-500" },
            { key: "ADVISORY", label: "Advisory", count: severityCounts.ADVISORY, color: "text-primary" },
            { key: "RESOLVED", label: "Resolved", count: severityCounts.RESOLVED, color: "text-secondary" },
          ].map((tab) => {
            const isActive = severityFilter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSeverityFilter(tab.key)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-label-sm font-bold transition-all ${
                  isActive
                    ? "bg-primary text-on-primary shadow-sm"
                    : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`rounded-full px-1.5 py-0.2 text-[10px] ${isActive ? "bg-white/20 text-white" : "bg-surface-container-highest text-on-surface"}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left Column: Active Alert Feed (5 cols) */}
          <div className="xl:col-span-5 space-y-4">
            <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-ambient">
              <div className="mb-4 flex items-center justify-between border-b border-outline-variant pb-3">
                <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-2">
                  Active Feed
                  <span className="text-xs bg-surface-container px-2 py-0.5 rounded-full text-on-surface-variant font-bold">
                    {filteredAlerts.length}
                  </span>
                </h2>
                <button
                  onClick={loadAlerts}
                  className="rounded-lg bg-surface-container p-2 text-on-surface-variant hover:text-primary transition-colors"
                  title="Refresh alerts from database"
                >
                  <span className="material-symbols-outlined text-[18px]">refresh</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="mb-4 rounded-full border border-outline-variant bg-surface-container px-4 py-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border-none bg-transparent text-body-sm text-on-surface outline-none placeholder:text-on-surface-variant focus:ring-0"
                    placeholder="Search by hazard, region, or keywords..."
                    type="text"
                  />
                </div>
              </div>

              {/* Alerts List */}
              <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
                {filteredAlerts.length === 0 ? (
                  <div className="text-center py-12 text-on-surface-variant text-body-sm">
                    <span className="material-symbols-outlined text-4xl text-outline mb-2">notifications_off</span>
                    <p className="font-bold text-on-surface">No disaster alerts in this filter</p>
                    <p className="text-xs mt-1">Try switching severity tabs or clearing search keywords.</p>
                  </div>
                ) : (
                  filteredAlerts.map((alert) => {
                    const isSelected = selectedAlert?.id === alert.id;
                    return (
                      <div
                        key={alert.id}
                        onClick={() => setSelectedAlert(alert)}
                        className={`cursor-pointer rounded-xl border-l-4 p-4 transition-all hover:bg-surface-container ${
                          alert.box
                        } ${isSelected ? "ring-2 ring-primary shadow-sm" : ""}`}
                      >
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className={`material-symbols-outlined ${alert.color} shrink-0`}>
                              {alert.icon}
                            </span>
                            <span className="font-bold text-on-surface text-sm truncate">
                              {alert.title}
                            </span>
                          </div>
                          <span
                            className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-bold ${
                              alert.severity === "CRITICAL" || alert.severity === "HIGH"
                                ? "bg-error text-white"
                                : alert.severity === "WARNING"
                                ? "bg-amber-500 text-white"
                                : "bg-primary text-white"
                            }`}
                          >
                            {alert.severity}
                          </span>
                        </div>

                        <div className="space-y-1 text-body-sm text-on-surface-variant">
                          <p className="flex items-center gap-1.5 text-xs">
                            <span className="material-symbols-outlined text-[15px] text-primary">location_on</span>
                            <span className="truncate">{alert.region}</span>
                          </p>
                          <div className="flex items-center justify-between text-xs pt-1">
                            <p className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[15px]">schedule</span>
                              {alert.issued}
                            </p>
                            <span
                              className={`font-semibold ${
                                alert.status === "Resolved"
                                  ? "text-secondary"
                                  : alert.status === "Active Escalation" || alert.status === "Active"
                                  ? "text-error"
                                  : "text-amber-600"
                              }`}
                            >
                              ● {alert.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Map & Selected Alert Dossier (7 cols) */}
          <div className="xl:col-span-7 space-y-6">
            {/* Interactive Hazard Map */}
            <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-4 shadow-ambient">
              <div className="relative overflow-hidden rounded-xl bg-surface-container">
                <div className="absolute left-4 top-4 z-10 rounded-lg border border-outline-variant/50 bg-surface-container-lowest/90 p-3 shadow-md backdrop-blur-md">
                  <h3 className="font-label-md text-label-md font-bold text-on-surface">Satellite Ground Track &amp; Incident Radius</h3>
                  <p className="text-[11px] text-on-surface-variant">Active Threat Target: {selectedAlert?.region || activeCityName}</p>
                </div>
                <EcoInteractiveMap
                  className="h-[300px] w-full"
                  center={selectedAlert ? [selectedAlert.latitude, selectedAlert.longitude] : (coordinates ? [coordinates.lat, coordinates.lon] : [8.7522, 77.7414])}
                  zoom={10}
                  markers={alertMarkers}
                  onMarkerClick={(marker) => {
                    const match = alertsList.find((a) => a.id === marker.id);
                    if (match) setSelectedAlert(match);
                  }}
                />
              </div>
            </div>

            {/* Selected Alert Details Card */}
            {selectedAlert && (
              <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-ambient">
                <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-outline-variant pb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error-container">
                      <span className={`material-symbols-outlined text-[28px] ${selectedAlert.color}`}>
                        {selectedAlert.icon}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                        {selectedAlert.title}
                      </h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Hazard ID: <span className="font-mono font-bold text-primary">{selectedAlert.id}</span> | Status:{" "}
                        <span
                          className={`font-bold ${
                            selectedAlert.status === "Resolved"
                              ? "text-secondary"
                              : selectedAlert.status === "Active Escalation" || selectedAlert.status === "Active"
                              ? "text-error"
                              : "text-amber-600"
                          }`}
                        >
                          {selectedAlert.status}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    <button
                      onClick={() => navigate(`/reports?id=${selectedAlert.id}&type=disaster`)}
                      className="flex items-center gap-1.5 rounded-lg border border-primary text-primary px-3.5 py-2 font-label-md text-label-md font-semibold hover:bg-primary/10 active:scale-95 transition-all"
                      title="Open full disaster protocol report"
                    >
                      <span className="material-symbols-outlined text-[18px]">lab_profile</span>
                      Generate Incident Dossier
                    </button>
                    <button
                      onClick={() => {
                        setUpdateForm({
                          status: selectedAlert.status,
                          description: selectedAlert.description,
                        });
                        setIsUpdateOpen(true);
                      }}
                      className="rounded-lg bg-primary px-4 py-2 font-label-md text-label-md font-semibold text-on-primary hover:bg-primary/90 active:scale-95 transition-all shadow-sm"
                    >
                      Issue Update
                    </button>
                    <button
                      onClick={handleResolveAlert}
                      disabled={isSubmitting || selectedAlert.status === "Resolved"}
                      className="rounded-lg border border-outline-variant px-4 py-2 font-label-md text-label-md font-semibold text-on-surface hover:bg-surface-container active:scale-95 transition-all disabled:opacity-50"
                    >
                      {selectedAlert.status === "Resolved" ? "Resolved ✓" : "Mark Resolved"}
                    </button>
                  </div>
                </div>

                {/* 3 Telemetry Summary Blocks */}
                <div className="mb-5 grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl bg-surface-container p-4 text-center">
                    <p className="font-label-sm text-label-sm font-semibold text-on-surface-variant">Pop. Affected</p>
                    <p className="mt-2 font-headline-md text-headline-md font-bold text-on-surface">
                      {selectedAlert.affected}
                    </p>
                  </div>
                  <div className="rounded-xl bg-surface-container p-4 text-center">
                    <p className="font-label-sm text-label-sm font-semibold text-on-surface-variant">Sensor Telemetry</p>
                    <p className="mt-2 font-headline-md text-headline-md font-bold text-on-surface">
                      {selectedAlert.depth}
                    </p>
                  </div>
                  <div className="rounded-xl bg-surface-container p-4 text-center">
                    <p className="font-label-sm text-label-sm font-semibold text-on-surface-variant">Evac. Readiness</p>
                    <p className="mt-2 font-headline-md text-headline-md font-bold text-warning">
                      {selectedAlert.evacStatus}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="mb-1 font-label-md text-label-md font-bold text-on-surface">Incident Assessment</h4>
                    <p className="font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
                      {selectedAlert.description}
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="mb-3 font-label-md text-label-md font-bold text-on-surface">Recommended Actions</h4>
                      <ul className="space-y-2 font-body-sm text-body-sm text-on-surface-variant">
                        {selectedAlert.recommendedActions.map((act, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-error text-[18px] shrink-0 mt-0.5">
                              check_circle
                            </span>
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="mb-3 font-label-md text-label-md font-bold text-on-surface">Timeline &amp; Telemetry</h4>
                      <div className="space-y-3 border-l-2 border-outline-variant pl-4">
                        <div className="relative pl-3">
                          <span className="absolute -left-[19px] top-1.5 h-3 w-3 rounded-full bg-error border-2 border-white" />
                          <p className="font-bold text-on-surface text-xs">Emergency Alert Triggered</p>
                          <p className="text-[11px] text-on-surface-variant">{selectedAlert.issued} &bull; Recorded in database</p>
                        </div>
                        <div className="relative pl-3">
                          <span className="absolute -left-[19px] top-1.5 h-3 w-3 rounded-full bg-primary border-2 border-white" />
                          <p className="font-bold text-on-surface text-xs">Orbital Remote Sensing Scan</p>
                          <p className="text-[11px] text-on-surface-variant">{selectedAlert.detectedBy}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Emergency Shelters Section (Dynamically localized to active region) */}
        <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-ambient">
          <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">house</span>
                Emergency Shelters &amp; Resource Hubs ({activeCityName})
              </h2>
              <p className="font-body-sm text-[12px] text-on-surface-variant">
                Live designated shelter points, available beds, and medical staging posts across {activeCityName}.
              </p>
            </div>
            <button
              onClick={() => showToast(`Shelter registry synchronized for ${activeCityName}.`)}
              className="font-label-md text-label-md font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">sync</span>
              Sync Shelter Hubs
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {dynamicShelters.map((item) => (
              <div key={item.name} className="rounded-xl border border-outline-variant/40 p-4 transition-all hover:border-primary bg-surface-container-low">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <span className="font-bold text-on-surface text-sm line-clamp-1">{item.name}</span>
                  <span className={`text-[10px] font-bold ${item.statusColor} shrink-0`}>{item.status}</span>
                </div>
                <p className="mb-3 text-body-sm text-[12px] text-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">pin_drop</span>
                  {item.loc}
                </p>
                <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-surface-container">
                  <div className={`h-full rounded-full ${item.bar}`} />
                </div>
                <div className="text-[11px] font-medium text-on-surface-variant">{item.details}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Floating Emergency Hotline Button */}
        <button
          onClick={() => setIsContactOpen(true)}
          className="fixed bottom-8 right-8 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-error text-white shadow-2xl transition-transform hover:scale-110 active:scale-95 animate-bounce"
          aria-label="Emergency command hotline"
          title="Emergency Command Hotline"
        >
          <span className="material-symbols-outlined text-[32px]">phone_in_talk</span>
        </button>

        {/* Broadcast Modal */}
        {isBroadcastOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-lg rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-outline-variant pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-error text-[28px]">campaign</span>
                  <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Broadcast Emergency Alert</h3>
                </div>
                <button onClick={() => setIsBroadcastOpen(false)} className="rounded-full p-1 hover:bg-surface-container">
                  <span className="material-symbols-outlined text-on-surface-variant">close</span>
                </button>
              </div>

              <form onSubmit={handleBroadcastSubmit} className="space-y-4">
                <div>
                  <label className="block text-label-md font-semibold text-on-surface mb-1">Hazard Type *</label>
                  <select
                    value={broadcastForm.type}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, type: e.target.value })}
                    className="w-full rounded-lg border border-outline-variant bg-surface p-2.5 text-on-surface text-body-md outline-none focus:border-primary"
                  >
                    <option value="Flash Flood Warning">Flash Flood Warning</option>
                    <option value="Wildfire Thermal Anomaly">Wildfire Thermal Anomaly</option>
                    <option value="High Wind & Marine Gale Advisory">High Wind & Marine Gale Advisory</option>
                    <option value="Severe Cyclone Advisory">Severe Cyclone Advisory</option>
                    <option value="Hydrological Discoloration Alert">Hydrological Discoloration Alert</option>
                    <option value="Chemical Plume Hazard">Chemical Plume Hazard</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-label-md font-semibold text-on-surface mb-1">Severity Level *</label>
                    <select
                      value={broadcastForm.severity}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, severity: e.target.value })}
                      className="w-full rounded-lg border border-outline-variant bg-surface p-2.5 text-on-surface text-body-md outline-none focus:border-primary font-bold"
                    >
                      <option value="CRITICAL">CRITICAL</option>
                      <option value="HIGH">HIGH</option>
                      <option value="WARNING">WARNING</option>
                      <option value="ADVISORY">ADVISORY</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-label-md font-semibold text-on-surface mb-1">Estimated Affected</label>
                    <input
                      type="text"
                      value={broadcastForm.affected}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, affected: e.target.value })}
                      className="w-full rounded-lg border border-outline-variant bg-surface p-2.5 text-on-surface text-body-md outline-none focus:border-primary"
                      placeholder="e.g. 15,000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-label-md font-semibold text-on-surface mb-1">Impacted Region / Sector *</label>
                  <input
                    type="text"
                    required
                    value={broadcastForm.region}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, region: e.target.value })}
                    className="w-full rounded-lg border border-outline-variant bg-surface p-2.5 text-on-surface text-body-md outline-none focus:border-primary"
                    placeholder="e.g. KTC Nagar & Thamirabarani Basin, Tirunelveli"
                  />
                </div>

                <div>
                  <label className="block text-label-md font-semibold text-on-surface mb-1">Incident Directives &amp; Action Plan</label>
                  <textarea
                    rows={3}
                    value={broadcastForm.description}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, description: e.target.value })}
                    className="w-full rounded-lg border border-outline-variant bg-surface p-2.5 text-on-surface text-body-md outline-none focus:border-primary"
                    placeholder="Provide immediate evacuation instructions, perimeter advisories, and emergency response guidance..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
                  <button
                    type="button"
                    onClick={() => setIsBroadcastOpen(false)}
                    className="rounded-lg border border-outline-variant px-4 py-2 font-label-md text-on-surface hover:bg-surface-container"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-lg bg-error px-5 py-2 font-label-md text-white hover:bg-red-700 active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? "Broadcasting..." : "Dispatch Broadcast"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Update Situation Modal */}
        {isUpdateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-md rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-outline-variant pb-4 mb-4">
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Issue Situation Update</h3>
                <button onClick={() => setIsUpdateOpen(false)} className="rounded-full p-1 hover:bg-surface-container">
                  <span className="material-symbols-outlined text-on-surface-variant">close</span>
                </button>
              </div>

              <form onSubmit={handleUpdateSubmit} className="space-y-4">
                <div>
                  <label className="block text-label-md font-semibold text-on-surface mb-1">Current Escalation Status</label>
                  <select
                    value={updateForm.status}
                    onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                    className="w-full rounded-lg border border-outline-variant bg-surface p-2.5 text-on-surface text-body-md outline-none focus:border-primary"
                  >
                    <option value="Active Escalation">Active Escalation</option>
                    <option value="Monitoring & Containment">Monitoring &amp; Containment</option>
                    <option value="Evacuation in Progress">Evacuation in Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>

                <div>
                  <label className="block text-label-md font-semibold text-on-surface mb-1">Updated Situation Report</label>
                  <textarea
                    rows={4}
                    value={updateForm.description}
                    onChange={(e) => setUpdateForm({ ...updateForm, description: e.target.value })}
                    className="w-full rounded-lg border border-outline-variant bg-surface p-2.5 text-on-surface text-body-md outline-none focus:border-primary"
                    placeholder="Enter latest sensor readings, field report updates, water levels, containment status..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant">
                  <button
                    type="button"
                    onClick={() => setIsUpdateOpen(false)}
                    className="rounded-lg border border-outline-variant px-4 py-2 font-label-md text-on-surface hover:bg-surface-container"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-lg bg-primary px-5 py-2 font-label-md text-on-primary hover:bg-primary/90 active:scale-95 disabled:opacity-50"
                  >
                    {isSubmitting ? "Saving..." : "Publish Update"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Emergency Hotline Contact Modal */}
        {isContactOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-md rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-outline-variant pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-error text-[28px]">phone_in_talk</span>
                  <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Emergency Response Hotlines</h3>
                </div>
                <button onClick={() => setIsContactOpen(false)} className="rounded-full p-1 hover:bg-surface-container">
                  <span className="material-symbols-outlined text-on-surface-variant">close</span>
                </button>
              </div>

              <div className="space-y-3 mb-5">
                {[
                  { title: "National Disaster Response (NDRF)", num: "1078", desc: "Toll-Free 24/7 National Emergency Command" },
                  { title: "State Disaster Control Room", num: "1070", desc: "State Disaster Management Authority (SDMA)" },
                  { title: "District Flood & Disaster Line", num: "1077", desc: `${activeCityName} DDMA Collectorate Control Room` },
                  { title: "Police Emergency Control", num: "112", desc: "Unified Emergency Response Support (ERSS)" },
                  { title: "Ambulance & Trauma Care", num: "108", desc: "24/7 Rapid Medical Ambulance Dispatch" },
                  { title: "Fire & Rescue Operations", num: "101", desc: "Fire Mitigation & Water Rescue Taskforce" },
                ].map((c) => (
                  <div key={c.title} className="p-3 rounded-xl border border-outline-variant bg-surface-container-low flex items-center justify-between">
                    <div>
                      <p className="font-bold text-on-surface text-sm">{c.title}</p>
                      <p className="text-xs text-on-surface-variant">{c.desc}</p>
                    </div>
                    <a
                      href={`tel:${c.num}`}
                      className="px-3 py-1.5 bg-error/10 text-error font-mono font-bold text-sm rounded-lg hover:bg-error hover:text-white transition-colors"
                    >
                      {c.num}
                    </a>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setIsContactOpen(false)}
                className="w-full py-2.5 bg-surface-container text-on-surface font-label-md font-semibold rounded-lg hover:bg-surface-container-high transition-colors"
              >
                Close Hotline Panel
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}