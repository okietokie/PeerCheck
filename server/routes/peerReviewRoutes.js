// routes/peerReviewRoutes.js
import express from 'express';
import {
  submitPeerReview,
  getPeerReviewsForProject,
  lockPeerReviews,
  applyPeerScoreToGrading,
  getPeerScoreForUser,
  getAggregatedScores,
  canSubmitReview,
  checkPeerReviewCompletion
} from '../controllers/peerReviewController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);

// Student routes (authenticated)
router.post('/submit', submitPeerReview);
router.get('/my-score/:projectId', getPeerScoreForUser);
router.get('/can-submit/:projectId/:revieweeId', canSubmitReview);

// Instructor/Admin routes
router.get('/project/:projectId', getPeerReviewsForProject);
router.get('/aggregated/:projectId', getAggregatedScores);
router.patch('/lock/:projectId', lockPeerReviews);
router.post('/calculate-grades/:projectId', applyPeerScoreToGrading);

router.get('/completion/:projectId', checkPeerReviewCompletion);


export default router;