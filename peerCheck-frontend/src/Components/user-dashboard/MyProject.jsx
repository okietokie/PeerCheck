import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Chip, 
  Avatar, 
  AvatarGroup,
  LinearProgress,
  Grid,
  Card,
  CardContent,
  Paper,
  Tabs,
  Tab,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  alpha,
  useTheme,
  CircularProgress,
  InputAdornment,
  Tooltip,
  Fab,
  Drawer,
  useMediaQuery,
  Menu,
  MenuItem,
  Autocomplete,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Edit,
  CheckCircle,
  PersonAdd,
  Upload,
  MoreVert,
  DragIndicator,
  Timeline,
  BarChart,
  Note,
  AttachFile,
  AccessTime,
  Task,
  Group,
  Description,
  Analytics,
  Download,
  Delete,
  Visibility,
  ArrowBack,
  Close,
  Folder,
  Info,
  TrendingUp,
  Comment,
  Speed,
  Warning,
  Error,
  CalendarToday,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Refresh,
  Grade,
  PlayArrow,
  Pause,
  Timer,
  FilterList,
  Sort,
  Assessment,
  Search,
  Add,
  MoreHoriz,
  ArrowForward,
  Star,
  WorkspacePremium,
  Rocket,
  Psychology,
  Code,
  DesignServices,
  AutoGraph,
  Cloud,
  Terminal,
  Palette,
  Brightness4,
  Brightness7,
  RefreshOutlined,
  Man,
  Person,
  AddTask,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '@/api/axiosClient';
import useInView from '@/hooks/useInView.js';
import { format, differenceInDays, isBefore } from 'date-fns';
import { CreateTaskModal } from './Projects';

const MyProject = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { ref, inView } = useInView({ threshold: 0.5 });
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [isEditing, setIsEditing] = useState({ state: false, field: 'Edit Project' });
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');

  const [user, setUser] = useState(null);
  const [members, setMembers] = useState([]);
  const [activeMemberCount, setActiveMemberCount] = useState(0);
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [teams, setTeams] = useState(null);

  const [activeTab, setActiveTab] = useState(0);
  const [addMemberDialog, setAddMemberDialog] = useState(false);
  const [projectFiles, setProjectFiles] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [taskActionsAnchor, setTaskActionsAnchor] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(theme.palette.mode === 'dark');
  const [projectMetrics, setProjectMetrics] = useState(null);
  const [memberEfficiencies, setMemberEfficiencies] = useState({});
  const [overallEfficiency, setOverallEfficiency] = useState(null);

  const isMobile = useMediaQuery('(max-width: 900px)');

  // Enhanced color system that works with all themes
  const getThemeColor = (colorType = 'primary', variant = 'main') => {
    const colorMap = {
      success: theme.palette.success?.main || (theme.palette.mode === 'dark' ? '#4caf50' : '#2e7d32'),
      warning: theme.palette.warning?.main || (theme.palette.mode === 'dark' ? '#ff9800' : '#ed6c02'),
      error: theme.palette.error?.main || (theme.palette.mode === 'dark' ? '#f44336' : '#d32f2f'),
      info: theme.palette.info?.main || (theme.palette.mode === 'dark' ? '#29b6f6' : '#0288d1'),
      primary: theme.palette.primary.main,
      secondary: theme.palette.secondary.main,
      background: theme.palette.background.default,
      paper: theme.palette.background.paper
    };
    
    if (variant === 'gradient') {
      return [colorMap[colorType], colorMap.secondary];
    }
    
    return colorMap[colorType];
  };

  const getContrastColor = (backgroundColor) => {
    if (!backgroundColor) return '#000000';
    const hex = backgroundColor.replace('#', '');
    if (hex.length !== 6) return '#000000';
    
    try {
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      const brightness = (r * 299 + g * 587 + b * 114) / 1000;
      return brightness > 128 ? '#000000' : '#ffffff';
    } catch (error) {
      return '#000000';
    }
  };

  const getGradientBackground = () => {
    if (theme.palette.mode === 'dark') {
      return `linear-gradient(135deg, 
        ${alpha(getThemeColor('primary'), 0.15)} 0%, 
        ${alpha(getThemeColor('secondary'), 0.08)} 50%, 
        ${alpha(getThemeColor('background'), 0.95)} 100%
      )`;
    }
    return `linear-gradient(135deg, 
      ${alpha(getThemeColor('primary'), 0.08)} 0%, 
      ${alpha(getThemeColor('secondary'), 0.05)} 50%, 
      ${alpha(getThemeColor('background'), 0.98)} 100%
    )`;
  };

  const getCardGradient = (colorType = 'primary') => {
    const color = getThemeColor(colorType);
    return `linear-gradient(135deg, 
      ${alpha(color, theme.palette.mode === 'dark' ? 0.25 : 0.15)} 0%, 
      ${alpha(color, theme.palette.mode === 'dark' ? 0.1 : 0.05)} 100%
    )`;
  };

  const getBorderColor = (colorType = 'primary', intensity = 0.3) => {
    return alpha(getThemeColor(colorType), intensity);
  };

  const getGlassEffect = () => ({
    backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.2 : 0.9),
    backdropFilter: 'blur(20px)',
    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
    boxShadow: `0 8px 32px ${alpha(theme.palette.mode === 'dark' ? '#000' : getThemeColor('primary'), 0.1)}`,
  });

  const getStatusColor = (status) => {
    if (!status) return 'default';
    switch(status.toLowerCase()) {
      case 'completed': return 'success';
      case 'active': return 'primary';
      case 'paused': return 'warning';
      case 'not_started': return 'default';
      default: return 'default';
    }
  };

  const getRiskColor = (riskLevel) => {
    if (!riskLevel) return 'default';
    switch(riskLevel.toLowerCase()) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getEfficiencyColor = (efficiency) => {
    if (efficiency > 120) return 'error';
    if (efficiency > 100) return 'warning';
    if (efficiency >= 80) return 'success';
    return 'error';
  };

  const TabContent = ({ children, value, index }) => {
    return (
      <AnimatePresence mode="wait">
        {activeTab === index && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  const StatCard = ({ icon, value, label, colorType = 'primary', progress = null }) => {
    const color = getThemeColor(colorType);
    return (
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            background: getCardGradient(colorType),
            border: `1.5px solid ${getBorderColor(colorType, 0.3)}`,
            position: 'relative',
            overflow: 'hidden',
            height: '100%',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.7)})`,
              borderRadius: '3px 3px 0 0',
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: alpha(color, 0.15),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${alpha(color, 0.3)}`,
            }}>
              {React.cloneElement(icon, { 
                sx: { 
                  color: color,
                  fontSize: 24,
                  filter: `drop-shadow(0 2px 4px ${alpha(color, 0.3)})`
                } 
              })}
            </Box>
            <Typography variant="h4" fontWeight="800" sx={{ 
              fontFamily: '"Alkatra", cursive',
              color: color,
              lineHeight: 1,
              textShadow: `0 2px 4px ${alpha(color, 0.2)}`,
            }}>
              {value}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ 
            color: theme.palette.text.secondary,
            fontFamily: '"Adlam Display", serif',
            fontWeight: 500,
          }}>
            {label}
          </Typography>
          {progress !== null && (
            <LinearProgress 
              variant="determinate" 
              value={progress}
              sx={{
                mt: 2,
                height: 6,
                borderRadius: 3,
                backgroundColor: alpha(color, 0.1),
                '& .MuiLinearProgress-bar': {
                  background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.7)})`,
                }
              }}
            />
          )}
        </Paper>
      </motion.div>
    );
  };

  const FloatingActionButton = ({ icon, onClick, tooltip, color = 'primary', sx = {} }) => {
    const colorValue = getThemeColor(color);
    return (
      <Tooltip title={tooltip}>
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Fab
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 1000,
              background: `linear-gradient(135deg, ${colorValue}, ${alpha(colorValue, 0.8)})`,
              color: getContrastColor(colorValue),
              boxShadow: `0 8px 25px ${alpha(colorValue, 0.4)}`,
              '&:hover': {
                background: `linear-gradient(135deg, ${alpha(colorValue, 0.9)}, ${colorValue})`,
                boxShadow: `0 12px 35px ${alpha(colorValue, 0.6)}`,
              },
              ...sx
            }}
            onClick={onClick}
          >
            {icon}
          </Fab>
        </motion.div>
      </Tooltip>
    );
  };

  // Calculate efficiencies
  const calculateEfficiencies = useCallback(() => {
    if (!tasks || tasks.length === 0 || !members || members.length === 0) {
      return;
    }

    // Calculate per-task efficiency
    const taskEfficiencies = tasks.map(task => {
      // Calculate efficiency based on backend metrics or fallback calculation
      let efficiency = 0;
      
      // Try to get efficiency from taskMetrics first
      if (task?.taskMetrics && typeof task?.taskMetrics.efficiency === 'number') {
        efficiency = task.taskMetrics.efficiency;
      } 
      // Fallback to calculated efficiency
      else if (task?.estimatedTime && task?.estimatedTime > 0) {
        efficiency = (task?.totalFocusTime / task?.estimatedTime) * 100;
      }
      
      return {
        taskId: task?._id,
        taskTitle: task?.taskTitle,
        efficiency: Number(efficiency.toFixed(2)),
        assignedTo: task?.assignedTo?._id || task?.assignedTo
      };
    });

    // Calculate per-member efficiency
    const memberEff = {};
    members.forEach(member => {
      const memberTasks = tasks.filter(task => {
        const assigneeId = task.assignedTo?._id || task.assignedTo;
        return assigneeId === member._id;
      });
      
      if (memberTasks.length > 0) {
        const totalEstimated = memberTasks.reduce((sum, task) => sum + (task.estimatedTime || 0), 0);
        const totalFocus = memberTasks.reduce((sum, task) => sum + (task.totalFocusTime || 0), 0);
        const efficiency = totalEstimated > 0 ? (totalFocus / totalEstimated) * 100 : 0;
        
        memberEff[member._id] = {
          efficiency: Number(efficiency.toFixed(2)),
          taskCount: memberTasks.length,
          totalFocusTime: totalFocus,
          totalEstimatedTime: totalEstimated
        };
      } else {
        memberEff[member._id] = {
          efficiency: 0,
          taskCount: 0,
          totalFocusTime: 0,
          totalEstimatedTime: 0
        };
      }
    });

    // Calculate overall project efficiency
    const totalEstimated = tasks.reduce((sum, task) => sum + (task.estimatedTime || 0), 0);
    const totalFocus = tasks.reduce((sum, task) => sum + (task.totalFocusTime || 0), 0);
    const overallEff = totalEstimated > 0 ? (totalFocus / totalEstimated) * 100 : 0;

    setMemberEfficiencies(memberEff);
    setOverallEfficiency(Number(overallEff.toFixed(2)));
  }, [tasks, members]);

  // Calculate project metrics
  const calculateProjectMetrics = useCallback(() => {
    if (!tasks || tasks.length === 0) return null;

    // Calculate progress based on task status
    const statusWeights = {
      'not_started': 0,
      'active': 0.5,
      'paused': 0.3,
      'completed': 1
    };

    let totalWeight = 0;
    const statusBreakdown = {
      'not_started': 0,
      'active': 0,
      'paused': 0,
      'completed': 0
    };

    tasks.forEach(task => {
      const status = task.status || 'not_started';
      totalWeight += statusWeights[status] || 0;
      statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;
    });

    const weightedProgress = (totalWeight / tasks.length) * 100;

    // Calculate risk scores
    let highRiskTasks = 0;
    let mediumRiskTasks = 0;
    let lowRiskTasks = 0;
    let totalRiskScore = 0;

    tasks.forEach(task => {
      const riskScore = task.metrics?.riskScore || task.risk?.riskScore || 0;
      totalRiskScore += riskScore;
      
      // Check taskMetrics risk level first, then fallback to calculated
      const riskLevel = task.taskMetrics?.risk?.riskLevel || 
                       task.risk?.riskLevel || 
                       (riskScore >= 4 ? 'high' : riskScore >= 2 ? 'medium' : 'low');
      
      if (riskLevel === 'high') highRiskTasks++;
      else if (riskLevel === 'medium') mediumRiskTasks++;
      else lowRiskTasks++;
    });

    const averageRiskScore = tasks.length > 0 ? totalRiskScore / tasks.length : 0;
    let riskLevel = 'low';
    if (averageRiskScore >= 4) riskLevel = 'high';
    else if (averageRiskScore >= 2) riskLevel = 'medium';

    // Calculate deadline health
    const now = new Date();
    let overdueTasks = 0;
    let upcomingDeadlines = 0;
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    tasks.forEach(task => {
      if (task.deadline) {
        try {
          const deadline = new Date(task.deadline);
          const isOverdue = deadline < now && task.status !== 'completed';
          const isUpcoming = deadline > now && deadline <= sevenDaysFromNow;

          if (isOverdue) overdueTasks++;
          if (isUpcoming) upcomingDeadlines++;
        } catch (error) {
          console.error('Error parsing deadline:', error);
        }
      }
    });

    // Calculate proof compliance
    const tasksWithProof = tasks.filter(task => 
      task.proofUploads && task.proofUploads.length > 0
    ).length;
    const proofComplianceRate = tasks.length > 0 ? (tasksWithProof / tasks.length) * 100 : 0;

    // Calculate total time metrics
    const totalEstimatedTime = tasks.reduce((sum, task) => sum + (task.estimatedTime || 0), 0);
    const totalFocusTime = tasks.reduce((sum, task) => sum + (task.totalFocusTime || 0), 0);

    return {
      weightedProgress: Number(weightedProgress.toFixed(2)),
      statusBreakdown,
      averageRiskScore: Number(averageRiskScore.toFixed(2)),
      riskLevel,
      highRiskTasks,
      mediumRiskTasks,
      lowRiskTasks,
      overdueTasks,
      upcomingDeadlines,
      proofComplianceRate: Number(proofComplianceRate.toFixed(2)),
      tasksWithProof,
      totalTasks: tasks.length,
      completedTasks: statusBreakdown.completed || 0,
      totalEstimatedTime,
      totalFocusTime
    };
  }, [tasks]);

  // Show snackbar message
  const showSnackbar = (message, severity = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Fetch user data
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      const response = await axiosClient.get('/user/me', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setUser(response.data?.user);

      console.log("members:",members)

      if (members){
        console.log("fetchuserdata/members: ", members);

        const count = members.filter(member => member?.onlineStatus === "active");
        setActiveMemberCount(count.length);
        console.log("active member count:",activeMemberCount);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      showSnackbar('Error fetching user data', 'error');
    }
  };

  // Fetch project details
  const fetchProjectDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showSnackbar('Please login again', 'error');
        navigate('/login');
        return;
      }

      setLoading(true);

      const response = await axiosClient.get(`/projects/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const fetchedData = response?.data;
      if (!fetchedData) {
        throw new Error('No data received from server');
      }

      // Format dates
      const formatDate = (dateString) => {
        if (!dateString) return 'Not set';
        try {
          return format(new Date(dateString), 'MMMM dd, yyyy');
        } catch (error) {
          console.error('Error formatting date:', error);
          return 'Invalid date';
        }
      };

      // Fetch mentor data
      let mentorData = null;
      try {
        const mentorResponse = await axiosClient.get(`/user/get-mentor-for-project/${projectId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        mentorData = mentorResponse?.data?.mentor?.mentor || mentorResponse?.data?.mentor;
      } catch (mentorError) {
        console.warn('Error fetching mentor:', mentorError);
      }

      // Update project state
      const projectData = {
        projectId: fetchedData.id || projectId,
        createdBy: fetchedData.createdBy,
        description: fetchedData.description,
        gradingCriteria: fetchedData.gradingCriteria,
        metrics: fetchedData.metrics,
        milestones: fetchedData.milestones,
        progress: fetchedData.progress,
        startDate: formatDate(fetchedData.startDate),
        status: fetchedData.status,
        tags: fetchedData.tags || [],
        taskCount: fetchedData.taskCount || 0,
        teamId: fetchedData.teamId,
        teamName: fetchedData.teamName,
        updatedAt: formatDate(fetchedData.updatedAt),
        createdAt: formatDate(fetchedData.createdAt),
        endDate: formatDate(fetchedData.endDate),
        mentor: mentorData,
        toolkit: fetchedData.toolkit || [],
        projectName: fetchedData.projectName || 'Unnamed Project',
        teamMembers: fetchedData.teamId?.members || []
      };

      setProject(projectData);
      setMembers(fetchedData.teamId?.members || []);

      showSnackbar('Project data loaded successfully', 'success');
    } catch (error) {
      console.error('Error fetching project details:', error);
      showSnackbar(`Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
      setRefresh(false);
    }
  };

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axiosClient.get(`/user/tasks/project/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response?.data?.success) {
        const tasksData = response.data.tasks || [];
        
        const formattedTasks = tasksData.map(task => {
          // Helper function to safely format dates
          const formatDateTime = (dateString) => {
            if (!dateString) return 'No date';
            try {
              const date = new Date(dateString);
              return format(date, 'MMMM dd, yyyy HH:mm');
            } catch (error) {
              console.error('Error formatting date:', error);
              return 'Invalid date';
            }
          };

          // Calculate or get task efficiency
          let efficiency = 0;
          if (task.taskMetrics && typeof task.taskMetrics.efficiency === 'number') {
            efficiency = task.taskMetrics.efficiency;
          } else if (task.estimatedTime && task.estimatedTime > 0) {
            efficiency = (task.totalFocusTime / task.estimatedTime) * 100;
          }

          // Determine risk level
          let riskLevel = 'low';
          if (task.taskMetrics?.risk?.riskLevel) {
            riskLevel = task.taskMetrics.risk.riskLevel;
          } else if (task.risk?.riskLevel) {
            riskLevel = task.risk.riskLevel;
          } else if (task.metrics?.riskScore >= 4) {
            riskLevel = 'high';
          } else if (task.metrics?.riskScore >= 2) {
            riskLevel = 'medium';
          }

          return {
            ...task,
            _id: task._id,
            assignedTo: task.assignedTo || {
              _id: task.assignedTo?._id || task.assignedTo,
              name: task.assignedTo?.name || 'Unassigned',
              avatar: task.assignedTo?.avatar || '',
              email: task.assignedTo?.email || '',
            },
            assignedBy: task.assignedBy || {
              name: task.assignedBy?.name || 'Unknown',
              avatar: task.assignedBy?.avatar || '',
              email: task.assignedBy?.email || '',
            },
            createdAt: formatDateTime(task.createdAt),
            deadline: formatDateTime(task.deadline),
            updatedAt: formatDateTime(task.updatedAt),
            description: task.description || 'No description provided',
            estimatedTime: task.estimatedTime || 0,
            totalFocusTime: task.totalFocusTime || 0,
            taskEfficiency: Number(efficiency.toFixed(2)),
            riskLevel,
            flags: task.flags || {},
            gradingMeta: task.gradingMeta || {},
            lastEventTime: formatDateTime(task.lastEventTime),
            metrics: task.metrics || {},
            proofUploads: task.proofUploads || [],
            risk: task.risk || {},
            status: task.status || 'not_started',
            taskTitle: task.taskTitle || 'Untitled Task',
            projectId: task.projectId,
            taskMetrics: task.taskMetrics || {}
          };
        });

        setTasks(formattedTasks);
        showSnackbar(`Loaded ${formattedTasks.length} tasks`, 'success');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      showSnackbar('Error loading tasks', 'error');
    }
  };
  // Fetch user's teams
  useEffect(() => {
    const fetchUserTeams = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axiosClient.get("/user/teams", {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const teamsData = response.data?.teams || [];
        setTeams(Array.isArray(teamsData) ? teamsData : []);
        

      } catch (err) {
        console.error('Error fetching teams:', err);
      }
    };

    if (open) {
      fetchUserTeams();

    }
  }, []);
  // Fetch activity logs
  const fetchActivityLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Only fetch logs for tasks that exist
      const validTasks = tasks.filter(task => task && task._id);
      if (validTasks.length === 0) {
        setActivityLog([]);
        return;
      }

      const logsPromises = validTasks.map(task => 
        axiosClient.get(`/user/task/${task._id}/activity`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).catch(err => {
          console.error(`Error fetching activity for task ${task._id}:`, err);
          return { data: { logs: [] } };
        })
      );

      const responses = await Promise.all(logsPromises);
      const allLogs = responses.flatMap(response => response.data?.logs || []);
      
      // Format logs
      const formattedLogs = allLogs.map(log => {
        const formatTime = (timestamp) => {
          if (!timestamp) return 'Just now';
          try {
            const now = new Date();
            const logTime = new Date(timestamp);
            const diffMinutes = Math.floor((now - logTime) / (1000 * 60));
            
            if (diffMinutes < 1) return 'Just now';
            if (diffMinutes < 60) return `${diffMinutes}m ago`;
            if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
            return `${Math.floor(diffMinutes / 1440)}d ago`;
          } catch (error) {
            return 'Recent';
          }
        };

        return {
          id: log._id || Date.now(),
          action: log.action || 'Activity recorded',
          user: {
            name: log.user?.name || log.userName || 'System',
            avatar: log.user?.avatar || log.userAvatar || '',
            email: log.user?.email || log.userEmail || ''
          },
          time: formatTime(log.timestamp),
          timestamp: log.timestamp,
          metadata: log.metadata || {},
          eventType: log.eventType
        };
      });

      // Sort by timestamp (newest first)
      formattedLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setActivityLog(formattedLogs.slice(0, 50)); // Limit to 50 most recent
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    }
  };

  // Handle project edit
  const handleEditProjectButton = async () => {
    try {
      if (isEditing.state) {
        // Finish editing
        setIsEditing({ state: false, field: 'Edit Project' });
        
        const token = localStorage.getItem('token');
        console.log(project);
        const updateProject = async () => {
          try {
            const response = await axiosClient.patch(
              `/projects/${projectId}`, 
              {
                createdBy: project.createdBy,
                description: project.description,
                gradingCriteria: project.gradingCriteria,
                metrics: project.metrics,
                milestones: project.milestones,
                progress: project.progress,
                startDate: project.startDate,
                status: project.status,
                tags: project.tags || [],
                taskCount: project.taskCount,
                teamId: project.teamId,
                teamName: project.teamName,
                endDate: project.endDate,
                mentor: project.mentor,
                toolkit: project.toolkit || [],
                projectName: project.projectName, 
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              }
            );
            if (response?.data?.success) {
              showSnackbar('Project updated successfully', 'success');
            }
          } catch (error) {
            console.error('Error updating project:', error);
            showSnackbar('Error updating project', 'error');
          }
        };
        await updateProject();
        setRefresh(true);
      } else {
        // Start editing
        setIsEditing({ state: true, field: 'Finish Editing' });
      }
    } catch (error) {
      console.error('Error toggling edit mode:', error);
      showSnackbar('Error toggling edit mode', 'error');
    }
  };

  // Refresh all data
  const handleRefresh = async () => {
    setRefresh(true);
    await Promise.all([
      fetchUserData(),
      fetchProjectDetails(),
      fetchTasks()
    ]);
    showSnackbar('Data refreshed successfully', 'success');
  };

  const onCreateTask = (project) => {
    console.log("Selected Project: ", project);
    setCreateTaskModalOpen(true);
  };

  // Initialize
  useEffect(() => {
    if (projectId) {
      fetchUserData();
      fetchProjectDetails();
      fetchTasks();
    }
  }, [projectId, refresh]);

  // Calculate efficiencies when tasks or members change
  useEffect(() => {
    calculateEfficiencies();
  }, [tasks, members, calculateEfficiencies]);

  // Calculate project metrics
  useEffect(() => {
    const metrics = calculateProjectMetrics();
    setProjectMetrics(metrics);
  }, [tasks, calculateProjectMetrics]);

  // Update project files when tasks change
  useEffect(() => {
    const newFiles = [];
    tasks.forEach(task => {
      if (task?.proofUploads && Array.isArray(task.proofUploads)) {
        task.proofUploads.forEach((proof, index) => {
          if (proof) {
            newFiles.push({ 
              _id: proof._id || `${task._id}_${index}`,
              fileName: proof.filename || `Proof ${index + 1}`, 
              fileUrl: proof.fileUrl || '',
              uploadedAt: proof.uploadedAt || task.updatedAt || '',
              fileSize: proof.fileSize || 'Unknown',
              uploadedBy: task.assignedTo?.name || 'Unknown',
              taskTitle: task.taskTitle,
              fileType: proof.fileType || 'Unknown'
            });
          }
        });
      }
    });
    setProjectFiles(newFiles);
  }, [tasks]);

  // Load activity logs when tasks are loaded
  useEffect(() => {
    if (tasks.length > 0) {
      fetchActivityLogs();
    }
  }, [tasks]);

  if (loading && !project) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        bgcolor: 'background.default'
      }}>
        <CircularProgress
          sx={{ 
            color: getThemeColor('primary'),
          }}
        />
      </Box>
    );
  }

  return (
    <>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Box 
        sx={{ 
          bgcolor: 'background.default', 
          minHeight: '100vh',
          position: 'relative',
          overflow: 'hidden',
          background: getGradientBackground(),
          transition: 'background 0.5s ease',
        }}
      >
        {/* Animated background elements */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 0,
          opacity: theme.palette.mode === 'dark' ? 0.1 : 0.05,
        }}>
          {[...Array(20)].map((_, i) => (
            <Box
              key={i}
              sx={{
                position: 'absolute',
                width: Math.random() * 100 + 50,
                height: 2,
                background: `linear-gradient(90deg, transparent, ${getThemeColor('primary')}, transparent)`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: 'pulse 3s infinite',
                animationDelay: `${Math.random() * 5}s`,
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 0.1 },
                  '50%': { opacity: 0.5 },
                }
              }}
            />
          ))}
        </Box>

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, py: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate('/user-app/projects')}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  fontFamily: '"Adlam Display", serif',
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  color: theme.palette.text.primary,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                    transform: 'translateX(-4px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Back to Projects
              </Button>
            </motion.div>

            <Box sx={{display: 'flex', gap:'1em', px: 1}}>
            <Tooltip title="Create New Task">
              <IconButton 
                size="small" 
                onClick={() => onCreateTask(project)} 
                disabled={project?.status === 'COMPLETED' || project?.createdBy._id !== user?._id}
                sx={{
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  color: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                    transform: 'rotate(30deg)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <AddTask fontSize="large" />
              </IconButton> 
            </Tooltip>
            
            <Tooltip title="Refresh Project Data">
              <IconButton
                onClick={handleRefresh}
                sx={{
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  color: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                    transform: 'rotate(180deg)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                <RefreshOutlined />
              </IconButton>
            </Tooltip>
            </Box>
          </Box>

          {/* Project Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                mb: 4,
                borderRadius: 4,
                ...getGlassEffect(),
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '100%',
                  background: `linear-gradient(45deg, 
                    ${alpha(theme.palette.primary.main, 0.05)} 0%, 
                    transparent 50%, 
                    ${alpha(theme.palette.secondary.main, 0.05)} 100%
                  )`,
                  zIndex: 0,
                }
              }}
            >
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                  <Box sx={{ flex: 1, minWidth: '300px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar
                        sx={{
                          width: 60,
                          height: 60,
                          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          fontSize: 24,
                          fontWeight: 'bold',
                          boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
                          border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                        }}
                      >
                        <Psychology />
                      </Avatar>
                      <Box>
                        <Typography variant="h2" sx={{ 
                          fontFamily: '"Adlam Display", serif',
                          fontWeight: 500,
                          mb: 0.5,
                          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          textShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.2)}`,
                        }}>
                          {project?.projectName || 'Unnamed Project'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                          <Chip 
                            label={project?.status || 'Unknown'} 
                            color={project?.status === 'ongoing' ? 'primary' : 'default'}
                            icon={<Rocket fontSize="small" />}
                            sx={{ 
                              fontFamily: '"Adlam Display", serif',
                              fontWeight: 600,
                              borderRadius: 2,
                              background: `linear-gradient(135deg, ${getThemeColor('primary')}, ${alpha(getThemeColor('primary'), 0.8)})`,
                              color: getContrastColor(getThemeColor('primary')),
                              boxShadow: `0 4px 15px ${alpha(getThemeColor('primary'), 0.3)}`,
                            }}
                          />
                          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarToday fontSize="small" />
                            Deadline: {project?.endDate || 'No date set'}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Progress Section */}
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" sx={{ 
                          fontFamily: '"Adlam Display", serif',
                          fontWeight: 500,
                        }}>
                          Project Progress
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {projectMetrics?.weightedProgress || project?.progress || 0}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={projectMetrics?.weightedProgress || project?.progress || 0} 
                        sx={{ 
                          height: 10, 
                          borderRadius: 5,
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          '& .MuiLinearProgress-bar': {
                            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            borderRadius: 5,
                            boxShadow: `0 0 10px ${alpha(theme.palette.primary.main, 0.5)}`,
                          }
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Action Buttons */}
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button 
                      variant="outlined" 
                      startIcon={<Edit />}
                      onClick={handleEditProjectButton}
                      disabled={project?.status === 'completed' || project?.createdBy?._id !== user?._id}
                      sx={{ 
                        fontFamily: '"Adlam Display", serif',
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        borderWidth: 2,
                        borderColor: alpha(theme.palette.primary.main, 0.3),
                        color: theme.palette.primary.main,
                        '&:hover': {
                          borderWidth: 2,
                          borderColor: theme.palette.primary.main,
                          backgroundColor: alpha(theme.palette.primary.main, 0.05),
                        }
                      }}
                    >
                      {isEditing.field}
                    </Button>
                    <Button 
                      variant="contained" 
                      startIcon={<CheckCircle />}
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem('token');
                          await axiosClient.patch(`/projects/${projectId}`, {
                            status: 'completed'
                          }, {
                            headers: { Authorization: `Bearer ${token}` }
                          });
                          showSnackbar('Project marked as completed', 'success');
                          setRefresh(true);
                        } catch (error) {
                          showSnackbar('Error completing project', 'error');
                        }
                      }}
                      sx={{ 
                        fontFamily: '"Adlam Display", serif',
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        background: `linear-gradient(135deg, ${getThemeColor('success')}, ${alpha(getThemeColor('success'), 0.8)})`,
                        color: getContrastColor(getThemeColor('success')),
                        boxShadow: `0 4px 20px ${alpha(getThemeColor('success'), 0.4)}`,
                        '&:hover': {
                          boxShadow: `0 8px 25px ${alpha(getThemeColor('success'), 0.6)}`,
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Mark Complete
                    </Button>
                  </Box>
                </Box>

                {/* Description */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                    {project?.description || 'No description available'}
                  </Typography>
                </Box>

                {/* ToolKit */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ 
                    mb: 1.5,
                    fontFamily: '"Adlam Display", serif',
                    fontWeight: 500,
                    color: theme.palette.text.secondary,
                  }}>
                    Project Toolkit 
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {isEditing.state ? (
                      <Autocomplete
                        multiple
                        freeSolo
                        value={project?.toolkit || []}
                        onChange={(event, newValue) => {
                          setProject(prev => ({ ...prev, toolkit: newValue }));
                        }}
                        options={[]}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              variant="outlined"
                              label={option}
                              {...getTagProps({ index })}
                            />
                          ))
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            placeholder="Add tool and press Enter"
                          />
                        )}
                      />
                    ) : (
                      (project?.toolkit || []).map((tool, index) => (
                        <Chip 
                          key={index} 
                          label={tool} 
                          icon={<Code fontSize="small" />}
                          variant="outlined"
                          sx={{ 
                            borderRadius: 2,
                            borderColor: alpha(theme.palette.primary.main, 0.3),
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.text.primary,
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.2),
                              borderColor: theme.palette.primary.main,
                              transform: 'translateY(-2px)',
                            },
                            transition: 'all 0.3s ease',
                          }}
                        />
                      ))
                    )}
                  </Box>
                </Box>

                {/* Leadership Team */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ 
                      width: 48, 
                      height: 48, 
                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.8)})`,
                      border: `3px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                      boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.3)}`,
                      color: getContrastColor(theme.palette.primary.main),
                    }}>
                      {project?.createdBy?.avatar || (project?.createdBy?.name?.charAt(0) || 'P')}
                    </Avatar>
                    <Box>
                      <Tooltip title={project?.createdBy?.email || 'Unknown'}>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                          Creator
                        </Typography>       
                      </Tooltip>
                      <Tooltip title={project?.createdBy?.email || 'Unknown'}>
                        <Typography variant="body1" fontWeight="600">
                          {project?.createdBy?.name || 'Unknown Creator'}
                        </Typography>
                      </Tooltip>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ 
                      width: 48, 
                      height: 48, 
                      background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${alpha(theme.palette.secondary.main, 0.8)})`,
                      border: `3px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
                      boxShadow: `0 4px 15px ${alpha(theme.palette.secondary.main, 0.3)}`,
                      color: getContrastColor(theme.palette.secondary.main),
                    }}>
                      {project?.mentor?.avatar || (project?.mentor?.name?.charAt(0) || 'M')}
                    </Avatar>
                    <Box>
                      <Tooltip title={project?.mentor?.email || 'No mentor assigned'}>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                          Mentor
                        </Typography>
                      </Tooltip>
                      <Tooltip title={project?.mentor?.email || 'No mentor assigned'}>
                        <Typography variant="body1" fontWeight="600">
                          {project?.mentor?.name || 'No Mentor Assigned'}
                        </Typography>
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </motion.div>

          {/* Stats Grid with Efficiency Metrics */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
          >
            <Box 
              sx={{ 
                mb: 4,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                flexWrap: 'wrap',
                gap: 3,
                width: '100%'
              }}
            >
              {/* Card 1: Total Tasks */}
              <Box 
                sx={{ 
                  flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' },
                  minWidth: { xs: '100%', sm: '200px' }
                }}
              >

                  <StatCard
                    icon={<Task />}
                    value={projectMetrics?.totalTasks || 0}
                    label="Total Tasks"
                    colorType="primary"
                    progress={projectMetrics?.totalTasks ? (projectMetrics.completedTasks / projectMetrics.totalTasks) * 100 : 0}
                  />
              </Box>

              {/* Card 2: Team Members */}
              <Box 
                sx={{ 
                  flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' },
                  minWidth: { xs: '100%', sm: '200px' }
                }}
              >

                  <Tooltip title={`Active Member Count: ${activeMemberCount} of ${members.length}`}>
                    <span>
                      <StatCard 
                        icon={<Group />}
                        value={members.length}
                        label="Team Members"
                        colorType="secondary"
                        progress={activeMemberCount ? (activeMemberCount/members.length)*100 : 0}
                      />
                    </span>
                  </Tooltip>
              </Box>

              {/* Card 3: Overall Efficiency */}
              <Box 
                sx={{ 
                  flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' },
                  minWidth: { xs: '100%', sm: '200px' }
                }}
              >

                  <StatCard
                    icon={<WorkspacePremium />}
                    value={`${overallEfficiency || 0}%`}
                    label="Overall Efficiency"
                    colorType="success"
                    progress={overallEfficiency || 0}
                  />
              </Box>

              {/* Card 4: Risk Level */}
              <Box 
                sx={{ 
                  flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' },
                  minWidth: { xs: '100%', sm: '200px' }
                }}
              >

                  <StatCard
                    icon={<Speed />}
                    value={projectMetrics?.riskLevel || 'Low'}
                    label="Risk Level"
                    colorType={projectMetrics?.riskLevel === 'high' ? 'error' : 
                            projectMetrics?.riskLevel === 'medium' ? 'warning' : 'success'}
                    progress={projectMetrics?.riskLevel === 'low' ?  0 :
                            projectMetrics?.riskLevel === 'medium' ? 50 : 100}
                  />

              </Box>
            </Box>
          </motion.div>

          {/* Main Content */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>
            {/* Left Column - Main Content */}
            <Box sx={{ flex: 2, minWidth: 0 }}>
              {/* Tabs */}
              <Paper
                elevation={0}
                sx={{
                  mb: 3,
                  borderRadius: 3,
                  ...getGlassEffect(),
                  overflow: 'hidden',
                }}
              >
                <Box sx={{ 
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                  px: { xs: 2, sm: 3 },
                  background: `linear-gradient(90deg, 
                    ${alpha(theme.palette.primary.main, 0.05)} 0%, 
                    transparent 100%
                  )`,
                }}>
                  <Tabs 
                    value={activeTab} 
                    onChange={(e, newValue) => setActiveTab(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                      '& .MuiTab-root': {
                        textTransform: 'capitalize',
                        borderRadius: 2,
                        mx: 0.5,
                        minHeight: 48,
                        fontFamily: '"Adlam Display", serif',
                        fontWeight: 500,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        },
                        '&.Mui-selected': {
                          color: theme.palette.primary.main,
                          backgroundColor: alpha(theme.palette.primary.main, 0.15),
                        }
                      },
                      '& .MuiTabs-indicator': {
                        backgroundColor: theme.palette.primary.main,
                        height: 3,
                        borderRadius: 1.5,
                        boxShadow: `0 0 8px ${alpha(theme.palette.primary.main, 0.5)}`,
                      }
                    }}
                  >
                    <Tab icon={<Task />} label="Tasks" />
                    <Tab icon={<Group />} label="Team" />
                    <Tab icon={<Timeline />} label="Activity" />
                    <Tab icon={<AttachFile />} label="Files" />
                    <Tab icon={<Analytics />} label="Analytics" />
                    <Tab icon={<Note />} label="Notes" />
                  </Tabs>
                </Box>

                {/* Tab Content */}
                <Box sx={{ p: { xs: 2, sm: 3 } }}>
                  {/* Tasks Tab */}
                  <TabContent value={activeTab} index={0}>
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                        <Typography variant="h5" sx={{ 
                          fontFamily: '"Adlam Display", serif',
                          fontWeight: 500,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}>
                          <Task /> Task Board ({tasks.length} tasks)
                        </Typography>
                        {/* tasks tab */}
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <TextField
                            size="small"
                            placeholder="Search tasks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{ 
                              width: 200,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                backgroundColor: alpha(theme.palette.background.paper, 0.5),
                                borderColor: alpha(theme.palette.primary.main, 0.2),
                                '&:hover': {
                                  borderColor: theme.palette.primary.main,
                                }
                              }
                            }}
                          />
                        </Box>
                      </Box>

                      <TableContainer 
                        component={Paper} 
                        sx={{ 
                          borderRadius: 3,
                          ...getGlassEffect(),
                          border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                        }}
                      >
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell width="40px"></TableCell>
                              <TableCell>Task Name</TableCell>
                              <TableCell>Assigned To</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell>Time (Focus/Est.)</TableCell>
                              <TableCell>Efficiency</TableCell>
                              <TableCell>Risk</TableCell>
                              <TableCell align="right">Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {tasks
                              .filter(task => {
                                if (!task) return false;
                                const query = searchQuery.toLowerCase();
                                return (
                                  task.taskTitle?.toLowerCase().includes(query) ||
                                  task.description?.toLowerCase().includes(query) ||
                                  task.assignedTo?.name?.toLowerCase().includes(query)
                                );
                              })
                              .map((task) => {
                                if (!task) return null;
                                
                                // Get efficiency value
                                const efficiency = task.taskEfficiency || 0;
                                
                                // Get risk level
                                const riskLevel = task.riskLevel || 'low';
                                
                                // Get status
                                const status = task.status || 'not_started';
                                
                                return (
                                  <motion.tr 
                                    key={task._id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    whileHover={{ 
                                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                      transform: 'translateX(8px)'
                                    }}
                                    style={{ 
                                      cursor: 'pointer',
                                      transition: 'all 0.2s ease',
                                    }}
                                  >
                                    <TableCell>
                                      <DragIndicator sx={{ 
                                        color: theme.palette.text.disabled,
                                        transition: 'all 0.3s ease',
                                      }} />
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body1" fontWeight="500">
                                        {task.taskTitle || 'Untitled Task'}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        {task.description ? 
                                          (task.description.length > 50 ? 
                                            `${task.description.substring(0, 50)}...` : 
                                            task.description) : 
                                          'No description'}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Avatar sx={{ 
                                          width: 32, 
                                          height: 32, 
                                          fontSize: 14,
                                          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                          color: getContrastColor(theme.palette.primary.main),
                                        }}>
                                          {task.assignedTo?.name?.charAt(0).toUpperCase() || 'U'}
                                        </Avatar>
                                        <Box>
                                          <Typography variant="body2">
                                            {task.assignedTo?.name || 'Unassigned'}
                                          </Typography>
                                          <Typography variant="caption" color="text.secondary">
                                            {task.assignedTo?.email || ''}
                                          </Typography>
                                        </Box>
                                      </Box>
                                    </TableCell>
                                    <TableCell>
                                      <Chip 
                                        label={status.replace('_', ' ').toUpperCase()} 
                                        size="small" 
                                        color={getStatusColor(status)}
                                        sx={{ 
                                          fontWeight: 600,
                                          borderRadius: 1.5,
                                          minWidth: 100,
                                          boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.2)}`,
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Box>
                                        <Typography variant="body2" fontWeight="500">
                                          {Math.round((task.totalFocusTime || 0) / 60)}m
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          of {Math.round((task.estimatedTime || 0) / 60)}m
                                        </Typography>
                                      </Box>
                                    </TableCell>
                                    <TableCell>
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <TrendingUp sx={{ 
                                          fontSize: 16,
                                          color: getThemeColor(getEfficiencyColor(efficiency))
                                        }} />
                                        <Typography 
                                          variant="body2" 
                                          fontWeight="600"
                                          sx={{ 
                                            color: getThemeColor(getEfficiencyColor(efficiency))
                                          }}
                                        >
                                          {efficiency.toFixed(1)}%
                                        </Typography>
                                      </Box>
                                    </TableCell>
                                    <TableCell>
                                      <Chip 
                                        label={riskLevel.toUpperCase()} 
                                        size="small" 
                                        color={getRiskColor(riskLevel)}
                                        variant="outlined"
                                        sx={{ 
                                          fontWeight: 600,
                                          borderWidth: 2,
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell align="right">
                                      <IconButton 
                                        size="small"
                                        onClick={(e) => {
                                          setSelectedTask(task);
                                          setTaskActionsAnchor(e.currentTarget);
                                        }}
                                        sx={{
                                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                          '&:hover': {
                                            backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                          }
                                        }}
                                      >
                                        <MoreHoriz />
                                      </IconButton>
                                    </TableCell>
                                  </motion.tr>
                                );
                              })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  </TabContent>

                  {/* Team Tab */}
                  <TabContent value={activeTab} index={1}>
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h5" sx={{ 
                          fontFamily: '"Adlam Display", serif',
                          fontWeight: 500,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}>
                          <Group /> Team Members ({members.length})
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<PersonAdd />}
                          onClick={() => setAddMemberDialog(true)}
                          sx={{ 
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                            fontFamily: '"Adlam Display", serif',
                            background: `linear-gradient(135deg, ${getThemeColor('primary')}, ${alpha(getThemeColor('primary'), 0.8)})`,
                            color: getContrastColor(getThemeColor('primary')),
                            boxShadow: `0 4px 20px ${alpha(getThemeColor('primary'), 0.4)}`,
                            '&:hover': {
                              boxShadow: `0 8px 25px ${alpha(getThemeColor('primary'), 0.6)}`,
                              transform: 'translateY(-2px)',
                            },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          Add Member
                        </Button>
                      </Box>

                      <Grid container spacing={3}>
                        {members.map((member) => {
                          const memberEff = memberEfficiencies[member._id] || { efficiency: 0, taskCount: 0 };
                          const memberTasks = tasks.filter(task => {
                            const assigneeId = task.assignedTo?._id || task.assignedTo;
                            return assigneeId === member._id;
                          });
                          const completedTasks = memberTasks.filter(task => task.status === 'completed').length;

                          return (
                            <Grid item xs={12} sm={6} md={4} key={member._id}>
                              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Paper
                                  elevation={0}
                                  sx={{
                                    p: 3,
                                    borderRadius: 3,
                                    ...getGlassEffect(),
                                    height: '100%',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    '&:hover': {
                                      borderColor: getBorderColor('primary', 0.5),
                                      boxShadow: `0 8px 32px ${alpha(getThemeColor('primary'), 0.2)}`,
                                      transform: 'translateY(-4px)',
                                    },
                                    transition: 'all 0.3s ease',
                                  }}
                                >
                                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                                    <Badge
                                      overlap="circular"
                                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                      variant="dot"
                                      color={member.onlineStatus === 'active' ? 'success' : 'warning'}
                                    >
                                      <Avatar 
                                        sx={{ 
                                          width: 56, 
                                          height: 56,
                                          fontSize: 20,
                                          fontWeight: 'bold',
                                          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                          color: getContrastColor(theme.palette.primary.main),
                                          boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.3)}`,
                                        }}
                                      >
                                        {member.avatar || member.name?.charAt(0).toUpperCase() || 'U'}
                                      </Avatar>
                                    </Badge>
                                    <Box sx={{ flex: 1 }}>
                                      <Typography variant="h6" fontWeight="600">
                                        {member.name || 'Unknown'}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        {member.email || 'No email'}
                                      </Typography>
                                    </Box>
                                  </Box>

                                  {/* Skills */}
                                  {member.skills && member.skills.length > 0 && (
                                    <Box sx={{ mb: 2 }}>
                                      <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                                        Skills
                                      </Typography>
                                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                        {member.skills.slice(0, 3).map((skill, idx) => (
                                          <Chip
                                            key={idx}
                                            label={skill}
                                            size="small"
                                            variant="outlined"
                                            sx={{ 
                                              fontSize: '0.7rem',
                                              height: 22,
                                              borderRadius: 1,
                                              borderColor: getBorderColor('primary', 0.3),
                                              backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                              color: theme.palette.text.primary,
                                            }}
                                          />
                                        ))}
                                        {member.skills.length > 3 && (
                                          <Chip
                                            label={`+${member.skills.length - 3}`}
                                            size="small"
                                            variant="outlined"
                                            sx={{ 
                                              fontSize: '0.7rem',
                                              height: 22,
                                              borderRadius: 1,
                                            }}
                                          />
                                        )}
                                      </Box>
                                    </Box>
                                  )}

                                  <Divider sx={{ my: 2, borderColor: alpha(theme.palette.divider, 0.3) }} />

                                  {/* Efficiency Stats */}
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box>
                                      <Typography variant="caption" color="text.secondary" display="block">
                                        Tasks
                                      </Typography>
                                      <Typography variant="body2" fontWeight="600">
                                        {memberEff.taskCount}
                                      </Typography>
                                    </Box>
                                    <Box>
                                      <Typography variant="caption" color="text.secondary" display="block">
                                        Completed
                                      </Typography>
                                      <Typography variant="body2" fontWeight="600">
                                        {completedTasks}
                                      </Typography>
                                    </Box>
                                    <Box>
                                      <Typography variant="caption" color="text.secondary" display="block">
                                        Efficiency
                                      </Typography>
                                      <Typography 
                                        variant="body2" 
                                        fontWeight="600"
                                        sx={{ 
                                          color: getThemeColor(getEfficiencyColor(memberEff.efficiency))
                                        }}
                                      >
                                        {memberEff.efficiency.toFixed(1)}%
                                      </Typography>
                                    </Box>
                                  </Box>
                                </Paper>
                              </motion.div>
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Box>
                  </TabContent>

                  {/* Activity Tab */}
                  <TabContent value={activeTab} index={2}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h5" sx={{ 
                        fontFamily: '"Adlam Display", serif',
                        fontWeight: 500,
                        mb: 3,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}>
                        <Timeline /> Recent Activity ({activityLog.length})
                      </Typography>

                      {activityLog.length === 0 ? (
                        <Paper
                          elevation={0}
                          sx={{
                            p: 4,
                            borderRadius: 3,
                            ...getGlassEffect(),
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="body1" color="text.secondary">
                            No activity recorded yet
                          </Typography>
                        </Paper>
                      ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {activityLog.map((log) => (
                            <motion.div
                              key={log.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                            >
                              <Paper
                                elevation={0}
                                sx={{
                                  p: 2.5,
                                  borderRadius: 3,
                                  ...getGlassEffect(),
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: 2,
                                  '&:hover': {
                                    borderColor: getBorderColor('primary', 0.5),
                                    transform: 'translateX(4px)',
                                  },
                                  transition: 'all 0.3s ease',
                                }}
                              >
                                <Avatar
                                  sx={{
                                    background: `linear-gradient(135deg, ${getThemeColor('primary')}, ${alpha(getThemeColor('primary'), 0.8)})`,
                                    color: getContrastColor(getThemeColor('primary')),
                                    width: 40,
                                    height: 40,
                                    boxShadow: `0 4px 12px ${alpha(getThemeColor('primary'), 0.3)}`,
                                  }}
                                >
                                  {log.user?.avatar || log.user?.name?.charAt(0) || '?'}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="body1">
                                    <strong>{log.user?.name || 'System'}</strong> {log.action}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {log.time}
                                  </Typography>
                                  {log.metadata?.description && (
                                    <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
                                      {log.metadata.description}
                                    </Typography>
                                  )}
                                </Box>
                              </Paper>
                            </motion.div>
                          ))}
                        </Box>
                      )}
                    </Box>
                  </TabContent>

                  {/* Files Tab */}
                  <TabContent value={activeTab} index={3}>
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h5" sx={{ 
                          fontFamily: '"Adlam Display", serif',
                          fontWeight: 500,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}>
                          <AttachFile /> Project Files ({projectFiles.length})
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<Upload />}
                          onClick={() => {
                            showSnackbar('File upload functionality coming soon', 'info');
                          }}
                          sx={{ 
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                            fontFamily: '"Adlam Display", serif',
                            background: `linear-gradient(135deg, ${getThemeColor('primary')}, ${alpha(getThemeColor('primary'), 0.8)})`,
                            color: getContrastColor(getThemeColor('primary')),
                            boxShadow: `0 4px 20px ${alpha(getThemeColor('primary'), 0.4)}`,
                            '&:hover': {
                              boxShadow: `0 8px 25px ${alpha(getThemeColor('primary'), 0.6)}`,
                              transform: 'translateY(-2px)',
                            },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          Upload File
                        </Button>
                      </Box>

                      {projectFiles.length === 0 ? (
                        <Paper
                          elevation={0}
                          sx={{
                            p: 4,
                            borderRadius: 3,
                            ...getGlassEffect(),
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="body1" color="text.secondary">
                            No files uploaded yet
                          </Typography>
                        </Paper>
                      ) : (
                        <Grid container spacing={2}>
                          {projectFiles.map((file) => (
                            <Grid item xs={12} sm={6} md={4} key={file._id}>
                              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Paper
                                  elevation={0}
                                  sx={{
                                    p: 2.5,
                                    borderRadius: 3,
                                    ...getGlassEffect(),
                                    height: '100%',
                                    '&:hover': {
                                      borderColor: getBorderColor('primary', 0.5),
                                      transform: 'translateY(-4px)',
                                    },
                                    transition: 'all 0.3s ease',
                                  }}
                                >
                                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                                    <Avatar
                                      sx={{
                                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.8)})`,
                                        color: getContrastColor(theme.palette.primary.main),
                                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                                      }}
                                    >
                                      <Folder />
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                      <Typography variant="body1" fontWeight="500" noWrap>
                                        {file.fileName}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        From: {file.taskTitle}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary" display="block">
                                        {file.uploadedBy} • {file.uploadedAt}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Chip
                                      label={file.fileType}
                                      size="small"
                                      variant="outlined"
                                      sx={{ 
                                        borderRadius: 1.5,
                                        borderColor: getBorderColor('primary', 0.3),
                                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                      }}
                                    />
                                    <Typography variant="caption" color="text.secondary">
                                      {file.fileSize}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                    <IconButton 
                                      size="small"
                                      onClick={() => window.open(file.fileUrl, '_blank')}
                                      sx={{
                                        backgroundColor: alpha(getThemeColor('info'), 0.1),
                                        color: getThemeColor('info'),
                                        '&:hover': {
                                          backgroundColor: alpha(getThemeColor('info'), 0.2),
                                        }
                                      }}
                                    >
                                      <Visibility />
                                    </IconButton>
                                    <IconButton 
                                      size="small"
                                      onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = file.fileUrl;
                                        link.download = file.fileName;
                                        link.click();
                                      }}
                                      sx={{
                                        backgroundColor: alpha(getThemeColor('success'), 0.1),
                                        color: getThemeColor('success'),
                                        '&:hover': {
                                          backgroundColor: alpha(getThemeColor('success'), 0.2),
                                        }
                                      }}
                                    >
                                      <Download />
                                    </IconButton>
                                  </Box>
                                </Paper>
                              </motion.div>
                            </Grid>
                          ))}
                        </Grid>
                      )}
                    </Box>
                  </TabContent>

                  {/* Analytics Tab */}
                  <TabContent value={activeTab} index={4}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h5" sx={{ 
                        fontFamily: '"Adlam Display", serif',
                        fontWeight: 500,
                        mb: 3,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}>
                        <Analytics /> Project Analytics
                      </Typography>

                      <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid item xs={12} md={6}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 3,
                              borderRadius: 3,
                              ...getGlassEffect(),
                              border: `1.5px solid ${getBorderColor('success', 0.4)}`,
                              height: '100%',
                            }}
                          >
                            <Typography variant="h6" sx={{ 
                              mb: 2, 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1,
                              color: getThemeColor('success'),
                            }}>
                              <CheckCircle /> Efficiency Overview
                            </Typography>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h2" fontWeight="800" sx={{ 
                                fontFamily: '"Alkatra", cursive',
                                color: getThemeColor('success'),
                                mb: 1,
                                textShadow: `0 2px 8px ${alpha(getThemeColor('success'), 0.3)}`,
                              }}>
                                {overallEfficiency || 0}%
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Overall Project Efficiency
                              </Typography>
                              <LinearProgress 
                                variant="determinate" 
                                value={Math.min(overallEfficiency || 0, 100)}
                                sx={{ 
                                  mt: 2,
                                  height: 8,
                                  borderRadius: 4,
                                  backgroundColor: alpha(getThemeColor('success'), 0.1),
                                  '& .MuiLinearProgress-bar': {
                                    background: `linear-gradient(90deg, ${getThemeColor('success')}, ${alpha(getThemeColor('success'), 0.7)})`,
                                    boxShadow: `0 0 8px ${alpha(getThemeColor('success'), 0.5)}`,
                                  }
                                }}
                              />
                            </Box>
                          </Paper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 3,
                              borderRadius: 3,
                              ...getGlassEffect(),
                              border: `1.5px solid ${getBorderColor('info', 0.4)}`,
                              height: '100%',
                            }}
                          >
                            <Typography variant="h6" sx={{ 
                              mb: 2, 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1,
                              color: getThemeColor('info'),
                            }}>
                              <AccessTime /> Time Tracking
                            </Typography>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h2" fontWeight="800" sx={{ 
                                fontFamily: '"Alkatra", cursive',
                                color: getThemeColor('info'),
                                mb: 1,
                                textShadow: `0 2px 8px ${alpha(getThemeColor('info'), 0.3)}`,
                              }}>
                                {Math.round((projectMetrics?.totalFocusTime || 0) / 3600)}h
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Total Focus Time
                              </Typography>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                <Typography variant="body2">
                                  Estimated: {Math.round((projectMetrics?.totalEstimatedTime || 0) / 3600)}h
                                </Typography>
                                <Typography variant="body2">
                                  Actual: {Math.round((projectMetrics?.totalFocusTime || 0) / 3600)}h
                                </Typography>
                              </Box>
                            </Box>
                          </Paper>
                        </Grid>
                      </Grid>

                      {/* Risk Analysis */}
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          ...getGlassEffect(),
                          border: `1.5px solid ${getBorderColor('warning', 0.4)}`,
                        }}
                      >
                        <Typography variant="h6" sx={{ 
                          mb: 2, 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1,
                          color: getThemeColor('warning'),
                        }}>
                          <Warning /> Risk Analysis
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6} sm={3}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h4" fontWeight="800" color={getThemeColor('error')}>
                                {projectMetrics?.highRiskTasks || 0}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                High Risk Tasks
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h4" fontWeight="800" color={getThemeColor('warning')}>
                                {projectMetrics?.mediumRiskTasks || 0}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Medium Risk Tasks
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h4" fontWeight="800" color={getThemeColor('error')}>
                                {projectMetrics?.overdueTasks || 0}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Overdue Tasks
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h4" fontWeight="800" color={getThemeColor('success')}>
                                {projectMetrics?.tasksWithProof || 0}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Tasks with Proof
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Box>
                  </TabContent>

                  {/* Notes Tab */}
                  <TabContent value={activeTab} index={5}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        ...getGlassEffect(),
                        border: `1.5px solid ${getBorderColor('primary', 0.4)}`,
                        minHeight: 400,
                      }}
                    >
                      <Typography variant="h5" sx={{ 
                        fontFamily: '"Adlam Display", serif',
                        fontWeight: 500,
                        mb: 3,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}>
                        <Note /> Collaborative Notes
                      </Typography>
                      <TextField
                        fullWidth
                        multiline
                        rows={12}
                        placeholder="Start typing your collaborative notes here... All team members can see and edit in real-time."
                        variant="outlined"
                        InputProps={{
                          sx: {
                            borderRadius: 2,
                            fontFamily: '"Inter", sans-serif',
                            backgroundColor: alpha(theme.palette.background.paper, 0.5),
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                            '&:focus-within': {
                              borderColor: theme.palette.primary.main,
                              boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`,
                            }
                          }
                        }}
                      />
                    </Paper>
                  </TabContent>
                </Box>
              </Paper>
            </Box>

            {/* Right Column - Sidebar */}
            {!isMobile && (
              <Box sx={{ width: { lg: 320 }, minWidth: { lg: 320 } }}>
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      ...getGlassEffect(),
                      position: 'sticky',
                      top: 24,
                    }}
                  >
                    <Typography variant="h6" sx={{ 
                      mb: 3,
                      fontFamily: '"Adlam Display", serif',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      color: theme.palette.text.primary,
                    }}>
                      <Info /> Project Overview
                    </Typography>

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1.5, color: theme.palette.text.secondary }}>
                        Project Timeline
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">Start Date</Typography>
                        <Typography variant="body2" fontWeight="600">
                          {project?.startDate || 'Not set'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">End Date</Typography>
                        <Typography variant="body2" fontWeight="600">
                          {project?.endDate || 'Not set'}
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 3, borderColor: alpha(theme.palette.divider, 0.3) }} />

                    <Typography variant="subtitle2" sx={{ mb: 2, color: theme.palette.text.secondary }}>
                      Tags
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                      {(project?.tags || []).map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          sx={{
                            borderRadius: 1.5,
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                            color: theme.palette.text.primary,
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.2),
                            }
                          }}
                        />
                      ))}
                    </Box>

                    <Divider sx={{ my: 3, borderColor: alpha(theme.palette.divider, 0.3) }} />

                    <Typography variant="subtitle2" sx={{ mb: 2, color: theme.palette.text.secondary }}>
                      Key Metrics
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Weighted Progress
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={projectMetrics?.weightedProgress || 0}
                          sx={{ 
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            '& .MuiLinearProgress-bar': {
                              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            }
                          }}
                        />
                        <Typography variant="body2" align="right">
                          {projectMetrics?.weightedProgress || 0}%
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Proof Compliance
                        </Typography>
                        <LinearProgress 
                          variant="determinate" 
                          value={projectMetrics?.proofComplianceRate || 0}
                          sx={{ 
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: alpha(getThemeColor('success'), 0.1),
                            '& .MuiLinearProgress-bar': {
                              background: `linear-gradient(90deg, ${getThemeColor('success')}, ${alpha(getThemeColor('success'), 0.7)})`,
                            }
                          }}
                        />
                        <Typography variant="body2" align="right">
                          {projectMetrics?.proofComplianceRate || 0}%
                        </Typography>
                      </Box>
                    </Box>

                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Assessment />}
                      sx={{
                        mt: 3,
                        borderRadius: 2,
                        py: 1.5,
                        fontFamily: '"Adlam Display", serif',
                        borderWidth: 2,
                        borderColor: getBorderColor('primary', 0.3),
                        color: theme.palette.primary.main,
                        '&:hover': {
                          borderWidth: 2,
                          borderColor: theme.palette.primary.main,
                          backgroundColor: alpha(theme.palette.primary.main, 0.05),
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      Generate Report
                    </Button>
                  </Paper>
                </motion.div>
              </Box>
            )}
          </Box>
        </Container>

        {/* Floating Action Buttons */}
        <FloatingActionButton
          icon={<Add />}
          onClick={() => {
            showSnackbar('Add task functionality coming soon', 'info');
          }}
          tooltip="Add Task"
          color="primary"
        />
        <FloatingActionButton
          icon={<Comment />}
          onClick={() => setActiveTab(5)}
          tooltip="Go to Notes"
          color="secondary"
          sx={{ bottom: 90, right: 24 }}
        />

        {/* Dialog for adding members */}
        <Dialog 
          open={addMemberDialog} 
          onClose={() => setAddMemberDialog(false)}
          PaperProps={{
            sx: {
              borderRadius: 4,
              minWidth: 400,
              ...getGlassEffect(),
              border: `1px solid ${getBorderColor('primary', 0.3)}`,
            }
          }}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Add Team Member</Typography>
              <IconButton 
                onClick={() => setAddMemberDialog(false)} 
                size="small"
                sx={{
                  backgroundColor: alpha(getThemeColor('error'), 0.1),
                  color: getThemeColor('error'),
                  '&:hover': {
                    backgroundColor: alpha(getThemeColor('error'), 0.2),
                  }
                }}
              >
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              fullWidth
              label="Search members by email or username"
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.background.paper, 0.5),
                  borderColor: getBorderColor('primary', 0.2),
                }
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button 
              onClick={() => setAddMemberDialog(false)}
              sx={{
                color: theme.palette.text.secondary,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.action.hover, 0.1),
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained"
              onClick={() => {
                showSnackbar('Member added successfully', 'success');
                setAddMemberDialog(false);
              }}
              sx={{
                background: `linear-gradient(135deg, ${getThemeColor('primary')}, ${alpha(getThemeColor('primary'), 0.8)})`,
                color: getContrastColor(getThemeColor('primary')),
                boxShadow: `0 4px 15px ${alpha(getThemeColor('primary'), 0.3)}`,
                '&:hover': {
                  boxShadow: `0 6px 20px ${alpha(getThemeColor('primary'), 0.4)}`,
                }
              }}
            >
              Add Member
            </Button>
          </DialogActions>
        </Dialog>

        {/* Task Actions Menu */}
        <Menu
          anchorEl={taskActionsAnchor}
          open={Boolean(taskActionsAnchor)}
          onClose={() => setTaskActionsAnchor(null)}
          PaperProps={{
            sx: {
              borderRadius: 3,
              minWidth: 200,
              ...getGlassEffect(),
              border: `1px solid ${getBorderColor('primary', 0.2)}`,
            }
          }}
        >
          <MenuItem onClick={() => {
            setTaskActionsAnchor(null);
            showSnackbar('Edit task functionality coming soon', 'info');
          }}>
            <Edit fontSize="small" sx={{ mr: 2 }} /> Edit Task
          </MenuItem>
          <MenuItem onClick={() => {
            setTaskActionsAnchor(null);
            showSnackbar('Assign task functionality coming soon', 'info');
          }}>
            <PersonAdd fontSize="small" sx={{ mr: 2 }} /> Assign
          </MenuItem>
          <Divider sx={{ my: 1, borderColor: alpha(theme.palette.divider, 0.3) }} />
          <MenuItem 
            onClick={async () => {
              if (selectedTask) {
                try {
                  const token = localStorage.getItem('token');
                  await axiosClient.delete(`/user/task/${selectedTask._id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  showSnackbar('Task deleted successfully', 'success');
                  setRefresh(true);
                } catch (error) {
                  showSnackbar('Error deleting task', 'error');
                }
              }
              setTaskActionsAnchor(null);
            }}
            sx={{ 
              color: getThemeColor('error'),
              '&:hover': {
                backgroundColor: alpha(getThemeColor('error'), 0.1),
              }
            }}
          >
            <Delete fontSize="small" sx={{ mr: 2 }} /> Delete
          </MenuItem>
        </Menu>
      </Box>
      <CreateTaskModal
        open={createTaskModalOpen}
        onClose={() => setCreateTaskModalOpen(false)}
        project={project}
        teams={teams}
        theme={theme}
      />
    </>
  );
};

export default MyProject;