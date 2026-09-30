import { afterEach, describe, expect, it, vi } from "vitest";
import { computeEnvironmentMetrics, getAirQualityData, getWeatherData } from "./satelliteService.js";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Open-Meteo environmental data", () => {
  it("maps live weather data and accepts zero coordinates", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        latitude: 0,
        longitude: 0,
        current: {
          temperature_2m: 21.8,
          relative_humidity_2m: 60,
          apparent_temperature: 22.1,
          weather_code: 0,
          wind_speed_10m: 12,
          wind_direction_10m: 90,
          uv_index: 3,
          pressure_msl: 1013,
          visibility: 12000,
        },
        daily: {
          time: ["2026-09-30"],
          temperature_2m_max: [24],
          temperature_2m_min: [17],
          weather_code: [1],
          precipitation_probability_max: [10],
        },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const weather = await getWeatherData("Zero Point", 0, 0);

    expect(new URL(fetchMock.mock.calls[0][0]).searchParams.get("latitude")).toBe("0");
    expect(weather.coordinates).toEqual({ lat: 0, lon: 0 });
    expect(weather.temperature).toBe(21.8);
    expect(weather.forecast[0].condition).toBe("Mainly Clear");
    expect(weather.dataSource).toBe("Open-Meteo");
    expect(weather.isLiveData).toBe(true);
  });

  it("maps current AQI and pollutant measurements", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        latitude: 13.1,
        longitude: 80.3,
        current: {
          us_aqi: 74,
          pm2_5: 18.2,
          pm10: 30.4,
          nitrogen_dioxide: 12,
          ozone: 45,
          carbon_monoxide: 400,
          sulphur_dioxide: 3,
        },
      }),
    }));

    const result = await getAirQualityData(13.1, 80.3);

    expect(result.aqi).toBe(74);
    expect(result.category).toBe("Moderate");
    expect(result.pollutantsDetail).toHaveLength(6);
    expect(result.dataSource).toBe("Open-Meteo / CAMS");
  });

  it("combines live weather and AQI for the shared environment endpoint", async () => {
    vi.stubGlobal("fetch", vi.fn((url) => Promise.resolve({
      ok: true,
      json: async () => url.includes("air-quality")
        ? { latitude: 0, longitude: 0, current: { us_aqi: 36 } }
        : {
            latitude: 0,
            longitude: 0,
            current: {
              temperature_2m: 19,
              relative_humidity_2m: 55,
              apparent_temperature: 19,
              weather_code: 1,
              wind_speed_10m: 8,
              wind_direction_10m: 0,
              uv_index: 2,
              pressure_msl: 1014,
              visibility: 15000,
            },
            daily: { time: [], temperature_2m_max: [], temperature_2m_min: [], weather_code: [] },
          },
    })));

    const metrics = await computeEnvironmentMetrics(0, 0);

    expect(metrics.latitude).toBe(0);
    expect(metrics.longitude).toBe(0);
    expect(metrics.aqi).toBe(36);
    expect(metrics.temperature).toBe(19);
    expect(metrics.dataSource).toBe("Open-Meteo / CAMS");
    expect(metrics.isLiveData).toBe(true);
  });

  it("marks offline provider responses as simulated fallback", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network unavailable")));

    const weather = await getWeatherData();
    const airQuality = await getAirQualityData();

    expect(weather.isLiveData).toBe(false);
    expect(weather.dataSource).toContain("Simulated fallback");
    expect(airQuality.isLiveData).toBe(false);
    expect(airQuality.dataSource).toContain("Simulated fallback");
  });
});
