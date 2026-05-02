import React from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Chip,
  LinearProgress,
  alpha,
  Slide,
  Stack,
  Divider
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Speed,
  Timer,
  CheckCircle,
  CalendarToday,
  Upload,
  Close,
  BarChart,
} from '@mui/icons-material';

const TaskPerformancePanel = ({ task, open, onClose, theme }) => {
  const rawTimeEfficiency = Number(
    task?.metrics?.rawTimeEfficiency ??
    (((task?.totalFocusTime || 0) / (task?.estimatedTime || 1)) * 100)
  ) || 0;

  const getEfficiencyColor = (score) => {
    const eff = Number(score) || 0;
    if (eff >= 85) return theme.palette.success.main;
    if (eff >= 70) return theme.palette.info.main;
    if (eff >= 50) return theme.palette.warning.main;
    return theme.palette.error.main;
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

  if (!open || !task) return null;

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
              color: theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5
            }}>
              <TrendingUp sx={{ fontSize: 28 }} />
              Performance Dashboard
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
          {/* Performance Metrics */}
          <Stack spacing={3}>
            {/* Time Usage */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.info.main, 0.05),
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Timer sx={{ color: theme.palette.info.main }} />
                <Typography variant="subtitle1" fontWeight="600">
                  Time Used vs Estimate
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Estimated: {formatTime(task?.estimatedTime || 0)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Actual: {formatTime(task?.totalFocusTime || 0)}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mb: 1 }}>
                  {rawTimeEfficiency.toFixed(0)}% of the original estimate
                </Typography>
                
                <LinearProgress
                  variant="determinate"
                  value={Math.min(rawTimeEfficiency, 100)}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: alpha(theme.palette.info.main, 0.1),
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: theme.palette.info.main,
                    }
                  }}
                />
              </Box>
            </Paper>

            {/* Quality Metrics */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.success.main, 0.05),
                border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <CheckCircle sx={{ color: theme.palette.success.main }} />
                <Typography variant="subtitle1" fontWeight="600">
                  Quality Metrics
                </Typography>
              </Box>
              
              <Stack spacing={1.5}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Completion Quality
                    </Typography>
                    <Typography variant="body2" fontWeight="600" sx={{ 
                      color: getEfficiencyColor(task?.metrics?.componentScores?.completionQuality)
                    }}>
                      {task?.metrics?.componentScores?.completionQuality || 0}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={task?.metrics?.componentScores?.completionQuality || 0}
                    sx={{
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: alpha(getEfficiencyColor(task?.metrics?.componentScores?.completionQuality), 0.1),
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getEfficiencyColor(task?.metrics?.componentScores?.completionQuality),
                      }
                    }}
                  />
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      Proof Quality
                    </Typography>
                    <Typography variant="body2" fontWeight="600" sx={{ 
                      color: getEfficiencyColor(task?.metrics?.componentScores?.proofQuality)
                    }}>
                      {task?.metrics?.componentScores?.proofQuality || 0}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={task?.metrics?.componentScores?.proofQuality || 0}
                    sx={{
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: alpha(getEfficiencyColor(task?.metrics?.componentScores?.proofQuality), 0.1),
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getEfficiencyColor(task?.metrics?.componentScores?.proofQuality),
                      }
                    }}
                  />
                </Box>
              </Stack>
            </Paper>

            {/* Timeliness */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.warning.main, 0.05),
                border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <CalendarToday sx={{ color: theme.palette.warning.main }} />
                <Typography variant="subtitle1" fontWeight="600">
                  Timeliness
                </Typography>
              </Box>
              
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {task?.status === 'completed' ? 'Completed on time' : 'On track for deadline'}
                  </Typography>
                  <Typography variant="body2" fontWeight="600" sx={{ 
                    color: getEfficiencyColor(task?.metrics?.componentScores?.timeliness)
                    }}>
                    {task?.metrics?.componentScores?.timeliness || 0}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={task?.metrics?.componentScores?.timeliness || 0}
                  sx={{
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: alpha(getEfficiencyColor(task?.metrics?.componentScores?.timeliness), 0.1),
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getEfficiencyColor(task?.metrics?.componentScores?.timeliness),
                    }
                  }}
                />
              </Box>
            </Paper>

            {/* Trend Analysis */}
            {task?.metrics?.efficiency?.trend && (
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  backgroundColor: alpha(
                    task.metrics.efficiency.trend > 0 ? theme.palette.success.main :
                    task.metrics.efficiency.trend < 0 ? theme.palette.error.main :
                    theme.palette.info.main, 0.05
                  ),
                  border: `1px solid ${alpha(
                    task.metrics.efficiency.trend > 0 ? theme.palette.success.main :
                    task.metrics.efficiency.trend < 0 ? theme.palette.error.main :
                    theme.palette.info.main, 0.2
                  )}`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  {task.metrics.efficiency.trend > 0 ? (
                    <TrendingUp sx={{ color: theme.palette.success.main }} />
                  ) : task.metrics.efficiency.trend < 0 ? (
                    <TrendingDown sx={{ color: theme.palette.error.main }} />
                  ) : (
                    <TrendingFlat sx={{ color: theme.palette.info.main }} />
                  )}
                  <Typography variant="subtitle1" fontWeight="600">
                    Performance Trend
                  </Typography>
                </Box>
                
                <Typography variant="body2" sx={{ 
                  color: task.metrics.efficiency.trend > 0 ? theme.palette.success.main :
                         task.metrics.efficiency.trend < 0 ? theme.palette.error.main :
                         theme.palette.info.main,
                  fontWeight: 600,
                  textAlign: 'center',
                  fontSize: '1.25rem',
                }}>
                  {task.metrics.efficiency.trend > 0 ? '↑' : 
                   task.metrics.efficiency.trend < 0 ? '↓' : '→'} 
                  {Math.abs(task.metrics.efficiency.trend)}%
                </Typography>
                
                <Typography variant="caption" sx={{ 
                  display: 'block',
                  textAlign: 'center',
                  color: theme.palette.text.secondary,
                  mt: 1,
                }}>
                  {task.metrics.efficiency.trend > 0 
                    ? 'Efficiency improving' 
                    : task.metrics.efficiency.trend < 0
                      ? 'Efficiency declining'
                      : 'Stable performance'}
                </Typography>
              </Paper>
            )}
          </Stack>
        </Box>
      </Paper>
    </Slide>
  );
};

export default TaskPerformancePanel;
