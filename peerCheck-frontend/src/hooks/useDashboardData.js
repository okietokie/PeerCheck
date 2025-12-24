import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '@/api/axiosClient';
import { calculateProductivity, generateRecentActivities } from '../utils/dashboardCalculations';
import { getTaskActivityMessage, formatTimeAgo } from '../utils/activityHelpers';

export default function useDashboardData() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [username, setUsername] = useState('');
  const [userData, setUserData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [stats, setStats] = useState({
    activeProjects: 0,
    activeTasks: 0,
    productivity: 0,
    highPriorityAlerts: 0
  });
  const [snackbars, setSnackbars] = useState({
    welcome: false,
    dataLoaded: false,
    refreshComplete: false,
    projectClick: false,
    taskClick: false,
    statsDemo: false,
    activityClick: false,
    quickActionClick: false,
    performanceDemo: false
  });

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      setRefreshing(true);
      
      setSnackbars(prev => ({ ...prev, dataLoaded: false }));
      
      const userRes = await axiosClient.get("user/me", { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      setUsername(userRes.data.username || userRes.data.user?.username || 'User');
      setUserData(userRes.data.user);
      
      if (loading && !snackbars.welcome) {
        setTimeout(() => {
          setSnackbars(prev => ({ ...prev, welcome: true }));
        }, 1000);
      }
      
      try {
        let fetchedProjects = [];
        const projectsRes = await axiosClient.get("projects", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (Array.isArray(projectsRes.data)) {
          fetchedProjects = projectsRes.data;
        } else if (projectsRes.data?.projects) {
          fetchedProjects = projectsRes.data.projects;
        } else if (projectsRes.data?.data) {
          fetchedProjects = projectsRes.data.data;
        }

        setProjects(fetchedProjects);
        setStats(prev => ({
          ...prev,
          activeProjects: fetchedProjects.filter(p => p.status === 'active' || p.status === 'ongoing').length
        }));

      } catch (projectsErr) {
        console.error("Error fetching projects:", projectsErr);
        setProjects(userRes.data.userProjects || []);
      }

      try {
        const tasksRes = await axiosClient.get("user/tasks/all", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (tasksRes.data.success) {
          const userTasks = tasksRes.data.tasks || [];
          setTasks(userTasks);
          
          const activeTasks = userTasks.filter(t => t.status === 'active' || t.status==='paused').length;
          const highPriorityAlerts = userTasks.filter(t => 
            (t.metrics?.riskScore >= 4 || t.flags?.manualReviewRequired) && 
            t.status !== 'completed'
          ).length;
          
          const productivity = calculateProductivity(userTasks);

          setStats(prev => ({
            ...prev,
            activeTasks,
            productivity,
            highPriorityAlerts
          }));

          generateRecentActivities(userTasks, setRecentActivities);
        }
      } catch (tasksErr) {
        console.error("Error fetching tasks:", tasksErr);
        setTasks([]);
      }

      setSnackbars(prev => ({ ...prev, dataLoaded: true }));

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCreateProject = () => {
    setSnackbars(prev => ({ ...prev, quickActionClick: true }));
    setTimeout(() => {
      navigate('/user-app/projects?create=true');
    }, 300);
  };

  const handleViewTasks = () => {
    setSnackbars(prev => ({ ...prev, taskClick: true }));
    setTimeout(() => {
      navigate('/user-app/tasks');
    }, 300);
  };

  const handleViewProject = (projectId) => {
    setSnackbars(prev => ({ ...prev, projectClick: true }));
    setTimeout(() => {
      navigate(`/user-app/my-project/${projectId}`);
    }, 300);
  };

  const handleViewAllProjects = () => {
    navigate('/user-app/projects');
  };

  const handleStatsDemo = () => {
    setSnackbars(prev => ({ ...prev, statsDemo: true }));
  };

  const handleActivityClick = () => {
    setSnackbars(prev => ({ ...prev, activityClick: true }));
  };

  const handlePerformanceDemo = () => {
    setSnackbars(prev => ({ ...prev, performanceDemo: true }));
  };

  const handleRefresh = () => {
    fetchDashboardData();
    setSnackbars(prev => ({ ...prev, refreshComplete: true }));
  };

  const handleCloseSnackbar = (snackbar) => {
    setSnackbars(prev => ({ ...prev, [snackbar]: false }));
  };

  useEffect(() => {
    fetchDashboardData();
    
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  return {
    loading,
    refreshing,
    username,
    userData,
    projects,
    tasks,
    recentActivities,
    stats,
    snackbars,
    handleCreateProject,
    handleViewTasks,
    handleViewProject,
    handleViewAllProjects,
    handleStatsDemo,
    handleActivityClick,
    handlePerformanceDemo,
    handleRefresh,
    handleCloseSnackbar,
  };
}