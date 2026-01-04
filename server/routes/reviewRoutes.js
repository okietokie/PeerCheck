import express from 'express';
import {
  submitReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview
} from '../controllers/reviewController.js';


const router = express.Router();

router.post('/submit', submitReview);
router.get('/', getReviews);
router.get('/:id', getReviewById);
router.put('/:id', updateReview);
router.delete('/:id',  deleteReview);

export default router;