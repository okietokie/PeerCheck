// taskController.js - OPTIMIZED VERSION
import Task from '../models/tasks.js';
import Project from '../models/projects.js';
import User from '../models/user.js';
import TaskActivityEvent from '../models/taskActivityEvent.js';
import { formatTimeAgo, getActionMessage, logActivity } from "./activityLogger.js";
import DeletedProjects from '../models/deletedProjectInfo.js';
import DeletedTaskInfo from '../models/deletedTaskInfo.js';


export const calculateTaskMetrics = (task) => { 
  // Calculate efficiency 
  const estimatedTime = task.estimatedTime || 1; 
  const focusTime = task.totalFocusTime || 0; 
  const efficiency = (focusTime / estimatedTime) * 100; 
  
  let efficiencyStatus = 'normal'; 
  let efficiencyLabel = 'Ideal'; 
  
  if (efficiency < 50) { 
    efficiencyStatus = 'low'; 
    efficiencyLabel = 'Rushed / Suspicious'; 
  } else if (efficiency >= 50 && efficiency < 80) { 
    efficiencyStatus = 'warning'; 
    efficiencyLabel = 'Below Ideal'; 
  } else if (efficiency >= 80 && efficiency <= 120) { 
    efficiencyStatus = 'good'; 
    efficiencyLabel = 'Ideal'; 
  } else if (efficiency > 120 && efficiency <= 200) { 
    efficiencyStatus = 'warning'; 
    efficiencyLabel = 'Slightly Padded'; 
  } else { 
    efficiencyStatus = 'high'; 
    efficiencyLabel = 'Padded Time'; 
  }
};
// Helper functions for derived metrics
const getStatusWeight = (status) => {
  switch (status) {
    case 'completed': return 1;
    case 'active': return 0.5;
    case 'paused': return 0.3;
    default: return 0; // not_started
  }
};

const calculateStatusWeight = (status) => {
  const weights = {
    'completed': 100,
    'active': 50,
    'paused': 30,
    'not_started': 0
  };
  return weights[status] || 0;
};

//individual task risk score
/**
 * system flags paddedTiem, rushedCompletion, noProof, manualReviewRequired
 * task risk weighing logic:
    riskScore =
    (paddedTime ? 2 : 0) +
    (rushedCompletion ? 2 : 0) +
    (noProof ? 1 : 0) +
    (manualReviewRequired ? 3 : 0)

//Combines multiple suspicious behaviors into a single risk number.
// Computes task and project risk scores to flag potential integrity issues

 */

const calculateTaskRisk = (task) => {
  // Ensure flags exist with defaults
  const flags = {
    paddedTime: false,
    rushedCompletion: false,
    noProof: false,
    manualReviewRequired: false,
    ...(task.flags || {})
  };
  
  // Calculate risk score based on flag severity
  const riskScore = 
    (flags.paddedTime ? 2 : 0) +
    (flags.rushedCompletion ? 2 : 0) +
    (flags.noProof ? 1 : 0) +
    (flags.manualReviewRequired ? 3 : 0);


  // Determine risk level based on score
  let riskLevel, riskLabel;
  
  if (riskScore >= 4) {
    riskLevel = 'high';
    riskLabel = 'High Risk';
  } else if (riskScore >= 2) {
    riskLevel = 'medium';
    riskLabel = 'Medium Risk';
  } else {
    riskLevel = 'low';
    riskLabel = 'Low Risk';
  }

  // Return comprehensive risk analysis
  return {
    riskScore,      // Numerical score (0-8)
    riskLevel,      // 'low' | 'medium' | 'high'
    riskLabel,      // Descriptive label
    flags,          // Original flags object
    hasRisk: riskScore > 0, // Boolean for quick checks
    flagCount: Object.values(flags).filter(Boolean).length // Number of active flags
  };
};

// Helper to calculate task efficiency
// Returns 0 if estimatedTime is 0 or less
const calculateTaskEfficiency = (task) => {
  const estimatedTime = task.estimatedTime || 0;
  const totalFocusTime = task.totalFocusTime || 0;
  
  if (estimatedTime <= 0) return 0;
  
  return (totalFocusTime / estimatedTime) * 100;
};

// Helper to calculate if task is overdue
// Returns false if no deadline
const calculateIsOverdue = (task) => {
  if (!task.deadline) return false;
  return new Date(task.deadline) < new Date() && task.status !== 'completed';
};

// Helper to calculate days until deadline
// Returns 0 if overdue or no deadline
const calculateDaysUntilDeadline = (task) => {
  if (!task.deadline) return 0;
  const days = Math.ceil((new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24));
  return days < 0 ? 0 : days;
};

// Helper to enrich a single task with metrics
//explanation: what enrichtaskwithmetrics does function: This function takes a task object as input and calculates various performance metrics for that task, such as efficiency, risk score, status weight, and whether the task is overdue. It then returns a new task object that includes these calculated metrics in a structured format under a "metrics" property.
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
    console.log("getTasks - userId", userId)
    
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

// Get tasks for a specific project with filters
export const getTasksWithFilter = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;
    const { status, riskLevel, hasProof, search } = req.query;
    
    // Check project access
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Project not found"
      });
    }
    
    const hasAccess = 
      project.createdBy.toString() === userId ||
      project.teamId?.members.some(member => member.toString() === userId);
    
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: "Access denied"
      });
    }
    
    // Build query
    let query = { projectId };
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (hasProof && hasProof !== 'all') {
      if (hasProof === 'true') {
        query['proofUploads.0'] = { $exists: true };
      } else {
        query['proofUploads.0'] = { $exists: false };
      }
    }
    
    // Search
    if (search) {
      query.$or = [
        { taskTitle: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email avatar')
      .populate('projectId', 'projectName')
      .lean();
    
    // Add metrics and filter by risk level
    let tasksWithMetrics = tasks.map(task => {
      const taskMetrics = calculateTaskMetrics(task);
      return {
        ...task,
        taskMetrics,
        metrics: {
          efficiency: taskMetrics.efficiency,
          riskScore: taskMetrics.risk.riskScore,
          isOverdue: taskMetrics.isOverdue,
          hasProof: taskMetrics.hasProof,
          proofCount: taskMetrics.proofCount,
          statusWeightPercentage: calculateStatusWeight(task.status),
          daysUntilDeadline: taskMetrics.daysUntilDeadline
        }
      };
    });
    
    // Filter by risk level
    if (riskLevel && riskLevel !== 'all') {
      tasksWithMetrics = tasksWithMetrics.filter(task => {
        const score = task.metrics.riskScore;
        if (riskLevel === 'high') return score >= 4;
        if (riskLevel === 'medium') return score >= 2 && score < 4;
        return score < 2;
      });
    }
    
    res.json({
      success: true,
      tasks: tasksWithMetrics,
      total: tasksWithMetrics.length
    });
  } catch (error) {
    console.error('Error getting filtered tasks:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get user's assigned tasks
export const getUserTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const tasks = await Task.find({ assignedTo: userId })
      .populate('projectId', 'projectName')
      .populate('assignedTo', 'name email avatar')
      .sort({ deadline: 1 })
      .lean();
    
    const tasksWithMetrics = tasks.map(task => {
      const taskMetrics = calculateTaskMetrics(task);
      return {
        ...task,
        taskMetrics,
        metrics: {
          efficiency: taskMetrics.efficiency,
          riskScore: taskMetrics.risk.riskScore,
          isOverdue: taskMetrics.isOverdue,
          hasProof: taskMetrics.hasProof,
          proofCount: taskMetrics.proofCount,
          statusWeightPercentage: calculateStatusWeight(task.status),
          daysUntilDeadline: taskMetrics.daysUntilDeadline
        }
      };
    });
    
    
    res.json({
      success: true,
      tasks: tasksWithMetrics,
      total: tasks.length
    });
  } catch (error) {
    console.error('Error getting user tasks:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get all tasks across all projects for the current user
export const getAllTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find all projects where user is a member or creator
    const projects = await Project.find({
      $or: [
        { createdBy: userId },
        { 'teamId.members': userId }
      ]
    }).select('_id projectName');
    
    const projectIds = projects.map(p => p._id);

    console.log(projectIds);

    // Find all tasks from these projects
    const tasks = await Task.find({
      $or: [
        { projectId: { $in: projectIds } }, // tasks in user's projects
        { assignedTo: userId },              // tasks directly assigned to user
        { assignedBy: userId }
      ]
    })
    .populate('projectId', 'projectName')
    .populate('assignedTo', 'name email avatar')
    .populate('assignedBy', 'name email avatar')
    .lean();

    const user = await User.findById(userId).select('name email avatar');
    
    // Add metrics to each task
    const tasksWithMetrics = tasks.map(task => {
      const taskMetrics = calculateTaskMetrics(task);
      return {
        ...task,
        taskMetrics,
        metrics: {
          efficiency: taskMetrics.efficiency,
          riskScore: taskMetrics.risk.riskScore,
          isOverdue: taskMetrics.isOverdue,
          hasProof: taskMetrics.hasProof,
          proofCount: taskMetrics.proofCount,
          statusWeightPercentage: calculateStatusWeight(task.status),
          daysUntilDeadline: taskMetrics.daysUntilDeadline
        }
      };
    });
    
    // Calculate summary metrics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const highRiskTasks = tasksWithMetrics.filter(t => t.metrics.riskScore >= 4).length;
    const tasksWithoutProof = tasksWithMetrics.filter(t => !t.metrics.hasProof).length;
    
    res.json({
      success: true,
      user: user,
      tasks: tasksWithMetrics,
      metrics: {
        totalTasks,
        completedTasks,
        highRiskTasks,
        tasksWithoutProof,
        summary: {
          highRiskTasks,
          completedTasks,
          totalTasks
        }
      }
    });
  } catch (error) {
    console.error('Error getting all tasks:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
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
// Create a new task
export const createTask = async (req, res) => {
  try {
    const { taskTitle, description, projectId, assignedTo, deadline, estimatedTime} = req.body;
    
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

    const selectedDate = new Date(deadline); // e.g., "2025-12-07"
    selectedDate.setHours(23, 59, 59, 999); //time is set to 11:59:59.999 PM


    // Create the task
    const task = new Task({
      projectId,
      taskTitle: taskTitle.trim(),
      description: description || '',
      assignedTo,
      assignedBy: userId,
      projectId: projectId,
      deadline: selectedDate,
      estimatedTime, // in seconds
      status: 'not_started',
      lastEventTime: new Date(),
      totalFocusTime: 0,
      proofUploads: [],
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
      eventType: 'task_created',
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


// Start a task 
export const startTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;


    const task = await Task.findById(taskId); //fetches the full mongoose DB object not plain js object
    if (!task) return res.status(404).json({ error: "Task not found" });
    
    // Check if user is assigned to this task
    if (task.assignedTo.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Not authorized to start this task" });
    }
    
    // Check if task can be started
    if (task.status === 'completed') {
      return res.status(400).json({ error: "Cannot start a completed task" });
    }
    const oldStatus = task.status;
    task.status = "active";
    task.lastEventTime = new Date();  //js Date object, represents the current date and time ("time right now in ISo format")
    await task.save();
    
    // Log activity
    await logActivity({
      taskId: task._id,
      userId,
      projectId: task.projectId,
      eventType: 'status_changed',
      metadata: {
        oldStatus: oldStatus,
        newStatus: 'active'
      }
    });
    
    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Pause a task - FIXED
export const pauseTask = async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user.id;
  
  try {
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });
    
    if (task.assignedTo.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Not authorized to pause this task" });
    }
    
    if (task.status !== "active") {
      return res.status(400).json({ error: "Task is not active" });
    }
    
    // Calculate elapsed time since last event
    const now = new Date();

    const lastEvent = task.lastEventTime 
      ? new Date(task.lastEventTime)
      : new Date();  // treat missing timestamp as now to avoid big jumps

    const elapsedSeconds = Math.floor((now - new Date(lastEvent)) / 1000);
    
    // Update focus time
    task.totalFocusTime += Math.max(elapsedSeconds, 0);
    task.status = "paused";
    task.lastEventTime = now;
    
    await task.save();
    
    // Log activity
    await logActivity({
      taskId: task._id,
      userId,
      projectId: task.projectId,
      eventType: 'status_changed',
      metadata: {
        oldStatus: 'active',
        newStatus: 'paused',
        elapsedTime: elapsedSeconds
      }
    });
    
    res.json({ 
      success: true, 
      totalFocusTime: task.totalFocusTime,
      elapsedTime: elapsedSeconds
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Resume task - FIXED
export const resumeTask = async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user.id;
  
  try {
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });
    
    if (task.assignedTo.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Not authorized to resume this task" });
    }
    
    if (task.status !== 'paused') {
      return res.status(400).json({ error: "Task is not paused" });
    }
    
    task.status = "active";
    task.lastEventTime = new Date();
    await task.save();
    
    // Log activity
    await logActivity({
      taskId: task._id,
      userId,
      projectId: task.projectId,
      eventType: 'status_changed',
      metadata: {
        oldStatus: 'paused',
        newStatus: 'active'
      }
    });
    
    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Complete task - FIXED
export const completeTask = async (req, res) => {
  const { taskId } = req.params;
  const userId = req.user.id;
  
  try {
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });
    
    if (task.assignedTo.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Not authorized to complete this task" });
    }
    
    // If task was active, add remaining time
    if (task.status === "active") {
      const now = new Date();
      const lastEvent = task.lastEventTime || task.updatedAt;
      const elapsedSeconds = Math.floor((now - new Date(lastEvent)) / 1000);
      task.totalFocusTime += Math.max(elapsedSeconds, 0);
    }
    
    task.status = "completed";
    task.lastEventTime = new Date();
    await task.save();
    
    // Log activity
    await logActivity({
      taskId: task._id,
      userId,
      projectId: task.projectId,
      eventType: 'status_changed',
      metadata: {
        oldStatus: task.status,
        newStatus: 'completed'
      }
    });
    
    res.json({ 
      success: true, 
      totalFocusTime: task.totalFocusTime,
      task
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    console.log("to be deleteTask", task);

    const project = await Project.findById(task.projectId._id);
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
          message: "Notice: Only project creator can delete tasks"
        });
      }
    }
    

    // Save deleted task info
    await DeletedTaskInfo.create({
      deletedTaskName: task.taskTitle,
      taskID: task._id,
      projectID: task.projectId,
      assignedTo: task.assignedTo
    });

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


export const assignTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { assignedTo, action = 'assign' } = req.body;
    const userId = req.user.id;

    // Find task with both old and new assignee populated
    const task = await Task.findById(taskId)
      .populate('assignedTo', 'name email')
      .populate('projectId', 'teamId createdBy');
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found"
      });
    }

    // Check permissions
    const project = task.projectId;
    const isCreator = project.createdBy.toString() === userId;
    const isTeacher = req.user.role === 'teacher';
    const isAdmin = req.user.role === 'admin';
    
    if (!isCreator && !isTeacher && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to assign/unassign tasks"
      });
    }

    const oldAssignee = task.assignedTo;
    const oldAssigneeId = task.assignedTo?._id?.toString();
    let eventType = 'task_assigned';
    let message = 'Task assigned successfully';

    if (action === 'unassign' || !assignedTo) {
      // Unassign task
      task.assignedTo = null;
      eventType = 'task_unassigned';
      message = 'Task unassigned successfully';
    } else {
      // Assign task to someone
      // Validate the new assignee exists
      const newUser = await User.findById(assignedTo);
      if (!newUser) {
        return res.status(404).json({
          success: false,
          error: "User not found"
        });
      }

      // Validate the new assignee is in the project team
      const isTeamMember = project.teamId?.members.includes(assignedTo);
      const isProjectCreator = project.createdBy.toString() === assignedTo;
      
      if (!isTeamMember && !isProjectCreator) {
        return res.status(400).json({
          success: false,
          error: "Assignee must be a project team member or creator"
        });
      }
      
      // Check if trying to assign to current assignee
      if (oldAssigneeId === assignedTo) {
        return res.status(400).json({
          success: false,
          error: "Task is already assigned to this user"
        });
      }
      
      task.assignedTo = assignedTo;
    }

    await task.save();

    // Log activity
    await logActivity({
      taskId,
      userId,
      projectId: task.projectId._id,
      eventType,
      metadata: {
        oldAssignee: oldAssigneeId,
        oldAssigneeName: oldAssignee?.name,
        newAssignee: task.assignedTo,
        newAssigneeName: task.assignedTo ? (await User.findById(task.assignedTo)).name : null
      }
    });

    // Get updated task with populated fields
    const updatedTask = await Task.findById(taskId)
      .populate('assignedTo', 'name email avatar')
      .populate('projectId', 'projectName');

    // 🔥 CRITICAL: Emit real-time updates if using WebSockets
    if (process.env.ENABLE_WEBSOCKETS === 'true') {
      // Notify old assignee if exists
      if (oldAssigneeId) {
        io.to(`user_${oldAssigneeId}`).emit('task_removed', {
          taskId: task._id,
          message: 'Task reassigned to another user'
        });
      }
      
      // Notify new assignee if assigned
      if (task.assignedTo) {
        io.to(`user_${task.assignedTo}`).emit('task_added', {
          task: updatedTask,
          message: 'New task assigned to you'
        });
      }
    }

    res.json({
      success: true,
      task: updatedTask,
      message,
      oldAssigneeId,
      newAssigneeId: task.assignedTo
    });
  } catch (error) {
    console.error('Error assigning task:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};






// Update task details (title, description, etc)
export const updateTaskDetails = async (req, res) => {
  try {
    const { taskId } = req.params;
    const updates = req.body;
    const userId = req.user.id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found"
      });
    }

    // Check permissions - only creator, assignee, or admin can edit
    const project = await Project.findById(task.projectId);
    const isCreator = project.createdBy.toString() === userId;
    const isAssignee = task.assignedTo.toString() === userId;
    const isAdmin = req.user.role === 'admin';
    
    if (!isCreator && !isAssignee && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to edit this task"
      });
    }

    const changes = [];
    
    // Track changes for activity log
    if (updates.taskTitle && updates.taskTitle !== task.taskTitle) {
      changes.push({
        field: 'title',
        oldValue: task.taskTitle,
        newValue: updates.taskTitle
      });
      task.taskTitle = updates.taskTitle;
    }
    
    if (updates.description && updates.description !== task.description) {
      changes.push({
        field: 'description',
        oldValue: task.description,
        newValue: updates.description
      });
      task.description = updates.description;
    }
    
    if (updates.deadline) {
      const newDeadline = new Date(updates.deadline);
      if (newDeadline.getTime() !== task.deadline.getTime()) {
        changes.push({
          field: 'deadline',
          oldValue: task.deadline,
          newValue: newDeadline
        });
        task.deadline = newDeadline;
      }
    }
    
    if (updates.estimatedTime) {
      const newEstimatedTime = parseInt(updates.estimatedTime) * 60;
      if (newEstimatedTime !== task.estimatedTime) {
        changes.push({
          field: 'estimatedTime',
          oldValue: task.estimatedTime,
          newValue: newEstimatedTime
        });
        task.estimatedTime = newEstimatedTime;
      }
    }
    
    await task.save();

    // Log each change as separate activity
    for (const change of changes) {
      await logActivity({
        taskId,
        userId,
        projectId: task.projectId,
        eventType: 'task_edited',
        metadata: {
          ...change,
          description: `Changed ${change.field}`
        }
      });
    }

    const updatedTask = await Task.findById(taskId)
      .populate('assignedTo', 'name email avatar')
      .populate('projectId', 'projectName');

    res.json({
      success: true,
      task: updatedTask,
      message: "Task updated successfully",
      changes: changes.length
    });
  } catch (error) {
    console.error('Error updating task details:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Get task activity logs
export const getTaskActivityLogs = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    // Check task access
    const task = await Task.findById(taskId)
      .populate('projectId', 'teamId createdBy');
    
    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found"
      });
    }

    // Check permissions
    const project = task.projectId;
    const hasAccess = 
      task.assignedTo.toString() === userId ||
      project.createdBy.toString() === userId ||
      project.teamId?.members.includes(userId);
    
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: "Access denied to task activity"
      });
    }

    // Get activity logs
    const logs = await TaskActivityEvent.find({ taskId })
      .populate('userId', 'name email avatar')
      .sort({ timestamp: -1 })
      .limit(50)
      .lean();

    // Format for frontend
    const formattedLogs = logs.map(log => {
      const actionMessage = getActionMessage(log);
      const user = log.userId || {};
      
      return {
        id: log._id,
        action: actionMessage,
        user: {
          name: user.name || log.userName || 'System',
          email: user.email || log.userEmail,
          avatar: user.avatar || log.userAvatar
        },
        time: formatTimeAgo(log.timestamp),
        timestamp: log.timestamp,
        eventType: log.eventType,
        metadata: log.metadata,
        isSystemEvent: !log.userId && !log.userName
      };
    });

    res.json({
      success: true,
      logs: formattedLogs,
      taskId,
      total: formattedLogs.length
    });
  } catch (error) {
    console.error('Error getting activity logs:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
// Update deadline
export const updateTaskDeadline = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { deadline } = req.body;
    const userId = req.user.id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found"
      });
    }

    // Check permissions
    const project = await Project.findById(task.projectId);
    const isCreator = project.createdBy.toString() === userId;
    const isAssignee = task.assignedTo.toString() === userId;
    const isAdmin = req.user.role === 'admin';
    
    if (!isCreator && !isAssignee && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to update deadline"
      });
    }

    const oldDeadline = task.deadline;
    const newDeadline = new Date(deadline);
    
    if (newDeadline.getTime() === oldDeadline.getTime()) {
      return res.status(400).json({
        success: false,
        error: "New deadline is the same as current deadline"
      });
    }

    task.deadline = newDeadline;
    await task.save();

    // Log activity
    await logActivity({
      taskId,
      userId,
      projectId: task.projectId,
      eventType: 'deadline_updated',
      metadata: {
        oldDeadline,
        newDeadline
      }
    });

    res.json({
      success: true,
      task,
      message: "Deadline updated successfully"
    });
  } catch (error) {
    console.error('Error updating deadline:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update grading
export const updateTaskGrading = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { score, overrideType, comment } = req.body; // overrideType: 'teacher' or 'peer'
    const userId = req.user.id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found"
      });
    }

    // Validate score
    const numericScore = parseFloat(score);
    if (isNaN(numericScore) || numericScore < 0 || numericScore > 10) {
      return res.status(400).json({
        success: false,
        error: "Score must be between 0 and 10"
      });
    }

    let eventType = 'grading_updated';
    const oldScore = task.gradingMeta?.teacherOverrideScore || 
                     task.gradingMeta?.qualityScore || 
                     null;

    // Check permissions based on override type
    if (overrideType === 'teacher') {
      // Only teacher or admin can do teacher override
      const isTeacher = req.user.role === 'teacher';
      const isAdmin = req.user.role === 'admin';
      
      if (!isTeacher && !isAdmin) {
        return res.status(403).json({
          success: false,
          error: "Only teachers or admins can override grades"
        });
      }
      
      if (!task.gradingMeta) task.gradingMeta = {};
      task.gradingMeta.teacherOverrideScore = numericScore;
      eventType = 'grade_override';
      
    } else if (overrideType === 'peer') {
      // Check if user is in the project team (for peer review)
      const project = await Project.findById(task.projectId);
      const isTeamMember = project.teamId?.members.includes(userId);
      
      if (!isTeamMember && userId !== task.assignedTo.toString()) {
        return res.status(403).json({
          success: false,
          error: "Only team members can submit peer reviews"
        });
      }
      
      if (!task.gradingMeta) task.gradingMeta = {};
      // Store peer reviews differently - you might want an array for multiple reviews
      task.gradingMeta.lastPeerReviewScore = numericScore;
      task.gradingMeta.lastPeerReviewBy = userId;
      task.gradingMeta.lastPeerReviewAt = new Date();
      
    } else {
      // Regular quality score update (by task assignee)
      if (task.assignedTo.toString() !== userId) {
        return res.status(403).json({
          success: false,
          error: "Only task assignee can update quality score"
        });
      }
      
      if (!task.gradingMeta) task.gradingMeta = {};
      task.gradingMeta.qualityScore = numericScore;
    }

    await task.save();

    // Log activity
    await logActivity({
      taskId,
      userId,
      projectId: task.projectId,
      eventType,
      metadata: {
        oldScore,
        newScore: numericScore,
        overrideType,
        comment
      }
    });

    res.json({
      success: true,
      task,
      message: "Grading updated successfully"
    });
  } catch (error) {
    console.error('Error updating grading:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Add comment
export const addTaskComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { comment } = req.body;
    const userId = req.user.id;

    if (!comment || comment.trim() === '') {
      return res.status(400).json({
        success: false,
        error: "Comment cannot be empty"
      });
    }

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found"
      });
    }

    // Check if user has access to this task
    const project = await Project.findById(task.projectId);
    const hasAccess = 
      task.assignedTo.toString() === userId ||
      project.createdBy.toString() === userId ||
      project.teamId?.members.includes(userId);
    
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to comment on this task"
      });
    }

    // You might want to store comments in a separate collection
    // For now, we'll just log the activity
    
    // Log activity
    await logActivity({
      taskId,
      userId,
      projectId: task.projectId,
      eventType: 'comment_added',
      metadata: {
        comment: comment.trim(),
        timestamp: new Date()
      }
    });

    res.json({
      success: true,
      message: "Comment added successfully",
      comment: {
        text: comment.trim(),
        userId,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Delete proof
export const deleteProof = async (req, res) => {
  try {
    const { taskId, proofId } = req.params;
    const userId = req.user.id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found"
      });
    }

    // Check permissions - only proof uploader, task assignee, or admin
    const proofIndex = task.proofUploads.findIndex(
      proof => proof._id.toString() === proofId
    );
    
    if (proofIndex === -1) {
      return res.status(404).json({
        success: false,
        error: "Proof not found"
      });
    }

    const proof = task.proofUploads[proofIndex];
    const isProofUploader = proof.uploadedBy?.toString() === userId;
    const isAssignee = task.assignedTo.toString() === userId;
    const isAdmin = req.user.role === 'admin';
    const project = await Project.findById(task.projectId);
    const isCreator = project.createdBy.toString() === userId;
    
    if (!isProofUploader && !isAssignee && !isAdmin && !isCreator) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to delete this proof"
      });
    }

    // Remove proof
    const deletedProof = task.proofUploads.splice(proofIndex, 1)[0];
    
    // Update noProof flag if no proofs left
    if (task.proofUploads.length === 0) {
      task.flags.noProof = true;
    }
    
    await task.save();

    // Log activity
    await logActivity({
      taskId,
      userId,
      projectId: task.projectId,
      eventType: 'proof_deleted',
      metadata: {
        filename: deletedProof.filename,
        proofId: deletedProof._id
      }
    });

    res.json({
      success: true,
      message: "Proof deleted successfully",
      proof: deletedProof
    });
  } catch (error) {
    console.error('Error deleting proof:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update task flags
export const updateTaskFlags = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { flags } = req.body; // { paddedTime: true, rushedCompletion: false, etc }
    const userId = req.user.id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found"
      });
    }

    // Only teacher, admin, or system can update flags
    const isTeacher = req.user.role === 'teacher';
    const isAdmin = req.user.role === 'admin';
    
    if (!isTeacher && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: "Only teachers or admins can update flags"
      });
    }

    const oldFlags = { ...task.flags };
    let changes = [];

    // Update each flag and track changes
    Object.keys(flags).forEach(flagName => {
      if (task.flags[flagName] !== undefined && task.flags[flagName] !== flags[flagName]) {
        changes.push({
          flagName,
          oldValue: task.flags[flagName],
          newValue: flags[flagName]
        });
        task.flags[flagName] = flags[flagName];
      }
    });

    await task.save();

    // Log each flag change
    for (const change of changes) {
      await logActivity({
        taskId,
        userId,
        projectId: task.projectId,
        eventType: 'flag_update',
        metadata: {
          flagName: change.flagName,
          flagValue: change.newValue,
          riskScore: calculateRiskScore(task) // Recalculate risk score
        }
      });
    }

    res.json({
      success: true,
      task,
      message: "Flags updated successfully",
      changes
    });
  } catch (error) {
    console.error('Error updating flags:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Helper to calculate risk score
const calculateRiskScore = (task) => {
  const flags = task.flags || {};
  return (
    (flags.paddedTime ? 2 : 0) +
    (flags.rushedCompletion ? 2 : 0) +
    (flags.noProof ? 1 : 0) +
    (flags.manualReviewRequired ? 3 : 0)
  );
};
// Update the existing updateTaskStatus function
export const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status, additionalTime } = req.body;
    const userId = req.user.id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found"
      });
    }
    console.log("task", task);


    if (additionalTime) {
      task.totalFocusTime = (task.totalFocusTime || 0) + additionalTime;
    }
    console.log("totalFocusTime", task.totalFocusTime);
    const oldStatus = task.status;
    task.status = status;



    const metrics = calculateTaskMetrics(task);
    const riskScore = calculateRiskScore(task);
    console.log("riskScore", riskScore);
    task.risk.riskScore = riskScore;
    task.taskMetrics.efficiency = Math.round(metrics.efficiency * 100) / 100;
    task.taskMetrics.label = metrics.efficiency.label;
    task.taskMetrics.status = metrics.efficiency.status;

    task.lastEventTime = new Date(); //stores current time as lastEventTime update
    task.flags = metrics.flags; //update flags based on current task state
    console.log("task.flags", task.flags);
    console.log("task.estimatedTime", task.estimatedTime);
    // Recalculate efficiency
    if (task.estimatedTime) {
      task.taskMetrics.efficiency =
        Math.round((task.totalFocusTime / task.estimatedTime) * 100 * 100) / 100;
    }
    console.log("efficiency", task.taskMetrics.efficiency);
    



    await task.save();

    const project = await Project.findById(task.projectId);

    if (project) {
      project.status = 'ongoing';
      if (!project.startTime) {
        project.startTime = new Date();
      }
      await project.save();
    }
    // Log activity with status_changed event type
    await logActivity({
      taskId,
      userId,
      projectId: task.projectId,
      eventType: 'status_changed',
      metadata: {
        oldStatus,
        newStatus: status
      }
    });

    //logging efficiency update as separate event
    await logActivity({
      taskId,
      userId,
      projectId: task.projectId,
      eventType: 'efficiency_update',
      metadata: {
        efficiency: task.taskMetrics.efficiency,
        label: task.taskMetrics.label,
        status: task.taskMetrics.status
    }
    });
    
    const updatedTask = await Task.findById(taskId)
      .populate('assignedTo', 'name email avatar')
      .populate('projectId', 'projectName');

    res.json({
      success: true,
      task: updatedTask,
      message: "Task status updated successfully"
    });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update the existing updateTaskTime function
export const updateTaskTime = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { focusTime } = req.body;
    const userId = req.user.id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found"
      });
    }

    const oldFocusTime = task.totalFocusTime || 0;
    const newFocusTime = oldFocusTime + parseInt(focusTime);

    task.totalFocusTime = newFocusTime;
    await task.save();

    // Log activity with time_logged event type
    await logActivity({
      taskId,
      userId,
      projectId: task.projectId,
      eventType: 'time_logged',
      metadata: {
        duration: parseInt(focusTime),
        totalFocusTime: newFocusTime
      }
    });

    res.json({
      success: true,
      task,
      message: "Time logged successfully"
    });
  } catch (error) {
    console.error('Error updating task time:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Update the existing uploadProof function
export const uploadProof = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;
    const file = req.file;
    const { description } = req.body || '';

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found"
      });
    }

    // Create proof object
    const proof = {
      filename: file.originalname,
      fileUrl: `/uploads/${file.filename}`,
      uploadedAt: new Date(),
      description: description || '',
      uploadedBy: userId
    };

    if (!task.proofUploads) task.proofUploads = [];
    task.proofUploads.push(proof);
    task.flags.noProof = false;
    
    await task.save();

    // Log activity with proof_uploaded event type
    await logActivity({
      taskId,
      userId,
      projectId: task.projectId,
      eventType: 'proof_uploaded',
      metadata: {
        filename: file.originalname,
        description: description,
        proofId: proof._id
      }
    });

    res.json({
      success: true,
      message: "Proof uploaded successfully",
      proof: proof
    });
  } catch (error) {
    console.error('Error uploading proof:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
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