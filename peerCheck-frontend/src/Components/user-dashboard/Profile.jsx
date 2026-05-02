// src/Components/user-dashboard/Profile.jsx
import axiosClient from '@/api/axiosClient';
import { 
  Box, Avatar, Typography, Card, useTheme, alpha, Button, 
  CircularProgress, Alert, Container, Tabs, Tab, IconButton,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Chip, Divider, Tooltip, Badge, LinearProgress, Stack,
  MenuItem, Select, FormControl, InputLabel, InputAdornment,
  Snackbar, Fade, Slide,
  AlertTitle
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import EditIcon from '@mui/icons-material/Edit';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PeopleIcon from '@mui/icons-material/People';
import EmailIcon from '@mui/icons-material/Email';
import SchoolIcon from '@mui/icons-material/School';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import WorkIcon from '@mui/icons-material/Work';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import LanguageIcon from '@mui/icons-material/Language';
import VerifiedIcon from '@mui/icons-material/Verified';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import CelebrationIcon from '@mui/icons-material/Celebration';
import { useNotifications } from '@/contexts/NotificationContext';
import { HourglassEmpty } from '@mui/icons-material';
import TourGuide from '../TourGuide';


export default function Profile() {

  const theme = useTheme();
  const [user, setUser] = useState({});
  const [peerTeam, setPeerTeam] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const { addNotification } = useNotifications();
  // Snackbar states
  const [snackbars, setSnackbars] = useState({
    profileLoaded: false,
    profileUpdated: false,
    connectionRequestSent: false,
    connectionAccepted: false,
    connectionDeclined: false,
    connectionRemoved: false,
    searchResults: false,
    editProfileOpen: false,
    avatarUploading: false,
    avatarUploaded: false,
    welcomeBack: false
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [refresh, setRefresh] = useState();
  // Edit Profile States
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editUserData, setEditUserData] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axiosClient.get("/user/me", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setUser(res.data);
      
      // Show welcome snackbar on first load
      if (!snackbars.welcomeBack) {
        setTimeout(() => {
          setSnackbars(prev => ({ ...prev, welcomeBack: true }));
        }, 1000);
      }

      // Show profile loaded snackbar
      setSnackbars(prev => ({ ...prev, profileLoaded: true }));

    } catch (error) {
      console.error("Error: ", error);
      setError(`Failed to load user data: ${error}`);
    }
  };

  const fetchPeerTeam = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axiosClient.get("/user/peerteam/", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPeerTeam(res.data.connections || []);
    } catch (error) {
      setError(`Failed to load peer team:  ${error}`);
    }
  };

  const fetchIncomingRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axiosClient.get("/user/peer-requests", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setIncomingRequests(res.data.requests || []);
    } catch (error) {
      console.error(`Error fetching incoming requests:`, error);
      setError(`Failed to load incoming requests: ${error}`);
    }
  };

  const fetchSuggestedUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axiosClient.get("/user/suggested-users", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSuggestedUsers(res.data.users || []);
    } catch (error) {
      console.error(`Error fetching suggested users: ${error}`);
    }
  };

  const sendConnectionRequest = async (userId, userName) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axiosClient.post("/user/send-request", 
        { targetUserId: userId },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setSuggestedUsers(prev => 
        prev.map(user => 
          user._id === userId 
            ? { ...user, connectionStatus: 'requested' }
            : user
        )
      );
      
      setSnackbars(prev => ({ 
        ...prev, 
        connectionRequestSent: true,
        snackbarMessage: `Connection request sent to ${userName || 'user'}!`
      }));
      
      if (addNotification) {
        addNotification({
          _id: `temp_${Date.now()}`,
          type: 'connection_request_sent',
          title: 'Connection Request Sent',
          message: `Your request was sent to ${userName || 'user'}`,
          read: false,
          createdAt: new Date(),
          priority: 'low',
          actionUrl: `/user-app/profile`
        });
      }

    } catch (error) {
      console.error(`Error sending connection request: ${error}`);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to send connection request');
      }
    }
  };

  const acceptRequest = async (connectionId, userName) => {
    try {
      const token = localStorage.getItem("token");
      await axiosClient.put(`/user/accept-request/${connectionId}`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchIncomingRequests();
      fetchPeerTeam();
      fetchSuggestedUsers();
      setSnackbars(prev => ({ 
        ...prev, 
        connectionAccepted: true,
        snackbarMessage: `${userName || 'User'} is now your peer!`
      }));

    if (addNotification) {
      addNotification({
        _id: `temp_${Date.now()}`,
        type: 'connection_accepted',
        title: 'Connection Accepted',
        message: `You accepted ${userName || 'user'}'s request`,
        read: false,
        createdAt: new Date(),
        priority: 'medium',
        actionUrl: `/user-app/profile`
      });
    }

    } catch (error) {
      console.error(`Error accepting request: ${error}`);
      setError('Failed to accept connection request');
    }
  };

  const declineRequest = async (connectionId, userName) => {
    try {
      const token = localStorage.getItem("token");
      await axiosClient.put(`/user/decline-request/${connectionId}`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setIncomingRequests(prev => prev.filter(request => request._id !== connectionId));
      setSnackbars(prev => ({ 
        ...prev, 
        connectionDeclined: true,
        snackbarMessage: `Declined connection from ${userName || 'user'}`
      }));
          if (addNotification) {
      addNotification({
        _id: `temp_${Date.now()}`,
        type: 'connection_declined',
        title: 'Connection Declined',
        message: `You declined ${userName || 'user'}'s request`,
        read: false,
        createdAt: new Date(),
        priority: 'medium'
      });
    }
    } catch (error) {
      console.error(`Error declining request: ${error}`);
      setError('Failed to decline connection request');
    }
  };

  const removeConnection = async (connectionId, userName) => {
    try {
      const token = localStorage.getItem("token");
      await axiosClient.delete(`/user/remove-connection/${connectionId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchPeerTeam();
      fetchSuggestedUsers();
      setSnackbars(prev => ({ 
        ...prev, 
        connectionRemoved: true,
        snackbarMessage: `Removed ${userName || 'user'} from connections`
      }));
          if (addNotification) {
      addNotification({
        _id: `temp_${Date.now()}`,
        type: 'connection_removed',
        title: 'Connection Removed',
        message: `You removed ${userName || 'user'} from connections`,
        read: false,
        createdAt: new Date(),
        priority: 'low'
      });
    }

    } catch (error) {
      console.error(`Error removing connection: ${error}`);
      setError('Failed to remove connection');
    }
  };

  const handleSearchUsers = async (query) => {
  try {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setSearchLoading(true);
    setSearchError('');
    
    const token = localStorage.getItem("token");
    const res = await axiosClient.get(`/user/search-users?q=${encodeURIComponent(query)}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    // Mark connection status for search results
    const resultsWithStatus = await Promise.all(
      res.data.users.map(async (user) => {
        try {
          // Check if an existing connection
          const connectionRes = await axiosClient.get(`/user/user-profile/${user._id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          return {
            ...user,
            connectionStatus: connectionRes.data.user?.connectionStatus || 'none'
          };
        } catch (error) {
          return { ...user, connectionStatus: 'none' };
        }
      })
    );
    
    setSearchResults(resultsWithStatus);
    
    // Show search results snackbar
    if (resultsWithStatus.length > 0) {
      setSnackbars(prev => ({ 
        ...prev, 
        searchResults: true,
        snackbarMessage: `Found ${resultsWithStatus.length} user${resultsWithStatus.length !== 1 ? 's' : ''}`
      }));
    }

  } catch (error) {
    console.error(`Error searching users: ${error}`);
    setSearchError('Failed to search users');
  } finally {
    setSearchLoading(false);
  }
};

useEffect(() => {
  const delayDebounceFn = setTimeout(() => {
    if (searchQuery.trim()) {
      handleSearchUsers(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, 500); // 500ms delay

  return () => clearTimeout(delayDebounceFn);
}, [searchQuery]);
  // Edit Profile Functions
  const handleEditClick = () => {
    setEditUserData({
      name: user.user?.name || '',
      username: user.username || '',
      email: user.user?.email || '',
      bio: user.user?.bio || '',
      institution: user.user?.institution || '',
      course: user.user?.course || '',
      year: user.user?.year || 'Other',
      skills: user.user?.skills?.join(', ') || '',
      avatar: user.user?.avatar || ''
    });
    setAvatarPreview(user.user?.avatar || '');
    setEditDialogOpen(true);
    setSnackbars(prev => ({ ...prev, editProfileOpen: true }));
  };


  const uploadAvatar = async (file) => {
  try {
    setUploadingAvatar(true);
    setSnackbars(prev => ({ ...prev, avatarUploading: true }));
    console.log("avatar change initiated!, ", file);

    const formData = new FormData();
    formData.append("avatar", file);

    for (let [key, value] of formData.entries()) {
      console.log(key, value);
    }

    const token = localStorage.getItem("token");
    const response = await axiosClient.post('/user/upload-avatar', formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    console.log("response.data in upload avatar: ", response?.data);
    setSnackbars(prev => ({ ...prev, avatarUploaded: true }));
    return response.data;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    setError(error.response?.data?.message || 'Failed to upload avatar');
    return null;
  } finally {
    setUploadingAvatar(false);
  }
};

// Optimized handleSaveProfile function
const handleSaveProfile = async () => {
  try {
    console.log("handling save profile!");
    setEditDialogOpen(false);
    
    // Upload avatar if changed
    let avatarUpdatePromise = Promise.resolve(null);
    if (avatarFile) {
      avatarUpdatePromise = uploadAvatar(avatarFile);
    }
    
    // Update profile data
    const profileData = {
      name: editUserData.name,
      username: editUserData.username,
      email: editUserData.email,
      bio: editUserData.bio,
      institution: editUserData.institution,
      course: editUserData.course,
      year: editUserData.year,
      skills: editUserData.skills
    };
    
    const token = localStorage.getItem("token");
    const profileUpdate = axiosClient.put('/user/update-profile', profileData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    
    if (profileUpdate?.success){
      setSnackbars(prev => ({ ...prev, profileUpdated: true }));
      await loadAllData();
    }

    setRefresh(true);
    
  } catch (error) {
    console.error('Error updating profile:', error);
    setError(error.response?.data?.message || 'Failed to update profile');
  }
};

// Add file size validation
const handleAvatarChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
  console.log("filename: ", file);
  // Validate file size (2MB max)
  const maxSize = 2 * 1024 * 1024; // 2MB in bytes
  if (file.size > maxSize) {
    setError('File size too large. Maximum size is 2MB.');
    return;
  }
  
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    setError('Invalid file type. Please upload JPEG, PNG, GIF, or WebP images.');
    return;
  }
  
  setAvatarFile(file);
  const reader = new FileReader();
  reader.onloadend = () => {
    setAvatarPreview(reader.result);
  };
  reader.readAsDataURL(file);
};

// Add a progress indicator component
const AvatarUploadProgress = ({ uploading }) => {
  if (!uploading) return null;
  
  return (
    <Box sx={{ 
      position: 'absolute', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: 'rgba(255, 255, 255, 0.8)',
      borderRadius: '50%',
      zIndex: 1
    }}>
      <CircularProgress size={40} />
    </Box>
  );
};

const handleCloseSnackbar = (snackbar) => {
  setSnackbars(prev => ({ ...prev, [snackbar]: false }));
};

    const loadAllData = async () => {
      await Promise.all([
        fetchUserData(),
        fetchPeerTeam(),
        fetchIncomingRequests(),
        fetchSuggestedUsers()
      ]);
      setLoading(false);
    };


  useEffect(() => {
    loadAllData();
    if (refresh) setRefresh(false);
    
  }, [refresh]);

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        bgcolor: 'background.default'
      }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  const ConnectionButton = ({ user }) => {
    const handleClick = () => {
       console.log("handleclick clicked!");
        sendConnectionRequest(user._id,  user.username || user.name);
    };

    const getButtonProps = (status) => {
      const baseProps = {
        size: "small",
        variant: "outlined",
        sx: { 
          minWidth: 100,
          borderRadius: 6,
          fontWeight: 600,
          borderWidth: 2,
          textTransform: 'none',
          '&:hover': {
            borderWidth: 2,
            transform: 'translateY(-1px)'
          },
          transition: 'all 0.2s ease'
        }
      };

      switch(status) {
        case 'requested':
          return {
            ...baseProps,
            children: 'Requested',
            disabled: true,
            startIcon: <PersonAddIcon />,
            sx: {
              ...baseProps.sx,
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
              bgcolor: alpha(theme.palette.primary.main, 0.08)
            }
          };
        case 'connected':
        case 'accepted':
          return {
            ...baseProps,
            children: 'Peer',
            disabled: true,
            startIcon: <PeopleIcon />,
            sx: {
              ...baseProps.sx,
              borderColor: theme.palette.success.main,
              color: theme.palette.success.main,
              bgcolor: alpha(theme.palette.success.main, 0.08)
            }
          };
        case 'pending':
          return {
            ...baseProps,
            children: 'Pending',
            disabled: true,
            startIcon: <HourglassEmpty />,
            sx: {
              ...baseProps.sx,
              borderColor: theme.palette.warning.main,
              color: theme.palette.warning.main,
              bgcolor: alpha(theme.palette.warning.main, 0.08)
            }
          };
        default:
          return {
            ...baseProps,
            children: 'Connect',
            onClick: () => handleClick(),
            startIcon: <PersonAddIcon />,
            sx: {
              ...baseProps.sx,
              borderColor: alpha(theme.palette.primary.main, 0.3),
              color: theme.palette.primary.main,
              bgcolor: 'transparent',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                borderColor: theme.palette.primary.main
              }
            }
          };
      }
    };

    const buttonProps = getButtonProps(user.connectionStatus);
    return <Button {...buttonProps} />;
  };

  const getDisplayName = (request) => {
    if (request.requester?.name) return request.requester.name;
    if (request.requester?.username) return request.requester.username;
    if (request.fromUser?.name) return request.fromUser.name;
    if (request.fromUser?.username) return request.fromUser.username;
    return "Unknown User";
  };

  const getUserCourse = (request) => {
    if (request.requester?.course) return request.requester.course;
    if (request.fromUser?.course) return request.fromUser.course;
    return "Student";
  };

  const getAvatarInitial = (request) => {
    const name = getDisplayName(request);
    return name[0]?.toUpperCase() || "U";
  };

  const profileCompletion = () => {
    const fields = [
      user.user?.name,
      user.user?.bio,
      user.user?.institution,
      user.user?.course,
      user.user?.year,
      user.user?.skills?.length > 0
    ];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  // Stats for the profile header
  const profileStats = [
    { label: 'Connections', value: peerTeam.length, icon: <PeopleIcon />, color: 'primary' },
    { label: 'Requests', value: incomingRequests.length, icon: <EmailIcon />, color: 'secondary' },
    { label: 'Profile', value: `${profileCompletion()}%`, icon: <CheckCircleIcon />, color: 'success' }
  ];

  return (
    <>
      <Box sx={{ 
        minHeight: '100vh', 
        bgcolor: 'background.default',
        py: 4
      }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
          {/* Success Alert */}
          {success && (
            <Alert 
              severity="success" 
              sx={{ 
                mb: 3, 
                borderRadius: 3,
                boxShadow: theme.shadows[1]
              }} 
              onClose={() => setSuccess('')}
            >
              {success}
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3, 
                borderRadius: 3,
                boxShadow: theme.shadows[1]
              }} 
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          {/* Profile Header Section */}
          <Card  className='profile-header'
          sx={{ 
            borderRadius: 4,
            overflow: 'hidden',
            mb: 4,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.05)}`,
            background: `linear-gradient(135deg, 
              ${alpha(theme.palette.background.paper, 0.9)} 0%, 
              ${alpha(theme.palette.background.paper, 0.95)} 100%)`,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              borderRadius: '4px 4px 0 0',
            }
          }}>
            {/* Cover Photo Area */}
            <Box  sx={{
              height: 160,
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              background: `linear-gradient(135deg, 
                ${alpha(theme.palette.primary.main, 0.15)} 0%, 
                ${alpha(theme.palette.secondary.main, 0.15)} 50%, 
                ${alpha(theme.palette.background.paper, 0.1)} 100%)`,
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '200%',
                height: '200%',
                background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 70%)`,
              }} />
            </Box>
            
            {/* Profile Info Section */}
            <Box sx={{ 
              position: 'relative', 
              px: { xs: 3, sm: 6 }, 
              pb: 4,
              pt: 8 
            }}>
              {/* Avatar with Edit Button */}
              <Box sx={{ 
                position: 'absolute', 
                top: -60, 
                left: { xs: 20, sm: 40 },
                zIndex: 2
              }}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <Tooltip title="Edit Profile">
                      <IconButton
                        onClick={handleEditClick}
                        sx={{
                          bgcolor: theme.palette.primary.main,
                          color: 'white',
                          border: `3px solid ${theme.palette.background.paper}`,
                          '&:hover': {
                            bgcolor: theme.palette.primary.dark,
                            transform: 'scale(1.1)'
                          },
                          transition: 'all 0.2s ease'
                        }}
                        size="small"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  }
                >
                  <Box sx={{ position: 'relative' }}>
                    <Avatar
                      src={user?.user?.avatar ? `${user.user.avatar}?t=${Date.now()}` : null}
                      sx={{
                        width: 120,
                        height: 120,
                        border: `4px solid ${theme.palette.background.paper}`,
                        boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.2)}`,
                        bgcolor: theme.palette.primary.main,
                        fontSize: '3rem',
                        fontWeight: 'bold',
                        '&:hover': {
                          boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.3)}`
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {!user?.user?.avatar ? (user?.user?.name?.[0]?.toUpperCase()) || (user.username?.[0]?.toUpperCase()) || "U" : null}
                    </Avatar>
                    <AvatarUploadProgress uploading={uploadingAvatar} />
                    
                    {/* Online Status Indicator */}
                    <Box sx={{
                      position: 'absolute',
                      bottom: 8,
                      right: 8,
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      bgcolor: user.user?.onlineStatus === 'active' ? '#4caf50' : '#f44336',
                      border: `2px solid ${theme.palette.background.paper}`,
                      boxShadow: `0 0 8px ${alpha(user.user?.onlineStatus === 'active' ? '#4caf50' : '#f44336', 0.5)}`,
                      animation: user.user?.onlineStatus === 'active' ? 'pulse 2s infinite' : 'none',
                      '@keyframes pulse': {
                        '0%': { boxShadow: '0 0 0 0 rgba(76, 175, 80, 0.7)' },
                        '70%': { boxShadow: '0 0 0 6px rgba(76, 175, 80, 0)' },
                        '100%': { boxShadow: '0 0 0 0 rgba(76, 175, 80, 0)' }
                      }
                    }} />
                  </Box>
                </Badge>
              </Box>

              {/* Edit Profile Button */}
              <Box sx={{ 
                position: 'absolute', 
                top: 20, 
                right: 20 
              }}>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={handleEditClick}
                  sx={{
                    borderRadius: 3,
                    px: 3,
                    py: 1.2,
                    fontWeight: 600,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                    '&:hover': {
                      boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  Edit Profile
                </Button>
              </Box>

              {/* Profile Details */}
              <Box sx={{ mt: 2, pl: { xs: 0, sm: 0 } }}>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 1, flexWrap: 'wrap' }}>
                  <Typography variant="h4" sx={{ 
                    fontWeight: 700,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: 'inline-block'
                  }}>
                    {user.user?.name || user.username}
                  </Typography>
                  {user.user?.role && (
                    <Chip
                      icon={<VerifiedIcon fontSize="small" />}
                      label={user.user?.role === 'admin' ? 'Admin' : 'Verified'}
                      size="small"
                      color={user.user?.role === 'admin' ? 'error' : 'success'}
                      sx={{ 
                        fontWeight: 600,
                        boxShadow: theme.shadows[1]
                      }}
                    />
                  )}
                </Box>
                
                <Typography variant="h6" color="text.secondary" sx={{ 
                  mb: 3,
                  fontFamily: '"Inter", sans-serif',
                  fontWeight: 400,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}>
                  <Box component="span" sx={{ 
                    color: theme.palette.primary.main,
                    fontWeight: 600 
                  }}>
                    @{user.username}
                  </Box>
                  {user.user?.email && (
                    <>
                      <Box sx={{ color: alpha(theme.palette.text.secondary, 0.5) }}>•</Box>
                      <Box component="span" sx={{ fontSize: '0.9rem' }}>
                        {user.user.email}
                      </Box>
                    </>
                  )}
                </Typography>

                {user.user?.bio && (
                  <Card sx={{ 
                    mb: 3, 
                    p: 2.5,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.03),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                  }}>
                    <Typography variant="body1" sx={{ 
                      color: 'text.primary',
                      lineHeight: 1.6,
                      fontStyle: 'italic',
                      mb: 0
                    }}>
                      "{user.user.bio}"
                    </Typography>
                  </Card>
                )}

                {/* Profile Stats Cards */}
                <Box 
                sx={{ 
                  display: 'flex', 
                  gap: 2,
                  mb: 3,
                  flexWrap: 'wrap'
                }}>
                  {profileStats.map((stat, index) => (
                    <Card
                      key={index}
                      sx={{
                        flex: 1,
                        minWidth: { xs: '100%', sm: 120 },
                        p: 2,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        bgcolor: alpha(theme.palette[stat.color].main, 0.05),
                        border: `1px solid ${alpha(theme.palette[stat.color].main, 0.1)}`,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 4px 12px ${alpha(theme.palette[stat.color].main, 0.15)}`
                        }
                      }}
                    >
                      <Box sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(theme.palette[stat.color].main, 0.1),
                        color: theme.palette[stat.color].main
                      }}>
                        {stat.icon}
                      </Box>
                      <Box>
                        <Typography variant="h5" sx={{ 
                          fontWeight: 800,
                          color: theme.palette[stat.color].main,
                          lineHeight: 1
                        }}>
                          {stat.value}
                        </Typography>
                        <Typography variant="caption" sx={{ 
                          color: 'text.secondary',
                          fontWeight: 500
                        }}>
                          {stat.label}
                        </Typography>
                      </Box>
                    </Card>
                  ))}
                </Box>

                {/* Education & Skills Section */}
                <Box sx={{ 
                  display: 'flex', 
                  gap: 3, 
                  mb: 3,
                  flexWrap: 'wrap'
                }}>
                  {/* Education Info */}
                  {(user.user?.institution || user.user?.course) && (
                    <Card sx={{ 
                      flex: 1,
                      minWidth: { xs: '100%', sm: 200 },
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.info.main, 0.05),
                      border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`
                    }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ 
                        mb: 1.5,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <SchoolIcon fontSize="small" />
                        EDUCATION
                      </Typography>
                      {user.user?.institution && (
                        <Typography variant="body2" sx={{ 
                          fontWeight: 600,
                          color: 'text.primary',
                          mb: 0.5
                        }}>
                          {user.user.institution}
                        </Typography>
                      )}
                      {user.user?.course && (
                        <Typography variant="body2" color="text.secondary">
                          {user.user.course} {user.user?.year && user.user.year !== 'Other' && `• ${user.user.year}`}
                        </Typography>
                      )}
                    </Card>
                  )}

                  {/* Skills */}
                  {user.user?.skills && user.user.skills.length > 0 && (
                    <Box sx={{ flex: 2, minWidth: { xs: '100%', sm: 300 } }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ 
                        mb: 1,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <WorkIcon fontSize="small" />
                        SKILLS & EXPERTISE
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {user.user.skills.map((skill, index) => (
                          <Chip
                            key={index}
                            label={skill}
                            size="small"
                            sx={{
                              borderRadius: 2,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                              fontWeight: 600,
                              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.15)
                              }
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>

                {/* Profile Completion */}
                <Card className='profile-completion' sx={{ 
                  p: 2, 
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }} >
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      Profile Completion
                    </Typography>
                    <Typography variant="body2" color="primary" sx={{ fontWeight: 700 }}>
                      {profileCompletion()}%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={profileCompletion()} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Complete your profile to unlock all features
                  </Typography>
                </Card>
              </Box>
            </Box>
          </Card>

          {/* Main Content Area */}
          <Box  sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>
            {/* Connections Overview Card */}
            <Card className='network-stats' sx={{ 
              width: { xs: '100%', lg: 300 }, 
              flexShrink: 0,
              borderRadius: 3,
              p: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.03)}`,
              height: 'fit-content'
            }}>
              <Typography variant="h6" sx={{ 
                mb: 3, 
                fontWeight: 700,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Network Overview
              </Typography>
              
              <Stack spacing={2}>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateX(4px)',
                    bgcolor: alpha(theme.palette.primary.main, 0.08)
                  }
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      Total Connections
                    </Typography>
                    <Badge 
                      badgeContent={peerTeam.length} 
                      color="primary"
                      sx={{
                        '& .MuiBadge-badge': {
                          bgcolor: theme.palette.primary.main,
                          fontWeight: 700
                        }
                      }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Active peers in your network
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.secondary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateX(4px)',
                    bgcolor: alpha(theme.palette.secondary.main, 0.08)
                  }
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      Pending Requests
                    </Typography>
                    <Badge 
                      badgeContent={incomingRequests.length} 
                      color="secondary"
                      sx={{
                        '& .MuiBadge-badge': {
                          bgcolor: theme.palette.secondary.main,
                          fontWeight: 700
                        }
                      }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Waiting for your response
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.info.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateX(4px)',
                    bgcolor: alpha(theme.palette.info.main, 0.08)
                  }
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                      Suggested Peers
                    </Typography>
                    <Badge 
                      badgeContent={suggestedUsers.length} 
                      color="info"
                      sx={{
                        '& .MuiBadge-badge': {
                          bgcolor: theme.palette.info.main,
                          fontWeight: 700
                        }
                      }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Users you might know
                  </Typography>
                </Box>
              </Stack>
              
              <Divider sx={{ my: 3, borderColor: alpha(theme.palette.divider, 0.1) }} />
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ 
                  mb: 1.5,
                  fontWeight: 600
                }}>
                  QUICK STATS
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  mb: 1
                }}>
                  <Typography variant="body2" color="text.secondary">
                    Profile Strength
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                    {profileCompletion()}%
                  </Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  mb: 1
                }}>
                  <Typography variant="body2" color="text.secondary">
                    Response Rate
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.info.main }}>
                    85%
                  </Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between'
                }}>
                  <Typography variant="body2" color="text.secondary">
                    Network Growth
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                    +12%
                  </Typography>
                </Box>
              </Box>
            </Card>

            {/* Right Column - Main Content */}
            <Box sx={{ flex: 1 }}>
              {/* Navigation Tabs Card */}
              <Card sx={{ 
                borderRadius: 3, 
                mb: 4,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.03)}`,
                overflow: 'hidden'
              }}>
                {/* Tab Navigation */}
                <Box 
                 sx={{ 
                  display: 'flex', 
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`
                }}
                >
                  <Button
                    fullWidth
                    variant={activeTab === 0 ? "contained" : "text"}
                    className='find-peers-tab'
                    onClick={() => {
                      setActiveTab(0);
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                    sx={{
                      py: 2.5,
                      borderRadius: 0,
                      fontWeight: 700,
                      fontSize: '1rem',
                      textTransform: 'none',
                      borderTopLeftRadius: 12,
                      background: activeTab === 0 ? 
                        `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)` : 
                        'transparent',
                      color: activeTab === 0 ? 'white' : 'text.primary',
                      '&:hover': {
                        bgcolor: activeTab === 0 ? 'primary.dark' : alpha(theme.palette.primary.main, 0.08)
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SearchIcon fontSize="small" />
                      Find Peers
                      {suggestedUsers.length > 0 && (
                        <Badge 
                          badgeContent={suggestedUsers.length} 
                          color="primary"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                  </Button>
                  
                  <Button
                                  className='connection-requests-tab'

                    fullWidth
                    variant={activeTab === 1 ? "contained" : "text"}
                    onClick={() => setActiveTab(1)}
                    sx={{
                      py: 2.5,
                      borderRadius: 0,
                      fontWeight: 700,
                      fontSize: '1rem',
                      textTransform: 'none',
                      borderTopRightRadius: 12,
                      background: activeTab === 1 ? 
                        `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)` : 
                        'transparent',
                      color: activeTab === 1 ? 'white' : 'text.primary',
                      '&:hover': {
                        bgcolor: activeTab === 1 ? 'primary.dark' : alpha(theme.palette.primary.main, 0.08)
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }} >
                      <NotificationsIcon fontSize="small" />
                      Connection Requests
                      {incomingRequests.length > 0 && (
                        <Badge 
                          badgeContent={incomingRequests.length} 
                          color="secondary"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                  </Button>
                </Box>

                {/* Tab Content */}
                <Box sx={{ p: 3 }}>
                {activeTab === 0 ? (
                  /* FIND PEERS TAB */
                  <>
                    <Typography variant="h6" sx={{ 
                      mb: 3, 
                      fontWeight: 700,
                      fontFamily: '"Alkatra", cursive'
                    }}>
                      Connect with Peers
                    </Typography>
                    
                    {/* Search Bar */}
                    <Card sx={{ 
                      mb: 4, 
                      p: 2.5, 
                      borderRadius: 3,
                      border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                      bgcolor: alpha(theme.palette.primary.main, 0.03),
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: alpha(theme.palette.primary.main, 0.3),
                        boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.1)}`
                      }
                    }}>
                      <Typography variant="subtitle2" sx={{ 
                        mb: 1.5, 
                        fontWeight: 600,
                        color: theme.palette.primary.main,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <SearchIcon fontSize="small" />
                        SEARCH USERS
                      </Typography>
                      <TextField
                        fullWidth
                        placeholder="Search by name, username, institution, or skills..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        variant="outlined"
                        size="medium"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon color="primary" />
                            </InputAdornment>
                          ),
                          endAdornment: searchLoading ? (
                            <InputAdornment position="end">
                              <CircularProgress size={20} color="primary" />
                            </InputAdornment>
                          ) : null,
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: 'background.paper',
                            '&:hover': {
                              '& fieldset': {
                                borderColor: alpha(theme.palette.primary.main, 0.5),
                              }
                            }
                          }
                        }}
                      />
                      {searchError && (
                        <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
                          {searchError}
                        </Alert>
                      )}
                    </Card>
                    
                    {/* Search Results or Suggested Users */}
                    {searchQuery.trim() ? (
                      <>
                        <Typography variant="h6" sx={{ 
                          mb: 3, 
                          fontWeight: 700,
                          color: 'text.primary',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          Search Results
                          <Chip 
                            label={searchResults.length} 
                            size="small" 
                            color="primary"
                            sx={{ fontWeight: 700 }}
                          />
                        </Typography>
                        
                        {searchResults.length === 0 ? (
                          <Card sx={{ 
                            textAlign: 'center', 
                            py: 8,
                            bgcolor: alpha(theme.palette.primary.main, 0.02),
                            borderRadius: 3,
                            border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}`
                          }}>
                            <SearchIcon sx={{ 
                              fontSize: 60, 
                              color: alpha(theme.palette.primary.main, 0.3),
                              mb: 2
                            }} />
                            <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                              No results found
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              No users found for "{searchQuery}"
                            </Typography>
                            <Button 
                              variant="outlined" 
                              sx={{ mt: 2, borderRadius: 2 }}
                              onClick={() => setSearchQuery('')}
                            >
                              Clear Search
                            </Button>
                          </Card>
                        ) : (
                          <Box sx={{ 
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                            gap: 2.5
                          }}>
                            {searchResults.map((user) => (
                              <Card
                                key={user._id}
                                sx={{
                                  p: 3,
                                  display: "flex",
                                  flexDirection: "column",
                                  borderRadius: 3,
                                  bgcolor: 'background.paper',
                                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                  position: 'relative',
                                  overflow: 'hidden',
                                  '&:hover': {
                                    transform: 'translateY(-6px)',
                                    boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.15)}`,
                                    borderColor: alpha(theme.palette.primary.main, 0.3),
                                    '&::before': {
                                      transform: 'scaleX(1)',
                                    }
                                  },
                                  '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: 4,
                                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    transform: 'scaleX(0)',
                                    transformOrigin: 'left',
                                    transition: 'transform 0.3s ease',
                                  }
                                }}
                              >
                                <Box sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: 2, 
                                  mb: 2.5,
                                  position: 'relative',
                                  zIndex: 1
                                }}>
                                  <Avatar
                                    src={user?.user?.avatar ? `${user.user.avatar}?t=${Date.now()}` : null}
                                    sx={{
                                      bgcolor: 'primary.main',
                                      width: 64,
                                      height: 64,
                                      fontSize: '1.5rem',
                                      fontWeight: 'bold',
                                      border: `3px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
                                    }}
                                  >
                                    {user.name?.[0] || user.username?.[0] || "U"}
                                  </Avatar>
                                  
                                  <Box sx={{ flex: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                      <Typography sx={{ 
                                        fontWeight: 700, 
                                        fontSize: '1.1rem', 
                                        color: 'text.primary',
                                        lineHeight: 1.2
                                      }}>
                                        {user.name || user.username}
                                      </Typography>
                                      {user.role === 'admin' && (
                                        <VerifiedIcon 
                                          fontSize="small" 
                                          sx={{ 
                                            color: theme.palette.primary.main,
                                            filter: `drop-shadow(0 0 4px ${alpha(theme.palette.primary.main, 0.4)})`
                                          }} 
                                        />
                                      )}
                                    </Box>
                                    
                                    <Typography variant="body2" sx={{ 
                                      color: 'text.secondary',
                                      mb: 0.5,
                                      fontFamily: '"Inter", sans-serif'
                                    }}>
                                      @{user.username}
                                    </Typography>
                                    
                                    {user.course && (
                                      <Typography variant="caption" sx={{ 
                                        color: 'text.secondary',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5
                                      }}>
                                        <SchoolIcon fontSize="small" />
                                        {user.course}
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>

                                {user.bio && (
                                  <Typography variant="body2" sx={{ 
                                    color: 'text.secondary',
                                    fontStyle: 'italic',
                                    lineHeight: 1.5,
                                    mb: 2.5,
                                    flex: 1,
                                    fontFamily: '"Inter", sans-serif',
                                    position: 'relative',
                                    zIndex: 1,
                                    '&::before': {
                                      content: '"\\201C"',
                                      fontSize: '2rem',
                                      color: alpha(theme.palette.primary.main, 0.3),
                                      position: 'absolute',
                                      top: -10,
                                      left: -5,
                                    }
                                  }}>
                                    {user.bio.length > 120 ? `${user.bio.substring(0, 120)}...` : user.bio}
                                  </Typography>
                                )}
                                
                                {user.skills && user.skills.length > 0 && (
                                  <Box sx={{ 
                                    mb: 2.5,
                                    position: 'relative',
                                    zIndex: 1
                                  }}>
                                    <Typography variant="caption" sx={{ 
                                      color: 'text.secondary',
                                      fontWeight: 600,
                                      mb: 1,
                                      display: 'block'
                                    }}>
                                      Skills:
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                      {user.skills.slice(0, 3).map((skill, index) => (
                                        <Chip
                                          key={index}
                                          label={skill}
                                          size="small"
                                          sx={{
                                            height: 24,
                                            fontSize: '0.75rem',
                                            bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                            color: theme.palette.secondary.main,
                                            border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                                            fontWeight: 500
                                          }}
                                        />
                                      ))}
                                      {user.skills.length > 3 && (
                                        <Chip
                                          label={`+${user.skills.length - 3}`}
                                          size="small"
                                          sx={{
                                            height: 24,
                                            fontSize: '0.75rem',
                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                            color: theme.palette.primary.main,
                                            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                            fontWeight: 500
                                          }}
                                        />
                                      )}
                                    </Box>
                                  </Box>
                                )}

                                <Box sx={{ 
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  position: 'relative',
                                  zIndex: 1,
                                  mt: 'auto'
                                }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {user.institution && (
                                      <Typography variant="caption" sx={{ 
                                        color: 'text.secondary',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5
                                      }}>
                                        <SchoolIcon fontSize="small" />
                                        {user.institution}
                                      </Typography>
                                    )}
                                  </Box>
                                  
                                  <ConnectionButton user={user} />
                                </Box>
                              </Card>
                            ))}
                          </Box>
                        )}
                      </>
                    ) : (
                      <>
                        <Typography variant="h6" sx={{ 
                          mb: 3, 
                          fontWeight: 700,
                          color: 'text.primary',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          Suggested Peers
                          <Chip 
                            label={suggestedUsers.length} 
                            size="small" 
                            color="primary"
                            sx={{ fontWeight: 700 }}
                          />
                        </Typography>
                        
                        {suggestedUsers.length === 0 ? (
                          <Card sx={{ 
                            textAlign: 'center', 
                            py: 8,
                            bgcolor: alpha(theme.palette.primary.main, 0.02),
                            borderRadius: 3,
                            border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}`
                          }}>
                            <PeopleIcon sx={{ 
                              fontSize: 60, 
                              color: alpha(theme.palette.primary.main, 0.3),
                              mb: 2
                            }} />

                            <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                              No suggested peers yet
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              Start by searching for users or check back later!
                            </Typography>
                            <Button 
                              variant="contained" 
                              sx={{ 
                                borderRadius: 2,
                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
                              }}
                              onClick={() => {
                                setSearchQuery(user.user?.institution || '');
                                setSnackbars(prev => ({ ...prev, searchResults: true }));
                              }}
                            >
                              Search by Institution
                            </Button>
                          </Card>
                        ) : (
                          <Box sx={{ 
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                            gap: 2.5
                          }}>
                            {suggestedUsers.map((user) => (
                              <Card
                                key={user._id}
                                sx={{
                                  p: 3,
                                  display: "flex",
                                  flexDirection: "column",
                                  borderRadius: 3,
                                  bgcolor: 'background.paper',
                                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                  position: 'relative',
                                  overflow: 'hidden',
                                  '&:hover': {
                                    transform: 'translateY(-6px)',
                                    boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.15)}`,
                                    borderColor: alpha(theme.palette.primary.main, 0.3),
                                    '&::before': {
                                      transform: 'scaleX(1)',
                                    }
                                  },
                                  '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    height: 4,
                                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    transform: 'scaleX(0)',
                                    transformOrigin: 'left',
                                    transition: 'transform 0.3s ease',
                                  }
                                }}
                              >
                                <Box sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: 2, 
                                  mb: 2.5,
                                  position: 'relative',
                                  zIndex: 1
                                }}>
                                  <Avatar
                                    src={user?.user?.avatar ? `${user.user.avatar}?t=${Date.now()}` : null}
                                    sx={{
                                      bgcolor: 'primary.main',
                                      width: 64,
                                      height: 64,
                                      fontSize: '1.5rem',
                                      fontWeight: 'bold',
                                      border: `3px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
                                    }}
                                  >
                                    {user.name?.[0] || user.username?.[0] || "U"}
                                  </Avatar>
                                  
                                  <Box sx={{ flex: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                      <Typography sx={{ 
                                        fontWeight: 700, 
                                        fontSize: '1.1rem', 
                                        color: 'text.primary',
                                        lineHeight: 1.2
                                      }}>
                                        {user.name || user.username}
                                      </Typography>
                                      {user.role === 'admin' && (
                                        <VerifiedIcon 
                                          fontSize="small" 
                                          sx={{ 
                                            color: theme.palette.primary.main,
                                            filter: `drop-shadow(0 0 4px ${alpha(theme.palette.primary.main, 0.4)})`
                                          }} 
                                        />
                                      )}
                                    </Box>
                                    
                                    <Typography variant="body2" sx={{ 
                                      color: 'text.secondary',
                                      mb: 0.5,
                                      fontFamily: '"Inter", sans-serif'
                                    }}>
                                      @{user.username}
                                    </Typography>
                                    
                                    {user.course && (
                                      <Typography variant="caption" sx={{ 
                                        color: 'text.secondary',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5
                                      }}>
                                        <SchoolIcon fontSize="small" />
                                        {user.course}
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>

                                {user.bio && (
                                  <Typography variant="body2" sx={{ 
                                    color: 'text.secondary',
                                    fontStyle: 'italic',
                                    lineHeight: 1.5,
                                    mb: 2.5,
                                    flex: 1,
                                    fontFamily: '"Inter", sans-serif',
                                    position: 'relative',
                                    zIndex: 1,
                                    '&::before': {
                                      content: '"\\201C"',
                                      fontSize: '2rem',
                                      color: alpha(theme.palette.primary.main, 0.3),
                                      position: 'absolute',
                                      top: -10,
                                      left: -5,
                                    }
                                  }}>
                                    {user.bio.length > 120 ? `${user.bio.substring(0, 120)}...` : user.bio}
                                  </Typography>
                                )}
                                
                                {user.skills && user.skills.length > 0 && (
                                  <Box sx={{ 
                                    mb: 2.5,
                                    position: 'relative',
                                    zIndex: 1
                                  }}>
                                    <Typography variant="caption" sx={{ 
                                      color: 'text.secondary',
                                      fontWeight: 600,
                                      mb: 1,
                                      display: 'block'
                                    }}>
                                      Skills:
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                      {user.skills.slice(0, 3).map((skill, index) => (
                                        <Chip
                                          key={index}
                                          label={skill}
                                          size="small"
                                          sx={{
                                            height: 24,
                                            fontSize: '0.75rem',
                                            bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                            color: theme.palette.secondary.main,
                                            border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                                            fontWeight: 500
                                          }}
                                        />
                                      ))}
                                      {user.skills.length > 3 && (
                                        <Chip
                                          label={`+${user.skills.length - 3}`}
                                          size="small"
                                          sx={{
                                            height: 24,
                                            fontSize: '0.75rem',
                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                            color: theme.palette.primary.main,
                                            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                            fontWeight: 500
                                          }}
                                        />
                                      )}
                                    </Box>
                                  </Box>
                                )}

                                <Box sx={{ 
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  position: 'relative',
                                  zIndex: 1,
                                  mt: 'auto'
                                }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {user.institution && (
                                      <Typography variant="caption" sx={{ 
                                        color: 'text.secondary',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5
                                      }}>
                                        <SchoolIcon fontSize="small" />
                                        {user.institution}
                                      </Typography>
                                    )}
                                    {user.year && user.year !== 'Other' && (
                                      <Typography variant="caption" sx={{ 
                                        color: 'text.secondary',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5
                                      }}>
                                        <CalendarTodayIcon fontSize="small" />
                                        {user.year}
                                      </Typography>
                                    )}
                                  </Box>
                                  
                                  <ConnectionButton user={user} />
                                </Box>
                              </Card>
                            ))}
                          </Box>
                        )}
                      </>
                    )}
                  </>
                ) : (
                    /* REQUESTS TAB */
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>
                      {/* Incoming Requests */}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ 
                          mb: 3, 
                          fontWeight: 700,
                          fontFamily: '"Alkatra", cursive',
                          color: 'text.primary'
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <NotificationsIcon />
                            Connection Requests
                            <Chip 
                              label={incomingRequests.length} 
                              color="secondary"
                              sx={{ fontWeight: 700 }}
                            />
                          </Box>
                        </Typography>
                        
                        {incomingRequests.length === 0 ? (
                          <Card sx={{ 
                            p: 6, 
                            textAlign: 'center',
                            bgcolor: alpha(theme.palette.info.main, 0.02),
                            border: `2px dashed ${alpha(theme.palette.info.main, 0.2)}`,
                            borderRadius: 3
                          }}>
                            <NotificationsIcon sx={{ 
                              fontSize: 60, 
                              color: alpha(theme.palette.info.main, 0.3),
                              mb: 2
                            }} />
                            <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                              No pending requests
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              All caught up! Check back later for new connection requests.
                            </Typography>
                          </Card>
                        ) : (
                          <Box sx={{ 
                            display: 'grid',
                            gap: 2.5
                          }}> 
                            {incomingRequests.map((request) => (
                              <Card
                                key={request._id}
                                sx={{
                                  p: 3,
                                  borderRadius: 3,
                                  bgcolor: alpha(theme.palette.info.main, 0.02),
                                  border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: `0 8px 24px ${alpha(theme.palette.info.main, 0.1)}`,
                                    borderColor: alpha(theme.palette.info.main, 0.2)
                                  }
                                }}
                              >
                                <Box sx={{ 
                                  display: 'flex', 
                                  alignItems: 'flex-start',
                                  gap: 2,
                                  mb: 2.5
                                }}>
                                  <Avatar
                                    src={request?.requester?.avatar ? `${request.requester.avatar}?t=${Date.now()}` : null}
                                    sx={{
                                      bgcolor: 'info.main',
                                      width: 56,
                                      height: 56,
                                      border: `2px solid ${theme.palette.background.paper}`,
                                      boxShadow: `0 4px 8px ${alpha(theme.palette.info.main, 0.2)}`
                                    }}
                                  >
                                    {getAvatarInitial(request)}
                                  </Avatar>
                                  <Box sx={{ flex: 1 }}>
                                    <Typography sx={{ 
                                      fontWeight: 700, 
                                      fontSize: '1.1rem',
                                      mb: 0.5,
                                      color: 'text.primary'
                                    }}>
                                      {getDisplayName(request)}
                                    </Typography>
                                    <Typography variant="body2" sx={{ 
                                      color: 'text.secondary',
                                      mb: 1.5,
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 0.5
                                    }}>
                                      <SchoolIcon fontSize="small" />
                                      {getUserCourse(request)}
                                    </Typography>
                                    {request.createdAt && (
                                      <Typography variant="caption" sx={{ 
                                        color: 'text.secondary',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5
                                      }}>
                                        <CalendarTodayIcon fontSize="small" />
                                        {new Date(request.createdAt).toLocaleDateString()}
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>

                                <Box sx={{ 
                                  display: 'flex', 
                                  gap: 1.5,
                                  '& .MuiButton-root': {
                                    flex: 1,
                                    borderRadius: 2,
                                    fontWeight: 600,
                                    py: 1.2
                                  }
                                }}>
                                  <Button
                                    variant="contained"
                                    color="success"
                                    startIcon={<CheckIcon />}
                                    onClick={() => acceptRequest(request._id, getDisplayName(request))}
                                    sx={{
                                      background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, #66bb6a 100%)`,
                                      '&:hover': {
                                        boxShadow: `0 4px 12px ${alpha(theme.palette.success.main, 0.4)}`
                                      }
                                    }}
                                  >
                                    Accept
                                  </Button>
                                  <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<CloseIcon />}
                                    onClick={() => declineRequest(request._id, getDisplayName(request))}
                                    sx={{
                                      borderWidth: 2,
                                      '&:hover': {
                                        borderWidth: 2,
                                        bgcolor: alpha(theme.palette.error.main, 0.05)
                                      }
                                    }}
                                  >
                                    Decline
                                  </Button>
                                </Box>
                              </Card>
                            ))}
                          </Box>
                        )}
                      </Box>

                      {/* Current Connections */}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ 
                          mb: 3, 
                          fontWeight: 700,
                          fontFamily: '"Alkatra", cursive',
                          color: 'text.primary'
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <PeopleIcon />
                            Peer Connections
                            <Chip 
                              label={peerTeam.length} 
                              color="success"
                              sx={{ fontWeight: 700 }}
                            />
                          </Box>
                        </Typography>
                        
                        {peerTeam.length === 0 ? (
                          <Card sx={{ 
                            p: 6, 
                            textAlign: 'center',
                            bgcolor: alpha(theme.palette.success.main, 0.02),
                            border: `2px dashed ${alpha(theme.palette.success.main, 0.2)}`,
                            borderRadius: 3
                          }}>
                            <PeopleIcon sx={{ 
                              fontSize: 60, 
                              color: alpha(theme.palette.success.main, 0.3),
                              mb: 2
                            }} />
                            <Typography variant="h6" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                              No connections yet
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                              Connect with peers to build your network and collaborate!
                            </Typography>
                            <Button 
                              variant="contained" 
                              sx={{ 
                                borderRadius: 2,
                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`
                              }}
                              onClick={() => setActiveTab(0)}
                            >
                              Find Peers
                            </Button>
                          </Card>
                        ) : (
                          <Box sx={{ 
                            display: 'grid',
                            gap: 2.5
                          }}>
                            {peerTeam.map((connection) => (
                              <Card
                                key={connection._id}
                                sx={{
                                  p: 3,
                                  borderRadius: 3,
                                  bgcolor: alpha(theme.palette.success.main, 0.02),
                                  border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: `0 8px 24px ${alpha(theme.palette.success.main, 0.1)}`,
                                    borderColor: alpha(theme.palette.success.main, 0.2)
                                  }
                                }}
                              >
                                <Box sx={{ 
                                  display: 'flex', 
                                  alignItems: 'flex-start',
                                  gap: 2,
                                  mb: 2.5
                                }}>
                                  <Avatar
                                    src={connection?.user?.avatar ? `${connection.user.avatar}?t=${Date.now()}` : null}
                                    sx={{
                                      bgcolor: 'success.main',
                                      width: 56,
                                      height: 56,
                                      border: `2px solid ${theme.palette.background.paper}`,
                                      boxShadow: `0 4px 8px ${alpha(theme.palette.success.main, 0.2)}`
                                    }}
                                  >
                                    {connection.user?.name?.[0] || "U"}
                                  </Avatar>
                                  <Box sx={{ flex: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                      <Typography sx={{ 
                                        fontWeight: 700, 
                                        fontSize: '1.1rem',
                                        color: 'text.primary'
                                      }}>
                                        {connection.user?.name || "Unknown User"}
                                      </Typography>
                                      {connection.user?.role === 'admin' && (
                                        <VerifiedIcon 
                                          fontSize="small" 
                                          sx={{ color: theme.palette.primary.main }} 
                                        />
                                      )}
                                    </Box>
                                    <Typography variant="body2" sx={{ 
                                      color: 'text.secondary',
                                      mb: 1,
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 0.5
                                    }}>
                                      <SchoolIcon fontSize="small" />
                                      {connection.user?.course || "Student"}
                                    </Typography>
                                    {connection.createdAt && (
                                      <Typography variant="caption" sx={{ 
                                        color: 'text.secondary',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5
                                      }}>
                                        <CalendarTodayIcon fontSize="small" />
                                        Connected {new Date(connection.createdAt).toLocaleDateString()}
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>

                                <Button
                                  variant="outlined"
                                  color="error"
                                  startIcon={<PersonRemoveIcon />}
                                  onClick={() => removeConnection(connection._id, connection.user?.name)}
                                  fullWidth
                                  sx={{
                                    borderRadius: 2,
                                    fontWeight: 600,
                                    py: 1.2,
                                    borderWidth: 2,
                                    '&:hover': {
                                      borderWidth: 2,
                                      bgcolor: alpha(theme.palette.error.main, 0.05)
                                    }
                                  }}
                                >
                                  Remove Connection
                                </Button>
                              </Card>
                            ))}
                          </Box>
                        )}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Card>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Edit Profile Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main',
          color: 'white',
          fontWeight: 700,
          fontSize: '1.5rem',
          py: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5
        }}>
          <EditIcon />
          Edit Profile
        </DialogTitle>
        
        <DialogContent sx={{ pt: 4, pb: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            mb: 4
          }}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="avatar-upload"
              type="file"
              onChange={(e) => handleAvatarChange(e)}
            />
            <Box sx={{ position: 'relative' }}>
              <label htmlFor="avatar-upload">
                <Avatar
                  src={avatarPreview}
                  sx={{
                    width: 120,
                    height: 120,
                    cursor: 'pointer',
                    border: `3px solid ${theme.palette.primary.main}`,
                    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.3)}`,
                    mb: 2,
                    '&:hover': {
                      opacity: 0.9,
                      transform: 'scale(1.05)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  {!avatarPreview && (editUserData.name?.[0] || editUserData.username?.[0] || "U")}
                </Avatar>
              </label>
              {uploadingAvatar && (
                <Box sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '50%'
                }}>
                  <CircularProgress />
                </Box>
              )}
            </Box>
            <Button
              component="label"
              startIcon={<AddPhotoAlternateIcon />}
              variant="outlined"
              size="small"
              htmlFor="avatar-upload"
              sx={{ borderRadius: 2 }}
            >
              Change Avatar
            </Button>
          </Box>

          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
            gap: 2.5
          }}>
            <TextField
              label="Full Name"
              fullWidth
              value={editUserData.name || ''}
              onChange={(e) => setEditUserData({...editUserData, name: e.target.value})}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
            
            <TextField
              label="Username"
              fullWidth
              value={editUserData.username || ''}
              onChange={(e) => setEditUserData({...editUserData, username: e.target.value})}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    @
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              label="Email"
              fullWidth
              type="email"
              value={editUserData.email || ''}
              onChange={(e) => setEditUserData({...editUserData, email: e.target.value})}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
            />
            
            <FormControl fullWidth sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}>
              <InputLabel>Year</InputLabel>
              <Select
                value={editUserData.year || 'Other'}
                label="Year"
                onChange={(e) => setEditUserData({...editUserData, year: e.target.value})}
              >
                <MenuItem value="1st">1st Year</MenuItem>
                <MenuItem value="2nd">2nd Year</MenuItem>
                <MenuItem value="3rd">3rd Year</MenuItem>
                <MenuItem value="4th">4th Year</MenuItem>
                <MenuItem value="Graduate">Graduate</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Institution"
              fullWidth
              value={editUserData.institution || ''}
              onChange={(e) => setEditUserData({...editUserData, institution: e.target.value})}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SchoolIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              label="Course"
              fullWidth
              value={editUserData.course || ''}
              onChange={(e) => setEditUserData({...editUserData, course: e.target.value})}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <WorkIcon fontSize="small" color="action" />
                  </InputAdornment>
                ),
              }}
            />
            
            <TextField
              label="Skills (comma separated)"
              fullWidth
              value={editUserData.skills || ''}
              onChange={(e) => setEditUserData({...editUserData, skills: e.target.value})}
              sx={{ 
                gridColumn: { xs: 'span 1', sm: 'span 2' },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
              placeholder="e.g., JavaScript, React, Node.js, UI/UX"
              helperText="Separate skills with commas"
            />
            
            <TextField
              label="Bio"
              fullWidth
              multiline
              rows={4}
              value={editUserData.bio || ''}
              onChange={(e) => setEditUserData({...editUserData, bio: e.target.value})}
              sx={{ 
                gridColumn: { xs: 'span 1', sm: 'span 2' },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                }
              }}
              placeholder="Tell us about yourself, your interests, and what you're working on..."
            />
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            startIcon={<CancelIcon />}
            onClick={() => setEditDialogOpen(false)}
            sx={{ 
              borderRadius: 2,
              px: 3,
              fontWeight: 600
            }}
          >
            Cancel
          </Button>
          <Button
            startIcon={<SaveIcon />}
            variant="contained"
            onClick={handleSaveProfile}
            disabled={uploadingAvatar}
            sx={{ 
              borderRadius: 2,
              px: 4,
              fontWeight: 600,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              '&:hover': {
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`
              }
            }}
          >
            {uploadingAvatar ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbars */}
      <Snackbar
        open={snackbars.welcomeBack}
        autoHideDuration={4000}
        onClose={() => handleCloseSnackbar('welcomeBack')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        TransitionComponent={Slide}
      >
        <Alert
          severity="info"
          variant="filled"
          onClose={() => handleCloseSnackbar('welcomeBack')}
          icon={<CelebrationIcon />}
          sx={{ 
            width: '100%',
            backdropFilter: 'blur(10px)',
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.9)} 0%, ${alpha(theme.palette.secondary.main, 0.9)} 100%)`,
          }}
        >
          <AlertTitle>Welcome back, {user.user?.name || user.username}!</AlertTitle>
          Your profile has been loaded successfully.
        </Alert>
      </Snackbar>

      <Snackbar
        open={snackbars.profileLoaded}
        autoHideDuration={3000}
        onClose={() => handleCloseSnackbar('profileLoaded')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => handleCloseSnackbar('profileLoaded')}
          icon={<CheckCircleIcon />}
        >
          Profile data loaded successfully!
        </Alert>
      </Snackbar>

      <Snackbar
        open={snackbars.profileUpdated}
        autoHideDuration={3000}
        onClose={() => handleCloseSnackbar('profileUpdated')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => handleCloseSnackbar('profileUpdated')}
          icon={<CheckCircleIcon />}
        >
          Profile updated successfully!
        </Alert>
      </Snackbar>

      <Snackbar
        open={snackbars.connectionRequestSent}
        autoHideDuration={3000}
        onClose={() => handleCloseSnackbar('connectionRequestSent')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        TransitionComponent={Fade}
      >
        <Alert
          severity="info"
          variant="filled"
          onClose={() => handleCloseSnackbar('connectionRequestSent')}
          icon={<PersonAddIcon />}
        >
          Connection request sent!
        </Alert>
      </Snackbar>

      <Snackbar
        open={snackbars.connectionAccepted}
        autoHideDuration={3000}
        onClose={() => handleCloseSnackbar('connectionAccepted')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => handleCloseSnackbar('connectionAccepted')}
          icon={<PeopleIcon />}
        >
          {snackbars.snackbarMessage || 'Connection accepted!'}
        </Alert>
      </Snackbar>

      <Snackbar
        open={snackbars.connectionDeclined}
        autoHideDuration={3000}
        onClose={() => handleCloseSnackbar('connectionDeclined')}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Alert
          severity="info"
          variant="filled"
          onClose={() => handleCloseSnackbar('connectionDeclined')}
          icon={<PersonRemoveIcon />}
        >
          {snackbars.snackbarMessage || 'Connection request declined'}
        </Alert>
      </Snackbar>

      <Snackbar
        open={snackbars.connectionRemoved}
        autoHideDuration={3000}
        onClose={() => handleCloseSnackbar('connectionRemoved')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          severity="warning"
          variant="filled"
          onClose={() => handleCloseSnackbar('connectionRemoved')}
          icon={<PersonRemoveIcon />}
        >
          {snackbars.snackbarMessage || 'Connection removed'}
        </Alert>
      </Snackbar>

      <Snackbar
        open={snackbars.searchResults}
        autoHideDuration={3000}
        onClose={() => handleCloseSnackbar('searchResults')}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          severity="info"
          variant="filled"
          onClose={() => handleCloseSnackbar('searchResults')}
          icon={<SearchIcon />}
        >
          {snackbars.snackbarMessage || 'Search results loaded'}
        </Alert>
      </Snackbar>

      <Snackbar
        open={snackbars.editProfileOpen}
        autoHideDuration={2000}
        onClose={() => handleCloseSnackbar('editProfileOpen')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="info"
          variant="filled"
          onClose={() => handleCloseSnackbar('editProfileOpen')}
          icon={<EditIcon />}
        >
          Edit profile dialog opened
        </Alert>
      </Snackbar>

      <Snackbar
        open={snackbars.avatarUploading}
        autoHideDuration={2000}
        onClose={() => handleCloseSnackbar('avatarUploading')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity="info"
          variant="filled"
          onClose={() => handleCloseSnackbar('avatarUploading')}
          icon={<CircularProgress size={20} />}
        >
          Uploading avatar...
        </Alert>
      </Snackbar>

      <Snackbar
        open={snackbars.avatarUploaded}
        autoHideDuration={3000}
        onClose={() => handleCloseSnackbar('avatarUploaded')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => handleCloseSnackbar('avatarUploaded')}
          icon={<CheckCircleIcon />}
        >
          Avatar uploaded successfully!
        </Alert>
      </Snackbar> 
      <TourGuide page='profile'/>
    </>
  );
}