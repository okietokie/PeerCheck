//server/controllers/notificationController.js
import Notification from '../models/notification.js';
import User from '../models/user.js';
import Task from '../models/tasks.js';


// Helper to create notification
export const createNotification = async ({
  userId,
  type,
  title,
  message,
  data = {},
  priority = 'medium',
  actionUrl = null
}) => {
  try {
    const notification = new Notification({
      user: userId,
      type,
      title,
      message,
      data,
      priority,
      actionUrl,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });

    await notification.save();
    
    // Emit real-time notification if using WebSockets
    if (process.env.ENABLE_WEBSOCKETS === 'true') {

    }
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// Get user notifications
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, unreadOnly = false, page = 1 } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Build query
    const query = { user: userId };
    if (unreadOnly === 'true') {
      query.read = false;
    }
    
    // Get notifications
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // Get unread count
    const unreadCount = await Notification.countDocuments({ 
      user: userId, 
      read: false 
    });
    
    // Get total count
    const totalCount = await Notification.countDocuments({ user: userId });
    
    res.json({
      success: true,
      notifications,
      unreadCount,
      totalCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: (page * limit) < totalCount,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.userId;
    
    const notification = await Notification.findOneAndUpdate(
      { 
        _id: notificationId, 
        user: userId 
      },
      { 
        $set: { read: true, readAt: new Date() } 
      },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ 
        success: false, 
        message: 'Notification not found' 
      });
    }
    
    res.json({ 
      success: true, 
      notification 
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Mark all as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.userId;
    
    const result = await Notification.updateMany(
      { 
        user: userId, 
        read: false 
      },
      { 
        $set: { read: true, readAt: new Date() } 
      }
    );
    
    res.json({ 
      success: true, 
      message: `Marked ${result.modifiedCount} notifications as read` 
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.userId;
    
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      user: userId
    });
    
    if (!notification) {
      return res.status(404).json({ 
        success: false, 
        message: 'Notification not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Notification deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Clear all notifications
export const clearAllNotifications = async (req, res) => {
  try {
    const userId = req.userId;
    
    await Notification.deleteMany({ user: userId });
    
    res.json({ 
      success: true, 
      message: 'All notifications cleared' 
    });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Get notification stats
export const getNotificationStats = async (req, res) => {
  try {
    const userId = req.userId;
    
    const stats = await Notification.aggregate([
      { $match: { user: mongoose.Types.ObjectId(userId) } },
      {
        $facet: {
          byType: [
            {
              $group: {
                _id: '$type',
                count: { $sum: 1 },
                unread: {
                  $sum: { $cond: [{ $eq: ['$read', false] }, 1, 0] }
                }
              }
            }
          ],
          byPriority: [
            {
              $group: {
                _id: '$priority',
                count: { $sum: 1 }
              }
            }
          ],
          todayCount: [
            {
              $match: {
                createdAt: {
                  $gte: new Date(new Date().setHours(0, 0, 0, 0))
                }
              }
            },
            { $count: 'count' }
          ],
          total: [{ $count: 'count' }],
          unread: [
            { $match: { read: false } },
            { $count: 'count' }
          ]
        }
      }
    ]);
    
    res.json({
      success: true,
      stats: {
        byType: stats[0]?.byType || [],
        byPriority: stats[0]?.byPriority || [],
        todayCount: stats[0]?.todayCount?.[0]?.count || 0,
        total: stats[0]?.total?.[0]?.count || 0,
        unread: stats[0]?.unread?.[0]?.count || 0
      }
    });
  } catch (error) {
    console.error('Error getting notification stats:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Auto-create notifications for common events

// When task is assigned
export const notifyTaskAssigned = async (taskId, assignedToId, assignedById) => {
  const task = await Task.findById(taskId).populate('projectId', 'projectName');
  const assigner = await User.findById(assignedById);
  const assignee = await User.findById(assignedToId);
  if (task && assigner) {
    await createNotification({
      userId: assignedToId,
      type: 'task_created',
      title: 'New Task Created!',
      message: `${assigner.name} assigned you a task: "${task.taskTitle}" in ${task.projectId?.projectName}`,
      data: {
        taskId: task._id,
        projectId: task.projectId?._id,
        userId: assignedById
      },
      priority: 'high',
      actionUrl: `/tasks/${task._id}`
    });
    await createNotification({
      userId: assignedById,
      type: 'task_created',
      title: 'New Task Created!',
      message: `You assigned a task to ${assignee.name}: "${task.taskTitle}" in ${task.projectId?.projectName}`,
      data: {
        taskId: task._id,
        projectId: task.projectId?._id,
        userId: assignedById
      },
      priority: 'high',
      actionUrl: `/tasks/${task._id}`
    });
  }
};

// When task is completed
export const notifyTaskCompleted = async (taskId, completedById) => {
  const task = await Task.findById(taskId)
    .populate('projectId', 'projectName')
    .populate('assignedBy', 'name');
  
  if (task && task.assignedBy) {
    await createNotification({
      userId: task.assignedBy._id,
      type: 'task_completed',
      title: 'Task Completed',
      message: `${task.assignedBy.name} completed task: "${task.taskTitle}"`,
      data: {
        taskId: task._id,
        projectId: task.projectId?._id,
        userId: completedById
      },
      priority: 'medium',
      actionUrl: `/tasks/${task._id}`
    });
  }
};

// When task is nearing deadline (24 hours before)
export const notifyTaskDeadline = async (taskId) => {
  const task = await Task.findById(taskId).populate('projectId', 'projectName');
  
  if (task && task.assignedTo) {
    await createNotification({
      userId: task.assignedTo,
      type: 'deadline_reminder',
      title: 'Task Deadline Approaching',
      message: `Task "${task.taskTitle}" is due in 24 hours`,
      data: {
        taskId: task._id,
        projectId: task.projectId?._id
      },
      priority: 'urgent',
      actionUrl: `/tasks/${task._id}`
    });
  }
};

// When someone comments on your task
export const notifyTaskComment = async (taskId, commenterId, comment) => {
  const task = await Task.findById(taskId).populate('projectId', 'projectName');
  const commenter = await User.findById(commenterId);
  
  if (task && commenter && task.assignedTo) {
    await createNotification({
      userId: task.assignedTo,
      type: 'task_comment',
      title: 'New Comment on Your Task',
      message: `${commenter.name} commented on your task: "${task.taskTitle}"`,
      data: {
        taskId: task._id,
        projectId: task.projectId?._id,
        userId: commenterId,
        metadata: { comment }
      },
      priority: 'medium',
      actionUrl: `/tasks/${task._id}`
    });
  }
};

// controllers/notificationController.js - Add these functions
export const notifyConnectionRequest = async (fromUserId, toUserId, connectionId) => {
  try {
    const fromUser = await User.findById(fromUserId);
    const toUser = await User.findById(toUserId);
    
    if (fromUser && toUser) {
      // Create notification for receiver
      await createNotification({
        userId: toUserId,
        type: 'connection_request',
        title: 'New Connection Request',
        message: `${fromUser.name || fromUser.username} wants to connect with you`,
        data: {
          fromUserId: fromUserId,
          fromUserName: fromUser.name || fromUser.username,
          connectionId: connectionId,
          userAvatar: fromUser.avatar
        },
        priority: 'medium',
        actionUrl: `/user-app/profile` // Redirects to profile page
      });

      // Create notification for sender (optional)
      await createNotification({
        userId: fromUserId,
        type: 'connection_request_sent',
        title: 'Connection Request Sent',
        message: `Your connection request was sent to ${toUser.name || toUser.username}`,
        data: {
          toUserId: toUserId,
          toUserName: toUser.name || toUser.username
        },
        priority: 'low'
      });
      
      return true;
    }
  } catch (error) {
    console.error('Error creating connection notification:', error);
    return false;
  }
};

export const notifyConnectionAccepted = async (acceptorId, requestorId) => {
  try {
    const acceptor = await User.findById(acceptorId);
    const requestor = await User.findById(requestorId);
    
    if (acceptor && requestor) {
      // Notify requestor
      await createNotification({
        userId: requestorId,
        type: 'connection_accepted',
        title: 'Connection Request Accepted!',
        message: `${acceptor.name || acceptor.username} accepted your connection request`,
        data: {
          acceptorId: acceptorId,
          acceptorName: acceptor.name || acceptor.username,
          acceptorAvatar: acceptor.avatar
        },
        priority: 'medium',
        actionUrl: `/user-app/profile`
      });

      // Notify acceptor
      await createNotification({
        userId: acceptorId,
        type: 'connection_confirmed',
        title: 'You are now connected!',
        message: `You are now connected with ${requestor.name || requestor.username}`,
        data: {
          requestorId: requestorId,
          requestorName: requestor.name || requestor.username,
          requestorAvatar: requestor.avatar
        },
        priority: 'low',
        actionUrl: `/user-app/profile`
      });
      
      return true;
    }
  } catch (error) {
    console.error('Error creating connection acceptance notification:', error);
    return false;
  }
};

export const notifyConnectionDeclined = async (declinerId, requestorId) => {
  try {
    const decliner = await User.findById(declinerId);
    const requestor = await User.findById(requestorId);
    
    if (decliner && requestor) {
      // Notify requestor
      await createNotification({
        userId: requestorId,
        type: 'connection_declined',
        title: 'Connection Request Declined',
        message: `${decliner.name || decliner.username} declined your connection request`,
        data: {
          declinerId: declinerId,
          declinerName: decliner.name || decliner.username
        },
        priority: 'medium'
      });
      
      return true;
    }
  } catch (error) {
    console.error('Error creating connection decline notification:', error);
    return false;
  }
};

// When proof is uploaded (notify project creator)
export const notifyProofUploaded = async (taskId, uploaderId) => {
  const task = await Task.findById(taskId)
    .populate('projectId')
    .populate('assignedBy', 'name');
  
  if (task && task.projectId && task.assignedBy && task.assignedBy._id.toString() !== uploaderId) {
    await createNotification({
      userId: task.assignedBy._id,
      type: 'proof_uploaded',
      title: 'Proof Uploaded',
      message: `${task.assignedBy.name} uploaded proof for task: "${task.taskTitle}"`,
      data: {
        taskId: task._id,
        projectId: task.projectId._id,
        userId: uploaderId
      },
      priority: 'medium',
      actionUrl: `/tasks/${task._id}`
    });
  }
};

// Weekly summary notification
export const sendWeeklySummary = async (userId) => {
  const user = await User.findById(userId);
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  // Get completed tasks in last week
  const completedTasks = await Task.countDocuments({
    assignedTo: userId,
    status: 'completed',
    updatedAt: { $gte: oneWeekAgo }
  });
  
  // Get upcoming deadlines
  const upcomingDeadlines = await Task.countDocuments({
    assignedTo: userId,
    deadline: { 
      $gte: new Date(), 
      $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
    },
    status: { $ne: 'completed' }
  });
  
  await createNotification({
    userId: userId,
    type: 'weekly_summary',
    title: 'Your Weekly Summary',
    message: `Great work! You completed ${completedTasks} tasks this week. ${upcomingDeadlines} deadlines approaching.`,
    data: {
      completedTasks,
      upcomingDeadlines
    },
    priority: 'low'
  });
};