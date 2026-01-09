// controllers/adminController.js
import DeletedProjects from "../models/deletedProjectInfo.js";
import DeletedTaskInfo from "../models/deletedTaskInfo.js";
import EditedTaskData from "../models/editDataInfo.js";
import LoginAttempt from "../models/login_logs.js"; 
import PasswordReset from "../models/passwordReset.js";
import Project from "../models/projects.js";
import Task from "../models/tasks.js";
import User from "../models/user.js";
import usersData from "../models/user.js";

export const getSecurityStats = async (req, res) => {
  try {
    // Total login attempts
    const totalLogins = await LoginAttempt.countDocuments({});

    //total loginspast seven days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const totalLoginsLast7Days = await LoginAttempt.countDocuments({
      date: { $gte: sevenDaysAgo } // only logs from last 7 days
    });

    // Failed login attempts
    const failedLogins = await LoginAttempt.countDocuments({ status: "Failed" });

    //failed login attempts past 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const failedLoginsLast24Hrs = await LoginAttempt.countDocuments({
      status: "Failed",
      date: { $gte: oneDayAgo }
    });

    
    // Password reset requests
    const passwordResets = await PasswordReset.countDocuments({});

    //password resets in 7 days
    const passwordResetsLast7Days = await PasswordReset.countDocuments({
      date: { $gte: sevenDaysAgo }
    });

    
    // // Recent suspicious activities (you can define your own criteria)
    // const recentSuspicious = await LoginAttempt.find({ suspicious: true })
    //   .sort({ createdAt: -1 })
    //   .limit(5);

    res.json({
      totalLogins,
      totalLoginsLast7Days,
      failedLogins,
      failedLoginsLast24Hrs,
      passwordResets,
      passwordResetsLast7Days
      //recentSuspicious
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
// controllers/adminController.js
export const loginAttempts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20; // Dynamic limit from frontend
    const skip = (page - 1) * limit;

    const logs = await LoginAttempt.find()
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const total = await LoginAttempt.countDocuments();
    
    res.json({
      logs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
        limit: limit
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching login logs" });
  }
};

export const failedLogin = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const logs = await LoginAttempt.find({ status: "Failed" })
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    const total = await LoginAttempt.countDocuments({ status: "Failed" });
    
    res.json({
      logs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
        limit: limit
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching failed logins" });
  }
};

export const passwordResetList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const resets = await PasswordReset.find()
      .sort({ requestedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await PasswordReset.countDocuments();
    
    res.json({
      logs: resets,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
        limit: limit
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching password resets" });
  }
};

export const getAllUsers = async (req, res) => {
  try{
      const totalUsersInDB = await usersData.countDocuments({});

      const allUsers = await usersData.find({}, {name: 1, username:1,  email: 1, joinedOn:1, status:1, role:1});

      res.status(200).json({
        totalUsersInDB,
        allUsers,
  });
  }catch(err){
    res.status(500).json({message: `Error Fetching Data: ${err}`});
  }
}

export const updateStatus = async (req, res) => {
  try{
    const { id } = req.params;
    const updatedData  = req.body;
    const updatedUser = await usersData.findByIdAndUpdate(id, updatedData, {
      new: true,
    });
    res.status(200).json(updatedUser);
  }catch(err){
    res.status(500).json({message : `Error Fetching Data: ${err}`});
  }
}

// Get deleted projects
export const getDeletedProjects = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const deletedProjects = await DeletedProjects.find()
      .sort({ deletedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('projectID', 'projectName');

    const total = await DeletedProjects.countDocuments();
    
    res.json({
      projects: deletedProjects,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
        limit: limit
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching deleted projects" });
  }
};

// Get deleted tasks
export const getDeletedTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const deletedTasks = await DeletedTaskInfo.find()
      .sort({ deletedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('taskID', 'taskName')
      .populate('assignedTo', 'name email');

    const total = await DeletedTaskInfo.countDocuments();
    
    res.json({
      tasks: deletedTasks,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
        limit: limit
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching deleted tasks" });
  }
};

// Get edited tasks history
export const getEditedTasksHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const editedTasks = await EditedTaskData.find()
      .sort({ editMadeAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('taskId', 'taskName');

    const total = await EditedTaskData.countDocuments();
    
    res.json({
      edits: editedTasks,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
        limit: limit
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching task edit history" });
  }
};

// Get activity summary for dashboard
export const getActivitySummary = async (req, res) => {
  try {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get counts for different activities
    const [
      deletedProjectsCount,
      deletedProjectsLast7Days,
      deletedTasksCount,
      deletedTasksLast7Days,
      taskEditsCount,
      taskEditsLast7Days
    ] = await Promise.all([
      DeletedProjects.countDocuments(),
      DeletedProjects.countDocuments({ deletedAt: { $gte: sevenDaysAgo } }),
      DeletedTaskInfo.countDocuments(),
      DeletedTaskInfo.countDocuments({ deletedAt: { $gte: sevenDaysAgo } }),
      EditedTaskData.countDocuments(),
      EditedTaskData.countDocuments({ editMadeAt: { $gte: sevenDaysAgo } })
    ]);

    // Get recent activities for timeline
    const recentActivities = await Promise.all([
      DeletedProjects.find().sort({ deletedAt: -1 }).limit(3),
      DeletedTaskInfo.find().sort({ deletedAt: -1 }).limit(3),
      EditedTaskData.find().sort({ editMadeAt: -1 }).limit(3)
    ]);

    const allActivities = [
      ...recentActivities[0].map(item => ({ ...item.toObject(), type: 'project_deleted' })),
      ...recentActivities[1].map(item => ({ ...item.toObject(), type: 'task_deleted' })),
      ...recentActivities[2].map(item => ({ ...item.toObject(), type: 'task_edited' }))
    ].sort((a, b) => {
      const dateA = a.deletedAt || a.editMadeAt;
      const dateB = b.deletedAt || b.editMadeAt;
      return new Date(dateB) - new Date(dateA);
    }).slice(0, 5);

    res.json({
      summary: {
        deletedProjects: {
          total: deletedProjectsCount,
          last7Days: deletedProjectsLast7Days
        },
        deletedTasks: {
          total: deletedTasksCount,
          last7Days: deletedTasksLast7Days
        },
        taskEdits: {
          total: taskEditsCount,
          last7Days: taskEditsLast7Days
        }
      },
      recentActivities: allActivities
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching activity summary" });
  }
};
export const getProjectsStats = async (req, res) => {
  try {
    const activeProjects = await Project.countDocuments({});
    const deletedProjects = await DeletedProjects.countDocuments({});
    const totalProjects = activeProjects + deletedProjects;

    const editedTasks = await EditedTaskData.countDocuments({});
    
    res.json({
      totalProjects,
      activeProjects,
      deletedProjects,
      editedTasks
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
// Get performance analytics
export const getPerformanceAnalytics = async (req, res) => {
  try {
    const { timeRange = '7days', projectId = 'all' } = req.query;
    
    // Calculate date range
    let startDate = new Date();
    switch (timeRange) {
      case '7days':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case 'all':
      default:
        startDate = null;
    }

    // Build queries
    let projectQuery = {};
    let taskQuery = {};
    
    if (projectId !== 'all') {
      projectQuery._id = projectId;
      taskQuery.projectId = projectId;
    }
    
    if (startDate) {
      taskQuery.createdAt = { $gte: startDate };
    }

    // Fetch data
    const [projects, allTasks, totalTasksCount] = await Promise.all([
      Project.find(projectQuery).lean(),
      Task.find(taskQuery)
        .populate('assignedTo', 'name email')
        .populate('projectId', 'projectName progress metrics')
        .lean(),
      Task.countDocuments(taskQuery)
    ]);

    // Calculate all metrics
    const overviewMetrics = calculateOverviewMetrics(projects, allTasks);
    const efficiencyData = generateEfficiencyData(allTasks, timeRange);
    const riskDistribution = generateRiskDistribution(allTasks);
    const progressTrends = generateProgressTrends(projects, timeRange);
    const deadlineMetrics = calculateDeadlineMetrics(allTasks);
    const topProjects = getTopProjects(projects);
    const bottleneckTasks = identifyBottleneckTasks(allTasks);
    const freeRiderAlerts = identifyFreeRiders(allTasks);

    res.json({
      success: true,
      data: {
        overviewMetrics,
        efficiencyData,
        riskDistribution,
        progressTrends,
        deadlineMetrics,
        topProjects,
        bottleneckTasks,
        freeRiderAlerts
      },
      metadata: {
        totalTasks: totalTasksCount,
        totalProjects: projects.length,
        timeRange,
        generatedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Error in getPerformanceAnalytics:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching analytics data',
      error: error.message 
    });
  }
};

// Helper functions
const calculateOverviewMetrics = (projects, tasks) => {
  if (tasks.length === 0) {
    return {
      systemHealth: 0,
      activeProjects: 0,
      totalTasks: 0,
      avgEfficiency: 0,
      riskScore: 0,
      proofCompliance: 0
    };
  }

  let totalEfficiency = 0;
  let totalRiskScore = 0;
  let tasksWithProof = 0;
  let totalHealth = 0;
  let projectsWithHealth = 0;
  
  // Calculate from tasks
  tasks.forEach(task => {
    // Efficiency calculation
    const estimatedTime = task.estimatedTime || 1;
    const focusTime = task.totalFocusTime || 0;
    const efficiency = (focusTime / estimatedTime) * 100;
    totalEfficiency += Math.min(efficiency, 200); // Cap at 200%
    
    // Risk score from task metrics
    totalRiskScore += task.metrics?.riskScore || task.risk?.riskScore || 0;
    
    // Proof compliance
    if (task.proofUploads && task.proofUploads.length > 0) {
      tasksWithProof++;
    }
  });

  // Calculate from projects
  projects.forEach(project => {
    if (project.metrics?.health?.healthScore) {
      totalHealth += project.metrics.health.healthScore;
      projectsWithHealth++;
    }
  });

  const avgEfficiency = totalEfficiency / tasks.length;
  const avgRiskScore = totalRiskScore / tasks.length;
  const proofCompliance = (tasksWithProof / tasks.length) * 100;
  const systemHealth = projectsWithHealth > 0 ? totalHealth / projectsWithHealth : 0;

  return {
    systemHealth: Math.round(systemHealth),
    activeProjects: projects.filter(p => p.status === 'ongoing').length,
    totalTasks: tasks.length,
    avgEfficiency: parseFloat(avgEfficiency.toFixed(1)),
    riskScore: parseFloat(avgRiskScore.toFixed(2)),
    proofCompliance: parseFloat(proofCompliance.toFixed(1))
  };
};

const generateEfficiencyData = (tasks, timeRange) => {
  const efficiencyData = [];
  
  // Group by date based on timeRange
  const groupedData = {};
  const now = new Date();
  
  tasks.forEach(task => {
    const createdAt = new Date(task.createdAt);
    let periodKey;
    
    switch (timeRange) {
      case '7days':
        periodKey = createdAt.toISOString().split('T')[0]; // Daily
        break;
      case '30days':
        // Weekly grouping
        const weekStart = new Date(createdAt);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        periodKey = `Week ${weekStart.toISOString().split('T')[0]}`;
        break;
      case '90days':
      case 'all':
        // Monthly grouping
        periodKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;
        break;
    }
    
    if (!groupedData[periodKey]) {
      groupedData[periodKey] = {
        totalEfficiency: 0,
        totalEstimated: 0,
        totalActual: 0,
        count: 0
      };
    }
    
    const estimated = task.estimatedTime || 1;
    const actual = task.totalFocusTime || 0;
    const efficiency = (actual / estimated) * 100;
    
    groupedData[periodKey].totalEfficiency += Math.min(efficiency, 200);
    groupedData[periodKey].totalEstimated += estimated;
    groupedData[periodKey].totalActual += actual;
    groupedData[periodKey].count++;
  });
  
  // Convert to array format
  Object.entries(groupedData).forEach(([period, data]) => {
    efficiencyData.push({
      name: period,
      efficiency: parseFloat((data.totalEfficiency / data.count).toFixed(1)),
      estimated: parseFloat((data.totalEstimated / 3600).toFixed(1)), // Convert to hours
      actual: parseFloat((data.totalActual / 3600).toFixed(1)) // Convert to hours
    });
  });
  
  // Sort by date
  efficiencyData.sort((a, b) => a.name.localeCompare(b.name));
  
  // If no data, return default structure
  if (efficiencyData.length === 0) {
    return [
      { name: 'Week 1', efficiency: 0, estimated: 0, actual: 0 },
      { name: 'Week 2', efficiency: 0, estimated: 0, actual: 0 }
    ];
  }
  
  return efficiencyData;
};

const generateRiskDistribution = (tasks) => {
  const distribution = {
    'High Risk': 0,
    'Medium Risk': 0,
    'Low Risk': 0
  };
  
  tasks.forEach(task => {
    const riskLabel = task.risk?.riskLabel || 'Low Risk';
    distribution[riskLabel] = (distribution[riskLabel] || 0) + 1;
  });
  
  const total = tasks.length;
  const result = [];
  
  if (total > 0) {
    Object.entries(distribution).forEach(([name, count]) => {
      if (count > 0) {
        result.push({
          name,
          value: parseFloat(((count / total) * 100).toFixed(1))
        });
      }
    });
  }
  
  return result;
};

const generateProgressTrends = (projects, timeRange) => {
  const trends = [];
  const now = new Date();
  
  // Create timeline based on timeRange
  let periods = 5;
  switch (timeRange) {
    case '7days':
      periods = 7;
      break;
    case '30days':
      periods = 4; // 4 weeks
      break;
    case '90days':
      periods = 3; // 3 months
      break;
  }
  
  for (let i = 0; i < periods; i++) {
    let periodName;
    switch (timeRange) {
      case '7days':
        const day = new Date(now);
        day.setDate(day.getDate() - (periods - i - 1));
        periodName = `Day ${i + 1}`;
        break;
      case '30days':
        periodName = `Week ${i + 1}`;
        break;
      case '90days':
      case 'all':
        periodName = `Month ${i + 1}`;
        break;
    }
    
    // Calculate progress for this period
    const targetProgress = Math.round((100 / periods) * (i + 1));
    
    // For simplicity, we'll use actual progress from projects
    // In a real app, you'd filter projects by creation date
    const actualProgress = projects.length > 0 
      ? projects.reduce((sum, proj) => sum + (proj.progress || 0), 0) / projects.length
      : targetProgress * 0.8;
    
    trends.push({
      week: periodName,
      planned: targetProgress,
      actual: Math.min(Math.max(actualProgress, 0), 100)
    });
  }
  
  return trends;
};

const calculateDeadlineMetrics = (tasks) => {
  const now = new Date();
  let onTime = 0;
  let overdue = 0;
  let upcoming = 0;
  
  tasks.forEach(task => {
    if (!task.deadline) return;
    
    const deadline = new Date(task.deadline);
    const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    
    if (task.status === 'completed' && diffDays >= 0) {
      onTime++;
    } else if (diffDays < 0 && task.status !== 'completed') {
      overdue++;
    } else if (diffDays >= 0 && diffDays <= 7) {
      upcoming++;
    }
  });
  
  const total = tasks.length || 1;
  
  return {
    onTime: Math.round((onTime / total) * 100),
    overdue: Math.round((overdue / total) * 100),
    upcoming: Math.round((upcoming / total) * 100)
  };
};

const getTopProjects = (projects) => {
  return projects
    .map(project => ({
      id: project._id,
      name: project.projectName || 'Unnamed Project',
      health: project.metrics?.health?.healthScore || 0,
      efficiency: project.metrics?.timeEfficiency?.projectEfficiency || 0,
      risk: project.metrics?.projectRisk?.projectRiskScore || 0,
      progress: project.progress || 0
    }))
    .sort((a, b) => b.health - a.health)
    .slice(0, 5);
};

const identifyBottleneckTasks = (tasks) => {
  const bottlenecks = tasks
    .filter(task => {
      const isCompleted = task.status === 'completed';
      const isOverdue = task.metrics?.isOverdue;
      const daysUntilDeadline = task.metrics?.daysUntilDeadline || 999;
      const efficiency = task.metrics?.efficiency || 0;
      
      return (!isCompleted && (isOverdue || daysUntilDeadline < 0)) || efficiency < 50;
    })
    .map(task => {
      const delay = task.metrics?.daysUntilDeadline || 0;
      let impact = 'Medium';
      if (delay > 7 || task.priority === 'High') impact = 'High';
      if (delay <= 3 && task.priority === 'Low') impact = 'Low';
      
      return {
        id: task._id,
        name: task.taskTitle,
        project: task.projectId?.projectName || 'Unknown Project',
        delay: Math.abs(delay),
        impact
      };
    })
    .slice(0, 10);
  
  return bottlenecks;
};

const identifyFreeRiders = async (tasks) => {
  const userTaskMap = {};
  
  // Count tasks per user
  tasks.forEach(task => {
    if (task.assignedTo) {
      const userId = task.assignedTo._id || task.assignedTo;
      if (!userTaskMap[userId]) {
        userTaskMap[userId] = {
          assigned: 0,
          completed: 0,
          name: task.assignedTo.name || 'Unknown User',
          project: task.projectId?.projectName || 'Multiple Projects'
        };
      }
      
      userTaskMap[userId].assigned++;
      if (task.status === 'completed') {
        userTaskMap[userId].completed++;
      }
    }
  });
  
  // Find users with low completion rate
  const freeRiders = Object.entries(userTaskMap)
    .map(([userId, data]) => ({
      id: userId,
      user: data.name,
      project: data.project,
      assigned: data.assigned,
      completed: data.completed,
      completionRate: data.assigned > 0 ? (data.completed / data.assigned) * 100 : 0
    }))
    .filter(user => user.completionRate < 30 && user.assigned >= 3)
    .slice(0, 5);
  
  return freeRiders;
};


export const getSystemStats = async (req, res) => {
  try {
    const [
      totalProjects,
      activeProjects,
      totalTasks,
      completedTasks,
      totalUsers,
      activeUsers,
      systemHealth
    ] = await Promise.all([
      Project.countDocuments(),
      Project.countDocuments({ status: 'ongoing' }),
      Task.countDocuments(),
      Task.countDocuments({ status: 'completed' }),
      User.countDocuments(),
      User.countDocuments({ status: 'active' }),
      calculateSystemHealthScore()
    ]);

    res.json({
      success: true,
      data: {
        totalProjects,
        activeProjects,
        totalTasks,
        completedTasks,
        totalUsers,
        activeUsers,
        averageHealth: Math.round(systemHealth.score),
        taskCompletionRate:
          totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
        healthBreakdown: systemHealth.breakdown
      }
    });

  } catch (error) {
    console.error('Error in getSystemStats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching system stats'
    });
  }
};


export const calculateSystemHealthScore = async () => {
  const projects = await Project.find({}, {
    "metrics.health.healthScore": 1
  });

  if (!projects.length) {
    return {
      score: 0,
      breakdown: { healthy: 0, atRisk: 0, critical: 0 }
    };
  }

  let totalScore = 0;
  let healthy = 0;
  let atRisk = 0;
  let critical = 0;

  projects.forEach(project => {
    const score = project.metrics?.health?.healthScore || 0;
    totalScore += score;

    if (score >= 80) healthy++;
    else if (score >= 50) atRisk++;
    else critical++;
  });

  return {
    score: totalScore / projects.length,
    breakdown: { healthy, atRisk, critical }
  };
};
