import { Router } from "express";
import authController from "../controllers/authController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/google", authController.googleLogin);
router.post("/microsoft", authController.microsoftLogin);
router.get("/me", authenticateToken, authController.getMe);
router.post("/change-password", authenticateToken, authController.changePassword);
router.post("/logout", authController.logout);

export default router;
