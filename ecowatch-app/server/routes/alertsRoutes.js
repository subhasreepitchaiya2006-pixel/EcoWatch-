import { Router } from "express";
import alertsController from "../controllers/alertsController.js";
import { authenticateToken, optionalAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", alertsController.getAlerts);
router.post("/", optionalAuth, alertsController.createAlert);
router.post("/broadcast", optionalAuth, alertsController.broadcastAlert);
router.get("/:id", alertsController.getAlertById);
router.put("/:id", optionalAuth, alertsController.updateAlert);
router.delete("/:id", optionalAuth, alertsController.deleteAlert);

export default router;
