import express from "express";
import { registerUser, loginUser, forgotPassword, resetPassword, logoutUser } from "../controllers/authControllers.js";
import { fetchBasicData } from '../controllers/homeController.js';
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/basic-data", fetchBasicData);


router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.put("/log-out", authMiddleware, logoutUser);

export default router;
