import { Router } from "express";
import adminController from "../controllers/adminController.js";
import { authenticateToken, requireRole } from "../middleware/auth.js";

const router = Router();

// All admin routes require valid JWT token and System Admin role
router.use(authenticateToken, requireRole("System Admin"));

router.get("/overview", adminController.getOverview);
router.get("/users", adminController.getAllUsers);
router.patch("/users/:id/role", adminController.updateUserRole);
router.patch("/users/:id/status", adminController.updateUserStatus);
router.delete("/users/:id", adminController.deleteUser);
router.post("/alerts/broadcast", adminController.broadcastAlert);
router.get("/audit-logs", adminController.getAuditLogs);

export default router;