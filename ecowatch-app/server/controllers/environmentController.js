import satelliteService from "../services/satelliteService.js";

export async function getEnvironment(req, res, next) {
  try {
    const { lat, lon } = req.query;
    const metrics = await satelliteService.computeEnvironmentMetrics(lat, lon);
    res.json(metrics);
  } catch (error) {
    next(error);
  }
}

export async function getWeather(req, res, next) {
  try {
    const { location, lat, lon } = req.query;
    const weather = await satelliteService.getWeatherData(location, lat, lon);
    res.json(weather);
  } catch (error) {
    next(error);
  }
}

export async function getAirQuality(req, res, next) {
  try {
    const { lat, lon } = req.query;
    const airQuality = await satelliteService.getAirQualityData(lat, lon);
    res.json(airQuality);
  } catch (error) {
    next(error);
  }
}

export default {
  getEnvironment,
  getWeather,
  getAirQuality,
};
