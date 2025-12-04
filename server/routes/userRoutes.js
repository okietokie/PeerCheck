// userRoutes.js - FIXED VERSION
import express from 'express';
import { 
  fetchUserDetails, 
  createProject, 
  deleteProject, 
  updateProject
} from '../controllers/userController.js';

// Import FIXED connection controllers
import {
  sendConnectionRequest,
  removeConnection,
  getIncomingRequests,
  getSentRequests,
  acceptRequest,
  rejectRequest,
  getPeerTeam
} from '../controllers/connectionController.js';

import {
  getUserTeams,
  createTeam,
  leaveTeam,
  updateTeam,
  inviteToTeam,
  getTeamSuggestions
} from '../controllers/teamController.js';

import {
  getSuggestedUsers,
  searchUsers,
  getUserProfile
} from '../controllers/userDiscoveryController.js';

import { authMiddleware } from '../middleware/authMiddleware.js';

// Import ALL task controllers (FIXED - added missing imports)
import { 
  getTasks, 
  getAllTasks,           // ADD THIS
  getAllTasksWithFilters, // ADD THIS
  getUserTasks,
  createTask, 
  updateTaskStatus, 
  updateTaskTime,
  uploadProof,
  updateTaskFlags,
  deleteTask,
  assignTask,
  getTaskDetails,
  updateTaskGrading,
  getTasksWithFilter      
} from '../controllers/taskController.js';

import { fetchBasicData, getDashboardStats } from '../controllers/homeController.js'; 

const router = express.Router();

router.get("/basic-data", fetchBasicData);
router.get("/dashboard-stats", authMiddleware, getDashboardStats);

// Existing routes
router.get("/me", authMiddleware, fetchUserDetails);
router.post("/create-project", authMiddleware, createProject);
router.delete("/del-project/:id", authMiddleware, deleteProject);
router.put("/update-project/:id", authMiddleware, updateProject);

// TASK ROUTES - FIXED organization
// Get project tasks
router.get("/tasks/project/:projectId", authMiddleware, getTasks);
router.get("/tasks/project/:projectId/filtered", authMiddleware, getTasksWithFilter);

// Get all tasks across projects
router.get("/tasks/all", authMiddleware, getAllTasks);
router.get("/tasks/all/filtered", authMiddleware, getAllTasksWithFilters);

// Get user's tasks
router.get("/tasks/user", authMiddleware, getUserTasks);

// Single task operations (keep these separate from project routes)
router.get("/task/:taskId", authMiddleware, getTaskDetails); 
router.post("/task/create", authMiddleware, createTask); 
router.put("/task/:taskId/status", authMiddleware, updateTaskStatus);
router.put("/task/:taskId/time", authMiddleware, updateTaskTime);
router.post("/task/:taskId/proof", authMiddleware, uploadProof);
router.put("/task/:taskId/flags", authMiddleware, updateTaskFlags);
router.delete("/task/:taskId", authMiddleware, deleteTask);
router.put("/task/:taskId/assign", authMiddleware, assignTask);
router.put("/task/:taskId/grading", authMiddleware, updateTaskGrading);

// Connection routes
router.get("/peerteam/", authMiddleware, getPeerTeam);
router.get("/peer-requests", authMiddleware, getIncomingRequests);
router.get("/sent-requests", authMiddleware, getSentRequests);
router.post("/send-request", authMiddleware, sendConnectionRequest);
router.put("/accept-request/:connectionId", authMiddleware, acceptRequest);
router.put("/decline-request/:connectionId", authMiddleware, rejectRequest);
router.delete("/remove-connection/:connectionId", authMiddleware, removeConnection);

// Team routes
router.get('/teams', authMiddleware, getUserTeams);
router.post('/create-team', authMiddleware, createTeam);
router.delete('/leave-team/:teamId', authMiddleware, leaveTeam);
router.put('/update-team/:teamId', authMiddleware, updateTeam);
router.post('/invite-to-team/:teamId', authMiddleware, inviteToTeam);
router.get('/team-suggestions', authMiddleware, getTeamSuggestions);

// User discovery routes
router.get("/suggested-users", authMiddleware, getSuggestedUsers);
router.get("/search-users", authMiddleware, searchUsers);
router.get("/user-profile/:userId", authMiddleware, getUserProfile);

export default router;