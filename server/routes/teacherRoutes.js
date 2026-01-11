import express from 'express';
import * as teacherController from '../controllers/mentorController.js';
import { authMiddleware, teacherOnlyMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(authMiddleware);
router.use(teacherOnlyMiddleware);

router.get("/get-projects", teacherController.fetchProjectsMonitoredByMentor);
router.get("/get-teams", teacherController.fetchTeamsMonitoredByMentor);


router.get("/dashboard", teacherController.getTeacherDashboard);

router.get("/analytics", teacherController.getTeacherAnalytics);
router.post("/evaluation/submit/:projectId",  teacherController.submitTeacherEvaluation);

router.put("/evaluation/update/:evaluationId", teacherController.updateEvaluation);
router.delete("/evaluation/delete/:evaluationId", teacherController.deleteEvaluation);


export default router;