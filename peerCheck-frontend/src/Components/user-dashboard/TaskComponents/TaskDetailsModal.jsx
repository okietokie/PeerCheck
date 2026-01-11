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
import axiosClient from '@/api/axiosClient.js';
import { getAuthToken } from '@/utils/auth.js';
import CommentTab from '@/Components/user-dashboard/CommentsTab.jsx';
import { getUserData } from '@/utils/user.js';
import TourGuide from '@/Components/TourGuide.jsx';
import useTasks from '@/hooks/useTasks';


export const TaskDetailsModal = ({ open, onClose, task, theme, userRole, onTaskUpdate,  onUploadProof, onStatusChange }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activityLogs, setActivityLogs] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [projectTeam, setProjectTeam] = useState([]);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [updatedTask, setUpdatedTask] = useState(task);
  const [user, setUser] = useState();
  const [isEditing, setIsEditing] = useState(false);
  const [updateTaskMessage, setUpdateTaskMessage] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const {formatTime} = useTasks();

  const isAssignedUser = task?.assignedTo?._id.toString() === userRole?.userId?.toString();
  console.log("userrole: ", userRole);
  console.log("task.assignedTo?._id ", task?.assignedTo?._id);



  useEffect(() => {
    if (task) {
      setUpdatedTask(task);
    }
  }, [task]);

  useEffect(() => {
    if(!task) return;

    

    const fetchTaskData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axiosClient.get(`/user/task/${task._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if(response?.data?.success && response.data.task) {
          const cleanedTask = response.data.task;
          
          // Safely handle assignedTo
          if (!cleanedTask.assignedTo) {
            cleanedTask.assignedTo = { 
              _id: '', 
              name: 'Unassigned', 
              email: '', 
              avatar: '' 
            };
          }
          
          // Clean other fields
          Object.keys(cleanedTask).forEach(key => {
            if (cleanedTask[key] === null || cleanedTask[key] === undefined) {
              if (key === 'description') {
                cleanedTask[key] = '';
              } else if (key === 'deadline') {
                cleanedTask[key] = new Date().toISOString();
              } else if (key === 'estimatedTime') {
                cleanedTask[key] = 0;
              } else if (key === 'totalFocusTime') {
                cleanedTask[key] = 0;
              }
            }
          });
          
          setUpdatedTask(cleanedTask);
          const getUser = await getUserData();
          console.log("getuser: ", getUser);
          setUser(getUser);
        }

      } catch(err) {
        console.error("Error fetching tasks[TaskDetailsModal]:", err);
        setSnackbar({
          open: true,
          message: 'Failed to load task details',
          severity: 'error'
        });
      }
    };
    
    fetchTaskData();
  }, [isEditing, activeTab, loading]);

const handleEditTask = async () => {
  try {
    if (isEditing) {
      setIsEditing(false);
      const token = localStorage.getItem("token");

      if (!updatedTask.taskTitle?.trim()) {
        setError('Task title is required');
        return;
      }

      // Prepare the data to send - ensure proper data types
      const taskData = {
        taskTitle: updatedTask.taskTitle.trim(),
        description: updatedTask.description?.trim() || '',
        deadline: updatedTask.deadline,
        estimatedTime: Number(updatedTask.estimatedTime) || 0,
      };

      // Debug: log the data being sent

      // Handle assignedTo - extract just the ID if it's an object
      if (updatedTask.assignedTo) {
        if (typeof updatedTask.assignedTo === 'object' && updatedTask.assignedTo._id) {
          taskData.assignedTo = updatedTask.assignedTo._id;
        } else if (typeof updatedTask.assignedTo === 'string') {
          taskData.assignedTo = updatedTask.assignedTo;
        }
      }

      // Include projectId if it exists
      if (updatedTask.projectId) {
        if (typeof updatedTask.projectId === 'object' && updatedTask.projectId._id) {
          taskData.projectId = updatedTask.projectId._id;
        } else if (typeof updatedTask.projectId === 'string') {
          taskData.projectId = updatedTask.projectId;
        }
      }


      const response = await axiosClient.patch(
        `/user/task/${task._id}`,
        taskData,
        {
          headers: {  
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );


      if (response?.data?.success) {
        setUpdatedTask(response.data.task);
        setUpdateTaskMessage({
          open: true,
          message: "Task updated successfully!",
          severity: "success"
        });
        // Refresh the task list
        onTaskUpdate?.();
      } else {
        setError(response?.data?.error || 'Failed to update task');
        setUpdateTaskMessage({
          open: true,
          message: response?.data?.error || 'Failed to update task',
          severity: "error"
        });
      }
    } else {
      // Enter edit mode
      setIsEditing(true);
    }
  } catch (error) {
    console.error("Error updating task details: ", error);
    console.error("Error response:", error.response?.data);
    
    let errorMessage = 'Failed to update task';
    if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    
    setError(errorMessage);
    setUpdateTaskMessage({
      open: true,
      message: errorMessage,
      severity: "error"
    });
    
    // Exit edit mode on error
    setIsEditing(false);
  }
};


const viewProofFile = async (taskId, proofId) => {
  try {
    const token = localStorage.getItem("token");

    const response = await axiosClient.get(
      `/user/task/${taskId}/proof/${proofId}?download=false`, // send query to indicate inline
      {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    const fileURL = URL.createObjectURL(response.data);
    window.open(fileURL, "_blank"); // open in new tab for viewing
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

    const response = await axiosClient.get(
      `/user/task/${taskId}/proof/${proofId}?download=true`, // force download
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
    link.setAttribute("download", filename); // filename for download
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

      // Optionally, refresh the list of proofs or update state
      // fetchTaskProofs(); // your function to refresh UI
    } else {
      setSnackbar({
        open: true,
        message: response.data.error || 'Failed to delete proof',
        severity: 'error'
      });
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

  const handleReassignTask = async () => {
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
                <TourGuide page='taskModal' showAppBarButton={true} />

                {updatedTask?.taskTitle || 'Task'}
              </Typography>
              <Typography >
                Assigned To: <Chip 
                label={isAssignedUser ?  user?.name : updatedTask?.assignedTo?.name } 
                color={theme.palette.secondary.main}
                sx={{
                  fontWeight: 700,
                  borderRadius:2 ,
                  height: 28,
                  fontSize: '0.75rem',
                  boxShadow: `0 3px 8px ${alpha(getStatusColor(updatedTask?.status) === 'primary' ? theme.palette.primary.main : 
                                          getStatusColor(updatedTask?.status) === 'success' ? theme.palette.success.main : 
                                          getStatusColor(updatedTask?.status) === 'warning' ? theme.palette.warning.main : 
                                          theme.palette.error.main, 0.2)}`,
                }}/>
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mt: 1 }}>
                <Chip
                  label={(updatedTask?.status || 'not_started').replace('_', ' ').toUpperCase()}
                  color={getStatusColor(updatedTask?.status)}
                  size="medium"
                  sx={{
                    fontWeight: 700,
                    borderRadius: 1.5,
                    height: 28,
                    fontSize: '0.75rem',
                    boxShadow: `0 2px 8px ${alpha(getStatusColor(updatedTask?.status) === 'primary' ? theme.palette.primary.main : 
                                            getStatusColor(updatedTask?.status) === 'success' ? theme.palette.success.main : 
                                            getStatusColor(updatedTask?.status) === 'warning' ? theme.palette.warning.main : 
                                            theme.palette.error.main, 0.2)}`,
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
      <Box className='modal-tabs' sx={{ 
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
            { key: 'activity', label: 'Activity', icon: <HistoryIcon fontSize="small" /> },
            { key: 'comments', label: 'Comments', icon: <Comment fontSize="small" /> }
          ].map((tab) => (
            <Button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              variant={activeTab === tab.key ? 'contained' : 'text'}
              size="medium"
              data-tour-tab={tab.key}
              data-tour-label={tab.label}
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
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <Box sx={{ p: 4 }} >
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
                        value={updatedTask?.description || ''}
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
                        {updatedTask?.description || 'No description provided.'}
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
                        {updatedTask?.assignedTo?.name || 'Unassigned'}
                      </Typography>
                      {updatedTask?.assignedTo?.email && (
                        <Typography variant="caption" sx={{ 
                          color: theme.palette.text.secondary,
                          fontFamily: '"Inter", sans-serif',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                        }}>
                          <Email fontSize="inherit" /> {updatedTask.assignedTo.email}
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
                    backgroundColor: updatedTask?.metrics?.isOverdue 
                      ? alpha(theme.palette.error.main, 0.05)
                      : theme.palette.background.paper,
                    border: `1px solid ${updatedTask?.metrics?.isOverdue 
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
                          ? `${updatedTask.metrics.daysUntilDeadline} days remaining`
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
                        {formatTime(updatedTask?.totalFocusTime || 0)}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        color: theme.palette.text.secondary,
                        fontFamily: '"Inter", sans-serif',
                      }}>
                        of {formatTime(updatedTask?.estimatedTime || 0)} estimated
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
                        color: getEfficiencyColor(updatedTask?.taskMetrics?.efficiency),
                        lineHeight: 1,
                      }}>
                        {(updatedTask?.taskMetrics?.efficiency?.toFixed(1) || '0.0')}%
                      </Typography>
                      <Chip
                        label={updatedTask?.taskMetrics?.efficiency > 120 ? 'High' : 
                              updatedTask?.taskMetrics?.efficiency < 50 ? 'Low' : 
                              'Optimal'}
                        color={getEfficiencyColor(updatedTask?.taskMetrics?.efficiency)}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                    
                    <LinearProgress 
                      variant="determinate" 
                      value={Math.min(updatedTask?.taskMetrics?.efficiency || 0, 100)}
                      color={getEfficiencyColor(updatedTask?.taskMetrics?.efficiency)}
                      sx={{ 
                        height: 8, 
                        borderRadius: 4, 
                        mb: 1.5,
                        backgroundColor: alpha(getEfficiencyColor(updatedTask?.taskMetrics?.efficiency) === 'success' 
                          ? theme.palette.success.main 
                          : getEfficiencyColor(updatedTask?.taskMetrics?.efficiency) === 'warning'
                            ? theme.palette.warning.main
                            : theme.palette.error.main, 0.1),
                      }}
                    />
                    
                    <Typography variant="caption" sx={{ 
                      color: theme.palette.text.secondary,
                      fontFamily: '"Inter", sans-serif',
                      fontStyle: 'italic',
                    }}>
                      {updatedTask?.taskMetrics?.efficiency > 120 
                        ? 'Above expected efficiency' 
                        : updatedTask?.taskMetrics?.efficiency < 50 
                          ? 'Below expected efficiency'
                          : 'Within optimal range'}
                    </Typography>
                  </Box>
                </Paper>
              </Box>

              {/* Quick Actions - Minimalist Bar */}
              {(userRole?.role === 'teacher' || userRole?.role === 'admin' || updatedTask?.assignedTo?._id === userRole?.userId) && (
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
                      onClick={handleEditTask}
                      size="medium"
                      sx={{ borderRadius: 2, px: 3, py: 1, fontWeight: 600 }}
                    > 
                      {isEditing ? "Save Changes" : "Edit Details"}
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
                  border: `1px solid ${alpha(getRiskColor(updatedTask?.metrics?.riskScore) === 'error' 
                    ? theme.palette.error.main 
                    : getRiskColor(updatedTask?.metrics?.riskScore) === 'warning'
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
                  flex: 1,
                  p: 3.5,
                  borderRadius: 3,
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${alpha(getEfficiencyColor(updatedTask?.taskMetrics?.efficiency) === 'success' 
                    ? theme.palette.success.main 
                    : getEfficiencyColor(updatedTask?.taskMetrics?.efficiency) === 'warning'
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
                    <TrendingUp sx={{ color: getEfficiencyColor(updatedTask?.taskMetrics?.efficiency) }} />
                    Efficiency Analysis
                  </Typography>
                </Box>
                
                {/* Efficiency Score */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Typography variant="h1" fontWeight="800" sx={{ 
                    fontFamily: '"Alkatra", cursive',
                    color: getEfficiencyColor(updatedTask?.taskMetrics?.efficiency),
                    lineHeight: 1,
                    mb: 1,
                  }}>
                    {(updatedTask?.taskMetrics?.efficiency?.toFixed(1) || '0.0')}%
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: theme.palette.text.secondary,
                    fontFamily: '"Inter", sans-serif',
                  }}>
                    {updatedTask?.taskMetrics?.efficiency > 120 
                      ? 'Above expected range' 
                      : updatedTask?.taskMetrics?.efficiency < 50 
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
                          {formatTime(updatedTask?.totalFocusTime || 0)}
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
                          width: `${Math.min(((updatedTask?.totalFocusTime || 0) / ((updatedTask?.estimatedTime || 0) || 1)) * 100, 100)}%`,
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
                          {formatTime(updatedTask?.estimatedTime || 0)}
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
                      color: getEfficiencyColor(updatedTask?.taskMetrics?.efficiency),
                      fontFamily: '"Inter", sans-serif',
                      fontWeight: 600,
                    }}>
                      {(((updatedTask?.totalFocusTime || 0) / ((updatedTask?.estimatedTime || 0) || 1)) * 100).toFixed(1)}%
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
                  {updatedTask?.proofUploads?.length || 0} file(s) uploaded
                </Typography>
              </Box>
              {updatedTask?.assignedTo?._id === userRole?.userId && (
                <Button
                  variant="contained"
                  startIcon={<Upload />}
                  size="medium"
                  onClick={() => onUploadProof(updatedTask)}
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
                {updatedTask.proofUploads.map((proof, index) => (
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
                          onClick={() => viewProofFile(updatedTask._id, proof._id)}
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
                          onClick={() => downloadProofFile(updatedTask._id, proof._id, proof.filename)}
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
                          onClick={() => deleteProofFile(updatedTask._id, proof._id)}
                          sx={{ 
                            color: theme.palette.info.main,
                            backgroundColor: alpha(theme.palette.info.main, 0.1),
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.info.main, 0.2),
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
        {/*Comments tab */}
        {activeTab === 'comments' && (
          <Box sx={{ p: 4, height: '100%' }}>
            <CommentTab
              taskId={task._id}
              projectId={task.projectId}
              currentUser={user}
            />
          </Box>
        )}
      </DialogContent>
      
      {/* Dialog Actions */}
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
              {updatedTask?.assignedTo && (
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
          ) : updatedTask?.assignedTo?._id === userRole?.userId && (
            <>
              {updatedTask?.status !== 'completed' && (
                <Button
                  type="button"
                  variant="contained"
                  startIcon={<CheckCircle />}
                  onClick={() => onStatusChange(updatedTask._id, "completed")}
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
                  onClick={() => onStatusChange(updatedTask._id,'active')}
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

      {/* Add Comment Dialog (to be implemented) */}
      <Dialog open={commentDialogOpen} onClose={() => setCommentDialogOpen(false)}>
        <DialogTitle>Add Comment</DialogTitle>
        <DialogContent>
          <Typography>Comment dialog to be implemented</Typography>
        </DialogContent>
      </Dialog>

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
    </Dialog>
  );
};


export default TaskDetailsModal;