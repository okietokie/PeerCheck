// src/contexts/NotificationContext.jsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axiosClient from '@/api/axiosClient';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch notifications from backend
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token")
      const response = await axiosClient.get('/user/notifications?limit=10', {
        headers :{
          Authorization: `Bearer ${token}`
        }
      });
      if (response.data.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 19)]);
    if (!notification.read) {
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      // If it's a temporary notification (starts with temp_), just remove it
      if (notificationId.startsWith('temp_')) {
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        setUnreadCount(prev => Math.max(0, prev - 1));
        return;
      }
      const token = localStorage.getItem("token");

      await axiosClient.put(`/user/notifications/${notificationId}/read`,{
        headers :{
          Authorization: `Bearer ${token}`
        }
      });
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      await axiosClient.put('/user/notifications/read-all', {
        headers :{
          Authorization: `Bearer ${token}`
        }
      });
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, []);

  // Delete a notification
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      // If temporary, just remove from state
      if (notificationId.startsWith('temp_')) {
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        return;
      }
      
      const token = localStorage.getItem("token");
      await axiosClient.delete(`/user/notifications/${notificationId}`,{
        headers :{
          Authorization: `Bearer ${token}`
        }
      });
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, []);

  // Poll for new notifications
  useEffect(() => {
    fetchNotifications();
    
    // Poll every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    // Fetch when window gains focus
    const handleFocus = () => fetchNotifications();
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchNotifications]);

  const value = {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    setUnreadCount
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};