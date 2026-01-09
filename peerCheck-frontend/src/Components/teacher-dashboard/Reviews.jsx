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
  AvatarGroup,
  Rating,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  RadioGroup,
  Radio,
  Pagination
} from '@mui/material';
import {
  Search,
  Close,
  Grade,
  People,
  Assignment,
  CheckCircle,
  Warning,
  ThumbUp,
  ThumbDown,
  TrendingUp,
  TrendingDown,
  Balance,
  Gavel,
  Verified,
  GppMaybe,
  CompareArrows,
  Edit,
  Delete,
  Refresh,
  FilterList,
  Download,
  Visibility,
  Comment,
  RateReview,
  Star,
  StarBorder,
  StarHalf,
  ThumbsUpDown,
  Speed,
  Assessment,
  Timeline,
  BarChart,
  PieChart,
  ShowChart,
  DataUsage,
  Analytics,
  Autorenew,
  Check,
  Clear,
  WarningAmber,
  Error,
  Info,
  ExpandMore,
  ArrowForward,
  ArrowBack,
  FirstPage,
  LastPage,
  NavigateBefore,
  NavigateNext,
  PlaylistAddCheck,
  HowToReg,
  Rule,
  FactCheck,
  BalanceOutlined,
  Equalizer,
  TimelineOutlined
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axiosClient from '@/api/axiosClient';
import { useNavigate } from 'react-router-dom';
import TourGuide from '../TourGuide';

// Helper functions
const getAuthToken = () => localStorage.getItem("token");

// Review Quality Score Component
const ReviewQualityIndicator = ({ score }) => {
  const theme = useTheme();
  
  const getQualityColor = (score) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getQualityLabel = (score) => {
    if (score >= 80) return 'High Quality';
    if (score >= 60) return 'Moderate';
    return 'Low Quality';
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ 
        width: 8, 
        height: 8, 
        borderRadius: '50%',
        backgroundColor: getQualityColor(score),
        boxShadow: `0 0 8px ${alpha(getQualityColor(score), 0.5)}`
      }} />
      <Typography variant="body2" fontWeight="500" color={getQualityColor(score)}>
        {getQualityLabel(score)}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        ({score}%)
      </Typography>
    </Box>
  );
};

// Peer Review Analysis Component
const PeerReviewAnalysis = ({ peerReviews }) => {
  const theme = useTheme();
  
  const calculateStatistics = () => {
    if (!peerReviews || peerReviews.length === 0) return null;
    
    const scores = peerReviews.map(r => r.score || 0);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);
    const stdDev = Math.sqrt(
      scores.reduce((sq, n) => sq + Math.pow(n - avgScore, 2), 0) / scores.length
    );
    
    // Detect outliers (more than 2 standard deviations from mean)
    const outliers = scores.filter(score => Math.abs(score - avgScore) > 2 * stdDev);
    
    return { avgScore, minScore, maxScore, stdDev, outliers };
  };

  const stats = calculateStatistics();

  if (!stats) return null;

  return (
    <Box sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 2 }}>
      <Typography variant="subtitle2" fontWeight="600" gutterBottom>
        Peer Review Analysis
      </Typography>
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">Average Score</Typography>
          <Typography variant="body2" fontWeight="600">{stats.avgScore.toFixed(1)}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">Range</Typography>
          <Typography variant="body2" fontWeight="600">{stats.minScore} - {stats.maxScore}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">Std Dev</Typography>
          <Typography variant="body2" fontWeight="600">{stats.stdDev.toFixed(1)}</Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">Outliers</Typography>
          <Typography variant="body2" fontWeight="600" color={stats.outliers.length > 0 ? 'warning.main' : 'success.main'}>
            {stats.outliers.length}
          </Typography>
        </Grid>
      </Grid>
      {stats.outliers.length > 0 && (
        <Alert severity="warning" size="small" sx={{ mt: 1 }}>
          {stats.outliers.length} outlier score{stats.outliers.length > 1 ? 's' : ''} detected
        </Alert>
      )}
    </Box>
  );
};

// Override Score Modal
const OverrideScoreModal = ({ open, onClose, evaluation, theme, onOverride }) => {
  const [overrideData, setOverrideData] = useState({
    originalScore: 0,
    newScore: 0,
    reason: '',
    adjustmentType: 'increase', // 'increase' or 'decrease'
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
        adjustmentType: evaluation.finalScore < (evaluation.peerScore || 0) ? 'increase' : 'decrease',
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

    if (overrideData.newScore === overrideData.originalScore) {
      setError('New score must be different from original score');
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

      const overridePayload = {
        evaluationId: evaluation._id,
        originalScore: overrideData.originalScore,
        newScore: overrideData.newScore,
        reason: overrideData.reason,
        adjustmentType: overrideData.adjustmentType,
        notes: overrideData.notes,
        notifyStudent: overrideData.notifyStudent
      };

      const response = await axiosClient.post('/teacher/reviews/override', overridePayload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.success) {
        if (onOverride) {
          onOverride(response.data.updatedEvaluation);
        }
        onClose();
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
    <Dialog open={open} onClose={!loading ? onClose : undefined} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <Gavel sx={{ color: theme.palette.warning.main }} />
            <Typography variant="h6">Override Evaluation Score</Typography>
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
              <Box sx={{ p: 2, bgcolor: alpha(theme.palette.warning.main, 0.05), borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">Project</Typography>
                <Typography variant="body1" fontWeight="600">{evaluation.projectName}</Typography>
                <Typography variant="body2" color="text.secondary">Team: {evaluation.teamName}</Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Original Score</Typography>
                    <Typography variant="h5" color="text.primary">
                      {overrideData.originalScore}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Peer Average</Typography>
                    <Typography variant="h5" color={theme.palette.info.main}>
                      {evaluation.peerScore || 'N/A'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="New Score"
                type="number"
                value={overrideData.newScore}
                onChange={(e) => setOverrideData(prev => ({ 
                  ...prev, 
                  newScore: parseInt(e.target.value) || 0 
                }))}
                inputProps={{ min: 0, max: 100 }}
                helperText={`Adjustment: ${overrideData.newScore - overrideData.originalScore} points`}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Reason for Override</InputLabel>
                <Select
                  value={overrideData.reason}
                  onChange={(e) => setOverrideData(prev => ({ ...prev, reason: e.target.value }))}
                  label="Reason for Override"
                >
                  <MenuItem value="peer_review_bias">Peer Review Bias</MenuItem>
                  <MenuItem value="incomplete_peer_reviews">Incomplete Peer Reviews</MenuItem>
                  <MenuItem value="exceptional_circumstances">Exceptional Circumstances</MenuItem>
                  <MenuItem value="grading_error">Grading Error</MenuItem>
                  <MenuItem value="academic_integrity">Academic Integrity Concern</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Additional Notes"
                multiline
                rows={3}
                value={overrideData.notes}
                onChange={(e) => setOverrideData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Provide detailed explanation for the override..."
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={overrideData.notifyStudent}
                    onChange={(e) => setOverrideData(prev => ({ 
                      ...prev, 
                      notifyStudent: e.target.checked 
                    }))}
                  />
                }
                label="Notify student about score change"
              />
            </Grid>
            
            {error && (
              <Grid item xs={12}>
                <Alert severity="error">
                  {error}
                </Alert>
              </Grid>
            )}
          </Grid>
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
          startIcon={loading ? <CircularProgress size={20} /> : <Gavel />}
        >
          {loading ? 'Processing...' : 'Override Score'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Review Validation Component
const ReviewValidationCard = ({ review, onValidate }) => {
  const theme = useTheme();
  const [validationStatus, setValidationStatus] = useState(review.validationStatus || 'pending');
  
  const handleValidation = (status) => {
    setValidationStatus(status);
    if (onValidate) {
      onValidate(review._id, status);
    }
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="subtitle1" fontWeight="600">
              Review by {review.reviewerName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              For {review.revieweeName}
            </Typography>
          </Box>
          <Chip
            label={validationStatus.toUpperCase()}
            size="small"
            color={
              validationStatus === 'approved' ? 'success' :
              validationStatus === 'rejected' ? 'error' : 'default'
            }
          />
        </Box>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Score Given: {review.score}/10
          </Typography>
          <Rating value={review.score / 2} readOnly precision={0.5} size="small" />
        </Box>
        
        <Typography variant="body2" sx={{ mb: 2 }}>
          {review.comments}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Button
            size="small"
            variant={validationStatus === 'approved' ? 'contained' : 'outlined'}
            color="success"
            startIcon={<Check />}
            onClick={() => handleValidation('approved')}
          >
            Approve
          </Button>
          <Button
            size="small"
            variant={validationStatus === 'rejected' ? 'contained' : 'outlined'}
            color="error"
            startIcon={<Clear />}
            onClick={() => handleValidation('rejected')}
          >
            Reject
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Comment />}
          >
            Comment
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

// Main Teacher Reviews Component
export default function TeacherReviews() {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // State
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [selectedReviews, setSelectedReviews] = useState(new Set());
  const [sortBy, setSortBy] = useState('date');
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Fetch reviews and evaluations
  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = getAuthToken();
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axiosClient.get('/teacher/reviews', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data?.success) {
        setReviews(response.data.reviews);
        setFilteredReviews(response.data.reviews);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Filter and sort reviews
  useEffect(() => {
    let data = [...reviews];
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      data = data.filter(review =>
        review.projectName?.toLowerCase().includes(query) ||
        review.teamName?.toLowerCase().includes(query) ||
        review.studentName?.toLowerCase().includes(query)
      );
    }
    
    // Filter by status
    if (filterStatus !== 'all') {
      data = data.filter(review => review.status === filterStatus);
    }
    
    // Filter by tab
    if (tabValue === 1) { // Pending Validation
      data = data.filter(r => r.needsValidation);
    } else if (tabValue === 2) { // Needs Override
      data = data.filter(r => r.discrepancyScore > 10); // More than 10 points discrepancy
    } else if (tabValue === 3) { // Completed
      data = data.filter(r => r.status === 'completed');
    }
    
    // Sort
    data.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
        case 'score':
          return (b.finalScore || 0) - (a.finalScore || 0);
        case 'discrepancy':
          return (b.discrepancyScore || 0) - (a.discrepancyScore || 0);
        case 'project':
          return a.projectName?.localeCompare(b.projectName);
        default:
          return 0;
      }
    });
    
    setFilteredReviews(data);
  }, [reviews, searchQuery, tabValue, sortBy, filterStatus]);

  const handleOverrideScore = (evaluation) => {
    setSelectedEvaluation(evaluation);
    setOverrideModalOpen(true);
  };

  const handleOverrideComplete = (updatedEvaluation) => {
    showSnackbar('Score overridden successfully', 'success');
    fetchReviews(); // Refresh data
  };

  const handleValidateReview = async (reviewId, status) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await axiosClient.put(`/teacher/reviews/${reviewId}/validate`, {
        status
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data?.success) {
        showSnackbar(`Review ${status} successfully`, 'success');
        fetchReviews();
      }
    } catch (err) {
      console.error('Error validating review:', err);
      showSnackbar('Failed to validate review', 'error');
    }
  };

  const handleBulkAction = (action) => {
    if (selectedReviews.size === 0) {
      showSnackbar('Please select reviews first', 'warning');
      return;
    }

    if (action === 'validate') {
      // Bulk validate selected reviews
      showSnackbar(`${selectedReviews.size} reviews validated`, 'success');
      setSelectedReviews(new Set());
    } else if (action === 'export') {
      // Export selected reviews
      showSnackbar('Exporting reviews...', 'info');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  // Calculate statistics
  const stats = {
    totalReviews: reviews.length,
    pendingValidation: reviews.filter(r => r.needsValidation).length,
    highDiscrepancy: reviews.filter(r => r.discrepancyScore > 10).length,
    averageDiscrepancy: reviews.reduce((sum, r) => sum + (r.discrepancyScore || 0), 0) / (reviews.length || 1),
    averagePeerScore: reviews.reduce((sum, r) => sum + (r.peerScore || 0), 0) / (reviews.length || 1),
    averageTeacherScore: reviews.reduce((sum, r) => sum + (r.finalScore || 0), 0) / (reviews.length || 1)
  };

  const StatCard = ({ title, value, icon, color, subtitle, trend }) => (
    <Paper
      sx={{
        p: 3,
        borderRadius: 3,
        background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
        border: `1px solid ${alpha(color, 0.2)}`,
        height: '100%',
        position: 'relative',
        overflow: 'hidden'
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
      {trend && (
        <Box sx={{
          position: 'absolute',
          top: 12,
          right: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5
        }}>
          {trend > 0 ? <TrendingUp color="success" /> : <TrendingDown color="error" />}
          <Typography variant="caption" color={trend > 0 ? 'success.main' : 'error.main'}>
            {Math.abs(trend)}%
          </Typography>
        </Box>
      )}
    </Paper>
  );

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
            <>
              <Typography variant="caption" color="text.secondary">
                (Peer: {review.peerScore})
              </Typography>
              <Chip
                label={`${Math.abs(review.discrepancyScore || 0)} pts diff`}
                size="small"
                color={Math.abs(review.discrepancyScore || 0) > 10 ? 'warning' : 'default'}
                variant="outlined"
              />
            </>
          )}
        </Box>
      </TableCell>
      
      <TableCell>
        <ReviewQualityIndicator score={review.qualityScore || 0} />
      </TableCell>
      
      <TableCell>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {review.peerReviews && review.peerReviews.length > 0 && (
            <Tooltip title={`${review.peerReviews.length} peer reviews`}>
              <Chip
                icon={<People fontSize="small" />}
                label={review.peerReviews.length}
                size="small"
                variant="outlined"
              />
            </Tooltip>
          )}
          {review.needsValidation && (
            <Chip
              label="Needs Validation"
              size="small"
              color="warning"
              icon={<Warning fontSize="small" />}
            />
          )}
          {review.status === 'completed' && (
            <Chip
              label="Completed"
              size="small"
              color="success"
              icon={<CheckCircle fontSize="small" />}
            />
          )}
        </Box>
      </TableCell>
      
      <TableCell>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="View Details">
            <IconButton size="small" onClick={() => navigate(`/teacher-app/reviews/${review._id}`)}>
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
          <Tooltip title="Validate">
            <IconButton size="small" color="info">
              <Verified fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </TableCell>
    </TableRow>
  );

  return (
    <Box sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
      <Box sx={{ mb: 6 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" fontWeight="700" gutterBottom>
              Reviews & Evaluations
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Monitor, validate, and ensure fair grading across all projects
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchReviews}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={() => handleBulkAction('export')}
            >
              Export Reports
            </Button>
          </Box>
        </Box>

        {/* Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Reviews"
              value={stats.totalReviews}
              icon={<RateReview sx={{ fontSize: 28, color: theme.palette.primary.main }} />}
              color={theme.palette.primary.main}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Pending Validation"
              value={stats.pendingValidation}
              icon={<Warning sx={{ fontSize: 28, color: theme.palette.warning.main }} />}
              color={theme.palette.warning.main}
              subtitle="Need attention"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="High Discrepancy"
              value={stats.highDiscrepancy}
              icon={<Balance sx={{ fontSize: 28, color: theme.palette.error.main }} />}
              color={theme.palette.error.main}
              subtitle="> 10 points diff"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Avg Discrepancy"
              value={`${stats.averageDiscrepancy.toFixed(1)}pts`}
              icon={<CompareArrows sx={{ fontSize: 28, color: theme.palette.info.main }} />}
              color={theme.palette.info.main}
            />
          </Grid>
        </Grid>

        {/* Score Comparison Chart */}
        <Paper sx={{ p: 3, borderRadius: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>Score Distribution</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.05), borderRadius: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Peer vs Teacher Scores</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Peer Average</Typography>
                    <Typography variant="h4" color="info.main">
                      {stats.averagePeerScore.toFixed(1)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">Teacher Average</Typography>
                    <Typography variant="h4" color="primary.main">
                      {stats.averageTeacherScore.toFixed(1)}
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(stats.averageTeacherScore / stats.averagePeerScore) * 100}
                  sx={{ mt: 2, height: 8, borderRadius: 4 }}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2, bgcolor: alpha(theme.palette.warning.main, 0.05), borderRadius: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Discrepancy Analysis</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {stats.highDiscrepancy} out of {stats.totalReviews} reviews have significant discrepancies
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={(stats.highDiscrepancy / stats.totalReviews) * 100}
                      color="warning"
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  <Typography variant="caption" color="warning.main">
                    {((stats.highDiscrepancy / stats.totalReviews) * 100).toFixed(1)}%
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Search and Filter */}
        <Paper sx={{ p: 3, borderRadius: 3, mb: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, alignItems: 'center' }}>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                placeholder="Search reviews by student, project, or team..."
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
                  <MenuItem value="project">Project</MenuItem>
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

        {/* Bulk Actions */}
        {selectedReviews.size > 0 && (
          <Paper sx={{ p: 2, mb: 3, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">
                {selectedReviews.size} review{selectedReviews.size > 1 ? 's' : ''} selected
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Check />}
                  onClick={() => handleBulkAction('validate')}
                >
                  Validate Selected
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Clear />}
                  color="error"
                  onClick={() => setSelectedReviews(new Set())}
                >
                  Clear Selection
                </Button>
              </Box>
            </Box>
          </Paper>
        )}

        {/* Tabs */}
        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label="All Reviews" />
              <Tab 
                label={
                  <Badge badgeContent={stats.pendingValidation} color="error">
                    Pending Validation
                  </Badge>
                } 
              />
              <Tab label="Needs Override" />
              <Tab label="Completed" />
            </Tabs>
          </Box>

          {/* Content */}
          <Box sx={{ p: 3 }}>
            {loading ? (
              <Box>
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} variant="rectangular" height={80} sx={{ borderRadius: 2, mb: 2 }} />
                ))}
              </Box>
            ) : error ? (
              <Alert severity="error">
                {error}
              </Alert>
            ) : filteredReviews.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <RateReview sx={{ fontSize: 60, color: 'text.disabled', mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No reviews found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                  {tabValue === 1 
                    ? 'No reviews need validation at the moment'
                    : tabValue === 2
                    ? 'No reviews require score override'
                    : 'Reviews will appear here once projects are submitted'}
                </Typography>
              </Box>
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Showing {Math.min(filteredReviews.length, (page + 1) * rowsPerPage)} of {filteredReviews.length} reviews
                  </Typography>
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

        {/* Peer Review Validation Section */}
        {tabValue === 1 && filteredReviews.some(r => r.peerReviews?.length > 0) && (
          <Paper sx={{ mt: 4, p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              Peer Review Validation
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Validate individual peer reviews for quality and fairness
            </Typography>
            
            <Grid container spacing={3}>
              {filteredReviews
                .filter(r => r.peerReviews?.length > 0)
                .slice(0, 3)
                .map((review) => (
                  <Grid item xs={12} key={review._id}>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                          <Typography variant="subtitle1">{review.projectName}</Typography>
                          <Chip 
                            label={`${review.peerReviews.length} peer reviews`}
                            size="small"
                            color="info"
                          />
                          <Box sx={{ ml: 'auto' }}>
                            <PeerReviewAnalysis peerReviews={review.peerReviews} />
                          </Box>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                          {review.peerReviews.map((peerReview, index) => (
                            <ReviewValidationCard
                              key={index}
                              review={peerReview}
                              onValidate={handleValidateReview}
                            />
                          ))}
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  </Grid>
                ))}
            </Grid>
          </Paper>
        )}
      </Box>

      {/* Modals */}
      <OverrideScoreModal
        open={overrideModalOpen}
        onClose={() => setOverrideModalOpen(false)}
        evaluation={selectedEvaluation}
        theme={theme}
        onOverride={handleOverrideComplete}
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

      <TourGuide page="teacher-reviews" />
    </Box>
  );
}