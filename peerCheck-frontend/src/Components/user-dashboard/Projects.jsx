import React, { useState, useEffect, useCallback, use } from 'react';
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
  alpha,
  useTheme,
  CircularProgress,
  Popover,
  Divider,
  FormControlLabel,
  Checkbox as MuiCheckbox,
  Card
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
  Flag,
  ViewModule,
  ArrowDropDown,
  TrendingUp,
  ViewList,
  RocketLaunch,
  Edit,
  School,
  Info,
  Handshake,
  Warning,
  Description,
  Person,
  PersonOff,
  WarningAmber,
  Email,
  Save,
  PlayCircleOutline,
  ArrowForward
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axiosClient from '@/api/axiosClient';
import { useNavigate, useParams } from 'react-router-dom';
import { set } from 'date-fns';
import { useInView } from 'react-intersection-observer';

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
    mentorId: '',
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
  const [mentors, setMentors] = useState([]);

  useEffect(() => {
    const fetchMentorData = async () => {
      try {
        const token = getAuthToken();
        if (!token) return;
        const response = await axiosClient.get("/user/get-mentors", {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const mentorsData = response.data?.mentors || [];
        setMentors(Array.isArray(mentorsData) ? mentorsData : []);
      } catch (err) {
        console.error('Error fetching mentors:', err);
      }
    };
    fetchMentorData();
  }, []);
  
        

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
        mentorId: formData.mentorId || formData.mentorId === '' || 'none' ,
        teamId: formData.teamId ? [formData.teamId] : [],
        teamName: selectedTeam?.teamName || selectedTeam?.name || 'Unnamed Team', 
        gradingCriteria: {
          taskCompletionWeight: formData.taskCompletionWeight,
          peerReviewWeight: formData.peerReviewWeight,
          teacherReviewWeight: formData.teacherReviewWeight,
          allowPeerReview: formData.allowPeerReview
        }
      };
  
  
      const response = await axiosClient.post('/projects', projectData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      
      if (onProjectCreated) {
        onProjectCreated(response.data);
      }
      
      if(response.data){
        onClose();
      }
      
      
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
        borderRadius: 3,
        backgroundColor: theme.palette.background.paper,
        border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        overflow: 'hidden',
        backgroundImage: theme.palette.mode === 'dark' 
          ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.98)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`
          : `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.98)} 0%, ${alpha(theme.palette.primary.light, 0.03)} 100%)`,
        boxShadow: `0 20px 60px ${alpha(theme.palette.mode === 'dark' ? '#000' : theme.palette.primary.main, 0.2)}`,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        }
      }
    }}
  >
    <DialogTitle sx={{ 
      pb: 2,
      pt: 3,
      px: 4,
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
      borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
    }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white', 
            fontSize: 20,
            fontWeight: 'bold',
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
          }}>
            <Add fontSize="small" />
          </Box>
          <Box>
            <Typography variant="h5" fontWeight="800" sx={{ 
              color: theme.palette.text.primary,
              fontFamily: '"Alkatra", cursive',
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Create New Project
            </Typography>
            <Typography variant="caption" sx={{ 
              color: theme.palette.text.secondary,
              fontFamily: '"Inter", sans-serif',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              mt: 0.5
            }}>
              <RocketLaunch fontSize="inherit" /> Start building something amazing with your team
            </Typography>
          </Box>
        </Box>
        <IconButton 
          onClick={onClose} 
          disabled={loading} 
          size="medium"
          sx={{
            color: theme.palette.text.secondary,
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.2),
              color: theme.palette.primary.main,
              transform: 'rotate(90deg)',
            },
            transition: 'all 0.3s ease',
            width: 40,
            height: 40,
          }}
        >
          <Close />
        </IconButton>
      </Box>
    </DialogTitle>
    
    <DialogContent dividers sx={{ 
      pt: 4, 
      px: 4,
      background: theme.palette.mode === 'dark' 
        ? alpha(theme.palette.background.default, 0.5)
        : alpha(theme.palette.background.default, 0.3),
    }}>
      <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
        {/* Form Fields using Flexbox */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Project Name */}
          <Box sx={{ position: 'relative' }}>
            <TextField
              fullWidth
              label={
                <Typography variant="body2" fontWeight="600" sx={{ fontFamily: '"Inter", sans-serif' }}>
                  Project Name
                </Typography>
              }
              value={formData.projectName}
              onChange={handleChange('projectName')}
              disabled={loading}
              required
              size="medium"
              placeholder="Enter an epic project name..."
              InputProps={{
                sx: { 
                  borderRadius: 2,
                  backgroundColor: theme.palette.background.paper,
                  fontFamily: '"Inter", sans-serif',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.02),
                  }
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main,
                    borderWidth: 2,
                  }
                }
              }}
            />
            <Box sx={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: theme.palette.text.secondary,
            }}>
              <Edit fontSize="small" />
            </Box>
          </Box>
          
          {/* Description */}
          <Box>
            <TextField
              fullWidth
              label={
                <Typography variant="body2" fontWeight="600" sx={{ fontFamily: '"Inter", sans-serif' }}>
                  Description
                </Typography>
              }
              value={formData.description}
              onChange={handleChange('description')}
              multiline
              rows={3}
              disabled={loading}
              required
              placeholder="Describe your project vision and goals..."
              InputProps={{
                sx: { 
                  borderRadius: 2,
                  backgroundColor: theme.palette.background.paper,
                  fontFamily: '"Inter", sans-serif',
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main,
                    borderWidth: 2,
                  }
                }
              }}
            />
          </Box>
          
          {/* Date Range */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 3,
          }}>
            <Box sx={{ flex: 1, position: 'relative' }}>
              <TextField
                fullWidth
                label={
                  <Typography variant="body2" fontWeight="600" sx={{ fontFamily: '"Inter", sans-serif' }}>
                    Start Date
                  </Typography>
                }
                type="date"
                value={formData.startDate}
                onChange={handleChange('startDate')}
                InputLabelProps={{ shrink: true }}
                disabled={loading}
                required
                InputProps={{
                  sx: { 
                    borderRadius: 2,
                    backgroundColor: theme.palette.background.paper,
                    fontFamily: '"Inter", sans-serif',
                  }
                }}
              />
              <Box sx={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: theme.palette.primary.main,
              }}>
                <CalendarToday fontSize="small" />
              </Box>
            </Box>
            
            <Box sx={{ flex: 1, position: 'relative' }}>
              <TextField
                fullWidth
                label={
                  <Typography variant="body2" fontWeight="600" sx={{ fontFamily: '"Inter", sans-serif' }}>
                    End Date
                  </Typography>
                }
                type="date"
                value={formData.endDate}
                onChange={handleChange('endDate')}
                InputLabelProps={{ shrink: true }}
                disabled={loading}
                required
                InputProps={{
                  sx: { 
                    borderRadius: 2,
                    backgroundColor: theme.palette.background.paper,
                    fontFamily: '"Inter", sans-serif',
                  }
                }}
              />
              <Box sx={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: theme.palette.secondary.main,
              }}>
                <Flag fontSize="small" />
              </Box>
            </Box>
          </Box>
          
          {/* Team Selection */}
          {teams.length > 0 && (
            <Box sx={{ position: 'relative' }}>
              <FormControl fullWidth size="medium">
                <InputLabel sx={{ fontFamily: '"Inter", sans-serif' }}>Select Team</InputLabel>
                <Select
                  value={formData.teamId}
                  onChange={handleChange('teamId')}
                  label="Select Team"
                  disabled={loading}
                  sx={{ 
                    borderRadius: 2,
                    backgroundColor: theme.palette.background.paper,
                    fontFamily: '"Inter", sans-serif',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                    }
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        borderRadius: 2,
                        mt: 1,
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      }
                    }
                  }}
                >
                  {teams.map(team => (
                    <MenuItem key={team._id || team.id} value={team._id || team.id}>
                      <Box display="flex" alignItems="center" gap={2} sx={{ py: 1 }}>
                        <Avatar 
                          sx={{ 
                            width: 36, 
                            height: 36, 
                            fontSize: 14,
                            fontWeight: 'bold',
                            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
                          }}
                        >
                          {team.teamName?.charAt(0)?.toUpperCase() || 'T'}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="600" sx={{ fontFamily: '"Inter", sans-serif' }}>
                            {team.teamName || team.name || 'Unnamed Team'}
                          </Typography>
                          <Typography variant="caption" sx={{ 
                            color: theme.palette.text.secondary,
                            fontFamily: '"Inter", sans-serif',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5
                          }}>
                            <People fontSize="inherit" /> {team.members?.length || 0} members
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box sx={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: theme.palette.text.secondary,
              }}>
                <Group fontSize="small" />
              </Box>
            </Box>
          )}
          
          {/* Choose Your Mentor */}
          <Box sx={{ position: 'relative' }}>
            <FormControl fullWidth size="medium">
              <InputLabel sx={{ fontFamily: '"Inter", sans-serif' }}>Choose Your Mentor</InputLabel>
              <Select
                value={formData.mentorId || ''}
                onChange={handleChange('mentorId')}
                label="Choose Your Mentor"
                disabled={loading || !mentors?.length}
                sx={{ 
                  borderRadius: 2,
                  backgroundColor: theme.palette.background.paper,
                  fontFamily: '"Inter", sans-serif',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(theme.palette.info.main, 0.3),
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.info.main,
                  }
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      borderRadius: 2,
                      mt: 1,
                      backgroundColor: theme.palette.background.paper,
                      border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                    }
                  }
                }}
              >
                <MenuItem value="">
                  <Typography variant="body2" sx={{ 
                    fontStyle: 'italic',
                    color: theme.palette.text.secondary,
                    fontFamily: '"Inter", sans-serif',
                  }}>
                    No mentor selected (optional)
                  </Typography>
                </MenuItem>
                {mentors?.map(mentor => (
                  <MenuItem key={mentor._id || mentor.id} value={mentor._id || mentor.id}>
                    <Box display="flex" alignItems="center" gap={2} sx={{ py: 1 }}>
                      <Avatar 
                        src={mentor.avatar}
                        sx={{ 
                          width: 36, 
                          height: 36, 
                          fontSize: 14,
                          fontWeight: 'bold',
                          background: `linear-gradient(45deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
                          boxShadow: `0 2px 8px ${alpha(theme.palette.info.main, 0.3)}`,
                        }}
                      >
                        {mentor.name?.charAt(0)?.toUpperCase() || 'M'}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="600" sx={{ fontFamily: '"Inter", sans-serif' }}>
                          {mentor.name || mentor.username || 'Unnamed Mentor'}
                        </Typography>
                        <Typography variant="caption" sx={{ 
                          color: theme.palette.text.secondary,
                          fontFamily: '"Inter", sans-serif',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5
                        }}>
                          <School fontSize="inherit" /> {mentor.expertise || 'Mentor'}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{
              position: 'absolute',
              right: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: theme.palette.info.main,
            }}>
              <School fontSize="small" />
            </Box>
            {!mentors?.length && (
              <Typography variant="caption" sx={{ 
                color: theme.palette.warning.main,
                fontFamily: '"Inter", sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                mt: 1,
                ml: 1
              }}>
                <Info fontSize="inherit" /> No mentors available yet
              </Typography>
            )}
          </Box>
          
          {/* Tags */}
          <Box>
            <FormControl fullWidth size="medium">
              <TextField
                label={
                  <Typography variant="body2" fontWeight="600" sx={{ fontFamily: '"Inter", sans-serif' }}>
                    Add Tags
                  </Typography>
                } 
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                placeholder="Type and press Enter to add tags..."
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton 
                        onClick={handleTagAdd} 
                        disabled={!tagInput.trim()}
                        size="medium"
                        sx={{ 
                          mr: -1,
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          '&:hover': {
                            backgroundColor: theme.palette.primary.main,
                            color: 'white',
                            transform: 'scale(1.1)',
                          },
                          transition: 'all 0.2s ease',
                        }}
                      >
                        <Add />
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: { 
                    borderRadius: 2,
                    backgroundColor: theme.palette.background.paper,
                    fontFamily: '"Inter", sans-serif',
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main,
                      borderWidth: 2,
                    }
                  }
                }}
              />
            </FormControl>
            
            {tags.length > 0 && (
              <Box sx={{ 
                mt: 2, 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 1,
                p: 2,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.primary.main, 0.03),
                border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
              }}>
                {tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    size="medium"
                    onDelete={() => handleTagRemove(tag)}
                    deleteIcon={<Close fontSize="small" />}
                    sx={{
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      fontWeight: 500,
                      borderRadius: 6,
                      px: 1.5,
                      py: 2,
                      fontFamily: '"Inter", sans-serif',
                      '& .MuiChip-deleteIcon': {
                        color: alpha(theme.palette.primary.main, 0.6),
                        '&:hover': {
                          color: theme.palette.primary.main,
                        }
                      },
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                      },
                      transition: 'all 0.2s ease',
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
          
          {/* Grading Criteria */}
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 3, 
              borderRadius: 3,
              backgroundColor: alpha(theme.palette.primary.main, 0.03),
              border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: 4,
                height: '100%',
                background: `linear-gradient(180deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Box sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 24,
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
              }}>
                <Assessment />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight="700" sx={{ 
                  color: theme.palette.text.primary,
                  fontFamily: '"Alkatra", cursive',
                }}>
                  Grading Criteria
                </Typography>
                <Typography variant="caption" sx={{ 
                  color: theme.palette.text.secondary,
                  fontFamily: '"Inter", sans-serif',
                }}>
                  Set up how your project will be evaluated
                </Typography>
              </Box>
            </Box>
            
            <FormControlLabel
              control={
                <MuiCheckbox
                  checked={formData.allowPeerReview}
                  onChange={(e) => handleChange('allowPeerReview')({ target: { value: e.target.checked } })}
                  size="medium"
                  sx={{
                    color: theme.palette.primary.main,
                    '&.Mui-checked': {
                      color: theme.palette.primary.main,
                    }
                  }}
                />
              }
              label={
                <Typography variant="body1" sx={{ fontFamily: '"Inter", sans-serif' }}>
                  <Box component="span" fontWeight="600">Allow Peer Review</Box>
                  <Typography variant="caption" sx={{ 
                    color: theme.palette.text.secondary, 
                    ml: 1,
                    fontFamily: '"Inter", sans-serif',
                  }}>
                    (Team members can evaluate each other's work)
                  </Typography>
                </Typography>
              }
              sx={{ mb: 3 }}
            />
            
            <Typography variant="body1" fontWeight="600" gutterBottom sx={{ 
              mt: 2,
              fontFamily: '"Inter", sans-serif',
              color: theme.palette.text.primary,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <TrendingUp fontSize="small" /> Grading Weights (Total must equal 100%)
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 3,
              mt: 2
            }}>
              {[
                { 
                  label: "Task Completion", 
                  value: formData.taskCompletionWeight, 
                  onChange: handleChange('taskCompletionWeight'),
                  icon: <CheckCircle fontSize="small" />,
                  color: theme.palette.primary.main
                },
                { 
                  label: "Peer Review", 
                  value: formData.peerReviewWeight, 
                  onChange: handleChange('peerReviewWeight'),
                  icon: <Handshake fontSize="small" />,
                  color: theme.palette.secondary.main
                },
                { 
                  label: "Teacher Review", 
                  value: formData.teacherReviewWeight, 
                  onChange: handleChange('teacherReviewWeight'),
                  icon: <School fontSize="small" />,
                  color: theme.palette.info.main
                }
              ].map((field, index) => (
                <Box key={field.label} sx={{ flex: 1, position: 'relative'}}>
                  <TextField
                    fullWidth
                    label={
                      <Typography variant="body2" fontWeight="600" sx={{ fontFamily: '"Inter", sans-serif' }}>
                        {field.label}
                      </Typography>
                    }
                    type="number"
                    value={field.value}
                    onChange={field.onChange}
                    disabled={loading}
                    size="medium"
                    placeholder="Enter weight percentage"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: field.color,
                          borderWidth: 2,
                        }
                      }
                    }}
                  />
                  <Box sx={{
                    position: 'absolute',
                    left: 45,
                    top: '45%',
                    transform: 'translateY(-50%)',
                    color: field.color,
                    opacity: 0.7,
                  }}>
                    {field.icon}
                  </Box>
                </Box>
              ))}
            </Box>
            
            <Box sx={{ 
              mt: 3, 
              p: 2.5, 
              borderRadius: 2,
              backgroundColor: alpha(
                (formData.taskCompletionWeight + formData.peerReviewWeight + formData.teacherReviewWeight) === 100 
                  ? theme.palette.success.main 
                  : theme.palette.error.main, 
                0.1
              ),
              border: `2px solid ${alpha(
                (formData.taskCompletionWeight + formData.peerReviewWeight + formData.teacherReviewWeight) === 100 
                  ? theme.palette.success.main 
                  : theme.palette.error.main, 
                0.2
              )}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2
            }}>
              <Typography 
                variant="body1" 
                fontWeight="600"
                color={
                  (formData.taskCompletionWeight + formData.peerReviewWeight + formData.teacherReviewWeight) === 100 
                    ? 'success.main' 
                    : 'error.main'
                }
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1.5,
                  fontFamily: '"Inter", sans-serif',
                }}
              >
                <Box sx={{ 
                  width: 32, 
                  height: 32, 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: alpha(
                    (formData.taskCompletionWeight + formData.peerReviewWeight + formData.teacherReviewWeight) === 100 
                      ? theme.palette.success.main 
                      : theme.palette.error.main, 
                    0.2
                  ),
                }}>
                  {(formData.taskCompletionWeight + formData.peerReviewWeight + formData.teacherReviewWeight) === 100 
                    ? <CheckCircle fontSize="small" /> 
                    : <Warning fontSize="small" />}
                </Box>
                <span>Total Weight:</span>
              </Typography>
              
              <Typography 
                variant="h5" 
                fontWeight="800"
                color={
                  (formData.taskCompletionWeight + formData.peerReviewWeight + formData.teacherReviewWeight) === 100 
                    ? 'success.main' 
                    : 'error.main'
                }
                sx={{ fontFamily: '"Inter", sans-serif' }}
              >
                {formData.taskCompletionWeight + formData.peerReviewWeight + formData.teacherReviewWeight}%
              </Typography>
              
              <Chip
                label={
                  (formData.taskCompletionWeight + formData.peerReviewWeight + formData.teacherReviewWeight) === 100 
                    ? 'Perfectly Balanced!' 
                    : 'Needs Adjustment'
                }
                size="small"
                sx={{
                  backgroundColor: alpha(
                    (formData.taskCompletionWeight + formData.peerReviewWeight + formData.teacherReviewWeight) === 100 
                      ? theme.palette.success.main 
                      : theme.palette.error.main, 
                    0.2
                  ),
                  color: (formData.taskCompletionWeight + formData.peerReviewWeight + formData.teacherReviewWeight) === 100 
                    ? 'success.main' 
                    : 'error.main',
                  fontWeight: 600,
                  borderRadius: 6,
                  px: 2,
                  fontFamily: '"Inter", sans-serif',
                }}
              />
            </Box>
          </Paper>
        </Box>
        
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert 
              severity="error" 
              sx={{ 
                mt: 4, 
                borderRadius: 2,
                border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                backgroundColor: alpha(theme.palette.error.main, 0.05),
                fontFamily: '"Inter", sans-serif',
              }}
              onClose={() => setError('')}
            >
              <Typography fontWeight="600" fontFamily='"Inter", sans-serif' sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Warning fontSize="small" /> {error}
              </Typography>
            </Alert>
          </motion.div>
        )}
      </Box>
    </DialogContent>
    
    <DialogActions sx={{ 
      px: 4, 
      py: 3,
      borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
      background: alpha(theme.palette.background.default, 0.5),
    }}>
      <Button 
        onClick={onClose} 
        disabled={loading}
        variant="outlined"
        startIcon={<Close />}
        sx={{
          borderRadius: 2,
          px: 4,
          py: 1.5,
          borderWidth: 2,
          borderColor: alpha(theme.palette.text.secondary, 0.3),
          color: theme.palette.text.secondary,
          fontWeight: 600,
          fontFamily: '"Adlam Display", serif',
          '&:hover': {
            borderWidth: 2,
            borderColor: theme.palette.text.primary,
            color: theme.palette.text.primary,
            backgroundColor: alpha(theme.palette.text.primary, 0.04),
            transform: 'translateY(-2px)',
          },
          transition: 'all 0.3s ease',
        }}
      >
        Cancel
      </Button>
      <Button
        type='submit'
        onClick={handleSubmit}
        variant="contained"
        disabled={loading}
        startIcon={loading ? <CircularProgress size={22} /> : <Add />}
        sx={{
          borderRadius: 2,
          px: 5,
          py: 1.5,
          fontWeight: 700,
          fontSize: '1rem',
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          color: theme.palette.primary.contrastText,
          boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
          fontFamily: '"Adlam Display", serif',
          '&:hover': {
            boxShadow: `0 10px 30px ${alpha(theme.palette.primary.main, 0.6)}`,
            transform: 'translateY(-3px) scale(1.02)',
          },
          '&.Mui-disabled': {
            background: alpha(theme.palette.text.disabled, 0.3),
            color: alpha(theme.palette.text.disabled, 0.5),
          },
          transition: 'all 0.3s ease',
        }}
      >
        {loading ? 'Creating...' : 'Create Project'}
      </Button>
    </DialogActions>
  </Dialog>
  )
};

// Create Task Modal (now supports Edit mode too)
export const CreateTaskModal = ({ open, onClose, project, theme, teams, mode = 'create', taskToEdit = null }) => {
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
  
  // Set initial form data when editing
  useEffect(() => {
    if (mode === 'edit' && taskToEdit && open) {
      // Convert estimatedTime from seconds to hours for display
      const estimatedHours = taskToEdit.estimatedTime / 3600;
      
      setFormData({
        taskTitle: taskToEdit.taskTitle || '',
        description: taskToEdit.description || '',
        assignedTo: taskToEdit.assignedTo?._id || taskToEdit.assignedTo || '',
        deadline: taskToEdit.deadline ? new Date(taskToEdit.deadline).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        estimatedTime: estimatedHours.toFixed(1) || '',
        estimatedTimeUnit: 'hours' // Default unit
      });
    } else if (mode === 'create') {
      // Reset form for create mode
      setFormData({
        taskTitle: '',
        description: '',
        assignedTo: '',
        deadline: new Date().toISOString().split('T')[0],
        estimatedTime: '',
        estimatedTimeUnit: 'hours'
      });
    }
  }, [open, mode, taskToEdit]);



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
        projectId: project?._id || project?.projectId,
        assignedTo: formData.assignedTo,
        deadline: formData.deadline,
        estimatedTime: Math.round(estimatedSeconds)
      };

      let response;
      
      if (mode === 'edit' && taskToEdit) {
        // Update existing task
        response = await axiosClient.put(`/user/task/update/${taskToEdit._id}`, taskData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } else {
        // Create new task
        response = await axiosClient.post('/user/task/create', taskData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }

      onClose();
      
    } catch (err) {
      console.error(`Error ${mode === 'edit' ? 'updating' : 'creating'} task:`, err);
      setError(err.response?.data?.error || err.message || `Failed to ${mode === 'edit' ? 'update' : 'create'} task`);
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
    const fetchTeamMembers = async () => {
      if (!open || !project) return;
      setFetchingMembers(true);
      try {

        teams.map(team => {
          if (project.teamId._id === team._id) {
            const members = team.members?.map(member => ({
              id: member.user?._id,
              username: member.user?.username
            })) || [];
        
        
            setTeamMembers(members);
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

  const getMemberDisplay = (member) => {
    if (!member || typeof member !== 'object') {
      return { id: '', name: 'Unknown Member', email: '' };
    }
    
    return {
      id: member._id || member.id || '',
      name: member.username || member.fullName || member.name || 'Unknown Member',
      email: member.email || '',
      initial: (member.username || member.email || 'U').charAt(0).toUpperCase()
    };
  };

  // Update the modal title based on mode
  const getModalTitle = () => {
    if (mode === 'edit') {
      return 'Edit Task';
    }
    return 'Craft New Task';
  };

  const getButtonText = () => {
    if (loading) {
      return mode === 'edit' ? 'Updating...' : 'Creating Magic...';
    }
    if (fetchingMembers) return 'Loading...';
    if (teamMembers.length === 0) return 'Add Team First';
    return mode === 'edit' ? 'Update Task' : 'Create Task';
  };

  // Update the JSX to show different icons based on mode
  const getHeaderIcon = () => {
    if (mode === 'edit') {
      return <Edit fontSize="medium" />;
    }
    return <AddTask fontSize="medium" />;
  };

  // Update the header gradient text
  const getHeaderGradient = () => {
    if (mode === 'edit') {
      return `linear-gradient(45deg, ${theme.palette.info.main}, ${theme.palette.secondary.main})`;
    }
    return `linear-gradient(45deg, #FF6B8B, #8A2BE2, #4169E1)`;
  };

return (
  <Dialog 
    open={open} 
    onClose={!loading ? onClose : undefined} 
    maxWidth="sm" 
    fullWidth
    PaperProps={{ 
      sx: {
        borderRadius: 4,
        backgroundColor: theme.palette.background.paper,
        border: `2px solid ${alpha(theme.palette.mode === 'dark' ? '#444' : '#E6E6FA', 0.5)}`,
        overflow: 'hidden',
        backgroundImage: theme.palette.mode === 'dark' 
          ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.98)} 0%, ${alpha('#8A2BE2', 0.08)} 50%, ${alpha('#FF6B8B', 0.05)} 100%)`
          : `linear-gradient(135deg, ${alpha('#FFFFFF', 0.98)} 0%, ${alpha('#E6E6FA', 0.1)} 50%, ${alpha('#FFE4E1', 0.05)} 100%)`,
        boxShadow: `0 25px 50px ${alpha(theme.palette.mode === 'dark' ? '#000' : '#8A2BE2', 0.15)}`,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 5,
          background: mode === 'edit' 
            ? `linear-gradient(90deg, ${theme.palette.info.main}, ${theme.palette.secondary.main})`
            : `linear-gradient(90deg, #FF6B8B, #8A2BE2, #4169E1)`,
        }
      }
    }}
  >
    {/* Dialog Header */}
    <DialogTitle sx={{ 
      pb: 2,
      pt: 3.5,
      px: 4,
      background: theme.palette.mode === 'dark' 
        ? mode === 'edit'
          ? `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.2)} 0%, ${alpha(theme.palette.secondary.main, 0.15)} 100%)`
          : `linear-gradient(135deg, ${alpha('#8A2BE2', 0.2)} 0%, ${alpha('#4169E1', 0.15)} 100%)`
        : mode === 'edit'
          ? `linear-gradient(135deg, ${alpha(theme.palette.info.light, 0.3)} 0%, ${alpha(theme.palette.secondary.light, 0.2)} 100%)`
          : `linear-gradient(135deg, ${alpha('#FFE4E1', 0.3)} 0%, ${alpha('#E6E6FA', 0.2)} 100%)`,
      borderBottom: `1px solid ${alpha(theme.palette.mode === 'dark' ? '#8A2BE2' : '#E6E6FA', 0.3)}`,
    }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
          <Box sx={{
            width: 48,
            height: 48,
            borderRadius: 3,
            background: mode === 'edit'
              ? `linear-gradient(45deg, ${theme.palette.info.main}, ${theme.palette.secondary.main})`
              : `linear-gradient(45deg, #FF6B8B, #8A2BE2)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: 22,
            fontWeight: 'bold',
            boxShadow: mode === 'edit'
              ? `0 8px 20px ${alpha(theme.palette.info.main, 0.3)}`
              : `0 8px 20px ${alpha('#FF6B8B', 0.3)}`,
            position: 'relative',
            overflow: 'hidden',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: -50,
              left: -50,
              width: 80,
              height: 80,
              background: `linear-gradient(45deg, transparent, ${alpha('#FFF', 0.3)}, transparent)`,
              transform: 'rotate(45deg)',
              animation: 'shimmer 2s infinite',
            },
            '@keyframes shimmer': {
              '0%': { transform: 'translateX(-100%) rotate(45deg)' },
              '100%': { transform: 'translateX(200%) rotate(45deg)' },
            }
          }}>
            {getHeaderIcon()}
          </Box>
          <Box>
            <Typography variant="h5" fontWeight="800" sx={{ 
              color: theme.palette.text.primary,
              fontFamily: '"Pacifico", cursive',
              background: getHeaderGradient(),
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px',
            }}>
              {getModalTitle()}
            </Typography>
            <Typography variant="caption" sx={{ 
              color: theme.palette.text.secondary,
              fontFamily: '"Quicksand", sans-serif',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              mt: 0.5,
              fontSize: '0.85rem',
              fontWeight: 500,
            }}>
              <Box component="span" sx={{ 
                color: mode === 'edit' ? theme.palette.info.main : '#FF6B8B',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5
              }}>
                <RocketLaunch fontSize="inherit" />
              </Box>
              {mode === 'edit' ? 'Edit task in' : 'Add to'} <Box component="span" sx={{ fontWeight: 700, color: '#8A2BE2', ml: 0.5 }}>{project?.projectName || 'Untitled Project'}</Box>
            </Typography>
          </Box>
        </Box>
        <IconButton 
          onClick={onClose} 
          disabled={loading} 
          size="medium"
          sx={{
            color: theme.palette.mode === 'dark' ? '#E6E6FA' : '#8A2BE2',
            backgroundColor: alpha(theme.palette.mode === 'dark' ? '#8A2BE2' : '#E6E6FA', 0.15),
            border: `1px solid ${alpha(theme.palette.mode === 'dark' ? '#8A2BE2' : '#E6E6FA', 0.3)}`,
            borderRadius: 3,
            '&:hover': {
              backgroundColor: alpha('#FF6B8B', 0.2),
              color: '#FF6B8B',
              transform: 'rotate(90deg) scale(1.1)',
              borderColor: alpha('#FF6B8B', 0.4),
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            width: 44,
            height: 44,
          }}
        >
          <Close />
        </IconButton>
      </Box>
    </DialogTitle>
    
    {/* Dialog Content */}
    <DialogContent dividers sx={{ 
      pt: 4, 
      px: 4,
      background: theme.palette.mode === 'dark' 
        ? `linear-gradient(135deg, ${alpha('#0F0F23', 0.4)} 0%, ${alpha('#1A1A2E', 0.5)} 100%)`
        : `linear-gradient(135deg, ${alpha('#FAF9F6', 0.6)} 0%, ${alpha('#F5F5FF', 0.4)} 100%)`,
    }}>
      <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
          
          {/* Task Title */}
          <Box sx={{ position: 'relative' }}>
            <TextField
              fullWidth
              label={
                <Typography variant="body2" fontWeight="700" sx={{ 
                  fontFamily: '"Quicksand", sans-serif',
                  color: theme.palette.mode === 'dark' ? '#E6E6FA' : '#8A2BE2',
                }}>
                  Task Title
                </Typography>
              }
              value={formData.taskTitle}
              onChange={(e) => setFormData(prev => ({ ...prev, taskTitle: e.target.value }))}
              disabled={loading}
              required
              size="medium"
              placeholder="What needs to be done? Make it catchy!"
              InputProps={{
                sx: { 
                  borderRadius: 3,
                  backgroundColor: alpha(theme.palette.mode === 'dark' ? '#1A1A2E' : '#FFFFFF', 0.8),
                  fontFamily: '"Quicksand", sans-serif',
                  fontSize: '1rem',
                  paddingLeft: 3,
                  border: `2px solid ${alpha(theme.palette.mode === 'dark' ? '#8A2BE2' : '#E6E6FA', 0.3)}`,
                  '&:hover': {
                    borderColor: '#FF6B8B',
                    backgroundColor: alpha(theme.palette.mode === 'dark' ? '#1A1A2E' : '#FFFFFF', 0.9),
                  },
                  '&.Mui-focused': {
                    borderColor: '#8A2BE2',
                    boxShadow: `0 0 0 3px ${alpha('#8A2BE2', 0.2)}`,
                  }
                }
              }}
            />
            <Box sx={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#FF6B8B',
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%, 100%': { transform: 'translateY(-50%) scale(1)' },
                '50%': { transform: 'translateY(-50%) scale(1.1)' },
              }
            }}>
              <Edit fontSize="small" />
            </Box>
          </Box>
          
          {/* Description */}
          <Box sx={{ position: 'relative' }}>
            <TextField
              fullWidth
              label={
                <Typography variant="body2" fontWeight="700" sx={{ 
                  fontFamily: '"Quicksand", sans-serif',
                  color: theme.palette.mode === 'dark' ? '#E6E6FA' : '#4169E1',
                }}>
                  Description
                </Typography>
              }
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              multiline
              rows={3}
              disabled={loading}
              placeholder="Describe it with details!"
              InputProps={{
                sx: { 
                  borderRadius: 3,
                  backgroundColor: alpha(theme.palette.mode === 'dark' ? '#1A1A2E' : '#FFFFFF', 0.8),
                  fontFamily: '"Quicksand", sans-serif',
                  fontSize: '0.95rem',
                  paddingLeft: 3,
                  border: `2px solid ${alpha(theme.palette.mode === 'dark' ? '#4169E1' : '#ADD8E6', 0.3)}`,
                  '&:hover': {
                    borderColor: '#4169E1',
                  },
                  '&.Mui-focused': {
                    borderColor: '#4169E1',
                    boxShadow: `0 0 0 3px ${alpha('#4169E1', 0.2)}`,
                  }
                }
              }}
            />
            <Box sx={{
              position: 'absolute',
              right: 16,
              top: 16,
              color: '#4169E1',
              opacity: 0.7,
            }}>
              <Description fontSize="small" />
            </Box>
          </Box>
          
          {/* Assign To */}
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 3, 
              borderRadius: 3,
              backgroundColor: alpha(theme.palette.mode === 'dark' ? '#8A2BE2' : '#E6E6FA', 0.08),
              border: `2px dashed ${alpha(theme.palette.mode === 'dark' ? '#8A2BE2' : '#8A2BE2', 0.3)}`,
              backgroundImage: `radial-gradient(circle at 30% 50%, ${alpha('#FF6B8B', 0.05)} 0%, transparent 50%)`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: `linear-gradient(45deg, #8A2BE2, #4169E1)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 18,
                boxShadow: `0 4px 12px ${alpha('#8A2BE2', 0.4)}`,
              }}>
                <Person fontSize="small" />
              </Box>
              <Box>
                <Typography variant="body1" fontWeight="700" sx={{ 
                  color: theme.palette.mode === 'dark' ? '#E6E6FA' : '#8A2BE2',
                  fontFamily: '"Quicksand", sans-serif',
                }}>
                  Assign To
                </Typography>
                <Typography variant="caption" sx={{ 
                  color: theme.palette.text.secondary,
                  fontFamily: '"Quicksand", sans-serif',
                }}>
                  Who's taking this on?
                </Typography>
              </Box>
            </Box>
            
            <FormControl fullWidth required size="medium">
              <Select
                value={formData.assignedTo}
                onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                disabled={loading || fetchingMembers || teamMembers.length === 0}
                displayEmpty
                sx={{ 
                  borderRadius: 3,
                  backgroundColor: alpha(theme.palette.mode === 'dark' ? '#1A1A2E' : '#FFFFFF', 0.9),
                  fontFamily: '"Quicksand", sans-serif',
                  border: `2px solid ${alpha('#8A2BE2', 0.2)}`,
                  '&:hover': {
                    borderColor: '#8A2BE2',
                  },
                  '& .MuiSelect-select': {
                    paddingLeft: 3,
                    paddingRight: 6,
                  }
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      borderRadius: 3,
                      mt: 1,
                      backgroundColor: theme.palette.background.paper,
                      border: `2px solid ${alpha('#8A2BE2', 0.2)}`,
                      boxShadow: `0 15px 30px ${alpha('#8A2BE2', 0.15)}`,
                    }
                  }
                }}
                renderValue={(selected) => {
                  if (!selected) {
                    return (
                      <Typography sx={{ 
                        color: theme.palette.text.secondary,
                        fontFamily: '"Quicksand", sans-serif',
                        fontStyle: 'italic',
                      }}>
                        Select a teammate
                      </Typography>
                    );
                  }
                  const member = teamMembers.find(m => getMemberDisplay(m).id === selected);
                  if (member) {
                    const memberInfo = getMemberDisplay(member);
                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar 
                          sx={{ 
                            width: 32, 
                            height: 32, 
                            fontSize: 14,
                            background: `linear-gradient(45deg, #FF6B8B, #8A2BE2)`,
                            boxShadow: `0 3px 8px ${alpha('#FF6B8B', 0.3)}`,
                          }}
                        >
                          {memberInfo.initial}
                        </Avatar>
                        <Typography sx={{ 
                          fontFamily: '"Quicksand", sans-serif',
                          fontWeight: 600,
                        }}>
                          {memberInfo.name}
                        </Typography>
                      </Box>
                    );
                  }
                  return selected;
                }}
              >
                {fetchingMembers ? (
                  <MenuItem disabled value="">
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: 2,
                      py: 3,
                      width: '100%'
                    }}>
                      <CircularProgress size={24} sx={{ color: '#8A2BE2' }} />
                      <Typography variant="body2" sx={{ 
                        color: theme.palette.text.secondary,
                        fontFamily: '"Quicksand", sans-serif',
                      }}>
                        Loading your squad...
                      </Typography>
                    </Box>
                  </MenuItem>
                ) : teamMembers.length === 0 ? (
                  <MenuItem disabled value="">
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      py: 2,
                    }}>
                      <Box sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: `linear-gradient(45deg, ${alpha('#FF6B8B', 0.1)}, ${alpha('#8A2BE2', 0.1)})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: theme.palette.text.secondary,
                      }}>
                        <PersonOff fontSize="small" />
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ 
                          fontFamily: '"Quicksand", sans-serif',
                          fontWeight: 600,
                        }}>
                          No teammates yet!
                        </Typography>
                        <Typography variant="caption" sx={{ 
                          color: theme.palette.text.secondary,
                          fontFamily: '"Quicksand", sans-serif',
                        }}>
                          Add members to the project first
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ) : (
                  teamMembers.map((member, index) => {
                    const memberInfo = getMemberDisplay(member);
                    return (
                      <MenuItem 
                        key={memberInfo.id || index} 
                        value={memberInfo.id}
                        sx={{
                          py: 2,
                          borderRadius: 2,
                          margin: 1,
                          '&:hover': {
                            backgroundColor: alpha('#8A2BE2', 0.08),
                            transform: 'translateX(5px)',
                            transition: 'all 0.2s ease',
                          },
                          '&.Mui-selected': {
                            backgroundColor: alpha('#8A2BE2', 0.12),
                            '&:hover': {
                              backgroundColor: alpha('#8A2BE2', 0.16),
                            }
                          }
                        }}
                      >
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 2.5,
                          width: '100%'
                        }}>
                          <Avatar 
                            sx={{ 
                              width: 44, 
                              height: 44, 
                              fontSize: 16,
                              fontWeight: 'bold',
                              background: `linear-gradient(45deg, #FF6B8B, #8A2BE2)`,
                              boxShadow: `0 4px 10px ${alpha('#FF6B8B', 0.3)}`,
                              border: `2px solid ${alpha('#FFF', 0.3)}`,
                            }}
                          >
                            {memberInfo.initial}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" fontWeight="700" sx={{ 
                              fontFamily: '"Quicksand", sans-serif',
                              color: theme.palette.text.primary,
                            }}>
                              {memberInfo.name}
                            </Typography>
                            {memberInfo.email && (
                              <Typography variant="caption" sx={{ 
                                color: theme.palette.text.secondary,
                                fontFamily: '"Quicksand", sans-serif',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5
                              }}>
                                <Email fontSize="inherit" /> {memberInfo.email}
                              </Typography>
                            )}
                          </Box>
                          <Box sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            background: `linear-gradient(45deg, #FF6B8B, #8A2BE2)`,
                            opacity: formData.assignedTo === memberInfo.id ? 1 : 0,
                            transition: 'opacity 0.3s ease',
                          }} />
                        </Box>
                      </MenuItem>
                    );
                  })
                )}
              </Select>
            </FormControl>
            
            {teamMembers.length === 0 && !fetchingMembers && (
              <Box sx={{ 
                mt: 2, 
                p: 2, 
                borderRadius: 2,
                backgroundColor: alpha('#FF6B8B', 0.08),
                border: `1px solid ${alpha('#FF6B8B', 0.2)}`,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}>
                <WarningAmber fontSize="small" sx={{ color: '#FF6B8B' }} />
                <Typography variant="caption" sx={{ 
                  color: theme.palette.text.secondary,
                  fontFamily: '"Quicksand", sans-serif',
                  fontWeight: 500,
                }}>
                  Add team members to the project first to assign tasks
                </Typography>
              </Box>
            )}
          </Paper>
          
          {/* Deadline & Time Estimate */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 3,
          }}>
            {/* Deadline Card */}
            <Paper 
              sx={{ 
                flex: 1, 
                p: 3, 
                borderRadius: 3,
                backgroundColor: alpha(theme.palette.mode === 'dark' ? '#4169E1' : '#ADD8E6', 0.1),
                border: `2px solid ${alpha('#4169E1', 0.2)}`,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
                <Box sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: `linear-gradient(45deg, #4169E1, #87CEEB)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: 18,
                  boxShadow: `0 4px 12px ${alpha('#4169E1', 0.4)}`,
                }}>
                  <CalendarToday fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="body1" fontWeight="700" sx={{ 
                    color: theme.palette.mode === 'dark' ? '#ADD8E6' : '#4169E1',
                    fontFamily: '"Quicksand", sans-serif',
                  }}>
                    Deadline 
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    color: theme.palette.text.secondary,
                    fontFamily: '"Quicksand", sans-serif',
                  }}>
                    When should it be done?
                  </Typography>
                </Box>
              </Box>
              
              <TextField
                fullWidth
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                disabled={loading}
                required
                size="medium"
                InputProps={{
                  sx: { 
                    borderRadius: 3,
                    backgroundColor: alpha(theme.palette.mode === 'dark' ? '#1A1A2E' : '#FFFFFF', 0.9),
                    fontFamily: '"Quicksand", sans-serif',
                    border: `2px solid ${alpha('#4169E1', 0.3)}`,
                    '&:hover': {
                      borderColor: '#4169E1',
                    },
                    '&.Mui-focused': {
                      borderColor: '#4169E1',
                      boxShadow: `0 0 0 3px ${alpha('#4169E1', 0.2)}`,
                    }
                  }
                }}
              />
            </Paper>
            
            {/* Time Estimate Card */}
            <Paper 
              sx={{ 
                flex: 1, 
                p: 3, 
                borderRadius: 3,
                backgroundColor: alpha(theme.palette.mode === 'dark' ? '#FF6B8B' : '#FFB6C1', 0.1),
                border: `2px solid ${alpha('#FF6B8B', 0.2)}`,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
                <Box sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: `linear-gradient(45deg, #FF6B8B, #FFB6C1)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: 18,
                  boxShadow: `0 4px 12px ${alpha('#FF6B8B', 0.4)}`,
                }}>
                  <AccessTime fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="body1" fontWeight="700" sx={{ 
                    color: theme.palette.mode === 'dark' ? '#FFB6C1' : '#FF6B8B',
                    fontFamily: '"Quicksand", sans-serif',
                  }}>
                    Time Estimate 
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    color: theme.palette.text.secondary,
                    fontFamily: '"Quicksand", sans-serif',
                  }}>
                    How long will it take?
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  type="number"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedTime: e.target.value }))}
                  disabled={loading}
                  required
                  size="medium"
                  placeholder="e.g., 2.5"
                  inputProps={{ 
                    min: 0.1, 
                    step: 0.1,
                  }}
                  InputProps={{
                    sx: { 
                      borderRadius: 3,
                      backgroundColor: alpha(theme.palette.mode === 'dark' ? '#1A1A2E' : '#FFFFFF', 0.9),
                      fontFamily: '"Quicksand", sans-serif',
                      border: `2px solid ${alpha('#FF6B8B', 0.3)}`,
                      '&:hover': {
                        borderColor: '#FF6B8B',
                      },
                      '&.Mui-focused': {
                        borderColor: '#FF6B8B',
                        boxShadow: `0 0 0 3px ${alpha('#FF6B8B', 0.2)}`,
                      }
                    }
                  }}
                />
                
                <FormControl sx={{ minWidth: 120 }} size="medium">
                  <Select
                    value={formData.estimatedTimeUnit}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedTimeUnit: e.target.value }))}
                    disabled={loading}
                    sx={{ 
                      borderRadius: 3,
                      backgroundColor: alpha(theme.palette.mode === 'dark' ? '#1A1A2E' : '#FFFFFF', 0.9),
                      fontFamily: '"Quicksand", sans-serif',
                      border: `2px solid ${alpha('#FF6B8B', 0.3)}`,
                      '&:hover': {
                        borderColor: '#FF6B8B',
                      },
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          borderRadius: 3,
                          backgroundColor: theme.palette.background.paper,
                          border: `2px solid ${alpha('#FF6B8B', 0.2)}`,
                        }
                      }
                    }}
                  >
                    <MenuItem value="minutes" sx={{ fontFamily: '"Quicksand", sans-serif' }}>Minutes</MenuItem>
                    <MenuItem value="hours" sx={{ fontFamily: '"Quicksand", sans-serif' }}>Hours</MenuItem>
                    <MenuItem value="days" sx={{ fontFamily: '"Quicksand", sans-serif' }}>Days</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Paper>
          </Box>
          
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Paper 
                sx={{ 
                  p: 3, 
                  borderRadius: 3,
                  backgroundColor: alpha('#FF6B8B', 0.08),
                  border: `2px solid ${alpha('#FF6B8B', 0.3)}`,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                }}
              >
                <Box sx={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: `linear-gradient(45deg, #FF6B8B, #FF4500)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  flexShrink: 0,
                }}>
                  <Warning fontSize="small" />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight="700" sx={{ 
                    color: theme.palette.mode === 'dark' ? '#FFB6C1' : '#FF6B8B',
                    fontFamily: '"Quicksand", sans-serif',
                    mb: 0.5,
                  }}>
                    Oops! Something needs attention
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: theme.palette.text.secondary,
                    fontFamily: '"Quicksand", sans-serif',
                  }}>
                    {error}
                  </Typography>
                </Box>
                <IconButton 
                  size="small" 
                  onClick={() => setError('')}
                  sx={{
                    color: '#FF6B8B',
                    '&:hover': {
                      backgroundColor: alpha('#FF6B8B', 0.1),
                    }
                  }}
                >
                  <Close fontSize="small" />
                </IconButton>
              </Paper>
            </motion.div>
          )}
        </Box>
      </Box>
    </DialogContent>
    
    {/* Dialog Actions */}
    <DialogActions sx={{ 
      px: 4, 
      py: 3.5,
      borderTop: `1px solid ${alpha(theme.palette.mode === 'dark' ? '#8A2BE2' : '#E6E6FA', 0.3)}`,
      background: theme.palette.mode === 'dark' 
        ? `linear-gradient(135deg, ${alpha('#0F0F23', 0.6)} 0%, ${alpha('#1A1A2E', 0.7)} 100%)`
        : `linear-gradient(135deg, ${alpha('#FAF9F6', 0.8)} 0%, ${alpha('#F5F5FF', 0.6)} 100%)`,
    }}>
      <Button 
        onClick={onClose} 
        disabled={loading}
        variant="outlined"
        startIcon={<Close />}
        sx={{
          borderRadius: 3,
          px: 4,
          py: 1.5,
          borderWidth: 2,
          borderColor: alpha(theme.palette.mode === 'dark' ? '#8A2BE2' : '#8A2BE2', 0.4),
          color: theme.palette.mode === 'dark' ? '#E6E6FA' : '#8A2BE2',
          fontWeight: 700,
          fontFamily: '"Quicksand", sans-serif',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          '&:hover': {
            borderWidth: 2,
            borderColor: '#FF6B8B',
            color: '#FF6B8B',
            backgroundColor: alpha('#FF6B8B', 0.04),
            transform: 'translateY(-2px)',
            boxShadow: `0 8px 20px ${alpha('#FF6B8B', 0.2)}`,
          },
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          minWidth: 140,
        }}
      >
        Cancel
      </Button>
      <Button
        onClick={handleSubmit}
        variant="contained"
        disabled={loading || teamMembers.length === 0 || fetchingMembers}
        startIcon={loading ? <CircularProgress size={22} color="inherit" /> : (mode === 'edit' ? <Save /> : <AddTask />)}
        sx={{
          borderRadius: 3,
          px: 5,
          py: 1.5,
          fontWeight: 800,
          fontSize: '1rem',
          background: teamMembers.length === 0 || fetchingMembers
            ? alpha(theme.palette.text.disabled, 0.3)
            : mode === 'edit'
              ? `linear-gradient(45deg, ${theme.palette.info.main}, ${theme.palette.secondary.main})`
              : `linear-gradient(45deg, #FF6B8B, #8A2BE2, #4169E1)`,
          color: 'white',
          boxShadow: teamMembers.length === 0 || fetchingMembers
            ? 'none'
            : mode === 'edit'
              ? `0 8px 25px ${alpha(theme.palette.info.main, 0.4)}`
              : `0 8px 25px ${alpha('#8A2BE2', 0.4)}`,
          fontFamily: '"Quicksand", sans-serif',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            boxShadow: teamMembers.length === 0 || fetchingMembers
              ? 'none'
              : mode === 'edit'
                ? `0 12px 35px ${alpha(theme.palette.info.main, 0.6)}`
                : `0 12px 35px ${alpha('#8A2BE2', 0.6)}`,
            transform: teamMembers.length === 0 || fetchingMembers
              ? 'none'
              : 'translateY(-3px) scale(1.02)',
            background: teamMembers.length === 0 || fetchingMembers
              ? alpha(theme.palette.text.disabled, 0.3)
              : mode === 'edit'
                ? `linear-gradient(45deg, ${theme.palette.info.main}, ${theme.palette.secondary.main})`
                : `linear-gradient(45deg, #FF6B8B, #8A2BE2, #4169E1)`,
            '&::before': {
              transform: 'translateX(100%)',
            }
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: -100,
            width: '100%',
            height: '100%',
            background: `linear-gradient(90deg, transparent, ${alpha('#FFF', 0.2)}, transparent)`,
            transition: 'transform 0.6s ease',
          },
          '&.Mui-disabled': {
            background: alpha(theme.palette.text.disabled, 0.3),
            color: alpha(theme.palette.text.disabled, 0.5),
          },
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          minWidth: 180,
        }}
      >
        {getButtonText()}
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
const TeamMembersPopover = ({ anchorEl, open, onClose, teamMembers, theme, projectId }) => {
  const navigate = useNavigate();
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
  PaperProps={{
    sx: {
      borderRadius: 3,
      border: `1px solid ${theme.palette.divider}`,
      backgroundColor: theme.palette.background.paper,
      boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.08)}`,
      backdropFilter: 'blur(20px)',
      minWidth: 280,
      maxWidth: 320,
      overflow: 'hidden',
    }
  }}
>
  <Box sx={{ p: 0 }}>
    {/* Header */}
    <Box sx={{
      p: 2.5,
      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
      backgroundColor: alpha(theme.palette.primary.main, 0.05),
    }}>
      <Typography 
        variant="subtitle1" 
        sx={{ 
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          color: theme.palette.primary.main,
        }}
      >
        <Group fontSize="small" />
        Team Members
        <Chip 
          label={teamMembers?.length || 0}
          size="small"
          sx={{ 
            ml: 1,
            height: 20,
            fontSize: '0.75rem',
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.main,
          }}
        />
      </Typography>
      <Typography variant="caption" sx={{ 
        color: theme.palette.text.secondary,
        display: 'block',
        mt: 0.5,
      }}>
        {teamMembers?.length || 0} member{teamMembers?.length !== 1 ? 's' : ''}
      </Typography>
    </Box>

    {/* Member List */}
    <Box sx={{ maxHeight: 320, overflow: 'auto', p: 1 }}>
      {teamMembers?.map((member, index) => (
        <Box
          key={index}
          sx={{
            p: 1.5,
            borderRadius: 2,
            mb: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
              transform: 'translateX(4px)',
            },
            '&:last-child': {
              mb: 0,
            }
          }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              fontSize: 14,
              fontWeight: 600,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            }}
          >
            {(member || 'U').charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 500,
                color: theme.palette.text.primary,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {member || 'Unknown Member'}
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: theme.palette.text.secondary,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                mt: 0.25,
              }}
            >
              <Person fontSize="inherit" />
              Member
            </Typography>
          </Box>
          <Box sx={{ 
            width: 8, 
            height: 8, 
            borderRadius: '50%',
            backgroundColor: index % 3 === 0 ? theme.palette.success.main : 
                           index % 3 === 1 ? theme.palette.warning.main : 
                           theme.palette.error.main,
            opacity: index % 3 === 0 ? 0.8 : 0.4,
          }} />
        </Box>
      ))}

      {(!teamMembers || teamMembers.length === 0) && (
        <Box sx={{ 
          p: 4, 
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1.5,
        }}>
          <Box sx={{ 
            width: 56, 
            height: 56, 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: alpha(theme.palette.divider, 0.1),
            mb: 1,
          }}>
            <Group sx={{ 
              fontSize: 28, 
              color: alpha(theme.palette.text.secondary, 0.5),
            }} />
          </Box>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            No team members
          </Typography>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary, maxWidth: 200 }}>
            Add team members to start collaborating
          </Typography>
        </Box>
      )}
    </Box>

    {/* Footer */}
    {(teamMembers && teamMembers.length > 0) && (
      <Box sx={{
        p: 2,
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        backgroundColor: alpha(theme.palette.background.default, 0.5),
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
          Click to manage
        </Typography>
        <Button
          size="small"
          variant="text"
          endIcon={<ArrowForward fontSize="small" />}
          onClick={() => navigate(`/user-app/my-project/${projectId}`)}
          sx={{
            fontSize: '0.75rem',
            color: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
            }
          }}
        >
          View All
        </Button>
      </Box>
    )} 
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
  onReviewProject,
  userId,
}) => {
  const [teamAnchorEl, setTeamAnchorEl] = useState(null);
  const [tagsAnchorEl, setTagsAnchorEl] = useState(null);
  const [dueAnchorEl, setDueAnchorEl] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const navigate = useNavigate();
  
  

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
    <Tooltip title='Double click on a project to view it in My Projects tab'>
  <TableRow
    key={project._id}
    onDoubleClick={() => navigate(`/user-app/my-project/${project._id}`)}

    
    selected={isSelected}
    sx={{
      cursor: 'pointer',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      backgroundColor: isSelected 
        ? alpha(theme.palette.primary.main, 0.08)
        : 'transparent',
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.04),
        transform: 'translateX(4px)',
        '& .progress-bar': {
          transform: 'scaleX(1.05)',
        },
        '& .action-button': {
          opacity: 1,
          transform: 'translateY(0)',
        }
      },
      '&.Mui-selected': {
        backgroundColor: alpha(theme.palette.primary.main, 0.12),
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.16),
        }
      }
    }}
  >
    <TableCell padding="checkbox">
      <Checkbox
        checked={isSelected}
        onChange={(e) => onSelect(project._id, e.target.checked)}
        sx={{
          color: theme.palette.primary.main,
          '&.Mui-checked': {
            color: theme.palette.primary.main,
          },
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
          }
        }}
      />
    </TableCell>

    <TableCell>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: getHealthColor(healthScore),
            boxShadow: `0 0 8px ${alpha(getHealthColor(healthScore), 0.5)}`,
            flexShrink: 0,
          }}
        />
        <Box sx={{ minWidth: 0 }}>
          <Typography 
            variant="body1" 
            sx={{
              fontWeight: 600,
              color: theme.palette.mode === 'dark' ? alpha('#fff', 0.95) : alpha('#000', 0.9),
              fontFamily: '"Inter", sans-serif',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: 200,
            }}
          >
            {project.projectName || 'Untitled Project'}
          </Typography>
          {project.description && (
            <Typography 
              variant="caption" 
              sx={{
                color: theme.palette.text.secondary,
                display: 'block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: 200,
              }}
            >
              {project.description}
            </Typography>
          )}
        </Box>
      </Box>
    </TableCell>

    <TableCell>
      <Box sx={{ display: 'flex', gap: 0.5, opacity: 0.8 }}>
        <Tooltip title="Add Task" arrow>
          <IconButton 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              onCreateTask(project);
            }} 
            disabled={project.status === 'COMPLETED' || project.createdBy._id !== userId}
            className="action-button"
            sx={{
              opacity: 0,
              transform: 'translateY(4px)',
              transition: 'all 0.2s ease',
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.2),
                transform: 'scale(1.1)',
              },
              '&.Mui-disabled': {
                backgroundColor: alpha(theme.palette.divider, 0.2),
                opacity: 0.3,
              }
            }}
          >
            <AddTask fontSize="small" />
          </IconButton>
        </Tooltip>
        

        <Box
            onMouseEnter={(e) => setDueAnchorEl(e.currentTarget)}
            onMouseLeave={() => setTimeout(() => setDueAnchorEl(null), 5000)}
            sx={{ display: 'inline-block' }}
          >
                  
        <Tooltip title="Timeline" arrow >
          <IconButton 
            size="small"
            className="action-button"
            onClick={(e) => e.stopPropagation()}
            sx={{
              opacity: 0,
              transform: 'translateY(4px)',
              transition: 'all 0.2s ease',
              backgroundColor: alpha(theme.palette.info.main, 0.1),
              '&:hover': {
                backgroundColor: alpha(theme.palette.info.main, 0.2),
                transform: 'scale(1.1)',
              }
            }}
          >
            <CalendarToday fontSize="small" />
          </IconButton>
        </Tooltip>
        </Box>
        
        <Tooltip title="Review" arrow>
          <IconButton 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              onReviewProject(project);
            }}
            className="action-button"
            sx={{
              opacity: 0,
              transform: 'translateY(4px)',
              transition: 'all 0.2s ease',
              backgroundColor: alpha(theme.palette.warning.main, 0.1),
              '&:hover': {
                backgroundColor: alpha(theme.palette.warning.main, 0.2),
                transform: 'scale(1.1)',
              }
            }}
          >
            <Grade fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </TableCell>

    <TableCell>
      <Tooltip title="View Team Details" arrow>
        <Box
          display="flex"
          alignItems="center"
          gap={1}
          onMouseEnter={(e) => setTeamAnchorEl(e.currentTarget)}
          onMouseLeave={() => setTimeout(() => setTeamAnchorEl(null), 8000)}
          sx={{ 
            cursor: 'pointer',
            p: 1,
            display: 'inline-block',
            borderRadius: 2,
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
              transform: 'translateX(2px)',
            }
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `linear-gradient(135deg, 
                ${alpha(theme.palette.primary.main, 0.15)} 0%, 
                ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
              border: `1.5px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            }}
          >
            <People fontSize="small" sx={{ color: theme.palette.primary.main }} />
          </Box>
          <Typography 
            variant="body2"
            sx={{
              fontWeight: 500,
              color: theme.palette.text.primary,
              maxWidth: 120,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {project.teamName || 'No team'}
          </Typography>
        </Box>
      </Tooltip>
    </TableCell>

    <TableCell>
      <Box 
        display="flex" 
        alignItems="center" 
        gap={1.5}
        sx={{
          p: 1,
          borderRadius: 2,
          background: alpha(getStatusColor(project.status), 0.08),
          border: `1.5px solid ${alpha(getStatusColor(project.status), 0.2)}`,
          width: 'fit-content',
        }}
      >
        <Box sx={{ color: getStatusColor(project.status) }}>
          {getStatusIcon(project.status)}
        </Box>
        <Typography 
          variant="body2"
          sx={{
            fontWeight: 600,
            color: getStatusColor(project.status),
            fontFamily: '"Inter", sans-serif',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            fontSize: '0.75rem',
          }}
        >
          {project.status ? project.status.replace('_', ' ').toUpperCase() : 'NOT STARTED'}
        </Typography>
      </Box>
    </TableCell>

    <TableCell>
      <Tooltip title="View All Tags" arrow>
        <Box
          display="flex"
          alignItems="center"
          gap={1}
          onMouseEnter={(e) => setTagsAnchorEl(e.currentTarget)}
          onMouseLeave={() => setTimeout(() => setTagsAnchorEl(null), 1000)}
          sx={{ 
            cursor: 'pointer',
            p: 1,
            borderRadius: 2,
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: alpha(theme.palette.secondary.main, 0.05),
              transform: 'translateX(2px)',
            }
          }}
        >
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `linear-gradient(135deg, 
                ${alpha(theme.palette.secondary.main, 0.15)} 0%, 
                ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
              border: `1.5px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
            }}
          >
            <Tag fontSize="small" sx={{ color: theme.palette.secondary.main }} />
          </Box>
          <Typography 
            variant="body2"
            sx={{
              fontWeight: 500,
              color: theme.palette.text.primary,
              maxWidth: 120,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {project.tags?.slice(0, 2).map(tag => `#${tag}`).join(', ')}
            {project.tags && project.tags.length > 2 && '...'}
            {(!project.tags || project.tags.length === 0) && 'No tags'}
          </Typography>
        </Box>
      </Tooltip>
    </TableCell>

    <TableCell>
      <Box sx={{ width: '100%', minWidth: 180 }}>
        {/* Progress Bar */}
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography 
            variant="caption" 
            sx={{ 
              color: theme.palette.text.secondary,
              fontWeight: 500,
              fontFamily: '"Inter", sans-serif',
            }}
          >
            Progress
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              fontWeight: 700,
              color: theme.palette.text.primary,
              fontFamily: '"Inter", sans-serif',
            }}
          >
            {project.progress || 0}%
          </Typography>
        </Box>
        <Box className="progress-bar" sx={{ transition: 'transform 0.3s ease' }}>
          <LinearProgress
            variant="determinate"
            value={project.progress || 0}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: alpha(theme.palette.divider, 0.1),
              overflow: 'hidden',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                background: `linear-gradient(90deg, 
                  ${getHealthColor(healthScore)} 0%, 
                  ${alpha(getHealthColor(healthScore), 0.8)} 100%)`,
                boxShadow: `0 0 8px ${alpha(getHealthColor(healthScore), 0.3)}`,
              }
            }}
          />
        </Box>
        
        {/* Health Score */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
          <Typography 
            variant="caption" 
            sx={{ 
              color: theme.palette.text.secondary,
              fontWeight: 500,
              fontFamily: '"Inter", sans-serif',
            }}
          >
            Health Score
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography 
              variant="caption" 
              sx={{ 
                fontWeight: 700,
                color: getHealthColor(healthScore),
                fontFamily: '"Inter", sans-serif',
                fontSize: '0.85rem',
              }}
            >
              {healthScore.toFixed(0)}%
            </Typography>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: getHealthColor(healthScore),
                boxShadow: `0 0 8px ${alpha(getHealthColor(healthScore), 0.5)}`,
              }}
            />
          </Box>
        </Box>
      </Box>
    </TableCell>
  </TableRow>
    </Tooltip>

  {/* Team Members Popover */}
  <TeamMembersPopover
    anchorEl={teamAnchorEl}
    open={Boolean(teamAnchorEl)}
    onClose={() => setTeamAnchorEl(null)}
    teamMembers={teamMembers}
    theme={theme}
    projectId={project._id}
  />

  {/* Tags Popover */}
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
    PaperProps={{
      sx: {
        borderRadius: 3,
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.background.paper, 0.95)} 0%, 
          ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
        border: `1.5px solid ${alpha(theme.palette.secondary.main, 0.15)}`,
        boxShadow: `0 8px 32px ${alpha(theme.palette.mode === 'dark' ? '#000' : theme.palette.secondary.main, 0.15)}`,
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, 
            ${theme.palette.secondary.main}, 
            ${alpha(theme.palette.secondary.main, 0.7)})`,
          borderRadius: '12px 12px 0 0',
        }
      }
    }}
  >
    <Box sx={{ p: 3, minWidth: 240 }}>
      <Typography 
        variant="subtitle1" 
        gutterBottom 
        sx={{ 
          fontWeight: 700,
          color: theme.palette.text.primary,
          fontFamily: '"Inter", sans-serif',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Tag fontSize="small" />
        Project Tags
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
        {project.tags?.map((tag, index) => (
          <Chip
            key={index}
            label={tag}
            size="small"
            sx={{
              m: 0,
              background: `linear-gradient(135deg, 
                ${alpha(theme.palette.secondary.main, 0.15)} 0%, 
                ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
              border: `1.5px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
              color: theme.palette.text.primary,
              fontWeight: 500,
              '&:hover': {
                background: `linear-gradient(135deg, 
                  ${alpha(theme.palette.secondary.main, 0.25)} 0%, 
                  ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s ease',
            }}
          />
        ))}
        {(!project.tags || project.tags.length === 0) && (
          <Typography 
            variant="body2" 
            sx={{ 
              color: theme.palette.text.secondary,
              fontStyle: 'italic',
              p: 2,
              textAlign: 'center',
              width: '100%',
            }}
          >
            No tags added to this project
          </Typography>
        )}
      </Box>
    </Box>
  </Popover>

  {/* Timeline Popover */}
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
    PaperProps={{
      sx: {
        borderRadius: 3,
        background: `linear-gradient(135deg, 
          ${alpha(theme.palette.background.paper, 0.95)} 0%, 
          ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
        border: `1.5px solid ${alpha(theme.palette.info.main, 0.15)}`,
        boxShadow: `0 8px 32px ${alpha(theme.palette.mode === 'dark' ? '#000' : theme.palette.info.main, 0.15)}`,
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, 
            ${theme.palette.info.main}, 
            ${alpha(theme.palette.info.main, 0.7)})`,
          borderRadius: '12px 12px 0 0',
        }
      }
    }}
  >
    <Box sx={{ p: 3, minWidth: 240 }}>
      <Typography 
        variant="subtitle1" 
        gutterBottom 
        sx={{ 
          fontWeight: 700,
          color: theme.palette.text.primary,
          fontFamily: '"Inter", sans-serif',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <CalendarToday fontSize="small" />
        Project Timeline
      </Typography>
      
      <Box sx={{ mt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <PlayCircleOutline fontSize="small" sx={{ color: theme.palette.success.main }} />
          <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
            Start Date
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, ml: 'auto' }}>
            {formatDate(project.startDate)}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Flag fontSize="small" sx={{ color: theme.palette.error.main }} />
          <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
            End Date
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, ml: 'auto' }}>
            {formatDate(project.endDate)}
          </Typography>
        </Box>
        
        <Box
          sx={{
            mt: 3,
            pt: 2,
            borderTop: `1.5px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 600,
              color: theme.palette.primary.main,
              fontFamily: '"Inter", sans-serif',
            }}
          >
            {daysRemaining()}
          </Typography>
        </Box>
      </Box>
    </Box>
  </Popover> 
</>
  );
};

const Projects = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [user, setUser] = useState(getUserData() || null);

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
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

  const { ref, inView } = useInView({ threshold: 0, triggerOnce: true });

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
  
  const fetchUserData = async () => {
    try {
      const token = getAuthToken();
      if (!token) return null;
      const user = await axiosClient.get('/user/me', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setUser(user.data?.user);
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  useEffect(() => {
    fetchUserData()
  }, [checkAuth]);
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

  // Stats calculation
  const activeProjects = projects.filter(p => p.status === 'ongoing' || p.status === 'active').length;
  const atRiskProjects = projects.filter(p => {
    const healthScore = p.metrics?.healthScore || p.metrics?.health?.healthScore || 100;
    return healthScore < 40;
  }).length;
  const totalProgress = projects.reduce((acc, p) => acc + (p.progress || 0), 0) / (projects.length || 1);

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      p: { xs: 3, sm: 4, md: 5 },
      backgroundColor: theme.palette.background.default,
      background: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 1)} 0%, ${alpha(theme.palette.primary.light, 0.03)} 100%)`,
    }}>
      {/* Header Section */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 4,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 3
        }}>
          <Box>
            <Typography variant="h3" fontWeight="700" gutterBottom sx={{ 
              color: theme.palette.text.primary,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}>
              Projects Dashboard
            </Typography>
            <Typography variant="h6" sx={{ 
              color: theme.palette.text.secondary,
              fontWeight: 400,
              maxWidth: 600
            }}>
              Manage, track, and collaborate on all your team projects in one place
            </Typography>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            gap: 2,
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <Button
              variant="outlined"
              onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
              startIcon={viewMode === 'table' ? <ViewModule /> : <ViewList />}
              sx={{
                borderRadius: 2,
                px: 3,
                borderColor: alpha(theme.palette.primary.main, 0.3),
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: alpha(theme.palette.primary.main, 0.04),
                }
              }}
            > 
              {viewMode === 'table' ? 'Grid View' : 'Table View'}
            </Button>
            
            <Button
              variant="contained"
              onClick={() => setCreateModalOpen(true)}
              startIcon={<Add />}
              disabled={!hasTeams || authError}
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.2,
                fontWeight: 600,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                '&:hover': {
                  boxShadow: `0 6px 25px ${alpha(theme.palette.primary.main, 0.4)}`,
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              New Project
            </Button>
          </Box>
        </Box>

        {/* Stats Cards */}
{!authError && projects.length > 0 && (
  <Box sx={{ 
    mb: 5,
    display: 'grid',
    gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
    gap: 2.5,
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: -10,
      left: -10,
      right: -10,
      bottom: -10,
      background: `linear-gradient(135deg, 
        ${alpha(theme.palette.primary.main, 0.03)} 0%, 
        ${alpha(theme.palette.secondary.main, 0.02)} 50%, 
        ${alpha(theme.palette.background.paper, 0.01)} 100%)`,
      borderRadius: 3,
      zIndex: 0,
    }
  }}>
    {[
      { 
        label: 'Total Projects', 
        value: projects.length, 
        icon: <Group fontSize="small" />,
        color: theme.palette.primary.main,
        gradient: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)}, ${alpha(theme.palette.primary.main, 0.05)})`,
        hoverGradient: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.primary.main, 0.1)})`,
        subtitle: 'All active projects',
        progress: 100
      },
      { 
        label: 'Active Projects', 
        value: activeProjects, 
        icon: <PlayCircle fontSize="small" />,
        color: theme.palette.success.main,
        gradient: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.12)}, ${alpha(theme.palette.success.main, 0.04)})`,
        hoverGradient: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.18)}, ${alpha(theme.palette.success.main, 0.08)})`,
        subtitle: 'Currently in progress',
        progress: projects.length > 0 ? (activeProjects / projects.length) * 100 : 0
      },
      { 
        label: 'At Risk', 
        value: atRiskProjects, 
        icon: <Assessment fontSize="small" />,
        color: theme.palette.warning.main,
        gradient: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.12)}, ${alpha(theme.palette.warning.main, 0.04)})`,
        hoverGradient: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.18)}, ${alpha(theme.palette.warning.main, 0.08)})`,
        subtitle: atRiskProjects > 0 ? 'Needs attention' : 'All good',
        progress: projects.length > 0 ? (atRiskProjects / projects.length) * 100 : 0
      },
      { 
        label: 'Avg Progress', 
        value: `${Math.round(totalProgress)}%`, 
        icon: <TrendingUp fontSize="small" />,
        color: theme.palette.info.main,
        gradient: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.12)}, ${alpha(theme.palette.info.main, 0.04)})`,
        hoverGradient: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.18)}, ${alpha(theme.palette.info.main, 0.08)})`,
        subtitle: 'Overall completion',
        progress: totalProgress
      }
    ].map((stat, index) => (
      <Paper
        key={stat.label}
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 3,
          background: stat.gradient,
          border: `1.5px solid ${alpha(stat.color, 0.15)}`,
          position: 'relative',
          overflow: 'hidden',
          cursor: 'default',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            background: stat.hoverGradient,
            border: `1.5px solid ${alpha(stat.color, 0.25)}`,
            boxShadow: `0 8px 24px ${alpha(stat.color, 0.15)}`,
            '& .stat-icon-wrapper': {
              transform: 'scale(1.1) rotate(5deg)',
            },
            '& .stat-value': {
              textShadow: `0 0 20px ${alpha(stat.color, 0.3)}`,
            }
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, ${stat.color}, ${alpha(stat.color, 0.7)})`,
            borderRadius: '3px 3px 0 0',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: -20,
            right: -20,
            width: 60,
            height: 60,
            background: `radial-gradient(circle, ${alpha(stat.color, 0.08)} 0%, transparent 70%)`,
            borderRadius: '50%',
          }
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          mb: 1.5,
          position: 'relative',
          zIndex: 1
        }}>
          <Box 
            className="stat-icon-wrapper"
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: alpha(stat.color, 0.1),
              border: `1px solid ${alpha(stat.color, 0.2)}`,
              transition: 'all 0.3s ease',
              boxShadow: `0 4px 12px ${alpha(stat.color, 0.1)}`,
            }}
          >
            <Box sx={{ 
              color: stat.color,
              fontSize: 22,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {stat.icon}
            </Box>
          </Box>
          
          <Typography 
            className="stat-value"
            variant="h3"
            sx={{
              fontFamily: '"Alkatra", cursive',
              fontWeight: 700,
              fontSize: { xs: '2rem', sm: '2.5rem' },
              color: stat.color,
              lineHeight: 1,
              transition: 'all 0.3s ease',
              background: `linear-gradient(45deg, ${stat.color}, ${alpha(stat.color, 0.8)})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: `0 0 10px ${alpha(stat.color, 0.2)}`,
            }}
          >
            {stat.value}
          </Typography>
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          position: 'relative',
          zIndex: 1
        }}>
          <Box sx={{
            flexShrink: 0,
            width: 6,
            height: 6,
            borderRadius: '50%',
            backgroundColor: stat.color,
            boxShadow: `0 0 8px ${alpha(stat.color, 0.5)}`,
          }} />
          
          <Typography 
            variant="h6"
            sx={{
              fontFamily: '"Adlam Display", serif',
              fontWeight: 500,
              color: theme.palette.mode === 'dark' ? alpha('#fff', 0.9) : alpha('#000', 0.8),
              letterSpacing: '0.5px',
              fontSize: { xs: '0.9rem', sm: '1rem' },
            }}
          >
            {stat.label}
          </Typography>
        </Box>
        
        <Typography 
          variant="caption"
          sx={{
            display: 'block',
            mt: 0.5,
            ml: 2,
            color: theme.palette.mode === 'dark' ? alpha('#fff', 0.6) : alpha('#000', 0.6),
            fontFamily: '"Inter", sans-serif',
            fontWeight: 300,
            fontSize: '0.75rem',
            letterSpacing: '0.3px',
          }}
        >
          {stat.subtitle}
        </Typography>
        
        {/* Progress indicator */}
        <Box sx={{
          mt: 2,
          height: 2,
          background: alpha(theme.palette.mode === 'dark' ? '#fff' : '#000', 0.1),
          borderRadius: 1,
          overflow: 'hidden',
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${Math.min(100, stat.progress)}%`,
            background: `linear-gradient(90deg, ${alpha(stat.color, 0.6)}, ${stat.color})`,
            borderRadius: 1,
            transition: 'width 0.8s ease',
          }
        }} />
      </Paper>
    ))}
  </Box>
)}

        {/* Search and Filter Bar */}
        {!authError && (
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              mb: 4,
              boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              gap: 3,
              alignItems: { md: 'center' }
            }}>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  placeholder="Search projects by name, description, team, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="medium"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ 
                          color: theme.palette.primary.main,
                          fontSize: 24 
                        }} />
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.8),
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.background.default, 0.9),
                      }
                    }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: theme.palette.primary.main,
                        borderWidth: 2,
                      }
                    }
                  }}
                />
              </Box>
              
              <Box sx={{ 
                display: 'flex', 
                gap: 2,
                alignItems: 'center',
                flexWrap: 'wrap'
              }}>
                {selectedProjects.size > 0 && (
                  <Chip
                    label={`${selectedProjects.size} selected`}
                    color="primary"
                    onDelete={() => setSelectedProjects(new Set())}
                    deleteIcon={<Close />}
                    sx={{
                      fontWeight: 600,
                      px: 1,
                      py: 2,
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      '& .MuiChip-deleteIcon': {
                        color: theme.palette.primary.main,
                        '&:hover': {
                          color: theme.palette.primary.dark,
                        }
                      }
                    }}
                  />
                )}
                
                <FormControl size="medium" sx={{ minWidth: 160 }}>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    displayEmpty
                    IconComponent={ArrowDropDown}
                    sx={{
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.background.default, 0.8),
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: alpha(theme.palette.divider, 0.3),
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: theme.palette.primary.main,
                      }
                    }}
                  >
                    <MenuItem value="updatedAt">Last Updated</MenuItem>
                    <MenuItem value="progress">Progress</MenuItem>
                    <MenuItem value="name">Name (A-Z)</MenuItem>
                    <MenuItem value="health">Health Score</MenuItem>
                  </Select>
                </FormControl>
                
                <Tooltip title="More Filters">
                  <IconButton 
                    size="large"
                    sx={{
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.2),
                      }
                    }}
                  >
                    <FilterList />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Paper>
        )}
      </Box>

      {/* Error Handling */}
      {error && !authError ? (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Alert 
            severity="error"
            sx={{ 
              mb: 4, 
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
              backgroundColor: alpha(theme.palette.error.main, 0.05)
            }}
            onClose={() => setError('')}
          >
            <Typography fontWeight="600">
              {error}
            </Typography>
          </Alert>
        </motion.div>
      ) : loading ? (
        <Box>
          {[...Array(3)].map((_, index) => (
            <Skeleton 
              key={index} 
              variant="rectangular" 
              height={70} 
              sx={{ 
                borderRadius: 2, 
                mb: 2,
                backgroundColor: alpha(theme.palette.primary.main, 0.1)
              }} 
            />
          ))}
        </Box>
      ) : filteredProjects.length === 0 || authError ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card
            sx={{
              p: { xs: 4, sm: 8 },
              textAlign: 'center',
              borderRadius: 3,
              backgroundColor: theme.palette.background.paper,
              border: `2px dashed ${alpha(theme.palette.divider, 0.3)}`,
              boxShadow: 'none',
              maxWidth: 600,
              mx: 'auto',
            }}
          >
            {authError ? (
              <Box>
                <Box sx={{ 
                  fontSize: 80,
                  color: theme.palette.error.main,
                  mb: 3,
                  opacity: 0.8
                }}>
                  🔒
                </Box>
                <Typography variant="h5" fontWeight="700" gutterBottom sx={{ 
                  color: theme.palette.error.main,
                  mb: 2
                }}>
                  Authentication Required
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: theme.palette.text.secondary, 
                  mb: 5,
                  lineHeight: 1.6
                }}>
                  Please log in to access your projects dashboard.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate('/')}
                  size="large"
                  sx={{
                    borderRadius: 2,
                    px: 5,
                    py: 1.5,
                    fontWeight: 600,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  }}
                >
                  Go to Login
                </Button>
              </Box>
            ) : (
              <Box>
                <Box sx={{ 
                  fontSize: 80,
                  color: alpha(theme.palette.text.disabled, 0.5),
                  mb: 3
                }}>
                  📁
                </Box>
                <Typography variant="h4" fontWeight="700" gutterBottom sx={{ 
                  color: theme.palette.text.primary,
                  mb: 2
                }}>
                  No Projects Found
                </Typography>
                <Typography variant="body1" sx={{ 
                  color: theme.palette.text.secondary, 
                  mb: 5,
                  maxWidth: 400, 
                  mx: 'auto',
                  lineHeight: 1.6
                }}>
                  {hasTeams 
                    ? 'Start your journey by creating your first project. Organize tasks, collaborate with teams, and track progress effortlessly.'
                    : 'Create a team first to start managing collaborative projects effectively.'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {!hasTeams ? (
                    <Button
                      variant="outlined"
                      onClick={navigateToTeams}
                      startIcon={<Group />}
                      size="large"
                      sx={{
                        borderRadius: 2,
                        px: 4,
                        py: 1.5,
                        borderWidth: 2,
                        '&:hover': {
                          borderWidth: 2,
                        }
                      }}
                    >
                      Go to Teams
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={() => setCreateModalOpen(true)}
                      startIcon={<Add />}
                      size="large"
                      sx={{
                        borderRadius: 2,
                        px: 5,
                        py: 1.5,
                        fontWeight: 600,
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                      }}
                    >
                      Create First Project
                    </Button>
                  )}
                </Box>
              </Box>
            )}
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Table Container */}
          <Card
            sx={{
              borderRadius: 3,
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              overflow: 'hidden',
              boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.08)}`,
              position: 'relative'
            }}
          >
            {/* Table Header */}
            <Box sx={{
              p: 3,
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              backgroundColor: alpha(theme.palette.primary.main, 0.02),
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 2
            }}>
              <Typography variant="h6" fontWeight="600" sx={{ color: theme.palette.text.primary }}>
                Projects ({filteredProjects.length})
              </Typography>
              
              {selectedProjects.size > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" sx={{ 
                    color: theme.palette.primary.main,
                    fontWeight: 500
                  }}>
                    {selectedProjects.size} project(s) selected
                  </Typography>
                  <Button
                    startIcon={<Delete />}
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={handleDeleteSelected}
                    sx={{
                      borderRadius: 2,
                      px: 3,
                      borderColor: alpha(theme.palette.error.main, 0.3),
                      '&:hover': {
                        borderColor: theme.palette.error.main,
                        backgroundColor: alpha(theme.palette.error.main, 0.04),
                      }
                    }}
                  >
                    Delete Selected
                  </Button>
                </Box>
              )}
            </Box>

            <TableContainer sx={{ maxHeight: 'calc(100vh - 400px)' }}>
              <Table sx={{ minWidth: 900 }}>
                <TableHead>
                  <TableRow sx={{ 
                    backgroundColor: alpha(theme.palette.primary.main, 0.03),
                    '& th': {
                      borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                      py: 2.5,
                    }
                  }}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={allSelected}
                        indeterminate={selectedProjects.size > 0 && !allSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        sx={{
                          '&.Mui-checked': {
                            color: theme.palette.primary.main,
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="700" sx={{ 
                        color: theme.palette.text.primary,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5
                      }}>
                        Project Name
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="700" sx={{ 
                        color: theme.palette.text.primary,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5
                      }}>
                        Actions
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="700" sx={{ 
                        color: theme.palette.text.primary,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5
                      }}>
                        Team
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="700" sx={{ 
                        color: theme.palette.text.primary,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5
                      }}>
                        Status
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="700" sx={{ 
                        color: theme.palette.text.primary,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5
                      }}>
                        Tags
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="700" sx={{ 
                        color: theme.palette.text.primary,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5
                      }}>
                        Progress & Health
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
                      userId = {user?._id}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Table Footer */}
            {filteredProjects.length > 5 && (
              <Box sx={{
                p: 2.5,
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                backgroundColor: alpha(theme.palette.background.default, 0.5),
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 2
              }}>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  Showing {Math.min(filteredProjects.length, 10)} of {filteredProjects.length} projects
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Button size="small" variant="outlined" disabled>
                    Previous
                  </Button>
                  <Button size="small" variant="outlined">
                    Next
                  </Button>
                </Box>
              </Box>
            )}
          </Card>
        </motion.div>
      )}

      {/* Modals */}
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