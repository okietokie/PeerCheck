// TeacherFeedbackReviews.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
  LinearProgress,
  Alert,
  CircularProgress,
  Tooltip,
  Badge,
  useTheme,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Pagination,
  Rating,
  alpha
} from '@mui/material';
import {
  Search,
  FilterList,
  Sort,
  Insights,
  RateReview,
  People,
  Grade,
  Assignment,
  Schedule,
  TrendingUp,
  TrendingDown,
  Comment,
  Visibility,
  Refresh,
  Download,
  Share,
  CheckCircle,
  Warning,
  Check,
  Clear,
  Gavel,
  Verified,
  Close,
  ExpandMore,
  Info,
  ThumbUp,
  ThumbDown
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axiosClient from '@/api/axiosClient';

const TeacherFeedbackReviews = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // State management
  const [activeView, setActiveView] = useState('projects'); // 'projects' or 'reviews'
  const [projects, setProjects] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [reviewTab, setReviewTab] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('date');
  const [filterStatus, setFilterStatus] = useState('all');

  // API base URL

  // Fetch teacher's projects
  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosClient.get(`/teacher/get-projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data?.success) {
        const projectsWithStats = await Promise.all(
          response.data.projects.map(async (project) => {
            // Fetch additional project stats
            try {
              const statsRes = await axiosClient.get(`/projects/${project._id}/metrics`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              return { ...project, ...statsRes.data };
            } catch (error) {
              return project;
            }
          })
        );
        
        setProjects(projectsWithStats);
        setFilteredProjects(projectsWithStats);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      showSnackbar('Failed to load projects', 'error');
    }
  };

  // Fetch evaluations and reviews
  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch teacher evaluations
      const evalResponse = await axiosClient.get(`/teacher/analytics`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { includeEvaluations: true }
      });
      
      if (evalResponse.data?.success) {
        // Transform evaluation data for display
        const reviewsData = transformEvaluations(evalResponse.data.evaluations || []);
        setReviews(reviewsData);
        setFilteredReviews(reviewsData);
      }
      
      // Fetch peer reviews for validation
      const peerReviewsRes = await axiosClient.get(`/teacher/reviews/pending-validation`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (peerReviewsRes.data?.success) {
        // Merge peer reviews with evaluations
        setReviews(prev => {
          const updated = [...prev];
          peerReviewsRes.data.reviews.forEach(peerReview => {
            const existingIndex = updated.findIndex(r => r.projectId === peerReview.projectId);
            if (existingIndex > -1) {
              updated[existingIndex].peerReviews = [
                ...(updated[existingIndex].peerReviews || []),
                peerReview
              ];
              updated[existingIndex].needsValidation = true;
            }
          });
          return updated;
        });
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      showSnackbar('Failed to load reviews', 'error');
    }
  };

  // Transform evaluation data for display
  const transformEvaluations = (evaluations) => {
    return evaluations.map(ev => ({
      _id: ev._id,
      projectId: ev.projectId,
      projectName: ev.project?.projectName || 'Unknown Project',
      teamName: ev.project?.teamId?.name || 'Unknown Team',
      studentName: ev.evaluator?.name || 'Unknown Student',
      finalScore: ev.finalScore || 0,
      peerScore: calculatePeerAverage(ev),
      discrepancyScore: Math.abs((ev.finalScore || 0) - (calculatePeerAverage(ev) || 0)),
      grading: ev.grading,
      memberEvaluations: ev.memberEvaluations || [],
      qualityScore: calculateQualityScore(ev),
      status: ev.status || 'pending',
      needsValidation: ev.needsValidation || false,
      peerReviews: ev.peerReviews || [],
      createdAt: ev.createdAt,
      updatedAt: ev.updatedAt
    }));
  };

  // Calculate peer average score
  const calculatePeerAverage = (evaluation) => {
    if (!evaluation.peerReviews || evaluation.peerReviews.length === 0) return null;
    const total = evaluation.peerReviews.reduce((sum, review) => sum + (review.score || 0), 0);
    return total / evaluation.peerReviews.length;
  };

  // Calculate quality score based on evaluation completeness
  const calculateQualityScore = (evaluation) => {
    let score = 0;
    if (evaluation.grading) score += 40;
    if (evaluation.memberEvaluations?.length > 0) score += 30;
    if (evaluation.teacherFeedback) score += 30;
    return score;
  };

  // Load all data
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([fetchProjects(), fetchReviews()]);
    } catch (error) {
      console.error('Error fetching data:', error);
      showSnackbar('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Filter projects based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProjects(projects);
      return;
    }

    const filtered = projects.filter(project =>
      project.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.teamId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProjects(filtered);
  }, [searchTerm, projects]);

  // Filter reviews based on search query and filters
  useEffect(() => {
    let data = [...reviews];
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      data = data.filter(review =>
        review.projectName?.toLowerCase().includes(query) ||
        review.teamName?.toLowerCase().includes(query) ||
        review.studentName?.toLowerCase().includes(query)
      );
    }
    
    if (filterStatus !== 'all') {
      data = data.filter(review => review.status === filterStatus);
    }
    
    // Apply tab filters
    if (reviewTab === 1) {
      data = data.filter(r => r.needsValidation);
    } else if (reviewTab === 2) {
      data = data.filter(r => r.discrepancyScore > 10);
    } else if (reviewTab === 3) {
      data = data.filter(r => r.status === 'completed');
    }
    
    // Apply sorting
    data.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
        case 'score':
          return (b.finalScore || 0) - (a.finalScore || 0);
        case 'discrepancy':
          return (b.discrepancyScore || 0) - (a.discrepancyScore || 0);
        case 'project':
          return (a.projectName || '').localeCompare(b.projectName || '');
        default:
          return 0;
      }
    });
    
    setFilteredReviews(data);
  }, [searchQuery, reviews, reviewTab, sortBy, filterStatus]);

  // Handlers
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleReviewTabChange = (event, newValue) => {
    setReviewTab(newValue);
  };

  const handleOpenReview = (project) => {
    setSelectedProject(project);
    setReviewModalOpen(true);
  };

  const handleOverrideScore = (evaluation) => {
    setSelectedEvaluation(evaluation);
    setOverrideModalOpen(true);
  };

  const handleSubmitEvaluation = async (evaluationData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosClient.post(
        `/teacher/evaluation/submit/${selectedProject._id}`,
        evaluationData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data?.success) {
        showSnackbar('Evaluation submitted successfully', 'success');
        setReviewModalOpen(false);
        fetchAllData();
      }
    } catch (error) {
      console.error('Error submitting evaluation:', error);
      showSnackbar('Failed to submit evaluation', 'error');
    }
  };

  const handleValidateReview = async (reviewId, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axiosClient.put(
        `/teacher/reviews/${reviewId}/validate`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data?.success) {
        showSnackbar(`Review ${status} successfully`, 'success');
        fetchAllData();
      }
    } catch (error) {
      console.error('Error validating review:', error);
      showSnackbar('Failed to validate review', 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  // Helper functions
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed': return theme.palette.success.main;
      case 'in review': return theme.palette.warning.main;
      case 'in progress': return theme.palette.info.main;
      case 'needs review': return theme.palette.error.main;
      default: return theme.palette.text.secondary;
    }
  };

  const calculateStats = () => {
    const pendingReview = projects.filter(p => 
      p.status === 'needs review' || p.status === 'in review'
    ).length;
    
    const pendingValidation = reviews.filter(r => r.needsValidation).length;
    const highDiscrepancy = reviews.filter(r => r.discrepancyScore > 10).length;
    
    const averagePeerScore = reviews.reduce((sum, r) => sum + (r.peerScore || 0), 0) / (reviews.length || 1);
    const averageTeacherScore = reviews.reduce((sum, r) => sum + (r.finalScore || 0), 0) / (reviews.length || 1);
    
    return {
      totalProjects: projects.length,
      pendingReview,
      totalReviews: reviews.length,
      pendingValidation,
      highDiscrepancy,
      averagePeerScore,
      averageTeacherScore,
      averageDiscrepancy: reviews.reduce((sum, r) => sum + (r.discrepancyScore || 0), 0) / (reviews.length || 1)
    };
  };

  const stats = calculateStats();

  // Project tabs configuration
  const projectTabs = [
    { label: 'Needs Review', count: projects.filter(p => p.status === 'needs review').length },
    { label: 'In Progress', count: projects.filter(p => p.status === 'in progress').length },
    { label: 'Reviewed', count: projects.filter(p => p.status === 'completed').length },
    { label: 'All Projects', count: projects.length }
  ];

  // Stat Card Component
  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Paper
      sx={{
        p: 3,
        borderRadius: 3,
        background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(theme.palette.background.paper, 0.1)} 100%)`,
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
          <Typography variant="h4" fontWeight="700" color={color}>
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

  // Review Quality Indicator
  const ReviewQualityIndicator = ({ score }) => {
    const getQualityColor = (score) => {
      if (score >= 80) return theme.palette.success.main;
      if (score >= 60) return theme.palette.warning.main;
      return theme.palette.error.main;
    };

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ 
          width: 8, 
          height: 8, 
          borderRadius: '50%',
          backgroundColor: getQualityColor(score)
        }} />
        <Typography variant="body2" color={getQualityColor(score)}>
          {score}%
        </Typography>
      </Box>
    );
  };

  // Peer Review Analysis Component
  const PeerReviewAnalysis = ({ peerReviews }) => {
    if (!peerReviews || peerReviews.length === 0) return null;
    
    const scores = peerReviews.map(r => r.score || 0);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);
    
    return (
      <Box sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 2 }}>
        <Typography variant="body2" fontWeight="600" gutterBottom>
          Peer Review Analysis
        </Typography>
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Average</Typography>
            <Typography variant="body2" fontWeight="600">{avgScore.toFixed(1)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Range</Typography>
            <Typography variant="body2" fontWeight="600">{minScore} - {maxScore}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Count</Typography>
            <Typography variant="body2" fontWeight="600">{peerReviews.length}</Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  // Override Score Modal
  const OverrideScoreModal = ({ open, onClose, evaluation }) => {
    const [overrideData, setOverrideData] = useState({
      originalScore: 0,
      newScore: 0,
      reason: '',
      notifyStudent: true,
      notes: ''
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
      if (open && evaluation) {
        setOverrideData({
          originalScore: evaluation.finalScore || 0,
          newScore: evaluation.finalScore || 0,
          reason: '',
          notifyStudent: true,
          notes: ''
        });
        setError('');
      }
    }, [open, evaluation]);

    const handleSubmit = async () => {
      if (!overrideData.reason.trim()) {
        setError('Please provide a reason for the override');
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await axiosClient.post(
          `/teacher/evaluation/override/${evaluation._id}`,
          overrideData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.data?.success) {
          showSnackbar('Score overridden successfully', 'success');
          onClose();
          fetchAllData();
        }
      } catch (err) {
        console.error('Error overriding score:', err);
        setError(err.response?.data?.error || 'Failed to override score');
      } finally {
        setLoading(false);
      }
    };

    if (!evaluation) return null;

    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Gavel sx={{ color: theme.palette.warning.main }} />
            <Typography variant="h6">Override Evaluation Score</Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Box sx={{ mb: 3, p: 2, bgcolor: alpha(theme.palette.warning.main, 0.05), borderRadius: 2 }}>
              <Typography variant="body2" color="text.secondary">Project</Typography>
              <Typography variant="body1" fontWeight="600">{evaluation.projectName}</Typography>
              <Typography variant="body2" color="text.secondary">Student: {evaluation.studentName}</Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">Original Score</Typography>
                <Typography variant="h5">{overrideData.originalScore}</Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" color="text.secondary">Peer Average</Typography>
                <Typography variant="h5" color={theme.palette.info.main}>
                  {evaluation.peerScore || 'N/A'}
                </Typography>
              </Box>
            </Box>
            
            <TextField
              fullWidth
              label="New Score"
              type="number"
              value={overrideData.newScore}
              onChange={(e) => setOverrideData(prev => ({ 
                ...prev, 
                newScore: parseInt(e.target.value) || 0 
              }))}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Reason for Override"
              value={overrideData.reason}
              onChange={(e) => setOverrideData(prev => ({ ...prev, reason: e.target.value }))}
              sx={{ mb: 2 }}
            />
            
            <TextField
              fullWidth
              label="Additional Notes"
              multiline
              rows={2}
              value={overrideData.notes}
              onChange={(e) => setOverrideData(prev => ({ ...prev, notes: e.target.value }))}
              sx={{ mb: 2 }}
            />
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Switch
                checked={overrideData.notifyStudent}
                onChange={(e) => setOverrideData(prev => ({ 
                  ...prev, 
                  notifyStudent: e.target.checked 
                }))}
              />
              <Typography variant="body2">Notify student about score change</Typography>
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
            color="warning"
            disabled={loading || !overrideData.reason}
          >
            {loading ? 'Processing...' : 'Override Score'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  // Review Row Component
  const ReviewRow = ({ review }) => (
    <TableRow hover>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
            {review.studentName?.charAt(0) || 'S'}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight="600">
              {review.studentName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {review.projectName}
            </Typography>
          </Box>
        </Box>
      </TableCell>
      
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" fontWeight="600">
            {review.finalScore || 'N/A'}
          </Typography>
          {review.peerScore && (
            <Typography variant="caption" color="text.secondary">
              (Peer: {review.peerScore})
            </Typography>
          )}
        </Box>
      </TableCell>
      
      <TableCell>
        <ReviewQualityIndicator score={review.qualityScore || 0} />
      </TableCell>
      
      <TableCell>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {review.needsValidation && (
            <Chip
              label="Needs Validation"
              size="small"
              color="warning"
            />
          )}
          {review.status === 'completed' && (
            <Chip
              label="Completed"
              size="small"
              color="success"
            />
          )}
        </Box>
      </TableCell>
      
      <TableCell>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="View Details">
            <IconButton size="small" onClick={() => navigate(`/teacher/reviews/${review._id}`)}>
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
          {review.discrepancyScore > 10 && (
            <Tooltip title="Override Score">
              <IconButton 
                size="small" 
                color="warning"
                onClick={() => handleOverrideScore(review)}
              >
                <Gavel fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </TableCell>
    </TableRow>
  );

  // Main render
  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="700" sx={{ mb: 1 }}>
          Feedback & Review Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Evaluate projects, validate peer reviews, and ensure fair grading
        </Typography>
      </Box>

      {/* View Toggle */}
      <Paper sx={{ p: 2, borderRadius: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant={activeView === 'projects' ? 'contained' : 'outlined'}
            onClick={() => setActiveView('projects')}
            startIcon={<Assignment />}
            sx={{ flex: 1 }}
          >
            Projects ({projects.length})
          </Button>
          <Button
            variant={activeView === 'reviews' ? 'contained' : 'outlined'}
            onClick={() => setActiveView('reviews')}
            startIcon={<RateReview />}
            sx={{ flex: 1 }}
          >
            Reviews ({reviews.length})
          </Button>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchAllData}
          >
            Refresh
          </Button>
        </Box>
      </Paper>

      {/* Stats Overview */}
      <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1, minWidth: 250 }}>
          <StatCard
            title="Projects Pending"
            value={stats.pendingReview}
            icon={<Assignment sx={{ fontSize: 28, color: theme.palette.warning.main }} />}
            color={theme.palette.warning.main}
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 250 }}>
          <StatCard
            title="Total Reviews"
            value={stats.totalReviews}
            icon={<RateReview sx={{ fontSize: 28, color: theme.palette.primary.main }} />}
            color={theme.palette.primary.main}
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 250 }}>
          <StatCard
            title="Pending Validation"
            value={stats.pendingValidation}
            icon={<Warning sx={{ fontSize: 28, color: theme.palette.error.main }} />}
            color={theme.palette.error.main}
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 250 }}>
          <StatCard
            title="High Discrepancy"
            value={stats.highDiscrepancy}
            icon={<Gavel sx={{ fontSize: 28, color: theme.palette.info.main }} />}
            color={theme.palette.info.main}
          />
        </Box>
      </Box>

      {/* PROJECTS VIEW */}
      {activeView === 'projects' && (
        <>
          {/* Search Bar */}
          <Paper sx={{ p: 2, borderRadius: 2, mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                fullWidth
                placeholder="Search projects, teams, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="outlined"
                startIcon={<FilterList />}
              >
                Filters
              </Button>
            </Box>
          </Paper>

          {/* Project Tabs */}
          <Paper sx={{ borderRadius: 2, mb: 3 }}>
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              {projectTabs.map((tab, index) => (
                <Tab
                  key={tab.label}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {tab.label}
                      <Badge badgeContent={tab.count} color="primary" max={99} />
                    </Box>
                  }
                />
              ))}
            </Tabs>

            {/* Project List */}
            <Box sx={{ p: 2 }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : filteredProjects.length === 0 ? (
                <Alert severity="info">
                  No projects found. Try adjusting your search.
                </Alert>
              ) : (
                filteredProjects.map((project) => (
                  <Paper
                    key={project._id}
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      mb: 2,
                      border: `1px solid ${theme.palette.divider}`,
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                          <Typography variant="h6" fontWeight="600">
                            {project.projectName}
                          </Typography>
                          <Chip
                            label={project.status}
                            size="small"
                            sx={{ backgroundColor: alpha(getStatusColor(project.status), 0.1), color: getStatusColor(project.status) }}
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Team: {project.teamId?.name || 'No team assigned'}
                        </Typography>

                        {/* Progress Bar */}
                        {project.progress !== undefined && (
                          <Box sx={{ mb: 2, width: '100%' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                Progress
                              </Typography>
                              <Typography variant="caption" fontWeight="500">
                                {project.progress}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={project.progress}
                              sx={{
                                height: 6,
                                borderRadius: 3,
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                '& .MuiLinearProgress-bar': {
                                  bgcolor: project.progress === 100 ? theme.palette.success.main : theme.palette.primary.main
                                }
                              }}
                            />
                          </Box>
                        )}
                      </Box>

                      {/* Action Buttons */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Button
                          variant="outlined"
                          startIcon={<Visibility />}
                          onClick={() => navigate(`/teacher/projects/${project._id}`)}
                          size="small"
                        >
                          View
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={<RateReview />}
                          onClick={() => handleOpenReview(project)}
                          size="small"
                        >
                          Review
                        </Button>
                      </Box>
                    </Box>
                  </Paper>
                ))
              )}
            </Box>
          </Paper>
        </>
      )}

      {/* REVIEWS VIEW */}
      {activeView === 'reviews' && (
        <>
          {/* Search and Filters */}
          <Paper sx={{ p: 3, borderRadius: 2, mb: 4 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                placeholder="Search reviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
                sx={{ flex: 1, minWidth: 250 }}
              />
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="validated">Validated</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort By"
                >
                  <MenuItem value="date">Date</MenuItem>
                  <MenuItem value="score">Score</MenuItem>
                  <MenuItem value="discrepancy">Discrepancy</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Paper>

          {/* Score Comparison */}
          <Paper sx={{ p: 3, borderRadius: 2, mb: 4 }}>
            <Typography variant="h6" gutterBottom>Score Comparison</Typography>
            <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Peer Average</Typography>
                <Typography variant="h4" color={theme.palette.info.main}>
                  {stats.averagePeerScore.toFixed(1)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Teacher Average</Typography>
                <Typography variant="h4" color={theme.palette.primary.main}>
                  {stats.averageTeacherScore.toFixed(1)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Average Discrepancy</Typography>
                <Typography variant="h4" color={theme.palette.warning.main}>
                  {stats.averageDiscrepancy.toFixed(1)}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Reviews Tabs */}
          <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Tabs value={reviewTab} onChange={handleReviewTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tab label="All Reviews" />
              <Tab label={
                <Badge badgeContent={stats.pendingValidation} color="error">
                  Pending Validation
                </Badge>
              } />
              <Tab label="Needs Override" />
              <Tab label="Completed" />
            </Tabs>

            {/* Reviews Table */}
            <Box sx={{ p: 3 }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : filteredReviews.length === 0 ? (
                <Alert severity="info">
                  No reviews found matching your criteria.
                </Alert>
              ) : (
                <>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Student / Project</TableCell>
                          <TableCell>Score</TableCell>
                          <TableCell>Quality</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredReviews
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((review) => (
                            <ReviewRow key={review._id} review={review} />
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  
                  {/* Pagination */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination
                      count={Math.ceil(filteredReviews.length / rowsPerPage)}
                      page={page + 1}
                      onChange={(e, value) => setPage(value - 1)}
                      color="primary"
                    />
                  </Box>
                </>
              )}
            </Box>
          </Paper>
        </>
      )}

      {/* Modals */}
      <OverrideScoreModal
        open={overrideModalOpen}
        onClose={() => setOverrideModalOpen(false)}
        evaluation={selectedEvaluation}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TeacherFeedbackReviews;