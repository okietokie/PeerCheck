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
  Launch as LaunchIcon
} from '@mui/icons-material';
import axiosClient from '@/api/axiosClient';
import TeamDetails from './PeerTeams/TeamDetails';
import Profile from './Profile.jsx';

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

      console.log("Fetched teams:", res.data.teams);
      setTeams(res.data.teams || []);
    } catch (error) {
      console.log(`Error fetching teams: ${error}`);
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
      console.log(`Error fetching peer connections: ${error}`);
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
      console.log(`Error creating team: ${error}`);
      setError('Failed to create team');
    } finally {
      setCreatingTeam(false);
    }
  };

  const leaveTeam = async (teamId) => {
    try {
      const token = localStorage.getItem("token");
      await axiosClient.delete(`/user/leave-team/${teamId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      await fetchTeams(); // Refresh teams list
    } catch (error) {
      console.log(`Error leaving team: ${error}`);
      setError('Failed to leave team');
    }
  };
  
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
      <Container maxWidth="md" sx={{ py: 8 }}>
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
      <Grid container spacing={4}>
        {teams.map((team) => (
          <Grid item xs={12} md={6} key={team._id}>
            <Card
              sx={{
                p: 4,
                borderRadius: 4,
                bgcolor: theme.palette.background.paper,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                }
              }}
            >
              {/* Team Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                    {team.name  || team.teamName}
                  </Typography>
                  <Chip
                    label={`${team.members?.length || 0} members`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
                
                <Tooltip title="Team Settings">
                  <IconButton size="small" onClick={() => handleViewTeam(team)}>
                    <LaunchIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* Team Members */}
              <Box sx={{ mb: 4, flex: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 2, color: 'text.secondary', fontWeight: 600 }}>
                  TEAM MEMBERS
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {team.members?.slice(0, 4).map((member, index) => (
                  <Box
                    key={member._id || member.user?._id || index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.02),
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        width: 40,
                        height: 40,
                        fontSize: '0.875rem'
                      }}
                    >
                      {member.user?.name?.[0] || member.name?.[0] || 'U'}
                    </Avatar>
                    
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                        {member.user?.name || member.name || 'Unknown Member'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {member.role || 'Member'}
                      </Typography>
                    </Box>
                    
                    {member.role === 'leader' && (
                      <Chip
                        label="Leader"
                        size="small"
                        color="primary"
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                ))}
                  
                  {team.members && team.members.length > 4 && (
                    <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', py: 1 }}>
                      +{team.members.length - 4} more members
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Team Actions */}
              <Box sx={{ display: 'flex', gap: 1, pt: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  sx={{ borderRadius: 2 }}
                  onClick={() => handleViewTeam(team)} 
                >
                  View Team
                </Button>
                
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => leaveTeam(team._id)}
                  sx={{ borderRadius: 2, minWidth: 'auto', px: 2 }}
                >
                  Leave
                </Button>
              </Box>


              <TeamDetails 
                open={teamDetailsOpen}
                onClose={() => setTeamDetailsOpen(false)}
                team={selectedTeam}
                onTeamUpdate={refreshTeams} // Pass refresh function
              />
            </Card>
          </Grid>
        ))}
      </Grid>

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
      
    </Container>
  );
}