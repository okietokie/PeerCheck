// controllers/adminController.js
import DeletedProjects from "../models/deletedProjectInfo.js";
import DeletedTaskInfo from "../models/deletedTaskInfo.js";
import EditedTaskData from "../models/editDataInfo.js";
import LoginAttempt from "../models/login_logs.js"; // if you track login attempts
import PasswordReset from "../models/passwordReset.js"; // if you track reset requests
import Project from "../models/projects.js";
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

      const allUsers = await usersData.find({}, {name: 1, username:1,  email: 1, joinedOn:1, status:1});

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
