import React from 'react';
import {
  Dashboard,
  Folder,
  Assignment,
  Groups,
  AccountCircle,
  VisibilityOutlined,
  Celebration,
  Handshake,
  PersonAdd,
  ConnectWithoutContact,
  Star,
  GroupAdd,
  Diversity3,
  Forum,
  RocketLaunch,
  Insights,
  NotificationsActive,
  ViewList,
  AddCircle,
  Timeline,
  Checklist,
  AssignmentTurnedIn,
  Schedule,
  Analytics,
  Speed,
  Lightbulb,
  TrendingUp,
  Navigation
} from '@mui/icons-material';
import { Box, Avatar, Typography, Paper } from '@mui/material';
import { alpha } from '@mui/material/styles';

export const getNavigationSteps = (theme) => [
                {
                id: 'welcome-navigation',
                title: 'Welcome to PeerCheck!',
                description: "Let's explore how everything connects",
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
                        <Handshake sx={{ fontSize: 40 }} />
                    </Avatar>
                    <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600, color: 'text.primary' }}>
                        Your Study Journey Starts Here
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2.5, color: 'text.secondary', lineHeight: 1.6 }}>
                        PeerCheck helps you connect, collaborate, and crush your projects together.
                        Let's walk through how everything flows naturally.
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
                        <Typography variant="caption">Let's explore your workflow</Typography>
                    </Box>
                    </Box>
                )
                },
                {
                id: 'profile-tab',
                title: 'Your Profile',
                description: 'Your launchpad for connections',
                icon: <AccountCircle />,
                element: '.MuiTabs-root .MuiTab-root:nth-child(6)',
                position: 'top',
                offset: { x: 0, y: -20 },
                content: (
                    <Box>
                    <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
                        <strong>Start here!</strong> Showcase your skills and find peers who complement them.
                        This is where connections begin.
                    </Typography>
                    <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
                        {[
                        {
                            icon: <PersonAdd sx={{ fontSize: 18, color: theme.palette.primary.main }} />,
                            text: 'Show off your skills and interests',
                            color: theme.palette.primary.main
                        },
                        {
                            icon: <ConnectWithoutContact sx={{ fontSize: 18, color: theme.palette.info.main }} />,
                            text: 'Find peers with complementary skills',
                            color: theme.palette.info.main
                        },
                        {
                            icon: <Star sx={{ fontSize: 18, color: theme.palette.warning.main }} />,
                            text: 'Build your academic reputation',
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
                        <Lightbulb/> <strong>Next step:</strong> Once your profile is set, head to PeerTeams to form your dream team!
                        </Typography>
                    </Paper>
                    </Box>
                )
                },
                {
                id: 'peer-teams-tab',
                title: 'PeerTeams',
                description: 'Form your dream team',
                icon: <Groups />,
                element: '.MuiTabs-root .MuiTab-root:nth-child(5)',
                position: 'top',
                offset: { x: 0, y: -20 },
                content: (
                    <Box>
                    <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
                        <strong>Team up!</strong> Bring together the perfect mix of skills and personalities.
                        This is where great collaborations begin.
                    </Typography>
                    <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
                        {[
                        {
                            icon: <GroupAdd sx={{ fontSize: 18, color: theme.palette.primary.main }} />,
                            text: 'Invite peers you connected with',
                            color: theme.palette.primary.main
                        },
                        {
                            icon: <Diversity3 sx={{ fontSize: 18, color: theme.palette.info.main }} />,
                            text: 'Balance skills across your team',
                            color: theme.palette.info.main
                        },
                        {
                            icon: <Forum sx={{ fontSize: 18, color: theme.palette.success.main }} />,
                            text: 'Set team goals and expectations',
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
                        bgcolor: alpha(theme.palette.success.main, 0.05),
                        border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`
                    }}>
                        <Typography variant="caption" sx={{ color: theme.palette.success.main, fontStyle: 'italic' }}>
                        <Lightbulb /> <strong>Next step:</strong> With your team ready, create a project in Dashboard or Projects tab!
                        </Typography>
                    </Paper>
                    </Box>
                )
                },
                {
                id: 'dashboard-tab',
                title: 'Dashboard',
                description: 'Your command center',
                icon: <Dashboard />,
                element: '.MuiTabs-root .MuiTab-root:nth-child(1)',
                position: 'bottom',
                offset: { x: 0, y: 20 },
                content: (
                    <Box>
                    <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
                        <strong>See everything at once!</strong> Your big picture view of projects, progress, and team activity.
                        Perfect for quick starts and overviews.
                    </Typography>
                    <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
                        {[
                        {
                            icon: <RocketLaunch sx={{ fontSize: 18, color: theme.palette.primary.main }} />,
                            text: 'Quick-start new projects with your team',
                            color: theme.palette.primary.main
                        },
                        {
                            icon: <Insights sx={{ fontSize: 18, color: theme.palette.success.main }} />,
                            text: 'Track team productivity at a glance',
                            color: theme.palette.success.main
                        },
                        {
                            icon: <NotificationsActive sx={{ fontSize: 18, color: theme.palette.warning.main }} />,
                            text: 'Spot what needs attention right away',
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
                        <Lightbulb /> <strong>Next step:</strong> Dive into specific projects or manage all work items in Tasks!
                        </Typography>
                    </Paper>
                    </Box>
                )
                },
                {
                id: 'projects-tab',
                title: 'Projects',
                description: 'All your projects, organized',
                icon: <Folder />,
                element: '.MuiTabs-root .MuiTab-root:nth-child(2)',
                position: 'bottom',
                offset: { x: 0, y: 20 },
                content: (
                    <Box>
                    <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
                        <strong>Organize everything!</strong> Your complete project library - active, completed, and upcoming.
                        Perfect for detailed planning and management.
                    </Typography>
                    <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
                        {[
                        {
                            icon: <ViewList sx={{ fontSize: 18, color: theme.palette.primary.main }} />,
                            text: 'Browse and organize all team projects',
                            color: theme.palette.primary.main
                        },
                        {
                            icon: <AddCircle sx={{ fontSize: 18, color: theme.palette.success.main }} />,
                            text: 'Create structured projects with clear goals',
                            color: theme.palette.success.main
                        },
                        {
                            icon: <Timeline sx={{ fontSize: 18, color: theme.palette.info.main }} />,
                            text: 'Set milestones and track deadlines',
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
                        bgcolor: alpha(theme.palette.success.main, 0.05),
                        border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`
                    }}>
                        <Typography variant="caption" sx={{ color: theme.palette.success.main, fontStyle: 'italic' }}>
                        <Lightbulb /> <strong>Next step:</strong> Break projects down into actionable tasks in the Tasks tab!
                        </Typography>
                    </Paper>
                    </Box>
                )
                },
                {
                id: 'tasks-tab',
                title: 'Tasks',
                description: 'Your to-do list, supercharged',
                icon: <Assignment />,
                element: '.MuiTabs-root .MuiTab-root:nth-child(3)',
                position: 'bottom',
                offset: { x: 0, y: 20 },
                content: (
                    <Box>
                    <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
                        <strong>Get things done!</strong> Where projects become actionable steps.
                        Assign, track, and complete everything that needs doing.
                    </Typography>
                    <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
                        {[
                        {
                            icon: <Checklist sx={{ fontSize: 18, color: theme.palette.success.main }} />,
                            text: 'Break projects into manageable tasks',
                            color: theme.palette.success.main
                        },
                        {
                            icon: <AssignmentTurnedIn sx={{ fontSize: 18, color: theme.palette.primary.main }} />,
                            text: 'Assign tasks to team members clearly',
                            color: theme.palette.primary.main
                        },
                        {
                            icon: <Schedule sx={{ fontSize: 18, color: theme.palette.warning.main }} />,
                            text: 'Track progress and meet deadlines',
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
                        <Lightbulb /> <strong>Next step:</strong> See how efficiently your team works in My Project view!
                        </Typography>
                    </Paper>
                    </Box>
                )
                },
                {
                id: 'my-project-tab',
                title: 'My Project',
                description: 'Focus on what matters now',
                icon: <VisibilityOutlined />,
                element: '.MuiTabs-root .MuiTab-root:nth-child(4)',
                position: 'bottom',
                offset: { x: 0, y: 20 },
                content: (
                    <Box>
                    <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
                        <strong>See your impact clearly!</strong> Dive deep into one project at a time.
                        Watch your team's efficiency unfold in real-time.
                    </Typography>
                    <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
                        {[
                        {
                            icon: <Analytics sx={{ fontSize: 18, color: theme.palette.primary.main }} />,
                            text: 'Clear efficiency metrics at a glance',
                            color: theme.palette.primary.main
                        },
                        {
                            icon: <Speed sx={{ fontSize: 18, color: theme.palette.success.main }} />,
                            text: 'Track team velocity and productivity',
                            color: theme.palette.success.main
                        },
                        {
                            icon: <Insights sx={{ fontSize: 18, color: theme.palette.info.main }} />,
                            text: 'Identify bottlenecks before they slow you down',
                            color: theme.palette.info.main
                        },
                        {
                            icon: <Celebration sx={{ fontSize: 18, color: theme.palette.warning.main }} />,
                            text: 'Celebrate milestones and progress wins',
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
                        <Lightbulb /> <strong>You're all set!</strong> Now you know exactly how PeerCheck helps you connect, collaborate, and succeed together!
                        </Typography>
                    </Paper>
                    </Box>
                )
                },
                {
                id: 'navigation-complete',
                title: 'You\'re Ready to Roll!',
                description: "Now go crush those projects",
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
                        Workflow Mastered! 
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2.5, color: 'text.secondary', lineHeight: 1.6 }}>
                        From connecting with peers to tracking project efficiency - 
                        you now know exactly how to make PeerCheck work for you.
                    </Typography>
                    
                    <Paper sx={{ 
                        p: 2, 
                        mb: 2.5,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.primary.main, 0.03),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                    }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: theme.palette.primary.main }}>
                        Your Success Path:
                        </Typography>
                        <Box sx={{ display: 'grid', gap: 1 }}>
                        {[
                            'Profile → Showcase your skills',
                            'PeerTeams → Form your dream team',
                            'Projects → Organize your work',
                            'Tasks → Get things done',
                            'My Project → Track your efficiency'
                        ].map((tip, index) => (
                            <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Navigation sx={{ fontSize: 16, color: theme.palette.success.main }} />
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
                        <RocketLaunch fontSize="small" />
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Start your first project and watch your team succeed!
                        </Typography>
                    </Box>
                    </Box>
                )
                }
            ]