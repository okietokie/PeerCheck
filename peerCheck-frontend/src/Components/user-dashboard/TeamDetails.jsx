// TeamDetails.jsx
import React, { useState } from 'react';
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
  CardContent
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
  Close
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axiosClient from '@/api/axiosClient';
import { Text } from 'recharts';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
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
      if (onTeamUpdate) onTeamUpdate(); // Refresh parent component
    } catch (error) {
      console.error('Error updating team name:', error);
      setMessage({ type: 'error', text: 'Failed to update team name' });
      setTeamName(team.name); // Revert to original name
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
      if (onTeamUpdate) onTeamUpdate(); // Refresh parent component
      setTimeout(() => onClose(), 1000); // Close dialog after success
    } catch (error) {
      console.error('Error leaving team:', error);
      setMessage({ type: 'error', text: 'Failed to leave team' });
    } finally {
      setLoading(false);
    }
  };

  // Handle transfer leadership
  const handleTransferLeadership = () => {
    setMessage({ type: 'info', text: 'Transfer leadership functionality coming soon!' });
  };

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
                  />
                  <IconButton 
                    size="small" 
                    onClick={handleUpdateTeamName}
                    disabled={loading}
                    color="success"
                  >
                    <CheckIcon />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => {
                      setIsEditingName(false);
                      setTeamName(team.name);
                    }}
                    color="error"
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
                >
                  Invite Members
                </Button>
              </Box>

              
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <List sx={{ py: 0 }}>
                  {team.members?.map((member, index) => (
                    <React.Fragment key={member._id || index}>
                      <ListItem sx={{ py: 2 }}>
                        <ListItemAvatar>
                          <Avatar 
                            sx={{ 
                              bgcolor: 'primary.main',
                              width: 44,
                              height: 44,
                              border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`
                            }}
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
                                {member.user?.course || 'Student'}
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

      <Dialog
        open={showInvite}
        onClose={() => setShowInvite(false)}
        maxWidth = "sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': 
          {
            borderRadius: 3,
            p: 2
          } 
        }}
      >
        <DialogTitle sx={{ display:'flex' , justifyContent: 'space-between'}}>
          <Typography variant='h6' color='primary.text'>
            Invite Members
          </Typography>
          <IconButton onClick={() => setShowInvite(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Enter email/name/username" sx={{mt: 1}}/>
        </DialogContent>
            <Button 
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
            >
              Send Invite
            </Button>


      </Dialog>
    </>
  );
}