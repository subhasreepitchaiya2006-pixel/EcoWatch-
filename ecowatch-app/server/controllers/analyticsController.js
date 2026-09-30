import satelliteService from "../services/satelliteService.js";
import aiService from "../services/aiService.js";

export function getHistoricalAnalytics(req, res) {
  const { timeframe } = req.query;
  const data = satelliteService.getHistoricalAnalytics(timeframe);
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

export function exportAnalytics(req, res) {
  const { format } = req.query;
  const analytics = satelliteService.getHistoricalAnalytics("1y");
  const weather = satelliteService.getWeatherData();
  const aqi = satelliteService.getAirQualityData();

  res.json({
    format: format || "json",
    title: "EcoWatch Comprehensive Regional Environmental Intelligence Report",
    generatedAt: new Date().toISOString(),
    executiveSummary: {
      location: "Chennai Metro & Coastal Zone",
      overallEriScore: 38,
      status: "Nominal Stability",
      meanAqi: 48,
      deforestationRiskHectares: analytics.deforestationRiskHectares,
    },
    datasets: {
      analytics,
      weather,
      aqi,
    },
  });
}

export default {
  getHistoricalAnalytics,
  generateAiInsight,
  exportAnalytics,
};
