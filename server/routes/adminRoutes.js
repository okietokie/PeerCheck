// routes/adminRoutes.js
import express from "express";
import { failedLogin, getSecurityStats, loginAttempts, passwordResetList, getAllUsers, updateStatus } from "../controllers/adminController.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/security-stats", protectAdmin, getSecurityStats);
router.get("/login-logs", protectAdmin, loginAttempts);
router.get("/failed-logins", protectAdmin, failedLogin);
router.get("/password-resets", protectAdmin, passwordResetList);
router.get("/user-data", protectAdmin, getAllUsers);
router.put("/change-status/:id", protectAdmin, updateStatus);



export default router;
