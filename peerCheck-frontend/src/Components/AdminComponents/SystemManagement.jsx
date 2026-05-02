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
  TablePagination,
  Chip,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  LinearProgress,
  Alert,
  Tabs,
  Tab,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Security as SecurityIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  History as HistoryIcon,
  Login as LoginIcon,
  LockReset as LockResetIcon,
  Timeline as TimelineIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Visibility as VisibilityIcon,
  CalendarToday as CalendarIcon,
  Task as TaskIcon,
  Assessment as AssessmentIcon,
  VerifiedUser as VerifiedUserIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import axiosClient from '@/api/axiosClient';

const SystemManagement = () => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [securityLoading, setSecurityLoading] = useState(false);
  const [activityLoading, setActivityLoading] = useState(false);
  
  // Security Data
  const [securityStats, setSecurityStats] = useState({
    totalLogins: 0,
    totalLoginsLast7Days: 0,
    failedLogins: 0,
    failedLoginsLast24Hrs: 0,
    passwordResets: 0,
    passwordResetsLast7Days: 0
  });
  
  const [loginAttempts, setLoginAttempts] = useState({
    logs: [],
    pagination: { currentPage: 1, totalPages: 1, totalRecords: 0, hasNext: false, hasPrev: false, limit: 20 }
  });
  
  const [loginPage, setLoginPage] = useState(0);
  const [loginRowsPerPage, setLoginRowsPerPage] = useState(10);
  const [loginStatusFilter, setLoginStatusFilter] = useState('all');
  const [loginSearchTerm, setLoginSearchTerm] = useState('');
  
  // Activity Data
  const [activitySummary, setActivitySummary] = useState({
    summary: {
      deletedProjects: { total: 0, last7Days: 0 },
      deletedTasks: { total: 0, last7Days: 0 },
      taskEdits: { total: 0, last7Days: 0 }
    },
    recentActivities: []
  });
  
  const [deletedProjects, setDeletedProjects] = useState({
    projects: [],
    pagination: { currentPage: 1, totalPages: 1, totalRecords: 0, hasNext: false, hasPrev: false, limit: 20 }
  });
  
  const [deletedTasks, setDeletedTasks] = useState({
    tasks: [],
    pagination: { currentPage: 1, totalPages: 1, totalRecords: 0, hasNext: false, hasPrev: false, limit: 20 }
  });
  
  const [editedTasks, setEditedTasks] = useState({
    edits: [],
    pagination: { currentPage: 1, totalPages: 1, totalRecords: 0, hasNext: false, hasPrev: false, limit: 20 }
  });
  
  const [deletedProjectsPage, setDeletedProjectsPage] = useState(0);
  const [deletedProjectsRowsPerPage, setDeletedProjectsRowsPerPage] = useState(10);
  
  // Dialogs
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [dialogType, setDialogType] = useState('');

  // Fetch security data
  const fetchSecurityData = async () => {
    try {
      setSecurityLoading(true);
      
      // Fetch security stats
      const statsResponse = await axiosClient.get(`/admin/security-stats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSecurityStats(statsResponse.data);
      
      // Fetch login attempts
      const loginResponse = await axiosClient.get(`/admin/login-logs`, {
        params: { 
          page: loginPage + 1, 
          limit: loginRowsPerPage,
          status: loginStatusFilter !== 'all' ? loginStatusFilter : undefined,
          search: loginSearchTerm || undefined
        },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setLoginAttempts(loginResponse.data);
      
    } catch (error) {
      console.error('Error fetching security data:', error);
      Alert('Failed to fetch security data. Please try again.');
    } finally {
      setSecurityLoading(false);
    }
  };

  // Fetch activity data
  const fetchActivityData = async () => {
    try {
      setActivityLoading(true);
      
      // Fetch activity summary
      const summaryResponse = await axiosClient.get(`/admin/activity-summary`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setActivitySummary(summaryResponse.data);
      
      // Fetch deleted projects
      const projectsResponse = await axiosClient.get(`/admin/deleted-projects`, {
        params: { 
          page: deletedProjectsPage + 1, 
          limit: deletedProjectsRowsPerPage 
        },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDeletedProjects(projectsResponse.data);
      
      // Fetch deleted tasks
      const tasksResponse = await axiosClient.get(`/admin/deleted-tasks`, {
        params: { page: 1, limit: 5 },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setDeletedTasks(tasksResponse.data);
      
      // Fetch edited tasks
      const editsResponse = await axiosClient.get(`/admin/edited-tasks`, {
        params: { page: 1, limit: 5 },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setEditedTasks(editsResponse.data);
      
    } catch (error) {
      console.error('Error fetching activity data:', error);
      Alert('Failed to fetch activity data. Please try again.');
    } finally {
      setActivityLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 0) {
      fetchSecurityData();
    } else if (activeTab === 1) {
      fetchActivityData();
    }
  }, [activeTab]);

  // Fetch data when pagination changes
  useEffect(() => {
    if (activeTab === 0) {
      fetchSecurityData();
    }
  }, [loginPage, loginRowsPerPage, loginStatusFilter]);

  useEffect(() => {
    if (activeTab === 1) {
      fetchActivityData();
    }
  }, [deletedProjectsPage, deletedProjectsRowsPerPage]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleLoginPageChange = (event, newPage) => {
    setLoginPage(newPage);
  };

  const handleLoginRowsPerPageChange = (event) => {
    setLoginRowsPerPage(parseInt(event.target.value, 10));
    setLoginPage(0);
  };

  const handleDeletedProjectsPageChange = (event, newPage) => {
    setDeletedProjectsPage(newPage);
  };

  const handleDeletedProjectsRowsPerPageChange = (event) => {
    setDeletedProjectsRowsPerPage(parseInt(event.target.value, 10));
    setDeletedProjectsPage(0);
  };

  const handleViewDetails = (item, type) => {
    setSelectedItem(item);
    setDialogType(type);
    setDetailsDialogOpen(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'Success':
        return <Chip label="Success" size="small" color="success" variant="outlined" />;
      case 'Failed':
        return <Chip label="Failed" size="small" color="error" variant="outlined" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const exportData = async () => {
    try {
      setLoading(true);

      alert('Export functionality would generate a report file in a real application.');
    } catch (error) {
      console.error('Error exporting data:', error);
    } finally {
      setLoading(false);
    }
  };

  const SecurityOverview = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <SecurityIcon /> Security Overview
      </Typography>
      
      {securityLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: theme.palette.info.main, mr: 2 }}>
                      <LoginIcon />
                    </Avatar>
                    <Box>
                      <Typography color="textSecondary" variant="body2">Total Logins</Typography>
                      <Typography variant="h5">{securityStats.totalLogins}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrendingUpIcon fontSize="small" color="success" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="textSecondary">
                      {securityStats.totalLoginsLast7Days} in last 7 days
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: theme.palette.error.main, mr: 2 }}>
                      <WarningIcon />
                    </Avatar>
                    <Box>
                      <Typography color="textSecondary" variant="body2">Failed Logins</Typography>
                      <Typography variant="h5">{securityStats.failedLogins}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <WarningIcon fontSize="small" color="error" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="textSecondary">
                      {securityStats.failedLoginsLast24Hrs} in last 24 hours
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: theme.palette.warning.main, mr: 2 }}>
                      <LockResetIcon />
                    </Avatar>
                    <Box>
                      <Typography color="textSecondary" variant="body2">Password Resets</Typography>
                      <Typography variant="h5">{securityStats.passwordResets}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <InfoIcon fontSize="small" color="info" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="textSecondary">
                      {securityStats.passwordResetsLast7Days} in last 7 days
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HistoryIcon /> Recent Login Attempts
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <TextField
                    placeholder="Search emails..."
                    size="small"
                    value={loginSearchTerm}
                    onChange={(e) => setLoginSearchTerm(e.target.value)}
                    sx={{ width: 200 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={loginStatusFilter}
                      label="Status"
                      onChange={(e) => setLoginStatusFilter(e.target.value)}
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="Success">Success</MenuItem>
                      <MenuItem value="Failed">Failed</MenuItem>
                    </Select>
                  </FormControl>
                  <Button startIcon={<RefreshIcon />} onClick={fetchSecurityData}>
                    Refresh
                  </Button>
                </Box>
              </Box>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User Email</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Date & Time</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loginAttempts.logs.map((log) => (
                      <TableRow key={log._id} hover>
                        <TableCell>{log.email || 'Unknown'}</TableCell>
                        <TableCell>{getStatusChip(log.status)}</TableCell>
                        <TableCell>{formatDate(log.date)}</TableCell>
                        <TableCell>
                          <Tooltip title="View Details">
                            <IconButton 
                              size="small"
                              onClick={() => handleViewDetails(log, 'login')}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                    {loginAttempts.logs.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          <Typography color="textSecondary" sx={{ py: 2 }}>
                            No login attempts found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[10, 20, 50]}
                component="div"
                count={loginAttempts.pagination.totalRecords || 0}
                rowsPerPage={loginRowsPerPage}
                page={loginPage}
                onPageChange={handleLoginPageChange}
                onRowsPerPageChange={handleLoginRowsPerPageChange}
              />
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );

  const SystemActivity = () => (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AssessmentIcon /> System Activity & Analytics
      </Typography>
      
      {activityLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: theme.palette.error.light, mr: 2 }}>
                      <DeleteIcon />
                    </Avatar>
                    <Box>
                      <Typography color="textSecondary" variant="body2">Deleted Projects</Typography>
                      <Typography variant="h5">{activitySummary.summary.deletedProjects.total}</Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    {activitySummary.summary.deletedProjects.last7Days} in last 7 days
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: theme.palette.warning.light, mr: 2 }}>
                      <TaskIcon />
                    </Avatar>
                    <Box>
                      <Typography color="textSecondary" variant="body2">Deleted Tasks</Typography>
                      <Typography variant="h5">{activitySummary.summary.deletedTasks.total}</Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    {activitySummary.summary.deletedTasks.last7Days} in last 7 days
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: theme.palette.info.light, mr: 2 }}>
                      <EditIcon />
                    </Avatar>
                    <Box>
                      <Typography color="textSecondary" variant="body2">Task Edits</Typography>
                      <Typography variant="h5">{activitySummary.summary.taskEdits.total}</Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    {activitySummary.summary.taskEdits.last7Days} in last 7 days
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <DeleteIcon /> Recently Deleted Projects
                    </Typography>
                    <Button startIcon={<RefreshIcon />} onClick={fetchActivityData}>
                      Refresh
                    </Button>
                  </Box>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Project Name</TableCell>
                          <TableCell>Original Project</TableCell>
                          <TableCell>Deleted At</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {deletedProjects.projects.map((project) => (
                          <TableRow key={project._id} hover>
                            <TableCell>{project.deletedProjectName}</TableCell>
                            <TableCell>{project.projectID?.projectName || 'Unknown'}</TableCell>
                            <TableCell>{formatDate(project.deletedAt)}</TableCell>
                            <TableCell>
                              <Tooltip title="View Details">
                                <IconButton 
                                  size="small"
                                  onClick={() => handleViewDetails(project, 'project')}
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                        {deletedProjects.projects.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} align="center">
                              <Typography color="textSecondary" sx={{ py: 2 }}>
                                No deleted projects found
                              </Typography>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    rowsPerPageOptions={[10, 20, 50]}
                    component="div"
                    count={deletedProjects.pagination.totalRecords || 0}
                    rowsPerPage={deletedProjectsRowsPerPage}
                    page={deletedProjectsPage}
                    onPageChange={handleDeletedProjectsPageChange}
                    onRowsPerPageChange={handleDeletedProjectsRowsPerPageChange}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TimelineIcon /> Recent Activities
                  </Typography>
                  <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                    {activitySummary.recentActivities.map((activity, index) => (
                      <ListItem key={activity._id || index} divider>
                        <ListItemAvatar>
                          <Avatar sx={{ 
                            bgcolor: activity.type === 'project_deleted' ? theme.palette.error.light :
                                    activity.type === 'task_deleted' ? theme.palette.warning.light :
                                    theme.palette.info.light
                          }}>
                            {activity.type === 'project_deleted' ? <DeleteIcon /> :
                             activity.type === 'task_deleted' ? <TaskIcon /> :
                             <EditIcon />}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            activity.type === 'project_deleted' ? 'Project Deleted' :
                            activity.type === 'task_deleted' ? 'Task Deleted' :
                            'Task Edited'
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" component="span">
                                {activity.deletedProjectName || activity.deletedTaskName || activity.taskId?.taskName || 'Unknown'}
                              </Typography>
                              <br />
                              <Typography variant="caption" color="textSecondary">
                                {formatDate(activity.deletedAt || activity.editMadeAt)}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    ))}
                    {activitySummary.recentActivities.length === 0 && (
                      <ListItem>
                        <ListItemText
                          primary="No recent activities"
                          primaryTypographyProps={{ color: 'textSecondary', align: 'center' }}
                        />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <SecurityOverview />;
      case 1:
        return <SystemActivity />;
      default:
        return <SecurityOverview />;
    }
  };

  const renderDetailsDialog = () => {
    if (!selectedItem) return null;

    let title = '';
    let content = null;

    switch (dialogType) {
      case 'login':
        title = 'Login Attempt Details';
        content = (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary">Email</Typography>
              <Typography variant="body1">{selectedItem.email || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary">Status</Typography>
              <Box sx={{ mt: 1 }}>{getStatusChip(selectedItem.status)}</Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary">IP Address</Typography>
              <Typography variant="body1">{selectedItem.ip || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary">Date & Time</Typography>
              <Typography variant="body1">{formatDate(selectedItem.date)}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary">User Agent</Typography>
              <Typography variant="body1" style={{ wordBreak: 'break-word' }}>
                {selectedItem.userAgent || 'N/A'}
              </Typography>
            </Grid>
          </Grid>
        );
        break;

      case 'project':
        title = 'Deleted Project Details';
        content = (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body2" color="textSecondary">Deleted Project Name</Typography>
              <Typography variant="body1">{selectedItem.deletedProjectName}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary">Original Project</Typography>
              <Typography variant="body1">{selectedItem.projectID?.projectName || 'Unknown'}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="textSecondary">Deleted At</Typography>
              <Typography variant="body1">{formatDate(selectedItem.deletedAt)}</Typography>
            </Grid>
            {selectedItem.memberList && selectedItem.memberList.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary">Team Members</Typography>
                <Typography variant="body1">{selectedItem.memberList.length} members</Typography>
              </Grid>
            )}
          </Grid>
        );
        break;

      default:
        return null;
    }

    return (
      <Dialog open={detailsDialogOpen} onClose={() => setDetailsDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          {content}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <VerifiedUserIcon /> System Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            startIcon={<DownloadIcon />}
            variant="outlined"
            onClick={exportData}
            disabled={loading}
          >
            Export Report
          </Button>
          <Button
            startIcon={<RefreshIcon />}
            variant="contained"
            onClick={() => activeTab === 0 ? fetchSecurityData() : fetchActivityData()}
            disabled={loading || (activeTab === 0 ? securityLoading : activityLoading)}
          >
            {loading ? <CircularProgress size={24} /> : 'Refresh'}
          </Button>
        </Box>
      </Box>

      {(securityLoading || activityLoading) && <LinearProgress sx={{ mb: 2 }} />}

      <Alert severity="info" sx={{ mb: 3 }}>
        Monitor system security, track activities, and analyze system performance across the academy collaborative tracker.
      </Alert>

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SecurityIcon /> Security Monitoring
              </Box>
            }
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimelineIcon /> System Activity
              </Box>
            }
          />
        </Tabs>
        <Divider />
        <Box sx={{ p: 3 }}>
          {renderTabContent()}
        </Box>
      </Paper>

      {renderDetailsDialog()}
    </Box>
  );
};

export default SystemManagement;