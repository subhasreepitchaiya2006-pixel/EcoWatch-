import React, { useState, useEffect, useMemo, useCallback } from "react";
import DashboardLayout from "../layouts/DashboardLayout";

function DisasterAlerts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAlert, setSelectedAlert] = useState("");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [liveStatus, setLiveStatus] = useState(true);

  const alerts = useMemo(
    () => [
      "Flash Flood Warning",
      "Wildfire Escalation",
      "High Wind Advisory",
      "Seismic Monitoring",
    ],
    []
  );

  const filteredAlertCount = useMemo(() => {
    if (!searchTerm.trim()) return alerts.length;
    return alerts.filter((alert) =>
      alert.toLowerCase().includes(searchTerm.toLowerCase())
    ).length;
  }, [searchTerm, alerts]);

  useEffect(() => {
    document.title = "Disaster Alerts | EcoWatch Intelligence";
    const timer = setInterval(() => setLastUpdated(new Date()), 2000);
    return () => clearInterval(timer);
  }, []);

  const handleLiveStatus = useCallback(() => {
    setLiveStatus((prev) => !prev);
  }, []);

  const handleBroadcast = useCallback(() => {
    alert("Emergency alert broadcast initiated.");
  }, []);

  const handleRefresh = useCallback(() => {
    setLastUpdated(new Date());
  }, []);

  const handleAlertClick = useCallback((event) => {
    const title = event.currentTarget.querySelector(".alert-title")?.textContent;
    setSelectedAlert(title || "Alert");
  }, []);

  const handleLogistics = useCallback(() => {
    alert("Logistics request submitted.");
  }, []);

  const handleEmergencyContact = useCallback(() => {
    alert("Emergency contact activated.");
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface flex items-center gap-3">
              Disaster Alerts
              <span className="inline-flex items-center rounded-full bg-error text-white text-[12px] font-bold px-2 py-0.5">
                4 CRITICAL
              </span>
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-body-sm text-on-surface-variant">
              <span className="inline-flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">schedule</span>
                Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className={`inline-block h-2 w-2 rounded-full ${liveStatus ? "bg-secondary" : "bg-outline-variant"}`} />
                {liveStatus ? "Live monitoring" : "Paused"}
              </span>
            </div>
            <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
              Real-time situational awareness and emergency response management.
            </p>
            {selectedAlert && (
              <p className="mt-2 font-body-sm text-body-sm text-primary">
                Selected alert: {selectedAlert}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLiveStatus}
              className="flex items-center gap-2 rounded-full border border-outline-variant bg-secondary/10 px-4 py-2 font-label-md text-label-md text-secondary hover:bg-secondary/20 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">my_location</span>
              {liveStatus ? "Live" : "Offline"}
            </button>

            <button
              onClick={handleBroadcast}
              className="flex items-center gap-2 rounded-lg bg-error px-5 py-3 font-label-md text-label-md text-white shadow-sm hover:bg-red-700 transition-all"
            >
              <span className="material-symbols-outlined">campaign</span>
              Broadcast Emergency Alert
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-5">
            <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-ambient">
              <div className="mb-4 flex items-center justify-between border-b border-outline-variant pb-3">
                <h2 className="font-headline-sm text-headline-sm text-on-surface">
                  Active Feed
                  {searchTerm && (
                    <span className="ml-2 font-body-sm text-body-sm text-primary">
                      Matches: {filteredAlertCount}
                    </span>
                  )}
                </h2>
                <div className="flex items-center gap-2">
                  <button className="rounded-lg bg-surface-container p-2 text-on-surface-variant hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[18px]">filter_list</span>
                  </button>
                  <button
                    onClick={handleRefresh}
                    className="rounded-lg bg-surface-container p-2 text-on-surface-variant hover:text-primary transition-colors"
                    title="Refresh alerts"
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
                    placeholder="Search alerts or locations..."
                    type="text"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { name: "Flash Flood Warning", type: "CRITICAL", icon: "flood", color: "text-error", box: "border-error bg-error-container/20" },
                  { name: "Wildfire Escalation", type: "WARNING", icon: "local_fire_department", color: "text-warning", box: "border-warning bg-warning-container/20" },
                  { name: "High Wind Advisory", type: "ADVISORY", icon: "air", color: "text-primary", box: "border-primary bg-primary-container/15" },
                  { name: "Seismic Monitoring", type: "MONITORING", icon: "tsunami", color: "text-on-surface-variant", box: "border-outline-variant bg-surface-container" }
                ].map((alert) => (
                  <div
                    key={alert.name}
                    onClick={handleAlertClick}
                    className={`cursor-pointer rounded-xl border-l-4 p-4 transition-colors hover:bg-surface-container ${alert.box}`}
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className={`material-symbols-outlined ${alert.color}`}>{alert.icon}</span>
                        <span className="alert-title font-bold text-on-surface">{alert.name}</span>
                      </div>
                      <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${alert.color} bg-white`}>{alert.type}</span>
                    </div>
                    <div className="space-y-1 text-body-sm text-on-surface-variant">
                      <p className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">location_on</span> Downtown District, Riverside Valley</p>
                      <p className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">schedule</span> Issued 12 mins ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="xl:col-span-7 space-y-6">
            <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-4 shadow-ambient">
              <div className="relative overflow-hidden rounded-xl bg-surface-container">
                <div className="absolute left-4 top-4 z-10 rounded-lg border border-outline-variant bg-white/90 p-3 shadow-sm backdrop-blur-sm">
                  <h3 className="font-label-md text-label-md text-on-surface">Impact Coverage</h3>
                  <p className="text-[10px] text-on-surface-variant">Live Satellite Visualization</p>
                </div>
                <img
                  alt="disaster map"
                  className="h-[300px] w-full object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBToY7-SK-7MCPZICElj4IzYS9Qk4G2NXrgRrIWsL293smI6jQrstVVwH4aGD1ZwEBh-vZ0v7Y5lPO8ZUi5Sh349qkt3Qf-XNbwOatGpdpYK-j6mPj_5Zu_iO1cwrrlKWDyfVJVfsrM9TCH2bOaV5Hnm4HcOcqA2n5yAVK1lC4uzXjNXDoht7L24B0lEJ4Qoge_kUuUTJR1M8w9aIjhAG3dVwkM91qP4WRxweGlEU7-8eEQEQHtt3ovn8mOv6ROMZP85zcUbyOoF5Oq"
                />
                <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                  <button className="rounded-lg bg-white p-2 shadow-sm hover:bg-surface-container transition-colors"><span className="material-symbols-outlined">add</span></button>
                  <button className="rounded-lg bg-white p-2 shadow-sm hover:bg-surface-container transition-colors"><span className="material-symbols-outlined">remove</span></button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-ambient">
              <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error-container">
                    <span className="material-symbols-outlined text-[28px] text-error">flood</span>
                  </div>
                  <div>
                    <h3 className="font-headline-md text-headline-md text-on-surface">Riverside Flash Flood</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      ID: ALERT-29402 | Status: <span className="font-bold text-error">Active Escalation</span>
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="rounded-lg bg-primary px-4 py-2 font-label-md text-label-md text-on-primary">Issue Update</button>
                  <button className="rounded-lg border border-outline-variant px-4 py-2 font-label-md text-label-md text-on-surface">Mark Resolved</button>
                </div>
              </div>

              <div className="mb-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-xl bg-surface-container p-4 text-center">
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Pop. Affected</p>
                  <p className="mt-2 font-headline-md text-headline-md text-on-surface">12,450</p>
                </div>
                <div className="rounded-xl bg-surface-container p-4 text-center">
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Current Depth</p>
                  <p className="mt-2 font-headline-md text-headline-md text-on-surface">1.2m <span className="text-error">↑</span></p>
                </div>
                <div className="rounded-xl bg-surface-container p-4 text-center">
                  <p className="font-label-sm text-label-sm text-on-surface-variant">Evac. Status</p>
                  <p className="mt-2 font-headline-md text-headline-md text-warning">45%</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 font-label-md text-label-md text-on-surface">Incident Assessment</h4>
                  <p className="font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
                    Rapid water level increase in the Riverside channel following 150mm of precipitation in 4 hours. Structural integrity of the North Dam is being monitored. Severe risk of property damage and life-threatening flash flooding in low-lying areas of the Downtown District.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h4 className="mb-3 font-label-md text-label-md text-on-surface">Recommended Actions</h4>
                    <ul className="space-y-2 font-body-sm text-body-sm text-on-surface-variant">
                      <li className="flex items-start gap-2"><span className="material-symbols-outlined text-error">check_circle</span> Immediate evacuation of Zone A &amp; B.</li>
                      <li className="flex items-start gap-2"><span className="material-symbols-outlined text-error">check_circle</span> Avoid travel through the Midtown underpass.</li>
                      <li className="flex items-start gap-2"><span className="material-symbols-outlined text-error">check_circle</span> Deploy flood barriers at critical substation #4.</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="mb-3 font-label-md text-label-md text-on-surface">Timeline</h4>
                    <div className="space-y-3 border-l border-outline-variant pl-4">
                      <div className="relative pl-4">
                        <span className="absolute left-[-1.2rem] top-1 h-3 w-3 rounded-full bg-error border-2 border-white" />
                        <p className="font-bold text-on-surface">Alert Escalated</p>
                        <p className="text-on-surface-variant">14:02 PM Today</p>
                      </div>
                      <div className="relative pl-4">
                        <span className="absolute left-[-1.2rem] top-1 h-3 w-3 rounded-full bg-primary border-2 border-white" />
                        <p className="font-bold text-on-surface">Initial Observation</p>
                        <p className="text-on-surface-variant">13:30 PM Today</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-ambient">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">house</span>
              Emergency Shelters &amp; Resource Centers
            </h2>
            <button className="font-label-md text-label-md text-primary hover:underline">View All Locations</button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { name: "Central Civic Hall", status: "95% FULL", statusColor: "text-error", bar: "bg-error w-[95%]", details: "Capacity: 500 • 25 Left" },
              { name: "Westside High", status: "70% FULL", statusColor: "text-warning", bar: "bg-warning w-[70%]", details: "Capacity: 1,200 • 360 Left" },
              { name: "Community Church", status: "15% FULL", statusColor: "text-secondary", bar: "bg-secondary w-[15%]", details: "Capacity: 200 • 170 Left" },
              { name: "Medical Supply Hub", status: "Dispatched: 4 Units", statusColor: "text-primary", bar: "bg-primary w-full", details: "Request logistics support" }
            ].map((item) => (
              <div key={item.name} className="rounded-xl border border-outline-variant p-4 transition-all hover:border-primary">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <span className="font-bold text-on-surface">{item.name}</span>
                  <span className={`text-[10px] font-bold ${item.statusColor}`}>{item.status}</span>
                </div>
                <p className="mb-4 text-body-sm text-on-surface-variant">402 High St, Downtown</p>
                <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-surface-container">
                  <div className={`h-full rounded-full ${item.bar}`} />
                </div>
                <div className="text-[11px] text-on-surface-variant">{item.details}</div>
              </div>
            ))}
          </div>
        </section>

        <button
          onClick={handleEmergencyContact}
          className="fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-error text-white shadow-2xl transition-transform hover:scale-110 active:scale-95"
          aria-label="Emergency contact"
        >
          <span className="material-symbols-outlined text-[32px]">phone_in_talk</span>
        </button>
      </div>
    </DashboardLayout>
  );
}

export default DisasterAlerts;