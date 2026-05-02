// useMyProject.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosClient from '@/api/axiosClient';
import { format } from 'date-fns';
import { getUserData as getUserDataUtils } from '@/utils/user.js';
import StatCardComponent from '@/Components/user-dashboard/ProjectComponents/StatCard.jsx';

// Helper functions
const getAuthToken = () => {
  return localStorage.getItem('token');
};

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

const useMyProject = (projectId, navigate, theme) => {
  // State
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');
  const [user, setUser] = useState(null);
  const [members, setMembers] = useState([]);
  const [activeMemberCount, setActiveMemberCount] = useState(0);
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [teams, setTeams] = useState(null);
  const [projectCompleted, setProjectCompleted] = useState(false);
  const [selectedTaskForProof, setSelectedTaskForProof] = useState(null);
  const [uploadProofOpen, setUploadProofOpen] = useState(false);
  const [peerReviews, setPeerReviews] = useState([]);
  const [aggregatedScores, setAggregatedScores] = useState(null);
  const [userPeerScore, setUserPeerScore] = useState(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedReviewee, setSelectedReviewee] = useState(null);
  const [reviewScores, setReviewScores] = useState({
    contribution: 5,
    collaboration: 5,
    quality: 5,
    punctuality: 5
  });
  const [reviewComment, setReviewComment] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [addMemberDialog, setAddMemberDialog] = useState(false);
  const [projectFiles, setProjectFiles] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [selectedTask, setSelectedTask] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [sortBy, setSortBy] = useState('deadline');
  const [filters, setFilters] = useState({
    status: 'all',
    riskLevel: 'all',
    hasProof: 'all',
    isOverdue: false
  });
  const [userRole, setUserRole] = useState(null);
  const [userTeacher, setUserTeacher] = useState(false);
  const [memberEfficiencies, setMemberEfficiencies] = useState({});
  const [overallEfficiency, setOverallEfficiency] = useState(null);
  const [projectMetrics, setProjectMetrics] = useState(null);
  const [stickyNotes, setStickyNotes] = useState([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [showNewNoteDialog, setShowNewNoteDialog] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [completionStatus, setCompletionStatus] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState(null);
  // Show snackbar message
  const showSnackbar = useCallback((message, severity = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  }, []);

  // Theme color helpers
  const getThemeColor = useCallback((colorType = 'primary', variant = 'main') => {
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
  }, [theme]);

  const getContrastColor = useCallback((backgroundColor) => {
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
  }, []);

  const getGradientBackground = useCallback(() => {
    if (theme.palette.mode === 'dark') {
      return `linear-gradient(135deg, 
        ${theme.palette.primary.main}15 0%, 
        ${theme.palette.secondary.main}08 50%, 
        ${theme.palette.background.default}95 100%
      )`;
    }
    return `linear-gradient(135deg, 
      ${theme.palette.primary.main}08 0%, 
      ${theme.palette.secondary.main}05 50%, 
      ${theme.palette.background.default}98 100%
    )`;
  }, [theme]);

  const getCardGradient = useCallback((colorType = 'primary') => {
    const color = getThemeColor(colorType);
    return `linear-gradient(135deg, 
      ${color}${theme.palette.mode === 'dark' ? '40' : '26'} 0%, 
      ${color}${theme.palette.mode === 'dark' ? '1A' : '0D'} 100%
    )`;
  }, [theme, getThemeColor]);

  const getBorderColor = useCallback((colorType = 'primary', intensity = 0.3) => {
    const color = getThemeColor(colorType);
    const alphaValue = Math.round(intensity * 255).toString(16).padStart(2, '0');
    return `${color}${alphaValue}`;
  }, [getThemeColor]);

  const getGlassEffect = useCallback(() => ({
    backgroundColor: `${theme.palette.background.paper}${theme.palette.mode === 'dark' ? '33' : 'E6'}`,
    backdropFilter: 'blur(20px)',
    border: `1px solid ${theme.palette.divider}33`,
    boxShadow: `0 8px 32px ${theme.palette.mode === 'dark' ? '#0000001A' : `${theme.palette.primary.main}1A`}`,
  }), [theme]);

  // Status helpers
  const getStatusColor = useCallback((status) => {
    if (!status) return 'default';
    switch(status.toLowerCase()) {
      case 'completed': return 'success';
      case 'active': return 'primary';
      case 'paused': return 'warning';
      case 'not_started': return 'default';
      default: return 'default';
    }
  }, []);

  const getRiskColor = useCallback((riskLevel) => {
    if (!riskLevel) return 'default';
    switch(riskLevel.toLowerCase()) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  }, []);

  const getEfficiencyColor = useCallback((efficiency) => {
    if (efficiency > 120) return 'error';
    if (efficiency > 100) return 'warning';
    if (efficiency >= 80) return 'success';
    return 'error';
  }, []);

  // Tab content component
  const TabContent = useCallback(({ children, value, index }) => {
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
  }, [activeTab]);


    const StatCard = useCallback((props) => {
    return (
        <StatCardComponent
        {...props}
        theme={theme}
        getThemeColor={getThemeColor}
        getCardGradient={getCardGradient}
        getBorderColor={getBorderColor}
        />
    );
    }, [theme, getThemeColor, getCardGradient, getBorderColor]);

  // Floating action button component
  const FloatingActionButton = useCallback(({ icon, onClick, tooltip, color = 'primary', sx = {} }) => {
    const colorValue = getThemeColor(color);
    return (
      <button
        onClick={onClick}
        title={tooltip}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          background: `linear-gradient(135deg, ${colorValue}, ${colorValue}CC)`,
          color: getContrastColor(colorValue),
          boxShadow: `0 8px 25px ${colorValue}66`,
          border: 'none',
          borderRadius: '50%',
          width: 56,
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          ...sx
        }}
      >
        {icon}
      </button>
    );
  }, [getThemeColor, getContrastColor]);
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateString;
      }
      const date = new Date(dateString);
      return format(date, 'yyyy-MM-dd');
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const parseDateFromInput = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toISOString();
    } catch (error) {
      console.error('Error parsing date:', error);
      return null;
    }
  };
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
  // Fetch project data
  const fetchProjectDetails = useCallback(async () => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) {
        showSnackbar('Please login again', 'error');
        navigate('/login');
        return;
      }

      const response = await axiosClient.get(`/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const fetchedData = response?.data;
      if (!fetchedData) {
        throw new Error('No data received from server');
      }


      // Fetch mentor data
      let mentorData = null;
      try {
        const mentorResponse = await axiosClient.get(`/user/get-mentor-for-project/${projectId}`, {
          headers: { Authorization: `Bearer ${token}` }
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
        deadline: formatDate(fetchedData.deadline),
        endDate: fetchedData.endDate ? formatDate(fetchedData.endDate) : formatDate(fetchedData.deadline),
        mentor: mentorData,
        toolkit: fetchedData.toolkit || [],
        projectName: fetchedData.projectName || 'Unnamed Project',
        teamMembers: fetchedData.teamId?.members || []
      };

      setProject(projectData);
      setMembers(fetchedData.teamId?.members || []);
      setProjectCompleted(fetchedData.status);
      
      if (fetchedData.teamId?.members) {
        const count = fetchedData.teamId.members.filter(member => 
          member?.onlineStatus === "active"
        ).length;
        setActiveMemberCount(count);
      }

      showSnackbar('Project data loaded successfully', 'success');
    } catch (error) {
      console.error('Error fetching project details:', error);
      showSnackbar(`Error: ${error.message}`, 'error');
    } finally {
      setLoading(false);
      setRefresh(false);
    }
  }, [projectId, navigate, showSnackbar]);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    if (!projectId) return;

    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await axiosClient.get(`/user/tasks/project/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response?.data?.success) {
        const tasksData = response.data.tasks || [];
        
        const formattedTasks = tasksData.map(task => {
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

          let efficiency = 0;
          if (task.taskMetrics && typeof task.taskMetrics.efficiency === 'number') {
            efficiency = task.taskMetrics.efficiency;
          } else if (task.estimatedTime && task.estimatedTime > 0) {
            efficiency = (task.totalFocusTime / task.estimatedTime) * 100;
          }

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
  }, [projectId, showSnackbar]);

  // Fetch user data
  const fetchUserData = useCallback(async () => {
    try {
      const token = getAuthToken();
      if (!token) return null;
      
      const response = await axiosClient.get('/user/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUser(response.data?.user);
      
      // Set user role
      const userData = getUserData();
      if (userData) {
        setUserRole({
          role: userData.role || 'student',
          userId: userData.id || userData._id
        });
        setUserTeacher(userData.role === 'teacher');
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
      showSnackbar('Error fetching user data', 'error');
    }
  }, [showSnackbar]);

  // Calculate efficiencies
  const calculateEfficiencies = useCallback(() => {
    if (!tasks || tasks.length === 0 || !members || members.length === 0) {
      return;
    }

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

    const totalEstimated = tasks.reduce((sum, task) => sum + (task.estimatedTime || 0), 0);
    const totalFocus = tasks.reduce((sum, task) => sum + (task.totalFocusTime || 0), 0);
    const overallEff = totalEstimated > 0 ? (totalFocus / totalEstimated) * 100 : 0;

    setMemberEfficiencies(memberEff);
    setOverallEfficiency(Number(overallEff.toFixed(2)));
  }, [tasks, members]);

  // Calculate project metrics
  const calculateProjectMetrics = useCallback(() => {
    if (!tasks || tasks.length === 0) return null;

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

  // Task management functions
  const handleSelectTask = useCallback((taskId, checked) => {
    const newSelected = new Set(selectedTasks);
    if (checked) {
      newSelected.add(taskId);
    } else {
      newSelected.delete(taskId);
    }
    setSelectedTasks(newSelected);
  }, [selectedTasks]);

  const handleSelectAll = useCallback((checked) => {
    if (checked) {
      setSelectedTasks(new Set(tasks.map(t => t._id)));
    } else {
      setSelectedTasks(new Set());
    }
  }, [tasks]);

  const handleStatusChange = useCallback(async (taskId, newStatus) => {
    try {
      const token = getAuthToken();
      if (!token) {
        showSnackbar('Authentication required', 'error');
        return;
      }

      const task = tasks.find(t => t._id === taskId);
      if (!task) return;

      const now = new Date();

      const response = await axiosClient.put(`/user/task/${taskId}/status`,
        { status: newStatus, timestamp: now.toISOString() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.success) {
        const updatedTask = response.data?.task;
        
        setTasks(prevTasks => prevTasks.map(t =>
          t._id === taskId ? updatedTask : t
        ));
        
        showSnackbar('Task status updated successfully', 'success');
        
        if (selectedTask && selectedTask._id === taskId) {
          setSelectedTask(prev => ({
            ...prev,
            status: newStatus,
            lastEventTime: updatedTask.lastEventTime
          }));
        }
      } else {
        showSnackbar(response.data?.error || 'Failed to update task status', 'error');
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      showSnackbar(err.response?.data?.error || 'Failed to update task status', 'error');
    }
  }, [tasks, selectedTask, showSnackbar]);

  const handleUploadProof = useCallback((task) => {
    setSelectedTaskForProof(task);
    setUploadProofOpen(true);
  }, []);

  const handleViewDetails = useCallback((task) => {
    setSelectedTask(task);
    setDetailsOpen(true);
  }, []);

  const handleTaskFieldUpdate = useCallback(async (taskId, updates) => {
    try {
      const token = getAuthToken();
      const response = await axiosClient.patch(`/user/${taskId}/field`, 
        { field: updates.field, value: updates.value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data?.success) {
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task._id === taskId 
              ? { 
                  ...task, 
                  [updates.field]: updates.value,
                  ...response.data.task
                }
              : task
          )
        );
        
        return response.data;
      } else {
        showSnackbar(response.data?.error || 'Failed to update', 'error');
        throw new Error(response.data?.error || 'Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      showSnackbar('Error updating task', 'error');
      throw error;
    }
  }, [showSnackbar]);

  const handleDeleteSelected = useCallback(async () => {
    if (selectedTasks.size === 0) return;

    if (!window.confirm(`Delete ${selectedTasks.size} selected task(s)?`)) return;

    const token = getAuthToken();
    if (!token) {
      showSnackbar("Authentication required", "error");
      return;
    }

    try {
      const ids = Array.from(selectedTasks);
      
      for (const id of ids) {
        await axiosClient.delete(`/user/task/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setTasks(prev => prev.filter(task => !selectedTasks.has(task._id)));
      setSelectedTasks(new Set());
      showSnackbar(`${ids.length} task(s) deleted successfully`, 'success');
    } catch (err) {
      console.error("Failed bulk delete:", err);
      showSnackbar('Failed to delete tasks', 'error');
    }
  }, [selectedTasks, showSnackbar]);

  const handleTaskUpdate = useCallback(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    if (project && !editedProject) {
      setEditedProject({ ...project });
    }
  }, [project]);
const validateDates = useCallback(() => {
  if (!editedProject?.startDate || !editedProject?.endDate) return true;

  const startDate = new Date(editedProject.startDate);
  const endDate = new Date(editedProject.endDate);
  const deadline = new Date(editedProject.deadline);



  if (endDate < startDate || deadline < startDate) {
    showSnackbar('End date cannot be before start date', 'error');
    return false;
  }

  return true;
}, [editedProject, showSnackbar]);

  // Update handleEditProjectButton
  const handleEditProjectButton = useCallback(async () => {
    if (isEditing) {
      // Save changes
    if (!validateDates()) {
      return;
    }
      try {
        const token = getAuthToken();
        const response = await axiosClient.patch(`/projects/${projectId}`, editedProject, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data) {
          setProject(response.data);
          showSnackbar('Project updated successfully', 'success');
          setIsEditing(false);
          setRefresh(true);
        }
      } catch (error) {
        console.error('Error updating project:', error);
        showSnackbar('Error updating project', 'error');
      }
    } else {
      // Enter edit mode
      setIsEditing(true);
      setEditedProject({ ...project });
    }
  }, [isEditing, editedProject, projectId, showSnackbar]);
  
  // Add cancel edit function
  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditedProject({ ...project });
    showSnackbar('Edit cancelled', 'info');
  }, [project, showSnackbar]);
  
  // Add update field function
  const updateProjectField = useCallback((field, value) => {
    setEditedProject(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleProjectComplete = useCallback(async () => {
    try {
      const token = getAuthToken();
      await axiosClient.patch(`/projects/${projectId}`, {
        status: 'completed',
        endDate: new Date()
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showSnackbar('Project marked as completed', 'success');
      setRefresh(true);
    } catch (error) {
      console.error('Error completing project:', error);
      showSnackbar('Error completing project', 'error');
    }
  }, [projectId, showSnackbar]);

  const handleRefresh = useCallback(async () => {
    setRefresh(true);
    await Promise.all([
      fetchUserData(),
      fetchProjectDetails(),
      fetchTasks()
    ]);
    showSnackbar('Data refreshed successfully', 'success');
  }, [fetchUserData, fetchProjectDetails, fetchTasks, showSnackbar]);

  const onCreateTask = useCallback((project) => {
    setCreateTaskModalOpen(true);
  }, []);

  // Sticky notes functions
  const fetchStickyNotes = useCallback(async () => {
    try {
      setIsLoadingNotes(true);
      const token = getAuthToken();
      const response = await axiosClient.get(`/sticky-note/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.success) {
        setStickyNotes(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching sticky notes:', error);
      if (error.response?.status === 404) {
        console.warn('Sticky notes endpoint not found');
        setStickyNotes([]);
      } else {
        showSnackbar('Error loading sticky notes', 'error');
      }
    } finally {
      setIsLoadingNotes(false);
    }
  }, [projectId, showSnackbar]);

  const createStickyNote = useCallback(async (noteData) => {
    try {
      const token = getAuthToken();
      const response = await axiosClient.post(
        `/sticky-note/create-new-note/${projectId}`, 
        noteData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.success) {
        showSnackbar('Sticky note created successfully', 'success');
        await fetchStickyNotes();
        setShowNewNoteDialog(false);
        return response.data.data;
      }
    } catch (error) {
      console.error('Error creating sticky note:', error);
      showSnackbar(error.response?.data?.message || 'Error creating note', 'error');
      throw error;
    }
  }, [projectId, fetchStickyNotes, showSnackbar]);

  const deleteStickyNote = useCallback(async (noteId) => {
    try {
      if (!window.confirm('Are you sure you want to delete this note?')) return;

      const token = getAuthToken();
      const response = await axiosClient.delete(`/sticky-note/delete-note/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.success) {
        showSnackbar('Sticky note deleted successfully', 'success');
        await fetchStickyNotes();
      }
    } catch (error) {
      console.error('Error deleting sticky note:', error);
      showSnackbar(error.response?.data?.message || 'Error deleting note', 'error');
    }
  }, [fetchStickyNotes, showSnackbar]);

  const togglePinNote = useCallback(async (noteId) => {
    try {
      const token = getAuthToken();
      const response = await axiosClient.patch(
        `/sticky-note/${noteId}/pin`, 
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data?.success) {
        showSnackbar(response.data.message, 'success');
        await fetchStickyNotes();
      }
    } catch (error) {
      console.error('Error toggling pin:', error);
      showSnackbar('Error updating note', 'error');
    }
  }, [fetchStickyNotes, showSnackbar]);

  // Initialize
  useEffect(() => {
    if (projectId) {
      fetchUserData();
      fetchProjectDetails();
      fetchTasks();
      fetchStickyNotes();
    }
  }, [projectId, fetchUserData, fetchProjectDetails, fetchTasks, fetchStickyNotes]);

  // Calculate efficiencies when tasks or members change
  useEffect(() => {
    calculateEfficiencies();
  }, [calculateEfficiencies]);

  // Calculate project metrics
  useEffect(() => {
    const metrics = calculateProjectMetrics();
    setProjectMetrics(metrics);
  }, [calculateProjectMetrics]);

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

  // Fetch activity logs when tasks are loaded
  useEffect(() => {
    const fetchActivityLogs = async () => {
      if (tasks.length === 0) return;

      try {
        const token = getAuthToken();
        if (!token) return;

        const validTasks = tasks.filter(task => task && task._id);
        if (validTasks.length === 0) {
          setActivityLog([]);
          return;
        }

        const logsPromises = validTasks.map(task => 
          axiosClient.get(`/user/task/${task._id}/activity`, {
            headers: { Authorization: `Bearer ${token}` }
          }).catch(err => {
            console.error(`Error fetching activity for task ${task._id}:`, err);
            return { data: { logs: [] } };
          })
        );

        const responses = await Promise.all(logsPromises);
        const allLogs = responses.flatMap(response => response.data?.logs || []);
        
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

        formattedLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setActivityLog(formattedLogs.slice(0, 50));
      } catch (error) {
        console.error('Error fetching activity logs:', error);
      }
    };

    fetchActivityLogs();
  }, [tasks]);

  // Fetch user teams
  useEffect(() => {
    const fetchUserTeams = async () => {
      try {
        const token = getAuthToken();
        if (!token) return;

        const response = await axiosClient.get("/user/teams", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const teamsData = response.data?.teams || [];
        setTeams(Array.isArray(teamsData) ? teamsData : []);
      } catch (err) {
        console.error('Error fetching teams:', err);
      }
    };

    fetchUserTeams();
  }, []);

  return {
    // State
    loading,
    project,
    snackbarOpen,
    snackbarMessage,
    snackbarSeverity,
    user,
    members,
    activeMemberCount,
    createTaskModalOpen,
    teams,
    projectCompleted,
    selectedTaskForProof,
    uploadProofOpen,
    peerReviews,
    aggregatedScores,
    userPeerScore,
    reviewDialogOpen,
    selectedReviewee,
    reviewScores,
    reviewComment,
    activeTab,
    addMemberDialog,
    projectFiles,
    activityLog,
    tasks,
    searchQuery,
    selectedTasks,
    selectedTask,
    detailsOpen,
    sortBy,
    filters,
    userRole,
    userTeacher,
    memberEfficiencies,
    overallEfficiency,
    projectMetrics,
    stickyNotes,
    isLoadingNotes,
    showNewNoteDialog,
    editingNote,
    completionStatus,
    
    // Setters
    setActiveTab,
    setAddMemberDialog,
    setSearchQuery,
    setSelectedTask,
    setDetailsOpen,
    setUploadProofOpen,
    setSelectedTaskForProof,
    setCreateTaskModalOpen,
    setSelectedTasks,
    setSortBy,
    setFilters,
    
    // Functions
    showSnackbar,
    setSnackbarOpen,
    handleEditProjectButton,
    handleRefresh,
    onCreateTask,
    handleSelectTask,
    handleSelectAll,
    handleStatusChange,
    handleUploadProof,
    handleViewDetails,
    handleTaskFieldUpdate,
    handleDeleteSelected,
    handleTaskUpdate,
    handleProjectComplete,
    createStickyNote,
    deleteStickyNote,
    togglePinNote,
    getThemeColor,
    getContrastColor,
    getGradientBackground,
    getCardGradient,
    getBorderColor,
    getGlassEffect,
    getStatusColor,
    getRiskColor,
    getEfficiencyColor,
    TabContent,
    StatCard,
    FloatingActionButton,
    isEditing,
    editedProject,
    handleCancelEdit,
    updateProjectField,
    //handle date edits
    formatDateForInput,
    parseDateFromInput,
    formatDate
  };
};

export default useMyProject;