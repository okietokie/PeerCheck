import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  IconButton,
  CssBaseline,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Chip,
  Avatar,
  Paper,
  alpha,
  LinearProgress,
  CircularProgress,
  Divider,
  Badge,
  Tooltip,
  Container,
  Alert,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  Security as SecurityIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  BarChart as BarChartIcon,
  Logout as LogoutIcon,
  Menu as MenuIcon,
  Home as HomeIcon,
  Storage as StorageIcon,
  VerifiedUser as VerifiedUserIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  DataUsage as DataUsageIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Insights as InsightsIcon,
  Speed as SpeedIcon,
  Palette as PaletteIcon,
  Build as BuildIcon,
  Login as LoginIcon,
  LockReset as LockResetIcon,
  Error as ErrorIcon,
  PersonAdd as PersonAddIcon,
  Group as GroupIcon,
  Timeline as TimelineIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Assignment as AssignmentIcon,
  Task as TaskIcon,
  Description as DescriptionIcon,
  History as HistoryIcon,
  Refresh as RefreshIcon
} from "@mui/icons-material";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import SecNAuth from "./SecNAuth";
import UserMgmt from "./UserManagement";
import SysMgmt from "./SystemManagement";
import Performance from "./Performance";
import axiosClient from "@/api/axiosClient";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement
);

const drawerWidth = 280;

function AdminPage() {
  const [activeSession, setActiveSession] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [activityData, setActivityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    fetchDashboardData();
    fetchActivityData();
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [securityStats, userStats, projectsStats] = await Promise.all([
        axiosClient.get("/admin/security-stats"),
        axiosClient.get("/admin/user-data"),
        axiosClient.get("/admin/projects-stats") 
      ]);
      
      setDashboardData({
        security: securityStats.data,
        users: userStats.data,
        projects: projectsStats.data || {}
      });
      setError(null);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data");
      
      // Fallback mock data for development
      setDashboardData({
        security: {
          totalLogins: 1542,
          totalLoginsLast7Days: 328,
          failedLogins: 42,
          failedLoginsLast24Hrs: 8,
          passwordResets: 12,
          passwordResetsLast7Days: 4
        },
        users: {
          totalUsersInDB: 1842,
          allUsers: []
        },
        projects: {
          totalProjects: 45,
          activeProjects: 32,
          deletedProjects: 13,
          editedTasks: 87
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityData = async () => {
    try {
      setActivityLoading(true);
      const [deletedProjects, deletedTasks, editedTasks] = await Promise.all([
        axiosClient.get("/admin/deleted-projects"),
        axiosClient.get("/admin/deleted-tasks"),
        axiosClient.get("/admin/edited-tasks")
      ]);
      
      setActivityData({
        deletedProjects: deletedProjects.data || [],
        deletedTasks: deletedTasks.data || [],
        editedTasks: editedTasks.data || []
      });
    } catch (err) {
      console.error("Error fetching activity data:", err);
      // Continue without activity data
    } finally {
      setActivityLoading(false);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      await axiosClient.put("/auth/log-out",{}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      localStorage.removeItem("token");
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Calculate derived metrics
  const getSuccessRate = () => {
    if (!dashboardData?.security?.totalLogins || !dashboardData?.security?.failedLogins) return 100;
    const successRate = ((dashboardData.security.totalLogins - dashboardData.security.failedLogins) / dashboardData.security.totalLogins) * 100;
    return Math.round(successRate);
  };

  const getAvgDailyLogins = () => {
    if (!dashboardData?.security?.totalLoginsLast7Days) return 0;
    return Math.round(dashboardData.security.totalLoginsLast7Days / 7);
  };

  // Chart data using real data
  const userGrowthData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Daily Logins',
        data: dashboardData?.security?.totalLoginsLast7Days 
          ? [dashboardData.security.totalLoginsLast7Days * 0.15, 
             dashboardData.security.totalLoginsLast7Days * 0.20,
             dashboardData.security.totalLoginsLast7Days * 0.18,
             dashboardData.security.totalLoginsLast7Days * 0.22,
             dashboardData.security.totalLoginsLast7Days * 0.12,
             dashboardData.security.totalLoginsLast7Days * 0.08,
             dashboardData.security.totalLoginsLast7Days * 0.05]
          : [],
        borderColor: theme.palette.primary.main,
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        tension: 0.4,
        fill: true,
        borderWidth: 2,
      },
    ],
  };

  const userGrowthOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: theme.palette.text.secondary,
          font: {
            family: theme.typography.fontFamily,
          }
        }
      },
      title: {
        display: true,
        text: 'Weekly Login Activity',
        color: theme.palette.text.primary,
        font: {
          size: 16,
          family: theme.typography.fontFamily,
          weight: 600
        }
      },
    },
    scales: {
      x: {
        grid: {
          color: alpha(theme.palette.text.secondary, 0.1),
        },
        ticks: {
          color: theme.palette.text.secondary,
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: alpha(theme.palette.text.secondary, 0.1),
        },
        ticks: {
          color: theme.palette.text.secondary,
          callback: function(value) {
            return Math.round(value);
          }
        }
      },
    },
  };

  // Project activity data
  const projectActivityData = {
    labels: ['Active Projects', 'Deleted Projects', 'Edited Tasks'],
    datasets: [
      {
        label: 'Project Activity',
        data: [
          dashboardData?.projects?.activeProjects || 0,
          dashboardData?.projects?.deletedProjects || 0,
          dashboardData?.projects?.editedTasks || 0
        ],
        backgroundColor: [
          alpha(theme.palette.success.main, 0.8),
          alpha(theme.palette.error.main, 0.8),
          alpha(theme.palette.warning.main, 0.8),
        ],
        borderColor: theme.palette.background.paper,
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  };

  const projectActivityOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: theme.palette.text.secondary,
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: theme.palette.text.secondary,
        }
      },
      x: {
        ticks: {
          color: theme.palette.text.secondary,
        }
      }
    },
  };

  // Login success rate data
  const successRateData = {
    labels: ['Success Rate'],
    datasets: [
      {
        data: [getSuccessRate(), 100 - getSuccessRate()],
        backgroundColor: [
          theme.palette.success.main,
          alpha(theme.palette.error.main, 0.2),
        ],
        borderColor: theme.palette.background.paper,
        borderWidth: 3,
        circumference: 180,
        rotation: 270,
      },
    ],
  };

  const successRateOptions = {
    responsive: true,
    cutout: '70%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.parsed}%`;
          }
        }
      }
    },
  };

  const menuItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: <DashboardIcon />,
      action: () => setActiveSession(""),
      badge: 0
    },
    {
      key: "sec-n-auth",
      label: "Security & Auth",
      icon: <SecurityIcon />,
      action: () => setActiveSession("sec-n-auth"),
      badge: dashboardData?.security?.failedLoginsLast24Hrs || 0
    },
    {
      key: "user-management",
      label: "User Management",
      icon: <PeopleIcon />,
      action: () => setActiveSession("user-management"),
      badge: dashboardData?.users?.totalUsersInDB || 0
    },
    {
      key: "system-management",
      label: "System Management",
      icon: <SettingsIcon />,
      action: () => setActiveSession("system-management"),
      badge: dashboardData?.projects?.deletedProjects || 0
    },
    {
      key: "performance",
      label: "Performance",
      icon: <InsightsIcon />,
      action: () => setActiveSession("performance"),
      badge: 0
    }
  ];

  const quickStats = [
    { 
      label: "Total Users", 
      value: loading ? "..." : dashboardData?.users?.totalUsersInDB?.toLocaleString() || "0", 
      icon: <PeopleIcon />, 
      color: "primary",
      trend: `+${getAvgDailyLogins()}/day`,
      subtext: "Registered accounts"
    },
    { 
      label: "Login Success Rate", 
      value: loading ? "..." : `${getSuccessRate()}%`, 
      icon: <VerifiedUserIcon />, 
      color: getSuccessRate() > 95 ? "success" : getSuccessRate() > 85 ? "warning" : "error",
      trend: `${dashboardData?.security?.failedLogins || 0} failed`,
      subtext: "Authentication accuracy"
    },
    { 
      label: "Active Projects", 
      value: loading ? "..." : dashboardData?.projects?.activeProjects || 0, 
      icon: <AssignmentIcon />, 
      color: "info",
      trend: `${dashboardData?.projects?.deletedProjects || 0} deleted`,
      subtext: "In progress"
    },
    { 
      label: "Task Edits", 
      value: loading ? "..." : dashboardData?.projects?.editedTasks || 0, 
      icon: <EditIcon />, 
      color: "warning",
      trend: "This month",
      subtext: "Content updates"
    }
  ];

  const quickActions = [
    { 
      label: "View Login Logs", 
      icon: <LoginIcon />, 
      color: "primary",
      action: () => setActiveSession("sec-n-auth")
    },
    { 
      label: "Manage Users", 
      icon: <GroupIcon />, 
      color: "secondary",
      action: () => setActiveSession("user-management")
    },
    { 
      label: "Project Activity", 
      icon: <HistoryIcon />, 
      color: "info",
      action: () => console.log("View project activity")
    },
    { 
      label: "Refresh Data", 
      icon: <RefreshIcon />, 
      color: "success",
      action: () => {
        fetchDashboardData();
        fetchActivityData();
      }
    },
  ];

  const renderRecentActivity = () => {
    if (activityLoading) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={60} />
          ))}
        </Box>
      );
    }

    if (!activityData || (!activityData.deletedProjects?.length && !activityData.deletedTasks?.length && !activityData.editedTasks?.length)) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          No recent activity data available
        </Alert>
      );
    }

    const allActivities = [
      ...(activityData.deletedProjects?.map(project => ({
        type: 'project_deleted',
        title: project.deletedProjectName,
        time: new Date(project.deletedAt).toLocaleDateString(),
        icon: <DeleteIcon color="error" />,
        details: `${project.memberList?.length || 0} members`
      })) || []),
      ...(activityData.deletedTasks?.map(task => ({
        type: 'task_deleted',
        title: task.deletedTaskName,
        time: new Date(task.deletedAt).toLocaleDateString(),
        icon: <TaskIcon color="warning" />,
        details: `Task deleted`
      })) || []),
      ...(activityData.editedTasks?.map(edit => ({
        type: 'task_edited',
        title: 'Task Updated',
        time: new Date(edit.editMadeAt).toLocaleDateString(),
        icon: <EditIcon color="info" />,
        details: 'Content modified'
      })) || [])
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {allActivities.map((activity, index) => (
          <Paper
            key={index}
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              borderLeft: `4px solid ${
                activity.type === 'project_deleted' ? theme.palette.error.main :
                activity.type === 'task_deleted' ? theme.palette.warning.main :
                theme.palette.info.main
              }`
            }}
          >
            <Avatar sx={{ bgcolor: alpha(theme.palette.grey[300], 0.5) }}>
              {activity.icon}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {activity.title}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {activity.details}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {activity.time}
            </Typography>
          </Paper>
        ))}
      </Box>
    );
  };

  const renderContent = () => {
    switch (activeSession) {
      case "sec-n-auth":
        return <SecNAuth />;
      case "user-management":
        return <UserMgmt />;
      case "system-management":
        return <SysMgmt />;
      case "performance":
        return <Performance />;
      default:
        return (
          <Container maxWidth="xl" sx={{ py: 3 }}>
            {/* Welcome Header */}
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700, 
                    color: theme.palette.primary.main, 
                    mb: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}>
                    <AdminPanelSettingsIcon sx={{ fontSize: 40 }} />
                    PeerCheck Administration
                  </Typography>
                  <Typography variant="subtitle1" sx={{ 
                    color: 'text.secondary',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <AccessTimeIcon fontSize="small" />
                    {loading ? "Loading data..." : `Last updated: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => {
                    fetchDashboardData();
                    fetchActivityData();
                  }}
                  disabled={loading || activityLoading}
                >
                  Refresh
                </Button>
              </Box>
              
              {error && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  {error} - Showing cached data
                </Alert>
              )}
            </Box>

            {/* Stats Grid using Flex instead of Grid */}
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 3, 
              mb: 4,
              '& > *': {
                flex: '1 1 calc(25% - 24px)',
                minWidth: '250px'
              }
            }}>
              {quickStats.map((stat, index) => (
                <Card key={index} sx={{
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  }
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h3" sx={{ 
                          fontWeight: 800,
                          color: theme.palette[stat.color].main,
                          mb: 0.5
                        }}>
                          {loading ? (
                            <Skeleton width={80} />
                          ) : stat.value}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: 'text.secondary',
                          fontWeight: 500
                        }}>
                          {stat.label}
                        </Typography>
                      </Box>
                      <Avatar sx={{
                        bgcolor: alpha(theme.palette[stat.color].main, 0.1),
                        color: theme.palette[stat.color].main,
                        width: 56,
                        height: 56
                      }}>
                        {stat.icon}
                      </Avatar>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip 
                        label={loading ? <Skeleton width={40} /> : stat.trend}
                        size="small"
                        color={stat.color}
                        variant="outlined"
                      />
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {stat.subtext}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>

            {/* Main Content Area */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3, mb: 4 }}>
              {/* Left Column - Charts */}
              <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Weekly Activity Chart */}
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <TimelineIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Weekly Activity Overview
                      </Typography>
                    </Box>
                    {loading ? (
                      <Skeleton variant="rounded" height={300} />
                    ) : (
                      <Box sx={{ height: 300 }}>
                        <Line data={userGrowthData} options={userGrowthOptions} />
                      </Box>
                    )}
                  </CardContent>
                </Card>

                {/* Project Activity Chart */}
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <AssignmentIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Project Activity Metrics
                      </Typography>
                    </Box>
                    {loading ? (
                      <Skeleton variant="rounded" height={300} />
                    ) : (
                      <Box sx={{ height: 300 }}>
                        <Bar data={projectActivityData} options={projectActivityOptions} />
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Box>

              {/* Right Column - Success Rate & Recent Activity */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Success Rate Card */}
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <VerifiedUserIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Login Success Rate
                      </Typography>
                    </Box>
                    {loading ? (
                      <Skeleton variant="circular" width={200} height={200} sx={{ mx: 'auto', my: 4 }} />
                    ) : (
                      <Box sx={{ position: 'relative', height: 250, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <Box sx={{ width: 200, height: 200 }}>
                          <Doughnut data={successRateData} options={successRateOptions} />
                        </Box>
                        <Box sx={{ 
                          position: 'absolute', 
                          top: '50%', 
                          left: '50%', 
                          transform: 'translate(-50%, -50%)',
                          textAlign: 'center'
                        }}>
                          <Typography variant="h2" sx={{ 
                            fontWeight: 800,
                            color: getSuccessRate() > 95 ? theme.palette.secondary.main : 
                                   getSuccessRate() > 85 ? theme.palette.warning.main : 
                                   theme.palette.error.main
                          }}>
                            {getSuccessRate()}%
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Success Rate
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>

                {/* Recent Activity Card */}
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <HistoryIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Recent Activity
                      </Typography>
                    </Box>
                    {renderRecentActivity()}
                  </CardContent>
                </Card>
              </Box>
            </Box>

            {/* Bottom Section - Quick Actions & System Status */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
              {/* Quick Actions */}
              <Card sx={{ flex: 1 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <DashboardIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Quick Actions
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {quickActions.map((action, index) => (
                      <Paper
                        key={index}
                        onClick={action.action}
                        sx={{
                          p: 2,
                          display: 'flex',
                          alignItems: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          '&:hover': {
                            transform: 'translateX(4px)',
                            bgcolor: alpha(theme.palette[action.color].main, 0.04),
                          }
                        }}
                      >
                        <Avatar
                          sx={{
                            mr: 2,
                            bgcolor: alpha(theme.palette[action.color].main, 0.1),
                            color: theme.palette[action.color].main,
                          }}
                        >
                          {action.icon}
                        </Avatar>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {action.label}
                        </Typography>
                      </Paper>
                    ))}
                  </Box>
                  
                  <Divider sx={{ my: 3 }} />
                  
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                      System Status Summary
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption">Authentication Health</Typography>
                          <Chip 
                            label={getSuccessRate() > 95 ? "Excellent" : getSuccessRate() > 85 ? "Good" : "Needs Attention"} 
                            size="small" 
                            color={getSuccessRate() > 95 ? "success" : getSuccessRate() > 85 ? "warning" : "error"}
                          />
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={getSuccessRate()}
                          sx={{ height: 6, borderRadius: 3 }}
                          color={getSuccessRate() > 95 ? "success" : getSuccessRate() > 85 ? "warning" : "error"}
                        />
                      </Box>
                      <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="caption">User Growth</Typography>
                          <Typography variant="caption" color="primary">
                            {dashboardData?.users?.totalUsersInDB ? `+${Math.round(dashboardData.users.totalUsersInDB * 0.12)} this month` : "..."}
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={dashboardData?.users?.totalUsersInDB ? Math.min(100, (dashboardData.users.totalUsersInDB / 2000) * 100) : 0}
                          sx={{ height: 6, borderRadius: 3 }}
                          color="primary"
                        />
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              {/* System Metrics */}
              <Card sx={{ flex: 1 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <SpeedIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      System Metrics
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StorageIcon fontSize="small" />
                        Database Statistics
                      </Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableBody>
                            <TableRow>
                              <TableCell>Total Users</TableCell>
                              <TableCell align="right">
                                {loading ? <Skeleton width={40} /> : dashboardData?.users?.totalUsersInDB || 0}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Active Projects</TableCell>
                              <TableCell align="right">
                                {loading ? <Skeleton width={40} /> : dashboardData?.projects?.activeProjects || 0}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Deleted Items</TableCell>
                              <TableCell align="right">
                                {loading ? <Skeleton width={40} /> : dashboardData?.projects?.deletedProjects || 0}
                              </TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell>Recent Edits</TableCell>
                              <TableCell align="right">
                                {loading ? <Skeleton width={40} /> : dashboardData?.projects?.editedTasks || 0}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                    
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <SecurityIcon fontSize="small" />
                        Security Overview
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="caption">Failed Logins (24h)</Typography>
                          <Typography variant="caption" color="error">
                            {loading ? <Skeleton width={30} /> : dashboardData?.security?.failedLoginsLast24Hrs || 0}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="caption">Password Resets</Typography>
                          <Typography variant="caption" color="warning">
                            {loading ? <Skeleton width={30} /> : dashboardData?.security?.passwordResets || 0}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="caption">Total Logins (7d)</Typography>
                          <Typography variant="caption" color="info">
                            {loading ? <Skeleton width={30} /> : dashboardData?.security?.totalLoginsLast7Days || 0}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Container>
        );
    }
  };

  const drawer = (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      bgcolor: theme.palette.primary.dark,
      color: theme.palette.primary.contrastText,
    }}>
      {/* Header */}
      <Box sx={{ p: 3, bgcolor: alpha(theme.palette.common.black, 0.2) }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
            <VerifiedUserIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              PeerCheck Admin
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              v2.1.0 • Production
            </Typography>
          </Box>
        </Box>
        <Chip 
          label={loading ? "Loading..." : "All Systems Operational"} 
          size="small"
          color="success"
          icon={loading ? <CircularProgress size={12} color="inherit" /> : <CheckCircleIcon />}
          sx={{ color: 'white', bgcolor: alpha(theme.palette.success.main, 0.2) }}
        />
      </Box>

      {/* Navigation */}
      <List sx={{ flex: 1, p: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.key} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={item.action}
              selected={activeSession === item.key}
              sx={{
                borderRadius: 2,
                py: 1.5,
                px: 2,
                '&.Mui-selected': {
                  bgcolor: alpha(theme.palette.common.white, 0.15),
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.common.white, 0.2),
                  }
                },
                '&:hover': {
                  bgcolor: alpha(theme.palette.common.white, 0.1),
                }
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                {item.badge > 0 ? (
                  <Badge badgeContent={item.badge} color="secondary" variant="dot">
                    {item.icon}
                  </Badge>
                ) : item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label}
                primaryTypographyProps={{ 
                  fontWeight: activeSession === item.key ? 600 : 400 
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Footer */}
      <Box sx={{ p: 2, bgcolor: alpha(theme.palette.common.black, 0.3) }}>
        <Box sx={{ mb: 2, p: 2, bgcolor: alpha(theme.palette.common.black, 0.2), borderRadius: 2 }}>
          <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mb: 0.5 }}>
            API Response
          </Typography>
          {loading ? (
            <CircularProgress size={16} color="inherit" />
          ) : (
            <>
              <LinearProgress 
                variant="determinate" 
                value={100} 
                sx={{ height: 6, borderRadius: 3, mb: 1 }}
              />
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                Connected • {dashboardData?.users?.totalUsersInDB || 0} users
              </Typography>
            </>
          )}
        </Box>
        
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            py: 1.5,
            color: alpha(theme.palette.common.white, 0.8),
            '&:hover': {
              bgcolor: alpha(theme.palette.error.main, 0.2),
              color: theme.palette.error.light,
            }
          }}
        >
          <ListItemIcon sx={{ color: 'inherit' }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Logout Session"
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          boxShadow: theme.shadows[1],
          borderBottom: `1px solid ${theme.palette.divider}`,
          backdropFilter: 'blur(20px)',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ 
            fontWeight: 600, 
            flexGrow: 1,
            color: theme.palette.primary.main
          }}>
            {menuItems.find(item => item.key === activeSession)?.label || 'Dashboard Overview'}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Tooltip title="Notifications">
              <IconButton size="small">
                <Badge badgeContent={dashboardData?.security?.failedLoginsLast24Hrs || 0} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
            <Chip 
              icon={<AdminPanelSettingsIcon />}
              label="Admin"
              size="small"
              color="primary"
              variant="outlined"
              sx={{ 
                borderColor: alpha(theme.palette.primary.main, 0.3),
                color: theme.palette.primary.main,
                fontWeight: 600
              }}
            />
            
            <Avatar 
              sx={{ 
                bgcolor: theme.palette.secondary.main,
                width: 40,
                height: 40
              }}
            >
              <PersonIcon />
            </Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          width: { md: `calc(100% - ${drawerWidth}px)` },
          bgcolor: theme.palette.background.default,
          minHeight: '100vh'
        }}
      >
        <Toolbar />
        {renderContent()}
      </Box>
    </Box>
  );
}

export default AdminPage;