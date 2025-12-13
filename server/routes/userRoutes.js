// userRoutes.js - FIXED VERSION
import express from 'express';
import { 
  fetchUserDetails, 
  createProject, 
  deleteProject, 
  updateProject,
  uploadAvatar,
  updateProfile,
  getDashboardStats,
  getRecentActivities
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

import { fetchBasicData } from '../controllers/homeController.js'; 
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getMentorById, getMentors } from '../controllers/mentorController.js';

// Create avatar upload directory
//code working explanation: checks if the directory for storing uploaded avatars exists. If it doesn't, the code creates the directory using fs.mkdirSync with the recursive option set to true, ensuring that any necessary parent directories are also created.
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
// File filter to accept only image files
// Set file size limit to 2MB
// Allowed file types: JPEG, PNG, GIF, WebP
export const avatarUpload = multer({ 
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

router.get("/get-mentors", authMiddleware, getMentors);
router.get("/get-mentor-for-project/:projectId", authMiddleware, getMentorById);


// Existing routes
router.get("/me", authMiddleware, fetchUserDetails);
router.post("/create-project", authMiddleware, createProject);
router.delete("/del-project/:id", authMiddleware, deleteProject);
router.put("/update-project/:id", authMiddleware, updateProject);

// In your routes file (taskRoutes.js)
import { getProofFile, getProofFileDirect } from '../controllers/taskController.js';

// Get specific proof file with authentication and authorization
router.get("/task/:taskId/proof/:proofId", authMiddleware, getProofFile);

// Direct file access (optional - less secure but simpler for frontend)
router.get("/uploads/proofs/:filename", getProofFileDirect); // Can be public or with minimal auth

// OR with auth for direct access:
router.get("/uploads/proofs/:filename", authMiddleware, getProofFileDirect);
// Get project tasks
router.get("/tasks/project/:projectId", authMiddleware, getTasks);
router.get("/tasks/project/:projectId/filtered", authMiddleware, getTasksWithFilter);

// Get all tasks across projects
router.get("/tasks/all", authMiddleware, getAllTasks);
router.get("/tasks/all/filtered", authMiddleware, getAllTasksWithFilters);

// Get user's tasks
router.get("/tasks/user", authMiddleware, getUserTasks);



// Single task operations
router.get("/task/:taskId", authMiddleware, getTaskDetails);  // get task details
router.post("/task/create", authMiddleware, createTask);  // create new task
router.put("/task/:taskId/status", authMiddleware, updateTaskStatus); // update task status
router.put("/task/:taskId/time", authMiddleware, updateTaskTime); // update task time tracking
router.delete("/task/:taskId", authMiddleware, deleteTask); // delete task
router.put("/task/:taskId/assign", authMiddleware, assignTask); // assign task to user

// Recent activities route
router.get("/task/activity/recent", authMiddleware, getRecentActivities); // route for recent activities

router.put("/task/:taskId/details", authMiddleware, updateTaskDetails); // update task details
router.put("/task/:taskId/deadline", authMiddleware, updateTaskDeadline); // update task deadline
router.put("/task/:taskId/grading", authMiddleware, updateTaskGrading); // update task grading
router.post("/task/:taskId/comment", authMiddleware, addTaskComment); // add comment to task
router.delete("/task/:taskId/proof/:proofId", authMiddleware, deleteProof); // delete proof from task
router.put("/task/:taskId/flags", authMiddleware, updateTaskFlags); // update task flags

// Existing routes
router.get("/task/:taskId/activity", authMiddleware, getTaskActivityLogs); // get task activity logs
router.post("/task/:taskId/proof", authMiddleware, upload.single('proofFile'), uploadProof) ; // upload proof for task

// userRoutes.js
router.post("/task/:taskId/start", authMiddleware, startTask); // start task
router.post("/task/:taskId/pause", authMiddleware, pauseTask); // pause task
router.post("/task/:taskId/resume", authMiddleware, resumeTask); // resume task
router.post("/task/:taskId/complete", authMiddleware, completeTask); // complete task

// Connection routes
router.get("/peerteam/", authMiddleware, getPeerTeam); // get user's peer team
router.get("/peer-requests", authMiddleware, getIncomingRequests); // get incoming connection requests
router.get("/sent-requests", authMiddleware, getSentRequests); // get sent connection requests
router.post("/send-request", authMiddleware, sendConnectionRequest); // send connection request
router.put("/accept-request/:connectionId", authMiddleware, acceptRequest); // accept connection request
router.put("/decline-request/:connectionId", authMiddleware, rejectRequest); // decline connection request
router.delete("/remove-connection/:connectionId", authMiddleware, removeConnection); // remove connection
// Team routes
router.get('/teams', authMiddleware, getUserTeams); // get user's teams
router.post('/create-team', authMiddleware, createTeam);  // create new team
router.delete('/leave-team/:teamId', authMiddleware, leaveTeam);  // leave team
router.put('/update-team/:teamId', authMiddleware, updateTeam); // update team details
router.post('/invite-to-team/:teamId', authMiddleware, inviteToTeam); 
router.get('/team-suggestions', authMiddleware, getTeamSuggestions); // get team suggestions

// User discovery routes
router.get("/suggested-users", authMiddleware, getSuggestedUsers); // get suggested users for connections
router.get("/search-users", authMiddleware, searchUsers); // search users by name or email
router.get("/user-profile/:userId", authMiddleware, getUserProfile);  // get user profile by ID

export default router;