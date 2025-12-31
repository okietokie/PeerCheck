import React from 'react';
import {
  Task,
  Search,
  FilterList,
  Sort,
  PlayArrow,
  Pause,
  CheckCircle,
  Timer,
  Assessment,
  Visibility,
  Edit,
  Warning,
  Security,
  TrendingUp,
  Person,
  CalendarToday,
  Speed,
  AccessTime,
  Refresh,
  Dashboard,
  Description,
  Email,
  Comment,
  Attachment,
  Title,
  Circle,
  CalendarMonth,
  Settings,
  Delete,
  Add,
  ArrowBack,
  Close,
  Grade,
  PlayCircleOutline,
  Lightbulb,
  Celebration,
  History,
  Group,
  Flag,
  Verified,
  Timeline,
  Insights,
  Checklist,
  ViewList
} from '@mui/icons-material';
import { Box, Avatar, Typography, Paper, Chip, Button, LinearProgress, Badge } from '@mui/material';
import { alpha } from '@mui/material/styles';

export const getTaskTabSteps = (theme) => [
  {
    id: 'welcome-tasks',
    title: 'Welcome to Task Management',
    description: "Let's explore your productivity hub",
    icon: <Task />,
    element: null,
    position: 'center',
    content: (
      <Box sx={{ textAlign: 'center' }}>
        <Avatar sx={{ 
          width: 80, 
          height: 80, 
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          color: theme.palette.primary.main,
          mx: 'auto',
          mb: 2
        }}>
          <Task sx={{ fontSize: 40 }} />
        </Avatar>
        <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600, color: 'text.primary' }}>
          Your Task Command Center
        </Typography>
        <Typography variant="body2" sx={{ mb: 2.5, color: 'text.secondary', lineHeight: 1.6 }}>
          Manage, track, and optimize all your tasks with intelligent metrics and 
          accountability features. Everything you need to stay productive.
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: 1,
          color: theme.palette.info.main,
          fontSize: '0.875rem'
        }}>
          <PlayArrow fontSize="small" />
          <Typography variant="caption">Let's master task management</Typography>
        </Box>
      </Box>
    )
  },
  {
    id: 'search-filter-bar',
    title: 'Search & Filter',
    description: 'Find exactly what you need',
    icon: <Search />,
    element: '.MuiPaper-root:nth-child(2)', // Search and Filter Bar
    position: 'bottom',
    offset: { x: 0, y: 20 },
    content: (
      <Box>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
          Quickly find and organize your tasks:
        </Typography>
        <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
          {[
            {
              icon: <Search sx={{ fontSize: 18, color: theme.palette.primary.main }} />,
              text: 'Search by title, description, or assignee',
              color: theme.palette.primary.main
            },
            {
              icon: <FilterList sx={{ fontSize: 18, color: theme.palette.info.main }} />,
              text: 'Filter by status, risk level, or deadlines',
              color: theme.palette.info.main
            },
            {
              icon: <Sort sx={{ fontSize: 18, color: theme.palette.success.main }} />,
              text: 'Sort by deadline, risk, or efficiency',
              color: theme.palette.success.main
            },
            {
              icon: <Warning sx={{ fontSize: 18, color: theme.palette.warning.main }} />,
              text: 'Highlight overdue tasks instantly',
              color: theme.palette.warning.main
            }
          ].map((item, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ 
                width: 32, 
                height: 32, 
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(item.color, 0.1),
                color: item.color
              }}>
                {item.icon}
              </Box>
              <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.875rem' }}>
                {item.text}
              </Typography>
            </Box>
          ))}
        </Box>
        <Paper sx={{ 
          p: 1.5, 
          borderRadius: 1.5,
          bgcolor: alpha(theme.palette.success.main, 0.05),
          border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`
        }}>
          <Typography variant="caption" sx={{ color: theme.palette.success.main, fontStyle: 'italic' }}>
            <Lightbulb fontSize="small" /> Tip: Use filters to focus on high-priority tasks!
          </Typography>
        </Paper>
      </Box>
    )
  },
  {
    id: 'stats-overview',
    title: 'Task Dashboard',
    description: 'Your productivity at a glance',
    icon: <Dashboard />,
    element: '.stats-cards-section',
    position: 'bottom',
    offset: { x: 0, y: 20 },
    content: (
      <Box>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
          Monitor your task performance with key metrics:
        </Typography>
        <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
          {[
            {
              icon: <Assessment sx={{ fontSize: 18, color: theme.palette.primary.main }} />,
              text: 'Total Tasks - All tasks in your queue',
              color: theme.palette.primary.main
            },
            {
              icon: <Security sx={{ fontSize: 18, color: theme.palette.error.main }} />,
              text: 'High Risk - Tasks needing attention',
              color: theme.palette.error.main
            },
            {
              icon: <CheckCircle sx={{ fontSize: 18, color: theme.palette.success.main }} />,
              text: 'Completed - Successfully finished tasks',
              color: theme.palette.success.main
            },
            {
              icon: <Warning sx={{ fontSize: 18, color: theme.palette.warning.main }} />,
              text: 'Need Proof - Awaiting verification',
              color: theme.palette.warning.main
            }
          ].map((item, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ 
                width: 32, 
                height: 32, 
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(item.color, 0.1),
                color: item.color
              }}>
                {item.icon}
              </Box>
              <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.875rem' }}>
                {item.text}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    )
  },
  {
    id: 'task-table',
    title: 'Task List',
    description: 'Manage all your tasks',
    icon: <ViewList />,
    element: '.MuiTableContainer-root',
    position: 'top',
    offset: { x: 0, y: -20 },
    content: (
      <Box>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
          Your comprehensive task management table:
        </Typography>
        <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
          {[
            {
              icon: <Checklist sx={{ fontSize: 18, color: theme.palette.primary.main }} />,
              text: 'Select multiple tasks for batch actions',
              color: theme.palette.primary.main
            },
            {
              icon: <Timer sx={{ fontSize: 18, color: theme.palette.info.main }} />,
              text: 'Track efficiency and time metrics',
              color: theme.palette.info.main
            },
            {
              icon: <Flag sx={{ fontSize: 18, color: theme.palette.warning.main }} />,
              text: 'Monitor risk scores and flags',
              color: theme.palette.warning.main
            },
            {
              icon: <Verified sx={{ fontSize: 18, color: theme.palette.success.main }} />,
              text: 'Check proof status for verification',
              color: theme.palette.success.main
            }
          ].map((item, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ 
                width: 32, 
                height: 32, 
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(item.color, 0.1),
                color: item.color
              }}>
                {item.icon}
              </Box>
              <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.875rem' }}>
                {item.text}
              </Typography>
            </Box>
          ))}
        </Box>
        <Paper sx={{ 
          p: 1.5, 
          borderRadius: 1.5,
          bgcolor: alpha(theme.palette.info.main, 0.05),
          border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`
        }}>
          <Typography variant="caption" sx={{ color: theme.palette.info.main, fontStyle: 'italic' }}>
            <Lightbulb fontSize="small" /> Click on any task row to view detailed information!
          </Typography>
        </Paper>
      </Box>
    )
  },
  {
    id: 'task-actions',
    title: 'Task Actions',
    description: 'Control your workflow',
    icon: <Settings />,
    element: '.MuiTableCell-body:nth-child(12)', // Actions button
    position: 'left',
    offset: { x: 20, y: 0 },
    content: (
      <Box>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
          Manage individual tasks with these actions:
        </Typography>
        <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
          {[
            {
              icon: <PlayArrow sx={{ fontSize: 18, color: theme.palette.success.main }} />,
              text: 'Start/Stop timer for time tracking',
              color: theme.palette.success.main
            },
            {
              icon: <Visibility sx={{ fontSize: 18, color: theme.palette.info.main }} />,
              text: 'Click on a task to view detailed information',
              color: theme.palette.info.main
            },
            {
              icon: <Edit sx={{ fontSize: 18, color: theme.palette.primary.main }} />,
              text: 'Edit task details and assignments in task dialog box',
              color: theme.palette.primary.main
            },
            {
              icon: <Attachment sx={{ fontSize: 18, color: theme.palette.warning.main }} />,
              text: 'Upload proof for verification',
              color: theme.palette.warning.main
            }
          ].map((item, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ 
                width: 32, 
                height: 32, 
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(item.color, 0.1),
                color: item.color
              }}>
                {item.icon}
              </Box>
              <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.875rem' }}>
                {item.text}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    )
  },
  {
    id: 'efficiency-metrics',
    title: 'Efficiency Tracking',
    description: 'Optimize your productivity',
    icon: <TrendingUp />,
    element: '.MuiTableCell-body:nth-child(9)', // Efficiency column
    position: 'left',
    offset: { x: -20, y: 0 },
    content: (
      <Box>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
          Monitor and improve your work efficiency:
        </Typography>
        <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
          {[
            {
              icon: <Speed sx={{ fontSize: 18, color: theme.palette.success.main }} />,
              text: 'Track time spent vs estimated',
              color: theme.palette.success.main
            },
            {
              icon: <Timeline sx={{ fontSize: 18, color: theme.palette.info.main }} />,
              text: 'View completion progress',
              color: theme.palette.info.main
            },
            {
              icon: <Insights sx={{ fontSize: 18, color: theme.palette.primary.main }} />,
              text: 'Analyze productivity trends',
              color: theme.palette.primary.main
            },
            {
              icon: <Grade sx={{ fontSize: 18, color: theme.palette.warning.main }} />,
              text: 'Identify improvement areas',
              color: theme.palette.warning.main
            }
          ].map((item, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ 
                width: 32, 
                height: 32, 
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(item.color, 0.1),
                color: item.color
              }}>
                {item.icon}
              </Box>
              <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.875rem' }}>
                {item.text}
              </Typography>
            </Box>
          ))}
        </Box>
        
        {/* Efficiency Visualization */}
        <Paper sx={{ 
          p: 2, 
          borderRadius: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.03),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          mb: 2
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              Efficiency Score Impact
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
              85% Average
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={85} 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                background: `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.primary.main})`,
              }
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Higher efficiency scores reduce risk and improve outcomes
          </Typography>
        </Paper>
      </Box>
    )
  },
  {
    id: 'risk-management',
    title: 'Risk Assessment',
    description: 'Stay ahead of potential issues',
    icon: <Security />,
    element: '.MuiTableCell-body:nth-child(10)', // Risk column
    position: 'left',
    offset: { x: 0, y: -20 },
    content: (
      <Box>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
          Proactively manage task risks:
        </Typography>
        <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
          {[
            {
              icon: <Flag sx={{ fontSize: 18, color: theme.palette.error.main }} />,
              text: 'High Risk (4+ score) - Needs immediate attention',
              color: theme.palette.error.main
            },
            {
              icon: <Warning sx={{ fontSize: 18, color: theme.palette.warning.main }} />,
              text: 'Medium Risk (2-3 score) - Monitor closely',
              color: theme.palette.warning.main
            },
            {
              icon: <CheckCircle sx={{ fontSize: 18, color: theme.palette.success.main }} />,
              text: 'Low Risk (0-1 score) - On track',
              color: theme.palette.success.main
            },
            {
              icon: <History sx={{ fontSize: 18, color: theme.palette.info.main }} />,
              text: 'Historical data informs future risk',
              color: theme.palette.info.main
            }
          ].map((item, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ 
                width: 32, 
                height: 32, 
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(item.color, 0.1),
                color: item.color
              }}>
                {item.icon}
              </Box>
              <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.875rem' }}>
                {item.text}
              </Typography>
            </Box>
          ))}
        </Box>
        
        {/* Risk Score Breakdown */}
        <Paper sx={{ 
          p: 2, 
          borderRadius: 2,
          bgcolor: alpha(theme.palette.error.main, 0.03),
          border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`
        }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: theme.palette.error.main }}>
            How Risk Scores Are Calculated:
          </Typography>
          <Box sx={{ display: 'grid', gap: 0.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary">No Proof Uploaded</Typography>
              <Typography variant="caption" fontWeight="600">+1 point</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary">Rushed Completion</Typography>
              <Typography variant="caption" fontWeight="600">+2 points</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" color="text.secondary">Manual Review Required</Typography>
              <Typography variant="caption" fontWeight="600">+3 points</Typography>
            </Box>
          </Box>
          <Typography variant="caption" color={theme.palette.error.main} sx={{ mt: 1, display: 'block' }}>
            Lower scores by uploading proof and completing tasks properly
          </Typography>
        </Paper>
      </Box>
    )
  },
  {
    id: 'tasks-complete',
    title: 'Task Mastery Achieved!',
    description: "You're ready to conquer your workflow",
    icon: <Celebration />,
    element: null,
    position: 'center',
    content: (
      <Box sx={{ textAlign: 'center' }}>
        <Avatar sx={{ 
          width: 80, 
          height: 80, 
          bgcolor: alpha(theme.palette.success.main, 0.1),
          color: theme.palette.success.main,
          mx: 'auto',
          mb: 2
        }}>
          <Celebration sx={{ fontSize: 40 }} />
        </Avatar>
        <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600, color: 'text.primary' }}>
          Task Management Pro!
        </Typography>
        <Typography variant="body2" sx={{ mb: 2.5, color: 'text.secondary', lineHeight: 1.6 }}>
          You now know how to efficiently manage tasks, track productivity, 
          and mitigate risks. Time to boost your workflow efficiency!
        </Typography>
        
        <Paper sx={{ 
          p: 2, 
          mb: 2.5,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.03),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
        }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: theme.palette.primary.main }}>
            Pro Tips for Success:
          </Typography>
          <Box sx={{ display: 'grid', gap: 1 }}>
            {[
              'Upload proof immediately after task completion',
              'Monitor risk scores daily for early warnings',
              'Use filters to focus on high-priority tasks',
              'Track efficiency trends to optimize workflow'
            ].map((tip, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircle sx={{ fontSize: 16, color: theme.palette.success.main }} />
                <Typography variant="caption" sx={{ color: 'text.primary' }}>
                  {tip}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
        
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: 0.75,
          color: theme.palette.info.main
        }}>
          <PlayArrow fontSize="small" />
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Start managing tasks and watch your productivity soar!
          </Typography>
        </Box>
      </Box>
    )
  }
];