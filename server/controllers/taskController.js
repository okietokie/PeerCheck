// taskController.js
import Task from '../models/tasks.js';
import Project from '../models/projects.js';
import User from '../models/user.js';
import TaskActivityEvent from '../models/taskActivityEvent.js';
import { formatTimeAgo, getActionMessage, logActivity } from "./activityLogger.js";
import DeletedTaskInfo from '../models/deletedTaskInfo.js';
import { updateProjectMetricsInDB } from './projectController.js';
import Team from '../models/peergroup_log.js';
import editDataInfo from '../models/editDataInfo.js';
import MentorProjectAssignment from '../models/mentorProjectAssignment.js';
import { r2Client, R2_BUCKET_NAME } from "../r2Client.js";
import cron from 'node-cron';
import path from "path";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { createNotification, notifyProofUploaded, notifyTaskAssigned, notifyTaskComment, notifyTaskCompleted, notifyTaskDeadline } from './notificationController.js';
import { updateUserProductivity } from './userProductivity.js';

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

export const calculateTaskRisk = (task) => { 
  // Get basic task data
  const estimatedTime = task.estimatedTime || 1; 
  const focusTime = task.totalFocusTime || 0; 
  const timeRatio = estimatedTime > 0 ? (focusTime / estimatedTime) : 0;
  
  // Calculate individual risk flags
  const paddedTime = timeRatio > 2;           // Worked >2x estimated
  const rushedCompletion = task.status === 'completed' && timeRatio < 0.4;
  const noProof = !task.proofUploads || task.proofUploads.length === 0;
  
  // checking task overdue
  let isOverdue = false;
  let daysUntilDeadline = null;
  
  if (task.deadline) {
    const now = new Date();
    const deadline = new Date(task.deadline);
    isOverdue = deadline < now && task.status !== 'completed';
    
    // Calculate days until deadline
    daysUntilDeadline = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
  }

  const notStartedNearDeadline = 
    task.status === 'not_started' && 
    daysUntilDeadline !== null && 
    daysUntilDeadline <= 1;
  
  const nearDeadline = 
    daysUntilDeadline !== null && 
    daysUntilDeadline <= 3 && 
    task.status !== 'completed';
  
  // Manual review required if any risk flag exists
  const manualReviewRequired = 
      paddedTime || 
      rushedCompletion || 
      noProof || 
      isOverdue || 
      notStartedNearDeadline;

  // Calculate risk score
  // Each flag contributes independently
 let riskScore = 0;
  const riskFactors = [];
  
  if (paddedTime) {
    riskScore += 2;
    riskFactors.push('padded_time');
  }
  if (rushedCompletion) {
    riskScore += 2;
    riskFactors.push('rushed_completion');
  }
  if (noProof) {
    riskScore += 1;
    riskFactors.push('no_proof');
  }
  if (isOverdue) {
    riskScore += 1;
    riskFactors.push('overdue');
  }
  if (notStartedNearDeadline) {
    riskScore += 2;
    riskFactors.push('not_started_urgent');
  } else if (nearDeadline) {
    riskScore += 1;
    riskFactors.push('near_deadline');
  }
  
  // Cap at 8 points (for frontend)
  riskScore = Math.min(riskScore, 8);

  // Determine risk level
  let riskLevel, riskLabel;
  
  if (riskScore >= 6) {
    riskLevel = 'critical';
    riskLabel = 'Critical Risk';
  } else if (riskScore >= 4) {
    riskLevel = 'high';
    riskLabel = 'High Risk';
  } else if (riskScore >= 2) {
    riskLevel = 'medium';
    riskLabel = 'Medium Risk';
  } else {
    riskLevel = 'low';
    riskLabel = 'Low Risk';
  }
    
  // Return detailed structure
  return {
    timeRatio,
    flags: {
      paddedTime,
      rushedCompletion,
      noProof,
      manualReviewRequired,
      isOverdue,
      nearDeadline,
      notStartedNearDeadline
    },
    risk: {
      riskScore,
      riskLevel,
      riskLabel,
      riskFactors,
      daysUntilDeadline
    }
  };
};

const calculateTimeEfficiency = (task) => {
  const estimatedTime = task.estimatedTime || 1;
  const focusTime = task.totalFocusTime || 0;
  
  // Calculate efficiency percentage
  const rawEfficiency = (focusTime / estimatedTime) * 100;
  
  // Apply curve - optimal range is 80-120%
  let timeScore;
  if (rawEfficiency >= 80 && rawEfficiency <= 120) {
    timeScore = 100; // Perfect efficiency
  } else if (rawEfficiency < 40 || rawEfficiency > 200) {
    timeScore = 30; // Very poor efficiency
  } else if (rawEfficiency < 60 || rawEfficiency > 160) {
    timeScore = 60; // Below average
  } else {
    timeScore = 80; // Acceptable but not optimal
  }
  
  return timeScore;
};

const calculateCompletionQuality = (task) => {
  let score = 0;
  
  // Status weight
  const statusWeights = {
    'completed': 100,
    'active': 70,
    'paused': 40,
    'not_started': 0
  };
  score += statusWeights[task.status] || 0;
  
  // Add quality from grading
  const gradingMeta = task.gradingMeta || {};
  if (gradingMeta.teacherOverrideScore) {
    score += gradingMeta.teacherOverrideScore * 10; // Convert 0-10 to 0-100
  } else if (gradingMeta.qualityScore) {
    score += gradingMeta.qualityScore * 10;
  }
  
  return Math.min(score, 100);
};

const calculateTimelinessScore = (task) => {
  if (!task.deadline) return 80; // Default if no deadline
  
  const now = new Date();
  const deadline = new Date(task.deadline);
  
  if (task.status === 'completed' && task.endDate) {
    const completionDate = new Date(task.endDate);
    const daysLate = Math.max(0, (completionDate - deadline) / (1000 * 60 * 60 * 24));
    
    if (completionDate <= deadline) {
      return 100; // Completed on or before deadline
    } else if (daysLate <= 1) {
      return 90; // 1 day late
    } else if (daysLate <= 3) {
      return 70; // 3 days late
    } else if (daysLate <= 7) {
      return 50; // 1 week late
    } else {
      return 30; // Very late
    }
  } else {
    // Task not completed yet
    const daysRemaining = Math.max(0, (deadline - now) / (1000 * 60 * 60 * 24));
    const totalDuration = task.estimatedTime / (60 * 60 * 24); // Convert seconds to days
    
    if (task.status === 'not_started') {
      // Not started yet - check if we're close to deadline
      if (daysRemaining > totalDuration * 0.5) {
        return 80; // Plenty of time left
      } else if (daysRemaining > totalDuration * 0.25) {
        return 60; // Some time left
      } else if (daysRemaining > 0) {
        return 40; // Little time left
      } else {
        return 20; // Overdue and not started
      }
    } else {
      // Task in progress
      const progress = task.totalFocusTime / task.estimatedTime;
      const timeRatio = progress / (1 - (daysRemaining / totalDuration));
      
      if (timeRatio > 1.2) {
        return 90; // Ahead of schedule
      } else if (timeRatio > 0.8) {
        return 80; // On track
      } else if (timeRatio > 0.5) {
        return 60; // Slightly behind
      } else {
        return 40; // Significantly behind
      }
    }
  }
};

const calculateProofQualityScore = (task) => {
  const proofs = task.proofUploads || [];
  
  if (proofs.length === 0) return 20; // No proof
  
  let score = 50; // Base score for having proof
  
  // Analyze proof quality
  const proofTypes = proofs.map(p => p.fileType);
  const hasImages = proofTypes.some(t => t.startsWith('image/'));
  const hasPDF = proofTypes.some(t => t.includes('pdf') || t.includes('document'));
  const hasVideo = proofTypes.some(t => t.startsWith('video/'));
  
  if (hasVideo) score += 30; // Video proof is strong
  if (hasImages && hasPDF) score += 20; // Multiple proof types
  else if (hasImages || hasPDF) score += 10; // Single proof type
  
  // Check proof descriptions
  const hasDescriptions = proofs.some(p => p.description && p.description.trim() !== '');
  if (hasDescriptions) score += 10;
  
  // Check file sizes (larger files might indicate more substantial proof)
  const totalSize = proofs.reduce((sum, p) => sum + (p.fileSize || 0), 0);
  if (totalSize > 5 * 1024 * 1024) score += 10; // >5MB total
  
  return Math.min(score, 100);
};

const calculateRiskFactorScore = (task) => {
  const riskMetrics = calculateTaskRisk(task);
  const riskScore = riskMetrics.risk.riskScore;
  
  // Convert risk score (0-8) to efficiency score (100-0)
  // Higher risk = lower efficiency
  const riskEfficiency = Math.max(0, 100 - (riskScore * 12.5));
  
  // Apply penalties for specific flags
  let penalty = 0;
  const flags = riskMetrics.flags || {};
  
  if (flags.rushedCompletion) penalty += 15;
  if (flags.paddedTime) penalty += 10;
  if (flags.noProof) penalty += 20;
  if (flags.manualReviewRequired) penalty += 25;
  
  return Math.max(0, riskEfficiency - penalty);
};

const getEfficiencyLabel = (score) => {
  if (score >= 85) return 'Outstanding';
  if (score >= 70) return 'Excellent';
  if (score >= 50) return 'Satisfactory';
  if (score >= 30) return 'Needs Improvement';
  return 'Unsatisfactory';
};

const calculateEnhancedTaskEfficiency = (task) => {
  const factors = {
    timeEfficiency: 0.30,      // 30% weight
    completionQuality: 0.25,    // 25% weight
    timeliness: 0.20,          // 20% weight
    proofQuality: 0.15,        // 15% weight
    riskFactor: 0.10           // 10% weight
  };

  // Calculate component scores
  const timeEfficiencyScore = calculateTimeEfficiency(task);
  const completionQualityScore = calculateCompletionQuality(task);
  const timelinessScore = calculateTimelinessScore(task);
  const proofQualityScore = calculateProofQualityScore(task);
  const riskFactorScore = calculateRiskFactorScore(task);
  
  // Calculate weighted efficiency
  const weightedEfficiency = 
    (timeEfficiencyScore * factors.timeEfficiency) +
    (completionQualityScore * factors.completionQuality) +
    (timelinessScore * factors.timeliness) +
    (proofQualityScore * factors.proofQuality) +
    (riskFactorScore * factors.riskFactor);
  
  return Math.min(Math.max(weightedEfficiency, 0), 100); // Clamp between 0-100
};


export const enrichTaskWithMetrics = (task) => {
  if (!task) return null;

  const efficiency = calculateEnhancedTaskEfficiency(task);
  const riskScore = calculateTaskRisk(task);
  const statusWeight = getStatusWeight(task.status);
  const isOverdue = calculateIsOverdue(task);
  const daysUntilDeadline = calculateDaysUntilDeadline(task);
  
  // Calculate individual component scores for insights
  const componentScores = {
    timeEfficiency: calculateTimeEfficiency(task),
    completionQuality: calculateCompletionQuality(task),
    timeliness: calculateTimelinessScore(task),
    proofQuality: calculateProofQualityScore(task),
    riskFactor: calculateRiskFactorScore(task)
  };

  // Determine efficiency status based on comprehensive score
  const efficiencyStatus = (efficiency) => {
    if (efficiency >= 85) return 'excellent';
    if (efficiency >= 70) return 'good';
    if (efficiency >= 50) return 'average';
    if (efficiency >= 30) return 'poor';
    return 'critical';
  };
  const taskObj = task.toObject ? task.toObject() : { ...task };

  return {
    ...taskObj,
    _id: task._id,
    metrics: {
      efficiency: Number(efficiency.toFixed(2)),
      efficiencyStatus: efficiencyStatus(efficiency),
      efficiencyLabel: getEfficiencyLabel(efficiency),
      riskScore: riskScore.risk.riskScore,
      risk: riskScore,
      riskLevel: riskScore.risk.riskLevel,
      componentScores,
      statusWeight,
      statusWeightPercentage: statusWeight * 100,
      hasProof: task.proofUploads && task.proofUploads.length > 0,
      proofCount: task.proofUploads ? task.proofUploads.length : 0,
      isOverdue,
      daysUntilDeadline,
      overallScore: efficiency
    }
  };
};

const enrichTasksWithMetrics = (tasks) => {
  if (!tasks || !Array.isArray(tasks)) return [];
  return tasks.map(task => enrichTaskWithMetrics(task));
};


const calculateSummaryMetrics = (enrichedTasks) => {
  const totalTasks = enrichedTasks.length;
  const completedTasks = enrichedTasks.filter(t => t.status === 'completed').length;
  const activeTasks = enrichedTasks.filter(t => t.status === 'active').length;
  const totalRiskScore = enrichedTasks.reduce((sum, task) => sum + (task.metrics.riskScore || 0), 0);
  const averageRiskScore = totalTasks > 0 ? totalRiskScore / totalTasks : 0;
  const totalStatusWeight = enrichedTasks.reduce((sum, task) => sum + (task.metrics.statusWeight || 0), 0);
  const weightedProgress = totalTasks > 0 ? (totalStatusWeight / totalTasks) * 100 : 0;
  const totalEfficiency = enrichedTasks.reduce((sum, task) => sum + (task.metrics.efficiency || 0), 0);
  const averageEfficiency = totalTasks > 0 ? totalEfficiency / totalTasks : 0;

  return {
    totalTasks,
    completedTasks,
    activeTasks,
    averageRiskScore: Number(averageRiskScore.toFixed(2)),
    averageEfficiency: Number(averageEfficiency.toFixed(2)),
    weightedProgress: Number(weightedProgress.toFixed(2)),
    summary: {
      highRiskTasks: enrichedTasks.filter(t => t.metrics.riskScore >= 4).length,
      mediumRiskTasks: enrichedTasks.filter(t => t.metrics.riskScore >= 2 && t.metrics.riskScore < 4).length,
      lowRiskTasks: enrichedTasks.filter(t => t.metrics.riskScore < 2).length,
      overdueTasks: enrichedTasks.filter(t => t.metrics.isOverdue).length,
      tasksWithProof: enrichedTasks.filter(t => t.metrics.hasProof).length,
      excellentTasks: enrichedTasks.filter(t => t.metrics.efficiencyStatus === 'excellent').length,
      goodTasks: enrichedTasks.filter(t => t.metrics.efficiencyStatus === 'good').length,
      averageTasks: enrichedTasks.filter(t => t.metrics.efficiencyStatus === 'average').length,
      poorTasks: enrichedTasks.filter(t => t.metrics.efficiencyStatus === 'poor' || t.metrics.efficiencyStatus === 'critical').length
    }
  };
};


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
    const team = await Team.findById(project.teamId).select("members")
    
    const isTeacherOrAdmin = ['teacher', 'admin'].includes(req.user.role);

    if (project.createdBy.toString() !== userId && 
        !team.members.some(member => member.toString() === userId) && !isTeacherOrAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied to project"
      });
    }
    
    const tasks = await Task.find({ projectId })
      .populate('assignedTo', 'name email avatar')
      .populate('assignedBy', 'name email avatar')
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

// Get task details with activities AND METRICS 
export const getTaskDetails = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    const task = await Task.findById(taskId)
      .populate('assignedTo', 'name email avatar skills')
      .populate('assignedBy', 'name email avatar skills')
      .populate('projectId', 'projectName description teamName');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    // Check access
    const project = await Project.findById(task.projectId)
    .populate("teamId", "teamName members")
    const hasAccess = 
      project?.createdBy?.toString() === userId ||
      task.assignedTo._id.toString() === userId ||
      project?.teamId?.members.some(member => member.toString() === userId);

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

    // Calculate enhanced metrics
    const enrichedTask = await enrichTaskWithMetrics(task);

    res.status(200).json({
      success: true,
      task: enrichedTask,
      activities,
      statistics: enrichedTask.metrics
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
    
    // Add enhanced metrics
    const tasksWithMetrics = enrichTasksWithMetrics(tasks);
    
    // Filter by risk level
    let filteredTasks = tasksWithMetrics;
    if (riskLevel && riskLevel !== 'all') {
      filteredTasks = tasksWithMetrics.filter(task => {
        const score = task.metrics.riskScore;
        if (riskLevel === 'high') return score >= 4;
        if (riskLevel === 'medium') return score >= 2 && score < 4;
        return score < 2;
      });
    }
    
    res.json({
      success: true,
      tasks: filteredTasks,
      total: filteredTasks.length
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
    
    const tasksWithMetrics = enrichTasksWithMetrics(tasks);
    
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

    // Add enhanced metrics to each task
    const tasksWithMetrics = enrichTasksWithMetrics(tasks);
    
    // Calculate summary metrics
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const highRiskTasks = tasksWithMetrics.filter(t => t.metrics.riskScore >= 4).length;
    const tasksWithoutProof = tasksWithMetrics.filter(t => !t.metrics.hasProof).length;
    const totalEfficiency = tasksWithMetrics.reduce((sum, t) => sum + t.metrics.efficiency, 0);
    const averageEfficiency = totalTasks > 0 ? totalEfficiency / totalTasks : 0;
    
    res.json({
      success: true,
      user: user,
      tasks: tasksWithMetrics,
      metrics: {
        totalTasks,
        completedTasks,
        highRiskTasks,
        tasksWithoutProof,
        averageEfficiency: Number(averageEfficiency.toFixed(2)),
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

    // Get all projects the user has access to
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
    
    // Build query
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

    // Get tasks with pagination
    const skip = (page - 1) * limit;
    
    let tasks = await Task.find(query)
      .populate('assignedTo', 'name email avatar')
      .populate('projectId', 'projectName')
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Apply computed filters
    if (riskLevel && riskLevel !== 'all') {
      tasks = tasks.filter(task => {
        const riskScore = calculateTaskRisk(task).risk.riskScore;
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
    const sortOptions = {
      deadline: (a, b) => new Date(a.deadline) - new Date(b.deadline),
      'deadline-desc': (a, b) => new Date(b.deadline) - new Date(a.deadline),
      risk: (a, b) => calculateTaskRisk(b).risk.riskScore - calculateTaskRisk(a).risk.riskScore,
      'risk-desc': (a, b) => calculateTaskRisk(a).risk.riskScore - calculateTaskRisk(b).risk.riskScore,
      efficiency: (a, b) => calculateEnhancedTaskEfficiency(a) - calculateEnhancedTaskEfficiency(b),
      'efficiency-desc': (a, b) => calculateEnhancedTaskEfficiency(b) - calculateEnhancedTaskEfficiency(a),
      updatedAt: (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
      'updatedAt-desc': (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt)
    };
    
    const sortFunc = sortOptions[`${sortBy}${sortOrder === 'desc' ? '-desc' : ''}`] || sortOptions.deadline;
    tasks.sort(sortFunc);

    // Get total count for pagination
    const totalTasks = await Task.countDocuments(query);

    // Enrich tasks with metrics
    const enrichedTasks = enrichTasksWithMetrics(tasks);

    // Calculate summary
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
        manualReviewRequired: project.gradingCriteria.allowPeerReview || true
      },
      gradingMeta: {
        allowPeerReview: project.gradingCriteria.allowPeerReview || false,
        qualityScore: 0,
        teacherOverrideScore: 0
      }
    });

    await task.save();
    await updateUserProductivity(assignedTo);
    await updateProjectMetricsInDB(projectId);

    await notifyTaskAssigned(task._id, assignedTo, userId);

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
    let projectFound;
    const project = await Project.findById(task.projectId);
    if (project) {
      // Check if user is project creator or admin
      projectFound = true;
      if (project.createdBy.toString() !== userId) {
        const user = await User.findById(userId);
        if (user.role !== 'admin') {
          return res.status(403).json({
            success: false,
            message: "Notice: Only project creator can delete tasks"
          });
        }
      }
      updateProjectMetricsInDB(project._id);

    }else{
      projectFound = false;
    }

    // Save deleted task info
    await DeletedTaskInfo.create({
      deletedTaskName: task.taskTitle,
      taskID: task._id,
      projectID: task.projectId,
      assignedTo: task.assignedTo
    });



    if (task.assignedTo) {
      await createNotification({
        userId: task.assignedTo,
        type: 'task_deleted',
        title: 'Task Deleted',
        message: `Task "${task.taskTitle}" has been deleted`,
        data: {
          taskId: task._id,
          projectId: task.projectId,
          taskTitle: task.taskTitle
        },
        priority: 'high'
      });
    }

    await updateUserProductivity(task.assignedTo._id ? task.assignedTo._id : task.assignedTo);
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
    const userId = req.user.id || req.userId;

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
    const project = task?.projectId;
    const team = await Team.findById(project?.teamId)
        .select("members");

    const hasAccess = 
      task.assignedTo.toString() === userId ||
      project.createdBy.toString() === userId ||
      team.members.includes(userId);
    
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
    await createNotification({
      userId: task.assignedTo,
      type: 'deadline_updated',
      title: 'Task Deadline Updated',
      message: `Deadline for task "${task.taskTitle}" has been updated`,
      data: {
        taskId: task._id,
        projectId: task.projectId,
        oldDeadline: oldDeadline,
        newDeadline: newDeadline
      },
      priority: 'high',
      actionUrl: `/tasks/${task._id}`
    });
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

export const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { assignedTo, ...updateData} = req.body;
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const mentor = await MentorProjectAssignment.findOne({projectId: task.projectId}).populate('mentor', "name email avatar")

    // Check permissions
    const isAssignee = task.assignedTo.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isAssignee && !isAdmin) {
      return res.status(403).json({ error: "Not authorized to update/edit this project" });
    }

    let changedAssignedTo  = {state: false, oldId: task.assignedTo._id, newId: null};

    // Update project fields

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && updateData[key] !== task[key]) {
        task[key] = updateData[key];
      }
    });
    if (assignedTo._id !== task.assignedTo._id){
      if (task.assignedBy._id === req.user.id || mentor._id === req.user.id){
        task.assignedTo = assignedTo._id;
        changedAssignedTo  = {state: true, oldId: assignedTo._id, newId: task.assignedTo};

      }
    }

    await task.save();

    await editDataInfo.create({
      taskId: task._id, 
      projectId: task?.projectId?._id ? task?.projectId?._id : task?.projectId, 
      updatedData: updateData, 
      editMadeAt: task.updatedAt
    })

    if (changedAssignedTo.state){
      await TaskActivityEvent.create({
        taskId: task._id,
        projectId: task.projectId,
        userId: req.user.id,
        eventType: "task_reassigned",
        comment: `Reassigned from ${changedAssignedTo.oldId} to ${changedAssignedTo.newId}`,
      });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update the existing updateTaskStatus function
export const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status, timestamp } = req.body;
    const userId = req.user.id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found"
      });
    }

    if (task.assignedTo._id.toString() !== userId.toString()){
      return res.status(403).json({
        success: false,
        error: `You are not authorized to start or update this task!`
      })
    }

    let additionalTime = 0;

    if (task.status === "active" && task.lastEventTime) {
      additionalTime = Math.floor(
        (new Date(timestamp) - new Date(task.lastEventTime)) / 1000
      );
    }
    task.totalFocusTime += Math.max(additionalTime, 0);
    task.lastEventTime = new Date(timestamp);

    
    const oldStatus = task.status;
    task.status = status;
    if(status === 'completed'){
      task.endDate = new Date();
    }

    // Calculate new metrics
    const riskMetrics = calculateTaskRisk(task);
    const efficiency = calculateEnhancedTaskEfficiency(task);
    
    // Update task metrics
    task.metrics = task.metrics || {};
    task.metrics.riskScore = riskMetrics.risk.riskScore;
    task.metrics.efficiency = efficiency;
    task.metrics.efficiencyStatus = efficiency >= 85 ? 'excellent' : 
                                     efficiency >= 70 ? 'good' : 
                                     efficiency >= 50 ? 'average' : 
                                     efficiency >= 30 ? 'poor' : 'critical';
    task.metrics.efficiencyLabel = getEfficiencyLabel(efficiency);
    
    task.flags = riskMetrics.flags;

    await task.save();

    const project = await Project.findById(task.projectId);

    if (project) {
      project.status = 'ongoing';
      if (!project.startTime) {
        project.startTime = new Date();
      }
      await project.save();
    }

    const statusMessages = {
      'not_started': 'not started',
      'active': 'started',
      'paused': 'paused',
      'completed': 'completed'
    };

    const notificationPriority = {
      'completed': 'high',
      'active': 'medium',
      'paused': 'low',
      'not_started': 'low'
    };

    // Determine who should receive notifications
    // Always notify the task assignee about their own action (confirmation)
    if (task.assignedTo && task.assignedTo._id.toString() === userId) {
      // User is updating their own task - get confirmation notification
      await createNotification({
        userId: task.assignedTo._id,
        type: 'task_status_changed',
        title: `Task ${statusMessages[status]}`,
        message: `You ${statusMessages[status]} task: "${task.taskTitle}"`,
        data: {
          taskId: task._id,
          projectId: task.projectId,
          oldStatus,
          newStatus: status,
          performedBy: userId
        },
        priority: notificationPriority[status],
        actionUrl: `/tasks/${task._id}`
      });
    }

    // Notify task creator/assigner if different from current user
    if (task.assignedBy && 
        task.assignedBy._id.toString() !== userId &&
        task.assignedBy._id.toString() !== task.assignedTo?._id?.toString()) {
      
      const performerName = req.user.name || 'A user';
      
      await createNotification({
        userId: task.assignedBy._id,
        type: 'task_status_changed',
        title: 'Task Status Updated',
        message: `${performerName} ${statusMessages[status]} task: "${task.taskTitle}"`,
        data: {
          taskId: task._id,
          projectId: task.projectId,
          oldStatus,
          newStatus: status,
          performedBy: userId,
          performerName: performerName
        },
        priority: status === 'completed' ? 'high' : 'medium',
        actionUrl: `/tasks/${task._id}`
      });
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
        efficiency: efficiency,
        label: getEfficiencyLabel(efficiency),
        status: task.metrics.efficiencyStatus
      }
    });
    
    const updatedTask = await Task.findById(taskId)
      .populate('assignedTo', 'name email avatar')
      .populate('projectId', 'projectName');

    if (status === 'completed') {
      await notifyTaskCompleted(taskId, userId);
    }

    await updateUserProductivity(userId);

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



export const scheduleTaskDeadlineReminders = () => {
  // Run every day at 9 AM
  cron.schedule('0 9 * * *', async () => {
    try {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Find tasks due in next 24 hours that aren't completed
      const upcomingTasks = await Task.find({
        deadline: {
          $gte: now,
          $lte: tomorrow
        },
        status: { $ne: 'completed' },
        'assignedTo': { $ne: null }
      }).populate('assignedTo');
      
      for (const task of upcomingTasks) {
        await notifyTaskDeadline(task._id);
      }
      
    } catch (error) {
      console.error('Error sending deadline reminders:', error);
    }
  });
};

// Upload proof to R2
export const uploadProof = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;
    const file = req.file;
    const { description } = req.body || '';

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ success: false, error: "Task not found" });

  // Prepare R2 key
  const r2Key = `proofs/${taskId}/${Date.now()}-${file.originalname}`;

  // Upload to R2 using PutObjectCommand
  await r2Client.send(new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: r2Key,
    Body: file.buffer,
    ContentType: file.mimetype
  }));
  
    const proof = {
      filename: file.originalname,
      r2Key: r2Key,
      uploadedAt: new Date(),
      description: description || '',
      uploadedBy: userId,
      fileSize: file.size,
      fileType: file.mimetype
    };

    if (!task.proofUploads) task.proofUploads = [];
    task.proofUploads.push(proof);
    task.flags.noProof = false;
    await task.save();

    // Log activity
    await logActivity({
      taskId,
      userId,
      projectId: task.projectId,
      eventType: 'proof_uploaded',
      metadata: { filename: file.originalname, description, fileSize: file.size }
    });
    await notifyProofUploaded(taskId, userId);

    res.json({
      success: true,
      message: "Proof uploaded successfully",
      proof,
      urls: {
        view: `/api/user/task/${taskId}/proof/${proof._id}`,
        download: `/api/user/task/${taskId}/proof/${proof._id}?download=true`
      }
    });

  } catch (error) {
    console.error("Error uploading proof:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// View or download proof
export const getProofFile = async (req, res) => {
  try {
    const { taskId, proofId } = req.params;
    const download = req.query.download === 'true';
    const userId = req.user.id;
  
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ success: false, error: "Task not found" });

    const proof = task.proofUploads.id(proofId);
    if (!proof) return res.status(404).json({ success: false, error: "Proof not found" });

    // Authorization
    const isAssignee = task.assignedTo?.toString() === userId.toString() || task.assignedTo?._id.toString() === userId.toString();
    const isTeacherOrAdmin = ['teacher', 'admin'].includes(req.user.role);

    if (!isAssignee && !isTeacherOrAdmin) {
      const project = await Project.findById(task.projectId);
      const team = project?.teamId ? await Team.findById(project.teamId) : null;
      if (!team?.members.some(m => m.user?.toString() === userId.toString()))
        return res.status(403).json({ success: false, error: "Access denied" });
    }

    // Get object from R2
    const object = await r2Client.send(new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: proof.r2Key
    }));

    res.setHeader('Content-Type', proof.fileType);
    res.setHeader('Content-Disposition', `${download ? 'attachment' : 'inline'}; filename="${encodeURIComponent(proof.filename)}"`);
    object.Body.pipe(res);

    await logActivity({
      taskId,
      userId,
      projectId: task.projectId,
      eventType: 'proof_viewed',
      metadata: { filename: proof.filename, proofId }
    });

  } catch (error) {
    console.error("Error getting proof file:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Delete proof
export const deleteProof = async (req, res) => {
  try {
    const { taskId, proofId } = req.params;
    const userId = req.user.id;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ success: false, error: "Task not found" });

    const proof = task.proofUploads.id(proofId);
    if (!proof) return res.status(404).json({ success: false, error: "Proof not found" });

    // Authorization: only uploader, teacher, or admin
    const isUploader = task.assignedTo?.toString() === userId.toString() || task.assignedTo?._id.toString() === userId.toString();
    const isTeacherOrAdmin = ['teacher', 'admin'].includes(req.user.role);
    if (!isUploader && !isTeacherOrAdmin) return res.status(403).json({ success: false, error: "Access denied" });

    // Delete from R2
    await r2Client.send(new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: proof.r2Key
    }));
    
    // Remove from task
    proof.deleteOne();
    await task.save();

    await logActivity({
      taskId,
      userId,
      projectId: task.projectId,
      eventType: 'proof_deleted',
      metadata: { filename: proof.filename, proofId }
    });

    res.json({ success: true, message: "Proof deleted successfully" });

  } catch (error) {
    console.error("Error deleting proof:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Update specific task fields (for inline editing)
 * This handles updates for: taskTitle, priority, startDate, deadline, etc.
 */
export const updateTaskField = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { field, value } = req.body;
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
    const isAssignee = task.assignedTo?.toString() === userId.toString();
    const isProjectLead = task.assignedBy?.toString() === userId.toString();
    const isTeacher = req.user.role === "teacher";
   
    const isAuthorized = isAssignee || isProjectLead || isTeacher;

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to edit this task"
      });
    }

    const isComplete = task.status === 'completed';
    if (isComplete) {
      return res.status(400).jsxon({
        success: false,
        error: 'Cannot update task fields. Task is marked complete.'
      })
    }

    const oldValue = task[field];
    let newValue = value;
    let fieldChanged = false;
    let eventType = 'task_edited';

    // Validate and format based on field type
    switch (field) {
      case 'taskTitle':
        if (!value || value.trim() === '') {
          return res.status(400).json({
            success: false,
            error: "Task title cannot be empty"
          });
        }
        newValue = value.trim();
        eventType = 'title_updated';
        break;

      case 'priority':
        // Validate priority value
        const validPriorities = ['urgent', 'high', 'normal', 'low'];
        if (!validPriorities.includes(value)) {
          return res.status(400).json({
            success: false,
            error: "Invalid priority value. Must be: urgent, high, normal, low"
          });
        }
        if (!isAssignee) {
          return res.status(403).json({
            success: false,
            error: "You are not authorized to change priority of tasks. Please contact your project lead."
          });
        }
        newValue = value;
        eventType = 'priority_updated';
        break;

      case 'deadline':
        try {
          newValue = new Date(value);
          if (isNaN(newValue.getTime())) {
            return res.status(400).json({
              success: false,
              error: "Invalid date format"
            });
          }
          if (!isAssignee) {
            return res.status(403).json({
              success: false,
              error: "You are not authorized to change deadline of tasks. Please contact your project lead."
            });
          }
          
          // Set time to end of day for deadline
          newValue.setHours(23, 59, 59, 999);
          eventType = 'deadline_updated';
        } catch (err) {
          return res.status(400).json({
            success: false,
            error: "Invalid date format"
          });
        }
        break;

      case 'description':
        newValue = value || '';
        eventType = 'description_updated';
        break;

      case 'estimatedTime':
        const minutes = parseInt(value);
        if (isNaN(minutes) || minutes <= 0) {
          return res.status(400).json({
            success: false,
            error: "Estimated time must be a positive number in minutes"
          });
        }
        newValue = minutes * 60; // Convert minutes to seconds
        eventType = 'estimated_time_updated';
        break;

      default:
        // For any other field, check if it exists on the task
        if (!task.schema.path(field)) {
          return res.status(400).json({
            success: false,
            error: `Field '${field}' cannot be updated`
          });
        }
    }

    // Check if value actually changed
    if (field === 'deadline' || field === 'startDate') {
      fieldChanged = newValue.getTime() !== (oldValue?.getTime() || 0);
    } else {
      fieldChanged = newValue !== oldValue;
    }

    if (!fieldChanged) {
      return res.status(200).json({
        success: true,
        message: "No changes made",
        task
      });
    }

    // Update the field
    task[field] = newValue;
    
    // If deadline is updated and task is overdue, recalculate metrics
    if (field === 'deadline') {
      const now = new Date();
      task.metrics = task.metrics || {};
      task.metrics.isOverdue = newValue < now && task.status !== 'completed';
      
      // Calculate days until deadline
      const days = Math.ceil((newValue - now) / (1000 * 60 * 60 * 24));
      task.metrics.daysUntilDeadline = days < 0 ? 0 : days;
    }

    // Recalculate task metrics if relevant field changed
    if (['estimatedTime', 'totalFocusTime', 'status'].includes(field)) {
      const riskMetrics = calculateTaskRisk(task);
      const efficiency = calculateEnhancedTaskEfficiency(task);
      
      task.metrics = task.metrics || {};
      task.metrics.riskScore = riskMetrics.risk.riskScore;
      task.metrics.efficiency = efficiency;
      task.metrics.efficiencyStatus = efficiency >= 85 ? 'excellent' : 
                                       efficiency >= 70 ? 'good' : 
                                       efficiency >= 50 ? 'average' : 
                                       efficiency >= 30 ? 'poor' : 'critical';
      task.metrics.efficiencyLabel = getEfficiencyLabel(efficiency);
      task.flags = riskMetrics.flags;
    }

    await task.save();



    // Log activity
    await logActivity({
      taskId,
      userId,
      projectId: task.projectId,
      eventType,
      metadata: {
        field,
        oldValue: oldValue instanceof Date ? oldValue.toISOString() : oldValue,
        newValue: newValue instanceof Date ? newValue.toISOString() : newValue,
        changedBy: userId
      }
    });

    // Send notification if assignee changed something important
    if (field === 'deadline' && task.assignedTo && task.assignedTo.toString() !== userId) {
      const user = await User.findById(userId).select('name');
      await createNotification({
        userId: task.assignedTo,
        type: 'task_updated',
        title: 'Task Updated',
        message: `${user?.name || 'Someone'} updated the ${field} of task: "${task.taskTitle}"`,
        data: {
          taskId: task._id,
          projectId: task.projectId,
          field,
          oldValue: oldValue instanceof Date ? oldValue.toISOString() : oldValue,
          newValue: newValue instanceof Date ? newValue.toISOString() : newValue
        },
        priority: field === 'deadline' ? 'high' : 'medium',
        actionUrl: `/tasks/${task._id}`
      });
    }

    // Get populated task for response
    const updatedTask = await Task.findById(taskId)
      .populate('assignedTo', 'name email avatar')
      .populate('assignedBy', 'name email')
      .populate('projectId', 'projectName')
      .lean();

    // Enrich with metrics
    const enrichedTask = enrichTaskWithMetrics(updatedTask);
    await updateUserProductivity(task.assignedTo._id ? task.assignedTo._id : task.assignedTo);

    res.json({
      success: true,
      task: enrichedTask,
      message: `${field} updated successfully`,
      field,
      oldValue: oldValue instanceof Date ? oldValue.toISOString() : oldValue,
      newValue: newValue instanceof Date ? newValue.toISOString() : newValue
    });

  } catch (error) {
    console.error('Error updating task field:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const reassignTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { newAssigneeId } = req.body;
    const userId = req.userId || req.user.id;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ error: "Task not found" });

    const isAuthorized = task.assignedBy.toString() === userId.toString() || req.user.role === "teacher";
    if (!isAuthorized) {
      return res.status(403).json({ error: "Not authorized to reassign task" });
    }

    const assignedTo = task.assignedTo._id ? task.assignedTo._id.toString() : task.assignedTo;

    // Calculate focus time for current assignee
    if (task.lastEventTime && assignedTo) {
      const focusTimeByPrevUser = Math.floor((Date.now() - task.lastEventTime) / 1000);
      
      // Add to assignment history
      task.assignmentHistory.push({
        userId: assignedTo,
        from: task.lastAssignedAt || task.createdAt,
        to: new Date(),
        focusTime: focusTimeByPrevUser,
        efficiency: task.estimatedTime > 0 
          ? (focusTimeByPrevUser / task.estimatedTime) * 100 
          : 0
      });
      
      // Add to total focus time
      task.totalFocusTime += Math.max(focusTimeByPrevUser, 0);
    }

    // Reassign task
    const oldAssignee = assignedTo;
    task.assignedTo = newAssigneeId;
    task.lastAssignedAt = new Date();
    task.lastEventTime = null;
    task.status = "not_started";
    
    await task.save();

    // Update productivity stats for both users
    if (oldAssignee) await updateUserProductivity(oldAssignee);
    if (newAssigneeId) await updateUserProductivity(newAssigneeId);

    await logActivity({
      taskId,
      userId,
      projectId: task.projectId,
      eventType: "task_reassigned",
      metadata: {
        from: oldAssignee,
        to: newAssigneeId
      }
    });

    res.json({ success: true, message: "Task reassigned successfully" });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};