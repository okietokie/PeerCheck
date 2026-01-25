import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Chip,
  Collapse,
  alpha,
  Slide,
  Stack
} from '@mui/material';
import {
  Security,
  Warning,
  Error as ErrorIcon,
  Info,
  Close,
  ExpandMore,
  ExpandLess,
  Timer,
  Speed,
  CheckCircle
} from '@mui/icons-material';

const TaskRiskPanel = ({ task, open, onClose, theme }) => {
  const [expanded, setExpanded] = useState(true);

  const getRiskColor = (score) => {
    if (score >= 4) return theme.palette.error.main;
    if (score >= 2) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  if (!open || !task) return null;

  const riskColor = getRiskColor(task?.metrics?.riskScore || 0);

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
          backgroundColor: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(20px)',
          borderLeft: `1px solid ${alpha(riskColor, 0.2)}`,
          boxShadow: `-20px 0 60px ${alpha(theme.palette.mode === 'dark' ? '#000' : riskColor, 0.2)}`,
          zIndex: 1300,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <Box sx={{ 
          p: 3, 
          pb: 2,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
          backgroundColor: alpha(riskColor, 0.05),
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" fontWeight="800" sx={{ 
              fontFamily: '"Alkatra", cursive',
              color: riskColor,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5
            }}>
              <Security sx={{ fontSize: 28 }} />
              Risk Analysis
            </Typography>
            <IconButton 
              onClick={onClose}
              size="small"
              sx={{
                color: theme.palette.text.secondary,
                backgroundColor: alpha(riskColor, 0.1),
                '&:hover': {
                  backgroundColor: alpha(riskColor, 0.2),
                  color: riskColor,
                }
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
              backgroundColor: alpha(riskColor, 0.1),
              color: riskColor,
            }}
          />
        </Box>

        {/* Content */}
        <Box sx={{ 
          flex: 1, 
          overflowY: 'auto',
          p: 3,
        }}>
          {/* Risk Score */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 3,
              backgroundColor: alpha(riskColor, 0.05),
              border: `1px solid ${alpha(riskColor, 0.2)}`,
              textAlign: 'center',
            }}
          >
            <Typography variant="h1" fontWeight="800" sx={{ 
              fontFamily: '"Alkatra", cursive',
              color: riskColor,
              mb: 1,
            }}>
              {task?.metrics?.riskScore || 0}
            </Typography>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              out of 8
            </Typography>
            <Chip
              label={task?.metrics?.riskScore >= 4 ? 'HIGH RISK' : 
                     task?.metrics?.riskScore >= 2 ? 'MEDIUM RISK' : 'LOW RISK'}
              color={riskColor === theme.palette.error.main ? 'error' : 
                     riskColor === theme.palette.warning.main ? 'warning' : 'success'}
              sx={{ 
                fontWeight: 700,
                fontSize: '1rem',
              }}
            />
          </Paper>

          {/* Risk Factors */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${alpha(riskColor, 0.2)}`,
              backgroundColor: alpha(riskColor, 0.03),
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                backgroundColor: alpha(riskColor, 0.05),
              }}
              onClick={() => setExpanded(!expanded)}
            >
              <Typography variant="body1" fontWeight="600" sx={{ 
                color: riskColor,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}>
                <Warning sx={{ fontSize: 20 }} />
                Risk Factors
              </Typography>
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </Box>
            
            <Collapse in={expanded}>
              <Box sx={{ p: 2.5 }}>
                <Stack spacing={2}>
                  {[
                    { 
                      label: 'Padded Time', 
                      value: task?.flags?.paddedTime,
                      icon: <Timer fontSize="small" />,
                      description: 'Task completion was much faster than estimated'
                    },
                    { 
                      label: 'Rushed Completion', 
                      value: task?.flags?.rushedCompletion,
                      icon: <Speed fontSize="small" />,
                      description: 'Task completed in a very short time'
                    },
                    { 
                      label: 'No Proof Submitted', 
                      value: task?.flags?.noProof,
                      icon: <Warning fontSize="small" />,
                      description: 'No proof of work has been uploaded'
                    },
                    { 
                      label: 'Overdue', 
                      value: task?.metrics?.isOverdue,
                      icon: <ErrorIcon fontSize="small" />,
                      description: 'Task is past its deadline'
                    },
                    { 
                      label: 'Manual Review Required', 
                      value: task?.flags?.manualReviewRequired,
                      icon: <Info fontSize="small" />,
                      description: 'Needs manual verification',
                      info: true
                    },
                  ].map((factor) => (
                    <Paper
                      key={factor.label}
                      elevation={0}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: factor.value ? 
                          (factor.info ? alpha(theme.palette.warning.main, 0.05) : alpha(theme.palette.error.main, 0.05)) : 
                          alpha(theme.palette.success.main, 0.05),
                        border: `1px solid ${factor.value ? 
                          (factor.info ? alpha(theme.palette.warning.main, 0.2) : alpha(theme.palette.error.main, 0.2)) : 
                          alpha(theme.palette.success.main, 0.2)}`,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <Box sx={{ color: factor.value ? 
                          (factor.info ? theme.palette.warning.main : theme.palette.error.main) : 
                          theme.palette.success.main 
                        }}>
                          {factor.icon}
                        </Box>
                        <Typography variant="body2" fontWeight="600" sx={{ 
                          color: factor.value ? 
                            (factor.info ? theme.palette.warning.main : theme.palette.error.main) : 
                            theme.palette.success.main,
                        }}>
                          {factor.label}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ 
                        color: theme.palette.text.secondary,
                        display: 'block',
                      }}>
                        {factor.description}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            </Collapse>
          </Paper>
        </Box>
      </Paper>
    </Slide>
  );
};

export default TaskRiskPanel;