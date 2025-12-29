import { useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';

export const calculateProductivity = (userTasks) => {
  if (!userTasks || userTasks.length === 0) return 0;

  let totalWeightedScore = 0;
  let totalWeight = 0;

  userTasks.forEach(task => {
    const completionWeight = 0.5;
    const timeWeight = 0.3;
    const riskWeight = 0.2;

    const completionScore = task.status === 'completed' ? 1 : 0;

    const timeScore = task.estimatedTime
      ? Math.min(1, task.totalFocusTime / task.estimatedTime)
      : 1;

    const riskScore = (task.risk?.riskScore || 0) / 5;

    let flagPenalty = 0;
    if (task.flags?.rushedCompletion) flagPenalty += 0.2;
    if (task.flags?.noProof) flagPenalty += 0.1;
    if (task.flags?.manualReviewRequired) flagPenalty += 0.1;
    flagPenalty = Math.min(flagPenalty, 1);

    const taskWeightedScore = (
      completionScore * completionWeight +
      timeScore * timeWeight +
      riskScore * riskWeight
    ) * (1 - flagPenalty);

    totalWeightedScore += taskWeightedScore;
    totalWeight += 1;
  });

  const productivity = (totalWeightedScore / totalWeight) * 100;
  return Math.min(100, Math.round(productivity));
};

export const generateRecentActivities = (userTasks, setRecentActivities) => {
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


export const useDashboardHelpers = () => {
  const theme = useTheme();

  const getProjectHealthColor = (healthScore) => {
    if (!healthScore) return theme.palette.info.main;
    if (healthScore >= 80) return theme.palette.success.main;
    if (healthScore >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return theme.palette.error.main;
      case 'medium': return theme.palette.warning.main;
      case 'low': return theme.palette.success.main;
      default: return theme.palette.info.main;
    }
  };

  const getStatCardStyles = (color) => {
    return {
      gradient: `linear-gradient(135deg, ${alpha(color, 0.15)}, ${alpha(color, 0.05)})`,
      hoverGradient: `linear-gradient(135deg, ${alpha(color, 0.2)}, ${alpha(color, 0.1)})`,
    };
  };

  return {
    getProjectHealthColor,
    getPriorityColor,
    getStatCardStyles,
  };
};