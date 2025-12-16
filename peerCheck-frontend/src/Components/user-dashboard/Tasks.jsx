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
  Tabs
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
  Error,
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
  
} from '@mui/icons-material';
import { inView, motion } from 'framer-motion';
import axiosClient from '@/api/axiosClient';
import { useNavigate, useParams  } from 'react-router-dom';
import { getAuthToken } from './utils/auth';
import { useInView } from 'react-intersection-observer';



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

const isTeacher = (userRole) => {
  if (!userRole) return false;
  return userRole?.role === 'teacher';

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


// Helper to format time
const formatTime = (seconds) => {
  if (!seconds) return '0m';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

// Log Time Modal
const LogTimeModal = ({ open, onClose, task, theme, onSuccess }) => {
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setDuration('');
      setError('');
    }
  }, [open]);


  const handleSubmit = async () => {
    if (!duration || isNaN(duration) || parseInt(duration) <= 0) {
      setError('Please enter a valid duration in minutes');
      return;
    }

    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) {
        setError('Authentication required');
        return;
      }

      // Convert minutes to seconds for backend
      const durationInSeconds = parseInt(duration) * 60;

      const response = await axiosClient.put(
        `/user/task/${task._id}/time`,
        { focusTime: durationInSeconds },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data?.success) {
        // Success
        onSuccess?.();
        onClose();
      } else {
        setError(response.data?.error || 'Failed to log time');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to log time');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={!loading ? onClose : undefined} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Log Focus Time</Typography>
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
          <Typography variant="body2" gutterBottom>
            How many minutes did you spend on this task?
          </Typography>
          <TextField
            fullWidth
            type="number"
            label="Duration (minutes)"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            disabled={loading}
            InputProps={{
              endAdornment: <Typography variant="body2">minutes</Typography>
            }}
            sx={{ mt: 2 }}
          />
          
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="caption">
              Focus time is used to calculate efficiency metrics and detect suspicious patterns.
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
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <Timer />}
        >
          {loading ? 'Logging...' : 'Log Time'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};


// Upload Proof Modal
const UploadProofModal = ({ open, onClose, task, theme, onSuccess }) => {
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
// Task Details Modal 
const TaskDetailsModal = ({ open, onClose, task, theme, userRole, onTaskUpdate, onLogTime, userTeacher, onUploadProof }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activityLogs, setActivityLogs] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [projectTeam, setProjectTeam] = useState([]);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [uploadProofModalOpen, setUploadProofModalOpen] = useState(false);
const [selectedTaskForProof, setSelectedTaskForProof] = useState(null);

  console.log("taskdetailsmodal/Task: ", task);


  // Fetch activity logs
  const fetchActivityLogs = async () => {
    if (!task?._id) return;
    
    try {
      setLoadingActivity(true);
      const token = getAuthToken();
      if (!token) return;

      const response = await axiosClient.get(`/user/task/${task._id}/activity`, {
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



  // Fetch project team when modal opens
  useEffect(() => {
    if (open && task?.projectId?._id) {
      fetchProjectTeam();
    }
  }, [open, task?.projectId?._id]);

  const fetchProjectTeam = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;
      const projectId = task?.projectId._id;
      console.log("projectId = task?.projectId._id: ", projectId)
      const response = await axiosClient.get(`/projects/${projectId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const teamMembers = response.data.teamId.members.map(member => member.name);
      
      if (response.data?.success) {
        // Adjust this based on your API response structure
        setProjectTeam( teamMembers|| []);
      }
    } catch (err) {
      console.error('Error fetching project team:', err);
    }
  };

  // Load activity when tab is selected
  useEffect(() => {
    if (open && activeTab === 'activity' && task?._id) {
      fetchActivityLogs();
    }
  }, [open, activeTab, task?._id]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'active': return 'info';
      case 'paused': return 'warning';
      default: return 'default';
    }
  };

  const getRiskColor = (riskScore) => {
    if (riskScore >= 4) return 'error';
    if (riskScore >= 2) return 'warning';
    return 'success';
  };

  const getEfficiencyColor = (efficiency) => {
    if (efficiency < 50) return 'error';
    if (efficiency < 80) return 'warning';
    if (efficiency > 120) return 'warning';
    return 'success';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
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

  const handleStatusChange = async (newStatus) => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) {
        setError('Authentication required');
        return;
      }

      const now = new Date();
      let additionalTime = 0;

      // Only log time if task was active before
      if (task.status === 'active' && task.lastEventTime) {
        additionalTime = Math.floor((now - new Date(task.lastEventTime)) / 1000); // seconds
      }
      const response = await axiosClient.put(
        `/user/task/${task._id}/status`,
        { status: newStatus, additionalTime },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data?.success) {
        onTaskUpdate?.();
        onClose();
      } else {
        setError(response.data?.error || 'Failed to update status');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const handleReassignTask = async () => {
    setAssignDialogOpen(true);
  };

  const handleAssignTask = async (newAssigneeId) => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await axiosClient.put(
        `/api/user/task/${task._id}/assign`,
        { 
          assignedTo: newAssigneeId,
          action: 'assign'
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data?.success) {
        const { oldAssigneeId, newAssigneeId } = response.data;
        const currentUser = getUserData();
        const currentUserId = currentUser?.id || currentUser?._id;

        // Check if current user is affected by this reassignment
        const isOldAssignee = oldAssigneeId === currentUserId;
        const isNewAssignee = newAssigneeId === currentUserId;
        
        if (isOldAssignee || isNewAssignee) {
          // Refresh the task list since user's task set has changed
          fetchTasks();
        }
        
        // Also refresh for the task owner (project creator/teacher/admin)
        if (userRole?.role === 'teacher' || userRole?.role === 'admin') {
          fetchTasks();
        }
        
        // Update the task details modal
        if (task) {
          setSelectedTask(prev => ({
            ...prev,
            assignedTo: response.data.task.assignedTo
          }));
        }
        
        // Show success message
        setSnackbar({
          open: true,
          message: `Task ${isNewAssignee ? 'assigned to you' : 'reassigned successfully'}`,
          severity: 'success'
        });
        
        onTaskUpdate?.();
        setAssignDialogOpen(false);
      } else {
        setError(response.data?.error || 'Failed to assign task');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to assign task');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = () => {
    setCommentDialogOpen(true);
  };

  const handleEditFlags = () => {
    // Implement edit flags dialog
    alert('Edit flags functionality to be implemented');
  };

  const handleGradeOverride = () => {
    // Implement grade override dialog
    alert('Grade override functionality to be implemented');
  };


  if (!task) return null;

  return (
  <Dialog 
    open={open} 
    onClose={!loading ? onClose : undefined}
    maxWidth="md" 
    fullWidth
    PaperProps={{
      sx: {
        borderRadius: 4,
        backgroundColor: theme.palette.background.paper,
        border: `2px solid ${alpha(theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[200], 0.5)}`,
        overflow: 'hidden',
        maxHeight: '92vh',
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
        pb: 2.5,
        pt: 3.5,
        px: 4,
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ maxWidth: 'calc(100% - 48px)' }}>
            <Typography variant="h4" fontWeight="800" gutterBottom sx={{ 
              fontFamily: '"Alkatra", cursive',
              color: theme.palette.text.primary,
              lineHeight: 1.2,
              wordBreak: 'break-word',
            }}>
              {task.taskTitle}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mt: 1 }}>
              <Chip
                label={task.status.replace('_', ' ').toUpperCase()}
                color={getStatusColor(task.status)}
                size="medium"
                sx={{
                  fontWeight: 700,
                  borderRadius: 1.5,
                  height: 28,
                  fontSize: '0.75rem',
                  boxShadow: `0 2px 8px ${alpha(getStatusColor(task.status) === 'primary' ? theme.palette.primary.main : 
                                          getStatusColor(task.status) === 'success' ? theme.palette.success.main : 
                                          getStatusColor(task.status) === 'warning' ? theme.palette.warning.main : 
                                          theme.palette.error.main, 0.2)}`,
                }}
              />
              
              {task.metrics?.isOverdue && (
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
              
              {task.metrics?.riskScore >= 4 && (
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
              width: 44,
              height: 44,
              borderRadius: 2,
            }}
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
    </Box>
    
    {/* Minimalist Tab Navigation */}
    <Box sx={{ 
      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
      px: 4,
      pt: 1,
      pb: 1,
    }}>
      <Box sx={{ display: 'flex', gap: 1 }}>
        {[
          { key: 'overview', label: 'Overview', icon: <Dashboard fontSize="small" /> },
          { key: 'metrics', label: 'Metrics', icon: <Assessment fontSize="small" /> },
          { key: 'proof', label: 'Proof', icon: <Upload fontSize="small" /> },
          { key: 'activity', label: 'Activity', icon: <HistoryIcon fontSize="small" /> }
        ].map((tab) => (
          <Button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            variant={activeTab === tab.key ? 'contained' : 'text'}
            size="medium"
            startIcon={tab.icon}
            sx={{ 
              textTransform: 'capitalize',
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 600,
              fontFamily: '"Inter", sans-serif',
              fontSize: '0.875rem',
              minWidth: 'auto',
              '&.MuiButton-contained': {
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              },
              '&.MuiButton-text': {
                color: theme.palette.text.secondary,
                '&:hover': {
                  color: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                }
              }
            }}
          >
            {tab.label}
          </Button>
        ))}
      </Box>
    </Box>

    <DialogContent dividers sx={{ 
      p: 0, 
      '&.MuiDialogContent-dividers': {
        border: 'none',
      }
    }}>
      {/* Overview Tab - Redesigned */}
      {activeTab === 'overview' && (
        <Box sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            
            {/* Task Description Card */}
            <Paper 
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
                  <Typography variant="body1" sx={{ 
                    color: theme.palette.text.secondary,
                    fontFamily: '"Inter", sans-serif',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {task.description || 'No description provided.'}
                  </Typography>
                </Box>
              </Box>
            </Paper>

            {/* Key Information Row - Compact Flex Layout */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 3,
            }}>
              {/* Assignee */}
              <Paper 
                elevation={0}
                sx={{ 
                  flex: 1,
                  p: 3,
                  borderRadius: 3,
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                  position: 'relative',
                  overflow: 'hidden',
                  minWidth: 280,
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
                    src={task.assignedTo?.avatar}
                    sx={{ 
                      width: 52, 
                      height: 52,
                      fontSize: 18,
                      fontWeight: 'bold',
                      border: `3px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
                    }}
                  >
                    {task.assignedTo?.name?.charAt(0) || 'U'}
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" fontWeight="600" sx={{ 
                      fontFamily: '"Inter", sans-serif',
                      mb: 0.5,
                    }}>
                      {task.assignedTo?.name || 'Unassigned'}
                    </Typography>
                    {task.assignedTo?.email && (
                      <Typography variant="caption" sx={{ 
                        color: theme.palette.text.secondary,
                        fontFamily: '"Inter", sans-serif',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                      }}>
                        <Email fontSize="inherit" /> {task.assignedTo.email}
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
                  p: 3,
                  borderRadius: 3,
                  backgroundColor: task.metrics?.isOverdue 
                    ? alpha(theme.palette.error.main, 0.05)
                    : theme.palette.background.paper,
                  border: `1px solid ${task.metrics?.isOverdue 
                    ? alpha(theme.palette.error.main, 0.2)
                    : alpha(theme.palette.divider, 0.3)}`,
                  position: 'relative',
                  overflow: 'hidden',
                  minWidth: 280,
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  gap: 2, 
                  mb: 2.5,
                  pb: 2,
                  borderBottom: `1px solid ${task.metrics?.isOverdue 
                    ? alpha(theme.palette.error.main, 0.2)
                    : alpha(theme.palette.divider, 0.2)}`,
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CalendarToday sx={{ 
                      color: task.metrics?.isOverdue 
                        ? theme.palette.error.main
                        : theme.palette.primary.main, 
                      fontSize: 24 
                    }} />
                    <Typography variant="body1" fontWeight="600" sx={{ 
                      fontFamily: '"Adlam Display", serif',
                      color: task.metrics?.isOverdue 
                        ? theme.palette.error.main
                        : theme.palette.text.primary,
                    }}>
                      Deadline
                    </Typography>
                  </Box>
                  {task.metrics?.isOverdue && (
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
                    color: task.metrics?.isOverdue 
                      ? theme.palette.error.main
                      : theme.palette.text.primary,
                  }}>
                    {formatDate(task.deadline)}
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
                      {task.metrics?.daysUntilDeadline > 0 
                        ? `${task.metrics.daysUntilDeadline} days remaining`
                        : task.metrics?.isOverdue 
                          ? 'Past deadline' 
                          : 'Due soon'}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>

            {/* Time Tracking & Efficiency - Side by side */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 3,
            }}>
              {/* Time Tracking */}
              <Paper 
                elevation={0}
                sx={{ 
                  flex: 1,
                  p: 3,
                  borderRadius: 3,
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                  position: 'relative',
                  overflow: 'hidden',
                  minWidth: 280,
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
                      {formatTime(task.totalFocusTime)}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: theme.palette.text.secondary,
                      fontFamily: '"Inter", sans-serif',
                    }}>
                      of {formatTime(task.estimatedTime)} estimated
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
                        width: `${Math.min((task.totalFocusTime / (task.estimatedTime || 1)) * 100, 100)}%`,
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
                      {((task.totalFocusTime / (task.estimatedTime || 1)) * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Efficiency */}
              <Paper 
                elevation={0}
                sx={{ 
                  flex: 1,
                  p: 3,
                  borderRadius: 3,
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                  position: 'relative',
                  overflow: 'hidden',
                  minWidth: 280,
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
                      color: getEfficiencyColor(task.taskMetrics?.efficiency),
                      lineHeight: 1,
                    }}>
                      {task.taskMetrics?.efficiency?.toFixed(1) || '0.0'}%
                    </Typography>
                    <Chip
                      label={task.taskMetrics?.efficiency > 120 ? 'High' : 
                            task.taskMetrics?.efficiency < 50 ? 'Low' : 
                            'Optimal'}
                      color={getEfficiencyColor(task.taskMetrics?.efficiency)}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                  
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min(task.taskMetrics?.efficiency || 0, 100)}
                    color={getEfficiencyColor(task.taskMetrics?.efficiency)}
                    sx={{ 
                      height: 8, 
                      borderRadius: 4, 
                      mb: 1.5,
                      backgroundColor: alpha(getEfficiencyColor(task.taskMetrics?.efficiency) === 'success' 
                        ? theme.palette.success.main 
                        : getEfficiencyColor(task.taskMetrics?.efficiency) === 'warning'
                          ? theme.palette.warning.main
                          : theme.palette.error.main, 0.1),
                    }}
                  />
                  
                  <Typography variant="caption" sx={{ 
                    color: theme.palette.text.secondary,
                    fontFamily: '"Inter", sans-serif',
                    fontStyle: 'italic',
                  }}>
                    {task.taskMetrics?.efficiency > 120 
                      ? 'Above expected efficiency' 
                      : task.taskMetrics?.efficiency < 50 
                        ? 'Below expected efficiency'
                        : 'Within optimal range'}
                  </Typography>
                </Box>
              </Paper>
            </Box>

            {/* Quick Actions - Minimalist Bar */}
            {(userRole?.role === 'teacher' || userRole?.role === 'admin' || task.assignedTo?._id === userRole?.userId) && (
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2.5, 
                  borderRadius: 3,
                  backgroundColor: alpha(theme.palette.primary.main, 0.02),
                  border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
                }}
              >
                <Typography variant="body2" fontWeight="600" sx={{ 
                  mb: 2.5,
                  color: theme.palette.text.secondary,
                  fontFamily: '"Adlam Display", serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}>
                  <PlayCircleOutline fontSize="small" />
                  Quick Actions
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  {task.assignedTo?._id === userRole?.userId && (
                    <>
                      {task.status !== 'completed' && (
                        <Button
                          variant="contained"
                          startIcon={<CheckCircle />}
                          onClick={() => handleStatusChange('completed')}
                          disabled={loading}
                          size="medium"
                          sx={{ 
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                            fontWeight: 600,
                            background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                            '&:hover': {
                              boxShadow: `0 6px 20px ${alpha(theme.palette.success.main, 0.4)}`,
                            }
                          }}
                        >
                          Mark Complete
                        </Button>
                      )}
                      <Button
                        variant="outlined"
                        startIcon={<Timer />}
                        onClick={() => onLogTime(task)}
                        size="medium"
                        sx={{ borderRadius: 2, px: 3, py: 1, fontWeight: 600 }}
                      >
                        Log Time
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Upload />}
                        onClick={() => {
                          onClose();
                          setTimeout(() => {
                            window.dispatchEvent(new CustomEvent('openUploadProofModal', { detail: task }));
                          }, 100);
                        }}
                        size="medium"
                        sx={{ borderRadius: 2, px: 3, py: 1, fontWeight: 600 }}
                      >
                        Upload Proof
                      </Button>
                    </>
                  )}
                  
                  {(userRole?.role === 'teacher' || userRole?.role === 'admin') && (
                    <>
                      <Button
                        variant="outlined"
                        color="warning"
                        startIcon={<Flag />}
                        onClick={handleEditFlags}
                        size="medium"
                        sx={{ borderRadius: 2, px: 3, py: 1, fontWeight: 600 }}
                      >
                        Edit Flags
                      </Button>
                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<Grade />}
                        onClick={handleGradeOverride}
                        size="medium"
                        sx={{ borderRadius: 2, px: 3, py: 1, fontWeight: 600 }}
                      >
                        Override Grade
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<Person />}
                        onClick={handleReassignTask}
                        size="medium"
                        sx={{ borderRadius: 2, px: 3, py: 1, fontWeight: 600 }}
                      >
                        Reassign
                      </Button>
                    </>
                  )}
                  
                  <Button
                    variant="outlined"
                    color="info"
                    startIcon={<Edit />}
                    onClick={() => {alert('Edit details functionality to be implemented');}}
                    size="medium"
                    sx={{ borderRadius: 2, px: 3, py: 1, fontWeight: 600 }}
                  >
                    Edit Details
                  </Button>
                </Box>
              </Paper>
            )}
          </Box>
        </Box>
      )}

      {/* Metrics Tab - Minimalist */}
      {activeTab === 'metrics' && (
        <Box sx={{ p: 4 }}>
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
                border: `1px solid ${alpha(getRiskColor(task.metrics?.riskScore) === 'error' 
                  ? theme.palette.error.main 
                  : getRiskColor(task.metrics?.riskScore) === 'warning'
                    ? theme.palette.warning.main
                    : theme.palette.success.main, 0.2)}`,
                minWidth: 280,
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
                  <Security sx={{ color: getRiskColor(task.metrics?.riskScore) === 'error' 
                    ? theme.palette.error.main 
                    : getRiskColor(task.metrics?.riskScore) === 'warning'
                      ? theme.palette.warning.main
                      : theme.palette.success.main }} />
                  Risk Score
                </Typography>
                <Chip
                  label={task.metrics?.riskScore >= 4 ? 'High' : 
                        task.metrics?.riskScore >= 2 ? 'Medium' : 
                        'Low'}
                  color={getRiskColor(task.metrics?.riskScore)}
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
              </Box>
              
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h1" fontWeight="800" sx={{ 
                  fontFamily: '"Alkatra", cursive',
                  color: getRiskColor(task.metrics?.riskScore) === 'error' 
                    ? theme.palette.error.main 
                    : getRiskColor(task.metrics?.riskScore) === 'warning'
                      ? theme.palette.warning.main
                      : theme.palette.success.main,
                  lineHeight: 1,
                  mb: 1,
                }}>
                  {task.metrics?.riskScore || 0}
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
                    { label: 'Padded Time', value: task.flags?.paddedTime, icon: <Timer /> },
                    { label: 'Rushed Completion', value: task.flags?.rushedCompletion, icon: <Speed /> },
                    { label: 'No Proof', value: task.flags?.noProof, icon: <Warning /> },
                    { label: 'Manual Review Required', value: task.flags?.manualReviewRequired, icon: <Assessment /> }
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
                flex: 1,
                p: 3.5,
                borderRadius: 3,
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${alpha(getEfficiencyColor(task.taskMetrics?.efficiency) === 'success' 
                  ? theme.palette.success.main 
                  : getEfficiencyColor(task.taskMetrics?.efficiency) === 'warning'
                    ? theme.palette.warning.main
                    : theme.palette.error.main, 0.2)}`,
                minWidth: 280,
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
                  <TrendingUp sx={{ color: getEfficiencyColor(task.taskMetrics?.efficiency) }} />
                  Efficiency Analysis
                </Typography>
              </Box>
              
              {/* Efficiency Score */}
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h1" fontWeight="800" sx={{ 
                  fontFamily: '"Alkatra", cursive',
                  color: getEfficiencyColor(task.taskMetrics?.efficiency),
                  lineHeight: 1,
                  mb: 1,
                }}>
                  {task.taskMetrics?.efficiency?.toFixed(1) || '0.0'}%
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: theme.palette.text.secondary,
                  fontFamily: '"Inter", sans-serif',
                }}>
                  {task.taskMetrics?.efficiency > 120 
                    ? 'Above expected range' 
                    : task.taskMetrics?.efficiency < 50 
                      ? 'Below expected range'
                      : 'Within optimal range'}
                </Typography>
              </Box>
              
              {/* Time Breakdown */}
              <Box sx={{ 
                p: 2.5,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.divider, 0.05),
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}>
                <Typography variant="body2" fontWeight="600" sx={{ 
                  mb: 2.5,
                  color: theme.palette.text.secondary,
                  fontFamily: '"Inter", sans-serif',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}>
                  <AccessTime fontSize="small" />
                  Time Breakdown
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ 
                        color: theme.palette.text.secondary,
                        fontFamily: '"Inter", sans-serif',
                      }}>
                        Time Spent
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        color: theme.palette.text.primary,
                        fontFamily: '"Inter", sans-serif',
                        fontWeight: 600,
                      }}>
                        {formatTime(task.totalFocusTime)}
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      height: 4, 
                      borderRadius: 2, 
                      backgroundColor: alpha(theme.palette.info.main, 0.1),
                      overflow: 'hidden',
                    }}>
                      <Box sx={{ 
                        height: '100%',
                        borderRadius: 2,
                        backgroundColor: theme.palette.info.main,
                        width: `${Math.min((task.totalFocusTime / (task.estimatedTime || 1)) * 100, 100)}%`,
                      }} />
                    </Box>
                  </Box>
                  
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ 
                        color: theme.palette.text.secondary,
                        fontFamily: '"Inter", sans-serif',
                      }}>
                        Estimated Time
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        color: theme.palette.text.primary,
                        fontFamily: '"Inter", sans-serif',
                        fontWeight: 600,
                      }}>
                        {formatTime(task.estimatedTime)}
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      height: 4, 
                      borderRadius: 2, 
                      backgroundColor: alpha(theme.palette.success.main, 0.1),
                    }} />
                  </Box>
                </Box>
                
                <Box sx={{ 
                  mt: 2.5,
                  pt: 2,
                  borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                }}>
                  <Typography variant="caption" sx={{ 
                    color: theme.palette.text.secondary,
                    fontFamily: '"Inter", sans-serif',
                  }}>
                    Efficiency Ratio
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    color: getEfficiencyColor(task.taskMetrics?.efficiency),
                    fontFamily: '"Inter", sans-serif',
                    fontWeight: 600,
                  }}>
                    {((task.totalFocusTime / (task.estimatedTime || 1)) * 100).toFixed(1)}%
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Box>
      )}

      {/* Proof Tab */}
      {activeTab === 'proof' && (
        <Box sx={{ p: 4 }}>
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
                {task.proofUploads?.length || 0} file(s) uploaded
              </Typography>
            </Box>
            {task.assignedTo?._id === userRole?.userId && (
              <Button
                variant="contained"
                startIcon={<Upload />}
                size="medium"
                onClick={() => onUploadProof(task)}
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
          
          {task.proofUploads?.length > 0 ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 2.5 
            }}>
              {task.proofUploads.map((proof, index) => (
                <Paper 
                  key={index}
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
                            {proof.filename}
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
                        onClick={() => {
                          const fullUrl = proof.fileUrl.startsWith('/') 
                          ? `${axiosClient.defaults.baseURL}${proof.fileUrl}`
                          : proof.fileUrl;
                          window.open(fullUrl, '_blank')
                        }}
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
                        onClick={() => {
                          const token = getAuthToken();
    window.open(`http://localhost:5000/api/user/task/${taskId}/proof/${proof.serverFilename}?token=${token}`, '_blank');
                        }}
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
      
      {/* Activity Tab  */}
      {activeTab === 'activity' && (
        <Box sx={{ p: 4 }}>
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
                        {log.action}
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
                          {log.time}
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
    </DialogContent>
    
    {/* Dialog Actions  */}
    <DialogActions sx={{ 
      p: 2.5, 
      justifyContent: 'space-between',
      borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
      backgroundColor: alpha(theme.palette.background.default, 0.3),
    }}>
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
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
            <Button
              startIcon={<Edit />}
              color="info"
              disabled={loading}
              onClick={handleEditTask}
              size="small"
              sx={{ 
                borderRadius: 2,
                px: 2.5,
                py: 1,
                fontWeight: 600,
                fontFamily: '"Inter", sans-serif',
              }}
            >
              Edit Task
            </Button>
            {task.assignedTo && (
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
        ) : task.assignedTo?._id === userRole?.userId && (
          <>
            {task.status !== 'completed' && (
              <Button
                variant="contained"
                startIcon={<CheckCircle />}
                onClick={() => handleStatusChange('completed')}
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
            {task.status === 'completed' && (
              <Button
                variant="outlined"
                onClick={() => handleStatusChange('active')}
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
              startIcon={<Edit />}
              onClick={() => {alert('Edit details functionality to be implemented');}}
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
              Edit
            </Button>
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

    {/* Assign Task Dialog */}
    <AssignTaskDialog
      open={assignDialogOpen}
      onClose={() => setAssignDialogOpen(false)}
      task={task}
      projectTeam={projectTeam}
      onAssign={handleAssignTask}
      theme={theme}
    />

    {/* Add Comment Dialog (to be implemented) */}
    <Dialog open={commentDialogOpen} onClose={() => setCommentDialogOpen(false)}>
      <DialogTitle>Add Comment</DialogTitle>
      <DialogContent>
        <Typography>Comment dialog to be implemented</Typography>
      </DialogContent>
    </Dialog>
  </Dialog>
);
};
// Task Table Row Component
const TaskTableRow = ({ 
  task, 
  isSelected, 
  onSelect, 
  theme,
  userRole,  //userRole.role, userRole.userId -- since it contains {role: , userId: }
  onLogTime,
  onUploadProof,
  onViewDetails,
  onStatusChange,
  userTeacher

}) => {
  const [actionsAnchorEl, setActionsAnchorEl] = useState(null);

  
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'active': return 'info';
      case 'paused': return 'warning';
      default: return 'default';
    }
  };

  console.log("tasktablerow/task",task);
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle fontSize="small" />;
      case 'active': return <PlayArrow fontSize="small" />;
      case 'paused': return <Pause fontSize="small" />;
      default: return null;
    }
  };

  const getRiskColor = (riskScore) => {
    if (riskScore >= 4) return 'error';
    if (riskScore >= 2) return 'warning';
    return 'success';
  };

  const getEfficiencyColor = (efficiency) => {
    if (efficiency < 50) return 'error';
    if (efficiency < 80) return 'warning';
    if (efficiency > 120) return 'warning';
    return 'success';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      if (date.toDateString() === today.toDateString()) return 'Today';
      if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
      
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (err) {
      return 'Invalid';
    }
  };

  const isAssignedUser = task.assignedTo?._id === userRole?.userId;
  const canEdit = isAssignedUser || userRole?.role === 'teacher' || userRole?.role === 'admin';




  
  return (
    <TableRow
      hover
      selected={isSelected}
      sx={{
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.04),
        },
        '&.Mui-selected': {
          backgroundColor: alpha(theme.palette.primary.main, 0.08),
        },
        cursor: 'pointer'
      }}
      onClick={() => onViewDetails(task)}
    >
      {/* Checkbox */}
      <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={isSelected}
          onChange={(e) => onSelect(task._id, e.target.checked)}
        />
      </TableCell>

      {/* Task Title */}
      <TableCell>
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {task.taskTitle}
          </Typography>
          {task.metrics?.isOverdue && (
            <Chip
              label="OVERDUE"
              size="small"
              color="error"
              sx={{ mt: 0.5 }}
            />
          )}
        </Box>
      </TableCell>

      {/* Assignee */}
      <TableCell>
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar 
            src={task.assignedTo?.avatar}
            sx={{ width: 32, height: 32, fontSize: 14 }}
          >
            {task.assignedTo?.name?.charAt(0)}
          </Avatar>
          <Typography variant="body2">
            {task.assignedTo?.name?.split(' ')[0] || 'Unassigned'}
          </Typography>
        </Box>
      </TableCell>

      {/* Status */}
      <TableCell>
        <Chip
          icon={getStatusIcon(task.status)}
          label={task.status.replace('_', ' ').toUpperCase()}
          color={getStatusColor(task.status)}
          size="small"
          sx={{ minWidth: 100 }}
        />
      </TableCell>

      {/* Deadline */}
      <TableCell>
        <Box>
          <Typography variant="body2" fontWeight="medium">
            {formatDate(task.deadline)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {task.metrics?.daysUntilDeadline > 0 
              ? `${task.metrics.daysUntilDeadline} days left`
              : task.metrics?.isOverdue ? 'Overdue' : 'Due soon'}
          </Typography>
        </Box>
      </TableCell>

      {/* Efficiency */}
      <TableCell>
        <Box display="flex" alignItems="center" gap={1}>
          <Speed fontSize="small" color={getEfficiencyColor(task.metrics?.efficiency)} />
          <Typography 
            variant="body2" 
            fontWeight="medium"
            color={getEfficiencyColor(task.taskMetrics?.efficiency?.percentage)}
          >
            {task.status === "active" ? (
                <CircularProgress size={18} />
              ) : (
                `${task.taskMetrics?.efficiency.toFixed(1) || 0}%`
              )} 
          </Typography>
        </Box>
      </TableCell>

      {/* Risk Level */}
      <TableCell>
        <Chip
          label={task.metrics?.riskScore >= 4 ? 'HIGH' : 
                 task.metrics?.riskScore >= 2 ? 'MEDIUM' : 'LOW'}
          color={getRiskColor(task.metrics?.riskScore)}
          size="small"
          icon={<Security fontSize="small" />}
        />
      </TableCell>

      {/* Proof Indicator */}
      <TableCell>
        <Badge 
          badgeContent={task.metrics?.proofCount} 
          color={task.metrics?.hasProof ? "success" : "error"}
        >
          {task.metrics?.hasProof ? (
            <CheckCircle color="success" fontSize="small" />
          ) : (
            <Warning color="error" fontSize="small" />
          )}
        </Badge>
      </TableCell>

      {/* Actions */}
      <TableCell onClick={(e) => e.stopPropagation()}>
        <Stack direction="row" spacing={0.5}>
          {isAssignedUser && task.status !== 'completed' && (
            <>
              {task.status === 'not_started' && (
                <Tooltip title="Start Task">
                  <IconButton 
                    size="small"
                    color="primary"
                    onClick={() => onStatusChange(task._id, 'active')}
                  >
                    <PlayArrow fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              
              {task.status === 'active' && (
                <>
                  <Tooltip title="Pause Task">
                    <IconButton 
                      size="small"
                      color="warning"
                      onClick={() => onStatusChange(task._id, 'paused')}
                    >
                      <Pause fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Complete Task">
                    <IconButton 
                      size="small"
                      color="success"
                      onClick={() => onStatusChange(task._id, 'completed')}
                    >
                      <CheckCircle fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </>
              )}
              
              {task.status === 'paused' && (
                <Tooltip title="Resume Task">
                  <IconButton 
                    size="small"
                    color="primary"
                    onClick={() => onStatusChange(task._id, 'active')}
                  >
                    <PlayArrow fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              
              <Tooltip title="Log Focus Time">
                <IconButton 
                  size="small"
                  color="info"
                  onClick={() => onLogTime(task)}
                >
                  <Timer fontSize="small" />
                </IconButton>
              </Tooltip>
              
              <Tooltip title="Upload Proof">
                <IconButton 
                  size="small"
                  color="secondary"
                  onClick={() => onUploadProof(task)}
                >
                  <Upload fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
          
          {userTeacher && (
            <Tooltip title="Review Task">
              <IconButton 
                size="small"
                color="warning"
                onClick={() => onViewDetails(task)}
              >
                <Assessment fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          
          {userTeacher && (
            <IconButton 
            size="small"
            onClick={(e) => setActionsAnchorEl(e.currentTarget)}
          >
            <MoreHoriz fontSize="small" />
          </IconButton>)}
        </Stack>
      </TableCell>
    </TableRow>
  );
};

// Main Tasks Page Component
const Tasks = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const isProjectView = Boolean(projectId);
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); //"all" "my" "managed"
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [selectedTask, setSelectedTask] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [logTimeOpen, setLogTimeOpen] = useState(false);
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

  const { ref, inView } = useInView({
    threshold: 0.5,
  });


  

  if (isTeacher(userRole)) {
    console.log("User is a teacher");
    setUserTeacher(true);
  }
  console.log("projectId: ",projectId);
  
  
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
      console.log("response.data",response.data)
      setUserId(response.data?.user?._id);
      console.log("user from fetchTasks:",userId);
      if (!response.data?.success) {
        throw new Error('Failed to fetch tasks');
      }

      const tasksData = response.data?.tasks || [];
      console.log("tasksData",response.data?.tasks)

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


      console.log("afterfetchTasks/-enrichedTasks(same as tasks-setTasks): ", enrichedTasks);

      setMetrics(null);
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
          updated[task._id] = (updated[task._id] || 0) + 6; // Increment by 8000 ms (8 seconds)
        }
      })

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

// const calculateEfficiency = (task) => {
//   if (!task.estimatedTime || task.estimatedTime === 0) return 0;
//   return Math.round((task.totalFocusTime / task.estimatedTime) * 100 * 100) / 100;
// };

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
  // Refresh tasks or show success message
  console.log('Proof uploaded successfully');

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

    console.log("Tasks/useeffect - result", result);
    
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
      const response = await axiosClient.delete(`/user/task/${taskId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (err) {
      console.error('Failed to delete task:', err);
      setError(err.response?.data?.error || 'Failed to delete task');
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

  
  //handle status change like from not_started to actve to pause to completed
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const token = getAuthToken();
      if (!token) {
        setError('Authentication required');
        return;
      }
          // Find task in state
      const task = tasks.find(t => t._id === taskId);
      if (!task) return;

      const now = new Date();



      const response = await axiosClient.put(`/user/task/${taskId}/status`,
        { status: newStatus, timestamp: now.toISOString() },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      


      console.log("handlestatuschange/response.data", response.data);
      if (response.data?.success) {
        // Update local state with the returned task data
        const updatedTask = response.data?.task;
        
        setTasks(prevTasks => prevTasks.map(t =>
          t._id === taskId ? updatedTask  : t
        ));
  
        
        // Show success message
        setError('');
        
        // Refresh task details if open
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
    

  const handleLogTime = (task) => {
    setSelectedTask(task);
    setLogTimeOpen(true);
  };

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

    // delete each task one by one
    await Promise.all(
      ids.map(id => deleteTask(id))
    );

    // update UI after deletion
    setTasks(prev => prev.filter(task => !selectedTasks.has(task._id)));
    setFilteredTasks(prev => prev.filter(task => !selectedTasks.has(task._id)));
    setSelectedTasks(new Set());

  } catch (err) {
    console.error("Failed bulk delete:", err);
  }
};



  const allSelected = filteredTasks.length > 0 && selectedTasks.size === filteredTasks.length;
  const hasTasks = filteredTasks.length > 0;

  console.log("filteredTasks", filteredTasks)
  // Load data on mount
  useEffect(() => {
    console.log("useeffect/fetchtasks() performing")
    fetchTasks();
    console.log("useeffect/fetchtasks() done")

  }, [fetchTasks]);



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
              { label: 'ASSIGNEE', width: '15%' },
              { label: 'STATUS', width: '12%' },
              { label: 'DEADLINE', width: '12%' },
              { label: 'EFFICIENCY', width: '10%' },
              { label: 'RISK LEVEL', width: '10%' },
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
          {filteredTasks.map((task, index) => (
            <TaskTableRow
              key={task._id}
              task={task}
              isSelected={selectedTasks.has(task._id)}
              onSelect={handleSelectTask}
              theme={theme}
              userRole={userRole}
              onLogTime={handleLogTime}
              onUploadProof={handleUploadProof}
              onViewDetails={handleViewDetails}
              onStatusChange={handleStatusChange}
              userTeacher={userTeacher}
              index={index}
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
          onClick={() => handleDeleteSelected(Array.from(selectedTasks))}
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
        onLogTime={handleLogTime}
        userTeacher={userTeacher}
        onUploadProof={handleOpenUploadProof}

      />

      <LogTimeModal
        open={logTimeOpen}
        onClose={() => setLogTimeOpen(false)}
        task={selectedTask}
        theme={theme}
        onSuccess={handleTaskUpdate}
      />

      <UploadProofModal
        open={uploadProofModalOpen}
        onClose={() => {
          setUploadProofModalOpen(false);
          setSelectedTaskForProof(null);
        }}
        task={selectedTaskForProof}
        theme={theme}
        onSuccess={handleProofUploadSuccess}
      />
    </Box>
  );
};

export default Tasks;