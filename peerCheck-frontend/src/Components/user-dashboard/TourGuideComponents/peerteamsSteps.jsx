// PeerTeamsTour.js
import React from 'react';
import {
  Groups as TeamsIcon,
  PersonAdd as PersonAddIcon,
  Add as AddIcon,
  GroupAdd as GroupAddIcon,
  Launch as LaunchIcon,
  People,
  Schedule,
  Group,
  WorkOutline,
  Star,
  Visibility,
  ExitToApp,
  Settings,
  Analytics,
  Chat,
  Search,
  FilterList,
  Sort,
  PlayArrow,
  Pause,
  CheckCircle,
  Timer,
  Assessment,
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
  Delete,
  ArrowBack,
  Close,
  Grade,
  PlayCircleOutline,
  Lightbulb,
  Celebration,
  History,
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

export const getPeerTeamsTourSteps = (theme) => [
  {
    id: 'teams-welcome',
    title: 'Teams Dashboard',
    description: "Welcome to your collaboration hub",
    icon: <TeamsIcon />,
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
          <TeamsIcon sx={{ fontSize: 40 }} />
        </Avatar>
        <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600, color: 'text.primary' }}>
          Teams Management Hub
        </Typography>
        <Typography variant="body2" sx={{ mb: 2.5, color: 'text.secondary', lineHeight: 1.6 }}>
          This is where you manage all your collaborative teams. View members, 
          access team dashboards, and streamline group projects effectively.
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
          <Typography variant="caption">Master team collaboration in 5 steps</Typography>
        </Box>
      </Box>
    )
  },
  {
    id: 'create-team-btn',
    title: 'Create New Team',
    description: 'Start a new collaboration',
    icon: <GroupAddIcon />,
    element: '.MuiButton-contained:has(.MuiSvgIcon-root)', // Create Team button
    position: 'left',
    offset: { x: 20, y: 0 },
    content: (
      <Box>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
          Quick team creation:
        </Typography>
        <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
          {[
            {
              icon: <GroupAddIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />,
              text: 'Click to open team creation dialog',
              color: theme.palette.primary.main
            },
            {
              icon: <People sx={{ fontSize: 18, color: theme.palette.info.main }} />,
              text: 'Add existing connections as members',
              color: theme.palette.info.main
            },
            {
              icon: <Settings sx={{ fontSize: 18, color: theme.palette.secondary.main }} />,
              text: 'Set team roles and permissions',
              color: theme.palette.secondary.main
            },
            {
              icon: <AccessTime sx={{ fontSize: 18, color: theme.palette.success.main }} />,
              text: 'Teams are ready instantly',
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
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
        }}>
          <Typography variant="caption" sx={{ color: theme.palette.primary.main, fontStyle: 'italic' }}>
            <Lightbulb fontSize="small" /> Create teams for specific projects or subjects!
          </Typography>
        </Paper>
      </Box>
    )
  },
  {
    id: 'team-header',
    title: 'Team Overview',
    description: 'Team identification and metadata',
    icon: <Dashboard />,
    element: '.MuiCard-root:first-of-type .MuiBox-root:first-of-type', // Team header area
    position: 'right',
    offset: { x: 20, y: 0 },
    content: (
      <Box>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
          Each team shows:
        </Typography>
        <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
          {[
            {
              icon: <TeamsIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />,
              text: 'Team name and identification',
              color: theme.palette.primary.main
            },
            {
              icon: <People sx={{ fontSize: 18, color: theme.palette.info.main }} />,
              text: 'Member count and roles',
              color: theme.palette.info.main
            },
            {
              icon: <Schedule sx={{ fontSize: 18, color: theme.palette.secondary.main }} />,
              text: 'Creation date and timeline',
              color: theme.palette.secondary.main
            },
            {
              icon: <Security sx={{ fontSize: 18, color: theme.palette.warning.main }} />,
              text: 'Unique team ID for reference',
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
    id: 'team-members',
    title: 'Team Members',
    description: 'View and manage collaborators',
    icon: <People />,
    element: '.team-members', // Members preview section
    position: 'left',
    offset: { x: 0, y: 20 },
    content: (
      <Box>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
          Scroll through team members:
        </Typography>
        <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
          {[
            {
              icon: <Person sx={{ fontSize: 18, color: theme.palette.primary.main }} />,
              text: 'Avatar with initials and color coding',
              color: theme.palette.primary.main
            },
            {
              icon: <Star sx={{ fontSize: 18, color: theme.palette.warning.main }} />,
              text: 'Team leader badge (gold star)',
              color: theme.palette.warning.main
            },
            {
              icon: <WorkOutline sx={{ fontSize: 18, color: theme.palette.info.main }} />,
              text: 'Member roles and responsibilities',
              color: theme.palette.info.main
            },
            {
              icon: <Group sx={{ fontSize: 18, color: theme.palette.success.main }} />,
              text: 'Hover for member details preview',
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
            <Lightbulb fontSize="small" /> Horizontal scroll to see all members!
          </Typography>
        </Paper>
      </Box>
    )
  },
  {
    id: 'team-actions',
    title: 'Team Controls',
    description: 'Manage and access team features',
    icon: <Settings />,
    element: '.MuiCard-root:first-of-type .MuiBox-root:last-of-type', // Quick actions sidebar
    position: 'center',
    offset: { x: -20, y: 0 },
    content: (
      <Box>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
          Quick access buttons:
        </Typography>
        <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
          {[
            {
              icon: <Visibility sx={{ fontSize: 18, color: theme.palette.primary.main }} />,
              text: 'Dashboard: Full team management view',
              color: theme.palette.primary.main
            },
            {
              icon: <Settings sx={{ fontSize: 18, color: theme.palette.secondary.main }} />,
              text: 'Settings: Configure team preferences',
              color: theme.palette.secondary.main
            },
            {
              icon: <Analytics sx={{ fontSize: 18, color: theme.palette.info.main }} />,
              text: 'Analytics: Performance metrics and insights',
              color: theme.palette.info.main
            },
            {
              icon: <Chat sx={{ fontSize: 18, color: theme.palette.success.main }} />,
              text: 'Chat: Team communication channel',
              color: theme.palette.success.main
            },
            {
              icon: <ExitToApp sx={{ fontSize: 18, color: theme.palette.error.main }} />,
              text: 'Leave: Exit team (with confirmation)',
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
          bgcolor: alpha(theme.palette.warning.main, 0.05),
          border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`
        }}>
          <Typography variant="caption" sx={{ color: theme.palette.warning.main, fontStyle: 'italic' }}>
            <Warning fontSize="small" /> Leaving a team removes access permanently!
          </Typography>
        </Paper>
      </Box>
    )
  },
  {
    id: 'team-dashboard-btn',
    title: 'Team Dashboard',
    description: 'Complete team management',
    icon: <Dashboard />,
    element: '.MuiCard-root:first-of-type .MuiButton-contained:first-of-type', // Dashboard button
    position: 'right',
    offset: { x: 0, y: -10 },
    content: (
      <Box>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
          Access full team management:
        </Typography>
        <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
          {[
            {
              icon: <Description sx={{ fontSize: 18, color: theme.palette.primary.main }} />,
              text: 'Task assignment and tracking',
              color: theme.palette.primary.main
            },
            {
              icon: <Assessment sx={{ fontSize: 18, color: theme.palette.info.main }} />,
              text: 'Performance analytics and reports',
              color: theme.palette.info.main
            },
            {
              icon: <Group sx={{ fontSize: 18, color: theme.palette.secondary.main }} />,
              text: 'Member management and roles',
              color: theme.palette.secondary.main
            },
            {
              icon: <Chat sx={{ fontSize: 18, color: theme.palette.success.main }} />,
              text: 'Integrated team chat system',
              color: theme.palette.success.main
            },
            {
              icon: <Folder sx={{ fontSize: 18, color: theme.palette.warning.main }} />,
              text: 'File sharing and document storage',
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
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
        }}>
          <Typography variant="caption" sx={{ color: theme.palette.primary.main, fontStyle: 'italic' }}>
            <Lightbulb fontSize="small" /> Use dashboards for project coordination!
          </Typography>
        </Paper>
      </Box>
    )
  },
  {
    id: 'teams-complete',
    title: 'Teams Mastery Achieved!',
    description: "You're now a team collaboration expert",
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
          Team Management Proficient!
        </Typography>
        <Typography variant="body2" sx={{ mb: 2.5, color: 'text.secondary', lineHeight: 1.6 }}>
          You now know how to create teams, manage members, access dashboards, 
          and utilize collaboration tools effectively. Start building successful 
          team projects today!
        </Typography>
        
        <Paper sx={{ 
          p: 2, 
          mb: 2.5,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.03),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
        }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: theme.palette.primary.main }}>
            Best Practices for Teams:
          </Typography>
          <Box sx={{ display: 'grid', gap: 1 }}>
            {[
              'Create teams for each course or project',
              'Assign clear roles to each member',
              'Use team dashboards for task tracking',
              'Upload shared resources to team storage',
              'Regularly check team analytics'
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
            Start creating and managing your teams for better collaboration!
          </Typography>
        </Box>
      </Box>
    )
  }
];