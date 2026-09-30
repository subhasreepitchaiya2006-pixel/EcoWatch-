import { Router } from "express";
import satelliteController from "../controllers/satelliteController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

router.get("/telemetry", satelliteController.getTelemetry);
router.get("/eri", satelliteController.getEri);
router.get("/orbits", satelliteController.getOrbits);
router.post("/telemetry/log", authenticateToken, satelliteController.logTelemetry);
router.get("/telemetry/history", satelliteController.getTelemetryHistory);
router.get("/remote-sensing", satelliteController.getRemoteSensing);
router.post("/fetch-scene", satelliteController.fetchScene);
router.get("/anomalies", satelliteController.getAnomalies);
router.get("/indices", satelliteController.getSpectralIndices);

export default router;

