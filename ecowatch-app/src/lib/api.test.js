import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiRequest } from "./api";

beforeEach(() => {
  vi.stubGlobal("localStorage", { getItem: vi.fn(() => null) });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("apiRequest connection failures", () => {
  it("returns an offline fallback for failed reads", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Network unavailable")));
    vi.spyOn(console, "warn").mockImplementation(() => {});

    await expect(apiRequest("/environment")).resolves.toMatchObject({ offlineFallback: true });
  });

  it("rejects failed writes instead of reporting success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Network unavailable")));
    vi.spyOn(console, "warn").mockImplementation(() => {});

    await expect(apiRequest("/community-reports", { method: "POST" }))
      .rejects.toThrow("Backend unavailable");
  });

  it("includes the HTTP status and endpoint when an error response has no JSON message", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      statusText: "Bad Gateway",
      json: vi.fn().mockRejectedValue(new SyntaxError("Invalid JSON")),
    }));

    await expect(apiRequest("/auth/login", { method: "POST" }))
      .rejects.toThrow("HTTP 502 Bad Gateway (POST /api/auth/login)");
  });

  it("ends a hanging read with an offline fallback after the request timeout", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", vi.fn((url, { signal }) => new Promise((resolve, reject) => {
      signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
    })));
    vi.spyOn(console, "warn").mockImplementation(() => {});

    const request = apiRequest("/weather");
    await vi.advanceTimersByTimeAsync(15000);

    await expect(request).resolves.toMatchObject({
      offlineFallback: true,
      message: "Request timed out after 15 seconds.",
    });
  });
});