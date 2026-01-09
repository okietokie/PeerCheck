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
  Flag,
  Close,
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
  ClickAwayListener
} from '@mui/material';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { getAuthToken } from "@/utils/auth";
import axiosClient from "@/api/axiosClient";

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
  onTaskUpdate
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState({ ...task });
  const [statusAnchorEl, setStatusAnchorEl] = useState(null);
  const [priorityAnchorEl, setPriorityAnchorEl] = useState(null);
  const [dueDatePickerAnchor, setDueDatePickerAnchor] = useState(null);
  const [datePickerValue, setDatePickerValue] = useState();
  const [user, setUser] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const navigate = useNavigate();

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'active': return 'info';
      case 'paused': return 'warning';
      case 'not_started': return 'default';
      default: return 'default';
    }
  };

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


  const calculateDaysUntilDeadline = () => {
    if (!task.deadline) return null;

    const deadline = new Date(task.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = deadline - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateDaysText = (deadline) => {
    if (!deadline) return 'No deadline';

    const days = calculateDaysUntilDeadline();

    if (task.metrics?.isOverdue) {
      return 'Overdue';
    } else if (days === 0) {
      return 'Due today';
    } else if (days === 1) {
      return 'Due tomorrow';
    } else if (days > 1) {
      return `${days} days left`;
    } else {
      return 'Past due';
    }
  };

  const handleStatusClick = (event) => {
    event.stopPropagation();
    if(isAssignedUser){
      setStatusAnchorEl(event.currentTarget);
    }
    
  };

  const handlePriorityClick = (event) => {
    event.stopPropagation();
    if(isAssignedUser){
      setPriorityAnchorEl(event.currentTarget);
    }
  };

  const handleStatusSelect = (status) => {
    setStatusAnchorEl(null);
    if (status !== task.status) {
      if (onStatusChange) {
        onStatusChange(task._id, status);
      }
      setEditedTask({ ...editedTask, status });
    }
  };

  const handlePrioritySelect = (priority) => {
    setPriorityAnchorEl(null);
    if (priority !== task.priority) {
      if (onTaskUpdate) {
        onTaskUpdate(task._id, { field: 'priority', value: priority });
      }
      setEditedTask({ ...editedTask, priority });
    }
  };

  const handleTaskNameClick = (event) => {
    event.stopPropagation();
    setIsEditing(true);
  };

  const handleTaskNameBlur = () => {
    setIsEditing(false);
    if (editedTask.taskTitle !== task.taskTitle) {
      if (onTaskUpdate) {
        onTaskUpdate(task._id, {
          field: 'taskTitle',
          value: editedTask.taskTitle || ''
        });
      }
    }
  };

  const handleTaskNameChange = (event) => {
    event.stopPropagation();
    setEditedTask({ ...editedTask, taskTitle: event.target.value });
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleTaskNameBlur();
    }
  };

  const handleDueDateClick = (event) => {
    event.stopPropagation();
    setDueDatePickerAnchor(event.currentTarget);
  };

  const handleDateChange = async (field, date) => {
    try {
      setDueDatePickerAnchor(null);

      let formattedDate;
      if (date instanceof Date) {
        formattedDate = new Date(date);
        if (field === 'deadline') {
          formattedDate.setHours(23, 59, 59, 999);
        }
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

  const isAssignedUser = task.assignedTo?._id === userRole?.userId;

  return (
  <>
    <TableRow
      hover
      selected={isSelected}
      sx={{
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.04),
          '& .task-actions': { opacity: 1 },
        },
        '&.Mui-selected': {
          backgroundColor: alpha(theme.palette.primary.main, 0.08),
        },
        cursor: 'pointer',
        height: '72px',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
        transition: 'all 0.2s ease',
      }}
      onClick={() => onViewDetails(task)}
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

      {/* Task Name */}
      <TableCell>
        <Box
          onClick={handleTaskNameClick}
          sx={{
            cursor: 'text',
            '&:hover .edit-indicator': {
              opacity: 1,
            },
          }}
        >
          {isEditing && isAssignedUser ? (
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
                  '&:hover': { color: theme.palette.primary.main },
                }}
              >
                {task.taskTitle}
              </Typography>
                {isAssignedUser && (
                                <Edit
                                className="edit-indicator"
                                fontSize="small"
                                sx={{
                                  opacity: 0,
                                  fontSize: 14,
                                  color: theme.palette.text.secondary,
                                  transition: 'opacity 0.2s ease',
                                  cursor: 'pointer',
                                  '&:hover': {
                                    cursor: 'grab'
                                  },
                                  '&:active': {
                                    cursor: 'grabbing'
                                  }

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
      </TableCell>

      {/* Status */}
      <TableCell>
        <Box
          onClick={handleStatusClick}
          sx={{
            cursor: 'pointer',
            display: 'inline-block',
            '&:hover .status-chip': {
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
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
        <Menu
          anchorEl={statusAnchorEl}
          open={Boolean(statusAnchorEl)}
          onClose={() => setStatusAnchorEl(null)}
          onClick={(e) => e.stopPropagation()}
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              mt: 0.5,
            },
          }}
        >
          {STATUS_OPTIONS.map((option) => (
            <MenuItem
              key={option.value}
              onClick={() => handleStatusSelect(option.value)}
              selected={task.status === option.value}
              sx={{
                borderRadius: 1,
                mx: 1,
                my: 0.25,
                '&.Mui-selected': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                {option.icon} 
              </ListItemIcon>
              <ListItemText
                primary={isAssignedUser ? `${option.label}` : `${option.label}` }
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              />
              
            </MenuItem>
          ))}
        </Menu>
      </TableCell>

      {/* Assignee */}
      <TableCell>
        <Box display="flex" alignItems="center" gap={1}>
          <Badge
            variant="dot"
            color="success"
            invisible={!isAssignedUser}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
          >
            <Avatar
              src={task.assignedTo?.avatar}
              sx={{
                width: 32,
                height: 32,
                fontSize: 14,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              {task.assignedTo?.name?.charAt(0)}
            </Avatar>
          </Badge>
          <Typography variant="body2" color="text.secondary">
            {task.assignedTo?.name?.split(' ')[0] || 'Unassigned'}
          </Typography>
        </Box>
      </TableCell>

      {/* Start Date */}
      <TableCell>
        <Box>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <CalendarToday fontSize="small" sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
            <Typography variant="body2" fontWeight="500">
              {formatDate(task.startDate || task.createdAt)}
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Start date
          </Typography>
        </Box>
      </TableCell>

      {/* Due Date */}
      <TableCell onClick={handleDueDateClick}>
        <Box
          sx={{
            cursor: 'pointer',
            '&:hover': {
              '& .due-date-content': {
                transform: 'translateX(2px)',
              },
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
              label={calculateDaysText(task.deadline)}
              size="small"
              color={task.metrics?.isOverdue ? 'error' : 'default'}
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


      </TableCell>
              {/* Date Picker Popover */}
        {
          isAssignedUser && (
            <Popover
              open={Boolean(dueDatePickerAnchor)}
              anchorEl={dueDatePickerAnchor}
              onClose={() => setDueDatePickerAnchor(null)}
              disableRestoreFocus //focuses on bouncing back
              anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
              transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              PaperProps={{
                sx: {
                  width: 340,
                  borderRadius: 3,
                  boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                  overflow: 'hidden',
                },
              }}
            >
              <ClickAwayListener onClickAway={() => setDueDatePickerAnchor(null)}>
              <Box sx={{ p: 3 }}>
                
                {/* Header */}
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 2 }}
                >
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Set Due Date
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {task.taskTitle}
                    </Typography>
                  </Box>

                  <IconButton
                    size="small"
                    onClick={() => setDueDatePickerAnchor(null)}
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.error.main, 0.08),
                        color: theme.palette.error.main,
                      },
                    }}
                  >
                    <Close />
                  </IconButton>
                </Stack>

                {/* Date Picker */}
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    value={datePickerValue || (task.deadline ? new Date(task.deadline) : null)}
                    onChange={(date) => setDatePickerValue(date)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'medium',
                        autoFocus: true,
                        sx: {
                          mb: 2.5,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          },
                        },
                      },
                    }}
                  />
                </LocalizationProvider>

                {/* Quick Select Buttons */}
                <Stack direction="row" spacing={1} sx={{ mb: 2.5 }}>
                  {[
                    { label: 'Today', days: 0 },
                    { label: 'Tomorrow', days: 1 },
                    { label: 'Next Week', days: 7 },
                  ].map((option) => (
                    <Button
                      key={option.label}
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        const date = new Date();
                        date.setDate(date.getDate() + option.days);
                        date.setHours(23, 59, 59, 999);
                        setDatePickerValue(date);
                      }}
                      sx={{
                        flex: 1,
                        borderRadius: 2,
                        py: 1,
                        fontSize: '0.75rem',
                        textTransform: 'none',
                      }}
                    >
                      {option.label}
                    </Button>
                  ))}
                </Stack>

                {/* Actions */}
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => {
                      if (datePickerValue) {
                        handleDateChange('deadline', datePickerValue);
                      }
                      setDueDatePickerAnchor(null);
                    }}
                    sx={{
                      textTransform: 'none',
                      borderRadius: 2,
                      px: 2.5,
                    }}
                  >
                    Apply
                  </Button>
                </Stack>
              </Box>
              </ClickAwayListener>
            </Popover>

          )
        }

      {/* Priority */}
      <TableCell>
        <Box
          onClick={handlePriorityClick}
          sx={{
            cursor: 'pointer',
            display: 'inline-block',
            '&:hover .priority-chip': {
              transform: 'scale(1.02)',
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
        <Menu
          anchorEl={priorityAnchorEl}
          open={Boolean(priorityAnchorEl)}
          onClose={() => setPriorityAnchorEl(null)}
          onClick={(e) => e.stopPropagation()}
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              mt: 0.5,
            },
          }}
        >
          {PRIORITY_OPTIONS.map((option) => (
            <MenuItem
              key={option.value}
              onClick={() => handlePrioritySelect(option.value)}
              selected={task.priority === option.value}
              sx={{
                borderRadius: 1,
                mx: 1,
                my: 0.25,
                '&.Mui-selected': {
                  backgroundColor: alpha(theme.palette[option.color].main, 0.08),
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36, color: `${option.color}.main` }}>
                {option.icon}
              </ListItemIcon>
              <ListItemText
                primary={option.label}
                primaryTypographyProps={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              />
            </MenuItem>
          ))}
        </Menu>
      </TableCell>

      {/* Comments */}
      <TableCell>
        <IconButton
          size="small"
          sx={{
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
            },
          }}
        >
          <Badge
            badgeContent={task.commentsCount || 0}
            color="primary"
            max={9}
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.6rem',
                height: 18,
                minWidth: 18,
              },
            }}
          >
            <ChatBubbleOutline
              fontSize="small"
              sx={{ color: theme.palette.text.secondary }}
            />
          </Badge>
        </IconButton>
      </TableCell>

      {/* Efficiency */}
      <TableCell>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Speed
            fontSize="small"
            sx={{
              color: getEfficiencyColor(task.taskMetrics?.efficiency?.percentage) === 'error'
                ? theme.palette.error.main
                : getEfficiencyColor(task.taskMetrics?.efficiency?.percentage) === 'warning'
                ? theme.palette.warning.main
                : theme.palette.success.main,
            }}
          />
          <Box sx={{ position: 'relative', width: 40, height: 40 }}>
            {task.status === "active" ? (
              <CircularProgress
                size={40}
                thickness={4}
                sx={{
                  color: theme.palette.primary.main,
                }}
              />
            ) : (
              <>
                <CircularProgress
                  variant="determinate"
                  value={Math.min(task.taskMetrics?.efficiency || 0, 100)}
                  size={40}
                  thickness={4}
                  sx={{
                    color: getEfficiencyColor(task.taskMetrics?.efficiency) === 'error'
                      ? theme.palette.error.main
                      : getEfficiencyColor(task.taskMetrics?.efficiency) === 'warning'
                      ? theme.palette.warning.main
                      : theme.palette.success.main,
                  }}
                />
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
                  <Typography variant="caption" fontWeight="600">
                    {Math.round(task.taskMetrics?.efficiency || 0)}%
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        </Stack>
      </TableCell>

      {/* Risk Level */}
      <TableCell>
        <Chip
          label={task.metrics?.riskScore >= 4 ? 'HIGH' :
            task.metrics?.riskScore >= 2 ? 'MEDIUM' : 'LOW'}
          color={getRiskColor(task.metrics?.riskScore)}
          size="small"
          icon={<Security fontSize="small" />}
          sx={{
            height: 24,
            fontSize: '0.75rem',
            fontWeight: 500,
            borderRadius: 1,
          }}
        />
      </TableCell>

      {/* Proof Indicator */}
      <TableCell>
        <Tooltip title={task.metrics?.hasProof ? "Proof submitted" : "No proof"}>
          <Badge
            badgeContent={task.metrics?.proofCount}
            color={task.metrics?.hasProof ? "success" : "error"}
            max={9}
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.6rem',
                height: 18,
                minWidth: 18,
              },
            }}
          >
            {task.metrics?.hasProof ? (
              <CheckCircle
                fontSize="small"
                sx={{ color: theme.palette.success.main }}
              />
            ) : (
              <Warning
                fontSize="small"
                sx={{ color: theme.palette.error.main }}
              />
            )}
          </Badge>
        </Tooltip>
      </TableCell>

      {/* Actions */}
      <TableCell onClick={(e) => e.stopPropagation()}>
        <Stack direction="row" spacing={0.5} className="task-actions" sx={{ opacity: 0.6, transition: 'opacity 0.2s' }}>
          {isAssignedUser && task.status !== 'completed' && (
            <>
              {task.status === 'not_started' && (
                <Tooltip title="Start Task">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStatusChange(task._id, 'active');
                    }}
                    sx={{
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.success.main, 0.1),
                        color: theme.palette.success.main,
                      },
                    }}
                  >
                    <PlayArrow fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              {(task.status === 'active' || task.status === 'paused') && (
                <>
                  <Tooltip title={task.status === 'active' ? "Pause Task" : "Resume Task"}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStatusChange(task._id, task.status === 'active' ? 'paused' : 'active');
                      }}
                      sx={{
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.warning.main, 0.1),
                          color: theme.palette.warning.main,
                        },
                      }}
                    >
                      {task.status === 'active' ? <Pause fontSize="small" /> : <PlayArrow fontSize="small" />}
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Complete Task">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStatusChange(task._id, 'completed');
                      }}
                      sx={{
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.success.main, 0.1),
                          color: theme.palette.success.main,
                        },
                      }}
                    >
                      <CheckCircle fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </>
              )}

              <Tooltip title="Upload Proof">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUploadProof(task);
                  }}
                  sx={{
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                      color: theme.palette.secondary.main,
                    },
                  }}
                >
                  <Upload fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Stack>
      </TableCell>
    </TableRow>


  </>
  );
};

export default TaskTableRow;