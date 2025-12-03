// server/routes/projectRoutes.js
import express from 'express';
import { 
  createProject, 
  deleteProject, 
  getAllProjects, 
  getContributorAnalytics, 
  getProjectById, 
  getProjectMetrics, 
  getTaskMetrics, 
  refreshProjectMetrics, 
  searchProjects 
} from '../controllers/projectController.js';
import { authMiddleware as protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// Routes
router.route('/')
  .post(createProject)
  .get(getAllProjects);

router.route('/search')
  .get(searchProjects);

router.route('/:projectId')
  .get(getProjectById)
  .delete(deleteProject);
// Project metrics routes
router.get('/:projectId/metrics', getProjectMetrics);
router.get('/:projectId/contributors', getContributorAnalytics);
router.post('/:projectId/metrics/refresh', refreshProjectMetrics);


// Task metrics route
router.get('/tasks/:taskId/metrics', getTaskMetrics);
export default router;