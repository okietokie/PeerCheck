import axiosClient from '@/api/axiosClient';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import FolderIcon from '@mui/icons-material/Folder';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AddIcon from '@mui/icons-material/Add';
import CommentIcon from '@mui/icons-material/Comment';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WarningIcon from '@mui/icons-material/Warning';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import CloseIcon from '@mui/icons-material/Close';
import PlaylistAddCircleIcon from '@mui/icons-material/PlaylistAddCircle';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CircularProgress, 
  Typography,
  Paper,
  Avatar,
  Chip,
  alpha,
  useTheme,
  Container,
  AvatarGroup,
  IconButton,
  Badge,
  LinearProgress,
  Tooltip,
  Snackbar,
  Alert,
  AlertTitle,
  Slide,
  Fade,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import  useInView  from '../../hooks/useInView';
import { calculateProductivity, generateRecentActivities } from '../../utils/dashboardUtils';
import TourGuide from '../TourGuide';
import TodoList from './HelperComp/ToDoList';

const DASHBOARD_CARD_LIMIT = 10;

export default function Dashboard() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { ref, inView } = useInView({ threshold: 0.1 }); 
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [username, setUsername] = useState('');
  const [userData, setUserData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [productivityInsights, setProductivityInsights] = useState({
                                                            score: 0,
                                                            averageEfficiency: 0,
                                                            onTimeRate: 0,
                                                            taskDistribution: {
                                                              completed: 0,
                                                              active: 0,
                                                              paused: 0,
                                                              notStarted: 0,
                                                              highRisk: 0
                                                            },
                                                            recentPerformance: {
                                                              tasksCompleted: 0,
                                                              averageEfficiency: 0,
                                                              totalFocusTime: 0
                                                            },
                                                            // Add these new fields for peer reviews
                                                            peerReviewScore: 0,
                                                            collaborationScore: 0,
                                                            projectEvaluationScore: 0,
                                                            peerReviewCount: 0,
                                                            peerReviewBreakdown: {
                                                              contribution: 0,
                                                              collaboration: 0,
                                                              quality: 0,
                                                              punctuality: 0
                                                            },
                                                            recentPeerReviews: []
                                                          }); 
  // Snackbar states
  const [snackbars, setSnackbars] = useState({
    welcome: false,
    dataLoaded: false,
    refreshComplete: false,
    projectClick: false,
    taskClick: false,
    statsDemo: false,
    activityClick: false,
    quickActionClick: false,
    performanceDemo: false
  });
  const [insightDialog, setInsightDialog] = useState({ open: false, card: null });
  const [productivityGuideOpen, setProductivityGuideOpen] = useState(false);

  // Stats state
  const [stats, setStats] = useState({
    activeProjects: 0,
    activeTasks: 0,
    productivity: 0,
    highPriorityAlerts: 0
  });
  const fetchProductivityData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;

      const response = await axiosClient.get(`user/productivity`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("response prod:", response);

      if (response?.data?.success) {
        const prodData = response?.data?.data?.productivity;
        const recentPerf = response?.data?.data?.recentPerformance;
        console.log("Fetched Productivity Data: ", prodData, recentPerf);
        // all productivity insights at once updated
        setProductivityInsights({
          score: prodData.score || 0,
          averageEfficiency: prodData.averageEfficiency || 0,
          onTimeRate: prodData.onTimeRate || 0,
          taskDistribution: prodData.taskDistribution || {
            completed: 0,
            active: 0,
            paused: 0,
            notStarted: 0,
            highRisk: 0
          },
          recentPerformance: recentPerf || {
            tasksCompleted: 0,
            averageEfficiency: 0,
            totalFocusTime: 0
          },
          // Peer review data
          peerReviewScore: prodData.peerReviewScore || 0,
          collaborationScore: prodData.collaborationScore || 0,
          projectEvaluationScore: prodData.projectEvaluationScore || 0,
          peerReviewCount: prodData.peerReviewCount || 0,
          peerReviewBreakdown: prodData.peerReviewBreakdown || {
            contribution: 0,
            collaboration: 0,
            quality: 0,
            punctuality: 0
          },
          recentPeerReviews: prodData.recentPeerReviews || []
        });

        // Update main stats
        setStats(prev => ({
          ...prev,
          productivity: prodData.score || 0,
          highPriorityAlerts: prodData.highPriorityAlerts || 0,
        }));

        return prodData;
      }
    } catch (error) {
      console.error('Error fetching productivity data:', error);
    }

    return null;
  };



  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      setRefreshing(true);
      
      // Show loading snackbar
      setSnackbars(prev => ({ ...prev, dataLoaded: false }));
      
      // Fetch user details
      const userRes = await axiosClient.get("user/me", { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      setUsername(userRes.data.username || userRes.data.user?.username || 'User');
      setUserData(userRes.data.user);
      
      // Show welcome snackbar on first load
      if (loading && !snackbars.welcome) {
        setTimeout(() => {
          setSnackbars(prev => ({ ...prev, welcome: true }));
        }, 1000);
      }
      
      // Fetch projects from backend
      try {
        let fetchedProjects = [];

        const projectsRes = await axiosClient.get("projects", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (Array.isArray(projectsRes.data)) {
          fetchedProjects = projectsRes.data;
        } else if (projectsRes.data?.projects) {
          fetchedProjects = projectsRes.data.projects;
        } else if (projectsRes.data?.data) {
          fetchedProjects = projectsRes.data.data;
        }

        setProjects(fetchedProjects);
        setStats(prev => ({
          ...prev,
          activeProjects: fetchedProjects.filter(p => p.status === 'active' || p.status === 'ongoing').length
        }));
        console.log("Fetched Projects: ", fetchedProjects);

      } catch (projectsErr) {
        console.error("Error fetching projects:", projectsErr);
        // Fallback to user projects from user/me endpoint
        setProjects(userRes.data.userProjects || []);
      }

      let localProductivity = null;

      // Fetch tasks
      try {
        const tasksRes = await axiosClient.get("user/tasks/all", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (tasksRes.data.success) {
          const userTasks = tasksRes.data.tasks || [];
          setTasks(userTasks);
          
          // Calculate stats
          const activeTasks = userTasks.filter(t => t.status === 'active' || t.status==='paused').length;
          const highPriorityAlerts = userTasks.filter(t => 
            (t.metrics?.riskScore >= 4 || t.flags?.manualReviewRequired) && 
            t.status !== 'completed'
          ).length;
          
          localProductivity = calculateProductivity(userTasks);

          setStats(prev => ({
            ...prev,
            activeTasks,
            highPriorityAlerts
          }));

          // Generate activities from tasks
          generateRecentActivities(userTasks);
        }
      } catch (tasksErr) {
        console.error("Error fetching tasks:", tasksErr);
        setTasks([]);
      }

      const productivityData = await fetchProductivityData();
      if (!productivityData && localProductivity !== null) {
        setStats(prev => ({
          ...prev,
          productivity: localProductivity
        }));
      }


      // Show data loaded snackbar
      setSnackbars(prev => ({ ...prev, dataLoaded: true }));

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  const generateRecentActivities = (userTasks) => {
    if (!userTasks || userTasks.length === 0) {
      setRecentActivities([]);
      return;
    }

    const activities = userTasks
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 4)
      .map(task => ({
        id: task._id,
        action: getTaskActivityMessage(task),
        details: task.taskTitle,
        timestamp: task.updatedAt || task.createdAt,
        priority: task.metrics?.riskScore >= 4 ? 'high' : 'medium'
      }));

    setRecentActivities(activities);
  };

  const getTaskActivityMessage = (task) => {
    if (task.status === 'completed') return 'Task completed';
    if (task.status === 'active') return 'Task started';
    if (task.flags?.manualReviewRequired) return 'Review required';
    return 'Task updated';
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';
    const now = new Date();
    const past = new Date(timestamp);
    const diff = now - past;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getProjectHealthColor = (healthScore) => {
    if (!healthScore) return theme.palette.info.main;
    if (healthScore >= 80) return theme.palette.success.main;
    if (healthScore >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return theme.palette.error.main;
      case 'medium': return theme.palette.warning.main;
      case 'low': return theme.palette.success.main;
      default: return theme.palette.info.main;
    }
  };

  const handleCreateProject = () => {
    setSnackbars(prev => ({ ...prev, quickActionClick: true }));
    setTimeout(() => {
      navigate('/user-app/projects?create=true');
    }, 300);
  };

  const handleViewTasks = () => {
    setSnackbars(prev => ({ ...prev, taskClick: true }));
    setTimeout(() => {
      navigate('/user-app/tasks');
    }, 300);
  };

  const handleViewProject = (projectId) => {
    setSnackbars(prev => ({ ...prev, projectClick: true }));
    setTimeout(() => {
      navigate(`/user-app/my-project/${projectId}`);
    }, 300);
  };

  const handleViewAllProjects = () => {
    navigate('/user-app/projects');
  };

  const openInsightDialog = (card) => {
    setInsightDialog({ open: true, card });
  };

  const closeInsightDialog = () => {
    setInsightDialog({ open: false, card: null });
  };

  const openProductivityGuide = () => {
    setProductivityGuideOpen(true);
  };

  const closeProductivityGuide = () => {
    setProductivityGuideOpen(false);
  };

  const handleStatsDemo = () => {
    setSnackbars(prev => ({ ...prev, statsDemo: true }));
  };

  const handleActivityClick = () => {
    setSnackbars(prev => ({ ...prev, activityClick: true }));
  };

  const handlePerformanceDemo = () => {
    setSnackbars(prev => ({ ...prev, performanceDemo: true }));
  };

  const handleRefresh = () => {
    fetchDashboardData();
    setSnackbars(prev => ({ ...prev, refreshComplete: true }));
  };

  const handleCloseSnackbar = (snackbar) => {
    setSnackbars(prev => ({ ...prev, [snackbar]: false }));
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

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

  const formatInsightDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const activeProjectList = projects.filter(p => p.status === 'active' || p.status === 'ongoing');
  const activeTaskList = tasks.filter(t => t.status === 'active' || t.status === 'paused');
  const highAlertTaskList = tasks
    .filter(t => (t.metrics?.riskScore >= 4 || t.flags?.manualReviewRequired) && t.status !== 'completed')
    .sort((a, b) => (b.metrics?.riskScore || 0) - (a.metrics?.riskScore || 0));
  const recentlyUpdatedProjects = [...projects]
    .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
    .slice(0, DASHBOARD_CARD_LIMIT);
  const inProgressTasks = [...activeTaskList]
    .sort((a, b) => new Date(a.deadline || 0) - new Date(b.deadline || 0))
    .slice(0, DASHBOARD_CARD_LIMIT);

  return (
    <>
      <Box 
        ref={ref}
        sx={{
          minHeight: '100vh',
          background: theme.palette.background.default,
          py: 4,
          px: { xs: 1.5, sm: 2 }
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2 } }}>
          {/* Header */}
          <Box 
          className="dashboard-header"
          sx={{ 
            mb: 5, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Box>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                  mb: 0.5,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'inline-block'
                }}
              >
                Welcome back, {username}!
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: theme.palette.text.secondary,
                  opacity: 0.8,
                  fontFamily: '"Inter", sans-serif',
                  fontWeight: 400
                }}
              >
                Here's your daily overview
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<TrendingUpIcon />}
                onClick={openProductivityGuide}
                sx={{
                  borderRadius: 3,
                  px: 2.25,
                  py: 1.2,
                  fontWeight: 600,
                  borderColor: alpha(theme.palette.success.main, 0.28),
                  color: theme.palette.success.main,
                  backgroundColor: alpha(theme.palette.success.main, 0.04),
                  '&:hover': {
                    borderColor: alpha(theme.palette.success.main, 0.42),
                    backgroundColor: alpha(theme.palette.success.main, 0.09),
                    transform: 'translateY(-1px)',
                  }
                }}
              >
                What does my productivity score mean?
              </Button>
              <Tooltip title="Refresh Dashboard">
                <IconButton 
                  onClick={handleRefresh}
                  disabled={refreshing}
                  sx={{
                    width: 48,
                    height: 48,
                    background: alpha(theme.palette.primary.main, 0.1),
                    borderRadius: 3,
                    '&:hover': {
                      background: alpha(theme.palette.primary.main, 0.2),
                    }
                  }}
                >
                  {refreshing ? (
                    <CircularProgress size={20} />
                  ) : (
                    <AccessTimeIcon />
                  )}
                </IconButton>
              </Tooltip>
              
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateProject}
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  color: 'white',
                  borderRadius: 3,
                  px: 3,
                  py: 1.2,
                  fontWeight: 600,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`
                  }
                }}
              >
                New Project
              </Button>
            </Box>
          </Box>

          {/* Stats Cards */}
          <Box 
          className="stats-cards-section" 
          sx={{ 
            mb: 5,
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
            gap: 2.5,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -10,
              left: -10,
              right: -10,
              bottom: -10,
              background: `linear-gradient(135deg, 
                ${alpha(theme.palette.primary.main, 0.03)} 0%, 
                ${alpha(theme.palette.secondary.main, 0.02)} 50%, 
                ${alpha(theme.palette.background.paper, 0.01)} 100%)`,
              borderRadius: 3,
              zIndex: 0,
            }
          }}>
            {[
              {
                id: 'projects',
                title: 'Active Projects',
                value: stats.activeProjects,
                icon: <FolderIcon fontSize="small" />,
                color: theme.palette.primary.main,
                gradient: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)}, ${alpha(theme.palette.primary.main, 0.05)})`,
                hoverGradient: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.primary.main, 0.1)})`,
                subtitle: `${projects.filter(p => p.status === 'completed').length} completed`,
                progress: projects.length > 0 ? (stats.activeProjects / projects.length) * 100 : 0,
                onClick: () => openInsightDialog('projects')
              },
              {
                id: 'tasks',
                title: 'Tasks In Progress',
                value: stats.activeTasks,
                icon: <PlayCircleIcon fontSize="small" />,
                color: theme.palette.info.main,
                gradient: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.12)}, ${alpha(theme.palette.info.main, 0.04)})`,
                hoverGradient: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.18)}, ${alpha(theme.palette.info.main, 0.08)})`,
                subtitle: `${tasks.filter(t => t.status === 'completed').length} completed`,
                progress: tasks.length > 0 ? (stats.activeTasks / tasks.length) * 100 : 0,
                onClick: () => openInsightDialog('tasks')
              },
              {
                id: 'productivity',
                title: 'Productivity',
                value: `${stats.productivity}%`,
                icon: <TrendingUpIcon fontSize="small" />,
                color: theme.palette.success.main,
                gradient: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.12)}, ${alpha(theme.palette.success.main, 0.04)})`,
                hoverGradient: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.18)}, ${alpha(theme.palette.success.main, 0.08)})`,
                subtitle: stats.productivity > 80 ? 'On track' : 'Needs boost',
                progress: stats.productivity,
                onClick: () => openInsightDialog('productivity')
              },
              {
                id: 'alerts',
                title: 'Alerts',
                value: stats.highPriorityAlerts,
                icon: <WarningIcon fontSize="small" />,
                color: theme.palette.error.main,
                gradient: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.12)}, ${alpha(theme.palette.error.main, 0.04)})`,
                hoverGradient: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.18)}, ${alpha(theme.palette.error.main, 0.08)})`,
                subtitle: 'Require attention',
                progress: stats.highPriorityAlerts > 0 ? Math.min(100, stats.highPriorityAlerts * 20) : 0,
                onClick: () => openInsightDialog('alerts')
              }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Paper
                  elevation={0}
                  onClick={stat.onClick}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    background: stat.gradient,
                    border: `1.5px solid ${alpha(stat.color, 0.15)}`,
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      background: stat.hoverGradient,
                      border: `1.5px solid ${alpha(stat.color, 0.25)}`,
                      boxShadow: `0 8px 24px ${alpha(stat.color, 0.15)}`,
                      '& .stat-icon-wrapper': {
                        transform: 'scale(1.1) rotate(5deg)',
                      },
                      '& .stat-value': {
                        textShadow: `0 0 20px ${alpha(stat.color, 0.3)}`,
                      }
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: `linear-gradient(90deg, ${stat.color}, ${alpha(stat.color, 0.7)})`,
                      borderRadius: '3px 3px 0 0',
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: -20,
                      right: -20,
                      width: 60,
                      height: 60,
                      background: `radial-gradient(circle, ${alpha(stat.color, 0.08)} 0%, transparent 70%)`,
                      borderRadius: '50%',
                    }
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    mb: 1.5,
                    position: 'relative',
                    zIndex: 1
                  }}>
                    <Box 
                      className="stat-icon-wrapper"
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: alpha(stat.color, 0.1),
                        border: `1px solid ${alpha(stat.color, 0.2)}`,
                        transition: 'all 0.3s ease',
                        boxShadow: `0 4px 12px ${alpha(stat.color, 0.1)}`,
                      }}
                    >
                      <Box sx={{ 
                        color: stat.color,
                        fontSize: 22,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        {stat.icon}
                      </Box>
                    </Box>
                    
                    <Typography 
                      className="stat-value"
                      variant="h3"
                      sx={{
                        fontFamily: '"Alkatra", cursive',
                        fontWeight: 700,
                        fontSize: { xs: '2rem', sm: '2.5rem' },
                        color: stat.color,
                        lineHeight: 1,
                        transition: 'all 0.3s ease',
                        background: `linear-gradient(45deg, ${stat.color}, ${alpha(stat.color, 0.8)})`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: `0 0 10px ${alpha(stat.color, 0.2)}`,
                      }}
                    >
                      {stat.value}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    position: 'relative',
                    zIndex: 1
                  }}>
                    <Box sx={{
                      flexShrink: 0,
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      backgroundColor: stat.color,
                      boxShadow: `0 0 8px ${alpha(stat.color, 0.5)}`,
                    }} />
                    
                    <Typography 
                      variant="h6"
                      sx={{
                        fontFamily: '"Adlam Display", serif',
                        fontWeight: 500,
                        color: theme.palette.mode === 'dark' ? alpha('#fff', 0.9) : alpha('#000', 0.8),
                        letterSpacing: '0.5px',
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                      }}
                    >
                      {stat.title}
                    </Typography>
                  </Box>
                  
                  <Typography 
                    variant="caption"
                    sx={{
                      display: 'block',
                      mt: 0.5,
                      ml: 2,
                      color: theme.palette.mode === 'dark' ? alpha('#fff', 0.6) : alpha('#000', 0.6),
                      fontFamily: '"Inter", sans-serif',
                      fontWeight: 300,
                      fontSize: '0.75rem',
                      letterSpacing: '0.3px',
                    }}
                  >
                    {stat.subtitle}
                  </Typography>
                  
                  {/* Progress indicator */}
                  <Box sx={{
                    mt: 2,
                    height: 2,
                    background: alpha(theme.palette.mode === 'dark' ? '#fff' : '#000', 0.1),
                    borderRadius: 1,
                    overflow: 'hidden',
                    position: 'relative',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      height: '100%',
                      width: `${Math.min(100, stat.progress)}%`,
                      background: `linear-gradient(90deg, ${alpha(stat.color, 0.6)}, ${stat.color})`,
                      borderRadius: 1,
                      transition: 'width 0.8s ease',
                    }
                  }} />
                </Paper>
              </motion.div>
            ))}
          </Box>

          <Dialog
            open={insightDialog.open}
            onClose={closeInsightDialog}
            fullWidth
            maxWidth="md"
            PaperProps={{
              sx: {
                borderRadius: 4,
                overflow: 'hidden',
                background: `linear-gradient(180deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.background.default, 0.98)} 100%)`,
                border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
              }
            }}
          >
            <DialogTitle sx={{ pb: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    {insightDialog.card === 'projects' && 'Active Projects Overview'}
                    {insightDialog.card === 'tasks' && 'Tasks In Progress Overview'}
                    {insightDialog.card === 'productivity' && 'Productivity Overview'}
                    {insightDialog.card === 'alerts' && 'Alerts Overview'}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.75, color: theme.palette.text.secondary, maxWidth: 680 }}>
                    {insightDialog.card === 'projects' && 'This shows the latest 10 project updates so your dashboard stays useful even when your project list grows.'}
                    {insightDialog.card === 'tasks' && 'This shows the latest 10 in-progress tasks, sorted by what needs attention sooner.'}
                    {insightDialog.card === 'productivity' && 'This summarizes your current momentum using completion, efficiency, peer review, and on-time performance signals.'}
                    {insightDialog.card === 'alerts' && 'This focuses on the most urgent task alerts so you can triage issues quickly.'}
                  </Typography>
                </Box>
                <IconButton onClick={closeInsightDialog} sx={{ mt: -0.5, mr: -1 }}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent dividers sx={{ px: { xs: 2, sm: 3 }, py: 3 }}>
              {insightDialog.card === 'projects' && (
                <Stack spacing={2.5}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
                    <Paper sx={{ p: 2.25, borderRadius: 3, backgroundColor: alpha(theme.palette.primary.main, 0.06), border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}` }}>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Active projects</Typography>
                      <Typography variant="h4" sx={{ mt: 0.8, fontWeight: 700 }}>{stats.activeProjects}</Typography>
                    </Paper>
                    <Paper sx={{ p: 2.25, borderRadius: 3, backgroundColor: alpha(theme.palette.success.main, 0.06), border: `1px solid ${alpha(theme.palette.success.main, 0.12)}` }}>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Completed projects</Typography>
                      <Typography variant="h4" sx={{ mt: 0.8, fontWeight: 700 }}>{projects.filter(p => p.status === 'completed').length}</Typography>
                    </Paper>
                    <Paper sx={{ p: 2.25, borderRadius: 3, backgroundColor: alpha(theme.palette.info.main, 0.06), border: `1px solid ${alpha(theme.palette.info.main, 0.12)}` }}>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Visible projects</Typography>
                      <Typography variant="h4" sx={{ mt: 0.8, fontWeight: 700 }}>{projects.length}</Typography>
                    </Paper>
                  </Box>
                  <Paper sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.12)}` }}>
                    <Typography variant="subtitle1" fontWeight={700}>Latest 10 project updates</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, mb: 2, color: theme.palette.text.secondary }}>
                      Sorted by the most recently updated projects.
                    </Typography>
                    <Stack spacing={1.25}>
                      {recentlyUpdatedProjects.map((project) => (
                        <Paper
                          key={project._id}
                          onClick={() => handleViewProject(project._id)}
                          sx={{ p: 1.6, borderRadius: 2.5, cursor: 'pointer', border: `1px solid ${alpha(theme.palette.divider, 0.12)}`, '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.04) } }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'center' }}>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography fontWeight={700} noWrap>{project.projectName}</Typography>
                              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                Updated {formatInsightDate(project.updatedAt || project.createdAt)} • {project.teamName || 'No team'}
                              </Typography>
                            </Box>
                            <Chip size="small" label={`${Math.round(project.progress || 0)}%`} sx={{ fontWeight: 700 }} />
                          </Box>
                        </Paper>
                      ))}
                    </Stack>
                  </Paper>
                </Stack>
              )}

              {insightDialog.card === 'tasks' && (
                <Stack spacing={2.5}>
                  <Paper sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.12)}` }}>
                    <Typography variant="subtitle1" fontWeight={700}>Task flow snapshot</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, mb: 1.75, color: theme.palette.text.secondary }}>
                      This bar shows how many of your visible tasks are currently in progress or paused.
                    </Typography>
                    <LinearProgress variant="determinate" value={tasks.length > 0 ? (stats.activeTasks / tasks.length) * 100 : 0} sx={{ height: 10, borderRadius: 999 }} />
                    <Typography variant="caption" sx={{ display: 'block', mt: 1, color: theme.palette.text.secondary }}>
                      {stats.activeTasks} active tasks out of {tasks.length} total tasks
                    </Typography>
                  </Paper>
                  <Paper sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.12)}` }}>
                    <Typography variant="subtitle1" fontWeight={700}>Latest 10 in-progress tasks</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, mb: 2, color: theme.palette.text.secondary }}>
                      Sorted by deadline so nearer work surfaces first.
                    </Typography>
                    <Stack spacing={1.25}>
                      {inProgressTasks.map((task) => (
                        <Paper
                          key={task._id}
                          onClick={handleViewTasks}
                          sx={{ p: 1.7, borderRadius: 2.5, cursor: 'pointer', border: `1px solid ${alpha(theme.palette.divider, 0.12)}`, '&:hover': { backgroundColor: alpha(theme.palette.info.main, 0.04) } }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'flex-start' }}>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography fontWeight={700} noWrap>{task.taskTitle}</Typography>
                              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mt: 0.25 }}>
                                {task.assignedTo?.name || 'Unassigned'} • Due {formatInsightDate(task.deadline)}
                              </Typography>
                            </Box>
                            <Chip size="small" label={task.status?.replace('_', ' ') || 'task'} color="info" variant="outlined" />
                          </Box>
                        </Paper>
                      ))}
                    </Stack>
                  </Paper>
                </Stack>
              )}

              {insightDialog.card === 'productivity' && (
                <Stack spacing={2.5}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 2 }}>
                    <Paper sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.12)}` }}>
                      <Typography variant="subtitle1" fontWeight={700}>Overall productivity</Typography>
                      <Typography variant="h3" sx={{ mt: 1.2, mb: 1.2, fontWeight: 700 }}>{stats.productivity}%</Typography>
                      <LinearProgress variant="determinate" value={stats.productivity} sx={{ height: 10, borderRadius: 999 }} />
                    </Paper>
                    <Paper sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.12)}` }}>
                      <Typography variant="subtitle1" fontWeight={700}>Key signals</Typography>
                      <Typography variant="body2" sx={{ mt: 1, color: theme.palette.text.secondary }}>
                        Efficiency {Math.round(productivityInsights.averageEfficiency || 0)}% • On-time rate {Math.round(productivityInsights.onTimeRate || 0)}% • Collaboration {Math.round(productivityInsights.collaborationScore || 0)}%
                      </Typography>
                    </Paper>
                  </Box>
                  <Paper sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.12)}` }}>
                    <Typography variant="subtitle1" fontWeight={700}>Recent performance</Typography>
                    <Stack spacing={1}>
                      <Typography variant="body2">Tasks completed recently: {productivityInsights.recentPerformance?.tasksCompleted || 0}</Typography>
                      <Typography variant="body2">Average efficiency: {Math.round(productivityInsights.recentPerformance?.averageEfficiency || productivityInsights.averageEfficiency || 0)}%</Typography>
                      <Typography variant="body2">Peer review score: {Math.round(productivityInsights.peerReviewScore || 0)}%</Typography>
                    </Stack>
                  </Paper>
                </Stack>
              )}

              {insightDialog.card === 'alerts' && (
                <Stack spacing={2.5}>
                  <Paper sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.12)}` }}>
                    <Typography variant="subtitle1" fontWeight={700}>High priority alerts</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, mb: 2, color: theme.palette.text.secondary }}>
                      Only the latest 10 urgent items are shown here.
                    </Typography>
                    <Stack spacing={1.25}>
                      {highAlertTaskList.slice(0, DASHBOARD_CARD_LIMIT).map((task) => (
                        <Paper
                          key={task._id}
                          onClick={handleViewTasks}
                          sx={{ p: 1.7, borderRadius: 2.5, cursor: 'pointer', border: `1px solid ${alpha(theme.palette.error.main, 0.14)}`, backgroundColor: alpha(theme.palette.error.main, 0.04), '&:hover': { backgroundColor: alpha(theme.palette.error.main, 0.08) } }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'flex-start' }}>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                              <Typography fontWeight={700} noWrap>{task.taskTitle}</Typography>
                              <Typography variant="body2" sx={{ mt: 0.5 }}>
                                {task.flags?.manualReviewRequired ? 'Requires manual review.' : `Risk score is ${task.metrics?.riskScore || 0}, so this task needs attention.`}
                              </Typography>
                            </Box>
                            <Chip size="small" color="error" label={`Risk ${task.metrics?.riskScore || 0}`} />
                          </Box>
                        </Paper>
                      ))}
                      {highAlertTaskList.length === 0 && (
                        <Alert severity="success">No high priority alerts right now.</Alert>
                      )}
                    </Stack>
                  </Paper>
                </Stack>
              )}
            </DialogContent>
          </Dialog>

          <Dialog
            open={productivityGuideOpen}
            onClose={closeProductivityGuide}
            fullWidth
            maxWidth="md"
            PaperProps={{
              sx: {
                borderRadius: 4,
                overflow: 'hidden',
                background: `linear-gradient(180deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.background.default, 0.98)} 100%)`,
                border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
              }
            }}
          >
            <DialogTitle sx={{ pb: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    What Does My Productivity Score Mean?
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.75, color: theme.palette.text.secondary, maxWidth: 680 }}>
                    Your productivity score is a personal performance snapshot. It looks at how well you work, how reliable your work patterns are, and how others experience your contribution.
                  </Typography>
                </Box>
                <IconButton onClick={closeProductivityGuide} sx={{ mt: -0.5, mr: -0.5 }}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ pt: 1, pb: 3 }}>
              <Stack spacing={2.25}>
                <Paper sx={{ p: 2.5, borderRadius: 3, background: alpha(theme.palette.primary.main, 0.04), border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    How the score is built
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, color: theme.palette.text.secondary }}>
                    Your overall productivity combines four signals. Task efficiency matters most, then peer feedback, then project evaluation, then whether completed work finishes on time.
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, gap: 1.5, mt: 2 }}>
                    {[
                      { label: 'Overall Task Efficiency', value: '40%', color: theme.palette.primary.main },
                      { label: 'Peer Review Score', value: '30%', color: theme.palette.info.main },
                      { label: 'Project Evaluation Score', value: '20%', color: theme.palette.secondary.main },
                      { label: 'On-Time Completion Rate', value: '10%', color: theme.palette.warning.main }
                    ].map((item) => (
                      <Paper key={item.label} sx={{ p: 1.6, borderRadius: 2.5, border: `1px solid ${alpha(item.color, 0.14)}`, backgroundColor: alpha(item.color, 0.05) }}>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                          {item.label}
                        </Typography>
                        <Typography variant="h5" fontWeight={700} sx={{ mt: 0.4, color: item.color }}>
                          {item.value}
                        </Typography>
                      </Paper>
                    ))}
                  </Box>
                </Paper>

                <Paper sx={{ p: 2.5, borderRadius: 3, background: alpha(theme.palette.success.main, 0.04), border: `1px solid ${alpha(theme.palette.success.main, 0.1)}` }}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    What the system is really checking
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, color: theme.palette.text.secondary }}>
                    The score is not just counting completed tasks. It is trying to reflect the quality of your work, your consistency, your accountability, your collaboration with others, your work integrity, and your deadline discipline.
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1.25, color: theme.palette.text.secondary }}>
                    Larger tasks carry more weight than tiny ones, so finishing one serious task well can matter more than quickly clearing several very small tasks.
                  </Typography>
                </Paper>

                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
                  <Paper sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${alpha(theme.palette.success.main, 0.12)}`, backgroundColor: alpha(theme.palette.success.main, 0.04) }}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ color: theme.palette.success.main }}>
                      Your score improves when you
                    </Typography>
                    <Stack spacing={1} sx={{ mt: 1.5 }}>
                      {[
                        'complete tasks properly instead of leaving them half-done',
                        'stay reasonably close to the estimated work time',
                        'submit proof or evidence when work is finished',
                        'finish before the deadline or stay on track',
                        'contribute well inside your team',
                        'receive strong peer and mentor feedback'
                      ].map((item) => (
                        <Typography key={item} variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          {'\u2705'} {item}
                        </Typography>
                      ))}
                    </Stack>
                  </Paper>

                  <Paper sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${alpha(theme.palette.warning.main, 0.14)}`, backgroundColor: alpha(theme.palette.warning.main, 0.04) }}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ color: theme.palette.warning.dark }}>
                      Your score drops when you
                    </Typography>
                    <Stack spacing={1} sx={{ mt: 1.5 }}>
                      {[
                        'rush tasks unrealistically',
                        'log suspiciously high time for small work',
                        'miss deadlines',
                        'avoid uploading proof when proof is expected',
                        'show work patterns that look unreliable or risky',
                        'receive weak collaboration or contribution feedback'
                      ].map((item) => (
                        <Typography key={item} variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          {'\u26A0\uFE0F'} {item}
                        </Typography>
                      ))}
                    </Stack>
                  </Paper>
                </Box>

                <Paper sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${alpha(theme.palette.info.main, 0.12)}`, backgroundColor: alpha(theme.palette.info.main, 0.04) }}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    In simple terms
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1, color: theme.palette.text.secondary }}>
                    A high productivity score usually means you are completing meaningful work in a believable, timely, and collaborative way. A lower score usually means the system is seeing missed deadlines, weak evidence, risky work patterns, or poor feedback from others.
                  </Typography>
                </Paper>
              </Stack>
            </DialogContent>
          </Dialog>

          {/* Main Content Area */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', lg: 'row' }, 
            gap: 4 
          }}>
            {/* Left Column - Projects & Activity */}
            <Box sx={{ flex: 1 }}>
              {/* Projects Section */}
              <Card
                className='projects-section'
                sx={{
                  borderRadius: 3,
                  background: theme.palette.background.paper,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
                  mb: 4
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ 
                    p: 3, 
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box sx={{
                        width: 40,
                        height: 40,
                        background: alpha(theme.palette.primary.main, 0.1),
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: theme.palette.primary.main
                      }}>
                        <FolderIcon sx={{ fontSize: 20 }} />
                      </Box>
                      <Typography variant="h6" fontWeight="600">
                        Your Projects
                      </Typography>
                    </Box>
                    <Chip 
                      label={`${projects.length} total`}
                      size="small"
                      sx={{ 
                        background: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        fontWeight: 500
                      }}
                    />
                  </Box>
                  
                  {projects.length > 0 ? (
                    <Box sx={{ p: 3, pt: 2 }}>
                      {projects.slice(0, 3).map((project, index) => (
                        <Paper
                          key={project._id || index}
                          sx={{
                            p: 3,
                            mb: 2,
                            borderRadius: 2,
                            background: theme.palette.mode === 'dark'
                              ? alpha(theme.palette.background.paper, 0.5)
                              : alpha(theme.palette.background.default, 0.5),
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            transition: 'all 0.2s ease',
                            cursor: 'pointer',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
                              borderColor: alpha(theme.palette.primary.main, 0.3)
                            }
                          }}
                          onClick={() => handleViewProject(project._id)}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 1 }}>
                                {project.projectName}
                              </Typography>
                              
                              {project.description && (
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                  {project.description.length > 100 
                                    ? `${project.description.substring(0, 100)}...` 
                                    : project.description}
                                </Typography>
                              )}
                              
                              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                                {project.status && (
                                  <Chip
                                    label={project.status.replace('_', ' ').toUpperCase()}
                                    size="small"
                                    sx={{
                                      background: project.status === 'completed' 
                                        ? alpha(theme.palette.success.main, 0.1)
                                        : project.status === 'active' || project.status === 'ongoing'
                                          ? alpha(theme.palette.primary.main, 0.1)
                                          : alpha(theme.palette.warning.main, 0.1),
                                      color: project.status === 'completed' 
                                        ? theme.palette.success.main
                                        : project.status === 'active' || project.status === 'ongoing'
                                          ? theme.palette.primary.main
                                          : theme.palette.warning.main,
                                      fontWeight: 500
                                    }}
                                  />
                                )}
                                
                                {project.teamName && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <PeopleIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
                                    <Typography variant="caption" color="text.secondary">
                                      {project.teamName}
                                    </Typography>
                                  </Box>
                                )}
                                
                                {project.endDate && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <CalendarTodayIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
                                    <Typography variant="caption" color="text.secondary">
                                      Due: {new Date(project.endDate).toLocaleDateString('en-US', { 
                                        month: 'short', 
                                        day: 'numeric' 
                                      })}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                              
                              {/* Progress Bar if available */}
                              {(project.progress || project.metrics?.healthScore) && (
                                <Box sx={{ mt: 2 }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="caption" color="text.secondary">
                                      Progress
                                    </Typography>
                                    <Typography variant="caption" fontWeight="600" color="primary.main">
                                      {project.progress || project.metrics?.healthScore || 0}%
                                    </Typography>
                                  </Box>
                                  <LinearProgress
                                    variant="determinate"
                                    value={project.progress || project.metrics?.healthScore || 0}
                                    sx={{
                                      height: 4,
                                      borderRadius: 2,
                                      backgroundColor: alpha(theme.palette.divider, 0.2),
                                      '& .MuiLinearProgress-bar': {
                                        borderRadius: 2,
                                        background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                      }
                                    }}
                                  />
                                </Box>
                              )}
                            </Box>
                            
                            {project.teamId?.members && project.teamId.members.length > 0 && (
                              <AvatarGroup max={3} sx={{ ml: 2 }}>
                                {project.teamId.members.slice(0, 3).map((member, idx) => (
                                  <Tooltip title={`${member.name}`} >
                                                                      <Avatar
                                    src={member.avatar}
                                    key={idx}
                                    sx={{
                                      width: 32,
                                      height: 32,
                                      ml: idx === 0 ? 0 : -1,
                                      border: `2px solid ${theme.palette.background.paper}`,
                                      transition: "transform 0.2s, box-shadow 0.2s",
                                      cursor: "pointer",
                                      "&:hover": {
                                        zIndex: 10,
                                        transform: "scale(1.15)",
                                        boxShadow: theme.shadows[4],
                                      }
                                    }}
                                  >
                                    {member.avatar || member.name?.charAt(0) || member.username?.charAt(0) || 'U'}
                                  </Avatar>
                                  </Tooltip>
                                ))}
                              </AvatarGroup>
                            )}
                          </Box>
                        </Paper>
                      ))}
                      
                      {projects.length > 3 && (
                        <Box sx={{ textAlign: 'center', pt: 1 }}>
                          <Button 
                            variant="text" 
                            onClick={handleViewAllProjects}
                            sx={{
                              color: theme.palette.primary.main,
                              fontWeight: 500,
                              '&:hover': {
                                background: alpha(theme.palette.primary.main, 0.1)
                              }
                            }}
                          >
                            View all {projects.length} projects →
                          </Button>
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                      <FolderIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2, opacity: 0.5 }} />
                      <Typography variant="body1" color="text.secondary" gutterBottom>
                        No projects yet
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Create your first project to get started
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleCreateProject}
                        sx={{ 
                          borderRadius: 2,
                          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                          color: 'white'
                        }}
                      >
                        Create Project
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card
                className="recent-activity-section" 
                sx={{
                  borderRadius: 3,
                  background: theme.palette.background.paper,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.04)'
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <Box sx={{
                      width: 40,
                      height: 40,
                      background: alpha(theme.palette.info.main, 0.1),
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: theme.palette.info.main
                    }}>
                      <CommentIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Typography variant="h6" fontWeight="600">
                      Recent Activity
                    </Typography>
                  </Box>
                  
                  {recentActivities.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {recentActivities.map((activity, index) => (
                        <Paper
                          key={activity.id || index}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            background: alpha(theme.palette.action.hover, 0.3),
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            transition: 'all 0.2s ease',
                            cursor: 'pointer',
                            '&:hover': {
                              background: alpha(theme.palette.action.hover, 0.5),
                              transform: 'translateX(4px)'
                            }
                          }}
                          onClick={handleActivityClick}
                        >
                          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                            <Avatar 
                              sx={{ 
                                bgcolor: getPriorityColor(activity.priority), 
                                width: 32, 
                                height: 32,
                                fontWeight: 600,
                                fontSize: 12
                              }}
                            >
                              {activity.action.charAt(0)}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontWeight: 500, 
                                  color: theme.palette.text.primary,
                                  mb: 0.5
                                }}
                              >
                                {activity.action}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: theme.palette.text.secondary,
                                  display: 'block',
                                  mb: 1
                                }}
                              >
                                {activity.details}
                              </Typography>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Chip
                                  label={activity.priority.toUpperCase()}
                                  size="small"
                                  sx={{
                                    background: alpha(getPriorityColor(activity.priority), 0.1),
                                    color: getPriorityColor(activity.priority),
                                    fontWeight: 500,
                                    fontSize: '0.7rem'
                                  }}
                                />
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    color: theme.palette.text.secondary,
                                  }}
                                >
                                  {formatTimeAgo(activity.timestamp)}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Paper>
                      ))}
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <CommentIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 2, opacity: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        No recent activity
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>

            </Box>

            {/* Right Column - Quick Actions & Insights */}
            <Box sx={{ width: { xs: '100%', lg: 360 } }}>
              {/* Quick Actions Card */}
              <Card
                className='quick-actions-section'
                sx={{
                  borderRadius: 3,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  color: 'white',
                  mb: 4
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <Box sx={{
                      width: 40,
                      height: 40,
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <AddIcon />
                    </Box>
                    <Typography variant="h6" fontWeight="600">
                      Quick Actions
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Tooltip title="Create a project to create tasks" disableFocusListener={projects.length === 0}>
                      <span>
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => {
                            setSnackbars(prev => ({ ...prev, quickActionClick: true }));
                            setTimeout(() => navigate('/user-app/tasks?create=true'), 300);
                          }}
                          disabled={projects.length === 0}
                          sx={{
                            background: 'white',
                            color: theme.palette.primary.main,
                            borderRadius: 2,
                            width: '100%',
                            py: 1.5,
                            fontWeight: 600,
                            '&:hover': {
                              background: alpha('#fff', 0.9),
                              transform: 'translateY(-1px)'
                            }
                          }}
                        >
                          Create New Task
                        </Button>
                      </span>
                    </Tooltip>
                    
                    
                    <Button
                      variant="outlined"
                      startIcon={<GroupAddIcon />}
                      onClick={() => {
                        setSnackbars(prev => ({ ...prev, quickActionClick: true }));
                        setTimeout(() => navigate('/user-app/peerteams'), 300);
                      }}
                      sx={{
                        borderColor: 'rgba(255,255,255,0.3)',
                        color: 'white',
                        borderRadius: 2,
                        py: 1.5,
                        '&:hover': {
                          borderColor: 'white',
                          background: 'rgba(255,255,255,0.1)'
                        }
                      }}
                    >
                      Invite Team Members
                    </Button>
                  </Box>
                </CardContent>
              </Card>

              {/* Performance Insights */}
              <Card
                className='performance-section'
                sx={{
                  borderRadius: 3,
                  background: theme.palette.background.paper,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.04)'
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <Box sx={{
                      width: 40,
                      height: 40,
                      background: alpha(theme.palette.success.main, 0.1),
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: theme.palette.success.main
                    }}>
                      <TrendingUpIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Typography variant="h6" fontWeight="600">
                      Performance Analytics
                    </Typography>
                  </Box>
                  
                  {/* Overall Productivity Score */}
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Overall Productivity
                      </Typography>
                      <Typography variant="body2" fontWeight="600" color="primary.main">
                        {stats.productivity}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={stats.productivity}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        background: alpha(theme.palette.primary.main, 0.1),
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                        }
                      }}
                    />
                  </Box>
                  
                  {/* Peer Review Score */}
                  <Paper
                    sx={{
                      p: 2,
                      mb: 2,
                      borderRadius: 2,
                      background: alpha(theme.palette.info.main, 0.05),
                      border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${alpha(theme.palette.info.main, 0.1)}`
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PeopleIcon sx={{ fontSize: 16, color: theme.palette.info.main }} />
                        <Typography variant="body2" fontWeight="500">
                          Peer Review Score
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="600" color={theme.palette.info.main}>
                        {Math.round(productivityInsights.peerReviewScore)}%
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Based on {productivityInsights.peerReviewCount} reviews from team members
                    </Typography>
                  </Paper>
                  
                  {/* Task Completion Metrics */}
                  <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <Paper
                      sx={{
                        flex: 1,
                        p: 2,
                        borderRadius: 2,
                        background: alpha(theme.palette.success.main, 0.05),
                        border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.1)}`
                        }
                      }}
                      onClick={() => {
                        setSnackbars(prev => ({ ...prev, taskClick: true }));
                        setTimeout(() => navigate('/user-app/tasks?filter=completed'), 300);
                      }}
                    >
                      <Typography variant="h4" fontWeight="800" color={theme.palette.success.main}>
                        {productivityInsights.taskDistribution.completed || tasks.filter(t => t.status === 'completed').length}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Tasks Done
                      </Typography>
                    </Paper>
                    
                    <Paper
                      sx={{
                        flex: 1,
                        p: 2,
                        borderRadius: 2,
                        background: alpha(theme.palette.warning.main, 0.05),
                        border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 4px 12px ${alpha(theme.palette.warning.main, 0.1)}`
                        }
                      }}
                      onClick={() => {
                        setSnackbars(prev => ({ ...prev, taskClick: true }));
                        setTimeout(() => navigate('/user-app/tasks?filter=active'), 300);
                      }}
                    >
                      <Typography variant="h4" fontWeight="800" color={theme.palette.warning.main}>
                        {productivityInsights.taskDistribution.active || tasks.filter(t => t.status === 'active').length}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        In Progress
                      </Typography>
                    </Paper>
                  </Box>
                  
                  {/* Efficiency & Collaboration Metrics */}
                  <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <Paper
                      sx={{
                        flex: 1,
                        p: 2,
                        borderRadius: 2,
                        background: alpha(theme.palette.primary.main, 0.05),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`
                        }
                      }}
                      onClick={() => navigate('/user-app/analytics')}
                    >
                      <Typography variant="h4" fontWeight="800" color={theme.palette.primary.main}>
                        {Math.round(productivityInsights.averageEfficiency)}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Avg. Efficiency
                      </Typography>
                    </Paper>
                    
                    <Paper
                      sx={{
                        flex: 1,
                        p: 2,
                        borderRadius: 2,
                        background: alpha(theme.palette.secondary.main, 0.05),
                        border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 4px 12px ${alpha(theme.palette.secondary.main, 0.1)}`
                        }
                      }}
                      onClick={() => navigate('/user-app/peer-reviews')}
                    >
                      <Typography variant="h4" fontWeight="800" color={theme.palette.secondary.main}>
                        {Math.round(productivityInsights.collaborationScore)}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Collaboration
                      </Typography>
                    </Paper>
                  </Box>
                  
                  {/* Peer Review Breakdown (if available) */}
                  {productivityInsights.peerReviewBreakdown && (
                    <Paper
                      sx={{
                        p: 2,
                        mb: 2,
                        borderRadius: 2,
                        background: alpha(theme.palette.info.main, 0.03),
                        border: `1px solid ${alpha(theme.palette.info.main, 0.08)}`
                      }}
                    >
                      <Typography variant="body2" fontWeight="500" sx={{ mb: 1 }}>
                        Peer Review Breakdown
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid item xs={6}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption" color="text.secondary">
                              Contribution
                            </Typography>
                            <Typography variant="caption" fontWeight="600" ml={1}>
                              {Math.round(productivityInsights.peerReviewBreakdown.contribution)}/5
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={(productivityInsights.peerReviewBreakdown.contribution / 5) * 100}
                            sx={{ height: 4, mt: 0.5 }}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption" color="text.secondary">
                              Collaboration
                            </Typography>
                            <Typography variant="caption" fontWeight="600" ml={1}>
                              {Math.round(productivityInsights.peerReviewBreakdown.collaboration)}/5
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={(productivityInsights.peerReviewBreakdown.collaboration / 5) * 100}
                            sx={{ height: 4, mt: 0.5 }}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption" color="text.secondary">
                              Quality
                            </Typography>
                            <Typography variant="caption" fontWeight="600" ml={1}>
                              {Math.round(productivityInsights.peerReviewBreakdown.quality)}/5
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={(productivityInsights.peerReviewBreakdown.quality / 5) * 100}
                            sx={{ height: 4, mt: 0.5 }}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption" color="text.secondary">
                              Punctuality
                            </Typography>
                            <Typography variant="caption" fontWeight="600" ml={1}>
                              {Math.round(productivityInsights.peerReviewBreakdown.punctuality)}/5
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={(productivityInsights.peerReviewBreakdown.punctuality / 5) * 100}
                            sx={{ height: 4, mt: 0.5 }}
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  )}
                  
                  {/* Recent Peer Reviews */}
                  {productivityInsights.recentPeerReviews && productivityInsights.recentPeerReviews.length > 0 && (
                    <Paper
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        background: alpha(theme.palette.success.main, 0.03),
                        border: `1px solid ${alpha(theme.palette.success.main, 0.08)}`
                      }}
                    >
                      <Typography variant="body2" fontWeight="500" sx={{ mb: 1 }}>
                        Recent Peer Feedback
                      </Typography>
                      {productivityInsights.recentPeerReviews.slice(0, 2).map((review, index) => (
                        <Box key={index} sx={{ mb: 1, pb: 1, borderBottom: index === 0 ? `1px solid ${alpha(theme.palette.divider, 0.1)}` : 'none' }}>
                          <Typography variant="caption" fontWeight="500" sx={{ display: 'block' }}>
                            {review.reviewer}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            "{review.comment?.substring(0, 60)}{review.comment?.length > 60 ? '...' : ''}"
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              Score: {review.totalScore}/5
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatTimeAgo(review.submittedAt)}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Paper>
                  )}
                  
                  {/* High Priority Alerts */}
                  {stats.highPriorityAlerts > 0 && (
                    <Paper
                      sx={{
                        p: 2,
                        mt: 2,
                        borderRadius: 2,
                        background: alpha(theme.palette.error.main, 0.05),
                        border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          background: alpha(theme.palette.error.main, 0.08),
                          transform: 'translateX(4px)'
                        }
                      }}
                      onClick={() => {
                        setSnackbars(prev => ({ ...prev, taskClick: true }));
                        setTimeout(() => navigate('/user-app/tasks?filter=high-priority'), 300);
                      }}
                    >
                      <WarningIcon sx={{ color: theme.palette.error.main }} />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight="500">
                          {stats.highPriorityAlerts} high priority alert{stats.highPriorityAlerts !== 1 ? 's' : ''}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Requires your attention
                        </Typography>
                      </Box>
                      <Button 
                        size="small" 
                        variant="text"
                        sx={{ color: theme.palette.error.main, fontWeight: 500 }}
                      >
                        View
                      </Button>
                    </Paper>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Snackbars */}
      <Snackbar
        open={snackbars.dataLoaded}
        autoHideDuration={3000}
        onClose={() => handleCloseSnackbar('dataLoaded')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionComponent={Fade}
      >
        <Alert
          severity="info"
          variant="filled"
          onClose={() => handleCloseSnackbar('dataLoaded')}
          sx={{ 
            width: '100%',
            backdropFilter: 'blur(10px)',
          }}
        >
          Dashboard data refreshed successfully!
        </Alert>
      </Snackbar>

      <Snackbar
        open={snackbars.refreshComplete}
        autoHideDuration={2000}
        onClose={() => handleCloseSnackbar('refreshComplete')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => handleCloseSnackbar('refreshComplete')}
        >
          Dashboard updated!
        </Alert>
      </Snackbar>

      <Snackbar
        open={snackbars.projectClick}
        autoHideDuration={2000}
        onClose={() => handleCloseSnackbar('projectClick')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          severity="info"
          variant="filled"
          onClose={() => handleCloseSnackbar('projectClick')}
          icon={<FolderIcon />}
        >
          Navigating to project details...
        </Alert>
      </Snackbar>

      <Snackbar
        open={snackbars.taskClick}
        autoHideDuration={2000}
        onClose={() => handleCloseSnackbar('taskClick')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="info"
          variant="filled"
          onClose={() => handleCloseSnackbar('taskClick')}
          icon={<TaskAltIcon />}
        >
          Taking you to your tasks...
        </Alert>
      </Snackbar>

      <Snackbar
        open={snackbars.statsDemo}
        autoHideDuration={3000}
        onClose={() => handleCloseSnackbar('statsDemo')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          severity="info"
          variant="filled"
          onClose={() => handleCloseSnackbar('statsDemo')}
          icon={<AssessmentIcon />}
        >
          <AlertTitle>Dashboard Stats Demo</AlertTitle>
          These cards show your key metrics. Click them to navigate or see details!
        </Alert>
      </Snackbar>


      <Snackbar
        open={snackbars.quickActionClick}
        autoHideDuration={2000}
        onClose={() => handleCloseSnackbar('quickActionClick')}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => handleCloseSnackbar('quickActionClick')}
          icon={<AddIcon />}
        >
          Quick action triggered! Redirecting...
        </Alert>
      </Snackbar>

      <Snackbar
        open={snackbars.performanceDemo}
        autoHideDuration={3000}
        onClose={() => handleCloseSnackbar('performanceDemo')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity="info"
          variant="filled"
          onClose={() => handleCloseSnackbar('performanceDemo')}
          icon={<TrendingUpIcon />}
        >
          <AlertTitle>Performance Insights</AlertTitle>
          Track your productivity and task completion rates here!
        </Alert>
      </Snackbar>
      <TourGuide page='dashboard'/>
    </>
  );
}
