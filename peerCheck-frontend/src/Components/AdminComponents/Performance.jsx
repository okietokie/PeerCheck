import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  Avatar,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  CardHeader,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  Speed as SpeedIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Assessment as AssessmentIcon,
  Analytics as AnalyticsIcon,
  Timeline as TimelineIcon,
  ShowChart as ShowChartIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Dashboard as DashboardIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  People as PeopleIcon,
  Task as TaskIcon,
  Schedule as ScheduleIcon,
  Grade as GradeIcon,
  Security as SecurityIcon,
  Download as DownloadIcon,
  AccessTime,
  Person as PersonIcon,
  CalendarToday,
  CheckCircle,
  Pending,
  Schedule
} from '@mui/icons-material';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, AreaChart, Area, RadialBarChart, RadialBar } from 'recharts';
import { useTheme } from '@mui/material/styles';
import axiosClient from '@/api/axiosClient';
import { getAuthToken } from '@/utils/auth';

const PerformanceAnalyticsPage = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('7days');
  const [projectFilter, setProjectFilter] = useState('all');
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [systemStats, setSystemStats] = useState(null);
  
  // Performance Metrics Data
  const [overviewMetrics, setOverviewMetrics] = useState({
    systemHealth: 0,
    activeProjects: 0,
    totalTasks: 0,
    avgEfficiency: 0,
    riskScore: 0,
    proofCompliance: 0
  });
  
  const [efficiencyData, setEfficiencyData] = useState([]);
  const [riskDistribution, setRiskDistribution] = useState([]);
  const [progressTrends, setProgressTrends] = useState([]);
  const [deadlineMetrics, setDeadlineMetrics] = useState({
    onTime: 0,
    overdue: 0,
    upcoming: 0
  });
  
  const [topProjects, setTopProjects] = useState([]);
  const [bottleneckTasks, setBottleneckTasks] = useState([]);
  const [freeRiderAlerts, setFreeRiderAlerts] = useState([]);

  const getToken = () => {
    return getAuthToken() || localStorage.getItem('token');
  };

  // Fetch all data
  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getToken();
      
      if (!token) {
        setError('Authentication required. Please log in.');
        return;
      }

      // Fetch projects for filter dropdown
      await fetchProjects(token);
      
      // Fetch system stats
      await fetchSystemStats(token);
      
      // Fetch analytics data
      await fetchAnalyticsData(token);
      
      setLastUpdated(new Date());
      
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(`Failed to load data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch projects
  const fetchProjects = async (token) => {
    try {
      const response = await axiosClient.get('/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(response.data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    }
  };

  // Fetch system stats
  const fetchSystemStats = async (token) => {
    try {
      const response = await axiosClient.get('/admin/system-stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data?.success) {
        setSystemStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching system stats:', error);
    }
  };

  // Fetch analytics data
  const fetchAnalyticsData = async (token) => {
    try {
      const response = await axiosClient.get(`/admin/analytics/performance?timeRange=${timeRange}&projectId=${projectFilter}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data?.success) {
        const analytics = response.data.data;
        
        // Update all state with real data
        setOverviewMetrics(analytics.overviewMetrics || {});
        setEfficiencyData(analytics.efficiencyData || []);
        setRiskDistribution(analytics.riskDistribution || []);
        setProgressTrends(analytics.progressTrends || []);
        setDeadlineMetrics(analytics.deadlineMetrics || {});
        setTopProjects(analytics.topProjects || []);
        setBottleneckTasks(analytics.bottleneckTasks || []);
        setFreeRiderAlerts(analytics.freeRiderAlerts || []);
      } else {
        setError('Failed to load analytics data');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Analytics service unavailable. Showing sample data.');

      generateDataFromProjects();
    }
  };

  const generateDataFromProjects = async () => {
    if (projects.length === 0) return;

    const token = getToken();
    
    try {

      const tasksResponse = await axiosClient.get('/tasks', {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 100 }
      });
      
      const tasks = tasksResponse.data?.tasks || [];
      

      let totalEfficiency = 0;
      let totalRisk = 0;
      let tasksWithProof = 0;
      
      tasks.forEach(task => {
        const estimatedTime = task.estimatedTime || 1;
        const focusTime = task.totalFocusTime || 0;
        const efficiency = (focusTime / estimatedTime) * 100;
        totalEfficiency += efficiency;
        
        totalRisk += task.metrics?.riskScore || 0;
        
        if (task.proofUploads && task.proofUploads.length > 0) {
          tasksWithProof++;
        }
      });

      const avgEfficiency = tasks.length > 0 ? totalEfficiency / tasks.length : 0;
      const avgRisk = tasks.length > 0 ? totalRisk / tasks.length : 0;
      const proofCompliance = tasks.length > 0 ? (tasksWithProof / tasks.length) * 100 : 0;

      setOverviewMetrics(prev => ({
        ...prev,
        avgEfficiency: parseFloat(avgEfficiency.toFixed(1)),
        riskScore: parseFloat(avgRisk.toFixed(2)),
        proofCompliance: parseFloat(proofCompliance.toFixed(1)),
        totalTasks: tasks.length,
        activeProjects: projects.filter(p => p.status === 'ongoing').length
      }));

    } catch (error) {
      console.error('Error generating fallback data:', error);
    }
  };

  // Helper functions
  const getHealthColor = (score) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getEfficiencyStatus = (efficiency) => {
    if (efficiency < 50) return { label: 'Rushed', color: 'error', icon: <WarningIcon /> };
    if (efficiency < 80) return { label: 'Below Ideal', color: 'warning', icon: <InfoIcon /> };
    if (efficiency <= 120) return { label: 'Ideal', color: 'success', icon: <CheckCircleIcon /> };
    return { label: 'Padded', color: 'warning', icon: <TrendingDownIcon /> };
  };

  const getRiskColor = (riskName) => {
    switch (riskName?.toLowerCase()) {
      case 'high risk':
        return theme.palette.error.main;
      case 'medium risk':
        return theme.palette.warning.main;
      case 'low risk':
        return theme.palette.success.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  useEffect(() => {
    fetchAllData();
  }, [timeRange, projectFilter]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleExport = () => {
    const data = {
      overviewMetrics,
      efficiencyData,
      riskDistribution,
      progressTrends,
      deadlineMetrics,
      topProjects,
      bottleneckTasks,
      freeRiderAlerts,
      generatedAt: new Date().toISOString(),
      timeRange,
      projectFilter
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const StatCard = ({ title, value, icon, color, subtitle, trend }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="textSecondary" variant="body2" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ color }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: `${color}20`, color: color }}>
            {icon}
          </Avatar>
        </Box>
        {trend && (
          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
            {trend.icon}
            <Typography variant="caption" sx={{ ml: 0.5, color: trend.color }}>
              {trend.value}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const OverviewDashboard = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <DashboardIcon /> Performance Overview
      </Typography>
      
      {/* System Stats Row */}
      {systemStats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Projects"
              value={systemStats.totalProjects}
              icon={<AssessmentIcon />}
              color={theme.palette.primary.main}
              subtitle={`${systemStats.activeProjects} active`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Tasks"
              value={systemStats.totalTasks}
              icon={<TaskIcon />}
              color={theme.palette.info.main}
              subtitle={`${systemStats.completedTasks} completed`}
              trend={{
                value: `${systemStats.taskCompletionRate?.toFixed(1)}% completion`,
                icon: <TrendingUpIcon fontSize="small" color="success" />,
                color: 'success'
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Users"
              value={systemStats.totalUsers}
              icon={<PeopleIcon />}
              color={theme.palette.warning.main}
              subtitle={`${systemStats.activeUsers} active`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="System Health"
              value={`${systemStats.averageHealth}%`}
              icon={<SpeedIcon />}
              color={getHealthColor(systemStats.averageHealth)}
              subtitle="Overall health score"
            />
          </Grid>
        </Grid>
      )}

      {/* Performance Metrics Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                System Health Score
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <CircularProgress
                  variant="determinate"
                  value={overviewMetrics.systemHealth}
                  size={80}
                  thickness={5}
                  sx={{ color: getHealthColor(overviewMetrics.systemHealth) }}
                />
                <Box>
                  <Typography variant="h3" sx={{ color: getHealthColor(overviewMetrics.systemHealth) }}>
                    {overviewMetrics.systemHealth}%
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Overall system performance
                  </Typography>
                </Box>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={overviewMetrics.systemHealth}
                sx={{ 
                  height: 6, 
                  borderRadius: 3,
                  backgroundColor: theme.palette.grey[200],
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: getHealthColor(overviewMetrics.systemHealth)
                  }
                }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Task Efficiency
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <CircularProgress
                    variant="determinate"
                    value={Math.min(overviewMetrics.avgEfficiency, 100)}
                    size={80}
                    thickness={5}
                    sx={{ color: getEfficiencyStatus(overviewMetrics.avgEfficiency).color }}
                  />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="h6" component="div">
                      {overviewMetrics.avgEfficiency.toFixed(1)}%
                    </Typography>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="h6">
                    {getEfficiencyStatus(overviewMetrics.avgEfficiency).label}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {getEfficiencyStatus(overviewMetrics.avgEfficiency).icon}
                    <Typography variant="caption" color="textSecondary">
                      {overviewMetrics.totalTasks} tasks analyzed
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Risk & Compliance
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color={overviewMetrics.riskScore > 2 ? 'error' : 'success'}>
                      {overviewMetrics.riskScore.toFixed(1)}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Avg Risk Score
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color={overviewMetrics.proofCompliance > 80 ? 'success' : 'warning'}>
                      {overviewMetrics.proofCompliance.toFixed(0)}%
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Proof Compliance
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Chip 
                  label={overviewMetrics.riskScore > 2 ? 'High Risk' : 'Low Risk'}
                  size="small"
                  color={overviewMetrics.riskScore > 2 ? 'error' : 'success'}
                  icon={overviewMetrics.riskScore > 2 ? <WarningIcon /> : <CheckCircleIcon />}
                />
                <Chip 
                  label={`${overviewMetrics.activeProjects} Active Projects`}
                  size="small"
                  color="info"
                  icon={<AssessmentIcon />}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title="Efficiency Trends"
              subheader={`Showing data for ${timeRange}`}
              avatar={<ShowChartIcon />}
              action={
                <IconButton size="small">
                  <InfoIcon />
                </IconButton>
              }
            />
            <CardContent>
              <Box sx={{ height: 300 }}>
                {efficiencyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={efficiencyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.grey[300]} />
                      <XAxis 
                        dataKey="name" 
                        stroke={theme.palette.text.secondary}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        stroke={theme.palette.text.secondary}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <RechartsTooltip 
                        formatter={(value) => [`${value}%`, 'Efficiency']}
                        labelFormatter={(label) => `Period: ${label}`}
                        contentStyle={{ 
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: theme.shape.borderRadius
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="efficiency" 
                        stroke={theme.palette.primary.main} 
                        fill={theme.palette.primary.light}
                        fillOpacity={0.3}
                        name="Efficiency %"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography color="textSecondary">No efficiency data available</Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title="Risk Distribution"
              avatar={<SecurityIcon />}
              action={
                <IconButton size="small">
                  <InfoIcon />
                </IconButton>
              }
            />
            <CardContent>
              <Box sx={{ height: 300, display: 'flex', flexDirection: 'column' }}>
                {riskDistribution.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height="80%">
                      <PieChart>
                        <Pie
                          data={riskDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {riskDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getRiskColor(entry.name)} />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          formatter={(value) => [`${value}%`, 'Percentage']}
                          contentStyle={{ 
                            backgroundColor: theme.palette.background.paper,
                            border: `1px solid ${theme.palette.divider}`
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
                      {riskDistribution.map((risk, index) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Box sx={{ width: 12, height: 12, backgroundColor: getRiskColor(risk.name), borderRadius: '50%' }} />
                          <Typography variant="caption">{risk.name}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </>
                ) : (
                  <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography color="textSecondary">No risk data available</Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const ProjectAnalytics = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AssessmentIcon /> Project Performance Analytics
      </Typography>
      
      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Time Range</InputLabel>
                <Select
                  value={timeRange}
                  label="Time Range"
                  onChange={(e) => setTimeRange(e.target.value)}
                >
                  <MenuItem value="7days">Last 7 Days</MenuItem>
                  <MenuItem value="30days">Last 30 Days</MenuItem>
                  <MenuItem value="90days">Last 90 Days</MenuItem>
                  <MenuItem value="all">All Time</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Project</InputLabel>
                <Select
                  value={projectFilter}
                  label="Project"
                  onChange={(e) => setProjectFilter(e.target.value)}
                >
                  <MenuItem value="all">All Projects</MenuItem>
                  {projects.map(project => (
                    <MenuItem key={project._id} value={project._id}>
                      {project.projectName || 'Unnamed Project'}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchAllData}
                  disabled={loading}
                >
                  Refresh
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleExport}
                >
                  Export
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Deadline Health"
              avatar={<CalendarToday />}
            />
            <CardContent>
              <Box sx={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'On Time', value: deadlineMetrics.onTime, color: theme.palette.success.main },
                    { name: 'Overdue', value: deadlineMetrics.overdue, color: theme.palette.error.main },
                    { name: 'Upcoming', value: deadlineMetrics.upcoming, color: theme.palette.warning.main }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: 'Percentage', angle: -90, position: 'insideLeft' }} />
                    <RechartsTooltip 
                      formatter={(value) => [`${value}%`, 'Percentage']}
                      contentStyle={{ 
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`
                      }}
                    />
                    <Bar dataKey="value">
                      {[
                        { name: 'On Time', color: theme.palette.success.main },
                        { name: 'Overdue', color: theme.palette.error.main },
                        { name: 'Upcoming', color: theme.palette.warning.main }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <CheckCircle color="success" />
                    <Typography variant="h6">{deadlineMetrics.onTime}%</Typography>
                    <Typography variant="caption">On Time</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <WarningIcon color="error" />
                    <Typography variant="h6">{deadlineMetrics.overdue}%</Typography>
                    <Typography variant="caption">Overdue</Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Schedule color="warning" />
                    <Typography variant="h6">{deadlineMetrics.upcoming}%</Typography>
                    <Typography variant="caption">Upcoming</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Progress vs Plan"
              avatar={<TimelineIcon />}
            />
            <CardContent>
              <Box sx={{ height: 250 }}>
                {progressTrends.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={progressTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis label={{ value: 'Progress %', angle: -90, position: 'insideLeft' }} />
                      <RechartsTooltip 
                        formatter={(value) => [`${value}%`, 'Progress']}
                        contentStyle={{ 
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="planned" 
                        stroke={theme.palette.info.main}
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Planned"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="actual" 
                        stroke={theme.palette.success.main}
                        strokeWidth={2}
                        name="Actual"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography color="textSecondary">No progress data available</Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Data Tables Section */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card>
            <CardHeader
              title="Top Performing Projects"
              avatar={<TrendingUpIcon />}
              action={
                <Typography variant="caption" color="textSecondary">
                  Sorted by Health Score
                </Typography>
              }
            />
            <CardContent>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Project</TableCell>
                      <TableCell align="center">Health</TableCell>
                      <TableCell align="center">Efficiency</TableCell>
                      <TableCell align="center">Risk</TableCell>
                      <TableCell align="center">Progress</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topProjects.length > 0 ? (
                      topProjects.map((project) => (
                        <TableRow key={project.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar sx={{ width: 32, height: 32, bgcolor: getHealthColor(project.health) }}>
                                {project.name.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="body2">{project.name}</Typography>
                                <Typography variant="caption" color="textSecondary">
                                  ID: {project.id.slice(-6)}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <CircularProgress
                                variant="determinate"
                                value={project.health}
                                size={24}
                                thickness={6}
                                sx={{ color: getHealthColor(project.health), mr: 1 }}
                              />
                              <Typography variant="body2">{project.health}%</Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={`${project.efficiency.toFixed(1)}%`}
                              size="small"
                              color={project.efficiency >= 80 ? 'success' : project.efficiency >= 50 ? 'warning' : 'error'}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={project.risk.toFixed(2)}
                              size="small"
                              color={project.risk > 2 ? 'error' : 'success'}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={project.progress}
                                sx={{ 
                                  width: '100%',
                                  height: 6,
                                  borderRadius: 3,
                                  backgroundColor: theme.palette.grey[200]
                                }}
                              />
                              <Typography variant="body2">{project.progress.toFixed(0)}%</Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Chip 
                              label={project.health >= 80 ? 'Healthy' : project.health >= 60 ? 'Needs Attention' : 'Critical'}
                              size="small"
                              color={project.health >= 80 ? 'success' : project.health >= 60 ? 'warning' : 'error'}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                          <Typography color="textSecondary">No project data available</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title="Free Rider Alerts"
              avatar={<WarningIcon color="warning" />}
              action={
                <Chip 
                  label={`${freeRiderAlerts.length} alerts`}
                  size="small"
                  color="warning"
                />
              }
            />
            <CardContent>
              {freeRiderAlerts.length > 0 ? (
                <List dense>
                  {freeRiderAlerts.map((alert, index) => (
                    <ListItem
                      key={alert.id}
                      divider={index < freeRiderAlerts.length - 1}
                      secondaryAction={
                        <Chip 
                          label={`${alert.completionRate.toFixed(0)}%`}
                          size="small"
                          color="error"
                        />
                      }
                    >
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2">
                            {alert.user}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography variant="caption" display="block">
                              {alert.project}
                            </Typography>
                            <Typography variant="caption" color="error">
                              {alert.completed}/{alert.assigned} tasks completed
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CheckCircleIcon sx={{ fontSize: 48, color: theme.palette.success.main, mb: 2 }} />
                  <Typography color="textSecondary">
                    No free rider alerts detected
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    All team members are contributing effectively
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const EfficiencyMetrics = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AnalyticsIcon /> Efficiency & Risk Analysis
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          This section analyzes task efficiency patterns and identifies risk factors based on real-time data from your projects.
          All metrics are calculated from actual task performance data.
        </Typography>
      </Alert>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AccessTime sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />
              <Typography variant="h5">
                {efficiencyData.reduce((sum, item) => sum + item.actual, 0).toFixed(1)}h
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Total Actual Time
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <SpeedIcon sx={{ fontSize: 40, color: theme.palette.success.main, mb: 1 }} />
              <Typography variant="h5">
                {efficiencyData.reduce((sum, item) => sum + item.efficiency, 0) / efficiencyData.length || 0}%
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Avg Efficiency
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <SecurityIcon sx={{ fontSize: 40, color: theme.palette.warning.main, mb: 1 }} />
              <Typography variant="h5">
                {riskDistribution.find(r => r.name === 'High Risk')?.value || 0}%
              </Typography>
              <Typography variant="caption" color="textSecondary">
                High Risk Tasks
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircleIcon sx={{ fontSize: 40, color: theme.palette.info.main, mb: 1 }} />
              <Typography variant="h5">
                {bottleneckTasks.length}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Bottleneck Tasks
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ mb: 4 }}>
        <CardHeader
          title="Bottleneck Tasks"
          subheader="Tasks requiring immediate attention"
          avatar={<WarningIcon color="error" />}
          action={
            <Button size="small" variant="outlined">
              View All
            </Button>
          }
        />
        <CardContent>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Task</TableCell>
                  <TableCell>Project</TableCell>
                  <TableCell align="right">Delay</TableCell>
                  <TableCell>Impact</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bottleneckTasks.length > 0 ? (
                  bottleneckTasks.map((task) => (
                    <TableRow key={task.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TaskIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {task.name.length > 30 ? `${task.name.substring(0, 30)}...` : task.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={task.project} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell align="right">
                        <Chip 
                          label={`${task.delay} days`}
                          size="small"
                          color={task.delay > 7 ? 'error' : task.delay > 3 ? 'warning' : 'info'}
                          icon={<Schedule fontSize="small" />}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={task.impact}
                          size="small"
                          color={
                            task.impact === 'High' ? 'error' :
                            task.impact === 'Medium' ? 'warning' : 'success'
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="small" 
                          variant="contained" 
                          color="primary"
                          sx={{ minWidth: 100 }}
                        >
                          Investigate
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <CheckCircleIcon sx={{ fontSize: 48, color: theme.palette.success.main, mb: 2 }} />
                        <Typography color="textSecondary">
                          No bottleneck tasks detected
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Efficiency Patterns */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Efficiency Distribution"
              avatar={<TrendingUpIcon />}
            />
            <CardContent>
              <Box sx={{ height: 300 }}>
                {efficiencyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={efficiencyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis label={{ value: 'Efficiency %', angle: -90, position: 'insideLeft' }} />
                      <RechartsTooltip 
                        formatter={(value) => [`${value}%`, 'Efficiency']}
                        contentStyle={{ 
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`
                        }}
                      />
                      <Bar dataKey="efficiency" fill={theme.palette.primary.main} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography color="textSecondary">No efficiency data available</Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader
              title="Risk Level Breakdown"
              avatar={<SecurityIcon />}
            />
            <CardContent>
              <Box sx={{ height: 300 }}>
                {riskDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart 
                      innerRadius="10%" 
                      outerRadius="80%" 
                      data={riskDistribution}
                      startAngle={180}
                      endAngle={-180}
                    >
                      <RadialBar 
                        minAngle={15}
                        label={{ position: 'insideStart', fill: '#fff' }}
                        background
                        clockWise
                        dataKey="value"
                      >
                        {riskDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getRiskColor(entry.name)} />
                        ))}
                      </RadialBar>
                      <Legend 
                        iconSize={10}
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                      />
                      <RechartsTooltip />
                    </RadialBarChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography color="textSecondary">No risk data available</Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <OverviewDashboard />;
      case 1:
        return <ProjectAnalytics />;
      case 2:
        return <EfficiencyMetrics />;
      default:
        return <OverviewDashboard />;
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 0.5 }}>
            <SpeedIcon /> Performance & Analytics Dashboard
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 'Loading...'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            startIcon={<DownloadIcon />}
            variant="outlined"
            onClick={handleExport}
          >
            Export Report
          </Button>
          <Button
            startIcon={<RefreshIcon />}
            variant="contained"
            onClick={fetchAllData}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Refresh Data'}
          </Button>
        </Box>
      </Box>

      {/* Loading and Error States */}
      {loading && (
        <LinearProgress sx={{ mb: 2 }} />
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Main Content */}
      <Paper sx={{ mb: 3, overflow: 'hidden' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                <DashboardIcon /> Overview
              </Box>
            }
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                <AssessmentIcon /> Project Analytics
              </Box>
            }
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                <AnalyticsIcon /> Efficiency Metrics
              </Box>
            }
          />
        </Tabs>
        
        <Box sx={{ p: 3 }}>
          {renderTabContent()}
        </Box>
      </Paper>

      {/* Footer Info */}
      <Alert severity="info" sx={{ mt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <InfoIcon />
          <Box>
            <Typography variant="body2" fontWeight="medium">
              Analytics Dashboard Information
            </Typography>
            <Typography variant="caption" display="block">
              • All metrics are calculated in real-time from your project and task data
              • Efficiency is calculated as (Actual Time / Estimated Time) × 100%
              • Risk scores are based on task flags and completion patterns
              • System health combines project metrics, completion rates, and proof compliance
            </Typography>
          </Box>
        </Box>
      </Alert>

      {/* Snackbar for errors */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        message={error}
      />
    </Box>
  );
};

export default PerformanceAnalyticsPage;