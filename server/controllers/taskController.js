// taskController.js - OPTIMIZED VERSION
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

// Helper to calculate if task is overdue
const calculateIsOverdue = (task) => {
  if (!task.deadline) return false;
  return new Date(task.deadline) < new Date() && task.status !== 'completed';
};

// Helper to calculate days until deadline
const calculateDaysUntilDeadline = (task) => {
  if (!task.deadline) return 0;
  const days = Math.ceil((new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24));
  return days < 0 ? 0 : days;
};

// Helper to enrich a single task with metrics
const enrichTaskWithMetrics = (task) => {
  if (!task) return null;
  
  const efficiency = calculateTaskEfficiency(task);
  const riskScore = calculateTaskRisk(task);
  const statusWeight = getStatusWeight(task.status);
  const isOverdue = calculateIsOverdue(task);
  const daysUntilDeadline = calculateDaysUntilDeadline(task);
  
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
      isOverdue,
      daysUntilDeadline
    }
  };
};

// Helper to enrich multiple tasks with metrics
const enrichTasksWithMetrics = (tasks) => {
  if (!tasks || !Array.isArray(tasks)) return [];
  return tasks.map(task => enrichTaskWithMetrics(task));
};

// Common function to calculate summary metrics
const calculateSummaryMetrics = (enrichedTasks) => {
  const totalTasks = enrichedTasks.length;
  const completedTasks = enrichedTasks.filter(t => t.status === 'completed').length;
  const activeTasks = enrichedTasks.filter(t => t.status === 'active').length;
  const totalRiskScore = enrichedTasks.reduce((sum, task) => sum + (task.metrics.riskScore || 0), 0);
  const averageRiskScore = totalTasks > 0 ? totalRiskScore / totalTasks : 0;
  const totalStatusWeight = enrichedTasks.reduce((sum, task) => sum + (task.metrics.statusWeight || 0), 0);
  const weightedProgress = totalTasks > 0 ? (totalStatusWeight / totalTasks) * 100 : 0;

  return {
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
  };
};

// Common error handler
const handleError = (res, err, context) => {
  console.error(`Error in ${context}:`, err);
  res.status(500).json({ 
    success: false,
    message: `Error ${context}: ${err.message}` 
  });
};

// Get all tasks for a project WITH METRICS
export const getTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;
    
    // Check if project exists and user has access
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }
    
    if (project.createdBy.toString() !== userId && 
        !project.team.some(member => member.toString() === userId)) {
      return res.status(403).json({
        success: false,
        message: "Access denied to project"
      });
    }
    
    const tasks = await Task.find({ projectId })
      .populate('assignedTo', 'name email avatar')
      .sort({ deadline: 1 })
      .lean();

    const enrichedTasks = enrichTasksWithMetrics(tasks);
    const metrics = calculateSummaryMetrics(enrichedTasks);

    res.status(200).json({ 
      success: true,
      tasks: enrichedTasks,
      metrics
    });
  } catch (err) {
    handleError(res, err, 'fetching tasks');
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
    
    const userId = req.user.id;

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

    // Check if assigned user is in project team
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
        noProof: true,
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
    handleError(res, err, 'creating task');
  }
};

// Update task status (FIXED: No major issues)
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

    // Check access: user must be creator, assigned to task, or team member
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
    handleError(res, err, 'updating task status');
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
    
    if (totalLoggedTime > (estimatedTime * 2)) {
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

    const enrichedTask = enrichTaskWithMetrics(updatedTask);

    res.status(200).json({
      success: true,
      message: "Task time updated successfully",
      totalFocusTime: task.totalFocusTime,
      task: enrichedTask
    });
  } catch (err) {
    handleError(res, err, 'updating task time');
  }
};

// Upload proof for task (FIXED: No major issues)
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

    const enrichedTask = enrichTaskWithMetrics(updatedTask);

    res.status(200).json({
      success: true,
      message: "Proof uploaded successfully",
      proofUploads: task.proofUploads,
      task: enrichedTask
    });
  } catch (err) {
    handleError(res, err, 'uploading proof');
  }
};

// Update task flags (FIXED: No major issues)
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

    // Check if user is teacher/admin
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

    const enrichedTask = enrichTaskWithMetrics(updatedTask);

    res.status(200).json({
      success: true,
      message: "Task flags updated successfully",
      flags: task.flags,
      task: enrichedTask
    });
  } catch (err) {
    handleError(res, err, 'updating task flags');
  }
};

// Delete task (FIXED: No major issues)
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
    handleError(res, err, 'deleting task');
  }
};

// Assign/reassign task (FIXED: User role check)
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
    const user = await User.findById(userId);

    const isProjectCreator = project.createdBy.toString() === userId;
    const isAdmin = user.role === 'admin'; // FIXED: Get user from DB
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

    const enrichedTask = enrichTaskWithMetrics(updatedTask);

    res.status(200).json({
      success: true,
      message: "Task assigned successfully",
      task: enrichedTask
    });

  } catch (err) {
    handleError(res, err, 'assigning task');
  }
};

// Get task details with activities AND METRICS (FIXED: Use helper functions)
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

    // Calculate metrics using helper functions
    const efficiency = calculateTaskEfficiency(task);
    const riskScore = calculateTaskRisk(task);
    const statusWeight = getStatusWeight(task.status);
    const isOverdue = calculateIsOverdue(task);
    const daysUntilDeadline = calculateDaysUntilDeadline(task);

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
        daysUntilDeadline,
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
    handleError(res, err, 'fetching task details');
  }
};

// Update task grading metadata (FIXED: No major issues)
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

    const enrichedTask = enrichTaskWithMetrics(updatedTask);

    res.status(200).json({
      success: true,
      message: "Task grading updated successfully",
      gradingMeta: task.gradingMeta,
      task: enrichedTask
    });
  } catch (err) {
    handleError(res, err, 'updating task grading');
  }
};

// Get tasks with advanced filtering and metrics for a project
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
      tasks = tasks.filter(task => calculateIsOverdue(task));
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
    handleError(res, err, 'fetching filtered tasks');
  }
};

// Get user's tasks across all projects with metrics
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
    const overdueTasks = allUserTasks.filter(t => calculateIsOverdue(t)).length;
    
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
    handleError(res, err, 'fetching user tasks');
  }
};

// Get all tasks across all projects for the current user
export const getAllTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 1. Get all projects the user has access to
    const userProjects = await Project.find({
      $or: [
        { createdBy: userId },
        { team: { $in: [userId] } }
      ]
    }).select('_id projectName');

    if (!userProjects || userProjects.length === 0) {
      return res.status(200).json({ 
        success: true,
        tasks: [],
        metrics: {
          totalTasks: 0,
          completedTasks: 0,
          activeTasks: 0,
          averageRiskScore: 0,
          weightedProgress: 0,
          summary: {
            highRiskTasks: 0,
            mediumRiskTasks: 0,
            lowRiskTasks: 0,
            overdueTasks: 0,
            tasksWithProof: 0
          },
          projectBreakdown: {}
        }
      });
    }

    const projectIds = userProjects.map(project => project._id);
    
    // 2. Get all tasks from these projects
    const tasks = await Task.find({ 
      projectId: { $in: projectIds }
    })
    .populate('assignedTo', 'name email avatar')
    .populate('projectId', 'projectName')
    .sort({ deadline: 1 })
    .lean();

    // 3. Enrich tasks with metrics
    const enrichedTasks = enrichTasksWithMetrics(tasks);

    // 4. Calculate summary statistics
    const metrics = calculateSummaryMetrics(enrichedTasks);

    // 5. Calculate project breakdown
    const projectBreakdown = {};
    userProjects.forEach(project => {
      const projectTasks = enrichedTasks.filter(t => 
        t.projectId && t.projectId._id.toString() === project._id.toString()
      );
      const projectCompleted = projectTasks.filter(t => t.status === 'completed').length;
      
      projectBreakdown[project._id] = {
        projectName: project.projectName,
        totalTasks: projectTasks.length,
        completedTasks: projectCompleted,
        completionRate: projectTasks.length > 0 ? (projectCompleted / projectTasks.length) * 100 : 0,
        highRiskTasks: projectTasks.filter(t => t.metrics.riskScore >= 4).length,
        overdueTasks: projectTasks.filter(t => t.metrics.isOverdue).length
      };
    });

    // 6. Calculate user-specific metrics
    const userAssignedTasks = enrichedTasks.filter(t => 
      t.assignedTo && t.assignedTo._id.toString() === userId
    );
    const userTasksCount = userAssignedTasks.length;
    const userCompletedTasks = userAssignedTasks.filter(t => t.status === 'completed').length;
    const userOverdueTasks = userAssignedTasks.filter(t => t.metrics.isOverdue).length;
    
    // 7. Calculate efficiency distribution
    const efficiencyDistribution = {
      rushed: enrichedTasks.filter(t => t.metrics.efficiency < 50).length,
      optimal: enrichedTasks.filter(t => t.metrics.efficiency >= 50 && t.metrics.efficiency <= 120).length,
      overworked: enrichedTasks.filter(t => t.metrics.efficiency > 120).length
    };

    // Add additional metrics
    const enhancedMetrics = {
      ...metrics,
      userSpecific: {
        assignedTasks: userTasksCount,
        completedTasks: userCompletedTasks,
        completionRate: userTasksCount > 0 ? (userCompletedTasks / userTasksCount) * 100 : 0,
        overdueTasks: userOverdueTasks,
        efficiency: userTasksCount > 0 ? 
          userAssignedTasks.reduce((sum, task) => sum + (task.metrics.efficiency || 0), 0) / userTasksCount : 0
      },
      summary: {
        ...metrics.summary,
        efficiencyDistribution
      },
      projectBreakdown,
      accessInfo: {
        totalProjects: userProjects.length,
        projectNames: userProjects.map(p => p.projectName)
      }
    };

    res.status(200).json({ 
      success: true,
      tasks: enrichedTasks,
      metrics: enhancedMetrics
    });
  } catch (err) {
    handleError(res, err, 'fetching all tasks');
  }
};

// Get all tasks with filtering options
export const getAllTasksWithFilters = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      status, 
      riskLevel, 
      hasProof, 
      isOverdue,
      assignedTo,
      projectId,
      sortBy = 'deadline',
      sortOrder = 'asc',
      page = 1,
      limit = 50,
      search
    } = req.query;

    // 1. Get all projects the user has access to
    const userProjects = await Project.find({
      $or: [
        { createdBy: userId },
        { team: { $in: [userId] } }
      ]
    }).select('_id projectName');

    if (!userProjects || userProjects.length === 0) {
      return res.status(200).json({ 
        success: true,
        tasks: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          totalTasks: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false
        },
        filters: req.query
      });
    }

    const projectIds = userProjects.map(project => project._id);
    
    // 2. Build query
    const query = { projectId: { $in: projectIds } };
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (assignedTo && assignedTo !== 'all') {
      query.assignedTo = assignedTo;
    }
    
    if (projectId && projectId !== 'all') {
      query.projectId = projectId;
    }
    
    if (search) {
      query.$or = [
        { taskTitle: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // 3. Get tasks with pagination
    const skip = (page - 1) * limit;
    
    let tasks = await Task.find(query)
      .populate('assignedTo', 'name email avatar')
      .populate('projectId', 'projectName')
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // 4. Apply computed filters
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
      tasks = tasks.filter(task => calculateIsOverdue(task));
    }

    // 5. Sort tasks
    const sortOptions = {
      deadline: (a, b) => new Date(a.deadline) - new Date(b.deadline),
      'deadline-desc': (a, b) => new Date(b.deadline) - new Date(a.deadline),
      risk: (a, b) => calculateTaskRisk(b) - calculateTaskRisk(a),
      'risk-desc': (a, b) => calculateTaskRisk(a) - calculateTaskRisk(b),
      efficiency: (a, b) => calculateTaskEfficiency(a) - calculateTaskEfficiency(b),
      'efficiency-desc': (a, b) => calculateTaskEfficiency(b) - calculateTaskEfficiency(a),
      updatedAt: (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
      'updatedAt-desc': (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt)
    };
    
    const sortFunc = sortOptions[`${sortBy}${sortOrder === 'desc' ? '-desc' : ''}`] || sortOptions.deadline;
    tasks.sort(sortFunc);

    // 6. Get total count for pagination
    const totalTasks = await Task.countDocuments(query);

    // 7. Enrich tasks with metrics
    const enrichedTasks = enrichTasksWithMetrics(tasks);

    // 8. Calculate summary
    const summaryMetrics = calculateSummaryMetrics(enrichedTasks);

    res.status(200).json({
      success: true,
      tasks: enrichedTasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalTasks,
        totalPages: Math.ceil(totalTasks / limit),
        hasNextPage: page < Math.ceil(totalTasks / limit),
        hasPrevPage: page > 1
      },
      filters: {
        status,
        riskLevel,
        hasProof,
        isOverdue,
        assignedTo,
        projectId,
        sortBy,
        sortOrder,
        search,
        limit
      },
      summary: summaryMetrics.summary
    });
  } catch (err) {
    handleError(res, err, 'fetching all tasks with filters');
  }
};

// Export all functions (FIXED: Add missing functions)
export default {
  getTasks,
  getAllTasks,           // ADDED
  getAllTasksWithFilters, // ADDED
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
  getUserTasks         
};