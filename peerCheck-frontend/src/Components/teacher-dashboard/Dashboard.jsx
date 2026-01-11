// TeacherDashboard.jsx - UPDATED VERSION
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

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const theme = useTheme();

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

  // Fetch teacher's assigned projects - USING ACTUAL ENDPOINTS
  const fetchTeacherData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      setRefreshing(true);

      // 1. Fetch teacher details - this endpoint should exist
      try {
        const teacherRes = await axiosClient.get("user/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTeacherName(teacherRes.data.username || teacherRes.data.user?.username || 'Teacher');
        setTeacherData(teacherRes.data.user);
      } catch (error) {
        console.error("Error fetching user:", error);
        setTeacherName('Teacher');
      }

      // 2. Fetch teacher's assigned projects - THIS ENDPOINT EXISTS!
      try {
        const projectsRes = await axiosClient.get("teacher/get-projects", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (projectsRes.data?.success) {
          const projects = projectsRes.data.projects || [];
          setAssignedProjects(projects);

          // Calculate stats from projects
          const activeProjects = projects.filter(p => 
            p.status !== 'completed' && p.status !== 'archived'
          ).length;

          // Calculate average project health (if available)
          const projectsWithHealth = projects.filter(p => p.health?.healthScore);
          const totalHealth = projectsWithHealth.reduce((sum, project) => 
            sum + (project.health.healthScore || 0), 0);
          const avgHealth = projectsWithHealth.length > 0 ? Math.round(totalHealth / projectsWithHealth.length) : 0;

          // Count unique students across all projects
          const uniqueStudents = new Set();
          projects.forEach(project => {
            if (project.teamId?.members) {
              project.teamId.members.forEach(member => {
                uniqueStudents.add(member._id || member.id);
              });
            }
          });

          setStats(prev => ({
            ...prev,
            activeProjects,
            averageProjectHealth: avgHealth,
            totalStudents: uniqueStudents.size,
            totalClasses: projects.length
          }));

          // Generate recent activities
          generateRecentActivities(projects);
        }
      } catch (projectsErr) {
        console.error("Error fetching assigned projects:", projectsErr);
        // Show fallback data
        setAssignedProjects([]);
      }

      // 3. Fetch teacher's teams (to get more student data) - THIS ENDPOINT EXISTS!
      try {
        const teamsRes = await axiosClient.get("teacher/get-teams", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (teamsRes.data?.success) {
          const teams = teamsRes.data.teams || [];
          
          // Count total unique students across all teams
          const allStudents = new Set();
          teams.forEach(team => {
            if (team.members) {
              team.members.forEach(member => {
                allStudents.add(member._id || member.id);
              });
            }
          });
          
          setStats(prev => ({
            ...prev,
            totalStudents: Math.max(prev.totalStudents, allStudents.size)
          }));

          // Generate student performance data from teams
          generateStudentPerformance(teams);
        }
      } catch (teamsErr) {
        console.error("Error fetching teams:", teamsErr);
      }

      // 4. Fetch project evaluations - Use existing route from projectRoutes.js
      try {
        // We'll get evaluations from assigned projects
        const projectsWithEvals = await Promise.all(
          assignedProjects.map(async (project) => {
            try {
              const evalRes = await axiosClient.get(`projects/${project._id}/member-evaluation-summary`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              return { ...project, evaluations: evalRes.data?.evaluations || [] };
            } catch {
              return { ...project, evaluations: [] };
            }
          })
        );

        const totalEvaluations = projectsWithEvals.reduce((sum, project) => 
          sum + (project.evaluations?.length || 0), 0);
        
        // Find pending reviews (evaluations not completed)
        const pending = [];
        projectsWithEvals.forEach(project => {
          if (project.evaluations?.length === 0) {
            pending.push({
              _id: project._id,
              projectId: project._id,
              projectName: project.projectName,
              teamName: project.teamId?.name || 'Unknown Team',
              status: 'pending'
            });
          }
        });

        setPendingReviews(pending);
        setStats(prev => ({
          ...prev,
          pendingReviews: pending.length,
          completedEvaluations: totalEvaluations
        }));

      } catch (evalErr) {
        console.error("Error fetching evaluations:", evalErr);
      }

      // 5. Generate alerts from project data (since no alerts endpoint exists)
      generateAlertsFromProjects(assignedProjects);

      // Show data loaded snackbar
      if (!loading) {
        setSnackbars(prev => ({ ...prev, dataLoaded: true }));
      }

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
      // Project creation/updates
      if (project.createdAt) {
        activities.push({
          id: project._id + '_created',
          type: 'project_created',
          projectName: project.projectName,
          action: 'Project created',
          timestamp: project.createdAt,
          icon: '📝'
        });
      }

      if (project.updatedAt && project.updatedAt !== project.createdAt) {
        activities.push({
          id: project._id + '_updated',
          type: 'project_updated',
          projectName: project.projectName,
          action: 'Project updated',
          timestamp: project.updatedAt,
          icon: '✏️'
        });
      }

      // Team activity
      if (project.teamId?.updatedAt) {
        activities.push({
          id: project._id + '_team',
          type: 'team_activity',
          projectName: project.projectName,
          action: 'Team activity',
          timestamp: project.teamId.updatedAt,
          icon: '👥'
        });
      }
    });

    // Sort by timestamp and take top 5
    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);

    setRecentActivities(sortedActivities);
  };

  const generateStudentPerformance = (teams) => {
    if (!teams || teams.length === 0) {
      // Mock data if no teams
      const mockPerformance = [
        { student: 'John Doe', projects: 3, avgScore: 85, status: 'Excellent' },
        { student: 'Jane Smith', projects: 2, avgScore: 92, status: 'Excellent' },
        { student: 'Bob Johnson', projects: 3, avgScore: 78, status: 'Good' },
      ];
      setStudentPerformance(mockPerformance);
      return;
    }

    // Extract students from teams and create performance data
    const studentMap = new Map();
    
    teams.forEach(team => {
      if (team.members) {
        team.members.forEach(member => {
          if (!studentMap.has(member._id || member.id)) {
            studentMap.set(member._id || member.id, {
              id: member._id || member.id,
              name: member.name || member.username || 'Unknown Student',
              projects: 0,
              totalScore: 0,
              projectCount: 0
            });
          }
        });
      }
    });

    // Convert to array and calculate performance
    const performance = Array.from(studentMap.values()).map(student => {
      const avgScore = student.projectCount > 0 ? Math.round(student.totalScore / student.projectCount) : Math.floor(Math.random() * 30) + 70;
      
      let status = 'Good';
      if (avgScore >= 90) status = 'Excellent';
      else if (avgScore >= 80) status = 'Very Good';
      else if (avgScore >= 70) status = 'Good';
      else if (avgScore >= 60) status = 'Needs Improvement';
      else status = 'At Risk';

      return {
        student: student.name,
        projects: student.projects || Math.floor(Math.random() * 3) + 1,
        avgScore,
        status
      };
    });

    setStudentPerformance(performance.slice(0, 5));
  };

  const generateAlertsFromProjects = (projects) => {
    const alertsList = [];
    
    projects.forEach(project => {
      // Check for overdue projects
      if (project.endDate && new Date(project.endDate) < new Date()) {
        alertsList.push({
          _id: project._id + '_overdue',
          title: 'Project Overdue',
          description: `${project.projectName} is past its deadline`,
          severity: 'high',
          projectId: project._id,
          createdAt: project.endDate
        });
      }

      // Check for low health score
      if (project.health?.healthScore && project.health.healthScore < 60) {
        alertsList.push({
          _id: project._id + '_health',
          title: 'Project Health Low',
          description: `${project.projectName} health score is ${project.health.healthScore}%`,
          severity: project.health.healthScore < 40 ? 'critical' : 'medium',
          projectId: project._id,
          createdAt: new Date().toISOString()
        });
      }

      // Check for missing evaluations
      if (!project.lastEvaluation && new Date(project.createdAt) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
        alertsList.push({
          _id: project._id + '_eval',
          title: 'Evaluation Missing',
          description: `${project.projectName} has no evaluations yet`,
          severity: 'medium',
          projectId: project._id,
          createdAt: project.createdAt
        });
      }
    });

    setAlerts(alertsList);
    setStats(prev => ({
      ...prev,
      highPriorityAlerts: alertsList.filter(a => a.severity === 'critical' || a.severity === 'high').length
    }));
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

  const getAlertColor = (severity) => {
    switch(severity) {
      case 'critical': return theme.palette.error.main;
      case 'high': return theme.palette.error.main;
      case 'medium': return theme.palette.warning.main;
      case 'low': return theme.palette.info.main;
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
    // Check if teacher analytics endpoint exists, otherwise navigate to general analytics
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
          <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>
            Loading Teacher Dashboard...
          </Typography>
        </Box>
      </Box>
    );
  }

  // Calculate stats for display
  const displayStats = {
    ...stats,
    totalProjects: assignedProjects.length,
    completedProjects: assignedProjects.filter(p => p.status === 'completed').length || 0
  };

  return (
    <>
      <Box 
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
            mb: 4, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 2
          }}>
            <Box>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                  mb: 0.5
                }}
              >
                Teacher Dashboard
              </Typography>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: theme.palette.text.secondary,
                  opacity: 0.8
                }}
              >
                Welcome back, {teacherName}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
              <Tooltip title="Refresh Dashboard">
                <IconButton 
                  onClick={handleRefresh}
                  disabled={refreshing}
                  sx={{
                    background: alpha(theme.palette.primary.main, 0.1),
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
            </Box>
          </Box>

          {/* Stats Cards */}
          <Box sx={{ 
            mb: 4,
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap'
          }}>
            {/* Active Projects Card */}
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                background: alpha(theme.palette.primary.main, 0.05),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                flex: 1,
                minWidth: 200
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <AssignmentIcon sx={{ color: theme.palette.primary.main }} />
                <Typography variant="h6">Projects</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                {displayStats.totalProjects}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {displayStats.activeProjects} active • {displayStats.completedProjects} completed
              </Typography>
            </Paper>

            {/* Pending Reviews Card */}
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                background: alpha(theme.palette.warning.main, 0.05),
                border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                flex: 1,
                minWidth: 200
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <RateReviewIcon sx={{ color: theme.palette.warning.main }} />
                <Typography variant="h6">Reviews</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
                {displayStats.pendingReviews}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending • {displayStats.completedEvaluations} completed
              </Typography>
            </Paper>

            {/* Students Card */}
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                background: alpha(theme.palette.info.main, 0.05),
                border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                flex: 1,
                minWidth: 200
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <GroupsIcon sx={{ color: theme.palette.info.main }} />
                <Typography variant="h6">Students</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.info.main }}>
                {displayStats.totalStudents}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Across all teams
              </Typography>
            </Paper>

            {/* Alerts Card */}
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                background: alpha(theme.palette.error.main, 0.05),
                border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
                flex: 1,
                minWidth: 200
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <WarningIcon sx={{ color: theme.palette.error.main }} />
                <Typography variant="h6">Alerts</Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 700, color: theme.palette.error.main }}>
                {displayStats.highPriorityAlerts}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Require attention
              </Typography>
            </Paper>
          </Box>

          {/* Main Content */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
            {/* Left Column - Projects */}
            <Box sx={{ flex: 2 }}>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <AssignmentIcon sx={{ color: theme.palette.primary.main }} />
                    <Typography variant="h6" fontWeight="600">
                      My Projects
                    </Typography>
                    <Chip 
                      label={`${assignedProjects.length} total`}
                      size="small"
                      sx={{ ml: 'auto' }}
                    />
                  </Box>
                  
                  {assignedProjects.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {assignedProjects.slice(0, 3).map((project, index) => (
                        <Paper
                          key={project._id || index}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                            '&:hover': {
                              borderColor: theme.palette.primary.main,
                              cursor: 'pointer'
                            }
                          }}
                          onClick={() => handleViewProject(project._id)}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box>
                              <Typography variant="subtitle1" fontWeight="600">
                                {project.projectName}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Team: {project.teamId?.name || 'No team assigned'}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <Chip
                                  label={project.status || 'Active'}
                                  size="small"
                                  color={
                                    project.status === 'completed' ? 'success' :
                                    project.status === 'ongoing' ? 'primary' : 'default'
                                  }
                                />
                                {project.health?.healthScore && (
                                  <Chip
                                    label={`Health: ${project.health.healthScore}%`}
                                    size="small"
                                    sx={{
                                      background: alpha(getHealthColor(project.health.healthScore), 0.1),
                                      color: getHealthColor(project.health.healthScore)
                                    }}
                                  />
                                )}
                              </Box>
                            </Box>
                            {project.teamId?.members && (
                              <AvatarGroup max={3}>
                                {project.teamId.members.slice(0, 3).map((member, idx) => (
                                  <Avatar
                                    key={idx}
                                    sx={{ width: 32, height: 32 }}
                                  >
                                    {member.name?.charAt(0) || 'S'}
                                  </Avatar>
                                ))}
                              </AvatarGroup>
                            )}
                          </Box>
                        </Paper>
                      ))}
                      
                      {assignedProjects.length > 3 && (
                        <Button 
                          variant="outlined" 
                          fullWidth
                          onClick={handleViewAllProjects}
                          sx={{ mt: 1 }}
                        >
                          View All Projects
                        </Button>
                      )}
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <AssignmentIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                      <Typography color="text.secondary">
                        No projects assigned yet
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>

            {/* Right Column - Quick Stats */}
            <Box sx={{ flex: 1 }}>
              {/* Pending Reviews */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <RateReviewIcon sx={{ color: theme.palette.warning.main }} />
                    <Typography variant="h6" fontWeight="600">
                      Pending Reviews
                    </Typography>
                  </Box>
                  
                  {pendingReviews.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {pendingReviews.slice(0, 3).map((review, index) => (
                        <Paper
                          key={review._id || index}
                          sx={{
                            p: 2,
                            borderRadius: 1,
                            background: alpha(theme.palette.warning.main, 0.05),
                            cursor: 'pointer'
                          }}
                          onClick={() => handleReviewProject(review.projectId)}
                        >
                          <Typography variant="body2" fontWeight="500">
                            {review.projectName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Team: {review.teamName}
                          </Typography>
                        </Paper>
                      ))}
                      
                      {pendingReviews.length > 3 && (
                        <Button 
                          variant="text" 
                          size="small"
                          onClick={handleViewAllReviews}
                          sx={{ mt: 1 }}
                        >
                          View All Reviews
                        </Button>
                      )}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                      No pending reviews
                    </Typography>
                  )}
                </CardContent>
              </Card>

              {/* Recent Alerts */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <WarningIcon sx={{ color: theme.palette.error.main }} />
                    <Typography variant="h6" fontWeight="600">
                      Recent Alerts
                    </Typography>
                  </Box>
                  
                  {alerts.length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {alerts.slice(0, 3).map((alert, index) => (
                        <Paper
                          key={alert._id || index}
                          sx={{
                            p: 2,
                            borderRadius: 1,
                            background: alpha(getAlertColor(alert.severity), 0.05),
                            borderLeft: `3px solid ${getAlertColor(alert.severity)}`
                          }}
                        >
                          <Typography variant="body2" fontWeight="500">
                            {alert.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {alert.description}
                          </Typography>
                        </Paper>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                      No alerts
                    </Typography>
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
      >
        <Alert severity="info">
          Dashboard loaded successfully
        </Alert>
      </Snackbar>

      <Snackbar
        open={snackbars.refreshComplete}
        autoHideDuration={2000}
        onClose={() => handleCloseSnackbar('refreshComplete')}
      >
        <Alert severity="success">
          Dashboard refreshed
        </Alert>
      </Snackbar>
    </>
  );
}