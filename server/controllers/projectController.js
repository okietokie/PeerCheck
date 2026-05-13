// server/controllers/projectController.js
import Project from "../models/projects.js";
import DeletedProjects from "../models/deletedProjectInfo.js";
import Task from "../models/tasks.js"; 
import User from "../models/user.js";
import Team from "../models/peergroup_log.js";
import MentorProjectAssignment from "../models/mentorProjectAssignment.js";
import ProjectEvaluation from "../models/projectEvaluation.js";
import PeerReview from "../models/peerReview.js";
import TaskActivityEvent from "../models/taskActivityEvent.js";
import { createNotification } from './notificationController.js';
import { detectFreeRiders } from "./peerReviewController.js";
import { getActionMessage } from "./activityLogger.js";
import Notification from "../models/notification.js";


// Status weight mapping for weighted progress
const STATUS_WEIGHTS = {
  not_started: 0,
  active: 0.5,
  paused: 0.3,
  completed: 1
};


//Weighted progress based on task statuses
  //progress % = (sum of tasks / total tasks) * 100
  //no binary completed/not, weight statuses above
  /*example
      5 tasks:
        2 completed → 2 × 1 = 2
        1 active → 0.5
        1 paused → 0.3
        1 not_started → 0
      Total = 2.8 / 5 = 56%
      
  // Calculates overall project progress using weighted task statuses
  // Completed tasks contribute more than active or paused tasks

   */
const calculateProgress = (tasks) => {
  if (!tasks || tasks.length === 0) {
    return {
      progress: 0,
      completedTasks: 0,
      totalTasks: 0,
      statusBreakdown: {
        not_started: 0,
        active: 0,
        paused: 0,
        completed: 0
      }
    };
  }

  let totalWeight = 0;
  const statusCount = {
    not_started: 0,
    active: 0,
    paused: 0,
    completed: 0
  };

  tasks.forEach(task => {
    const status = task.status || 'not_started';
    totalWeight += STATUS_WEIGHTS[status] || 0;
    statusCount[status] = (statusCount[status] || 0) + 1;
  });

  const progress = (totalWeight / tasks.length) * 100;

  return {
    progress: Math.round(progress * 100) / 100,
    completedTasks: statusCount.completed || 0,
    totalTasks: tasks.length,
    statusBreakdown: statusCount
  };
};


// Calculating project time efficiency
/**
 * by default system tracks estimatedTime and totalFOcus
 * efficiency = (totalFocusTime / estimatedTime) * 100
 * logic used:
    Efficiency %
    < 50%   -->	Rushed / suspicious
    80–120%	--> Ideal
    > 200%	--> Padded time

// Measures how efficiently a task was completed
// Helps detect rushed or padded task execution

 */
const calculateProjectTimeEfficiency = (tasks) => {
  if (!tasks || tasks.length === 0) {
    return {
      projectEfficiency: 0,
      totalEstimatedTime: 0,
      totalFocusTime: 0,
      status: 'normal',
      label: 'No Data'
    };
  }

  const totalEstimatedTime = tasks.reduce((sum, task) => sum + (task.estimatedTime || 0), 0);
  const totalFocusTime = tasks.reduce((sum, task) => sum + (task.totalFocusTime || 0), 0);

  const efficiency = totalEstimatedTime > 0 
    ? (totalFocusTime / totalEstimatedTime) * 100 
    : 0;

  let status = 'normal';
  let label = 'On Track';

  if (efficiency < 50) {
    status = 'low';
    label = 'Underworked';
  } else if (efficiency >= 50 && efficiency <= 120) {
    status = 'good';
    label = 'On Track';
  } else if (efficiency > 120 && efficiency <= 200) {
    status = 'warning';
    label = 'Overreported';
  } else {
    status = 'high';
    label = 'Severely Overreported';
  }

  return {
    projectEfficiency: Math.round(efficiency * 100) / 100,
    totalEstimatedTime,
    totalFocusTime,
    status,
    label
  };
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
  const flags = task.flags || {};
  
  const riskScore = 
    (flags.paddedTime ? 2 : 0) +
    (flags.rushedCompletion ? 2 : 0) +
    (flags.noProof ? 1 : 0) +
    (flags.manualReviewRequired ? 3 : 0);

  let riskLevel = 'low';
  let riskLabel = 'Low Risk';

  if (riskScore >= 4) {
    riskLevel = 'high';
    riskLabel = 'High Risk';
  } else if (riskScore >= 2) {
    riskLevel = 'medium';
    riskLabel = 'Medium Risk';
  }

  return {
    riskScore,
    riskLevel,
    riskLabel,
    flags
  };
};


//project risk score
/**
 *project risk logic:
    projectRisk = (sum of task riskScores) / totalTasks
 */
const calculateProjectRisk = (tasks) => {
  if (!tasks || tasks.length === 0) {
    return {
      projectRiskScore: 0,
      averageRiskScore: 0,
      riskLevel: 'low',
      riskLabel: 'Low Risk',
      riskyTasks: 0,
      highRiskTasks: 0,
      mediumRiskTasks: 0,
      totalTasks: 0
    };
  }

  let totalRiskScore = 0;
  let highRiskTasks = 0;
  let mediumRiskTasks = 0;

  tasks.forEach(task => {
    const taskRisk = calculateTaskRisk(task);
    totalRiskScore += taskRisk.riskScore;
    
    if (taskRisk.riskLevel === 'high') highRiskTasks++;
    if (taskRisk.riskLevel === 'medium') mediumRiskTasks++;
  });

  const averageRiskScore = totalRiskScore / tasks.length;

  let riskLevel = 'low';
  let riskLabel = 'Low Risk';

  if (averageRiskScore >= 2) {
    riskLevel = 'high';
    riskLabel = 'High Risk';
  } else if (averageRiskScore >= 1) {
    riskLevel = 'medium';
    riskLabel = 'Medium Risk';
  }

  return {
    projectRiskScore: Math.round(averageRiskScore * 100) / 100,
    averageRiskScore: Math.round(averageRiskScore * 100) / 100,
    riskLevel,
    riskLabel,
    riskyTasks: highRiskTasks + mediumRiskTasks,
    highRiskTasks,
    mediumRiskTasks,
    totalTasks: tasks.length
  };
};

/**
 * Calculate proof compliance
 * proofCompliance = (tasks with at least 1 proof upload / total tasks) * 100
 * 
// Calculates percentage of tasks that include proof of work submissions

 */
const calculateProofCompliance = (tasks) => {
  if (!tasks || tasks.length === 0) {
    return {
      complianceRate: 0,
      tasksWithProof: 0,
      totalTasks: 0
    };
  }

  const tasksWithProof = tasks.filter(task => 
    task.proofUploads && task.proofUploads.length > 0
  ).length;

  const complianceRate = (tasksWithProof / tasks.length) * 100;

  return {
    complianceRate: Math.round(complianceRate * 100) / 100,
    tasksWithProof,
    totalTasks: tasks.length
  };
};

/**
 * Calculate contributor fairness
 * 
//Detects unequal work distribution in team projects.
// Tracks task distribution and completion per contributor to detect free riders

 */
const calculateContributorFairness = (tasks, teamMembers) => {
  if (!tasks || tasks.length === 0 || !teamMembers || teamMembers.length === 0) {
    return {
      contributors: {},
      freeRiderRisk: false,
      teamMemberCount: 0
    };
  }

  const contributorStats = {};
  let totalCompletedTasks = 0;

  // Initialize all team members
  teamMembers.forEach(memberId => {
    const memberIdStr = memberId.toString ? memberId.toString() : memberId;
    contributorStats[memberIdStr] = {
      assignedTasks: 0,
      completedTasks: 0,
      assignedPercentage: 0,
      completedPercentage: 0,
      isFreeRider: false
    };
  });

  // Count assigned and completed tasks
  tasks.forEach(task => {
    const assigneeId = task.assignedTo?.toString();
    if (assigneeId && contributorStats[assigneeId]) {
      contributorStats[assigneeId].assignedTasks++;
      if (task.status === 'completed') {
        contributorStats[assigneeId].completedTasks++;
        totalCompletedTasks++;
      }
    }
  });

  // Calculate percentages
  Object.keys(contributorStats).forEach(memberId => {
    const stats = contributorStats[memberId];
    stats.assignedPercentage = (stats.assignedTasks / tasks.length) * 100;
    stats.completedPercentage = totalCompletedTasks > 0 
      ? (stats.completedTasks / totalCompletedTasks) * 100 
      : 0;
    
    // Flag potential free riders
    stats.isFreeRider = stats.assignedTasks > 0 && 
                       stats.completedTasks === 0 && 
                       tasks.length > 3;
  });

  const freeRiderRisk = Object.values(contributorStats).some(stat => stat.isFreeRider);

  return {
    contributors: contributorStats,
    freeRiderRisk,
    teamMemberCount: teamMembers.length
  };
};

/**
 * Calculate deadline health
 * logic:
    isOverdue = deadline < now && status !== 'completed'
    overdueRate = (overdue tasks / total tasks) * 100

//Checks how many tasks missed their deadlines.
 */
const calculateDeadlineHealth = (tasks) => {
  if (!tasks || tasks.length === 0) {
    return {
      overdueRate: 0,
      overdueTasks: 0,
      totalTasks: 0,
      upcomingDeadlines: 0
    };
  }

  const now = new Date();
  let overdueTasks = 0;
  let upcomingDeadlines = 0;
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  tasks.forEach(task => {
    const deadline = new Date(task.deadline);
    const isOverdue = deadline < now && task.status !== 'completed';
    const isUpcoming = deadline > now && deadline <= sevenDaysFromNow;

    if (isOverdue) overdueTasks++;
    if (isUpcoming) upcomingDeadlines++;
  });

  const overdueRate = (overdueTasks / tasks.length) * 100;

  return {
    overdueRate: Math.round(overdueRate * 100) / 100,
    overdueTasks,
    upcomingDeadlines,
    totalTasks: tasks.length
  };
};

/**
 * Calculate project health score
 * Combines progress + risk + proof + deadlines into ONE score.

 */
const calculateProjectHealth = (metrics) => {
  const {
    progress = { progress: 0 },
    projectRisk = { projectRiskScore: 0 },
    proofCompliance = { complianceRate: 0 },
    deadlineHealth = { overdueRate: 0 }
  } = metrics;

  const progressScore = progress.progress || 0;
  const riskScore = projectRisk.projectRiskScore || 0;
  const proofRate = proofCompliance.complianceRate || 0;
  const overdueRate = deadlineHealth.overdueRate || 0;

  // Normalize scores
  const riskAdjustedScore = Math.max(0, 100 - (riskScore * 25));
  const deadlineAdjustedScore = Math.max(0, 100 - overdueRate);

  // Weighted health score
  const healthScore = 
    (progressScore * 0.4) +
    (riskAdjustedScore * 0.3) +
    (proofRate * 0.2) +
    (deadlineAdjustedScore * 0.1);

  let healthLevel = 'healthy';
  let healthLabel = 'Healthy';

  if (healthScore >= 80) {
    healthLevel = 'excellent';
    healthLabel = 'Excellent';
  } else if (healthScore >= 60) {
    healthLevel = 'good';
    healthLabel = 'Good';
  } else if (healthScore >= 40) {
    healthLevel = 'warning';
    healthLabel = 'Needs Attention';
  } else {
    healthLevel = 'critical';
    healthLabel = 'Critical';
  }

  return {
    healthScore: Math.round(healthScore * 100) / 100,
    healthLevel,
    healthLabel,
    componentScores: {
      progress: progressScore,
      riskAdjusted: Math.round(riskAdjustedScore * 100) / 100,
      proofCompliance: proofRate,
      deadlineAdjusted: Math.round(deadlineAdjustedScore * 100) / 100
    }
  };
};

/**
 * Calculate all project metrics at once
//Combines progress + risk + proof + deadlines into ONE score.
//easier clean up
 */
export const calculateAllProjectMetrics = async (tasks, teamMembers, projectId) => {
  const progress = calculateProgress(tasks);
  const timeEfficiency = calculateProjectTimeEfficiency(tasks);
  const projectRisk = calculateProjectRisk(tasks);
  const proofCompliance = calculateProofCompliance(tasks);
  const contributorFairness = calculateContributorFairness(tasks, teamMembers);
  const deadlineHealth = calculateDeadlineHealth(tasks);
  const detectFR = detectFreeRiders(projectId);

  let freeRiders = {}, freeRiderCheckedAt = {};
  if (detectFR){
      const project = await Project.findById(projectId);
      freeRiders = project.metrics.freeRiders;
      freeRiderCheckedAt = project.metrics.freeRiderCheckedAt;
  }

  const metrics = {
    progress,
    timeEfficiency,
    projectRisk,
    proofCompliance,
    contributorFairness,
    deadlineHealth,
    freeRiders,
    freeRiderCheckedAt
  };
  const health = calculateProjectHealth(metrics);

  return {
    ...metrics,
    health,
    timestamp: new Date()
  };
};


export const updateProjectMetricsInDB = async (projectId) => {
  try {
    const tasks = await Task.find({ projectId }).lean();
    const project = await Project.findById(projectId).select('team');
    
    if (!tasks || !project) return;
    
    const metrics = await calculateAllProjectMetrics(tasks, project.team || [], project._id);
    
const mapEfficiencyToStatus = (efficiency) => {
  if (efficiency < 40) return 'low';
  if (efficiency < 70) return 'warning';
  if (efficiency < 90) return 'good';
  return 'high';
};


await Project.findByIdAndUpdate(projectId, {
  'metrics.lastCalculated': new Date(),
  'metrics.weightedProgress': metrics.progress,
  'metrics.timeEfficiency.value': metrics.timeEfficiency.projectEfficiency,
  'metrics.timeEfficiency.status': mapEfficiencyToStatus(metrics.timeEfficiency.projectEfficiency),
  'metrics.projectRiskScore': metrics.projectRisk.projectRiskScore,
  'metrics.proofCompliance': metrics.proofCompliance.complianceRate,
  'metrics.overdueRate': metrics.deadlineHealth.overdueRate,
  'metrics.healthScore': metrics.health.healthScore,
  'metrics.statusBreakdown': metrics.progress.statusBreakdown,
  'metrics.riskLevel': metrics.projectRisk.riskLevel,
  'metrics.healthLevel': metrics.health.healthLevel,
  progress: metrics.progress.progress
});
    
    return metrics;
  } catch (error) {
    console.error('Error updating project metrics:', error);
    return null;
  }
};


export const calculateTaskMetrics = (task) => {
  // Calculate efficiency
  const estimatedTime = task.estimatedTime || 1;
  const focusTime = task.totalFocusTime || 0;
  const efficiency = (focusTime / estimatedTime) * 100;

  let efficiencyStatus = 'normal';
  let efficiencyLabel = 'Ideal';


  if (efficiency < 35) {
    efficiencyStatus = 'low';
    efficiencyLabel = 'Rushed / Suspicious';
  } else if (efficiency >= 35 && efficiency < 75) {
    efficiencyStatus = 'warning';
    efficiencyLabel = 'Below Ideal';
  } else if (efficiency >= 75 && efficiency <= 120) {
    efficiencyStatus = 'good';
    efficiencyLabel = 'Ideal';
  } else if (efficiency > 120 && efficiency <= 200) {
    efficiencyStatus = 'warning';
    efficiencyLabel = 'Slightly Padded';
  } else {
    efficiencyStatus = 'high';
    efficiencyLabel = 'Padded Time';
  }

  // Calculate risk
  const risk = calculateTaskRisk(task);
  
  // Calculate deadline status
  const now = new Date();
  const deadline = new Date(task.deadline);
  const isOverdue = deadline < now && task.status !== 'completed';
  const daysUntilDeadline = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));

  const paddedTime = efficiency > 200;           // Worked >2x estimated
  const rushedCompletion = task.status === 'completed' && efficiency < 35;
  const noProof = !task.proofUploads || task.proofUploads.length === 0;
  const manualReviewRequired = paddedTime || rushedCompletion || noProof;

  return {
    efficiency: {
      percentage: Math.round(efficiency * 100) / 100,
      status: efficiencyStatus,
      label: efficiencyLabel,
      focusTime,
      estimatedTime
    },
    flags: {
      paddedTime,
      rushedCompletion,
      noProof,
      manualReviewRequired
    },
    risk,
    isOverdue,
    daysUntilDeadline: daysUntilDeadline < 0 ? 0 : daysUntilDeadline,
    hasProof: task.proofUploads && task.proofUploads.length > 0,
    proofCount: task.proofUploads ? task.proofUploads.length : 0,
    status: task.status || 'not_started'
  };
};


export const createProject = async (req, res) => {
  try {
    const { projectName, description, startDate, deadline, teamId, teamName, tags, gradingCriteria, mentorId} = req.body;
    const userId = req.user.id;
    const normalizedTeamId = Array.isArray(teamId) ? teamId[0] : teamId;
    const normalizedMentorId = mentorId && mentorId !== 'none' ? mentorId : null;
    // Basic validation
    if (!projectName || !description || !startDate || !deadline || !normalizedTeamId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Make sure the team exists
    const team = await Team.findById(normalizedTeamId).populate("members", "name username email");
    if (!team) return res.status(404).json({ error: "Team not found" });

    // Create project with creator ID from authenticated user
const projectData = {
  projectName,
  description,
  startDate,
  deadline,
  teamName: teamName || team.name || 'Unnamed Team',
  tags: tags || [],
  teamId: team._id,
  createdBy: userId,
  gradingCriteria: gradingCriteria || { taskCompletionWeight: 40, peerReviewWeight: 30, teacherReviewWeight: 30, allowPeerReview: true },

  metrics: {
    peerReviewPerMember: [],
    progress: {
      completedTasks: 0,
      progress: 0,
      statusBreakdown: { not_started: 0, active: 0, paused: 0, completed: 0 },
      totalTasks: 0
    },
    
    freeRiders: [],
    freeRidersCheckedAt: new Date(),
    timeEfficiency: {
      label: 'Low',
      projectEfficiency: 0,
      status: 'low',
      totalEstimatedTime: 0,
      totalFocusTime: 0
    },
    projectRisk: {
      averageRiskScore: 0,
      highRiskTasks: 0,
      mediumRiskTasks: 0,
      riskyTasks: 0,
      totalTasks: 0,
      projectRiskScore: 0,
      riskLabel: 'Low Risk',
      riskLevel: 'low'
    },
    proofCompliance: {
      complianceRate: 0,
      tasksWithProof: 0,
      totalTasks: 0
    },
    deadlineHealth: {
      overdueRate: 0,
      overdueTasks: 0,
      upcomingDeadlines: 0,
      totalTasks: 0
    },
    health: {
      componentScores: { deadlineAdjusted: 0, progress: 0, proofCompliance: 0, riskAdjusted: 0 },
      healthScore: 0,
      healthLabel: 'Healthy',
      healthLevel: 'healthy'
    },
    contributorFairness: {
      contributors: {},
      teamMemberCount: 0,
      freeRiderRisk: false
    }
  }
};
   const newProject = new Project(projectData);
    await newProject.save();
    team.projects.push(newProject._id);
    await team.save();
   if (normalizedMentorId) {
      
      await MentorProjectAssignment.create({
        mentor: normalizedMentorId,
        project: newProject._id
      });
    }
    await notifyProjectEvents.created(
      newProject._id,
      userId,
      team.members || []
    );


    // Populate teamId and createdBy before sending response
    const populatedProject = await Project.findById(newProject._id)
      .populate('teamId', 'name members')
      .populate('createdBy', 'name email');


    res.status(201).json(populatedProject);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    const deleteProject = await Project.findById(projectId)
    .populate('teamId', 'members')
    .populate('createdBy');
    
    if (!deleteProject) {
      return res.status(404).json({ error: "Project not found" });
    }
    
    // Check permissions
    const isCreator = deleteProject.createdBy._id.toString() === userId.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isCreator && !isAdmin) {
      return res.status(403).json({ error: `Not authorized to delete this project.` });
    }

    const deletedBy = await User.findById(userId);

    const teamMembers = await Team.findById(deleteProject.teamId)
      .populate("members");
    await notifyProjectEvents.deleteProject(
      projectId, 
      deleteProject,
      deletedBy,
      teamMembers.members
    )
    // Save deleted project info
    const deletedRecord = new DeletedProjects({
      deletedProjectName: deleteProject.projectName,
      projectID: deleteProject._id,
      memberList: deleteProject.teamId?.members.map(m => m.toString()) || [],
    });
    await deletedRecord.save();

    // Remove project from the team projects array
    if (deleteProject.teamId) {
      await Team.findByIdAndUpdate(deleteProject.teamId._id, { 
        $pull: { projects: deleteProject._id } 
      });
    }



    //Removing project from all teams `projects` arrays
    await Team.updateMany(
      { projects: projectId },
      { $pull: { projects: projectId } }
    );

    //Delete all tasks associated with the project
    await Task.deleteMany({ projectId: projectId });

    await MentorProjectAssignment.deleteMany({ project: projectId});

    // Delete the project
    await Project.findByIdAndDelete(projectId);


    res.status(200).json({ succes: true, projectDeleted: deleteProject?.projectName || deleteProject?.name ,message: `Project ${deleteProject?.projectName || deleteProject?.name || projectId} deleted successfully` });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const updateData = req.body;
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    // Check permissions
    const isCreator = project.createdBy.toString() === req.user.id;
    const isAuthorized = req.user.role === 'admin' || req.user.role === "teacher";
    if (!isCreator && !isAuthorized) {
      return res.status(403).json({ error: "Not authorized to update this project" });
    }
    const oldStatus = project.status;
    const newStatus = updateData.status;
    const statusChanged = newStatus && oldStatus !== newStatus;
    // Update project fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && updateData[key] !== project[key]) { //means only update if value is provided and different
        project[key] = updateData[key];
      }
    });

    await project.save();

    
    if (statusChanged) {
      await notifyProjectEvents.editProject(
        projectId,
        req.user.id,
        oldStatus,
        newStatus
      );
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const getAllProjects = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch projects created by the user
    let projects = await Project.find({ createdBy: userId })
      .populate("teamId", 'name members')
      .populate("createdBy", 'name email')
      .sort({ 'metrics.healthScore': -1, createdAt: -1 });

    // Include projects where user is in the team
    const teamProjects = await Project.find({}) // fetch all and filter in code
      .populate("teamId", 'name members')
      .populate("createdBy", 'name email')
      .sort({ 'metrics.healthScore': -1, createdAt: -1 });
      const now = new Date();
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(now.getDate() + 7);

      for (const project of projects) {
        const deadline = new Date(project.deadline);

        if (deadline > now && deadline <= sevenDaysFromNow) {
          const daysRemaining = Math.ceil(
            (deadline - now) / (1000 * 60 * 60 * 24)
          );
          await notifyProjectEvents.deadlineApproaching(
            project._id,
            daysRemaining
          );
        }
      }
    

    projects = [
      ...projects,
      ...teamProjects.filter(p => p.teamId?.members.some(m => m.toString() === userId))
    ];

    // Remove duplicates if any
    const uniqueProjects = Array.from(new Map(projects.map(p => [p._id.toString(), p])).values());

    // Add metrics
    const projectsWithMetrics = await Promise.all(
      uniqueProjects.map(async (project) => {
        const tasks = await Task.find({ projectId: project._id }).lean();
        const metrics = await calculateAllProjectMetrics(tasks, project.teamId?.members || [], project._id);
        project.teamId.members = await Promise.all(
          project.teamId.members.map((member) =>
            User.findById(member, "avatar name")
          )
        );
      

        return {
          ...project.toObject(),
          metrics
        };
      })
    );


    res.json(projectsWithMetrics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const project = await Project.findById(projectId)
      .populate('createdBy', 'name email avatar username')
      .populate({
        path: "teamId",
        select: "name",
        populate: {
          path: "members",
          select: "name email avatar username skills status onlineStatus"
        }
      });
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    
    // Get tasks and calculate metrics
    const tasks = await Task.find({ projectId }).lean();
    const metrics = await calculateAllProjectMetrics(tasks, project.team || [], project._id);
    // Update project metrics in DB (async)
    await updateProjectMetricsInDB(projectId);
  

    res.json({
      ...project.toObject(),
      metrics: project?.metrics,
      taskCount: tasks.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export const searchProjects = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === '') {
      return res.status(400).json({ error: "Search query is required" });
    }

    const projects = await Project.find({
      $or: [
        { projectName: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } } // works for array of strings
      ]
    })
      .populate('createdBy', 'name email')
      .populate('teamId', 'name members') // fixed populate
      .limit(20);

    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Get detailed project metrics dashboard
export const getProjectMetrics = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // Fetch project and populate creator & team members
    const project = await Project.findById(projectId)
      .populate('createdBy', 'name email')
      .populate('teamId', 'name members');

    if (!project) {
      return res.status(404).json({ 
        success: false,
        error: "Project not found" 
      });
    }
    const isTeacher = await MentorProjectAssignment.find({project: project._id, mentor: userId});
    // Check access
    const hasAccess = 
      project.createdBy._id.toString() === userId ||
      project.teamId?.members.some(member => member._id.toString() === userId) ||
      isTeacher
      

    if (!hasAccess) {
      return res.status(403).json({ 
        success: false,
        error: "Access denied to project" 
      });
    }

    // Get all tasks
    const tasks = await Task.find({ projectId })
      .populate('assignedTo', 'name email avatar')
      .lean();

    // Calculate metrics
    const metrics = await calculateAllProjectMetrics(tasks, project.teamId?.members || [], project._id);

    const tasksWithMetrics = tasks.map(task => ({
      ...task,
      taskMetrics: calculateTaskMetrics(task)
    }));

    tasksWithMetrics.sort((a, b) => b.taskMetrics.risk.riskScore - a.taskMetrics.risk.riskScore);

    await updateProjectMetricsInDB(projectId); // async update

    res.json({
      success: true,
      project: {
        _id: project._id,
        projectName: project.projectName,
        description: project.description,
        team: project.teamId,
        createdBy: project.createdBy,
        startDate: project.startDate,
        deadline: project.deadline,
        status: project.status
      },
      metrics,
      tasks: tasksWithMetrics,
      summary: {
        totalTasks: tasks.length,
        completedTasks: metrics.progress.completedTasks,
        highRiskTasks: metrics.projectRisk.highRiskTasks,
        overdueTasks: metrics.deadlineHealth.overdueTasks,
        teamSize: project.teamId?.members.length || 0,
        totalEstimatedTime: metrics.timeEfficiency.totalEstimatedTime,
        totalFocusTime: metrics.timeEfficiency.totalFocusTime
      },
      calculatedAt: new Date()
    });

  } catch (error) {
    console.error('Error getting project metrics:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get task-specific metrics
export const getTaskMetrics = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    const task = await Task.findById(taskId)
      .populate('assignedTo', 'name email avatar')
      .populate('projectId', 'projectName teamId')
      .lean();

    if (!task) {
      return res.status(404).json({
        success: false,
        error: "Task not found"
      });
    }

    // Populate project fully for access check
    const project = await Project.findById(task.projectId._id)
      .populate('createdBy', 'name email')
      .populate('teamId', 'members');

    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Project not found"
      });
    }

    const hasAccess =
      project.createdBy._id.toString() === userId ||
      task.assignedTo._id.toString() === userId ||
      project.teamId?.members.some(member => member.toString() === userId);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: "Access denied to task"
      });
    }

    const taskMetrics = calculateTaskMetrics(task);

    res.json({
      success: true,
      task: {
        _id: task._id,
        taskTitle: task.taskTitle,
        description: task.description,
        status: task.status,
        deadline: task.deadline,
        estimatedTime: task.estimatedTime,
        totalFocusTime: task.totalFocusTime,
        assignedTo: task.assignedTo,
        projectId: project._id,
        proofUploads: task.proofUploads,
        flags: task.flags
      },
      metrics: taskMetrics,
      project: {
        _id: project._id,
        projectName: project.projectName,
        team: project.teamId
      }
    });

  } catch (error) {
    console.error('Error getting task metrics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


// Get contributor analytics for a project
export const getContributorAnalytics = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    const project = await Project.findById(projectId)
      .populate('createdBy', 'name email')
      .populate({
        path: 'teamId',
        populate: {
          path: 'members',
          select: 'name username email avatar'
        }
      });

    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Project not found"
      });
    }

    // Check access
    const hasAccess = 
      project.createdBy._id.toString() === userId ||
      project.teamId?.members.some(member => member._id.toString() === userId);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: "Access denied"
      });
    }

    const [tasks, projectEvaluations, peerReviews, projectActivities] = await Promise.all([
      Task.find({ projectId })
        .populate('assignedTo', 'name username email avatar')
        .lean(),
      ProjectEvaluation.find({ projectId }).lean(),
      PeerReview.find({ projectId }).lean(),
      TaskActivityEvent.find({ projectId })
        .sort({ timestamp: -1 })
        .lean()
    ]);

    const metrics = await calculateAllProjectMetrics(tasks, project.teamId?.members || [], project._id);
    const teamMembers = project.teamId?.members || [];

    const contributorsById = {};
    const uniqueActivityDaysByUser = {};
    const projectEvaluationCategoryAverages = [];
    const totalProjectFocusTime = tasks.reduce((sum, task) => sum + (task.totalFocusTime || 0), 0);
    const totalProjectProgress = tasks.reduce((sum, task) => {
      if (Array.isArray(task.progressByUser) && task.progressByUser.length > 0) {
        return sum + task.progressByUser.reduce((progressSum, entry) => progressSum + (entry.progress || 0), 0);
      }
      return sum + 100;
    }, 0);

    const initContributor = (member) => ({
      user: {
        _id: member._id,
        name: member.name,
        username: member.username,
        email: member.email,
        avatar: member.avatar
      },
      stats: {
        assignedTasks: 0,
        completedTasks: 0,
        activeTasks: 0,
        pausedTasks: 0,
        notStartedTasks: 0,
        overdueTasks: 0,
        tasksWithProof: 0,
        proofUploads: 0,
        tasksTouched: 0,
        totalFocusTime: 0,
        totalEstimatedTime: 0,
        avgEfficiency: 0,
        highRiskTasks: 0,
        mediumRiskTasks: 0,
        lowRiskTasks: 0,
        averageRiskScore: 0,
        completionRate: 0,
        proofRate: 0,
        progressContribution: 0,
        focusContribution: 0,
        activityCount: 0,
        activeDays: 0,
        recentActivityCount: 0,
        timeLoggedEvents: 0,
        commentCount: 0,
        proofActivityCount: 0,
        statusChangeCount: 0,
        reassignmentCount: 0,
        lastActiveAt: null
      },
      scores: {
        peerReviewAverage: 0,
        peerReviewNormalized: 0,
        peerReviewCount: 0,
        memberEvaluationAverage: 0,
        memberEvaluationNormalized: 0,
        memberEvaluationCount: 0,
        teamEvaluationAverage: 0,
        teamEvaluationNormalized: 0,
        teamEvaluationCount: 0,
        qualityScore: 0
      },
      shares: {
        assigned: 0,
        completed: 0,
        progress: 0,
        focus: 0,
        activity: 0
      },
      indicators: {
        contributionShareScore: 0,
        deliveryScore: 0,
        efficiencyScore: 0,
        activityScore: 0,
        proofScore: 0,
        qualityScore: 0
      },
      recentWork: {
        completedTasks: [],
        activeTasks: [],
        overdueTasks: [],
        recentActivities: []
      },
      isCreator: false
    });

    teamMembers.forEach((member) => {
      const memberId = member._id.toString();
      contributorsById[memberId] = initContributor(member);
      contributorsById[memberId].isCreator = project.createdBy._id.toString() === memberId;
      uniqueActivityDaysByUser[memberId] = new Set();
    });

    tasks.forEach((task) => {
      const assigneeId = task.assignedTo?._id?.toString?.() || task.assignedTo?.toString?.();
      const riskScore = task.metrics?.riskScore || task.risk?.riskScore || 0;
      const riskLevel = task.risk?.riskLevel || (riskScore >= 4 ? 'high' : riskScore >= 2 ? 'medium' : 'low');
      const hasProof = Array.isArray(task.proofUploads) && task.proofUploads.length > 0;
      const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'completed';

      if (assigneeId && contributorsById[assigneeId]) {
        const contributor = contributorsById[assigneeId];
        contributor.stats.assignedTasks += 1;
        contributor.stats.totalEstimatedTime += task.estimatedTime || 0;
        contributor.stats.totalFocusTime += task.totalFocusTime || 0;
        contributor.stats.proofUploads += task.proofUploads?.length || 0;
        contributor.stats.tasksTouched += 1;

        if (task.status === 'completed') {
          contributor.stats.completedTasks += 1;
          contributor.recentWork.completedTasks.push({
            _id: task._id,
            taskTitle: task.taskTitle
          });
        } else if (task.status === 'active') {
          contributor.stats.activeTasks += 1;
          contributor.recentWork.activeTasks.push({
            _id: task._id,
            taskTitle: task.taskTitle
          });
        } else if (task.status === 'paused') {
          contributor.stats.pausedTasks += 1;
        } else {
          contributor.stats.notStartedTasks += 1;
        }

        if (isOverdue) {
          contributor.stats.overdueTasks += 1;
          contributor.recentWork.overdueTasks.push({
            _id: task._id,
            taskTitle: task.taskTitle
          });
        }

        if (hasProof) {
          contributor.stats.tasksWithProof += 1;
        }

        if (riskLevel === 'high') contributor.stats.highRiskTasks += 1;
        else if (riskLevel === 'medium') contributor.stats.mediumRiskTasks += 1;
        else contributor.stats.lowRiskTasks += 1;

        contributor.stats.averageRiskScore += riskScore;
      }

      if (Array.isArray(task.progressByUser) && task.progressByUser.length > 0) {
        task.progressByUser.forEach((entry) => {
          const progressUserId = entry.userId?.toString?.();
          if (!progressUserId || !contributorsById[progressUserId]) return;

          contributorsById[progressUserId].stats.progressContribution += entry.progress || 0;
          contributorsById[progressUserId].stats.focusContribution += entry.focusTime || 0;

          if (entry.proofUploaded?.yesOrNo) {
            contributorsById[progressUserId].stats.tasksWithProof += 1;
          }
        });
      } else if (assigneeId && contributorsById[assigneeId]) {
        contributorsById[assigneeId].stats.progressContribution += 100;
        contributorsById[assigneeId].stats.focusContribution += task.totalFocusTime || 0;
      }
    });

    projectEvaluations.forEach((evaluation) => {
      const categoryScores = evaluation.grading ? [
        evaluation.grading.technicalExecution?.score || 0,
        evaluation.grading.taskValidity?.score || 0,
        evaluation.grading.timeAuthenticity?.score || 0,
        evaluation.grading.teamwork?.score || 0,
        evaluation.grading.documentationQuality?.score || 0
      ] : [];

      if (categoryScores.length > 0) {
        const evaluationAverage = categoryScores.reduce((sum, score) => sum + score, 0) / categoryScores.length;
        projectEvaluationCategoryAverages.push(evaluationAverage);
      }

      (evaluation.memberEvaluations || []).forEach((memberEvaluation) => {
        const memberId = memberEvaluation.member?.toString?.();
        if (!memberId || !contributorsById[memberId]) return;

        contributorsById[memberId].scores.memberEvaluationAverage += memberEvaluation.contributionScore || 0;
        contributorsById[memberId].scores.memberEvaluationCount += 1;
      });
    });

    peerReviews.forEach((review) => {
      const revieweeId = review.reviewee?.toString?.();
      if (!revieweeId || !contributorsById[revieweeId]) return;

      contributorsById[revieweeId].scores.peerReviewAverage += review.totalScore || 0;
      contributorsById[revieweeId].scores.peerReviewCount += 1;
    });

    const sevenDaysAgo = new Date(Date.now() - (7 * 24 * 60 * 60 * 1000));

    projectActivities.forEach((activity) => {
      const activityUserId = activity.userId?.toString?.();
      if (!activityUserId || !contributorsById[activityUserId]) return;

      const contributor = contributorsById[activityUserId];
      contributor.stats.activityCount += 1;

      const activityTimestamp = activity.timestamp ? new Date(activity.timestamp) : null;
      if (activityTimestamp) {
        uniqueActivityDaysByUser[activityUserId].add(activityTimestamp.toISOString().slice(0, 10));
        if (!contributor.stats.lastActiveAt || activityTimestamp > new Date(contributor.stats.lastActiveAt)) {
          contributor.stats.lastActiveAt = activity.timestamp;
        }
        if (activityTimestamp >= sevenDaysAgo) {
          contributor.stats.recentActivityCount += 1;
        }
      }

      if (activity.eventType === 'time_logged') contributor.stats.timeLoggedEvents += 1;
      if (activity.eventType === 'comment_added') contributor.stats.commentCount += 1;
      if (['proof_uploaded', 'proof_viewed', 'proof_deleted'].includes(activity.eventType)) contributor.stats.proofActivityCount += 1;
      if (['status_changed', 'start', 'pause', 'resume', 'complete', 'reopen'].includes(activity.eventType)) contributor.stats.statusChangeCount += 1;
      if (activity.eventType === 'task_reassigned') contributor.stats.reassignmentCount += 1;

      if (contributor.recentWork.recentActivities.length < 4) {
        contributor.recentWork.recentActivities.push({
          _id: activity._id,
          eventType: activity.eventType,
          action: getActionMessage(activity),
          timestamp: activity.timestamp,
          taskTitle: activity.metadata?.taskTitle || 'Task activity'
        });
      }
    });

    const contributorList = Object.values(contributorsById);

    const assignedTotal = contributorList.reduce((sum, contributor) => sum + contributor.stats.assignedTasks, 0);
    const completedTotal = contributorList.reduce((sum, contributor) => sum + contributor.stats.completedTasks, 0);
    const maxActivityCount = Math.max(...contributorList.map((contributor) => contributor.stats.activityCount), 0);

    const teamEvaluationAverage = projectEvaluationCategoryAverages.length > 0
      ? projectEvaluationCategoryAverages.reduce((sum, score) => sum + score, 0) / projectEvaluationCategoryAverages.length
      : 0;

    const normalizeEfficiency = (efficiency) => {
      if (!efficiency) return 0;
      const distanceFromIdeal = Math.abs(efficiency - 100);
      return Math.max(0, Math.min(100, 100 - distanceFromIdeal));
    };

    contributorList.forEach((contributor) => {
      const { stats, scores } = contributor;

      stats.averageRiskScore = stats.assignedTasks > 0
        ? Number((stats.averageRiskScore / stats.assignedTasks).toFixed(2))
        : 0;
      stats.avgEfficiency = stats.totalEstimatedTime > 0
        ? Number(((stats.totalFocusTime / stats.totalEstimatedTime) * 100).toFixed(2))
        : 0;
      stats.completionRate = stats.assignedTasks > 0
        ? Number(((stats.completedTasks / stats.assignedTasks) * 100).toFixed(2))
        : 0;
      stats.proofRate = stats.assignedTasks > 0
        ? Number(((stats.tasksWithProof / stats.assignedTasks) * 100).toFixed(2))
        : 0;
      stats.activeDays = uniqueActivityDaysByUser[contributor.user._id.toString()]?.size || 0;

      scores.peerReviewAverage = scores.peerReviewCount > 0
        ? Number((scores.peerReviewAverage / scores.peerReviewCount).toFixed(2))
        : 0;
      scores.peerReviewNormalized = Number(((scores.peerReviewAverage / 5) * 100).toFixed(2));
      scores.memberEvaluationAverage = scores.memberEvaluationCount > 0
        ? Number((scores.memberEvaluationAverage / scores.memberEvaluationCount).toFixed(2))
        : 0;
      scores.memberEvaluationNormalized = Number(((scores.memberEvaluationAverage / 10) * 100).toFixed(2));
      scores.teamEvaluationAverage = Number(teamEvaluationAverage.toFixed(2));
      scores.teamEvaluationNormalized = Number(((teamEvaluationAverage / 10) * 100).toFixed(2));
      scores.teamEvaluationCount = projectEvaluations.length;

      contributor.shares.assigned = assignedTotal > 0
        ? Number(((stats.assignedTasks / assignedTotal) * 100).toFixed(2))
        : 0;
      contributor.shares.completed = completedTotal > 0
        ? Number(((stats.completedTasks / completedTotal) * 100).toFixed(2))
        : 0;
      contributor.shares.progress = totalProjectProgress > 0
        ? Number(((stats.progressContribution / totalProjectProgress) * 100).toFixed(2))
        : 0;
      contributor.shares.focus = totalProjectFocusTime > 0
        ? Number(((stats.focusContribution / totalProjectFocusTime) * 100).toFixed(2))
        : 0;
      contributor.shares.activity = maxActivityCount > 0
        ? Number(((stats.activityCount / maxActivityCount) * 100).toFixed(2))
        : 0;

      contributor.indicators.contributionShareScore = Number((
        (contributor.shares.progress * 0.5) +
        (contributor.shares.completed * 0.3) +
        (contributor.shares.focus * 0.2)
      ).toFixed(2));
      contributor.indicators.deliveryScore = stats.completionRate;
      contributor.indicators.efficiencyScore = Number(normalizeEfficiency(stats.avgEfficiency).toFixed(2));
      contributor.indicators.activityScore = contributor.shares.activity;
      contributor.indicators.proofScore = stats.proofRate;

      const riskPenalty = Math.min(20, stats.averageRiskScore * 5);
      const qualityBase = (
        (scores.peerReviewNormalized * 0.45) +
        (scores.memberEvaluationNormalized * 0.3) +
        (scores.teamEvaluationNormalized * 0.25)
      );

      contributor.indicators.qualityScore = Number(Math.max(0, qualityBase - riskPenalty).toFixed(2));
      scores.qualityScore = contributor.indicators.qualityScore;

      contributor.contributionScore = Number((
        (contributor.indicators.contributionShareScore * 0.3) +
        (contributor.indicators.deliveryScore * 0.18) +
        (contributor.indicators.efficiencyScore * 0.14) +
        (contributor.indicators.activityScore * 0.12) +
        (scores.peerReviewNormalized * 0.1) +
        (scores.memberEvaluationNormalized * 0.08) +
        (scores.teamEvaluationNormalized * 0.03) +
        (contributor.indicators.proofScore * 0.05)
      ).toFixed(2));
    });

    const contributors = contributorList.map((contributor) => {
      const fairnessStats = metrics.contributorFairness.contributors[contributor.user._id.toString()] || {
        assignedTasks: 0,
        completedTasks: 0,
        assignedPercentage: 0,
        completedPercentage: 0,
        isFreeRider: false
      };

      return {
        ...contributor,
        stats: {
          ...contributor.stats,
          assignedPercentage: fairnessStats.assignedPercentage || 0,
          completedPercentage: fairnessStats.completedPercentage || 0,
          isFreeRider: fairnessStats.isFreeRider || false
        }
      };
    });

    // Sort by contribution
    contributors.sort((a, b) => b.contributionScore - a.contributionScore);

    res.json({
      success: true,
      project: {
        _id: project._id,
        projectName: project.projectName
      },
      contributors,
      summary: {
        totalTeamMembers: teamMembers.length,
        freeRiderRisk: metrics.contributorFairness.freeRiderRisk,
        totalTasks: tasks.length,
        completedTasks: metrics.progress.completedTasks,
        totalFocusTime: totalProjectFocusTime,
        totalEstimatedTime: tasks.reduce((sum, task) => sum + (task.estimatedTime || 0), 0),
        averageContributionScore: contributors.length > 0
          ? Number((contributors.reduce((sum, contributor) => sum + contributor.contributionScore, 0) / contributors.length).toFixed(2))
          : 0,
        weights: {
          contributionShare: 30,
          delivery: 18,
          efficiency: 14,
          activity: 12,
          peerScore: 10,
          memberEvaluation: 8,
          teamEvaluation: 3,
          proof: 5
        }
      }
    });

  } catch (error) {
    console.error('Error getting contributor analytics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};


// Force refresh project metrics
export const refreshProjectMetrics = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;
    
    const project = await Project.findById(projectId);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Project not found"
      });
    }
    
    // Only project creator or admin can force refresh
    const isCreator = project.createdBy.toString() === userId;
    const isAdmin = req.user.role === 'admin';
    
    if (!isCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to refresh metrics"
      });
    }
    
    const metrics = await updateProjectMetricsInDB(projectId);
    
    if (!metrics) {
      return res.status(500).json({
        success: false,
        error: "Failed to calculate metrics"
      });
    }
    
    res.json({
      success: true,
      message: "Project metrics refreshed successfully",
      metrics,
      refreshedAt: new Date()
    });
  } catch (error) {
    console.error('Error refreshing project metrics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
}


export const notifyProjectEvents = {
  // When a project is created
  created: async (projectId, creatorId, teamMembers) => {
    try {
      const project = await Project.findById(projectId).populate('teamId');
      const creator = await User.findById(creatorId);
      
      if (!project || !creator) return null;

      // Notify all team members about new project
      const notifications = [];
      for (const member of teamMembers) {
        if (member?._id !== creatorId) {
          const notification = await createNotification({
            userId: member._id,
            type: 'project_created',
            title: 'New Project Created!',
            message: `${creator.name || creator.username} created a new project: "${project.projectName}"`,
            data: {
              projectId: project._id,
              creatorId: creatorId,
              projectName: project.projectName,
              teamId: project.teamId?._id
            },
            priority: 'high',
            actionUrl: `/user-app/projects`
          });
          notifications.push(notification);
        }
      }

      // notify the creator
      // await createNotification({
      //   userId: creatorId,
      //   type: 'project_created_confirm',
      //   title: 'Project Created Successfully',
      //   message: `You created "${project.projectName}" successfully`,
      //   data: {
      //     projectId: project._id,
      //     projectName: project.projectName
      //   },
      //   priority: 'medium',
      //   actionUrl: `/user-app/my-project/${project._id}`
      // });

      return notifications;
    } catch (error) {
      console.error('Error creating project notifications:', error);
      return null;
    }
  },

  // When a task is assigned
  taskAssigned: async (taskId, assignerId, assigneeId) => {
    try {
      const task = await Task.findById(taskId).populate('projectId');
      const assigner = await User.findById(assignerId);
      const assignee = await User.findById(assigneeId);
      
      if (!task || !assigner || !assignee) return null;

      // Notify the assignee
      const notification = await createNotification({
        userId: assigneeId,
        type: 'task_created',
        title: 'New Task Assigned',
        message: `${assigner.name || assigner.username} assigned you a task: "${task.taskTitle}" in ${task.projectId?.projectName}`,
        data: {
          taskId: task._id,
          projectId: task.projectId?._id,
          projectName: task.projectId?.projectName,
          assignerId: assignerId,
          assignerName: assigner.name || assigner.username,
          deadline: task.deadline
        },
        priority: 'high',
        actionUrl: `/user-app/tasks/${task._id}`
      });

      return notification;
    } catch (error) {
      console.error('Error creating task assignment notification:', error);
      return null;
    }
  },

  // When project status changes
  editProject: async (projectId, updaterId, oldStatus, newStatus) => {
    try {
      const project = await Project.findById(projectId).populate('teamId');
      const updater = await User.findById(updaterId);
      
      if (!project || !updater) return null;

      // Get all team members
      const teamMembers = project.teamId?.members || [];
      
      const notifications = [];
      for (const member of teamMembers) {
        const notification = await createNotification({
          userId: member.user?._id || member._id,
          type: 'project_status_changed',
          title: 'Project Status Updated',
          message: `${updater.name || updater.username} changed project "${project.projectName}" from ${oldStatus} to ${newStatus}`,
          data: {
            projectId: project._id,
            projectName: project.projectName,
            oldStatus,
            newStatus,
            updaterId: updaterId
          },
          priority: 'medium',
          actionUrl: `/user-app/my-project/${project._id}`
        });
        notifications.push(notification);
      }

      return notifications;
    } catch (error) {
      console.error('Error creating status change notifications:', error);
      return null;
    }
  },

  // When project is nearing deadline
  deadlineApproaching: async (projectId, daysRemaining) => {
    try {
      const project = await Project.findById(projectId).populate('teamId');
      
      if (!project) return null;
      const team = await Team.findById(project.teamId)
        .populate("members", "name username email");

      // Get all team members
      const teamMembers = team.members || [];


      const message = `Project "${project.projectName}" is due in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`
      const lastNotification = await Notification.findOne({ message }).sort({ createdAt: -1 });

      const now = Date.now();
      const sixHours = 6 * 60 * 60 * 1000;
      const notified = lastNotification  && (now - lastNotification.createdAt.getTime()) <= (sixHours);
      
      if(!notified){
      const notifications = [];
      for (const member of teamMembers) {
        const notification = await createNotification({
          userId: member._id,
          type: 'project_deadline',
          title: 'Project Deadline Approaching!',
          message: `Project "${project.projectName}" is due in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`,
          data: {
            projectId: project._id,
            projectName: project.projectName,
            deadline: project.deadline,
            daysRemaining
          },
          priority: daysRemaining <= 3 ? 'urgent' : 'high',
          actionUrl: `/user-app/my-project/${project._id}`
        });
        notifications.push(notification);
      }
            return notifications;

      }

    } catch (error) {
      console.error('Error creating deadline notifications:', error);
      return null;
    }
  },

  // When someone comments on project
  commentAdded: async (projectId, commenterId, comment) => {
    try {
      const project = await Project.findById(projectId).populate('teamId');
      const commenter = await User.findById(commenterId);
      
      if (!project || !commenter) return null;

      // Get all team members except the commenter
      const teamMembers = project.teamId?.members || [];
      
      const notifications = [];
      for (const member of teamMembers) {
        const memberId = member.user?._id || member._id;
        if (memberId.toString() !== commenterId) {
          const notification = await createNotification({
            userId: memberId,
            type: 'project_comment',
            title: 'New Project Comment',
            message: `${commenter.name || commenter.username} commented on project "${project.projectName}": ${comment.substring(0, 100)}${comment.length > 100 ? '...' : ''}`,
            data: {
              projectId: project._id,
              projectName: project.projectName,
              commenterId: commenterId,
              comment,
              commenterName: commenter.name || commenter.username
            },
            priority: 'medium',
            actionUrl: `/user-app/my-project/${project._id}`
          });
          notifications.push(notification);
        }
      }

      return notifications;
    } catch (error) {
      console.error('Error creating comment notifications:', error);
      return null;
    }
  },

  //delete project
  deleteProject: async (projectId, deletedProject, deletedBy, teamMembers) => {

      const notifications = [];
      for (const member of teamMembers) {
        if (member._id !== deletedBy._id) {
          const notification = await createNotification({
            userId: member._id,
            type: 'project_deleted',
            title: `Project "${deletedProject.projectName}" deleted by ${deletedBy.username}!`,
            message: `${deletedBy.name || deletedBy.username} deleted a project: "${deletedProject.projectName}"`,
            data: {
              projectId: projectId,
              deletedBy: deletedBy._id,
              projectName: deletedProject.projectName,
              teamId: deletedProject.teamId?._id
            },
            priority: 'high',
            actionUrl: `/user-app/projects`
          });
          notifications.push(notification);
        }
      }
  }
};
