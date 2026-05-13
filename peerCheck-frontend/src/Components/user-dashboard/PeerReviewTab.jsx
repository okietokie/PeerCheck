// components/PeerReviewTab.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Chip,
  Avatar,
  Button,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  IconButton,
  DialogContent,
  TextField,
  DialogActions,
  useMediaQuery
} from '@mui/material';
import { Assessment, CheckCircle, Close, ExpandMore, People, RateReview, Star, Visibility, Warning } from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';

// Custom hooks and utils
import { usePeerReview } from '@/hooks/usePeerReview';
import { canReviewMember } from '@/utils/peerReviewUtils';

const CompletionStatusCard = ({ completionStatus, user, theme, isMobile }) => {
  if (!completionStatus) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          backgroundColor: completionStatus.isCompleted 
            ? alpha(theme.palette.success.main, 0.1)
            : alpha(theme.palette.info.main, 0.1),
          border: `2px solid ${completionStatus.isCompleted 
            ? alpha(theme.palette.success.main, 0.3)
            : alpha(theme.palette.info.main, 0.3)}`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: { xs: 'stretch', md: 'center' }, 
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', md: 'row' },
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            {completionStatus.isCompleted ? (
              <>
                <CheckCircle sx={{ 
                  fontSize: { xs: 32, sm: 40 },
                  color: theme.palette.success.main 
                }} />
                <Box>
                  <Typography variant={isMobile ? 'subtitle1' : 'h6'} sx={{ 
                    fontWeight: 600,
                    color: theme.palette.success.main,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    Peer Reviews Complete!
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    All team members have submitted their reviews
                  </Typography>
                </Box>
              </>
            ) : (
              <>
                <Assessment sx={{ 
                  fontSize: { xs: 32, sm: 40 },
                  color: theme.palette.info.main 
                }} />
                <Box>
                  <Typography variant={isMobile ? 'subtitle1' : 'h6'} sx={{ 
                    fontWeight: 600,
                    color: theme.palette.info.main,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    Peer Review Progress: {completionStatus.completionPercentage}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {completionStatus.stats.completedReviews} of {completionStatus.stats.totalPossibleReviews} reviews submitted
                  </Typography>
                </Box>
              </>
            )}
          </Box>
          
          {/* Progress Bar */}
          <Box sx={{ flex: 1, width: { xs: '100%', md: 'auto' }, maxWidth: { xs: '100%', md: 300 } }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              mb: 1 
            }}>
              <Typography variant="caption" color="text.secondary">
                Progress
              </Typography>
              <Typography variant="caption" fontWeight="600">
                {completionStatus.completionPercentage}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={completionStatus.completionPercentage}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: alpha(theme.palette.background.paper, 0.3),
                '& .MuiLinearProgress-bar': {
                  backgroundColor: completionStatus.isCompleted 
                    ? theme.palette.success.main
                    : theme.palette.info.main,
                  borderRadius: 4,
                }
              }}
            />
          </Box>
        </Box>
        
        {/* Member Progress Breakdown */}
        <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}` }}>
          <Accordion 
            elevation={0}
            sx={{
              backgroundColor: 'transparent',
              '&:before': { display: 'none' },
            }}
          >
            <AccordionSummary 
              expandIcon={<ExpandMore />}
              sx={{
                minHeight: 'auto',
                p: 0,
                '& .MuiAccordionSummary-content': {
                  m: 0,
                }
              }}
            >
              <Typography variant="body2" sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                color: theme.palette.text.secondary
              }}>
                <People /> View individual progress ({completionStatus.stats.totalMembers} members)
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0, pt: 1 }}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 1 
              }}>
                {completionStatus.memberCompletion.map((member) => (
                  <Box 
                    key={member.userId}
                    sx={{ 
                      display: 'flex', 
                      alignItems: { xs: 'flex-start', sm: 'center' }, 
                      justifyContent: 'space-between',
                      flexDirection: { xs: 'column', sm: 'row' },
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: member.isComplete 
                        ? alpha(theme.palette.success.main, 0.05)
                        : alpha(theme.palette.background.paper, 0.3),
                      border: `1px solid ${member.isComplete 
                        ? alpha(theme.palette.success.main, 0.1)
                        : alpha(theme.palette.divider, 0.2)}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                      <Avatar 
                        src={member?.avatar}
                        sx={{ 
                          width: 32, 
                          height: 32,
                          fontSize: 14,
                          backgroundColor: member.isComplete 
                            ? alpha(theme.palette.success.main, 0.1)
                            : alpha(theme.palette.primary.main, 0.1),
                          color: member.isComplete 
                            ? theme.palette.success.main
                            : theme.palette.primary.main,
                        }}
                      >
                        {member?.avatar || member.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="500">
                          {member.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {member.userId === user?.id ? '(You)' : ''}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'space-between', sm: 'flex-end' } }}>
                      {member.isComplete ? (
                        <Chip
                          label="Complete"
                          size="small"
                          icon={<CheckCircle fontSize="small" />}
                          sx={{
                            backgroundColor: alpha(theme.palette.success.main, 0.1),
                            color: theme.palette.success.main,
                            fontWeight: 600,
                          }}
                        />
                      ) : (
                        <>
                          <Typography variant="caption" color="text.secondary">
                            {member.reviewsCompleted}/{member.reviewsNeeded} reviews
                          </Typography>
                          <CircularProgress
                            size={20}
                            variant="determinate" 
                            value={(member.reviewsCompleted / member.reviewsNeeded) * 100}
                            sx={{
                              color: theme.palette.warning.main,
                            }}
                          />
                        </>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Paper>
    </motion.div>
  );
};


const MemberCard = ({ 
  member, 
  memberScore, 
  isSelf, 
  project, 
  onReviewClick, 
  canReview,
  theme,
  isMobile
}) => {
  const hasReviewed = !canReview && !isSelf;
  
  // Determine status and its configuration
  const getStatusConfig = () => {
    if (isSelf) {
      return {
        label: 'You',
        color: theme.palette.info.main,
        bgColor: alpha(theme.palette.info.main, 0.1),
        icon: null
      };
    }
    
    if (hasReviewed) {
      return {
        label: 'Reviewed',
        color: theme.palette.success.main,
        bgColor: alpha(theme.palette.success.main, 0.1),
        icon: <CheckCircle fontSize="small" />
      };
    }
    
    if (canReview) {
      return {
        label: 'Needs Review',
        color: theme.palette.warning.main,
        bgColor: alpha(theme.palette.warning.main, 0.1),
        icon: <RateReview fontSize="small" />
      };
    }
    
    return null;
  };
  
  const statusConfig = getStatusConfig();

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ width: '100%' }}
    >
      <Paper
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: 3,
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            borderColor: alpha(theme.palette.primary.main, 0.3),
            boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
          },
          transition: 'all 0.3s ease',
        }}
      >
        {/* Status Badge - Only show if not viewing self and reviews aren't locked */}
        {statusConfig && !project?.peerReviewLocked && (
          <Box sx={{ position: 'absolute', top: 12, right: 12, maxWidth: { xs: 110, sm: 'none' } }}>
            <Chip
              label={statusConfig.label}
              size="small"
              icon={statusConfig.icon}
              sx={{
                backgroundColor: statusConfig.bgColor,
                color: statusConfig.color,
                fontWeight: 600,
              }}
            />
          </Box>
        )}
        
        {/* If reviews are locked, show a locked badge instead */}
        {project?.peerReviewLocked && !isSelf && (
          <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
            <Chip
              label="Locked"
              size="small"
              sx={{
                backgroundColor: alpha(theme.palette.grey[500], 0.1),
                color: theme.palette.grey[600],
                fontWeight: 600,
              }}
            />
          </Box>
        )}
        
        {/* Member Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, pr: { xs: 9, sm: 10 } }}>
          <Avatar 
            src={member.avatar}
            sx={{ 
              width: { xs: 48, sm: 56 }, 
              height: { xs: 48, sm: 56 },
              fontSize: { xs: 18, sm: 20 },
              fontWeight: 'bold',
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            }}
          >
            {member.avatar || member.name?.charAt(0).toUpperCase() || '?'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant={isMobile ? 'subtitle1' : 'h6'} fontWeight="600">
              {member.name || 'Unknown'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
              {member.email || 'No email'}
            </Typography>
          </Box>
        </Box>
        
        {/* Peer Score Display */}
        {memberScore ? (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Peer Score
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ flex: 1 }}>
                <LinearProgress 
                  variant="determinate" 
                  value={(memberScore.averageScore / 5) * 100}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: theme.palette.primary.main,
                    }
                  }}
                />
              </Box>
              <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight="800" sx={{ 
                color: theme.palette.primary.main,
              }}>
                {memberScore.averageScore.toFixed(1)}
              </Typography>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Based on {memberScore.reviewCount} review{memberScore.reviewCount !== 1 ? 's' : ''}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ 
            mb: 2, 
            p: 2, 
            borderRadius: 2, 
            backgroundColor: alpha(theme.palette.divider, 0.1),
            textAlign: 'center'
          }}>
            <Typography variant="body2" color="text.secondary">
              No peer reviews yet
            </Typography>
          </Box>
        )}
        
        {/* Review Button */}
        {!isSelf && !project?.peerReviewLocked && (
          <Button
            fullWidth
            variant={canReview ? "contained" : "outlined"}
            startIcon={canReview ? <RateReview /> : <Visibility />}
            onClick={onReviewClick}
            disabled={!canReview && !hasReviewed}

            sx={{
              mt: 'auto',
              borderRadius: 2,
              py: 1,
              fontWeight: 600,
              ...(canReview ? {
                backgroundColor: theme.palette.primary.main,
                color: '#ffffff',
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                  transform: 'translateY(-2px)',
                }
              } : {}),
              transition: 'all 0.3s ease',
            }}
          >
            {canReview ? 'Review Teammate' : hasReviewed ? 'Already Reviewed' : 'View Details'}
          </Button>
        )}
        

        
        {/* Message when reviews are locked */}
        {!isSelf && project?.peerReviewLocked && (
          <Button
            fullWidth
            variant="outlined"
            disabled
            sx={{
              mt: 'auto',
              borderRadius: 2,
              py: 1,
              fontWeight: 600,
              color: theme.palette.text.disabled,
              borderColor: alpha(theme.palette.grey[500], 0.3),
              backgroundColor: alpha(theme.palette.grey[500], 0.05),
            }}
          >
            Reviews Locked
          </Button>
        )}
      </Paper>
    </motion.div>
  );
};

const PersonalScoreCard = ({ userPeerScore, theme, isMobile }) => {
  if (!userPeerScore) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          backgroundColor: alpha(theme.palette.primary.main, 0.05),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          mb: 2,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2
        }}>
          <Box>
            <Typography variant={isMobile ? 'subtitle1' : 'h6'} sx={{ 
              mb: 1, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              color: theme.palette.primary.main
            }}>
              <Star /> Your Peer Review Score
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Based on reviews from your teammates
            </Typography>
          </Box>
          <Box sx={{ textAlign: { xs: 'left', sm: 'center' } }}>
            <Typography variant={isMobile ? 'h3' : 'h2'} fontWeight="800" sx={{ 
              color: theme.palette.primary.main,
              lineHeight: 1,
            }}>
              {userPeerScore?.averageScore?.toFixed(1) || '0.0'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              / 5.0
            </Typography>
          </Box>
        </Box>
        
        {/* Criteria Breakdown */}
        {userPeerScore?.criteriaScores && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
              Criteria Breakdown:
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 2,
              '& > *': { flex: { xs: '1 1 calc(50% - 8px)', sm: '1 1 calc(25% - 16px)' }, minWidth: { xs: 0, sm: 120 } }
            }}>
              {Object.entries(userPeerScore?.criteriaScores).map(([criteria, score]) => (
                <Box key={criteria} sx={{ 
                  p: 1.5, 
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {criteria.charAt(0).toUpperCase() + criteria.slice(1)}
                  </Typography>
                  <Typography variant="body1" fontWeight="600">
                    {score.toFixed(1)}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
        
        {/* Reviews Received */}
        {userPeerScore?.reviews && userPeerScore?.reviews.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
              Reviews from teammates:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {userPeerScore?.reviews.slice(0, 3).map((review, index) => (
                <Box key={index} sx={{ 
                  p: 1.5, 
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.background.paper, 0.5),
                  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 1
                  }}>
                    <Typography variant="body2" fontWeight="600">
                      {review.reviewerName || 'Anonymous'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Score: {review.totalScore ? review.totalScore : 'N/A'}
                    </Typography>
                    
                  </Box>
                  {review.comment && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      "{review.comment}"
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Paper>
    </motion.div>
  );
};


const ProjectsSummaryCard = ({ aggregatedScores, project, theme, isMobile }) => {
  if (!aggregatedScores) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <Paper
        sx={{
          p: 3,
          mt: 3,
          borderRadius: 3,
          backgroundColor: alpha(theme.palette.secondary.main, 0.05),
          border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
        }}
      >
        <Typography variant={isMobile ? 'subtitle1' : 'h6'} sx={{ 
          mb: 3, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          color: theme.palette.secondary.main
        }}>
          <Assessment /> Project Peer Review Summary
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 3,
          '& > *': { 
            flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)' }, 
            minWidth: { xs: 0, sm: 280 } 
          }
        }}>
          <Box sx={{ 
            p: 2, 
            borderRadius: 2, 
            backgroundColor: alpha(theme.palette.background.paper, 0.5),
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Average Team Score
            </Typography>
            <Typography variant={isMobile ? 'h4' : 'h3'} fontWeight="800" sx={{ 
              color: theme.palette.primary.main,
            }}>
              {aggregatedScores.summary?.projectAverage?.toFixed(1) || '0.0'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              out of 5.0
            </Typography>
          </Box>
          
          <Box sx={{ 
            p: 2, 
            borderRadius: 2, 
            backgroundColor: alpha(theme.palette.background.paper, 0.5),
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Total Reviews Submitted
            </Typography>
            <Typography variant={isMobile ? 'h4' : 'h3'} fontWeight="800" sx={{ 
              color: theme.palette.secondary.main,
            }}>
              {aggregatedScores.summary?.totalReviews || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              by {aggregatedScores.summary?.membersReviewed || 0} team members
            </Typography>
          </Box>
        </Box>
        
        {/* Free Rider Detection */}
        {project?.metrics?.contributorFairness?.freeRiderRisk && project.metrics.freeRiders.length > 0 && (
          <Box sx={{ 
            mt: 3, 
            pt: 2, 
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.3)}` 
          }}>
            <Typography variant="subtitle1" sx={{ 
              mb: 2, 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              color: theme.palette.warning.main
            }}>
              <Warning /> Potential Free Riders Detected
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {project.metrics.freeRiders.map((rider, index) => (
                <Box key={index} sx={{ 
                  p: 1.5, 
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.error.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 1
                }}>
                  <Box>
                    <Typography variant="body2" fontWeight="600">
                      {rider.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {rider.reason}
                    </Typography>
                  </Box>
                  <Chip
                    label="Flagged"
                    size="small"
                    sx={{
                      backgroundColor: alpha(theme.palette.error.main, 0.1),
                      color: theme.palette.error.main,
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Paper>
    </motion.div>
  );
};


const ReviewDialog = ({
  open,
  onClose,
  selectedReviewee,
  reviewScores,
  reviewComment,
  onScoresChange,
  onCommentChange,
  onSubmit,
  project,
  theme,
  isMobile
}) => {
  const getThemeColor = (color) => {
    return theme.palette[color]?.main || theme.palette.primary.main;
  };

  const getBorderColor = (color, opacity = 1) => {
    return alpha(getThemeColor(color), opacity);
  };

  const getContrastColor = (color) => {
    return theme.palette.getContrastText(color);
  };

  const calculateAverageScore = () => {
    const scores = Object.values(reviewScores);
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  };

  if (!selectedReviewee) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 4 },
          background: theme.palette.primary.color,
          border: `1.5px solid ${getBorderColor('primary', 0.3)}`,
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ 
            fontFamily: '"Adlam Display", serif',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}>
            <RateReview /> Review Teammate
          </Typography>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              backgroundColor: alpha(getThemeColor('error'), 0.1),
              color: getThemeColor('error'),
              '&:hover': {
                backgroundColor: alpha(getThemeColor('error'), 0.2),
              }
            }}
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, p: 2, borderRadius: 2, backgroundColor: alpha(theme.palette.primary.main, 0.05) }}>
          <Avatar 
            sx={{ 
              width: 48, 
              height: 48,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            }}
          >
            {selectedReviewee.name?.charAt(0) || '?'}
          </Avatar>
          <Box>
            <Typography variant={isMobile ? 'subtitle1' : 'h6'}>
              {selectedReviewee.name || 'Teammate'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please provide an honest and constructive review
            </Typography>
          </Box>
        </Box>
        
        {/* Review Criteria */}
        <Typography variant="subtitle1" sx={{ mb: 2, fontFamily: '"Adlam Display", serif' }}>
          Review Criteria (1-5)
        </Typography>
        
        {['contribution', 'collaboration', 'quality', 'punctuality'].map((criteria) => (
          <Box key={criteria} sx={{ mb: 2.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                {criteria.replace('_', ' ')}
              </Typography>
              <Typography variant="body2" fontWeight="600">
                {reviewScores[criteria]} / 5
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <IconButton
                  key={star}
                  size="small"
                  onClick={() => onScoresChange(prev => ({ ...prev, [criteria]: star }))}
                  sx={{
                    color: star <= reviewScores[criteria] ? getThemeColor('warning') : alpha(theme.palette.text.secondary, 0.3),
                    '&:hover': {
                      color: getThemeColor('warning'),
                    }
                  }}
                >
                  <Star />
                </IconButton>
              ))}
            </Box>
          </Box>
        ))}
        
        {/* Comment */}
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Additional Comments (Optional)"
          placeholder="Provide constructive feedback to help your teammate improve..."
          value={reviewComment}
          onChange={(e) => onCommentChange(e.target.value)}
          sx={{
            mt: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.background.paper, 0.5),
              borderColor: getBorderColor('primary', 0.2),
            }
          }}
        /> 
        
        {/* Preview Score */}
        <Box sx={{ 
          mt: 3, 
          p: 2, 
          borderRadius: 2, 
          backgroundColor: alpha(getThemeColor('primary'), 0.05),
          border: `1px solid ${getBorderColor('primary', 0.1)}`,
        }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Preview Score
          </Typography>
          <Typography variant="h4" fontWeight="800" sx={{ 
            fontFamily: '"Alkatra", cursive',
            color: getThemeColor('primary'),
            textAlign: 'center',
          }}>
            {calculateAverageScore().toFixed(1)}
            <Typography component="span" variant="h6" color="text.secondary">
              {' '}/ 5.0
            </Typography>
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button 
          onClick={onClose}
          sx={{
            color: theme.palette.text.secondary,
            '&:hover': {
              backgroundColor: alpha(theme.palette.action.hover, 0.1),
            }
          }}
        >
          Cancel
        </Button>
        <Button 
          variant="contained"
          onClick={onSubmit}
          disabled={project?.peerReviewLocked}
          sx={{
            background: `linear-gradient(135deg, ${getThemeColor('primary')}, ${alpha(getThemeColor('primary'), 0.8)})`,
            color: getContrastColor(getThemeColor('primary')),
            boxShadow: `0 4px 15px ${alpha(getThemeColor('primary'), 0.3)}`,
            '&:hover': {
              boxShadow: `0 6px 20px ${alpha(getThemeColor('primary'), 0.4)}`,
            },
            '&.Mui-disabled': {
              background: alpha(theme.palette.action.disabled, 0.5),
              color: theme.palette.text.disabled,
            }
          }}
        >
          Submit Review
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const PeerReviewTab = ({ projectId, members, user, project, showSnackbar }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selectedReviewee, setSelectedReviewee] = useState(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewScores, setReviewScores] = useState({
    contribution: 5,
    collaboration: 5,
    quality: 5,
    punctuality: 5
  });
  const [reviewComment, setReviewComment] = useState('');
  const {
    peerReviews,
    aggregatedScores,
    userPeerScore,
    completionStatus,
    loading,
    error,
    submitReview,
    fetchAllPeerReviewData
  } = usePeerReview();

  useEffect(() => {
    if (projectId) {
      fetchAllPeerReviewData(projectId);
    }
  }, [projectId, fetchAllPeerReviewData]);

  const handleSubmitReview = async () => {
    try {
      const reviewData = {
        projectId,
        revieweeId: selectedReviewee._id,
        scores: reviewScores,
        comment: reviewComment
      };

      await submitReview(reviewData);
      
      // Reset form
      setReviewDialogOpen(false);
      setReviewScores({
        contribution: 5,
        collaboration: 5,
        quality: 5,
        punctuality: 5
      });
      setReviewComment('');
      setSelectedReviewee(null);
      
      showSnackbar('Review submitted successfully!', 'success');
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Failed to submit review', 'error');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 3 }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Typography variant="h5" sx={{ 
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          color: theme.palette.primary.main,
        }}>
          <RateReview /> Peer Reviews
        </Typography>
      </Box>

      {/* Lock Warning */}
      {project?.peerReviewLocked && (
        <Alert 
          severity="warning" 
          sx={{ 
            mb: 3,
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.warning.main, 0.1),
            border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
          }}
        >
          Peer reviews are currently locked. No new reviews can be submitted.
        </Alert>
      )}

      {/* Completion Status */}
      {completionStatus && (
        <CompletionStatusCard       
          completionStatus={completionStatus}
          user={user}
          theme={theme}
          isMobile={isMobile}
        />
      )}

      {/* User's Personal Score */}
      {userPeerScore && (
        <PersonalScoreCard 
          userPeerScore={userPeerScore}
          theme={theme}
          isMobile={isMobile}
        />
      )}

      {/* Team Members Grid */}
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: { xs: 2, sm: 3 },
        '& > *': { 
          flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(33.333% - 16px)' }, 
          minWidth: { xs: 0, sm: 280 },
          maxWidth: '100%'
        }
      }}>
        {members.map((member) => {
          if (!member || !member._id) return null;
          
          const canReview = canReviewMember(member._id, user?._id, peerReviews);
          
          return (
            <MemberCard
              key={member._id}
              member={member}
              memberScore={aggregatedScores?.members?.[member._id]}
              isSelf={member._id === user?._id}
              project={project}
              onReviewClick={() => {
                setSelectedReviewee(member);
                setReviewDialogOpen(true);
              }}
              canReview={canReview}
              theme={theme}
              isMobile={isMobile}
            />
          );
        })}
      </Box>

      {/* Project Summary */}
      {aggregatedScores && (
        <ProjectsSummaryCard 
          aggregatedScores={aggregatedScores}
          project={project}
          theme={theme}
          isMobile={isMobile}
        />
      )}

      {/* Review Dialog */}
      <ReviewDialog
        open={reviewDialogOpen}
        onClose={() => setReviewDialogOpen(false)}
        selectedReviewee={selectedReviewee}
        reviewScores={reviewScores}
        reviewComment={reviewComment}
        onScoresChange={setReviewScores}
        onCommentChange={setReviewComment}
        onSubmit={handleSubmitReview}
        project={project}
        theme={theme}
        isMobile={isMobile}
      />
    </Box>
  );
};

export default PeerReviewTab;
