import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export const ROLE_CONFIGS = {
  "Citizen": {
    title: "Community Environmental Safety & Citizen Hub",
    badgeLabel: "Community Member",
    icon: "nature_people",
    badgeColor: "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800",
    gradient: "from-teal-900/10 via-emerald-900/5 to-surface-container-lowest",
    borderAccent: "border-teal-500/30",
    tagline: "Neighborhood safety advisories, air quality index, and community ecological reporting.",
    kpis: [
      { label: "Neighborhood Safety", value: "Normal", sub: "No active flash flood alerts", icon: "shield" },
      { label: "Local Air Quality", value: "Moderate (AQI 68)", sub: "Safe for regular outdoor activities", icon: "air" },
      { label: "Precipitation Chance", value: "24%", sub: "Scattered light showers forecast", icon: "water_drop" },
      { label: "Community Reporting", value: "Enabled", sub: "Report local waterlogging or smoke", icon: "volunteer_activism" },
    ],
    actions: [
      { label: "Report Neighborhood Issue", path: "/community-reports", icon: "add_circle", primary: true },
      { label: "Local 7-Day Weather", path: "/weather", icon: "wb_sunny" },
      { label: "View Neighborhood Map", path: "/map", icon: "explore" },
    ],
  },

  "System Admin": {
    title: "Global Platform Administration & Security Oversight",
    badgeLabel: "System Admin",
    icon: "admin_panel_settings",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
    gradient: "from-purple-900/10 via-indigo-900/5 to-surface-container-lowest",
    borderAccent: "border-purple-500/30",
    tagline: "Unrestricted access to platform credentials, user authorization, and system telemetry.",
    kpis: [
      { label: "Provisioned Accounts", value: "9 Active", sub: "5 distinct operational roles", icon: "manage_accounts" },
      { label: "Platform Health", value: "99.98%", sub: "Sentinel & Landsat APIs online", icon: "cloud_done" },
      { label: "Emergency Broadcasts", value: "5 Active", sub: "Regional corridors covered", icon: "campaign" },
      { label: "Security Clearance", value: "Level 5", sub: "Role modification & API keys", icon: "verified_user" },
    ],
    actions: [
      { label: "Admin Console", path: "/admin", icon: "shield_person", primary: true },
      { label: "Broadcast Emergency Alert", path: "/admin", icon: "crisis_alert" },
      { label: "Platform Settings", path: "/settings", icon: "tune" },
    ],
  },

  "Analyst": {
    title: "Orbital Telemetry & Multi-Spectral Analysis",
    badgeLabel: "Analyst",
    icon: "analytics",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
    gradient: "from-emerald-900/10 via-teal-900/5 to-surface-container-lowest",
    borderAccent: "border-emerald-500/30",
    tagline: "Earth observation sensor fusion, spectral index computations, and environmental trends.",
    kpis: [
      { label: "Satellite Constellation", value: "4 Orbits", sub: "Sentinel-2, Landsat-9, S5P", icon: "satellite_alt" },
      { label: "Vegetation Index (NDVI)", value: "0.68", sub: "Healthy biomass coverage", icon: "eco" },
      { label: "Water Index (NDWI)", value: "-0.14", sub: "Normal surface moisture", icon: "water_drop" },
      { label: "Telemetry Ingestion", value: "6.8k+ logs", sub: "Real-time sync to MongoDB", icon: "dataset" },
    ],
    actions: [
      { label: "View Analytics & Trends", path: "/analytics", icon: "monitoring", primary: true },
      { label: "Orbital Map Explorer", path: "/map", icon: "map" },
      { label: "Weather Radar", path: "/weather", icon: "radar" },
    ],
  },

  "Scientist": {
    title: "Atmospheric Chemistry & Climate Modeling Laboratory",
    badgeLabel: "Scientist",
    icon: "biotech",
    badgeColor: "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800",
    gradient: "from-sky-900/10 via-cyan-900/5 to-surface-container-lowest",
    borderAccent: "border-sky-500/30",
    tagline: "Tropospheric trace gas dispersion, radiative forcing, and planetary risk models.",
    kpis: [
      { label: "Planetary ERI Score", value: "38 / 100", sub: "Moderate Ecological Hazard", icon: "public" },
      { label: "Tropospheric NO₂", value: "14.2 µmol/m²", sub: "Sentinel-5P TROPOMI sensor", icon: "air" },
      { label: "Methane (CH₄)", value: "1,892 ppb", sub: "Global background baseline", icon: "science" },
      { label: "Ozone Column (O₃)", value: "298 DU", sub: "Stratospheric equilibrium", icon: "filter_drama" },
    ],
    actions: [
      { label: "Air Quality & Trace Gases", path: "/air-quality", icon: "cloud_sync", primary: true },
      { label: "Planetary Risk Analysis", path: "/analytics", icon: "equalizer" },
      { label: "Spectral Satellite Bands", path: "/map", icon: "layers" },
    ],
  },

  "Emergency Responder": {
    title: "Disaster Hazard Response & Evacuation Command",
    badgeLabel: "Emergency Responder",
    icon: "emergency",
    badgeColor: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
    gradient: "from-rose-900/10 via-red-900/5 to-surface-container-lowest",
    borderAccent: "border-rose-500/30",
    tagline: "Real-time threat perimeter tracking, inundation corridors, and rapid incident triage.",
    kpis: [
      { label: "Hazard Alerts Feed", value: "5 Advisories", sub: "Flood surge & cyclone watch", icon: "crisis_alert" },
      { label: "Impact Perimeter", value: "12.5 km", sub: "Active monitored sector", icon: "radar" },
      { label: "Readiness Level", value: "Condition Alpha", sub: "Response units mobilized", icon: "notification_important" },
      { label: "Wind & Storm Cells", value: "24 km/h", sub: "Gust escalation tracking", icon: "air" },
    ],
    actions: [
      { label: "Active Disaster Alerts", path: "/disaster-alerts", icon: "warning", primary: true },
      { label: "Hazard Perimeter Map", path: "/map", icon: "emergency_share" },
      { label: "Live Storm Radar", path: "/weather", icon: "thunderstorm" },
    ],
  },

  "Inspector": {
    title: "Environmental Compliance & Ground-Truth Verification",
    badgeLabel: "Inspector",
    icon: "fact_check",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
    gradient: "from-amber-900/10 via-orange-900/5 to-surface-container-lowest",
    borderAccent: "border-amber-500/30",
    tagline: "Field audit calibration, community incident validation, and regulatory compliance.",
    kpis: [
      { label: "Ground-Truth Reports", value: "4 Logged", sub: "Citizen reports in pipeline", icon: "groups" },
      { label: "Pending Verification", value: "2 Incidents", sub: "Require field audit signoff", icon: "pending_actions" },
      { label: "Compliance Audits", value: "9 Completed", sub: "Logged to audit trail", icon: "verified" },
      { label: "Sensor Calibration", value: "Standard", sub: "Surface vs orbital delta OK", icon: "balance" },
    ],
    actions: [
      { label: "Community Reports Queue", path: "/community-reports", icon: "assignment_turned_in", primary: true },
      { label: "Verify Ground Incidents", path: "/community-reports", icon: "checklist" },
      { label: "Compliance & Audit Feed", path: "/community-reports", icon: "policy" },
    ],
  },
};

export default function RoleOperationsDeck({ userRole = "Analyst", userName = "Specialist" }) {
  const navigate = useNavigate();

  const effectiveRole = userRole || "Analyst";
  const config = ROLE_CONFIGS[effectiveRole] || ROLE_CONFIGS["Analyst"];

  return (
    <div className={`relative mb-6 rounded-2xl border ${config.borderAccent} bg-gradient-to-br ${config.gradient} p-5 md:p-6 shadow-sm overflow-hidden transition-all duration-300`}>
      {/* Background ambient badge icon */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 -bottom-6 text-9xl text-on-surface opacity-[0.04] select-none material-symbols-outlined"
      >
        {config.icon}
      </span>

      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-container-high/80 backdrop-blur-sm border border-outline-variant/40 shadow-sm">
            <span className="material-symbols-outlined text-primary text-2xl">{config.icon}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${config.badgeColor}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                {config.badgeLabel} Workspace
              </span>
              <span className="text-[11px] text-on-surface-variant font-mono">
                {userName.split(" ")[0]}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-on-surface tracking-tight mt-0.5">
              {config.title}
            </h2>
          </div>
        </div>

        {/* Verified Role Clearance Status */}
        <div className="flex items-center gap-2 bg-surface-container-lowest/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-outline-variant/40 self-start sm:self-center shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-bold text-on-surface tracking-wide uppercase">
            {effectiveRole} Session Active
          </span>
        </div>
      </div>

      <p className="text-xs text-on-surface-variant mb-4 max-w-3xl">
        {config.tagline}
      </p>

      {/* 4 Role-Specific KPI Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {config.kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="p-3 rounded-xl bg-surface-container-lowest/90 border border-outline-variant/40 shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between text-on-surface-variant mb-1">
              <span className="text-[11px] font-medium uppercase tracking-wider truncate">{kpi.label}</span>
              <span className="material-symbols-outlined text-primary text-[18px]">{kpi.icon}</span>
            </div>
            <div className="text-base font-bold text-on-surface">{kpi.value}</div>
            <div className="text-[10px] text-on-surface-variant truncate mt-0.5">{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Citizen Exclusive: Where Community is Working to Join Report */}
      {effectiveRole === "Citizen" && (
        <div className="mb-4 p-3 rounded-xl bg-teal-500/10 border border-teal-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">volunteer_activism</span>
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-teal-900 dark:text-teal-200 truncate flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                Active Community Working Group • KTC Nagar Sector
              </div>
              <div className="text-[11px] text-on-surface-variant truncate">
                42 neighbors collaborating on Stormwater Drainage &amp; Clearing
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate("/community-reports?highlight=101&join=true")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold shrink-0 self-start sm:self-auto shadow-xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">group_add</span>
            Join Working Group
          </button>
        </div>
      )}

      {/* Role Action Shortcuts */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-outline-variant/20">
        <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mr-1">
          Role Actions:
        </span>
        {config.actions.map((act, idx) => (
          <button
            key={idx}
            onClick={() => navigate(act.path)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              act.primary
                ? "bg-primary text-white shadow-xs hover:bg-primary/90"
                : "bg-surface-container text-on-surface hover:bg-surface-container-high border border-outline-variant/30"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{act.icon}</span>
            <span>{act.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
