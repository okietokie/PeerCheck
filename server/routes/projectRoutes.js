import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { createProject, deleteProject, getAllProjects, getProjectById, searchProjects } from '../controllers/projectController.js';

const router = express.Router();

router.get('/all-projects', authMiddleware, getAllProjects);
router.get('/search', authMiddleware, searchProjects);
router.get('/:projectId', authMiddleware, getProjectById);
router.post('/create-project', authMiddleware, createProject);
router.delete('/delete-project', authMiddleware, deleteProject);

export default router;