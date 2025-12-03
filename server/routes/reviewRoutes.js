import express from 'express';
import {
  getAllReviews,
  getRecentReviews,
  getHelpfulReviews,
  createReview,
  submitGuestReview,
  voteReview,
  getReviewStats,
  verifyReview,
  featureReview,
  deleteReview
} from '../controllers/reviewController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllReviews);
router.get('/recent', getRecentReviews);
router.get('/helpful', getHelpfulReviews);
router.get('/stats', getReviewStats);

// Guest review submission
router.post('/guest', submitGuestReview);

// Protected routes (require authentication)
router.use(authMiddleware);

// User reviews
router.post('/', createReview);
router.post('/:reviewId/vote', voteReview);

// Admin routes
router.put('/:reviewId/verify', verifyReview);
router.put('/:reviewId/feature', featureReview);
router.delete('/:reviewId', deleteReview);

export default router;