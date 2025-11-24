import axiosClient from '@/api/axiosClient';
import { Box, Avatar, Typography, Card, useTheme, alpha, Button, CircularProgress, Alert, Container, Tabs, Tab } from '@mui/material'
import React, { useEffect, useState } from 'react'

export default function Profile() {
  const theme = useTheme();
  const [user, setUser] = useState({});
  const [peerTeam, setPeerTeam] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0); // 0 for Find Peers, 1 for Requests

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axiosClient.get("/user/me", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUser(res.data);
      console.log(res.data)
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
      console.log("Error response:", error.response); // Detailed error info
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
      
      // Update the specific user's status
      setSuggestedUsers(prev => 
        prev.map(user => 
          user._id === userId 
            ? { ...user, connectionStatus: 'requested' }
            : user
        )
      );
      
      console.log("Request sent successfully:", res.data.message);
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
    } catch (error) {
      console.log(`Error accepting request: ${error}`);
      setError('Failed to accept connection request');
    }
  };

  // ADD THIS FUNCTION - Decline Request
  const declineRequest = async (connectionId) => {
    try {
      const token = localStorage.getItem("token");
      await axiosClient.put(`/user/decline-request/${connectionId}`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // Remove the declined request from the list
      setIncomingRequests(prev => prev.filter(request => request._id !== connectionId));
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
    } catch (error) {
      console.log(`Error removing connection: ${error}`);
      setError('Failed to remove connection');
    }
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  // Connection Status Button Component
  const ConnectionButton = ({ user }) => {
    const getButtonProps = (status) => {
      const baseProps = {
        size: "small",
        variant: "outlined",
        sx: { 
          minWidth: 100,
          borderRadius: 2,
          fontWeight: 600,
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2
          }
        }
      };

      switch(status) {
        case 'requested':
          return {
            ...baseProps,
            children: 'Requested',
            sx: {
              ...baseProps.sx,
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
              bgcolor: alpha(theme.palette.primary.main, 0.1)
            }
          };
        case 'connected':
        case 'accepted':
          return {
            ...baseProps,
            children: 'Peer',
            sx: {
              ...baseProps.sx,
              borderColor: theme.palette.success.main,
              color: theme.palette.success.main,
              bgcolor: alpha(theme.palette.success.main, 0.1)
            }
          };
        case 'pending':
          return {
            ...baseProps,
            children: 'Pending',
            sx: {
              ...baseProps.sx,
              borderColor: theme.palette.warning.main,
              color: theme.palette.warning.main,
              bgcolor: alpha(theme.palette.warning.main, 0.1)
            }
          };
        default:
          return {
            ...baseProps,
            children: 'Request',
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

  // Helper function to get user display name - FIX FOR ISSUE #2
  const getDisplayName = (request) => {
    // Try different possible field names for the requester
    if (request.requester?.name) return request.requester.name;
    if (request.requester?.username) return request.requester.username;
    if (request.fromUser?.name) return request.fromUser.name;
    if (request.fromUser?.username) return request.fromUser.username;
    return "Unknown User";
  };

  // Helper function to get user course - FIX FOR ISSUE #2
  const getUserCourse = (request) => {
    if (request.requester?.course) return request.requester.course;
    if (request.fromUser?.course) return request.fromUser.course;
    return "Student";
  };

  // Helper function to get user avatar initial - FIX FOR ISSUE #2
  const getAvatarInitial = (request) => {
    const name = getDisplayName(request);
    return name[0]?.toUpperCase() || "U";
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3, 
            mx: 'auto',
            borderRadius: 2
          }} 
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {/* Main Profile Section */}
      <Box sx={{ mb: 6 }}>
        {/* OUTER BOX - User Profile */}
        <Box
          sx={{
            position: "relative",
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            borderRadius: 4,
            py: 3,
            px: 0,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
            overflow: 'visible'
          }}
        >
          {/* INNER BOX */}
          <Box
            sx={{
              position: "relative",
              bgcolor: theme.palette.background.paper,
              py: 8,
              mt: '9em',
              mb: 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              boxShadow: '0 8px 32px rgba(0,0,0,0.04)',
              minHeight: 200,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 4
            }}
           >
            {/* CIRCLE AVATAR */}
            <Avatar
              sx={{
                width: 120,
                height: 120,
                position: "absolute",
                top: -60,
                right: '7%',
                transform: 'translateX(-50%)',
                zIndex: 20,
                border: `6px solid ${theme.palette.background.paper}`,
                backgroundColor: theme.palette.primary.main,
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: theme.palette.primary.contrastText,
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
              }}
            >
              {user?.user?.name?.[0]?.toUpperCase() || "U"}
            </Avatar>
            <Box sx={{
                position: "absolute",
                top: 70, // Position below the avatar
                right: '0',
                transform: 'translateX(-50%)',
                textAlign: 'center',
                zIndex: 10,
                width: '200px' // Give it some width for better text alignment
                
                }} >
                  <Typography
                    variant='h5'
                    sx ={{
                      color: 'text.secondary'
                    }}
                    >
                    @{user.username}
                  </Typography>
                  <Typography
                    variant='body2'
                    sx ={{
                      color: 'text.secondary'
                    }}
                    >
                    {user.name || user.user?.name || 'not found'} 
                  </Typography>
                </Box>
            {/* Profile Content */}
            <Box sx={{ 
              display: 'flex', 
              width: '100%',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              
              {/* Stats Row - Left Corner */}
              <Box sx={{ 
                display: 'flex', 
                gap: 4,
                flex: 1,
                justifyContent: 'flex-start'
                }}>
                <Box sx={{ textAlign: 'center', minWidth: 80 }}>
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      fontWeight: 800, 
                      color: 'primary.main',
                      mb: 0.5
                    }}
                  >
                    {peerTeam.length}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'text.secondary',
                      fontWeight: 500
                    }}
                  >
                    Connections
                  </Typography>
                </Box>
                
                <Box sx={{ textAlign: 'center', minWidth: 80 }}>
                  <Typography 
                    variant="h3" 
                    sx={{ 
                      fontWeight: 800, 
                      color: 'primary.main',
                      mb: 0.5
                    }}
                  >
                    {incomingRequests.length}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'text.secondary',
                      fontWeight: 500
                    }}
                  >
                    Requests
                  </Typography>
                </Box>
              </Box>

              {/* Right Side - User name, Username */}
              <Box sx={{ flex:1 }} />
                
                
            </Box>
          </Box>

          {/* Navigation Buttons */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 2, 
            px: 4,
            pb: 2
          }}>
            <Button 
              variant={activeTab === 0 ? "contained" : "outlined"}
              onClick={() => setActiveTab(0)}
              sx={{
                borderRadius: 3,
                px: 4,
                fontWeight: 600,
                bgcolor: activeTab === 0 ? 'primary.main' : 'transparent',
                '&:hover': {
                  bgcolor: activeTab === 0 ? 'primary.dark' : alpha(theme.palette.primary.main, 0.1)
                }
              }}
            >
              Find Peers
            </Button>
            
            <Button 
              variant={activeTab === 1 ? "contained" : "outlined"}
              onClick={() => setActiveTab(1)}
              sx={{
                borderRadius: 3,
                px: 4,
                fontWeight: 600,
                bgcolor: activeTab === 1 ? 'primary.main' : 'transparent',
                '&:hover': {
                  bgcolor: activeTab === 1 ? 'primary.dark' : alpha(theme.palette.primary.main, 0.1)
                }
              }}
            >
              Requests ({incomingRequests.length})
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Content Based on Active Tab */}
      {activeTab === 0 ? (
        /* FIND PEERS TAB - Suggested Users */
        <Card
          sx={{
            borderRadius: 3,
            bgcolor: alpha(theme.palette.primary.main, 0.03),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            p: 4
          }}
        >
          <Typography 
            variant="h5" 
            sx={{ 
              mb: 3, 
              textAlign: 'center', 
              fontWeight: 700,
              color: 'primary.main'
            }}
          >
            Suggested Peers ({suggestedUsers.length})
          </Typography>
          
          {suggestedUsers.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                No suggested peers found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All potential connections have been explored!
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: "repeat(2, 1fr)", gap:2}}>
              {suggestedUsers.map((user) => (
                <Card
                  key={user._id}
                  variant="outlined"
                  sx={{
                    p: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderRadius: 5,
                    bgcolor: theme.palette.background.paper,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Avatar
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
                    
                    <Box>
                      <Typography sx={{ fontWeight: 600, fontSize: '1.1rem', mb: 0.5 }}>
                        {user.name || user.username}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {user.course || "Student"} • {user.institution || "University"}
                      </Typography>
                      {user.bio && (
                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, fontStyle: 'italic' }}>
                          {user.bio}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <ConnectionButton user={user} />
                </Card>
              ))}
            </Box>
          )}
        </Card>
       ) : (
        /* REQUESTS TAB - Incoming Connection Requests */
        <Box sx={{ display: 'grid', gap: 4, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
          {/* Incoming Connection Requests */}
          <Card
            sx={{
              borderRadius: 3,
              bgcolor: alpha(theme.palette.info.main, 0.03),
              border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
              p: 4
            }}
          >
            <Typography 
              variant="h5" 
              sx={{ 
                mb: 3, 
                textAlign: 'center', 
                fontWeight: 700,
                color: 'info.main'
              }}
            >
              Connection Requests ({incomingRequests.length})
            </Typography>
            
            {incomingRequests.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary">
                  No pending connection requests
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {incomingRequests.map((request) => (
                  <Card
                    key={request._id}
                    variant="outlined"
                    sx={{
                      p: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderRadius: 2,
                      bgcolor: theme.palette.background.paper
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: 'info.main',
                          width: 48,
                          height: 48
                        }}
                      >
                        {getAvatarInitial(request)}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
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
                        sx={{ minWidth: 80 }}
                      >
                        Accept
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => declineRequest(request._id)} // FIXED: Added onClick handler
                        sx={{ minWidth: 80 }}
                      >
                        Decline
                      </Button>
                    </Box>
                  </Card>
                ))}
              </Box>
            )}
          </Card>

          {/* Peer Connections */}
          <Card
            sx={{
              borderRadius: 3,
              bgcolor: alpha(theme.palette.success.main, 0.03),
              border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
              p: 4
            }}
          >
            <Typography 
              variant="h5" 
              sx={{ 
                mb: 3, 
                textAlign: 'center', 
                fontWeight: 700,
                color: 'success.main'
              }}
            >
              Peer Connections ({peerTeam.length})
            </Typography>
            
            {peerTeam.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  No connections yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Connect with peers to build your team!
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {peerTeam.map((connection) => (
                  <Card
                    key={connection._id}
                    variant="outlined"
                    sx={{
                      p: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderRadius: 2,
                      bgcolor: theme.palette.background.paper
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: 'secondary.main',
                          width: 48,
                          height: 48
                        }}
                      >
                        {connection.user?.name?.[0] || "U"}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                          {connection.user?.name || "Unknown User"}
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
                      sx={{ minWidth: 90 }}
                    >
                      Remove
                    </Button>
                  </Card>
                ))}
              </Box>
            )}
          </Card>
        </Box>
      )}

    </Container>
  );
}