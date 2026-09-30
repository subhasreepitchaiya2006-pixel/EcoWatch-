import { Router } from "express";
import alertsController from "../controllers/alertsController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

router.get("/", alertsController.getAlerts);
router.post("/", authenticateToken, alertsController.createAlert);
router.post("/broadcast", authenticateToken, alertsController.broadcastAlert);
router.get("/:id", alertsController.getAlertById);
router.put("/:id", authenticateToken, alertsController.updateAlert);
router.delete("/:id", authenticateToken, alertsController.deleteAlert);

export default router;
