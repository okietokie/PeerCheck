import React from 'react';
import {
  Dashboard,
  Assessment,
  Folder,
  FlashOn,
  TrendingUp,
  Celebration,
  Update,
  Add,
  Warning,
  FolderOpen,
  People,
  CalendarToday,
  AddTask,
  GroupAdd,
  CheckCircle,
  Timeline,
  PriorityHigh,
  Info,
  HelpOutline,
  PlayCircle
} from '@mui/icons-material';
import { Box, Avatar, Typography, Paper } from '@mui/material';
import { alpha } from '@mui/material/styles';

export const getDashboardSteps = (theme) => [
                {
                id: 'welcome',
                title: 'Welcome to PeerCheck Dashboard',
                description: "Let's explore your productivity dashboard",
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
                        Welcome to PeerCheck
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2.5, color: 'text.secondary', lineHeight: 1.6 }}>
                        Your productivity dashboard is designed to help you manage projects, track progress, and collaborate with your team efficiently.
                    </Typography>
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: 1,
                        color: theme.palette.info.main,
                        fontSize: '0.875rem'
                    }}>
                        <TrendingUp fontSize="small" />
                        <Typography variant="caption">Let's begin the tour</Typography>
                    </Box>
                    </Box>
                )
                },
                {
                id: 'dashboard-header',
                title: 'Dashboard Header',
                description: 'Your command center',
                icon: <Dashboard />,
                element: '.dashboard-header',
                position: 'bottom',
                offset: { x: 0, y: 20 },
                content: (
                    <Box>
                    <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
                        This is your dashboard header where you can:
                    </Typography>
                    <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
                        {[
                        {
                            icon: <Typography variant="body1" sx={{ color: theme.palette.primary.main, minWidth: 24 }}>👋</Typography>,
                            text: 'Your personalized welcome message',
                            color: theme.palette.primary.main
                        },
                        {
                            icon: <Update sx={{ fontSize: 16, color: theme.palette.info.main }} />,
                            text: 'Refresh dashboard data',
                            color: theme.palette.info.main
                        },
                        {
                            icon: <Add sx={{ fontSize: 16, color: theme.palette.success.main }} />,
                            text: 'Create new projects instantly',
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
                            <Typography variant="body2" sx={{ color: 'text.primary' }}>
                            {item.text}
                            </Typography>
                        </Box>
                        ))}
                    </Box>
                    </Box>
                )
                },
                {
                id: 'stats-cards',
                title: 'Performance Metrics',
                description: 'Track your key indicators',
                icon: <Assessment />,
                element: '.stats-cards-section',
                position: 'bottom',
                offset: { x: 0, y: 20 },
                content: (
                    <Box>
                    <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
                        These cards display your key performance indicators:
                    </Typography>
                    <Box sx={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(2, 1fr)', 
                        gap: 1, 
                        mb: 2.5 
                    }}>
                        {[
                        { label: 'Projects', icon: <Folder fontSize="small" />, color: theme.palette.primary.main },
                        { label: 'Tasks', icon: <PlayCircle fontSize="small" />, color: theme.palette.info.main },
                        { label: 'Productivity', icon: <TrendingUp fontSize="small" />, color: theme.palette.success.main },
                        { label: 'Alerts', icon: <Warning fontSize="small" />, color: theme.palette.error.main }
                        ].map((item, index) => (
                        <Box key={index} sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 0.75,
                            p: 1,
                            borderRadius: 1.5,
                            bgcolor: alpha(item.color, 0.05),
                            border: `1px solid ${alpha(item.color, 0.1)}`
                        }}>
                            <Box sx={{ 
                            width: 24, 
                            height: 24, 
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: alpha(item.color, 0.1),
                            color: item.color
                            }}>
                            {item.icon}
                            </Box>
                            <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 500 }}>
                            {item.label}
                            </Typography>
                        </Box>
                        ))}
                    </Box>
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 0.75,
                        p: 1,
                        borderRadius: 1,
                        bgcolor: alpha(theme.palette.warning.main, 0.05),
                        borderLeft: `3px solid ${theme.palette.warning.main}`
                    }}>
                        <Info fontSize="small" sx={{ color: theme.palette.warning.main }} />
                        <Typography variant="caption" sx={{ color: theme.palette.warning.main, fontStyle: 'italic' }}>
                        Click any card to see detailed insights
                        </Typography>
                    </Box>
                    </Box>
                )
                },
                {
                id: 'projects-section',
                title: 'Projects Overview',
                description: 'Manage your active projects',
                icon: <Folder />,
                element: '.projects-section',
                position: 'right',
                offset: { x: 20, y: 0 },
                content: (
                    <Box>
                    <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
                        Here you can view and manage all your active projects:
                    </Typography>
                    <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
                        {[
                        {
                            icon: <FolderOpen sx={{ fontSize: 18 }} />,
                            text: 'View project status and progress',
                            color: theme.palette.primary.main
                        },
                        {
                            icon: <People sx={{ fontSize: 18 }} />,
                            text: 'See team members',
                            color: theme.palette.info.main
                        },
                        {
                            icon: <CalendarToday sx={{ fontSize: 18 }} />,
                            text: 'Check deadlines and timelines',
                            color: theme.palette.warning.main
                        },
                        {
                            icon: <Assessment sx={{ fontSize: 18 }} />,
                            text: 'Track milestones and updates',
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
                id: 'quick-actions',
                title: 'Quick Actions',
                description: 'Streamline your workflow',
                icon: <FlashOn />,
                element: '.quick-actions-section',
                position: 'left',
                offset: { x: -20, y: 0 },
                content: (
                    <Box>
                    <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
                        Speed up your workflow with these one-click actions:
                    </Typography>
                    <Box sx={{ display: 'grid', gap: 1, mb: 2.5 }}>
                        {[
                        {
                            label: 'Create Task',
                            icon: <AddTask />,
                            color: theme.palette.success.main,
                            description: 'Add new task quickly'
                        },
                        {
                            label: 'Invite Team',
                            icon: <GroupAdd />,
                            color: theme.palette.info.main,
                            description: 'Add team members'
                        }
                        ].map((item, index) => (
                        <Paper
                            key={index}
                            elevation={0}
                            sx={{
                            p: 1.5,
                            borderRadius: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            bgcolor: alpha(item.color, 0.05),
                            border: `1px solid ${alpha(item.color, 0.1)}`
                            }}
                        >
                            <Box sx={{ 
                            width: 36, 
                            height: 36, 
                            borderRadius: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: alpha(item.color, 0.1),
                            color: item.color
                            }}>
                            {item.icon}
                            </Box>
                            <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                                {item.label}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {item.description}
                            </Typography>
                            </Box>
                        </Paper>
                        ))}
                    </Box>
                    </Box>
                )
                },
                {
                id: 'performance-analytics',
                title: 'Performance Analytics',
                description: 'Monitor your efficiency',
                icon: <TrendingUp />,
                element: '.performance-section',
                position: 'top',
                offset: { x: 0, y: -20 },
                content: (
                    <Box>
                    <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
                        Monitor your productivity and task completion metrics:
                    </Typography>
                    <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
                        {[
                        {
                            icon: <CheckCircle sx={{ color: theme.palette.success.main }} />,
                            text: 'Track completion rates',
                            color: theme.palette.success.main
                        },
                        {
                            icon: <Timeline sx={{ color: theme.palette.info.main }} />,
                            text: 'Analyze productivity trends',
                            color: theme.palette.info.main
                        },
                        {
                            icon: <PriorityHigh sx={{ color: theme.palette.warning.main }} />,
                            text: 'Identify improvement areas',
                            color: theme.palette.warning.main
                        },
                        {
                            icon: <Warning sx={{ color: theme.palette.error.main }} />,
                            text: 'Highlight urgent items',
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
                id: 'tour-complete',
                title: 'Tour Complete',
                description: "You're ready to begin",
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
                        You're Ready to Go
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2.5, color: 'text.secondary', lineHeight: 1.6 }}>
                        Start exploring your dashboard and boost your productivity with PeerCheck.
                    </Typography>
                    
                    <Paper sx={{ 
                        p: 2, 
                        mb: 2.5,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.03),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                    }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: theme.palette.primary.main }}>
                        Quick Start Tips:
                        </Typography>
                        <Box sx={{ display: 'grid', gap: 1 }}>
                        {[
                            'Create your first project',
                            'Add team members',
                            'Set up tasks with deadlines',
                            'Monitor daily progress'
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
                        <HelpOutline fontSize="small" />
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Need help? Click the tour button anytime
                        </Typography>
                    </Box>
                    </Box>
                )
                }
            ];