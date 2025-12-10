import axiosClient from '@/api/axiosClient';
import { 
  Box, Avatar, Typography, Card, useTheme, alpha, Button, 
  CircularProgress, Alert, Container, Tabs, Tab, IconButton,
  TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Chip, Divider, Tooltip, Badge, LinearProgress, Stack,
  MenuItem, Select, FormControl, InputLabel, InputAdornment
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

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
    
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
      console.log("res.data", res.data);
    } catch (error) {
      console.log(`Error fetching user data: ${error}`);
      setError('Failed to load user data');
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
      console.log(`Error fetching peer team: ${error}`);
      setError('Failed to load peer team');
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
      console.log(`Error fetching incoming requests:`, error);
      setError('Failed to load incoming requests');
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
      console.log(`Error fetching suggested users: ${error}`);
    }
  };

  const sendConnectionRequest = async (userId) => {
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
      
      setSuccess('Connection request sent successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.log(`Error sending connection request: ${error}`);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to send connection request');
      }
    }
  };

  const acceptRequest = async (connectionId) => {
    try {
      const token = localStorage.getItem("token");
      await axiosClient.put(`/user/accept-request/${connectionId}`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchIncomingRequests();
      fetchPeerTeam();
      fetchSuggestedUsers();
      setSuccess('Connection request accepted!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.log(`Error accepting request: ${error}`);
      setError('Failed to accept connection request');
    }
  };

  const declineRequest = async (connectionId) => {
    try {
      const token = localStorage.getItem("token");
      await axiosClient.put(`/user/decline-request/${connectionId}`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setIncomingRequests(prev => prev.filter(request => request._id !== connectionId));
      setSuccess('Connection request declined');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.log(`Error declining request: ${error}`);
      setError('Failed to decline connection request');
    }
  };

  const removeConnection = async (connectionId) => {
    try {
      const token = localStorage.getItem("token");
      await axiosClient.delete(`/user/remove-connection/${connectionId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchPeerTeam();
      fetchSuggestedUsers();
      setSuccess('Connection removed successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.log(`Error removing connection: ${error}`);
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
          // Check if there's an existing connection
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
  } catch (error) {
    console.log(`Error searching users: ${error}`);
    setSearchError('Failed to search users');
  } finally {
    setSearchLoading(false);
  }
};

// Debounce search input  - Wait for the user to stop typing for some time before running a function.
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
  };
// Updated avatar upload function in Profile.jsx
const uploadAvatar = async (file) => {
  try {
    setUploadingAvatar(true);
    const formData = new FormData();
    formData.append('avatar', file);
    
    const token = localStorage.getItem("token");
    const response = await axiosClient.post('/user/upload-avatar', formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    
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
    setEditDialogOpen(false);
    
    // Upload avatar if changed
    let avatarUpdatePromise = Promise.resolve(null);
    if (avatarFile) {
      avatarUpdatePromise = uploadAvatar(avatarFile);
    }
    
    // Update profile data (excluding avatar)
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
    const profileUpdatePromise = axiosClient.put('/user/update-profile', profileData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    // Execute both promises
    const [avatarResult, profileResult] = await Promise.allSettled([
      avatarUpdatePromise,
      profileUpdatePromise
    ]);
    
    // Handle results
    if (avatarResult.status === 'fulfilled' && avatarResult.value) {
      // Avatar was updated
      setUser(prev => ({
        ...prev,
        user: {
          ...prev.user,
          avatar: avatarResult.value.avatarUrl,
          ...avatarResult.value.user
        }
      }));
    }
    
    if (profileResult.status === 'fulfilled' && profileResult.value) {
      // Profile was updated
      if (!avatarFile) { // Only update if avatar wasn't updated
        setUser(prev => ({
          ...prev,
          user: {
            ...prev.user,
            ...profileResult.value.user
          }
        }));
      }
    }
    
    setSuccess('Profile updated successfully!');
    setTimeout(() => setSuccess(''), 3000);
    
  } catch (error) {
    console.error('Error updating profile:', error);
    setError(error.response?.data?.message || 'Failed to update profile');
  }
};

// Add file size validation
const handleAvatarChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  
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




  useEffect(() => {
    const loadAllData = async () => {
      await Promise.all([
        fetchUserData(),
        fetchPeerTeam(),
        fetchIncomingRequests(),
        fetchSuggestedUsers()
      ]);
      setLoading(false);
    };
    
    loadAllData();
  }, []);

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
            onClick: () => sendConnectionRequest(user._id),
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

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'background.default',
      py: 4
    }}>
      <Container maxWidth="xl">
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
        <Card sx={{ 
          borderRadius: 4,
          overflow: 'hidden',
          mb: 4,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          boxShadow: theme.shadows[2]
        }}>
          {/* Cover Photo Area */}
          <Box sx={{
            height: 180,
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
            position: 'relative'
          }} />
          
          {/* Profile Info Section */}
          <Box sx={{ 
            position: 'relative', 
            px: 6, 
            pb: 4,
            pt: 8 
          }}>
            {/* Avatar with Edit Button */}
            <Box sx={{ 
              position: 'absolute', 
              top: -60, 
              left: 40 
            }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            badgeContent={
              <IconButton
                onClick={handleEditClick}
                sx={{
                  bgcolor: theme.palette.primary.main,
                  color: 'white',
                  '&:hover': {
                    bgcolor: theme.palette.primary.dark,
                  }
                }}
                size="small"
              >
                <EditIcon fontSize="small" />
              </IconButton>
            }
          >
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={user.user?.avatar}
                sx={{
                  width: 120,
                  height: 120,
                  border: `4px solid ${theme.palette.background.paper}`,
                  boxShadow: theme.shadows[6],
                  bgcolor: theme.palette.primary.main,
                  fontSize: '3rem',
                  fontWeight: 'bold'
                }}
              >
                {!user.user?.avatar ? (user.user?.name?.[0]?.toUpperCase()) || (user.username?.[0]?.toUpperCase()) || "U" :user.user?.avatar}
              </Avatar>
              <AvatarUploadProgress uploading={uploadingAvatar} />
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
                  fontWeight: 600,
                  boxShadow: theme.shadows[1],
                  '&:hover': {
                    boxShadow: theme.shadows[3]
                  }
                }}
              >
                Edit Profile
              </Button>
            </Box>

            {/* Profile Details */}
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2, mb: 1 }}>
                <Typography variant="h4" sx={{ fontWeight: 800 }}>
                  {user.user?.name || user.username}
                </Typography>
                <Chip
                  icon={<VerifiedIcon fontSize="small" />}
                  label={user.user?.role === 'admin' ? 'Admin' : 'Verified'}
                  size="small"
                  color={user.user?.role === 'admin' ? 'error' : 'success'}
                  sx={{ fontWeight: 600 }}
                />
              </Box>
              
              <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                @{user.username}
              </Typography>

              {user.user?.bio && (
                <Typography variant="body1" sx={{ 
                  mb: 3, 
                  maxWidth: '70%',
                  color: 'text.primary',
                  lineHeight: 1.6
                }}>
                  {user.user.bio}
                </Typography>
              )}

              {/* Profile Stats */}
              <Box sx={{ 
                display: 'flex', 
                gap: 4,
                flexWrap: 'wrap',
                mb: 3
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PeopleIcon color="action" />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {peerTeam.length} <Typography component="span" color="text.secondary">Connections</Typography>
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon color="action" />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {incomingRequests.length} <Typography component="span" color="text.secondary">Requests</Typography>
                  </Typography>
                </Box>
                
                {user.user?.institution && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SchoolIcon color="action" />
                    <Typography variant="body1" color="text.primary" sx={{ fontWeight: 600 }}>
                      {user.user.institution}
                    </Typography>
                  </Box>
                )}
                
                {user.user?.course && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WorkIcon color="action" />
                    <Typography variant="body1" color="text.primary" sx={{ fontWeight: 600 }}>
                      {user.user.course}
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Profile Completion */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Profile Completion
                  </Typography>
                  <Typography variant="body2" color="primary" sx={{ fontWeight: 600 }}>
                    {profileCompletion()}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={profileCompletion()} 
                  sx={{ 
                    height: 6, 
                    borderRadius: 3,
                    bgcolor: alpha(theme.palette.primary.main, 0.1)
                  }}
                />
              </Box>

              {/* Skills */}
              {user.user?.skills && user.user.skills.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    SKILLS
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
                          fontWeight: 500
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Card>

        {/* Main Content Area */}
        <Box sx={{ display: 'flex', gap: 4 }}>
          {/* Left Column - User Info */}
          <Box sx={{ width: '300px', flexShrink: 0 }}>
            <Card sx={{ 
              borderRadius: 3, 
              p: 3,
              mb: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
            }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
                Contact Information
              </Typography>
              
              <Stack spacing={2}>
                {user.user?.email && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {user.user.email}
                    </Typography>
                  </Box>
                )}
                
                {user.user?.course && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Course
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {user.user.course}
                    </Typography>
                  </Box>
                )}
                
                {user.user?.year && user.user.year !== 'Other' && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Year
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {user.user.year}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Card>

            {/* Online Status */}
            <Card sx={{ 
              borderRadius: 3, 
              p: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    STATUS
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {user.user?.onlineStatus === 'online' ? 'Online' : 'Offline'}
                  </Typography>
                </Box>
                <Box sx={{ 
                  width: 12, 
                  height: 12, 
                  borderRadius: '50%',
                  bgcolor: user.user?.onlineStatus === 'online' ? 'success.main' : 'error.main'
                }} />
              </Box>
            </Card>
          </Box>

          {/* Right Column - Main Content */}
          <Box sx={{ flex: 1 }}>
            {/* Navigation Tabs */}
            <Card sx={{ 
              borderRadius: 3, 
              mb: 4,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
            }}>
              <Box sx={{ 
                display: 'flex', 
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
              }}>
                <Button
                  fullWidth
                  variant={activeTab === 0 ? "contained" : "text"}
                  onClick={() => setActiveTab(0)}
                  sx={{
                    py: 2,
                    borderRadius: 0,
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    textTransform: 'none',
                    borderTopLeftRadius: 12,
                    bgcolor: activeTab === 0 ? 'primary.main' : 'transparent',
                    color: activeTab === 0 ? 'white' : 'text.secondary',
                    '&:hover': {
                      bgcolor: activeTab === 0 ? 'primary.dark' : alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                >
                  Find Peers ({suggestedUsers.length})
                </Button>
                
                <Button
                  fullWidth
                  variant={activeTab === 1 ? "contained" : "text"}
                  onClick={() => setActiveTab(1)}
                  sx={{
                    py: 2,
                    borderRadius: 0,
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    textTransform: 'none',
                    borderTopRightRadius: 12,
                    bgcolor: activeTab === 1 ? 'primary.main' : 'transparent',
                    color: activeTab === 1 ? 'white' : 'text.secondary',
                    '&:hover': {
                      bgcolor: activeTab === 1 ? 'primary.dark' : alpha(theme.palette.primary.main, 0.05)
                    }
                  }}
                >
                  Connection Requests ({incomingRequests.length})
                </Button>
              </Box>

              {/* Tab Content */}
              <Box sx={{ p: 3 }}>
              {activeTab === 0 ? (
                /* FIND PEERS TAB */
                <>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
                    Find Peers
                  </Typography>
                  
                  {/* Search Bar */}
                  <Card sx={{ 
                    mb: 3, 
                    p: 2, 
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    bgcolor: alpha(theme.palette.primary.main, 0.02)
                  }}>
                    <TextField
                      fullWidth
                      placeholder="Search users by name, username, or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      variant="outlined"
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon color="action" />
                          </InputAdornment>
                        ),
                        endAdornment: searchLoading ? (
                          <InputAdornment position="end">
                            <CircularProgress size={20} />
                          </InputAdornment>
                        ) : null,
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          bgcolor: 'background.paper'
                        }
                      }}
                    />
                    {searchError && (
                      <Alert severity="error" sx={{ mt: 1, borderRadius: 2 }}>
                        {searchError}
                      </Alert>
                    )}
                  </Card>
                  
                  {/* Search Results or Suggested Users */}
                  {searchQuery.trim() ? (
                    <>
                      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                        Search Results ({searchResults.length})
                      </Typography>
                      
                      {searchResults.length === 0 ? (
                        <Box sx={{ 
                          textAlign: 'center', 
                          py: 8,
                          bgcolor: alpha(theme.palette.primary.main, 0.02),
                          borderRadius: 3
                        }}>
                          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                            No users found for "{searchQuery}"
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Try a different search term
                          </Typography>
                        </Box>
                      ) : (
                        <Box sx={{ 
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 2
                        }}>
                          {searchResults.map((user) => (
                            <Card
                              key={user._id}
                              variant="outlined"
                              sx={{
                                p: 2.5,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                borderRadius: 3,
                                bgcolor: 'background.paper',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                  boxShadow: theme.shadows[2],
                                  borderColor: alpha(theme.palette.primary.main, 0.3)
                                }
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flex: 1 }}>
                                <Avatar
                                  src={user.avatar}
                                  sx={{
                                    bgcolor: 'primary.main',
                                    width: 56,
                                    height: 56,
                                    fontSize: '1.25rem',
                                    fontWeight: 'bold'
                                  }}
                                >
                                  {user.name?.[0] || user.username?.[0] || "U"}
                                </Avatar>
                                
                                <Box sx={{ flex: 1 }}>
                                  <Typography sx={{ 
                                    fontWeight: 700, 
                                    fontSize: '1.1rem', 
                                    mb: 0.5,
                                    color: 'text.primary'
                                  }}>
                                    {user.name || user.username}
                                    {user.role === 'admin' && (
                                      <VerifiedIcon 
                                        fontSize="small" 
                                        color="primary" 
                                        sx={{ ml: 1, verticalAlign: 'middle' }} 
                                      />
                                    )}
                                  </Typography>
                                  
                                  <Typography variant="body2" sx={{ 
                                    color: 'text.secondary',
                                    mb: 0.5
                                  }}>
                                    @{user.username}
                                  </Typography>
                                  
                                  {user.course && (
                                    <Typography variant="body2" sx={{ 
                                      color: 'text.secondary',
                                      mb: 0.5
                                    }}>
                                      {user.course} • {user.institution || "University"}
                                    </Typography>
                                  )}
                                  
                                  {user.bio && (
                                    <Typography variant="body2" sx={{ 
                                      color: 'text.secondary',
                                      fontStyle: 'italic',
                                      lineHeight: 1.4
                                    }}>
                                      {user.bio.length > 100 ? `${user.bio.substring(0, 100)}...` : user.bio}
                                    </Typography>
                                  )}
                                </Box>
                              </Box>

                              <ConnectionButton user={user} />
                            </Card>
                          ))}
                        </Box>
                      )}
                    </>
                  ) : (
                    <>
                      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                        Suggested Peers ({suggestedUsers.length})
                      </Typography>
                      
                      {suggestedUsers.length === 0 ? (
                        <Box sx={{ 
                          textAlign: 'center', 
                          py: 8,
                          bgcolor: alpha(theme.palette.primary.main, 0.02),
                          borderRadius: 3
                        }}>
                          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                            No suggested peers found
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Try exploring more users or check back later!
                          </Typography>
                        </Box>
                      ) : (
                        <Box sx={{ 
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 2
                        }}>
                          {suggestedUsers.map((user) => (
                            <Card
                              key={user._id}
                              variant="outlined"
                              sx={{
                                p: 2.5,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                borderRadius: 3,
                                bgcolor: 'background.paper',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                  boxShadow: theme.shadows[2],
                                  borderColor: alpha(theme.palette.primary.main, 0.3)
                                }
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flex: 1 }}>
                                <Avatar
                                  src={user.avatar}
                                  sx={{
                                    bgcolor: 'primary.main',
                                    width: 56,
                                    height: 56,
                                    fontSize: '1.25rem',
                                    fontWeight: 'bold'
                                  }}
                                >
                                  {user.name?.[0] || user.username?.[0] || "U"}
                                </Avatar>
                                
                                <Box sx={{ flex: 1 }}>
                                  <Typography sx={{ 
                                    fontWeight: 700, 
                                    fontSize: '1.1rem', 
                                    mb: 0.5,
                                    color: 'text.primary'
                                  }}>
                                    {user.name || user.username}
                                    {user.role === 'admin' && (
                                      <VerifiedIcon 
                                        fontSize="small" 
                                        color="primary" 
                                        sx={{ ml: 1, verticalAlign: 'middle' }} 
                                      />
                                    )}
                                  </Typography>
                                  
                                  <Typography variant="body2" sx={{ 
                                    color: 'text.secondary',
                                    mb: 0.5
                                  }}>
                                    {user.course || "Student"} • {user.institution || "University"}
                                  </Typography>
                                  
                                  {user.bio && (
                                    <Typography variant="body2" sx={{ 
                                      color: 'text.secondary',
                                      fontStyle: 'italic',
                                      lineHeight: 1.4
                                    }}>
                                      {user.bio.length > 100 ? `${user.bio.substring(0, 100)}...` : user.bio}
                                    </Typography>
                                  )}
                                  
                                  {user.skills && user.skills.length > 0 && (
                                    <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
                                      {user.skills.slice(0, 3).map((skill, index) => (
                                        <Chip
                                          key={index}
                                          label={skill}
                                          size="small"
                                          sx={{
                                            height: 20,
                                            fontSize: '0.7rem',
                                            bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                            color: theme.palette.secondary.main
                                          }}
                                        />
                                      ))}
                                    </Box>
                                  )}
                                </Box>
                              </Box>

                              <ConnectionButton user={user} />
                            </Card>
                          ))}
                        </Box>
                      )}
                    </>
                  )}
                </>
              ) : (
                  /* REQUESTS TAB */
                  <Box sx={{ display: 'flex', gap: 4 }}>
                    {/* Incoming Requests */}
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
                        Connection Requests ({incomingRequests.length})
                      </Typography>
                      
                      {incomingRequests.length === 0 ? (
                        <Card sx={{ 
                          p: 4, 
                          textAlign: 'center',
                          bgcolor: alpha(theme.palette.info.main, 0.02),
                          border: `1px dashed ${alpha(theme.palette.info.main, 0.2)}`
                        }}>
                          <Typography variant="body1" color="text.secondary">
                            No pending connection requests
                          </Typography>
                        </Card>
                      ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {incomingRequests.map((request) => (
                            <Card
                              key={request._id}
                              variant="outlined"
                              sx={{
                                p: 2.5,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                borderRadius: 3,
                                bgcolor: alpha(theme.palette.info.main, 0.02),
                                border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar
                                  src={request.requester?.avatar}
                                  sx={{
                                    bgcolor: 'info.main',
                                    width: 50,
                                    height: 50
                                  }}
                                >
                                  {getAvatarInitial(request)}
                                </Avatar>
                                <Box>
                                  <Typography sx={{ fontWeight: 600, fontSize: '1rem' }}>
                                    {getDisplayName(request)}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    {getUserCourse(request)}
                                  </Typography>
                                </Box>
                              </Box>

                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="success"
                                  onClick={() => acceptRequest(request._id)}
                                  sx={{ 
                                    minWidth: 90,
                                    borderRadius: 2,
                                    fontWeight: 600
                                  }}
                                >
                                  Accept
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                  onClick={() => declineRequest(request._id)}
                                  sx={{ 
                                    minWidth: 90,
                                    borderRadius: 2,
                                    fontWeight: 600
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
                      <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
                        Peer Connections ({peerTeam.length})
                      </Typography>
                      
                      {peerTeam.length === 0 ? (
                        <Card sx={{ 
                          p: 4, 
                          textAlign: 'center',
                          bgcolor: alpha(theme.palette.success.main, 0.02),
                          border: `1px dashed ${alpha(theme.palette.success.main, 0.2)}`
                        }}>
                          <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                            No connections yet
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Connect with peers to build your team!
                          </Typography>
                        </Card>
                      ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {peerTeam.map((connection) => (
                            <Card
                              key={connection._id}
                              variant="outlined"
                              sx={{
                                p: 2.5,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                borderRadius: 3,
                                bgcolor: alpha(theme.palette.success.main, 0.02),
                                border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar
                                  src={connection.user?.avatar}
                                  sx={{
                                    bgcolor: 'success.main',
                                    width: 50,
                                    height: 50
                                  }}
                                >
                                  {connection.user?.name?.[0] || "U"}
                                </Avatar>
                                <Box>
                                  <Typography sx={{ fontWeight: 600, fontSize: '1rem' }}>
                                    {connection.user?.name || "Unknown User"}
                                    {connection.user?.role === 'admin' && (
                                      <VerifiedIcon 
                                        fontSize="small" 
                                        color="primary" 
                                        sx={{ ml: 1, verticalAlign: 'middle' }} 
                                      />
                                    )}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                    {connection.user?.course || "Student"}
                                  </Typography>
                                </Box>
                              </Box>

                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={() => removeConnection(connection._id)}
                                sx={{ 
                                  minWidth: 90,
                                  borderRadius: 2,
                                  fontWeight: 600
                                }}
                              >
                                Remove
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

        {/* Edit Profile Dialog */}
        <Dialog 
          open={editDialogOpen} 
          onClose={() => setEditDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ 
            bgcolor: 'primary.main',
            color: 'white',
            fontWeight: 700
          }}>
            Edit Profile
          </DialogTitle>
          
          <DialogContent sx={{ pt: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              mb: 3
            }}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="avatar-upload"
                type="file"
                onChange={handleAvatarChange}
              />
              <label htmlFor="avatar-upload">
                <Avatar
                  src={avatarPreview}
                  sx={{
                    width: 120,
                    height: 120,
                    cursor: 'pointer',
                    border: `3px solid ${theme.palette.primary.main}`,
                    mb: 2,
                    '&:hover': {
                      opacity: 0.8
                    }
                  }}
                >
                  {!avatarPreview && (editUserData.name?.[0] || editUserData.username?.[0] || "U")}
                </Avatar>
              </label>
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
              {uploadingAvatar && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  Uploading...
                </Typography>
              )}
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <TextField
                label="Full Name"
                fullWidth
                value={editUserData.name || ''}
                onChange={(e) => setEditUserData({...editUserData, name: e.target.value})}
                sx={{ flex: '1 1 300px' }}
              />
              
              <TextField
                label="Username"
                fullWidth
                value={editUserData.username || ''}
                onChange={(e) => setEditUserData({...editUserData, username: e.target.value})}
                sx={{ flex: '1 1 300px' }}
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
                sx={{ flex: '1 1 300px' }}
              />
              
              <FormControl fullWidth sx={{ flex: '1 1 300px' }}>
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
                sx={{ flex: '1 1 300px' }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SchoolIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                label="Course"
                fullWidth
                value={editUserData.course || ''}
                onChange={(e) => setEditUserData({...editUserData, course: e.target.value})}
                sx={{ flex: '1 1 300px' }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WorkIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              
              <TextField
                label="Skills (comma separated)"
                fullWidth
                value={editUserData.skills || ''}
                onChange={(e) => setEditUserData({...editUserData, skills: e.target.value})}
                sx={{ flex: '1 1 100%' }}
                placeholder="e.g., JavaScript, React, Node.js, UI/UX"
              />
              
              <TextField
                label="Bio"
                fullWidth
                multiline
                rows={4}
                value={editUserData.bio || ''}
                onChange={(e) => setEditUserData({...editUserData, bio: e.target.value})}
                sx={{ flex: '1 1 100%' }}
                placeholder="Tell us about yourself..."
              />
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button
              startIcon={<CancelIcon />}
              onClick={() => setEditDialogOpen(false)}
              sx={{ borderRadius: 2 }}
            >
              Cancel
            </Button>
            <Button
              startIcon={<SaveIcon />}
              variant="contained"
              onClick={handleSaveProfile}
              disabled={uploadingAvatar}
              sx={{ borderRadius: 2 }}
            >
              {uploadingAvatar ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}