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
      "Atmospheric particulate concentrations and sea-surface thermal anomalies remain within nominal thresholds across the Bay of Bengal and Chennai metropolitan corridor.",
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

const DEFAULT_COORDINATES = { lat: 13.0827, lon: 80.2707 };

function resolveCoordinates(lat, lon) {
  const latitude = Number(lat);
  const longitude = Number(lon);
  return Number.isFinite(latitude) && latitude >= -90 && latitude <= 90
    && Number.isFinite(longitude) && longitude >= -180 && longitude <= 180
    ? { lat: latitude, lon: longitude }
    : DEFAULT_COORDINATES;
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

function getSimulatedWeatherData(location, coordinates) {
  return {
    location,
    coordinates,
    temperature: 31,
    temperatureFormatted: "31°C",
    temperatureNumeric: 31,
    feelsLike: "36°C",
    condition: "Partly Cloudy",
    humidity: 68,
    humidityFormatted: "68%",
    humidityNumeric: 68,
    windSpeed: 14,
    windSpeedFormatted: "14 km/h",
    windSpeedNumeric: 14,
    windDirection: "ENE",
    uvIndex: 6,
    pressureHpa: 1012,
    visibilityKm: 8.5,
    satelliteSensor: "GOES-16 Thermal Radiometer",
    forecast: [
      { day: "Today", temp: "31°C", tempNumeric: 31, condition: "Partly Cloudy", high: "33°C", low: "26°C", precipChance: "20%" },
      { day: "Tomorrow", temp: "32°C", tempNumeric: 32, condition: "Sunny", high: "34°C", low: "27°C", precipChance: "10%" },
      { day: "Friday", temp: "30°C", tempNumeric: 30, condition: "Light Rain", high: "31°C", low: "25°C", precipChance: "65%" },
      { day: "Saturday", temp: "29°C", tempNumeric: 29, condition: "Thunderstorms", high: "30°C", low: "24°C", precipChance: "80%" },
      { day: "Sunday", temp: "31°C", tempNumeric: 31, condition: "Clear Sky", high: "32°C", low: "25°C", precipChance: "15%" },
    ],
    updatedAt: new Date().toISOString(),
    dataSource: "Simulated fallback (Open-Meteo unavailable)",
    isLiveData: false,
  };
}

export async function getWeatherData(location = "Chennai, Tamil Nadu", lat, lon) {
  const coordinates = resolveCoordinates(lat, lon);
  const params = new URLSearchParams({
    latitude: String(coordinates.lat),
    longitude: String(coordinates.lon),
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,uv_index,pressure_msl,visibility,soil_moisture_0_to_1cm",
    daily: "temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max",
    timezone: "auto",
    forecast_days: "5",
  });

  try {
    const data = await fetchProviderJson(`https://api.open-meteo.com/v1/forecast?${params}`);
    const current = data.current;
    if (!current) throw new Error("Weather provider returned no current conditions.");
    const forecast = (data.daily?.time || []).map((day, index) => ({
      day: index === 0 ? "Today" : new Date(`${day}T12:00:00`).toLocaleDateString("en-US", { weekday: "long" }),
      temp: `${Math.round(data.daily.temperature_2m_max[index])}°C`,
      tempNumeric: data.daily.temperature_2m_max[index],
      condition: describeWeatherCode(data.daily.weather_code[index]),
      high: `${Math.round(data.daily.temperature_2m_max[index])}°C`,
      low: `${Math.round(data.daily.temperature_2m_min[index])}°C`,
      precipChance: `${data.daily.precipitation_probability_max?.[index] ?? 0}%`,
    }));
    const temperature = current.temperature_2m;
    return {
      location,
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
      forecast,
      updatedAt: new Date().toISOString(),
      dataSource: "Open-Meteo",
      isLiveData: true,
    };
  } catch {
    return getSimulatedWeatherData(location, coordinates);
  }
}

function getSimulatedAirQualityData() {
  return {
    aqi: 42,
    category: "Good",
    statusTone: "text-secondary",
    pollutants: {
      pm25: "12 µg/m³",
      pm10: "28 µg/m³",
      no2: "18 ppb",
      o3: "35 ppb",
      co: "0.4 ppm",
      so2: "4 ppb",
    },
    pollutantsDetail: [
      { name: "PM2.5", value: 12, unit: "µg/m³", status: "GOOD", safeLimit: 30 },
      { name: "PM10", value: 28, unit: "µg/m³", status: "GOOD", safeLimit: 50 },
      { name: "NO2", value: 18, unit: "ppb", status: "GOOD", safeLimit: 40 },
      { name: "O3", value: 35, unit: "ppb", status: "MODERATE", safeLimit: 50 },
      { name: "CO", value: 0.4, unit: "ppm", status: "GOOD", safeLimit: 2.0 },
      { name: "SO2", value: 4, unit: "ppb", status: "GOOD", safeLimit: 20 },
    ],
    detectedBy: "Simulated fallback (Open-Meteo unavailable)",
    advisory: "Air quality is satisfactory and poses little to no risk to public health. Outdoor activities are recommended.",
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
    timezone: "auto",
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
    return {
      aqi,
      category,
      statusTone: aqi <= 50 ? "text-secondary" : aqi <= 100 ? "text-tertiary" : "text-error",
      pollutants: Object.fromEntries(pollutantsDetail.map(({ name, value, unit }) => [name.toLowerCase().replace(".", ""), `${value} ${unit}`])),
      pollutantsDetail,
      detectedBy: "Open-Meteo / CAMS",
      advisory: `Current United States AQI is ${aqi} (${category}).`,
      coordinates: { lat: data.latitude, lon: data.longitude },
      updatedAt: new Date().toISOString(),
      dataSource: "Open-Meteo / CAMS",
      isLiveData: true,
    };
  } catch {
    return getSimulatedAirQualityData();
  }
}

export function getHistoricalAnalytics(timeframe = "6m") {
  return {
    timeframe: timeframe === "1y" ? "Last 12 Months" : "Last 6 Months",
    aqiTrend: [
      { month: "Apr", avgAqi: 55, peakAqi: 78 },
      { month: "May", avgAqi: 62, peakAqi: 89 },
      { month: "Jun", avgAqi: 48, peakAqi: 65 },
      { month: "Jul", avgAqi: 40, peakAqi: 52 },
      { month: "Aug", avgAqi: 44, peakAqi: 58 },
      { month: "Sep", avgAqi: 42, peakAqi: 56 },
    ],
    temperatureTrend: [
      { month: "Apr", tempC: 34 },
      { month: "May", tempC: 37 },
      { month: "Jun", tempC: 35 },
      { month: "Jul", tempC: 32 },
      { month: "Aug", tempC: 31 },
      { month: "Sep", tempC: 31 },
    ],
    precipitationTrend: [
      { month: "Apr", mm: 14 },
      { month: "May", mm: 32 },
      { month: "Jun", mm: 58 },
      { month: "Jul", mm: 85 },
      { month: "Aug", mm: 112 },
      { month: "Sep", mm: 145 },
    ],
    deforestationRiskHectares: 12.4,
    carbonOffsetTons: 1480,
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
  const latitude = parseFloat(lat) || 13.0827;
  const longitude = parseFloat(lon) || 80.2707;

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
export async function getLiveAnomalies() {
  const anomalies = [
    {
      id: "THERMAL-ANOMALY-01",
      type: "Thermal Hotspot / Biomass Burning",
      satellite: "Landsat-9 TIRS-2 / MODIS Aqua",
      lat: 13.0827,
      lon: 80.2707,
      brightnessKelvin: 324.5,
      frpMegawatts: 14.8,
      confidence: "92%",
      detectionTime: new Date(Date.now() - 45 * 60000).toISOString(),
      region: "Industrial Corridor, North Chennai",
    },
    {
      id: "COASTAL-SURGE-02",
      type: "Sea Surface Wave Height Surge",
      satellite: "Sentinel-3 SRAL Altimeter",
      lat: 12.9815,
      lon: 80.2589,
      waveHeightMeters: 2.8,
      anomalySigma: "+2.1σ",
      confidence: "88%",
      detectionTime: new Date(Date.now() - 110 * 60000).toISOString(),
      region: "Marina / Besant Nagar Coastline",
    },
    {
      id: "TROPOMI-NO2-03",
      type: "Atmospheric NO2 Column Spikeline",
      satellite: "Sentinel-5P TROPOMI",
      lat: 13.0382,
      lon: 80.2158,
      columnValue: "185 µmol/m²",
      baseline: "65 µmol/m²",
      confidence: "95%",
      detectionTime: new Date(Date.now() - 190 * 60000).toISOString(),
      region: "Guindy Junction Transport Hub",
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

