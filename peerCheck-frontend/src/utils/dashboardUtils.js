export const generateRecentActivities = (userTasks) => {
    if (!userTasks || userTasks.length === 0) {
      setRecentActivities([]);
      return;
    }
    const activities = userTasks
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 4)
      .map(task => ({
        id: task._id,
        action: getTaskActivityMessage(task),
        details: task.taskTitle,
        timestamp: task.updatedAt || task.createdAt,
        priority: task.metrics?.riskScore >= 4 ? 'high' : 'medium'
      }));

    setRecentActivities(activities);
  };

export const getTaskActivityMessage = (task) => {
    if (task.status === 'completed') return 'Task completed';
    if (task.status === 'active') return 'Task started';
    if (task.flags?.manualReviewRequired) return 'Review required';
    return 'Task updated';
  };

export const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';
    const now = new Date();
    const past = new Date(timestamp);
    const diff = now - past;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

export const getProjectHealthColor = (healthScore) => {
    if (!healthScore) return theme.palette.info.main;
    if (healthScore >= 80) return theme.palette.success.main;
    if (healthScore >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

export const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return theme.palette.error.main;
      case 'medium': return theme.palette.warning.main;
      case 'low': return theme.palette.success.main;
      default: return theme.palette.info.main;
    }
  };