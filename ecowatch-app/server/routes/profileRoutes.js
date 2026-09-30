import { Router } from "express";
import profileController from "../controllers/profileController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticateToken, profileController.getProfile);
router.put("/", authenticateToken, profileController.updateProfile);

export default router;
