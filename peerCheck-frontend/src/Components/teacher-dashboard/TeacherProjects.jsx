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
  alpha,
  useTheme,
  CircularProgress,
  Tabs,
  Tab,
  Card,
  CardContent,
  Divider,
  Badge,
  Snackbar,
  Switch,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  AvatarGroup
} from '@mui/material';
import {
  Search,
  Add,
  Group,
  FilterList,
  Close,
  Assignment,
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
  ArrowForward,
  ErrorOutline,
  Download,
  Visibility,
  Comment,
  Timeline,
  BarChart,
  AssignmentTurnedIn,
  AssignmentLate,
  Timer,
  Task,
  DateRange,
  TimelineOutlined,
  Insights,
  MoreVert,
  FileUpload,
  FileDownload,
  CompareArrows,
  ThumbUp,
  ThumbDown,
  Star,
  StarBorder,
  Speed,
  Verified,
  GppMaybe,
  GroupWork,
  ListAlt,
  Dashboard as DashboardIcon,
  NoteAdd,
  EditNote
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axiosClient from '@/api/axiosClient';
import { useNavigate } from 'react-router-dom';
import TourGuide from '../TourGuide';

// Helper functions
const getAuthToken = () => localStorage.getItem("token");

// Teacher Project Creation Modal
const CreateTeacherProjectModal = ({ open, onClose, theme, onProjectCreated }) => {
  const [formData, setFormData] = useState({
    projectName: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    classId: '',
    teamSize: 3,
    maxTeams: 10,
    tags: [],
    gradingCriteria: {
      taskCompletionWeight: 40,
      peerReviewWeight: 30,
      teacherReviewWeight: 30,
      allowPeerReview: true,
      rubric: [
        { criterion: 'Technical Execution', maxScore: 20 },
        { criterion: 'Task Validity', maxScore: 20 },
        { criterion: 'Time Authenticity', maxScore: 20 },
        { criterion: 'Teamwork', maxScore: 20 },
        { criterion: 'Documentation Quality', maxScore: 20 }
      ]
    },
    submissionRequirements: {
      requiresDocumentation: true,
      requiresCode: false,
      requiresPresentation: false,
      requiresDemo: false,
      maxFileSize: 10, // MB
      allowedFormats: ['.pdf', '.docx', '.zip']
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [classes, setClasses] = useState([]);
  const [tagInput, setTagInput] = useState('');

  // Fetch teacher's classes
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const token = getAuthToken();
        if (!token) return;

        const response = await axiosClient.get('/teacher/classes', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data?.success) {
          setClasses(response.data.classes);
        }
      } catch (err) {
        console.error('Error fetching classes:', err);
      }
    };

    if (open) {
      fetchClasses();
      setError('');
    }
  }, [open]);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else if (field.includes('gradingCriteria.rubric')) {
      const [_, index, prop] = field.split('.');
      const newRubric = [...formData.gradingCriteria.rubric];
      newRubric[index] = { ...newRubric[index], [prop]: value };
      setFormData(prev => ({
        ...prev,
        gradingCriteria: { ...prev.gradingCriteria, rubric: newRubric }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleTagAdd = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
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
    
    if (!formData.classId) {
      setError('Please select a class');
      return false;
    }
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    
    if (end <= start) {
      setError('End date must be after start date');
      return false;
    }
    
    if (formData.teamSize < 1) {
      setError('Team size must be at least 1');
      return false;
    }
    
    if (formData.maxTeams < 1) {
      setError('Maximum teams must be at least 1');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const token = getAuthToken();
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      const projectData = {
        ...formData,
        createdBy: 'teacher', // Mark as teacher-created
        isTemplate: false
      };

      const response = await axiosClient.post('/teacher/projects', projectData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data?.success) {
        onProjectCreated(response.data.project);
        onClose();
      }
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err.response?.data?.error || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={!loading ? onClose : undefined} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <Assignment sx={{ color: theme.palette.primary.main }} />
            <Typography variant="h6">Create Project Assignment</Typography>
          </Box>
          <IconButton onClick={onClose} disabled={loading}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Project Name"
                value={formData.projectName}
                onChange={handleChange('projectName')}
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
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Assign to Class</InputLabel>
                <Select
                  value={formData.classId}
                  onChange={handleChange('classId')}
                  label="Assign to Class"
                >
                  {classes.map(cls => (
                    <MenuItem key={cls._id} value={cls._id}>
                      {cls.className} ({cls.courseCode})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Team Size"
                type="number"
                value={formData.teamSize}
                onChange={handleChange('teamSize')}
                inputProps={{ min: 1, max: 10 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Maximum Teams"
                type="number"
                value={formData.maxTeams}
                onChange={handleChange('maxTeams')}
                inputProps={{ min: 1 }}
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
                required
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
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Add Tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleTagAdd()}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleTagAdd} disabled={!tagInput.trim()}>
                        <Add />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
              {formData.tags.length > 0 && (
                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      onDelete={() => handleTagRemove(tag)}
                      size="small"
                    />
                  ))}
                </Box>
              )}
            </Grid>
          </Grid>
          
          {/* Grading Criteria Section */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>Grading Criteria</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Task Completion Weight"
                  type="number"
                  value={formData.gradingCriteria.taskCompletionWeight}
                  onChange={handleChange('gradingCriteria.taskCompletionWeight')}
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Peer Review Weight"
                  type="number"
                  value={formData.gradingCriteria.peerReviewWeight}
                  onChange={handleChange('gradingCriteria.peerReviewWeight')}
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Teacher Review Weight"
                  type="number"
                  value={formData.gradingCriteria.teacherReviewWeight}
                  onChange={handleChange('gradingCriteria.teacherReviewWeight')}
                  inputProps={{ min: 0, max: 100 }}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.gradingCriteria.allowPeerReview}
                      onChange={(e) => handleChange('gradingCriteria.allowPeerReview')({
                        target: { value: e.target.checked }
                      })}
                    />
                  }
                  label="Allow Peer Review"
                />
              </Grid>
            </Grid>
          </Box>
          
          {/* Rubric Section */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>Grading Rubric</Typography>
            {formData.gradingCriteria.rubric.map((item, index) => (
              <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth
                    label="Criterion"
                    value={item.criterion}
                    onChange={handleChange(`gradingCriteria.rubric.${index}.criterion`)}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Max Score"
                    type="number"
                    value={item.maxScore}
                    onChange={handleChange(`gradingCriteria.rubric.${index}.maxScore`)}
                    inputProps={{ min: 0, max: 100 }}
                  />
                </Grid>
              </Grid>
            ))}
          </Box>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <Add />}
        >
          {loading ? 'Creating...' : 'Create Project'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Project Submission Review Modal
const ReviewSubmissionModal = ({ open, onClose, submission, theme, onReviewSubmitted }) => {
  const [reviewData, setReviewData] = useState({
    technicalExecution: { score: 0, comment: '' },
    taskValidity: { score: 0, comment: '' },
    timeAuthenticity: { score: 0, comment: '' },
    teamwork: { score: 0, comment: '' },
    documentationQuality: { score: 0, comment: '' },
    overallComment: '',
    finalScore: 0,
    suspicionFlags: {
      paddedTasksDetected: false,
      unrealisticTimeLogs: false,
      copyPasteWork: false,
      comment: ''
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && submission) {
      // Initialize review data if submission already has review
      if (submission.review) {
        setReviewData(submission.review);
      } else {
        // Reset to default
        setReviewData({
          technicalExecution: { score: 0, comment: '' },
          taskValidity: { score: 0, comment: '' },
          timeAuthenticity: { score: 0, comment: '' },
          teamwork: { score: 0, comment: '' },
          documentationQuality: { score: 0, comment: '' },
          overallComment: '',
          finalScore: 0,
          suspicionFlags: {
            paddedTasksDetected: false,
            unrealisticTimeLogs: false,
            copyPasteWork: false,
            comment: ''
          }
        });
      }
      setError('');
    }
  }, [open, submission]);

  const calculateFinalScore = () => {
    const scores = [
      reviewData.technicalExecution.score,
      reviewData.taskValidity.score,
      reviewData.timeAuthenticity.score,
      reviewData.teamwork.score,
      reviewData.documentationQuality.score
    ];
    const total = scores.reduce((sum, score) => sum + score, 0);
    return total;
  };

  const handleScoreChange = (category, score) => {
    setReviewData(prev => ({
      ...prev,
      [category]: { ...prev[category], score: parseInt(score) }
    }));
  };

  const handleCommentChange = (category, comment) => {
    setReviewData(prev => ({
      ...prev,
      [category]: { ...prev[category], comment }
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

      const finalScore = calculateFinalScore();
      const reviewPayload = {
        ...reviewData,
        finalScore,
        evaluatorRole: 'teacher',
        evaluatedTeam: submission.teamId,
        project: submission.projectId
      };

      const response = await axiosClient.post('/teacher/project-evaluations', reviewPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.success) {
        if (onReviewSubmitted) {
          onReviewSubmitted(response.data.evaluation);
        }
        onClose();
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  if (!submission) return null;

  return (
    <Dialog open={open} onClose={!loading ? onClose : undefined} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <Grade sx={{ color: theme.palette.warning.main }} />
            <Box>
              <Typography variant="h6">Review Project Submission</Typography>
              <Typography variant="body2" color="text.secondary">
                {submission.projectName} • Team: {submission.teamName}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} disabled={loading}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ maxHeight: '70vh', overflow: 'auto', pt: 2 }}>
          <Grid container spacing={3}>
            {/* Team Information */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Team Information</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Team Name</Typography>
                      <Typography variant="body1">{submission.teamName}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Submitted On</Typography>
                      <Typography variant="body1">
                        {new Date(submission.submittedAt || new Date()).toLocaleDateString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">Team Members</Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        {submission.teamMembers?.map((member, index) => (
                          <Chip
                            key={index}
                            avatar={<Avatar>{member.name?.charAt(0)}</Avatar>}
                            label={member.name}
                            size="small"
                          />
                        ))}
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Submission Details */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Submission Details</Typography>
                  {submission.attachments && submission.attachments.length > 0 ? (
                    <List>
                      {submission.attachments.map((file, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <Description />
                          </ListItemIcon>
                          <ListItemText 
                            primary={file.name}
                            secondary={`${(file.size / 1024).toFixed(2)} KB`}
                          />
                          <ListItemSecondaryAction>
                            <IconButton edge="end">
                              <Download />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No files submitted
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Grading Rubric */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Grading Rubric</Typography>
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
                        <Box display="flex" alignItems="center" gap={2}>
                          <Select
                            value={reviewData[category.key]?.score || 0}
                            onChange={(e) => handleScoreChange(category.key, e.target.value)}
                            size="small"
                            sx={{ minWidth: 80 }}
                          >
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                              <MenuItem key={num} value={num}>{num}</MenuItem>
                            ))}
                          </Select>
                          <Typography>/ 10</Typography>
                        </Box>
                      </Box>
                      <TextField
                        fullWidth
                        label="Comments"
                        multiline
                        rows={2}
                        value={reviewData[category.key]?.comment || ''}
                        onChange={(e) => handleCommentChange(category.key, e.target.value)}
                        size="small"
                      />
                    </Box>
                  ))}
                  
                  {/* Final Score */}
                  <Box sx={{ mt: 4, p: 3, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6">Final Score</Typography>
                      <Typography variant="h4" color="primary">
                        {calculateFinalScore()}/50
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Suspicion Flags */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="error">
                    <Warning sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Suspicion Flags
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={reviewData.suspicionFlags.paddedTasksDetected}
                            onChange={(e) => setReviewData(prev => ({
                              ...prev,
                              suspicionFlags: {
                                ...prev.suspicionFlags,
                                paddedTasksDetected: e.target.checked
                              }
                            }))}
                            color="error"
                          />
                        }
                        label="Padded Tasks Detected"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={reviewData.suspicionFlags.unrealisticTimeLogs}
                            onChange={(e) => setReviewData(prev => ({
                              ...prev,
                              suspicionFlags: {
                                ...prev.suspicionFlags,
                                unrealisticTimeLogs: e.target.checked
                              }
                            }))}
                            color="error"
                          />
                        }
                        label="Unrealistic Time Logs"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={reviewData.suspicionFlags.copyPasteWork}
                            onChange={(e) => setReviewData(prev => ({
                              ...prev,
                              suspicionFlags: {
                                ...prev.suspicionFlags,
                                copyPasteWork: e.target.checked
                              }
                            }))}
                            color="error"
                          />
                        }
                        label="Copy/Paste Work Detected"
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Flag Comments"
                        multiline
                        rows={2}
                        value={reviewData.suspicionFlags.comment || ''}
                        onChange={(e) => setReviewData(prev => ({
                          ...prev,
                          suspicionFlags: {
                            ...prev.suspicionFlags,
                            comment: e.target.value
                          }
                        }))}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Overall Comments */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Overall Comments</Typography>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={reviewData.overallComment || ''}
                    onChange={(e) => setReviewData(prev => ({
                      ...prev,
                      overallComment: e.target.value
                    }))}
                    placeholder="Provide overall feedback for the team..."
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <Save />}
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Main Teacher Projects Component
export default function TeacherProjects() {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // State
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [selectedProjects, setSelectedProjects] = useState(new Set());
  const [sortBy, setSortBy] = useState('deadline');
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Fetch teacher's projects
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = getAuthToken();
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axiosClient.get('/teacher/projects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data?.success) {
        setProjects(response.data.projects);
        setFilteredProjects(response.data.projects);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Filter and sort projects
  useEffect(() => {
    let data = [...projects];
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      data = data.filter(project =>
        project.projectName?.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query) ||
        project.className?.toLowerCase().includes(query)
      );
    }
    
    // Filter by tab
    if (tabValue === 1) { // Active
      data = data.filter(p => p.status === 'ongoing' || p.status === 'active');
    } else if (tabValue === 2) { // Completed
      data = data.filter(p => p.status === 'completed');
    } else if (tabValue === 3) { // Needs Review
      data = data.filter(p => p.pendingReviews > 0);
    }
    
    // Sort
    data.sort((a, b) => {
      switch (sortBy) {
        case 'deadline':
          return new Date(a.endDate) - new Date(b.endDate);
        case 'name':
          return a.projectName?.localeCompare(b.projectName);
        case 'progress':
          return (b.progress || 0) - (a.progress || 0);
        case 'reviews':
          return (b.pendingReviews || 0) - (a.pendingReviews || 0);
        default:
          return 0;
      }
    });
    
    setFilteredProjects(data);
  }, [projects, searchQuery, tabValue, sortBy]);

  const handleCreateProject = (newProject) => {
    setProjects(prev => [newProject, ...prev]);
    showSnackbar('Project created successfully', 'success');
    fetchProjects(); // Refresh data
  };

  const handleReviewSubmission = (submission) => {
    setSelectedSubmission(submission);
    setReviewModalOpen(true);
  };

  const handleReviewSubmitted = (review) => {
    showSnackbar('Review submitted successfully', 'success');
    fetchProjects(); // Refresh data
  };

  const handleExportGrades = (projectId) => {
    // Export grades functionality
    showSnackbar('Grades exported successfully', 'info');
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  // Calculate statistics
  const stats = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'ongoing' || p.status === 'active').length,
    completedProjects: projects.filter(p => p.status === 'completed').length,
    pendingReviews: projects.reduce((sum, p) => sum + (p.pendingReviews || 0), 0),
    averageScore: projects.reduce((sum, p) => sum + (p.averageScore || 0), 0) / (projects.length || 1)
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Paper
      sx={{
        p: 3,
        borderRadius: 3,
        background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
        border: `1px solid ${alpha(color, 0.2)}`,
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
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );

  const ProjectCard = ({ project }) => (
    <Card sx={{ height: '100%', borderRadius: 3, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" fontWeight="600" gutterBottom>
              {project.projectName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {project.className}
            </Typography>
          </Box>
          <Chip
            label={project.status?.replace('_', ' ').toUpperCase()}
            size="small"
            color={
              project.status === 'completed' ? 'success' :
              project.status === 'ongoing' ? 'primary' : 'default'
            }
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {project.description?.substring(0, 120)}...
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" color="text.secondary">Progress</Typography>
            <Typography variant="caption" fontWeight="600">{project.progress || 0}%</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={project.progress || 0}
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box>
              <Typography variant="caption" color="text.secondary">Deadline</Typography>
              <Typography variant="body2" fontWeight="500">
                {new Date(project.endDate).toLocaleDateString()}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box>
              <Typography variant="caption" color="text.secondary">Teams</Typography>
              <Typography variant="body2" fontWeight="500">
                {project.teams || 0} teams
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box>
              <Typography variant="caption" color="text.secondary">Submissions</Typography>
              <Typography variant="body2" fontWeight="500">
                {project.submissions || 0}/{project.totalTeams || 0}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box>
              <Typography variant="caption" color="text.secondary">Reviews</Typography>
              <Typography variant="body2" fontWeight="500" color={project.pendingReviews > 0 ? 'warning.main' : 'success.main'}>
                {project.pendingReviews || 0} pending
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3, display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => navigate(`/teacher-app/projects/${project._id}`)}
            fullWidth
          >
            View Details
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={() => handleExportGrades(project._id)}
            startIcon={<Download />}
          >
            Export
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
      <Box sx={{ mb: 6 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight="700" gutterBottom>
              Projects & Assessments
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create, manage, and review student project submissions
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateModalOpen(true)}
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.2,
              fontWeight: 600
            }}
          >
            Create Project
          </Button>
        </Box>

        {/* Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Projects"
              value={stats.totalProjects}
              icon={<Assignment sx={{ fontSize: 28, color: theme.palette.primary.main }} />}
              color={theme.palette.primary.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Projects"
              value={stats.activeProjects}
              icon={<PlayCircle sx={{ fontSize: 28, color: theme.palette.success.main }} />}
              color={theme.palette.success.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Pending Reviews"
              value={stats.pendingReviews}
              icon={<Grade sx={{ fontSize: 28, color: theme.palette.warning.main }} />}
              color={theme.palette.warning.main}
              subtitle="Need attention"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Avg Score"
              value={`${Math.round(stats.averageScore)}%`}
              icon={<TrendingUp sx={{ fontSize: 28, color: theme.palette.info.main }} />}
              color={theme.palette.info.main}
            />
          </Grid>
        </Grid>

        {/* Search and Filter */}
        <Paper sx={{ p: 3, borderRadius: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, alignItems: 'center' }}>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  )
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort By"
                >
                  <MenuItem value="deadline">Deadline</MenuItem>
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="progress">Progress</MenuItem>
                  <MenuItem value="reviews">Reviews</MenuItem>
                </Select>
              </FormControl>
              <Tooltip title="Filters">
                <IconButton>
                  <FilterList />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Paper>

        {/* Tabs */}
        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label="All Projects" />
              <Tab label="Active" />
              <Tab label="Completed" />
              <Tab 
                label={
                  <Badge badgeContent={stats.pendingReviews} color="error">
                    Needs Review
                  </Badge>
                } 
              />
            </Tabs>
          </Box>

          {/* Content */}
          <Box sx={{ p: 3 }}>
            {loading ? (
              <Box>
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} variant="rectangular" height={150} sx={{ borderRadius: 2, mb: 2 }} />
                ))}
              </Box>
            ) : error ? (
              <Alert severity="error">
                {error}
              </Alert>
            ) : filteredProjects.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Assignment sx={{ fontSize: 60, color: 'text.disabled', mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No projects found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                  {tabValue === 3 
                    ? 'No projects need review at the moment'
                    : 'Create your first project assignment'}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setCreateModalOpen(true)}
                >
                  Create Project
                </Button>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {filteredProjects.map((project) => (
                  <Grid item xs={12} md={6} lg={4} key={project._id}>
                    <ProjectCard project={project} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </Paper>
      </Box>

      {/* Modals */}
      <CreateTeacherProjectModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        theme={theme}
        onProjectCreated={handleCreateProject}
      />

      <ReviewSubmissionModal
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        submission={selectedSubmission}
        theme={theme}
        onReviewSubmitted={handleReviewSubmitted}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <TourGuide page="teacher-projects" />
    </Box>
  );
}