import { Router } from "express";
import analyticsController from "../controllers/analyticsController.js";

const router = Router();

router.get("/historical", analyticsController.getHistoricalAnalytics);
router.post("/ai-insight", analyticsController.generateAiInsight);
router.get("/ai-models", analyticsController.getAiModels);
router.post("/train-models", analyticsController.trainAiModels);
router.get("/export", analyticsController.exportAnalytics);

export default router;
