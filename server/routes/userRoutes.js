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
  getPeerTeam  // Added this missing import
} from '../controllers/connectionController.js';

import {
  getUserTeams,
  createTeam,
  leaveTeam,
  addMemberToTeam,  
  updateTeam
} from '../controllers/teamController.js';

import {
  getSuggestedUsers,
  searchUsers,
  getUserProfile
} from '../controllers/userDiscoveryController.js';

import { authMiddleware } from '../middleware/authMiddleware.js';

import { getTasks, createTask, updateTaskStatus, deleteTask } from '../controllers/taskController.js';
import { fetchBasicData } from '../controllers/homeController.js';

const router = express.Router();

router.get("/basic-data", fetchBasicData);


// Existing routes
router.get("/me", authMiddleware, fetchUserDetails);
router.post("/create-project", authMiddleware, createProject);
router.delete("/del-project/:id", authMiddleware, deleteProject);
router.put("/update-project/:id", authMiddleware, updateProject)

router.get("/tasks/:projectId", authMiddleware, getTasks);
router.post("/create-task", authMiddleware, createTask);
router.put("/tasks/:taskId/status", authMiddleware, updateTaskStatus);
router.delete("/del-task/:taskId", authMiddleware, deleteTask);

// FIXED Connection routes
router.get("/peerteam/", authMiddleware, getPeerTeam); // Changed from getIncomingRequests to getPeerTeam
router.get("/peer-requests", authMiddleware, getIncomingRequests); // This gets incoming requests
router.get("/sent-requests", authMiddleware, getSentRequests); // Added this route for sent requests
router.post("/send-request", authMiddleware, sendConnectionRequest);
router.put("/accept-request/:connectionId", authMiddleware, acceptRequest);
router.put("/decline-request/:connectionId", authMiddleware, rejectRequest);
router.delete("/remove-connection/:connectionId", authMiddleware, removeConnection);

// Team routes
router.get("/teams", authMiddleware, getUserTeams);
router.post("/create-team", authMiddleware, createTeam);
router.post("/add-team-member/:teamId", authMiddleware, addMemberToTeam);
router.delete("/leave-team/:teamId", authMiddleware, leaveTeam);
router.put("/update-team/:teamId", authMiddleware, updateTeam);

// User discovery routes
router.get("/suggested-users", authMiddleware, getSuggestedUsers);
router.get("/search-users", authMiddleware, searchUsers);
router.get("/user-profile/:userId", authMiddleware, getUserProfile);

export default router;