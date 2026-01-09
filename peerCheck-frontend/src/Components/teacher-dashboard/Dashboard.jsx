import axiosClient from '@/api/axiosClient';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ClassIcon from '@mui/icons-material/Class';
import GroupsIcon from '@mui/icons-material/Groups';
import AssignmentIcon from '@mui/icons-material/Assignment';
import RateReviewIcon from '@mui/icons-material/RateReview';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import WarningIcon from '@mui/icons-material/Warning';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ChatIcon from '@mui/icons-material/Chat';
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
  LinearProgress,
  Tooltip,
  Snackbar,
  Alert,
  AlertTitle,
  Fade,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useInView from '../../hooks/useInView';
import TourGuide from '../TourGuide';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { ref, inView } = useInView({ threshold: 0.1 });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [teacherName, setTeacherName] = useState('');
  const [teacherData, setTeacherData] = useState(null);

  // Dashboard data states
  const [assignedProjects, setAssignedProjects] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [studentPerformance, setStudentPerformance] = useState([]);
  const [alerts, setAlerts] = useState([]);

  // Stats state
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    activeProjects: 0,
    pendingReviews: 0,
    highPriorityAlerts: 0,
    averageProjectHealth: 0,
    completedEvaluations: 0
  });

  // Snackbar states
  const [snackbars, setSnackbars] = useState({
    welcome: false,
    dataLoaded: false,
    refreshComplete: false,
    projectClick: false,
    reviewClick: false,
    alertClick: false,
    statsDemo: false
  });

  // Fetch teacher's assigned projects and data
  const fetchTeacherData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      setRefreshing(true);

      // Fetch teacher details
      const teacherRes = await axiosClient.get("user/me", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTeacherName(teacherRes.data.username || teacherRes.data.user?.username || 'Teacher');
      setTeacherData(teacherRes.data.user);

      // Show welcome snackbar on first load
      if (loading && !snackbars.welcome) {
        setTimeout(() => {
          setSnackbars(prev => ({ ...prev, welcome: true }));
        }, 1000);
      }

      // Fetch teacher's assigned projects (mentorProjectAssignments)
      try {
        const projectsRes = await axiosClient.get("teacher/assigned-projects", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (projectsRes.data?.success) {
          const projects = projectsRes.data.projects || [];
          setAssignedProjects(projects);

          // Calculate stats from projects
          const activeProjects = projects.filter(p => 
            p.status === 'ongoing' || p.status === 'active'
          ).length;

          // Calculate average project health
          const totalHealth = projects.reduce((sum, project) => 
            sum + (project.metrics?.health?.healthScore || 0), 0);
          const avgHealth = projects.length > 0 ? Math.round(totalHealth / projects.length) : 0;

          // Count students across all teams
          const uniqueStudents = new Set();
          projects.forEach(project => {
            if (project.teamId?.members) {
              project.teamId.members.forEach(member => {
                uniqueStudents.add(member._id);
              });
            }
          });

          setStats(prev => ({
            ...prev,
            activeProjects,
            averageProjectHealth: avgHealth,
            totalStudents: uniqueStudents.size
          }));

          // Generate recent activities from projects
          generateRecentActivities(projects);
        }
      } catch (projectsErr) {
        console.error("Error fetching assigned projects:", projectsErr);
      }

      // Fetch pending reviews
      try {
        const reviewsRes = await axiosClient.get("teacher/pending-reviews", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (reviewsRes.data?.success) {
          const pending = reviewsRes.data.reviews || [];
          setPendingReviews(pending);
          setStats(prev => ({
            ...prev,
            pendingReviews: pending.length
          }));
        }
      } catch (reviewsErr) {
        console.error("Error fetching pending reviews:", reviewsErr);
      }

      // Fetch project evaluations for completed reviews
      try {
        const evaluationsRes = await axiosClient.get("teacher/project-evaluations", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (evaluationsRes.data?.success) {
          const evaluations = evaluationsRes.data.evaluations || [];
          setStats(prev => ({
            ...prev,
            completedEvaluations: evaluations.length
          }));
        }
      } catch (evalErr) {
        console.error("Error fetching evaluations:", evalErr);
      }

      // Fetch alerts and warnings
      try {
        const alertsRes = await axiosClient.get("teacher/alerts", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (alertsRes.data?.success) {
          const teacherAlerts = alertsRes.data.alerts || [];
          setAlerts(teacherAlerts);
          
          const highPriority = teacherAlerts.filter(alert => 
            alert.priority === 'high' || alert.severity === 'critical'
          ).length;
          
          setStats(prev => ({
            ...prev,
            highPriorityAlerts: highPriority
          }));
        }
      } catch (alertsErr) {
        console.error("Error fetching alerts:", alertsErr);
      }

      // Generate student performance data
      generateStudentPerformance();

      // Show data loaded snackbar
      setSnackbars(prev => ({ ...prev, dataLoaded: true }));

    } catch (err) {
      console.error('Error fetching teacher data:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const generateRecentActivities = (projects) => {
    const activities = [];
    
    projects.slice(0, 5).forEach(project => {
      // Project updates
      if (project.updatedAt) {
        activities.push({
          id: project._id,
          type: 'project_update',
          projectName: project.projectName,
          action: 'Project updated',
          timestamp: project.updatedAt,
          icon: '📝'
        });
      }

      // Team changes
      if (project.teamId?.members) {
        activities.push({
          id: project._id + '_team',
          type: 'team_update',
          projectName: project.projectName,
          action: 'Team composition changed',
          timestamp: new Date().toISOString(),
          icon: '👥'
        });
      }

      // Progress milestones
      if (project.metrics?.progress?.progress > 0) {
        activities.push({
          id: project._id + '_progress',
          type: 'progress',
          projectName: project.projectName,
          action: `Progress reached ${project.metrics.progress.progress}%`,
          timestamp: project.updatedAt,
          icon: '📈'
        });
      }
    });

    // Sort by timestamp and take top 5
    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);

    setRecentActivities(sortedActivities);
  };

  const generateStudentPerformance = () => {
    // Mock data - in real app, fetch from backend
    const performance = [
      { student: 'John Doe', projects: 3, avgScore: 85, status: 'Excellent' },
      { student: 'Jane Smith', projects: 2, avgScore: 92, status: 'Excellent' },
      { student: 'Bob Johnson', projects: 3, avgScore: 78, status: 'Good' },
      { student: 'Alice Brown', projects: 1, avgScore: 65, status: 'Needs Improvement' },
      { student: 'Charlie Wilson', projects: 2, avgScore: 88, status: 'Very Good' },
    ];
    setStudentPerformance(performance);
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

  const getHealthColor = (score) => {
    if (!score) return theme.palette.info.main;
    if (score >= 80) return theme.palette.success.main;
    if (score >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getHealthLabel = (score) => {
    if (!score) return 'Unknown';
    if (score >= 80) return 'Healthy';
    if (score >= 60) return 'Moderate';
    return 'At Risk';
  };

  const getAlertColor = (priority) => {
    switch(priority) {
      case 'critical': return theme.palette.error.main;
      case 'high': return theme.palette.warning.main;
      case 'medium': return theme.palette.info.main;
      case 'low': return theme.palette.success.main;
      default: return theme.palette.info.main;
    }
  };

  const handleViewProject = (projectId) => {
    setSnackbars(prev => ({ ...prev, projectClick: true }));
    setTimeout(() => {
      navigate(`/teacher-app/projects/${projectId}`);
    }, 300);
  };

  const handleReviewProject = (projectId) => {
    setSnackbars(prev => ({ ...prev, reviewClick: true }));
    setTimeout(() => {
      navigate(`/teacher-app/reviews/${projectId}`);
    }, 300);
  };

  const handleViewAllProjects = () => {
    navigate('/teacher-app/projects');
  };

  const handleViewAllReviews = () => {
    navigate('/teacher-app/reviews');
  };

  const handleViewAnalytics = () => {
    navigate('/teacher-app/analytics');
  };

  const handleRefresh = () => {
    fetchTeacherData();
    setSnackbars(prev => ({ ...prev, refreshComplete: true }));
  };

  const handleCloseSnackbar = (snackbar) => {
    setSnackbars(prev => ({ ...prev, [snackbar]: false }));
  };

  useEffect(() => {
    fetchTeacherData();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchTeacherData, 60000);
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
            Loading Teacher Dashboard...
          </Typography>
        </Box>
      </Box>
    );
  }

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
          <Box sx={{ 
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
                Teacher Dashboard
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
                Welcome back, {teacherName} • Academic Overview
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
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
                startIcon={<AnalyticsIcon />}
                onClick={handleViewAnalytics}
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
                View Analytics
              </Button>
            </Box>
          </Box>

          {/* Teacher Stats Cards */}
          <Box sx={{ 
            mb: 5,
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
            gap: 2.5,
          }}>
            {[
              {
                title: 'Active Projects',
                value: stats.activeProjects,
                icon: <AssignmentIcon fontSize="small" />,
                color: theme.palette.primary.main,
                gradient: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)}, ${alpha(theme.palette.primary.main, 0.05)})`,
                subtitle: `${assignedProjects.filter(p => p.status === 'completed').length} completed`,
                progress: assignedProjects.length > 0 ? (stats.activeProjects / assignedProjects.length) * 100 : 0,
                onClick: () => navigate('/teacher-app/projects')
              },
              {
                title: 'Pending Reviews',
                value: stats.pendingReviews,
                icon: <RateReviewIcon fontSize="small" />,
                color: theme.palette.warning.main,
                gradient: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.15)}, ${alpha(theme.palette.warning.main, 0.05)})`,
                subtitle: `${stats.completedEvaluations} completed`,
                progress: stats.pendingReviews > 0 ? Math.min(100, stats.pendingReviews * 20) : 0,
                onClick: () => navigate('/teacher-app/reviews')
              },
              {
                title: 'Project Health',
                value: `${stats.averageProjectHealth}%`,
                icon: <TrendingUpIcon fontSize="small" />,
                color: getHealthColor(stats.averageProjectHealth),
                gradient: `linear-gradient(135deg, ${alpha(getHealthColor(stats.averageProjectHealth), 0.15)}, ${alpha(getHealthColor(stats.averageProjectHealth), 0.05)})`,
                subtitle: getHealthLabel(stats.averageProjectHealth),
                progress: stats.averageProjectHealth,
                onClick: () => setSnackbars(prev => ({ ...prev, statsDemo: true }))
              },
              {
                title: 'Alerts',
                value: stats.highPriorityAlerts,
                icon: <WarningIcon fontSize="small" />,
                color: theme.palette.error.main,
                gradient: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.15)}, ${alpha(theme.palette.error.main, 0.05)})`,
                subtitle: 'Require attention',
                progress: stats.highPriorityAlerts > 0 ? Math.min(100, stats.highPriorityAlerts * 25) : 0,
                onClick: () => {
                  if (alerts.length > 0) {
                    navigate('/teacher-app/analytics?tab=alerts');
                  }
                }
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
                      background: stat.gradient.replace('0.15', '0.2').replace('0.05', '0.1'),
                      border: `1.5px solid ${alpha(stat.color, 0.25)}`,
                      boxShadow: `0 8px 24px ${alpha(stat.color, 0.15)}`,
                    }
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    mb: 1.5
                  }}>
                    <Box sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: alpha(stat.color, 0.1),
                      border: `1px solid ${alpha(stat.color, 0.2)}`,
                    }}>
                      <Box sx={{ color: stat.color, fontSize: 22 }}>
                        {stat.icon}
                      </Box>
                    </Box>
                    
                    <Typography 
                      variant="h3"
                      sx={{
                        fontWeight: 700,
                        fontSize: { xs: '2rem', sm: '2.5rem' },
                        color: stat.color,
                        lineHeight: 1,
                      }}
                    >
                      {stat.value}
                    </Typography>
                  </Box>
                  
                  <Typography 
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                      mb: 0.5
                    }}
                  >
                    {stat.title}
                  </Typography>
                  
                  <Typography 
                    variant="caption"
                    sx={{
                      color: theme.palette.text.secondary,
                    }}
                  >
                    {stat.subtitle}
                  </Typography>
                  
                  <Box sx={{
                    mt: 2,
                    height: 2,
                    background: alpha(theme.palette.divider, 0.2),
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
                    }
                  }} />
                </Paper>
              </motion.div>
            ))}
          </Box>

          {/* Main Content Area */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', lg: 'row' }, 
            gap: 4 
          }}>
            {/* Left Column - Projects & Recent Activity */}
            <Box sx={{ flex: 1 }}>
              {/* Assigned Projects Section */}
              <Card sx={{
                borderRadius: 3,
                background: theme.palette.background.paper,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
                mb: 4
              }}>
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
                        <AssignmentIcon sx={{ fontSize: 20 }} />
                      </Box>
                      <Typography variant="h6" fontWeight="600">
                        Assigned Projects
                      </Typography>
                    </Box>
                    <Chip 
                      label={`${assignedProjects.length} total`}
                      size="small"
                      sx={{ 
                        background: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        fontWeight: 500
                      }}
                    />
                  </Box>
                  
                  {assignedProjects.length > 0 ? (
                    <Box sx={{ p: 3, pt: 2 }}>
                      {assignedProjects.slice(0, 3).map((project, index) => (
                        <Paper
                          key={project._id || index}
                          sx={{
                            p: 3,
                            mb: 2,
                            borderRadius: 2,
                            background: alpha(theme.palette.background.default, 0.5),
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
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Typography variant="subtitle1" fontWeight="600">
                                  {project.projectName}
                                </Typography>
                                <Chip
                                  label={project.status?.replace('_', ' ').toUpperCase() || 'ACTIVE'}
                                  size="small"
                                  sx={{
                                    background: project.status === 'completed' 
                                      ? alpha(theme.palette.success.main, 0.1)
                                      : project.status === 'ongoing' 
                                        ? alpha(theme.palette.primary.main, 0.1)
                                        : alpha(theme.palette.warning.main, 0.1),
                                    color: project.status === 'completed' 
                                      ? theme.palette.success.main
                                      : project.status === 'ongoing' 
                                        ? theme.palette.primary.main
                                        : theme.palette.warning.main,
                                    fontWeight: 500
                                  }}
                                />
                              </Box>
                              
                              {project.description && (
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                  {project.description.length > 120 
                                    ? `${project.description.substring(0, 120)}...` 
                                    : project.description}
                                </Typography>
                              )}
                              
                              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                                {project.teamName && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <GroupsIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
                                    <Typography variant="caption" color="text.secondary">
                                      Team: {project.teamName}
                                    </Typography>
                                  </Box>
                                )}
                                
                                {project.endDate && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <CalendarTodayIcon sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
                                    <Typography variant="caption" color="text.secondary">
                                      Due: {new Date(project.endDate).toLocaleDateString()}
                                    </Typography>
                                  </Box>
                                )}
                                
                                {project.metrics?.health?.healthScore && (
                                  <Chip
                                    label={`Health: ${project.metrics.health.healthScore}%`}
                                    size="small"
                                    sx={{
                                      background: alpha(getHealthColor(project.metrics.health.healthScore), 0.1),
                                      color: getHealthColor(project.metrics.health.healthScore),
                                      fontWeight: 500
                                    }}
                                  />
                                )}
                              </Box>
                              
                              {/* Project Metrics Overview */}
                              {project.metrics && (
                                <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                  {project.metrics.progress && (
                                    <Box>
                                      <Typography variant="caption" color="text.secondary">
                                        Progress
                                      </Typography>
                                      <LinearProgress
                                        variant="determinate"
                                        value={project.metrics.progress.progress || 0}
                                        sx={{
                                          width: 100,
                                          height: 6,
                                          borderRadius: 1,
                                          mt: 0.5
                                        }}
                                      />
                                    </Box>
                                  )}
                                  
                                  {project.metrics.projectRisk && (
                                    <Chip
                                      label={`Risk: ${project.metrics.projectRisk.riskLabel}`}
                                      size="small"
                                      variant="outlined"
                                      sx={{
                                        borderColor: project.metrics.projectRisk.riskLevel === 'high' 
                                          ? theme.palette.error.main 
                                          : project.metrics.projectRisk.riskLevel === 'medium'
                                            ? theme.palette.warning.main
                                            : theme.palette.success.main,
                                        color: project.metrics.projectRisk.riskLevel === 'high' 
                                          ? theme.palette.error.main 
                                          : project.metrics.projectRisk.riskLevel === 'medium'
                                            ? theme.palette.warning.main
                                            : theme.palette.success.main,
                                      }}
                                    />
                                  )}
                                </Box>
                              )}
                            </Box>
                            
                            {project.teamId?.members && project.teamId.members.length > 0 && (
                              <AvatarGroup max={3} sx={{ ml: 2 }}>
                                {project.teamId.members.slice(0, 3).map((member, idx) => (
                                  <Avatar
                                    key={idx}
                                    sx={{
                                      width: 32,
                                      height: 32,
                                      border: `2px solid ${theme.palette.background.paper}`
                                    }}
                                  >
                                    {member.name?.charAt(0) || member.username?.charAt(0) || 'S'}
                                  </Avatar>
                                ))}
                              </AvatarGroup>
                            )}
                          </Box>
                        </Paper>
                      ))}
                      
                      {assignedProjects.length > 3 && (
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
                            View all {assignedProjects.length} projects →
                          </Button>
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                      <AssignmentIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2, opacity: 0.5 }} />
                      <Typography variant="body1" color="text.secondary" gutterBottom>
                        No projects assigned yet
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        You'll see assigned projects here once they're assigned to you
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card sx={{
                borderRadius: 3,
                background: theme.palette.background.paper,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.04)'
              }}>
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
                      <ChatIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Typography variant="h6" fontWeight="600">
                      Recent Activity
                    </Typography>
                  </Box>
                  
                  {recentActivities.length > 0 ? (
                    <List sx={{ py: 0 }}>
                      {recentActivities.map((activity, index) => (
                        <React.Fragment key={activity.id}>
                          <ListItem 
                            alignItems="flex-start"
                            sx={{
                              px: 0,
                              py: 1.5,
                              borderRadius: 1,
                              '&:hover': {
                                background: alpha(theme.palette.action.hover, 0.3)
                              }
                            }}
                          >
                            <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                              <Box sx={{ fontSize: 20 }}>{activity.icon}</Box>
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <Typography variant="body2" fontWeight="500">
                                  {activity.action}
                                </Typography>
                              }
                              secondary={
                                <React.Fragment>
                                  <Typography variant="caption" color="text.secondary">
                                    {activity.projectName}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                    {formatTimeAgo(activity.timestamp)}
                                  </Typography>
                                </React.Fragment>
                              }
                            />
                          </ListItem>
                          {index < recentActivities.length - 1 && <Divider variant="inset" component="li" />}
                        </React.Fragment>
                      ))}
                    </List>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <ChatIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 2, opacity: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        No recent activity
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>

            {/* Right Column - Pending Reviews, Alerts & Performance */}
            <Box sx={{ width: { xs: '100%', lg: 400 } }}>
              {/* Pending Reviews */}
              <Card sx={{
                borderRadius: 3,
                background: theme.palette.background.paper,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
                mb: 4
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <Box sx={{
                      width: 40,
                      height: 40,
                      background: alpha(theme.palette.warning.main, 0.1),
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: theme.palette.warning.main
                    }}>
                      <RateReviewIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Typography variant="h6" fontWeight="600">
                      Pending Reviews
                    </Typography>
                  </Box>
                  
                  {pendingReviews.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {pendingReviews.slice(0, 3).map((review, index) => (
                        <Paper
                          key={review._id || index}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            background: alpha(theme.palette.warning.main, 0.05),
                            border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                            transition: 'all 0.2s ease',
                            cursor: 'pointer',
                            '&:hover': {
                              background: alpha(theme.palette.warning.main, 0.08),
                              transform: 'translateX(4px)'
                            }
                          }}
                          onClick={() => handleReviewProject(review.projectId || review._id)}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box>
                              <Typography variant="body2" fontWeight="500" sx={{ mb: 0.5 }}>
                                {review.projectName || 'Project Review'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                Team: {review.teamName || 'Unknown Team'}
                              </Typography>
                              {review.dueDate && (
                                <Chip
                                  label={`Due: ${new Date(review.dueDate).toLocaleDateString()}`}
                                  size="small"
                                  sx={{
                                    background: alpha(theme.palette.warning.main, 0.1),
                                    color: theme.palette.warning.main
                                  }}
                                />
                              )}
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                              <Typography variant="caption" color="text.secondary">
                                {review.daysLeft !== undefined ? `${review.daysLeft} days left` : 'Pending'}
                              </Typography>
                            </Box>
                          </Box>
                        </Paper>
                      ))}
                      
                      {pendingReviews.length > 3 && (
                        <Box sx={{ textAlign: 'center', pt: 1 }}>
                          <Button 
                            variant="text" 
                            onClick={handleViewAllReviews}
                            sx={{
                              color: theme.palette.warning.main,
                              fontWeight: 500,
                              '&:hover': {
                                background: alpha(theme.palette.warning.main, 0.1)
                              }
                            }}
                          >
                            View all {pendingReviews.length} pending reviews →
                          </Button>
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <CheckCircleIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 2, opacity: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        No pending reviews
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        All reviews are complete
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* Alerts & Warnings */}
              <Card sx={{
                borderRadius: 3,
                background: theme.palette.background.paper,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
                mb: 4
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                    <Box sx={{
                      width: 40,
                      height: 40,
                      background: alpha(theme.palette.error.main, 0.1),
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: theme.palette.error.main
                    }}>
                      <WarningIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Typography variant="h6" fontWeight="600">
                      Alerts & Warnings
                    </Typography>
                  </Box>
                  
                  {alerts.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {alerts.slice(0, 3).map((alert, index) => (
                        <Paper
                          key={alert._id || index}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            background: alpha(getAlertColor(alert.priority || alert.severity), 0.05),
                            border: `1px solid ${alpha(getAlertColor(alert.priority || alert.severity), 0.1)}`,
                            transition: 'all 0.2s ease',
                            cursor: 'pointer',
                            '&:hover': {
                              background: alpha(getAlertColor(alert.priority || alert.severity), 0.08),
                              transform: 'translateX(4px)'
                            }
                          }}
                          onClick={() => setSnackbars(prev => ({ ...prev, alertClick: true }))}
                        >
                          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                            <WarningIcon sx={{ 
                              color: getAlertColor(alert.priority || alert.severity),
                              fontSize: 20,
                              mt: 0.5
                            }} />
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body2" fontWeight="500" sx={{ mb: 0.5 }}>
                                {alert.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                {alert.description}
                              </Typography>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Chip
                                  label={(alert.priority || alert.severity || 'medium').toUpperCase()}
                                  size="small"
                                  sx={{
                                    background: alpha(getAlertColor(alert.priority || alert.severity), 0.1),
                                    color: getAlertColor(alert.priority || alert.severity),
                                    fontWeight: 500
                                  }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {formatTimeAgo(alert.createdAt)}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </Paper>
                      ))}
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <CheckCircleIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 2, opacity: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        No alerts at this time
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>

              {/* Student Performance Summary */}
              <Card sx={{
                borderRadius: 3,
                background: theme.palette.background.paper,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.04)'
              }}>
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
                      <PersonIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Typography variant="h6" fontWeight="600">
                      Student Performance
                    </Typography>
                  </Box>
                  
                  <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Student</TableCell>
                          <TableCell align="right">Projects</TableCell>
                          <TableCell align="right">Avg Score</TableCell>
                          <TableCell align="right">Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {studentPerformance.slice(0, 5).map((student, index) => (
                          <TableRow key={index} hover>
                            <TableCell>
                              <Typography variant="body2">{student.student}</Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2">{student.projects}</Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Typography 
                                variant="body2" 
                                fontWeight="600"
                                color={student.avgScore >= 80 ? 'success.main' : student.avgScore >= 60 ? 'warning.main' : 'error.main'}
                              >
                                {student.avgScore}%
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Chip
                                label={student.status}
                                size="small"
                                sx={{
                                  background: student.status === 'Excellent' 
                                    ? alpha(theme.palette.success.main, 0.1)
                                    : student.status === 'Very Good'
                                      ? alpha(theme.palette.info.main, 0.1)
                                      : student.status === 'Good'
                                        ? alpha(theme.palette.warning.main, 0.1)
                                        : alpha(theme.palette.error.main, 0.1),
                                  color: student.status === 'Excellent' 
                                    ? theme.palette.success.main
                                    : student.status === 'Very Good'
                                      ? theme.palette.info.main
                                      : student.status === 'Good'
                                        ? theme.palette.warning.main
                                        : theme.palette.error.main,
                                  fontWeight: 500
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  <Box sx={{ textAlign: 'center', pt: 2 }}>
                    <Button 
                      variant="text" 
                      onClick={() => navigate('/teacher-app/analytics?tab=students')}
                      sx={{
                        color: theme.palette.primary.main,
                        fontWeight: 500,
                        fontSize: '0.875rem'
                      }}
                    >
                      View Detailed Analytics →
                    </Button>
                  </Box>
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
        >
          Teacher dashboard updated successfully!
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
          Dashboard refreshed!
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
          icon={<AssignmentIcon />}
        >
          Navigating to project details...
        </Alert>
      </Snackbar>

      <Snackbar
        open={snackbars.reviewClick}
        autoHideDuration={2000}
        onClose={() => handleCloseSnackbar('reviewClick')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="info"
          variant="filled"
          onClose={() => handleCloseSnackbar('reviewClick')}
          icon={<RateReviewIcon />}
        >
          Opening project review...
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
          icon={<AnalyticsIcon />}
        >
          <AlertTitle>Project Health Metrics</AlertTitle>
          Based on progress, risk, proof compliance, and deadline adherence
        </Alert>
      </Snackbar>

      <TourGuide page='teacher-dashboard' />
    </>
  );
}