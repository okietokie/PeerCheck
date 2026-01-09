// pages/NotificationsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Chip,
  Button,
  Divider,
  Tabs,
  Tab,
  CircularProgress,
  alpha,
  useTheme,
  Badge,
  Menu,
  MenuItem,
  Tooltip
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Delete as DeleteIcon,
  MarkChatRead as MarkChatReadIcon,
  FilterList as FilterListIcon,
  PersonAdd as PersonAddIcon,
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon,
  Work as WorkIcon,
  Schedule as ScheduleIcon,
  Comment as CommentIcon,
  AccessTime as AccessTimeIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axiosClient from '@/api/axiosClient';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '@/contexts/NotificationContext';

const NotificationsPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [tabValue, setTabValue] = useState(0);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { markAllAsRead } = useNotifications();

  const filterTypes = [
    { value: 'all', label: 'All Notifications' },
    { value: 'unread', label: 'Unread Only' },
    { value: 'connection_request', label: 'Connection Requests' },
    { value: 'project_invitation', label: 'Project Invitations' },
    { value: 'task_assigned', label: 'Task Assignments' },
    { value: 'deadline_reminder', label: 'Deadline Reminders' },
  ];

  const getNotificationIcon = (type) => {
    const iconMap = {
      'connection_request': <PersonAddIcon sx={{ color: theme.palette.primary.main }} />,
      'connection_accepted': <CheckCircleIcon sx={{ color: theme.palette.success.main }} />,
      'project_invitation': <WorkIcon sx={{ color: theme.palette.warning.main }} />,
      'task_assigned': <AssignmentIcon sx={{ color: theme.palette.info.main }} />,
      'task_completed': <CheckCircleIcon sx={{ color: theme.palette.success.main }} />,
      'deadline_reminder': <ScheduleIcon sx={{ color: theme.palette.error.main }} />,
      'peer_review_request': <CommentIcon sx={{ color: theme.palette.secondary.main }} />,
      'task_comment': <CommentIcon sx={{ color: theme.palette.info.main }} />,
    };
    return iconMap[type] || <NotificationsIcon />;
  };

  const getPriorityColor = (priority) => {
    const colorMap = {
      'low': theme.palette.success.main,
      'medium': theme.palette.info.main,
      'high': theme.palette.warning.main,
      'urgent': theme.palette.error.main,
    };
    return colorMap[priority] || theme.palette.info.main;
  };

  const fetchNotifications = useCallback(async (pageNum = 1, reset = false) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pageNum,
        limit: 20,
        ...(selectedFilter !== 'all' && selectedFilter !== 'unread' && { type: selectedFilter }),
        ...(selectedFilter === 'unread' && { unreadOnly: 'true' }),
      });

      const response = await axiosClient.get(`/user/notifications?${params}`);
      
      if (response.data.success) {
        if (reset) {
          setNotifications(response.data.notifications);
        } else {
          setNotifications(prev => [...prev, ...response.data.notifications]);
        }
        setUnreadCount(response.data.unreadCount);
        setHasMore(response.data.pagination.hasNextPage);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedFilter]);

  useEffect(() => {
    fetchNotifications(1, true);
    setPage(1);
  }, [selectedFilter, fetchNotifications]);

  const markAsRead = async (notificationId) => {
    try {
      await axiosClient.put(`/user/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };



  const deleteNotification = async (notificationId) => {
    try {
      await axiosClient.delete(`/user/notifications/${notificationId}`);
      const notification = notifications.find(n => n._id === notificationId);
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await axiosClient.delete('/user/notifications/clear-all');
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotifications(nextPage);
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }
    
  };

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleFilterSelect = (filter) => {
    setSelectedFilter(filter);
    handleFilterClose();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1, color: theme.palette.text.primary }}>
              Notifications
              {unreadCount > 0 && (
                <Badge
                  badgeContent={unreadCount}
                  color="error"
                  sx={{ ml: 2 }}
                />
              )}
            </Typography>
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
              Stay updated with your recent activities
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh">
              <IconButton onClick={() => fetchNotifications(1, true)}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              startIcon={<FilterListIcon />}
              onClick={handleFilterClick}
              sx={{ textTransform: 'none' }}
            >
              Filter
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="contained"
                startIcon={<MarkChatReadIcon />}
                onClick={markAllAsRead}
                sx={{
                  textTransform: 'none',
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                }}
              >
                Mark All Read
              </Button>
            )}
          </Box>
        </Box>

        <Menu
          anchorEl={filterAnchorEl}
          open={Boolean(filterAnchorEl)}
          onClose={handleFilterClose}
        >
          {filterTypes.map((filter) => (
            <MenuItem
              key={filter.value}
              onClick={() => handleFilterSelect(filter.value)}
              selected={selectedFilter === filter.value}
            >
              {filter.label}
            </MenuItem>
          ))}
        </Menu>

        <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
              }
            }}
          >
            <Tab label={`All (${notifications.length})`} />
            <Tab label={`Unread (${unreadCount})`} />
          </Tabs>
        </Paper>
      </Box>

      <AnimatePresence>
        {loading && notifications.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress size={40} />
          </Box>
        ) : notifications.length === 0 ? (
          <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 3 }}>
            <NotificationsIcon sx={{ fontSize: 60, color: alpha(theme.palette.text.secondary, 0.3), mb: 2 }} />
            <Typography variant="h6" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
              No notifications found
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              {selectedFilter === 'all' 
                ? "You're all caught up! No notifications to show."
                : `No ${selectedFilter.replace('_', ' ')} notifications found.`
              }
            </Typography>
          </Paper>
        ) : (
          <>
            <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <List disablePadding>
                {notifications
                  .filter(notif => tabValue === 0 || !notif.read)
                  .map((notification, index) => (
                    <motion.div
                      key={notification._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ListItem
                        sx={{
                          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                          backgroundColor: notification.read 
                            ? 'transparent' 
                            : alpha(getPriorityColor(notification.priority), 0.05),
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.03),
                          }
                        }}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <ListItemIcon>
                          {getNotificationIcon(notification.type)}
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                              <Typography 
                                variant="subtitle2" 
                                sx={{ 
                                  fontWeight: notification.read ? 500 : 600,
                                  color: theme.palette.text.primary,
                                }}
                              >
                                {notification.title}
                              </Typography>
                              {!notification.read && (
                                <Chip
                                  label="NEW"
                                  size="small"
                                  sx={{ 
                                    height: 18, 
                                    fontSize: '0.6rem', 
                                    fontWeight: 'bold',
                                    backgroundColor: theme.palette.primary.main,
                                    color: 'white'
                                  }}
                                />
                              )}
                              {notification.priority === 'urgent' && (
                                <Chip
                                  label="URGENT"
                                  size="small"
                                  color="error"
                                  sx={{ height: 18, fontSize: '0.6rem', fontWeight: 'bold' }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  color: theme.palette.text.secondary,
                                  mb: 1,
                                }}
                              >
                                {notification.message}
                              </Typography>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    color: alpha(theme.palette.text.secondary, 0.7),
                                  }}
                                >
                                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                  {!notification.read && (
                                    <Button
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        markAsRead(notification._id);
                                      }}
                                      sx={{ textTransform: 'none', fontSize: '0.75rem' }}
                                    >
                                      Mark Read
                                    </Button>
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
                                      }
                                    }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </Box>
                            </>
                          }
                        />
                      </ListItem>
                    </motion.div>
                  ))}
              </List>
            </Paper>

            {hasMore && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Button
                  onClick={handleLoadMore}
                  disabled={loading}
                  variant="outlined"
                  sx={{ textTransform: 'none' }}
                >
                  {loading ? 'Loading...' : 'Load More'}
                </Button>
              </Box>
            )}

            {notifications.length > 0 && (
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={clearAllNotifications}
                  sx={{ textTransform: 'none' }}
                >
                  Clear All Notifications
                </Button>
              </Box>
            )}
          </>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default NotificationsPage;