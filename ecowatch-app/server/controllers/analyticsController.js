import satelliteService from "../services/satelliteService.js";
import aiService from "../services/aiService.js";
import { resolveCoordinates } from "../services/satelliteService.js";

export function getHistoricalAnalytics(req, res) {
  const { timeframe, lat, lon, location } = req.query;
  const data = satelliteService.getHistoricalAnalytics(timeframe, lat, lon, location);
  res.json(data);
}

export function generateAiInsight(req, res) {
  const { prompt, aqi, region } = req.body;

  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ message: "Prompt is required for AI environmental analysis." });
  }

  const result = aiService.generateEnvironmentalInsight(prompt, { aqi, region });
  res.json(result);
}

export async function exportAnalytics(req, res, next) {
  try {
    const { format, lat, lon, location } = req.query;
    const coordinates = resolveCoordinates(lat, lon);
    const locationName = location || `Location ${coordinates.lat.toFixed(4)}, ${coordinates.lon.toFixed(4)}`;
    const analytics = satelliteService.getHistoricalAnalytics("1y", coordinates.lat, coordinates.lon, locationName);
    const [weather, aqi] = await Promise.all([
      satelliteService.getWeatherData(locationName, coordinates.lat, coordinates.lon),
      satelliteService.getAirQualityData(coordinates.lat, coordinates.lon),
    ]);

    res.json({
      format: format || "json",
      title: `EcoWatch Environmental Intelligence Report - ${locationName}`,
      generatedAt: new Date().toISOString(),
      executiveSummary: {
        location: locationName,
        overallEriScore: 38,
        status: "Nominal Stability",
        meanAqi: aqi.aqi,
        deforestationRiskHectares: analytics.deforestationRiskHectares,
      },
      coordinates,
      datasets: { analytics, weather, aqi },
    });
  } catch (error) {
    next(error);
  }
}

export function getAiModels(req, res) {
  const models = aiService.getAiModels();
  res.json({ models, total: models.length });
}

export function trainAiModels(req, res) {
  const result = aiService.trainAllAiModels(req.body);
  res.json(result);
}

export default {
  getHistoricalAnalytics,
  generateAiInsight,
  exportAnalytics,
  getAiModels,
  trainAiModels,
};
