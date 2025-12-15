import React, { useState } from 'react';
import { 
  Tabs, 
  Tab, 
  Box, 
  Container
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Folder as ProjectsIcon,
  Assignment as TasksIcon,
  Groups as TeamsIcon,
  Person as ProfileIcon,
  Logout as LogoutIcon,
  VisibilityOutlined
} from '@mui/icons-material';
import { useNavigate, useLocation, Routes, Route, Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import Dashboard from './Dashboard';
import Projects from './Projects';
import Tasks from './Tasks';
import PeerTeams from './PeerTeams';
import Profile from './Profile';
import MyProject from './MyProject';
import axiosClient from '@/api/axiosClient';

export default function UserApp() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);

  // Map paths to tab values
  const pathToValue = {
      '/user-app': 0,
      '/user-app/dashboard': 0,
      '/user-app/projects': 1,
      '/user-app/tasks': 2,
      '/user-app/my-project':3,
      '/user-app/peerteams': 4,
      '/user-app/profile': 5,
    };

  // Set initial tab value based on current route
  useEffect(() => {
    const currentPath = location.pathname;
    const tabValue = pathToValue[currentPath] || 0;
    if (currentPath.startsWith('/user-app/my-project/')) {
      setSelectedTab(3);
    } else {
      setSelectedTab(tabValue);
    }
  }, [location.pathname]);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    
  // Navigate to corresponding routes
  const routes = [
    '/user-app/dashboard', 
    '/user-app/projects', 
    '/user-app/tasks', 
    '/user-app/my-project', 
    '/user-app/peerteams', 
    '/user-app/profile'
  ];
  if (routes[newValue]) {
    navigate(routes[newValue]);
  }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    const res = await axiosClient.put('/auth/log-out', {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    console.log("res.data", res.data);
    if (res.data?.success){
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  return (
    <>
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
              fontSize: '0.9rem',
              fontWeight: 500,
              textTransform: 'none',
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
            icon={<VisibilityOutlined />} 
            iconPosition="start"
            label="My Project" 
          />
          <Tab 
            icon={<TeamsIcon />} 
            iconPosition="start"
            label="PeerTeams" 
          />
          <Tab 
            icon={<ProfileIcon />} 
            iconPosition="start"
            label="Profile" 
          />
          
          {/* Logout as separate button - not in tabs */}
          <Tab 
            icon={<LogoutIcon />}
            iconPosition="start"
            label="Logout" 
            onClick={handleLogout}
            sx={{
              '&.MuiTab-root': {
                color: 'error.main',
                '&:hover': {
                  color: 'error.dark',
                  backgroundColor: 'rgba(211, 47, 47, 0.04)',
                }
              }
            }}
          />
        </Tabs>
      </Box>

      <Container>
        <Outlet />
      </Container>
    </>
  );
}