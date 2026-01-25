//server/controllers/userController.js

import Team from "../models/peergroup_log.js";
import Project from "../models/projects.js";
import User from "../models/user.js";
import path from 'path';
import Task from "../models/tasks.js";
import Connection from "../models/connection.js";
import { r2Client, R2_BUCKET_NAME} from "../r2Client.js";
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import dotenv from 'dotenv';
import TourGuideInfo from "../models/tourguideInfo.js";

dotenv.config({path : path.resolve('./server/.env')});

export const uploadAvatar = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);

    
    // Generate a unique key for R2
    const avatarKey = `avatar/${userId}/${Date.now()}-${req.file.originalname}`;

    // Upload to R2
    await r2Client.send(new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: avatarKey,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    }));

    if (user.avatarKey) {
    await r2Client.send(new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: user.avatarKey,
    }));
  }

    const avatarUrl = `${process.env.R2_PUBLIC_DEV_DOMAIN_FOR_AVATAR}/${avatarKey}`;
    // Update user in DB
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { avatar: avatarUrl },
      { new: true, select: '-password' }
    );

    res.status(200).json({
      success: true,
      avatarUrl: `${avatarUrl}?v=${Date.now()}`,
      user: updatedUser
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
    
    const projects = await Project.find({ "members.user": req.userId })
      .populate('createdBy.user', 'name username avatar email')
      .populate('members.user', 'name username avatar email')
      .populate('tasks');

    res.status(200).json({
      success: true,
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
        const group = await Team.findOne({ members: { $all: members, $size: members.length } });

        if (group) {
            await Team.findByIdAndUpdate(
                group._id, 
                { $push: { projects: name } },
                { new: true, runValidators: true }
            );
            return { message: "Project added to existing group", groupId: group._id };
        }

        // Only create new group if no existing group found
        const newGroup = new Team({ members: members, projects: [name] });
        await newGroup.save();

    } catch (err) {
        console.error("Error in existingPeerGroup:", err);
        throw err;
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

export const checkTourguideComplete = async (req, res) => {
  try{
    const userId = req.user.id;
    const { page } = req.params;
    let tourGuide = await TourGuideInfo.findOne({ user: userId });

        // If user has no tour record → create it
        if (!tourGuide) {
          tourGuide = await TourGuideInfo.create({
            user: userId,
            status: { [page]: false }
          });
        }

        // If page key does NOT exist → create it
        if (!tourGuide.status.has(page)) {
          tourGuide.status.set(page, false);
          await tourGuide.save();
        }

  return res.status(200).json({
    success: true,
    status: tourGuide.status[page]
  })
  }catch(error){

    return res.status(500).json({
        success: false,
        message:  `Error: ${error}`
      })
    }
}
export const markTourguideComplete = async (req, res) => {
  try{
      const userId = req.user.id;
      const { page } = req.body;

      const tourGuide = await TourGuideInfo.findOneAndUpdate({user: userId}, {$set: { [`status.${page}`]: true }}, {new: true});

      if (!tourGuide){
        return res.status(404).json({
          success: false,
          message: "No tour guide info found!"
        })
      }

      return res.status(200).json({
        success: true,
        status: tourGuide.status
      })

  }catch(error){

    return res.status(500).json({
        success: false,
        message:  `Error: ${error}`
      })
    }
}