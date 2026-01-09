import axiosClient from '@/api/axiosClient';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Paper,
  alpha,
  useTheme,
  Container,
  IconButton,
  Tooltip,
  Chip,
  Avatar,
  AvatarGroup,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tabs,
  Tab,
  Grid,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  Badge,
  Snackbar,
  Alert,
  CircularProgress,
  InputAdornment,
  OutlinedInput
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Add as AddIcon,
  Class as ClassIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  School as SchoolIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  GroupAdd as GroupAddIcon,
  Email as EmailIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  PersonAdd as PersonAddIcon,
  FileCopy as FileCopyIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

export default function TeacherClasses() {
  const navigate = useNavigate();
  const theme = useTheme();
  
  // State
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addStudentsDialogOpen, setAddStudentsDialogOpen] = useState(false);
  const [assignProjectDialogOpen, setAssignProjectDialogOpen] = useState(false);
  
  // Form states
  const [newClass, setNewClass] = useState({
    className: '',
    courseCode: '',
    description: '',
    semester: '',
    academicYear: new Date().getFullYear(),
    maxStudents: 50,
    isActive: true
  });
  
  const [editingClass, setEditingClass] = useState(null);
  const [availableProjects, setAvailableProjects] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  
  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch classes data
  const fetchClasses = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      const response = await axiosClient.get('/teacher/classes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setClasses(response.data.classes);
        if (response.data.classes.length > 0 && !selectedClass) {
          setSelectedClass(response.data.classes[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      showSnackbar('Failed to load classes', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch available projects for assignment
  const fetchAvailableProjects = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosClient.get('/teacher/projects/available', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setAvailableProjects(response.data.projects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  // Fetch available students
  const fetchAvailableStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosClient.get('/teacher/students/available', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setAvailableStudents(response.data.students);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchAvailableProjects();
  }, []);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCreateClass = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosClient.post('/teacher/classes', newClass, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        showSnackbar('Class created successfully');
        setCreateDialogOpen(false);
        setNewClass({
          className: '',
          courseCode: '',
          description: '',
          semester: '',
          academicYear: new Date().getFullYear(),
          maxStudents: 50,
          isActive: true
        });
        fetchClasses();
      }
    } catch (error) {
      console.error('Error creating class:', error);
      showSnackbar('Failed to create class', 'error');
    }
  };

  const handleUpdateClass = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosClient.put(`/teacher/classes/${editingClass._id}`, editingClass, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        showSnackbar('Class updated successfully');
        setEditDialogOpen(false);
        setEditingClass(null);
        fetchClasses();
      }
    } catch (error) {
      console.error('Error updating class:', error);
      showSnackbar('Failed to update class', 'error');
    }
  };

  const handleDeleteClass = async (classId) => {
    if (!window.confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      const response = await axiosClient.delete(`/teacher/classes/${classId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        showSnackbar('Class deleted successfully');
        fetchClasses();
      }
    } catch (error) {
      console.error('Error deleting class:', error);
      showSnackbar('Failed to delete class', 'error');
    }
  };

  const handleAddStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosClient.post(`/teacher/classes/${selectedClass._id}/students`, {
        studentIds: selectedStudents
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        showSnackbar('Students added successfully');
        setAddStudentsDialogOpen(false);
        setSelectedStudents([]);
        fetchClasses();
      }
    } catch (error) {
      console.error('Error adding students:', error);
      showSnackbar('Failed to add students', 'error');
    }
  };

  const handleAssignProject = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosClient.post(`/teacher/classes/${selectedClass._id}/assign-project`, {
        projectId: selectedProject
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        showSnackbar('Project assigned successfully');
        setAssignProjectDialogOpen(false);
        setSelectedProject('');
        fetchClasses();
      }
    } catch (error) {
      console.error('Error assigning project:', error);
      showSnackbar('Failed to assign project', 'error');
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls.courseCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && cls.isActive) ||
                         (filterStatus === 'inactive' && !cls.isActive);
    return matchesSearch && matchesStatus;
  });

  const ClassStatsCard = ({ title, value, icon, color, onClick }) => (
    <Paper
      onClick={onClick}
      sx={{
        p: 3,
        borderRadius: 3,
        background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
        border: `1px solid ${alpha(color, 0.2)}`,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: `0 8px 24px ${alpha(color, 0.15)}`,
          borderColor: alpha(color, 0.3)
        } : {},
        height: '100%'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{
          width: 56,
          height: 56,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: alpha(color, 0.1),
          border: `1px solid ${alpha(color, 0.2)}`
        }}>
          {icon}
        </Box>
        <Box>
          <Typography variant="h3" fontWeight="800" color={color}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.main">
            {title}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );

  const StudentPerformanceCard = ({ student }) => (
    <Paper sx={{ p: 2, borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
          {student.name?.charAt(0) || student.username?.charAt(0)}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" fontWeight="600">
            {student.name || student.username}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {student.email}
          </Typography>
        </Box>
        <Chip
          label={`${student.avgScore || 0}%`}
          size="small"
          color={student.avgScore >= 80 ? 'success' : student.avgScore >= 60 ? 'warning' : 'error'}
        />
      </Box>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Box>
          <Typography variant="caption" color="text.secondary">Projects</Typography>
          <Typography variant="body2" fontWeight="600">{student.projectsCount || 0}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">Completed</Typography>
          <Typography variant="body2" fontWeight="600">{student.completedProjects || 0}</Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">Avg Time</Typography>
          <Typography variant="body2" fontWeight="600">{student.avgCompletionTime || 'N/A'}</Typography>
        </Box>
      </Box>
      
      <LinearProgress
        variant="determinate"
        value={student.avgScore || 0}
        sx={{
          height: 6,
          borderRadius: 3,
          backgroundColor: alpha(theme.palette.divider, 0.2)
        }}
      />
    </Paper>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
      <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 2 } }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h4" fontWeight="700" sx={{ mb: 1 }} color="secondary.main">
                Classes Management
              </Typography>
              <Typography variant="body1" color="primary.main">
                Create, manage classes, and track student performance
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                color: 'white',
                borderRadius: 3,
                px: 3,
                py: 1.2,
                fontWeight: 600,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`
                }
              }}
            >
              Create Class
            </Button>
          </Box>

          {/* Quick Stats */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <ClassStatsCard
                title="Total Classes"
                value={classes.length}
                icon={<ClassIcon sx={{ fontSize: 28, color: theme.palette.primary.main }} />}
                color={theme.palette.primary.main}
                onClick={() => setFilterStatus('all')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <ClassStatsCard
                title="Active Classes"
                value={classes.filter(c => c.isActive).length}
                icon={<SchoolIcon sx={{ fontSize: 28, color: theme.palette.success.main }} />}
                color={theme.palette.success.main}
                onClick={() => setFilterStatus('active')}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <ClassStatsCard
                title="Total Students"
                value={classes.reduce((sum, cls) => sum + (cls.students?.length || 0), 0)}
                icon={<PeopleIcon sx={{ fontSize: 28, color: theme.palette.info.main }} />}
                color={theme.palette.info.main}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <ClassStatsCard
                title="Assigned Projects"
                value={classes.reduce((sum, cls) => sum + (cls.projects?.length || 0), 0)}
                icon={<AssignmentIcon sx={{ fontSize: 28, color: theme.palette.warning.main }} />}
                color={theme.palette.warning.main}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Main Content */}
        <Card sx={{ borderRadius: 3, overflow: 'hidden', border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          {/* Toolbar */}
          <Box sx={{ 
            p: 3, 
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            flexWrap: 'wrap'
          }}>
            <TextField
              size="small"
              placeholder="Search classes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 300 }}
            />
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                label="Status"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ flex: 1 }} />
            
            <Tooltip title="Refresh">
              <IconButton onClick={fetchClasses}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Export">
              <IconButton>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="All Classes" />
              <Tab label="Class Details" disabled={!selectedClass} />
              <Tab label="Performance Analytics" />
            </Tabs>
          </Box>

          {/* Tab Content */}
          <Box sx={{ p: 3 }}>
            {tabValue === 0 && (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Class Name</TableCell>
                      <TableCell>Course Code</TableCell>
                      <TableCell>Students</TableCell>
                      <TableCell>Projects</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Semester</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredClasses
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((cls) => (
                        <TableRow 
                          key={cls._id} 
                          hover
                          onClick={() => {
                            setSelectedClass(cls);
                            setTabValue(1);
                          }}
                          sx={{ cursor: 'pointer' }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Box sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: alpha(theme.palette.primary.main, 0.1)
                              }}>
                                <ClassIcon sx={{ color: theme.palette.primary.main }} />
                              </Box>
                              <Box>
                                <Typography variant="subtitle1" fontWeight="600">
                                  {cls.className}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {cls.description?.substring(0, 50)}...
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={cls.courseCode}
                              size="small"
                              sx={{ background: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PeopleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              <Typography>
                                {cls.students?.length || 0} / {cls.maxStudents}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography>
                              {cls.projects?.length || 0} assigned
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={cls.isActive ? 'Active' : 'Inactive'}
                              size="small"
                              color={cls.isActive ? 'success' : 'default'}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            {cls.semester} {cls.academicYear}
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                              <Tooltip title="View Details">
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedClass(cls);
                                    setTabValue(1);
                                  }}
                                >
                                  <ViewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit">
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingClass(cls);
                                    setEditDialogOpen(true);
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClass(cls._id);
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredClasses.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </TableContainer>
            )}

            {tabValue === 1 && selectedClass && (
              <Box>
                {/* Class Header */}
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box>
                      <Typography variant="h5" fontWeight="700" sx={{ mb: 1 }}>
                        {selectedClass.className}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Chip
                          label={selectedClass.courseCode}
                          size="small"
                          sx={{ background: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.main }}
                        />
                        <Chip
                          label={selectedClass.semester + ' ' + selectedClass.academicYear}
                          size="small"
                          icon={<CalendarIcon />}
                        />
                        <Chip
                          label={selectedClass.isActive ? 'Active' : 'Inactive'}
                          size="small"
                          color={selectedClass.isActive ? 'success' : 'default'}
                        />
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        startIcon={<GroupAddIcon />}
                        onClick={() => {
                          fetchAvailableStudents();
                          setAddStudentsDialogOpen(true);
                        }}
                      >
                        Add Students
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<AssignmentIcon />}
                        onClick={() => setAssignProjectDialogOpen(true)}
                      >
                        Assign Project
                      </Button>
                    </Box>
                  </Box>
                  
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    {selectedClass.description}
                  </Typography>
                </Box>

                {/* Class Stats */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ p: 3, borderRadius: 3 }}>
                      <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
                        Class Overview
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Total Students</Typography>
                          <Typography variant="h4" fontWeight="700">
                            {selectedClass.students?.length || 0}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Capacity</Typography>
                          <Typography variant="h4" fontWeight="700">
                            {selectedClass.maxStudents}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Projects Assigned</Typography>
                          <Typography variant="h4" fontWeight="700">
                            {selectedClass.projects?.length || 0}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">Avg Score</Typography>
                          <Typography variant="h4" fontWeight="700" color={theme.palette.success.main}>
                            {selectedClass.averageScore || 0}%
                          </Typography>
                        </Grid>
                      </Grid>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Card sx={{ p: 3, borderRadius: 3 }}>
                      <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
                        Recent Activity
                      </Typography>
                      <List>
                        {selectedClass.recentActivity?.slice(0, 3).map((activity, index) => (
                          <ListItem key={index}>
                            <ListItemIcon>
                              {activity.type === 'project_assigned' && <AssignmentIcon />}
                              {activity.type === 'student_added' && <PersonAddIcon />}
                              {activity.type === 'grade_updated' && <TrendingUpIcon />}
                            </ListItemIcon>
                            <ListItemText
                              primary={activity.message}
                              secondary={new Date(activity.timestamp).toLocaleDateString()}
                            />
                          </ListItem>
                        )) || (
                          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                            No recent activity
                          </Typography>
                        )}
                      </List>
                    </Card>
                  </Grid>
                </Grid>

                {/* Students Section */}
                <Card sx={{ mb: 4, borderRadius: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h6" fontWeight="600">
                        Enrolled Students ({selectedClass.students?.length || 0})
                      </Typography>
                      <Button
                        variant="text"
                        startIcon={<EmailIcon />}
                        onClick={() => showSnackbar('Bulk email feature coming soon!', 'info')}
                      >
                        Email All
                      </Button>
                    </Box>
                    
                    {selectedClass.students && selectedClass.students.length > 0 ? (
                      <TableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell>Student</TableCell>
                              <TableCell>Email</TableCell>
                              <TableCell>Projects</TableCell>
                              <TableCell>Avg Score</TableCell>
                              <TableCell>Status</TableCell>
                              <TableCell align="right">Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {selectedClass.students.map((student) => (
                              <TableRow key={student._id}>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar sx={{ width: 32, height: 32 }}>
                                      {student.name?.charAt(0) || student.username?.charAt(0)}
                                    </Avatar>
                                    <Typography variant="body2">
                                      {student.name || student.username}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" color="text.secondary">
                                    {student.email}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  {student.projectsCount || 0}
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={`${student.avgScore || 0}%`}
                                    size="small"
                                    color={student.avgScore >= 80 ? 'success' : student.avgScore >= 60 ? 'warning' : 'error'}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={student.isActive ? 'Active' : 'Inactive'}
                                    size="small"
                                    color={student.isActive ? 'success' : 'default'}
                                    variant="outlined"
                                  />
                                </TableCell>
                                <TableCell align="right">
                                  <IconButton size="small">
                                    <MoreVertIcon />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <PeopleIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2, opacity: 0.5 }} />
                        <Typography variant="body1" color="text.secondary" gutterBottom>
                          No students enrolled yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                          Add students to start tracking their performance
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<GroupAddIcon />}
                          onClick={() => setAddStudentsDialogOpen(true)}
                        >
                          Add Students
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>

                {/* Assigned Projects */}
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h6" fontWeight="600">
                        Assigned Projects ({selectedClass.projects?.length || 0})
                      </Typography>
                    </Box>
                    
                    {selectedClass.projects && selectedClass.projects.length > 0 ? (
                      <Grid container spacing={2}>
                        {selectedClass.projects.map((project) => (
                          <Grid item xs={12} md={6} key={project._id}>
                            <Paper sx={{ p: 2, borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                <Box>
                                  <Typography variant="subtitle1" fontWeight="600">
                                    {project.projectName}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Due: {new Date(project.endDate).toLocaleDateString()}
                                  </Typography>
                                </Box>
                                <Chip
                                  label={project.status}
                                  size="small"
                                  color={project.status === 'completed' ? 'success' : project.status === 'ongoing' ? 'primary' : 'default'}
                                />
                              </Box>
                              
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {project.description?.substring(0, 100)}...
                              </Typography>
                              
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <AvatarGroup max={3}>
                                  {project.teamMembers?.slice(0, 3).map((member, idx) => (
                                    <Tooltip key={idx} title={member.name}>
                                      <Avatar sx={{ width: 28, height: 28 }}>
                                        {member.name?.charAt(0)}
                                      </Avatar>
                                    </Tooltip>
                                  ))}
                                </AvatarGroup>
                                <Button
                                  size="small"
                                  onClick={() => navigate(`/teacher-app/projects/${project._id}`)}
                                >
                                  View Details
                                </Button>
                              </Box>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <AssignmentIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2, opacity: 0.5 }} />
                        <Typography variant="body1" color="text.secondary" gutterBottom>
                          No projects assigned yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                          Assign a project to track student work
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<AssignmentIcon />}
                          onClick={() => setAssignProjectDialogOpen(true)}
                        >
                          Assign Project
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Box>
            )}

            {tabValue === 2 && (
              <Box>
                <Typography variant="h5" fontWeight="700" sx={{ mb: 3 }}>
                  Performance Analytics
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <Card sx={{ p: 3, borderRadius: 3 }}>
                      <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
                        Class-wise Performance
                      </Typography>
                      
                      {classes.length > 0 ? (
                        <Grid container spacing={3}>
                          {classes.map((cls) => (
                            <Grid item xs={12} md={6} lg={4} key={cls._id}>
                              <Paper sx={{ p: 3, borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                  <Box>
                                    <Typography variant="subtitle1" fontWeight="600">
                                      {cls.className}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {cls.courseCode}
                                    </Typography>
                                  </Box>
                                  <Chip
                                    label={`${cls.averageScore || 0}%`}
                                    color={cls.averageScore >= 80 ? 'success' : cls.averageScore >= 60 ? 'warning' : 'error'}
                                  />
                                </Box>
                                
                                <Box sx={{ mb: 2 }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                    <Typography variant="caption" color="text.secondary">
                                      Progress
                                    </Typography>
                                    <Typography variant="caption" fontWeight="600">
                                      {cls.completionRate || 0}%
                                    </Typography>
                                  </Box>
                                  <LinearProgress
                                    variant="determinate"
                                    value={cls.completionRate || 0}
                                    sx={{
                                      height: 6,
                                      borderRadius: 3,
                                      backgroundColor: alpha(theme.palette.divider, 0.2)
                                    }}
                                  />
                                </Box>
                                
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">Students</Typography>
                                    <Typography variant="body2" fontWeight="600">
                                      {cls.students?.length || 0}
                                    </Typography>
                                  </Box>
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">Projects</Typography>
                                    <Typography variant="body2" fontWeight="600">
                                      {cls.projects?.length || 0}
                                    </Typography>
                                  </Box>
                                  <Box>
                                    <Typography variant="caption" color="text.secondary">Avg Time</Typography>
                                    <Typography variant="body2" fontWeight="600">
                                      {cls.avgProjectTime || 'N/A'}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Paper>
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                          <TrendingUpIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2, opacity: 0.5 }} />
                          <Typography variant="body1" color="text.secondary">
                            No classes available for analytics
                          </Typography>
                        </Box>
                      )}
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
        </Card>
      </Container>

      {/* Create Class Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Class</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Class Name"
              value={newClass.className}
              onChange={(e) => setNewClass({...newClass, className: e.target.value})}
              fullWidth
              required
            />
            <TextField
              label="Course Code"
              value={newClass.courseCode}
              onChange={(e) => setNewClass({...newClass, courseCode: e.target.value})}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={newClass.description}
              onChange={(e) => setNewClass({...newClass, description: e.target.value})}
              multiline
              rows={3}
              fullWidth
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Semester"
                value={newClass.semester}
                onChange={(e) => setNewClass({...newClass, semester: e.target.value})}
                fullWidth
                required
              />
              <TextField
                label="Academic Year"
                type="number"
                value={newClass.academicYear}
                onChange={(e) => setNewClass({...newClass, academicYear: parseInt(e.target.value)})}
                fullWidth
                required
              />
            </Box>
            <TextField
              label="Maximum Students"
              type="number"
              value={newClass.maxStudents}
              onChange={(e) => setNewClass({...newClass, maxStudents: parseInt(e.target.value)})}
              fullWidth
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Switch
                checked={newClass.isActive}
                onChange={(e) => setNewClass({...newClass, isActive: e.target.checked})}
              />
              <Typography>Active Class</Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateClass} 
            variant="contained"
            disabled={!newClass.className || !newClass.courseCode}
          >
            Create Class
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Class Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Class</DialogTitle>
        <DialogContent>
          {editingClass && (
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Class Name"
                value={editingClass.className}
                onChange={(e) => setEditingClass({...editingClass, className: e.target.value})}
                fullWidth
                required
              />
              <TextField
                label="Course Code"
                value={editingClass.courseCode}
                onChange={(e) => setEditingClass({...editingClass, courseCode: e.target.value})}
                fullWidth
                required
              />
              <TextField
                label="Description"
                value={editingClass.description}
                onChange={(e) => setEditingClass({...editingClass, description: e.target.value})}
                multiline
                rows={3}
                fullWidth
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Semester"
                  value={editingClass.semester}
                  onChange={(e) => setEditingClass({...editingClass, semester: e.target.value})}
                  fullWidth
                  required
                />
                <TextField
                  label="Academic Year"
                  type="number"
                  value={editingClass.academicYear}
                  onChange={(e) => setEditingClass({...editingClass, academicYear: parseInt(e.target.value)})}
                  fullWidth
                  required
                />
              </Box>
              <TextField
                label="Maximum Students"
                type="number"
                value={editingClass.maxStudents}
                onChange={(e) => setEditingClass({...editingClass, maxStudents: parseInt(e.target.value)})}
                fullWidth
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Switch
                  checked={editingClass.isActive}
                  onChange={(e) => setEditingClass({...editingClass, isActive: e.target.checked})}
                />
                <Typography>Active Class</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleUpdateClass} 
            variant="contained"
            disabled={!editingClass?.className || !editingClass?.courseCode}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Students Dialog */}
      <Dialog open={addStudentsDialogOpen} onClose={() => setAddStudentsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Students to Class</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Select Students</InputLabel>
              <Select
                multiple
                value={selectedStudents}
                onChange={(e) => setSelectedStudents(e.target.value)}
                input={<OutlinedInput label="Select Students" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => {
                      const student = availableStudents.find(s => s._id === value);
                      return (
                        <Chip
                          key={value}
                          label={student?.name || student?.username}
                          size="small"
                        />
                      );
                    })}
                  </Box>
                )}
              >
                {availableStudents.map((student) => (
                  <MenuItem key={student._id} value={student._id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ width: 24, height: 24 }}>
                        {student.name?.charAt(0) || student.username?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2">{student.name || student.username}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {student.email}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddStudentsDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAddStudents} 
            variant="contained"
            disabled={selectedStudents.length === 0}
          >
            Add Students
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Project Dialog */}
      <Dialog open={assignProjectDialogOpen} onClose={() => setAssignProjectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Project to Class</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Select Project</InputLabel>
              <Select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                label="Select Project"
              >
                {availableProjects.map((project) => (
                  <MenuItem key={project._id} value={project._id}>
                    <Box>
                      <Typography variant="body2">{project.projectName}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Due: {new Date(project.endDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignProjectDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAssignProject} 
            variant="contained"
            disabled={!selectedProject}
          >
            Assign Project
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}