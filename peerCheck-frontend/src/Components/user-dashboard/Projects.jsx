import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Alert,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Avatar,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  LinearProgress,
  Chip,
  Stack,
  alpha,
  useTheme,
  CircularProgress,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  FormControlLabel,
  Checkbox as MuiCheckbox
} from '@mui/material';
import {
  Search,
  Add,
  Group,
  FilterList,
  Close,
  AddTask,
  CalendarToday,
  Grade,
  Delete,
  Tag,
  People,
  Assessment,
  AccessTime,
  CheckCircle,
  PauseCircle,
  PlayCircle,
  FlagOutlined,
  Flag
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axiosClient from '@/api/axiosClient';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Helper to get auth token properly
const getAuthToken = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.warn('No token found in localStorage');
    return null;
  }
  return token;
};

// Helper to get user data
const getUserData = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch (err) {
    console.error('Error parsing user data:', err);
    return null;
  }
};

// Create Project Modal Component
const CreateProjectModal = ({ open, onClose, theme, onProjectCreated }) => {
  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tags: '',
    teamName: '',
    teamId: '',
    allowPeerReview: true,
    taskCompletionWeight: 40,
    
    peerReviewWeight: 30,
    teacherReviewWeight: 30
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [teams, setTeams] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);

  // Fetch user's teams
  useEffect(() => {
    const fetchUserTeams = async () => {
      try {
        const token = getAuthToken();
        if (!token) return;

        const response = await axiosClient.get("/user/teams", {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const teamsData = response.data?.teams || [];
        setTeams(Array.isArray(teamsData) ? teamsData : []);
        

      } catch (err) {
        console.error('Error fetching teams:', err);
      }
    };

    if (open) {
      fetchUserTeams();
      setTags([]);
      setError('');
    }
  }, [open]);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    
    // Handle weight changes to ensure they sum to 100
    if (field === 'taskCompletionWeight') {
      const weight = parseInt(value) || 0;
      setFormData(prev => ({
        ...prev,
        [field]: weight,
        peerReviewWeight: 30,
        teacherReviewWeight: 70 - weight
      }));
    } else if (field === 'peerReviewWeight') {
      const weight = parseInt(value) || 0;
      setFormData(prev => ({
        ...prev,
        [field]: weight,
        teacherReviewWeight: 100 - (prev.taskCompletionWeight + weight)
      }));
    } else if (field === 'teacherReviewWeight') {
      const weight = parseInt(value) || 0;
      setFormData(prev => ({
        ...prev,
        [field]: weight,
        peerReviewWeight: 100 - (prev.taskCompletionWeight + weight)
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleTagAdd = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTagAdd();
    }
  };

  const validateForm = () => {
    if (!formData.projectName.trim()) {
      setError('Project name is required');
      return false;
    }
    
    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }
    
    if (!formData.startDate) {
      setError('Start date is required');
      return false;
    }
    
    if (!formData.endDate) {
      setError('End date is required');
      return false;
    }
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    
    if (end <= start) {
      setError('End date must be after start date');
      return false;
    }
    
    if (teams.length > 0 && !formData.teamId) {
      setError('Please select a team for the project');
      return false;
    }
    
    // Validate weights sum to 100
    const totalWeight = formData.taskCompletionWeight + formData.peerReviewWeight + formData.teacherReviewWeight;
    if (totalWeight !== 100) {
      setError('Grading weights must sum to 100%');
      return false;
    }
    
    return true;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const token = getAuthToken();
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }
  
      // Get the selected team object
      const selectedTeam = teams.find(team => 
        (team._id || team.id) === formData.teamId
      );
      
      const projectData = {
        projectName: formData.projectName.trim(),
        description: formData.description.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        tags: tags,
        teamId: formData.teamId ? [formData.teamId] : [],
        teamName: selectedTeam?.teamName || selectedTeam?.name || 'Unnamed Team', 
        gradingCriteria: {
          taskCompletionWeight: formData.taskCompletionWeight,
          peerReviewWeight: formData.peerReviewWeight,
          teacherReviewWeight: formData.teacherReviewWeight,
          allowPeerReview: formData.allowPeerReview
        }
      };
  
      console.log('Creating project with data:', projectData); // Add for debugging
  
      const response = await axiosClient.post('/projects', projectData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Project created response:', response.data); // Add for debugging
      
      if (onProjectCreated) {
        onProjectCreated(response.data);
      }
      
      onClose();
      
    } catch (err) {
      console.error('Error creating project:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.error || err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };
  return (
    <Dialog 
      open={open} 
      onClose={!loading ? onClose : undefined} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          backgroundColor: theme.palette.background.paper,
        }
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="600">
            Create New Project
          </Typography>
          <IconButton 
            onClick={onClose} 
            disabled={loading} 
            size="small"
            sx={{
              color: theme.palette.text.secondary,
              '&:hover': {
                backgroundColor: alpha(theme.palette.action.hover, 0.1),
              }
            }}
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers sx={{ pt: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Project Name"
                value={formData.projectName}
                onChange={handleChange('projectName')}
                disabled={loading}
                required
                size="small"
                InputProps={{
                  sx: { borderRadius: 1 }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={handleChange('description')}
                multiline
                rows={4}
                disabled={loading}
                required
                size="small"
                InputProps={{
                  sx: { borderRadius: 1 }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={handleChange('startDate')}
                InputLabelProps={{ shrink: true }}
                disabled={loading}
                required
                size="small"
                InputProps={{
                  sx: { borderRadius: 1 }
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={handleChange('endDate')}
                InputLabelProps={{ shrink: true }}
                disabled={loading}
                required
                size="small"
                InputProps={{
                  sx: { borderRadius: 1 }
                }}
              />
            </Grid>
            
            {teams.length > 0 && (
              <Grid item xs={12}>
                <FormControl fullWidth size="small">
                  <InputLabel>Select Team</InputLabel>
                  <Select
                    value={formData.teamId}
                    onChange={handleChange('teamId')}
                    label="Select Team"
                    disabled={loading}
                    sx={{ borderRadius: 1 }}
                  >
                    {teams.map(team => (
                      <MenuItem key={team._id || team.id} value={team._id || team.id}>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Avatar 
                            sx={{ 
                              width: 28, 
                              height: 28, 
                              fontSize: 12,
                              bgcolor: theme.palette.primary.main 
                            }}
                          >
                            {team.teamName?.charAt(0) || 'T'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="500">
                              {team.teamName || team.name || 'Unnamed Team'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {team.members?.length || 0} members
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <FormControl fullWidth size="small">
                <TextField
                  label="Add Tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                  size="small"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton 
                          onClick={handleTagAdd} 
                          disabled={!tagInput.trim()}
                          size="small"
                          sx={{ mr: -1 }}
                        >
                          <Add fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 1 }
                  }}
                />
              </FormControl>
              
              {tags.length > 0 && (
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      onDelete={() => handleTagRemove(tag)}
                      deleteIcon={<Close fontSize="small" />}
                      sx={{
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        '& .MuiChip-deleteIcon': {
                          color: alpha(theme.palette.primary.main, 0.6),
                          '&:hover': {
                            color: theme.palette.primary.main,
                          }
                        }
                      }}
                    />
                  ))}
                </Box>
              )}
            </Grid>
            
            <Grid item xs={12}>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2.5, 
                  borderRadius: 1.5,
                  backgroundColor: alpha(theme.palette.primary.main, 0.02),
                  borderColor: alpha(theme.palette.primary.main, 0.1)
                }}
              >
                <Typography variant="subtitle1" fontWeight="600" gutterBottom sx={{ mb: 2 }}>
                  Grading Criteria
                </Typography>
                
                <FormControlLabel
                  control={
                    <MuiCheckbox
                      checked={formData.allowPeerReview}
                      onChange={(e) => handleChange('allowPeerReview')({ target: { value: e.target.checked } })}
                      size="small"
                    />
                  }
                  label={
                    <Typography variant="body2">
                      Allow Peer Review
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        (Team members can evaluate each other)
                      </Typography>
                    </Typography>
                  }
                  sx={{ mb: 2 }}
                />
                
                <Typography variant="body2" fontWeight="500" gutterBottom sx={{ mt: 2 }}>
                  Grading Weights (Total must equal 100%)
                </Typography>
                
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Task Completion"
                      type="number"
                      value={formData.taskCompletionWeight}
                      onChange={handleChange('taskCompletionWeight')}
                      disabled={loading}
                      size="small"
                      inputProps={{ min: 0, max: 100, step: 5 }}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        sx: { borderRadius: 1 }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Peer Review"
                      type="number"
                      value={formData.peerReviewWeight}
                      onChange={handleChange('peerReviewWeight')}
                      disabled={loading}
                      size="small"
                      inputProps={{ min: 0, max: 100, step: 5 }}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        sx: { borderRadius: 1 }
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Teacher Review"
                      type="number"
                      value={formData.teacherReviewWeight}
                      onChange={handleChange('teacherReviewWeight')}
                      disabled={loading}
                      size="small"
                      inputProps={{ min: 0, max: 100, step: 5 }}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                        sx: { borderRadius: 1 }
                      }}
                    />
                  </Grid>
                </Grid>
                
                <Box sx={{ 
                  mt: 2, 
                  p: 1.5, 
                  borderRadius: 1,
                  backgroundColor: alpha(
                    (formData.taskCompletionWeight + formData.peerReviewWeight + formData.teacherReviewWeight) === 100 
                      ? theme.palette.success.main 
                      : theme.palette.error.main, 
                    0.1
                  ),
                  border: `1px solid ${alpha(
                    (formData.taskCompletionWeight + formData.peerReviewWeight + formData.teacherReviewWeight) === 100 
                      ? theme.palette.success.main 
                      : theme.palette.error.main, 
                    0.2
                  )}`
                }}>
                  <Typography 
                    variant="body2" 
                    fontWeight="500"
                    color={
                      (formData.taskCompletionWeight + formData.peerReviewWeight + formData.teacherReviewWeight) === 100 
                        ? 'success.main' 
                        : 'error.main'
                    }
                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}
                  >
                    <span>Total: </span>
                    <span style={{ fontWeight: 600 }}>
                      {formData.taskCompletionWeight + formData.peerReviewWeight + formData.teacherReviewWeight}%
                    </span>
                    <span>
                      {(formData.taskCompletionWeight + formData.peerReviewWeight + formData.teacherReviewWeight) === 100 
                        ? '✓ Balanced' 
                        : '✗ Needs adjustment'}
                    </span>
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
          
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mt: 3, 
                borderRadius: 1,
              }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          variant="outlined"
          sx={{
            borderRadius: 1,
            px: 3,
            borderColor: alpha(theme.palette.divider, 0.3),
            '&:hover': {
              borderColor: theme.palette.divider,
            }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <Add />}
          sx={{
            borderRadius: 1,
            px: 3,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
            }
          }}
        >
          {loading ? 'Creating...' : 'Create Project'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Create Task Modal
const CreateTaskModal = ({ open, onClose, project, theme, teams }) => {

  const [formData, setFormData] = useState({
    taskTitle: '',
    description: '',
    assignedTo: '',
    deadline: new Date().toISOString().split('T')[0],
    estimatedTime: '',
    estimatedTimeUnit: 'hours'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [fetchingMembers, setFetchingMembers] = useState(false);
  

  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!open || !project) return;
      setFetchingMembers(true);
      try {
        const token = getAuthToken();


        teams.map(team => {
          if (project.teamId._id === team._id) {
            const members = team.members?.map(member => ({
              id: member.user?._id,
              username: member.user?.username
            })) || [];
        
            console.log("members:", members);
            console.log("project.teamId:", project.teamId);
        
            setTeamMembers(members);
            console.log("teamMembers: ", teamMembers);

          }
        });

        
      } catch (err) {
        console.error('Error fetching team members:', err);
      } finally {
        setFetchingMembers(false);
      }
    };

    if (open && project) {
      setError('');
      fetchTeamMembers();
    }
  }, [open, project]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.taskTitle.trim()) {
      setError('Task title is required');
      setLoading(false);
      return;
    }
    if (!formData.assignedTo) {
      setError('Please assign the task to a team member');
      setLoading(false);
      return;
    }
    if (!formData.estimatedTime || isNaN(formData.estimatedTime) || parseFloat(formData.estimatedTime) <= 0) {
      setError('Valid estimated time is required');
      setLoading(false);
      return;
    }

    try {
      const token = getAuthToken();
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      let estimatedSeconds = 0;
      const timeValue = parseFloat(formData.estimatedTime);
      switch (formData.estimatedTimeUnit) {
        case 'minutes':
          estimatedSeconds = timeValue * 60;
          break;
        case 'hours':
          estimatedSeconds = timeValue * 60 * 60;
          break;
        case 'days':
          estimatedSeconds = timeValue * 60 * 60 * 8;
          break;
        default:
          estimatedSeconds = timeValue * 60 * 60;
      }

      const taskData = {
        taskTitle: formData.taskTitle.trim(),
        description: formData.description.trim(),
        projectId: project._id,
        assignedTo: formData.assignedTo,
        deadline: formData.deadline,
        estimatedTime: Math.round(estimatedSeconds)
      };
console.log(taskData);
      const response = await axiosClient.post('/user/task/create', taskData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Task created successfully:', response.data);
      onClose();
      
    } catch (err) {
      console.error('Error creating task:', err);
      setError(err.response?.data?.error || err.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const getMemberDisplay = (member) => {
    if (!member || typeof member !== 'object') {
      console.log("getMemberdisplay unkonwn!");
      return { id: '', name: 'Unknown Member', email: '' };

    }
    
    return {
      id: member._id || member.id || '',
      name: member.username || member.fullName || member.name || 'Unknown Member',
      email: member.email || '',
      initial: (member.username || member.email || 'U').charAt(0).toUpperCase()
    };
  };

  return (
    <Dialog 
      open={open} 
      onClose={!loading ? onClose : undefined} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          backgroundColor: theme.palette.background.paper,
        }
      }}
    >
      <DialogTitle sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h6" fontWeight="600">
              Create New Task
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {project?.projectName || 'Untitled Project'}
            </Typography>
          </Box>
          <IconButton 
            onClick={onClose} 
            disabled={loading} 
            size="small"
            sx={{
              color: theme.palette.text.secondary,
              '&:hover': {
                backgroundColor: alpha(theme.palette.action.hover, 0.1),
              }
            }}
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers sx={{ pt: 3 }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Task Title"
              value={formData.taskTitle}
              onChange={(e) => setFormData(prev => ({ ...prev, taskTitle: e.target.value }))}
              disabled={loading}
              required
              size="small"
              placeholder="Enter task title"
              InputProps={{
                sx: { borderRadius: 1 }
              }}
            />
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              multiline
              rows={3}
              disabled={loading}
              placeholder="Describe the task details..."
              size="small"

            />
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth required size="small">
              <InputLabel>Assign To</InputLabel>
              <Select
                value={formData.assignedTo}
                onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                label="Assign To"
                disabled={loading || fetchingMembers || teamMembers.length === 0}
                sx={{ borderRadius: 1 }}
              >
                {fetchingMembers ? (
                  <MenuItem disabled value="">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 1 }}>
                      <CircularProgress size={16} />
                      <Typography variant="body2" color="text.secondary">
                        Loading team members...
                      </Typography>
                    </Box>
                  </MenuItem>
                ) : teamMembers.length === 0 ? (
                  <MenuItem disabled value="">
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      No team members available
                    </Typography>
                  </MenuItem>
                ) : (
                  teamMembers.map((member, index) => {
                    const memberInfo = getMemberDisplay(member);
                    return (
                      <MenuItem key={memberInfo.id || index} value={memberInfo.id}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1.5,
                          py: 0.5
                        }}>
                          <Avatar 
                            sx={{ 
                              width: 32, 
                              height: 32, 
                              fontSize: 14,
                              bgcolor: theme.palette.primary.main
                            }}
                          >
                            {memberInfo.initial}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="500">
                              {memberInfo.name}
                            </Typography>
                            {memberInfo.email && (
                              <Typography variant="caption" color="text.secondary">
                                {memberInfo.email}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </MenuItem>
                    );
                  })
                )}
              </Select>
            </FormControl>
            
            {teamMembers.length === 0 && !fetchingMembers && (
              <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: 'block' }}>
                Add team members to the project first
              </Typography>
            )}
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 3,
            mb: 3
          }}>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                label="Deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                disabled={loading}
                required
                size="small"
                InputProps={{
                  sx: { borderRadius: 1 }
                }}
              />
            </Box>
            
            <Box sx={{ 
              flex: 1,
              display: 'flex',
              gap: 1
            }}>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="Estimated Time"
                  type="number"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedTime: e.target.value }))}
                  disabled={loading}
                  inputProps={{ 
                    min: 0.1, 
                    step: 0.1,
                    placeholder: 'e.g., 2.5'
                  }}
                  required
                  size="small"
                  InputProps={{
                    sx: { borderRadius: 1 }
                  }}
                />
              </Box>
              <Box sx={{ width: 120 }}>
                <FormControl fullWidth size="small">
                  <Select
                    value={formData.estimatedTimeUnit}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedTimeUnit: e.target.value }))}
                    disabled={loading}
                    sx={{ borderRadius: 1 }}
                  >
                    <MenuItem value="minutes">Minutes</MenuItem>
                    <MenuItem value="hours">Hours</MenuItem>
                    <MenuItem value="days">Days</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Box>
          
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3, 
                borderRadius: 1,
              }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, py: 2.5 }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          variant="outlined"
          sx={{
            borderRadius: 1,
            px: 3,
            borderColor: alpha(theme.palette.divider, 0.3),
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || teamMembers.length === 0 || fetchingMembers}
          startIcon={loading ? <CircularProgress size={20} /> : <AddTask />}
          sx={{
            borderRadius: 1,
            px: 3,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
            },
          }}
        >
          {loading ? 'Creating...' : 'Create Task'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Review Project Modal
const ReviewProjectModal = ({ open, onClose, project, theme }) => {
  const [reviewData, setReviewData] = useState({
    technicalExecution: { score: 0, comment: '' },
    taskValidity: { score: 0, comment: '' },
    timeAuthenticity: { score: 0, comment: '' },
    teamwork: { score: 0, comment: '' },
    documentationQuality: { score: 0, comment: '' },
    memberEvaluations: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && project) {
      const members = project.team || [];
      const memberEvaluations = members.map(member => ({
        member: member._id || member.id,
        contributionScore: 0,
        honestyFlag: false,
        comment: ''
      }));
      
      setReviewData(prev => ({
        ...prev,
        memberEvaluations
      }));
      setError('');
    }
  }, [open, project]);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const token = getAuthToken();
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      const reviewPayload = {
        project: project._id,
        evaluator: getUserData()?.id,
        evaluatorRole: 'peer',
        grading: reviewData,
        memberEvaluations: reviewData.memberEvaluations
      };

      // Simulate submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Review submitted:', reviewPayload);
      onClose();

    } catch (err) {
      setError(err.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={!loading ? onClose : undefined} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Review Project</Typography>
          <IconButton onClick={onClose} disabled={loading} size="small">
            <Close />
          </IconButton>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {project?.projectName}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ maxHeight: '70vh', overflow: 'auto' }}>
          <Typography variant="h6" sx={{ mt: 2, mb: 2 }}>
            Project Evaluation (0-10 each)
          </Typography>
          
          {[
            { key: 'technicalExecution', label: 'Technical Execution', desc: 'Measures how well the project was executed technically' },
            { key: 'taskValidity', label: 'Task Validity', desc: 'Checks if tasks actually match the project objectives' },
            { key: 'timeAuthenticity', label: 'Time Authenticity', desc: 'Measures whether the time spent on tasks is realistic' },
            { key: 'teamwork', label: 'Teamwork', desc: 'Evaluates collaboration and contribution to the team' },
            { key: 'documentationQuality', label: 'Documentation Quality', desc: 'Measures clarity and completeness of documentation' }
          ].map((category) => (
            <Box key={category.key} sx={{ mb: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Box>
                  <Typography fontWeight="medium">{category.label}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {category.desc}
                  </Typography>
                </Box>
                <Select
                  value={reviewData[category.key]?.score || 0}
                  onChange={(e) => setReviewData(prev => ({
                    ...prev,
                    [category.key]: { ...prev[category.key], score: e.target.value }
                  }))}
                  size="small"
                  sx={{ minWidth: 80 }}
                >
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <MenuItem key={num} value={num}>{num}</MenuItem>
                  ))}
                </Select>
              </Box>
              <TextField
                fullWidth
                label="Comments"
                multiline
                rows={2}
                value={reviewData[category.key]?.comment || ''}
                onChange={(e) => setReviewData(prev => ({
                  ...prev,
                  [category.key]: { ...prev[category.key], comment: e.target.value }
                }))}
                size="small"
              />
            </Box>
          ))}

          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" sx={{ mb: 2 }}>
            Team Member Evaluations
          </Typography>
          
          {reviewData.memberEvaluations.map((evalItem, index) => {
            const member = project.team?.find(m => (m._id || m.id) === evalItem.member);
            return (
              <Paper key={index} sx={{ p: 2, mb: 2 }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar>
                    {(member?.name || 'U').charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography fontWeight="medium">{member?.name || 'Unknown Member'}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {member?.email || ''}
                    </Typography>
                  </Box>
                </Box>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Contribution Score</InputLabel>
                      <Select
                        value={evalItem.contributionScore}
                        onChange={(e) => {
                          const newEvaluations = [...reviewData.memberEvaluations];
                          newEvaluations[index] = { ...newEvaluations[index], contributionScore: e.target.value };
                          setReviewData(prev => ({ ...prev, memberEvaluations: newEvaluations }));
                        }}
                        label="Contribution Score"
                      >
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                          <MenuItem key={num} value={num}>{num}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6}>
                    <Box display="flex" alignItems="center" height="100%">
                      <MuiCheckbox
                        checked={evalItem.honestyFlag}
                        onChange={(e) => {
                          const newEvaluations = [...reviewData.memberEvaluations];
                          newEvaluations[index] = { ...newEvaluations[index], honestyFlag: e.target.checked };
                          setReviewData(prev => ({ ...prev, memberEvaluations: newEvaluations }));
                        }}
                        icon={<FlagOutlined />}
                        checkedIcon={<Flag color="error" />}
                      />
                      <Typography variant="caption">
                        Flag as exaggerated contribution
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Comments"
                      multiline
                      rows={2}
                      value={evalItem.comment || ''}
                      onChange={(e) => {
                        const newEvaluations = [...reviewData.memberEvaluations];
                        newEvaluations[index] = { ...newEvaluations[index], comment: e.target.value };
                        setReviewData(prev => ({ ...prev, memberEvaluations: newEvaluations }));
                      }}
                      size="small"
                    />
                  </Grid>
                </Grid>
              </Paper>
            );
          })}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <Grade />}
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Team Members Popover
const TeamMembersPopover = ({ anchorEl, open, onClose, teamMembers }) => {
  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
    >
      <Box sx={{ p: 2, minWidth: 200 }}>
        <Typography variant="subtitle2" gutterBottom fontWeight="medium">
          Team Members
        </Typography>
        <List dense>
          {teamMembers?.map((member, index) => (
            <ListItem key={index}>
              <ListItemAvatar>
                <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
                  {(member?.name || 'U').charAt(0)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={member?.name || 'Unknown Member'}
                secondary={member?.email || ''}
              />
            </ListItem>
          ))}
          {(!teamMembers || teamMembers.length === 0) && (
            <ListItem>
              <ListItemText primary="No team members" />
            </ListItem>
          )}
        </List>
      </Box>
    </Popover>
  );
};

// Project Table Row Component
const ProjectTableRow = ({ 
  project, 
  teams,
  isSelected, 
  onSelect, 
  theme,
  onCreateTask,
  onReviewProject 
}) => {
  const [teamAnchorEl, setTeamAnchorEl] = useState(null);
  const [tagsAnchorEl, setTagsAnchorEl] = useState(null);
  const [dueAnchorEl, setDueAnchorEl] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  
  

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': 
      case 'ongoing': 
        return theme.palette.success.main;
      case 'completed': 
        return theme.palette.info.main;
      case 'paused': 
      case 'on_hold': 
        return theme.palette.warning.main;
      default: 
        return theme.palette.grey[500];
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'ongoing':
        return <PlayCircle sx={{ fontSize: 16, color: getStatusColor(status) }} />;
      case 'completed':
        return <CheckCircle sx={{ fontSize: 16, color: getStatusColor(status) }} />;
      case 'paused':
      case 'on_hold':
        return <PauseCircle sx={{ fontSize: 16, color: getStatusColor(status) }} />;
      default:
        return null;
    }
  };

  const daysRemaining = () => {
    if (!project.endDate) return 'No deadline';
    const today = new Date();
    const endDate = new Date(project.endDate);
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Due today';
    return `${diffDays} days left`;
  };

  const getHealthColor = (healthScore) => {
    if (healthScore >= 80) return theme.palette.success.main;
    if (healthScore >= 60) return theme.palette.info.main;
    if (healthScore >= 40) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const healthScore = project.metrics?.healthScore || project.metrics?.health?.healthScore || 0;

   useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!project) return;
      try {
        const token = getAuthToken();
        if (!token) return;
        teams.map(team => {
          if (project.teamId._id === team._id) {
            const members = team.members?.map(
              member => member.user?.username
            ) || [];
                
            setTeamMembers(members);
          }
        });

        
      } catch (err) {
        console.error('Error fetching team members:', err);
      }
    };

      fetchTeamMembers();
  }, [project]);
  return (
    <>
      <TableRow
        hover
        selected={isSelected}
        sx={{
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
          },
          '&.Mui-selected': {
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
          }
        }}
      >
        <TableCell padding="checkbox">
          <Checkbox
            checked={isSelected}
            onChange={(e) => onSelect(project._id, e.target.checked)}
          />
        </TableCell>

        <TableCell>
          <Typography variant="body2" fontWeight="medium">
            {project.projectName || 'Untitled Project'}
          </Typography>
        </TableCell>

        <TableCell>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Add Task">
              <IconButton size="small" onClick={() => onCreateTask(project)} >
                <AddTask fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title={daysRemaining()}>
              <IconButton 
                size="small"
                onMouseEnter={(e) => setDueAnchorEl(e.currentTarget)}
                onMouseLeave={() => setDueAnchorEl(null)}
              >
                <CalendarToday fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Review Project">
              <IconButton size="small" onClick={() => onReviewProject(project)}>
                <Grade fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        </TableCell>

        <TableCell>
          <Tooltip title={project.teamName || 'No team'}>
            <Box
              display="flex"
              alignItems="center"
              gap={1}
              onMouseEnter={(e) => setTeamAnchorEl(e.currentTarget)}
              onMouseLeave={() => setTeamAnchorEl(null)}
              sx={{ cursor: 'pointer' }}
            >
              <People fontSize="small" />
              <Typography variant="body2">
                {project.teamName || 'No team'}
              </Typography>
            </Box>
          </Tooltip>
        </TableCell>

        <TableCell>
          <Box display="flex" alignItems="center" gap={1}>
            {getStatusIcon(project.status)}
            <Typography variant="body2">
              {project.status ? project.status.replace('_', ' ').toUpperCase() : 'NOT STARTED'}
            </Typography>
          </Box>
        </TableCell>

        <TableCell>
          <Box
            display="flex"
            alignItems="center"
            gap={0.5}
            onMouseEnter={(e) => setTagsAnchorEl(e.currentTarget)}
            onMouseLeave={() => setTagsAnchorEl(null)}
            sx={{ cursor: 'pointer' }}
          >
            <Tag fontSize="small" />
            <Typography variant="body2">
              {project.tags?.slice(0, 2).map(tag => `#${tag}`).join(', ')}
              {project.tags && project.tags.length > 2 && '...'}
              {(!project.tags || project.tags.length === 0) && 'No tags'}
            </Typography>
          </Box>
        </TableCell>

        <TableCell>
          <Box sx={{ width: '100%' }}>
            <Box display="flex" justifyContent="space-between" mb={0.5}>
              <Typography variant="caption" color="text.secondary">
                Progress
              </Typography>
              <Typography variant="caption" fontWeight="medium">
                {project.progress || 0}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={project.progress || 0}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: alpha(theme.palette.divider, 0.2),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  backgroundColor: getHealthColor(healthScore),
                }
              }}
            />
            <Box display="flex" justifyContent="space-between" mt={0.5}>
              <Typography variant="caption" color="text.secondary">
                Health
              </Typography>
              <Typography 
                variant="caption" 
                fontWeight="medium"
                color={getHealthColor(healthScore)}
              >
                {healthScore.toFixed(0)}%
              </Typography>
            </Box>
          </Box>
        </TableCell>
      </TableRow>
      <TeamMembersPopover
        anchorEl={teamAnchorEl}
        open={Boolean(teamAnchorEl)}
        onClose={() => setTeamAnchorEl(null)}
        teamMembers={teamMembers}
      />

      <Popover
        open={Boolean(tagsAnchorEl)}
        anchorEl={tagsAnchorEl}
        onClose={() => setTagsAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2, minWidth: 200 }}>
          <Typography variant="subtitle2" gutterBottom fontWeight="medium">
            Project Tags
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {project.tags?.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                sx={{ m: 0.25 }}
              />
            ))}
            {(!project.tags || project.tags.length === 0) && (
              <Typography variant="body2" color="text.secondary">
                No tags added
              </Typography>
            )}
          </Box>
        </Box>
      </Popover>

      <Popover
        open={Boolean(dueAnchorEl)}
        anchorEl={dueAnchorEl}
        onClose={() => setDueAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        disableRestoreFocus
      >
        <Box sx={{ p: 2, minWidth: 200 }}>
          <Typography variant="subtitle2" gutterBottom fontWeight="medium">
            Project Timeline
          </Typography>
          <Typography variant="body2" gutterBottom>
            <strong>Start:</strong> {formatDate(project.startDate)}
          </Typography>
          <Typography variant="body2" gutterBottom>
            <strong>End:</strong> {formatDate(project.endDate)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {daysRemaining()}
          </Typography>
        </Box>
      </Popover>
    </>
  );
};

// Main Projects Page Component
const Projects = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState(new Set());
  const [sortBy, setSortBy] = useState('updatedAt');
  const [teams, setTeams] = useState([]);
  const [authError, setAuthError] = useState(false);

  // Check authentication
  const checkAuth = useCallback(() => {
    const token = getAuthToken();
    const user = getUserData();
    
    if (!token || !user) {
      setAuthError(true);
      setError('Please log in to view projects.');
      return false;
    }
    return true;
  }, []);

  // Fetch user's teams
  const fetchTeams = useCallback(async () => {
    try {
      if (!checkAuth()) return;

      const token = getAuthToken();
      const response = await axiosClient.get("/user/teams", {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const teamsData = response.data?.teams || [];
      setTeams(teamsData); 
/* teams= [
{_id: , teamName: , members: [{_id: , user: {_id: ,name: ,username: ,email: , avatar: , course: , bio: , institution: , skills:, year: , onlineStatus: } }]} , 
{_id: , teamName: , members: [{_id: , user: {_id: ,name: ,username: ,email: , avatar: , course: , bio: , institution: , skills:, year: , onlineStatus: } }]}, 
...
{_id: , teamName: , members: [{_id: , user: {_id: ,name: ,username: ,email: , avatar: , course: , bio: , institution: , skills:, year: , onlineStatus: } }]}
] */
      setAuthError(false);
    } catch (err) {
      console.error('Error fetching teams:', err);
      if (err.response?.status === 401) {
        setAuthError(true);
        setError('Session expired. Please log in again.');
      }
    }
  }, [checkAuth]);

  // Fetch projects
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!checkAuth()) {
        setLoading(false);
        return;
      }

      const token = getAuthToken();

      const response = await axiosClient.get('/projects', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      
      let projectsData = [];
      
      if (Array.isArray(response.data)) {
        projectsData = response.data;
      } else if (response.data && Array.isArray(response.data.projects)) {
        projectsData = response.data.projects;
      } else if (response.data && Array.isArray(response.data.data)) {
        projectsData = response.data.data;
      } else if (response.data && response.data.success && Array.isArray(response.data.data)) {
        projectsData = response.data.data;
      }

      projectsData.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      
      setProjects(projectsData || []);
      setFilteredProjects(projectsData || []);
      setAuthError(false);
    } catch (err) {
      console.error('Error fetching projects:', err);
      
      if (err.response?.status === 401) {
        setAuthError(true);
        setError('Session expired. Please log in again.');
      } else {
        setError('Failed to load projects. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [checkAuth]);

  useEffect(() => {
    const loadAllData = async () => {
      await Promise.all([fetchProjects(), fetchTeams()]);
    };
    
    loadAllData();
  }, [fetchProjects, fetchTeams]);

  useEffect(() => {
    // store a copy of all projects
    let data = [...projects];
  
    // Filter by search query if present
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      data = data.filter(project =>
        project.projectName?.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query) ||
        project.teamName?.toLowerCase().includes(query) ||
        project.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
  
    // Sort based on sortBy
    data.sort((a, b) => {
      switch (sortBy) {
        case 'updatedAt': {
          const dateA = new Date(a.updatedAt || a.createdAt || 0);
          const dateB = new Date(b.updatedAt || b.createdAt || 0);
          return dateB - dateA;
        }
        case 'progress':
          return (b.progress || 0) - (a.progress || 0);
        case 'name':
          return (a.projectName || '').localeCompare(b.projectName || '');
        case 'health': {
          const healthA = a.metrics?.healthScore || a.metrics?.health?.healthScore || 0;
          const healthB = b.metrics?.healthScore || b.metrics?.health?.healthScore || 0;
          return healthB - healthA;
        }
        default:
          return 0;
      }
    });
  
    setFilteredProjects(data);
  }, [projects, searchQuery, sortBy]);
  
  
  const handleSelectProject = (projectId, checked) => {
    const newSelected = new Set(selectedProjects);
    if (checked) {
      newSelected.add(projectId);
    } else {
      newSelected.delete(projectId);
    }
    setSelectedProjects(newSelected);
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedProjects(new Set(filteredProjects.map(p => p._id)));
    } else {
      setSelectedProjects(new Set());
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedProjects.size === 0) return;
    
    if (window.confirm(`Delete ${selectedProjects.size} selected project(s)?`)) {
      try {
        const token = getAuthToken();
        if (!token) {
          setError('Authentication required');
          return;
        }

        for (const projectId of selectedProjects) {
          await axiosClient.delete(`/projects/${projectId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
        
        fetchProjects();
        setSelectedProjects(new Set());
      } catch (err) {
        console.error('Error deleting projects:', err);
        setError('Failed to delete projects');
      }
    }
  };

  const handleCreateTask = (project) => {
    console.log("Selected Project: ", project);

    setSelectedProject(project);
    setCreateTaskModalOpen(true);
  };

  const handleReviewProject = (project) => {
    setSelectedProject(project);
    setReviewModalOpen(true);
  };

  const handleCreateProject = (newProject) => {
    setProjects(prev => [newProject, ...prev]);
    setFilteredProjects(prev => [newProject, ...prev]);
    setSelectedProjects(new Set());
  };

  const navigateToTeams = () => {
    navigate('/peer-teams');
  };

  const hasTeams = teams.length > 0;
  const allSelected = filteredProjects.length > 0 && selectedProjects.size === filteredProjects.length;

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      p: { xs: 2, sm: 3 },
      backgroundColor: theme.palette.background.default,
    }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h5" fontWeight="600" gutterBottom sx={{ color: theme.palette.text.primary }}>
              Projects
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Manage and track all your team projects
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            onClick={() => setCreateModalOpen(true)}
            startIcon={<Add />}
            disabled={!hasTeams || authError}
            size="small"
            sx={{
              borderRadius: 1,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              }
            }}
          >
            New Project
          </Button>
        </Box>

        {!authError && (
          <Paper
            sx={{
              p: 2,
              borderRadius: 1,
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              mb: 3
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: theme.palette.text.secondary }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
                  {selectedProjects.size > 0 && (
                    <Tooltip title={`Delete ${selectedProjects.size} selected`}>
                      <IconButton 
                        color="error" 
                        size="small"
                        onClick={handleDeleteSelected}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  )}
                  
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>Sort By</InputLabel>
                    <Select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      label="Sort By"
                    >
                      <MenuItem value="updatedAt">Last Updated</MenuItem>
                      <MenuItem value="progress">Progress</MenuItem>
                      <MenuItem value="name">Name</MenuItem>
                      <MenuItem value="health">Health Score</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <Tooltip title="Filters">
                    <IconButton size="small">
                      <FilterList />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        )}
      </Box>

      {!authError && projects.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {[
            { 
              label: 'Total Projects', 
              value: projects.length, 
              icon: <Group fontSize="small" />,
              color: theme.palette.primary.main 
            },
            { 
              label: 'Active', 
              value: projects.filter(p => p.status === 'ongoing' || p.status === 'active').length, 
              icon: <PlayCircle fontSize="small" />,
              color: theme.palette.success.main 
            },
            { 
              label: 'At Risk', 
              value: projects.filter(p => {
                const healthScore = p.metrics?.healthScore || p.metrics?.health?.healthScore || 100;
                return healthScore < 40;
              }).length, 
              icon: <Assessment fontSize="small" />,
              color: theme.palette.warning.main 
            },
            { 
              label: 'Selected', 
              value: selectedProjects.size, 
              icon: <CheckCircle fontSize="small" />,
              color: theme.palette.info.main 
            }
          ].map((stat, index) => (
            <Grid item xs={6} sm={3} key={stat.label}>
              <Paper
                sx={{
                  p: 2,
                  borderRadius: 1,
                  backgroundColor: theme.palette.background.paper,
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    backgroundColor: stat.color,
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box sx={{ color: stat.color }}>
                    {stat.icon}
                  </Box>
                  <Typography variant="h6" fontWeight="600">
                    {stat.value}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  {stat.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {error && !authError ? (
        <Alert 
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      ) : loading ? (
        <Box>
          {[...Array(5)].map((_, index) => (
            <Skeleton 
              key={index} 
              variant="rectangular" 
              height={60} 
              sx={{ 
                borderRadius: 1, 
                mb: 1,
                backgroundColor: theme.palette.action.hover
              }} 
            />
          ))}
        </Box>
      ) : filteredProjects.length === 0 || authError ? (
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 2,
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          {authError ? (
            <Box>
              <Typography variant="h6" fontWeight="600" gutterBottom sx={{ color: theme.palette.error.main, mb: 1 }}>
                Authentication Required
              </Typography>
              <Typography variant="body2" sx={{ 
                color: theme.palette.text.secondary, 
                mb: 4, 
                maxWidth: 400, 
                mx: 'auto' 
              }}>
                Please log in to view your projects.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/')}
              >
                Go to Login
              </Button>
            </Box>
          ) : (
            <Box>
              <Group sx={{ 
                fontSize: 60, 
                color: theme.palette.text.disabled, 
                mb: 3,
              }} />
              <Typography variant="h6" fontWeight="600" gutterBottom sx={{ color: theme.palette.text.primary, mb: 1 }}>
                No Projects Found
              </Typography>
              <Typography variant="body2" sx={{ 
                color: theme.palette.text.secondary, 
                mb: 4, 
                maxWidth: 400, 
                mx: 'auto' 
              }}>
                {hasTeams 
                  ? 'Get started by creating your first project'
                  : 'Create a team first to start managing projects'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                {!hasTeams ? (
                  <Button
                    variant="outlined"
                    onClick={navigateToTeams}
                    startIcon={<Group />}
                  >
                    Go to Teams
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={() => setCreateModalOpen(true)}
                    startIcon={<Add />}
                  >
                    Create First Project
                  </Button>
                )}
              </Box>
            </Box>
          )}
        </Paper>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <TableContainer 
            component={Paper}
            sx={{
              borderRadius: 1,
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              overflow: 'auto'
            }}
          >
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={allSelected}
                      indeterminate={selectedProjects.size > 0 && !allSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="600">
                      PROJECT NAME
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="600">
                      ACTIONS
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="600">
                      TEAM NAME
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="600">
                      STATUS
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="600">
                      TAGS
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="600">
                      PROGRESS
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProjects.map((project) => (
                  <ProjectTableRow
                    key={project._id}
                    project={project}
                    isSelected={selectedProjects.has(project._id)}
                    onSelect={handleSelectProject}
                    theme={theme}
                    teams={teams}
                    onCreateTask={() => handleCreateTask(project)}
                    onReviewProject={handleReviewProject}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {selectedProjects.size > 0 && (
            <Paper
              sx={{
                mt: 2,
                p: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderRadius: 1,
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <Typography variant="body2" color="primary">
                {selectedProjects.size} project(s) selected
              </Typography>
              <Button
                startIcon={<Delete />}
                color="error"
                size="small"
                onClick={handleDeleteSelected}
              >
                Delete Selected
              </Button>
            </Paper>
          )}
        </motion.div>
      )}

      <CreateProjectModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        theme={theme}
        onProjectCreated={handleCreateProject}
      />
      <CreateTaskModal
        open={createTaskModalOpen}
        onClose={() => setCreateTaskModalOpen(false)}
        project={selectedProject}
        teams={teams}
        theme={theme}
      />

      <ReviewProjectModal
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        project={selectedProject}
        theme={theme}
      />
    </Box>
  );
};

export default Projects;