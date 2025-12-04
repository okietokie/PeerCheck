// utils/activityLogger.js
import TaskActivityEvent from "../models/taskActivityEvent.js";
import User from "../models/user.js";

export const logActivity = async (data) => {
  try {
    const {
      taskId,
      userId,
      eventType,
      metadata = {},
      projectId
    } = data;

    // Get user info
    let userData = {};
    if (userId) {
      const user = await User.findById(userId).select('name email avatar');
      if (user) {
        userData = {
          userName: user.name,
          userEmail: user.email,
          userAvatar: user.avatar
        };
      }
    }

    const activity = new TaskActivityEvent({
      taskId,
      userId,
      projectId,
      eventType,
      metadata,
      ...userData,
      timestamp: new Date()
    });

    await activity.save();
    return activity;
  } catch (error) {
    console.error('Error logging activity:', error);
    return null;
  }
};

export const getActionMessage = (activity) => {
  const user = activity.userName || 'System';
  const metadata = activity.metadata || {};

  switch (activity.eventType) {
    case 'task_created':
      return `${user} created the task`;
    
    case 'start':
      return `${user} started working on the task`;
    
    case 'pause':
      return `${user} paused the task`;
    
    case 'resume':
      return `${user} resumed the task`;
    
    case 'complete':
      return `${user} completed the task`;
    
    case 'reopen':
      return `${user} reopened the task`;
    
    case 'status_changed':
      return `Status changed from ${formatStatus(metadata.oldStatus)} to ${formatStatus(metadata.newStatus)}`;
    
    case 'time_logged':
      const duration = metadata.duration || 0;
      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration % 3600) / 60);
      const timeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
      return `${user} logged ${timeStr} of focus time`;
    
    case 'proof_uploaded':
      return `${user} uploaded proof: ${metadata.filename || 'a file'}`;
    
    case 'proof_deleted':
      return `${user} deleted a proof file`;
    
    case 'task_edited':
      if (metadata.field === 'title') {
        return `${user} changed task title from "${metadata.oldValue}" to "${metadata.newValue}"`;
      } else if (metadata.field === 'description') {
        return `${user} updated task description`;
      } else {
        return `${user} edited task details`;
      }
    
    case 'task_assigned':
      return `${user} assigned task to ${metadata.newAssignee || 'another user'}`;
    
    case 'task_unassigned':
      return `${user} unassigned task from ${metadata.oldAssignee || 'a user'}`;
    
    case 'deadline_updated':
      return `${user} updated deadline`;
    
    case 'grading_updated':
      if (metadata.overrideType === 'teacher') {
        return `Teacher overridden grade: ${metadata.oldScore || 'N/A'} → ${metadata.newScore}/10`;
      } else if (metadata.overrideType === 'peer') {
        return `Peer review grade: ${metadata.newScore}/10`;
      } else {
        return `Grading updated: ${metadata.newScore}/10`;
      }
    
    case 'comment_added':
      const commentPreview = metadata.comment?.length > 50 
        ? metadata.comment.substring(0, 50) + '...' 
        : metadata.comment;
      return `${user} added comment: "${commentPreview}"`;
    
    case 'flag_update':
      const flagState = metadata.flagValue ? 'flagged' : 'cleared';
      return `${metadata.flagName || 'Flag'} ${flagState}`;
    
    case 'manual_review':
      return 'Manual review requested';
    
    case 'peer_review':
      return 'Peer review submitted';
    
    case 'grade_override':
      return `Grade overridden to ${metadata.newScore}/10`;
    
    case 'risk_override':
      return `Risk score overridden to ${metadata.riskScore}/8`;
    
    default:
      return 'Activity recorded';
  }
};

const formatStatus = (status) => {
  if (!status) return 'unknown';
  return status.replace('_', ' ').toUpperCase();
};

export const formatTimeAgo = (date) => {
  const now = new Date();
  const seconds = Math.floor((now - new Date(date)) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(date).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
};