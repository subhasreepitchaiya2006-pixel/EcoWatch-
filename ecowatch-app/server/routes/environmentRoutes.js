import { Router } from "express";
import environmentController from "../controllers/environmentController.js";

const router = Router();

router.get("/environment", environmentController.getEnvironment);
router.get("/weather", environmentController.getWeather);
router.get("/air-quality", environmentController.getAirQuality);

export default router;
