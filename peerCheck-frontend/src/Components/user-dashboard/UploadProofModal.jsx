// Upload Proof Modal - Beautiful & Functional
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Paper,
  LinearProgress,
  Avatar,
  Chip,
  alpha
} from '@mui/material';
import {
  Close,
  Upload,
  Description,
  CloudUpload,
  InsertDriveFile,
  Image,
  PictureAsPdf,
  Description as DescriptionIcon,
  Archive,
  CheckCircle,
  Error,
  FileCopy,
  Delete
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axiosClient from '@api/axiosClient';
import { getAuthToken } from '../../utils/auth.js';

const UploadProofModal = ({ open, onClose, task, theme, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (open) {
      setFile(null);
      setPreview(null);
      setDescription('');
      setError('');
      setUploadProgress(0);
      setDragOver(false);
    }
  }, [open]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    processFile(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    processFile(droppedFile);
  };

  const processFile = (selectedFile) => {
    if (!selectedFile) return;

    // Check file size (25MB limit)
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (selectedFile.size > maxSize) {
      setError(`File size (${(selectedFile.size / (1024 * 1024)).toFixed(2)}MB) exceeds 25MB limit`);
      setFile(null);
      setPreview(null);
      return;
    }

    setFile(selectedFile);
    setError('');

    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return <Image />;
    if (fileType === 'application/pdf') return <PictureAsPdf />;
    if (fileType.includes('word') || fileType.includes('document')) return <DescriptionIcon />;
    if (fileType === 'application/zip' || fileType.includes('archive')) return <Archive />;
    return <InsertDriveFile />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeLabel = (fileType) => {
    if (fileType.startsWith('image/')) return 'Image';
    if (fileType === 'application/pdf') return 'PDF';
    if (fileType.includes('word') || fileType.includes('document')) return 'Document';
    if (fileType === 'text/plain') return 'Text';
    if (fileType === 'application/zip') return 'Archive';
    return 'File';
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    try {
      setLoading(true);
      setUploadProgress(0);
      const token = getAuthToken();
      
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('proofFile', file);
      if (description) {
        formData.append('description', description);
      }

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const response = await axiosClient.post(
        `/user/task/${task._id}/proof`,
        formData,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        }
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.data?.success) {
        // Show success briefly before closing
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 1000);
      } else {
        setError(response.data?.error || 'Failed to upload proof');
        setLoading(false);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to upload proof');
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    setError('');
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
          border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          overflow: 'hidden',
          backgroundImage: theme.palette.mode === 'dark' 
            ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`
            : `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.95)} 0%, ${alpha(theme.palette.primary.light, 0.03)} 100%)`,
          boxShadow: `0 25px 60px ${alpha(theme.palette.mode === 'dark' ? '#000' : theme.palette.primary.main, 0.15)}`,
        }
      }}
    >
      {/* Dialog Header */}
      <Box sx={{ 
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
      }}>
        <DialogTitle sx={{ 
          pb: 2.5,
          pt: 3.5,
          px: 4,
        }}>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography variant="h4" fontWeight="800" gutterBottom sx={{ 
                fontFamily: '"Alkatra", cursive',
                color: theme.palette.text.primary,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Upload Proof
              </Typography>
              <Typography variant="body1" sx={{ 
                color: theme.palette.text.secondary,
                fontFamily: '"Inter", sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}>
                <CheckCircle fontSize="small" sx={{ color: theme.palette.success.main }} />
                For task: <Box component="span" fontWeight="600" color={theme.palette.primary.main}>
                  {task?.taskTitle}
                </Box>
              </Typography>
            </Box>
            <IconButton 
              onClick={onClose} 
              disabled={loading} 
              size="medium"
              sx={{
                color: theme.palette.text.secondary,
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.15),
                  color: theme.palette.primary.main,
                  transform: 'rotate(90deg)',
                  borderColor: alpha(theme.palette.primary.main, 0.4),
                },
                transition: 'all 0.3s ease',
                width: 44,
                height: 44,
                borderRadius: 2,
              }}
            >
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
      </Box>

      <DialogContent dividers sx={{ p: 0 }}>
        <Box sx={{ p: 4 }}>
          {/* Drag & Drop Area */}
          <Paper
            elevation={0}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !file && document.getElementById('proof-file-upload').click()}
            sx={{
              p: 6,
              borderRadius: 3,
              backgroundColor: dragOver 
                ? alpha(theme.palette.primary.main, 0.08)
                : alpha(theme.palette.primary.main, 0.04),
              border: `2px ${dragOver ? 'solid' : 'dashed'} ${dragOver 
                ? theme.palette.primary.main 
                : alpha(theme.palette.primary.main, 0.3)}`,
              textAlign: 'center',
              cursor: !file ? 'pointer' : 'default',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
              mb: 3,
              '&:hover': !file ? {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                borderColor: alpha(theme.palette.primary.main, 0.5),
                transform: 'translateY(-2px)',
              } : {},
            }}
          >
            <input
  accept=".pdf,.doc,.docx,.txt,.rtf,
          .ppt,.pptx,.pps,.ppsx,
          .xls,.xlsx,.xlsm,.csv,
          .jpg,.jpeg,.png,.gif,.webp,.svg,.tiff,.bmp,
          .zip,.rar,.7z,
          .json,.js,.ts,.py,.java,.cpp,.c,.cs,.php,.rb,.go,.swift,
          .mp3,.wav,.ogg,.mp4,.mpeg,.webm,
          .odt,.ods,.odp,
          .pages,.numbers,.key"
  style={{ display: 'none' }}
  id="proof-file-upload"
  type="file"
  onChange={handleFileChange}
  disabled={loading || !!file}
/>
            
            {!file ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <CloudUpload sx={{ 
                  fontSize: 64, 
                  color: alpha(theme.palette.primary.main, 0.5),
                  mb: 2,
                }} />
                <Typography variant="h6" gutterBottom sx={{ 
                  color: theme.palette.text.primary,
                  fontFamily: '"Adlam Display", serif',
                  mb: 1,
                }}>
                  Drop your file here
                </Typography>
                <Typography variant="body2" sx={{ 
                  color: theme.palette.text.secondary,
                  fontFamily: '"Inter", sans-serif',
                  mb: 3,
                }}>
                  or click to browse files
                </Typography>
                <Chip
                  label="Max 25MB • PDF, Images, Documents, Archives"
                  size="small"
                  sx={{
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    fontWeight: 500,
                  }}
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  gap: 3,
                  textAlign: 'left',
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Avatar
                      sx={{
                        width: 64,
                        height: 64,
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        fontSize: 32,
                        border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                      }}
                    >
                      {getFileIcon(file.type)}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight="600" sx={{ 
                        fontFamily: '"Inter", sans-serif',
                        mb: 0.5,
                      }}>
                        {file.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip
                          label={getFileTypeLabel(file.type)}
                          size="small"
                          sx={{
                            backgroundColor: alpha(theme.palette.info.main, 0.1),
                            color: theme.palette.info.main,
                            fontWeight: 500,
                          }}
                        />
                        <Typography variant="caption" sx={{ 
                          color: theme.palette.text.secondary,
                          fontFamily: '"Inter", sans-serif',
                        }}>
                          {formatFileSize(file.size)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile();
                    }}
                    disabled={loading}
                    sx={{
                      color: theme.palette.error.main,
                      backgroundColor: alpha(theme.palette.error.main, 0.1),
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.error.main, 0.2),
                      }
                    }}
                  >
                    <Delete />
                  </IconButton>
                </Box>

                {/* Image Preview */}
                {preview && (
                  <Box sx={{ 
                    mt: 3, 
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                  }}>
                    <img
                      src={preview}
                      alt="Preview"
                      style={{
                        width: '100%',
                        height: 'auto',
                        maxHeight: 200,
                        objectFit: 'contain',
                        borderRadius: 2,
                      }}
                    />
                  </Box>
                )}

                {/* Upload Progress */}
                {loading && (
                  <Box sx={{ mt: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption" sx={{ 
                        color: theme.palette.text.secondary,
                        fontFamily: '"Inter", sans-serif',
                      }}>
                        Uploading...
                      </Typography>
                      <Typography variant="caption" sx={{ 
                        color: theme.palette.primary.main,
                        fontFamily: '"Inter", sans-serif',
                        fontWeight: 600,
                      }}>
                        {uploadProgress}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={uploadProgress}
                      sx={{ 
                        height: 6, 
                        borderRadius: 3,
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3,
                          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        }
                      }}
                    />
                  </Box>
                )}
              </motion.div>
            )}
          </Paper>

          {/* Description Input */}
          <TextField
            fullWidth
            label={
              <Typography variant="body2" fontWeight="600" sx={{ fontFamily: '"Inter", sans-serif' }}>
                Description (Optional)
              </Typography>
            }
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={3}
            disabled={loading}
            placeholder="Add a description for this proof..."
            InputProps={{
              sx: { 
                borderRadius: 3,
                backgroundColor: theme.palette.background.paper,
                fontFamily: '"Inter", sans-serif',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.02),
                }
              }
            }}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: theme.palette.primary.main,
                  borderWidth: 2,
                }
              }
            }}
          />

          {/* Info Alert */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 3,
              backgroundColor: alpha(theme.palette.info.main, 0.08),
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
              <Info sx={{ 
                color: theme.palette.info.main,
                mt: 0.5,
              }} />
              <Box>
                <Typography variant="body2" fontWeight="600" sx={{ 
                  color: theme.palette.info.main,
                  fontFamily: '"Inter", sans-serif',
                  mb: 0.5,
                }}>
                  Why upload proof?
                </Typography>
                <Typography variant="caption" sx={{ 
                  color: theme.palette.text.secondary,
                  fontFamily: '"Inter", sans-serif',
                  display: 'block',
                }}>
                  • Reduces risk score for this task
                </Typography>
                <Typography variant="caption" sx={{ 
                  color: theme.palette.text.secondary,
                  fontFamily: '"Inter", sans-serif',
                  display: 'block',
                }}>
                  • Provides verification for completed work
                </Typography>
                <Typography variant="caption" sx={{ 
                  color: theme.palette.text.secondary,
                  fontFamily: '"Inter", sans-serif',
                  display: 'block',
                }}>
                  • Required for teacher review and grading
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Paper
                elevation={0}
                sx={{
                  mt: 3,
                  p: 2.5,
                  borderRadius: 3,
                  backgroundColor: alpha(theme.palette.error.main, 0.08),
                  border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                }}
              >
                <Error sx={{ 
                  color: theme.palette.error.main,
                  mt: 0.5,
                }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight="600" sx={{ 
                    color: theme.palette.error.main,
                    fontFamily: '"Inter", sans-serif',
                    mb: 0.5,
                  }}>
                    Upload Error
                  </Typography>
                  <Typography variant="body2" sx={{ 
                    color: theme.palette.text.secondary,
                    fontFamily: '"Inter", sans-serif',
                  }}>
                    {error}
                  </Typography>
                </Box>
                <IconButton 
                  size="small" 
                  onClick={() => setError('')}
                  sx={{
                    color: theme.palette.error.main,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.error.main, 0.1),
                    }
                  }}
                >
                  <Close fontSize="small" />
                </IconButton>
              </Paper>
            </motion.div>
          )}
        </Box>
      </DialogContent>

      {/* Dialog Actions */}
      <DialogActions sx={{ 
        p: 2.5, 
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        backgroundColor: alpha(theme.palette.background.default, 0.3),
      }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          variant="outlined"
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1,
            fontWeight: 600,
            fontFamily: '"Inter", sans-serif',
            color: theme.palette.text.secondary,
            borderColor: alpha(theme.palette.text.secondary, 0.3),
            '&:hover': {
              borderColor: theme.palette.text.primary,
              color: theme.palette.text.primary,
              backgroundColor: alpha(theme.palette.text.primary, 0.04),
            }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || !file}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Upload />}
          sx={{
            borderRadius: 2,
            px: 4,
            py: 1,
            fontWeight: 700,
            fontFamily: '"Adlam Display", serif',
            background: loading 
              ? alpha(theme.palette.success.main, 0.8)
              : `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            color: 'white',
            boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
            '&:hover': !loading ? {
              boxShadow: `0 10px 30px ${alpha(theme.palette.primary.main, 0.5)}`,
              transform: 'translateY(-2px)',
            } : {},
            '&.Mui-disabled': {
              background: alpha(theme.palette.text.disabled, 0.3),
              color: alpha(theme.palette.text.disabled, 0.5),
            },
            transition: 'all 0.3s ease',
            minWidth: 140,
          }}
        >
          {loading 
            ? uploadProgress === 100 
              ? 'Success!' 
              : `Uploading ${uploadProgress}%`
            : 'Upload Proof'
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UploadProofModal;