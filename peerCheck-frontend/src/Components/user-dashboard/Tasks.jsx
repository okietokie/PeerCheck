// Tasks.jsx
import React, { useState, useEffect, useCallback } from 'react';
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
  Snackbar
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
  
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axiosClient from '@/api/axiosClient';
import { useNavigate, useParams  } from 'react-router-dom';
import { getAuthToken } from '../../utils/auth.js';
import { useInView } from 'react-intersection-observer';
import TaskTableRow from './TaskTableRow.jsx';
import TaskDetailsModal from './TaskDetailsModal.jsx';
import ErrorSnack from './ErrorSnack.jsx';



// Helper to get user data
const getUserData = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    const user = JSON.parse(userStr);
    return user;
  } catch (err) {
    console.error('Error parsing user data:', err);
    return null;
  }
};

const TaskTabs = ({ activeTab, setActiveTab, tasks, userId, setFilteredTasks }) => {
  // Map tab values to indices for MUI Tabs
  const tabIndex = { all: 0, my: 1, managed: 2 };
  const indexToTab = ["all", "my", "managed"];

  const handleChange = (event, newValue) => {
    setActiveTab(indexToTab[newValue]);
  };
  
  useEffect(() => {
    const filtered = tasks.filter(task => {
      if (activeTab === "all") return true;
      if (activeTab === "my") return task.assignedTo?._id === userId;
      if (activeTab === "managed") return task.assignedTo?._id !== userId;
      return false;
    });
    setFilteredTasks(filtered);
  }, [activeTab, tasks, userId, setFilteredTasks]);

  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
      <Tabs
        value={tabIndex[activeTab]}
        onChange={handleChange}
        textColor="primary"
        indicatorColor="primary"
        aria-label="task tabs"
      >
        <Tab label="All Tasks" />
        <Tab label="My Tasks" />
        <Tab label="Tasks Managed by Me" />
      </Tabs>
    </Box>
  );
};






// Upload Proof Modal
export const UploadProofModal = ({ open, onClose, task, theme, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setFile(null);
      setDescription('');
      setError('');
    }
  }, [open]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size must be less than 10MB');
      return;
    }
    setFile(selectedFile);
    setError('');
  };

 
  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) {
        setError('Authentication required');
        return;
      }

      const formData = new FormData();
      formData.append('proofFile', file);
      if (description) {
        formData.append('description', description);
      }

      const response = await axiosClient.post(
        `/user/task/${task._id}/proof`,
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data?.success) {
        onSuccess?.();
        onClose();
      } else {
        setError(response.data?.error || 'Failed to upload proof');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload proof');
      console.error('Upload proof error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={!loading ? onClose : undefined} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Upload Proof</Typography>
          <IconButton onClick={onClose} disabled={loading} size="small">
            <Close />
          </IconButton>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {task?.taskTitle}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <input
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt,.zip"
            style={{ display: 'none' }}
            id="proof-file-upload"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="proof-file-upload">
            <Button
              variant="outlined"
              component="span"
              fullWidth
              startIcon={<Upload />}
              sx={{ py: 3 }}
            >
              {file ? file.name : 'Select File'}
            </Button>
          </label>
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Accepted formats: PDF, Images, Documents, Text files (max 10MB)
          </Typography>
          
          <TextField
            fullWidth
            label="Description (optional)"
            multiline
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ mt: 3 }}
            disabled={loading}
          />
          
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="caption">
              Proof uploads are required for task verification and reduce risk scores.
            </Typography>
          </Alert>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !file}
          startIcon={loading ? <CircularProgress size={20} /> : <Upload />}
        >
          {loading ? 'Uploading...' : 'Upload Proof'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const AssignTaskDialog = ({ open, onClose, task, projectTeam, onAssign, theme }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAssign = async () => {
    if (!selectedUser) {
      alert('Please select a user');
      return;
    }
    
    setLoading(true);
    try {
      await onAssign(selectedUser._id);
      onClose();
    } catch (error) {
      console.error('Error assigning task:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Assign Task</Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {task?.taskTitle}
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" gutterBottom>
            Select team member to assign this task to:
          </Typography>
          
          <Box sx={{ 
            maxHeight: 300, 
            overflowY: 'auto',
            mt: 2,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1
          }}>
            {projectTeam?.map(user => (
              <Paper
                key={user._id}
                sx={{
                  p: 2,
                  m: 1,
                  cursor: 'pointer',
                  backgroundColor: selectedUser?._id === user._id 
                    ? alpha(theme.palette.primary.main, 0.1)
                    : 'background.paper',
                  border: selectedUser?._id === user._id 
                    ? `2px solid ${theme.palette.primary.main}`
                    : `1px solid ${theme.palette.divider}`,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.05)
                  }
                }}
                onClick={() => setSelectedUser(user)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar src={user.avatar}>
                    {user.name?.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      {user.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                  {task.assignedTo?._id === user._id && (
                    <Chip 
                      label="Current" 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  )}
                </Box>
              </Paper>
            ))}
            
            {(!projectTeam || projectTeam.length === 0) && (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Person sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  No team members available
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleAssign}
          variant="contained"
          disabled={loading || !selectedUser}
          startIcon={loading ? <CircularProgress size={20} /> : <Person />}
        >
          {loading ? 'Assigning...' : 'Assign Task'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};




// Main Tasks Page Component
const Tasks = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const isProjectView = Boolean(projectId);
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [selectedTask, setSelectedTask] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [uploadProofOpen, setUploadProofOpen] = useState(false);
  const [sortBy, setSortBy] = useState('deadline');
  const [user, setUser] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    riskLevel: 'all',
    hasProof: 'all',
    isOverdue: false
  });
  const [metrics, setMetrics] = useState(null);
  const [authError, setAuthError] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userTeacher, setUserTeacher] = useState(false);
  const [uploadProofModalOpen, setUploadProofModalOpen] = useState(false);
  const [selectedTaskForProof, setSelectedTaskForProof] = useState(null);
  const [liveTimers, setLiveTimers] = useState({}); 

  const [proofUploadMessage, setProofUploadMessage] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const { ref, inView } = useInView({
    threshold: 0.5,
  });

  // Check authentication and get user role
  const checkAuth = useCallback(() => {
    const token = getAuthToken();
    const user = getUserData();
    
    setUser(user);
    if (!token || !user) {
      setAuthError(true);
      setError('Please log in to view tasks.');
      return false;
    }
    
    // Set user role from user data
    setUserRole({
      role: user.role || 'peer',
      userId: user.id || user._id
    });
    return true;
  }, []);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      if (!checkAuth()) {
        setLoading(false);
        return;
      }

      const token = getAuthToken();

      const response = await axiosClient.get('/user/tasks/all', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.data?.success) {
        throw new Error('Failed to fetch tasks');
      }

      const tasksData = response.data?.tasks || [];
      setUserId(response.data?.user?._id);

      const enrichedTasks = tasksData.map(task => {
        const taskMetrics = calculateTaskMetricsFromData(task);

        return {
          ...task,
          metrics: {
            efficiency: Number(taskMetrics.efficiency ?? 0),
            riskScore: taskMetrics.risk.riskScore,
            isOverdue: taskMetrics.isOverdue,
            hasProof: taskMetrics.hasProof,
            proofCount: task.proofUploads?.length || 0,
            statusWeightPercentage: calculateStatusWeight(task.status),
            daysUntilDeadline: taskMetrics.daysUntilDeadline
          }
        };
      });
      
      setTasks(enrichedTasks);
      setFilteredTasks(enrichedTasks);
      setAuthError(false);

    } catch (err) {
      console.error('Error fetching tasks:', err);
      handleFetchError(err);
    } finally {
      setLoading(false);
    }
  }, [checkAuth]);

  // Live timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveTimers(prev => {
        const updated = { ...prev };
        tasks.forEach(task => {
          if (task.status === 'active') {
            updated[task._id] = (updated[task._id] || 0) + 1;
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [tasks]);

  // Helper functions for task metrics calculation
  const calculateTaskMetricsFromData = (task) => {
    return {
      efficiency: {
        percentage: task.estimatedTime 
          ? Math.round((task.totalFocusTime / task.estimatedTime) * 100 * 100) / 100 
          : 0
      },
      risk: {
        riskScore: calculateRiskScore(task)
      },
      isOverdue: calculateIsOverdue(task),
      hasProof: task.proofUploads && task.proofUploads.length > 0,
      daysUntilDeadline: calculateDaysUntilDeadline(task.deadline)
    };
  };

  const calculateRiskScore = (task) => {
    const flags = task.flags || {};
    return (
      (flags.paddedTime ? 2 : 0) +
      (flags.rushedCompletion ? 2 : 0) +
      (flags.noProof ? 1 : 0) +
      (flags.manualReviewRequired ? 3 : 0)
    );
  };

  const calculateIsOverdue = (task) => {
    if (!task.deadline) return false;
    const deadline = new Date(task.deadline);
    const now = new Date();
    return deadline < now && task.status !== 'completed';
  };

  const calculateStatusWeight = (status) => {
    const weights = {
      'completed': 100,
      'active': 50,
      'paused': 30,
      'not_started': 0
    };
    return weights[status] || 0;
  };

  const calculateDaysUntilDeadline = (deadline) => {
    if (!deadline) return 0;
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const diffTime = deadlineDate - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const handleOpenUploadProof = (task) => {
    setSelectedTaskForProof(task);
    setUploadProofModalOpen(true);
  };

  const handleProofUploadSuccess = () => {
    setProofUploadMessage({
      open: true,
      message: "Proof uploaded successfully!",
      severity: "success"
    });
    fetchTasks();
  };
  
const handleTaskFieldUpdate = async (taskId, updates) => {
  try {
    const token = getAuthToken();
    
    //ex:updates is { field: 'deadline', value: '2024-01-01T23:59:59.999Z' }
    console.log("updating field: ", updates);
    const response = await axiosClient.patch(`/user/${taskId}/field`, 
      {
        field: updates.field,  
        value: updates.value  
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    if (response.data?.success) {
      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task._id === taskId 
            ? { 
                ...task, 
                [updates.field]: updates.value,
                ...response.data.task // Merge any additional data from backend
              }
            : task
        )
      );
      
      return response.data;
    } else {
      console.error("Error finding link ig");
      throw new Error(response.data?.error || 'Failed to update task');
    }
  } catch (error) {
    console.error('Error updating task:', error);
    // Show error toast
    throw error;
  }
};

  const handleFetchError = (err) => {
    if (err.response?.status === 401) {
      setAuthError(true);
      setError('Session expired. Please log in again.');
    } else if (err.code === 'ERR_NETWORK') {
      setError('Network error. Please check your connection.');
    } else {
      setError(err.response?.data?.error || 'Failed to load tasks. Please try again.');
    }
  };

  // Filter and sort tasks
  useEffect(() => {
    let result = [...tasks];
    
    // Apply filters
    if (filters.status !== 'all') {
      result = result.filter(task => task.status === filters.status);
    }
    
    if (filters.riskLevel !== 'all') {
      result = result.filter(task => {
        const riskScore = task.metrics?.riskScore || 0;
        if (filters.riskLevel === 'high') return riskScore >= 4;
        if (filters.riskLevel === 'medium') return riskScore >= 2 && riskScore < 4;
        return riskScore < 2;
      });
    }
    
    if (filters.hasProof !== 'all') {
      const hasProof = filters.hasProof === 'true';
      result = result.filter(task => 
        hasProof 
          ? task.metrics?.hasProof 
          : !task.metrics?.hasProof
      );
    }
    
    if (filters.isOverdue) {
      result = result.filter(task => task.metrics?.isOverdue);
    }
    
    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(task =>
        task.taskTitle?.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.assignedTo?.name?.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case 'deadline':
          return new Date(a.deadline) - new Date(b.deadline);
        case 'risk':
          return (b.metrics?.riskScore || 0) - (a.metrics?.riskScore || 0);
        case 'efficiency':
          return (a.metrics?.efficiency || 0) - (b.metrics?.efficiency || 0);
        case 'status':
          const statusOrder = { completed: 4, active: 3, paused: 2, not_started: 1 };
          return statusOrder[b.status] - statusOrder[a.status];
        default:
          return 0;
      }
    });
    
    setFilteredTasks(result);
  }, [tasks, searchQuery, sortBy, filters]);

  const deleteTask = async (taskId) => {
    try {
      const token = getAuthToken();
      if (!token) {
        setError('Authentication required');
        return;
      } 
      await axiosClient.delete(`/user/task/${taskId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return true;
    } catch (err) {
      console.error('Failed to delete task:', err);
      setError(err.response?.data?.error || 'Failed to delete task');
      return false;
    }
  };

  const handleSelectTask = (taskId, checked) => {
    const newSelected = new Set(selectedTasks);
    if (checked) {
      newSelected.add(taskId);
    } else {
      newSelected.delete(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedTasks(new Set(filteredTasks.map(t => t._id)));
    } else {
      setSelectedTasks(new Set());
    }
  };
 const handleStatusChange = async (taskId, newStatus) => {
    try {
      const token = getAuthToken();
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await axiosClient.put(`/user/task/${taskId}/status`,
        { status: newStatus, timestamp: new Date().toISOString() },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data?.success) {
        const updatedTask = response.data?.task;
        setTasks(prevTasks => prevTasks.map(t =>
          t._id === taskId ? updatedTask : t
        ));
        
        setError(null); // Clear error on success
        
        if (selectedTask && selectedTask._id === taskId) {
          setSelectedTask(prev => ({
            ...prev,
            status: newStatus,
            lastEventTime: updatedTask.lastEventTime
          }));
        }
      } else {
        setError(response.data?.error || 'Failed to update task status');
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      setError(err.response?.data?.error || 'Failed to update task status');
    }
  };

useEffect(() => {
  if(error){
    <ErrorSnack newError={error}/>  
  }
},[error])


  const handleUploadProof = (task) => {
    setSelectedTask(task);
    setUploadProofOpen(true);
  };

  const handleViewDetails = (task) => {
    setSelectedTask(task);
    setDetailsOpen(true);
  };

  const handleTaskUpdate = () => {
    fetchTasks();
  };

  const handleDeleteSelected = async () => {
    if (selectedTasks.size === 0) return;

    if (!window.confirm(`Delete ${selectedTasks.size} selected task(s)?`)) return;

    const token = getAuthToken();
    if (!token) {
      setError("Authentication required");
      return;
    }

    try {
      const ids = Array.from(selectedTasks);
      const deletePromises = ids.map(id => deleteTask(id));
      await Promise.all(deletePromises);

      setTasks(prev => prev.filter(task => !selectedTasks.has(task._id)));
      setFilteredTasks(prev => prev.filter(task => !selectedTasks.has(task._id)));
      setSelectedTasks(new Set());

    } catch (err) {
      console.error("Failed bulk delete:", err);
    }
  };

  const allSelected = filteredTasks.length > 0 && selectedTasks.size === filteredTasks.length;

  // Load data on mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Update userTeacher state
  useEffect(() => {
    if (userRole?.role === 'teacher') {
      setUserTeacher(true);
    }
  }, [userRole]);

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      p: { xs: 2, sm: 3 },
      backgroundColor: theme.palette.background.default,
    }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight="600" gutterBottom sx={{ color: theme.palette.text.primary }}>
              {isProjectView ? 'Project Tasks' : 'My Tasks'}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              {isProjectView ? 'Manage and track project tasks with accountability metrics' : 'Track your assigned tasks across all projects'}
            </Typography>
          </Box>
          
          <Button 
            variant="outlined"
            onClick={() => navigate('/user-app/projects')}
            startIcon={<ArrowBack />}
            size="small"
            sx={{ borderRadius: 1 }}
          >
            {isProjectView ? 'Back to Projects' : 'View Projects'}
          </Button>
        </Box>

        {/* Search and Filter Bar */}
        {!authError && (
          <Paper
            sx={{
              p: 2,
              borderRadius: 1,
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              mb: 3
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: theme.palette.text.secondary }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      label="Status"
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="not_started">Not Started</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="paused">Paused</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Risk Level</InputLabel>
                    <Select
                      value={filters.riskLevel}
                      onChange={(e) => setFilters(prev => ({ ...prev, riskLevel: e.target.value }))}
                      label="Risk Level"
                    >
                      <MenuItem value="all">All Risk</MenuItem>
                      <MenuItem value="low">Low Risk</MenuItem>
                      <MenuItem value="medium">Medium Risk</MenuItem>
                      <MenuItem value="high">High Risk</MenuItem>
                    </Select>
                  </FormControl>

                  <Tooltip title="Overdue Only">
                    <IconButton 
                      size="small"
                      color={filters.isOverdue ? "error" : "default"}
                      onClick={() => setFilters(prev => ({ ...prev, isOverdue: !prev.isOverdue }))}
                    >
                      <Warning />
                    </IconButton>
                  </Tooltip>

                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Sort By</InputLabel>
                    <Select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      label="Sort By"
                    >
                      <MenuItem value="deadline">Deadline</MenuItem>
                      <MenuItem value="risk">Risk Score</MenuItem>
                      <MenuItem value="efficiency">Efficiency</MenuItem>
                      <MenuItem value="status">Status</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        )}
      </Box>

      {/* Stats Cards */}
      {!authError && tasks.length > 0 && (
        <Box sx={{ 
          mb: 4,
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
              label: 'Total Tasks', 
              value: filteredTasks.length, 
              icon: <Assessment fontSize="small" />,
              color: theme.palette.primary.main,
              gradient: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)}, ${alpha(theme.palette.primary.main, 0.05)})`,
              hoverGradient: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.primary.main, 0.1)})`
            },
            { 
              label: 'High Risk', 
              value: filteredTasks.filter(t => t.metrics?.riskScore >= 4).length, 
              icon: <Security fontSize="small" />,
              color: theme.palette.error.main,
              gradient: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.12)}, ${alpha(theme.palette.error.main, 0.04)})`,
              hoverGradient: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.18)}, ${alpha(theme.palette.error.main, 0.08)})`
            },
            { 
              label: 'Completed', 
              value: filteredTasks.filter(t => t.status === 'completed').length, 
              icon: <CheckCircle fontSize="small" />,
              color: theme.palette.success.main,
              gradient: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.12)}, ${alpha(theme.palette.success.main, 0.04)})`,
              hoverGradient: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.18)}, ${alpha(theme.palette.success.main, 0.08)})`
            },
            { 
              label: 'Need Proof', 
              value: filteredTasks.filter(t => !t.metrics?.hasProof).length, 
              icon: <Warning fontSize="small" />,
              color: theme.palette.warning.main,
              gradient: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.12)}, ${alpha(theme.palette.warning.main, 0.04)})`,
              hoverGradient: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.18)}, ${alpha(theme.palette.warning.main, 0.08)})`
            }
          ].map((stat, index) => (
            <Paper
              key={stat.label}
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                background: stat.gradient,
                border: `1.5px solid ${alpha(stat.color, 0.15)}`,
                position: 'relative',
                overflow: 'hidden',
                cursor: 'default',
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
                  {stat.label}
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
                {index === 0 && 'All active tasks in queue'}
                {index === 1 && 'Tasks requiring attention'}
                {index === 2 && 'Successfully finished tasks'}
                {index === 3 && 'Awaiting verification'}
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
                  width: `${Math.min(100, (stat.value / Math.max(1, filteredTasks.length)) * 100)}%`,
                  background: `linear-gradient(90deg, ${alpha(stat.color, 0.6)}, ${stat.color})`,
                  borderRadius: 1,
                  transition: 'width 0.8s ease',
                }
              }} />
            </Paper>
          ))}
        </Box>
      )}

      <TaskTabs 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        tasks={tasks}
        setFilteredTasks={setFilteredTasks}
        userId={userId}
      />

      {/* Content */}
      {error && !authError ? (
        <Alert 
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      ) : loading ? (
        // Loading Skeletons
        <Box>
          {[...Array(5)].map((_, index) => (
            <Skeleton 
              key={index} 
              variant="rectangular" 
              height={60} 
              sx={{ 
                borderRadius: 1, 
                mb: 1,
                backgroundColor: theme.palette.action.hover
              }} 
            />
          ))}
        </Box>
      ) : filteredTasks.length === 0 || authError ? (
        // Empty State
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 2,
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          {authError ? (
            <Box>
              <Typography variant="h6" fontWeight="600" gutterBottom sx={{ color: theme.palette.error.main, mb: 1 }}>
                Authentication Required
              </Typography>
              <Typography variant="body2" sx={{ 
                color: theme.palette.text.secondary, 
                mb: 4, 
                maxWidth: 400, 
                mx: 'auto' 
              }}>
                Please log in to view your tasks.
              </Typography>
              <Button
                variant="contained"
                onClick={() => window.location.href = '/'}
              >
                Go to Login
              </Button>
            </Box>
          ) : (
            <Box>
              <Assessment sx={{ 
                fontSize: 60, 
                color: theme.palette.text.disabled, 
                mb: 3,
              }} />
              <Typography variant="h6" fontWeight="600" gutterBottom sx={{ color: theme.palette.text.primary, mb: 1 }}>
                No Tasks Found
              </Typography>
              <Typography variant="body2" sx={{ 
                color: theme.palette.text.secondary, 
                mb: 4, 
                maxWidth: 400, 
                mx: 'auto' 
              }}>
                {searchQuery || Object.values(filters).some(v => v !== 'all' && v !== false)
                  ? 'Try adjusting your search or filters'
                  : isProjectView
                    ? 'No tasks have been created for this project yet'
                    : 'You don\'t have any assigned tasks yet'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                {(searchQuery || Object.values(filters).some(v => v !== 'all' && v !== false)) && (
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setSearchQuery('');
                      setFilters({
                        status: 'all',
                        riskLevel: 'all',
                        hasProof: 'all',
                        isOverdue: false
                      });
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
                {isProjectView && userRole?.role === 'teacher' && (
                  <Button
                    variant="contained"
                    onClick={() => {/* Open create task modal */}}
                    startIcon={<Add />}
                  >
                    Create First Task
                  </Button>
                )}
              </Box>
            </Box>
          )}
        </Paper>
      ) : (
        // Tasks Table
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Paper
            sx={{
              borderRadius: 3,
              background: theme.palette.mode === 'dark' 
                ? `linear-gradient(135deg, 
                    ${alpha(theme.palette.background.paper, 0.95)} 0%, 
                    ${alpha(theme.palette.background.paper, 0.9)} 100%)`
                : `linear-gradient(135deg, 
                    ${alpha(theme.palette.background.paper, 1)} 0%, 
                    ${alpha(theme.palette.background.default, 0.3)} 100%)`,
              border: `1.5px solid ${alpha(theme.palette.primary.main, 0.08)}`,
              overflow: 'hidden',
              position: 'relative',
              boxShadow: `0 4px 24px ${alpha(theme.palette.mode === 'dark' ? '#000' : theme.palette.primary.main, 0.08)}`,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: `linear-gradient(90deg, 
                  ${theme.palette.primary.main}, 
                  ${theme.palette.secondary.main})`,
                borderRadius: '12px 12px 0 0',
                zIndex: 1,
              }
            }}
          >
            <TableContainer 
              sx={{
                borderRadius: 3,
                backgroundColor: 'transparent',
                maxHeight: 600,
                '&::-webkit-scrollbar': {
                  width: '8px',
                  height: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: alpha(theme.palette.divider, 0.1),
                  borderRadius: 4,
                },
                '&::-webkit-scrollbar-thumb': {
                  background: alpha(theme.palette.primary.main, 0.3),
                  borderRadius: 4,
                  '&:hover': {
                    background: alpha(theme.palette.primary.main, 0.5),
                  }
                }
              }}
            >
              <Table 
                stickyHeader
                sx={{ 
                  minWidth: 800,
                  borderCollapse: 'separate',
                  borderSpacing: 0,
                }}
              >
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
                      <Checkbox
                        checked={allSelected}
                        indeterminate={selectedTasks.size > 0 && !allSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        sx={{
                          color: theme.palette.primary.main,
                          '&.Mui-checked': {
                            color: theme.palette.primary.main,
                          },
                          '&.MuiCheckbox-indeterminate': {
                            color: theme.palette.primary.main,
                          }
                        }}
                      />
                    </TableCell>
                    {[
                      { label: 'TASK TITLE', width: '25%' },
                      { label: 'STATUS', width: '12%' },
                      { label: 'ASSIGNEE', width: '15%' },
                      { label: 'START DATE', width: '12%' },
                      { label: 'DEADLINE', width: '12%' },
                      { label: 'PRIORITY', width: '10%' },
                      { label: 'COMMENTS', width: '10%' },

                      { label: 'EFFICIENCY', width: '10%' },
                      { label: 'RISK', width: '10%' },
                      { label: 'PROOF', width: '8%' },

                      { label: 'ACTIONS', width: '8%' },
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
                          ...(index === 7 && { borderRadius: '0 12px 0 0' })
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
                          {index === 1 && <Person fontSize="small" />}
                          {index === 2 && <Circle fontSize="small" />}
                          {index === 3 && <CalendarMonth fontSize="small" />}
                          {index === 4 && <TrendingUp fontSize="small" />}
                          {index === 5 && <Warning fontSize="small" />}
                          {index === 6 && <Task fontSize="small" />}
                          {index === 7 && <Settings fontSize="small" />}
                          {header.label}
                        </Typography>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTasks.map((task) => (
                    <TaskTableRow
                      key={task._id}
                      task={task}
                      isSelected={selectedTasks.has(task._id)}
                      onSelect={handleSelectTask}
                      theme={theme}
                      userRole={userRole}
                      onUploadProof={handleUploadProof}
                      onViewDetails={handleViewDetails}
                      onStatusChange={handleStatusChange}
                      onTaskUpdate={handleTaskFieldUpdate}

                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            {/* Empty State */}
            {filteredTasks.length === 0 && (
              <Box
                sx={{
                  p: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  background: `linear-gradient(135deg, 
                    ${alpha(theme.palette.background.default, 0.5)} 0%, 
                    ${alpha(theme.palette.background.paper, 0.3)} 100%)`,
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, 
                      ${alpha(theme.palette.primary.main, 0.1)} 0%, 
                      ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                    border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
                    mb: 2,
                  }}
                >
                  <Task sx={{ fontSize: 40, color: theme.palette.primary.main, opacity: 0.5 }} />
                </Box>
                <Typography variant="h6" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                  No tasks found
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, maxWidth: 400, textAlign: 'center' }}>
                  Try adjusting your filters or create a new task to get started
                </Typography>
              </Box>
            )}
            
            {/* Table Footer with Selection */}
            {selectedTasks.size > 0 && (
              <Paper
                sx={{
                  p: 3,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderRadius: '0 0 12px 12px',
                  background: `linear-gradient(135deg, 
                    ${alpha(theme.palette.primary.main, 0.08)} 0%, 
                    ${alpha(theme.palette.primary.main, 0.04)} 100%)`,
                  borderTop: `1.5px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                  borderLeft: `1.5px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                  borderRight: `1.5px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                  borderBottom: `1.5px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: `linear-gradient(90deg, 
                      ${theme.palette.primary.main}, 
                      ${theme.palette.secondary.main})`,
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: `linear-gradient(135deg, 
                        ${alpha(theme.palette.primary.main, 0.2)} 0%, 
                        ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
                      border: `1.5px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                    }}
                  >
                    <CheckCircle sx={{ fontSize: 20, color: theme.palette.primary.main }} />
                  </Box>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: theme.palette.primary.main, 
                      fontWeight: 600,
                      fontFamily: '"Inter", sans-serif',
                    }}
                  >
                    {selectedTasks.size} task{selectedTasks.size !== 1 ? 's' : ''} selected
                  </Typography>
                </Box>
                <Button
                  startIcon={<Delete />}
                  variant="contained"
                  color="error"
                  onClick={handleDeleteSelected}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                    textTransform: 'none',
                    background: `linear-gradient(135deg, 
                      ${theme.palette.error.main} 0%, 
                      ${alpha(theme.palette.error.main, 0.8)} 100%)`,
                    boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.3)}`,
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: `0 6px 16px ${alpha(theme.palette.error.main, 0.4)}`,
                    },
                    transition: 'all 0.2s ease',
                  }}
                > 
                  Delete Selected
                </Button>
              </Paper>
            )}
          </Paper>
        </motion.div>
      )}

      {/* Modals */}
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



      <UploadProofModal
        open={uploadProofModalOpen}
        onClose={() => {
          setUploadProofModalOpen(false);
          setSelectedTaskForProof(null);
        }}
        task={selectedTaskForProof}
        theme={theme}
        onSuccess={() => handleProofUploadSuccess()}
      />

      <Snackbar
        open={proofUploadMessage.open}
        autoHideDuration={3000}
        onClose={() => setProofUploadMessage({ ...proofUploadMessage, open: false })}
      >
        <Alert
          severity={proofUploadMessage.severity}
          variant="filled"
          onClose={() => setProofUploadMessage({ ...proofUploadMessage, open: false })}
        >
          {proofUploadMessage.message}
        </Alert>
      </Snackbar>
      <ErrorSnack 
        newError={error}
        onClose={() => setError(null)}
      />
    </Box>
  );
};

export default Tasks;