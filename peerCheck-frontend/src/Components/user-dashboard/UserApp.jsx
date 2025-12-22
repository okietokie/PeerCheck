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
  Tooltip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Folder as ProjectsIcon,
  Assignment as TasksIcon,
  Groups as TeamsIcon,
  Person as ProfileIcon,
  Logout as LogoutIcon,
  VisibilityOutlined,
  Menu as MenuIcon,
  Close as CloseIcon

} from '@mui/icons-material';

import { useNavigate, useLocation, Routes, Route, Outlet } from 'react-router-dom';
import { useEffect } from 'react';

import axiosClient from '@/api/axiosClient';
import NotificationBell from './NotificationBell';
export default function UserApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [bottomNavValue, setBottomNavValue] = useState(0);

  // Map paths to tab values
  const pathToValue = {
    '/user-app': 0,
    '/user-app/dashboard': 0,
    '/user-app/projects': 1,
    '/user-app/tasks': 2,
    '/user-app/my-project': 3,
    '/user-app/peerteams': 4,
    '/user-app/profile': 5,
  };

  const handleSendRequest = async (userId) => {
  try {
    await axiosClient.post('/api/user/send-request', { targetUserId: userId });
    // The notification will be automatically created by the backend
  } catch (error) {
    console.error('Error sending request:', error);
  }
};

  // Navigation items
  const navItems = [
    { label: 'Dashboard', icon: <DashboardIcon />, path: '/user-app/dashboard' },
    { label: 'Projects', icon: <ProjectsIcon />, path: '/user-app/projects' },
    { label: 'Tasks', icon: <TasksIcon />, path: '/user-app/tasks' },
    { label: 'My Project', icon: <VisibilityOutlined />, path: '/user-app/my-project' },
    { label: 'PeerTeams', icon: <TeamsIcon />, path: '/user-app/peerteams' },
    { label: 'Profile', icon: <ProfileIcon />, path: '/user-app/profile' },
    { label : 'Notification', icon: <NotificationBell />, path: '/user-app/notifications'}
  ];

  // Set initial tab value based on current route
  useEffect(() => {
    const currentPath = location.pathname;
    const tabValue = pathToValue[currentPath] || 0;
    if (currentPath.startsWith('/user-app/my-project/')) {
      setSelectedTab(3);
      setBottomNavValue(3);
    } else {
      setSelectedTab(tabValue);
      setBottomNavValue(tabValue);
    }
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

    if (res.data?.success){
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Mobile Drawer Content
  const drawerContent = (
    <Box sx={{ width: 250, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Navigation
        </Typography>
        <IconButton onClick={handleDrawerToggle}>
          <CloseIcon />
        </IconButton>
      </Box>
      
      <List sx={{ flex: 1 }}>
        {navItems.map((item, index) => (
          <ListItem 
            button 
            key={item.label}
            selected={selectedTab === index}
            onClick={(e) => handleTabChange(e, index)}
            sx={{
              borderRadius: 1,
              mx: 1,
              my: 0.5,
              '&.Mui-selected': {
                backgroundColor: 'primary.light',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.light',
                }
              }
            }}
          >
            <ListItemIcon sx={{ 
              minWidth: 40,
              color: selectedTab === index ? 'primary.main' : 'inherit'
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.label} 
              primaryTypographyProps={{
                fontWeight: selectedTab === index ? 600 : 400
              }}
            />
          </ListItem>
        ))}
      </List>


      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <NotificationBell />
        
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
      pb: isMobile ? 7 : 0 // Add padding for bottom navigation on mobile
    }}>
      {/* Desktop Navigation */}
      {!isMobile ? (
        <Box sx={{ 
          width: '100%', 
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          boxShadow: 1,
        }}>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            scrollButtons="auto"
            aria-label="main navigation tabs"
            sx={{
              minHeight: 64,
              '& .MuiTab-root': {
                minHeight: 64,
                fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.9rem' },
                fontWeight: 500,
                textTransform: 'none',
                px: { xs: 1, sm: 1.5, md: 2 },
              },
              '& .Mui-selected': {
                color: 'primary.main',
                fontWeight: 600,
              },
              '& .MuiTabs-indicator': {
                backgroundColor: 'primary.main',
                height: 3,
              },
            }}
            centered
          >
            {navItems.map((item) => (
              <Tab 
                key={item.label}
                icon={item.icon}
                iconPosition="start"
                label={item.label}
                sx={{
                  minWidth: { xs: 'auto', sm: '120px' },
                }}
              />
            ))}
            
            {/* Logout as separate button - not in tabs */}
            <Tab 
              icon={<LogoutIcon />}
              iconPosition="start"
              label="Logout" 
              onClick={handleLogout}
              sx={{
                '&.MuiTab-root': {
                  color: 'error.main',
                  minWidth: { xs: 'auto', sm: '120px' },
                  '&:hover': {
                    color: 'error.dark',
                    backgroundColor: 'rgba(211, 47, 47, 0.04)',
                  }
                }
              }}
            />
          </Tabs>
        </Box>
      ) : (
        /* Mobile Top Bar */
        <>
          <AppBar 
            position="fixed" 
            sx={{ 
              top: 0, 
              left: 0, 
              right: 0,
              zIndex: theme.zIndex.drawer + 1 
            }}
          >
            <Toolbar sx={{ justifyContent: 'space-between' }}>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
              >
                <MenuIcon />
              </IconButton>
              
              <Typography variant="h6" noWrap sx={{ flexGrow: 1, textAlign: 'center' }}>
                {navItems[selectedTab]?.label || 'Dashboard'}
              </Typography>
              
              {/* ADD NOTIFICATION BELL HERE */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <NotificationBell />
                
                <IconButton 
                  color="inherit" 
                  onClick={handleLogout}
                  sx={{ 
                    color: 'error.light',
                    '&:hover': {
                      color: 'error.main',
                    }
                  }}
                >
                  <LogoutIcon />
                </IconButton>
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
              keepMounted: true, // Better mobile performance
            }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: 250,
              },
            }}
          >
            {drawerContent}
          </Drawer>
          
          {/* Spacer for AppBar */}
          <Toolbar />
          
          {/* Mobile Bottom Navigation */}
          <Paper 
            sx={{ 
              position: 'fixed', 
              bottom: 0, 
              left: 0, 
              right: 0, 
              zIndex: theme.zIndex.appBar,
              display: { xs: 'block', md: 'none' }
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
                height: 56,
                '& .MuiBottomNavigationAction-root': {
                  minWidth: isSmallMobile ? 50 : 70,
                  px: isSmallMobile ? 0.5 : 1,
                },
                '& .Mui-selected': {
                  color: 'primary.main',
                  '& .MuiBottomNavigationAction-label': {
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }
                }
              }}
            >
              {navItems.map((item, index) => (
                <BottomNavigationAction
                  key={item.label}
                  label={item.label}
                  icon={item.icon}
                  sx={{
                    '& .MuiBottomNavigationAction-label': {
                      fontSize: '0.7rem',
                      fontWeight: index === bottomNavValue ? 600 : 400,
                    }
                  }}
                />
              ))}
            </BottomNavigation>
          </Paper>
        </>
      )}

      {/* Main Content */}
      <Container 
        maxWidth="lg" 
        sx={{ 
          flex: 1,
          py: { xs: 2, sm: 3 },
          px: { xs: 1, sm: 2 },
          width: '100%',
          overflow: 'auto'
        }}
      >
        <Outlet />
      </Container>
    </Box>
  );
}