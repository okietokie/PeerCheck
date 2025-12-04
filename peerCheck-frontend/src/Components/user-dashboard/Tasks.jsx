// Tasks.jsx
import React, { useState, useEffect, useCallback } from 'react';
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
  FormControlLabel
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
  Info
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axiosClient from '@/api/axiosClient';
import { useNavigate, useParams  } from 'react-router-dom';

// Helper to get auth token properly
const getAuthToken = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.warn('No token found in localStorage');
    return null;
  }
  return token;
};

// Helper to get user data
const getUserData = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch (err) {
    console.error('Error parsing user data:', err);
    return null;
  }
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
// Add this component to your Tasks.jsx file
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
// Task Details Modal - COMPLETE VERSION
const TaskDetailsModal = ({ open, onClose, task, theme, userRole, onTaskUpdate }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activityLogs, setActivityLogs] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [projectTeam, setProjectTeam] = useState([]);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);

  console.log("Task: ", task)

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

      // You need to create this endpoint or adjust based on your API
      const response = await axiosClient.get(`/projects/${task.projectId._id}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data?.success) {
        // Adjust this based on your API response structure
        setProjectTeam(response.data.project?.team || []);
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

      const response = await axiosClient.put(
        `/user/task/${task._id}/status`,
        { status: newStatus },
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

  const handleEditTask = () => {
    // Implement edit task dialog
    alert('Edit task functionality to be implemented');
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
          maxHeight: '90vh',
          borderRadius: 2
        }
      }}
    >
      {/* Dialog Title */}
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h5" fontWeight="600" gutterBottom>
              {task.taskTitle}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={task.status.replace('_', ' ').toUpperCase()}
                color={getStatusColor(task.status)}
                size="small"
              />
              {task.metrics?.isOverdue && (
                <Chip
                  label="OVERDUE"
                  color="error"
                  size="small"
                />
              )}
              {task.metrics?.riskScore >= 4 && (
                <Chip
                  label="HIGH RISK"
                  color="error"
                  size="small"
                />
              )}
            </Box>
          </Box>
          <IconButton onClick={onClose} disabled={loading} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      {/* Tabs */}
      <Box sx={{ 
        borderBottom: 1, 
        borderColor: 'divider',
        px: 3,
        pt: 1
      }}>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {['overview', 'metrics', 'proof', 'activity'].map((tab) => (
            <Button
              key={tab}
              onClick={() => setActiveTab(tab)}
              variant={activeTab === tab ? 'contained' : 'text'}
              size="small"
              sx={{ 
                textTransform: 'capitalize',
                borderRadius: 1,
                px: 2
              }}
            >
              {tab}
            </Button>
          ))}
        </Box>
      </Box>

      <DialogContent dividers sx={{ p: 0 }}>
        {/* Overview Tab */} 
        {activeTab === 'overview' && (
          <Box sx={{ p: 3 }}>
            {/* Main Content Container */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              
              {/* Task Header Section */}
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 3, 
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.primary.main, 0.02),
                  borderColor: alpha(theme.palette.primary.main, 0.1)
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Assessment sx={{ color: theme.palette.primary.main }} />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight="600" gutterBottom>
                      {task.taskTitle}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {task.description || 'No description provided'}
                    </Typography>
                  </Box>
                  <Chip
                    label={task.status.replace('_', ' ').toUpperCase()}
                    color={getStatusColor(task.status)}
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
              </Paper>

              {/* Stats Row */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {/* Assignee Card */}
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2.5, 
                    borderRadius: 2, 
                    flex: 1, 
                    minWidth: 250,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Person sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      ASSIGNEE
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                    <Avatar 
                      src={task.assignedTo?.avatar}
                      sx={{ 
                        width: 44, 
                        height: 44,
                        border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`
                      }}
                    >
                      {task.assignedTo?.name?.charAt(0) || 'U'}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight="600">
                        {task.assignedTo?.name || 'Unassigned'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {task.assignedTo?.email || 'No email provided'}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>

                {/* Deadline Card */}
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2.5, 
                    borderRadius: 2, 
                    flex: 1, 
                    minWidth: 250,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5,
                    borderColor: task.metrics?.isOverdue 
                      ? theme.palette.error.main 
                      : undefined
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarToday sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      DEADLINE
                    </Typography>
                    {task.metrics?.isOverdue && (
                      <Chip
                        label="OVERDUE"
                        color="error"
                        size="small"
                        sx={{ ml: 'auto' }}
                      />
                    )}
                  </Box>
                  
                  <Box>
                    <Typography variant="h6" fontWeight="600" gutterBottom>
                      {formatDate(task.deadline)}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTime sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                      <Typography variant="caption" color="text.secondary">
                        {task.metrics?.daysUntilDeadline > 0 
                          ? `${task.metrics.daysUntilDeadline} days remaining`
                          : task.metrics?.isOverdue 
                            ? 'Past deadline' 
                            : 'Due soon'}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>

                {/* Time Spent Card */}
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2.5, 
                    borderRadius: 2, 
                    flex: 1, 
                    minWidth: 250,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Timer sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      TIME TRACKING
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
                      <Typography variant="h5" fontWeight="600" color="primary">
                        {formatTime(task.totalFocusTime)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        / {formatTime(task.estimatedTime)} estimated
                      </Typography>
                    </Box>
                    
                    {/* Progress Bar */}
                    <Box sx={{ position: 'relative', height: 6, borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                      <Box 
                        sx={{ 
                          position: 'absolute',
                          height: '100%',
                          borderRadius: 3,
                          bgcolor: theme.palette.primary.main,
                          width: `${Math.min((task.totalFocusTime / (task.estimatedTime || 1)) * 100, 100)}%`,
                          transition: 'width 0.3s ease'
                        }}
                      />
                    </Box>
                    
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      {task.metrics?.efficiency?.toFixed(1)}% efficiency
                    </Typography>
                  </Box>
                </Paper>
              </Box>

              {/* Flags & Project Info Row */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {/* Flags Section */}
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2.5, 
                    borderRadius: 2, 
                    flex: 1, 
                    minWidth: 300,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1.5
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Flag sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
                    <Typography variant="subtitle2" color="text.secondary">
                      RISK FLAGS
                    </Typography>
                    <Box sx={{ ml: 'auto' }}>
                      <Chip
                        label={task.metrics?.riskScore >= 4 ? 'HIGH' : 
                              task.metrics?.riskScore >= 2 ? 'MEDIUM' : 'LOW'}
                        color={getRiskColor(task.metrics?.riskScore)}
                        size="small"
                        icon={<Security fontSize="small" />}
                      />
                    </Box>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {task.flags?.paddedTime && (
                      <Chip 
                        icon={<Timer />} 
                        label="Padded Time" 
                        color="warning" 
                        size="small" 
                        variant="outlined"
                        sx={{ fontWeight: 500 }}
                      />
                    )}
                    {task.flags?.rushedCompletion && (
                      <Chip 
                        icon={<Speed />} 
                        label="Rushed Completion" 
                        color="error" 
                        size="small" 
                        variant="outlined"
                        sx={{ fontWeight: 500 }}
                      />
                    )}
                    {task.flags?.noProof && (
                      <Chip 
                        icon={<Warning />} 
                        label="No Proof" 
                        color="error" 
                        size="small" 
                        variant="outlined"
                        sx={{ fontWeight: 500 }}
                      />
                    )}
                    {task.flags?.manualReviewRequired && (
                      <Chip 
                        icon={<Assessment />} 
                        label="Needs Review" 
                        color="warning" 
                        size="small" 
                        variant="outlined"
                        sx={{ fontWeight: 500 }}
                      />
                    )}
                    {!task.flags?.paddedTime && 
                    !task.flags?.rushedCompletion && 
                    !task.flags?.noProof && 
                    !task.flags?.manualReviewRequired && (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        p: 1.5,
                        borderRadius: 1,
                        bgcolor: alpha(theme.palette.success.main, 0.1)
                      }}>
                        <CheckCircle sx={{ color: theme.palette.success.main, fontSize: 20 }} />
                        <Typography variant="body2" color="success.main" fontWeight="500">
                          All checks passed
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  
                  {/* Risk Score Indicator */}
                  {task.metrics?.riskScore > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Risk Score
                        </Typography>
                        <Typography variant="caption" fontWeight="600">
                          {task.metrics?.riskScore || 0}/8
                        </Typography>
                      </Box>
                      <Box sx={{ 
                        height: 4, 
                        borderRadius: 2, 
                        bgcolor: alpha(theme.palette.grey[300], 0.5),
                        overflow: 'hidden'
                      }}>
                        <Box 
                          sx={{ 
                            height: '100%',
                            borderRadius: 2,
                            bgcolor: getRiskColor(task.metrics?.riskScore) === 'error' 
                              ? theme.palette.error.main 
                              : getRiskColor(task.metrics?.riskScore) === 'warning'
                                ? theme.palette.warning.main
                                : theme.palette.success.main,
                            width: `${(task.metrics?.riskScore / 8) * 100}%`,
                            transition: 'width 0.3s ease'
                          }}
                        />
                      </Box>
                    </Box>
                  )}
                </Paper>

                {/* Project & Meta Info */}
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2.5, 
                    borderRadius: 2, 
                    flex: 1, 
                    minWidth: 300,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2
                  }}
                >
                  {/* Project Info */}
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <Folder sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
                      <Typography variant="subtitle2" color="text.secondary">
                        PROJECT
                      </Typography>
                    </Box>
                    
                    <Box sx={{ 
                      p: 1.5, 
                      borderRadius: 1.5,
                      bgcolor: alpha(theme.palette.info.main, 0.05),
                      border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
                    }}>
                      <Typography variant="body1" fontWeight="600" gutterBottom>
                        {task.projectId?.projectName || 'Unknown Project'}
                      </Typography>
                      {task.projectId?._id && (
                        <Typography variant="caption" color="text.secondary">
                          ID: {task.projectId._id.slice(-8)}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* Additional Info */}
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                      <Info sx={{ color: theme.palette.text.secondary, fontSize: 20 }} />
                      <Typography variant="subtitle2" color="text.secondary">
                        ADDITIONAL INFO
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {/* Created At */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.secondary">
                          Created
                        </Typography>
                        <Typography variant="caption" fontWeight="500">
                          {task.createdAt ? formatDate(task.createdAt) : 'N/A'}
                        </Typography>
                      </Box>
                      
                      {/* Last Updated */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.secondary">
                          Last Updated
                        </Typography>
                        <Typography variant="caption" fontWeight="500">
                          {task.updatedAt ? formatDate(task.updatedAt) : 'N/A'}
                        </Typography>
                      </Box>
                      
                      {/* Proof Count */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" color="text.secondary">
                          Proof Files
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {task.metrics?.hasProof ? (
                            <CheckCircle sx={{ fontSize: 14, color: theme.palette.success.main }} />
                          ) : (
                            <Warning sx={{ fontSize: 14, color: theme.palette.error.main }} />
                          )}
                          <Typography variant="caption" fontWeight="500">
                            {task.proofUploads?.length || 0} uploaded
                          </Typography>
                        </Box>
                      </Box>
                      
                      {/* Task ID */}
                      {task._id && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="caption" color="text.secondary">
                            Task ID
                          </Typography>
                          <Typography variant="caption" fontWeight="500">
                            {task._id.slice(-8)}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </Paper>
              </Box>

              {/* Quick Actions Bar */}
              {(userRole?.role === 'teacher' || userRole?.role === 'admin' || task.assignedTo?._id === userRole?.userId) && (
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.02)
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                    QUICK ACTIONS
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {task.assignedTo?._id === userRole?.userId && (
                      <>
                        {task.status !== 'completed' && (
                          <Button
                            variant="contained"
                            startIcon={<CheckCircle />}
                            onClick={() => handleStatusChange('completed')}
                            disabled={loading}
                            size="small"
                            sx={{ borderRadius: 1.5 }}
                          >
                            Mark Complete
                          </Button>
                        )}
                        <Button
                          variant="outlined"
                          startIcon={<Timer />}
                          onClick={() => {
                            // You'll need to trigger the LogTimeModal
                            onClose();
                            setTimeout(() => {
                              // Call parent function to open log time modal
                              window.dispatchEvent(new CustomEvent('openLogTimeModal', { detail: task }));
                            }, 100);
                          }}
                          size="small"
                          sx={{ borderRadius: 1.5 }}
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
                          size="small"
                          sx={{ borderRadius: 1.5 }}
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
                          size="small"
                          sx={{ borderRadius: 1.5 }}
                        >
                          Edit Flags
                        </Button>
                        <Button
                          variant="outlined"
                          color="primary"
                          startIcon={<Grade />}
                          onClick={handleGradeOverride}
                          size="small"
                          sx={{ borderRadius: 1.5 }}
                        >
                          Override Grade
                        </Button>
                        <Button
                          variant="outlined"
                          color="secondary"
                          startIcon={<Person />}
                          onClick={handleReassignTask}
                          size="small"
                          sx={{ borderRadius: 1.5 }}
                        >
                          Reassign
                        </Button>
                      </>
                    )}
                    
                    <Button
                      variant="outlined"
                      color="info"
                      startIcon={<Edit />}
                      onClick={handleEditTask}
                      size="small"
                      sx={{ borderRadius: 1.5 }}
                    >
                      Edit Details
                    </Button>
                  </Box>
                </Paper>
              )}
            </Box>
          </Box>
        )}

        {/* Metrics Tab */}
        {activeTab === 'metrics' && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 3 }}>
              {/* Efficiency Card */}
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, flex: 1, minWidth: 280 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    EFFICIENCY
                  </Typography>
                  <Chip
                    label={task.metrics?.efficiency > 120 ? 'Overworked' : 
                           task.metrics?.efficiency < 50 ? 'Rushed' : 
                           'Optimal'}
                    color={getEfficiencyColor(task.metrics?.efficiency)}
                    size="small"
                  />
                </Box>
                <Typography 
                  variant="h3" 
                  fontWeight="600"
                  color={getEfficiencyColor(task.metrics?.efficiency)}
                  sx={{ mb: 1 }}
                >
                  {task.metrics?.efficiency?.toFixed(1)}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={Math.min(task.metrics?.efficiency || 0, 100)}
                  color={getEfficiencyColor(task.metrics?.efficiency)}
                  sx={{ height: 8, borderRadius: 4, mb: 1 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">
                    {formatTime(task.totalFocusTime)} spent
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatTime(task.estimatedTime)} estimated
                  </Typography>
                </Box>
              </Paper>

              {/* Risk Card */}
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, flex: 1, minWidth: 280 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    RISK SCORE
                  </Typography>
                  <Chip
                    label={task.metrics?.riskScore >= 4 ? 'High Risk' : 
                           task.metrics?.riskScore >= 2 ? 'Medium Risk' : 
                           'Low Risk'}
                    color={getRiskColor(task.metrics?.riskScore)}
                    size="small"
                  />
                </Box>
                <Typography 
                  variant="h3" 
                  fontWeight="600"
                  color={getRiskColor(task.metrics?.riskScore)}
                  sx={{ mb: 2 }}
                >
                  {task.metrics?.riskScore || 0}/8
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {[
                    { label: 'Padded Time', value: task.flags?.paddedTime, score: 2 },
                    { label: 'Rushed Completion', value: task.flags?.rushedCompletion, score: 2 },
                    { label: 'No Proof', value: task.flags?.noProof, score: 1 },
                    { label: 'Manual Review', value: task.flags?.manualReviewRequired, score: 3 }
                  ].map((item) => (
                    <Box key={item.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2">{item.label}</Typography>
                      <Chip
                        label={item.value ? `+${item.score}` : 'No'}
                        color={item.value ? 'error' : 'success'}
                        size="small"
                      />
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Box>
          </Box>
        )}

        {/* Proof Tab */}
        {activeTab === 'proof' && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 2 
            }}>
              <Typography variant="subtitle1" fontWeight="500">
                Proof Uploads ({task.proofUploads?.length || 0})
              </Typography>
              {task.assignedTo?._id === userRole?.userId && (
                <Button
                  variant="outlined"
                  startIcon={<Upload />}
                  size="small"
                  onClick={() => {
                    // You'll need to implement this or use the UploadProofModal
                    alert('Upload proof functionality');
                  }}
                >
                  Add Proof
                </Button>
              )}
            </Box>
            
            {task.proofUploads?.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {task.proofUploads.map((proof, index) => (
                  <Paper key={index} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body1" fontWeight="500">
                          {proof.filename}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Uploaded {formatDate(proof.uploadedAt)}
                        </Typography>
                      </Box>
                      <Button
                        startIcon={<Visibility />}
                        size="small"
                        onClick={() => window.open(proof.fileUrl, '_blank')}
                      >
                        View
                      </Button>
                    </Box>
                  </Paper>
                ))}
              </Box>
            ) : (
              <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
                <Upload sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  No proof uploaded yet
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Upload proof of work to reduce risk score
                </Typography>
              </Paper>
            )}
          </Box>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <Box sx={{ p: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 3 
            }}>
              <Typography variant="subtitle1" fontWeight="600">
                Activity Log
              </Typography>
              <Button
                startIcon={<Refresh />}
                size="small"
                onClick={fetchActivityLogs}
                disabled={loadingActivity}
                variant="outlined"
              >
                Refresh
              </Button>
            </Box>
            
            {loadingActivity ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress size={40} />
              </Box>
            ) : activityLogs.length === 0 ? (
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 4, 
                  textAlign: 'center', 
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.background.default, 0.5)
                }}
              >
                <AccessTime sx={{ 
                  fontSize: 48, 
                  color: 'text.disabled', 
                  mb: 2 
                }} />
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  No activity recorded yet
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Activities will appear when changes are made to this task
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
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: index === 0 ? 
                        alpha(theme.palette.primary.main, 0.03) : 
                        'background.paper'
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          backgroundColor: log.isSystemEvent ? 
                            'grey.500' : 
                            theme.palette.primary.main
                        }}
                      >
                        {log.isSystemEvent ? (
                          <Timer />
                        ) : (
                          log.user?.name?.charAt(0) || 'U'
                        )}
                      </Avatar>
                      
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" sx={{ mb: 0.5 }}>
                          {log.action}
                        </Typography>
                        
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1,
                          flexWrap: 'wrap'
                        }}>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              color: 'text.secondary'
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
                              color: 'text.secondary'
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
                            />
                          )}
                          
                          {log.eventType === 'proof_upload' && (
                            <Chip
                              label="Proof"
                              size="small"
                              icon={<Upload />}
                              color="success"
                              variant="outlined"
                            />
                          )}
                        </Box>
                        
                        {log.metadata?.comment && (
                          <Paper
                            variant="outlined"
                            sx={{
                              mt: 1,
                              p: 1.5,
                              backgroundColor: alpha(theme.palette.info.main, 0.05),
                              borderColor: alpha(theme.palette.info.main, 0.2)
                            }}
                          >
                            <Typography variant="body2" color="text.secondary">
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
                mt: 3,
                pt: 2,
                borderTop: 1,
                borderColor: 'divider'
              }}>
                <Typography variant="caption" color="text.secondary">
                  Showing {activityLogs.length} most recent activities
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      
      {/* Dialog Actions */}
      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {userRole?.role === 'teacher' || userRole?.role === 'admin' ? (
            <>
              <Button
                startIcon={<Flag />}
                color="warning"
                disabled={loading}
                onClick={handleEditFlags}
                size="small"
              >
                Edit Flags
              </Button>
              <Button
                startIcon={<Grade />}
                color="primary"
                disabled={loading}
                onClick={handleGradeOverride}
                size="small"
              >
                Override Grade
              </Button>
              <Button
                startIcon={<Edit />}
                color="info"
                disabled={loading}
                onClick={handleEditTask}
                size="small"
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
                >
                  Reopen
                </Button>
              )}
              <Button
                startIcon={<Edit />}
                onClick={handleEditTask}
                disabled={loading}
                size="small"
              >
                Edit
              </Button>
              <Button
                startIcon={<AccessTime />}
                onClick={handleAddComment}
                disabled={loading}
                size="small"
              >
                Add Comment
              </Button>
            </>
          )}
        </Box>
        <Button onClick={onClose} disabled={loading}>
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
  userRole,
  onLogTime,
  onUploadProof,
  onViewDetails,
  onStatusChange
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
            color={getEfficiencyColor(task.metrics?.efficiency)}
          >
            {task.metrics?.efficiency?.toFixed(1)}%
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
          
          {(userRole?.role === 'teacher' || userRole?.role === 'admin') && (
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
          
          <IconButton 
            size="small"
            onClick={(e) => setActionsAnchorEl(e.currentTarget)}
          >
            <MoreHoriz fontSize="small" />
          </IconButton>
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
  const [filters, setFilters] = useState({
    status: 'all',
    riskLevel: 'all',
    hasProof: 'all',
    isOverdue: false
  });
  const [metrics, setMetrics] = useState(null);
  const [authError, setAuthError] = useState(false);
  const [userRole, setUserRole] = useState(null);
  console.log("projectId: ",projectId);
  // Check authentication and get user role
  const checkAuth = useCallback(() => {
    const token = getAuthToken();
    const user = getUserData();
    
    if (!token || !user) {
      setAuthError(true);
      setError('Please log in to view tasks.');
      return false;
    }
    
    // Set user role from user data
    setUserRole({
      role: user.role || 'student',
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

      if (!response.data?.success) {
        throw new Error('Failed to fetch tasks');
      }

      const tasksData = response.data.tasks || [];

      const enrichedTasks = tasksData.map(task => {
        const taskMetrics = calculateTaskMetricsFromData(task);

        return {
          ...task,
          metrics: {
            efficiency: taskMetrics.efficiency.percentage,
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
      setMetrics(null);
      setAuthError(false);

    } catch (err) {
      console.error('Error fetching tasks:', err);
      handleFetchError(err);
    } finally {
      setLoading(false);
    }
  }, [checkAuth]);

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

const calculateEfficiency = (task) => {
  if (!task.estimatedTime || task.estimatedTime === 0) return 0;
  return Math.round((task.totalFocusTime / task.estimatedTime) * 100 * 100) / 100;
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

  //
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const token = getAuthToken();
      if (!token) {
        setError('Authentication required');
        return;
      }

      const response = await axiosClient.put(`/user/task/${taskId}/status`,
        { status: newStatus },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data?.success) {
        // Update local state with the returned task data
        const updatedTask = response.data.task;
        
        setTasks(prev => prev.map(task =>
          task._id === taskId
            ? { 
                ...task, 
                status: newStatus,
                lastEventTime: updatedTask.lastEventTime,
                // Updating metrics based on new status
                metrics: {
                  ...task.metrics,
                  statusWeightPercentage: calculateStatusWeight(newStatus),
                  isOverdue: calculateIsOverdue({ ...task, status: newStatus })
                }
              }
            : task
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

  const handleDeleteSelected = () => {
    if (selectedTasks.size === 0) return;
    
    if (window.confirm(`Delete ${selectedTasks.size} selected task(s)?`)) {
      // Simulate deletion
      setTasks(prev => prev.filter(task => !selectedTasks.has(task._id)));
      setSelectedTasks(new Set());
    }
  };

  const allSelected = filteredTasks.length > 0 && selectedTasks.size === filteredTasks.length;
  const hasTasks = filteredTasks.length > 0;
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
            onClick={() => navigate('/projects')}
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
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {[
            { 
              label: 'Total Tasks', 
              value: filteredTasks.length, 
              icon: <Assessment fontSize="small" />,
              color: theme.palette.primary.main 
            },
            { 
              label: 'High Risk', 
              value: filteredTasks.filter(t => t.metrics?.riskScore >= 4).length, 
              icon: <Security fontSize="small" />,
              color: theme.palette.error.main 
            },
            { 
              label: 'Completed', 
              value: filteredTasks.filter(t => t.status === 'completed').length, 
              icon: <CheckCircle fontSize="small" />,
              color: theme.palette.success.main 
            },
            { 
              label: 'Need Proof', 
              value: filteredTasks.filter(t => !t.metrics?.hasProof).length, 
              icon: <Warning fontSize="small" />,
              color: theme.palette.warning.main 
            }
          ].map((stat, index) => (
            <Grid item xs={6} sm={3} key={stat.label}>
              <Paper
                sx={{
                  p: 2,
                  borderRadius: 1,
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    backgroundColor: stat.color,
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box sx={{ color: stat.color }}>
                    {stat.icon}
                  </Box>
                  <Typography variant="h6" fontWeight="600">
                    {stat.value}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  {stat.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

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
          <TableContainer 
            component={Paper}
            sx={{
              borderRadius: 1,
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              overflow: 'auto'
            }}
          >
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={allSelected}
                      indeterminate={selectedTasks.size > 0 && !allSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="600">
                      TASK TITLE
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="600">
                      ASSIGNEE
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="600">
                      STATUS
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="600">
                      DEADLINE
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="600">
                      EFFICIENCY
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="600">
                      RISK LEVEL
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="600">
                      PROOF
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="600">
                      ACTIONS
                    </Typography>
                  </TableCell>
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
                    onLogTime={handleLogTime}
                    onUploadProof={handleUploadProof}
                    onViewDetails={handleViewDetails}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Table Footer */}
          {selectedTasks.size > 0 && (
            <Paper
              sx={{
                mt: 2,
                p: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderRadius: 1,
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <Typography variant="body2" color="primary">
                {selectedTasks.size} task(s) selected
              </Typography>
              <Button
                startIcon={<Delete />}
                color="error"
                size="small"
                onClick={handleDeleteSelected}
              >
                Delete Selected
              </Button>
            </Paper>
          )}
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
      />

      <LogTimeModal
        open={logTimeOpen}
        onClose={() => setLogTimeOpen(false)}
        task={selectedTask}
        theme={theme}
        onSuccess={handleTaskUpdate}
      />

      <UploadProofModal
        open={uploadProofOpen}
        onClose={() => setUploadProofOpen(false)}
        task={selectedTask}
        theme={theme}
        onSuccess={handleTaskUpdate}
      />
    </Box>
  );
};

export default Tasks;