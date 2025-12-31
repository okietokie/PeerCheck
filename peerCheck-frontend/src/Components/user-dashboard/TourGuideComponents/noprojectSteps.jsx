// NoProjectsTour.js
import React from 'react';
import {
  Folder,
  Add,
  Group,
  Dashboard,
  PlayArrow,
  Lightbulb,
  Celebration,
  Warning,
  Info,
  ArrowForward,
  RocketLaunch,
  GroupWork,
  Assignment,
  Timeline,
  Assessment,
  School,
  Handshake,
  Search,
  FilterList,
  Sort,
  ViewModule,
  ViewList,
  CalendarToday,
  Grade,
  Tag,
  People,
  TrendingUp,
  CheckCircle,
  WarningAmber,
  ErrorOutline,
  FolderOpen,
  FolderOff,
  CreateNewFolder,
  Workspaces,
  Task,
  Description,
  Checklist,
  PendingActions,
  Schedule,
  AlignVerticalBottom,
  DataThresholding,
  Analytics,
  QueryStats,
  TableView
} from '@mui/icons-material';
import { Box, Avatar, Typography, Paper, Chip, Button } from '@mui/material';
import { alpha } from '@mui/material/styles';

export const getNoProjectsTourSteps = (theme) => [
  {
    id: 'welcome-no-projects',
    title: 'Welcome to Projects',
    description: "Let's create your first project!",
    icon: <Folder />,
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
          <Folder sx={{ fontSize: 40 }} />
        </Avatar>
        <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600, color: 'text.primary' }}>
          Start Your Project Journey
        </Typography>
        <Typography variant="body2" sx={{ mb: 2.5, color: 'text.secondary', lineHeight: 1.6 }}>
          Projects help you organize team work, track progress, and achieve goals collaboratively. 
          Let's get you started with your first project in just a few steps.
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
          <Typography variant="caption">Follow the guided tour to begin</Typography>
        </Box>
      </Box>
    )
  },
  {
    id: 'create-project-step',
    title: 'Create Your First Project',
    description: 'Start with the basics',
    icon: <CreateNewFolder />,
    element: '.create-project-step', // Create Project button
    position: 'left',
    offset: { x: 0, y: -10 },
    content: (
      <Box>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
          Create a project to organize team work:
        </Typography>
        <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
          {[
            {
              icon: <Assignment sx={{ fontSize: 18, color: theme.palette.primary.main }} />,
              text: 'Define project name and description',
              color: theme.palette.primary.main
            },
            {
              icon: <Group sx={{ fontSize: 18, color: theme.palette.info.main }} />,
              text: 'Select a team to collaborate with',
              color: theme.palette.info.main
            },
            {
              icon: <Timeline sx={{ fontSize: 18, color: theme.palette.warning.main }} />,
              text: 'Set project timeline and deadlines',
              color: theme.palette.warning.main
            },
            {
              icon: <Assessment sx={{ fontSize: 18, color: theme.palette.success.main }} />,
              text: 'Configure grading criteria and weights',
              color: theme.palette.success.main
            },
            {
              icon: <School sx={{ fontSize: 18, color: theme.palette.secondary.main }} />,
              text: 'Add a mentor for guidance',
              color: theme.palette.secondary.main
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
            <Lightbulb fontSize="small" /> Clear project goals lead to better outcomes!
          </Typography>
        </Paper>
      </Box>
    )
  },
  {
    id: 'no-teams-warning',
    title: 'Prerequisite: Create a Team',
    description: 'Teams come first, then projects',
    icon: <GroupWork />,
    element: '.MuiCard-root .MuiBox-root:last-of-type .MuiButton-outlined', // Go to Teams button
    position: 'left',
    offset: { x: 0, y: 10 },
    content: (
      <Box>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
          Before creating projects:
        </Typography>
        <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
          {[
            {
              icon: <GroupWork sx={{ fontSize: 18, color: theme.palette.primary.main }} />,
              text: 'You need at least one team',
              color: theme.palette.primary.main
            },
            {
              icon: <People sx={{ fontSize: 18, color: theme.palette.info.main }} />,
              text: 'Teams are for collaboration',
              color: theme.palette.info.main
            },
            {
              icon: <Handshake sx={{ fontSize: 18, color: theme.palette.success.main }} />,
              text: 'Add peers to your team',
              color: theme.palette.success.main
            },
            {
              icon: <Workspaces sx={{ fontSize: 18, color: theme.palette.warning.main }} />,
              text: 'Projects are built on teams',
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
          bgcolor: alpha(theme.palette.warning.main, 0.05),
          border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`
        }}>
          <Typography variant="caption" sx={{ color: theme.palette.warning.main, fontStyle: 'italic' }}>
            <Warning fontSize="small" /> Create a team first if button is disabled
          </Typography>
        </Paper>
      </Box>
    )
  },
  {
    id: 'project-workflow',
    title: 'Project Workflow',
    description: 'How projects work in the system',
    icon: <Timeline />,
    element: '.MuiCard-root', // Empty state card
    position: 'center',
    content: (
      <Box>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
          Complete project lifecycle:
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
          {[
            {
              step: '1',
              icon: <CreateNewFolder sx={{ color: theme.palette.primary.main }} />,
              title: 'Create Project',
              desc: 'Define goals, team, timeline',
              color: theme.palette.primary.main,
              status: 'current'
            },
            {
              step: '2',
              icon: <Task sx={{ color: theme.palette.info.main }} />,
              title: 'Add Tasks',
              desc: 'Break project into manageable tasks',
              color: theme.palette.info.main,
              status: 'pending'
            },
            {
              step: '3',
              icon: <Schedule sx={{ color: theme.palette.success.main }} />,
              title: 'Track Progress',
              desc: 'Monitor completion and health',
              color: theme.palette.success.main,
              status: 'pending'
            },
            {
              step: '4',
              icon: <Assessment sx={{ color: theme.palette.warning.main }} />,
              title: 'Review & Grade',
              desc: 'Evaluate project outcomes',
              color: theme.palette.warning.main,
              status: 'pending'
            },
            {
              step: '5',
              icon: <CheckCircle sx={{ color: theme.palette.secondary.main }} />,
              title: 'Complete',
              desc: 'Archive and learn from results',
              color: theme.palette.secondary.main,
              status: 'pending'
            }
          ].map((item, index) => (
            <Paper 
              key={index}
              sx={{ 
                p: 2, 
                borderRadius: 2,
                bgcolor: alpha(item.color, item.status === 'current' ? 0.1 : 0.05),
                border: `1px solid ${alpha(item.color, item.status === 'current' ? 0.3 : 0.1)}`,
                opacity: item.status === 'pending' ? 0.7 : 1,
                transition: 'all 0.3s ease',
                '&:hover': {
                  opacity: 1,
                  transform: 'translateX(4px)'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ 
                  width: 32, 
                  height: 32, 
                  bgcolor: item.status === 'current' ? item.color : alpha(item.color, 0.2),
                  color: item.status === 'current' ? 'white' : item.color,
                  fontSize: '0.875rem',
                  fontWeight: 600
                }}>
                  {item.step}
                </Avatar>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ color: item.color }}>
                    {item.icon}
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {item.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {item.desc}
                    </Typography>
                  </Box>
                </Box>
                {item.status === 'current' && (
                  <ArrowForward sx={{ 
                    ml: 'auto', 
                    color: theme.palette.primary.main,
                    animation: 'pulse 1.5s infinite'
                  }} />
                )}
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>
    )
  },
  {
    id: 'features-preview',
    title: 'Future Dashboard Features',
    description: 'What you\'ll see with projects',
    icon: <Dashboard />,
    element: '', 
    position: 'right',
    offset: { x: 20, y: 0 },
    content: (
      <Box>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
          Once you have projects, you'll see:
        </Typography>
        <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
          {[
            {
              icon: <QueryStats sx={{ fontSize: 18, color: theme.palette.primary.main }} />,
              text: 'Dashboard Statistics',
              subtext: 'Active projects, progress, health scores',
              color: theme.palette.primary.main
            },
            {
              icon: <TableView sx={{ fontSize: 18, color: theme.palette.info.main }} />,
              text: 'Interactive Table',
              subtext: 'Sort, filter, and search projects',
              color: theme.palette.info.main
            },
            {
              icon: <TrendingUp sx={{ fontSize: 18, color: theme.palette.success.main }} />,
              text: 'Progress Tracking',
              subtext: 'Visual indicators and health metrics',
              color: theme.palette.success.main
            },
            {
              icon: <People sx={{ fontSize: 18, color: theme.palette.secondary.main }} />,
              text: 'Team Management',
              subtext: 'View team members and assignments',
              color: theme.palette.secondary.main
            },
            {
              icon: <CalendarToday sx={{ fontSize: 18, color: theme.palette.warning.main }} />,
              text: 'Timeline Views',
              subtext: 'Deadlines and scheduling',
              color: theme.palette.warning.main
            }
          ].map((item, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
              <Box sx={{ 
                width: 32, 
                height: 32, 
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(item.color, 0.1),
                color: item.color,
                mt: 0.5
              }}>
                {item.icon}
              </Box>
              <Box>
                <Typography variant="body2" sx={{ color: 'text.primary', fontSize: '0.875rem', fontWeight: 500 }}>
                  {item.text}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {item.subtext}
                </Typography>
              </Box>
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
            <Lightbulb fontSize="small" /> Projects make team collaboration organized and trackable!
          </Typography>
        </Paper>
      </Box>
    )
  },
  {
    id: 'getting-started-guide',
    title: 'Getting Started Guide',
    description: 'Quick start path to success',
    icon: <RocketLaunch />,
    element: '', // Button container
    position: 'top',
    offset: { x: 0, y: -20 },
    content: (
      <Box>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
          Your quick-start checklist:
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
          {[
            {
              checked: false,
              text: 'Create or join a team',
              details: 'Minimum 1 team required',
              color: theme.palette.primary.main
            },
            {
              checked: false,
              text: 'Define your first project',
              details: 'Clear goals and timeline',
              color: theme.palette.info.main
            },
            {
              checked: false,
              text: 'Add team members',
              details: 'Assign roles and responsibilities',
              color: theme.palette.success.main
            },
            {
              checked: false,
              text: 'Create initial tasks',
              details: 'Breakdown into actionable items',
              color: theme.palette.warning.main
            },
            {
              checked: false,
              text: 'Set up tracking',
              details: 'Progress and health monitoring',
              color: theme.palette.secondary.main
            }
          ].map((item, index) => (
            <Paper 
              key={index}
              sx={{ 
                p: 1.5, 
                borderRadius: 2,
                bgcolor: alpha(item.color, 0.05),
                border: `1px solid ${alpha(item.color, 0.1)}`,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Box sx={{ 
                width: 24, 
                height: 24, 
                borderRadius: '50%',
                bgcolor: alpha(item.color, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: item.color,
                fontSize: 14,
                fontWeight: 600
              }}>
                {item.checked ? '✓' : index + 1}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                  {item.text}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {item.details}
                </Typography>
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>
    )
  },
  {
    id: 'no-projects-ready',
    title: 'Ready to Launch!',
    description: "Let's create your first project",
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
          You're All Set to Begin!
        </Typography>
        <Typography variant="body2" sx={{ mb: 2.5, color: 'text.secondary', lineHeight: 1.6 }}>
          You now understand the project creation process and workflow. 
          Start by creating your first project, then add tasks, track progress, 
          and collaborate effectively with your team.
        </Typography>
        
        <Paper sx={{ 
          p: 2, 
          mb: 2.5,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.03),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
        }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: theme.palette.primary.main }}>
            Best Practices for New Projects:
          </Typography>
          <Box sx={{ display: 'grid', gap: 1 }}>
            {[
              'Start with clear, achievable goals',
              'Set realistic timelines and deadlines',
              'Assign tasks based on team strengths',
              'Regularly update progress and health scores',
              'Communicate frequently with team members'
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
          color: theme.palette.primary.main
        }}>
          <RocketLaunch fontSize="small" />
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Click "New Project" to start your project management journey!
          </Typography>
        </Box>
      </Box>
    )
  }
];