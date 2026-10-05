const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
const REQUEST_TIMEOUT_MS = 15000;
const apiCache = new Map();

const CACHE_TTL_MS = 15000; // 15s cache for instantaneous route switching

export function clearApiCache() {
  apiCache.clear();
}

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("ecowatch-token");
  const method = (options.method || "GET").toUpperCase();

  // Instant response from cache for rapid route navigation
  const cacheKey = `${method}:${path}`;
  if (method === "GET") {
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  } else {
    // Mutation: clear cache
    apiCache.clear();
  }

  let response;
  let requestTimedOut = false;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    requestTimedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  try {
    response = await fetch(`${BASE_URL}/api${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch (err) {
    clearTimeout(timeoutId);
    const message = requestTimedOut
      ? `Request timed out after ${REQUEST_TIMEOUT_MS / 1000} seconds.`
      : "Backend unavailable. Please check the connection.";
    console.warn(`[EcoWatch API] Endpoint /api${path} unavailable.`);
    if (method === "GET" || method === "HEAD") {
      return { offlineFallback: true, message };
    }
    throw new Error(message, { cause: err });
  }
  clearTimeout(timeoutId);

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const details = body.message || `HTTP ${response.status}${response.statusText ? ` ${response.statusText}` : ""}`;
    throw new Error(`${details} (${method} /api${path})`);
  }

  if (method === "GET") {
    apiCache.set(cacheKey, { timestamp: Date.now(), data: body });
  }

  return body;
}


// ----------------------------------------------------
// Authentication & User
// ----------------------------------------------------
export async function loginUser(email, password) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function registerUser(name, email, password, role) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password, role }),
  });
}

export async function fetchCurrentUser() {
  return apiRequest("/auth/me");
}

export async function changeUserPassword(currentPassword, newPassword) {
  return apiRequest("/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function fetchUserProfile() {
  return apiRequest("/profile");
}

export async function updateUserProfile(profileData) {
  return apiRequest("/profile", {
    method: "PUT",
    body: JSON.stringify(profileData),
  });
}

// ----------------------------------------------------
// Disaster Alerts
// ----------------------------------------------------
export async function fetchDisasterAlerts(filter = {}) {
  const query = new URLSearchParams(filter).toString();
  return apiRequest(`/alerts${query ? `?${query}` : ""}`);
}

export async function createDisasterAlert(alertData) {
  return apiRequest("/alerts", {
    method: "POST",
    body: JSON.stringify(alertData),
  });
}

export async function updateDisasterAlert(id, updates) {
  return apiRequest(`/alerts/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

export async function deleteDisasterAlert(id) {
  return apiRequest(`/alerts/${id}`, {
    method: "DELETE",
  });
}

export async function broadcastEmergencyAlert(alertData) {
  return apiRequest("/alerts/broadcast", {
    method: "POST",
    body: JSON.stringify(alertData),
  });
}

// ----------------------------------------------------
// Community Environmental Reports
// ----------------------------------------------------
export async function fetchCommunityReports(filter = {}) {
  const query = new URLSearchParams(filter).toString();
  return apiRequest(`/community-reports${query ? `?${query}` : ""}`);
}

export async function fetchCommunityStats() {
  return apiRequest("/community-reports/stats");
}

export async function createCommunityReport(reportData) {
  return apiRequest("/community-reports", {
    method: "POST",
    body: JSON.stringify(reportData),
  });
}

export async function updateCommunityReport(id, updates) {
  return apiRequest(`/community-reports/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

export async function deleteCommunityReport(id) {
  return apiRequest(`/community-reports/${id}`, {
    method: "DELETE",
  });
}

export async function voteCommunityReport(id) {
  return apiRequest(`/community-reports/${id}/vote`, {
    method: "POST",
  });
}

// ----------------------------------------------------
// Satellite & Telemetry
// ----------------------------------------------------
export async function fetchSatelliteTelemetry() {
  return apiRequest("/satellite/telemetry");
}

export async function fetchSatelliteTelemetryData() {
  return apiRequest("/satellite/telemetry");
}

export async function fetchSatelliteRisk(lat, lon) {
  const hasCoordinates = lat !== undefined && lat !== null && lon !== undefined && lon !== null
    && Number.isFinite(Number(lat)) && Number.isFinite(Number(lon));
  const query = hasCoordinates ? `?lat=${lat}&lon=${lon}` : "";
  return apiRequest(`/satellite/eri${query}`);
}

export async function fetchSatelliteOrbits() {
  return apiRequest("/satellite/orbits");
}

export async function logSensorTelemetry(telemetryData) {
  return apiRequest("/satellite/telemetry/log", {
    method: "POST",
    body: JSON.stringify(telemetryData),
  });
}

export async function fetchRemoteSensingScene(lat, lon) {
  const hasCoordinates = lat !== undefined && lat !== null && lon !== undefined && lon !== null
    && Number.isFinite(Number(lat)) && Number.isFinite(Number(lon));
  const query = hasCoordinates ? `?lat=${lat}&lon=${lon}` : "";
  return apiRequest(`/satellite/remote-sensing${query}`);
}

export async function acquireLiveScene(lat, lon, satelliteId) {
  return apiRequest("/satellite/fetch-scene", {
    method: "POST",
    body: JSON.stringify({ lat, lon, satelliteId }),
  });
}

export async function fetchLiveAnomalies(lat, lon, location) {
  const params = new URLSearchParams({ lat, lon });
  if (location) params.set("location", location);
  return apiRequest(`/satellite/anomalies?${params}`);
}

export async function fetchSpectralIndices(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiRequest(`/satellite/indices${query ? `?${query}` : ""}`);
}

export async function fetchDatabaseStatus() {
  return apiRequest("/database/status");
}


// ----------------------------------------------------
// Environment & Weather
// ----------------------------------------------------
export async function fetchEnvironmentMetrics(lat, lon) {
  const hasCoordinates = lat !== undefined && lat !== null && lon !== undefined && lon !== null
    && Number.isFinite(Number(lat)) && Number.isFinite(Number(lon));
  const query = hasCoordinates ? `?lat=${lat}&lon=${lon}` : "";
  return apiRequest(`/environment${query}`);
}

export async function fetchWeather(location, lat, lon) {
  const params = new URLSearchParams();
  if (location) params.set("location", location);
  if (lat !== undefined && lat !== null && lon !== undefined && lon !== null
    && Number.isFinite(Number(lat)) && Number.isFinite(Number(lon))) {
    params.set("lat", lat);
    params.set("lon", lon);
  }
  const query = params.size ? `?${params}` : "";
  return apiRequest(`/weather${query}`);
}

export async function fetchAirQuality(lat, lon) {
  const hasCoordinates = lat !== undefined && lat !== null && lon !== undefined && lon !== null
    && Number.isFinite(Number(lat)) && Number.isFinite(Number(lon));
  const query = hasCoordinates ? `?lat=${lat}&lon=${lon}` : "";
  return apiRequest(`/air-quality${query}`);
}

// ----------------------------------------------------
// Analytics & AI Reasoning
// ----------------------------------------------------
export async function fetchHistoricalAnalytics(timeframe, lat, lon, location) {
  const params = new URLSearchParams();
  if (timeframe) params.set("timeframe", timeframe);
  if (lat !== undefined && lat !== null && lon !== undefined && lon !== null) {
    params.set("lat", lat);
    params.set("lon", lon);
  }
  if (location) params.set("location", location);
  const query = params.toString() ? `?${params.toString()}` : "";
  return apiRequest(`/analytics/historical${query}`);
}

export async function askAiEnvironmentalInsight(prompt, context = {}) {
  return apiRequest("/analytics/ai-insight", {
    method: "POST",
    body: JSON.stringify({ prompt, ...context }),
  });
}

export async function exportAnalyticsData(format = "json", lat, lon, location) {
  const params = new URLSearchParams({ format });
  if (lat !== undefined && lat !== null && lon !== undefined && lon !== null) {
    params.set("lat", lat);
    params.set("lon", lon);
  }
  if (location) params.set("location", location);
  return apiRequest(`/analytics/export?${params}`);
}

// ----------------------------------------------------
// Settings & Integrations
// ----------------------------------------------------
export async function fetchSettings() {
  return apiRequest("/settings");
}

export async function updateSettings(settingsData) {
  return apiRequest("/settings", {
    method: "PUT",
    body: JSON.stringify(settingsData),
  });
}

export async function createApiKey(name) {
  return apiRequest("/settings/api-keys", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function deleteApiKey(id) {
  return apiRequest(`/settings/api-keys/${id}`, {
    method: "DELETE",
  });
}

export async function createWebhook(webhookData) {
  return apiRequest("/settings/webhooks", {
    method: "POST",
    body: JSON.stringify(webhookData),
  });
}

export async function deleteWebhook(id) {
  return apiRequest(`/settings/webhooks/${id}`, {
    method: "DELETE",
  });
}

export async function testWebhook(url) {
  return apiRequest("/settings/webhooks/test", {
    method: "POST",
    body: JSON.stringify({ url }),
  });
}