import {
  ArrowDownward,
  ArrowUpward,
  CheckCircle,
  Pause,
  PlayArrow,
  PriorityHigh,
  RadioButtonUnchecked,
  Remove,
  ChatBubbleOutline,
  Speed,
  Security,
  Warning,
  Upload,
  Edit,
  CalendarToday,
  Schedule,
  Person,
  Close,
  ExpandMore,
  ExpandLess,
  Description,
  AccessTime,
  PersonAddAlt,
  Assignment,
  AttachFile,
  Chat,
  Timer,
  Flag,
  Timeline,
  TrendingUp,
  ArrowRightAltRounded,
  ExpandCircleDown,
  
} from "@mui/icons-material";
import {
  TextField,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Popover,
  Tooltip,
  TableRow,
  alpha,
  TableCell,
  Checkbox,
  Box,
  Typography,
  Chip,
  Avatar,
  Badge,
  Stack,
  IconButton,
  CircularProgress,
  Button,
  ClickAwayListener,
  Collapse,
  Divider,
} from '@mui/material';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { getAuthToken } from "@/utils/auth";
import axiosClient from "@/api/axiosClient";
import AssigneeSelectPopover from "./AssigneeSelectPopover";
import useGeneral from "@/hooks/useGeneralUIlogic";
import TaskPerformancePanel from "./TaskPerformance";
import TaskRiskPanel from "./TaskRisk";
import TaskTimelinePanel from "./TaskTimeline";
import TaskMetricsPanel from "./TaskMetrics";

// Status options for dropdown
const STATUS_OPTIONS = [
  { value: 'not_started', label: 'To Do', icon: <RadioButtonUnchecked fontSize="small" /> },
  { value: 'active', label: 'In Progress', icon: <PlayArrow fontSize="small" /> },
  { value: 'paused', label: 'Paused', icon: <Pause fontSize="small" /> },
  { value: 'completed', label: 'Completed', icon: <CheckCircle fontSize="small" /> }
];

// Priority options
const PRIORITY_OPTIONS = [
  { value: 'urgent', label: 'Urgent', color: 'error', icon: <PriorityHigh fontSize="small" /> },
  { value: 'high', label: 'High', color: 'warning', icon: <ArrowUpward fontSize="small" /> },
  { value: 'normal', label: 'Normal', color: 'info', icon: <Remove fontSize="small" /> },
  { value: 'low', label: 'Low', color: 'success', icon: <ArrowDownward fontSize="small" /> }
];

// Task Table Row Component
export const TaskTableRow = ({
  task,
  isSelected,
  onSelect,
  theme,
  userRole,
  onUploadProof,
  onViewDetails,
  onStatusChange,
  onTaskUpdate,
  showProjectColumn = false,
  mobile = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedTask, setEditedTask] = useState({ ...task });
  const [editedDescription, setEditedDescription] = useState(task.description || '');
  const [statusAnchorEl, setStatusAnchorEl] = useState(null);
  const [priorityAnchorEl, setPriorityAnchorEl] = useState(null);
  const [dueDatePickerAnchor, setDueDatePickerAnchor] = useState(null);
  const [datePickerValue, setDatePickerValue] = useState();
  const [user, setUser] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [assigneeAnchorEl, setAssigneeAnchorEl] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);

  const [metricsOpen, setMetricsOpen] = useState(false);
  const [riskOpen, setRiskOpen] = useState(false);
  const [performanceOpen, setPerformanceOpen] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(false);


  const {
    getEfficiencyColor
  } = useGeneral();

  const projectName =
    typeof task.projectId === 'object'
      ? task.projectId?.projectName || task.projectId?.name || task.projectName
      : task.projectName;

  // Helper functions
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'active': return 'info';
      case 'paused': return 'warning';
      case 'not_started': return 'default';
      default: return 'default';
    }
  };
  const MetricCard = ({ icon, label, children }) => (
  <Box
    sx={{
      p: 1.5,
      borderRadius: 2,
      backgroundColor: alpha(theme.palette.background.paper, 0.5),
      textAlign: 'center',
    }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 1 }}>
      {icon}
      <Typography variant="body2" fontWeight={600}>
        {label}
      </Typography>
    </Box>
    {children}
  </Box>
);


  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle fontSize="small" />;
      case 'active': return <PlayArrow fontSize="small" />;
      case 'paused': return <Pause fontSize="small" />;
      case 'not_started': return <RadioButtonUnchecked fontSize="small" />;
      default: return null;
    }
  };

  const getPriorityColor = (priority) => {
    const option = PRIORITY_OPTIONS.find(opt => opt.value === priority);
    return option ? option.color : 'default';
  };

  const getPriorityIcon = (priority) => {
    const option = PRIORITY_OPTIONS.find(opt => opt.value === priority);
    return option ? option.icon : <Remove fontSize="small" />;
  };

  const getRiskColor = (riskScore) => {
    if (riskScore >= 4) return 'error';
    if (riskScore >= 2) return 'warning';
    return 'success';
  };

  const formatTimeValue = (seconds) => {
    if (!seconds) return '0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getRiskLabel = (riskScore) => {
    if (riskScore >= 4) return 'High';
    if (riskScore >= 2) return 'Medium';
    return 'Low';
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
  const fetchTeamMembers = async () => {
    try {
      const token = getAuthToken();
      const response = await axiosClient.get(`/user/teams`, {
        headers: { Authorization: `Bearer ${token}` }
      });


      const teams = response?.data?.teams;
      console.log("teams: ", teams);
      const taskProjectId = task?.projectId;
      teams.forEach(team => {
        team.projects.forEach(project =>{
                  

            if(project._id === taskProjectId){
            setTeamMembers(team.members);
            console.log("team.members ", team.members);
          }
        })
      })

    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };
  
useEffect(() => {
  if (expanded || isProjectLead) {
    fetchTeamMembers();
  }
}, [expanded, task.projectId]);

// // Handler for assignee click
// const handleAssigneeClick = (event) => {
//   if (isProjectLead) { // Only project leads can reassign
//     event.stopPropagation();
//     fetchTeamMembers();
//     if (teamMembers){
//       setAssigneeAnchorEl(event.currentTarget);
//     }
    
//   }
// };

// // Handler for assignee selection
// const handleAssigneeSelect = async (member) => {
//   if (onTaskUpdate && isProjectLead) {
//     await onTaskUpdate(task._id, {
//       field: 'assignedTo',
//       value: member ? member._id : null
//     });
//   }
// };

  const formatFullDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch (err) {
      return 'Invalid';
    }
  };

  const calculateDaysUntilDeadline = () => {
    if (!task.deadline) return null;
    const deadline = new Date(task.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = deadline - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateDaysText = () => {
    if (!task.deadline) return 'No deadline';
    const days = calculateDaysUntilDeadline();
    if(task?.status === "completed") return 'Task complete';
    if (task.metrics?.isOverdue) return 'Overdue';
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    if (days > 1) return `${days} days left`;
    return 'Past due';
  };

  // Event handlers
  const handleStatusClick = (event) => {
    event.stopPropagation();
    if(isAssignedUser || isProjectLead){
      setStatusAnchorEl(event.currentTarget);
    }
  };

  const handlePriorityClick = (event) => {
    event.stopPropagation();
    if(isAssignedUser || isProjectLead){
      setPriorityAnchorEl(event.currentTarget);
    }
  };

  const handleStatusSelect = (status) => {
    setStatusAnchorEl(null);
    if (status !== task.status && (isAssignedUser || isProjectLead)) {
      if (onStatusChange) {
        onStatusChange(task._id, status);
      }
      setEditedTask({ ...editedTask, status });
    }
  };

  const handlePrioritySelect = (priority) => {
    setPriorityAnchorEl(null);
    if (priority !== task.priority && (isAssignedUser || isProjectLead)) {
      if (onTaskUpdate) {
        onTaskUpdate(task._id, { field: 'priority', value: priority });
      }
      setEditedTask({ ...editedTask, priority });
    }
  };

  const handleTaskNameClick = (event) => {
    event.stopPropagation();
    if (isAssignedUser || isProjectLead) {
      setIsEditing(true);
    }
  };

  const handleTaskNameBlur = () => {
    setIsEditing(false);
    if (editedTask.taskTitle !== task.taskTitle && (isAssignedUser || isProjectLead)) {
      if (onTaskUpdate) {
        onTaskUpdate(task._id, {
          field: 'taskTitle',
          value: editedTask.taskTitle || ''
        });
      }
    }
  };

  const handleTaskNameChange = (event) => {
    setEditedTask({ ...editedTask, taskTitle: event.target.value });
  };

  const handleDescriptionClick = () => {
    if (isAssignedUser || isProjectLead) {
      setIsEditingDescription(true);
    }
  };

  const handleDescriptionBlur = () => {
    setIsEditingDescription(false);
    if (editedDescription !== task.description && (isAssignedUser || isProjectLead)) {
      if (onTaskUpdate) {
        onTaskUpdate(task._id, {
          field: 'description',
          value: editedDescription || ''
        });
      }
    }
  };

  const handleDescriptionChange = (event) => {
    setEditedDescription(event.target.value);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleTaskNameBlur();
    }
  };

  const handleDueDateClick = (event) => {
    if (isProjectLead || isAssignedUser) {
      setDueDatePickerAnchor(event.currentTarget);
    }
  };

  const handleDateChange = async (date) => {
    try {
      setDueDatePickerAnchor(null);
      if (!(isProjectLead || isAssignedUser)) return;

      let formattedDate;
      if (date instanceof Date) {
        formattedDate = new Date(date);
        formattedDate.setHours(23, 59, 59, 999);
      } else {
        formattedDate = date;
      }

      const updateData = {
        field: 'deadline',
        value: formattedDate ? formattedDate.toISOString() : null
      };

      if (onTaskUpdate) {
        await onTaskUpdate(task._id, updateData);
      }
    } catch (error) {
      console.error('Error updating date:', error);
    }
  };

  const handleRowClick = (event) => {
    if (
      event.target.closest('input[type="checkbox"]') ||
      event.target.closest('button') ||
      event.target.closest('.no-expand')
    ) {
      return;
    }
    setExpanded(!expanded);
  };

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      const token = getAuthToken();
      try {
        const response = await axiosClient.get("/user/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response?.data?.success) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.error(`Error fetching user: ${error}`);
      }
    };
    fetchUser();
  }, []);

  // Check user permissions
  const isAssignedUser = task.assignedTo?._id === user?._id;
  const isProjectLead = task.assignedBy?._id === user?._id;
  const canEdit = isAssignedUser || isProjectLead;

  if (mobile) {
    return (
      <>
        <Box
          onClick={handleRowClick}
          sx={{
            p: 1.75,
            mb: 1.5,
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
            background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.98)} 0%, ${alpha(theme.palette.background.default, 0.55)} 100%)`,
            cursor: 'pointer',
            boxShadow: `0 6px 20px ${alpha(theme.palette.mode === 'dark' ? '#000' : theme.palette.primary.main, 0.08)}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25, mb: 1.25 }}>
            <Checkbox
              checked={isSelected}
              onChange={(e) => onSelect(task._id, e.target.checked)}
              onClick={(e) => e.stopPropagation()}
              size="small"
              sx={{ mt: -0.5 }}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
                <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.3 }}>
                  {task.taskTitle}
                </Typography>
                {task.metrics?.isOverdue && (
                  <Chip label="Overdue" size="small" color="error" sx={{ height: 22, fontWeight: 700 }} />
                )}
              </Box>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', lineHeight: 1.5 }}>
                {task.description || 'No description provided'}
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              sx={{ color: theme.palette.text.secondary }}
            >
              {expanded ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1, mb: 1.25 }}>
            <Box>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mb: 0.45 }}>Status</Typography>
              <Chip
                onClick={handleStatusClick}
                icon={getStatusIcon(task.status)}
                label={STATUS_OPTIONS.find(s => s.value === task.status)?.label}
                color={getStatusColor(task.status)}
                size="small"
                sx={{ width: '100%', justifyContent: 'flex-start', height: 30, fontWeight: 600 }}
              />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mb: 0.45 }}>Priority</Typography>
              <Chip
                onClick={handlePriorityClick}
                icon={getPriorityIcon(task.priority)}
                label={PRIORITY_OPTIONS.find(p => p.value === task.priority)?.label}
                color={getPriorityColor(task.priority)}
                size="small"
                sx={{ width: '100%', justifyContent: 'flex-start', height: 30, fontWeight: 600 }}
              />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mb: 0.45 }}>Assignee</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar src={task.assignedTo?.avatar} sx={{ width: 28, height: 28, fontSize: 12 }}>
                  {task.assignedTo?.name?.charAt(0)}
                </Avatar>
                <Typography variant="body2" fontWeight={500} noWrap>
                  {task.assignedTo?.name || 'Unassigned'}
                </Typography>
              </Box>
            </Box>
            <Box onClick={handleDueDateClick}>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mb: 0.45 }}>Due</Typography>
              <Typography variant="body2" fontWeight={600} color={task.metrics?.isOverdue ? 'error.main' : 'text.primary'}>
                {formatDate(task.deadline)}
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                {calculateDaysText()}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ p: 1.2, borderRadius: 2, backgroundColor: alpha(theme.palette.primary.main, 0.04), border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}` }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.65 }}>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>Efficiency</Typography>
              <Typography variant="caption" fontWeight={700}>
                {Math.round(task.metrics?.efficiency?.percentage || task.metrics?.efficiency || 0)}%
              </Typography>
            </Box>
            <Box sx={{ height: 6, borderRadius: 999, overflow: 'hidden', backgroundColor: alpha(theme.palette.divider, 0.18) }}>
              <Box
                sx={{
                  height: '100%',
                  width: `${Math.min(100, Math.max(0, task.metrics?.efficiency?.percentage || task.metrics?.efficiency || 0))}%`,
                  backgroundColor: getEfficiencyColor(task.metrics?.efficiency?.percentage || task.metrics?.efficiency) === 'error'
                    ? theme.palette.error.main
                    : getEfficiencyColor(task.metrics?.efficiency?.percentage || task.metrics?.efficiency) === 'warning'
                    ? theme.palette.warning.main
                    : theme.palette.success.main,
                }}
              />
            </Box>
          </Box>

          <Box
            sx={{
              mt: 1.1,
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: 1,
            }}
          >
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.info.main, 0.06),
                border: `1px solid ${alpha(theme.palette.info.main, 0.12)}`,
              }}
            >
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mb: 0.35 }}>
                Time
              </Typography>
              <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                {formatTimeValue(task.totalFocusTime)}
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                of {formatTimeValue(task.estimatedTime)}
              </Typography>
            </Box>
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                backgroundColor: alpha(
                  task.metrics?.hasProof ? theme.palette.success.main : theme.palette.warning.main,
                  0.08
                ),
                border: `1px solid ${alpha(
                  task.metrics?.hasProof ? theme.palette.success.main : theme.palette.warning.main,
                  0.16
                )}`,
              }}
            >
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mb: 0.35 }}>
                Proof
              </Typography>
              <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                {task.metrics?.hasProof ? 'Ready' : 'Pending'}
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                {task.metrics?.proofCount || task.proofUploads?.length || 0} file(s)
              </Typography>
            </Box>
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                backgroundColor: alpha(
                  getRiskColor(task.metrics?.riskScore) === 'error'
                    ? theme.palette.error.main
                    : getRiskColor(task.metrics?.riskScore) === 'warning'
                    ? theme.palette.warning.main
                    : theme.palette.success.main,
                  0.08
                ),
                border: `1px solid ${alpha(
                  getRiskColor(task.metrics?.riskScore) === 'error'
                    ? theme.palette.error.main
                    : getRiskColor(task.metrics?.riskScore) === 'warning'
                    ? theme.palette.warning.main
                    : theme.palette.success.main,
                  0.16
                )}`,
              }}
            >
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mb: 0.35 }}>
                Risk
              </Typography>
              <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                {getRiskLabel(task.metrics?.riskScore || 0)}
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                score {task.metrics?.riskScore || 0}
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={1} sx={{ mt: 1.4, flexWrap: 'wrap' }}>
            {isAssignedUser && task.status !== 'completed' && (
              <Button
                size="small"
                variant="outlined"
                onClick={(e) => {
                  e.stopPropagation();
                  if (task.status === 'not_started' || task.status === 'paused') onStatusChange(task._id, 'active');
                  else if (task.status === 'active') onStatusChange(task._id, 'paused');
                }}
              >
                {task.status === 'active' ? 'Pause' : 'Start'}
              </Button>
            )}
            {isAssignedUser && task.status !== 'completed' && (
              <Button
                size="small"
                variant="outlined"
                color="success"
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange(task._id, 'completed');
                }}
              >
                Complete
              </Button>
            )}
            {isAssignedUser && (
              <Button
                size="small"
                variant="outlined"
                onClick={(e) => {
                  e.stopPropagation();
                  onUploadProof(task);
                }}
              >
                Upload Proof
              </Button>
            )}
            <Button
              size="small"
              variant="contained"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(task);
              }}
              sx={{
                ml: 'auto',
                borderRadius: 999,
                px: 1.6,
                minHeight: 34,
              }}
            >
              Full details
            </Button>
          </Stack>

          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ mt: 1.5, pt: 1.5, borderTop: `1px solid ${alpha(theme.palette.divider, 0.16)}` }}>
              <Stack spacing={1.25}>
                <Box
                  sx={{
                    p: 1.2,
                    borderRadius: 2.5,
                    backgroundColor: alpha(theme.palette.background.paper, 0.55),
                    border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                  }}
                >
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mb: 0.85 }}>
                    Overview
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1.1 }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                        Project
                      </Typography>
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {projectName || 'No project'}
                      </Typography>
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                        Assigned by
                      </Typography>
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {task.assignedBy?.name || 'Unknown'}
                      </Typography>
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                        Comments
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {task.commentsCount || task.comments?.length || 0}
                      </Typography>
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                        Completion
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {task.endDate ? formatDate(task.endDate) : 'In progress'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box
                  sx={{
                    p: 1.2,
                    borderRadius: 2.5,
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  }}
                >
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mb: 0.85 }}>
                    Timeline
                  </Typography>
                  <Stack spacing={0.9}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <CalendarToday sx={{ fontSize: 16, color: theme.palette.text.secondary, mt: 0.1 }} />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                          Started
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {formatFullDate(task.startDate || task.createdAt)}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <Schedule sx={{ fontSize: 16, color: theme.palette.text.secondary, mt: 0.1 }} />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                          Deadline
                        </Typography>
                        <Typography variant="body2" fontWeight={600} color={task.metrics?.isOverdue ? 'error.main' : 'text.primary'}>
                          {formatFullDate(task.deadline)}
                        </Typography>
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                          {calculateDaysText()}
                        </Typography>
                      </Box>
                    </Box>
                    {task.endDate && (
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <CheckCircle sx={{ fontSize: 16, color: theme.palette.success.main, mt: 0.1 }} />
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                            Completed
                          </Typography>
                          <Typography variant="body2" fontWeight={600}>
                            {formatFullDate(task.endDate)}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Stack>
                </Box>

                <Box
                  sx={{
                    p: 1.2,
                    borderRadius: 2.5,
                    backgroundColor: alpha(theme.palette.info.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.info.main, 0.12)}`,
                  }}
                >
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mb: 0.85 }}>
                    Time Tracking
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mb: 0.8 }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                        Focus time
                      </Typography>
                      <Typography variant="body2" fontWeight={700}>
                        {formatTimeValue(task.totalFocusTime)}
                      </Typography>
                    </Box>
                    <Box sx={{ minWidth: 0, textAlign: 'right' }}>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
                        Estimated
                      </Typography>
                      <Typography variant="body2" fontWeight={700}>
                        {formatTimeValue(task.estimatedTime)}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ height: 7, borderRadius: 999, overflow: 'hidden', backgroundColor: alpha(theme.palette.info.main, 0.12) }}>
                    <Box
                      sx={{
                        height: '100%',
                        width: `${Math.min(((task.totalFocusTime || 0) / ((task.estimatedTime || 0) || 1)) * 100, 100)}%`,
                        background: `linear-gradient(90deg, ${theme.palette.info.main}, ${theme.palette.info.light})`,
                      }}
                    />
                  </Box>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mt: 0.65 }}>
                    {(((task.totalFocusTime || 0) / ((task.estimatedTime || 0) || 1)) * 100).toFixed(1)}% of planned time used
                  </Typography>
                </Box>

                <Box
                  sx={{
                    p: 1.2,
                    borderRadius: 2.5,
                    backgroundColor: alpha(theme.palette.background.paper, 0.55),
                    border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                  }}
                >
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block', mb: 0.45 }}>
                    Description
                  </Typography>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, lineHeight: 1.6 }}>
                    {task.description || 'No description provided.'}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Collapse>
        </Box>

        {canEdit && (
          <>
            <Menu
              anchorEl={statusAnchorEl}
              open={Boolean(statusAnchorEl)}
              onClose={() => setStatusAnchorEl(null)}
              onClick={(e) => e.stopPropagation()}
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} onClick={() => handleStatusSelect(option.value)} selected={task.status === option.value}>
                  <ListItemIcon>{option.icon}</ListItemIcon>
                  <ListItemText primary={option.label} />
                </MenuItem>
              ))}
            </Menu>
            <Menu
              anchorEl={priorityAnchorEl}
              open={Boolean(priorityAnchorEl)}
              onClose={() => setPriorityAnchorEl(null)}
              onClick={(e) => e.stopPropagation()}
            >
              {PRIORITY_OPTIONS.map((option) => (
                <MenuItem key={option.value} onClick={() => handlePrioritySelect(option.value)} selected={task.priority === option.value}>
                  <ListItemIcon sx={{ color: `${option.color}.main` }}>{option.icon}</ListItemIcon>
                  <ListItemText primary={option.label} />
                </MenuItem>
              ))}
            </Menu>
            <Popover
              open={Boolean(dueDatePickerAnchor)}
              anchorEl={dueDatePickerAnchor}
              onClose={() => setDueDatePickerAnchor(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
              <ClickAwayListener onClickAway={() => setDueDatePickerAnchor(null)}>
                <Box sx={{ p: 2 }}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      value={datePickerValue || (task.deadline ? new Date(task.deadline) : null)}
                      onChange={(date) => {
                        setDatePickerValue(date);
                        if (date) handleDateChange(date);
                      }}
                      slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                    />
                  </LocalizationProvider>
                </Box>
              </ClickAwayListener>
            </Popover>
          </>
        )}
      </>
    );
  }

  return (
    <>
      {/* Main Row */}
      <TableRow
        hover
        selected={isSelected}
        onClick={handleRowClick}
        sx={{
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
          },
          '&.Mui-selected': {
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
          },
          cursor: 'pointer',
          height: '70px',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          transition: 'all 0.2s ease',
        }}
      >
        {/* Checkbox */}
        <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={isSelected}
            onChange={(e) => onSelect(task._id, e.target.checked)}
            size="small"
            sx={{
              '&.Mui-checked': {
                color: theme.palette.primary.main,
              },
            }}
          />
        </TableCell>

        {/* Expand/Collapse Icon */}
        <TableCell padding="none" sx={{ width: 40 }}>
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
            sx={{
              transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)',
              transition: 'transform 0.2s ease',
              color: theme.palette.text.secondary,
            }}
          >
            {expanded ? <ExpandMore /> : <ExpandCircleDown />}
          </IconButton>
        </TableCell>

        {/* Task Name (Editable) */}
        <TableCell>
          <Tooltip title="Edit title">
          <Box
            onClick={handleTaskNameClick}
            sx={{
              cursor: canEdit ? 'text' : 'default',
              '&:hover .edit-indicator': {
                opacity: canEdit ? 1 : 0,
              },
            }}
          >
            {isEditing && canEdit ? (
              <TextField
                value={editedTask.taskTitle}
                onChange={handleTaskNameChange}
                onBlur={handleTaskNameBlur}
                onKeyPress={handleKeyPress}
                autoFocus
                variant="standard"
                fullWidth
                InputProps={{
                  disableUnderline: true,
                }}
                sx={{
                  '& .MuiInputBase-input': {
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    padding: 0,
                  },
                }}
              />
            ) : (
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography
                  variant="body2"
                  fontWeight="500"
                  sx={{
                    color: theme.palette.text.primary,
                    '&:hover': { color: canEdit ? theme.palette.primary.main : 'inherit' },
                  }}
                >
                  {task.taskTitle}
                </Typography>
                {canEdit && (
                  <Edit
                    className="edit-indicator"
                    fontSize="small"
                    sx={{
                      opacity: 0,
                      fontSize: 14,
                      color: theme.palette.text.secondary,
                      transition: 'opacity 0.2s ease',
                    }}
                  />
                )}
              </Stack>
            )}
            {task.metrics?.isOverdue && (
              <Chip
                label="OVERDUE"
                size="small"
                color="error"
                sx={{
                  mt: 0.5,
                  height: 20,
                  fontSize: '0.675rem',
                  fontWeight: 600,
                }}
              />
            )}
          </Box>
          </Tooltip>
        </TableCell>

        {/* Status (Editable) */}
        {showProjectColumn && (
          <TableCell>
            <Typography
              variant="body2"
              fontWeight="500"
              sx={{ color: theme.palette.text.secondary }}
            >
              {projectName || 'No project'}
            </Typography>
          </TableCell>
        )}

        <TableCell>
          <Box
            onClick={handleStatusClick}
            sx={{
              cursor: canEdit ? 'pointer' : 'default',
              display: 'inline-block',
              '&:hover .status-chip': {
                backgroundColor: canEdit ? alpha(theme.palette.primary.main, 0.08) : 'inherit',
              },
            }}
          >
            <Chip
              className="status-chip"
              icon={getStatusIcon(task.status)}
              label={STATUS_OPTIONS.find(s => s.value === task.status)?.label}
              color={getStatusColor(task.status)}
              size="small"
              sx={{
                minWidth: 100,
                height: 28,
                borderRadius: 1.5,
                fontWeight: 500,
                transition: 'all 0.2s ease',
              }}
            />
          </Box>
          {canEdit && (
            <Menu
              anchorEl={statusAnchorEl}
              open={Boolean(statusAnchorEl)}
              onClose={() => setStatusAnchorEl(null)}
              onClick={(e) => e.stopPropagation()}
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem
                  key={option.value}
                  onClick={() => handleStatusSelect(option.value)}
                  selected={task.status === option.value}
                >
                  <ListItemIcon>{option.icon}</ListItemIcon>
                  <ListItemText primary={option.label} />
                </MenuItem>
              ))}
            </Menu>
          )}
        </TableCell>

        {/* Assignee */}
        <TableCell >
          <Box display="flex" alignItems="center" gap={1} >
            <Badge
              variant="dot"
              color="success"
              invisible={!isAssignedUser}
            >
              <Avatar
                src={task.assignedTo?.avatar}
                sx={{
                  width: 32,
                  height: 32,
                  fontSize: 14,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                }}
                // onClick={(e) => {
                  
                //   if(canEdit){
                //     handleAssigneeClick(e);
                //   }
                // }}
              >
                {task.assignedTo?.name?.charAt(0)}
              </Avatar>
            </Badge>
            <Typography variant="body2" color="text.secondary">
              {task.assignedTo?.name?.split(' ')[0] || 'Unassigned'}
            </Typography>
          </Box>
        
        </TableCell>


        {/* Priority (Editable) */}
        <TableCell>
          <Tooltip title='Click to edit priority'>
                      <Box
            onClick={handlePriorityClick}
            sx={{
              cursor: canEdit ? 'pointer' : 'default',
              display: 'inline-block',
              '&:hover .priority-chip': {
                transform: canEdit ? 'scale(1.02)' : 'none',
              },
            }}
          >
            <Chip
              className="priority-chip"
              icon={getPriorityIcon(task.priority)}
              label={PRIORITY_OPTIONS.find(p => p.value === task.priority)?.label}
              color={getPriorityColor(task.priority)}
              size="small"
              sx={{
                minWidth: 90,
                height: 28,
                borderRadius: 1.5,
                fontWeight: 500,
                transition: 'transform 0.2s ease',
              }}
            />
          </Box>
          </Tooltip>
          {canEdit && (
            <Menu
              anchorEl={priorityAnchorEl}
              open={Boolean(priorityAnchorEl)}
              onClose={() => setPriorityAnchorEl(null)}
              onClick={(e) => e.stopPropagation()}
            >
              {PRIORITY_OPTIONS.map((option) => (
                <MenuItem
                  key={option.value}
                  onClick={() => handlePrioritySelect(option.value)}
                  selected={task.priority === option.value}
                >
                  <ListItemIcon sx={{ color: `${option.color}.main` }}>
                    {option.icon}
                  </ListItemIcon>
                  <ListItemText primary={option.label} />
                </MenuItem>
              ))}
            </Menu>
          )}
        </TableCell>

        {/* Due Date (Editable) */}
        <TableCell onClick={handleDueDateClick}>
          <Tooltip title='Click to edit due date' >
                      <Box
            sx={{
              cursor: canEdit ? 'pointer' : 'default',
              '&:hover .due-date-content': {
                transform: canEdit ? 'translateX(2px)' : 'none',
              },
            }}
          >
            <Box className="due-date-content" sx={{ transition: 'transform 0.2s ease' }}>
              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.25 }}>
                <Schedule fontSize="small" sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                <Typography
                  variant="body2"
                  fontWeight="500"
                  color={task.metrics?.isOverdue ? 'error.main' : 'text.primary'}
                >
                  {formatDate(task.deadline)}
                </Typography>
              </Stack>
              <Chip
                label={calculateDaysText()}
                size="small"
                color={task.metrics?.isOverdue 
                        ? 'error' 
                        : task?.status === 'completed' 
                          ? 'success' 
                          : 'default'}
                variant={task.metrics?.isOverdue ? 'filled' : 'outlined'}
                sx={{
                  height: 20,
                  fontSize: '0.675rem',
                  fontWeight: 500,
                  borderRadius: 1,
                }}
              />
            </Box>
          </Box>
          </Tooltip>

          {/* Date Picker Popover */}
          {canEdit && (
            <Popover
              open={Boolean(dueDatePickerAnchor)}
              anchorEl={dueDatePickerAnchor}
              onClose={() => setDueDatePickerAnchor(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
              <ClickAwayListener onClickAway={() => setDueDatePickerAnchor(null)}>
                <Box sx={{ p: 2 }}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      value={datePickerValue || (task.deadline ? new Date(task.deadline) : null)}
                      onChange={(date) => {
                        setDatePickerValue(date);
                        if (date) handleDateChange(date);
                      }}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: 'small',
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Box>
              </ClickAwayListener>
            </Popover>
          )}
        </TableCell>

        {/* Efficiency */}
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Circular Data Visualization */}
            <Box sx={{ position: 'relative', width: 40, height: 40 }}>
              {/* Background circle */}
              <Box
                sx={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  border: `2px solid ${alpha(theme.palette.divider, 0.3)}`,
                }}
              />
              
              {/* Efficiency arc */}
              <Box
                sx={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  border: `2px solid transparent`,
                  borderTopColor: getEfficiencyColor(task.metrics?.efficiency?.percentage || task.metrics?.efficiency) === 'error'
                    ? theme.palette.error.main
                    : getEfficiencyColor(task.metrics?.efficiency?.percentage || task.metrics?.efficiency) === 'warning'
                    ? theme.palette.warning.main
                    : theme.palette.success.main,
                  borderRightColor: (task.metrics?.efficiency?.percentage || task.metrics?.efficiency || 0) >= 25
                    ? getEfficiencyColor(task.metrics?.efficiency?.percentage || task.metrics?.efficiency) === 'error'
                      ? theme.palette.error.main
                      : getEfficiencyColor(task.metrics?.efficiency?.percentage || task.metrics?.efficiency) === 'warning'
                      ? theme.palette.warning.main
                      : theme.palette.success.main
                    : 'transparent',
                  borderBottomColor: (task.metrics?.efficiency?.percentage || task.metrics?.efficiency || 0) >= 50
                    ? getEfficiencyColor(task.metrics?.efficiency?.percentage || task.metrics?.efficiency) === 'error'
                      ? theme.palette.error.main
                      : getEfficiencyColor(task.metrics?.efficiency?.percentage || task.metrics?.efficiency) === 'warning'
                      ? theme.palette.warning.main
                      : theme.palette.success.main
                    : 'transparent',
                  borderLeftColor: (task.metrics?.efficiency?.percentage || task.metrics?.efficiency || 0) >= 75
                    ? getEfficiencyColor(task.metrics?.efficiency?.percentage || task.metrics?.efficiency) === 'error'
                      ? theme.palette.error.main
                      : getEfficiencyColor(task.metrics?.efficiency?.percentage || task.metrics?.efficiency) === 'warning'
                      ? theme.palette.warning.main
                      : theme.palette.success.main
                    : 'transparent',
                  transform: 'rotate(-45deg)',
                  transition: 'all 0.5s ease',
                }}
              />
              
              {/* Center percentage */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    color: getEfficiencyColor(task.metrics?.efficiency?.percentage || task.metrics?.efficiency) === 'error'
                      ? theme.palette.error.main
                      : getEfficiencyColor(task.metrics?.efficiency?.percentage || task.metrics?.efficiency) === 'warning'
                      ? theme.palette.warning.main
                      : theme.palette.success.main,
                  }}
                >
                  {Math.round(task.metrics?.efficiency?.percentage || task.metrics?.efficiency || 0)}%
                </Typography>
              </Box>
              
              {/* Active indicator */}
              {task.status === "active" && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: -2,
                    right: -2,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: theme.palette.primary.main,
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { 
                        transform: 'scale(1)',
                        opacity: 1,
                      },
                      '50%': { 
                        transform: 'scale(1.5)',
                        opacity: 0.5,
                      },
                    },
                  }}
                />
              )}
            </Box>

            {/* Efficiency Rating Text */}
            <Box sx={{ minWidth: 60 }}>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  color: getEfficiencyColor(task.metrics?.efficiency?.percentage || task.metrics?.efficiency) === 'error'
                    ? theme.palette.error.main
                    : getEfficiencyColor(task.metrics?.efficiency?.percentage || task.metrics?.efficiency) === 'warning'
                    ? theme.palette.warning.main
                    : theme.palette.success.main,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                {task.status === "active" ? "Live" : 
                (task.metrics?.efficiency?.percentage || task.metrics?.efficiency) >= 90 ? "Optimal" :
                (task.metrics?.efficiency?.percentage || task.metrics?.efficiency) >= 75 ? "High" :
                (task.metrics?.efficiency?.percentage || task.metrics?.efficiency) >= 60 ? "Good" :
                (task.metrics?.efficiency?.percentage || task.metrics?.efficiency) >= 40 ? "Fair" :
                (task.metrics?.efficiency?.percentage || task.metrics?.efficiency) >= 20 ? "Low" : "Poor"}
              </Typography>
              
              {/* Trend indicator */}
              {task.metrics?.efficiency?.trend && (
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    fontSize: '0.6rem',
                    color: task.metrics.efficiency.trend > 0
                      ? theme.palette.success.main
                      : task.metrics.efficiency.trend < 0
                      ? theme.palette.error.main
                      : theme.palette.text.secondary,
                    fontWeight: 500,
                  }}
                >
                  {task.metrics.efficiency.trend > 0 ? '↗' : 
                  task.metrics.efficiency.trend < 0 ? '↘' : '→'} 
                  {Math.abs(task.metrics.efficiency.trend)}%
                </Typography>
              )}
            </Box>
          </Box>
        </TableCell>

        {/* Quick Actions */}
        <TableCell onClick={(e) => e.stopPropagation()}>
          <Stack direction="row" spacing={0.5}>
            {isAssignedUser && task.status !== 'completed' && (
              <>
                <Tooltip title={task.status === 'not_started' ? "Start Task" : 
                              task.status === 'active' ? "Pause Task" : "Resume Task"}>
                  <IconButton
                    size="small"
                    onClick={() => {
                      if (task.status === 'not_started') {
                        onStatusChange(task._id, 'active');
                      } else if (task.status === 'active') {
                        onStatusChange(task._id, 'paused');
                      } else if (task.status === 'paused') {
                        onStatusChange(task._id, 'active');
                      }
                    }}
                  >
                    {task.status === 'not_started' || task.status === 'paused' ? 
                      <PlayArrow fontSize="small" /> : <Pause fontSize="small" />}
                  </IconButton>
                </Tooltip>

                <Tooltip title="Complete Task">
                  <IconButton
                    size="small"
                    onClick={() => onStatusChange(task._id, 'completed')}
                  >
                    <CheckCircle fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
            {isAssignedUser && (
              <Tooltip title="Upload Proof">
                <IconButton
                  size="small"
                  onClick={() => onUploadProof(task)}
                >
                  <Upload fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </TableCell>
      </TableRow>

      {/* Expanded Details Row */}
      <TableRow>
        <TableCell colSpan={showProjectColumn ? 10 : 9} sx={{ p: 0, borderBottom: expanded ? `1px solid ${alpha(theme.palette.divider, 0.3)}` : 0 }}>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box sx={{ 
              p: 3, 
              backgroundColor: alpha(theme.palette.background.default, 0.5),
              borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}>
              <Box sx={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {/* Left Column - Task Details */}
                <Box sx={{ flex: 1, minWidth: 300 }}>
                  <Stack spacing={2}>
                    {/* Description (Editable) */}
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Description fontSize="small" sx={{ mr: 1, color: theme.palette.text.secondary }} />
                        <Typography variant="subtitle2" fontWeight={600}>
                          Description
                        </Typography>
                        {canEdit && (
                          <IconButton
                            size="small"
                            onClick={handleDescriptionClick}
                            sx={{ ml: 1, opacity: 0.6, '&:hover': { opacity: 1 } }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                      {isEditingDescription && canEdit ? (
                        <TextField
                          value={editedDescription}
                          onChange={handleDescriptionChange}
                          onBlur={handleDescriptionBlur}
                          multiline
                          rows={3}
                          fullWidth
                          variant="outlined"
                          size="small"
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ 
                          p: 1.5, 
                          borderRadius: 1,
                          backgroundColor: alpha(theme.palette.background.paper, 0.5),
                          minHeight: 80,
                          cursor: canEdit ? 'text' : 'default',
                          '&:hover': {
                            backgroundColor: canEdit ? alpha(theme.palette.action.hover, 0.05) : 'inherit',
                          }
                        }}>
                          {task.description || 'No description provided. Click to add one.'}
                        </Typography>
                      )}
                    </Box>

                    {/* Timeline */}
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        <AccessTime fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Timeline
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            Start Date:
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {formatFullDate(task.startDate || task.createdAt)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            Deadline:
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" fontWeight={500}>
                              {formatFullDate(task.deadline)}
                            </Typography>
                            {task.deadline && (
                              <Chip
                                label={calculateDaysText()}
                                size="small"
                                color={task.metrics?.isOverdue ? 'error' : 'default'}
                              />
                            )}
                          </Box>
                        </Box>
                        {task.endDate && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="text.secondary">
                              Completed On:
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                              {formatFullDate(task.endDate)}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>


                    <TaskMetricsPanel
                      task={task}
                      open={metricsOpen}
                      onClose={() => setMetricsOpen(false)}
                      theme={theme}
                    />

                    {/* Assigned Information */}
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        <PersonAddAlt fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Assignment
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 3 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Assigned To
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Avatar
                              src={task.assignedTo?.avatar}
                              sx={{ width: 32, height: 32 }}
                            />
                            <Typography variant="body2">
                              {task.assignedTo?.name || 'Unassigned'}
                            </Typography>
                          </Box>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Assigned By
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Avatar
                              src={task.assignedBy?.avatar}
                              sx={{ width: 32, height: 32 }}
                            />
                            <Typography variant="body2">
                              {task.assignedBy?.name || 'Unknown'}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </Stack>
                </Box>

                {/* Divider */}
                <Divider orientation="vertical" flexItem />

                {/* Right Column - Metrics and Actions */}
                <Box sx={{ flex: 1, minWidth: 300 }}>
                  <Stack spacing={2}>
                    {/* Metrics */}
<Box>
  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
    <Assignment fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
    Metrics
  </Typography>

  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: 2,
    }}
  >
    {/* Efficiency – Hero Card */}
    <Box
      sx={{
        gridColumn: '1 / -1',
        p: 2,
        borderRadius: 2,
        backgroundColor: alpha(theme.palette.background.paper, 0.6),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Speed fontSize="small" />
        <Typography variant="body2" fontWeight={600}>
          Efficiency Score
        </Typography>
      </Box>

      <Box sx={{ position: 'relative', width: 70, height: 70 }}>
        <CircularProgress
          variant="determinate"
          value={Math.min(task.metrics?.efficiency || 0, 100)}
          size={70}
          thickness={4}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography fontWeight={600}>
            {Math.round(task.metrics?.efficiency || 0)}%
          </Typography>
        </Box>
      </Box>
    </Box>

    {/* Risk Level */}
    <MetricCard
      icon={<Security fontSize="small" />}
      label="Risk"
    >
      <Chip
        label={
          task.metrics?.riskScore >= 4
            ? 'HIGH'
            : task.metrics?.riskScore >= 2
            ? 'MEDIUM'
            : 'LOW'
        }
        color={getRiskColor(task.metrics?.riskScore)}
        size="small"
        sx={{ fontWeight: 600 }}
      />
    </MetricCard>

    {/* Comments */}
    <MetricCard
      icon={<Chat fontSize="small" />}
      label="Comments"
    >
      <Chip
        label={task.commentsCount || 0}
        variant="outlined"
        size="small"
      />
    </MetricCard>

    {/* Proof */}
    <MetricCard
      icon={<AttachFile fontSize="small" />}
      label="Proof"
    >
      <Chip
        icon={
          task.metrics?.hasProof ? (
            <CheckCircle fontSize="small" />
          ) : (
            <Warning fontSize="small" />
          )
        }
        label={task.metrics?.hasProof ? 'Submitted' : 'Pending'}
        color={task.metrics?.hasProof ? 'success' : 'error'}
        variant="outlined"
        size="small"
      />
    </MetricCard>
  </Box>
</Box>


                    {/* Quick Actions */}
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                        Quick Actions
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {isAssignedUser && task.status !== 'completed' && (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Upload />}
                            onClick={() => onUploadProof(task)}
                            className="no-expand"
                          >
                            Upload Proof
                          </Button>
                        )}
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => onViewDetails(task)}
                          className="no-expand"
                        >
                          View Full Details
                        </Button>
                      </Box>
                    </Box>
                  </Stack>
                </Box>
              </Box>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export default TaskTableRow;
