// routes/adminRoutes.js
import express from "express";
import { failedLogin, getSecurityStats, loginAttempts, passwordResetList, getAllUsers, updateStatus } from "../controllers/adminController.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protectAdmin);
router.get("/security-stats", getSecurityStats);
router.get("/login-logs", loginAttempts);
router.get("/failed-logins", failedLogin);
router.get("/password-resets", passwordResetList);
router.get("/user-data", getAllUsers);
router.put("/change-status/:id", updateStatus);



export default router;
