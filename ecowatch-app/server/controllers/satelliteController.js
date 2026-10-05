import satelliteService from "../services/satelliteService.js";
import { resolveCoordinates } from "../services/satelliteService.js";
import { TelemetryRepo } from "../db/repository.js";

export function getTelemetry(req, res) {
  const telemetry = satelliteService.getConstellationStatus();
  res.json(telemetry);
}

export async function getEri(req, res, next) {
  const { atmospheric, thermal, coastal, wind, lat, lon } = req.query;
  const factors = {};
  if (atmospheric) factors.atmosphericRisk = parseFloat(atmospheric);
  if (thermal) factors.thermalStress = parseFloat(thermal);
  if (coastal) factors.coastalRisk = parseFloat(coastal);
  if (wind) factors.windSurge = parseFloat(wind);

  try {
    const environment = await satelliteService.computeEnvironmentMetrics(lat, lon);
    factors.atmosphericRisk ??= Math.min(35, Math.round(environment.aqi / 5));
    factors.thermalStress ??= Math.min(25, Math.max(0, environment.temperature - 15));
    factors.coastalRisk ??= environment.soilMoisture == null || !Number.isFinite(Number(environment.soilMoisture))
      ? 8
      : Math.min(20, Math.round(Number(environment.soilMoisture) / 2));
    factors.windSurge ??= Math.min(20, environment.windSpeed);
  } catch (error) {
    return next(error);
  }

  const eriData = satelliteService.calculateEriScore(factors);
  res.json(eriData);
}

export function getOrbits(req, res) {
  const orbits = satelliteService.getOrbitalTracks();
  res.json(orbits);
}

export async function logTelemetry(req, res, next) {
  try {
    const { satelliteId, sensorName, latitude, longitude, aqi, temperature, humidity, windSpeed } = req.body;

    if (!satelliteId || !sensorName || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: "satelliteId, sensorName, latitude, and longitude are required." });
    }

    const newLog = await TelemetryRepo.logTelemetry({
      satelliteId,
      sensorName,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      aqi: parseInt(aqi, 10) || 45,
      temperature: parseFloat(temperature) || 30.0,
      humidity: parseInt(humidity, 10) || 65,
      windSpeed: parseFloat(windSpeed) || 12.0,
    });

    res.status(201).json({
      message: "Satellite telemetry logged successfully.",
      log: newLog,
    });
  } catch (error) {
    next(error);
  }
}

export async function getTelemetryHistory(req, res, next) {
  try {
    const limit = parseInt(req.query.limit, 10) || 20;
    const logs = await TelemetryRepo.getRecentLogs(limit);
    res.json({
      logs,
      count: logs.length,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/satellite/remote-sensing?lat=...&lon=...
 * Computes or fetches live remote sensing spectral data and auto-logs telemetry to MySQL
 */
export async function getRemoteSensing(req, res, next) {
  try {
    const { lat, lon } = resolveCoordinates(req.query.lat, req.query.lon);
    const scene = await satelliteService.fetchLiveRemoteSensing(lat, lon);

    // Auto-record telemetry reading to database repository (MySQL)
    try {
      await TelemetryRepo.logTelemetry({
        satelliteId: "Sentinel-2A / TROPOMI",
        sensorName: "MSI / TIRS-2 Remote Sensing MultiSpectral",
        latitude: parseFloat(lat),
        longitude: parseFloat(lon),
        aqi: scene.surfaceAtmosphere.aqi,
        temperature: scene.surfaceAtmosphere.temperature,
        humidity: scene.surfaceAtmosphere.humidity,
        windSpeed: scene.surfaceAtmosphere.windSpeed,
      });
    } catch (dbErr) {
      // Non-fatal logging notice
    }

    res.json(scene);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/satellite/fetch-scene
 * Trigger explicit high-resolution scene acquisition for any point on Earth
 */
export async function fetchScene(req, res, next) {
  try {
    const { satelliteId } = req.body;
    const { lat, lon } = resolveCoordinates(req.body.lat, req.body.lon);
    const scene = await satelliteService.fetchLiveRemoteSensing(lat, lon);

    // Record into MySQL
    const log = await TelemetryRepo.logTelemetry({
      satelliteId: satelliteId || "Sentinel-2A Orbit #882",
      sensorName: "MultiSpectral Earth Observation Sensor",
      latitude: lat,
      longitude: lon,
      aqi: scene.surfaceAtmosphere.aqi,
      temperature: scene.surfaceAtmosphere.temperature,
      humidity: scene.surfaceAtmosphere.humidity,
      windSpeed: scene.surfaceAtmosphere.windSpeed,
    });

    res.status(200).json({
      message: "Remote sensing satellite scene successfully acquired and logged to database.",
      scene,
      logEntry: log,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/satellite/anomalies
 * Real-time thermal hotspots, wave anomalies, and TROPOMI column spikes
 */
export async function getAnomalies(req, res, next) {
  try {
    const { lat, lon, location } = req.query;
    const anomalies = await satelliteService.getLiveAnomalies(lat, lon, location);
    res.json(anomalies);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/satellite/indices
 * On-demand computation of NDVI, NDWI, NDBI, and LST
 */
export function getSpectralIndices(req, res) {
  const { red, nir, green, swir, thermalC } = req.query;
  const indices = satelliteService.calculateRemoteSensingIndices({
    red: red !== undefined ? parseFloat(red) : undefined,
    nir: nir !== undefined ? parseFloat(nir) : undefined,
    green: green !== undefined ? parseFloat(green) : undefined,
    swir: swir !== undefined ? parseFloat(swir) : undefined,
    thermalC: thermalC !== undefined ? parseFloat(thermalC) : undefined,
  });
  res.json(indices);
}

export default {
  getTelemetry,
  getEri,
  getOrbits,
  logTelemetry,
  getTelemetryHistory,
  getRemoteSensing,
  fetchScene,
  getAnomalies,
  getSpectralIndices,
};

