import axiosClient from '@/api/axiosClient';
import { CalendarMonth, Comment, Download, Email, Group, Insights, Monitor, People, Refresh, Search, Source, Visibility, Work,  KeyboardArrowDown, KeyboardArrowUp, Title, Person as PersonIcon, Circle, TrendingUp, Task, Settings, Warning, CheckCircle,   Assignment, Verified, AccessTime, Timer, Schedule, QueryBuilder } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Paper,
  alpha,
  useTheme,
  Container,
  IconButton,
  Tooltip,
  Chip,
  Avatar,
  AvatarGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tabs,
  Tab,
  Grid,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Badge,
  Snackbar,
  Alert,
  CircularProgress,
  InputAdornment,
  lighten,
  darken,
  Rating,
  Stack,
  Checkbox,
  Collapse
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TaskDetailsModal from '../user-dashboard/TaskComponents/TaskDetailsModal';
import { getUserData } from '@/utils/user';
import useTasks from '@/hooks/useTasks';
import useMyProject from '@/hooks/useMyProjects';
import ReviewProjectModal from '../user-dashboard/ProjectComponents/ReviewProjectModel';
// ... import statements remain the same ...

export default function TeacherMonitor() {
  const navigate = useNavigate();
  const theme = useTheme();
  const {
    handleTaskUpdate,
    handleOpenUploadProof,
    handleStatusChange,
    formatTime
  } = useTasks();
  
  // State
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [mainTabValue, setMainTabValue] = useState(0); // 0: Projects, 1: Teams
  const [detailTabValue, setDetailTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [projectMetrics, setProjectMetrics] = useState({});
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  //collapsable tasks from project(when prj clicked)
  const [expandedProject, setExpandedProject] = useState(null);
  const [projectTasks, setProjectTasks] = useState({});
  const [loadingTasks, setLoadingTasks] = useState({});
  const [selectedTasks, setSelectedTasks] = useState({});

  //open task modal
  const [detailsOpen, setDetailsOpen]= useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });


    const getUser = async () => {
      const u = await getUserData();
      if(u){
        setUserRole(u.role);
      }
    }

  // Fetch projects monitored by the teacher
  const fetchMonitoredProjects = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosClient.get('/teacher/get-projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        // Transform projects data
        const transformedProjects = await Promise.all(
          response.data.projects.map(async (project) => {
            try {
              // Fetch detailed metrics for each project
              const metricsResponse = await axiosClient.get(`/projects/${project._id}/metrics`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              
              const metrics = metricsResponse.data.metrics || {};
              setProjectMetrics(prev => ({ ...prev, [project._id]: metrics }));
              
              return {
                ...project,
                projectName: project.name || project.projectName || 'Unnamed Project',
                teamMembers: project.teamMembers || project.members || [],
                status: project.status || 'ongoing',
                progress: project.progress || (metrics.progress?.progress || 0),
                averageScore: project.averageScore || 0,
                category: project.category || 'General',
                priority: project.priority || 'Medium',
                metrics: metrics
              };
            } catch (error) {
              console.error(`Error fetching metrics for project ${project._id}:`, error);
              return {
                ...project,
                projectName: project.name || project.projectName || 'Unnamed Project',
                teamMembers: project.teamMembers || project.members || [],
                status: project.status || 'ongoing',
                progress: project.progress || 0,
                averageScore: project.averageScore || 0,
                category: project.category || 'General',
                priority: project.priority || 'Medium'
              };
            }
          })
        );
        
        setProjects(transformedProjects || []);
        if (transformedProjects.length > 0 && !selectedProject) {
          setSelectedProject(transformedProjects[0]);
        }
      } else {
        showSnackbar('Failed to load monitored projects', 'error');
      }
    } catch (error) {
      console.error('Error fetching monitored projects:', error);
      showSnackbar('Error fetching projects', 'error');
    }
  };

  // Fetch teams monitored by the teacher
  const fetchMonitoredTeams = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosClient.get('/teacher/get-teams', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        // Transform teams data
        const transformedTeams = response.data.teams.map(team => ({
          ...team,
          teamName: team.name || team.teamName || 'Unnamed Team',
          description: team.description || `Team with ${team.members?.length || 0} members`,
          project: team.project || { projectName: 'No Project Assigned' }
        }));
        setTeams(transformedTeams || []);
        if (transformedTeams.length > 0 && !selectedTeam) {
          setSelectedTeam(transformedTeams[0]);
        }
      } else {
        showSnackbar('Failed to load monitored teams', 'error');
      }
    } catch (error) {
      console.error('Error fetching monitored teams:', error);
      showSnackbar('Error fetching teams', 'error');
    }
  };

  // Fetch all data
  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchMonitoredProjects(), fetchMonitoredTeams()]);
    } catch (error) {
      console.error('Error fetching data:', error);
      showSnackbar('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleMainTabChange = (event, newValue) => {
    setMainTabValue(newValue);
    setDetailTabValue(0);
    setPage(0);
  };

  const handleDetailTabChange = (event, newValue) => {
    setDetailTabValue(newValue);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calculate team performance from project metrics
  const calculateTeamPerformance = (team, project) => {
    if (!team) return 0;
    
    // Try to get metrics from associated project
    if (project && projectMetrics[project._id]) {
      const metrics = projectMetrics[project._id];
      return metrics.health?.healthScore || metrics.progress?.progress || 0;
    }
    
    // Fallback calculation
    if (!team.members || team.members.length === 0) return 0;
    const teamIdHash = team._id ? parseInt(team._id.slice(-3), 16) % 100 : 0;
    return Math.min(100, Math.max(20, 50 + (teamIdHash % 50)));
  };

  const calculateTeamEngagement = (team) => {
    if (!team.members || team.members.length === 0) return 0;
    // Simulate engagement score
    const teamIdHash = team._id ? parseInt(team._id.slice(-4), 16) % 100 : 0;
    return Math.min(100, Math.max(30, 60 + (teamIdHash % 40)));
  };

  // Find project associated with a team
  const findTeamProject = (team) => {
    return projects.find(project => 
      project.teamId && project.teamId._id === team._id
    ) || team.project;
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && project.status !== 'completed') ||
                         (filterStatus === 'completed' && project.status === 'completed');
    return matchesSearch && matchesStatus;
  });

  const filteredTeams = teams.filter(team => {
    const teamProject = findTeamProject(team);
    const matchesSearch = team.teamName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (teamProject?.projectName?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

const handleProjectExpand = async (projectId) => {
  if (expandedProject === projectId) {
    setExpandedProject(null);
  } else {
    setExpandedProject(projectId);
    console.log("projectid: ", projectId)
    // If we haven't loaded tasks for this project yet, fetch them
    if (!projectTasks[projectId]) {
      setLoadingTasks(prev => ({ ...prev, [projectId]: true }));
      try {
        const token = localStorage.getItem("token");
        const response = await axiosClient.get(`/user/tasks/project/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          setProjectTasks(prev => ({ 
            ...prev, 
            [projectId]: response.data.tasks || []
          }));
        }
      } catch (error) {
        console.error('Error fetching project tasks:', error);
      } finally {
        setLoadingTasks(prev => ({ ...prev, [projectId]: false }));
      }
    }
  }
};

const handleTaskSelect = (projectId, taskId, checked) => {
  const projectSelectedTasks = selectedTasks[projectId] || new Set();
  const newSelected = new Set(projectSelectedTasks);
  
  if (checked) {
    newSelected.add(taskId);
  } else {
    newSelected.delete(taskId);
  }
  
  setSelectedTasks(prev => ({
    ...prev,
    [projectId]: newSelected
  }));
};

const handleSelectAll = (projectId, checked) => {
  const tasks = projectTasks[projectId] || [];
  if (checked) {
    setSelectedTasks(prev => ({
      ...prev,
      [projectId]: new Set(tasks.map(task => task._id))
    }));
  } else {
    setSelectedTasks(prev => ({
      ...prev,
      [projectId]: new Set()
    }));
  }
};

// Add this function to handle task status change (you'll need to implement API call)
const handleTaskStatusChange = async (taskId, status) => {
  try {
    const token = localStorage.getItem("token");
    await axiosClient.put(`/tasks/${taskId}/status`, 
      { status },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    // Refresh the tasks for the project
    if (expandedProject) {
      handleProjectExpand(expandedProject);
    }
  } catch (error) {
    console.error('Error updating task status:', error);
  }
};
  const StatsCard = ({ title, value, icon, onClick, subtitle }) => {
    const primaryColor = theme.palette.primary.main;
    
    return (
      <Paper
        onClick={onClick}
        sx={{
          p: 3,
          borderRadius: 3,
          background: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          cursor: onClick ? 'pointer' : 'default',
          transition: 'all 0.3s ease',
          '&:hover': onClick ? {
            transform: 'translateY(-4px)',
            boxShadow: theme.shadows[8],
            borderColor: primaryColor,
            backgroundColor: theme.palette.mode === 'dark' 
              ? lighten(theme.palette.background.paper, 0.05)
              : darken(theme.palette.background.paper, 0.02)
          } : {},
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            width: 56,
            height: 56,
            minWidth: 56,
            minHeight: 56,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: alpha(primaryColor, 0.1),
            color: primaryColor,
            flexShrink: 0
          }}>
            {React.cloneElement(icon, { sx: { fontSize: 28 } })}
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography 
              variant="h3" 
              fontWeight="800" 
              color="text.primary"
              sx={{ 
                lineHeight: 1.2,
                mb: 0.5,
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {value}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontWeight: 500 }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      </Paper>
    );
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed': return 'success';
      case 'ongoing': return 'primary';
      case 'pending': return 'warning';
      case 'review': return 'info';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getHealthColor = (healthLevel) => {
    switch(healthLevel?.toLowerCase()) {
      case 'excellent': return 'success';
      case 'healthy':
      case 'good': return 'primary';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const getRiskColor = (riskLevel) => {
    switch(riskLevel?.toLowerCase()) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  // Render metrics section for project
  const renderProjectMetrics = (project) => {
    const metrics = projectMetrics[project._id] || project.metrics;
    
    if (!metrics) return null;
    
    return (
      <Grid container spacing={2}>
        <Grid item xs={6} md={3}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" fontWeight="700" color="text.primary">
              {metrics.progress?.progress || 0}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Progress
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6} md={3}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" fontWeight="700" color={getHealthColor(metrics.health?.healthLevel)}>
              {metrics.health?.healthScore || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Health Score
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6} md={3}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" fontWeight="700" color={getRiskColor(metrics.projectRisk?.riskLevel)}>
              {metrics.projectRisk?.projectRiskScore || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Risk Score
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6} md={3}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" fontWeight="700" color="text.primary">
              {metrics.proofCompliance?.complianceRate || 0}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Proof Compliance
            </Typography>
          </Box>
        </Grid>
      </Grid>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      py: 4, 
      px: { xs: 2, sm: 3 },
      minHeight: '100vh',
      background: theme.palette.mode === 'dark'
        ? `linear-gradient(135deg, ${theme.palette.background.default} 0%, #0d1b2a 100%)`
        : `linear-gradient(135deg, ${theme.palette.background.default} 0%, #f0f4f8 100%)`,
    }}>
      <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 2 } }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h4" fontWeight="700" sx={{ mb: 1 }} color="text.primary">
                Mentor Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Monitor and guide projects and teams you're mentoring
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={fetchAllData}
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
              Refresh Data
            </Button>
          </Box>

          {/* Quick Stats */}
          <Box 
            sx={{ 
              display: 'grid',
              gridTemplateColumns: { 
                xs: '1fr', 
                sm: 'repeat(2, 1fr)', 
                md: 'repeat(4, 1fr)' 
              },
              gap: 3,
              mb: 4
            }}
          >
            <StatsCard
              title="Total Projects"
              value={projects.length}
              icon={<Source sx={{ fontSize: 28, color: 'text.secondary' }} />}
              onClick={() => {
                setMainTabValue(0);
                setFilterStatus('all')
              }}
            />
            
            <StatsCard
              title="Total Teams"
              value={teams.length}
              icon={<Group sx={{ fontSize: 28, color: 'text.secondary' }} />}
              onClick={() => setMainTabValue(1)}
            />
            
            <StatsCard
              title="Active Projects"
              value={projects.filter(p => p.status !== 'completed').length}
              icon={<Monitor sx={{ fontSize: 28, color: 'text.secondary' }} />}
              onClick={() => {
                setMainTabValue(0);
                setFilterStatus('active');
              }}
            />
            
            <StatsCard
              title="Total Members"
              value={teams.reduce((sum, team) => sum + (team.members?.length || 0), 0)}
              icon={<People sx={{ fontSize: 28, color: 'text.secondary' }} />}
              onClick={() => setMainTabValue(1)}
            />
          </Box>
        </Box>

        {/* Main Content */}
        <Card sx={{ borderRadius: 3, overflow: 'hidden', border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          {/* Main Tabs - Projects vs Teams */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={mainTabValue} onChange={handleMainTabChange}>
              <Tab label="Projects" />
              <Tab label="Teams" />
            </Tabs>
          </Box>

          {/* Toolbar */}
          <Box sx={{ 
            p: 3, 
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            flexWrap: 'wrap'
          }}>
            <TextField
              size="small"
              placeholder={mainTabValue === 0 ? "Search projects..." : "Search teams..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 300 }}
            />
            
            {mainTabValue === 0 && (
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Status"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">All Projects</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            )}
            
            <Box sx={{ flex: 1 }} />
            
            <Tooltip title="Export Data">
              <IconButton>
                <Download />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Content Area */}
          <Box sx={{ p: 3 }}>
            {/* PROJECTS TAB CONTENT */}
            {mainTabValue === 0 && (
              <>
                {/* Detail Tabs for Projects */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                  <Tabs value={detailTabValue} onChange={handleDetailTabChange}>
                    <Tab label="All Projects" />
                    <Tab label="Project Details" disabled={!selectedProject} />
                    <Tab label="Analytics" />
                  </Tabs>
                </Box>

                {detailTabValue === 0 && (
                  <>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ backgroundColor: 'transparent' }}>
                            <TableCell 
                              padding="checkbox"
                              sx={{
                                borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                backgroundColor: theme.palette.mode === 'dark' 
                                  ? alpha(theme.palette.background.paper, 0.8)
                                  : alpha(theme.palette.background.paper, 0.9),
                                backdropFilter: 'blur(10px)',
                                position: 'sticky',
                                top: 0,
                                zIndex: 2,
                                borderRadius: '12px 0 0 0',
                              }}
                            >
                              {/* Expand/collapse column */}
                            </TableCell>

                            {[
                              { label: 'PROJECT NAME', width: '25%' },
                              { label: 'TEAM', width: '15%' },
                              { label: 'STATUS', width: '10%' },
                              { label: 'HEALTH SCORE', width: '10%' },
                              { label: 'RISK LEVEL', width: '10%' },
                              { label: 'PROGRESS', width: '15%' },
                              { label: 'ACTIONS', width: '1%' },
                            ].map((header, index) => (
                              <TableCell 
                                key={header.label}
                                sx={{
                                  width: header.width,
                                  borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                  backgroundColor: theme.palette.mode === 'dark' 
                                    ? alpha(theme.palette.background.paper, 0.8)
                                    : alpha(theme.palette.background.paper, 0.9),
                                  backdropFilter: 'blur(10px)',
                                  position: 'sticky',
                                  top: 0,
                                  zIndex: 2,
                                  ...(index === 6 && { borderRadius: '0 12px 0 0' }),
                                  verticalAlign:"middle",
                                    textAlign: 'center',

                                }}
                              >
                                <Typography 
                                  variant="subtitle2" 
                                  sx={{
                                    fontWeight: 700,
                                    color: theme.palette.primary.main,
                                    fontFamily: '"Inter", sans-serif',
                                    letterSpacing: '0.05em',
                                    textTransform: 'uppercase',
                                    fontSize: '0.8rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                  }}
                                >
                                  {index === 0 && <Title fontSize="small" />}
                                  {index === 1 && <Group fontSize="small" />}
                                  {index === 2 && <Circle fontSize="small" />}
                                  {index === 3 && <TrendingUp fontSize="small" />}
                                  {index === 4 && <Warning fontSize="small" />}
                                  {index === 5 && <Task fontSize="small" />}
                                  {index === 6 && <Settings fontSize="small" />}
                                  {header.label}
                                </Typography>
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredProjects
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((project) => {
                              const metrics = projectMetrics[project._id] || project.metrics || {};
                              const healthScore = metrics.health?.healthScore || 0;
                              const riskLevel = metrics.projectRisk?.riskLevel || 'low';
                              const tasksForProject = projectTasks[project._id] || [];
                              const selectedProjectTasks = selectedTasks[project._id] || new Set();
                              const allSelected = tasksForProject.length > 0 && 
                                                selectedProjectTasks.size === tasksForProject.length;
                              
                              return (
                                <React.Fragment key={project._id}>
                                  {/* Project Row */}
                                  <TableRow 
                                    hover
                                    sx={{ 
                                      cursor: 'pointer',
                                      '&:hover': {
                                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                                      }
                                    }}
                                  >
                                    <TableCell>
                                      <IconButton
                                        size="small"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleProjectExpand(project._id);
                                        }}
                                        sx={{
                                          transform: expandedProject === project._id ? 'rotate(180deg)' : 'rotate(0deg)',
                                          transition: 'transform 0.2s',
                                        }}
                                      >
                                        <KeyboardArrowDown />
                                      </IconButton>
                                    </TableCell>

                                    <TableCell 
                                    onClick={(e) => {
                                          e.stopPropagation();
                                          handleProjectExpand(project._id);
                                        }}
                                    onDoubleClick={() => {
                                      setSelectedProject(project);
                                      setDetailTabValue(1);
                                    }}>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{
                                          width: 40,
                                          height: 40,
                                          borderRadius: 2,
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          background: alpha(theme.palette.primary.main, 0.1)
                                        }}>
                                          <Source sx={{ color: theme.palette.primary.main }} />
                                        </Box>
                                        <Box>
                                          <Typography variant="subtitle1" fontWeight="600">
                                            {project.projectName}
                                          </Typography>
                                          <Typography variant="caption" color="text.secondary">
                                            {project.description?.substring(0, 50) || 'No description'}...
                                          </Typography>
                                        </Box>
                                      </Box>
                                    </TableCell>
                                    <TableCell>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Group sx={{ fontSize: 16, color: 'text.secondary' }} />
                                        <Typography>
                                          {project.teamId?.name || 'No team'}
                                        </Typography>
                                      </Box>
                                    </TableCell>
                                    <TableCell>
                                      <Chip
                                        label={project.status || 'Ongoing'}
                                        size="small"
                                        color={getStatusColor(project.status)}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Chip
                                          label={`${healthScore}`}
                                          size="small"
                                          color={getHealthColor(metrics.health?.healthLevel)}
                                          variant="outlined"
                                        />
                                      </Box>
                                    </TableCell>
                                    <TableCell sx={{textAlign:'center'}}>
                                      <Chip
                                        label={riskLevel.toUpperCase()}
                                        size="small"
                                        color={getRiskColor(riskLevel)}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <LinearProgress
                                          variant="determinate"
                                          value={metrics.progress?.progress || 0}
                                          sx={{
                                            flex: 1,
                                            height: 6,
                                            borderRadius: 3,
                                          }}
                                        />
                                        <Typography variant="body2" sx={{ minWidth: 40 }}>
                                          {metrics.progress?.progress || 0}%
                                        </Typography>
                                      </Box>
                                    </TableCell>
                                    <TableCell align="right">
                                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                        <Tooltip title="View Details">
                                          <IconButton
                                            size="small"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedProject(project);
                                              setDetailTabValue(1);
                                            }}
                                          >
                                            <Visibility fontSize="small" />
                                          </IconButton>
                                        </Tooltip>
                                        <Tooltip title="View Metrics">
                                          <IconButton
                                            size="small"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              navigate(`/teacher-app/projects/${project._id}/metrics`);
                                            }}
                                          >
                                            <Insights fontSize="small" />
                                          </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Provide Feedback">
                                          <IconButton
                                            size="small"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setReviewModalOpen(true);
                                            }}
                                          >
                                            <Comment fontSize="small" />
                                          </IconButton>
                                        </Tooltip>
                                      </Box>
                                    </TableCell>
                                  </TableRow>
                                  
                                  {/* Tasks Sub-rows */}
                                  <TableRow>
                                    <TableCell 
                                      style={{ paddingBottom: 0, paddingTop: 0 }} 
                                      colSpan={10}
                                      sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.02) }}
                                    >
                                      <Collapse in={expandedProject === project._id} timeout="auto" unmountOnExit>
                                        <Box sx={{ margin: 1, py: 2 }}>
                                          {loadingTasks[project._id] ? (
                                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                              <CircularProgress size={24} />
                                            </Box>
                                          ) : tasksForProject.length > 0 ? (
                                            <>
                                              {/* Tasks Table Header */}
                                              <Table size="small" sx={{ mb: 2 }}>
                                                <TableHead>
                                                  <TableRow>
                                                    <TableCell padding="checkbox">
                                                      <Checkbox
                                                        checked={allSelected}
                                                        indeterminate={selectedProjectTasks.size > 0 && !allSelected}
                                                        onChange={(e) => handleSelectAll(project._id, e.target.checked)}
                                                      />
                                                    </TableCell>
                                                    {[
                                                      { label: 'TASK TITLE', width: '25%' },
                                                      { label: 'STATUS', width: '12%' },
                                                      { label: 'ASSIGNEE', width: '15%' },
                                                      { label: 'DEADLINE', width: '12%' },
                                                      { label: 'PRIORITY', width: '10%' },
                                                      { label: 'PROGRESS', width: '10%' },
                                                      { label: 'ACTIONS', width: '1%' },
                                                    ].map((header, index) => (
                                                      <TableCell 
                                                        key={header.label}
                                                        sx={{ 
                                                          width: header.width,
                                                          fontWeight: 600,
                                                          fontSize: '0.75rem',
                                                          color: theme.palette.text.secondary
                                                        }}
                                                      >
                                                        {header.label}
                                                      </TableCell>
                                                    ))}
                                                  </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                  {tasksForProject.map((task) => (
                                                    <TableRow key={task._id} hover >
                                                      <TableCell padding="checkbox">
                                                        <Checkbox
                                                          checked={selectedProjectTasks.has(task._id)}
                                                          onChange={(e) => handleTaskSelect(project._id, task._id, e.target.checked)}
                                                        />
                                                      </TableCell>
                                                      <TableCell>
                                                        <Typography variant="body2" fontWeight={500}>
                                                          {task.taskTitle || task.title}
                                                        </Typography>
                                                      </TableCell>
                                                      <TableCell>
                                                        <Chip
                                                          label={task.status || 'Not Started'}
                                                          size="small"
                                                          color={
                                                            task.status === 'completed' ? 'success' :
                                                            task.status === 'in_progress' ? 'primary' :
                                                            task.status === 'paused' ? 'warning' : 'default'
                                                          }
                                                        />
                                                      </TableCell>
                                                      <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                          <Avatar
                                                            sx={{ width: 24, height: 24, fontSize: '0.75rem' }}
                                                            src={task.assignedTo?.avatar}
                                                          >
                                                            {task.assignedTo?.name?.charAt(0)}
                                                          </Avatar>
                                                          <Typography variant="body2">
                                                            {task.assignedTo?.name?.split(' ')[0] || 'Unassigned'}
                                                          </Typography>
                                                        </Box>
                                                      </TableCell>
                                                      <TableCell>
                                                        <Typography variant="body2">
                                                          {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                                                        </Typography>
                                                      </TableCell>
                                                      <TableCell>
                                                        <Chip
                                                          label={task.priority || 'Normal'}
                                                          size="small"
                                                          color={
                                                            task.priority === 'high' ? 'error' :
                                                            task.priority === 'medium' ? 'warning' : 'success'
                                                          }
                                                        />
                                                      </TableCell>
                                                      <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                          <LinearProgress
                                                            variant="determinate"
                                                            value={task.progress || task.completionPercentage || 0}
                                                            sx={{
                                                              flex: 1,
                                                              height: 4,
                                                              borderRadius: 2,
                                                            }}
                                                          />
                                                          <Typography variant="body2" sx={{ minWidth: 35 }}>
                                                            {task.progress || task.completionPercentage || 0}%
                                                          </Typography>
                                                        </Box>
                                                      </TableCell>
                                                      <TableCell sx={{alignContent: 'center', textAlign: 'center'}}>
                                                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent:'center' }}>
                                                          <Tooltip title="View Details">
                                                            <IconButton size="small" onClick={() => {
                                                              getUser();
                                                              setDetailsOpen(true);
                                                              setSelectedTask(task);
                                                              }}>
                                                              <Visibility fontSize="small" />
                                                            </IconButton>
                                                          </Tooltip>
                                                        </Box>
                                                      </TableCell>
                                                    </TableRow>
                                                  ))}
                                                </TableBody>
                                              </Table>
                                            </>
                                          ) : (
                                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                              <Typography variant="body2" color="text.secondary">
                                                No tasks found for this project
                                              </Typography>
                                            </Box>
                                          )}
                                        </Box>
                                      </Collapse>
                                    </TableCell>
                                  </TableRow>
                                </React.Fragment>
                              );
                            })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25]}
                      component="div"
                      count={filteredProjects.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                  </>
                )}
{detailTabValue === 1 && selectedProject && (
  <Box>
    {/* Project Header */}
    <Box sx={{ mb: 4 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        mb: 3,
        gap: 2,
        flexWrap: 'wrap' 
      }}>
        <Box sx={{ flex: 1, minWidth: 300 }}>
          <Typography variant="h5" fontWeight="700" sx={{ mb: 1.5 }}>
            {selectedProject.projectName}
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            gap: 1.5, 
            alignItems: 'center', 
            flexWrap: 'wrap',
            mb: 1.5 
          }}>
            <Chip
              label={selectedProject.status || 'Ongoing'}
              size="small"
              color={getStatusColor(selectedProject.status)}
              sx={{ fontWeight: 500 }}
            />
            {selectedProject.endDate && (
              <Chip
                label={`Due: ${new Date(selectedProject.endDate).toLocaleDateString()}`}
                size="small"
                variant="outlined"
                icon={<CalendarMonth fontSize="small" />}
                sx={{ fontWeight: 500 }}
              />
            )}
          </Box>
        </Box>
        <Box sx={{ 
          display: 'flex', 
          gap: 1.5,
          flexWrap: 'wrap'
        }}>
          <Button
            variant="outlined"
            startIcon={<Comment />}
            onClick={() => setReviewModalOpen(true)}
            sx={{ 
              borderRadius: 2,
              px: 2.5,
              py: 1
            }}
          >
            Provide Feedback
          </Button>
          <Button
            variant="contained"
            startIcon={<Insights />}
            onClick={() => navigate(`/teacher-app/feedback`)}
            sx={{ 
              borderRadius: 2,
              px: 2.5,
              py: 1,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
            }}
          >
            View Detailed Metrics
          </Button>
        </Box>
      </Box>
      
      <Paper elevation={0} sx={{ 
        p: 3, 
        borderRadius: 2,
        backgroundColor: theme.palette.action.hover,
        border: `1px solid ${theme.palette.divider}`
      }}>
        <Typography variant="body1" color="text.primary" sx={{ lineHeight: 1.7 }}>
          {selectedProject.description || 'No description provided.'}
        </Typography>
      </Paper>
    </Box>

    {/* Project Metrics Overview */}
    <Box sx={{ mb: 4 }}>
      {renderProjectMetrics(selectedProject)}
    </Box>

    {/* Detailed Metrics */}
    <Box sx={{ 
      display: 'flex', 
      gap: 3, 
      mb: 4,
      flexWrap: 'wrap' 
    }}>
      {/* Project Health Card */}
      <Paper elevation={0} sx={{ 
        flex: 1,
        minWidth: 320,
        p: 3, 
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5,
          mb: 2.5 
        }}>
          <Assignment sx={{ 
            color: theme.palette.primary.main,
            fontSize: 24 
          }} />
          <Typography variant="h6" fontWeight="600">
            Project Health Overview
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {/* Team Size */}
          <Box sx={{ flex: 1, minWidth: 140 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              mb: 0.5 
            }}>
              <Typography variant="caption" color="text.secondary">
                Team Size
              </Typography>
              <People fontSize="small" sx={{ color: theme.palette.text.secondary }} />
            </Box>
            <Typography variant="h4" fontWeight="700">
              {selectedProject.teamId?.members?.length || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              members
            </Typography>
          </Box>
          
          {/* Tasks Completed */}
          <Box sx={{ flex: 1, minWidth: 140 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              mb: 0.5 
            }}>
              <Typography variant="caption" color="text.secondary">
                Tasks Completed
              </Typography>
              <CheckCircle fontSize="small" sx={{ color: theme.palette.text.secondary }} />
            </Box>
            <Typography variant="h4" fontWeight="700">
              {selectedProject.metrics?.progress?.completedTasks || 0}
              <Typography component="span" variant="h6" color="text.secondary" sx={{ mx: 0.5 }}>
                /
              </Typography>
              {selectedProject.metrics?.progress?.totalTasks || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              total tasks
            </Typography>
          </Box>
          
          {/* Risk Level */}
          <Box sx={{ flex: 1, minWidth: 140 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              mb: 0.5 
            }}>
              <Typography variant="caption" color="text.secondary">
                Risk Level
              </Typography>
              <Warning fontSize="small" sx={{ color: theme.palette.text.secondary }} />
            </Box>
            <Typography variant="h4" fontWeight="700" color={getRiskColor(selectedProject.metrics?.projectRisk?.riskLevel)}>
              {selectedProject.metrics?.projectRisk?.riskLabel || 'Low'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              risk assessment
            </Typography>
          </Box>
          
          {/* Proof Compliance */}
          <Box sx={{ flex: 1, minWidth: 140 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              mb: 0.5 
            }}>
              <Typography variant="caption" color="text.secondary">
                Proof Compliance
              </Typography>
              <Verified fontSize="small" sx={{ color: theme.palette.text.secondary }} />
            </Box>
            <Typography variant="h4" fontWeight="700">
              {selectedProject.metrics?.proofCompliance?.complianceRate || 0}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              completion rate
            </Typography>
          </Box>
        </Box>
      </Paper>
      
      {/* Time Efficiency Card */}
      <Paper elevation={0} sx={{ 
        flex: 1,
        minWidth: 320,
        p: 3, 
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1.5,
          mb: 2.5 
        }}>
          <AccessTime sx={{ 
            color: theme.palette.warning.main,
            fontSize: 24 
          }} />
          <Typography variant="h6" fontWeight="600">
            Time Efficiency
          </Typography>
        </Box>
        
        {selectedProject.metrics?.timeEfficiency ? (
          <Stack spacing={2.5}>
            {/* Efficiency Score */}
            <Box>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 1 
              }}>
                <Typography variant="body2" color="text.secondary">
                  Project Efficiency
                </Typography>
                <Chip
                  label={selectedProject.metrics.timeEfficiency.label}
                  size="small"
                  sx={{ 
                    fontWeight: 500,
                    backgroundColor: 
                      selectedProject.metrics.timeEfficiency.status === 'good' ? theme.palette.success.light + '40' :
                      selectedProject.metrics.timeEfficiency.status === 'warning' ? theme.palette.warning.light + '40' :
                      theme.palette.error.light + '40',
                    color: 
                      selectedProject.metrics.timeEfficiency.status === 'good' ? theme.palette.success.dark :
                      selectedProject.metrics.timeEfficiency.status === 'warning' ? theme.palette.warning.dark :
                      theme.palette.error.dark
                  }}
                />
              </Box>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'baseline', 
                gap: 1 
              }}>
                <Typography variant="h3" fontWeight="700">
                  {selectedProject.metrics.timeEfficiency.projectEfficiency}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  %
                </Typography>
              </Box>
            </Box>
            
            <Divider sx={{ my: 1 }} />
            
            {/* Time Breakdown */}
            <Box sx={{ 
              display: 'flex',
              gap: 3,
              flexWrap: 'wrap' 
            }}>
              <Box>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  mb: 0.5 
                }}>
                  <Typography variant="caption" color="text.secondary">
                    Focus Time
                  </Typography>
                  <Timer fontSize="small" sx={{ color: theme.palette.text.secondary }} />
                </Box>
                <Typography variant="h5" fontWeight="600">
                  {formatTime(selectedProject.metrics.timeEfficiency.totalFocusTime)}
                  <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                    hours
                  </Typography>
                </Typography>
              </Box>
              
              <Box>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  mb: 0.5 
                }}>
                  <Typography variant="caption" color="text.secondary">
                    Estimated Time
                  </Typography>
                  <Schedule fontSize="small" sx={{ color: theme.palette.text.secondary }} />
                </Box>
                <Typography variant="h5" fontWeight="600">
                  {formatTime(selectedProject.metrics.timeEfficiency.totalEstimatedTime)}
                  <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                    hours
                  </Typography>
                </Typography>
              </Box>
            </Box>
          </Stack>
        ) : (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            py: 4 
          }}>
            <QueryBuilder sx={{ 
              fontSize: 48, 
              color: theme.palette.text.disabled,
              mb: 2 
            }} />
            <Typography variant="body2" color="text.secondary">
              No time efficiency data available
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  </Box>
)}

                {detailTabValue === 2 && (
                  <Box>
                    <Typography variant="h5" fontWeight="700" sx={{ mb: 3 }}>
                      Projects Analytics
                    </Typography>
                    
                    {projects.length > 0 ? (
                      <Grid container spacing={3}>
                        {projects.map((project) => {
                          const metrics = projectMetrics[project._id] || project.metrics || {};
                          return (
                            <Grid item xs={12} md={6} lg={4} key={project._id}>
                              <Paper sx={{ p: 3, borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                  <Box>
                                    <Typography variant="subtitle1" fontWeight="600">
                                      {project.projectName}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {project.teamId?.name || 'No team'}
                                    </Typography>
                                  </Box>
                                  <Chip
                                    label={`${metrics.health?.healthScore || 0}`}
                                    color={getHealthColor(metrics.health?.healthLevel)}
                                    size="small"
                                  />
                                </Box>
                                
                                <Box sx={{ mb: 2 }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="caption" color="text.secondary">
                                      Progress
                                    </Typography>
                                    <Typography variant="caption" fontWeight="600">
                                      {metrics.progress?.progress || 0}%
                                    </Typography>
                                  </Box>
                                  <LinearProgress
                                    variant="determinate"
                                    value={metrics.progress?.progress || 0}
                                    sx={{
                                      height: 6,
                                      borderRadius: 3,
                                    }}
                                  />
                                </Box>
                                
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Chip
                                    label={metrics.projectRisk?.riskLabel || 'Low Risk'}
                                    size="small"
                                    color={getRiskColor(metrics.projectRisk?.riskLevel)}
                                    variant="outlined"
                                  />
                                  <Typography variant="caption" color="text.secondary">
                                    {metrics.proofCompliance?.complianceRate || 0}% proof compliance
                                  </Typography>
                                </Box>
                              </Paper>
                            </Grid>
                          );
                        })}
                      </Grid>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Insights sx={{ fontSize: 48, color: 'text.disabled', mb: 2, opacity: 0.5 }} />
                        <Typography variant="body1" color="text.secondary">
                          No projects available for analytics
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </>
            )}

            {/* TEAMS TAB CONTENT */}
            {mainTabValue === 1 && (
              <>
                {/* Detail Tabs for Teams */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                  <Tabs value={detailTabValue} onChange={handleDetailTabChange}>
                    <Tab label="All Teams" />
                    <Tab label="Team Details" disabled={!selectedTeam} />
                  </Tabs>
                </Box>

                {detailTabValue === 0 && (
                  <>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Team Name</TableCell>
                            <TableCell>Project</TableCell>
                            <TableCell>Members</TableCell>
                            <TableCell>Team Health</TableCell>
                            <TableCell align="right">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {filteredTeams
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((team) => {
                              const teamProject = findTeamProject(team);
                              const performance = calculateTeamPerformance(team, teamProject);
                              
                              return (
                                <TableRow 
                                  key={team._id} 
                                  hover
                                  onClick={() => {
                                    setSelectedTeam(team);
                                    setDetailTabValue(1);
                                  }}
                                  sx={{ cursor: 'pointer' }}
                                >
                                  <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                      <Box sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        background: alpha(theme.palette.primary.main, 0.1)
                                      }}>
                                        <Group sx={{ color: theme.palette.primary.main }} />
                                      </Box>
                                      <Box>
                                        <Typography variant="subtitle1" fontWeight="600">
                                          {team.teamName}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {team.description?.substring(0, 50) || 'No description'}...
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                      <Stack spacing={1.5}>
                                      {team.projects.map((project) => (
                                        <Chip
                                        label={project.projectName || 'Unnamed Project'}
                                        size="medium"
                                        icon={<Source fontSize="small" sx={{padding: 0.3}} />}
                                        sx={{ 
                                          background: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main,
                                          width: 'fit-content',
                                          borderRadius: 1.4
                                        }}
                                      />
                                    ))}
                                      </Stack>
                                  </TableCell>
                                  <TableCell>
                                    <AvatarGroup max={4}>
                                      {team.members?.slice(0, 4).map((member, index) => (
                                        <Avatar 
                                          key={index}
                                          src={member.avatar}
                                          alt={member.name}
                                          sx={{ width: 32, height: 32 }}
                                        >
                                          {member.name?.charAt(0)}
                                        </Avatar>
                                      ))}
                                    </AvatarGroup>
                                    <Typography variant="caption" color="text.secondary">
                                      {team.members?.length || 0} members
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      <LinearProgress
                                        variant="determinate"
                                        value={performance}
                                        sx={{
                                          flex: 1,
                                          height: 6,
                                          borderRadius: 3,
                                        }}
                                        color={performance >= 70 ? 'success' : performance >= 40 ? 'warning' : 'error'}
                                      />
                                      <Typography variant="body2" sx={{ minWidth: 40 }}>
                                        {performance}%
                                      </Typography>
                                    </Box>
                                  </TableCell>
                                  <TableCell align="right">
                                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                      <Tooltip title="View Team Details">
                                        <IconButton
                                          size="small"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedTeam(team);
                                            setDetailTabValue(1);
                                          }}
                                        >
                                          <Visibility fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                      <Tooltip title="View Project">
                                        {teamProject && (
                                          <IconButton
                                            size="small"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              navigate(`/teacher-app/projects/${teamProject._id}`);
                                            }}
                                          >
                                            <Source fontSize="small" />
                                          </IconButton>
                                        )}
                                      </Tooltip>
                                    </Box>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <TablePagination
                      rowsPerPageOptions={[5, 10, 25]}
                      component="div"
                      count={filteredTeams.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                  </>
                )}

                {detailTabValue === 1 && selectedTeam && (
                  <Box>
                    {/* Team Header */}
                    <Box sx={{ mb: 4 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                        <Box>
                          <Typography variant="h5" fontWeight="700" sx={{ mb: 1 }}>
                            {selectedTeam.teamName}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                            <Chip
                              label={`${selectedTeam.members?.length || 0} members`}
                              size="small"
                              icon={<People />}
                            />
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="outlined"
                            startIcon={<Email />}
                            onClick={() => showSnackbar('Email team feature coming soon!', 'info')}
                          >
                            Email Team
                          </Button>
                        </Box>
                      </Box>
                      
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        {selectedTeam.description || 'No description provided.'}
                      </Typography>
                    </Box>

                    {/* Team Members */}
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Card sx={{ p: 3, borderRadius: 3 }}>
                          <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
                            Team Members
                          </Typography>
                          <List>
                            {selectedTeam.members?.map((member, index) => (
                              <ListItem key={index}>
                                <ListItemIcon>
                                  <Avatar src={member.avatar}>
                                    {member.name?.charAt(0)}
                                  </Avatar>
                                </ListItemIcon>
                                <ListItemText
                                  primary={member.name}
                                  secondary={member.email}
                                />
                                <Chip
                                  label={member.username}
                                  size="small"
                                  variant="outlined"
                                />
                              </ListItem>
                            )) || (
                              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                                No members
                              </Typography>
                            )}
                          </List>
                        </Card>
                      </Grid>
                      
                      <Grid item xs={12} md={6}>
                        <Card sx={{ p: 3, borderRadius: 3 }}>
                          <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
                            Associated Projects
                          </Typography>
                          {(() => {
                            const teamProjects = projects.filter(p => 
                              p.teamId && p.teamId._id === selectedTeam._id
                            );
                            
                            return teamProjects.length > 0 ? (
                              <List>
                                {teamProjects.map(project => (
                                  <ListItem key={project._id}>
                                    <ListItemIcon>
                                      <Source />
                                    </ListItemIcon>
                                    <ListItemText
                                      primary={project.projectName}
                                      secondary={project.status}
                                    />
                                    <Button
                                      size="small"
                                      onClick={() => navigate(`/teacher-app/projects/${project._id}`)}
                                    >
                                      View
                                    </Button>
                                  </ListItem>
                                ))}
                              </List>
                            ) : (
                              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                                No projects assigned to this team
                              </Typography>
                            );
                          })()}
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </>
            )}
          </Box>
        </Card>
      </Container>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      <TaskDetailsModal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        task={selectedTask}
        theme={theme}
        userRole={userRole}
        onTaskUpdate={handleTaskUpdate}
        onUploadProof={handleOpenUploadProof}
        onStatusChange={handleStatusChange}
      />
      <ReviewProjectModal
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        project={selectedProject}
        theme={theme}
      />
    </Box>
    
  );
}