import Task from '../models/tasks.js';
import Project from '../models/projects.js';
import User from '../models/user.js';
import TaskActivityEvent from '../models/taskActivityEvent.js';

// Get all tasks for a project
export const getTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }
    
    // Checking if user has access to project (creator or team member)
    const userId = req.user.id; 
    
    if (project.createdBy.toString() !== userId && 
        !project.team.some(member => member.toString() === userId)) {
      return res.status(403).json({
        success: false,
        message: "Access denied to project"
      });
    }
    
    const tasks = await Task.find({ 
      projectId: projectId
    })
    .populate('assignedTo', 'name email avatar')
    .sort({ deadline: 1 })
    .lean();

    res.status(200).json({ 
      success: true,
      tasks 
    });
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ 
      success: false,
      message: "Error fetching tasks from server!" 
    });
  }
};

// Create a new task
export const createTask = async (req, res) => {
  try {
    const { 
      taskTitle, 
      description, 
      projectId, 
      assignedTo, 
      deadline, 
      estimatedTime,
      tags = []
    } = req.body;
    
    const userId = req.user.id; // Gets user ID from authMiddleware

    // Validate required fields
    if (!taskTitle || !projectId || !assignedTo || !deadline || !estimatedTime) {
      return res.status(400).json({ 
        success: false,
        message: 'Task title, project, assigned user, deadline, and estimated time are required' 
      });
    }

    // Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check if assigned user exists
    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser) {
      return res.status(404).json({
        success: false,
        message: 'Assigned user not found'
      });
    }

    // Check if assigned user is in project team (for improved security)
    if (!project.team.some(member => member.toString() === assignedTo) && 
        project.createdBy.toString() !== assignedTo) {
      return res.status(400).json({
        success: false,
        message: 'Assigned user must be a project team member'
      });
    }

    // Create the task
    const task = new Task({
      projectId,
      taskTitle: taskTitle.trim(),
      assignedTo,
      deadline: new Date(deadline),
      estimatedTime, // in seconds
      status: 'not_started',
      flags: {
        paddedTime: false,
        rushedCompletion: false,
        noProof: false,
        manualReviewRequired: false
      },
      gradingMeta: {
        allowPeerReview: true,
        qualityScore: 0,
        teacherOverrideScore: 0
      }
    });

    await task.save();


    // Log task creation activity
    await TaskActivityEvent.create({
      taskId: task._id,
      userId,
      eventType: 'created',
      comment: `Task "${taskTitle}" created`
    });

    res.status(201).json({ 
      success: true,
      message: "Task created successfully", 
      task: populatedTask 
    });

  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ 
      success: false,
      message: `Error creating task: ${err.message}` 
    });
  }
};

// Update task status
export const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    // Validate status
    const validStatuses = ['not_started', 'active', 'paused', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid status" 
      });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ 
        success: false,
        message: "Task not found" 
      });
    }

    // Check if user has access to task's project
    const project = await Project.findById(task.projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    // Check access: user must be creator, assigned to task, or admin
    const hasAccess = 
      project.createdBy.toString() === userId ||
      task.assignedTo.toString() === userId ||
      project.team.some(member => member.toString() === userId);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Access denied"
      });
    }

    // Update task
    const previousStatus = task.status;
    task.status = status;
    task.lastEventTime = new Date();
    
    // If completing task, check for rushing flag
    if (status === 'completed' && previousStatus !== 'completed') {
      const totalLoggedTime = task.totalFocusTime || 0;
      const estimatedTime = task.estimatedTime;
      
      // Flag if task completed in less than 20% of estimated time
      if (totalLoggedTime < (estimatedTime * 0.2)) {
        task.flags.rushedCompletion = true;
        task.flags.manualReviewRequired = true;
      }
    }

    await task.save();

    // Log status change activity
    await TaskActivityEvent.create({
      taskId: task._id,
      userId,
      eventType: 'status_change',
      comment: `Status changed from ${previousStatus} to ${status}`
    });

    const updatedTask = await Task.findById(taskId)
      .populate('assignedTo', 'name email avatar');

    res.status(200).json({ 
      success: true,
      message: "Task status updated successfully", 
      task: updatedTask 
    });
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ 
      success: false,
      message: `Error updating task: ${err.message}` 
    });
  }
};

// Update task focus time
export const updateTaskTime = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { duration } = req.body; // duration in seconds
    const userId = req.user.id;

    if (!duration || duration <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid duration is required"
      });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    // Check if user is assigned to task
    if (task.assignedTo.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only assigned user can update task time"
      });
    }

    // Update total focus time
    task.totalFocusTime = (task.totalFocusTime || 0) + duration;
    task.lastEventTime = new Date();
    
    // Check for time padding flag
    const totalLoggedTime = task.totalFocusTime;
    const estimatedTime = task.estimatedTime;
    
    if (totalLoggedTime > (estimatedTime * 2)) { // More than 200% of estimated time
      task.flags.paddedTime = true;
      task.flags.manualReviewRequired = true;
    }

    await task.save();

    // Log time update activity
    await TaskActivityEvent.create({
      taskId: task._id,
      userId,
      eventType: 'time_update',
      duration,
      comment: `Added ${duration} seconds of focus time`
    });

    res.status(200).json({
      success: true,
      message: "Task time updated successfully",
      totalFocusTime: task.totalFocusTime
    });
  } catch (err) {
    console.error('Error updating task time:', err);
    res.status(500).json({
      success: false,
      message: `Error updating task time: ${err.message}`
    });
  }
};

// Upload proof for task
export const uploadProof = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { filename, fileUrl } = req.body;
    const userId = req.user.id;

    if (!filename || !fileUrl) {
      return res.status(400).json({
        success: false,
        message: "Filename and file URL are required"
      });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    // Check if user is assigned to task
    if (task.assignedTo.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only assigned user can upload proof"
      });
    }

    // Add proof upload
    task.proofUploads.push({
      filename,
      fileUrl,
      uploadedAt: new Date()
    });
    
    // Clear noProof flag if proof is uploaded
    if (task.flags.noProof) {
      task.flags.noProof = false;
    }

    await task.save();

    // Log proof upload activity
    await TaskActivityEvent.create({
      taskId: task._id,
      userId,
      eventType: 'proof_upload',
      comment: `Uploaded proof: ${filename}`
    });

    res.status(200).json({
      success: true,
      message: "Proof uploaded successfully",
      proofUploads: task.proofUploads
    });
  } catch (err) {
    console.error('Error uploading proof:', err);
    res.status(500).json({
      success: false,
      message: `Error uploading proof: ${err.message}`
    });
  }
};

// Update task flags
export const updateTaskFlags = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { flags } = req.body;
    const userId = req.user.id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    // Check if user is teacher/admin (only teachers can modify flags)
    const user = await User.findById(userId);
    if (user.role !== 'admin' && user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: "Only teachers/admins can modify task flags"
      });
    }

    // Update flags
    task.flags = { ...task.flags, ...flags };
    await task.save();

    // Log flag update activity
    await TaskActivityEvent.create({
      taskId: task._id,
      userId,
      eventType: 'flag_update',
      comment: `Updated task flags: ${JSON.stringify(flags)}`
    });

    res.status(200).json({
      success: true,
      message: "Task flags updated successfully",
      flags: task.flags
    });
  } catch (err) {
    console.error('Error updating task flags:', err);
    res.status(500).json({
      success: false,
      message: `Error updating task flags: ${err.message}`
    });
  }
};

// Delete task
export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;
    
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ 
        success: false,
        message: "Task not found" 
      });
    }

    // Check if user is project creator or admin
    const project = await Project.findById(task.projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    if (project.createdBy.toString() !== userId) {
      const user = await User.findById(userId);
      if (user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: "Only project creator or admin can delete tasks"
        });
      }
    }

    // Delete the task
    await Task.findByIdAndDelete(taskId);
    
    // Delete related activity events
    await TaskActivityEvent.deleteMany({ taskId });

    res.status(200).json({ 
      success: true,
      message: "Task deleted successfully" 
    });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ 
      success: false,
      message: `Error deleting task: ${err.message}` 
    });
  }
};

// Assign/reassign task
export const assignTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { assignedTo } = req.body;
    const userId = req.user.id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    // Check if new assigned user exists
    const newAssignee = await User.findById(assignedTo);
    if (!newAssignee) {
      return res.status(404).json({
        success: false,
        message: "Assigned user not found"
      });
    }

    // Check permissions: project creator, admin, or current assignee can reassign
    const project = await Project.findById(task.projectId);
    const isProjectCreator = project.createdBy.toString() === userId;
    const isAdmin = req.user.role === 'admin';
    const isCurrentAssignee = task.assignedTo.toString() === userId;

    if (!isProjectCreator && !isAdmin && !isCurrentAssignee) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to reassign this task"
      });
    }

    const previousAssignee = task.assignedTo;
    task.assignedTo = assignedTo;
    await task.save();

    // Log assignment activity
    await TaskActivityEvent.create({
      taskId: task._id,
      userId,
      eventType: 'reassigned',
      comment: `Task reassigned from user ${previousAssignee} to user ${assignedTo}`
    });

    const updatedTask = await Task.findById(taskId)
      .populate('assignedTo', 'name email avatar');

    res.status(200).json({
      success: true,
      message: "Task assigned successfully",
      task: updatedTask
    });

  } catch (err) {
    console.error('Error assigning task:', err);
    res.status(500).json({
      success: false,
      message: `Error assigning task: ${err.message}`
    });
  }
};

// Get task details with activities
export const getTaskDetails = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    const task = await Task.findById(taskId)
      .populate('assignedTo', 'name email avatar skills')
      .populate('projectId', 'projectName description teamName');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    // Check access
    const project = await Project.findById(task.projectId);
    const hasAccess = 
      project.createdBy.toString() === userId ||
      task.assignedTo._id.toString() === userId ||
      project.team.some(member => member.toString() === userId);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Access denied to this task"
      });
    }

    // Get activity history
    const activities = await TaskActivityEvent.find({ taskId })
      .populate('userId', 'name email')
      .sort({ timestamp: -1 })
      .limit(50);

    // Calculate efficiency
    const efficiency = task.estimatedTime > 0 
      ? (task.totalFocusTime / task.estimatedTime) * 100 
      : 0;

    res.status(200).json({
      success: true,
      task,
      activities,
      statistics: {
        efficiency: efficiency.toFixed(2),
        totalFocusTime: task.totalFocusTime,
        estimatedTime: task.estimatedTime,
        proofCount: task.proofUploads.length
      }
    });
  } catch (err) {
    console.error('Error fetching task details:', err);
    res.status(500).json({
      success: false,
      message: `Error fetching task details: ${err.message}`
    });
  }
};

// Update task grading metadata
export const updateTaskGrading = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { gradingMeta } = req.body;
    const userId = req.user.id;

    // Check if user is teacher/admin
    const user = await User.findById(userId);
    if (user.role !== 'admin' && user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: "Only teachers/admins can update task grading"
      });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    // Update grading metadata
    task.gradingMeta = { ...task.gradingMeta, ...gradingMeta };
    await task.save();

    res.status(200).json({
      success: true,
      message: "Task grading updated successfully",
      gradingMeta: task.gradingMeta
    });
  } catch (err) {
    console.error('Error updating task grading:', err);
    res.status(500).json({
      success: false,
      message: `Error updating task grading: ${err.message}`
    });
  }
};

export default {
  getTasks,
  createTask,
  updateTaskStatus,
  updateTaskTime,
  uploadProof,
  updateTaskFlags,
  deleteTask,
  assignTask,
  getTaskDetails,
  updateTaskGrading
};