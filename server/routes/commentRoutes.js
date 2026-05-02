import express from 'express';
import {
    createComment,
    getCommentsByTask,
    getCommentById,
    updateComment,
    deleteComment,
    getCommentCount
} from '../controllers/commentsController.js';
import { authMiddleware } from '../middleware/authMiddleware.js'; 

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.post('/', createComment);
router.get('/task/:taskId', getCommentsByTask);
router.get('/count/:taskId', getCommentCount);
router.get('/:commentId', getCommentById);
router.put('/:commentId', updateComment);
router.delete('/:commentId', deleteComment);

export default router;