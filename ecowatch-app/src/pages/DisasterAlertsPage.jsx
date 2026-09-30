import React, { useState, useEffect, useMemo, useCallback, useDeferredValue } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import EcoInteractiveMap from "../components/EcoInteractiveMap";
import { apiRequest } from "../lib/api";


const DEFAULT_ALERTS = [
  {
    id: "ALERT-29402",
    title: "Riverside Flash Flood",
    type: "Flash Flood Warning",
    severity: "CRITICAL",
    icon: "flood",
    color: "text-error",
    box: "border-error bg-error-container/20",
    region: "Downtown District, Riverside Valley",
    issued: "12 mins ago",
    status: "Active Escalation",
    affected: "12,450",
    depth: "1.2m ↑",
    evacStatus: "45%",
    description:
      "Rapid water level increase in the Riverside channel following 150mm of precipitation in 4 hours. Structural integrity of the North Dam is being monitored. Severe risk of property damage and life-threatening flash flooding in low-lying areas of the Downtown District.",
    recommendedActions: [
      "Immediate evacuation of Zone A & B.",
      "Avoid travel through the Midtown underpass.",
      "Deploy flood barriers at critical substation #4.",
    ],
  },
  {
    id: "ALERT-29388",
    title: "Northern Ridge Wildfire",
    type: "Wildfire Escalation",
    severity: "WARNING",
    icon: "local_fire_department",
    color: "text-warning",
    box: "border-warning bg-warning-container/20",
    region: "Northern Ridge Forest Preserve",
    issued: "45 mins ago",
    status: "Monitoring",
    affected: "4,200",
    depth: "Wind 28km/h",
    evacStatus: "20%",
    description:
      "Thermal sensors detected sudden hotspot escalation across 120 hectares of dry brushland. Air drop operations staged at Sector 7.",
    recommendedActions: [
      "Maintain 5km buffer zone along ridge perimeters.",
      "Prepare perimeter sprinkler grids at Westside.",
      "Distribute N95 masks to vulnerable communities.",
    ],
  },
  {
    id: "ALERT-29350",
    title: "Harbor Gale & Surge",
    type: "High Wind Advisory",
    severity: "ADVISORY",
    icon: "air",
    color: "text-primary",
    box: "border-primary bg-primary-container/15",
    region: "Coastal Harbor Area",
    issued: "2 hours ago",
    status: "Active",
    affected: "8,900",
    depth: "Gusts 65km/h",
    evacStatus: "10%",
    description:
      "Offshore frontal system generating sustained gale winds with localized 1.8m coastal swell. Mooring lines and shoreline equipment should be secured.",
    recommendedActions: [
      "Halt recreational and commercial small craft navigation.",
      "Inspect high-mast lighting and crane installations.",
      "Activate coastal surge water gates at Zone 4.",
    ],
  },
  {
    id: "ALERT-29310",
    title: "Seismic Plate Monitoring",
    type: "Seismic Monitoring",
    severity: "MONITORING",
    icon: "tsunami",
    color: "text-on-surface-variant",
    box: "border-outline-variant bg-surface-container",
    region: "Subduction Trench Sector 9",
    issued: "4 hours ago",
    status: "Monitoring",
    affected: "N/A",
    depth: "Mag 3.8",
    evacStatus: "Normal",
    description:
      "Deep subterranean micro-tremors registered across 3 seabed sensors. Automated tsunami early warning thresholds remain below advisory triggers.",
    recommendedActions: [
      "Maintain continuous hydroacoustic sensor telemetry.",
      "Calibrate ocean floor pressure gauges.",
      "No civilian evacuation required at this time.",
    ],
  },
];

function mapServerAlert(a) {
  const sev = (a.severity || "WARNING").toUpperCase();
  const isCrit = sev === "CRITICAL" || sev === "HIGH";
  const isWarn = sev === "WARNING";
  const typeStr = a.type || "Hazard Advisory";

  let icon = "flood";
  if (typeStr.toLowerCase().includes("fire")) icon = "local_fire_department";
  else if (typeStr.toLowerCase().includes("wind") || typeStr.toLowerCase().includes("gale") || typeStr.toLowerCase().includes("storm")) icon = "air";
  else if (typeStr.toLowerCase().includes("seismic") || typeStr.toLowerCase().includes("quake") || typeStr.toLowerCase().includes("tsunami")) icon = "tsunami";

  return {
    id: a.id || a._id || `ALERT-${Date.now()}`,
    title: a.title || `${a.region || "Regional"} ${typeStr}`,
    type: typeStr,
    severity: sev,
    icon,
    color: isCrit ? "text-error" : isWarn ? "text-warning" : "text-primary",
    box: isCrit ? "border-error bg-error-container/20" : isWarn ? "border-warning bg-warning-container/20" : "border-primary bg-primary-container/15",
    region: a.region || a.location || "Monitored Zone",
    issued: a.timestamp ? new Date(a.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Recently",
    status: a.status || "Active",
    affected: a.affected || "8,500",
    depth: a.depth || "1.0m",
    evacStatus: a.evacStatus || "30%",
    description: a.description || "Monitored satellite anomaly logged into EcoWatch disaster coordination engine.",
    recommendedActions: a.recommendedActions || [
      "Deploy regional field observers.",
      "Activate emergency communication channels.",
      "Coordinate with municipal civil defense command."
    ],
  };
}

export default function DisasterAlertsPage() {
  const navigate = useNavigate();
  const [alertsList, setAlertsList] = useState(DEFAULT_ALERTS);
  const [selectedAlert, setSelectedAlert] = useState(DEFAULT_ALERTS[0]);

  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [liveStatus, setLiveStatus] = useState(true);

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
    affected: "15,000",
  });
  const [updateForm, setUpdateForm] = useState({
    status: "Active Escalation",
    description: "",
  });

  const [toastMessage, setToastMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.title = "Disaster Alerts | EcoWatch Intelligence";
    const timer = setInterval(() => setLastUpdated(new Date()), 5000);
    return () => clearInterval(timer);
  }, []);

  const loadAlerts = useCallback(async () => {
    try {
      const data = await apiRequest("/alerts");
      if (data?.alerts?.length) {
        const mapped = data.alerts.map(mapServerAlert);
        setAlertsList(mapped);
        setSelectedAlert((prev) => {
          const found = mapped.find((m) => m.id === prev?.id);
          return found || mapped[0];
        });
      }
    } catch (e) {
      console.warn("Using baseline alerts feed.");
    }
  }, []);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  const filteredAlerts = useMemo(() => {
    if (!deferredSearchTerm.trim()) return alertsList;
    const q = deferredSearchTerm.toLowerCase();
    return alertsList.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.type.toLowerCase().includes(q) ||
        a.region.toLowerCase().includes(q) ||
        a.severity.toLowerCase().includes(q)
    );
  }, [deferredSearchTerm, alertsList]);

  const criticalCount = useMemo(
    () => alertsList.filter((a) => a.severity === "CRITICAL" && a.status !== "Resolved").length,
    [alertsList]
  );

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
        region: broadcastForm.region,
        description: broadcastForm.description || `Critical emergency alert triggered for ${broadcastForm.region}.`,
      };

      const result = await apiRequest("/alerts", {
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
        region: "",
        description: "",
        affected: "15,000",
      });
      showToast(`🚨 Emergency Alert for ${payload.region} broadcasted and recorded to database.`);
    } catch (err) {
      showToast(`Broadcast failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolveAlert = async () => {
    if (!selectedAlert) return;
    setIsSubmitting(true);
    try {
      await apiRequest(`/alerts/${selectedAlert.id}`, { method: "DELETE" });
      setAlertsList((prev) =>
        prev.map((a) => (a.id === selectedAlert.id ? { ...a, status: "Resolved" } : a))
      );
      setSelectedAlert((prev) => ({ ...prev, status: "Resolved" }));
      showToast(`✓ Alert "${selectedAlert.title}" marked as Resolved.`);
    } catch (err) {
      showToast(`Failed to resolve alert: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Notification Toast */}
        {toastMessage && (
          <div className="fixed top-6 right-6 z-50 flex items-center gap-3 rounded-xl bg-surface-container-highest px-5 py-3 shadow-2xl border border-primary/40 text-on-surface animate-in fade-in slide-in-from-top-4 duration-300">
            <span className="material-symbols-outlined text-primary">info</span>
            <span className="text-body-sm font-medium">{toastMessage}</span>
          </div>
        )}

        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface flex items-center gap-3">
              Disaster Alerts
              <span className="inline-flex items-center rounded-full bg-error text-white text-[12px] font-bold px-2.5 py-0.5 shadow-sm">
                {criticalCount} CRITICAL
              </span>
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-body-sm text-on-surface-variant">
              <span className="inline-flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">schedule</span>
                Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className={`inline-block h-2 w-2 rounded-full ${liveStatus ? "bg-secondary animate-pulse" : "bg-outline-variant"}`} />
                {liveStatus ? "Live monitoring connected" : "Monitoring paused"}
              </span>
            </div>
            <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
              Real-time situational awareness, orbital risk detection, and emergency mobilization.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setLiveStatus((prev) => !prev)}
              className="flex items-center gap-2 rounded-full border border-outline-variant bg-secondary/10 px-4 py-2 font-label-md text-label-md text-secondary hover:bg-secondary/20 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">my_location</span>
              {liveStatus ? "Live Feeds Active" : "Feeds Paused"}
            </button>

            <button
              onClick={() => setIsBroadcastOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-error px-5 py-3 font-label-md text-label-md text-white shadow-md hover:bg-red-700 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined">campaign</span>
              Broadcast Emergency Alert
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Active Feed List */}
          <div className="xl:col-span-5">
            <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-ambient">
              <div className="mb-4 flex items-center justify-between border-b border-outline-variant pb-3">
                <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
                  Active Feed
                  <span className="text-xs bg-surface-container px-2 py-0.5 rounded-full text-on-surface-variant font-bold">
                    {filteredAlerts.length}
                  </span>
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={loadAlerts}
                    className="rounded-lg bg-surface-container p-2 text-on-surface-variant hover:text-primary transition-colors"
                    title="Refresh alerts from database"
                  >
                    <span className="material-symbols-outlined text-[18px]">refresh</span>
                  </button>
                </div>
              </div>

              <div className="mb-4 rounded-full border border-outline-variant bg-surface-container px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-on-surface-variant">search</span>
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border-none bg-transparent text-body-md text-on-surface outline-none placeholder:text-on-surface-variant focus:ring-0"
                    placeholder="Search by title, hazard, or region..."
                    type="text"
                  />
                </div>
              </div>

              <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
                {filteredAlerts.length === 0 ? (
                  <div className="text-center py-8 text-on-surface-variant text-body-sm">
                    No disaster alerts match your search query.
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
                          <div className="flex items-center gap-2">
                            <span className={`material-symbols-outlined ${alert.color}`}>
                              {alert.icon}
                            </span>
                            <span className="font-bold text-on-surface">{alert.title}</span>
                          </div>
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                              alert.severity === "CRITICAL"
                                ? "bg-error text-white"
                                : alert.severity === "WARNING"
                                ? "bg-warning text-on-warning"
                                : "bg-primary text-white"
                            }`}
                          >
                            {alert.severity}
                          </span>
                        </div>
                        <div className="space-y-1 text-body-sm text-on-surface-variant">
                          <p className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px]">location_on</span>
                            {alert.region}
                          </p>
                          <div className="flex items-center justify-between">
                            <p className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[16px]">schedule</span>
                              {alert.issued}
                            </p>
                            <span
                              className={`text-[11px] font-semibold ${
                                alert.status === "Resolved"
                                  ? "text-secondary"
                                  : alert.status === "Active Escalation"
                                  ? "text-error"
                                  : "text-warning"
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

          {/* Alert Detail Column */}
          <div className="xl:col-span-7 space-y-6">
            {/* Interactive Map Card */}
            <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 shadow-ambient">
              <div className="relative overflow-hidden rounded-xl bg-surface-container">
                <div className="absolute left-4 top-4 z-10 rounded-lg border border-outline-variant bg-surface-container-lowest/90 p-3 shadow-sm backdrop-blur-sm">
                  <h3 className="font-label-md text-label-md text-on-surface">Satellite Ground Track</h3>
                  <p className="text-[10px] text-on-surface-variant">Target: {selectedAlert?.region || "Orbital Sector"}</p>
                </div>
                <EcoInteractiveMap className="h-[280px] w-full" center={[13.0827, 80.2707]} zoom={11} showHeat />
              </div>
            </div>

            {/* Selected Alert Details */}
            {selectedAlert && (
              <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-ambient">
                <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-outline-variant pb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error-container">
                      <span className={`material-symbols-outlined text-[28px] ${selectedAlert.color}`}>
                        {selectedAlert.icon}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-headline-md text-headline-md text-on-surface">
                        {selectedAlert.title}
                      </h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        ID: <span className="font-mono">{selectedAlert.id}</span> | Status:{" "}
                        <span
                          className={`font-bold ${
                            selectedAlert.status === "Resolved"
                              ? "text-secondary"
                              : selectedAlert.status === "Active Escalation"
                              ? "text-error"
                              : "text-warning"
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
                      className="flex items-center gap-1.5 rounded-lg border border-primary text-primary px-3.5 py-2 font-label-md text-label-md hover:bg-primary/10 active:scale-95 transition-all"
                      title="Open full disaster protocol report"
                    >
                      <span className="material-symbols-outlined text-[18px]">lab_profile</span>
                      Generate Incident Report
                    </button>
                    <button
                      onClick={() => {
                        setUpdateForm({
                          status: selectedAlert.status,
                          description: selectedAlert.description,
                        });
                        setIsUpdateOpen(true);
                      }}
                      className="rounded-lg bg-primary px-4 py-2 font-label-md text-label-md text-on-primary hover:bg-primary-hover active:scale-95 transition-all"
                    >
                      Issue Update
                    </button>
                    <button
                      onClick={handleResolveAlert}
                      disabled={isSubmitting || selectedAlert.status === "Resolved"}
                      className="rounded-lg border border-outline-variant px-4 py-2 font-label-md text-label-md text-on-surface hover:bg-surface-container active:scale-95 transition-all disabled:opacity-50"
                    >
                      {selectedAlert.status === "Resolved" ? "Resolved ✓" : "Mark Resolved"}
                    </button>
                  </div>
                </div>


                <div className="mb-5 grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl bg-surface-container p-4 text-center">
                    <p className="font-label-sm text-label-sm text-on-surface-variant">Pop. Affected</p>
                    <p className="mt-2 font-headline-md text-headline-md text-on-surface">
                      {selectedAlert.affected}
                    </p>
                  </div>
                  <div className="rounded-xl bg-surface-container p-4 text-center">
                    <p className="font-label-sm text-label-sm text-on-surface-variant">Telemetry Reading</p>
                    <p className="mt-2 font-headline-md text-headline-md text-on-surface">
                      {selectedAlert.depth}
                    </p>
                  </div>
                  <div className="rounded-xl bg-surface-container p-4 text-center">
                    <p className="font-label-sm text-label-sm text-on-surface-variant">Evac. Readiness</p>
                    <p className="mt-2 font-headline-md text-headline-md text-warning">
                      {selectedAlert.evacStatus}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="mb-2 font-label-md text-label-md text-on-surface">Incident Assessment</h4>
                    <p className="font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
                      {selectedAlert.description}
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="mb-3 font-label-md text-label-md text-on-surface">Recommended Actions</h4>
                      <ul className="space-y-2 font-body-sm text-body-sm text-on-surface-variant">
                        {selectedAlert.recommendedActions.map((act, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-error text-[18px]">
                              check_circle
                            </span>
                            <span>{act}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="mb-3 font-label-md text-label-md text-on-surface">Timeline &amp; Telemetry</h4>
                      <div className="space-y-3 border-l border-outline-variant pl-4">
                        <div className="relative pl-4">
                          <span className="absolute left-[-1.2rem] top-1 h-3 w-3 rounded-full bg-error border-2 border-white" />
                          <p className="font-bold text-on-surface text-sm">Disaster Advisory Broadcast</p>
                          <p className="text-xs text-on-surface-variant">Registered into EcoWatch live DB</p>
                        </div>
                        <div className="relative pl-4">
                          <span className="absolute left-[-1.2rem] top-1 h-3 w-3 rounded-full bg-primary border-2 border-white" />
                          <p className="font-bold text-on-surface text-sm">Orbital Sensor Trigger</p>
                          <p className="text-xs text-on-surface-variant">Sentinel-2 multi-spectral scan</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Emergency Shelters Section */}
        <section className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-ambient">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">house</span>
              Emergency Shelters &amp; Resource Centers
            </h2>
            <button
              onClick={() => showToast("Shelter registry synchronized with state civil defense.")}
              className="font-label-md text-label-md text-primary hover:underline"
            >
              Sync Shelter Hubs
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { name: "Central Civic Hall", status: "95% FULL", statusColor: "text-error", bar: "bg-error w-[95%]", details: "Capacity: 500 • 25 Left", loc: "402 High St, Downtown" },
              { name: "Westside High Hub", status: "70% FULL", statusColor: "text-warning", bar: "bg-warning w-[70%]", details: "Capacity: 1,200 • 360 Left", loc: "12 Greenway Blvd, West" },
              { name: "Community Pavilion", status: "15% FULL", statusColor: "text-secondary", bar: "bg-secondary w-[15%]", details: "Capacity: 200 • 170 Left", loc: "88 Riverside Way, South" },
              { name: "Medical Supply Depot", status: "Active Logistics", statusColor: "text-primary", bar: "bg-primary w-full", details: "Ready for field deployment", loc: "North Transit Yard #3" }
            ].map((item) => (
              <div key={item.name} className="rounded-xl border border-outline-variant p-4 transition-all hover:border-primary bg-surface-container-low">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <span className="font-bold text-on-surface">{item.name}</span>
                  <span className={`text-[10px] font-bold ${item.statusColor}`}>{item.status}</span>
                </div>
                <p className="mb-4 text-body-sm text-on-surface-variant">{item.loc}</p>
                <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-surface-container">
                  <div className={`h-full rounded-full ${item.bar}`} />
                </div>
                <div className="text-[11px] text-on-surface-variant">{item.details}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Emergency Hotline Floating Button */}
        <button
          onClick={() => setIsContactOpen(true)}
          className="fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-error text-white shadow-2xl transition-transform hover:scale-110 active:scale-95 animate-bounce"
          aria-label="Emergency contact"
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
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Broadcast Emergency Alert</h3>
                </div>
                <button onClick={() => setIsBroadcastOpen(false)} className="rounded-full p-1 hover:bg-surface-container">
                  <span className="material-symbols-outlined text-on-surface-variant">close</span>
                </button>
              </div>

              <form onSubmit={handleBroadcastSubmit} className="space-y-4">
                <div>
                  <label className="block text-label-md text-on-surface mb-1">Hazard Type</label>
                  <select
                    value={broadcastForm.type}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, type: e.target.value })}
                    className="w-full rounded-lg border border-outline-variant bg-surface-container-low p-2.5 text-on-surface text-body-md outline-none focus:border-primary"
                  >
                    <option value="Flash Flood Warning">Flash Flood Warning</option>
                    <option value="Wildfire Escalation">Wildfire Escalation</option>
                    <option value="Severe Cyclone Advisory">Severe Cyclone Advisory</option>
                    <option value="High Wind Advisory">High Wind Advisory</option>
                    <option value="Chemical Spill Incident">Chemical Spill Incident</option>
                    <option value="Seismic Monitoring">Seismic Tremor Monitoring</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-label-md text-on-surface mb-1">Severity Level</label>
                    <select
                      value={broadcastForm.severity}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, severity: e.target.value })}
                      className="w-full rounded-lg border border-outline-variant bg-surface-container-low p-2.5 text-on-surface text-body-md outline-none focus:border-primary font-bold"
                    >
                      <option value="CRITICAL">CRITICAL</option>
                      <option value="WARNING">WARNING</option>
                      <option value="ADVISORY">ADVISORY</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-label-md text-on-surface mb-1">Estimated Affected</label>
                    <input
                      type="text"
                      value={broadcastForm.affected}
                      onChange={(e) => setBroadcastForm({ ...broadcastForm, affected: e.target.value })}
                      className="w-full rounded-lg border border-outline-variant bg-surface-container-low p-2.5 text-on-surface text-body-md outline-none focus:border-primary"
                      placeholder="e.g. 15,000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-label-md text-on-surface mb-1">Impacted Region / Coordinates</label>
                  <input
                    type="text"
                    required
                    value={broadcastForm.region}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, region: e.target.value })}
                    className="w-full rounded-lg border border-outline-variant bg-surface-container-low p-2.5 text-on-surface text-body-md outline-none focus:border-primary"
                    placeholder="e.g. Madurai Sub-basin, Tamil Nadu"
                  />
                </div>

                <div>
                  <label className="block text-label-md text-on-surface mb-1">Incident Directives &amp; Description</label>
                  <textarea
                    rows={3}
                    value={broadcastForm.description}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, description: e.target.value })}
                    className="w-full rounded-lg border border-outline-variant bg-surface-container-low p-2.5 text-on-surface text-body-md outline-none focus:border-primary"
                    placeholder="Provide immediate evacuation instructions, perimeter advisories, and response guidance..."
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

        {/* Update Modal */}
        {isUpdateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-md rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-outline-variant pb-4 mb-4">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Issue Situation Update</h3>
                <button onClick={() => setIsUpdateOpen(false)} className="rounded-full p-1 hover:bg-surface-container">
                  <span className="material-symbols-outlined text-on-surface-variant">close</span>
                </button>
              </div>

              <form onSubmit={handleUpdateSubmit} className="space-y-4">
                <div>
                  <label className="block text-label-md text-on-surface mb-1">Current Escalation Status</label>
                  <select
                    value={updateForm.status}
                    onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                    className="w-full rounded-lg border border-outline-variant bg-surface-container-low p-2.5 text-on-surface text-body-md outline-none focus:border-primary"
                  >
                    <option value="Active Escalation">Active Escalation</option>
                    <option value="Monitoring">Monitoring &amp; Containment</option>
                    <option value="Evacuation in Progress">Evacuation in Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>

                <div>
                  <label className="block text-label-md text-on-surface mb-1">Updated Situation Report</label>
                  <textarea
                    rows={4}
                    value={updateForm.description}
                    onChange={(e) => setUpdateForm({ ...updateForm, description: e.target.value })}
                    className="w-full rounded-lg border border-outline-variant bg-surface-container-low p-2.5 text-on-surface text-body-md outline-none focus:border-primary"
                    placeholder="Enter latest sensor readings, field report updates, dam levels, etc..."
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
                    className="rounded-lg bg-primary px-5 py-2 font-label-md text-on-primary hover:bg-primary-hover active:scale-95 disabled:opacity-50"
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
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Emergency Response Lines</h3>
                </div>
                <button onClick={() => setIsContactOpen(false)} className="rounded-full p-1 hover:bg-surface-container">
                  <span className="material-symbols-outlined text-on-surface-variant">close</span>
                </button>
              </div>

              <div className="space-y-3 mb-5">
                {[
                  { title: "EcoWatch Disaster Command", num: "+91 44 2833 0000", desc: "24/7 Orbital Anomaly Response" },
                  { title: "National Disaster Response (NDRF)", num: "1078", desc: "Toll-Free Emergency Dispatch" },
                  { title: "State Flood Control Room", num: "1070", desc: "Water Resources & Drainage Command" },
                  { title: "Ambulance & Medical Emergency", num: "108", desc: "Rapid Trauma Assistance" },
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
                className="w-full py-2.5 bg-surface-container text-on-surface font-label-md rounded-lg hover:bg-surface-container-high transition-colors"
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