import React, { useState, useEffect } from 'react';
import {
  Person,
  Group,
  Search,
  Check,
  Close,
  Replay,
  History,
  Info,
} from "@mui/icons-material";
import {
  Popover,
  Box,
  Typography,
  Avatar,
  Chip,
  IconButton,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemButton,
  alpha,
  InputAdornment,
  Button,
  CircularProgress,
  Alert,
  Tooltip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
} from '@mui/material';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import axiosClient from '@/api/axiosClient';

// Team Member Select Popover with Reassignment
const AssigneeSelectPopover = ({ 
  anchorEl, 
  open, 
  onClose, 
  currentAssignee: propCurrentAssignee,
  onAssigneeSelect,
  theme,
  task, 
  currentUser, 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showReassignConfirm, setShowReassignConfirm] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [teamMembersList, setTeamMembersList] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [currentAssignee, setCurrentAssignee] = useState(propCurrentAssignee);
  const { enqueueSnackbar } = useSnackbar();

  // Reset states when popover closes
  useEffect(() => {
    if (!open) {
      setSearchTerm('');
      setSelectedMember(null);
      setError('');
      setShowReassignConfirm(false);
      setShowHistory(false);
    }
  }, [open]);

  // Sync prop with state
  useEffect(() => {
    setCurrentAssignee(propCurrentAssignee);
  }, [propCurrentAssignee]);

  // Fetch team members when popover opens
  useEffect(() => {
    const fetchTeamMembers = async () => {
      if (open && task?.projectId) {
        setLoadingMembers(true);
        try {
          const response = await axiosClient.get(
            `/user/projects/${task.projectId._id}/members`,
            {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
              },
            }
          );
          
          if (response.data.success) {
            const members = response.data.members || [];
            
            // Sort members: current user first, then by productivity score
            const sortedMembers = members.sort((a, b) => {
              // Put current user at the top
              if (a.user._id === currentUser?.id) return -1;
              if (b.user._id === currentUser?.id) return 1;
              
              // Then sort by productivity score
              const scoreA = a.user.productivity?.overallProductivityScore || 0;
              const scoreB = b.user.productivity?.overallProductivityScore || 0;
              return scoreB - scoreA;
            });
            
            setTeamMembersList(sortedMembers);
            
            // Find current assignee in team members if not provided
            if (task.assignedTo && !currentAssignee) {
              const currentAssigneeMember = sortedMembers.find(
                member => member.user._id === task.assignedTo
              );
              if (currentAssigneeMember) {
                setCurrentAssignee(currentAssigneeMember.user);
              }
            }
          }
        } catch (err) {
          console.error('Failed to fetch team members:', err);
          enqueueSnackbar('Failed to load team members', { variant: 'error' });
        } finally {
          setLoadingMembers(false);
        }
      }
    };

    if (open) {
      fetchTeamMembers();
    }
  }, [open, task?.projectId, currentUser?.id, task?.assignedTo, currentAssignee]);

  // Check if current user can reassign this task
  const canReassign = task && currentUser && (
    task.assignedBy?.toString() === currentUser?.id?.toString() ||
    currentUser?.role === 'teacher' ||
    currentUser?.role === 'admin'
  );

  // Filter team members based on search, exclude current assignee
  const filteredMembers = teamMembersList.filter(member =>
    member.user && (
      member.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    ) &&
    member.user?._id !== task?.assignedTo?.toString()
  );

  // Get current assignee name for display
  const getCurrentAssigneeName = () => {
    if (!currentAssignee && task?.assignedTo) {
      const assignee = teamMembersList.find(member => 
        member.user?._id === task.assignedTo
      );
      return assignee?.user?.name || 'Unknown';
    }
    return currentAssignee?.name || 'Unknown';
  };

  // Get current assignee avatar
  const getCurrentAssigneeAvatar = () => {
    if (!currentAssignee && task?.assignedTo) {
      const assignee = teamMembersList.find(member => 
        member.user?._id === task.assignedTo
      );
      return assignee?.user?.avatar;
    }
    return currentAssignee?.avatar;
  };

  // Handle member selection
  const handleMemberSelect = (member) => {
    if (!task || !canReassign) {
      if (onAssigneeSelect) {
        onAssigneeSelect(member);
      }
      onClose();
      return;
    }

    // If selecting same user, just close
    if (member?.user?._id === task.assignedTo?.toString()) {
      onClose();
      return;
    }

    // Show reassign confirmation
    setSelectedMember(member);
    setShowReassignConfirm(true);
  };

  // Handle reassign confirmation
  const handleReassignConfirm = async () => {
    if (!task || !selectedMember) return;

    try {
      setLoading(true);
      setError('');

      const response = await axiosClient.patch(
        `/user/task/${task._id}/reassign`,
        { 
          newAssigneeId: selectedMember.user._id 
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success) {
        enqueueSnackbar('Task reassigned successfully!', { variant: 'success' });
        
        if (onAssigneeSelect) {
          onAssigneeSelect(selectedMember);
        }

        setCurrentAssignee(selectedMember.user);
        onClose();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to reassign task';
      setError(errorMsg);
      enqueueSnackbar(errorMsg, { variant: 'error' });
    } finally {
      setLoading(false);
      setShowReassignConfirm(false);
      setSelectedMember(null);
    }
  };

  // Handle unassign
  const handleUnassign = async () => {
    if (!task || !canReassign) return;

    try {
      setLoading(true);
      setError('');

      const response = await axiosClient.patch(
        `/tasks/${task._id}/reassign`,
        { newAssigneeId: null },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success) {
        enqueueSnackbar('Task unassigned successfully!', { variant: 'success' });
        
        if (onAssigneeSelect) {
          onAssigneeSelect(null);
        }

        setCurrentAssignee(null);
        onClose();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to unassign task';
      setError(errorMsg);
      enqueueSnackbar(errorMsg, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Handle close reassign confirm
  const handleCloseReassignConfirm = () => {
    if (!loading) {
      setShowReassignConfirm(false);
      setSelectedMember(null);
      setError('');
    }
  };

  // Handle close history
  const handleCloseHistory = () => {
    setShowHistory(false);
  };

  // Render assignment history badge
  const renderHistoryBadge = () => {
    if (!task?.assignmentHistory?.length) return null;

    return (
      <Tooltip title="View assignment history">
        <Badge 
          badgeContent={task.assignmentHistory.length} 
          color="primary"
          sx={{ ml: 1 }}
        >
          <IconButton
            size="small"
            onClick={() => setShowHistory(true)}
            disabled={loading}
          >
            <History fontSize="small" />
          </IconButton>
        </Badge>
      </Tooltip>
    );
  };

  // Render reassign indicator
  const renderReassignIndicator = () => {
    if (!task || !canReassign) return null;

    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 1,
        p: 1,
        bgcolor: alpha(theme.palette.info.light, 0.1),
        borderRadius: 1,
        border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
      }}>
        <Info fontSize="small" sx={{ 
          color: theme.palette.info.main,
          mr: 1 
        }} />
        <Typography variant="caption" color="text.secondary">
          Reassigning will track focus time and update productivity metrics
        </Typography>
      </Box>
    );
  };

  // Render productivity indicators for members
  const renderProductivityBadge = (member) => {
    if (!member?.user) return null;
    
    const productivity = member.user?.productivity;
    if (!productivity?.overallProductivityScore) return null;

    const score = productivity.overallProductivityScore;
    let color = 'default';
    
    if (score >= 80) color = 'success';
    else if (score >= 60) color = 'warning';
    else color = 'error';

    return (
      <Tooltip title={`Productivity: ${score.toFixed(0)}%`}>
        <Chip
          label={`${score.toFixed(0)}%`}
          size="small"
          color={color}
          variant="outlined"
          sx={{ 
            height: 20, 
            fontSize: '0.65rem',
            ml: 1 
          }}
        />
      </Tooltip>
    );
  };

  return (
    <>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            backgroundColor: theme.palette.background.paper,
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            width: 360,
            maxHeight: 500,
            overflow: 'hidden',
          }
        }}
      >
        {/* Header */}
        <Box sx={{
          p: 2,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          backgroundColor: alpha(theme.palette.background.default, 0.5),
        }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            mb: 1 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="subtitle1" fontWeight={600}>
                {task && canReassign ? 'Reassign Task' : 'Assign Task'}
              </Typography>
              {renderHistoryBadge()}
            </Box>
            <IconButton 
              size="small" 
              onClick={onClose}
              disabled={loading}
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>
          
          {/* Current Assignee Info */}
          {task?.assignedTo && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 1,
              p: 1,
              bgcolor: alpha(theme.palette.primary.light, 0.1),
              borderRadius: 1,
            }}>
              <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                Currently assigned to:
              </Typography>
              <Chip
                label={getCurrentAssigneeName()}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Box>
          )}
          
          {/* Reassign warning */}
          {renderReassignIndicator()}

          {/* Search */}
          <TextField
            size="small"
            placeholder="Search team members..."
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 1 }}
          />
          
          <Typography variant="caption" color="text.secondary">
            {loadingMembers ? 'Loading members...' : `${filteredMembers.length} available member${filteredMembers.length !== 1 ? 's' : ''}`}
          </Typography>
        </Box>

        {/* Member List */}
        <Box sx={{ maxHeight: 350, overflow: 'auto' }}>
          {loadingMembers ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <CircularProgress size={32} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Loading team members...
              </Typography>
            </Box>
          ) : filteredMembers.length > 0 ? (
            <List disablePadding>
              {filteredMembers.map((member) => (
                <ListItem 
                  key={member.user?._id || member.user?.id} 
                  disablePadding
                  sx={{
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    '&:last-child': { borderBottom: 'none' }
                  }}
                >
                  <ListItemButton
                    onClick={() => handleMemberSelect(member)}
                    disabled={loading}
                    sx={{
                      py: 1.5,
                      px: 2,
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.action.hover, 0.05),
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={member.user?.avatar}
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                        }}
                      >
                        {member.user?.name?.charAt(0) || 'U'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" fontWeight={500}>
                            {member.user?.name || 'Unknown User'}
                          </Typography>
                          {renderProductivityBadge(member)}
                        </Box>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {member.user?.email}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          ) : (
            <Box sx={{ 
              p: 4, 
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
            }}>
              <Box sx={{ 
                width: 48, 
                height: 48, 
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: alpha(theme.palette.divider, 0.1),
              }}>
                <Group sx={{ 
                  fontSize: 24, 
                  color: alpha(theme.palette.text.secondary, 0.5),
                }} />
              </Box>
              <Typography variant="body2" color="text.secondary">
                No available team members found
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {searchTerm ? 'Try a different search term' : 'All team members are already assigned'}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Footer */}
        <Box sx={{
          p: 1.5,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          backgroundColor: alpha(theme.palette.background.default, 0.5),
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          {task && canReassign && task.assignedTo && (
            <Button
              size="small"
              onClick={handleUnassign}
              disabled={loading}
              startIcon={<Close />}
              sx={{ fontSize: '0.75rem' }}
              color="error"
              variant="outlined"
            >
              Unassign Task
            </Button>
          )}
          <Typography variant="caption" color="text.secondary">
            {task && canReassign ? 'Click a member to reassign' : 'Select assignee'}
          </Typography>
        </Box>
      </Popover>

      {/* Reassign Confirmation Dialog - RENDERED OUTSIDE POPOVER */}
      <Dialog
        open={showReassignConfirm}
        onClose={handleCloseReassignConfirm}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Confirm Task Reassignment
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            You are about to reassign this task:
          </Typography>
          
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            bgcolor: alpha(theme.palette.background.paper, 0.5), 
            borderRadius: 1,
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          }}>
            <Typography variant="body2" fontWeight={600} gutterBottom>
              {task?.title}
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mt: 1,
              flexWrap: 'wrap',
              gap: 2,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar 
                  src={getCurrentAssigneeAvatar()} 
                  sx={{ width: 32, height: 32 }}
                >
                  {getCurrentAssigneeName()?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    From:
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {getCurrentAssigneeName()}
                  </Typography>
                </Box>
              </Box>
              
              <Replay color="action" sx={{ flexShrink: 0 }} />
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    To:
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    {selectedMember?.user?.name}
                  </Typography>
                </Box>
                <Avatar 
                  src={selectedMember?.user?.avatar} 
                  sx={{ width: 32, height: 32 }}
                >
                  {selectedMember?.user?.name?.charAt(0)}
                </Avatar>
              </Box>
            </Box>
          </Box>

          {task?.lastEventTime && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Focus time will be recorded for the previous assignee and productivity metrics will be updated.
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseReassignConfirm}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleReassignConfirm}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Check />}
            color="primary"
          >
            {loading ? 'Reassigning...' : 'Confirm Reassign'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* History Dialog - RENDERED OUTSIDE POPOVER */}
      <Dialog
        open={showHistory}
        onClose={handleCloseHistory}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <History sx={{ mr: 1 }} />
            Assignment History
          </Box>
          <Typography variant="caption" display="block" color="text.secondary">
            {task?.title}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {task?.assignmentHistory?.length > 0 ? (
            <List>
              {task.assignmentHistory.map((entry, index) => {
                const user = teamMembersList.find(m => 
                  m.user?._id === entry.userId?.toString() || 
                  m.user?._id === entry.userId?._id?.toString()
                )?.user;
                
                return (
                  <React.Fragment key={index}>
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar src={user?.avatar}>
                          {user?.name?.charAt(0) || 'U'}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" fontWeight={500}>
                              {user?.name || 'Unknown User'}
                            </Typography>
                            {entry.efficiency > 0 && (
                              <Chip
                                label={`Eff: ${entry.efficiency.toFixed(1)}%`}
                                size="small"
                                color={entry.efficiency > 100 ? 'error' : 'success'}
                                variant="outlined"
                              />
                            )}
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="caption" display="block">
                              {new Date(entry.from).toLocaleDateString()} → {new Date(entry.to).toLocaleDateString()}
                            </Typography>
                            {entry.focusTime > 0 && (
                              <Typography variant="caption" display="block">
                                Focus: {Math.floor(entry.focusTime / 60)} min
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                    {index < task.assignmentHistory.length - 1 && <Divider />}
                  </React.Fragment>
                );
              })}
            </List>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">
                No assignment history available
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHistory}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AssigneeSelectPopover;