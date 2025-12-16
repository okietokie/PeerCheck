// src/utils/taskUtils.js

// Helper to get user data
export const getUserData = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    const user = JSON.parse(userStr);
    return user;
  } catch (err) {
    console.error('Error parsing user data:', err);
    return null;
  }
};

// Check if user is teacher
export const isTeacher = (userRole) => {
  if (!userRole) return false;
  return userRole?.role === 'teacher';
};

// Helper to format time
export const formatTime = (seconds) => {
  if (!seconds) return '0m';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

// Format date
export const formatDate = (dateString, short = false) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    
    if (short) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      if (date.toDateString() === today.toDateString()) return 'Today';
      if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
      
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (err) {
    return 'Invalid date';
  }
};

// Get status color
export const getStatusColor = (status) => {
  switch (status) {
    case 'completed': return 'success';
    case 'active': return 'info';
    case 'paused': return 'warning';
    default: return 'default';
  }
};

// Get status icon
export const getStatusIcon = (status) => {
  switch (status) {
    case 'completed': return 'CheckCircle';
    case 'active': return 'PlayArrow';
    case 'paused': return 'Pause';
    default: return null;
  }
};

// Get risk color
export const getRiskColor = (riskScore) => {
  if (riskScore >= 4) return 'error';
  if (riskScore >= 2) return 'warning';
  return 'success';
};

// Get efficiency color
export const getEfficiencyColor = (efficiency) => {
  if (efficiency < 50) return 'error';
  if (efficiency < 80) return 'warning';
  if (efficiency > 120) return 'warning';
  return 'success';
};

// Calculate task metrics
export const calculateTaskMetricsFromData = (task) => {
  return {
    efficiency: {
      percentage: task.estimatedTime 
        ? Math.round((task.totalFocusTime / task.estimatedTime) * 100 * 100) / 100 
        : 0
    },
    risk: {
      riskScore: calculateRiskScore(task)
    },
    isOverdue: calculateIsOverdue(task),
    hasProof: task.proofUploads && task.proofUploads.length > 0,
    daysUntilDeadline: calculateDaysUntilDeadline(task.deadline)
  };
};

export const calculateRiskScore = (task) => {
  const flags = task.flags || {};
  return (
    (flags.paddedTime ? 2 : 0) +
    (flags.rushedCompletion ? 2 : 0) +
    (flags.noProof ? 1 : 0) +
    (flags.manualReviewRequired ? 3 : 0)
  );
};

export const calculateIsOverdue = (task) => {
  if (!task.deadline) return false;
  const deadline = new Date(task.deadline);
  const now = new Date();
  return deadline < now && task.status !== 'completed';
};

export const calculateStatusWeight = (status) => {
  const weights = {
    'completed': 100,
    'active': 50,
    'paused': 30,
    'not_started': 0
  };
  return weights[status] || 0;
};

export const calculateDaysUntilDeadline = (deadline) => {
  if (!deadline) return 0;
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diffTime = deadlineDate - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Handle fetch errors
export const handleFetchError = (err, setError, setAuthError) => {
  if (err.response?.status === 401) {
    setAuthError(true);
    setError('Session expired. Please log in again.');
  } else if (err.code === 'ERR_NETWORK') {
    setError('Network error. Please check your connection.');
  } else {
    setError(err.response?.data?.error || 'Failed to load tasks. Please try again.');
  }
};