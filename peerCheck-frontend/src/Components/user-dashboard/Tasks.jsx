import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Button, Card, CardContent, Grid, Chip, IconButton, TextField, MenuItem, InputAdornment, Paper, Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Avatar, AvatarGroup, LinearProgress} 
            from '@mui/material';

import { Add as AddIcon, Search as SearchIcon, FilterList as FilterIcon, Visibility as ViewIcon, Edit as EditIcon, Delete as DeleteIcon, CheckCircle as CheckCircleIcon, Schedule as ScheduleIcon, Flag as FlagIcon, Person as PersonIcon, Assignment as AssignmentIcon} from '@mui/icons-material';

import axiosClient from '@/api/axiosClient';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    project: '',
    assignedTo: [],
    dueDate: '',
    priority: 'medium'
  });

  // Fetch tasks and projects on component mount
  useEffect(() => {
    fetchTasksAndProjects();
  }, []);

  const fetchTasksAndProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch user projects
      const projectsResponse = await axiosClient.get('/user/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setProjects(projectsResponse.data.userProjects || []);
      
      // If user has projects, fetch tasks for the first project
      if (projectsResponse.data.userProjects?.length > 0) {
        const firstProject = projectsResponse.data.userProjects[0];
        setSelectedProject(firstProject._id);
        await fetchTasksForProject(firstProject._id);
      } else {
        setLoading(false);
      }

    } catch (err) {
      setError('Error loading data. Please try again.');
      console.error('Error fetching data:', err);
      setLoading(false);
    }
  };

  const fetchTasksForProject = async (projectId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosClient.get(`/user/tasks/${projectId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setTasks(response.data.tasks || []);
    } catch (err) {
      setError('Error loading tasks. Please try again.');
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosClient.post('/user/create-task', newTask, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setCreateDialogOpen(false);
      setNewTask({
        title: '',
        description: '',
        project: selectedProject,
        assignedTo: [],
        dueDate: '',
        priority: 'medium'
      });
      
      // Refresh tasks
      if (selectedProject) {
        await fetchTasksForProject(selectedProject);
      }

    } catch (err) {
      setError('Error creating task. Please try again.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const token = localStorage.getItem('token');
        await axiosClient.delete(`/user/del-task/${taskId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        // Refresh tasks
        if (selectedProject) {
          await fetchTasksForProject(selectedProject);
        }
        
      } catch (err) {
        setError('Error deleting task. Please try again.');
      }
    }
  };

  const handleMarkComplete = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      await axiosClient.put(`/user/tasks/${taskId}/status`, {
        status: 'completed'
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Refresh tasks
      if (selectedProject) {
        await fetchTasksForProject(selectedProject);
      }
      
    } catch (err) {
      setError('Error updating task. Please try again.');
    }
  };

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Calculate metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const pendingTasks = tasks.filter((t) => t.status === 'pending').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress').length;
  
  const overdueTasks = tasks.filter((t) => 
    t.status !== 'completed' && new Date(t.dueDate) < new Date()
  ).length;

  // Pagination
  const paginatedTasks = filteredTasks.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'primary';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  // Empty state for no projects
  if (projects.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper
          elevation={0}
          sx={{
            textAlign: 'center',
            py: 8,
            px: 4,
            borderRadius: 2,
            backgroundColor: 'background.default'
          }}
        >
          <Box sx={{ mb: 4 }}>
            <AssignmentIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          </Box>
          
          <Typography variant="h4" gutterBottom color="text.primary">
            No Projects Found
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
            You need to create a project first before you can add tasks.
          </Typography>

          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => window.location.href = '/projects'}
            sx={{ mb: 4 }}
          >
            Go to Projects
          </Button>
        </Paper>
      </Container>
    );
  }

  // Empty state for no tasks
  if (tasks.length === 0 && selectedProject) {
    const currentProject = projects.find(p => p._id === selectedProject);
    
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper
          elevation={0}
          sx={{
            textAlign: 'center',
            py: 8,
            px: 4,
            borderRadius: 2,
            backgroundColor: 'background.default'
          }}
        >
          <Box sx={{ mb: 4 }}>
            <AssignmentIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          </Box>
          
          <Typography variant="h4" gutterBottom color="text.primary">
            No tasks yet for {currentProject?.name}!
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
            Start organizing your project by creating your first task.
          </Typography>

          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{ mb: 4 }}
          >
            Add Your First Task
          </Button>

          {/* Tips Section */}
          <Paper variant="outlined" sx={{ p: 3, maxWidth: 400, mx: 'auto' }}>
            <Typography variant="h6" gutterBottom color="primary">
              Quick Tips for Task Management
            </Typography>
            <Box textAlign="left">
              <Typography variant="body2" sx={{ mb: 1 }}>
                • Assign tasks to team members for clear ownership
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • Set deadlines and priorities to stay organized
              </Typography>
              <Typography variant="body2">
                • Track progress and update status regularly
              </Typography>
            </Box>
          </Paper>
        </Paper>

        {/* Create Task Dialog */}
        <CreateTaskDialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          task={newTask}
          onChange={setNewTask}
          onSubmit={handleCreateTask}
          projects={projects}
          selectedProject={selectedProject}
        />
      </Container>
    );
  }

  // Main tasks view
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Task Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage and track all tasks for your projects
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Add New Task
          </Button>
        </Box>

        {/* Project Selector */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel>Select Project</InputLabel>
            <Select
              value={selectedProject}
              label="Select Project"
              onChange={(e) => {
                setSelectedProject(e.target.value);
                fetchTasksForProject(e.target.value);
              }}
            >
              {projects.map((project) => (
                <MenuItem key={project._id} value={project._id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>

        {/* Metrics */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h3" color="primary" gutterBottom>
                {totalTasks}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Tasks
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h3" color="success.main" gutterBottom>
                {completedTasks}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h3" color="primary.main" gutterBottom>
                {inProgressTasks}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                In Progress
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h3" color="warning.main" gutterBottom>
                {pendingTasks}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h3" color="error.main" gutterBottom>
                {overdueTasks}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Overdue
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Search and Filter Bar */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={priorityFilter}
                  label="Priority"
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <MenuItem value="all">All Priority</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Tasks Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader aria-label="tasks table">
            <TableHead>
              <TableRow>
                <TableCell>Task</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedTasks.map((task) => (
                <TableRow 
                  key={task._id}
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    backgroundColor: task.status === 'completed' ? 'action.hover' : 'inherit'
                  }}
                >
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle1" fontWeight="600">
                        {task.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {task.description}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <AvatarGroup max={3}>
                      {task.assignedTo?.map((assignment, index) => (
                        <Avatar key={index} sx={{ width: 32, height: 32 }}>
                          <PersonIcon />
                        </Avatar>
                      ))}
                    </AvatarGroup>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={task.status} 
                      color={getStatusColor(task.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={task.priority} 
                      color={getPriorityColor(task.priority)}
                      size="small"
                      icon={<FlagIcon />}
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {formatDate(task.dueDate)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ width: '100%', mr: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={task.assignedTo?.[0]?.progessPercent || 0}
                        color={getStatusColor(task.status)}
                        sx={{ height: 8, borderRadius: 4 }}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {task.assignedTo?.[0]?.progessPercent || 0}%
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" justifyContent="center" gap={0.5}>
                      <IconButton size="small" color="primary" title="View Task">
                        <ViewIcon />
                      </IconButton>
                      <IconButton size="small" color="default" title="Edit Task">
                        <EditIcon />
                      </IconButton>
                      {task.status !== 'completed' && (
                        <IconButton 
                          size="small" 
                          color="success" 
                          title="Mark Complete"
                          onClick={() => handleMarkComplete(task._id)}
                        >
                          <CheckCircleIcon />
                        </IconButton>
                      )}
                      <IconButton 
                        size="small" 
                        color="error" 
                        title="Delete Task"
                        onClick={() => handleDeleteTask(task._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredTasks.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Create Task Dialog */}
      <CreateTaskDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        task={newTask}
        onChange={setNewTask}
        onSubmit={handleCreateTask}
        projects={projects}
        selectedProject={selectedProject}
      />
    </Container>
  );
};

// Create Task Dialog Component
const CreateTaskDialog = ({ open, onClose, task, onChange, onSubmit, projects, selectedProject }) => {
  const handleInputChange = (field, value) => {
    onChange({
      ...task,
      [field]: value
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Task</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Project</InputLabel>
            <Select
              value={task.project || selectedProject}
              label="Project"
              onChange={(e) => handleInputChange('project', e.target.value)}
              required
            >
              {projects.map((project) => (
                <MenuItem key={project._id} value={project._id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Task Title"
            value={task.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Description"
            value={task.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            margin="normal"
            multiline
            rows={3}
          />
          <TextField
            fullWidth
            label="Due Date"
            type="date"
            value={task.dueDate}
            onChange={(e) => handleInputChange('dueDate', e.target.value)}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Priority</InputLabel>
            <Select
              value={task.priority}
              label="Priority"
              onChange={(e) => handleInputChange('priority', e.target.value)}
            >
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={onSubmit} 
          variant="contained"
          disabled={!task.title || !task.dueDate || !task.project}
        >
          Create Task
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Tasks;