// TeamDetails.jsx 
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Avatar,
  Chip,
  Button,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Divider,
  useTheme,
  alpha,
  TextField,
  Alert,
  Snackbar,
  Card,
  CardContent,
  InputAdornment,
  CircularProgress,
  Autocomplete,
  Paper
} from '@mui/material';
import {
  Close as CloseIcon,
  Groups as TeamIcon,
  Work as ProjectIcon,
  Settings as SettingsIcon,
  Email as EmailIcon,
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Cancel as CancelIcon,
  Link as LinkIcon,
  QrCode as QrCodeIcon,
  Group as GroupIcon,
  FlashOn as FlashOnIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  EmojiObjects as SkillsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axiosClient from '@/api/axiosClient';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

// User Suggestion Component
function UserSuggestion({ user, onSelect, isSelected }) {
  const theme = useTheme();
  
  return (
    <Paper
      elevation={isSelected ? 2 : 0}
      sx={{
        p: 2,
        mb: 1,
        borderRadius: 2,
        cursor: 'pointer',
        border: `2px solid ${isSelected ? theme.palette.primary.main : alpha(theme.palette.divider, 0.1)}`,
        backgroundColor: isSelected ? alpha(theme.palette.primary.main, 0.05) : 'background.paper',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: 2,
          borderColor: theme.palette.primary.light
        }
      }}
      onClick={() => onSelect(user)}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar
          sx={{
            width: 50,
            height: 50,
            bgcolor: 'primary.main',
            border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`
          }}
          src={user.avatar}
        >
          {user.name?.[0]?.toUpperCase() || 'U'}
        </Avatar>
        
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              {user.name}
            </Typography>
            <Chip
              label={`@${user.username}`}
              size="small"
              variant="outlined"
              sx={{ height: 20, fontSize: '0.7rem' }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            {user.course && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <SchoolIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {user.course}
                </Typography>
              </Box>
            )}
            
            {user.institution && (
              <Typography variant="caption" color="text.secondary">
                • {user.institution}
              </Typography>
            )}
          </Box>
          
          {user.bio && (
            <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary', fontStyle: 'italic' }}>
              "{user.bio}"
            </Typography>
          )}
          
          {user.skills && user.skills.length > 0 && (
            <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
              {user.skills.slice(0, 3).map((skill, index) => (
                <Chip
                  key={index}
                  label={skill}
                  size="small"
                  variant="filled"
                  color="secondary"
                  sx={{ height: 20, fontSize: '0.6rem' }}
                />
              ))}
              {user.skills.length > 3 && (
                <Chip
                  label={`+${user.skills.length - 3}`}
                  size="small"
                  variant="outlined"
                  sx={{ height: 20, fontSize: '0.6rem' }}
                />
              )}
            </Box>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isSelected ? (
            <CheckCircleIcon sx={{ color: 'success.main', fontSize: 24 }} />
          ) : (
            <RadioButtonUncheckedIcon sx={{ color: 'text.secondary', fontSize: 24 }} />
          )}
        </Box>
      </Box>
    </Paper>
  );
}

export default function TeamDetails({ open, onClose, team, onTeamUpdate }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [isEditingName, setIsEditingName] = useState(false);
  const [teamName, setTeamName] = useState(team?.name || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showInvite, setShowInvite] = useState(false);
  const [inviteData, setInviteData] = useState({
    email: '',
    username: '',
    inviteMethod: 'email'
  });
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Reset states when team changes
  useEffect(() => {
    if (team) {
      setTeamName(team.name || '');
      setIsEditingName(false);
    }
  }, [team]);

  // Fetch suggested users when invite dialog opens
  useEffect(() => {
    if (showInvite) {
      fetchSuggestedUsers();
    }
  }, [showInvite]);

  // Search users when query changes
  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      const delayDebounceFn = setTimeout(() => {
        searchUsers(searchQuery);
      }, 300);

      return () => clearTimeout(delayDebounceFn);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const fetchSuggestedUsers = async () => {
    try {
      setSearchLoading(true);
      const token = localStorage.getItem("token");
      const response = await axiosClient.get('/user/suggested-users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setSuggestedUsers(response.data.users || []);
      }
    } catch (error) {
      console.error('Error fetching suggested users:', error);
      setSuggestedUsers([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const searchUsers = async (query) => {
    try {
      setSearchLoading(true);
      const token = localStorage.getItem("token");
      const response = await axiosClient.get(`/user/search-users?q=${encodeURIComponent(query)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setSearchResults(response.data.users || []);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setInviteData({
      email: user.email || '',
      username: user.username || '',
      inviteMethod: 'email'
    });
    setSearchQuery('');
    setSearchResults([]);
  };

  if (!team) return null;

  // Handle team name update
  const handleUpdateTeamName = async () => {
    if (!teamName.trim() || teamName === team.name) {
      setIsEditingName(false);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axiosClient.put(`/user/update-team/${team._id}`, 
        { name: teamName.trim() },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setMessage({ type: 'success', text: 'Team name updated successfully!' });
      setIsEditingName(false);
      if (onTeamUpdate) onTeamUpdate();
    } catch (error) {
      console.error('Error updating team name:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update team name' });
      setTeamName(team.name);
    } finally {
      setLoading(false);
    }
  };

  // Handle invite submission
  const handleInviteSubmit = async () => {
    if (!inviteData.email && !inviteData.username) {
      setMessage({ type: 'error', text: 'Please enter an email or username' });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axiosClient.post(`/user/invite-to-team/${team._id}`, 
        { 
          email: inviteData.email,
          username: inviteData.username,
          message: `You've been invited to join ${team.name}!` 
        },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setMessage({ type: 'success', text: 'Invitation sent successfully!' });
      setShowInvite(false);
      setInviteData({ email: '', username: '', inviteMethod: 'email' });
      setSelectedUser(null);
      setSearchQuery('');
      
      if (onTeamUpdate) onTeamUpdate();
    } catch (error) {
      console.error('Error sending invitation:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to send invitation' });
    } finally {
      setLoading(false);
    }
  };

  // Handle contact member
  const handleContactMember = (email) => {
    window.open(`mailto:${email}`, '_blank');
  };

  // Handle view project
  const handleViewProject = (projectId) => {
    if (projectId) {
      navigate(`/projects/${projectId}`);
    } else {
      setMessage({ type: 'info', text: 'Project details coming soon!' });
    }
  };

  // Handle create project
  const handleCreateProject = () => {
    navigate('/projects', { state: { createNew: true, teamId: team._id } });
  };

  // Handle leave team
  const handleLeaveTeam = async () => {
    if (!window.confirm('Are you sure you want to leave this team?')) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axiosClient.delete(`/user/leave-team/${team._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setMessage({ type: 'success', text: 'Successfully left the team!' });
      if (onTeamUpdate) onTeamUpdate();
      setTimeout(() => onClose(), 1000);
    } catch (error) {
      console.error('Error leaving team:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to leave team' });
    } finally {
      setLoading(false);
    }
  };

  // Handle transfer leadership
  const handleTransferLeadership = () => {
    setMessage({ type: 'info', text: 'Transfer leadership functionality coming soon!' });
  };

  // Handle quick invite action
  const handleQuickInvite = (action) => {
    switch (action) {
      case 'Copy Invite Link':
        navigator.clipboard.writeText(`${window.location.origin}/join-team/${team._id}`);
        setMessage({ type: 'success', text: 'Invite link copied to clipboard!' });
        break;
      case 'Share via Email':
        setInviteData(prev => ({ ...prev, inviteMethod: 'email' }));
        break;
      case 'Generate QR Code':
        setMessage({ type: 'info', text: 'QR code generation coming soon!' });
        break;
      default:
        break;
    }
  };

  const displayUsers = searchQuery.trim().length > 0 ? searchResults : suggestedUsers;

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="md"
        fullWidth
        scroll="paper"
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
            backdropFilter: 'blur(10px)'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 100%)`,
          py: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
              <TeamIcon />
            </Avatar>
            <Box>
              {isEditingName ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    size="small"
                    autoFocus
                    sx={{ minWidth: 200 }}
                    placeholder="Enter team name..."
                    disabled={loading}
                  />
                  <IconButton 
                    size="small" 
                    onClick={handleUpdateTeamName}
                    disabled={loading}
                    color="success"
                  >
                    {loading ? <CircularProgress size={16} /> : <CheckIcon />}
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => {
                      setIsEditingName(false);
                      setTeamName(team.name);
                    }}
                    color="error"
                    disabled={loading}
                  >
                    <CancelIcon />
                  </IconButton>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h5" fontWeight={700} color="primary.main">
                    {team.name}
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => setIsEditingName(true)}
                    sx={{ color: 'primary.main' }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {team.members?.length || 0} members • {team.projects?.length || 0} projects
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'text.secondary' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ 
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              px: 3,
              '& .MuiTab-root': {
                minHeight: 60,
                fontWeight: 600,
                '&.Mui-selected': {
                  color: 'primary.main',
                }
              }
            }}
            TabIndicatorProps={{
              style: {
                backgroundColor: theme.palette.primary.main,
                height: 3
              }
            }}
          >
            <Tab icon={<TeamIcon />} label="Team Members" />
            <Tab icon={<ProjectIcon />} label="Shared Projects" />
            <Tab icon={<SettingsIcon />} label="Team Settings" />
          </Tabs>

          {/* Members Tab */}
          <TabPanel value={activeTab} index={0}>
            <Box sx={{ px: 3, pb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={600}>Team Members</Typography>
                <Button 
                  variant="contained" 
                  size="small" 
                  startIcon={<PersonAddIcon />}
                  onClick={() => setShowInvite(true)}
                  sx={{ borderRadius: 2 }}
                  disabled={loading}
                >
                  Invite Members
                </Button>
              </Box>

              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <List sx={{ py: 0 }}>
                  {team.members?.map((member, index) => (
                    <React.Fragment key={member._id || member.user?._id || index}>
                      <ListItem sx={{ py: 2 }}>
                        <ListItemAvatar>
                          <Avatar 
                            sx={{ 
                              bgcolor: 'primary.main',
                              width: 44,
                              height: 44,
                              border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`
                            }}
                            src={member.user?.avatar}
                          >
                            {member.user?.name?.[0] || member.name?.[0] || 'U'}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                              <Typography fontWeight={600} variant="subtitle1">
                                {member.user?.name || member.name || 'Unknown Member'}
                              </Typography>
                              {member.role === 'leader' && (
                                <Chip 
                                  label="Team Lead" 
                                  size="small" 
                                  color="primary" 
                                  variant="filled"
                                  sx={{ fontWeight: 600 }}
                                />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                              <Typography variant="body2" color="text.secondary">
                                {member.user?.course || 'Student'} • {member.user?.institution || 'No institution'}
                              </Typography>
                              {member.user?.email && (
                                <Button 
                                  size="small" 
                                  startIcon={<EmailIcon />}
                                  onClick={() => handleContactMember(member.user.email)}
                                  sx={{ 
                                    minWidth: 'auto',
                                    color: 'primary.main',
                                    '&:hover': {
                                      backgroundColor: alpha(theme.palette.primary.main, 0.1)
                                    }
                                  }}
                                >
                                  Contact
                                </Button>
                              )}
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < team.members.length - 1 && (
                        <Divider variant="inset" component="li" sx={{ mx: 2 }} />
                      )}
                    </React.Fragment>
                  ))}
                </List>
              </Card>
            </Box>
          </TabPanel>

          {/* Projects Tab */}
          <TabPanel value={activeTab} index={1}>
            <Box sx={{ px: 3, pb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight={600}>Shared Projects</Typography>
                <Button 
                  variant="contained" 
                  startIcon={<ProjectIcon />}
                  onClick={handleCreateProject}
                  sx={{ borderRadius: 2 }}
                >
                  New Project
                </Button>
              </Box>
              
              {team.projects && team.projects.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {team.projects.map((project, index) => (
                    <Card 
                      key={project._id || index}
                      variant="outlined"
                      sx={{ 
                        borderRadius: 2,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          borderColor: 'primary.main'
                        }
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'secondary.main' }}>
                              <ProjectIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="h6" fontWeight={600}>
                                {project.name || `Project ${index + 1}`}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {project.description || 'No description available'}
                              </Typography>
                            </Box>
                          </Box>
                          <Button 
                            variant="outlined" 
                            onClick={() => handleViewProject(project._id)}
                            sx={{ borderRadius: 2 }}
                          >
                            View Project
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              ) : (
                <Card 
                  variant="outlined" 
                  sx={{ 
                    textAlign: 'center', 
                    py: 6,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, transparent 100%)`
                  }}
                >
                  <CardContent>
                    <ProjectIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No projects yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Start collaborating on your first project with this team
                    </Typography>
                    <Button 
                      variant="contained" 
                      size="large"
                      startIcon={<ProjectIcon />}
                      onClick={handleCreateProject}
                      sx={{ borderRadius: 2 }}
                    >
                      Create Your First Project
                    </Button>
                  </CardContent>
                </Card>
              )}
            </Box>
          </TabPanel>

          {/* Settings Tab */}
          <TabPanel value={activeTab} index={2}>
            <Box sx={{ px: 3, pb: 3 }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>Team Management</Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                    Team Administration
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Manage your team settings and permissions
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button 
                      variant="outlined" 
                      color="primary"
                      onClick={() => setIsEditingName(true)}
                      sx={{ borderRadius: 2 }}
                      disabled={loading}
                    >
                      Change Team Name
                    </Button>
                    <Button 
                      variant="outlined" 
                      color="warning"
                      onClick={handleTransferLeadership}
                      sx={{ borderRadius: 2 }}
                    >
                      Transfer Leadership
                    </Button>
                  </Box>
                </Card>

                <Card variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: 'error.main' }}>
                  <Typography variant="subtitle1" fontWeight={600} gutterBottom color="error">
                    Danger Zone
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Once you leave a team, you'll need to be re-invited to rejoin
                  </Typography>
                  <Button 
                    variant="outlined" 
                    color="error"
                    onClick={handleLeaveTeam}
                    disabled={loading}
                    sx={{ borderRadius: 2 }}
                  >
                    {loading ? 'Leaving...' : 'Leave Team'}
                  </Button>
                </Card>
              </Box>
            </Box>
          </TabPanel>
        </DialogContent>
      </Dialog>

      {/* Enhanced Invite Members Dialog */}
      <Dialog
        open={showInvite}
        onClose={() => !loading && setShowInvite(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 3,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            overflow: 'hidden'
          }
        }}
      >
        {/* Header with gradient */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
            py: 2,
            px: 3,
            position: 'relative'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  width: 40,
                  height: 40,
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                }}
              >
                <PersonAddIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700} color="primary.main">
                  Invite to {team.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Find and invite awesome people to join your squad!
                </Typography>
              </Box>
            </Box>
            <IconButton 
              onClick={() => {
                setShowInvite(false);
                setSelectedUser(null);
                setSearchQuery('');
                setSearchResults([]);
              }}
              disabled={loading}
              sx={{
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main'
                }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        <DialogContent sx={{ p: 3 }}>
          {/* Description */}
          <Box
            sx={{
              textAlign: 'center',
              mb: 3,
              p: 2,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.05)} 0%, transparent 100%)`,
              border: `1px dashed ${alpha(theme.palette.warning.main, 0.3)}`
            }}
          >
            <FlashOnIcon sx={{ color: 'warning.main', mb: 1, fontSize: 24 }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              <strong>Teamwork makes the dream work! </strong> Find your perfect teammates below.
            </Typography>
          </Box>

          {/* Search Section */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SearchIcon fontSize="small" />
                  <span>Search by name, username, or email...</span>
                </Box>
              }
              placeholder="Type to find awesome people... "
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              variant="outlined"
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.background.paper, 0.8),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.03)
                  },
                  '&.Mui-focused': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.05)
                  }
                }
              }}
              InputProps={{
                endAdornment: searchLoading ? (
                  <InputAdornment position="end">
                    <CircularProgress size={20} />
                  </InputAdornment>
                ) : null
              }}
            />
          </Box>

          {/* Selected User Preview */}
          {selectedUser && (
            <Paper
              sx={{
                p: 2,
                mb: 3,
                borderRadius: 2,
                background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, transparent 100%)`,
                border: `2px solid ${alpha(theme.palette.success.main, 0.3)}`
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: 'success.main'
                    }}
                    src={selectedUser.avatar}
                  >
                    {selectedUser.name?.[0]?.toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {selectedUser.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      @{selectedUser.username}
                    </Typography>
                  </Box>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => {
                    setSelectedUser(null);
                    setInviteData({ email: '', username: '', inviteMethod: 'email' });
                  }}
                  sx={{ color: 'text.secondary' }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            </Paper>
          )}

          {/* User Suggestions/Results */}
          <Box sx={{ maxHeight: 400, overflow: 'auto', mb: 3 }}>
            {searchLoading && displayUsers.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size={32} />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Searching for awesome people... 
                </Typography>
              </Box>
            ) : displayUsers.length > 0 ? (
              <Box>
                <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon fontSize="small" />
                  {searchQuery ? 'Search Results' : 'Suggested Teammates'}
                  <Chip 
                    label={displayUsers.length} 
                    size="small" 
                    color="primary" 
                    variant="filled"
                    sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                  />
                </Typography>
                
                {displayUsers.map((user) => (
                  <UserSuggestion
                    key={user._id}
                    user={user}
                    onSelect={handleUserSelect}
                    isSelected={selectedUser?._id === user._id}
                  />
                ))}
              </Box>
            ) : searchQuery.trim().length > 2 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <PersonIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  No users found for "{searchQuery}" 
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Try searching by name, username, or email
                </Typography>
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <GroupIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  Start typing to find teammates! 
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Search by name, username, or email address
                </Typography>
              </Box>
            )}
          </Box>

          {/* Manual Input Fallback */}
          {!selectedUser && (
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon fontSize="small" />
                    <span>Or enter email/username manually</span>
                  </Box>
                }
                placeholder="e.g., alex@example.com or coolusername"
                value={inviteData.email || inviteData.username}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.includes('@')) {
                    setInviteData({ email: value, username: '', inviteMethod: 'email' });
                  } else {
                    setInviteData({ email: '', username: value, inviteMethod: 'username' });
                  }
                }}
                variant="outlined"
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.background.paper, 0.8)
                  }
                }}
              />
            </Box>
          )}

          {/* Quick Actions */}
          <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <FlashOnIcon fontSize="small" />
            Quick Invite Options
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
            {[
              { label: 'Copy Invite Link', icon: <LinkIcon fontSize="small" /> },
              { label: 'Share via Email', icon: <EmailIcon fontSize="small" /> },
              { label: 'Generate QR Code', icon: <QrCodeIcon fontSize="small" /> }
            ].map((action) => (
              <Chip
                key={action.label}
                label={action.label}
                icon={action.icon}
                variant="outlined"
                clickable={!loading}
                onClick={() => handleQuickInvite(action.label)}
                sx={{
                  borderRadius: 2,
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  '&:hover': {
                    backgroundColor: loading ? 'inherit' : alpha(theme.palette.primary.main, 0.1),
                    borderColor: loading ? 'inherit' : theme.palette.primary.main,
                    transform: loading ? 'none' : 'translateY(-1px)'
                  }
                }}
              />
            ))}
          </Box>

          {/* Team Progress Indicator */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.05)} 0%, transparent 100%)`,
              border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
              textAlign: 'center'
            }}
          >
            <TrendingUpIcon sx={{ color: 'info.main', mb: 1, fontSize: 24 }} />
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <strong>Team Growth </strong>
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
              <Typography variant="h6" color="primary.main" fontWeight={700}>
                {team.members?.length || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                current members • goal: {team.members?.length + 1} 
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        {/* Action Buttons */}
        <Box sx={{ p: 3, pt: 0 }}>
          <Button
            variant="contained"
            fullWidth
            size="large"
            startIcon={loading ? <CircularProgress size={20} /> : <PersonAddIcon />}
            onClick={handleInviteSubmit}
            disabled={loading || (!inviteData.email && !inviteData.username && !selectedUser)}
            sx={{
              borderRadius: 2,
              py: 1.5,
              fontWeight: 700,
              fontSize: '1rem',
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.3)}`,
              '&:hover': {
                transform: loading ? 'none' : 'translateY(-2px)',
                boxShadow: loading ? 'inherit' : `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`
              },
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? 'Sending Invite...' : selectedUser ? `Invite ${selectedUser.name}` : 'Send Invitation'}
          </Button>
          
          <Button
            fullWidth
            size="small"
            startIcon={<ScheduleIcon />}
            disabled={loading}
            sx={{
              mt: 1,
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main',
                backgroundColor: 'transparent'
              }
            }}
          >
            Schedule invites for later
          </Button>
        </Box>
      </Dialog>

      {/* Snackbar for messages */}
      <Snackbar
        open={!!message.text}
        autoHideDuration={4000}
        onClose={() => setMessage({ type: '', text: '' })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity={message.type} 
          onClose={() => setMessage({ type: '', text: '' })}
          sx={{ borderRadius: 2 }}
        >
          {message.text}
        </Alert>
      </Snackbar>
    </>
  );
}