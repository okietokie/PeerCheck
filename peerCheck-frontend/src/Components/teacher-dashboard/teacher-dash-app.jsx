import React, { useState } from 'react';
import { 
  Tabs, 
  Tab, 
  Box, 
  Container,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Tooltip,
  alpha
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Class as ClassesIcon,
  Assignment as ProjectsIcon,
  Groups as TeamsIcon,
  RateReview as ReviewsIcon,
  Analytics as AnalyticsIcon,
  Feedback as FeedbackIcon,
  Person as ProfileIcon,
  Logout as LogoutIcon,
  VisibilityOutlined,
  Menu as MenuIcon,
  Close as CloseIcon,
  AccountCircle,
  HelpOutline,
  School as SchoolIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';

import { useNavigate, useLocation, Routes, Route, Outlet } from 'react-router-dom';
import { useEffect } from 'react';

import axiosClient from '@/api/axiosClient';
import NotificationBell from '../Notifications/NotificationBell';
import { getUserData } from '@/utils/user.js';
import TourGuide from '../TourGuide';

export default function TeacherApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [user, setUser] = useState();
  const [selectedTab, setSelectedTab] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bottomNavValue, setBottomNavValue] = useState(0);

  // Map paths to tab values
  const pathToValue = {
    '/teacher-app': 0,
    '/teacher-app/dashboard': 0,
    '/teacher-app/classes': 1,
    '/teacher-app/projects': 2,
    '/teacher-app/peer-teams': 3,
    '/teacher-app/reviews': 4,
    '/teacher-app/analytics': 5,
    '/teacher-app/feedback': 6,
    '/teacher-app/profile': 7,
  };

  // Teacher-specific navigation items
  const navItems = [
    { label: 'Dashboard', icon: <DashboardIcon />, path: '/teacher-app/dashboard' },
    { label: 'Classes', icon: <ClassesIcon />, path: '/teacher-app/classes' },
    { label: 'Projects', icon: <ProjectsIcon />, path: '/teacher-app/projects' },
    { label: 'Peer Teams', icon: <TeamsIcon />, path: '/teacher-app/peer-teams' },
    { label: 'Reviews', icon: <ReviewsIcon />, path: '/teacher-app/reviews' },
    { label: 'Analytics', icon: <AnalyticsIcon />, path: '/teacher-app/analytics' },
    { label: 'Feedback', icon: <FeedbackIcon />, path: '/teacher-app/feedback' },
    { label: 'Profile', icon: <AccountCircle />, path: '/teacher-app/profile' },
  ];

  useEffect(() => {
    const settingUser = async () => {
      const u = await getUserData();
      setUser(u);
    }
    settingUser();
  }, []);

  // Set initial tab value based on current route
  useEffect(() => {
    const currentPath = location.pathname;
    const tabValue = pathToValue[currentPath] || 0;
    setSelectedTab(tabValue || 0);
    setBottomNavValue(tabValue || 0);
  }, [location.pathname]);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    setBottomNavValue(newValue);
    
    // Navigate to corresponding routes
    if (navItems[newValue]) {
      navigate(navItems[newValue].path);
    }
    
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    const res = await axiosClient.put('/auth/log-out', {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    if (res.data?.success) {
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Mobile Drawer Content for Teacher
  const drawerContent = (
    <Box sx={{ 
      width: 250, 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: 'background.paper'
    }}>
      {/* Drawer Header */}
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'primary.main',
        color: 'primary.contrastText'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SchoolIcon />
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
            Teacher Portal
          </Typography>
        </Box>
        <IconButton 
          onClick={handleDrawerToggle}
          sx={{ color: 'primary.contrastText' }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      
      {/* User Info Section */}
      <Box sx={{ 
        p: 2, 
        borderBottom: 1, 
        borderColor: 'divider',
        bgcolor: 'grey.50'
      }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {user?.username || 'Teacher'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {user?.email || 'teacher@example.com'}
        </Typography>
      </Box>
      
      {/* Navigation List */}
      <List sx={{ flex: 1, p: 1 }}>
        {navItems.map((item, index) => (
          <ListItem 
            button 
            key={item.label}
            selected={selectedTab === index}
            onClick={(e) => handleTabChange(e, index)}
            sx={{
              borderRadius: 1,
              mx: 0.5,
              my: 0.5,
              '&.Mui-selected': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                borderLeft: `3px solid ${theme.palette.primary.main}`,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.15),
                }
              }
            }}
          >
            <ListItemIcon sx={{ 
              minWidth: 40,
              color: selectedTab === index ? 'primary.main' : 'text.secondary'
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.label} 
              primaryTypographyProps={{
                fontWeight: selectedTab === index ? 600 : 400,
                fontSize: '0.9rem'
              }}
            />
          </ListItem>
        ))}
      </List>

      {/* Drawer Footer with Logout */}
      <Box sx={{ 
        p: 2, 
        borderTop: 1, 
        borderColor: 'divider',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant="caption" color="text.secondary">
          Teacher Account
        </Typography>
        <IconButton 
          onClick={handleLogout}
          sx={{
            color: 'error.main',
            '&:hover': {
              color: 'error.dark',
              backgroundColor: 'rgba(211, 47, 47, 0.04)',
            }
          }} 
        >
          <Tooltip title="Logout">
            <LogoutIcon />
          </Tooltip>
        </IconButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh',
      pb: isMobile ? 7 : 0,
      bgcolor: 'grey.50'
    }}>
      {/* Desktop Navigation for Teacher */}
      {!isMobile ? (
        <Box sx={{ 
          width: '100%', 
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          boxShadow: 2,
          position: 'sticky',
          top: 0,
          zIndex: theme.zIndex.appBar
        }}>
          <Container maxWidth="xl">
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'space-between',
              height: 70,
              px: 2
            }}>
              {/* Left Section: Logo/Title */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <SchoolIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700,
                    color: 'primary.main',
                    display: { xs: 'none', md: 'block' }
                  }}
                >
                  Teacher Portal
                </Typography>
              </Box>

              {/* Center Section: Navigation Tabs */}
              <Tabs
                value={selectedTab}
                onChange={handleTabChange}
                aria-label="teacher navigation tabs"
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  minHeight: 70,
                  '& .MuiTab-root': {
                    minHeight: 70,
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    textTransform: 'none',
                    px: 2,
                    minWidth: 100,
                  },
                  '& .Mui-selected': {
                    color: 'primary.main',
                    fontWeight: 600,
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: 'primary.main',
                    height: 3,
                    borderRadius: '3px 3px 0 0',
                  },
                }}
              >
                {navItems.map((item) => (
                  <Tab 
                    key={item.label}
                    icon={item.icon}
                    iconPosition="start"
                    label={item.label === 'Profile' ? user?.username : item.label}
                  />
                ))}
              </Tabs>

              {/* Right Section: Utilities */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {/* Tour Guide for Teachers */}
                <TourGuide page="teacher-navigation" showAppBarButton={true} />
                
                {/* Notification Bell */}
                <NotificationBell />
                
                {/* Help/Support */}
                <Tooltip title="Help & Support">
                  <IconButton>
                    <HelpOutline />
                  </IconButton>
                </Tooltip>
                
                {/* Logout Button */}
                <Tooltip title="Logout">
                  <IconButton 
                    onClick={handleLogout}
                    sx={{
                      color: 'error.main',
                      '&:hover': {
                        color: 'error.dark',
                        backgroundColor: 'rgba(211, 47, 47, 0.04)',
                      }
                    }} 
                  >
                    <LogoutIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Container>
        </Box>
      ) : (
        /* Mobile Layout for Teacher */
        <>
          {/* Mobile AppBar */}
          <AppBar 
            position="fixed" 
            sx={{ 
              top: 0, 
              left: 0, 
              right: 0,
              zIndex: theme.zIndex.drawer + 1,
              bgcolor: 'primary.main'
            }}
          >
            <Toolbar sx={{ justifyContent: 'space-between', minHeight: 56 }}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
              >
                <MenuIcon />
              </IconButton>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SchoolIcon sx={{ fontSize: 20 }} />
                <Typography variant="subtitle1" noWrap sx={{ fontWeight: 600 }}>
                  {navItems[selectedTab]?.label || 'Teacher'}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <NotificationBell />
              </Box>
            </Toolbar>
          </AppBar>
          
          {/* Mobile Drawer */}
          <Drawer
            variant="temporary"
            anchor="left"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: 280,
              },
            }}
          >
            {drawerContent}
          </Drawer>
          
          {/* Spacer for AppBar */}
          <Toolbar sx={{ minHeight: 56 }} />
          
          {/* Mobile Bottom Navigation (Limited to 5 items for mobile) */}
          <Paper 
            sx={{ 
              position: 'fixed', 
              bottom: 0, 
              left: 0, 
              right: 0, 
              zIndex: theme.zIndex.appBar,
              display: { xs: 'block', md: 'none' },
              borderTop: 1,
              borderColor: 'divider'
            }} 
            elevation={3}
          >
            <BottomNavigation
              showLabels
              value={bottomNavValue}
              onChange={(event, newValue) => {
                setBottomNavValue(newValue);
                handleTabChange(event, newValue);
              }}
              sx={{
                height: 60,
                '& .MuiBottomNavigationAction-root': {
                  minWidth: isSmallMobile ? 55 : 70,
                  px: isSmallMobile ? 0.5 : 1,
                  py: 1,
                },
                '& .Mui-selected': {
                  color: 'primary.main',
                  '& .MuiBottomNavigationAction-label': {
                    fontSize: '0.7rem',
                    fontWeight: 600,
                  }
                }
              }}
            >
              {/* Show only essential tabs on mobile */}
              {navItems.slice(0, 5).map((item, index) => (
                <BottomNavigationAction
                  key={item.label}
                  label={item.label}
                  icon={item.icon}
                  sx={{
                    '& .MuiBottomNavigationAction-label': {
                      fontSize: '0.65rem',
                      fontWeight: index === bottomNavValue ? 600 : 400,
                      mt: 0.5
                    }
                  }}
                />
              ))}
            </BottomNavigation>
          </Paper>
        </>
      )}

      {/* Main Content Area */}
      <Container 
        maxWidth={false}
        sx={{ 
          flex: 1,
          py: { xs: 2, sm: 3 },
          px: { xs: 1, sm: 2 },
          width: '100%',
          overflow: 'auto',
          mt: { xs: 1, sm: 2 }
        }}
      >
        <Outlet />
      </Container>

      {/* Teacher-specific Footer for Desktop */}
      {!isMobile && (
        <Box 
          component="footer" 
          sx={{ 
            py: 2, 
            px: 3, 
            mt: 'auto',
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper'
          }}
        >
          <Container maxWidth="xl">
            <Typography variant="caption" color="text.secondary" align="center">
              Teacher Portal • Academic Year {new Date().getFullYear()}-{new Date().getFullYear() + 1}
            </Typography>
          </Container>
        </Box>
      )}
    </Box>
  );
}