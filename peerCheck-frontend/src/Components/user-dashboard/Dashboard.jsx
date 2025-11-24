import axiosClient from '@/api/axiosClient';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import FolderIcon from '@mui/icons-material/Folder';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AddIcon from '@mui/icons-material/Add';
import CommentIcon from '@mui/icons-material/Comment';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import { 
  Box, 
  Button, 
  Card, 
  CardActions, 
  CardContent, 
  CardHeader, 
  CircularProgress, 
  Typography,
  Grid,
  Paper,
  Avatar,
  Chip,
  alpha,
  useTheme,
  Container
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const theme = useTheme();

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [projects, setProjects] = useState([]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axiosClient.get("user/me", { headers: { Authorization: `Bearer ${token}` } });
      setUsername(res.data.username);
      setProjects(res.data.userProjects || []);
    } catch (err) {
      console.error(err);
      localStorage.removeItem("token");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
    fetchUserDetails();
    }, 1000000);
    return () => clearInterval(interval);
  }, []);

  // Stats data using theme colors
  const stats = [
    {
      title: 'Active Projects',
      value: projects.length || 0,
      icon: <FolderIcon sx={{ fontSize: 30 }} />,
      color: theme.palette.primary.main,
      description: 'Your current projects'
    },
    {
      title: 'Collaborators',
      value: '12',
      icon: <PeopleIcon sx={{ fontSize: 30 }} />,
      color: theme.palette.secondary.main,
      description: 'Peers working with you'
    },
    {
      title: 'Productivity',
      value: '87%',
      icon: <TrendingUpIcon sx={{ fontSize: 30 }} />,
      color: theme.palette.success.main,
      description: 'This week\'s progress'
    }
  ];

  // Sample recent projects if none exist
  const sampleProjects = [
    { id: 1, name: 'Web Development Course', members: 4, progress: 75 },
    { id: 2, name: 'Data Science Project', members: 3, progress: 45 },
    { id: 3, name: 'Mobile App Design', members: 2, progress: 90 }
  ];

  const displayProjects = projects.length > 0 ? projects : sampleProjects;

  // Recent activities
  const recentActivities = [
    { 
      action: 'Sarah commented on your project', 
      time: '2 hours ago',
      icon: <CommentIcon sx={{ fontSize: 18 }} />,
      color: theme.palette.primary.main
    },
    { 
      action: 'You completed task: Design Review', 
      time: '5 hours ago',
      icon: <TaskAltIcon sx={{ fontSize: 18 }} />,
      color: theme.palette.success.main
    },
    { 
      action: 'New collaborator joined', 
      time: '1 day ago',
      icon: <GroupAddIcon sx={{ fontSize: 18 }} />,
      color: theme.palette.secondary.main
    }
  ];

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: theme.palette.background.default
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress 
            size={60} 
            sx={{ 
              color: theme.palette.primary.main,
              mb: 2
            }} 
          />
          <Typography variant="h6" sx={{ color: theme.palette.text.primary, fontFamily: '"Inter", sans-serif' }}>
            Loading your dashboard...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      background: theme.palette.background.default,
      py: 4,
      px: 2
    }}>
      <Container maxWidth="lg">
        {/* Welcome Header */}
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: 600,
              color: theme.palette.text.primary,
              mb: 2,
              fontFamily: '"Alkatra", cursive'
            }}
          >
            Welcome back, {username}!
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: theme.palette.text.secondary,
              opacity: 0.8,
              maxWidth: '600px',
              mx: 'auto',
              fontFamily: '"Inter", sans-serif'
            }}
          >
            Here's what's happening with your projects today
          </Typography>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 6 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                sx={{
                  background: theme.palette.mode === 'dark' 
                    ? `linear-gradient(135deg, ${alpha(stat.color, 0.15)} 0%, ${alpha(stat.color, 0.05)} 100%)`
                    : `linear-gradient(135deg, ${alpha(stat.color, 0.1)} 0%, ${alpha(stat.color, 0.03)} 100%)`,
                  border: `1px solid ${alpha(stat.color, 0.2)}`,
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 8px 25px ${alpha(stat.color, 0.15)}`,
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography 
                        variant="h4" 
                        sx={{ 
                          fontWeight: 800, 
                          color: stat.color, 
                          mb: 1,
                          fontFamily: '"Inter", sans-serif'
                        }}
                      >
                        {stat.value}
                      </Typography>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          color: theme.palette.text.primary, 
                          fontWeight: 600,
                          mb: 0.5,
                          fontFamily: '"Inter", sans-serif'
                        }}
                      >
                        {stat.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: theme.palette.text.secondary,
                          opacity: 0.8,
                          fontFamily: '"Inter", sans-serif'
                        }}
                      >
                        {stat.description}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: 70,
                        height: 70,
                        background: `linear-gradient(135deg, ${stat.color} 0%, ${alpha(stat.color, 0.7)} 100%)`,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: theme.palette.getContrastText(stat.color)
                      }}
                    >
                      {stat.icon}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={4}>
          {/* Projects Section */}
          <Grid item xs={12} md={8}>
            <Card
              sx={{
                borderRadius: 3,
                background: theme.palette.background.paper,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                boxShadow: theme.palette.mode === 'dark' 
                  ? '0 8px 25px rgba(0,0,0,0.3)'
                  : '0 8px 25px rgba(107, 79, 59, 0.08)'
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                      fontFamily: '"Inter", sans-serif'
                    }}
                  >
                    Your Projects
                  </Typography>
                  <Chip 
                    label={`${displayProjects.length} projects`} 
                    variant="outlined"
                    sx={{ 
                      borderColor: theme.palette.primary.main,
                      color: theme.palette.primary.main,
                      fontWeight: 600,
                      fontFamily: '"Inter", sans-serif'
                    }}
                  />
                </Box>

                <Box sx={{ spaceY: 3 }}>
                  {displayProjects.map((project, index) => (
                    <Paper
                      key={project.id || index}
                      sx={{
                        p: 3,
                        borderRadius: 2,
                        background: theme.palette.mode === 'dark'
                          ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`
                          : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
                        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'translateX(8px)',
                          boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.15)}`,
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              fontWeight: 600,
                              color: theme.palette.text.primary,
                              mb: 1,
                              fontFamily: '"Inter", sans-serif'
                            }}
                          >
                            {project.name}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                            <Chip
                              icon={<PeopleIcon />}
                              label={`${project.members} members`}
                              size="small"
                              variant="outlined"
                              sx={{ 
                                borderColor: theme.palette.secondary.main, 
                                color: theme.palette.secondary.main,
                                fontFamily: '"Inter", sans-serif'
                              }}
                            />
                            <Chip
                              label={`${project.progress}% complete`}
                              size="small"
                              sx={{ 
                                background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.2)} 0%, ${alpha(theme.palette.success.main, 0.1)} 100%)`,
                                color: theme.palette.success.main,
                                fontWeight: 600,
                                fontFamily: '"Inter", sans-serif'
                              }}
                            />
                          </Box>
                        </Box>
                        <FolderIcon sx={{ color: theme.palette.primary.main, fontSize: 32 }} />
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions Sidebar */}
          <Grid item xs={12} md={4}>
            <Box sx={{ spaceY: 4 }}>
              {/* Create Project Card */}
              <Card
                sx={{
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0.8)} 100%)`,
                  color: theme.palette.primary.contrastText,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0 12px 35px ${alpha(theme.palette.primary.main, 0.3)}`,
                  }
                }}
              >
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3
                    }}
                  >
                    <CreateNewFolderIcon sx={{ fontSize: 40, color: 'inherit' }} />
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, fontFamily: '"Inter", sans-serif' }}>
                    Start New Project
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 3, fontFamily: '"Inter", sans-serif' }}>
                    Create a new collaborative project and invite your peers
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{
                      background: theme.palette.primary.contrastText,
                      color: theme.palette.primary.main,
                      px: 4,
                      py: 1,
                      borderRadius: '50px',
                      fontWeight: 600,
                      textTransform: 'none',
                      fontFamily: '"Adlam Display", serif',
                      '&:hover': {
                        background: alpha(theme.palette.primary.contrastText, 0.9),
                        transform: 'scale(1.05)',
                      }
                    }}
                    onClick={() => console.log("Create project clicked")}
                  >
                    Create Project
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card
                sx={{
                  borderRadius: 3,
                  background: theme.palette.background.paper,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                      mb: 3,
                      fontFamily: '"Inter", sans-serif'
                    }}
                  >
                    Recent Activity
                  </Typography>
                  <Box sx={{ spaceY: 2 }}>
                    {recentActivities.map((activity, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          py: 2,
                          borderBottom: index < recentActivities.length - 1 ? `1px solid ${alpha(theme.palette.divider, 0.2)}` : 'none'
                        }}
                      >
                        <Avatar 
                          sx={{ 
                            bgcolor: activity.color, 
                            width: 36, 
                            height: 36, 
                            mr: 2,
                            fontSize: '0.8rem'
                          }}
                        >
                          {activity.icon}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 500, 
                              color: theme.palette.text.primary,
                              fontFamily: '"Inter", sans-serif'
                            }}
                          >
                            {activity.action}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: theme.palette.text.secondary,
                              fontFamily: '"Inter", sans-serif'
                            }}
                          >
                            {activity.time}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}