// TaskDetailsModalSteps.js
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
  ViewList,
  Upload,
  Download,
  Info,
  Folder,
  MoreHoriz,
  Error as ErrorIcon,
  KeyboardArrowDown,
  KeyboardArrowUp
} from '@mui/icons-material';
import { Box, Avatar, Typography, Paper, Chip, Button, LinearProgress, Badge } from '@mui/material';
import { alpha } from '@mui/material/styles';

export
 const getTaskModalSteps = (theme) => [
  {
    id: 'modal-welcome',
    title: 'Task Details Hub',
    description: "Dive deep into task insights",
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
          <Description sx={{ fontSize: 40 }} />
        </Avatar>
        <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600, color: 'text.primary' }}>
          Comprehensive Task Details
        </Typography>
        <Typography variant="body2" sx={{ mb: 2.5, color: 'text.secondary', lineHeight: 1.6 }}>
          This modal gives you complete control over tasks. View metrics, upload proof, 
          track activity, and manage all aspects of your workflow in one place.
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
          <Typography variant="caption">Explore task management in depth</Typography>
        </Box>
      </Box>
    )
  },
  {
    id: 'modal-header',
    title: 'Task Overview',
    description: 'Quick status and essential info',
    icon: <Dashboard />,
    element: '.MuiDialogTitle-root', // Modal header
    position: 'bottom',
    offset: { x: 0, y: 10 },
    content: (
      <Box>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
          The task header shows you everything at a glance:
        </Typography>
        <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
          {[
            {
              icon: <Task sx={{ fontSize: 18, color: theme.palette.primary.main }} />,
              text: 'Task title and description',
              color: theme.palette.primary.main
            },
            {
              icon: <Flag sx={{ fontSize: 18, color: theme.palette.warning.main }} />,
              text: 'Status indicators (Active, Completed, Overdue)',
              color: theme.palette.warning.main
            },
            {
              icon: <Security sx={{ fontSize: 18, color: theme.palette.error.main }} />,
              text: 'Risk flags and warnings',
              color: theme.palette.error.main
            },
            {
              icon: <Close sx={{ fontSize: 18, color: theme.palette.text.secondary }} />,
              text: 'Close modal to return to main view',
              color: theme.palette.text.secondary
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
            <Lightbulb fontSize="small" /> Click status chips to filter similar tasks!
          </Typography>
        </Paper>
      </Box>
    )
  },
  {
    id: 'modal-tabs',
    title: 'Navigation Tabs',
    description: 'Explore different task aspects',
    icon: <ViewList />,
    element: '.modal-tabs', // Tabs section
    position: 'bottom',
    offset: { x: 0, y: 20 },
    content: (
      <Box>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
          Switch between comprehensive views:
        </Typography>
        <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
          {[
            {
              icon: <Dashboard sx={{ fontSize: 18, color: theme.palette.primary.main }} />,
              text: 'Overview - Basic info and quick actions',
              color: theme.palette.primary.main
            },
            {
              icon: <Assessment sx={{ fontSize: 18, color: theme.palette.info.main }} />,
              text: 'Metrics - Detailed analytics and efficiency',
              color: theme.palette.info.main
            },
            {
              icon: <Upload sx={{ fontSize: 18, color: theme.palette.warning.main }} />,
              text: 'Proof - Upload and manage verification files',
              color: theme.palette.warning.main
            },
            {
              icon: <History sx={{ fontSize: 18, color: theme.palette.success.main }} />,
              text: 'Activity - Complete task history and logs',
              color: theme.palette.success.main
            },
            {
              icon: <Comment sx={{ fontSize: 18, color: theme.palette.secondary.main }} />,
              text: 'Comments - Team communication and feedback',
              color: theme.palette.secondary.main
            }
          ].map((item, index) => (
            <Box key={index} sx={{ display: '-flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ 
                width: 50, 
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
    id: 'overview',
    title: 'Task Details',
    description: 'View and edit task information',
    icon: <Description />,
    element: '[data-tour-tab="overview"]', // Description card
    position: 'right',
    offset: { x: 20, y: 0 },
    content: (
      <Box>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
          Manage your task details:
        </Typography>
        <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
          {[
            {
              icon: <Title sx={{ fontSize: 18, color: theme.palette.primary.main }} />,
              text: 'Task title and description',
              color: theme.palette.primary.main
            },
            {
              icon: <Edit sx={{ fontSize: 18, color: theme.palette.warning.main }} />,
              text: 'Click "Edit Details" to modify information',
              color: theme.palette.warning.main
            },
            {
              icon: <Person sx={{ fontSize: 18, color: theme.palette.primary.main }} />,
              text: 'Assigned team member with contact info',
              color: theme.palette.primary.main
            },
            {
              icon: <CalendarToday sx={{ fontSize: 18, color: theme.palette.warning.main }} />,
              text: 'Deadline with countdown timer',
              color: theme.palette.warning.main
            },
            {
              icon: <Warning sx={{ fontSize: 18, color: theme.palette.error.main }} />,
              text: 'Overdue warnings with visual indicators',
              color: theme.palette.error.main
            },
            {
              icon: <AccessTime sx={{ fontSize: 18, color: theme.palette.info.main }} />,
              text: 'Time remaining calculations',
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
        <Paper sx={{ 
          p: 1.5, 
          borderRadius: 1.5,
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
        }}>
          <Typography variant="caption" sx={{ color: theme.palette.primary.main, fontStyle: 'italic' }}>
            <Lightbulb fontSize="small" /> Clear descriptions reduce misunderstandings!
          </Typography>
        </Paper>
      </Box>
    )
  },

  {
    id: 'metrics-tab',
    title: 'Detailed Analytics',
    description: 'Deep dive into task performance',
    icon: <Assessment />,

    element: '[data-tour-tab="metrics"]',
    position: 'bottom',

    offset: { x: 0, y: 20 },
    content: (
      <Box>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
          Comprehensive task analysis:
        </Typography>
        <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
          {[
            {
              icon: <Security sx={{ fontSize: 18, color: theme.palette.error.main }} />,
              text: 'Risk score with color-coded severity',
              color: theme.palette.error.main
            },
            {
              icon: <TrendingUp sx={{ fontSize: 18, color: theme.palette.success.main }} />,
              text: 'Efficiency percentage and trends',
              color: theme.palette.success.main
            },
            {
              icon: <Flag sx={{ fontSize: 18, color: theme.palette.warning.main }} />,
              text: 'Risk factors and flags analysis',
              color: theme.palette.warning.main
            },
            {
              icon: <Timeline sx={{ fontSize: 18, color: theme.palette.info.main }} />,
              text: 'Time breakdown and comparisons',
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
        
        <Paper sx={{ 
          p: 1.5, 
          borderRadius: 1.5,
          bgcolor: alpha(theme.palette.error.main, 0.05),
          border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`
        }}>
          <Typography variant="caption" sx={{ color: theme.palette.error.main, fontStyle: 'italic' }}>
            <Warning fontSize="small" /> High risk scores need immediate attention!
          </Typography>
        </Paper>
      </Box>
    )
  },
  {
    id: 'proof-tab',
    title: 'Proof Management',
    description: 'Upload and verify work evidence',
    icon: <Upload />,
    element: '[data-tour-tab="proof"]', // Proof tab content
    position: 'bottom',
    offset: { x: 0, y: -20 },
    content: (
      <Box>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
          Manage verification files:
        </Typography>
        <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
          {[
            {
              icon: <Upload sx={{ fontSize: 18, color: theme.palette.warning.main }} />,
              text: 'Upload proof files to reduce risk score',
              color: theme.palette.warning.main
            },
            {
              icon: <Visibility sx={{ fontSize: 18, color: theme.palette.info.main }} />,
              text: 'View uploaded files directly in browser',
              color: theme.palette.info.main
            },
            {
              icon: <Download sx={{ fontSize: 18, color: theme.palette.primary.main }} />,
              text: 'Download proof for offline review',
              color: theme.palette.primary.main
            },
            {
              icon: <Delete sx={{ fontSize: 18, color: theme.palette.error.main }} />,
              text: 'Remove incorrect or outdated files',
              color: theme.palette.error.main
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
            <Lightbulb fontSize="small" /> Upload proof immediately after completing work!
          </Typography>
        </Paper>
      </Box>
    )
  },
  {
    id: 'activity-tab',
    title: 'Task History',
    description: 'Track all task activities',
    icon: <History />,
    element: '[data-tour-tab="activity"]', // Activity tab content
    position: 'bottom',
    offset: { x: -20, y: 0 },
    content: (
      <Box>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
          Complete audit trail:
        </Typography>
        <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
          {[
            {
              icon: <Refresh sx={{ fontSize: 18, color: theme.palette.info.main }} />,
              text: 'Refresh to see latest activities',
              color: theme.palette.info.main
            },
            {
              icon: <Person sx={{ fontSize: 18, color: theme.palette.primary.main }} />,
              text: 'User actions with timestamps',
              color: theme.palette.primary.main
            },
            {
              icon: <Timer sx={{ fontSize: 18, color: theme.palette.warning.main }} />,
              text: 'Time tracking events and updates',
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
          bgcolor: alpha(theme.palette.info.main, 0.05),
          border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`
        }}>
          <Typography variant="caption" sx={{ color: theme.palette.info.main, fontStyle: 'italic' }}>
            <Lightbulb fontSize="small" /> Use activity logs for accountability tracking!
          </Typography>
        </Paper>
      </Box>
    )
  },
  {
    id: 'comments-tab',
    title: 'Team Communication',
    description: 'Collaborate with team members',
    icon: <Comment />,
    element: '[data-tour-tab="comments"]', // Comments tab content
    position: 'bottom',
    offset: { x: 20, y: 0 },
    content: (
      <Box>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
          Real-time collaboration features:
        </Typography>
        <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
          {[
            {
              icon: <Comment sx={{ fontSize: 18, color: theme.palette.secondary.main }} />,
              text: 'Add comments and questions',
              color: theme.palette.secondary.main
            },
            {
              icon: <Group sx={{ fontSize: 18, color: theme.palette.primary.main }} />,
              text: 'Team discussions and feedback',
              color: theme.palette.primary.main
            },
            {
              icon: <Attachment sx={{ fontSize: 18, color: theme.palette.info.main }} />,
              text: 'Share files and references',
              color: theme.palette.info.main
            },
            {
              icon: <CheckCircle sx={{ fontSize: 18, color: theme.palette.success.main }} />,
              text: 'Resolve questions and mark as done',
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
      </Box>
    )
  },

  {
    id: 'footer-actions',
    title: 'Bottom Controls',
    description: 'Finalize task management',
    icon: <Settings />,
    element: '.MuiDialogActions-root', // Footer actions
    position: 'top',
    offset: { x: 0, y: -20 },
    content: (
      <Box>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
          Complete your task management workflow:
        </Typography>
        <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
          {[
            {
              icon: <CheckCircle sx={{ fontSize: 18, color: theme.palette.success.main }} />,
              text: 'Students: Mark task as complete',
              color: theme.palette.success.main
            },
            {
              icon: <Comment sx={{ fontSize: 18, color: theme.palette.info.main }} />,
              text: 'Add comments and feedback',
              color: theme.palette.info.main
            },
            {
              icon: <Close sx={{ fontSize: 18, color: theme.palette.text.secondary }} />,
              text: 'Close modal to save changes',
              color: theme.palette.text.secondary
            },
            {
              icon: <Refresh sx={{ fontSize: 18, color: theme.palette.primary.main }} />,
              text: 'Changes auto-sync with main view',
              color: theme.palette.primary.main
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
    id: 'modal-complete',
    title: 'Task Mastery Complete!',
    description: "You're now a task management expert",
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
          Task Details Proficient!
        </Typography>
        <Typography variant="body2" sx={{ mb: 2.5, color: 'text.secondary', lineHeight: 1.6 }}>
          You now know how to navigate task details, manage proof uploads, 
          track metrics, and collaborate effectively. Master these features to 
          supercharge your productivity!
        </Typography>
        
        <Paper sx={{ 
          p: 2, 
          mb: 2.5,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.03),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
        }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: theme.palette.primary.main }}>
            Pro Tips for Advanced Users:
          </Typography>
          <Box sx={{ display: 'grid', gap: 1 }}>
            {[
              'Use metrics tab to identify efficiency bottlenecks',
              'Upload proof immediately to reduce risk scores',
              'Check activity logs for accountability tracking',
              'Use comments for asynchronous collaboration'
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
            Close this modal and apply your new skills to manage tasks effectively!
          </Typography>
        </Box>
      </Box>
    )
  }
];