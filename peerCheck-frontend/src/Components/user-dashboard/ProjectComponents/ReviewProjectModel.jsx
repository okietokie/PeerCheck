import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Select,
  MenuItem,
  TextField,
  Divider,
  Alert,
  Button,
  CircularProgress,
  Paper,
  Grid,
  Rating,
  Chip,
  Avatar,
  Stack,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Close,
  Grade,
  Person,
  Group,
  Schedule,
  Description,
  CheckCircle,
  TaskAlt,
  Send,
  Star,
  StarBorder,
  RateReview,
  Comment,
  Score
} from '@mui/icons-material';
import { getAuthToken } from '@/utils/auth';
import { getUserData } from '@/utils/user';
import axiosClient from '@/api/axiosClient';
import MemberEvaluationSummary from './MemberEvaluationSummary';

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
  const [user, setUser] = useState(null);
  const [totalScore, setTotalScore] = useState(0);

  useEffect(() => {
    updateUser();
    if (open && project) {
      calculateTotalScore();
      setError('');
    }
  }, [open, project, reviewData]);

  useEffect(() => {
    calculateTotalScore();
  }, [reviewData]);

  const updateUser = async () => {
    const u = await getUserData();
    if (u) {
      setUser(u);
    }
  };

  const calculateTotalScore = () => {
    const scores = Object.values(reviewData)
      .filter(item => typeof item === 'object' && item.score !== undefined)
      .map(item => item.score || 0);
    
    const total = scores.reduce((sum, score) => sum + score, 0);
    const average = scores.length > 0 ? total / scores.length : 0;
    setTotalScore(Math.round(average * 100) / 100);
  };

  const handleScoreChange = (category, score) => {
    setReviewData(prev => ({
      ...prev,
      [category]: { ...prev[category], score }
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

      if (!user) {
        await updateUser();
      }

      const grading = [
        reviewData.technicalExecution,
        reviewData.taskValidity,
        reviewData.timeAuthenticity,
        reviewData.teamwork,
        reviewData.documentationQuality
      ];
      
      const total = grading.reduce((sum, grade) => sum + (grade.score || 0), 0);
      const averageScore = total / grading.length;
      const contributionScore = Math.round(averageScore * 100) / 100;

      const reviewPayload = {
        projectId: project._id,
        evaluatorRole: user?.role || 'peer',
        grading: {
          technicalExecution: reviewData.technicalExecution,
          taskValidity: reviewData.taskValidity,
          timeAuthenticity: reviewData.timeAuthenticity,
          teamwork: reviewData.teamwork,
          documentationQuality: reviewData.documentationQuality
        },
        memberEvaluations: [user._id, contributionScore],
        overallScore: totalScore
      };

      const response = await axiosClient.post(
        `/projects/${project._id}/evaluations`,
        reviewPayload,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const data = response.data;

      if (data.success) {
        onClose();
        if (project.onReviewSubmitted) {
          project.onReviewSubmitted();
        }
      } else {
        throw new Error(data.error || 'Failed to submit review');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.response?.data?.error || err.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const evaluationCategories = [
    {
      key: 'technicalExecution',
      label: 'Technical Execution',
      desc: 'Measures how well the project was executed technically',
      icon: <Grade sx={{ color: theme.palette.primary.main }} />
    },
    {
      key: 'taskValidity',
      label: 'Task Validity',
      desc: 'Checks if tasks actually match the project objectives',
      icon: <TaskAlt sx={{ color: theme.palette.success.main }} />
    },
    {
      key: 'timeAuthenticity',
      label: 'Time Authenticity',
      desc: 'Measures whether the time spent on tasks is realistic',
      icon: <Schedule sx={{ color: theme.palette.warning.main }} />
    },
    {
      key: 'teamwork',
      label: 'Teamwork',
      desc: 'Evaluates collaboration and contribution to the team',
      icon: <Group sx={{ color: theme.palette.info.main }} />
    },
    {
      key: 'documentationQuality',
      label: 'Documentation Quality',
      desc: 'Measures clarity and completeness of documentation',
      icon: <Description sx={{ color: theme.palette.secondary.main }} />
    }
  ];

  const getScoreColor = (score) => {
    if (score >= 8) return theme.palette.success.main;
    if (score >= 6) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  return (
    <Dialog 
      open={open} 
      onClose={!loading ? onClose : undefined}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`
        }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.primary.light,
        background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <RateReview sx={{ color: theme.palette.primary.contrastText }} />
            <Typography variant="h5" sx={{ color: theme.palette.primary.contrastText, fontWeight: 600 }}>
              Project Evaluation
            </Typography>
          </Box>
          <IconButton 
            onClick={onClose} 
            disabled={loading}
            sx={{ color: theme.palette.primary.contrastText }}
          >
            <Close />
          </IconButton>
        </Box>
        <Typography variant="subtitle1" sx={{ color: theme.palette.primary.contrastText, mt: 1 }}>
          {project?.projectName || 'Unnamed Project'}
        </Typography>
        {project?.team && (
          <Box display="flex" alignItems="center" gap={1} mt={1}>
            <Person fontSize="small" sx={{ color: theme.palette.primary.contrastText }} />
            <Typography variant="caption" sx={{ color: theme.palette.primary.contrastText }}>
              Team: {project.team.length} members
            </Typography>
          </Box>
        )}
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Grid container spacing={3} >
          <Grid item xs={12} md={8} >
            <Paper elevation={0} sx={{ m:2,p: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
              <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Score sx={{ color: theme.palette.primary.main }} />
                Project Evaluation Criteria
                <Chip 
                  label={`Overall: ${totalScore}/10`}
                  sx={{ 
                    ml: 'auto',
                    backgroundColor: getScoreColor(totalScore),
                    color: theme.palette.getContrastText(getScoreColor(totalScore))
                  }}
                  size="small"
                />
              </Typography>
              
              {evaluationCategories.map((category, index) => (
                <Box key={category.key} sx={{ mb: 4 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    {category.icon}
                    <Box flex={1}>
                      <Typography fontWeight={600} color="text.primary">
                        {category.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {category.desc}
                      </Typography>
                    </Box>
                    <Select
                      value={reviewData[category.key]?.score || 0}
                      onChange={(e) => handleScoreChange(category.key, e.target.value)}
                      size="small"
                      sx={{ 
                        minWidth: 100,
                        '& .MuiSelect-select': {
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }
                      }}
                      renderValue={(value) => (
                        <Box display="flex" alignItems="center" gap={1}>
                          <Star sx={{ color: getScoreColor(value), fontSize: 16 }} />
                          <Typography variant="body2">{value}/10</Typography>
                        </Box>
                      )}
                    >
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <MenuItem key={num} value={num}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Star sx={{ 
                              color: num > 0 ? getScoreColor(num) : theme.palette.text.disabled,
                              fontSize: 16 
                            }} />
                            <Typography>{num} - {getScoreLabel(num)}</Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </Box>
                  
                  <Box sx={{ ml: 4 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={(reviewData[category.key]?.score || 0) * 10}
                      sx={{ 
                        height: 6,
                        borderRadius: 3,
                        mb: 2,
                        backgroundColor: theme.palette.action.hover,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: getScoreColor(reviewData[category.key]?.score || 0)
                        }
                      }}
                    />
                    
                    <TextField
                      fullWidth
                      label={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Comment fontSize="small" />
                          Comments
                        </Box>
                      }
                      multiline
                      rows={2}
                      value={reviewData[category.key]?.comment || ''}
                      onChange={(e) => handleCommentChange(category.key, e.target.value)}
                      size="small"
                      placeholder={`Add specific feedback about ${category.label.toLowerCase()}...`}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Stack spacing={3}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Group sx={{ color: theme.palette.info.main }} />
                  Project Summary
                </Typography>
                
                {project && (
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Project Status
                      </Typography>
                      <Chip
                        label={project.status || 'In Progress'}
                        size="small"
                        sx={{ ml: 1 }}
                        color={
                          project.status === 'Completed' ? 'success' :
                          project.status === 'In Review' ? 'warning' :
                          project.status === 'Active' ? 'primary' : 'default'
                        }
                      />
                    </Box>
                    
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Timeline
                      </Typography>
                      <Typography variant="body2">
                        {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'} - 
                        {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Ongoing'}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Team Members
                      </Typography>
                      <Stack direction="row" spacing={1} mt={1}>
                        {project.team?.slice(0, 3).map((member, idx) => (
                          <Tooltip key={idx} title={member.name || `Member ${idx + 1}`}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main }}>
                              {member.name?.charAt(0) || 'U'}
                            </Avatar>
                          </Tooltip>
                        ))}
                        {project.team?.length > 3 && (
                          <Chip 
                            label={`+${project.team.length - 3}`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Stack>
                    </Box>
                  </Stack>
                )}
              </Paper>
              
              <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person sx={{ color: theme.palette.secondary.main }} />
                  Member Evaluations
                </Typography>
                
                <MemberEvaluationSummary
                  projectId={project?._id}
                  theme={theme}
                />
                
                <Box sx={{ mt: 3, p: 2, bgcolor: theme.palette.action.hover, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    <CheckCircle fontSize="small" sx={{ mr: 1, verticalAlign: 'middle', fontSize: 16 }} />
                    Your evaluation will be submitted under: {user?.name || 'Anonymous Reviewer'}
                  </Typography>
                </Box>
              </Paper>
              
              <Paper elevation={0} sx={{ 
                p: 3, 
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.primary.light}15 0%, ${theme.palette.primary.main}10 100%)`,
                border: `1px solid ${theme.palette.primary.light}30`
              }}>
                <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Star sx={{ color: theme.palette.warning.main }} />
                  Scoring Guide
                </Typography>
                
                <Stack spacing={1}>
                  <Typography variant="caption" color="text.secondary">
                    8-10: Excellent - Exceeds expectations
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    6-7: Good - Meets expectations
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    4-5: Fair - Needs improvement
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    0-3: Poor - Significant issues
                  </Typography>
                </Stack>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
        
        {error && (
          <Alert 
            severity="error" 
            sx={{ mt: 3, borderRadius: 2 }}
            action={
              <Button color="inherit" size="small" onClick={() => setError('')}>
                Dismiss
              </Button>
            }
          >
            {error}
          </Alert>
        )}
      </DialogContent>
      
      <DialogActions sx={{ 
        p: 3, 
        borderTop: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.default
      }}>
        <Button
          onClick={onClose}
          disabled={loading}
          variant="outlined"
          startIcon={<Close />}
          sx={{ borderRadius: 2 }}
        >
          Cancel Review
        </Button>
        
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
            Final Score: 
            <Typography component="span" variant="h6" sx={{ ml: 1, color: getScoreColor(totalScore) }}>
              {totalScore}/10
            </Typography>
          </Typography>
        </Box>
        
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || totalScore === 0}
          startIcon={loading ? <CircularProgress size={20} /> : <Send />}
          sx={{
            borderRadius: 2,
            px: 4,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.dark} 100%)`
            }
          }}
        >
          {loading ? 'Submitting...' : 'Submit Evaluation'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Helper function for score labels
const getScoreLabel = (score) => {
  if (score >= 9) return 'Outstanding';
  if (score >= 7) return 'Excellent';
  if (score >= 5) return 'Good';
  if (score >= 3) return 'Fair';
  if (score >= 1) return 'Poor';
  return 'Not Rated';
};


export default ReviewProjectModal;