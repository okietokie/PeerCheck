import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Rating,
  Box,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  Chip,
  Grid,
  InputAdornment,
  FormControl,
  InputLabel,
  OutlinedInput,
  FormHelperText,
  Divider
} from '@mui/material';
import {
  Close,
  Star,
  Lock,
  Email,
  Visibility,
  VisibilityOff,
  CheckCircle,
  Error as ErrorIcon
} from '@mui/icons-material';
import axiosClient from '@/api/axiosClient';

const ReviewDialog = ({ open, onClose, onReviewSubmitted, theme }) => {
  const [activeTab, setActiveTab] = useState('guest'); // 'guest' or 'loggedIn'
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rating: 5,
    title: '',
    content: '',
    category: 'general',
    tags: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (error) setError('');
  };

  const handleRatingChange = (event, newValue) => {
    setFormData(prev => ({ ...prev, rating: newValue }));
  };

  const handleTagInputChange = (e) => {
    const value = e.target.value;
    setTagInput(value);
    
    if (value.endsWith(',')) {
      const tag = value.slice(0, -1).trim();
      if (tag && !formData.tags.includes(tag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tag]
        }));
        setTagInput('');
      }
    }
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }));
      }
      setTagInput('');
    }
    
    if (e.key === 'Backspace' && !tagInput && formData.tags.length > 0) {
      e.preventDefault();
      setFormData(prev => ({
        ...prev,
        tags: prev.tags.slice(0, -1)
      }));
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (!formData.rating || !formData.title.trim() || !formData.content.trim()) {
      setError('Rating, title, and review content are required');
      setLoading(false);
      return;
    }

    if (activeTab === 'guest') {
      if (!formData.email || !formData.password) {
        setError('Email and password are required for guest review');
        setLoading(false);
        return;
      }
    }

    try {
      let response;
      
      if (activeTab === 'guest') {
        // Submit as guest (with verification)
        response = await axiosClient.post('/reviews/guest', formData);
      } else {
        // Submit as logged-in user (get token from localStorage)
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to submit a review');
          setLoading(false);
          return;
        }
        
        response = await axiosClient.post('/reviews', {
          rating: formData.rating,
          title: formData.title,
          content: formData.content,
          category: formData.category,
          tags: formData.tags
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      if (response.data.success) {
        setSuccess(response.data.message);
        
        // Reset form
        setFormData({
          email: '',
          password: '',
          rating: 5,
          title: '',
          content: '',
          category: 'general',
          tags: []
        });
        
        // Callback to refresh reviews
        if (onReviewSubmitted) {
          onReviewSubmitted();
        }
        
        // Auto-close after success for guest reviews
        if (activeTab === 'guest') {
          setTimeout(() => {
            onClose();
          }, 2000);
        }
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      const errorMsg = err.response?.data?.error || 
                      err.response?.data?.message || 
                      err.message || 
                      'Failed to submit review';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
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
          overflow: 'hidden',
        }
      }}
    >
      <DialogTitle sx={{ 
        p: 3, 
        pb: 2,
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="600">
            Share Your Experience
          </Typography>
          <IconButton 
            onClick={onClose} 
            disabled={loading}
            size="small"
          >
            <Close />
          </IconButton>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Help other students by sharing your PeerCheck experience
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Tab Selection */}
        <Box sx={{ mb: 3, display: 'flex', gap: 1 }}>
          <Button
            variant={activeTab === 'guest' ? 'contained' : 'outlined'}
            onClick={() => setActiveTab('guest')}
            disabled={loading}
            fullWidth
            startIcon={<Email />}
          >
            Guest Review
          </Button>
          <Button
            variant={activeTab === 'loggedIn' ? 'contained' : 'outlined'}
            onClick={() => setActiveTab('loggedIn')}
            disabled={loading}
            fullWidth
            startIcon={<Lock />}
          >
            Logged In
          </Button>
        </Box>

        <form onSubmit={handleSubmit}>
          {activeTab === 'guest' && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Verify your account
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange('email')}
                    disabled={loading}
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel htmlFor="password">Password</InputLabel>
                    <OutlinedInput
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange('password')}
                      disabled={loading}
                      required
                      startAdornment={
                        <InputAdornment position="start">
                          <Lock fontSize="small" />
                        </InputAdornment>
                      }
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      }
                      label="Password"
                    />
                    <FormHelperText>
                      Your credentials are only used for verification
                    </FormHelperText>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Rating */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              How would you rate PeerCheck?
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Rating
                value={formData.rating}
                onChange={handleRatingChange}
                size="large"
                precision={0.5}
                disabled={loading}
              />
              <Typography variant="h6" color="primary">
                {formData.rating}/5
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Review Content */}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Review Title"
                value={formData.title}
                onChange={handleChange('title')}
                disabled={loading}
                required
                placeholder="Brief summary of your experience"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <select
                  value={formData.category}
                  onChange={handleChange('category')}
                  disabled={loading}
                  style={{
                    padding: '16.5px 14px',
                    borderRadius: '4px',
                    border: `1px solid ${theme.palette.divider}`,
                    backgroundColor: theme.palette.background.paper,
                    fontSize: '1rem',
                    width: '100%'
                  }}
                >
                  <option value="general">General Feedback</option>
                  <option value="feedback">Detailed Feedback</option>
                  <option value="suggestion">Feature Suggestion</option>
                  <option value="testimonial">Success Story</option>
                </select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Your Review"
                value={formData.content}
                onChange={handleChange('content')}
                multiline
                rows={4}
                disabled={loading}
                required
                placeholder="Share your experience with PeerCheck..."
                helperText={`${formData.content.length}/500 characters`}
                inputProps={{ maxLength: 500 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Add Tags"
                value={tagInput}
                onChange={handleTagInputChange}
                onKeyDown={handleTagKeyDown}
                disabled={loading}
                placeholder="Type tag and press comma or Enter"
                helperText="Add tags to categorize your review"
              />
              
              {formData.tags.length > 0 && (
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      onDelete={() => removeTag(tag)}
                      deleteIcon={<Close fontSize="small" />}
                      sx={{
                        backgroundColor: theme.palette.primary.light,
                        color: theme.palette.primary.contrastText,
                      }}
                    />
                  ))}
                </Box>
              )}
            </Grid>
          </Grid>

          {error && (
            <Alert 
              severity="error" 
              sx={{ mt: 3 }}
              icon={<ErrorIcon />}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          {success && (
            <Alert 
              severity="success" 
              sx={{ mt: 3 }}
              icon={<CheckCircle />}
            >
              {success}
            </Alert>
          )}
        </form>
      </DialogContent>

      <DialogActions sx={{ 
        p: 3, 
        pt: 2,
        borderTop: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
      }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          color="inherit"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <Star />}
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReviewDialog;