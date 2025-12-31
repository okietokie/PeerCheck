import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  Button,
  Avatar,
  Chip,
  Grid,
  Paper,
  useTheme,
  alpha,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Groups as TeamsIcon,
  PersonAdd as PersonAddIcon,
  Add as AddIcon,
  GroupAdd as GroupAddIcon,
  Launch as LaunchIcon,
  People,
  Schedule,
  Group,
  WorkOutline,
  Star,
  Visibility,
  ExitToApp,
  Groups,
  Settings,
  Analytics,
  Chat,
  Warning
} from '@mui/icons-material';
import axiosClient from '@/api/axiosClient';
import TeamDetails from './PeerTeams/TeamDetails';
import Profile from './Profile.jsx';
import TourGuide from './TourGuide';

export default function PeerTeams() {
  const theme = useTheme();
  const [teams, setTeams] = useState([]);
  const [peerConnections, setPeerConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createTeamDialog, setCreateTeamDialog] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [creatingTeam, setCreatingTeam] = useState(false);  
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamDetailsOpen, setTeamDetailsOpen] = useState(false);
  const [profileActive, setProfileActive] = useState(false);

  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);



  const handleChangeTab = () => {
    setProfileActive(true);
  }

  
  // Fetch teams and peer connections
  const fetchTeams = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axiosClient.get("/user/teams", {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setTeams(res.data.teams || []);
    } catch (error) {
      console.error(`Error fetching teams: ${error}`);
      setError('Failed to load teams');
    }
  };

  const fetchPeerConnections = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axiosClient.get("/user/peerteam/", {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setPeerConnections(res.data.connections || []);
    } catch (error) {
      console.error(`Error fetching peer connections: ${error}`);
    }
  };

  const createTeam = async () => {
    if (!newTeamName.trim()) {
      setError('Please enter a team name');
      return;
    }

    try {
      setCreatingTeam(true);
      const token = localStorage.getItem("token");
      await axiosClient.post("/user/create-team", 
        { name: newTeamName.trim() },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setCreateTeamDialog(false);
      setNewTeamName('');
      await fetchTeams(); // Refresh teams list
    } catch (error) {
      console.error(`Error creating team: ${error}`);
      setError('Failed to create team');
    } finally {
      setCreatingTeam(false);
    }
  };
const openLeaveDialog = (teamId, teamName) => {
  setSelectedTeam({ id: teamId, name: teamName });
  setLeaveDialogOpen(true);
};

const handleCloseDialog = () => {
  setLeaveDialogOpen(false);
  setSelectedTeam(null);
};

const leaveTeam = async (teamId) => {
  if (!teamId) return;
  
  try {
    const token = localStorage.getItem("token");
    await axiosClient.delete(`/user/leave-team/${teamId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    await fetchTeams(); // Refresh teams list
    handleCloseDialog();
  } catch (error) {
    console.error(`Error leaving team: ${error}`);
    setError('Failed to leave team');
    handleCloseDialog();
  }
};

// In your component render method:
<>
  {/* Your existing component code */}
  <Button
    variant="outlined"
    color="error"
    onClick={() => openLeaveDialog(team._id, team.name || team.teamName)}
    startIcon={<ExitToApp />}
    sx={{ 
      borderRadius: 3,
      minWidth: 'auto',
      px: 3,
      py: 1.5,
      fontWeight: 600,
      textTransform: 'none',
      borderWidth: 2,
      '&:hover': {
        borderWidth: 2,
        bgcolor: alpha(theme.palette.error.main, 0.04)
      }
    }}
  >
    Leave
  </Button>

  {/* Confirmation Dialog */}
  <Dialog
    open={leaveDialogOpen}
    onClose={handleCloseDialog}
    maxWidth="sm"
    fullWidth
  >
    <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Warning color="warning" />
      Leave Team Confirmation
    </DialogTitle>
    <DialogContent>
      <Alert severity="warning" sx={{ mb: 2 }}>
        <Typography variant="body1" sx={{ fontWeight: 600 }}>
          Are you sure you want to leave the team?
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          You will lose access to all team resources and conversations.
        </Typography>
      </Alert>
      {selectedTeam && (
        <Typography variant="body2" color="text.secondary">
          Team: <strong>{selectedTeam.name}</strong>
        </Typography>
      )}
    </DialogContent>
    <DialogActions sx={{ p: 3, pt: 0 }}>
      <Button 
        onClick={handleCloseDialog} 
        variant="outlined"
        sx={{ borderRadius: 2 }}
      >
        Cancel
      </Button>
      <Button 
        onClick={leaveTeam} 
        variant="contained" 
        color="error"
        sx={{ borderRadius: 2 }}
      >
        Leave Team
      </Button>
    </DialogActions>
  </Dialog>
</>

  
  const handleViewTeam = (team) => {
    setSelectedTeam(team);
    setTeamDetailsOpen(true);
  };

  const refreshTeams = () => {
    fetchTeams();
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchTeams(), fetchPeerConnections()]);
      setLoading(false);
    };
    
    loadData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (profileActive) {
    return <Profile />;
  }

  // No teams and no peer connections
  if (teams.length === 0 && peerConnections.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }} className='peer-connections-preview'>
        {error && (
          <Alert severity="error" sx={{ mb: 4 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 4
            }}
          >
            <TeamsIcon sx={{ fontSize: 60, color: 'primary.main' }} />
          </Box>

          <Typography variant="h4" sx={{ mb: 2, fontWeight: 700, color: 'text.primary' }}>
            No Teams Yet
          </Typography>
          
          <Typography variant="h6" sx={{ mb: 4, color: 'text.secondary', maxWidth: 500, mx: 'auto' }}>
            Start by connecting with peers to build your first team
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<PersonAddIcon />}
              onClick={() => handleChangeTab()}
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                fontSize: '1.1rem'
              }}
            >
              Find Peers
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              startIcon={<GroupAddIcon />}
              onClick={() => setCreateTeamDialog(true)}
              disabled={peerConnections.length === 0} // Only disable if no connections
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                fontSize: '1.1rem'
              }}
            >
              Create Team
            </Button>
          </Box>

          <Typography variant="body2" sx={{ mt: 3, color: 'text.secondary' }}>
            You need to connect with peers before you can create teams
          </Typography>
        </Box>
        <TourGuide page='nopeerteams' />
      </Container>
    );
  }

  // No teams but has peer connections
  if (teams.length === 0 && peerConnections.length > 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 4 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
            Your Teams
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary' }}>
            Create your first team with your connections
          </Typography>
        </Box>

        {/* Empty State with Connections */}
        <Grid container spacing={4}>
          {/* Create Team Card */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                p: 4,
                textAlign: 'center',
                bgcolor: alpha(theme.palette.primary.main, 0.03),
                border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
                borderRadius: 4,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  transform: 'translateY(-4px)'
                }
              }}
              onClick={() => setCreateTeamDialog(true)}
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
                  mb: 3
                }}
              >
                <AddIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              </Box>
              
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                Create Your First Team
              </Typography>
              
              <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                Start collaborating with your {peerConnections.length} connection{peerConnections.length !== 1 ? 's' : ''}
              </Typography>
              
              <Button
                variant="contained"
                size="large"
                startIcon={<GroupAddIcon />}
                sx={{
                  borderRadius: 3,
                  px: 4,
                  fontWeight: 600
                }}
              >
                Create Team
              </Button>
            </Card>
          </Grid>

          {/* Connections Preview */}
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                p: 4,
                borderRadius: 4,
                bgcolor: alpha(theme.palette.success.main, 0.03),
                border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                height: '100%'
              }}
            >
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: 'success.main' }}>
                Your Connections ({peerConnections.length})
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {peerConnections.slice(0, 3).map((connection) => (
                  <Box
                    key={connection._id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: theme.palette.background.paper,
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        width: 40,
                        height: 40
                      }}
                    >
                      {connection.user?.name?.[0] || 'U'}
                    </Avatar>
                    
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontWeight: 600 }}>
                        {connection.user?.name || 'Unknown User'}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {connection.user?.course || 'Student'}
                      </Typography>
                    </Box>
                  </Box>
                ))}
                
                {peerConnections.length > 3 && (
                  <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', mt: 1 }}>
                    +{peerConnections.length - 3} more connections
                  </Typography>
                )}
              </Box>

              <Button
                variant="outlined"
                fullWidth
                sx={{ mt: 3, borderRadius: 2 }}
                onClick={() => handleChangeTab()}
                startIcon={<PersonAddIcon />}
              >
                Find More Peers
              </Button>
            </Card>
          </Grid>
        </Grid>

        {/* Create Team Dialog */}
        <Dialog 
          open={createTeamDialog} 
          onClose={() => !creatingTeam && setCreateTeamDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 600, fontSize: '1.25rem' }}> 
            Create New Team
          </DialogTitle>
          
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
              Choose a name for your new team. You'll be able to add members after creation.
            </Typography>
            
            <TextField
              autoFocus
              label="Team Name"
              fullWidth
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              placeholder="Enter team name..."
              disabled={creatingTeam}
            />
          </DialogContent>
          
          <DialogActions sx={{ p: 3, gap: 1 }}>
            <Button 
              onClick={() => setCreateTeamDialog(false)}
              disabled={creatingTeam}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={createTeam}
              disabled={creatingTeam || !newTeamName.trim()}
              startIcon={creatingTeam ? <CircularProgress size={16} /> : <GroupAddIcon />}
            >
              {creatingTeam ? 'Creating...' : 'Create Team'}
            </Button>
          </DialogActions>
        </Dialog>
        <TourGuide page='nopeerteams' />
      </Container>

    );
  }

  // Has teams - Display teams
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 4 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
            Your Teams
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary' }}>
            Manage your collaborative teams and members
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<GroupAddIcon />}
          onClick={() => setCreateTeamDialog(true)}
          sx={{
            borderRadius: 3,
            px: 4,
            py: 1.5,
            fontWeight: 600
          }}
        >
          Create Team
        </Button>
      </Box>

      {/* Teams Grid */}
<Box
  sx={{
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    width: '100%'
  }}
>
  {teams.map((team) => (
    <Card
      key={team._id}
      sx={{
        p: 3,
        borderRadius: 4,
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        backgroundImage: `linear-gradient(to right, 
          ${alpha(theme.palette.background.paper, 1)} 0%,
          ${alpha(theme.palette.background.default, 0.3)} 30%,
          ${alpha(theme.palette.background.default, 0.1)} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateX(8px)',
          boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.12)}`,
          borderColor: alpha(theme.palette.primary.main, 0.2),
          '&::before': {
            width: '6px'
          }
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '4px',
          background: `linear-gradient(to bottom, 
            ${theme.palette.primary.main} 0%,
            ${theme.palette.secondary.main} 100%)`,
          borderTopLeftRadius: 4,
          borderBottomLeftRadius: 4,
          transition: 'width 0.3s ease'
        }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'stretch',
          gap: 4,
          height: '180px'
        }}
      >
        {/* Team Info Sidebar */}
        <Box
          sx={{
            width: '280px',
            minWidth: '280px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            pr: 3,
            borderRight: `1px solid ${alpha(theme.palette.divider, 0.1)}`
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
                }}
              >
                <Groups sx={{ fontSize: 24, color: 'primary.main' }} />
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 0.5,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {team.name || team.teamName}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Team ID: {team._id?.slice(-8) || 'N/A'}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <People sx={{ fontSize: 16, color: 'primary.main' }} />
                <Typography variant="body2">
                  <strong>{team.members?.length || 0}</strong> members
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Schedule sx={{ fontSize: 16, color: 'primary.main' }} />
                <Typography variant="body2">
                  Created {team.createdAt ? new Date(team.createdAt).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric' 
                  }) : 'N/A'}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleViewTeam(team)}
              startIcon={<Visibility />}
              fullWidth
              sx={{
                borderRadius: 2,
                py: 1,
                fontSize: '0.875rem',
                fontWeight: 600
              }}
            >
              Dashboard
            </Button>
            <Tooltip title="Leave team">
              <Button
                variant="outlined"
                color="error"
                onClick={() => leaveTeam(team._id)}
                sx={{
                  borderRadius: 2,
                  minWidth: 'auto',
                  px: 2,
                  borderWidth: 2
                }}
              >
                  
                <ExitToApp />
              </Button>
            </Tooltip>

          </Box>
        </Box>

        {/* Members Preview - Horizontal Scrolling */}
        <Box sx={{ flex: 1, minWidth: 0 }} >
          <Typography
            variant="subtitle2"
            sx={{
              mb: 2,
              color: 'text.secondary',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Group sx={{ fontSize: 18 }} />
            Team Members
          </Typography>

          <Box
            sx={{
              display: 'flex',
              gap: 2,
              overflowX: 'auto',
              pb: 2,
              '&::-webkit-scrollbar': {
                height: '6px'
              },
              '&::-webkit-scrollbar-track': {
                background: alpha(theme.palette.divider, 0.1),
                borderRadius: 3
              },
              '&::-webkit-scrollbar-thumb': {
                background: alpha(theme.palette.primary.main, 0.3),
                borderRadius: 3,
                '&:hover': {
                  background: alpha(theme.palette.primary.main, 0.5)
                }
              }
            }}
          >
            {team.members?.map((member, index) => (
              <Box
              className='team-members'
                key={member._id || member.user?._id || index}
                sx={{
                  width: '140px',
                  minWidth: '140px',
                  p: 2,
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.background.default, 0.5),
                  border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1.5,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
                    borderColor: alpha(theme.palette.primary.main, 0.3)
                  }
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      fontSize: '1.25rem',
                      fontWeight: 600,
                      bgcolor: `hsl(${index * 60}, 70%, 50%)`,
                      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
                    }}
                  >
                    {member.user?.name?.[0]?.toUpperCase() || member.name?.[0]?.toUpperCase() || 'U'}
                  </Avatar>
                  {member.role === 'leader' && (
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: -4,
                        right: -4,
                        bgcolor: 'gold',
                        color: 'white',
                        borderRadius: '50%',
                        width: 20,
                        height: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `2px solid ${theme.palette.background.paper}`
                      }}
                    >
                      <Star sx={{ fontSize: 12, color:"red" }} />
                    </Box>
                  )}
                </Box>

                <Box sx={{ textAlign: 'center', width: '100%' }}>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {member.user?.name || member.name || 'Unknown'}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 0.5,
                      mt: 0.5
                    }}
                  >
                    <WorkOutline sx={{ fontSize: 12 }} />
                    {member.role || 'Member'}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Quick Actions Sidebar */}
        <Box
          sx={{
            width: '120px',
            minWidth: '120px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            pl: 3,
            borderLeft: `1px solid ${alpha(theme.palette.divider, 0.1)}`
          }}
        >
          <Tooltip title="Team Settings">
            <IconButton
              onClick={() => handleViewTeam(team)}
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                width: 48,
                height: 48,
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                  transform: 'scale(1.1)'
                }
              }}
            >
              <Settings sx={{ color: 'primary.main' }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Team Analytics">
            <IconButton
              onClick={() => handleViewTeam(team)}
              sx={{
                bgcolor: alpha(theme.palette.secondary.main, 0.1),
                width: 48,
                height: 48,
                '&:hover': {
                  bgcolor: alpha(theme.palette.secondary.main, 0.2),
                  transform: 'scale(1.1)'
                }
              }}
            >
              <Analytics sx={{ color: 'secondary.main' }} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Team Chat">
            <IconButton
              onClick={() => handleViewTeam(team)}
              sx={{
                bgcolor: alpha(theme.palette.success.main, 0.1),
                width: 48,
                height: 48,
                '&:hover': {
                  bgcolor: alpha(theme.palette.success.main, 0.2),
                  transform: 'scale(1.1)'
                }
              }}
            >
              <Chat sx={{ color: 'success.main' }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <TeamDetails
        open={teamDetailsOpen}
        onClose={() => setTeamDetailsOpen(false)}
        team={selectedTeam}
        onTeamUpdate={refreshTeams}
      />
    </Card>
  ))} 
</Box>



      {/* Create Team Dialog */}
      <Dialog 
        open={createTeamDialog} 
        onClose={() => !creatingTeam && setCreateTeamDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight={600}>
            Create New Team
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
            Choose a name for your new team. You'll be able to add members after creation.
          </Typography>
          
          <TextField
            autoFocus
            label="Team Name"
            fullWidth
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            placeholder="Enter team name..."
            disabled={creatingTeam}
          />
        </DialogContent>
        
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={() => setCreateTeamDialog(false)}
            disabled={creatingTeam}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={createTeam}
            disabled={creatingTeam || !newTeamName.trim()}
            startIcon={creatingTeam ? <CircularProgress size={16} /> : <GroupAddIcon />}
          >
            
            {creatingTeam ? 'Creating...' : 'Create Team'}
          </Button>
        </DialogActions>
      </Dialog>
      
    <TourGuide page='peerteams' />
      
    </Container>
  );
}