import React, { useState, useEffect, useRef } from 'react';
import {
  TextField,
  Button,
  IconButton,
  Typography,
  Box,
  Avatar,
  Paper,
  Stack,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  Tooltip,
  Fade,
  alpha,
  useTheme
} from '@mui/material';
import {
  Send,
  Reply,
  Edit,
  Delete,
  MoreVert,
  AttachFile,
  EmojiEmotions,
  ChatBubbleOutline,
  Close,
  Visibility,
  VisibilityOff,
  Refresh,
  Check,
  Cancel,
  PersonOutline,
  ThumbUp,
  ThumbUpOutlined
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import axiosClient from '@/api/axiosClient';


const CommentTab = ({ taskId, projectId, currentUser }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [error, setError] = useState('');
  const [commentMenuAnchor, setCommentMenuAnchor] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);
  const [showReplies, setShowReplies] = useState({});
  const [likedComments, setLikedComments] = useState(new Set());
  const theme = useTheme();
  const commentsEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (taskId) {
      fetchComments();
    }
  }, [taskId]);

  // Scroll to bottom when comments change
  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axiosClient.get(`/user/comments/task/${taskId}`);
      if (response.data.success) {
        // Organize comments into parent-child structure
        const allComments = response.data.comments || [];
        const parentComments = allComments.filter(comment => !comment.parentComment);
        const childComments = allComments.filter(comment => comment.parentComment);
        
        // Attach replies to parent comments
        const organizedComments = parentComments.map(parent => ({
          ...parent,
          replies: childComments.filter(child => child.parentComment?.toString() === parent._id.toString())
        }));
        
        setComments(organizedComments);
      } else {
        setError(response?.data?.message);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      setError('');

      const commentData = {
        taskId,
        projectId: projectId || undefined,
        comment: newComment.trim(),
        commentedOn: replyTo?.commentedby?._id || undefined,
        parentComment: replyTo?._id || undefined
      };

      const response = await axiosClient.post('/user/comments/', commentData);
      
      if (response.data.success) {
        // Add new comment to the list
        const addedComment = {
          ...response.data.comment,
          commentedby: currentUser,
          commentedOn: replyTo?.commentedby || null
        };

        if (replyTo) {
          // Add as reply
          setComments(prev => 
            prev.map(comment => 
              comment._id === replyTo._id 
                ? { 
                    ...comment, 
                    replies: [...(comment.replies || []), addedComment],
                    repliesCount: (comment.repliesCount || 0) + 1
                  }
                : comment
            )
          );
          // Show replies for this parent
          setShowReplies(prev => ({ ...prev, [replyTo._id]: true }));
        } else {
          // Add as top-level comment
          setComments(prev => [addedComment, ...prev]);
        }

        // Reset form
        setNewComment('');
        setReplyTo(null);
        setEditingComment(null);
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      setError('Failed to submit comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateComment = async () => {
    if (!newComment.trim() || !editingComment) return;

    try {
      setSubmitting(true);
      setError('');

      const response = await axiosClient.put(
        `/user/comment/${editingComment._id}`,
        { comment: newComment.trim() }
      );

      if (response.data.success) {
        // Update comment in the list
        setComments(prev => 
          prev.map(comment => 
            comment._id === editingComment._id 
              ? { ...comment, comment: newComment.trim() }
              : findAndUpdateReply(comment, editingComment._id, newComment.trim())
          )
        );

        setNewComment('');
        setEditingComment(null);
        setReplyTo(null);
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      setError('Failed to update comment');
    } finally {
      setSubmitting(false);
    }
  };

  const findAndUpdateReply = (comment, replyId, newText) => {
    if (comment.replies) {
      return {
        ...comment,
        replies: comment.replies.map(reply =>
          reply._id === replyId ? { ...reply, comment: newText } : reply
        )
      };
    }
    return comment;
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await axiosClient.delete(`/user/comment/${commentId}`);
      if (response.data.success) {
        // Remove comment from the list
        setComments(prev => 
          prev.filter(comment => 
            comment._id !== commentId && !commentHasReply(comment, commentId)
          ).map(comment => ({
            ...comment,
            replies: comment.replies?.filter(reply => reply._id !== commentId) || [],
            repliesCount: comment.repliesCount ? comment.repliesCount - (comment.replies?.filter(reply => reply._id === commentId).length || 0) : 0
          }))
        );
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      setError('Failed to delete comment');
    }
    handleCloseMenu();
  };

  const commentHasReply = (comment, replyId) => {
    return comment.replies?.some(reply => reply._id === replyId) || false;
  };

  const handleReply = (comment) => {
    setReplyTo(comment);
    setEditingComment(null);
    setNewComment('');
  };

  const handleEdit = (comment) => {
    setEditingComment(comment);
    setReplyTo(null);
    setNewComment(comment.comment);
    handleCloseMenu();
  };

  const handleCancel = () => {
    setNewComment('');
    setReplyTo(null);
    setEditingComment(null);
  };

  const handleCloseMenu = () => {
    setCommentMenuAnchor(null);
    setSelectedComment(null);
  };

  const handleMenuOpen = (event, comment) => {
    setCommentMenuAnchor(event.currentTarget);
    setSelectedComment(comment);
  };

  const toggleReplies = (commentId) => {
    setShowReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const handleLikeComment = (commentId) => {
    setLikedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const renderComment = (comment, isReply = false, depth = 0) => {
    const isCommentOwner = comment.commentedby?._id === currentUser?._id;
    const hasReplies = comment.replies && comment.replies.length > 0;
    const repliesCount = comment.repliesCount || comment.replies?.length || 0;
    const showReplySection = showReplies[comment._id] && hasReplies;
    const isLiked = likedComments.has(comment._id);

    return (
      <Fade in={true} timeout={300} key={comment._id}>
        <Box 
          sx={{ 
            mb: 2.5,
            ml: isReply ? 4.5 : 0,
            position: 'relative',
          padding:2
          }}
        >
          {/* Reply connector line */}
          {isReply && depth === 1 && (
            <Box
              sx={{
                position: 'absolute',
                left: -20,
                top: 0,
                bottom: 0,
                width: 2,
                backgroundColor: alpha(theme.palette.primary.main, 0.2),
                borderRadius: 1,
              }}
            />
          )}

          <Paper 
            elevation={0}
            sx={{ 
              p: 2.5, 
              bgcolor: isReply 
                ? alpha(theme.palette.primary.main, 0.03)
                : alpha(theme.palette.background.paper, 0.9),
              border: '1px solid',
              borderColor: isReply
                ? alpha(theme.palette.primary.main, 0.15)
                : alpha(theme.palette.divider, 0.3),
              borderRadius: 2.5,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                borderColor: isReply
                  ? alpha(theme.palette.primary.main, 0.3)
                  : theme.palette.primary.main,
                boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.15)}`,
                transform: 'translateY(-2px)',
              }
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Box display="flex" alignItems="center" gap={1.5} flex={1}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    isCommentOwner ? (
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          bgcolor: theme.palette.success.main,
                          borderRadius: '50%',
                          border: `2px solid ${theme.palette.background.paper}`,
                        }}
                      />
                    ) : null
                  }
                >
                  <Avatar 
                    sx={{ 
                      width: 40, 
                      height: 40,
                      bgcolor: comment.commentedby?.avatar 
                        ? 'transparent' 
                        : alpha(theme.palette.primary.main, 0.2),
                      color: theme.palette.primary.main,
                      fontSize: 16,
                      fontWeight: 600,
                      border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    }}
                    src={comment.commentedby?.avatar}
                    alt={comment.commentedby?.name || comment.commentedby?.username}
                  >
                    {comment.commentedby?.name?.charAt(0)?.toUpperCase() || 
                     comment.commentedby?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </Avatar>
                </Badge>
                <Box>
                  <Typography 
                    variant="subtitle2" 
                    fontWeight="600"
                    sx={{ 
                      color: isCommentOwner 
                        ? theme.palette.primary.main 
                        : theme.palette.text.primary 
                    }}
                  >
                    {comment.commentedby?.name || comment.commentedby?.username || 'User'}
                    {isCommentOwner && (
                      <Typography 
                        component="span" 
                        variant="caption" 
                        sx={{ 
                          ml: 1,
                          color: theme.palette.success.main,
                          fontWeight: 500
                        }}
                      >
                        • You
                      </Typography>
                    )}
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    {comment.updatedAt !== comment.createdAt && (
                      <span style={{ color: theme.palette.warning.main }}>
                        {' '}• edited
                      </span>
                    )}
                  </Typography>
                </Box>
                {comment.commentedOn && (
                  <Box 
                    sx={{ 
                      ml: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}
                  >
                    <PersonOutline 
                      fontSize="small" 
                      sx={{ 
                        fontSize: 14,
                        color: theme.palette.text.secondary
                      }} 
                    />
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        color: theme.palette.primary.main,
                        fontWeight: 500
                      }}
                    >
                      @{comment.commentedOn?.name || comment.commentedOn?.username}
                    </Typography>
                  </Box>
                )}
              </Box>
              
              {(isCommentOwner || currentUser?.isAdmin) && (
                <IconButton 
                  size="small" 
                  onClick={(e) => handleMenuOpen(e, comment)}
                  sx={{ 
                    mt: -0.5,
                    color: theme.palette.text.secondary,
                    '&:hover': {
                      color: theme.palette.primary.main,
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                    }
                  }}
                >
                  <MoreVert fontSize="small" />
                </IconButton>
              )}
            </Box>

            <Typography 
              variant="body1" 
              sx={{ 
                mb: 2.5,
                whiteSpace: 'pre-wrap',
                lineHeight: 1.7,
                color: theme.palette.text.primary,
              }}
            >
              {comment.comment}
            </Typography>

            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" gap={1.5}>
                <IconButton
                  size="small"
                  onClick={() => handleLikeComment(comment._id)}
                  sx={{
                    color: isLiked ? theme.palette.primary.main : theme.palette.text.secondary,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                    }
                  }}
                >
                  {isLiked ? <ThumbUp fontSize="small" /> : <ThumbUpOutlined fontSize="small" />}
                </IconButton>
                
                <Button
                  size="small"
                  startIcon={<Reply fontSize="small" />}
                  onClick={() => handleReply(comment)}
                  sx={{ 
                    textTransform: 'none',
                    fontWeight: 500,
                    color: theme.palette.primary.main,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                    }
                  }}
                >
                  Reply
                </Button>
              </Box>
              
              {hasReplies && !isReply && (
                <Button
                  size="small"
                  endIcon={showReplies[comment._id] ? 
                    <VisibilityOff fontSize="small" /> : 
                    <Visibility fontSize="small" />
                  }
                  onClick={() => toggleReplies(comment._id)}
                  sx={{ 
                    textTransform: 'none',
                    fontWeight: 500,
                    color: theme.palette.text.secondary,
                    '&:hover': {
                      color: theme.palette.primary.main,
                    }
                  }}
                >
                  {repliesCount} {repliesCount === 1 ? 'reply' : 'replies'}
                </Button>
              )}
            </Box>
          </Paper>

          {/* Render replies */}
          {showReplySection && (
            <Box sx={{ mt: 3, ml: 4 }}>
              {comment.replies.map(reply => renderComment(reply, true, depth + 1))}
            </Box>
          )}
        </Box>
      </Fade>
    );
  };

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: theme.palette.background.default,
      color: theme.palette.text.primary,
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        pb: 2.5,
        borderBottom: '1px solid',
        borderColor: alpha(theme.palette.divider, 0.3),
        padding:2
      }}>
        <Typography variant="h6" fontWeight="600" sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ChatBubbleOutline sx={{ color: theme.palette.primary.main }} />
          Comments
          <Badge 
            badgeContent={comments.length} 
            color="primary"
            sx={{ 
              ml: 1,
              '& .MuiBadge-badge': { 
                fontSize: '0.7rem', 
                height: 20, 
                minWidth: 20,
                fontWeight: 600,
              } 
            }}
          />
        </Typography>
        <Box display="flex" gap={1}>
          <Tooltip title="Refresh comments">
            <IconButton 
              onClick={fetchComments} 
              disabled={loading}
              size="small"
              sx={{
                color: theme.palette.text.secondary,
                '&:hover': {
                  color: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                }
              }}
            >
              <Refresh fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Error Message */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.error.main, 0.08),
            border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
          }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {/* Comments List */}
      <Box sx={{ 
        flex: 1, 
        overflow: 'auto', 
        mb: 3,
        px: 0.5,
        '&::-webkit-scrollbar': {
          width: 6,
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: alpha(theme.palette.background.paper, 0.5),
          borderRadius: 3,
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: alpha(theme.palette.primary.main, 0.3),
          borderRadius: 3,
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.5),
          }
        }
      }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%" minHeight={200}>
            <CircularProgress 
              size={40}
              thickness={4}
              sx={{ color: theme.palette.primary.main }}
            />
          </Box>
        ) : comments.length === 0 ? (
          <Box 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            justifyContent="center" 
            height="100%"
            minHeight={200}
            p={3}
            sx={{ color: theme.palette.text.secondary }}
          >
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
              }}
            >
              <ChatBubbleOutline sx={{ fontSize: 40, color: theme.palette.primary.main, opacity: 0.7 }} />
            </Box>
            <Typography variant="h6" fontWeight="500" gutterBottom>
              No comments yet
            </Typography>
            <Typography variant="body2" textAlign="center" sx={{ maxWidth: 300 }}>
              Start the conversation by adding the first comment
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2.5}>
            {comments.map(comment => renderComment(comment))}
            <div ref={commentsEndRef} />
          </Stack>
        )}
      </Box>

      {/* Comment Input */}
      <Box sx={{ 
        mt: 'auto',
        pt: 3,
        borderTop: '1px solid',
        borderColor: alpha(theme.palette.divider, 0.3),
        bgcolor: alpha(theme.palette.background.paper, 0.8),
        borderRadius: 2,
        p: 2.5,
        backdropFilter: 'blur(10px)',
      }}>
        {(replyTo || editingComment) && (
          <Paper 
            elevation={0}
            sx={{ 
              p: 2, 
              mb: 2, 
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              borderRadius: 2,
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" fontWeight="600" sx={{ color: theme.palette.primary.main }}>
                {editingComment ? 'Editing comment' : `Replying to ${replyTo?.commentedby?.name || replyTo?.commentedby?.username}`}
              </Typography>
              <IconButton 
                size="small" 
                onClick={handleCancel}
                sx={{ color: theme.palette.text.secondary }}
              >
                <Close fontSize="small" />
              </IconButton>
            </Box>
          </Paper>
        )}

        <Box display="flex" gap={2.5}>
          <Avatar 
            sx={{ 
              width: 48, 
              height: 48,
              bgcolor: alpha(theme.palette.primary.main, 0.2),
              color: theme.palette.primary.main,
              fontSize: 18,
              fontWeight: 600,
              border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            }}
            src={currentUser?.avatar}
            alt={currentUser?.name}
          >
            {currentUser?.name?.charAt(0)?.toUpperCase() || 
             currentUser?.username?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
          <Box flex={1}>
            <TextField
              fullWidth
              multiline
              minRows={3}
              maxRows={6}
              placeholder={replyTo ? `Reply to ${replyTo.commentedby?.name || replyTo.commentedby?.username}...` : 
                        editingComment ? 'Edit your comment...' : 'Add a comment...'}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              variant="outlined"
              size="medium"
              disabled={submitting}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  e.preventDefault();
                  editingComment ? handleUpdateComment() : handleSubmitComment();
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2.5,
                  bgcolor: alpha(theme.palette.background.paper, 0.8),
                  borderColor: alpha(theme.palette.divider, 0.5),
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                  },
                  '&.Mui-focused': {
                    borderColor: theme.palette.primary.main,
                    boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
                  },
                },
                '& .MuiInputBase-input': {
                  color: theme.palette.text.primary,
                },
                '& .MuiInputBase-input::placeholder': {
                  color: theme.palette.text.secondary,
                  opacity: 0.7,
                }
              }}
            />
            <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
              <Box display="flex" gap={1}>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    console.log('File selected:', e.target.files[0]);
                  }}
                />
                <Tooltip title="Add emoji">
                  <IconButton 
                    size="small" 
                    disabled={submitting}
                    sx={{
                      color: theme.palette.text.secondary,
                      '&:hover': {
                        color: theme.palette.primary.main,
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                      }
                    }}
                  >
                    <EmojiEmotions fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box display="flex" gap={1.5}>
                {(replyTo || editingComment) && (
                  <Button
                    variant="outlined"
                    size="medium"
                    onClick={handleCancel}
                    disabled={submitting}
                    sx={{ 
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 500,
                      borderColor: alpha(theme.palette.divider, 0.5),
                      color: theme.palette.text.secondary,
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        color: theme.palette.primary.main,
                      }
                    }}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  variant="contained"
                  size="medium"
                  startIcon={submitting ? 
                    <CircularProgress size={20} sx={{ color: 'white' }} /> : 
                    editingComment ? <Check /> : <Send />
                  }
                  onClick={editingComment ? handleUpdateComment : handleSubmitComment}
                  disabled={!newComment.trim() || submitting}
                  sx={{ 
                    borderRadius: 2.5,
                    px: 3,
                    fontWeight: 600,
                    textTransform: 'none',
                    bgcolor: theme.palette.primary.main,
                    '&:hover': {
                      bgcolor: theme.palette.primary.dark,
                      boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                    },
                    '&.Mui-disabled': {
                      bgcolor: alpha(theme.palette.primary.main, 0.3),
                    }
                  }}
                >
                  {editingComment ? 'Update' : 'Comment'}
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Comment Action Menu */}
      <Menu
        anchorEl={commentMenuAnchor}
        open={Boolean(commentMenuAnchor)}
        onClose={handleCloseMenu}
        PaperProps={{
          sx: { 
            minWidth: 160,
            borderRadius: 2,
            boxShadow: `0 8px 32px ${alpha(theme.palette.common.black, 0.1)}`,
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            bgcolor: theme.palette.background.paper,
          }
        }}
      >
        {selectedComment && selectedComment.commentedby?._id === currentUser?._id && (
          <MenuItem 
            onClick={() => handleEdit(selectedComment)}
            sx={{
              borderRadius: 1,
              mx: 1,
              my: 0.25,
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.08),
              }
            }}
          >
            <ListItemIcon>
              <Edit fontSize="small" sx={{ color: theme.palette.primary.main }} />
            </ListItemIcon>
            <ListItemText 
              primary="Edit" 
              primaryTypographyProps={{
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            />
          </MenuItem>
        )}
        <MenuItem 
          onClick={() => selectedComment && handleDeleteComment(selectedComment._id)}
          sx={{
            borderRadius: 1,
            mx: 1,
            my: 0.25,
            '&:hover': {
              bgcolor: alpha(theme.palette.error.main, 0.08),
            }
          }}
        >
          <ListItemIcon>
            <Delete fontSize="small" sx={{ color: theme.palette.error.main }} />
          </ListItemIcon>
          <ListItemText 
            primary="Delete" 
            primaryTypographyProps={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: theme.palette.error.main,
            }}
          />
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default CommentTab;