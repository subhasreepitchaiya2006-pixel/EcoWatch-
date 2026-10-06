import { describe, it, expect, beforeAll, afterAll } from "vitest";
import http from "http";
import app from "../index.js";
import { memoryStore, saveStore } from "../db/store.js";

const originalStore = JSON.parse(JSON.stringify(memoryStore));

let server;
let baseUrl = "";
let authToken = "";
let adminToken = "";
let testAlertId = null;
let testReportId = null;

beforeAll(async () => {
  // Start server on an ephemeral free port (port 0) for zero-conflict fast testing
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      baseUrl = `http://127.0.0.1:${address.port}`;
      resolve();
    });
  });
});

afterAll(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  Object.keys(memoryStore).forEach((key) => delete memoryStore[key]);
  Object.assign(memoryStore, originalStore);
  saveStore(memoryStore);
});

describe("EcoWatch Backend API Comprehensive Test Suite", () => {
  // ----------------------------------------------------
  // 1. Health & Docs
  // ----------------------------------------------------
  describe("System Health & Documentation", () => {
    it("GET /api/health returns healthy service status", async () => {
      const res = await fetch(`${baseUrl}/api/health`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe("ok");
      expect(data.service).toContain("EcoWatch");
      expect(Array.isArray(data.constellation)).toBe(true);
    });

    it("GET /api/docs returns directory of all REST endpoints", async () => {
      const res = await fetch(`${baseUrl}/api/docs`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data.endpoints)).toBe(true);
      expect(data.endpoints.length).toBeGreaterThan(25);
    });
  });

  // ----------------------------------------------------
  // 2. Authentication Flow
  // ----------------------------------------------------
  describe("Authentication Endpoints", () => {
    const testEmail = `analyst_${Date.now()}@ecowatch.global`;
    const testPassword = "securePassword123!";

    it("POST /api/auth/register creates a new user account", async () => {
      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Test Environmental Officer",
          email: testEmail,
          password: testPassword,
          role: "System Admin",
        }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.token).toBeDefined();
      expect(data.user.email).toBe(testEmail);
      expect(data.user.role).toBe("Analyst");
      authToken = data.token;
    });

    it("POST /api/auth/register rejects duplicate email", async () => {
      const res = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Duplicate Officer",
          email: testEmail,
          password: testPassword,
        }),
      });

      expect(res.status).toBe(409);
    });

    it("POST /api/auth/login authenticates with valid credentials", async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.token).toBeDefined();
      expect(data.user.name).toBe("Test Environmental Officer");
    });

    it("POST /api/auth/login rejects invalid password", async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: testEmail,
          password: "wrongPassword!",
        }),
      });

      expect(res.status).toBe(401);
    });

    it("creates and authenticates five distinct user accounts", async () => {
      const suffix = Date.now();
      for (let index = 1; index <= 5; index += 1) {
        const email = `acceptance_${suffix}_${index}@example.test`;
        const password = `DistinctPass${index}!`;
        const registration = await fetch(`${baseUrl}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: `Acceptance User ${index}`, email, password }),
        });
        expect(registration.status).toBe(201);

        const login = await fetch(`${baseUrl}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        expect(login.status).toBe(200);
        const result = await login.json();
        expect(result.user.email).toBe(email);
        expect(result.token).toBeTruthy();
      }
    });

    it("POST /api/auth/google rejects browser-supplied identity claims", async () => {
      const res = await fetch(`${baseUrl}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "google.user@ecowatch.global",
          fullName: "Google Satellite Officer",
          googleId: "google-10928374",
        }),
      });

      expect(res.status).toBe(400);
    });

    it("does not expose a Microsoft login endpoint", async () => {
      const res = await fetch(`${baseUrl}/api/auth/microsoft`, { method: "POST" });
      expect(res.status).toBe(404);
    });

    it("GET /api/auth/me rejects missing and fabricated tokens", async () => {
      const missingToken = await fetch(`${baseUrl}/api/auth/me`);
      expect(missingToken.status).toBe(401);

      const fabricatedToken = await fetch(`${baseUrl}/api/auth/me`, {
        headers: { Authorization: "Bearer mock-token-admin" },
      });
      expect(fabricatedToken.status).toBe(401);
    });

    it("GET /api/auth/me returns current authenticated session", async () => {
      const res = await fetch(`${baseUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.user.email).toBe(testEmail);
    });

    it("allows only provisioned administrators into the admin dashboard", async () => {
      const analystResponse = await fetch(`${baseUrl}/api/admin/overview`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      expect(analystResponse.status).toBe(403);

      const email = `admin_${Date.now()}@example.test`;
      const password = "ProvisionedAdmin123!";
      const registration = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Provisioned Administrator", email, password, role: "System Admin" }),
      });
      expect(registration.status).toBe(201);
      expect((await registration.json()).user.role).toBe("Analyst");

      const storedAdmin = memoryStore.users.find((entry) => entry.email === email);
      storedAdmin.role = "System Admin";
      saveStore(memoryStore);
      const adminLogin = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      expect(adminLogin.status).toBe(200);
      adminToken = (await adminLogin.json()).token;

      const dashboard = await fetch(`${baseUrl}/api/admin/overview`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(dashboard.status).toBe(200);
      const overview = await dashboard.json();
      expect(overview.metrics.administrators).toBeGreaterThan(0);
      expect(overview.users.every((account) => !Object.hasOwn(account, "password_hash"))).toBe(true);
    });

    it("POST /api/auth/logout returns success", async () => {
      const res = await fetch(`${baseUrl}/api/auth/logout`, { method: "POST" });
      expect(res.status).toBe(200);
    });
  });

  // ----------------------------------------------------
  // 3. User Profile
  // ----------------------------------------------------
  describe("Profile Endpoints", () => {
    it("GET /api/profile returns profile information", async () => {
      const res = await fetch(`${baseUrl}/api/profile`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.user).toBeDefined();
      expect(data.user.activeSessions).toBeGreaterThanOrEqual(1);
    });

    it("PUT /api/profile updates user job title and location", async () => {
      const res = await fetch(`${baseUrl}/api/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          jobTitle: "Senior Climate Forecaster",
          location: "Marina Sector 4, Chennai",
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.user.jobTitle).toBe("Senior Climate Forecaster");
    });
  });

  // ----------------------------------------------------
  // 4. Disaster Alerts Full CRUD
  // ----------------------------------------------------
  describe("Disaster Alerts CRUD", () => {
    it("GET /api/alerts returns active alerts array", async () => {
      const res = await fetch(`${baseUrl}/api/alerts`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data.alerts)).toBe(true);
      expect(data.total).toBeGreaterThanOrEqual(0);
    });

    it("POST /api/alerts creates a new alert", async () => {
      const res = await fetch(`${baseUrl}/api/alerts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          type: "Flash Flood Warning",
          severity: "HIGH",
          region: "Adyar River Basin",
          description: "Water levels rising above gauge mark 4.2m.",
        }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.alert.id).toBeDefined();
      expect(data.alert.region).toBe("Adyar River Basin");
      testAlertId = data.alert.id;
    });

    it("GET /api/alerts/:id retrieves specific alert", async () => {
      const res = await fetch(`${baseUrl}/api/alerts/${testAlertId}`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.alert.id).toBe(testAlertId);
      expect(data.alert.type).toBe("Flash Flood Warning");
    });

    it("PUT /api/alerts/:id updates alert status to Resolved", async () => {
      const res = await fetch(`${baseUrl}/api/alerts/${testAlertId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          status: "Resolved",
          description: "All water levels returned to nominal bounds.",
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.alert.status).toBe("Resolved");
    });

    it("POST /api/alerts/broadcast triggers rapid emergency broadcast", async () => {
      const res = await fetch(`${baseUrl}/api/alerts/broadcast`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          type: "Severe Tsunami Warning",
          severity: "CRITICAL",
          region: "Coastal Tamil Nadu",
          description: "Immediate coastal evacuation advisory.",
        }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.broadcastChannels).toBeDefined();
    });

    it("DELETE /api/alerts/:id removes an alert", async () => {
      const res = await fetch(`${baseUrl}/api/alerts/${testAlertId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(res.status).toBe(200);
    });
  });

  // ----------------------------------------------------
  // 5. Community Reports CRUD & Stats
  // ----------------------------------------------------
  describe("Community Environmental Reports", () => {
    it("GET /api/community-reports returns reports list", async () => {
      const res = await fetch(`${baseUrl}/api/community-reports`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data.reports)).toBe(true);
    });

    it("GET /api/community-reports/stats returns leaderboard and stats", async () => {
      const res = await fetch(`${baseUrl}/api/community-reports/stats`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data.stats)).toBe(true);
      expect(Array.isArray(data.leaderboard)).toBe(true);
    });

    it("POST /api/community-reports creates a report", async () => {
      const res = await fetch(`${baseUrl}/api/community-reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          title: "Plastic Debris in Cooum River",
          location: "Napier Bridge",
          category: "Waste",
          description: "Large buildup of non-biodegradable waste blocking culvert.",
          lat: 13.0674,
          lon: 80.2825,
        }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.report.id).toBeDefined();
      testReportId = data.report.id;
    });

    it("rejects community reports without coordinates", async () => {
      const res = await fetch(`${baseUrl}/api/community-reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ title: "Unlocated report", location: "Unknown area", description: "Missing coordinates" }),
      });
      expect(res.status).toBe(400);
    });

    it("POST /api/community-reports/:id/vote increments upvotes", async () => {
      const res = await fetch(`${baseUrl}/api/community-reports/${testReportId}/vote`, {
        method: "POST",
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.votes).toBeGreaterThanOrEqual(1);
    });

    it("PUT /api/community-reports/:id updates status to Verified", async () => {
      const res = await fetch(`${baseUrl}/api/community-reports/${testReportId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          status: "Verified",
          satelliteMatch: "Sentinel-2 MultiSpectral Plastic Index Positive",
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.report.status).toBe("Verified");
    });

    it("DELETE /api/community-reports/:id deletes report", async () => {
      const res = await fetch(`${baseUrl}/api/community-reports/${testReportId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });

      expect(res.status).toBe(200);
    });
  });

  // ----------------------------------------------------
  // 6. Satellite & Environmental Telemetry
  // ----------------------------------------------------
  describe("Satellite Telemetry & Planetary Metrics", () => {
    it("GET /api/satellite/telemetry returns orbital fleet status", async () => {
      const res = await fetch(`${baseUrl}/api/satellite/telemetry`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.satellites.length).toBe(4);
      expect(data.constellationStatus).toBe("HEALTHY");
    });

    it("GET /api/satellite/eri returns Environmental Risk Index", async () => {
      const res = await fetch(`${baseUrl}/api/satellite/eri?lat=41.2&lon=-71.8`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.eriScore).toBeGreaterThanOrEqual(0);
      expect(data.advisories).toBeDefined();
    });

    it("returns location-relative anomalies for the requested point", async () => {
      const res = await fetch(`${baseUrl}/api/satellite/anomalies?lat=0&lon=0&location=Null%20Island`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.anomalies[0].lat).toBeCloseTo(0.012);
      expect(data.anomalies[0].lon).toBeCloseTo(-0.015);
      expect(data.anomalies[0].region).toContain("Null Island");
    });

    it("rejects location-dependent satellite requests without coordinates", async () => {
      const [risk, remoteSensing, anomalies, environment] = await Promise.all([
        fetch(`${baseUrl}/api/satellite/eri`),
        fetch(`${baseUrl}/api/satellite/remote-sensing`),
        fetch(`${baseUrl}/api/satellite/anomalies`),
        fetch(`${baseUrl}/api/environment`),
      ]);
      expect(risk.status).toBe(400);
      expect(remoteSensing.status).toBe(400);
      expect(anomalies.status).toBe(400);
      expect(environment.status).toBe(400);
    });

    it("GET /api/satellite/orbits returns real-time orbit tracks", async () => {
      const res = await fetch(`${baseUrl}/api/satellite/orbits`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data.orbitTracks)).toBe(true);
    });

    it("POST /api/satellite/telemetry/log logs sensor reading", async () => {
      const res = await fetch(`${baseUrl}/api/satellite/telemetry/log`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          satelliteId: "Sentinel-2",
          sensorName: "MSI-Orbit-Test",
          latitude: 41.2,
          longitude: -71.8,
          aqi: 38,
          temperature: 29.5,
          humidity: 62,
          windSpeed: 11.4,
        }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.log.satelliteId).toBe("Sentinel-2");
    });

    it("GET /api/environment computes metrics for coordinates", async () => {
      const res = await fetch(`${baseUrl}/api/environment?lat=41.2&lon=-71.8`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.aqi).toBeDefined();
      expect(data.temperature).toBeDefined();
      expect(data.humidity).toBeDefined();
    });

    it("GET /api/weather returns weather forecast", async () => {
      const res = await fetch(`${baseUrl}/api/weather?lat=41.2&lon=-71.8&location=Test%20Location`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.temperature).toBeDefined();
      expect(Array.isArray(data.forecast)).toBe(true);
      expect(data.coordinates).toEqual({ lat: 41.2, lon: -71.8 });
    });

    it("GET /api/air-quality returns TROPOMI atmospheric pollutant levels", async () => {
      const res = await fetch(`${baseUrl}/api/air-quality?lat=41.2&lon=-71.8`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.aqi).toBeDefined();
      expect(data.pollutants).toBeDefined();
      expect(data.pollutants.pm25).toBeDefined();
    });

    it("rejects weather and air-quality requests without coordinates", async () => {
      const [weather, airQuality] = await Promise.all([
        fetch(`${baseUrl}/api/weather`),
        fetch(`${baseUrl}/api/air-quality`),
      ]);
      expect(weather.status).toBe(400);
      expect(airQuality.status).toBe(400);
    });

  });

  // ----------------------------------------------------
  // 7. Analytics & AI Insight
  // ----------------------------------------------------
  describe("Analytics & AI Environmental Reasoning", () => {
    it("GET /api/analytics/historical returns trend series", async () => {
      const res = await fetch(`${baseUrl}/api/analytics/historical`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data.aqiTrend)).toBe(true);
      expect(Array.isArray(data.temperatureTrend)).toBe(true);
    });

    it("POST /api/analytics/ai-insight generates expert recommendations", async () => {
      const res = await fetch(`${baseUrl}/api/analytics/ai-insight`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "Recommend flood response protocol for Velachery basin",
          aqi: 45,
          region: "Velachery Basin",
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.insight).toBeDefined();
      expect(Array.isArray(data.recommendations)).toBe(true);
      expect(data.recommendations.length).toBeGreaterThan(0);
    });

    it("GET /api/analytics/export returns comprehensive dataset", async () => {
      const res = await fetch(`${baseUrl}/api/analytics/export?lat=41.2&lon=-71.8&location=Test%20Location`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.executiveSummary).toBeDefined();
      expect(data.datasets).toBeDefined();
      expect(data.coordinates).toEqual({ lat: 41.2, lon: -71.8 });
    });

    it("requires coordinates for analytics exports", async () => {
      const res = await fetch(`${baseUrl}/api/analytics/export`);
      expect(res.status).toBe(400);
    });
  });

  // ----------------------------------------------------
  // 8. Settings, API Keys & Webhooks
  // ----------------------------------------------------
  describe("Settings & Integration Endpoints", () => {
    let testKeyId = null;
    let testWebhookId = null;

    it("denies system settings to analysts", async () => {
      const res = await fetch(`${baseUrl}/api/settings`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      expect(res.status).toBe(403);
    });

    it("GET /api/settings returns configuration", async () => {
      const res = await fetch(`${baseUrl}/api/settings`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.settings.organization).toBeDefined();
    });

    it("PUT /api/settings updates retention and security", async () => {
      const res = await fetch(`${baseUrl}/api/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          retentionPeriod: "5 Years",
          autoArchive: true,
        }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.settings.retentionPeriod).toBe("5 Years");
    });

    it("POST /api/settings/api-keys creates an API key", async () => {
      const res = await fetch(`${baseUrl}/api/settings/api-keys`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ name: "CI Automation Key" }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.apiKey.id).toBeDefined();
      testKeyId = data.apiKey.id;
    });

    it("DELETE /api/settings/api-keys/:id revokes the key", async () => {
      const res = await fetch(`${baseUrl}/api/settings/api-keys/${testKeyId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      expect(res.status).toBe(200);
    });

    it("POST /api/settings/webhooks registers a webhook", async () => {
      const res = await fetch(`${baseUrl}/api/settings/webhooks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: "Civil Defense Alert Dispatch",
          url: "https://civildefense.gov.in/hooks/alert",
          events: ["alert.critical"],
        }),
      });

      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.webhook.id).toBeDefined();
      testWebhookId = data.webhook.id;
    });

    it("POST /api/settings/webhooks/test sends a test ping", async () => {
      const res = await fetch(`${baseUrl}/api/settings/webhooks/test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ url: "https://civildefense.gov.in/hooks/alert" }),
      });

      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe("Delivered");
    });

    it("DELETE /api/settings/webhooks/:id removes the webhook", async () => {
      const res = await fetch(`${baseUrl}/api/settings/webhooks/${testWebhookId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      expect(res.status).toBe(200);
    });
  });

  // ----------------------------------------------------
  // 9. Error Handling
  // ----------------------------------------------------
  describe("Error Handling", () => {
    it("returns 404 with structured JSON for unknown routes", async () => {
      const res = await fetch(`${baseUrl}/api/unknown-non-existent-endpoint`);
      expect(res.status).toBe(404);
      const data = await res.json();
      expect(data.success).toBe(false);
      expect(data.message).toContain("not found");
    });

    it("does not expose the removed water-monitoring endpoint", async () => {
      const res = await fetch(`${baseUrl}/api/water-monitoring`);
      expect(res.status).toBe(404);
    });
  });
});
