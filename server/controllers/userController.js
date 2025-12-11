import DeletedProjects from "../models/deletedProjectInfo.js";
import Group from "../models/peergroup_log.js";
import Project from "../models/projects.js";
import User from "../models/user.js";

import fs from 'fs';
import path from 'path';
import Task from "../models/tasks.js";
import Connection from "../models/connection.js";

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: "No file uploaded" 
      });
    }
    
    // avatar URL
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    
    // Get previous avatar to delete later
    const user = await User.findById(req.userId);
    const oldAvatar = user.avatar;
    
    // Update user's avatar in database
    const updatedUser = await User.findByIdAndUpdate(
      req.userId, 
      { avatar: avatarUrl },
      { new: true, select: '-password' }
    );
    
    // Delete old avatar file if it exists
    if (oldAvatar && oldAvatar.startsWith('/uploads/avatars/')) {
      const oldFilename = oldAvatar.split('/').pop();
      const oldPath = path.join('uploads/avatars', oldFilename);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }
    
    res.status(200).json({ 
      success: true, 
      avatarUrl,
      user: {
        name: updatedUser.name,
        username: updatedUser.username,
        email: updatedUser.email,
        bio: updatedUser.bio,
        institution: updatedUser.institution,
        course: updatedUser.course,
        year: updatedUser.year,
        skills: updatedUser.skills,
        avatar: updatedUser.avatar
      },
      message: "Avatar uploaded successfully" 
    });
    
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ 
      success: false,
      message: "Error uploading avatar" 
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, username, email, bio, institution, course, year, skills } = req.body;
    
    const updateData = {
      name,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      bio,
      institution,
      course,
      year
    };
    
    // Parse skills if provided
    if (skills) {
      updateData.skills = typeof skills === 'string' 
        ? skills.split(',').map(skill => skill.trim()).filter(skill => skill)
        : skills;
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.userId, 
      updateData,
      { new: true, select: '-password' }
    );
    
    res.status(200).json({ 
      success: true,
      user: {
        name: updatedUser.name,
        username: updatedUser.username,
        email: updatedUser.email,
        bio: updatedUser.bio,
        institution: updatedUser.institution,
        course: updatedUser.course,
        year: updatedUser.year,
        skills: updatedUser.skills,
        avatar: updatedUser.avatar
      },
      message: "Profile updated successfully" 
    });
    
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false,
      message: "Error updating profile" 
    });
  }
};

export const fetchUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -resetPasswordToken');
    
    // Updated query to match new schema structure
    const projects = await Project.find({ "members.user": req.userId })
      .populate('createdBy.user', 'name username avatar email')
      .populate('members.user', 'name username avatar email')
      .populate('tasks');

    console.log(user.onlineStatus);

    res.status(200).json({
      username: req.username,
      user: user,
      userProjects: projects
    });
  } catch (err) {
    res.status(500).json({message: "Error fetching user details from server!"});
  }
}

export const existingPeerGroup = async ({ name, members }) => {
    try {
        const group = await Group.findOne({ members: { $all: members, $size: members.length } });

        if (group) {
            await Group.findByIdAndUpdate(
                group._id, 
                { $push: { projects: name } },
                { new: true, runValidators: true }
            );
            console.log("[userController.js]\nExisting group updated with new project:", name);
            return { message: "Project added to existing group", groupId: group._id };
        }

        // Only create new group if no existing group found
        const newGroup = new Group({ members: members, projects: [name] });
        await newGroup.save();

    } catch (err) {
        console.error("Error in existingPeerGroup:", err);
        throw err;
    }
}

export const createProject = async (req, res) => {
  try {
    const { name, description, dueDate, attributes = [] } = req.body;
    const userId = req.userId; 

    // Validates required fields
    if (!name || !description || !dueDate) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, and due date are required'
      });
    }

    // Creates project with new schema structure
    const project = new Project({
      name,
      description,
      dueDate, // Changed from endDate to dueDate
      createdBy: {
        user: userId
      },
      members: [{
        user: userId,
        userRole: 'project-lead' // Changed from role to userRole
      }],
      attributes: attributes, // Changed from requirements to attributes
      status: 'active',
      tasks: [] // Initialize empty tasks array
    });

    await project.save();

    // Returns the created project with proper population
    const populatedProject = await Project.findById(project._id)
      .populate('createdBy.user', 'name username avatar email')
      .populate('members.user', 'name username avatar email')
      .populate('tasks');

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project: populatedProject
    });

  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating project',
      error: error.message
    });
  }
};

export const getUserProjects = async (req, res) => {
  try {
    const userId = req.userId; 

    // Finds projects where the user is a member
    const projects = await Project.find({
      'members.user': userId
    })
    .populate('createdBy.user', 'name username avatar email')
    .populate('members.user', 'name username avatar email')
    .populate('tasks')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      projects: projects
    });

  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching projects',
      error: error.message
    });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, dueDate, status, attributes } = req.body;
    const userId = req.userId; 

    // Checks if user is project lead
    const project = await Project.findOne({
      _id: id,
      'members.user': userId,
      'members.userRole': 'project-lead' 
    });

    if (!project) {
      return res.status(403).json({
        success: false,
        message: 'Only project lead can update project'
      });
    }

    // Update fields
    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (dueDate) updateData.dueDate = dueDate; 
    if (status) updateData.status = status;
    if (attributes) updateData.attributes = attributes; 

    const updatedProject = await Project.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('createdBy.user', 'name username avatar email')
    .populate('members.user', 'name username avatar email')
    .populate('tasks');

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      project: updatedProject
    });

  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating project',
      error: error.message
    });
  }
};

export const addMemberToProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { memberId } = req.body;
    const userId = req.userId; 

    // Check if user is project lead
    const project = await Project.findOne({
      _id: id,
      'members.user': userId,
      'members.userRole': 'project-lead' 
    });

    if (!project) {
      return res.status(403).json({
        success: false,
        message: 'Only project lead can add members'
      });
    }

    // Check if member already exists
    const existingMember = project.members.find(member => 
      member.user.toString() === memberId
    );

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: 'User is already a member of this project'
      });
    }

    // Add member with new schema structure
    project.members.push({
      user: memberId,
      userRole: 'project-member' 
    });

    await project.save();

    const updatedProject = await Project.findById(id)
      .populate('createdBy.user', 'name username avatar email')
      .populate('members.user', 'name username avatar email');

    res.status(200).json({
      success: true,
      message: 'Member added successfully',
      project: updatedProject
    });

  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding member to project',
      error: error.message
    });
  }
};

export const removeMemberFromProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { memberId } = req.body;
    const userId = req.userId;

    // Check if user is project lead
    const project = await Project.findOne({
      _id: id,
      'members.user': userId,
      'members.userRole': 'project-lead'
    });

    if (!project) {
      return res.status(403).json({
        success: false,
        message: 'Only project lead can remove members'
      });
    }

    // Check if trying to remove project lead
    const memberToRemove = project.members.find(member => 
      member.user.toString() === memberId && member.userRole === 'project-lead'
    );

    if (memberToRemove) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove project lead from project'
      });
    }

    // Remove member
    project.members = project.members.filter(member => 
      member.user.toString() !== memberId
    );

    await project.save();

    const updatedProject = await Project.findById(id)
      .populate('createdBy.user', 'name username avatar email')
      .populate('members.user', 'name username avatar email');

    res.status(200).json({
      success: true,
      message: 'Member removed successfully',
      project: updatedProject
    });

  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing member from project',
      error: error.message
    });
  }
};

// DELETE PROJECT
export const deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const userId = req.userId;

    // Check if user is project lead
    const project = await Project.findOne({
      _id: projectId,
      'members.user': userId,
      'members.userRole': 'project-lead'
    });

    if (!project) {
      return res.status(403).json({
        success: false,
        message: 'Only project lead can delete project'
      });
    }

    const deletedProject = await Project.findByIdAndDelete(projectId);

    if (!deletedProject) {
      return res.status(404).json({ 
        success: false,
        message: "Project not found" 
      });
    }

    // Save to deleted projects collection
    const deletedProjectRecord = new DeletedProjects({
      deletedProjectName: deletedProject.name,
      projectID: deletedProject._id,
      memberList: deletedProject.members
    });

    await deletedProjectRecord.save();

    res.status(200).json({ 
      success: true,
      message: "Project deleted successfully!" 
    });

  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ 
      success: false,
      message: `Error deleting project: ${error.message}` 
    });
  }
}

// GET PROJECT BY ID 
export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Check if user is a member of the project
    const project = await Project.findOne({
      _id: id,
      'members.user': userId
    })
    .populate('createdBy.user', 'name username avatar email')
    .populate('members.user', 'name username avatar email')
    .populate('tasks');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found or access denied'
      });
    }

    res.status(200).json({
      success: true,
      project: project
    });

  } catch (error) {
    console.error('Get project by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching project',
      error: error.message
    });
  }
}

// Get dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user's projects
    const projects = await Project.find({ createdBy: userId });
    
    // Get user's tasks
    const tasks = await Task.find({ 
      $or: [
        { assignedTo: userId },
        { assignedBy: userId }
      ]
    });

    
    
    // Get connections
    const connections = await Connection.find({
      $or: [
        { fromUser: userId, status: 'accepted' },
        { toUser: userId, status: 'accepted' }
      ]
    });
    
    // Calculate pending reviews (tasks assigned to user for review)
    const pendingReviews = await Task.countDocuments({
      assignedTo: userId,
      'flags.manualReviewRequired': true,
      status: { $ne: 'completed' }
    });
    
    // Calculate upcoming deadlines (within 7 days)
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const upcomingDeadlines = await Task.countDocuments({
      assignedTo: userId,
      deadline: { $lte: sevenDaysFromNow, $gte: new Date() },
      status: { $ne: 'completed' }
    });
    
    // Calculate average efficiency
    const userTasks = await Task.find({ assignedTo: userId });
    const avgEfficiency = userTasks.length > 0
      ? userTasks.reduce((sum, task) => {
          const efficiency = task.estimatedTime > 0 
            ? (task.totalFocusTime / task.estimatedTime) * 100 
            : 0;
          return sum + Math.min(efficiency, 100);
        }, 0) / userTasks.length
      : 0;
    
    res.json({
      success: true,
      activeProjects: projects.filter(p => p.status === 'active' || p.status === 'ongoing').length,
      collaborators: connections.length,
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'completed').length,
      pendingReviews,
      upcomingDeadlines,
      averageEfficiency: avgEfficiency
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get recent activities
export const getRecentActivities = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;
    
    // Get user's projects
    const projects = await Project.find({ createdBy: userId }).select('_id');
    const projectIds = projects.map(p => p._id);
    
    // Get activities from user's projects and tasks
    const activities = await TaskActivityEvent.find({
      $or: [
        { userId: userId },
        { projectId: { $in: projectIds } }
      ]
    })
    .populate('userId', 'name email avatar')
    .sort({ timestamp: -1 })
    .limit(limit);
    
    const formattedActivities = activities.map(activity => {
      // Format activity message based on event type
      let action = '';
      let details = '';
      
      switch(activity.eventType) {
        case 'task_created':
          action = 'Task created';
          details = activity.metadata?.taskTitle || 'New task';
          break;
        case 'status_changed':
          action = 'Task status updated';
          details = `${activity.metadata?.oldStatus} → ${activity.metadata?.newStatus}`;
          break;
        case 'proof_uploaded':
          action = 'Proof uploaded';
          details = activity.metadata?.filename || 'File uploaded';
          break;
        case 'comment_added':
          action = 'Comment added';
          details = activity.metadata?.comment || 'New comment';
          break;
        default:
          action = 'Activity recorded';
          details = activity.eventType;
      }
      
      return {
        id: activity._id,
        action,
        details,
        user: activity.userId,
        timestamp: activity.timestamp,
        type: activity.eventType,
        priority: 'medium' 
      };
    });
    
    res.json({
      success: true,
      activities: formattedActivities
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};