import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
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
  Badge,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider
} from '@mui/material';
import {
  Search,
  Add,
  Group,
  FilterList,
  Sort,
  CheckCircle,
  PauseCircle,
  PlayCircle,
  Close,
  AddTask,
  CalendarToday,
  Grade,
  Delete,
  MoreHoriz,
  Tag,
  People,
  Assessment,
  AccessTime,
  KeyboardArrowDown,
  KeyboardArrowUp
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axiosClient from '@/api/axiosClient';
import { useNavigate } from 'react-router-dom';

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

// Create Task Modal
const CreateTaskModal = ({ open, onClose, project, theme }) => {
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

  useEffect(() => {
    if (open && project) {
      // Extract team members from project
      const members = project.team || [];
      setTeamMembers(members);
      
      // Reset form
      setFormData({
        taskTitle: '',
        description: '',
        assignedTo: members.length > 0 ? members[0]._id : '',
        deadline: new Date().toISOString().split('T')[0],
        estimatedTime: '',
        estimatedTimeUnit: 'hours'
      });
      setError('');
    }
  }, [open, project]);

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
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
    if (!formData.estimatedTime || isNaN(formData.estimatedTime)) {
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

      // Convert estimated time to seconds
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
          estimatedSeconds = timeValue * 60 * 60 * 8; // 8 working hours per day
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

      // For now, just simulate creation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Task would be created:', taskData);
      onClose();
      // In real implementation, call API:
      // await axiosClient.post('/tasks', taskData, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });

    } catch (err) {
      console.error('Error creating task:', err);
      setError(err.message || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={!loading ? onClose : undefined} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Create New Task</Typography>
          <IconButton onClick={onClose} disabled={loading} size="small">
            <Close />
          </IconButton>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {project?.projectName}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Task Title"
                value={formData.taskTitle}
                onChange={handleChange('taskTitle')}
                disabled={loading}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={handleChange('description')}
                multiline
                rows={3}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Assign To</InputLabel>
                <Select
                  value={formData.assignedTo}
                  onChange={handleChange('assignedTo')}
                  label="Assign To"
                  disabled={loading || teamMembers.length === 0}
                >
                  {teamMembers.map(member => (
                    <MenuItem key={member._id} value={member._id}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                          {member.name?.charAt(0) || 'U'}
                        </Avatar>
                        <Typography>{member.name || 'Unknown User'}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Deadline"
                type="date"
                value={formData.deadline}
                onChange={handleChange('deadline')}
                InputLabelProps={{ shrink: true }}
                disabled={loading}
                required
              />
            </Grid>
            <Grid item xs={6} container spacing={1}>
              <Grid item xs={8}>
                <TextField
                  fullWidth
                  label="Estimated Time"
                  type="number"
                  value={formData.estimatedTime}
                  onChange={handleChange('estimatedTime')}
                  disabled={loading}
                  inputProps={{ min: 0.1, step: 0.1 }}
                  required
                />
              </Grid>
              <Grid item xs={4}>
                <FormControl fullWidth>
                  <Select
                    value={formData.estimatedTimeUnit}
                    onChange={handleChange('estimatedTimeUnit')}
                    disabled={loading}
                  >
                    <MenuItem value="minutes">Minutes</MenuItem>
                    <MenuItem value="hours">Hours</MenuItem>
                    <MenuItem value="days">Days</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <AddTask />}
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
      // Initialize member evaluations
      const members = project.team || [];
      const memberEvaluations = members.map(member => ({
        member: member._id,
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

  const handleScoreChange = (category, field, value) => {
    setReviewData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const handleMemberScoreChange = (index, field, value) => {
    const newEvaluations = [...reviewData.memberEvaluations];
    newEvaluations[index] = {
      ...newEvaluations[index],
      [field]: value
    };
    setReviewData(prev => ({
      ...prev,
      memberEvaluations: newEvaluations
    }));
  };

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

      // Calculate final score (simple average for now)
      const scores = [
        reviewData.technicalExecution.score,
        reviewData.taskValidity.score,
        reviewData.timeAuthenticity.score,
        reviewData.teamwork.score,
        reviewData.documentationQuality.score
      ];
      const finalScore = scores.reduce((a, b) => a + b, 0);

      const reviewPayload = {
        project: project._id,
        evaluatedTeam: project.teamName || 'Team',
        evaluator: getUserData()?.id,
        evaluatorRole: 'peer',
        grading: reviewData,
        memberEvaluations: reviewData.memberEvaluations,
        finalScore,
        allowPeerReview: true,
        suspicionFlags: {
          paddedTasksDetected: false,
          unrealisticTimeLogs: false,
          copyPasteWork: false,
          comment: ''
        }
      };

      // For now, just simulate submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Review would be submitted:', reviewPayload);
      onClose();
      // In real implementation, call API to submit review

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
          {/* Grading Categories */}
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
                  onChange={(e) => handleScoreChange(category.key, 'score', e.target.value)}
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
                onChange={(e) => handleScoreChange(category.key, 'comment', e.target.value)}
                size="small"
              />
            </Box>
          ))}

          {/* Member Evaluations */}
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" sx={{ mb: 2 }}>
            Team Member Evaluations
          </Typography>
          
          {reviewData.memberEvaluations.map((evalItem, index) => {
            const member = project?.team?.find(m => m._id === evalItem.member);
            return (
              <Paper key={index} sx={{ p: 2, mb: 2 }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar>
                    {member?.name?.charAt(0) || 'U'}
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
                        onChange={(e) => handleMemberScoreChange(index, 'contributionScore', e.target.value)}
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
                      <Checkbox
                        checked={evalItem.honestyFlag}
                        onChange={(e) => handleMemberScoreChange(index, 'honestyFlag', e.target.checked)}
                        icon={<Close />}
                        checkedIcon={<Close color="error" />}
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
                      onChange={(e) => handleMemberScoreChange(index, 'comment', e.target.value)}
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
                  {member.name?.charAt(0) || 'U'}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={member.name || 'Unknown Member'}
                secondary={member.email || ''}
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

// Tags Popover
const TagsPopover = ({ anchorEl, open, onClose, tags }) => {
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
          Project Tags
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {tags?.map((tag, index) => (
            <Chip
              key={index}
              label={tag}
              size="small"
              sx={{ m: 0.25 }}
            />
          ))}
          {(!tags || tags.length === 0) && (
            <Typography variant="body2" color="text.secondary">
              No tags added
            </Typography>
          )}
        </Box>
      </Box>
    </Popover>
  );
};

// Project Table Row Component
const ProjectTableRow = ({ 
  project, 
  isSelected, 
  onSelect, 
  theme,
  onCreateTask,
  onReviewProject 
}) => {
  const [teamAnchorEl, setTeamAnchorEl] = useState(null);
  const [tagsAnchorEl, setTagsAnchorEl] = useState(null);
  const [dueAnchorEl, setDueAnchorEl] = useState(null);
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (err) {
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

  const healthScore = project.metrics?.health?.healthScore || 0;

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
        {/* Checkbox */}
        <TableCell padding="checkbox">
          <Checkbox
            checked={isSelected}
            onChange={(e) => onSelect(project._id, e.target.checked)}
          />
        </TableCell>

        {/* Project Name */}
        <TableCell>
          <Typography variant="body2" fontWeight="medium">
            {project.projectName || 'Untitled Project'}
          </Typography>
        </TableCell>

        {/* Actions */}
        <TableCell>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Add Task">
              <IconButton size="small" onClick={() => onCreateTask(project)}>
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

        {/* Team Name */}
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

        {/* Status */}
        <TableCell>
          <Box display="flex" alignItems="center" gap={1}>
            {getStatusIcon(project.status)}
            <Typography variant="body2">
              {project.status ? project.status.replace('_', ' ').toUpperCase() : 'NOT STARTED'}
            </Typography>
          </Box>
        </TableCell>

        {/* Tags */}
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
            </Typography>
          </Box>
        </TableCell>

        {/* Progress with Health Score */}
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

      {/* Popovers */}
      <TeamMembersPopover
        anchorEl={teamAnchorEl}
        open={Boolean(teamAnchorEl)}
        onClose={() => setTeamAnchorEl(null)}
        teamMembers={project.team}
      />

      <TagsPopover
        anchorEl={tagsAnchorEl}
        open={Boolean(tagsAnchorEl)}
        onClose={() => setTagsAnchorEl(null)}
        tags={project.tags}
      />

      {/* Due Date Tooltip (as popover) */}
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

// Create Project Modal (keep your existing CreateProjectModal component as is)

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
  const [selectedProject, setSelectedProject] = useState(null);
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
      
      const teamsData = response.data?.teams || response.data?.data || response.data || [];
      setTeams(Array.isArray(teamsData) ? teamsData : []);
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
      }
      
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

  // Load data on mount
  useEffect(() => {
    const loadAllData = async () => {
      await Promise.all([fetchProjects(), fetchTeams()]);
    };
    
    loadAllData();
  }, [fetchProjects, fetchTeams]);

  // Filter projects based on search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProjects(projects);
      return;
    }

    const filtered = projects.filter(project =>
      project.projectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.teamName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.tags && project.tags.some(tag =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      ))
    );
    setFilteredProjects(filtered);
  }, [searchQuery, projects]);

  // Sort projects
  useEffect(() => {
    const sorted = [...filteredProjects].sort((a, b) => {
      const dateA = new Date(a.updatedAt || a.createdAt || 0);
      const dateB = new Date(b.updatedAt || b.createdAt || 0);
      
      switch (sortBy) {
        case 'updatedAt':
          return dateB - dateA;
        case 'progress':
          return (b.progress || 0) - (a.progress || 0);
        case 'name':
          return (a.projectName || '').localeCompare(b.projectName || '');
        case 'health':
          return ((b.metrics?.health?.healthScore || 0) - (a.metrics?.health?.healthScore || 0));
        default:
          return 0;
      }
    });
    setFilteredProjects(sorted);
  }, [sortBy, projects]);

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

        // For each selected project, call delete API
        for (const projectId of selectedProjects) {
          await axiosClient.delete(`/projects/${projectId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
        
        // Refresh projects list
        fetchProjects();
        setSelectedProjects(new Set());
      } catch (err) {
        console.error('Error deleting projects:', err);
        setError('Failed to delete projects');
      }
    }
  };

  const handleCreateTask = (project) => {
    setSelectedProject(project);
    setCreateTaskModalOpen(true);
  };

  const handleReviewProject = (project) => {
    setSelectedProject(project);
    setReviewModalOpen(true);
  };

  const handleCreateProject = (newProject) => {
    const projectWithId = {
      ...newProject,
      _id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: 0,
      status: 'not_started'
    };
    
    setProjects(prev => [projectWithId, ...prev]);
    setFilteredProjects(prev => [projectWithId, ...prev]);
  };

  const handleProjectClick = (project) => {
    navigate(`/my-project/${project._id}`);
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
      {/* Header */}
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
            }}
          >
            New Project
          </Button>
        </Box>

        {/* Search and Filter Bar */}
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

      {/* Stats Cards */}
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
              value: projects.filter(p => p.status === 'active' || p.status === 'ongoing').length, 
              icon: <PlayCircle fontSize="small" />,
              color: theme.palette.success.main 
            },
            { 
              label: 'At Risk', 
              value: projects.filter(p => (p.metrics?.health?.healthScore || 100) < 40).length, 
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

      {/* Content */}
      {error && !authError ? (
        <Alert 
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      ) : loading ? (
        // Loading Skeletons
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
        // Empty State - keep your existing EmptyState component
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
                onClick={() => window.location.href = '/'}
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
        // Projects Table
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
                    onCreateTask={handleCreateTask}
                    onReviewProject={handleReviewProject}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Table Footer */}
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

      {/* Modals */}
      {/* Keep your existing CreateProjectModal */}
      <CreateTaskModal
        open={createTaskModalOpen}
        onClose={() => setCreateTaskModalOpen(false)}
        project={selectedProject}
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