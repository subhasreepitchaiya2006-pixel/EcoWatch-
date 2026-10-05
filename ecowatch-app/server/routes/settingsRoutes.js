import { Router } from "express";
import settingsController from "../controllers/settingsController.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticateToken, requireRole("System Admin"), settingsController.getSettings);
router.put("/", authenticateToken, requireRole("System Admin"), settingsController.updateSettings);
router.post("/api-keys", authenticateToken, requireRole("System Admin"), settingsController.createApiKey);
router.delete("/api-keys/:id", authenticateToken, requireRole("System Admin"), settingsController.deleteApiKey);
router.post("/webhooks", authenticateToken, requireRole("System Admin"), settingsController.createWebhook);
router.delete("/webhooks/:id", authenticateToken, requireRole("System Admin"), settingsController.deleteWebhook);
router.post("/webhooks/test", authenticateToken, requireRole("System Admin"), settingsController.testWebhook);

export default router;
