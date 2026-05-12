import { useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';

// Fallback-only productivity calculator.
// Main productivity score must come from GET /user/productivity.
// This fallback is used only when backend productivity data is unavailable.
export const calculateProductivity = (userTasks) => {
  if (!userTasks || userTasks.length === 0) return 0;

  let totalScore = 0;

  userTasks.forEach(task => {
    const completionScore =
      task.status === 'completed' ? 100 :
      task.status === 'active' ? 60 :
      task.status === 'paused' ? 40 : 20;

    const estimated = task.estimatedTime || 1;
    const actual = task.totalFocusTime || 0;
    const ratio = actual / estimated;

    let timeScore = 100;
    if (ratio < 0.4) timeScore = 50;
    else if (ratio <= 1.2) timeScore = 100;
    else if (ratio <= 2) timeScore = 70;
    else timeScore = 40;

    const proofScore = task.proofUploads?.length > 0 ? 100 : 40;

    const risk = task.metrics?.riskScore || task.risk?.riskScore || 0;
    const normalizedRisk = Math.min(risk / 8, 1);
    const integrityAdjustment = 1 - Math.min(0.35, normalizedRisk * 0.35);

    const taskScore =
      completionScore * 0.45 +
      timeScore * 0.35 +
      proofScore * 0.20;

    totalScore += taskScore * integrityAdjustment;
  });

  return Math.round(totalScore / userTasks.length);
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
