import { Router } from "express";
import reportsController from "../controllers/reportsController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

router.get("/", reportsController.getReports);
router.get("/stats", reportsController.getStats);
router.post("/", authenticateToken, reportsController.createReport);
router.get("/:id", reportsController.getReportById);
router.put("/:id", authenticateToken, reportsController.updateReport);
router.delete("/:id", authenticateToken, reportsController.deleteReport);
router.post("/:id/vote", reportsController.voteReport);

export default router;
