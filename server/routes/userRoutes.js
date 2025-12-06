// userRoutes.js - FIXED VERSION
import express from 'express';
import { 
  fetchUserDetails, 
  createProject, 
  deleteProject, 
  updateProject,
  uploadAvatar,
  updateProfile
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
  getTasksWithFilter,      
  updateTaskDetails,
  updateTaskDeadline,
  addTaskComment,
  deleteProof,
  getTaskActivityLogs,
  startTask,
  pauseTask,
  resumeTask,
  completeTask
} from '../controllers/taskController.js';

import { fetchBasicData, getDashboardStats } from '../controllers/homeController.js'; 
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create avatar upload directory
const avatarDir = 'uploads/avatars';
if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true });
}

// Configure multer for avatar upload
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${req.userId}-${uniqueSuffix}${ext}`);
  }
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { 
    fileSize: 2 * 1024 * 1024 // 2MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WebP)'), false);
    }
  }
});


router.get("/basic-data", fetchBasicData);
router.get("/dashboard-stats", authMiddleware, getDashboardStats);

// avatar upload and profile update routes
router.post("/upload-avatar", authMiddleware, upload.single('avatar'), uploadAvatar);
router.put("/update-profile", authMiddleware, updateProfile);

router.post("/upload-avatar", authMiddleware, avatarUpload.single('avatar'), uploadAvatar);
router.put("/update-profile", authMiddleware, updateProfile);

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



// Single task operations
router.get("/task/:taskId", authMiddleware, getTaskDetails); 
router.post("/task/create", authMiddleware, createTask); 
router.put("/task/:taskId/status", authMiddleware, updateTaskStatus);
router.put("/task/:taskId/time", authMiddleware, updateTaskTime);
router.post("/task/:taskId/proof", authMiddleware, uploadProof);
router.delete("/task/:taskId", authMiddleware, deleteTask);
router.put("/task/:taskId/assign", authMiddleware, assignTask);

router.put("/task/:taskId/details", authMiddleware, updateTaskDetails);
router.put("/task/:taskId/deadline", authMiddleware, updateTaskDeadline);
router.put("/task/:taskId/grading", authMiddleware, updateTaskGrading);
router.post("/task/:taskId/comment", authMiddleware, addTaskComment);
router.delete("/task/:taskId/proof/:proofId", authMiddleware, deleteProof);
router.put("/task/:taskId/flags", authMiddleware, updateTaskFlags);

// Existing routes
router.get("/task/:taskId/activity", authMiddleware, getTaskActivityLogs);
router.post("/task/:taskId/proof", authMiddleware, upload.single('proofFile'), uploadProof)

// userRoutes.js
router.post("/task/:taskId/start", authMiddleware, startTask);
router.post("/task/:taskId/pause", authMiddleware, pauseTask);
router.post("/task/:taskId/resume", authMiddleware, resumeTask);
router.post("/task/:taskId/complete", authMiddleware, completeTask);

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