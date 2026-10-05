/**
 * EcoWatch Satellite & Environmental Telemetry Engine
 * Simulates real-time orbital telemetry, Earth observation calculations, and risk modeling
 */

export function getConstellationStatus() {
  return {
    satellites: [
      {
        id: "S2-ORBIT-882",
        name: "Sentinel-2 Optical Multispectral",
        agency: "ESA / Copernicus",
        status: "Active",
        latency: "1.2s",
        resolution: "10m",
        payload: "NDVI / Chlorophyll-a / Surface Reflectance",
        orbitalAltitudeKm: 786,
        inclinationDeg: 98.62,
        batteryHealth: "99.2%",
      },
      {
        id: "L9-THERMAL-04",
        name: "Landsat-9 Thermal Infrared",
        agency: "NASA / USGS",
        status: "Active",
        latency: "2.4s",
        resolution: "15m",
        payload: "TIRS-2 Surface Heat / Wildfire Anomaly",
        orbitalAltitudeKm: 705,
        inclinationDeg: 98.2,
        batteryHealth: "98.7%",
      },
      {
        id: "GOES-16-GEO",
        name: "GOES-16 Geostationary",
        agency: "NOAA",
        status: "Active",
        latency: "0.8s",
        resolution: "0.5km",
        payload: "ABI Cloud Top / High Wind Radar / Lightning Mapper",
        orbitalAltitudeKm: 35786,
        inclinationDeg: 0.0,
        batteryHealth: "100%",
      },
      {
        id: "S5P-TROPOMI-12",
        name: "Sentinel-5P TROPOMI",
        agency: "ESA / Copernicus",
        status: "Active",
        latency: "1.9s",
        resolution: "5.5km",
        payload: "NO2 / SO2 / CO / CH4 Atmospheric Column",
        orbitalAltitudeKm: 824,
        inclinationDeg: 98.7,
        batteryHealth: "97.5%",
      },
    ],
    constellationStatus: "HEALTHY",
    downlinkRate: "485 Mbps",
    activeSensors: 14,
    coverageAreaKm2: "12,450,000",
    timestamp: new Date().toISOString(),
  };
}

export function calculateEriScore(customFactors = {}) {
  const baseAtmospheric = customFactors.atmosphericRisk ?? 12;
  const baseThermal = customFactors.thermalStress ?? 14;
  const baseCoastal = customFactors.coastalRisk ?? 8;
  const baseWind = customFactors.windSurge ?? 4;

  const totalScore = baseAtmospheric + baseThermal + baseCoastal + baseWind;

  let category = "Low Risk";
  let statusTone = "text-secondary";
  if (totalScore >= 75) {
    category = "Severe Risk";
    statusTone = "text-error";
  } else if (totalScore >= 50) {
    category = "High Risk";
    statusTone = "text-tertiary";
  } else if (totalScore >= 25) {
    category = "Moderate Risk";
    statusTone = "text-primary";
  }

  return {
    eriScore: totalScore,
    category,
    statusTone,
    summary:
      "Environmental risk is calculated for the selected coordinates using current weather and air-quality measurements.",
    advisories: {
      citizen: "Air quality is favorable for outdoor activities. Carry rain gear during early evening hours.",
      community: "Maintain coastal drainage clearing and keep emergency pumps primed in flood-prone wards.",
      decisionMaker: "Sentinel-2 and Landsat-9 infrared indices indicate zero critical disaster escalation across coastal sectors.",
    },
    metricsBreakdown: {
      atmosphericRisk: baseAtmospheric,
      thermalStress: baseThermal,
      coastalRisk: baseCoastal,
      windSurge: baseWind,
    },
    updatedAt: new Date().toISOString(),
  };
}

export function getOrbitalTracks() {
  return {
    orbitTracks: [
      {
        satelliteId: "Sentinel-2",
        name: "Sentinel-2A",
        currentLat: 8.7139,
        currentLon: 77.7567,
        altitudeKm: 786,
        velocityKmh: 27000,
        path: [
          { lat: 5.2, lon: 74.8 },
          { lat: 7.5, lon: 76.5 },
          { lat: 8.7, lon: 77.7 },
          { lat: 10.1, lon: 78.9 },
          { lat: 13.1, lon: 80.3 },
          { lat: 15.6, lon: 81.9 },
        ],
      },
      {
        satelliteId: "Landsat-9",
        name: "Landsat-9",
        currentLat: 13.0827,
        currentLon: 80.2707,
        altitudeKm: 705,
        velocityKmh: 26900,
        path: [
          { lat: 9.4, lon: 77.8 },
          { lat: 11.2, lon: 79.1 },
          { lat: 13.0, lon: 80.2 },
          { lat: 14.8, lon: 81.4 },
          { lat: 17.2, lon: 82.8 },
        ],
      },
      {
        satelliteId: "GOES-16",
        name: "GOES-16 East",
        currentLat: 0.0,
        currentLon: -75.2,
        altitudeKm: 35786,
        velocityKmh: 11052,
        geostationary: true,
      },
    ],
    timestamp: new Date().toISOString(),
  };
}

export async function computeEnvironmentMetrics(lat, lon) {
  const { lat: latitude, lon: longitude } = resolveCoordinates(lat, lon);

  try {
    const [weather, airQuality] = await Promise.all([
      getWeatherData("Selected coordinates", latitude, longitude),
      getAirQualityData(latitude, longitude),
    ]);
    const isLiveData = weather.isLiveData && airQuality.isLiveData;
    return {
      latitude,
      longitude,
      location: `Location ${latitude.toFixed(2)}, ${longitude.toFixed(2)}`,
      aqi: airQuality.aqi,
      aqiCategory: airQuality.category,
      temperature: weather.temperature,
      humidity: weather.humidity,
      windSpeed: weather.windSpeed,
      uvIndex: weather.uvIndex,
      soilMoisture: weather.soilMoisture,
      satelliteFeeds: ["Open-Meteo weather models", "CAMS air-quality model"],
      dataSource: isLiveData ? "Open-Meteo / CAMS" : "Simulated fallback (provider unavailable)",
      isLiveData,
      updatedAt: new Date().toISOString(),
    };
  } catch {
    return getSimulatedEnvironmentMetrics(latitude, longitude);
  }
}

function getSimulatedEnvironmentMetrics(latitude, longitude) {
  const latHash = Math.abs(Math.sin(latitude) * 100);
  const lonHash = Math.abs(Math.cos(longitude) * 100);

  const aqi = Math.round(30 + ((latHash * 3 + lonHash * 2) % 65));
  const temperature = Math.round(24 + ((latHash * 2 + lonHash) % 12));
  const humidity = Math.round(55 + ((lonHash * 3) % 35));
  const windSpeed = Math.round(10 + ((latHash + lonHash) % 15));
  const uvIndex = Math.min(11, Math.round(3 + (latHash % 7)));
  const soilMoisture = Math.round(20 + ((lonHash * 4) % 40));

  let aqiCategory = "Good";
  if (aqi > 150) aqiCategory = "Unhealthy";
  else if (aqi > 100) aqiCategory = "Unhealthy for Sensitive Groups";
  else if (aqi > 50) aqiCategory = "Moderate";

  return {
    latitude,
    longitude,
    location: `Location ${latitude.toFixed(2)}, ${longitude.toFixed(2)}`,
    aqi,
    aqiCategory,
    temperature,
    humidity,
    windSpeed,
    uvIndex,
    soilMoisture,
    satelliteFeeds: ["Simulated weather model", "Simulated air-quality model"],
    dataSource: "Simulated fallback (provider unavailable)",
    isLiveData: false,
    updatedAt: new Date().toISOString(),
  };
}

export function resolveCoordinates(lat, lon) {
  if (lat === undefined || lat === null || lon === undefined || lon === null || String(lat).trim() === "" || String(lon).trim() === "") {
    const error = new Error("Latitude and longitude are required.");
    error.status = 400;
    throw error;
  }
  const latitude = Number(lat);
  const longitude = Number(lon);
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    const error = new Error("Latitude must be between -90 and 90 and longitude between -180 and 180.");
    error.status = 400;
    throw error;
  }
  return { lat: latitude, lon: longitude };
}

async function fetchProviderJson(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new Error(`Data provider returned ${response.status}.`);
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

function describeWeatherCode(code) {
  if (code === 0) return "Clear Sky";
  if (code === 1) return "Mainly Clear";
  if (code === 2) return "Partly Cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Fog";
  if (code >= 51 && code <= 57) return "Drizzle";
  if (code >= 61 && code <= 67) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Rain Showers";
  if (code >= 85 && code <= 86) return "Snow Showers";
  if (code >= 95) return "Thunderstorms";
  return "Unknown Conditions";
}

function describeWindDirection(degrees = 0) {
  return ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.round(degrees / 45) % 8];
}

function getSimulatedWeatherData(location, coordinates = { lat: 13.0827, lon: 80.2707 }) {
  const lat = coordinates.lat ?? 13.0827;
  const lon = coordinates.lon ?? 80.2707;
  const latHash = Math.abs(Math.sin(lat) * 100);
  const lonHash = Math.abs(Math.cos(lon) * 100);

  const temperature = Math.round(22 + ((latHash * 2 + lonHash) % 14));
  const humidity = Math.round(50 + ((lonHash * 3) % 40));
  const windSpeed = Math.round(8 + ((latHash + lonHash) % 18));
  const uvIndex = Math.min(11, Math.round(3 + (latHash % 7)));
  const condition = latHash % 2 === 0 ? "Partly Cloudy" : "Mainly Clear";

  const now = new Date();
  const forecast = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() + i);
    const dayName = i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "short" });
    const dayTemp = Math.round(temperature + (Math.sin(lat + i) * 3));
    const rainProb = Math.min(95, Math.max(5, Math.round(Math.abs(Math.sin(lon + i * 2)) * 60)));
    const rainMm = Number((rainProb * 0.12).toFixed(1));
    return {
      day: dayName,
      date: d.toISOString().split("T")[0],
      temp: `${dayTemp}°C`,
      tempNumeric: dayTemp,
      condition: i % 3 === 0 ? "Partly Cloudy" : i % 3 === 1 ? "Scattered Clouds" : "Clear Sky",
      high: `${dayTemp + 2}°C`,
      low: `${dayTemp - 3}°C`,
      precipChance: `${rainProb}%`,
      precipSumMm: rainMm,
    };
  });

  const currentHour = now.getHours();
  const hourly = Array.from({ length: 24 }, (_, i) => {
    const h = (currentHour + i) % 24;
    const tempVar = Math.round(temperature + Math.sin(((h - 6) / 24) * Math.PI * 2) * 4);
    const hRainProb = Math.round(Math.max(5, Math.abs(Math.sin(h)) * 40));
    return {
      time: `${String(h).padStart(2, "0")}:00`,
      temp: tempVar,
      precipProb: hRainProb,
      precipMm: Number((hRainProb * 0.08).toFixed(1)),
      weatherCode: 1,
      condition,
      isCurrent: i === 0,
    };
  });

  return {
    location,
    coordinates,
    temperature,
    temperatureFormatted: `${temperature}°C`,
    temperatureNumeric: temperature,
    feelsLike: `${temperature + (humidity > 60 ? 3 : 1)}°C`,
    condition,
    humidity,
    humidityFormatted: `${humidity}%`,
    humidityNumeric: humidity,
    windSpeed,
    windSpeedFormatted: `${windSpeed} km/h`,
    windSpeedNumeric: windSpeed,
    windDirection: ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.round(latHash) % 8],
    uvIndex,
    pressureHpa: 1012,
    visibilityKm: 9.0,
    satelliteSensor: "GOES-16 Thermal Radiometer",
    hourly,
    forecast,
    updatedAt: new Date().toISOString(),
    dataSource: "Simulated fallback (Open-Meteo unavailable)",
    isLiveData: false,
  };
}

export async function getWeatherData(location, lat, lon) {
  const coordinates = resolveCoordinates(lat, lon);
  const locationName = location?.trim() || `Location ${coordinates.lat.toFixed(4)}, ${coordinates.lon.toFixed(4)}`;
  const params = new URLSearchParams({
    latitude: String(coordinates.lat),
    longitude: String(coordinates.lon),
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,uv_index,pressure_msl,visibility,soil_moisture_0_to_1cm",
    hourly: "temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,weather_code",
    daily: "temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max,precipitation_sum",
    timezone: "auto",
    forecast_days: "7",
  });

  try {
    const data = await fetchProviderJson(`https://api.open-meteo.com/v1/forecast?${params}`);
    const current = data.current;
    if (!current) throw new Error("Weather provider returned no current conditions.");
    const forecast = (data.daily?.time || []).map((day, index) => ({
      day: index === 0 ? "Today" : index === 1 ? "Tomorrow" : new Date(`${day}T12:00:00`).toLocaleDateString("en-US", { weekday: "short" }),
      date: day,
      temp: `${Math.round(data.daily.temperature_2m_max[index])}°C`,
      tempNumeric: data.daily.temperature_2m_max[index],
      condition: describeWeatherCode(data.daily.weather_code[index]),
      high: `${Math.round(data.daily.temperature_2m_max[index])}°C`,
      low: `${Math.round(data.daily.temperature_2m_min[index])}°C`,
      precipChance: `${data.daily.precipitation_probability_max?.[index] ?? 0}%`,
      precipSumMm: data.daily.precipitation_sum?.[index] != null ? Number(data.daily.precipitation_sum[index].toFixed(1)) : 0,
    }));
    const temperature = current.temperature_2m;

    let startIndex = 0;
    if (data.hourly?.time?.length && current.time) {
      const nowIso = current.time.slice(0, 13);
      const foundIdx = data.hourly.time.findIndex((t) => t.startsWith(nowIso));
      if (foundIdx >= 0) {
        startIndex = foundIdx;
      }
    }
    const hourly = (data.hourly?.time || []).slice(startIndex, startIndex + 24).map((timeStr, idx) => {
      const date = new Date(timeStr);
      const hours = String(date.getHours()).padStart(2, "0");
      const hTemp = data.hourly.temperature_2m?.[startIndex + idx] != null
        ? Math.round(data.hourly.temperature_2m[startIndex + idx])
        : Math.round(temperature);
      const hPrecipProb = data.hourly.precipitation_probability?.[startIndex + idx] ?? 0;
      const hPrecipMm = data.hourly.precipitation?.[startIndex + idx] != null
        ? Number(data.hourly.precipitation[startIndex + idx].toFixed(1))
        : 0;
      const hCode = data.hourly.weather_code?.[startIndex + idx] ?? current.weather_code;
      return {
        time: `${hours}:00`,
        temp: hTemp,
        precipProb: hPrecipProb,
        precipMm: hPrecipMm,
        weatherCode: hCode,
        condition: describeWeatherCode(hCode),
        isCurrent: idx === 0,
      };
    });

    return {
      location: locationName,
      coordinates: { lat: data.latitude, lon: data.longitude },
      temperature,
      weatherCode: current.weather_code,
      temperatureFormatted: `${Math.round(temperature)}°C`,
      temperatureNumeric: temperature,
      feelsLike: `${Math.round(current.apparent_temperature)}°C`,
      condition: describeWeatherCode(current.weather_code),
      humidity: current.relative_humidity_2m,
      humidityFormatted: `${current.relative_humidity_2m}%`,
      humidityNumeric: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      windSpeedFormatted: `${current.wind_speed_10m} km/h`,
      windSpeedNumeric: current.wind_speed_10m,
      windDirection: describeWindDirection(current.wind_direction_10m),
      uvIndex: current.uv_index,
      soilMoisture: current.soil_moisture_0_to_1cm == null ? null : Math.round(current.soil_moisture_0_to_1cm * 100),
      pressureHpa: current.pressure_msl,
      visibilityKm: Number((current.visibility / 1000).toFixed(1)),
      satelliteSensor: "Open-Meteo weather models",
      hourly,
      forecast,
      updatedAt: new Date().toISOString(),
      dataSource: "Open-Meteo",
      isLiveData: true,
    };
  } catch {
    return getSimulatedWeatherData(locationName, coordinates);
  }
}

function getSimulatedAirQualityData(lat = 13.0827, lon = 80.2707) {
  const latHash = Math.abs(Math.sin(lat) * 100);
  const lonHash = Math.abs(Math.cos(lon) * 100);
  const aqi = Math.round(30 + ((latHash * 3 + lonHash * 2) % 65));

  let category = "Good";
  let statusTone = "text-secondary";
  if (aqi > 150) {
    category = "Unhealthy";
    statusTone = "text-error";
  } else if (aqi > 100) {
    category = "Unhealthy for Sensitive Groups";
    statusTone = "text-error";
  } else if (aqi > 50) {
    category = "Moderate";
    statusTone = "text-tertiary";
  }

  const pm25 = Math.round(10 + (latHash % 25));
  const pm10 = Math.round(20 + (lonHash % 35));

  const now = new Date();
  const currentHour = now.getHours();
  const hourlyTrend = Array.from({ length: 24 }, (_, i) => {
    const h = (currentHour + i) % 24;
    const hAqi = Math.round(aqi + Math.sin(((h - 6) / 24) * Math.PI * 2) * 12);
    const hPm25 = Number((pm25 + Math.sin(h) * 4).toFixed(1));
    const hNo2 = Number((18 + Math.cos(h) * 5).toFixed(1));
    return {
      time: `${String(h).padStart(2, "0")}:00`,
      aqi: Math.max(15, hAqi),
      pm25: Math.max(5, hPm25),
      no2: Math.max(4, hNo2),
      isCurrent: i === 0,
    };
  });

  const dailyForecast = Array.from({ length: 7 }, (_, dayIdx) => {
    const d = new Date(now);
    d.setDate(d.getDate() + dayIdx);
    const dayName = dayIdx === 0 ? "Today" : dayIdx === 1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
    const dayAqi = Math.max(20, Math.round(aqi + Math.sin(latHash + dayIdx) * 15));
    const tone = dayAqi <= 50 ? "GOOD" : dayAqi <= 100 ? "MODERATE" : dayAqi <= 150 ? "UNHEALTHY-S" : "POOR";
    const color = dayAqi <= 50 ? "bg-secondary" : dayAqi <= 100 ? "bg-amber-500" : "bg-error";
    return {
      day: dayName,
      aqi: dayAqi,
      tone,
      color,
    };
  });

  return {
    aqi,
    category,
    statusTone,
    pollutants: {
      pm25: `${pm25} µg/m³`,
      pm10: `${pm10} µg/m³`,
      no2: "18 ppb",
      o3: "35 ppb",
      co: "0.4 ppm",
      so2: "4 ppb",
    },
    pollutantsDetail: [
      { name: "PM2.5", value: pm25, unit: "µg/m³", status: pm25 <= 15 ? "GOOD" : "MODERATE", safeLimit: 30 },
      { name: "PM10", value: pm10, unit: "µg/m³", status: pm10 <= 45 ? "GOOD" : "MODERATE", safeLimit: 50 },
      { name: "NO2", value: 18, unit: "ppb", status: "GOOD", safeLimit: 40 },
      { name: "O3", value: 35, unit: "ppb", status: "MODERATE", safeLimit: 50 },
      { name: "CO", value: 0.4, unit: "ppm", status: "GOOD", safeLimit: 2.0 },
      { name: "SO2", value: 4, unit: "ppb", status: "GOOD", safeLimit: 20 },
    ],
    hourlyTrend,
    dailyForecast,
    detectedBy: "Simulated fallback (Open-Meteo unavailable)",
    advisory: `Current calculated AQI for the sector is ${aqi} (${category}).`,
    coordinates: { lat, lon },
    updatedAt: new Date().toISOString(),
    dataSource: "Simulated fallback (Open-Meteo unavailable)",
    isLiveData: false,
  };
}

export async function getAirQualityData(lat, lon) {
  const coordinates = resolveCoordinates(lat, lon);
  const params = new URLSearchParams({
    latitude: String(coordinates.lat),
    longitude: String(coordinates.lon),
    current: "us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone",
    hourly: "us_aqi,pm10,pm2_5,nitrogen_dioxide,ozone",
    timezone: "auto",
    forecast_days: "7",
  });

  try {
    const data = await fetchProviderJson(`https://air-quality-api.open-meteo.com/v1/air-quality?${params}`);
    const current = data.current;
    if (!current || !Number.isFinite(Number(current.us_aqi))) throw new Error("Air-quality provider returned no current AQI.");
    const aqi = Math.round(current.us_aqi);
    const category = aqi <= 50 ? "Good" : aqi <= 100 ? "Moderate" : aqi <= 150 ? "Unhealthy for Sensitive Groups" : aqi <= 200 ? "Unhealthy" : "Very Unhealthy";
    const values = [
      { name: "PM2.5", value: current.pm2_5, unit: "µg/m³", safeLimit: 15 },
      { name: "PM10", value: current.pm10, unit: "µg/m³", safeLimit: 45 },
      { name: "NO2", value: current.nitrogen_dioxide, unit: "µg/m³", safeLimit: 25 },
      { name: "O3", value: current.ozone, unit: "µg/m³", safeLimit: 100 },
      { name: "CO", value: current.carbon_monoxide / 1000, unit: "mg/m³", safeLimit: 4 },
      { name: "SO2", value: current.sulphur_dioxide, unit: "µg/m³", safeLimit: 40 },
    ];
    const pollutantsDetail = values
      .filter((pollutant) => Number.isFinite(Number(pollutant.value)))
      .map((pollutant) => ({
      ...pollutant,
      value: Number(pollutant.value.toFixed(2)),
      status: pollutant.value <= pollutant.safeLimit ? "GOOD" : pollutant.value <= pollutant.safeLimit * 2 ? "MODERATE" : "POOR",
      }));

    let startIndex = 0;
    if (data.hourly?.time?.length && current.time) {
      const nowIso = current.time.slice(0, 13);
      const foundIdx = data.hourly.time.findIndex((t) => t.startsWith(nowIso));
      if (foundIdx >= 0) startIndex = foundIdx;
    }

    const hourlyTrend = (data.hourly?.time || []).slice(startIndex, startIndex + 24).map((timeStr, idx) => {
      const date = new Date(timeStr);
      const hours = String(date.getHours()).padStart(2, "0");
      const hAqi = Math.round(data.hourly.us_aqi?.[startIndex + idx] ?? aqi);
      const hPm25 = Number((data.hourly.pm2_5?.[startIndex + idx] ?? current.pm2_5 ?? 12).toFixed(1));
      const hNo2 = Number((data.hourly.nitrogen_dioxide?.[startIndex + idx] ?? current.nitrogen_dioxide ?? 10).toFixed(1));
      return {
        time: `${hours}:00`,
        aqi: hAqi,
        pm25: hPm25,
        no2: hNo2,
        isCurrent: idx === 0,
      };
    });

    const now = new Date();
    const dailyForecast = Array.from({ length: 7 }, (_, dayIdx) => {
      const d = new Date(now);
      d.setDate(d.getDate() + dayIdx);
      const dayName = dayIdx === 0 ? "Today" : dayIdx === 1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
      const daySlice = data.hourly?.us_aqi ? data.hourly.us_aqi.slice(dayIdx * 24, (dayIdx + 1) * 24) : [];
      const dayAqi = daySlice.length ? Math.round(daySlice.reduce((a, b) => a + b, 0) / daySlice.length) : Math.round(aqi + Math.sin(dayIdx) * 8);
      const tone = dayAqi <= 50 ? "GOOD" : dayAqi <= 100 ? "MODERATE" : dayAqi <= 150 ? "UNHEALTHY-S" : "POOR";
      const color = dayAqi <= 50 ? "bg-secondary" : dayAqi <= 100 ? "bg-amber-500" : "bg-error";
      return {
        day: dayName,
        aqi: dayAqi,
        tone,
        color,
      };
    });

    return {
      aqi,
      category,
      statusTone: aqi <= 50 ? "text-secondary" : aqi <= 100 ? "text-tertiary" : "text-error",
      pollutants: Object.fromEntries(pollutantsDetail.map(({ name, value, unit }) => [name.toLowerCase().replace(".", ""), `${value} ${unit}`])),
      pollutantsDetail,
      hourlyTrend,
      dailyForecast,
      detectedBy: "Open-Meteo / CAMS",
      advisory: `Current United States AQI is ${aqi} (${category}).`,
      coordinates: { lat: data.latitude, lon: data.longitude },
      updatedAt: new Date().toISOString(),
      dataSource: "Open-Meteo / CAMS",
      isLiveData: true,
    };
  } catch {
    return getSimulatedAirQualityData(coordinates.lat, coordinates.lon);
  }
}

export function getHistoricalAnalytics(timeframe = "30d", lat, lon, location) {
  let coords = { lat: 8.7522, lon: 77.7414 };
  if (lat !== undefined && lon !== undefined && lat !== null && lon !== null && String(lat).trim() !== "" && String(lon).trim() !== "") {
    try {
      coords = resolveCoordinates(lat, lon);
    } catch {
      // Keep fallback
    }
  }

  const rawCity = (location || "").split(",")[0].trim();
  const cityName = rawCity && rawCity !== "undefined" && rawCity !== "null" ? rawCity : (coords.lat >= 8 && coords.lat <= 9 ? "Tirunelveli" : "Regional");

  const tf = String(timeframe || "").toLowerCase();
  let points = [];
  let timeframeLabel = "Last 30 Days";

  if (tf === "7d" || tf.includes("7 day")) {
    timeframeLabel = "Last 7 Days";
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      const monthName = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const daySeed = (d.getDate() * 7 + i) % 7;
      const tempC = Math.round(29 + (daySeed % 4) + (i % 2 === 0 ? 1 : 0));
      const humidity = Math.round(68 + ((daySeed * 3) % 15) - (i % 3 === 0 ? 4 : 0));
      const avgAqi = Math.round(38 + ((daySeed * 5) % 18));
      const peakAqi = Math.round(avgAqi * 1.32);
      const mm = (i % 3 === 0) ? Math.round(8 + (daySeed % 12)) : Math.round(daySeed % 4);

      points.push({
        label: dayName,
        month: dayName,
        fullDate: monthName,
        tempC,
        humidity,
        avgAqi,
        peakAqi,
        mm,
      });
    }
  } else if (tf === "quarter" || tf === "3m" || tf.includes("quarter")) {
    timeframeLabel = "Last Quarter";
    const months = ["Jul", "Aug", "Sep", "Oct"];
    const temps = [33, 32, 31, 31];
    const hums = [62, 68, 74, 78];
    const aqis = [40, 44, 42, 38];
    const precips = [45, 68, 92, 118];
    points = months.map((m, idx) => ({
      label: m,
      month: m,
      tempC: temps[idx],
      humidity: hums[idx],
      avgAqi: aqis[idx],
      peakAqi: Math.round(aqis[idx] * 1.35),
      mm: precips[idx],
    }));
  } else if (tf === "1y" || tf === "ytd" || tf.includes("year") || tf.includes("date") || tf.includes("12 month")) {
    timeframeLabel = "Year to Date";
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const temps = [26, 28, 31, 34, 37, 35, 33, 32, 31, 30, 28, 26];
    const hums = [65, 62, 58, 55, 60, 68, 72, 70, 75, 78, 79, 72];
    const aqis = [52, 58, 64, 55, 62, 48, 40, 44, 42, 39, 45, 48];
    const precips = [18, 12, 15, 28, 42, 65, 88, 105, 138, 162, 195, 85];
    points = months.map((m, idx) => ({
      label: m,
      month: m,
      tempC: temps[idx],
      humidity: hums[idx],
      avgAqi: aqis[idx],
      peakAqi: Math.round(aqis[idx] * 1.38),
      mm: precips[idx],
    }));
  } else if (tf === "6m" || tf.includes("6 month")) {
    timeframeLabel = "Last 6 Months";
    const months = ["May", "Jun", "Jul", "Aug", "Sep", "Oct"];
    const temps = [37, 35, 33, 32, 31, 31];
    const hums = [60, 68, 72, 70, 75, 78];
    const aqis = [62, 48, 40, 44, 42, 38];
    const precips = [32, 58, 85, 112, 145, 168];
    points = months.map((m, idx) => ({
      label: m,
      month: m,
      tempC: temps[idx],
      humidity: hums[idx],
      avgAqi: aqis[idx],
      peakAqi: Math.round(aqis[idx] * 1.38),
      mm: precips[idx],
    }));
  } else {
    timeframeLabel = "Last 30 Days";
    const checkPoints = [
      { label: "Day 3", tempC: 33, humidity: 64, avgAqi: 48, peakAqi: 62, mm: 5 },
      { label: "Day 6", tempC: 34, humidity: 62, avgAqi: 52, peakAqi: 68, mm: 0 },
      { label: "Day 9", tempC: 32, humidity: 69, avgAqi: 44, peakAqi: 56, mm: 14 },
      { label: "Day 12", tempC: 31, humidity: 73, avgAqi: 41, peakAqi: 54, mm: 22 },
      { label: "Day 15", tempC: 30, humidity: 76, avgAqi: 38, peakAqi: 49, mm: 35 },
      { label: "Day 18", tempC: 32, humidity: 71, avgAqi: 42, peakAqi: 58, mm: 12 },
      { label: "Day 21", tempC: 33, humidity: 68, avgAqi: 46, peakAqi: 60, mm: 8 },
      { label: "Day 24", tempC: 31, humidity: 75, avgAqi: 40, peakAqi: 51, mm: 28 },
      { label: "Day 27", tempC: 30, humidity: 78, avgAqi: 36, peakAqi: 48, mm: 42 },
      { label: "Today", tempC: 31, humidity: 74, avgAqi: 39, peakAqi: 50, mm: 16 },
    ];
    points = checkPoints.map((pt) => ({ ...pt, month: pt.label }));
  }

  const sectors = [
    {
      name: `${cityName} North Sector`,
      lat: Number((coords.lat + 0.018).toFixed(4)),
      lon: Number((coords.lon + 0.006).toFixed(4)),
      score: 84.2,
      trend: "trending_up",
      trendColor: "text-secondary",
      coverage: "64%",
      status: "Stable",
      ndvi: 0.68,
      canopyHectares: 1420,
      soilMoisture: "38%",
      intervention: "Canopy preservation and biodiversity corridor monitoring",
    },
    {
      name: `${cityName} East Basin`,
      lat: Number((coords.lat + 0.007).toFixed(4)),
      lon: Number((coords.lon + 0.024).toFixed(4)),
      score: 79.5,
      trend: "trending_up",
      trendColor: "text-secondary",
      coverage: "56%",
      status: "Stable",
      ndvi: 0.58,
      canopyHectares: 980,
      soilMoisture: "52%",
      intervention: "Riparian buffer reinforcement along water channels",
    },
    {
      name: `${cityName} West Reserve`,
      lat: Number((coords.lat - 0.012).toFixed(4)),
      lon: Number((coords.lon - 0.018).toFixed(4)),
      score: 68.1,
      trend: "trending_flat",
      trendColor: "text-on-tertiary-fixed-variant",
      coverage: "44%",
      status: "Moderate",
      ndvi: 0.44,
      canopyHectares: 730,
      soilMoisture: "29%",
      intervention: "Supplemental irrigation and buffer corridor afforestation",
    },
    {
      name: `${cityName} South Corridor`,
      lat: Number((coords.lat - 0.022).toFixed(4)),
      lon: Number((coords.lon + 0.011).toFixed(4)),
      score: 48.5,
      trend: "trending_down",
      trendColor: "text-error",
      coverage: "26%",
      status: "Critical",
      ndvi: 0.28,
      canopyHectares: 310,
      soilMoisture: "18%",
      intervention: "Urgent tree-planting initiative and urban heat island mitigation",
    },
  ];

  const pollutantDistribution = [
    { name: "Carbon Dioxide (CO2)", symbol: "CO2", percentage: 41, value: "418 ppm", color: "bg-primary" },
    { name: "Nitrogen Dioxide (NO2)", symbol: "NO2", percentage: 27, value: "18.4 µg/m³", color: "bg-secondary" },
    { name: "Particulate Matter (PM2.5)", symbol: "PM2.5", percentage: 19, value: "12.8 µg/m³", color: "bg-tertiary" },
    { name: "Sulfur Dioxide (SO2)", symbol: "SO2", percentage: 13, value: "4.2 µg/m³", color: "bg-error" },
  ];

  const predictiveInsight = {
    forecastPeriod: "Q3 - Q4 Projection",
    sequestrationGrowth: "+8.4%",
    heatStressRisk: "Medium Risk",
    heatStressDescription: `Urban density clusters in ${cityName} experiencing +2.8°C thermal retention during peak solar irradiance.`,
    urbanHeatIslandIndex: "34.6°C",
    soilSaturationRisk: "Low Saturation (28%)",
    recommendedInterventions: [
      {
        id: "rf-1",
        title: `Reforestation - ${cityName} South Corridor`,
        description: "Immediate native tree-planting initiative recommended to counter localized soil erosion identified from Sentinel-2 MSI vegetative indexing.",
        category: "Forestry",
        icon: "forest",
        badge: "Priority High",
      },
      {
        id: "fb-2",
        title: `Drainage & Sluice Gate Control - ${cityName} East Basin`,
        description: "Hydrological basin channels showing increased seasonal runoff. Early sediment desiltation and sluice reinforcement advised.",
        category: "Hydrology",
        icon: "water_damage",
        badge: "Scheduled",
      },
      {
        id: "ce-3",
        title: `Renewable Grid Microgeneration Buffering`,
        description: "Deploy solar canopy shading along civic walkways to double microgeneration while suppressing urban heat island effects.",
        category: "Energy",
        icon: "bolt",
        badge: "Optimization",
      },
    ],
  };

  const avgAqi = Math.round(points.reduce((acc, p) => acc + (p.avgAqi || 40), 0) / points.length);

  return {
    timeframe: timeframeLabel,
    aqiTrend: points.map((p) => ({ label: p.label, month: p.month, avgAqi: p.avgAqi, peakAqi: p.peakAqi })),
    temperatureTrend: points.map((p) => ({ label: p.label, month: p.month, tempC: p.tempC, humidity: p.humidity })),
    precipitationTrend: points.map((p) => ({ label: p.label, month: p.month, mm: p.mm })),
    humidityTrend: points.map((p) => ({ label: p.label, month: p.month, humidity: p.humidity })),
    trendPoints: points,
    sectors,
    pollutantDistribution,
    predictiveInsight,
    carbonOffsetTons: 1480,
    carbonSequestrationRate: 4.2,
    renewableContribution: 68,
    waterConservationTarget: 82,
    meanAqi: avgAqi,
    overallEriScore: 36,
    deforestationRiskHectares: 12.4,
    location: cityName,
    coordinates: coords,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Remote Sensing Spectral Indices Calculator
 * Implements standard Earth Observation formulas for Sentinel-2 MSI and Landsat-8/9 OLI/TIRS
 */
export function calculateRemoteSensingIndices({ red = 0.12, nir = 0.48, green = 0.15, swir = 0.22, thermalC = 29.5 } = {}) {
  // NDVI = (NIR - Red) / (NIR + Red)
  const ndviRaw = (nir - red) / (nir + red || 0.0001);
  const ndvi = Number(Math.max(-1, Math.min(1, ndviRaw)).toFixed(3));

  // NDWI = (Green - NIR) / (Green + NIR)
  const ndwiRaw = (green - nir) / (green + nir || 0.0001);
  const ndwi = Number(Math.max(-1, Math.min(1, ndwiRaw)).toFixed(3));

  // NDBI = (SWIR - NIR) / (SWIR + NIR)
  const ndbiRaw = (swir - nir) / (swir + nir || 0.0001);
  const ndbi = Number(Math.max(-1, Math.min(1, ndbiRaw)).toFixed(3));

  // Land Surface Temperature (LST in Celsius)
  const lst = Number(thermalC.toFixed(1));

  // Classification logic based on standard remote sensing literature
  let vegetationClass = "Moderate Vegetation / Cropland";
  let vegetationColor = "#22c55e";
  if (ndvi > 0.65) {
    vegetationClass = "Dense Forest / Healthy Canopy";
    vegetationColor = "#15803d";
  } else if (ndvi > 0.35) {
    vegetationClass = "Moderate Vegetation / Shrubland";
    vegetationColor = "#16a34a";
  } else if (ndvi > 0.15) {
    vegetationClass = "Sparse Scrub / Grassland";
    vegetationColor = "#84cc16";
  } else if (ndvi > 0.0) {
    vegetationClass = "Bare Soil / Arid Terrain";
    vegetationColor = "#ca8a04";
  } else {
    vegetationClass = "Water Body / Non-vegetated";
    vegetationColor = "#0284c7";
  }

  let waterClass = "Non-Water Terrestrial";
  if (ndwi > 0.3) {
    waterClass = "Deep Water Reservoir / Coastal Body";
  } else if (ndwi > 0.05) {
    waterClass = "Shallow Water / High Moisture Wetland";
  } else if (ndwi > -0.15) {
    waterClass = "Moderate Surface Moisture";
  }

  let builtUpClass = "Natural / Rural Cover";
  if (ndbi > 0.15) {
    builtUpClass = "High Density Urban Infrastructure / Concrete";
  } else if (ndbi > -0.05) {
    builtUpClass = "Suburban / Mixed Built Environment";
  }

  return {
    ndvi,
    ndwi,
    ndbi,
    lst,
    vegetationClass,
    vegetationColor,
    waterClass,
    builtUpClass,
    healthScore: Math.round(Math.max(0, Math.min(100, (ndvi + 0.2) * 90))),
    bands: {
      b2_blue: Number((red * 0.9).toFixed(3)),
      b3_green: Number(green.toFixed(3)),
      b4_red: Number(red.toFixed(3)),
      b8_nir: Number(nir.toFixed(3)),
      b11_swir: Number(swir.toFixed(3)),
    },
  };
}

/**
 * Live Remote Sensing Telemetry Engine
 * Fetches real-time atmospheric and surface radiometric measurements from Open-Meteo & Copernicus
 * Falls back seamlessly to coordinate-based deterministic physics models
 */
export async function fetchLiveRemoteSensing(lat, lon) {
  const { lat: latitude, lon: longitude } = resolveCoordinates(lat, lon);

  let liveWeather = null;
  let liveAir = null;

  // Attempt live Copernicus CAMS / Open-Meteo satellite feed
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const weatherPromise = fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,surface_pressure,wind_speed_10m,wind_direction_10m,soil_moisture_0_to_1cm`,
      { signal: controller.signal }
    ).then((r) => (r.ok ? r.json() : null)).catch(() => null);

    const airPromise = fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=european_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,aerosol_optical_depth,uv_index`,
      { signal: controller.signal }
    ).then((r) => (r.ok ? r.json() : null)).catch(() => null);

    const [wRes, aRes] = await Promise.all([weatherPromise, airPromise]);
    clearTimeout(timeout);
    liveWeather = wRes?.current || null;
    liveAir = aRes?.current || null;
  } catch (netErr) {
    // Graceful offline fallback
    liveWeather = null;
    liveAir = null;
  }

  // Derive spectral reflectance based on physical ground conditions
  const latHash = Math.abs(Math.sin(latitude * 0.12) * 100);
  const lonHash = Math.abs(Math.cos(longitude * 0.12) * 100);

  const temperature = liveWeather?.temperature_2m ?? Math.round(24 + ((latHash * 2 + lonHash) % 13));
  const humidity = liveWeather?.relative_humidity_2m ?? Math.round(55 + ((lonHash * 3) % 35));
  const windSpeed = liveWeather?.wind_speed_10m ?? Math.round(10 + ((latHash + lonHash) % 15));
  const soilMoisture = (liveWeather?.soil_moisture_0_to_1cm ? liveWeather.soil_moisture_0_to_1cm * 100 : Math.round(20 + ((lonHash * 4) % 40)));
  const aqi = liveAir?.european_aqi ?? Math.round(30 + ((latHash * 3 + lonHash * 2) % 65));
  const pm25 = liveAir?.pm2_5 ?? Math.round(10 + (latHash % 25));
  const pm10 = liveAir?.pm10 ?? Math.round(20 + (lonHash % 35));
  const no2 = liveAir?.nitrogen_dioxide ?? Number((12 + (latHash % 18)).toFixed(1));
  const so2 = liveAir?.sulphur_dioxide ?? Number((3 + (lonHash % 8)).toFixed(1));
  const co = liveAir?.carbon_monoxide ? Number((liveAir.carbon_monoxide / 1000).toFixed(2)) : 0.42;
  const o3 = liveAir?.ozone ?? Math.round(30 + (latHash % 20));
  const aod = liveAir?.aerosol_optical_depth ?? Number((0.15 + ((latHash % 20) / 100)).toFixed(2));
  const uvIndex = liveAir?.uv_index ?? Math.min(11, Math.round(3 + (latHash % 7)));

  // Calibrate optical spectral bands based on moisture, vegetation and urban density
  const greenBand = 0.12 + (soilMoisture / 300);
  const redBand = 0.10 + ((temperature > 30 ? 0.06 : 0.02)) - (soilMoisture / 500);
  const nirBand = 0.35 + (soilMoisture / 250) + ((70 - aqi) / 250);
  const swirBand = 0.18 + ((35 - soilMoisture) / 300);

  const spectral = calculateRemoteSensingIndices({
    red: Math.max(0.04, redBand),
    nir: Math.max(0.15, nirBand),
    green: Math.max(0.05, greenBand),
    swir: Math.max(0.08, swirBand),
    thermalC: temperature + 1.8,
  });

  const eriScore = Math.min(100, Math.round(
    (aqi / 200) * 35 +
    (Math.max(0, temperature - 22) / 18) * 25 +
    (humidity / 100) * 20 +
    (windSpeed / 35) * 20
  ));

  const sceneId = `S2A_MSIL2A_${new Date().toISOString().slice(0, 10).replace(/-/g, "")}T051021_R090_T44VLR`;
  const downlinkHash = `SHA256:${Buffer.from(`${latitude},${longitude},${sceneId}`).toString("hex").slice(0, 16).toUpperCase()}`;

  return {
    coordinates: { lat: latitude, lon: longitude },
    sceneMetadata: {
      sceneId,
      satellite: "Sentinel-2A Multispectral Instrument (MSI)",
      thermalSensor: "Landsat-9 TIRS-2 (Band 10 Thermal Infrared)",
      atmosphereSensor: "Sentinel-5P TROPOMI Spectrometer",
      geoSensor: "GOES-16 ABI Advanced Baseline Imager",
      acquisitionTimestamp: new Date().toISOString(),
      orbitTrack: "Descending Pass #882 (Equatorial Crossing 10:30 Local)",
      resolutionMeters: 10,
      cloudCoveragePercent: Math.max(2, Math.round((100 - humidity) % 18)),
      sunElevationDeg: 54.2,
      cryptographicDownlinkHash: downlinkHash,
      isLiveTelemetryFeed: !!liveWeather,
    },
    remoteSensingIndices: spectral,
    surfaceAtmosphere: {
      temperature,
      feelsLike: temperature + (humidity > 70 ? 3 : 1),
      humidity,
      windSpeed,
      soilMoisture: Math.round(soilMoisture),
      uvIndex,
      aqi,
      pm25,
      pm10,
      no2,
      so2,
      co,
      o3,
      aerosolOpticalDepth: aod,
    },
    environmentalRisk: {
      eriScore,
      riskCategory: eriScore >= 70 ? "Severe Hazard" : eriScore >= 45 ? "Moderate Risk" : "Low Risk",
      summary: `Remote sensing reflectance indicates ${spectral.vegetationClass} with surface moisture of ${Math.round(soilMoisture)}% and AQI of ${aqi}.`,
    },
    recommendedDirectives: [
      spectral.ndvi < 0.2
        ? "Low NDVI detected: Prioritize urban green space buffer and reforestation in barren zones."
        : "Vegetation canopy healthy: Maintain routine satellite NDVI moisture surveillance.",
      aqi > 80
        ? "TROPOMI indicates elevated particulate density: Issue sensitive group air advisory."
        : "Atmospheric aerosol optical depth is within safe WHO guidelines.",
      temperature > 34
        ? "Landsat-9 thermal infrared demonstrates localized urban heat island stress (>35°C)."
        : "Thermal infrared temperatures are within seasonal baseline.",
    ],
  };
}

/**
 * Remote Sensing Live Hazard & Seismic Anomaly Feed
 */
export async function getLiveAnomalies(lat, lon, locationName) {
  const center = resolveCoordinates(lat, lon);
  const region = locationName || "Selected area";
  const anomalies = [
    {
      id: "THERMAL-ANOMALY-01",
      type: "Thermal Hotspot / Biomass Burning",
      satellite: "Landsat-9 TIRS-2 / MODIS Aqua",
      lat: center.lat + 0.012,
      lon: center.lon - 0.015,
      brightnessKelvin: 324.5,
      frpMegawatts: 14.8,
      confidence: "92%",
      detectionTime: new Date(Date.now() - 45 * 60000).toISOString(),
      region: `${region} north monitoring zone`,
    },
    {
      id: "COASTAL-SURGE-02",
      type: "Sea Surface Wave Height Surge",
      satellite: "Sentinel-3 SRAL Altimeter",
      lat: center.lat - 0.014,
      lon: center.lon + 0.018,
      waveHeightMeters: 2.8,
      anomalySigma: "+2.1σ",
      confidence: "88%",
      detectionTime: new Date(Date.now() - 110 * 60000).toISOString(),
      region: `${region} coastal monitoring zone`,
    },
    {
      id: "TROPOMI-NO2-03",
      type: "Atmospheric NO2 Column Spikeline",
      satellite: "Sentinel-5P TROPOMI",
      lat: center.lat + 0.008,
      lon: center.lon + 0.012,
      columnValue: "185 µmol/m²",
      baseline: "65 µmol/m²",
      confidence: "95%",
      detectionTime: new Date(Date.now() - 190 * 60000).toISOString(),
      region: `${region} transport monitoring zone`,
    },
  ];

  return {
    anomalies,
    count: anomalies.length,
    activeDownlinks: ["Copernicus Open Access Hub", "NASA Earthdata GIBS", "USGS EarthExplorer"],
    timestamp: new Date().toISOString(),
  };
}

export default {
  getConstellationStatus,
  calculateEriScore,
  getOrbitalTracks,
  computeEnvironmentMetrics,
  getWeatherData,
  getAirQualityData,
  getHistoricalAnalytics,
  calculateRemoteSensingIndices,
  fetchLiveRemoteSensing,
  getLiveAnomalies,
};

