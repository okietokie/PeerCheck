// ProjectsTour.js
import React from 'react';
import {
  Search,
  Add,
  Group,
  FilterList,
  CalendarToday,
  Grade,
  Delete,
  Tag,
  People,
  Assessment,
  CheckCircle,
  PauseCircle,
  PlayCircle,
  Flag,
  ViewModule,
  ViewList,
  ArrowDropDown,
  TrendingUp,
  PlayArrow,
  CheckCircleOutline,
  Warning,
  Lightbulb,
  Celebration,
  Info,
  Dashboard,
  Timeline,
  BarChart,
  Speed,
  Folder,
  FilterAlt,
  Sort,
  ListAlt,
  GridView,
  MoreVert,
  Task,
  GroupWork,
  CalendarMonth,
  Label,
  HealthAndSafety,
  Insights,
  Analytics,
  QueryStats,
  DonutLarge,
  PieChart,
  Leaderboard,
  Assessment as AssessmentIcon,
  Score,
  LineAxis,
  TableRows,
  GridOn,
  TableView,
  ViewColumn,
  ViewComfy,
  ViewAgenda,
  ViewHeadline,
  ViewStream,
  ViewWeek,
  ViewDay,
  ViewCarousel,
  ViewQuilt,
  ViewCozy,
  ViewCompact,
  ViewSidebar,
  ViewArray,
  ViewKanban
} from '@mui/icons-material';
import { Box, Avatar, Typography, Paper, Chip, Button, LinearProgress, Badge, Tooltip } from '@mui/material';
import { alpha } from '@mui/material/styles';

export const getProjectsTourSteps = (theme) => [
  {
    id: 'projects-welcome',
    title: 'Projects Dashboard Hub',
    description: "Welcome to your project command center",
    icon: <Dashboard />,
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
          <Dashboard sx={{ fontSize: 40 }} />
        </Avatar>
        <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600, color: 'text.primary' }}>
          Projects Dashboard Overview
        </Typography>
        <Typography variant="body2" sx={{ mb: 2.5, color: 'text.secondary', lineHeight: 1.6 }}>
          This is your central hub for managing all team projects. Track progress, 
          monitor health scores, assign tasks, and collaborate efficiently with your team.
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
          <Typography variant="caption">Master project management in 8 steps</Typography>
        </Box>
      </Box>
    )
  },
  {
    id: 'create-project-btn',
    title: 'Create New Project',
    description: 'Start a new collaborative endeavor',
    icon: <Add />,
    element: '.MuiButton-contained:has(.MuiSvgIcon-root)', // Create Project button
    position: 'left',
    offset: { x: 20, y: 0 },
    content: (
      <Box>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
          Launch new projects:
        </Typography>
        <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
          {[
            {
              icon: <Add sx={{ fontSize: 18, color: theme.palette.primary.main }} />,
              text: 'Click to open project creation wizard',
              color: theme.palette.primary.main
            },
            {
              icon: <Group sx={{ fontSize: 18, color: theme.palette.info.main }} />,
              text: 'Select team for collaboration',
              color: theme.palette.info.main
            },
            {
              icon: <CalendarMonth sx={{ fontSize: 18, color: theme.palette.warning.main }} />,
              text: 'Set project timeline and deadlines',
              color: theme.palette.warning.main
            },
            {
              icon: <AssessmentIcon sx={{ fontSize: 18, color: theme.palette.success.main }} />,
              text: 'Configure grading criteria',
              color: theme.palette.success.main
            },
            {
              icon: <Label sx={{ fontSize: 18, color: theme.palette.secondary.main }} />,
              text: 'Add tags for organization',
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
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
        }}>
          <Typography variant="caption" sx={{ color: theme.palette.primary.main, fontStyle: 'italic' }}>
            <Lightbulb fontSize="small" /> Projects can have mentors and custom grading!
          </Typography>
        </Paper>
      </Box>
    )
  },
  {
    id: 'stats-cards',
    title: 'Project Analytics',
    description: 'Quick overview of project portfolio',
    icon: <Analytics />,
    element: '.MuiPaper-root .MuiGrid-container', // Stats cards section
    position: 'bottom',
    offset: { x: 0, y: 20 },
    content: (
      <Box>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
          Real-time project metrics:
        </Typography>
        <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
          {[
            {
              icon: <Folder sx={{ fontSize: 18, color: theme.palette.primary.main }} />,
              text: 'Total Projects: Overall count',
              color: theme.palette.primary.main
            },
            {
              icon: <PlayCircle sx={{ fontSize: 18, color: theme.palette.success.main }} />,
              text: 'Active Projects: Currently in progress',
              color: theme.palette.success.main
            },
            {
              icon: <Warning sx={{ fontSize: 18, color: theme.palette.warning.main }} />,
              text: 'At Risk: Need attention (health score < 40%)',
              color: theme.palette.warning.main
            },
            {
              icon: <TrendingUp sx={{ fontSize: 18, color: theme.palette.info.main }} />,
              text: 'Avg Progress: Overall completion rate',
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
          bgcolor: alpha(theme.palette.info.main, 0.05),
          border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`
        }}>
          <Typography variant="caption" sx={{ color: theme.palette.info.main, fontStyle: 'italic' }}>
            <Lightbulb fontSize="small" /> Cards are color-coded and have hover effects!
          </Typography>
        </Paper>
      </Box>
    )
  },
  {
    id: 'search-filter-bar',
    title: 'Search & Filter Tools',
    description: 'Find and organize projects efficiently',
    icon: <FilterAlt />,
    element: '.MuiPaper-root:has(.MuiInputAdornment-root)', // Search and filter bar
    position: 'bottom',
    offset: { x: 0, y: 20 },
    content: (
      <Box>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
          Powerful search and filtering:
        </Typography>
        <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
          {[
            {
              icon: <Search sx={{ fontSize: 18, color: theme.palette.primary.main }} />,
              text: 'Search: Projects by name, description, tags',
              color: theme.palette.primary.main
            },
            {
              icon: <Sort sx={{ fontSize: 18, color: theme.palette.info.main }} />,
              text: 'Sort: By progress, health, name, or date',
              color: theme.palette.info.main
            },
            {
              icon: <FilterList sx={{ fontSize: 18, color: theme.palette.secondary.main }} />,
              text: 'Filters: More filters coming soon',
              color: theme.palette.secondary.main
            },
            {
              icon: <TableView sx={{ fontSize: 18, color: theme.palette.warning.main }} />,
              text: 'View Toggle: Switch between table and grid views',
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
          bgcolor: alpha(theme.palette.secondary.main, 0.05),
          border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`
        }}>
          <Typography variant="caption" sx={{ color: theme.palette.secondary.main, fontStyle: 'italic' }}>
            <Lightbulb fontSize="small" /> Real-time search updates as you type!
          </Typography>
        </Paper>
      </Box>
    )
  },
  {
    id: 'project-table-header',
    title: 'Projects Table',
    description: 'Complete project listing with actions',
    icon: <TableRows />,
    element: '.MuiTableHead-root', // Table header
    position: 'bottom',
    offset: { x: 0, y: 20 },
    content: (
      <Box>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
          Table features:
        </Typography>
        <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
          {[
            {
              icon: <CheckCircleOutline sx={{ fontSize: 18, color: theme.palette.primary.main }} />,
              text: 'Bulk Selection: Select multiple projects',
              color: theme.palette.primary.main
            },
            {
              icon: <Task sx={{ fontSize: 18, color: theme.palette.info.main }} />,
              text: 'Project Details: Name and description',
              color: theme.palette.info.main
            },
            {
              icon: <GroupWork sx={{ fontSize: 18, color: theme.palette.secondary.main }} />,
              text: 'Team: Associated team members',
              color: theme.palette.secondary.main
            },
            {
              icon: <CalendarToday sx={{ fontSize: 18, color: theme.palette.warning.main }} />,
              text: 'Status: Active, Completed, Paused',
              color: theme.palette.warning.main
            },
            {
              icon: <Label sx={{ fontSize: 18, color: theme.palette.success.main }} />,
              text: 'Tags: Project categorization',
              color: theme.palette.success.main
            },
            {
              icon: <HealthAndSafety sx={{ fontSize: 18, color: theme.palette.error.main }} />,
              text: 'Progress & Health: Visual indicators',
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
      </Box>
    )
  },
  {
    id: 'project-row-actions',
    title: 'Quick Actions',
    description: 'Instant access to project functions',
    icon: <MoreVert />,
    element: '.MuiTableBody-root .MuiTableRow-root:first-of-type .MuiTableCell:nth-of-type(2)', // Actions cell
    position: 'right',
    offset: { x: 20, y: 0 },
    content: (
      <Box>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
          Hover over project row to see:
        </Typography>
        <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
          {[
            {
              icon: <Add sx={{ fontSize: 18, color: theme.palette.primary.main }} />,
              text: 'Add Task: Create new task for project',
              color: theme.palette.primary.main
            },
            {
              icon: <CalendarToday sx={{ fontSize: 18, color: theme.palette.info.main }} />,
              text: 'Timeline: View start/end dates',
              color: theme.palette.info.main
            },
            {
              icon: <Grade sx={{ fontSize: 18, color: theme.palette.warning.main }} />,
              text: 'Review: Submit project evaluation',
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
            <Lightbulb fontSize="small" /> Double-click any row to view full project details!
          </Typography>
        </Paper>
      </Box>
    )
  },
  {
    id: 'team-hover',
    title: 'Team Information',
    description: 'View team members at a glance',
    icon: <People />,
    element: '.MuiTableBody-root .MuiTableRow-root:first-of-type .MuiTableCell:nth-of-type(3)', // Team cell
    position: 'right',
    offset: { x: 20, y: 0 },
    content: (
      <Box>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
          Team collaboration features:
        </Typography>
        <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
          {[
            {
              icon: <People sx={{ fontSize: 18, color: theme.palette.primary.main }} />,
              text: 'Hover: See team member names',
              color: theme.palette.primary.main
            },
            {
              icon: <Group sx={{ fontSize: 18, color: theme.palette.info.main }} />,
              text: 'Click: View all team details',
              color: theme.palette.info.main
            },
            {
              icon: <ArrowDropDown sx={{ fontSize: 18, color: theme.palette.secondary.main }} />,
              text: 'Popover: Quick member overview',
              color: theme.palette.secondary.main
            },
            {
              icon: <MoreVert sx={{ fontSize: 18, color: theme.palette.warning.main }} />,
              text: 'Status: Member activity indicators',
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
    id: 'progress-health',
    title: 'Progress & Health Tracking',
    description: 'Monitor project vitality',
    icon: <Insights />,
    element: '.MuiTableBody-root .MuiTableRow-root:first-of-type .MuiTableCell:nth-of-type(6)', // Progress cell
    position: 'left',
    offset: { x: -20, y: 0 },
    content: (
      <Box>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
          Project health indicators:
        </Typography>
        <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
          {[
            {
              icon: <TrendingUp sx={{ fontSize: 18, color: theme.palette.success.main }} />,
              text: 'Progress Bar: Visual completion status',
              color: theme.palette.success.main
            },
            {
              icon: <Speed sx={{ fontSize: 18, color: theme.palette.error.main }} />,
              text: 'Health Score: 0-100% project vitality',
              color: theme.palette.error.main
            },
            {
              icon: <DonutLarge sx={{ fontSize: 18, color: theme.palette.warning.main }} />,
              text: 'Color Coding: Red/Yellow/Green indicators',
              color: theme.palette.warning.main
            },
            {
              icon: <Speed sx={{ fontSize: 18, color: theme.palette.info.main }} />,
              text: 'Real-time: Updates as tasks progress',
              color: theme.palette.info.main
            }
          ].map((item, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ 
                width: 32, 
                height: 32, 
                borderRadius: 1.5,
                display: '-flex',
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
            <Lightbulb fontSize="small" /> Health less than 40% = At Risk (Needs Attention)!
          </Typography>
        </Paper>
      </Box>
    )
  },
  {
    id: 'bulk-actions',
    title: 'Bulk Operations',
    description: 'Manage multiple projects at once',
    icon: <Delete />,
    element: '.MuiCard-root .MuiBox-root:first-of-type', // Bulk actions header
    position: 'top',
    offset: { x: 0, y: -10 },
    content: (
      <Box>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
          Mass project management:
        </Typography>
        <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
          {[
            {
              icon: <CheckCircleOutline sx={{ fontSize: 18, color: theme.palette.primary.main }} />,
              text: 'Select All: Checkbox in header',
              color: theme.palette.primary.main
            },
            {
              icon: <Chip sx={{ fontSize: 18, color: theme.palette.info.main }} />,
              text: 'Selection Counter: Shows count',
              color: theme.palette.info.main
            },
            {
              icon: <Delete sx={{ fontSize: 18, color: theme.palette.error.main }} />,
              text: 'Delete Selected: Bulk removal',
              color: theme.palette.error.main
            },
            {
              icon: <FilterList sx={{ fontSize: 18, color: theme.palette.secondary.main }} />,
              text: 'Bulk Actions: Future features',
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
          bgcolor: alpha(theme.palette.error.main, 0.05),
          border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`
        }}>
          <Typography variant="caption" sx={{ color: theme.palette.error.main, fontStyle: 'italic' }}>
            <Warning fontSize="small" /> Deletion requires confirmation and is permanent!
          </Typography>
        </Paper>
      </Box>
    )
  },
  {
    id: 'projects-mastery',
    title: 'Project Management Pro!',
    description: "You're now a project management expert",
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
          Project Dashboard Mastered!
        </Typography>
        <Typography variant="body2" sx={{ mb: 2.5, color: 'text.secondary', lineHeight: 1.6 }}>
          You now know how to create projects, track progress, manage teams, 
          and use all dashboard features effectively. Manage your projects 
          like a pro and boost team productivity!
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
              'Monitor health scores daily for at-risk projects',
              'Use tags to categorize and filter projects',
              'Regularly add tasks to keep momentum',
              'Review completed projects for insights',
              'Use bulk operations for efficient management'
            ].map((tip, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleOutline sx={{ fontSize: 16, color: theme.palette.success.main }} />
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
            Start creating and managing projects for maximum productivity!
          </Typography>
        </Box>
      </Box>
    )
  }
];