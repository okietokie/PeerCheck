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
  InputAdornment,
  FormControl,
  OutlinedInput,
  InputLabel,
  Paper,
  alpha,
  Divider
} from '@mui/material';
import {
  Close,
  Email,
  Lock,
  Visibility,
  VisibilityOff,
  Send,
  CheckCircle
} from '@mui/icons-material';
import axiosClient from '@/api/axiosClient';
import { motion, AnimatePresence } from 'framer-motion';

const ReviewDialog = ({ open, onClose, onReviewSubmitted, theme }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rating: 5,
    title: '',
    content: '',
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

    // Validation
    if (!formData.email || !formData.password || !formData.rating || 
        !formData.title.trim() || !formData.content.trim()) {
      setError('All fields except tags are required');
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const reviewData = {
        email: formData.email,
        password: formData.password,
        rating: formData.rating,
        title: formData.title.trim(),
        content: formData.content.trim(),
        tags: formData.tags
      };

      const response = await axiosClient.post('/reviews/submit', reviewData );

      if (response.data.success) {
        setSuccess('Review submitted successfully!');
        setSubmitted(true);
        resetForm();
        onReviewSubmitted?.();
        
        setTimeout(() => {
          onClose();
          setSubmitted(false);
        }, 2000);
      }
      setError(response?.data?.message || 'Submission failed. Please check your credentials.');
    } catch (err) {
      console.error("error: ", err)
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
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: 'hidden',
          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        }
      }}
    >
      <DialogTitle sx={{
        px: 3,
        py: 2,
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        bgcolor: alpha(theme.palette.primary.main, 0.02)
      }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={600}>
            Submit Your Review
          </Typography>
          <IconButton 
            onClick={onClose} 
            disabled={loading}
            size="small"
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <CheckCircle sx={{ 
                      fontSize: 48, 
                      color: theme.palette.success.main,
                      mb: 2
                    }} />
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                      Thank You!
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Your review has been submitted successfully.
                    </Typography>
                  </Box>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <Paper sx={{ p: 2.5, mb: 3, bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                      User Verification
                    </Typography>
                    
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange('email')}
                      size="small"
                      sx={{ mb: 2 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email fontSize="small" />
                          </InputAdornment>
                        )
                      }}
                    />

                    <FormControl fullWidth>
                      <InputLabel size="small">Password</InputLabel>
                      <OutlinedInput
                        size="small"
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
                            <IconButton 
                              onClick={() => setShowPassword(p => !p)}
                              edge="end"
                              size="small"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        }
                        label="Password"
                      />
                    </FormControl>
                  </Paper>

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
                      <Typography fontWeight={600} color="text.secondary">
                        {formData.rating}/5
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <TextField
                    fullWidth
                    label="Review Title"
                    value={formData.title}
                    onChange={handleChange('title')}
                    size="small"
                    sx={{ mb: 2 }}
                    placeholder="Brief summary of your experience"
                  />

                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Your Review"
                    value={formData.content}
                    onChange={handleChange('content')}
                    size="small"
                    sx={{ mb: 2 }}
                    placeholder="Share your detailed thoughts..."
                    inputProps={{ maxLength: 300 }}
                    helperText={`${formData.content.length}/300 characters`}
                  />

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                      Tags (Optional, max 3)
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                      {formData.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          onDelete={() => handleRemoveTag(tag)}
                          size="small"
                          sx={{
                            backgroundColor: alpha(theme.palette.primary.main, 0.08),
                            '& .MuiChip-deleteIcon': {
                              fontSize: 16,
                            }
                          }}
                        />
                      ))}
                    </Box>
                    <TextField
                      fullWidth
                      size="small"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Press Enter to add tag"
                      disabled={formData.tags.length >= 3}
                    />
                  </Box>

                  {error && (
                    <Alert 
                      severity="error" 
                      sx={{ mt: 2 }}
                      onClose={() => setError('')}
                    >
                      {error}
                    </Alert>
                  )}
                  {success && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      {success}
                    </Alert>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          sx={{ color: 'text.secondary' }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || submitted}
          startIcon={loading ? <CircularProgress size={16} /> : <Send />}
          sx={{ minWidth: 120 }}
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReviewDialog;