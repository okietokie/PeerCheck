import React, { useState, useEffect } from 'react';
import { alpha } from "@mui/material/styles";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  InputAdornment,
  Paper,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Group as GroupIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { FiEdit3, FiX, FiCircle } from 'react-icons/fi';
import axiosClient from '@/api/axiosClient';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editProject, setEditProject] = useState(null);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    dueDate: '',
    status: 'active',
    attributes: []
  });

  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    dueDate: '',
    attributes: []
  });

  useEffect(() => {
    fetchUserProjects();
  }, []);

  const fetchUserProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosClient.get('/user/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setUsername(response.data.username);
      setProjects(response.data.userProjects || []);
    } catch (err) {
      setError('Error loading projects. Please try again.');
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    try {
      const token = localStorage.getItem('token');
      const sendProject = {
        ...newProject,
        dueDate: new Date(newProject.dueDate),
      };
      
      await axiosClient.post('/user/create-project', sendProject, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setCreateDialogOpen(false);
      setNewProject({ name: '', description: '', dueDate: '', attributes: [] });
      fetchUserProjects();
    } catch (err) {
      setError('Error creating project. Please try again.');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const token = localStorage.getItem('token');
        await axiosClient.delete(`/user/del-project/${projectId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchUserProjects();
      } catch (err) {
        setError('Error deleting project. Please try again.');
      }
    }
  };

  const handleEdit = (project) => {
    setEditProject(project);
    setEditFormData({
      name: project.name,
      description: project.description,
      dueDate: project.dueDate?.split('T')[0] || '',
      status: project.status,
      attributes: project.attributes || []
    });
  };

  const handleUpdateProject = async () => {
    try {
      const token = localStorage.getItem('token');
      await axiosClient.put(`/user/update-project/${editProject._id}`, editFormData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setEditProject(null);
      fetchUserProjects();
      setError('');
    } catch (err) {
      setError('Error updating project. Please try again.');
    }
  };

  const handleCloseEdit = () => {
    setEditProject(null);
    setEditFormData({
      name: '',
      description: '',
      dueDate: '',
      status: 'active',
      attributes: []
    });
  };

  // Filter projects based on search and status
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calculate paginated projects
  const paginatedProjects = filteredProjects.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Calculate metrics
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === 'active').length;
  const completedProjects = projects.filter((p) => p.status === 'completed').length;

  const handleView = (project) => {
    setSelectedProject(project);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

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
          <Typography variant="h4" gutterBottom color="text.primary">
            You don't have any projects yet, {username}!
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
            Start your journey by creating your first project and collaborate with your peers.
          </Typography>

          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            sx={{ mb: 4 }}
          >
            Create Your First Project
          </Button>
        </Paper>

        <CreateProjectDialog
          open={createDialogOpen}
          onClose={() => setCreateDialogOpen(false)}
          project={newProject}
          onChange={setNewProject}
          onSubmit={handleCreateProject}
        />
      </Container>
    );
  }

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
              Your Projects
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome back, {username}! Manage and track your projects.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create New Project
          </Button>
        </Box>

        {/* Metrics */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h3" color="primary" gutterBottom>
                {totalProjects}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Total Projects
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h3" color="success.main" gutterBottom>
                {activeProjects}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Active Projects
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h3" color="primary.main" gutterBottom>
                {completedProjects}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Completed
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Search and Filter Bar */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search projects..."
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
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Status Filter</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status Filter"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="on-hold">On Hold</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Projects Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Project Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Members</TableCell>
                <TableCell>Tasks</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedProjects.map((project) => (
                <TableRow key={project._id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="600">
                      {project.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={project.description}>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {project.description}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={project.status} 
                      color={getStatusColor(project.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'No due date'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <GroupIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {project.members?.length || 0}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {project.tasks?.length || 0}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" justifyContent="center" gap={1}>
                      <Tooltip title="View Project">
                        <IconButton size="small" onClick={() => handleView(project)} color="primary">
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Project">
                        <IconButton size="small" onClick={() => handleEdit(project)} color="secondary">
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Project">
                        <IconButton size="small" onClick={() => handleDeleteProject(project._id)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredProjects.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>

      {/* Edit Project Dialog */}
      {editProject && (
        <Dialog open={!!editProject} onClose={handleCloseEdit} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label="Project Name"
                value={editFormData.name}
                onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Description"
                value={editFormData.description}
                onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                margin="normal"
                multiline
                rows={3}
                required
              />
              <TextField
                fullWidth
                label="Due Date"
                type="date"
                value={editFormData.dueDate}
                onChange={(e) => setEditFormData({...editFormData, dueDate: e.target.value})}
                margin="normal"
                InputLabelProps={{ shrink: true }}
                required
              />
              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  value={editFormData.status}
                  label="Status"
                  onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="on-hold">On Hold</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEdit}>Cancel</Button>
            <Button 
              onClick={handleUpdateProject} 
              variant="contained"
              disabled={!editFormData.name || !editFormData.description || !editFormData.dueDate}
            >
              Update Project
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Project Detail View */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onEdit={handleEdit}
        />
      )}

      {/* Create Project Dialog */}
      <CreateProjectDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        project={newProject}
        onChange={setNewProject}
        onSubmit={handleCreateProject}
      />
    </Container>
  );
};

// Project Detail Modal Component
const ProjectDetailModal = ({ project, onClose, onEdit }) => {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(4px)',
        zIndex: 1300,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 2
      }}
      onClick={onClose}
    >
      <Card
        onClick={(e) => e.stopPropagation()}
        sx={{
          position: 'relative',
          width: { xs: '95%', sm: '85%', md: 650 },
          maxWidth: 650,
          maxHeight: '90vh',
          overflowY: 'auto',
          bgcolor: (theme) => theme.palette.background.paper,
          boxShadow: '0 32px 64px rgba(0,0,0,0.2), 0 16px 32px rgba(0,0,0,0.1)',
          borderRadius: 4,
          p: 0,
          border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.background.paper} 0%, 
            ${alpha(theme.palette.background.default, 0.8)} 100%)`,

          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.main} 0%, 
              ${theme.palette.secondary.main} 100%)`,
          }
        }}
      >
        {/* Header */}
        <Box
          sx={{
            background: (theme) =>
              `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.9)} 0%, 
              ${alpha(theme.palette.secondary.main, 0.8)} 100%)`,
            color: (theme) => theme.palette.primary.contrastText,
            p: 4,
            position: 'relative',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box sx={{ flex: 1, mr: 2 }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 600,
                  mb: 1.5,
                  fontFamily: '"Adlam Display", serif',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                {project.name}
              </Typography>

              <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
                <Chip
                  icon={<FiCircle style={{ fontSize: 12 }} />}
                  label={project.status}
                  size="small"
                  sx={{
                    background: (theme) => alpha(theme.palette.primary.contrastText, 0.15),
                    color: (theme) => theme.palette.primary.contrastText,
                    fontWeight: 600,
                    backdropFilter: 'blur(10px)',
                    border: (theme) =>
                      `1px solid ${alpha(theme.palette.primary.contrastText, 0.2)}`
                  }}
                />
              </Box>
            </Box>

            <Box display="flex" gap={1}>
              <IconButton
                onClick={() => onEdit(project)}
                sx={{
                  color: (theme) => theme.palette.primary.contrastText,
                  background: (theme) => alpha(theme.palette.primary.contrastText, 0.1),
                  border: (theme) =>
                    `1px solid ${alpha(theme.palette.primary.contrastText, 0.2)}`
                }}
              >
                <FiEdit3 />
              </IconButton>

              <IconButton
                onClick={onClose}
                sx={{
                  color: (theme) => theme.palette.primary.contrastText,
                  background: (theme) => alpha(theme.palette.primary.contrastText, 0.1),
                  border: (theme) =>
                    `1px solid ${alpha(theme.palette.primary.contrastText, 0.2)}`
                }}
              >
                <FiX />
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ p: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                fontFamily: '"Inter", sans-serif',
                mb: 1
              }}
            >
              Project Description
            </Typography>

            <Typography
              sx={{
                p: 3,
                background: (theme) => alpha(theme.palette.primary.main, 0.03),
                borderRadius: 3,
                border: (theme) => `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                fontFamily: '"Inter", sans-serif'
              }}
            >
              {project.description}
            </Typography>
          </Box>

          {/* Project Details */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Card variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Due Date
                </Typography>
                <Typography variant="body1" fontWeight="500">
                  {project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'Not set'}
                </Typography>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Team Members
                </Typography>
                <Typography variant="body1" fontWeight="500">
                  {project.members?.length || 0} members
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Card>
    </Box>
  );
};

// Create Project Dialog Component
const CreateProjectDialog = ({ open, onClose, project, onChange, onSubmit }) => {
  const handleInputChange = (field, value) => {
    onChange({
      ...project,
      [field]: value
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Project</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <TextField
            fullWidth
            label="Project Name"
            value={project.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Description"
            value={project.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            margin="normal"
            multiline
            rows={3}
            required
          />
          <TextField
            fullWidth
            label="Due Date"
            type="date"
            value={project.dueDate}
            onChange={(e) => handleInputChange('dueDate', e.target.value)}
            margin="normal"
            InputLabelProps={{ shrink: true }}
            required
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={onSubmit} 
          variant="contained"
          disabled={!project.name || !project.description || !project.dueDate}
        >
          Create Project
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Helper function to get status color
const getStatusColor = (status) => {
  switch (status) {
    case 'active': return 'success';
    case 'completed': return 'primary';
    case 'on-hold': return 'warning';
    default: return 'default';
  }
};

export default Projects;