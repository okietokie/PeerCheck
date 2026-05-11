// src/components/Notifications/NotificationBell.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Badge,
  IconButton,
  Popover,
  Box,
  Typography,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  CircularProgress,
  alpha,
  useTheme,
  Tooltip
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  MarkChatRead as MarkChatReadIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon,
  Work as WorkIcon,
  Schedule as ScheduleIcon,
  Comment as CommentIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axiosClient from '@/api/axiosClient';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/contexts/NotificationContext';


const NotificationBell = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [polling, setPolling] = useState(true);
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications
  } = useNotifications();

  const getNotificationIcon = (type) => {
    const iconMap = {
      'connection_request': <PersonAddIcon sx={{ color: theme.palette.primary.main }} />,
      'connection_accepted': <CheckCircleIcon sx={{ color: theme.palette.success.main }} />,
      'project_invitation': <WorkIcon sx={{ color: theme.palette.warning.main }} />,
      'team_invitation': <WorkIcon sx={{ color: theme.palette.primary.main }} />,
      'team_invitation_accepted': <CheckCircleIcon sx={{ color: theme.palette.success.main }} />,
      'team_invitation_rejected': <CommentIcon sx={{ color: theme.palette.error.main }} />,
      'team_leadership_transfer': <PersonAddIcon sx={{ color: theme.palette.warning.main }} />,
      'team_leadership_transfer_completed': <CheckCircleIcon sx={{ color: theme.palette.success.main }} />,
      'team_leadership_transfer_rejected': <CommentIcon sx={{ color: theme.palette.error.main }} />,
      'task_assigned': <AssignmentIcon sx={{ color: theme.palette.info.main }} />,
      'task_completed': <CheckCircleIcon sx={{ color: theme.palette.success.main }} />,
      'deadline_reminder': <ScheduleIcon sx={{ color: theme.palette.error.main }} />,
      'peer_review_request': <CommentIcon sx={{ color: theme.palette.secondary.main }} />,
      'task_comment': <CommentIcon sx={{ color: theme.palette.info.main }} />,
      'system_alert': <AccessTimeIcon sx={{ color: theme.palette.warning.main }} />
    };
    return iconMap[type] || <NotificationsIcon />;
  };

  const getNotificationColor = (type) => {
    const colorMap = {
      'connection_request': theme.palette.primary.main,
      'connection_accepted': theme.palette.success.main,
      'project_invitation': theme.palette.warning.main,
      'team_invitation': theme.palette.primary.main,
      'team_invitation_accepted': theme.palette.success.main,
      'team_invitation_rejected': theme.palette.error.main,
      'team_leadership_transfer': theme.palette.warning.main,
      'team_leadership_transfer_completed': theme.palette.success.main,
      'team_leadership_transfer_rejected': theme.palette.error.main,
      'task_assigned': theme.palette.info.main,
      'task_completed': theme.palette.success.main,
      'deadline_reminder': theme.palette.error.main,
      'peer_review_request': theme.palette.secondary.main
    };
    return colorMap[type] || theme.palette.primary.main;
  };



  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }
    
    if (notification) {
      navigate("/user-app/notifications");
    }
    
    setAnchorEl(null);
  };

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    fetchNotifications();
    
    if (polling) {
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [fetchNotifications, polling]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    fetchNotifications();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          onClick={handleClick}
          sx={{
            position: 'relative',
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
            }
          }}
        >
          <Badge
            badgeContent={unreadCount}
            color="error"
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.7rem',
                fontWeight: 'bold',
                minWidth: 20,
                height: 20,
              }
            }}
          >
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 380,
            maxHeight: 500,
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            boxShadow: `0 8px 32px ${alpha(theme.palette.mode === 'dark' ? '#000' : theme.palette.primary.main, 0.1)}`,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              borderRadius: '12px 12px 0 0',
            }
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
              Notifications
              {unreadCount > 0 && (
                <Chip
                  label={`${unreadCount} new`}
                  size="small"
                  color="primary"
                  sx={{ ml: 1, fontWeight: 600 }}
                />
              )}
            </Typography>
            {unreadCount > 0 && (
              <Button
                size="small"
                startIcon={<MarkChatReadIcon />}
                onClick={markAllAsRead}
                sx={{
                  textTransform: 'none',
                  color: theme.palette.primary.main,
                  fontWeight: 500,
                }}
              >
                Mark all read
              </Button>
            )}
          </Box>

          <Divider sx={{ mb: 2 }} />

          <AnimatePresence>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={30} />
              </Box>
            ) : notifications.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <NotificationsIcon sx={{ fontSize: 48, color: alpha(theme.palette.text.secondary, 0.3), mb: 2 }} />
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  No notifications yet
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  You're all caught up!
                </Typography>
              </Box>
            ) : (
              <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                {notifications.map((notification, index) => (
                  <motion.div
                    key={notification._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ListItem
                      sx={{
                        borderRadius: 2,
                        mb: 1,
                        backgroundColor: notification.read 
                          ? 'transparent' 
                          : alpha(getNotificationColor(notification.type), 0.05),
                        border: `1px solid ${alpha(getNotificationColor(notification.type), notification.read ? 0.1 : 0.2)}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: alpha(getNotificationColor(notification.type), 0.1),
                          transform: 'translateX(4px)',
                        }
                      }}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <ListItemIcon>
                        {getNotificationIcon(notification.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: notification.read ? 400 : 600,
                              color: theme.palette.text.primary,
                            }}
                          >
                            {notification.title}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: theme.palette.text.secondary,
                                display: 'block',
                                mb: 0.5,
                              }}
                            >
                              {notification.message}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: alpha(theme.palette.text.secondary, 0.7),
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                              }}
                            >
                              {new Date(notification.createdAt).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                              {notification.priority === 'urgent' && (
                                <Chip
                                  label="URGENT"
                                  size="small"
                                  color="error"
                                  sx={{ height: 16, fontSize: '0.6rem', fontWeight: 'bold' }}
                                />
                              )}
                            </Typography>
                          </>
                        }
                      />
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {!notification.read && (
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              backgroundColor: getNotificationColor(notification.type),
                              boxShadow: `0 0 8px ${alpha(getNotificationColor(notification.type), 0.5)}`,
                            }}
                          />
                        )}
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification._id);
                          }}
                          sx={{
                            color: theme.palette.text.secondary,
                            '&:hover': {
                              color: theme.palette.error.main,
                              backgroundColor: alpha(theme.palette.error.main, 0.1),
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </ListItem>
                  </motion.div>
                ))}
              </List>
            )}
          </AnimatePresence>

          {notifications.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Button
                fullWidth
                onClick={() => navigate('/user-app/notifications')}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  color: theme.palette.primary.main,
                }}
              >
                View All Notifications
              </Button>
            </>
          )}
        </Box>
      </Popover>
    </>
  );
};

export default NotificationBell;
