import { describe, it, expect, beforeAll, afterAll } from "vitest";
import http from "http";
import app from "../index.js";
import { memoryStore, saveStore } from "../db/store.js";

let server;
let baseUrl = "";

beforeAll(async () => {
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
});

describe("✨ MANDATORY FEATURES VERIFICATION SUITE", () => {
  let adminToken = "";
  let sreeToken = "";
  let analystToken = "";
  let responderToken = "";
  let scientistToken = "";
  let inspectorToken = "";

  // -----------------------------------------------------------------
  // 1. AT LEAST 5 USER LOGINS CREATED AND CHECKED WITH JWT ISSUANCE
  // -----------------------------------------------------------------
  describe("1. Verified Multi-Role User Logins (6 Verified Accounts)", () => {
    it("Authenticates System Admin (Dr. Marcus Vance)", async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "admin@ecowatch.global", password: "admin123" }),
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.token).toBeDefined();
      expect(data.user.role).toBe("System Admin");
      expect(data.user.name).toBe("Dr. Marcus Vance");
      adminToken = data.token;
    });

    it("Authenticates System Admin (Subhasree Pitchaiya - 24104031@nec.edu.in)", async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "24104031@nec.edu.in", password: "admin123" }),
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.token).toBeDefined();
      expect(data.user.role).toBe("System Admin");
      expect(data.user.name).toBe("Subhasree Pitchaiya");
      sreeToken = data.token;
    });

    it("Authenticates Senior Analyst (Elena Rostova)", async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "analyst@ecowatch.global", password: "analyst123" }),
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.token).toBeDefined();
      expect(data.user.role).toBe("Analyst");
      expect(data.user.name).toBe("Elena Rostova");
      analystToken = data.token;
    });

    it("Authenticates Emergency Incident Commander (Capt. Vikram Rathore)", async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "responder@ecowatch.global", password: "responder123" }),
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.token).toBeDefined();
      expect(data.user.role).toBe("Emergency Responder");
      expect(data.user.name).toBe("Capt. Vikram Rathore");
      responderToken = data.token;
    });

    it("Authenticates Chief Atmospheric Modeler (Dr. Ananya Sharma)", async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "scientist@ecowatch.global", password: "scientist123" }),
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.token).toBeDefined();
      expect(data.user.role).toBe("Scientist");
      expect(data.user.name).toBe("Dr. Ananya Sharma");
      scientistToken = data.token;
    });

    it("Authenticates Environmental Compliance Auditor (Carlos Mendez)", async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "inspector@ecowatch.global", password: "inspector123" }),
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.token).toBeDefined();
      expect(data.user.role).toBe("Inspector");
      expect(data.user.name).toBe("Carlos Mendez");
      inspectorToken = data.token;
    });

    it("GET /api/auth/demo-accounts exposes verified user profiles for UI quick switcher", async () => {
      const res = await fetch(`${baseUrl}/api/auth/demo-accounts`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data.accounts)).toBe(true);
      expect(data.accounts.length).toBeGreaterThanOrEqual(5);
    });
  });

  // -----------------------------------------------------------------
  // 2. OAUTH AUTHENTICATION (Google GIS + Fast OAuth Engine)
  // -----------------------------------------------------------------
  describe("2. OAuth Authentication Suite", () => {
    it("POST /api/auth/oauth-fast issues verified JWT token for Google GIS federated login", async () => {
      const res = await fetch(`${baseUrl}/api/auth/oauth-fast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: "Google GIS",
          email: "24104031@nec.edu.in",
          name: "Subhasree Pitchaiya",
          role: "System Admin",
        }),
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.token).toBeDefined();
      expect(data.user.email).toBe("24104031@nec.edu.in");
      expect(data.user.role).toBe("System Admin");
    });

    it("POST /api/auth/google verifies mock/test token without external failure", async () => {
      const res = await fetch(`${baseUrl}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: "test-google-token" }),
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.token).toBeDefined();
      expect(data.user.email).toBe("24104031@nec.edu.in");
    });
  });

  // -----------------------------------------------------------------
  // 3. JWT TOKEN VERIFICATION & SESSION RESOLUTION
  // -----------------------------------------------------------------
  describe("3. JWT Token Verification & RBAC Protection", () => {
    it("GET /api/auth/me resolves current authenticated user from JWT Bearer", async () => {
      const res = await fetch(`${baseUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${sreeToken}` },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.user.name).toBe("Subhasree Pitchaiya");
      expect(data.user.role).toBe("System Admin");
    });

    it("Rejects request with invalid or tampered JWT token", async () => {
      const res = await fetch(`${baseUrl}/api/auth/me`, {
        headers: { Authorization: "Bearer invalid.jwt.token" },
      });
      expect(res.status).toBe(401);
    });
  });

  // -----------------------------------------------------------------
  // 4. ADMIN SIDE LOGIN DASHBOARD (Full RBAC Governance)
  // -----------------------------------------------------------------
  describe("4. Mandatory Admin Command Center Endpoints", () => {
    it("GET /api/admin/overview succeeds for System Admin", async () => {
      const res = await fetch(`${baseUrl}/api/admin/overview`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.metrics).toBeDefined();
      expect(data.metrics.totalUsers).toBeGreaterThanOrEqual(6);
      expect(data.metrics.activeSatellites).toBe(4);
      expect(Array.isArray(data.satellites)).toBe(true);
      expect(Array.isArray(data.users)).toBe(true);
      expect(Array.isArray(data.auditLogs)).toBe(true);
    });

    it("GET /api/admin/overview returns 403 Forbidden for non-admin Analyst", async () => {
      const res = await fetch(`${baseUrl}/api/admin/overview`, {
        headers: { Authorization: `Bearer ${analystToken}` },
      });
      expect(res.status).toBe(403);
    });

    it("PATCH /api/admin/users/:id/role updates user permissions dynamically", async () => {
      // Find analyst user
      const usersRes = await fetch(`${baseUrl}/api/admin/users`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const { users } = await usersRes.json();
      const analyst = users.find((u) => u.email === "analyst@ecowatch.global");

      const updateRes = await fetch(`${baseUrl}/api/admin/users/${analyst.id}/role`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: "Scientist" }),
      });
      expect(updateRes.status).toBe(200);
      const updateData = await updateRes.json();
      expect(updateData.user.role).toBe("Scientist");

      // Restore role
      await fetch(`${baseUrl}/api/admin/users/${analyst.id}/role`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: "Analyst" }),
      });
    });

    it("POST /api/admin/alerts/broadcast broadcasts a high-priority regional emergency alert", async () => {
      const res = await fetch(`${baseUrl}/api/admin/alerts/broadcast`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "Flash Flood Surge",
          severity: "CRITICAL",
          region: "Marina Beach Coastal Corridor",
          description: "Sentinel-1 SAR detects rapid low-lying inundation exceeding 45cm.",
        }),
      });
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.alert.type).toBe("Flash Flood Surge");
      expect(data.alert.severity).toBe("CRITICAL");
    });

    it("GET /api/admin/audit-logs returns live security and operations audit stream", async () => {
      const res = await fetch(`${baseUrl}/api/admin/audit-logs`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data.auditLogs)).toBe(true);
      expect(data.auditLogs.length).toBeGreaterThan(0);
    });
  });

  // -----------------------------------------------------------------
  // 5. CHATBOT: INTELLIGENT EARTH-OBSERVATION AI SPECIALIST
  // -----------------------------------------------------------------
  describe("5. Intelligent Earth-Observation AI Assistant", () => {
    it("POST /api/analytics/ai-insight processes SAR radar flood query", async () => {
      const res = await fetch(`${baseUrl}/api/analytics/ai-insight`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "What is the localized flood saturation and drainage capacity?",
          aqi: 45,
          region: "Chennai Coast",
        }),
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.insight).toContain("Sentinel-1");
      expect(data.riskLevel).toBe("Moderate");
      expect(Array.isArray(data.recommendations)).toBe(true);
      expect(data.recommendations.length).toBeGreaterThan(0);
      expect(data.telemetrySnapshot.sensorArray).toContain("Sentinel-1 SAR");
    });

    it("POST /api/analytics/ai-insight explains mathematical ERI risk model", async () => {
      const res = await fetch(`${baseUrl}/api/analytics/ai-insight`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: "Explain the ERI risk index mathematical model and weights.",
          aqi: 50,
          region: "Coastal Zone",
        }),
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.insight).toContain("0.35");
      expect(data.insight).toContain("f(AQI)");
    });
  });

  // -----------------------------------------------------------------
  // 6. UNIQUE RESUME-DEFENSE FEATURE: ALGORITHMIC ERI ENGINE
  // -----------------------------------------------------------------
  describe("6. Defensible Non-CRUD Algorithmic ERI Engine", () => {
    it("GET /api/satellite/eri calculates multi-variable heuristic index", async () => {
      const res = await fetch(`${baseUrl}/api/satellite/eri?lat=13.0827&lon=80.2707`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.eriScore).toBeDefined();
      expect(data.eriScore).toBeGreaterThanOrEqual(0);
      expect(data.eriScore).toBeLessThanOrEqual(100);
      expect(data.metricsBreakdown).toBeDefined();
    });

    it("GET /api/satellite/telemetry returns authentic multi-constellation sensor stream", async () => {
      const res = await fetch(`${baseUrl}/api/satellite/telemetry`);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.satellites).toBeDefined();
      expect(data.satellites.length).toBe(4);
    });
  });
});
