import Task from '../models/tasks.js';
import Project from '../models/projects.js';
import User from '../models/user.js';
import TaskActivityEvent from '../models/taskActivityEvent.js';

// Helper functions for derived metrics
const getStatusWeight = (status) => {
  switch (status) {
    case 'completed': return 1;
    case 'active': return 0.5;
    case 'paused': return 0.3;
    default: return 0; // not_started
  }
};

// Converts multiple behavioural flags into a single numerical risk score for a task
const calculateTaskRisk = (task) => {
  let risk = 0;
  
  // Ensure flags exist
  const flags = task.flags || {
    paddedTime: false,
    rushedCompletion: false,
    noProof: false,
    manualReviewRequired: false
  };

  if (flags.paddedTime) risk += 2;
  if (flags.rushedCompletion) risk += 2;
  if (flags.noProof) risk += 1;
  if (flags.manualReviewRequired) risk += 3;

  return risk;
};

// Helper to calculate task efficiency
const calculateTaskEfficiency = (task) => {
  const estimatedTime = task.estimatedTime || 0;
  const totalFocusTime = task.totalFocusTime || 0;
  
  if (estimatedTime <= 0) return 0;
  
  return (totalFocusTime / estimatedTime) * 100;
};

// Helper to enrich a single task with metrics
const enrichTaskWithMetrics = (task) => {
  if (!task) return null;
  
  const efficiency = calculateTaskEfficiency(task);
  const riskScore = calculateTaskRisk(task);
  const statusWeight = getStatusWeight(task.status);
  
  return {
    ...task,
    _id: task._id,
    metrics: {
      efficiency: Number(efficiency.toFixed(2)),
      riskScore,
      statusWeight,
      statusWeightPercentage: statusWeight * 100,
      hasProof: task.proofUploads && task.proofUploads.length > 0,
      proofCount: task.proofUploads ? task.proofUploads.length : 0,
      isOverdue: task.deadline ? new Date(task.deadline) < new Date() && task.status !== 'completed' : false,
      daysUntilDeadline: task.deadline ? 
        Math.ceil((new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : 0
    }
  };
};

// Helper to enrich multiple tasks with metrics
const enrichTasksWithMetrics = (tasks) => {
  if (!tasks || !Array.isArray(tasks)) return [];
  
  return tasks.map(task => enrichTaskWithMetrics(task));
};

// Get all tasks for a project WITH METRICS
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

    // Enrich tasks with metrics
    const enrichedTasks = enrichTasksWithMetrics(tasks);

    // Calculate summary statistics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const activeTasks = tasks.filter(t => t.status === 'active').length;
    const totalRiskScore = enrichedTasks.reduce((sum, task) => sum + (task.metrics.riskScore || 0), 0);
    const averageRiskScore = totalTasks > 0 ? totalRiskScore / totalTasks : 0;
    const totalStatusWeight = enrichedTasks.reduce((sum, task) => sum + (task.metrics.statusWeight || 0), 0);
    const weightedProgress = totalTasks > 0 ? (totalStatusWeight / totalTasks) * 100 : 0;

    res.status(200).json({ 
      success: true,
      tasks: enrichedTasks,
      metrics: {
        totalTasks,
        completedTasks,
        activeTasks,
        averageRiskScore: Number(averageRiskScore.toFixed(2)),
        weightedProgress: Number(weightedProgress.toFixed(2)),
        summary: {
          highRiskTasks: enrichedTasks.filter(t => t.metrics.riskScore >= 4).length,
          mediumRiskTasks: enrichedTasks.filter(t => t.metrics.riskScore >= 2 && t.metrics.riskScore < 4).length,
          lowRiskTasks: enrichedTasks.filter(t => t.metrics.riskScore < 2).length,
          overdueTasks: enrichedTasks.filter(t => t.metrics.isOverdue).length,
          tasksWithProof: enrichedTasks.filter(t => t.metrics.hasProof).length
        }
      }
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
      description: description || '',
      assignedTo,
      deadline: new Date(deadline),
      estimatedTime, // in seconds
      status: 'not_started',
      tags: tags || [],
      flags: {
        paddedTime: false,
        rushedCompletion: false,
        noProof: true, // Initially true since no proof uploaded yet
        manualReviewRequired: false
      },
      gradingMeta: {
        allowPeerReview: true,
        qualityScore: 0,
        teacherOverrideScore: 0
      }
    });

    await task.save();

    // Get populated task
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email avatar')
      .lean();

    // Enrich task with metrics
    const enrichedTask = enrichTaskWithMetrics(populatedTask);

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
      task: enrichedTask
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
      
      // Also check if no proof uploaded
      if (!task.proofUploads || task.proofUploads.length === 0) {
        task.flags.noProof = true;
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
      .populate('assignedTo', 'name email avatar')
      .lean();

    // Enrich task with updated metrics
    const enrichedTask = enrichTaskWithMetrics(updatedTask);

    res.status(200).json({ 
      success: true,
      message: "Task status updated successfully", 
      task: enrichedTask,
      statusChange: {
        from: previousStatus,
        to: status,
        weightChange: {
          from: getStatusWeight(previousStatus),
          to: getStatusWeight(status)
        }
      }
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

    const updatedTask = await Task.findById(taskId)
      .populate('assignedTo', 'name email avatar')
      .lean();

    // Enrich task with updated metrics
    const enrichedTask = enrichTaskWithMetrics(updatedTask);

    res.status(200).json({
      success: true,
      message: "Task time updated successfully",
      totalFocusTime: task.totalFocusTime,
      task: enrichedTask
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

    const updatedTask = await Task.findById(taskId)
      .populate('assignedTo', 'name email avatar')
      .lean();

    // Enrich task with updated metrics
    const enrichedTask = enrichTaskWithMetrics(updatedTask);

    res.status(200).json({
      success: true,
      message: "Proof uploaded successfully",
      proofUploads: task.proofUploads,
      task: enrichedTask
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

    const updatedTask = await Task.findById(taskId)
      .populate('assignedTo', 'name email avatar')
      .lean();

    // Enrich task with updated metrics
    const enrichedTask = enrichTaskWithMetrics(updatedTask);

    res.status(200).json({
      success: true,
      message: "Task flags updated successfully",
      flags: task.flags,
      task: enrichedTask
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

    const project = await Project.findById(task.projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    // Check if user is project creator or admin
    if (project.createdBy.toString() !== userId) {
      const user = await User.findById(userId);
      if (user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: "Only project creator can delete tasks"
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
      .populate('assignedTo', 'name email avatar')
      .lean();

    // Enrich task with updated metrics
    const enrichedTask = enrichTaskWithMetrics(updatedTask);

    res.status(200).json({
      success: true,
      message: "Task assigned successfully",
      task: enrichedTask
    });

  } catch (err) {
    console.error('Error assigning task:', err);
    res.status(500).json({
      success: false,
      message: `Error assigning task: ${err.message}`
    });
  }
};

// Get task details with activities AND METRICS
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

    // Calculate metrics
    const efficiency = calculateTaskEfficiency(task);
    const riskScore = calculateTaskRisk(task);
    const statusWeight = getStatusWeight(task.status);
    
    // Check if overdue
    const now = new Date();
    const deadline = new Date(task.deadline);
    const isOverdue = deadline < now && task.status !== 'completed';
    const daysUntilDeadline = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

    res.status(200).json({
      success: true,
      task,
      activities,
      statistics: {
        efficiency: Number(efficiency.toFixed(2)),
        riskScore,
        statusWeight,
        statusWeightPercentage: statusWeight * 100,
        totalFocusTime: task.totalFocusTime,
        estimatedTime: task.estimatedTime,
        proofCount: task.proofUploads.length,
        isOverdue,
        daysUntilDeadline: daysUntilDeadline < 0 ? 0 : daysUntilDeadline,
        hasProof: task.proofUploads && task.proofUploads.length > 0,
        riskLevel: riskScore >= 4 ? 'high' : riskScore >= 2 ? 'medium' : 'low',
        flags: {
          paddedTime: task.flags?.paddedTime || false,
          rushedCompletion: task.flags?.rushedCompletion || false,
          noProof: task.flags?.noProof || false,
          manualReviewRequired: task.flags?.manualReviewRequired || false
        }
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
        message: "Only teachers can update task grading"
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

    const updatedTask = await Task.findById(taskId)
      .populate('assignedTo', 'name email avatar')
      .lean();

    // Enrich task with updated metrics
    const enrichedTask = enrichTaskWithMetrics(updatedTask);

    res.status(200).json({
      success: true,
      message: "Task grading updated successfully",
      gradingMeta: task.gradingMeta,
      task: enrichedTask
    });
  } catch (err) {
    console.error('Error updating task grading:', err);
    res.status(500).json({
      success: false,
      message: `Error updating task grading: ${err.message}`
    });
  }
};

// NEW: Get tasks with advanced filtering and metrics
export const getTasksWithFilter = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { 
      status, 
      riskLevel, 
      hasProof, 
      isOverdue,
      assignedTo,
      sortBy = 'deadline',
      sortOrder = 'asc',
      page = 1,
      limit = 20
    } = req.query;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }
    
    // Check access
    const userId = req.user.id;
    if (project.createdBy.toString() !== userId && 
        !project.team.some(member => member.toString() === userId)) {
      return res.status(403).json({
        success: false,
        message: "Access denied to project"
      });
    }
    
    // Build query
    const query = { projectId };
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (assignedTo && assignedTo !== 'all') {
      query.assignedTo = assignedTo;
    }
    
    // Get all tasks first to filter by computed metrics
    let tasks = await Task.find(query)
      .populate('assignedTo', 'name email avatar')
      .lean();
    
    // Apply computed filters
    if (riskLevel && riskLevel !== 'all') {
      tasks = tasks.filter(task => {
        const riskScore = calculateTaskRisk(task);
        if (riskLevel === 'high') return riskScore >= 4;
        if (riskLevel === 'medium') return riskScore >= 2 && riskScore < 4;
        if (riskLevel === 'low') return riskScore < 2;
        return true;
      });
    }
    
    if (hasProof === 'true') {
      tasks = tasks.filter(task => task.proofUploads && task.proofUploads.length > 0);
    } else if (hasProof === 'false') {
      tasks = tasks.filter(task => !task.proofUploads || task.proofUploads.length === 0);
    }
    
    if (isOverdue === 'true') {
      const now = new Date();
      tasks = tasks.filter(task => {
        const deadline = new Date(task.deadline);
        return deadline < now && task.status !== 'completed';
      });
    }
    
    // Sort tasks
    const sortFunctions = {
      deadline: (a, b) => new Date(a.deadline) - new Date(b.deadline),
      'deadline-desc': (a, b) => new Date(b.deadline) - new Date(a.deadline),
      risk: (a, b) => calculateTaskRisk(b) - calculateTaskRisk(a),
      'risk-desc': (a, b) => calculateTaskRisk(a) - calculateTaskRisk(b),
      efficiency: (a, b) => calculateTaskEfficiency(a) - calculateTaskEfficiency(b),
      'efficiency-desc': (a, b) => calculateTaskEfficiency(b) - calculateTaskEfficiency(a),
      status: (a, b) => getStatusWeight(b.status) - getStatusWeight(a.status),
      'status-desc': (a, b) => getStatusWeight(a.status) - getStatusWeight(b.status)
    };
    
    const sortFunc = sortFunctions[`${sortBy}${sortOrder === 'desc' ? '-desc' : ''}`] || sortFunctions.deadline;
    tasks.sort(sortFunc);
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedTasks = tasks.slice(startIndex, endIndex);
    
    // Enrich tasks with metrics
    const enrichedTasks = enrichTasksWithMetrics(paginatedTasks);
    
    // Calculate summary
    const totalTasks = tasks.length;
    const totalPages = Math.ceil(totalTasks / limit);
    
    res.status(200).json({
      success: true,
      tasks: enrichedTasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalTasks,
        totalPages,
        hasNextPage: endIndex < totalTasks,
        hasPrevPage: startIndex > 0
      },
      filters: {
        status,
        riskLevel,
        hasProof,
        isOverdue,
        assignedTo,
        sortBy,
        sortOrder
      }
    });
  } catch (err) {
    console.error('Error fetching filtered tasks:', err);
    res.status(500).json({
      success: false,
      message: `Error fetching tasks: ${err.message}`
    });
  }
};

// NEW: Get user's tasks across all projects with metrics
export const getUserTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      status, 
      projectId,
      limit = 50,
      page = 1 
    } = req.query;
    
    // Build query
    const query = { assignedTo: userId };
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (projectId && projectId !== 'all') {
      query.projectId = projectId;
    }
    
    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email avatar')
      .populate('projectId', 'projectName')
      .sort({ deadline: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();
    
    // Enrich tasks with metrics
    const enrichedTasks = enrichTasksWithMetrics(tasks);
    
    // Get user statistics
    const allUserTasks = await Task.find({ assignedTo: userId }).lean();
    
    const totalTasks = allUserTasks.length;
    const completedTasks = allUserTasks.filter(t => t.status === 'completed').length;
    const activeTasks = allUserTasks.filter(t => t.status === 'active').length;
    
    const totalRiskScore = allUserTasks.reduce((sum, task) => sum + calculateTaskRisk(task), 0);
    const averageRiskScore = totalTasks > 0 ? totalRiskScore / totalTasks : 0;
    
    const totalEfficiency = allUserTasks.reduce((sum, task) => {
      const efficiency = calculateTaskEfficiency(task);
      return sum + (isNaN(efficiency) ? 0 : efficiency);
    }, 0);
    const averageEfficiency = totalTasks > 0 ? totalEfficiency / totalTasks : 0;
    
    const now = new Date();
    const overdueTasks = allUserTasks.filter(t => {
      const deadline = new Date(t.deadline);
      return deadline < now && t.status !== 'completed';
    }).length;
    
    const tasksWithProof = allUserTasks.filter(t => t.proofUploads && t.proofUploads.length > 0).length;
    
    res.status(200).json({
      success: true,
      tasks: enrichedTasks,
      userMetrics: {
        totalTasks,
        completedTasks,
        activeTasks,
        overdueTasks,
        tasksWithProof,
        completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
        averageRiskScore: Number(averageRiskScore.toFixed(2)),
        averageEfficiency: Number(averageEfficiency.toFixed(2)),
        riskDistribution: {
          high: allUserTasks.filter(t => calculateTaskRisk(t) >= 4).length,
          medium: allUserTasks.filter(t => calculateTaskRisk(t) >= 2 && calculateTaskRisk(t) < 4).length,
          low: allUserTasks.filter(t => calculateTaskRisk(t) < 2).length
        }
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalTasks: allUserTasks.length,
        totalPages: Math.ceil(allUserTasks.length / limit)
      }
    });
  } catch (err) {
    console.error('Error fetching user tasks:', err);
    res.status(500).json({
      success: false,
      message: `Error fetching user tasks: ${err.message}`
    });
  }
};

// Export all functions
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
  updateTaskGrading,
  getTasksWithFilter,  // NEW
  getUserTasks         // NEW
};