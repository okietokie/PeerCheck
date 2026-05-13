// Tasks.jsx
import { useState, useEffect } from 'react';
import HistoryIcon from "@mui/icons-material/History";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Alert,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Avatar,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  LinearProgress,
  Chip,
  Stack,
  alpha,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Badge,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Switch,
  FormControlLabel,
  Tab,
  Tabs,
  Snackbar,
  Collapse
} from '@mui/material';
import {
  Search,
  Add,
  FilterList,
  Sort,
  PlayArrow,
  Pause,
  CheckCircle,
  Timer,
  Upload,
  Flag,
  Assessment,
  Visibility,
  Edit,
  Delete,
  MoreHoriz,
  Person,
  CalendarToday,
  Speed,
  Security,
  Warning,
  Error as ErrorIcon,
  AccessTime,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Refresh,
  Download,
  Grade,
  ArrowBack,
  Close,
  Folder,
  Info,
  ViewList,
  CheckCircleOutline,
  Dashboard,
  Description,
  Email,
  TrendingUp,
  PlayCircleOutline,
  Comment,
  Attachment,
  Title,
  Circle,
  CalendarMonth,
  Task,
  Settings,
  DeleteForeverSharp,
  Insights,
} from '@mui/icons-material';
import axiosClient from '@/api/axiosClient.js';
import { getAuthToken } from '@/utils/auth.js';
import CommentTab from '@/Components/user-dashboard/CommentsTab.jsx';
import { getUserData } from '@/utils/user.js';
import TourGuide from '@/Components/TourGuide.jsx';
import useTasks from '@/hooks/useTasks';
import TaskMetricsInsights from './TaskMetrics';
import { set } from 'date-fns';
import AssigneeSelectPopover from './AssigneeSelectPopover';

// Helper function to safely get nested values
const safeGet = (obj, path, defaultValue = '') => {
  if (!obj) return defaultValue;
  
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result === null || result === undefined) return defaultValue;
    result = result[key];
  }
  
  return result !== undefined && result !== null ? result : defaultValue;
};

// Helper to get display name for assigned user
const getAssignedUserName = (task, user, userRole) => {
  if (safeGet(task, 'assignedTo._id') === safeGet(userRole, 'userId')) {
    return safeGet(user, 'name', 'You');
  }
  return safeGet(task, 'assignedTo.name', 'Unassigned');
};

export const TaskDetailsModal = ({ open, onClose, task: initialTask, theme, userRole, onTaskUpdate, onUploadProof, onStatusChange }) => {
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activityLogs, setActivityLogs] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [projectTeam, setProjectTeam] = useState([]);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [updatedTask, setUpdatedTask] = useState(null);
  const [metricsInsightsOpen, setMetricsInsightsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [assigneeAnchorEl, setAssigneeAnchorEl] = useState(null);
  const [currentAssignee, setCurrentAssignee] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [updateTaskMessage, setUpdateTaskMessage] = useState(null);
  const [showEfficiencyBreakdown, setShowEfficiencyBreakdown] = useState(false);
  const [efficiencyMetrics, setEfficiencyMetrics] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const { formatTime } = useTasks();

  // Initialize task with safe defaults
  const initializeTask = (taskData) => {
    if (!taskData) {
      return {
        _id: '',
        taskTitle: 'No Task Title',
        description: 'No description provided.',
        status: 'not_started',
        assignedTo: {
          _id: '',
          name: 'Unassigned',
          email: '',
          avatar: ''
        },
        deadline: new Date().toISOString(),
        estimatedTime: 0,
        totalFocusTime: 0,
        projectId: { _id: '', name: 'No Project' },
        metrics: {
          efficiency: 0,
          riskScore: 0,
          isOverdue: false,
          hasProof: false,
          proofCount: 0,
          daysUntilDeadline: 0,
          statusWeightPercentage: 0,
          componentScores: {
            timeEfficiency: 0,
            completionQuality: 0,
            timeliness: 0,
            proofQuality: 0,
            integrityAdjustment: 0
          }
        },
        flags: {
          paddedTime: false,
          rushedCompletion: false,
          noProof: true,
          manualReviewRequired: false
        },
        proofUploads: [],
        comments: []
      };
    }

    return {
      _id: safeGet(taskData, '_id', ''),
      taskTitle: safeGet(taskData, 'taskTitle', 'No Task Title'),
      description: safeGet(taskData, 'description', 'No description provided.'),
      status: safeGet(taskData, 'status', 'not_started'),
      assignedTo: {
        _id: safeGet(taskData, 'assignedTo._id', ''),
        name: safeGet(taskData, 'assignedTo.name', 'Unassigned'),
        email: safeGet(taskData, 'assignedTo.email', ''),
        avatar: safeGet(taskData, 'assignedTo.avatar', '')
      },
      deadline: safeGet(taskData, 'deadline', new Date().toISOString()),
      estimatedTime: safeGet(taskData, 'estimatedTime', 0),
      totalFocusTime: safeGet(taskData, 'totalFocusTime', 0),
      projectId: {
        _id: safeGet(taskData, 'projectId._id', ''),
        name: safeGet(taskData, 'projectId.name', 'No Project')
      },
      metrics: {
        efficiency: safeGet(taskData, 'metrics.efficiency', 0),
        riskScore: safeGet(taskData, 'metrics.riskScore', 0),
        isOverdue: safeGet(taskData, 'metrics.isOverdue', false),
        hasProof: safeGet(taskData, 'metrics.hasProof', false),
        proofCount: safeGet(taskData, 'metrics.proofCount', 0),
        daysUntilDeadline: safeGet(taskData, 'metrics.daysUntilDeadline', 0),
        statusWeightPercentage: safeGet(taskData, 'metrics.statusWeightPercentage', 0),
        componentScores: {
          timeEfficiency: safeGet(taskData, 'metrics.componentScores.timeEfficiency', 0),
          completionQuality: safeGet(taskData, 'metrics.componentScores.completionQuality', 0),
          timeliness: safeGet(taskData, 'metrics.componentScores.timeliness', 0),
          proofQuality: safeGet(taskData, 'metrics.componentScores.proofQuality', 0),
          integrityAdjustment: safeGet(taskData, 'metrics.componentScores.integrityAdjustment', 0)
        },
        risk: safeGet(taskData, 'metrics.risk', {}),
      },
      
      flags: {
        paddedTime: safeGet(taskData, 'flags.paddedTime', false),
        rushedCompletion: safeGet(taskData, 'flags.rushedCompletion', false),
        noProof: safeGet(taskData, 'flags.noProof', true),
        manualReviewRequired: safeGet(taskData, 'flags.manualReviewRequired', false)
      },
      proofUploads: safeGet(taskData, 'proofUploads', []),
      comments: safeGet(taskData, 'comments', [])
    };
  };

  useEffect(() => {
    console.log("Initial Task:", initialTask);
    if (initialTask) {
      setUpdatedTask(initializeTask(initialTask));
    }
    if(updatedTask){
      console.log("Updated Task:", updatedTask)
    }
  }, [initialTask]);

  useEffect(() => {
    if (!open || !updatedTask?._id) return;
    
    const fetchTaskData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error('No authentication token found');
        }
        console.log("Fetching details for task ID:", updatedTask?._id);

        const response = await axiosClient.get(`/user/task/${updatedTask?._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response?.data?.success) {
          console.log("Raw Task Data:", response);
          const cleanedTask = initializeTask(response?.data?.task);
          setUpdatedTask(cleanedTask);
          console.log("Fetched Task Details:", cleanedTask);
          
          const userData = await getUserData();
          if (userData) {
            setUser(userData);
            setCurrentAssignee(safeGet(cleanedTask, 'assignedTo._id'));
          }
        } else {
          throw new Error(response?.data?.error || 'Failed to fetch task details');
        }
      } catch(err) {
        console.error("Error fetching task details:", err);
        setSnackbar({
          open: true,
          message: err.message || 'Failed to load task details',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
   
    fetchTaskData();
  }, [open, updatedTask?._id, isEditing, activeTab]);
  const handleAssigneeClick = (event) => {
    setAssigneeAnchorEl(event.currentTarget);
  };
  const handleAssigneeChange = (newAssignee) => {
    setUpdatedTask(prev => ({
      ...prev,
      assignedTo: newAssignee?.user?._id,
      assignedUserName: newAssignee?.user?.name
    }));
    
  };


  const viewProofFile = async (taskId, proofId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await axiosClient.get(
        `/user/task/${taskId}/proof/${proofId}?download=false`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const fileURL = URL.createObjectURL(response.data);
      window.open(fileURL, "_blank");
    } catch (err) {
      console.error("Error viewing file", err);
      setSnackbar({
        open: true,
        message: 'Failed to view proof file',
        severity: 'error'
      });
    }
  };

  const downloadProofFile = async (taskId, proofId, filename) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await axiosClient.get(
        `/user/task/${taskId}/proof/${proofId}?download=true`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename || 'proof_file');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Download failed:", err);
      setSnackbar({
        open: true,
        message: 'Failed to download proof file',
        severity: 'error'
      });
    }
  };

  const deleteProofFile = async (taskId, proofId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await axiosClient.delete(
        `/user/task/${taskId}/proof/${proofId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setSnackbar({
          open: true,
          message: 'Proof file deleted successfully',
          severity: 'success'
        });
        // Refresh task data
        if (updatedTask?._id === taskId) {
          const updatedProofs = updatedTask?.proofUploads.filter(p => p._id !== proofId);
          setUpdatedTask(prev => ({
            ...prev,
            proofUploads: updatedProofs
          }));
        }
      } else {
        throw new Error(response.data.error || 'Failed to delete proof');
      }
    } catch (err) {
      console.error("Delete failed:", err);
      setSnackbar({
        open: true,
        message: 'Failed to delete proof file',
        severity: 'error'
      });
    }
  };

  // Fetch activity logs
  const fetchActivityLogs = async () => {
    if (!updatedTask?._id) return;
    
    try {
      setLoadingActivity(true);
      const token = getAuthToken();
      if (!token) return;

      const response = await axiosClient.get(`/user/task/${updatedTask?._id}/activity`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data?.success) {
        setActivityLogs(response.data.logs || []);
      }
    } catch (err) {
      console.error('Error fetching activity logs:', err);
    } finally {
      setLoadingActivity(false);
    }
  };

  const calculateEfficiencyBreakdown = (task) => {
    const baseMetrics = {
      overall: safeGet(task, 'metrics.efficiency', 0),
      components: safeGet(task, 'metrics.componentScores', {
        timeEfficiency: 0,
        completionQuality: 0,
        timeliness: 0,
        proofQuality: 0,
        integrityAdjustment: 0
      })
    };

    // If component scores are missing, calculate fallback values
    if (!task?.metrics?.componentScores) {
      const estimatedTime = safeGet(task, 'estimatedTime', 1);
      const focusTime = safeGet(task, 'totalFocusTime', 0);
      const efficiency = (focusTime / estimatedTime) * 100;
      
      return {
        overall: Math.min(Math.max(efficiency, 0), 100),
        components: {
          timeEfficiency: Math.max(0, Math.min(100, efficiency)),
          completionQuality: task?.status === 'completed' ? 100 : 
                           task?.status === 'active' ? 70 : 
                           task?.status === 'paused' ? 40 : 0,
          timeliness: calculateTimeliness(task),
          proofQuality: task?.proofUploads?.length > 0 ? 80 : 20,
          integrityAdjustment: 100 - ((safeGet(task, 'metrics.riskScore', 0) * 12.5))
        }
      };
    }
    
    return baseMetrics;
  };

  const calculateTimeliness = (task) => {
    if (!task?.deadline) return 80;
    
    const now = new Date();
    const deadline = new Date(task.deadline);
    
    if (task.status === 'completed' && task.endDate) {
      const completionDate = new Date(task.endDate);
      const daysLate = Math.max(0, (completionDate - deadline) / (1000 * 60 * 60 * 24));
      
      if (completionDate <= deadline) return 100;
      else if (daysLate <= 1) return 90;
      else if (daysLate <= 3) return 70;
      else if (daysLate <= 7) return 50;
      else return 30;
    } else {
      const daysRemaining = Math.max(0, (deadline - now) / (1000 * 60 * 60 * 24));
      if (daysRemaining > 7) return 90;
      else if (daysRemaining > 3) return 70;
      else if (daysRemaining > 0) return 50;
      else return 30;
    }
  };
  
  // Fetch project team when modal opens
  useEffect(() => {
    if (open && updatedTask?.projectId?._id) {
      fetchProjectTeam();
    }
  }, [open, updatedTask?.projectId?._id]);

  const fetchProjectTeam = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      const projectId = updatedTask?.projectId._id;
      const response = await axiosClient.get(`/projects/${projectId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data?.success) {
        setProjectTeam(response.data.teamId?.members || []);
      }
    } catch (err) {
      console.error('Error fetching project team:', err);
    }
  };

  useEffect(() => {
    if (updatedTask) {
      const breakdown = calculateEfficiencyBreakdown(updatedTask);
      setEfficiencyMetrics(breakdown);
    }
  }, [updatedTask]);

  // Load activity when tab is selected
  useEffect(() => {
    if (open && activeTab === 'activity' && updatedTask?._id) {
      fetchActivityLogs();
    }
  }, [open, activeTab, updatedTask?._id]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'active': return 'info';
      case 'paused': return 'warning';
      default: return 'default';
    }
  };

  const getRiskColor = (riskScore) => {
    const score = Number(riskScore) || 0;
    if (score >= 4) return 'error';
    if (score >= 2) return 'warning';
    return 'success';
  };

  const getEfficiencyColor = (efficiency) => {
    const eff = Number(efficiency) || 0;
    if (eff === undefined || eff === null) return theme.palette.grey[500];
    if (eff >= 85) return theme.palette.success.main;
    if (eff >= 70) return theme.palette.info.main;
    if (eff >= 50) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getEfficiencyLabel = (score) => {
    const s = Number(score) || 0;
    if (s >= 85) return 'Excellent';
    if (s >= 70) return 'Good';
    if (s >= 50) return 'Satisfactory';
    if (s >= 30) return 'Needs Improvement';
    return 'Unsatisfactory';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return 'Invalid date';
    }
  };

  const handleReassignTask = () => {
    setAssignDialogOpen(true);
  };

  const handleAddComment = () => {
    setCommentDialogOpen(true);
  };

  const handleEditFlags = () => {
    alert('Edit flags functionality to be implemented');
  };

  const handleGradeOverride = () => {
    alert('Grade override functionality to be implemented');
  };

  if (!updatedTask || !open) return null;

  const assignedUserName = getAssignedUserName(updatedTask, user, userRole);
  const isAssignedUser = safeGet(updatedTask, 'assignedTo._id') === safeGet(userRole, 'userId');

  return (
    <Dialog 
      open={open} 
      onClose={!loading ? onClose : undefined}
      fullScreen={isMobile}
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 4 },
          backgroundColor: theme.palette.background.paper,
          border: `2px solid ${alpha(theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200], 0.5)}`,
          overflow: 'hidden',
          maxHeight: { xs: '100dvh', sm: '92vh' },
          height: { xs: '100dvh', sm: 'auto' },
          boxShadow: `0 25px 60px ${alpha(theme.palette.mode === 'dark' ? '#000' : theme.palette.primary.main, 0.15)}`,
          backgroundImage: theme.palette.mode === 'dark' 
            ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`
            : `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.primary.light, 0.03)} 100%)`,
        }
      }}
    >

      {/* Header with gradient accent */}
      <Box sx={{ 
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        }
      }}>
        <DialogTitle sx={{ 
          pb: { xs: 2, sm: 2.5 },
          pt: { xs: 2.5, sm: 3.5 },
          px: { xs: 2, sm: 4 },
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: { xs: 1.25, sm: 2 }, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Box sx={{ maxWidth: { xs: '100%', sm: 'calc(100% - 112px)' }, minWidth: 0 }}>
              <Typography variant={isMobile ? "h5" : "h4"} fontWeight="800" gutterBottom sx={{ 
                fontFamily: '"Alkatra", cursive',
                color: theme.palette.text.primary,
                lineHeight: 1.2,
                wordBreak: 'break-word',
              }}>
                <TourGuide page='taskModal' showAppBarButton={true} />
                {updatedTask?.taskTitle}
              </Typography>
              <Typography sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, flexDirection: { xs: 'column', sm: 'row' }, gap: 0.75 }}>
                Assigned To:                 
                
                <Box onClick={handleAssigneeClick} sx={{ cursor: 'pointer', display: 'inline-flex', marginLeft: { xs: 0, sm: 1 }, marginBottom: 0.5, maxWidth: '100%' }}>
                  <Chip 
                    label={assignedUserName} 
                    color={theme.palette.secondary.main}
                    sx={{
                      fontWeight: 700,
                      borderRadius: 2,
                      height: 28,
                      fontSize: '0.75rem',
                      boxShadow: `0 3px 8px ${alpha(theme.palette.secondary.main, 0.2)}`,
                      '&:hover': { backgroundColor: alpha(theme.palette.secondary.main, 0.15) },
                    }}
                  />
                </Box>
            

              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                <Chip
                  label={(updatedTask?.status || 'not_started').replace('_', ' ').toUpperCase()}
                  color={getStatusColor(updatedTask?.status)}
                  size="medium"
                  sx={{
                    fontWeight: 700,
                    borderRadius: 1.5,
                    height: 28,
                    fontSize: '0.75rem',
                  }}
                />
                
                {updatedTask?.metrics?.isOverdue && (
                  <Chip
                    label="OVERDUE"
                    color="error"
                    size="medium"
                    icon={<Warning fontSize="small" />}
                    sx={{
                      fontWeight: 700,
                      borderRadius: 1.5,
                      height: 28,
                      fontSize: '0.75rem',
                    }}
                  />
                )}
                
                {updatedTask?.metrics?.riskScore >= 4 && (
                  <Chip
                    label="HIGH RISK"
                    color="error"
                    size="medium"
                    icon={<Security fontSize="small" />}
                    sx={{
                      fontWeight: 700,
                      borderRadius: 1.5,
                      height: 28,
                      fontSize: '0.75rem',
                    }}
                  />
                )}
              </Box>
            </Box>
              <Stack direction="row" spacing={1.25} sx={{ width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'flex-end', sm: 'flex-start' } }}>
                <Tooltip title="View Metrics Insights">
                  <IconButton 
                    onClick={() => setMetricsInsightsOpen(true)}
                    disabled={loading}
                    size="medium"
                    sx={{
                      color: theme.palette.primary.main,
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.2),
                        transform: 'scale(1.1)',
                        borderColor: alpha(theme.palette.primary.main, 0.4),
                      },
                      transition: 'all 0.3s ease',
                      width: { xs: 40, sm: 44 },
                      height: { xs: 40, sm: 44 },
                      borderRadius: 2,
                      ml: { xs: 0, sm: 1 },
                    }}
                  >
                    <Insights />
                  </IconButton>
                </Tooltip>
                <IconButton 
                  onClick={onClose} 
                  disabled={loading} 
                  size="medium"
                  sx={{
                    color: theme.palette.text.secondary,
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.15),
                      color: theme.palette.primary.main,
                      transform: 'rotate(90deg)',
                      borderColor: alpha(theme.palette.primary.main, 0.4),
                    },
                    transition: 'all 0.3s ease',
                    width: { xs: 40, sm: 44 },
                    height: { xs: 40, sm: 44 },
                    borderRadius: 2,
                  }}
                > 
                  <Close />
                </IconButton>
              </Stack>

          </Box>
          <TaskMetricsInsights
            task={updatedTask}
            open={metricsInsightsOpen}
            onClose={() => setMetricsInsightsOpen(false)}
            theme={theme}
          />
        </DialogTitle>
      </Box>
      
      {/* Minimalist Tab Navigation */}
      <Box className='modal-tabs' sx={{ 
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
        px: { xs: 0, sm: 4 },
        pt: 1,
        pb: 1,
      }}>
        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            minHeight: 0,
            px: { xs: 1, sm: 0 },
            '& .MuiTabs-flexContainer': { gap: { xs: 0.5, sm: 1 } },
            '& .MuiTabs-indicator': { display: 'none' },
          }}
        >
          {[
            { key: 'overview', label: 'Overview', icon: <Dashboard fontSize="small" /> },
            { key: 'metrics', label: 'Metrics', icon: <Insights fontSize="small" /> },
            { key: 'proof', label: 'Proof', icon: <Upload fontSize="small" /> },
            { key: 'activity', label: 'Activity', icon: <HistoryIcon fontSize="small" /> },
            { key: 'comments', label: 'Comments', icon: <Comment fontSize="small" /> }
          ].map((tab) => (
            <Tab
              key={tab.key}
              value={tab.key}
              icon={tab.icon}
              iconPosition="start"
              label={tab.label}
              data-tour-tab={tab.key}
              data-tour-label={tab.label}
              sx={{
                textTransform: 'capitalize',
                borderRadius: 2,
                minHeight: { xs: 40, sm: 44 },
                px: { xs: 1.5, sm: 2.25 },
                py: 0.75,
                minWidth: 'max-content',
                fontWeight: 700,
                fontFamily: '"Inter", sans-serif',
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                color: theme.palette.text.secondary,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
                backgroundColor: alpha(theme.palette.background.paper, 0.55),
                '&.Mui-selected': {
                  color: theme.palette.common.white,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.22)}`,
                },
              }}
            />
          ))}
        </Tabs>
      </Box>

      <DialogContent dividers sx={{ 
        p: 0,
        bgcolor: alpha(theme.palette.background.default, 0.12),
        '&.MuiDialogContent-dividers': {
          border: 'none',
        }
      }}>
        {/* Loading State */}
        {loading && (
          <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Error State */}
        {error && !loading && (
          <Box sx={{ p: { xs: 2, sm: 4 } }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
            <Button onClick={() => window.location.reload()}>
              Reload Page
            </Button>
          </Box>
        )}

        {/* Overview Tab */}
        {!loading && !error && activeTab === 'overview' && (
          <Box sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {/* Task Description Card */}
              <Paper 
                className='task-description'
                elevation={0}
                sx={{ 
                  p: 3.5, 
                  borderRadius: 3,
                  backgroundColor: alpha(theme.palette.primary.main, 0.03),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2.5 }}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2.5,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    width: 56,
                    height: 56,
                  }}>
                    <Description sx={{ 
                      color: theme.palette.primary.main, 
                      fontSize: 28 
                    }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight="700" gutterBottom sx={{ 
                      fontFamily: '"Adlam Display", serif',
                      color: theme.palette.text.primary,
                    }}>
                      Task Description
                    </Typography>
                    {isEditing ? (
                      <TextField
                        placeholder="Enter Description"
                        multiline
                        fullWidth
                        minRows={3}
                        value={updatedTask?.description}
                        onChange={(e) => 
                          setUpdatedTask(prev => ({ ...prev, description: e.target.value }))
                        }
                      />
                    ) : (
                      <Typography variant="body1" sx={{ 
                        color: theme.palette.text.secondary,
                        fontFamily: '"Inter", sans-serif',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                      }}>
                        {updatedTask?.description}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Paper>

              {/* Key Information Row */}
              <Box className='assignee-deadline' sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 3,
              }}>
                {/* Assignee */}
                <Paper 
                  elevation={0}
                  sx={{ 
                    flex: 1,
                    p: { xs: 2, sm: 3 },
                    borderRadius: 3,
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                    position: 'relative',
                    overflow: 'hidden',
                    minWidth: { xs: 0, sm: 280 },
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2, 
                    mb: 2.5,
                    pb: 2,
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                  }}>
                    <Person sx={{ 
                      color: theme.palette.primary.main, 
                      fontSize: 24 
                    }} />
                    <Typography variant="body1" fontWeight="600" sx={{ 
                      fontFamily: '"Adlam Display", serif',
                      color: theme.palette.text.primary,
                    }}>
                      Assigned To
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                    <Avatar 
                      src={updatedTask?.assignedTo?.avatar}
                      sx={{ 
                        width: 52, 
                        height: 52,
                        fontSize: 18,
                        fontWeight: 'bold',
                        border: `3px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
                      }}
                    >
                      {updatedTask?.assignedTo?.name?.charAt(0) || 'U'}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" fontWeight="600" sx={{ 
                        fontFamily: '"Inter", sans-serif',
                        mb: 0.5,
                      }}>
                        {assignedUserName}
                      </Typography>
                      {updatedTask?.assignedTo?.email && (
                        <Typography variant="caption" sx={{ 
                          color: theme.palette.text.secondary,
                          fontFamily: '"Inter", sans-serif',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                        }}>
                          <Email fontSize="inherit" /> {updatedTask?.assignedTo.email}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Paper>

                {/* Deadline */}
                <Paper 
                  elevation={0}
                  sx={{ 
                    flex: 1,
                    p: { xs: 2, sm: 3 },
                    borderRadius: 3,
                    backgroundColor: updatedTask?.metrics?.isOverdue 
                      ? alpha(theme.palette.error.main, 0.05)
                      : theme.palette.background.paper,
                    border: `1px solid ${updatedTask?.metrics?.isOverdue 
                      ? alpha(theme.palette.error.main, 0.2)
                      : alpha(theme.palette.divider, 0.3)}`,
                    position: 'relative',
                    overflow: 'hidden',
                    minWidth: { xs: 0, sm: 280 },
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    gap: 2, 
                    mb: 2.5,
                    pb: 2,
                    borderBottom: `1px solid ${updatedTask?.metrics?.isOverdue 
                      ? alpha(theme.palette.error.main, 0.2)
                      : alpha(theme.palette.divider, 0.2)}`,
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CalendarToday sx={{ 
                        color: updatedTask?.metrics?.isOverdue 
                          ? theme.palette.error.main
                          : theme.palette.primary.main, 
                        fontSize: 24 
                      }} />
                      <Typography variant="body1" fontWeight="600" sx={{ 
                        fontFamily: '"Adlam Display", serif',
                        color: updatedTask?.metrics?.isOverdue 
                          ? theme.palette.error.main
                          : theme.palette.text.primary,
                      }}>
                        Deadline
                      </Typography>
                    </Box>
                    {updatedTask?.metrics?.isOverdue && (
                      <Chip
                        label="OVERDUE"
                        color="error"
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                  </Box>
                  
                  <Box>
                    <Typography variant="h4" fontWeight="800" gutterBottom sx={{ 
                      fontFamily: '"Alkatra", cursive',
                      color: updatedTask?.metrics?.isOverdue 
                        ? theme.palette.error.main
                        : theme.palette.text.primary,
                    }}>
                      {formatDate(updatedTask?.deadline)}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
                      <AccessTime sx={{ 
                        fontSize: 18, 
                        color: theme.palette.text.secondary 
                      }} />
                      <Typography variant="body2" sx={{ 
                        color: theme.palette.text.secondary,
                        fontFamily: '"Inter", sans-serif',
                      }}>
                        {updatedTask?.metrics?.daysUntilDeadline > 0 
                          ? `${updatedTask?.metrics.daysUntilDeadline} days remaining`
                          : updatedTask?.metrics?.isOverdue 
                            ? 'Past deadline' 
                            : 'Due soon'}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Box>

              {/* Time Tracking & Efficiency */}
              <Box className='time-tracking' sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 3,
              }}>
                {/* Time Tracking */}
                <Paper 
                  elevation={0}
                  sx={{ 
                    flex: 1,
                    p: { xs: 2, sm: 3 },
                    borderRadius: 3,
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                    position: 'relative',
                    overflow: 'hidden',
                    minWidth: { xs: 0, sm: 280 },
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2, 
                    mb: 3,
                    pb: 2,
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                  }}>
                    <Timer sx={{ 
                      color: theme.palette.info.main, 
                      fontSize: 24 
                    }} />
                    <Typography variant="body1" fontWeight="600" sx={{ 
                      fontFamily: '"Adlam Display", serif',
                      color: theme.palette.text.primary,
                    }}>
                      Time Tracking
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 2 }}>
                      <Typography variant="h3" fontWeight="800" sx={{ 
                        fontFamily: '"Alkatra", cursive',
                        color: theme.palette.info.main,
                        lineHeight: 1,
                      }}>
                        {formatTime(updatedTask?.totalFocusTime)}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: theme.palette.text.secondary,
                        fontFamily: '"Inter", sans-serif',
                      }}>
                        of {formatTime(updatedTask?.estimatedTime)} estimated
                      </Typography>
                    </Box>
                    
                    {/* Progress Bar */}
                    <Box sx={{ 
                      position: 'relative', 
                      height: 8, 
                      borderRadius: 4, 
                      backgroundColor: alpha(theme.palette.info.main, 0.1),
                      overflow: 'hidden',
                      mb: 1.5,
                    }}>
                      <Box 
                        sx={{ 
                          position: 'absolute',
                          height: '100%',
                          borderRadius: 4,
                          background: `linear-gradient(90deg, ${theme.palette.info.main}, ${theme.palette.info.light})`,
                          width: `${Math.min(((updatedTask?.totalFocusTime || 0) / ((updatedTask?.estimatedTime || 0) || 1)) * 100, 100)}%`,
                          transition: 'width 0.5s ease',
                        }}
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="caption" sx={{ 
                        color: theme.palette.text.secondary,
                        fontFamily: '"Inter", sans-serif',
                      }}>
                        Time spent
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        color: theme.palette.text.secondary,
                        fontFamily: '"Inter", sans-serif',
                        fontWeight: 600,
                      }}>
                        {(((updatedTask?.totalFocusTime || 0) / ((updatedTask?.estimatedTime || 0) || 1)) * 100).toFixed(1)}%
                      </Typography>
                    </Box>
                  </Box>
                </Paper>

                {/* Efficiency */}
                <Paper 
                  elevation={0}
                  sx={{ 
                    flex: 1,
                    p: { xs: 2, sm: 3 },
                    borderRadius: 3,
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                    position: 'relative',
                    overflow: 'hidden',
                    minWidth: { xs: 0, sm: 280 },
                  }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2, 
                    mb: 3,
                    pb: 2,
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                  }}>
                    <TrendingUp sx={{ 
                      color: theme.palette.success.main, 
                      fontSize: 24 
                    }} />
                    <Typography variant="body1" fontWeight="600" sx={{ 
                      fontFamily: '"Adlam Display", serif',
                      color: theme.palette.text.primary,
                    }}>
                      Efficiency
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 2 }}>
                      <Typography variant="h3" fontWeight="800" sx={{ 
                        fontFamily: '"Alkatra", cursive',
                        color: getEfficiencyColor(updatedTask?.metrics?.efficiency),
                        lineHeight: 1,
                      }}>
                        {(updatedTask?.metrics?.efficiency?.toFixed(1) || '0.0')}%
                      </Typography>
                      <Chip
                        label={updatedTask?.metrics?.efficiencyLabel || getEfficiencyLabel(updatedTask?.metrics?.efficiency)}
                        color={getEfficiencyColor(updatedTask?.metrics?.efficiency)}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                    
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(updatedTask?.metrics?.efficiency || 0, 100)}
                      sx={{ 
                        height: 8, 
                        borderRadius: 4, 
                        mt: 2,
                        backgroundColor: alpha(getEfficiencyColor(updatedTask?.metrics?.efficiency), 0.1),
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getEfficiencyColor(updatedTask?.metrics?.efficiency),
                        }
                      }}
                    />
                    
                    <Typography variant="caption" sx={{ 
                      color: theme.palette.text.secondary,
                      fontFamily: '"Inter", sans-serif',
                      fontStyle: 'italic',
                    }}>
                      {updatedTask?.metrics?.efficiency > 120 
                        ? 'Above expected efficiency' 
                        : updatedTask?.metrics?.efficiency < 50 
                          ? 'Below expected efficiency'
                          : 'Within optimal range'}
                    </Typography>
                  </Box>
                </Paper>
              </Box>

            </Box>
          </Box>
        )}

        {/* Metrics Tab */}
        {!loading && !error && activeTab === 'metrics' && (
          <Box sx={{ p: { xs: 2, sm: 4 } }}>
            <Typography variant="h5" fontWeight="700" gutterBottom sx={{ 
              fontFamily: '"Adlam Display", serif',
              mb: 3,
            }}>
              Task Metrics
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3 }}>
              {/* Risk Score Card */}
              <Paper 
                elevation={0}
                sx={{ 
                  flex: 1,
                  p: 3.5,
                  borderRadius: 3,
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${alpha(getRiskColor(updatedTask?.metrics?.riskScore) === 'error' 
                    ? theme.palette.error.main 
                    : getRiskColor(updatedTask?.metrics?.riskScore) === 'warning'
                      ? theme.palette.warning.main
                      : theme.palette.success.main, 0.2)}`,
                  minWidth: { xs: 0, sm: 280 },
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  mb: 3,
                  pb: 2,
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                }}>
                  <Typography variant="body1" fontWeight="600" sx={{ 
                    fontFamily: '"Adlam Display", serif',
                    color: theme.palette.text.primary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                  }}>
                    <Security sx={{ color: getRiskColor(updatedTask?.metrics?.riskScore) === 'error' 
                      ? theme.palette.error.main 
                      : getRiskColor(updatedTask?.metrics?.riskScore) === 'warning'
                        ? theme.palette.warning.main
                        : theme.palette.success.main }} />
                    Risk Score
                  </Typography>
                  <Chip
                    label={updatedTask?.metrics?.riskScore >= 4 ? 'High' : 
                          updatedTask?.metrics?.riskScore >= 2 ? 'Medium' : 
                          'Low'}
                    color={getRiskColor(updatedTask?.metrics?.riskScore)}
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                </Box>
                
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography variant="h1" fontWeight="800" sx={{ 
                    fontFamily: '"Alkatra", cursive',
                    color: getRiskColor(updatedTask?.metrics?.riskScore) === 'error' 
                      ? theme.palette.error.main 
                      : getRiskColor(updatedTask?.metrics?.riskScore) === 'warning'
                        ? theme.palette.warning.main
                        : theme.palette.success.main,
                    lineHeight: 1,
                    mb: 1,
                  }}>
                    {updatedTask?.metrics?.riskScore || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: theme.palette.text.secondary,
                    fontFamily: '"Inter", sans-serif',
                  }}>
                    out of 8
                  </Typography>
                </Box>
                
                {/* Risk Factors */}
                <Box sx={{ 
                  p: 2.5,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.divider, 0.05),
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}>
                  <Typography variant="body2" fontWeight="600" sx={{ 
                    mb: 2,
                    color: theme.palette.text.secondary,
                    fontFamily: '"Inter", sans-serif',
                  }}>
                    Risk Factors
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {[
                      { label: 'Padded Time', value: updatedTask?.flags?.paddedTime, icon: <Timer /> },
                      { label: 'Rushed Completion', value: updatedTask?.flags?.rushedCompletion, icon: <Speed /> },
                      { label: 'No Proof', value: updatedTask?.flags?.noProof, icon: <Warning /> },
                      { label: 'Manual Review Required', value: updatedTask?.flags?.manualReviewRequired, icon: <Assessment /> }
                    ].map((item) => (
                      <Box 
                        key={item.label} 
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          py: 1,
                          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                          '&:last-child': { borderBottom: 'none' }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ 
                            color: item.value ? theme.palette.error.main : theme.palette.success.main,
                            display: 'flex',
                            alignItems: 'center',
                          }}>
                            {item.icon}
                          </Box>
                          <Typography variant="body2" sx={{ fontFamily: '"Inter", sans-serif' }}>
                            {item.label}
                          </Typography>
                        </Box>
                        <Chip
                          label={item.value ? 'Yes' : 'No'}
                          color={item.value ? 'error' : 'success'}
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 500 }}
                        />
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Paper>

              {/* Efficiency Details Card */}
              <Paper 
                elevation={0}
                sx={{ 
                  mt: 3,
                  p: 3.5,
                  borderRadius: 3,
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                }}
              >
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    mb: 3,
                    pb: 2,
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                    cursor: 'pointer',
                  }}
                  onClick={() => setShowEfficiencyBreakdown(!showEfficiencyBreakdown)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <TrendingUp sx={{ color: theme.palette.primary.main }} />
                    <Box>
                      <Typography variant="h6" fontWeight="700" sx={{ 
                        fontFamily: '"Adlam Display", serif',
                        color: theme.palette.text.primary,
                      }}>
                        Efficiency Breakdown
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: theme.palette.text.secondary,
                        fontFamily: '"Inter", sans-serif',
                      }}>
                        Click to see detailed scoring breakdown
                      </Typography>
                    </Box>
                  </Box>
                  
                  <IconButton size="small">
                    {showEfficiencyBreakdown ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                  </IconButton>
                </Box>
                
                {/* Efficiency Breakdown Content */}
                <Collapse in={showEfficiencyBreakdown}>
                  {efficiencyMetrics ? (
                    <Box>
                      {/* Overall Score Summary */}
                      <Box sx={{ 
                        p: 3, 
                        mb: 3,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Typography variant="body1" fontWeight="600" sx={{ 
                            fontFamily: '"Inter", sans-serif',
                            color: theme.palette.text.primary,
                          }}>
                            Overall Efficiency Score
                          </Typography>
                          <Typography variant="h4" fontWeight="800" sx={{ 
                            fontFamily: '"Alkatra", cursive',
                            color: getEfficiencyColor(efficiencyMetrics?.overall),
                          }}>
                            {efficiencyMetrics?.overall.toFixed(1)}%
                          </Typography>
                        </Box>
                        
                        <LinearProgress 
                          variant="determinate" 
                          value={Math.min(efficiencyMetrics?.overall, 100)}
                          color={getEfficiencyColor(efficiencyMetrics?.overall)}
                          sx={{ 
                            height: 8, 
                            borderRadius: 4, 
                            mt: 2,
                            backgroundColor: alpha(getEfficiencyColor(efficiencyMetrics?.overall), 0.1),
                          }}
                        />
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            Weighted average of 5 factors
                          </Typography>
                          <Typography variant="caption" fontWeight="600" sx={{ 
                            color: getEfficiencyColor(efficiencyMetrics?.overall),
                          }}>
                            {getEfficiencyLabel(efficiencyMetrics?.overall)}
                          </Typography>
                        </Box>
                      </Box>
                      
                      {/* Component Breakdown */}
                      <Typography variant="body1" fontWeight="600" sx={{ 
                        mb: 3,
                        fontFamily: '"Adlam Display", serif',
                        color: theme.palette.text.primary,
                      }}>
                        Component Scores
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {[
                          { 
                            key: 'timeEfficiency', 
                            label: 'Time Efficiency', 
                            description: 'Focus time vs estimated time',
                            icon: <Timer />,
                            weight: '30%'
                          },
                          { 
                            key: 'completionQuality', 
                            label: 'Completion Quality', 
                            description: 'Task status & grading quality',
                            icon: <CheckCircle />,
                            weight: '25%'
                          },
                          { 
                            key: 'timeliness', 
                            label: 'Timeliness', 
                            description: 'Deadline adherence',
                            icon: <CalendarToday />,
                            weight: '20%'
                          },
                          { 
                            key: 'proofQuality', 
                            label: 'Proof Quality', 
                            description: 'Proof submissions & quality',
                            icon: <Upload />,
                            weight: '15%'
                          },
                          { 
                            key: 'integrityAdjustment', 
                            label: 'Integrity Adjustment', 
                            description: 'Final penalty layer applied from task risk',
                            icon: <Security />,
                            weight: '10%'
                          }
                        ].map((component) => {
                          const score = efficiencyMetrics?.components[component.key] || 0;
                          const weightedContribution = (score * parseInt(component.weight)) / 100;
                          
                          return (
                          <Paper
                              key={component.key}
                              elevation={0}
                              sx={{
                                p: { xs: 1.75, sm: 2.5 },
                                borderRadius: 2,
                                backgroundColor: alpha(theme.palette.background.default, 0.5),
                                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                  borderColor: alpha(theme.palette.primary.main, 0.2),
                                }
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0, width: '100%' }}>
                                  <Box sx={{ 
                                    p: 1.5,
                                    borderRadius: 2,
                                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                  }}>
                                    {component.icon}
                                  </Box>
                                  
                                  <Box sx={{ flex: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                      <Typography variant="body2" fontWeight="600" sx={{ 
                                        fontFamily: '"Inter", sans-serif',
                                      }}>
                                        {component.label}
                                      </Typography>
                                      <Chip
                                        label={component.weight}
                                        size="small"
                                        variant="outlined"
                                        sx={{ 
                                          height: 20, 
                                          fontSize: '0.675rem',
                                          fontWeight: 500,
                                        }}
                                      />
                                    </Box>
                                    <Typography variant="caption" sx={{ 
                                      color: theme.palette.text.secondary,
                                      fontFamily: '"Inter", sans-serif',
                                    }}>
                                      {component.description}
                                    </Typography>
                                  </Box>
                                </Box>
                                
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: { xs: 0, sm: 2 }, width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'space-between', sm: 'flex-start' } }}>
                                  <Box sx={{ textAlign: 'center', minWidth: 60 }}>
                                    <Typography variant="h6" fontWeight="700" sx={{ 
                                      fontFamily: '"Alkatra", cursive',
                                      color: getEfficiencyColor(score),
                                    }}>
                                      {score.toFixed(1)}%
                                    </Typography>
                                    <Typography variant="caption" sx={{ 
                                      color: theme.palette.text.secondary,
                                      display: 'block',
                                    }}>
                                      Score
                                    </Typography>
                                  </Box>
                                  
                                  <Box sx={{ textAlign: 'center', minWidth: 60 }}>
                                    <Typography variant="body1" fontWeight="600" sx={{ 
                                      fontFamily: '"Inter", sans-serif',
                                      color: theme.palette.primary.main,
                                    }}>
                                      {weightedContribution.toFixed(1)}%
                                    </Typography>
                                    <Typography variant="caption" sx={{ 
                                      color: theme.palette.text.secondary,
                                      display: 'block',
                                    }}>
                                      Contribution
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>
                              
                              {/* Score Bar */}
                              <Box sx={{ mt: 2 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                    Performance
                                  </Typography>
                                  <Typography variant="caption" fontWeight="600" sx={{ 
                                    color: getEfficiencyColor(score),
                                  }}>
                                    {getEfficiencyLabel(score)}
                                  </Typography>
                                </Box>
                                <LinearProgress 
                                  variant="determinate" 
                                  value={Math.min(score, 100)}
                                  color={getEfficiencyColor(score)}
                                  sx={{ 
                                    height: 6, 
                                    borderRadius: 3,
                                    backgroundColor: alpha(getEfficiencyColor(score), 0.1),
                                  }}
                                />
                              </Box>
                            </Paper>
                          );
                        })}
                      </Box>
                      
                      {/* Legend */}
                      <Paper
                        elevation={0}
                        sx={{
                          mt: 3,
                          p: 2,
                          borderRadius: 2,
                          backgroundColor: alpha(theme.palette.background.default, 0.3),
                          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                        }}
                      >
                        <Typography variant="caption" fontWeight="600" sx={{ 
                          mb: 1.5,
                          display: 'block',
                          color: theme.palette.text.secondary,
                        }}>
                          Scoring Legend
                        </Typography>
                        
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                          {[
                            { range: '85-100%', label: 'Excellent', color: 'success' },
                            { range: '70-84%', label: 'Good', color: 'info' },
                            { range: '50-69%', label: 'Satisfactory', color: 'warning' },
                            { range: '30-49%', label: 'Needs Improvement', color: 'error' },
                            { range: '0-29%', label: 'Unsatisfactory', color: 'error' }
                          ].map((item) => (
                            <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ 
                                width: 12, 
                                height: 12, 
                                borderRadius: '50%',
                                backgroundColor: theme.palette[item.color].main,
                              }} />
                              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                {item.range}: {item.label}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Paper>
                    </Box>
                  ) : (
                    <Box sx={{ 
                      p: 4, 
                      textAlign: 'center',
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.3),
                      border: `1px dashed ${alpha(theme.palette.divider, 0.3)}`,
                    }}>
                      <TrendingUp sx={{ 
                        fontSize: 48, 
                        color: alpha(theme.palette.text.secondary, 0.3),
                        mb: 2,
                      }} />
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        Efficiency breakdown not available
                      </Typography>
                    </Box>
                  )}
                </Collapse>
              </Paper>
            </Box>
          </Box> 
        )}

        {/* Proof Tab */}
        {!loading && !error && activeTab === 'proof' && (
          <Box sx={{ p: { xs: 2, sm: 4 } }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: { xs: 'stretch', sm: 'center' }, 
              flexDirection: { xs: 'column', sm: 'row' },
              mb: 4,
              pb: 2,
              gap: 2,
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            }}>
              <Box>
                <Typography variant="h5" fontWeight="700" gutterBottom sx={{ 
                  fontFamily: '"Adlam Display", serif',
                }}>
                  Proof of Work
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: theme.palette.text.secondary,
                  fontFamily: '"Inter", sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}>
                  <Upload fontSize="small" />
                  {updatedTask?.proofUploads?.length || 0} file(s) uploaded
                </Typography>
              </Box>
              {isAssignedUser && (
                <Button
                  variant="contained"
                  startIcon={<Upload />}
                  size="medium"
                  fullWidth={isMobile}
                  onClick={() => onUploadProof?.(updatedTask)}
                  sx={{ 
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    '&:hover': {
                      boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    }
                  }}
                >
                  Add Proof
                </Button>
              )}
            </Box>
            
            {updatedTask?.proofUploads?.length > 0 ? (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 2.5 
              }}>
                {updatedTask?.proofUploads.map((proof, index) => (
                  <Paper 
                    key={proof._id || index}
                    elevation={0}
                    sx={{ 
                      p: 3, 
                      borderRadius: 3,
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: alpha(theme.palette.primary.main, 0.3),
                        backgroundColor: alpha(theme.palette.primary.main, 0.02),
                        transform: 'translateX(4px)',
                      }
                    }}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'flex-start',
                      gap: 2,
                    }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                          <Box sx={{ 
                            p: 1.5,
                            borderRadius: 2,
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <Attachment sx={{ color: theme.palette.primary.main }} />
                          </Box>
                          <Box>
                            <Typography variant="body1" fontWeight="600" sx={{ 
                              fontFamily: '"Inter", sans-serif',
                            }}>
                              {proof.filename || `Proof ${index + 1}`}
                            </Typography>
                            <Typography variant="caption" sx={{ 
                              color: theme.palette.text.secondary,
                              fontFamily: '"Inter", sans-serif',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              mt: 0.5,
                            }}>
                              <CalendarToday fontSize="inherit" />
                              Uploaded {formatDate(proof.uploadedAt)}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => viewProofFile(updatedTask?._id, proof._id)}
                          sx={{ 
                            color: theme.palette.primary.main,
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.2),
                            }
                          }}
                        >
                          <Visibility />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => downloadProofFile(updatedTask?._id, proof._id, proof.filename)}
                          sx={{ 
                            color: theme.palette.info.main,
                            backgroundColor: alpha(theme.palette.info.main, 0.1),
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.info.main, 0.2),
                            }
                          }}
                        >
                          <Download />
                        </IconButton>
                        <IconButton
                          size='small'
                          onClick={() => deleteProofFile(updatedTask?._id, proof._id)}
                          sx={{ 
                            color: theme.palette.error.main,
                            backgroundColor: alpha(theme.palette.error.main, 0.1),
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.error.main, 0.2),
                            }
                          }}
                        >
                          <DeleteForeverSharp/>
                        </IconButton>
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </Box>
            ) : (
              <Paper 
                elevation={0}
                sx={{ 
                  p: 6, 
                  textAlign: 'center', 
                  borderRadius: 3,
                  backgroundColor: alpha(theme.palette.background.default, 0.5),
                  border: `2px dashed ${alpha(theme.palette.divider, 0.3)}`,
                }}
              >
                <Upload sx={{ 
                  fontSize: 56, 
                  color: alpha(theme.palette.text.secondary, 0.3),
                  mb: 3,
                }} />
                <Typography variant="h6" gutterBottom sx={{ 
                  color: theme.palette.text.secondary,
                  fontFamily: '"Adlam Display", serif',
                  mb: 1.5,
                }}>
                  No Proof Uploaded
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: theme.palette.text.secondary,
                  fontFamily: '"Inter", sans-serif',
                  maxWidth: 400,
                  mx: 'auto',
                  lineHeight: 1.6,
                }}>
                  Upload proof of work to reduce risk score and provide verification for completed tasks.
                </Typography>
              </Paper>
            )}
          </Box>
        )}
        
        {/* Activity Tab */}
        {!loading && !error && activeTab === 'activity' && (
          <Box sx={{ p: { xs: 2, sm: 4 } }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 4,
              pb: 2,
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            }}>
              <Box>
                <Typography variant="h5" fontWeight="700" gutterBottom sx={{ 
                  fontFamily: '"Adlam Display", serif',
                }}>
                  Activity Log
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: theme.palette.text.secondary,
                  fontFamily: '"Inter", sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}>
                  <HistoryIcon fontSize="small" />
                  {activityLogs.length} activities recorded
                </Typography>
              </Box>
              <Button
                startIcon={<Refresh />}
                onClick={fetchActivityLogs}
                disabled={loadingActivity}
                variant="outlined"
                size="medium"
                sx={{ 
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  fontWeight: 600,
                }}
              >
                Refresh
              </Button>
            </Box>
            
            {loadingActivity ? (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                p: 6,
              }}>
                <CircularProgress size={48} sx={{ mb: 3, color: theme.palette.primary.main }} />
                <Typography variant="body2" sx={{ 
                  color: theme.palette.text.secondary,
                  fontFamily: '"Inter", sans-serif',
                }}>
                  Loading activities...
                </Typography>
              </Box>
            ) : activityLogs.length === 0 ? (
              <Paper 
                elevation={0}
                sx={{ 
                  p: 6, 
                  textAlign: 'center', 
                  borderRadius: 3,
                  backgroundColor: alpha(theme.palette.background.default, 0.5),
                  border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                }}
              >
                <HistoryIcon sx={{ 
                  fontSize: 56, 
                  color: alpha(theme.palette.text.secondary, 0.3),
                  mb: 3,
                }} />
                <Typography variant="h6" gutterBottom sx={{ 
                  color: theme.palette.text.secondary,
                  fontFamily: '"Adlam Display", serif',
                  mb: 1.5,
                }}>
                  No Activity Yet
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: theme.palette.text.secondary,
                  fontFamily: '"Inter", sans-serif',
                  maxWidth: 400,
                  mx: 'auto',
                  lineHeight: 1.6,
                }}>
                  Activities will appear here when changes are made to this task or when users interact with it.
                </Typography>
              </Paper>
            ) : (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: 2 
              }}>
                {activityLogs.map((log, index) => (
                  <Paper 
                    key={log.id || index}
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                      position: 'relative',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.02),
                        borderColor: alpha(theme.palette.primary.main, 0.2),
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 2.5 }}>
                      <Avatar
                        sx={{
                          width: 44,
                          height: 44,
                          backgroundColor: log.isSystemEvent 
                            ? theme.palette.grey[500]
                            : theme.palette.primary.main,
                          boxShadow: `0 4px 12px ${alpha(log.isSystemEvent 
                            ? theme.palette.grey[500]
                            : theme.palette.primary.main, 0.2)}`,
                        }}
                      >
                        {log.isSystemEvent ? (
                          <Settings />
                        ) : (
                          log.user?.name?.charAt(0) || 'U'
                        )}
                      </Avatar>
                      
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" sx={{ 
                          fontFamily: '"Inter", sans-serif',
                          fontWeight: 600,
                          mb: 1,
                        }}>
                          {log.action || 'Activity'}
                        </Typography>
                        
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 2,
                          flexWrap: 'wrap',
                          mb: 1.5,
                        }}>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              color: theme.palette.text.secondary,
                              fontFamily: '"Inter", sans-serif',
                            }}
                          >
                            <Person fontSize="inherit" />
                            {log.user?.name || 'System'}
                          </Typography>
                          
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              color: theme.palette.text.secondary,
                              fontFamily: '"Inter", sans-serif',
                            }}
                          >
                            <AccessTime fontSize="inherit" />
                            {log.time || 'Recently'}
                          </Typography>
                          
                          {log.metadata?.duration && (
                            <Chip
                              label={formatTime(log.metadata.duration)}
                              size="small"
                              icon={<Timer />}
                              variant="outlined"
                              sx={{ fontWeight: 500 }}
                            />
                          )}
                          
                          {log.eventType === 'efficiency_update' && (
                            <Chip
                              label={`${log.metadata.efficiency}%`}
                              size="small"
                              color="info"
                              variant="outlined"
                              sx={{ fontWeight: 500 }}
                            />
                          )}
                          
                          {log.eventType === 'proof_upload' && (
                            <Chip
                              label="Proof"
                              size="small"
                              icon={<Upload />}
                              color="success"
                              variant="outlined"
                              sx={{ fontWeight: 500 }}
                            />
                          )}
                        </Box>
                        
                        {log.metadata?.comment && (
                          <Paper
                            elevation={0}
                            sx={{
                              mt: 2,
                              p: 2,
                              borderRadius: 2,
                              backgroundColor: alpha(theme.palette.info.main, 0.05),
                              border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                            }}
                          >
                            <Typography variant="body2" sx={{ 
                              color: theme.palette.text.secondary,
                              fontFamily: '"Inter", sans-serif',
                              fontStyle: 'italic',
                            }}>
                              {log.metadata.comment}
                            </Typography>
                          </Paper>
                        )}
                      </Box>
                    </Box>
                  </Paper>
                ))}
              </Box>
            )}
            
            {activityLogs.length > 0 && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                mt: 4,
                pt: 3,
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              }}>
                <Typography variant="caption" sx={{ 
                  color: theme.palette.text.secondary,
                  fontFamily: '"Inter", sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}>
                  <Info fontSize="small" />
                  Showing {activityLogs.length} most recent activities
                </Typography>
              </Box>
            )}
          </Box>
        )}
        {/*Comments tab */}
        {!loading && !error && activeTab === 'comments' && (
          <Box sx={{ p: { xs: 2, sm: 4 }, height: '100%' }}>
            <CommentTab
              taskId={updatedTask?._id}
              projectId={updatedTask?.projectId}
              currentUser={user}
            />
          </Box>
        )}
      </DialogContent>
      
      {/* Dialog Actions */}
      <DialogActions sx={{ 
        p: { xs: 2, sm: 2.5 }, 
        justifyContent: 'space-between',
        alignItems: { xs: 'stretch', sm: 'center' },
        flexDirection: { xs: 'column', sm: 'row' },
        gap: 1.5,
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        backgroundColor: alpha(theme.palette.background.default, 0.3),
      }}>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', width: '100%' }}>
          {userRole?.role === 'teacher' || userRole?.role === 'admin' ? (
            <>
              <Button
                startIcon={<Flag />}
                color="warning"
                disabled={loading}
                onClick={handleEditFlags}
                size="small"
                sx={{ 
                  borderRadius: 2,
                  px: 2.5,
                  py: 1,
                  fontWeight: 600,
                  fontFamily: '"Inter", sans-serif',
                }}
              >
                Edit Flags
              </Button>
              <Button
                startIcon={<Grade />}
                color="primary"
                disabled={loading}
                onClick={handleGradeOverride}
                size="small"
                sx={{ 
                  borderRadius: 2,
                  px: 2.5,
                  py: 1,
                  fontWeight: 600,
                  fontFamily: '"Inter", sans-serif',
                }}
              >
                Override Grade
              </Button>

              {updatedTask?.assignedTo?._id && (
                <Button
                  startIcon={<Person />}
                  color="secondary"
                  disabled={loading}
                  onClick={handleReassignTask}
                  size="small"
                  sx={{ 
                    borderRadius: 2,
                    px: 2.5,
                    py: 1,
                    fontWeight: 600,
                    fontFamily: '"Inter", sans-serif',
                  }}
                >
                  Reassign
                </Button>
              )}
            </>
          ) : isAssignedUser && (
            <>
              {updatedTask?.status !== 'completed' && (
                <Button
                  type="button"
                  variant="contained"
                  startIcon={<CheckCircle />}
                  onClick={() => onStatusChange?.(updatedTask?._id, "completed")}
                  disabled={loading}
                  size="small"
                  sx={{ 
                    borderRadius: 2,
                    px: 2.5,
                    py: 1,
                    fontWeight: 600,
                    background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                    fontFamily: '"Inter", sans-serif',
                  }}
                >
                  Mark Complete
                </Button>
              )}
              {updatedTask?.status === 'completed' && (
                <Button
                  variant="outlined"
                  onClick={() => onStatusChange?.(updatedTask?._id,'active')}
                  disabled={loading}
                  size="small"
                  sx={{ 
                    borderRadius: 2,
                    px: 2.5,
                    py: 1,
                    fontWeight: 600,
                    fontFamily: '"Inter", sans-serif',
                  }}
                >
                  Reopen
                </Button>
              )}
              <Button
                startIcon={<Comment />}
                onClick={handleAddComment}
                disabled={loading}
                size="small"
                sx={{ 
                  borderRadius: 2,
                  px: 2.5,
                  py: 1,
                  fontWeight: 600,
                  fontFamily: '"Inter", sans-serif',
                }}
              >
                Add Comment
              </Button>
            </>
          )}
        </Box>
        <Button 
          onClick={onClose} 
          disabled={loading}
          size="medium"
          fullWidth={isMobile}
          sx={{ 
            borderRadius: 2,
            px: 3,
            py: 1,
            fontWeight: 600,
            fontFamily: '"Adlam Display", serif',
            color: theme.palette.text.secondary,
            '&:hover': {
              color: theme.palette.primary.main,
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
            }
          }}
        >
          Close
        </Button>
      </DialogActions>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity={snackbar.severity} 
          variant="filled"
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      <AssigneeSelectPopover
        anchorEl={assigneeAnchorEl}
        open={Boolean(assigneeAnchorEl)}
        onClose={() => setAssigneeAnchorEl(null)}
        currentAssignee={currentAssignee}
        onAssigneeSelect={handleAssigneeChange}
        theme={theme}
        task={updatedTask}
        currentUser={user}
      />
    </Dialog>
  );
};

export default TaskDetailsModal;
