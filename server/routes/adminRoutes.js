// routes/adminRoutes.js
import express from "express";
import { failedLogin, getSecurityStats, loginAttempts, passwordResetList, getAllUsers, updateStatus, getActivitySummary, getDeletedProjects, getDeletedTasks, getEditedTasksHistory, getProjectsStats } from "../controllers/adminController.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protectAdmin);
router.get("/security-stats", getSecurityStats);
router.get("/login-logs", loginAttempts);
router.get("/failed-logins", failedLogin);
router.get("/password-resets", passwordResetList);
router.get("/user-data", getAllUsers);
router.put("/change-status/:id", updateStatus);
router.get("/activity-summary", getActivitySummary);
router.get("/deleted-projects", getDeletedProjects);
router.get("/deleted-tasks", getDeletedTasks);
router.get("/edited-tasks", getEditedTasksHistory);
router.get("/projects-stats", getProjectsStats);

export default router;
