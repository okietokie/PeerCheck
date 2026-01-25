import React from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Chip,
  alpha,
  Slide,
  Stack,
  Divider,
  LinearProgress
} from '@mui/material';
import {
  Timeline,
  Schedule,
  CalendarToday,
  AccessTime,
  PlayArrow,
  Pause,
  CheckCircle,
  RadioButtonUnchecked,
  Close,
  Warning,
} from '@mui/icons-material';

const TaskTimelinePanel = ({ task, open, onClose, theme }) => {
  if (!open || !task) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return 'Invalid date';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle />;
      case 'active': return <PlayArrow />;
      case 'paused': return <Pause />;
      default: return <RadioButtonUnchecked />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return theme.palette.success.main;
      case 'active': return theme.palette.info.main;
      case 'paused': return theme.palette.warning.main;
      default: return theme.palette.grey[500];
    }
  };

  return (
    <Slide in={open} direction="left" timeout={300}>
      <Paper
        elevation={16}
        sx={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: 400,
          height: '100vh',
          borderRadius: 0,
          backgroundColor: alpha(theme.palette.background.paper, 0.98),
          backdropFilter: 'blur(20px)',
          borderLeft: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
          zIndex: 1300,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box sx={{ 
          p: 3, 
          pb: 2,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" fontWeight="800" sx={{ 
              color: theme.palette.info.main,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5
            }}>
              <Timeline sx={{ fontSize: 28 }} />
              Timeline Analysis
            </Typography>
            <IconButton 
              onClick={onClose}
              size="small"
              sx={{
                color: theme.palette.text.secondary,
              }}
            >
              <Close />
            </IconButton>
          </Box>
          
          <Typography variant="body2" sx={{ 
            color: theme.palette.text.secondary,
          }}>
            {task?.taskTitle}
          </Typography>
        </Box>

        {/* Content */}
        <Box sx={{ 
          flex: 1, 
          overflowY: 'auto',
          p: 3,
        }}>
          <Stack spacing={3}>
            {/* Status Timeline */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 2,
                backgroundColor: alpha(getStatusColor(task?.status), 0.05),
                border: `1px solid ${alpha(getStatusColor(task?.status), 0.2)}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                {getStatusIcon(task?.status)}
                <Typography variant="subtitle1" fontWeight="600" sx={{ color: getStatusColor(task?.status) }}>
                  Current Status: {task?.status?.replace('_', ' ').toUpperCase()}
                </Typography>
              </Box>
              
              <Stack spacing={1.5}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Started
                  </Typography>
                  <Typography variant="body2" fontWeight="600">
                    {formatDate(task?.startDate || task?.createdAt)}
                  </Typography>
                </Box>
                
                {task?.deadline && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Deadline
                    </Typography>
                    <Typography variant="body2" fontWeight="600" sx={{ 
                      color: task?.metrics?.isOverdue ? theme.palette.error.main : 'inherit'
                    }}>
                      {formatDate(task?.deadline)}
                    </Typography>
                  </Box>
                )}
                
                {task?.endDate && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      Completed
                    </Typography>
                    <Typography variant="body2" fontWeight="600">
                      {formatDate(task?.endDate)}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Paper>

            {/* Deadline Progress */}
            {task?.deadline && (
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  backgroundColor: alpha(
                    task?.metrics?.isOverdue ? theme.palette.error.main : theme.palette.info.main, 
                    0.05
                  ),
                  border: `1px solid ${alpha(
                    task?.metrics?.isOverdue ? theme.palette.error.main : theme.palette.info.main, 
                    0.2
                  )}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="600" sx={{ 
                    color: task?.metrics?.isOverdue ? theme.palette.error.main : theme.palette.info.main,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}>
                    <Schedule />
                    Deadline Progress
                  </Typography>
                  {task?.metrics?.isOverdue && (
                    <Chip
                      label="OVERDUE"
                      color="error"
                      size="small"
                      icon={<Warning />}
                    />
                  )}
                </Box>

                <Box sx={{ mb: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={calculateProgress(task)}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: alpha(
                        task?.metrics?.isOverdue ? theme.palette.error.main : theme.palette.info.main, 
                        0.1
                      ),
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: task?.metrics?.isOverdue ? theme.palette.error.main : theme.palette.info.main,
                      }
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Start
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {calculateDaysText(task)} • {calculateProgress(task)}% complete
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Deadline
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            )}

            {/* Time Allocation */}
            {task?.estimatedTime && (
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.warning.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                }}
              >
                <Typography variant="subtitle1" fontWeight="600" sx={{ 
                  mb: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}>
                  <AccessTime sx={{ color: theme.palette.warning.main }} />
                  Time Allocation
                </Typography>
                
                <Stack spacing={1}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        Estimated
                      </Typography>
                      <Typography variant="body2" fontWeight="600">
                        {formatTime(task.estimatedTime)}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={100}
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.warning.main, 0.1),
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: theme.palette.warning.main,
                        }
                      }}
                    />
                  </Box>
                  
                  {task?.totalFocusTime > 0 && (
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2" color="text.secondary">
                          Actual
                        </Typography>
                        <Typography variant="body2" fontWeight="600">
                          {formatTime(task.totalFocusTime)}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min((task.totalFocusTime / task.estimatedTime) * 100, 100)}
                        sx={{
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: alpha(theme.palette.info.main, 0.1),
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: theme.palette.info.main,
                          }
                        }}
                      />
                    </Box>
                  )}
                </Stack>
              </Paper>
            )}
          </Stack>
        </Box>
      </Paper>
    </Slide>
  );
};

// Helper functions
const calculateProgress = (task) => {
  if (!task?.deadline || !task?.startDate) return 0;
  
  const start = new Date(task.startDate);
  const end = new Date(task.deadline);
  const now = new Date();
  
  if (now >= end) return 100;
  if (now <= start) return 0;
  
  const totalDuration = end - start;
  const elapsed = now - start;
  
  return Math.min((elapsed / totalDuration) * 100, 100);
};

const calculateDaysText = (task) => {
  if (!task?.deadline) return 'No deadline';
  
  const deadline = new Date(task.deadline);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = deadline - today;
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (task?.status === "completed") return 'Completed';
  if (task?.metrics?.isOverdue) return 'Overdue';
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  if (days > 1) return `${days} days left`;
  return 'Past due';
};

const formatTime = (seconds) => {
  if (!seconds) return '0m';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export default TaskTimelinePanel;