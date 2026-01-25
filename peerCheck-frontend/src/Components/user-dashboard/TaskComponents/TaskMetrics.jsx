import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Chip,
  LinearProgress,
  Collapse,
  Tooltip,
  alpha,
  Zoom,
  Slide,
  CircularProgress
} from '@mui/material';
import {
  TrendingUp,
  Security,
  Timer,
  CheckCircle,
  CalendarToday,
  Upload,
  Info,
  Close,
  ExpandMore,
  ExpandLess,
  Insights,
  Analytics,
  Timeline,
  Score,
  BarChart,
  Warning,
  Error as ErrorIcon,
  Speed,
  Assessment,
  Download,
  History,
  ShowChart
} from '@mui/icons-material';
import { Stack } from '@mui/system';

const TaskMetricsPanel = ({ task, open, onClose, theme }) => {
  const [expandedSections, setExpandedSections] = useState({
    efficiency: true,
    risk: true,
    performance: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getEfficiencyColor = (score) => {
    const s = Number(score) || 0;
    if (s >= 85) return theme.palette.success.main;
    if (s >= 70) return theme.palette.info.main;
    if (s >= 50) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getEfficiencyLabel = (score) => {
    const s = Number(score) || 0;
    if (s >= 85) return 'Outstanding';
    if (s >= 70) return 'Excellent';
    if (s >= 50) return 'Satisfactory';
    if (s >= 30) return 'Needs Improvement';
    return 'Unsatisfactory';
  };

  const getRiskColor = (score) => {
    const s = Number(score) || 0;
    if (s >= 4) return theme.palette.error.main;
    if (s >= 2) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  const getTimeUtilization = () => {
    const estimated = task?.estimatedTime || 0;
    const spent = task?.totalFocusTime || 0;
    
    if (estimated === 0) return { utilization: 0, status: 'No estimate' };
    
    const utilization = (spent / estimated) * 100;
    
    if (utilization <= 50) return { utilization, status: 'Underutilized', color: 'warning' };
    if (utilization <= 100) return { utilization, status: 'Optimal', color: 'success' };
    if (utilization <= 150) return { utilization, status: 'Overworking', color: 'warning' };
    return { utilization, status: 'Critical Overwork', color: 'error' };
  };

  const getProofQuality = () => {
    const proofs = task?.proofUploads || [];
    if (proofs.length === 0) return { quality: 0, label: 'No Proof', color: 'error' };
    
    let qualityScore = 50;
    const fileTypes = proofs.map(p => p.fileType);
    if (fileTypes.some(t => t.includes('video'))) qualityScore += 20;
    if (fileTypes.some(t => t.includes('image'))) qualityScore += 15;
    if (fileTypes.some(t => t.includes('pdf') || t.includes('document'))) qualityScore += 10;
    
    const hasDescriptions = proofs.some(p => p.description?.trim());
    if (hasDescriptions) qualityScore += 15;
    
    if (qualityScore >= 80) return { quality: qualityScore, label: 'Excellent', color: 'success' };
    if (qualityScore >= 60) return { quality: qualityScore, label: 'Good', color: 'info' };
    if (qualityScore >= 40) return { quality: qualityScore, label: 'Basic', color: 'warning' };
    return { quality: qualityScore, label: 'Poor', color: 'error' };
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

  const timeUtilization = getTimeUtilization();
  const proofQuality = getProofQuality();
console.log("Rendering TaskMetricsPanel for task:", task);
  if (!open || !task) return null;

  return (
    <Slide in={open} direction="left" timeout={300} mountOnEnter unmountOnExit>
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: 380,
          height: '100vh',
          overflow: 'hidden',
          borderRadius: 0,
          backgroundColor: alpha(theme.palette.background.paper, 0.98),
          backdropFilter: 'blur(20px)',
          borderLeft: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          boxShadow: `-20px 0 60px ${alpha(theme.palette.mode === 'dark' ? '#000' : theme.palette.primary.main, 0.2)}`,
          zIndex: 1300,
          display: 'flex',
          flexDirection: 'column',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          }
        }}
      >
        {/* Header */}
        <Box sx={{ 
          p: 3, 
          pb: 2,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
          position: 'relative'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" fontWeight="800" sx={{ 
              fontFamily: '"Alkatra", cursive',
              color: theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5
            }}>
              <Insights sx={{ fontSize: 28 }} />
              Task Analytics
            </Typography>
            <IconButton 
              onClick={onClose}
              size="small"
              sx={{
                color: theme.palette.text.secondary,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                  color: theme.palette.primary.main,
                  transform: 'rotate(90deg)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              <Close />
            </IconButton>
          </Box>
          
          <Chip
            label={task?.taskTitle?.substring(0, 30) + (task?.taskTitle?.length > 30 ? '...' : '')}
            size="small"
            sx={{ 
              mt: 1,
              fontWeight: 600,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              borderRadius: 2
            }}
          />
        </Box>

        {/* Scrollable Content */}
        <Box sx={{ 
          flex: 1, 
          overflowY: 'auto',
          p: 3,
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-track': {
            background: alpha(theme.palette.divider, 0.1),
            borderRadius: 3,
          },
          '&::-webkit-scrollbar-thumb': {
            background: alpha(theme.palette.primary.main, 0.3),
            borderRadius: 3,
            '&:hover': { background: alpha(theme.palette.primary.main, 0.5) }
          }
        }}>
          {/* Overall Efficiency Score */}
          <Zoom in={true} style={{ transitionDelay: '100ms' }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                mb: 3,
                borderRadius: 3,
                background: `linear-gradient(135deg, 
                  ${alpha(theme.palette.primary.main, 0.1)} 0%, 
                  ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Typography variant="h6" fontWeight="700" sx={{ 
                mb: 2,
                fontFamily: '"Adlam Display", serif',
                color: theme.palette.text.primary,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Score sx={{ color: theme.palette.primary.main }} />
                Overall Efficiency
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Stack spacing={0.5}>
                  <Typography variant="h1" fontWeight="800" sx={{ 
                    fontFamily: '"Alkatra", cursive',
                    color: getEfficiencyColor(task?.metrics?.efficiency || 0),
                    lineHeight: 1
                  }}>
                    {Math.round(task?.metrics?.efficiency || 0)}%
                  </Typography>
                  <Chip
                    label={getEfficiencyLabel(task?.metrics?.efficiency || 0)}
                    color={getEfficiencyColor(task?.metrics?.efficiency || 0) === theme.palette.success.main ? 'success' : 
                          getEfficiencyColor(task?.metrics?.efficiency || 0) === theme.palette.info.main ? 'info' : 
                          getEfficiencyColor(task?.metrics?.efficiency || 0) === theme.palette.warning.main ? 'warning' : 'error'}
                    sx={{ fontWeight: 700, fontSize: '0.9rem' }}
                  />
                </Stack>
              </Box>
              
              <LinearProgress 
                variant="determinate" 
                value={Math.min(task?.metrics?.efficiency || 0, 100)}
                sx={{ 
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: alpha(getEfficiencyColor(task?.metrics?.efficiency || 0), 0.1),
                  '& .MuiLinearProgress-bar': {
                    background: `linear-gradient(90deg, 
                      ${getEfficiencyColor(task?.metrics?.efficiency || 0)}, 
                      ${alpha(getEfficiencyColor(task?.metrics?.efficiency || 0), 0.7)})`,
                    borderRadius: 4
                  }
                }}
              />
              
              <Typography variant="caption" sx={{ 
                mt: 1,
                display: 'block',
                textAlign: 'center',
                color: theme.palette.text.secondary,
                fontFamily: '"Inter", sans-serif'
              }}>
                Calculated from time, quality, and risk factors
              </Typography>
            </Paper>
          </Zoom>

          {/* Risk Assessment */}
          <Paper
            elevation={0}
            sx={{
              mb: 3,
              borderRadius: 3,
              border: `1px solid ${alpha(getRiskColor(task?.metrics?.riskScore || 0), 0.2)}`,
              backgroundColor: alpha(getRiskColor(task?.metrics?.riskScore || 0), 0.03),
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                backgroundColor: alpha(getRiskColor(task?.metrics?.riskScore || 0), 0.05),
                borderBottom: expandedSections.risk ? `1px solid ${alpha(theme.palette.divider, 0.2)}` : 'none'
              }}
              onClick={() => toggleSection('risk')}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Security sx={{ color: getRiskColor(task?.metrics?.riskScore || 0) }} />
                <Typography variant="body1" fontWeight="600" sx={{ 
                  fontFamily: '"Adlam Display", serif',
                  color: theme.palette.text.primary
                }}>
                  Risk Assessment
                </Typography>
                <Chip
                  label={task?.metrics?.riskScore >= 4 ? 'High' : 
                         task?.metrics?.riskScore >= 2 ? 'Medium' : 'Low'}
                  color={getRiskColor(task?.metrics?.riskScore || 0)}
                  size="small"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
              {expandedSections.risk ? <ExpandLess /> : <ExpandMore />}
            </Box>
            
            <Collapse in={expandedSections.risk}>
              <Box sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    Risk Score
                  </Typography>
                  <Typography variant="h4" fontWeight="800" sx={{ 
                    fontFamily: '"Alkatra", cursive',
                    color: getRiskColor(task?.metrics?.riskScore || 0)
                  }}>
                    {task?.metrics?.riskScore || 0}/8
                  </Typography>
                </Box>
                
                {/* Risk Factors */}
                {[
                  { label: 'Padded Time', value: task?.metrics?.risk?.flags?.paddedTime, weight: 2 },
                  { label: 'Rushed Completion', value: task?.metrics?.risk?.flags?.rushedCompletion, weight: 2 },
                  { label: 'No Proof', value: task?.metrics?.risk?.flags?.noProof, weight: 1 },
                  { label: 'Overdue', value: task?.metrics?.risk?.flags?.isOverdue, weight: 1 },
                  { label: 'Task Nearing Deadline', value: task?.metrics?.risk?.flags?.nearDeadline, weight: 1 },
                  { label: 'Task Not Started: Deadline Approaching', value: task?.metrics?.risk?.flags?.notStartedNearDeadline, weight: 1 },
                  { 
                    label: 'Manual Review Needed', 
                    value: task?.metrics?.risk?.flags?.manualReviewRequired, 
                    weight: 0,
                    info: true 
                  }
                ].map((factor) => (
                  <Box 
                    key={factor.label}
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1.5,
                      mb: 1.5,
                      borderRadius: 2,
                      backgroundColor: factor.value ? 
                        (factor.info ? alpha(theme.palette.warning.main, 0.05) : alpha(theme.palette.error.main, 0.05)) : 
                        alpha(theme.palette.success.main, 0.05),
                      border: `1px solid ${factor.value ? 
                        (factor.info ? alpha(theme.palette.warning.main, 0.2) : alpha(theme.palette.error.main, 0.2)) : 
                        alpha(theme.palette.success.main, 0.2)}`
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
                      <Typography variant="body2" sx={{ 
                        fontFamily: '"Inter", sans-serif',
                        color: factor.value ? 
                          (factor.info ? theme.palette.warning.main : theme.palette.error.main) : 
                          theme.palette.success.main
                      }}>
                        {factor.label}
                      </Typography>
                      {factor.info && (
                        <Tooltip title="Flag indicating manual review is recommended">
                          <Info fontSize="small" sx={{ fontSize: 14, opacity: 0.7 }} />
                        </Tooltip>
                      )}
                    </Box>
                    <Chip
                      label={factor.weight > 0 ? `${factor.value ? factor.weight : 0} pts` : 'Info'}
                      size="small"
                      color={factor.value ? 
                        (factor.info ? 'warning' : 'error') : 
                        'success'}
                      variant="outlined"
                      sx={{ fontWeight: 500, fontSize: factor.info ? '0.7rem' : '0.75rem' }}
                    />
                  </Box>
                ))}
                
                <Typography variant="caption" sx={{ 
                  mt: 2,
                  display: 'block',
                  color: theme.palette.text.secondary,
                  fontStyle: 'italic'
                }}>
                  {task?.metrics?.riskScore >= 4 
                    ? '⚠️ High risk detected. Consider intervention.' 
                    : task?.metrics?.riskScore >= 2
                      ? '⚠️ Medium risk. Monitor closely.'
                      : '✅ Low risk. Task is healthy.'}
                </Typography>
              </Box>
            </Collapse>
          </Paper>

          {/* Performance Breakdown */}
          <Paper
            elevation={0}
            sx={{
              mb: 3,
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              backgroundColor: alpha(theme.palette.info.main, 0.03),
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                backgroundColor: alpha(theme.palette.info.main, 0.05),
                borderBottom: expandedSections.efficiency ? `1px solid ${alpha(theme.palette.divider, 0.2)}` : 'none'
              }}
              onClick={() => toggleSection('efficiency')}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <ShowChart sx={{ color: theme.palette.info.main }} />
                <Typography variant="body1" fontWeight="600" sx={{ 
                  fontFamily: '"Adlam Display", serif',
                  color: theme.palette.text.primary
                }}>
                  Performance Breakdown
                </Typography>
              </Box>
              {expandedSections.efficiency ? <ExpandLess /> : <ExpandMore />}
            </Box>
            
            <Collapse in={expandedSections.efficiency}>
              <Box sx={{ p: 2.5 }}>
                {/* Time Utilization */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      Time Utilization
                    </Typography>
                    <Chip
                      label={timeUtilization.status}
                      color={timeUtilization.color}
                      size="small"
                      sx={{ fontWeight: 500 }}
                    />
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min(timeUtilization.utilization, 100)}
                    sx={{ 
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: alpha(theme.palette[timeUtilization.color].main, 0.1),
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: theme.palette[timeUtilization.color].main
                      }
                    }}
                  />
                  <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: theme.palette.text.secondary }}>
                    {formatTime(task?.totalFocusTime || 0)} of {formatTime(task?.estimatedTime || 0)} estimated ({Math.round(timeUtilization.utilization)}%)
                  </Typography>
                </Box>
                
                {/* Proof Quality */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                      Proof Quality
                    </Typography>
                    <Chip
                      label={proofQuality.label}
                      color={proofQuality.color}
                      size="small"
                      sx={{ fontWeight: 500 }}
                    />
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={proofQuality.quality}
                    sx={{ 
                      height: 6,
                      borderRadius: 3,
                      backgroundColor: alpha(theme.palette[proofQuality.color].main, 0.1),
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: theme.palette[proofQuality.color].main
                      }
                    }}
                  />
                  <Typography variant="caption" sx={{ mt: 0.5, display: 'block', color: theme.palette.text.secondary }}>
                    {task?.proofUploads?.length || 0} file(s) uploaded
                  </Typography>
                </Box>
                
                {/* Component Scores */}
                {task?.metrics?.componentScores && (
                  <Box>
                    <Typography variant="body2" fontWeight="600" sx={{ mb: 2, color: theme.palette.text.secondary }}>
                      Component Scores
                    </Typography>
                    {Object.entries(task.metrics.componentScores).map(([key, score]) => {
                      const componentLabels = {
                        timeEfficiency: { label: 'Time Efficiency', icon: <Timer fontSize="small" /> },
                        completionQuality: { label: 'Completion Quality', icon: <CheckCircle fontSize="small" /> },
                        timeliness: { label: 'Timeliness', icon: <CalendarToday fontSize="small" /> },
                        proofQuality: { label: 'Proof Quality', icon: <Upload fontSize="small" /> },
                        riskFactor: { label: 'Risk Factor', icon: <Security fontSize="small" /> }
                      };
                      
                      return (
                        <Box key={key} sx={{ mb: 1.5 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {componentLabels[key]?.icon}
                              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                {componentLabels[key]?.label}
                              </Typography>
                            </Box>
                            <Typography variant="caption" fontWeight="600" sx={{ 
                              color: getEfficiencyColor(score)
                            }}>
                              {score}%
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={score}
                            sx={{ 
                              height: 4,
                              borderRadius: 2,
                              backgroundColor: alpha(getEfficiencyColor(score), 0.1),
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: getEfficiencyColor(score)
                              }
                            }}
                          />
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </Box>
            </Collapse>
          </Paper>

          {/* Timeline Summary */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
              backgroundColor: alpha(theme.palette.warning.main, 0.03),
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                backgroundColor: alpha(theme.palette.warning.main, 0.05)
              }}
              onClick={() => toggleSection('performance')}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Timeline sx={{ color: theme.palette.warning.main }} />
                <Typography variant="body1" fontWeight="600" sx={{ 
                  fontFamily: '"Adlam Display", serif',
                  color: theme.palette.text.primary
                }}>
                  Timeline Summary
                </Typography>
              </Box>
              {expandedSections.performance ? <ExpandLess /> : <ExpandMore />}
            </Box>
            
            <Collapse in={expandedSections.performance}>
              <Box sx={{ p: 2.5 }}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mb: 0.5 }}>
                      Status
                    </Typography>
                    <Chip
                      icon={task?.status === 'completed' ? <CheckCircle /> : 
                            task?.status === 'active' ? <Timer /> : 
                            task?.status === 'paused' ? <Warning /> : <Info />}
                      label={task?.status ? task.status.replace('_', ' ').toUpperCase() : 'NOT STARTED'}
                      color={task?.status === 'completed' ? 'success' : 
                             task?.status === 'active' ? 'info' : 
                             task?.status === 'paused' ? 'warning' : 'default'}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                  
                  <Box>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mb: 0.5 }}>
                      Deadline Status
                    </Typography>
                    <Chip
                      icon={task?.metrics?.isOverdue ? <Warning /> : <CheckCircle />}
                      label={task?.metrics?.isOverdue ? 'OVERDUE' : 'ON TRACK'}
                      color={task?.metrics?.isOverdue ? 'error' : 'success'}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                  
                  {task?.metrics?.daysUntilDeadline !== undefined && (
                    <Box>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mb: 0.5 }}>
                        Days Remaining
                      </Typography>
                      <Typography variant="body2" fontWeight="600">
                        {task.metrics.daysUntilDeadline} days
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Box>
            </Collapse>
          </Paper>
        </Box>

        {/* Footer */}
        <Box sx={{ 
          p: 2,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
          backgroundColor: alpha(theme.palette.background.default, 0.5)
        }}>
          <Typography variant="caption" sx={{ 
            color: theme.palette.text.secondary,
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            fontFamily: '"Inter", sans-serif'
          }}>
            <Info fontSize="inherit" />
            Analytics updated in real-time
          </Typography>
        </Box> 
      </Paper>
    </Slide>
  );
};

export default TaskMetricsPanel;