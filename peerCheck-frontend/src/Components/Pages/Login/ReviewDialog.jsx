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
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Select,
  MenuItem,
  Paper,
  LinearProgress,
  alpha
} from '@mui/material';
import {
  Close,
  Star,
  Lock,
  Email,
  Visibility,
  VisibilityOff,
  CheckCircle,
  Error as ErrorIcon,
  Category,
  Title,
  Description,
  Send,
  Person,
  VerifiedUser
} from '@mui/icons-material';
import axiosClient from '@/api/axiosClient';
import { AnimatePresence, motion } from 'framer-motion';

const ReviewDialog = ({ open, onClose, onReviewSubmitted, theme }) => {
  const [activeTab, setActiveTab] = useState('guest');
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
  const [submitted, setSubmitted] = useState(false);

  const handleChange = field => e => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!formData.rating || !formData.title.trim() || !formData.content.trim()) {
      setError('Rating, title, and review content are required');
      setLoading(false);
      return;
    }

    if (activeTab === 'guest' && (!formData.email || !formData.password)) {
      setError('Email and password are required for guest review');
      setLoading(false);
      return;
    }

    try {
      let response;
      const reviewData = {
        rating: formData.rating,
        title: formData.title,
        content: formData.content,
        category: formData.category,
        tags: formData.tags
      };

      if (activeTab === 'guest') {
        response = await axiosClient.post('/reviews/guest', {
          ...reviewData,
          email: formData.email,
          password: formData.password
        });
      } else {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Please log in to submit a review');
        response = await axiosClient.post('/reviews', reviewData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      if (response.data.success) {
        setSuccess(activeTab === 'guest' 
          ? 'Review submitted for verification. Thank you!' 
          : 'Review submitted successfully!');
        setSubmitted(true);
        resetForm();
        onReviewSubmitted?.();
        setTimeout(() => {
          onClose();
          setSubmitted(false);
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      rating: 5,
      title: '',
      content: '',
      category: 'general',
      tags: []
    });
    setTagInput('');
  };

  const handleAddTag = () => {
    if (tagInput.trim() && formData.tags.length < 5) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({ 
      ...prev, 
      tags: prev.tags.filter(tag => tag !== tagToRemove) 
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      handleAddTag();
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
          overflow: 'hidden',
          border: `1.5px solid ${alpha(theme.palette.primary.main, 0.3)}`,
        }
      }}
    >
      <DialogTitle sx={{
        px: 4,
        py: 3,
        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        color: 'white',
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5" fontWeight={600}>
              Share Your Experience
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Your feedback helps improve PeerCheck
            </Typography>
          </Box>
          <IconButton onClick={onClose} disabled={loading} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CheckCircle sx={{ 
                      fontSize: 60, 
                      color: theme.palette.success.main,
                      mb: 3
                    }} />
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                      Thank You for Your Feedback!
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {activeTab === 'guest' 
                        ? 'Your review has been submitted for verification and will be published soon.'
                        : 'Your review has been submitted successfully!'}
                    </Typography>
                  </Box>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <ToggleButtonGroup
                    value={activeTab}
                    exclusive
                    onChange={(_, v) => v && setActiveTab(v)}
                    fullWidth
                    sx={{ mb: 3 }}
                  >
                    <ToggleButton value="guest">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Email fontSize="small" />
                        <Typography>Guest Review</Typography>
                      </Box>
                    </ToggleButton>
                    <ToggleButton value="loggedIn">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <VerifiedUser fontSize="small" />
                        <Typography>Member Review</Typography>
                      </Box>
                    </ToggleButton>
                  </ToggleButtonGroup>

                  {activeTab === 'guest' && (
                    <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.default' }}>
                      <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                        Account Verification
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange('email')}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Email fontSize="small" />
                                </InputAdornment>
                              )
                            }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <FormControl fullWidth>
                            <InputLabel>Password</InputLabel>
                            <OutlinedInput
                              type={showPassword ? 'text' : 'password'}
                              value={formData.password}
                              onChange={handleChange('password')}
                              startAdornment={
                                <InputAdornment position="start">
                                  <Lock fontSize="small" />
                                </InputAdornment>
                              }
                              endAdornment={
                                <InputAdornment position="end">
                                  <IconButton onClick={() => setShowPassword(p => !p)}>
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                  </IconButton>
                                </InputAdornment>
                              }
                              label="Password"
                            />
                            <FormHelperText>Used only for verification</FormHelperText>
                          </FormControl>
                        </Grid>
                      </Grid>
                    </Paper>
                  )}

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                      Rating
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Rating
                        value={formData.rating}
                        precision={0.5}
                        onChange={(_, v) => setFormData(p => ({ ...p, rating: v }))}
                        size="large"
                      />
                      <Typography fontWeight={600}>{formData.rating}/5</Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Review Title"
                        value={formData.title}
                        onChange={handleChange('title')}
                        placeholder="Brief summary of your experience"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Category</InputLabel>
                        <Select
                          value={formData.category}
                          label="Category"
                          onChange={handleChange('category')}
                        >
                          <MenuItem value="general">General Feedback</MenuItem>
                          <MenuItem value="feedback">Detailed Feedback</MenuItem>
                          <MenuItem value="suggestion">Feature Suggestion</MenuItem>
                          <MenuItem value="testimonial">Success Story</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Your Review"
                        value={formData.content}
                        onChange={handleChange('content')}
                        placeholder="Share your detailed experience..."
                        inputProps={{ maxLength: 500 }}
                        helperText={`${formData.content.length}/500 characters`}
                      />
                      <LinearProgress 
                        variant="determinate" 
                        value={(formData.content.length / 500) * 100}
                        sx={{ 
                          mt: 0.5,
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: theme.palette.primary.main,
                          }
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Tags (Optional)
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                          {formData.tags.map((tag, index) => (
                            <Chip
                              key={index}
                              label={tag}
                              onDelete={() => handleRemoveTag(tag)}
                              size="small"
                              sx={{
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.primary.main,
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                      <TextField
                        fullWidth
                        size="small"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Add tags (press Enter)"
                        helperText="Max 5 tags"
                      />
                    </Grid>
                  </Grid>

                  {error && (
                    <Alert severity="error" sx={{ mt: 3 }}>
                      {error}
                    </Alert>
                  )}
                  {success && (
                    <Alert severity="success" sx={{ mt: 3 }}>
                      {success}
                    </Alert>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 4, py: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || submitted}
          startIcon={loading ? <CircularProgress size={20} /> : <Send />}
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </Button>
      </DialogActions> 
      
    </Dialog>
  );
};

export default ReviewDialog;