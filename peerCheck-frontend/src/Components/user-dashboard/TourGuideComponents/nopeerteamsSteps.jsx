// NoTeamsTour.js
import React from 'react';
import {
  Groups as TeamsIcon,
  PersonAdd as PersonAddIcon,
  Add as AddIcon,
  GroupAdd as GroupAddIcon,
  People,
  Search,
  ConnectWithoutContact,
  PlayArrow,
  CheckCircle,
  Lightbulb,
  Celebration,
  Warning,
  Info,
  ArrowForward,
  PersonSearch,
  GroupWork,
  AccountCircle,
  Handshake,
  NetworkCheck,
  Launch,
  Diversity3,
  Group
} from '@mui/icons-material';
import { Box, Avatar, Typography, Paper, Chip, Button } from '@mui/material';
import { alpha } from '@mui/material/styles';

export const getNoTeamsTourSteps = (theme) => [
  {
    id: 'welcome-no-teams',
    title: 'Welcome to Teams',
    description: "Let's build your first team!",
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
          Start Your Team Journey
        </Typography>
        <Typography variant="body2" sx={{ mb: 2.5, color: 'text.secondary', lineHeight: 1.6 }}>
          Teams help you collaborate with peers on projects, share resources, 
          and achieve academic goals together. Let's get you started in 3 simple steps.
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
    id: 'find-peers-step',
    title: 'Step 1: Connect with Peers',
    description: 'Build your network first',
    icon: <PersonSearch />,
    element: '.MuiButton-contained:first-of-type', // Find Peers button
    position: 'right',
    offset: { x: 0, y: -10 },
    content: (
      <Box>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
          Before creating teams, you need team members:
        </Typography>
        <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
          {[
            {
              icon: <PersonSearch sx={{ fontSize: 18, color: theme.palette.primary.main }} />,
              text: 'Browse students in your courses',
              color: theme.palette.primary.main
            },
            {
              icon: <ConnectWithoutContact sx={{ fontSize: 18, color: theme.palette.info.main }} />,
              text: 'Send connection requests',
              color: theme.palette.info.main
            },
            {
              icon: <Handshake sx={{ fontSize: 18, color: theme.palette.success.main }} />,
              text: 'Accept incoming requests',
              color: theme.palette.success.main
            },
            {
              icon: <AccountCircle sx={{ fontSize: 18, color: theme.palette.secondary.main }} />,
              text: 'View peer profiles and skills',
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
            <Lightbulb fontSize="small" /> Connect with peers who share similar courses or interests!
          </Typography>
        </Paper>
      </Box>
    )
  },
  {
    id: 'create-team-step',
    title: 'Step 2: Create Your First Team',
    description: 'Once you have connections',
    icon: <GroupAddIcon />,
    element: '.MuiButton-outlined:first-of-type', // Create Team button
    position: 'bottom',
    offset: { x: 0, y: 10 },
    content: (
      <Box>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
          After connecting with peers:
        </Typography>
        <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
          {[
            {
              icon: <GroupAddIcon sx={{ fontSize: 18, color: theme.palette.warning.main }} />,
              text: 'Click "Create Team" button',
              color: theme.palette.warning.main
            },
            {
              icon: <AddIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />,
              text: 'Choose a meaningful team name',
              color: theme.palette.primary.main
            },
            {
              icon: <People sx={{ fontSize: 18, color: theme.palette.info.main }} />,
              text: 'Select team members from connections',
              color: theme.palette.info.main
            },
            {
              icon: <GroupWork sx={{ fontSize: 18, color: theme.palette.success.main }} />,
              text: 'Assign roles (Leader, Member)',
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
          bgcolor: alpha(theme.palette.warning.main, 0.05),
          border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`
        }}>
          <Typography variant="caption" sx={{ color: theme.palette.warning.main, fontStyle: 'italic' }}>
            <Warning fontSize="small" /> Button disabled until you have connections
          </Typography>
        </Paper>
      </Box>
    )
  },
  {
    id: 'empty-state-guide',
    title: 'Quick Start Guide',
    description: 'Visual roadmap to success',
    icon: <Launch />,
    element: '.MuiContainer-root .MuiBox-root', // Empty state container
    position: 'center',
    content: (
      <Box>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
          Your path to first team:
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
          {[
            {
              step: '1',
              icon: <PersonAddIcon sx={{ color: theme.palette.primary.main }} />,
              title: 'Find Peers',
              desc: 'Connect with classmates in your courses',
              color: theme.palette.primary.main,
              status: 'current'
            },
            {
              step: '2',
              icon: <Handshake sx={{ color: theme.palette.info.main }} />,
              title: 'Build Network',
              desc: 'Grow your connections list',
              color: theme.palette.info.main,
              status: 'pending'
            },
            {
              step: '3',
              icon: <GroupAddIcon sx={{ color: theme.palette.success.main }} />,
              title: 'Create Team',
              desc: 'Invite connections to collaborate',
              color: theme.palette.success.main,
              status: 'pending'
            },
            {
              step: '4',
              icon: <Diversity3 sx={{ color: theme.palette.warning.main }} />,
              title: 'Collaborate',
              desc: 'Work together on projects and tasks',
              color: theme.palette.warning.main,
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
                opacity: item.status === 'pending' ? 0.7 : 1
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
    id: 'peer-connections-preview',
    title: 'Your Future Team',
    description: 'See who you can collaborate with',
    icon: <NetworkCheck />,
    element: '.peer-connections-preview', // Connections preview
    position: 'left',
    offset: { x: -20, y: 0 },
    content: (
      <Box>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
          Once you have connections:
        </Typography>
        <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
          {[
            {
              icon: <People sx={{ fontSize: 18, color: theme.palette.primary.main }} />,
              text: 'Connections appear here automatically',
              color: theme.palette.primary.main
            },
            {
              icon: <Search sx={{ fontSize: 18, color: theme.palette.info.main }} />,
              text: 'Filter connections by course or skills',
              color: theme.palette.info.main
            },
            {
              icon: <Group sx={{ fontSize: 18, color: theme.palette.success.main }} />,
              text: 'Select who to invite to your team',
              color: theme.palette.success.main
            },
            {
              icon: <Info sx={{ fontSize: 18, color: theme.palette.warning.main }} />,
              text: 'View connection profiles before inviting',
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
            <Lightbulb fontSize="small" /> Quantity for effective teams!
          </Typography>
        </Paper>
      </Box>
    )
  },
  {
    id: 'no-teams-complete',
    title: 'Ready to Begin!',
    description: "Let's build your first team together",
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
          You're All Set to Start!
        </Typography>
        <Typography variant="body2" sx={{ mb: 2.5, color: 'text.secondary', lineHeight: 1.6 }}>
          You now understand the simple 3-step process to create your first team. 
          Start by connecting with peers, then build teams for collaborative success.
        </Typography>
        
        <Paper sx={{ 
          p: 2, 
          mb: 2.5,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.03),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
        }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: theme.palette.primary.main }}>
            Quick Tips for Success:
          </Typography>
          <Box sx={{ display: 'grid', gap: 1 }}>
            {[
              'Connect with peers in similar courses first',
              'Create teams for specific projects or study groups',
              'Start with 3-5 members for manageable teams',
              'Use team names that reflect the purpose',
              'Regular teams perform better than temporary ones'
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
          <PersonAddIcon fontSize="small" />
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Click "Find Peers" to begin your team-building journey!
          </Typography>
        </Box>
      </Box>
    )
  }
];