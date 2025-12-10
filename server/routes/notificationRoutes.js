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

// All routes require authentication
router.use(authMiddleware);

// Get notifications
router.get('/', getUserNotifications);

// Get notification stats
router.get('/stats', getNotificationStats);

// Mark notification as read
router.put('/:notificationId/read', markAsRead);

// Mark all as read
router.put('/read-all', markAllAsRead);

// Delete notification
router.delete('/:notificationId', deleteNotification);

// Clear all notifications
router.delete('/clear-all', clearAllNotifications);

export default router;