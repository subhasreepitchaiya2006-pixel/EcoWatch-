import { Router } from "express";
import settingsController from "../controllers/settingsController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticateToken, settingsController.getSettings);
router.put("/", authenticateToken, settingsController.updateSettings);
router.post("/api-keys", authenticateToken, settingsController.createApiKey);
router.delete("/api-keys/:id", authenticateToken, settingsController.deleteApiKey);
router.post("/webhooks", authenticateToken, settingsController.createWebhook);
router.delete("/webhooks/:id", authenticateToken, settingsController.deleteWebhook);
router.post("/webhooks/test", authenticateToken, settingsController.testWebhook);

export default router;
