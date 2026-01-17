// useTasks.js
import { useState, useEffect, useCallback } from 'react';
import axiosClient from '@/api/axiosClient.js';
import { getAuthToken } from '@/utils/auth.js';

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

const useTasks = () => {
  // State
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [authError, setAuthError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [selectedTask, setSelectedTask] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [uploadProofModalOpen, setUploadProofModalOpen] = useState(false);
  const [selectedTaskForProof, setSelectedTaskForProof] = useState(null);
  const [proofUploadMessage, setProofUploadMessage] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  const [sortBy, setSortBy] = useState('deadline');
  const [filters, setFilters] = useState({
    status: 'all',
    riskLevel: 'all',
    hasProof: 'all',
    isOverdue: false
  });
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userTeacher, setUserTeacher] = useState(false);
  const [liveTimers, setLiveTimers] = useState({});
  

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
      role: user.role || 'peer',
      userId: user.id || user._id
    });
    return true;
  }, []);

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

  // SIMPLIFIED: Just use backend metrics directly
  const useBackendMetrics = (task) => {
    // If task already has metrics from backend, use them
    if (task.metrics) {
      return task.metrics;
    }
    
    // Fallback for unsaved/new tasks (minimal calculation)
    return {
      efficiency: task.estimatedTime 
        ? Math.round((task.totalFocusTime / task.estimatedTime) * 100 * 100) / 100 
        : 0,
      efficiencyStatus: 'unknown',
      efficiencyLabel: 'Unknown',
      riskScore: 0,
      riskLevel: 'low',
      isOverdue: task.deadline ? (new Date(task.deadline) < new Date() && task.status !== 'completed') : false,
      hasProof: task.proofUploads && task.proofUploads.length > 0,
      proofCount: task.proofUploads?.length || 0,
      daysUntilDeadline: task.deadline ? 
        Math.ceil((new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : 0,
      statusWeightPercentage: 0
    };
  };

  // Fetch tasks - SIMPLIFIED VERSION
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

      // Backend already calculates metrics - just use them directly!
      // No need to recalculate in frontend
      const enrichedTasks = tasksData.map(task => ({
        ...task,
        // Ensure metrics exist (they should from backend)
        metrics: task.metrics || useBackendMetrics(task)
      }));
      
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

  // Handle fetch errors
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

  // Delete task function
  const deleteTask = async (taskId) => {
    try {
      const token = getAuthToken();
      if (!token) {
        setError('Authentication required');
        return false;
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

  // Task selection handlers
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

  // Status change handler - UPDATED to handle backend metrics
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
        
        // Update tasks with backend-calculated metrics
        setTasks(prevTasks => prevTasks.map(t =>
          t._id === taskId 
            ? { 
                ...updatedTask,
                metrics: updatedTask.metrics || useBackendMetrics(updatedTask)
              } 
            : t
        ));
        
        setError(null); // Clear error on success
        
        if (selectedTask && selectedTask._id === taskId) {
          setSelectedTask(prev => ({
            ...prev,
            status: newStatus,
            lastEventTime: updatedTask.lastEventTime,
            metrics: updatedTask.metrics
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

  // Upload proof handlers
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
    fetchTasks(); // Refetch to get updated metrics from backend
  };

  // Task field update - UPDATED to handle backend response
  const handleTaskFieldUpdate = async (taskId, updates) => {
    try {
      const token = getAuthToken();
      
      const response = await axiosClient.patch(`/user/task/${taskId}/field`, 
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
        const updatedTask = response.data.task;
        
        // Update local state with backend-calculated metrics
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task._id === taskId 
              ? { 
                  ...updatedTask,
                  metrics: updatedTask.metrics || useBackendMetrics(updatedTask)
                }
              : task
          )
        );
        
        return response.data;
      } else {
        throw new Error(response.data?.error || 'Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  // Delete selected tasks
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

  // Task update handler
  const handleTaskUpdate = () => {
    fetchTasks();
  };

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

  // Filter and sort tasks - UPDATED to use backend metrics
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
          return (b.metrics?.efficiency || 0) - (a.metrics?.efficiency || 0); // Higher efficiency first
        case 'status':
          const statusOrder = { completed: 4, active: 3, paused: 2, not_started: 1 };
          return statusOrder[b.status] - statusOrder[a.status];
        default:
          return 0;
      }
    });
    
    setFilteredTasks(result);
  }, [tasks, searchQuery, sortBy, filters]);

  // Update userTeacher state
  useEffect(() => {
    if (userRole?.role === 'teacher') {
      setUserTeacher(true);
    }
  }, [userRole]);

  // Return state and functions
  return {
    // State
    tasks,
    activeTab,
    filteredTasks,
    loading,
    error,
    authError,
    searchQuery,
    selectedTasks,
    selectedTask,
    detailsOpen,
    uploadProofModalOpen,
    selectedTaskForProof,
    proofUploadMessage,
    sortBy,
    filters,
    userRole,
    userId,
    userTeacher,
    liveTimers,
    
    // Setters
    setSearchQuery,
    setSelectedTask,
    setDetailsOpen,
    setUploadProofModalOpen,
    setSelectedTaskForProof,
    setProofUploadMessage,
    setSortBy,
    setFilters,
    setError,
    setActiveTab,
    setFilteredTasks,
    
    // Functions
    fetchTasks,
    handleSelectTask,
    handleSelectAll,
    handleStatusChange,
    handleOpenUploadProof,
    handleProofUploadSuccess,
    handleTaskFieldUpdate,
    handleDeleteSelected,
    handleTaskUpdate,
    deleteTask,
    formatTime
  };
};

export default useTasks;