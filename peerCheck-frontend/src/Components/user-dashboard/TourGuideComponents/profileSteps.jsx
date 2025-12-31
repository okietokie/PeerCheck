import React from 'react';
import {
  Person,
  Edit,
  Search,
  People,
  Notifications,
  PersonAdd,
  PersonRemove,
  CheckCircle,
  School,
  Work,
  CalendarToday,
  AddPhotoAlternate,
  Save,
  Cancel,
  Verified,
  Email,
  Lightbulb,
  TrendingUp,
  Handshake,
  ConnectWithoutContact,
  Visibility,
  Speed,
  Assessment,
  Celebration
} from '@mui/icons-material';
import { Box, Avatar, Typography, Paper, Chip, Button, LinearProgress } from '@mui/material';
import { alpha } from '@mui/material/styles';

export const getProfileSteps = (theme) => [
  {
    id: 'welcome-profile',
    title: 'Welcome to Your Profile',
    description: "Let's explore your personal hub",
    icon: <Person />,
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
          <Person sx={{ fontSize: 40 }} />
        </Avatar>
        <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 600, color: 'text.primary' }}>
          Your Personal Hub
        </Typography>
        <Typography variant="body2" sx={{ mb: 2.5, color: 'text.secondary', lineHeight: 1.6 }}>
          This is where you showcase your skills, build your network, and connect with peers.
          Your profile is your launchpad for collaborations!
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: 1,
          color: theme.palette.info.main,
          fontSize: '0.875rem'
        }}>
          <Handshake fontSize="small" />
          <Typography variant="caption">Let's build your network!</Typography>
        </Box>
      </Box>
    )
  },
  {
    id: 'profile-header',
    title: 'Profile Header',
    description: 'Your personal showcase',
    icon: <Person />,
    element: '.profile-header', // Targets the main profile card
    position: 'bottom',
    offset: { x: 0, y: 20 },
    content: (
      <Box>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
          Your profile header showcases who you are:
        </Typography>
        <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
          {[
            {
              icon: <Visibility sx={{ fontSize: 18, color: theme.palette.primary.main }} />,
              text: 'Profile picture and basic info',
              color: theme.palette.primary.main
            },
            {
              icon: <Assessment sx={{ fontSize: 18, color: theme.palette.info.main }} />,
              text: 'Key stats and metrics',
              color: theme.palette.info.main
            },
            {
              icon: <Work sx={{ fontSize: 18, color: theme.palette.success.main }} />,
              text: 'Skills and education',
              color: theme.palette.success.main
            },
            {
              icon: <Speed sx={{ fontSize: 18, color: theme.palette.warning.main }} />,
              text: 'Profile completion progress',
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
            <Lightbulb fontSize="small" /> Complete your profile to increase connection chances by 60%!
          </Typography>
        </Paper>
      </Box>
    )
  },
  {
    id: 'edit-profile-button',
    title: 'Edit Your Profile',
    description: 'Keep your profile fresh',
    icon: <Edit />,
    element: 'button[aria-label="Edit Profile"]', // Edit profile button
    position: 'right',
    offset: { x: 20, y: 0 },
    content: (
      <Box>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
          Update your profile anytime:
        </Typography>
        <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
          {[
            {
              icon: <AddPhotoAlternate sx={{ fontSize: 18, color: theme.palette.primary.main }} />,
              text: 'Upload a professional profile picture',
              color: theme.palette.primary.main
            },
            {
              icon: <Work sx={{ fontSize: 18, color: theme.palette.success.main }} />,
              text: 'Add your latest skills and expertise',
              color: theme.palette.success.main
            },
            {
              icon: <School sx={{ fontSize: 18, color: theme.palette.info.main }} />,
              text: 'Update education details',
              color: theme.palette.info.main
            },
            {
              icon: <Email sx={{ fontSize: 18, color: theme.palette.warning.main }} />,
              text: 'Keep contact info current',
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
    id: 'network-stats',
    title: 'Network Overview',
    description: 'Track your connections',
    icon: <People />,
    element: '.network-stats', // Network overview card
    position: 'left',
    offset: { x: -20, y: 0 },
    content: (
      <Box>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
          Monitor your growing network:
        </Typography>
        <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
          {[
            {
              icon: <People sx={{ fontSize: 18, color: theme.palette.primary.main }} />,
              text: 'Total connections - Your peer network',
              color: theme.palette.primary.main
            },
            {
              icon: <Notifications sx={{ fontSize: 18, color: theme.palette.secondary.main }} />,
              text: 'Pending requests - Waiting for you',
              color: theme.palette.secondary.main
            },
            {
              icon: <ConnectWithoutContact sx={{ fontSize: 18, color: theme.palette.info.main }} />,
              text: 'Suggested peers - Potential connections',
              color: theme.palette.info.main
            },
            {
              icon: <TrendingUp sx={{ fontSize: 18, color: theme.palette.success.main }} />,
              text: 'Network growth - Track your progress',
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
    id: 'find-peers-tab',
    title: 'Find Peers',
    description: 'Discover and connect',
    icon: <Search />,
    element: '.find-peers-tab', // Find Peers tab button
    position: 'bottom',
    offset: { x: 0, y: 20 },
    content: (
      <Box>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
          Discover and connect with peers:
        </Typography>
        <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
          {[
            {
              icon: <Search sx={{ fontSize: 18, color: theme.palette.primary.main }} />,
              text: 'Search by name, institution, or skills',
              color: theme.palette.primary.main
            },
            {
              icon: <PersonAdd sx={{ fontSize: 18, color: theme.palette.success.main }} />,
              text: 'Send connection requests',
              color: theme.palette.success.main
            },
            {
              icon: <Verified sx={{ fontSize: 18, color: theme.palette.warning.main }} />,
              text: 'View verified profiles',
              color: theme.palette.warning.main
            },
            {
              icon: <School sx={{ fontSize: 18, color: theme.palette.info.main }} />,
              text: 'Filter by education or course',
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
            <Lightbulb fontSize="small" /> Tip: Search for users with complementary skills!
          </Typography>
        </Paper>
      </Box>
    )
  },
  {
    id: 'connection-requests-tab',
    title: 'Connection Requests',
    description: 'Manage incoming requests',
    icon: <Notifications />,
    element: '.connection-requests-tab', // Requests tab button
    position: 'bottom',
    offset: { x: 0, y: 20 },
    content: (
      <Box>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
          Manage your connection requests:
        </Typography>
        <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
          {[
            {
              icon: <CheckCircle sx={{ fontSize: 18, color: theme.palette.success.main }} />,
              text: 'Accept requests to grow your network',
              color: theme.palette.success.main
            },
            {
              icon: <Cancel sx={{ fontSize: 18, color: theme.palette.error.main }} />,
              text: 'Decline requests politely',
              color: theme.palette.error.main
            },
            {
              icon: <Visibility sx={{ fontSize: 18, color: theme.palette.info.main }} />,
              text: 'View requester profiles',
              color: theme.palette.info.main
            },
            {
              icon: <People sx={{ fontSize: 18, color: theme.palette.primary.main }} />,
              text: 'See your current connections',
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
    id: 'profile-completion',
    title: 'Profile Strength',
    description: 'Boost your visibility',
    icon: <TrendingUp />,
    element: '.profile-completion', // Profile completion progress bar
    position: 'top',
    offset: { x: 0, y: -20 },
    content: (
      <Box>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.primary' }}>
          Complete your profile to stand out:
        </Typography>
        <Box sx={{ display: 'grid', gap: 1.5, mb: 2 }}>
          {[
            {
              icon: <Person sx={{ fontSize: 18, color: theme.palette.primary.main }} />,
              text: 'Add profile picture (+20% visibility)',
              color: theme.palette.primary.main
            },
            {
              icon: <Work sx={{ fontSize: 18, color: theme.palette.success.main }} />,
              text: 'List 3+ skills (+25% visibility)',
              color: theme.palette.success.main
            },
            {
              icon: <School sx={{ fontSize: 18, color: theme.palette.info.main }} />,
              text: 'Add education details (+15% visibility)',
              color: theme.palette.info.main
            },
            {
              icon: <CalendarToday sx={{ fontSize: 18, color: theme.palette.warning.main }} />,
              text: 'Include a bio (+10% visibility)',
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
        
        {/* Progress visualization */}
        <Paper sx={{ 
          p: 2, 
          borderRadius: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.03),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          mb: 2
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              Profile Strength Impact
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
              70% Complete
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={70} 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              }
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Complete profiles get 3x more connection requests
          </Typography>
        </Paper>
      </Box>
    )
  },
  {
    id: 'profile-complete',
    title: 'Network Ready!',
    description: "You're set to connect",
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
          Your Network Hub is Ready!
        </Typography>
        <Typography variant="body2" sx={{ mb: 2.5, color: 'text.secondary', lineHeight: 1.6 }}>
          You now know how to showcase your skills, find peers, and build your professional network.
          Time to make meaningful connections!
        </Typography>
        
        <Paper sx={{ 
          p: 2, 
          mb: 2.5,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.03),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
        }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: theme.palette.primary.main }}>
            Quick Connection Tips:
          </Typography>
          <Box sx={{ display: 'grid', gap: 1 }}>
            {[
              'Complete your profile to stand out',
              'Search for peers with similar interests',
              'Personalize connection requests',
              'Regularly update your skills'
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
          <ConnectWithoutContact fontSize="small" />
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Start connecting and watch your network grow!
          </Typography>
        </Box>
      </Box>
    )
  }
];