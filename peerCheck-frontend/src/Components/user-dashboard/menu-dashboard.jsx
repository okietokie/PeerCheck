import React, { useState } from 'react';
import { 
  Tabs, 
  Tab, 
  Box, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  Typography,
  Avatar,
  useTheme
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Folder as ProjectsIcon,
  Assignment as TasksIcon,
  Groups as TeamsIcon,
  Person as ProfileIcon,
  Help as HelpIcon,
  Logout as LogoutIcon,
  ArrowDropDown as ArrowDropDownIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

export default function MenuBar({ switchTheme }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  
  const [value, setValue] = useState(0);
  const [profileAnchor, setProfileAnchor] = useState(null);

  // Map paths to tab values
  const pathToValue = {
    '/dashboard': 0,
    '/projects': 1,
    '/tasks': 2,
    '/peerteams': 3,
    '/profile': 4,
  };

  // Set initial tab value based on current route
  React.useEffect(() => {
    const currentPath = location.pathname;
    const tabValue = pathToValue[currentPath] || 0;
    setValue(tabValue);
  }, [location.pathname]);

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
    
    // Navigate to corresponding routes
    const routes = ['/dashboard', '/projects', '/tasks', '/peerteams', '/profile'];
    if (routes[newValue]) {
      navigate(routes[newValue]);
    }
  };

  const handleProfileClick = (event) => {
    setProfileAnchor(event.currentTarget);
  };

  const handleProfileClose = () => {
    setProfileAnchor(null);
  };

  const handleHelp = () => {
    handleProfileClose();
    navigate('/help');
  };

  const handleLogout = () => {
    handleProfileClose();
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleProfile = () => {
    handleProfileClose();
    navigate('/profile');
  };

  return (
    <Box sx={{ 
      width: '100%', 
      bgcolor: 'background.paper',
      borderBottom: 1,
      borderColor: 'divider',
      boxShadow: 1
    }}>
      <Tabs
        value={value}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="main navigation tabs"
        sx={{
          minHeight: 64,
          '& .MuiTab-root': {
            minHeight: 64,
            fontSize: '0.9rem',
            fontWeight: 500,
            textTransform: 'none',
            fontFamily: '"Inter", sans-serif',
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
      >
        <Tab 
          icon={<DashboardIcon />} 
          iconPosition="start"
          label="Dashboard" 
        />
        <Tab 
          icon={<ProjectsIcon />} 
          iconPosition="start"
          label="Projects" 
        />
        <Tab 
          icon={<TasksIcon />} 
          iconPosition="start"
          label="Tasks" 
        />
        <Tab 
          icon={<TeamsIcon />} 
          iconPosition="start"
          label="PeerTeams" 
        />
        
        {/* Profile Tab with Dropdown */}
        <Tab
          icon={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                sx={{ 
                  width: 24, 
                  height: 24, 
                  fontSize: '0.8rem',
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText'
                }}
              >
                U
              </Avatar>
              <ArrowDropDownIcon />
            </Box>
          }
          iconPosition="start"
          label="Profile"
          onClick={handleProfileClick}
          sx={{
            '&.Mui-selected': {
              bgcolor: 'action.selected',
            }
          }}
        />
      </Tabs>

      {/* Profile Dropdown Menu */}
      <Menu
        anchorEl={profileAnchor}
        open={Boolean(profileAnchor)}
        onClose={handleProfileClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 180,
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            '& .MuiMenuItem-root': {
              fontFamily: '"Inter", sans-serif',
            }
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleProfile}>
          <ListItemIcon>
            <ProfileIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit">Profile</Typography>
        </MenuItem>
        
        <MenuItem onClick={handleHelp}>
          <ListItemIcon>
            <HelpIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit">Help</Typography>
        </MenuItem>
        
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="inherit">Logout</Typography>
        </MenuItem>
      </Menu>
    </Box>
  );
}