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
} from '@mui/material';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import axiosClient from '@/api/axiosClient';

// Team Member Select Popover with Reassignment
const AssigneeSelectPopover = ({ 
  anchorEl, 
  open, 
  onClose, 
  teamMembers, 
  currentAssignee,
  onAssigneeSelect,
  theme,
  task, // Add task prop for reassignment
  currentUser, // Current logged-in user for authorization check
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showReassignConfirm, setShowReassignConfirm] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  // Check if current user can reassign this task
  const canReassign = task && (
    task.assignedBy.toString() === currentUser?.id ||
    currentUser?.role === 'teacher'
  );

  // Filter team members based on search
  const filteredMembers = (teamMembers || []).filter(member =>
    member.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle member selection
  const handleMemberSelect = (member) => {
    if (!task || !canReassign) {
      // If no task or no reassign permission, just assign normally
      if (onAssigneeSelect) {
        onAssigneeSelect(member);
      }
      onClose();
      return;
    }

    // If selecting same user, just close
    if (member?.user?._id === task.assignedTo) {
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
        `/tasks/${task._id}/reassign`,
        { newAssigneeId: selectedMember.user._id },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success) {
        enqueueSnackbar('Task reassigned successfully!', { variant: 'success' });
        
        // Call the onAssigneeSelect callback with new assignee
        if (onAssigneeSelect) {
          onAssigneeSelect(selectedMember);
        }

      }

      setShowReassignConfirm(false);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reassign task');
      enqueueSnackbar(err.response?.data?.error || 'Failed to reassign task', { 
        variant: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Render assignment history badge
  const renderHistoryBadge = () => {
    if (!task?.assignmentHistory?.length) return null;

    return (
      <Tooltip title="View assignment history">
        <IconButton
          size="small"
          onClick={() => setShowHistory(true)}
          sx={{ ml: 1 }}
        >
          <History fontSize="small" />
        </IconButton>
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
        bgcolor: alpha(theme.palette.warning.light, 0.1),
        borderRadius: 1,
        border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
      }}>
        <Info fontSize="small" sx={{ 
          color: theme.palette.warning.main,
          mr: 1 
        }} />
        <Typography variant="caption" color="text.secondary">
          Reassigning will track focus time and update assignment history
        </Typography>
      </Box>
    );
  };

  // History Dialog Component
  const HistoryDialog = () => (
    <Dialog
      open={showHistory}
      onClose={() => setShowHistory(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Assignment History
        <Typography variant="caption" display="block" color="text.secondary">
          {task?.title}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <List>
          {task?.assignmentHistory?.map((entry, index) => (
            <React.Fragment key={index}>
              <ListItem alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar>
                    {entry.userId?.name?.charAt(0) || 'U'}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="body2" fontWeight={500}>
                      {entry.userId?.name || 'Unknown User'}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography variant="caption" display="block">
                        From: {new Date(entry.from).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" display="block">
                        To: {new Date(entry.to).toLocaleDateString()}
                      </Typography>
                      {entry.focusTime && (
                        <Typography variant="caption" display="block">
                          Focus Time: {Math.floor(entry.focusTime / 60)} minutes
                        </Typography>
                      )}
                      {entry.efficiency && (
                        <Typography variant="caption" display="block">
                          Efficiency: {entry.efficiency.toFixed(1)}%
                        </Typography>
                      )}
                    </>
                  }
                />
              </ListItem>
              {index < task.assignmentHistory.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowHistory(false)}>Close</Button>
      </DialogActions>
    </Dialog>
  );

  // Reassign Confirmation Dialog
  const ReassignConfirmDialog = () => (
    <Dialog
      open={showReassignConfirm}
      onClose={() => setShowReassignConfirm(false)}
    >
      <DialogTitle>
        Confirm Reassignment
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" gutterBottom>
          Are you sure you want to reassign this task?
        </Typography>
        
        <Box sx={{ mt: 2, p: 2, bgcolor: alpha(theme.palette.info.light, 0.1), borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary" display="block">
            Current assignee: {currentAssignee?.user?.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            New assignee: {selectedMember?.user?.name}
          </Typography>
        </Box>

        {task?.lastEventTime && (
          <Box sx={{ mt: 2, p: 2, bgcolor: alpha(theme.palette.warning.light, 0.1), borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Note: Focus time will be recorded for the previous assignee
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={() => setShowReassignConfirm(false)}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleReassignConfirm}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <Replay />}
          color="warning"
        >
          {loading ? 'Reassigning...' : 'Confirm Reassign'}
        </Button>
      </DialogActions>
    </Dialog>
  );

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
            width: 320,
            maxHeight: 400,
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
            <IconButton size="small" onClick={onClose}>
              <Close fontSize="small" />
            </IconButton>
          </Box>
          
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
            {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''} available
          </Typography>
        </Box>

        {/* Member List */}
        <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
          {filteredMembers.length > 0 ? (
            <List disablePadding>
              {filteredMembers.map((member) => (
                <ListItem 
                  key={member.user._id} 
                  disablePadding
                  sx={{
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    '&:last-child': { borderBottom: 'none' }
                  }}
                >
                  <ListItemButton
                    onClick={() => handleMemberSelect(member)}
                    selected={currentAssignee?._id === member.user._id}
                    disabled={member.user._id === task?.assignedTo && canReassign}
                    sx={{
                      py: 1.5,
                      px: 2,
                      '&.Mui-selected': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                      },
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.action.hover, 0.05),
                      },
                      '&.Mui-disabled': {
                        opacity: 0.5,
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={member.user.avatar}
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                        }}
                      >
                        {member.user.name?.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" fontWeight={500}>
                            {member.user.name}
                          </Typography>
                          {member.user._id === task?.assignedTo && canReassign && (
                            <Chip
                              label="Current"
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {member.user.email}
                        </Typography>
                      }
                    />
                    {currentAssignee?._id === member.user._id && (
                      <Check fontSize="small" color="primary" />
                    )}
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
                No team members found
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Try a different search term
              </Typography>
            </Box>
          )}
        </Box>

        {/* Footer */}
        {teamMembers?.length > 0 && (
          <Box sx={{
            p: 1.5,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            backgroundColor: alpha(theme.palette.background.default, 0.5),
            display: 'flex',
            justifyContent: 'space-between',
          }}>
            {task && canReassign && (
              <Button
                size="small"
                onClick={() => handleMemberSelect(null)}
                disabled={!task.assignedTo}
                startIcon={<Close />}
                sx={{ fontSize: '0.75rem' }}
              >
                Unassign
              </Button>
            )}
            <Typography variant="caption" color="text.secondary">
              {task && canReassign ? 'Reassign tracks history' : 'Click to assign'}
            </Typography>
          </Box>
        )}
      </Popover>

      {/* Dialogs */}
      <ReassignConfirmDialog />
      <HistoryDialog />
    </>
  );
};

export default AssigneeSelectPopover;