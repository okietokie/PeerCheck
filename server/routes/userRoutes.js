// userRoutes.js
import express from 'express';
import * as userController from '../controllers/userController.js';
import * as connectionController from '../controllers/connectionController.js';
import * as teamController from '../controllers/teamController.js';

import * as userDiscoveryController from '../controllers/userDiscoveryController.js';

import { authMiddleware as protect } from '../middleware/authMiddleware.js';

import * as taskController from '../controllers/taskController.js';

import { fetchBasicData } from '../controllers/homeController.js'; 
import * as upload from '../middleware/uploadMiddleware.js';

import { getMentorById, getMentors } from '../controllers/mentorController.js';
import notificationRoutes from "./notificationRoutes.js";
import commentRoutes from "./commentRoutes.js";
const router = express.Router();


router.get("/basic-data", fetchBasicData);

router.use("", notificationRoutes)
router.use("/comments", commentRoutes);


router.use(protect);
router.get("/dashboard-stats", userController.getDashboardStats);


router.post("/upload-avatar", upload.avatarUpload.single("avatar"), userController.uploadAvatar);

router.put("/update-profile", userController.updateProfile);

router.get("/get-mentors", getMentors);
router.get("/get-mentor-for-project/:projectId", getMentorById);


// 
router.get("/me", userController.fetchUserDetails);



// Get specific proof file with authentication and authorization
router.get("/task/:taskId/proof/:proofId", taskController.getProofFile);

// Get project tasks
router.get("/tasks/project/:projectId", taskController.getTasks);
router.get("/tasks/project/:projectId/filtered", taskController.getTasksWithFilter);

// Get all tasks across projects
router.get("/tasks/all", taskController.getAllTasks);
router.get("/tasks/all/filtered", taskController.getAllTasksWithFilters);

// Get user's tasks
router.get("/tasks/user", taskController.getUserTasks);



// Single task operations
router.get("/task/:taskId", taskController.getTaskDetails);  // get task details
router.post("/task/create", taskController.createTask);  // create new task
router.patch("/task/:taskId", taskController.updateTask);

router.put("/task/:taskId/status", taskController.updateTaskStatus); // update task status
router.delete("/task/:taskId", taskController.deleteTask); // delete task
router.put("/task/:taskId/assign", taskController.assignTask); // assign task to user
//Inline editing
router.patch('/:taskId/field', taskController.updateTaskField); // Update single field
router.patch('/:taskId/reassign', taskController.reassignTask); // reassign

// Recent activities route
router.get("/task/activity/recent", userController.getRecentActivities); // route for recent activities

router.put("/task/:taskId/details", taskController.updateTaskDetails); // update task details
router.put("/task/:taskId/deadline", taskController.updateTaskDeadline); // update task deadline


router.get("/task/:taskId/activity", taskController.getTaskActivityLogs); // get task activity logs


router.post("/task/:taskId/proof", upload.proofUpload.single('proofFile'), taskController.uploadProof) ; // upload proof for task
router.get("/task/:taskId/proof/:proofId", taskController.getProofFile) ; // upload proof for task
router.delete("/task/:taskId/proof/:proofId", taskController.deleteProof); // delete proof from task


// Connection routes
router.get("/peerteam/", connectionController.getPeerTeam); // get user's peer team
router.get("/peer-requests", connectionController.getIncomingRequests); // get incoming connection requests
router.get("/sent-requests", connectionController.getSentRequests); // get sent connection requests
router.post("/send-request", connectionController.sendConnectionRequest); // send connection request
router.put("/accept-request/:connectionId", connectionController.acceptRequest); // accept connection request
router.put("/decline-request/:connectionId", connectionController.rejectRequest); // decline connection request
router.delete("/remove-connection/:connectionId", connectionController.removeConnection); // remove connection
// Team routes
router.get('/teams', teamController.getUserTeams); // get user's teams
router.post('/create-team', teamController.createTeam);  // create new team
router.delete('/leave-team/:teamId', teamController.leaveTeam);  // leave team
router.put('/update-team/:teamId', teamController.updateTeam); // update team details
router.post('/invite-to-team/:teamId', teamController.inviteToTeam); 
router.get('/team-suggestions', teamController.getTeamSuggestions); // get team suggestions

// User discovery routes
router.get("/suggested-users", userDiscoveryController.getSuggestedUsers); // get suggested users for connections
router.get("/search-users", userDiscoveryController.searchUsers); // search users by name or email
router.get("/user-profile/:userId", userDiscoveryController.getUserProfile);  // get user profile by ID


router.get("/tour-completion-check/:page", userController.checkTourguideComplete);
router.patch("/tour-complete", userController.markTourguideComplete);
export default router;