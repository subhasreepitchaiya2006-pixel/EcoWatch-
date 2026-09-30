import { Router } from "express";
import { isMySQLConnected } from "../db/mysql.js";

import authRoutes from "./authRoutes.js";
import profileRoutes from "./profileRoutes.js";
import alertsRoutes from "./alertsRoutes.js";
import reportsRoutes from "./reportsRoutes.js";
import satelliteRoutes from "./satelliteRoutes.js";
import environmentRoutes from "./environmentRoutes.js";
import analyticsRoutes from "./analyticsRoutes.js";
import settingsRoutes from "./settingsRoutes.js";

const router = Router();

// ----------------------------------------------------
// Health & Database Status Endpoints
// ----------------------------------------------------
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "EcoWatch Intelligence REST Server",
    satelliteFeeds: "ACTIVE",
    version: "3.0.0",
    database: isMySQLConnected ? "MySQL / Relational Pool" : "Persistent File-Backed Store (store.json)",
    mysqlConnected: isMySQLConnected,
    storageMode: isMySQLConnected ? "Live MySQL Database" : "Resilient Fallback (store.json)",
    constellation: ["Sentinel-2", "Landsat-9", "GOES-16", "Sentinel-5P"],
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

router.get("/database/status", async (req, res) => {
  let stats = {
    connected: isMySQLConnected,
    engine: isMySQLConnected ? "MySQL 8.0 / InnoDB Relational Pool" : "Dual-Engine Persistent Store (store.json)",
    tables: ["users", "alerts", "reports", "settings", "telemetry_logs"],
    userCount: 0,
    alertCount: 0,
    reportCount: 0,
    telemetryCount: 0,
    lastChecked: new Date().toISOString(),
  };

  try {
    const { UsersRepo, AlertsRepo, ReportsRepo, TelemetryRepo } = await import("../db/repository.js");
    const [alerts, reports, telemetry] = await Promise.all([
      AlertsRepo.findAll().catch(() => []),
      ReportsRepo.findAll().catch(() => []),
      TelemetryRepo.getRecentLogs(100).catch(() => []),
    ]);
    stats.alertCount = alerts.length;
    stats.reportCount = reports.length;
    stats.telemetryCount = telemetry.length;
    stats.userCount = 4; // baseline seeded users
  } catch (err) {
    // Non-fatal
  }

  res.json(stats);
});


// ----------------------------------------------------
// Interactive API Documentation Directory
// ----------------------------------------------------
router.get("/docs", (req, res) => {
  res.json({
    title: "EcoWatch Intelligence REST API Directory",
    version: "3.0.0",
    database: isMySQLConnected ? "MySQL" : "Persistent Store (store.json)",
    endpoints: [
      { path: "/api/health", method: "GET", description: "Backend status and database check." },
      { path: "/api/docs", method: "GET", description: "Complete API directory and schema details." },
      // Auth
      { path: "/api/auth/register", method: "POST", description: "Register a new user account with hashed password." },
      { path: "/api/auth/login", method: "POST", description: "Authenticate user and issue signed JWT token." },
      { path: "/api/auth/google", method: "POST", description: "Authenticate via Google OAuth ID token." },
      { path: "/api/auth/microsoft", method: "POST", description: "Authenticate via Microsoft Entra ID." },
      { path: "/api/auth/me", method: "GET", description: "Retrieve current authenticated user session.", authRequired: true },
      { path: "/api/auth/change-password", method: "POST", description: "Update user account password.", authRequired: true },
      { path: "/api/auth/logout", method: "POST", description: "Log out user session." },
      // Profile
      { path: "/api/profile", method: "GET", description: "Fetch user profile with active sessions.", authRequired: true },
      { path: "/api/profile", method: "PUT", description: "Update user profile details and contact info.", authRequired: true },
      // Alerts
      { path: "/api/alerts", method: "GET", description: "List disaster alerts with severity/status filtering." },
      { path: "/api/alerts", method: "POST", description: "Broadcast a new disaster alert.", authRequired: true },
      { path: "/api/alerts/broadcast", method: "POST", description: "Dispatch rapid emergency broadcast alert.", authRequired: true },
      { path: "/api/alerts/:id", method: "GET", description: "Fetch specific alert by ID." },
      { path: "/api/alerts/:id", method: "PUT", description: "Update or resolve specific alert.", authRequired: true },
      { path: "/api/alerts/:id", method: "DELETE", description: "Resolve and remove disaster alert.", authRequired: true },
      // Community Reports
      { path: "/api/community-reports", method: "GET", description: "List community reports with category/status filter." },
      { path: "/api/community-reports/stats", method: "GET", description: "Report metrics and zone leaderboard." },
      { path: "/api/community-reports", method: "POST", description: "Submit a new community environmental report.", authRequired: true },
      { path: "/api/community-reports/:id", method: "GET", description: "Fetch single community report details." },
      { path: "/api/community-reports/:id", method: "PUT", description: "Update report status or satellite match.", authRequired: true },
      { path: "/api/community-reports/:id", method: "DELETE", description: "Delete community report.", authRequired: true },
      { path: "/api/community-reports/:id/vote", method: "POST", description: "Upvote / support a community report." },
      // Satellite Telemetry
      { path: "/api/satellite/telemetry", method: "GET", description: "Orbital constellation fleet telemetry." },
      { path: "/api/satellite/eri", method: "GET", description: "Environmental Risk Index & multi-tier advisories." },
      { path: "/api/satellite/orbits", method: "GET", description: "Real-time orbital tracking coordinates." },
      { path: "/api/satellite/telemetry/log", method: "POST", description: "Record sensor telemetry log.", authRequired: true },
      { path: "/api/satellite/telemetry/history", method: "GET", description: "Historical telemetry readings log." },
      // Environment & Weather
      { path: "/api/environment", method: "GET", description: "Environmental metrics for coordinates (AQI, temp, wind, UV)." },
      { path: "/api/weather", method: "GET", description: "Satellite weather telemetry and 5-day forecast." },
      { path: "/api/air-quality", method: "GET", description: "TROPOMI atmospheric AQI and pollutant concentrations." },
      // Analytics
      { path: "/api/analytics/historical", method: "GET", description: "Time-series monthly environmental trends." },
      { path: "/api/analytics/ai-insight", method: "POST", description: "AI Environmental Assistant specialist analysis." },
      { path: "/api/analytics/export", method: "GET", description: "Export environmental telemetry dataset." },
      // Settings
      { path: "/api/settings", method: "GET", description: "Fetch system settings, API keys, and webhooks.", authRequired: true },
      { path: "/api/settings", method: "PUT", description: "Update system settings and security policies.", authRequired: true },
      { path: "/api/settings/api-keys", method: "POST", description: "Generate new API integration key.", authRequired: true },
      { path: "/api/settings/api-keys/:id", method: "DELETE", description: "Revoke API integration key.", authRequired: true },
      { path: "/api/settings/webhooks", method: "POST", description: "Register outbound webhook.", authRequired: true },
      { path: "/api/settings/webhooks/:id", method: "DELETE", description: "Delete webhook registration.", authRequired: true },
      { path: "/api/settings/webhooks/test", method: "POST", description: "Test webhook dispatch ping.", authRequired: true },
    ],
  });
});

// ----------------------------------------------------
// Mount Resource Routers
// ----------------------------------------------------
router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/alerts", alertsRoutes);
router.use("/community-reports", reportsRoutes);
router.use("/reports", reportsRoutes); // Backward compatibility alias
router.use("/satellite", satelliteRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/settings", settingsRoutes);

// Mount environment and weather endpoints.
router.use("/", environmentRoutes);

export default router;
