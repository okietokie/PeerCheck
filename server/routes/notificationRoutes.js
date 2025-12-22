// routes/userRoutes.js (add notification routes)
import express from 'express';
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  getNotificationStats
} from '../controllers/notificationController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Notification routes
router.get('/notifications', authMiddleware, getUserNotifications);
router.get('/notifications/stats', authMiddleware, getNotificationStats);
router.put('/notifications/:notificationId/read', authMiddleware, markAsRead);
router.put('/notifications/read-all', authMiddleware, markAllAsRead);
router.delete('/notifications/:notificationId', authMiddleware, deleteNotification);
router.delete('/notifications/clear-all', authMiddleware, clearAllNotifications);

export default router;