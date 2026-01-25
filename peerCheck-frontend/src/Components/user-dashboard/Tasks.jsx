// Tasks.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Alert,
  Skeleton,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  alpha,
  useTheme
} from '@mui/material';
import {
  Search,
  Add,
  Warning,
  Assessment,
  Security,
  CheckCircle,
  ArrowBack,
  Title,
  Person,
  Circle,
  CalendarMonth,
  TrendingUp,
  Task,
  Settings,
  Delete,
  EditCalendarTwoTone,
  Error,
  AttachFile,
  PlayArrow} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';

// Components
import TaskTableRow from '@/Components/user-dashboard/TaskComponents/TaskTableRow.jsx';
import TaskDetailsModal from '@/Components/user-dashboard/TaskComponents/TaskDetailsModal.jsx';
import ErrorSnack from './ErrorSnack.jsx';
import TourGuide from '../TourGuide.jsx';
import UploadProofModal from './UploadProofModal.jsx';
import TaskTabs from './TaskComponents/TaskTabs.jsx';

// Custom Hook
import useTasks from '@/hooks/useTasks.js';
import TaskTableHeader from './TaskComponents/TableHeader.jsx';

const Tasks = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const isProjectView = Boolean(projectId);

  // Use custom hook for task management logic
  const {
    // State
    tasks,
    filteredTasks,
    loading,
    error,
    authError,
    searchQuery,
    selectedTasks,
    selectedTask,
    detailsOpen,
    uploadProofModalOpen,
    selectedTaskForProof,
    proofUploadMessage,
    sortBy,
    filters,
    userRole,
    activeTab,
    userTeacher,
    
    // Actions
    setSearchQuery,
    setSelectedTask,
    setDetailsOpen,
    setUploadProofModalOpen,
    setSelectedTaskForProof,
    setProofUploadMessage,
    setSortBy,
    setFilters,
    setActiveTab, 
    setFilteredTasks,
    
    // Functions
    fetchTasks,
    handleSelectTask,
    handleSelectAll,
    handleStatusChange,
    handleOpenUploadProof,
    handleProofUploadSuccess,
    handleTaskFieldUpdate,
    handleViewDetails,
    handleDeleteSelected,
    handleTaskUpdate,
    setError
  } = useTasks();

  const allSelected = filteredTasks.length > 0 && selectedTasks.size === filteredTasks.length;

  // Load data on mount
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      p: { xs: 2, sm: 3 },
      backgroundColor: theme.palette.background.default,
    }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h3" fontWeight="700" gutterBottom sx={{ 
              color: theme.palette.text.primary,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1}}
              >
              {isProjectView ? 'Project Tasks' : 'My Tasks'}
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              {isProjectView ? 'Manage and track project tasks with accountability metrics' : 'Track your assigned tasks across all projects'}
            </Typography>
          </Box>
          
          <Button 
            variant="outlined"
            onClick={() => navigate('/user-app/projects')}
            startIcon={<ArrowBack />}
            size="small"
            sx={{ borderRadius: 1 }}
          >
            {isProjectView ? 'Back to Projects' : 'View Projects'}
          </Button>
        </Box>

        {/* Search and Filter Bar */}
        {!authError && (
          <Paper
            sx={{
              p: 2,
              borderRadius: 1,
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              mb: 3
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: theme.palette.text.secondary }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      label="Status"
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="not_started">Not Started</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="paused">Paused</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Risk Level</InputLabel>
                    <Select
                      value={filters.riskLevel}
                      onChange={(e) => setFilters(prev => ({ ...prev, riskLevel: e.target.value }))}
                      label="Risk Level"
                    >
                      <MenuItem value="all">All Risk</MenuItem>
                      <MenuItem value="low">Low Risk</MenuItem>
                      <MenuItem value="medium">Medium Risk</MenuItem>
                      <MenuItem value="high">High Risk</MenuItem>
                    </Select>
                  </FormControl>

                  <Tooltip title="Overdue Only">
                    <IconButton 
                      size="small"
                      color={filters.isOverdue ? "error" : "default"}
                      onClick={() => setFilters(prev => ({ ...prev, isOverdue: !prev.isOverdue }))}
                    >
                      <Warning />
                    </IconButton>
                  </Tooltip>

                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Sort By</InputLabel>
                    <Select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      label="Sort By"
                    >
                      <MenuItem value="deadline">Deadline</MenuItem>
                      <MenuItem value="risk">Risk Score</MenuItem>
                      <MenuItem value="efficiency">Efficiency</MenuItem>
                      <MenuItem value="status">Status</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        )}
      </Box>

      {/* Stats Cards */}
      {!authError && tasks.length > 0 && (
        <Box className='stats-cards-section' sx={{ 
          mb: 4,
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
          gap: 2.5,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: -10,
            left: -10,
            right: -10,
            bottom: -10,
            background: `linear-gradient(135deg, 
              ${alpha(theme.palette.primary.main, 0.03)} 0%, 
              ${alpha(theme.palette.secondary.main, 0.02)} 50%, 
              ${alpha(theme.palette.background.paper, 0.01)} 100%)`,
            borderRadius: 3,
            zIndex: 0,
          }
        }}>
          {[
            { 
              label: 'Total Tasks', 
              value: filteredTasks.length, 
              icon: <Assessment fontSize="small" />,
              color: theme.palette.primary.main,
              gradient: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)}, ${alpha(theme.palette.primary.main, 0.05)})`,
              hoverGradient: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)}, ${alpha(theme.palette.primary.main, 0.1)})`
            },
            { 
              label: 'High Risk', 
              value: filteredTasks.filter(t => t.metrics?.riskScore >= 4).length, 
              icon: <Security fontSize="small" />,
              color: theme.palette.error.main,
              gradient: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.12)}, ${alpha(theme.palette.error.main, 0.04)})`,
              hoverGradient: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.18)}, ${alpha(theme.palette.error.main, 0.08)})`
            },
            { 
              label: 'Completed', 
              value: filteredTasks.filter(t => t.status === 'completed').length, 
              icon: <CheckCircle fontSize="small" />,
              color: theme.palette.success.main,
              gradient: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.12)}, ${alpha(theme.palette.success.main, 0.04)})`,
              hoverGradient: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.18)}, ${alpha(theme.palette.success.main, 0.08)})`
            },
            { 
              label: 'Need Proof', 
              value: filteredTasks.filter(t => !t.metrics?.hasProof).length, 
              icon: <Warning fontSize="small" />,
              color: theme.palette.warning.main,
              gradient: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.12)}, ${alpha(theme.palette.warning.main, 0.04)})`,
              hoverGradient: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.18)}, ${alpha(theme.palette.warning.main, 0.08)})`
            }
          ].map((stat, index) => (
            <Paper
              key={stat.label}
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                background: stat.gradient,
                border: `1.5px solid ${alpha(stat.color, 0.15)}`,
                position: 'relative',
                overflow: 'hidden',
                cursor: 'default',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  background: stat.hoverGradient,
                  border: `1.5px solid ${alpha(stat.color, 0.25)}`,
                  boxShadow: `0 8px 24px ${alpha(stat.color, 0.15)}`,
                  '& .stat-icon-wrapper': {
                    transform: 'scale(1.1) rotate(5deg)',
                  },
                  '& .stat-value': {
                    textShadow: `0 0 20px ${alpha(stat.color, 0.3)}`,
                  }
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: `linear-gradient(90deg, ${stat.color}, ${alpha(stat.color, 0.7)})`,
                  borderRadius: '3px 3px 0 0',
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: -20,
                  right: -20,
                  width: 60,
                  height: 60,
                  background: `radial-gradient(circle, ${alpha(stat.color, 0.08)} 0%, transparent 70%)`,
                  borderRadius: '50%',
                }
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                mb: 1.5,
                position: 'relative',
                zIndex: 1
              }}>
                <Box 
                  className="stat-icon-wrapper"
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: alpha(stat.color, 0.1),
                    border: `1px solid ${alpha(stat.color, 0.2)}`,
                    transition: 'all 0.3s ease',
                    boxShadow: `0 4px 12px ${alpha(stat.color, 0.1)}`,
                  }}
                >
                  <Box sx={{ 
                    color: stat.color,
                    fontSize: 22,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {stat.icon}
                  </Box>
                </Box>
                
                <Typography 
                  className="stat-value"
                  variant="h3"
                  sx={{
                    fontFamily: '"Alkatra", cursive',
                    fontWeight: 700,
                    fontSize: { xs: '2rem', sm: '2.5rem' },
                    color: stat.color,
                    lineHeight: 1,
                    transition: 'all 0.3s ease',
                    background: `linear-gradient(45deg, ${stat.color}, ${alpha(stat.color, 0.8)})`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: `0 0 10px ${alpha(stat.color, 0.2)}`,
                  }}
                >
                  {stat.value}
                </Typography>
              </Box>
              
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                position: 'relative',
                zIndex: 1
              }}>
                <Box sx={{
                  flexShrink: 0,
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: stat.color,
                  boxShadow: `0 0 8px ${alpha(stat.color, 0.5)}`,
                }} />
                
                <Typography 
                  variant="h6"
                  sx={{
                    fontFamily: '"Adlam Display", serif',
                    fontWeight: 500,
                    color: theme.palette.mode === 'dark' ? alpha('#fff', 0.9) : alpha('#000', 0.8),
                    letterSpacing: '0.5px',
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                  }}
                >
                  {stat.label}
                </Typography>
              </Box>
              
              <Typography 
                variant="caption"
                sx={{
                  display: 'block',
                  mt: 0.5,
                  ml: 2,
                  color: theme.palette.mode === 'dark' ? alpha('#fff', 0.6) : alpha('#000', 0.6),
                  fontFamily: '"Inter", sans-serif',
                  fontWeight: 300,
                  fontSize: '0.75rem',
                  letterSpacing: '0.3px',
                }}
              >
                {index === 0 && 'All active tasks in queue'}
                {index === 1 && 'Tasks requiring attention'}
                {index === 2 && 'Successfully finished tasks'}
                {index === 3 && 'Awaiting verification'}
              </Typography>
              
              {/* Progress indicator */}
              <Box sx={{
                mt: 2,
                height: 2,
                background: alpha(theme.palette.mode === 'dark' ? '#fff' : '#000', 0.1),
                borderRadius: 1,
                overflow: 'hidden',
                position: 'relative',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: `${Math.min(100, (stat.value / Math.max(1, filteredTasks.length)) * 100)}%`,
                  background: `linear-gradient(90deg, ${alpha(stat.color, 0.6)}, ${stat.color})`,
                  borderRadius: 1,
                  transition: 'width 0.8s ease',
                }
              }} />
            </Paper>
          ))}
        </Box>
      )}
      <TaskTabs 
        activeTab={activeTab}
        onTabChange={setActiveTab} 
        tasks={tasks}
        userId={userRole?.userId}
        onFilterTasks={setFilteredTasks} 
      />
      {/* Content */}
      {error && !authError ? (
        <Alert 
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      ) : loading ? (
        // Loading Skeletons
        <Box>
          {[...Array(5)].map((_, index) => (
            <Skeleton 
              key={index} 
              variant="rectangular" 
              height={60} 
              sx={{ 
                borderRadius: 1, 
                mb: 1,
                backgroundColor: theme.palette.action.hover
              }} 
            />
          ))}
        </Box>
      ) : filteredTasks.length === 0 || authError ? (
        // Empty State
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: 2,
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          {authError ? (
            <Box>
              <Typography variant="h6" fontWeight="600" gutterBottom sx={{ color: theme.palette.error.main, mb: 1 }}>
                Authentication Required
              </Typography>
              <Typography variant="body2" sx={{ 
                color: theme.palette.text.secondary, 
                mb: 4, 
                maxWidth: 400, 
                mx: 'auto' 
              }}>
                Please log in to view your tasks.
              </Typography>
              <Button
                variant="contained"
                onClick={() => window.location.href = '/'}
              >
                Go to Login
              </Button>
            </Box>
          ) : (
            <Box>
              <Assessment sx={{ 
                fontSize: 60, 
                color: theme.palette.text.disabled, 
                mb: 3,
              }} />
              <Typography variant="h6" fontWeight="600" gutterBottom sx={{ color: theme.palette.text.primary, mb: 1 }}>
                No Tasks Found
              </Typography>
              <Typography variant="body2" sx={{ 
                color: theme.palette.text.secondary, 
                mb: 4, 
                maxWidth: 400, 
                mx: 'auto' 
              }}>
                {searchQuery || Object.values(filters).some(v => v !== 'all' && v !== false)
                  ? 'Try adjusting your search or filters'
                  : isProjectView
                    ? 'No tasks have been created for this project yet'
                    : 'You don\'t have any assigned tasks yet'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                {(searchQuery || Object.values(filters).some(v => v !== 'all' && v !== false)) && (
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setSearchQuery('');
                      setFilters({
                        status: 'all',
                        riskLevel: 'all',
                        hasProof: 'all',
                        isOverdue: false
                      });
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
                {isProjectView && userRole?.role === 'teacher' && (
                  <Button
                    variant="contained"
                    onClick={() => {/* Open create task modal */}}
                    startIcon={<Add />}
                  >
                    Create First Task
                  </Button>
                )}
              </Box>
            </Box>
          )}
        </Paper>
      ) : (
        // Tasks Table
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Paper
            sx={{
              borderRadius: 3,
              background: theme.palette.mode === 'dark' 
                ? `linear-gradient(135deg, 
                    ${alpha(theme.palette.background.paper, 0.95)} 0%, 
                    ${alpha(theme.palette.background.paper, 0.9)} 100%)`
                : `linear-gradient(135deg, 
                    ${alpha(theme.palette.background.paper, 1)} 0%, 
                    ${alpha(theme.palette.background.default, 0.3)} 100%)`,
              border: `1.5px solid ${alpha(theme.palette.primary.main, 0.08)}`,
              overflow: 'hidden',
              position: 'relative',
              boxShadow: `0 4px 24px ${alpha(theme.palette.mode === 'dark' ? '#000' : theme.palette.primary.main, 0.08)}`,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                background: `linear-gradient(90deg, 
                  ${theme.palette.primary.main}, 
                  ${theme.palette.secondary.main})`,
                borderRadius: '12px 12px 0 0',
                zIndex: 1,
              }
            }}
          >
            <TableContainer 
              sx={{
                borderRadius: 3,
                backgroundColor: 'transparent',
                maxHeight: 600,
                '&::-webkit-scrollbar': {
                  width: '8px',
                  height: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: alpha(theme.palette.divider, 0.1),
                  borderRadius: 4,
                },
                '&::-webkit-scrollbar-thumb': {
                  background: alpha(theme.palette.primary.main, 0.3),
                  borderRadius: 4,
                  '&:hover': {
                    background: alpha(theme.palette.primary.main, 0.5),
                  }
                }
              }}
            >
              <Table 
                stickyHeader
                sx={{ 
                  minWidth: 800,
                  borderCollapse: 'separate',
                  borderSpacing: 0,
                }}
              >
                <TaskTableHeader
                  allSelected= {allSelected}
                  selectedTasks= {selectedTasks}
                  handleSelectAll={handleSelectAll}
                  theme={theme}
                />
                <TableBody>
                  {filteredTasks.map((task) => (
                    <TaskTableRow
                      key={task._id}
                      task={task}
                      isSelected={selectedTasks.has(task._id)}
                      onSelect={handleSelectTask}
                      theme={theme}
                      userRole={userRole}
                      onUploadProof={handleOpenUploadProof}
                      onViewDetails={handleViewDetails}
                      onStatusChange={handleStatusChange}
                      onTaskUpdate={handleTaskFieldUpdate}
                      userTeacher={userTeacher}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            {/* Empty State */}
            {filteredTasks.length === 0 && (
              <Box
                sx={{
                  p: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  background: `linear-gradient(135deg, 
                    ${alpha(theme.palette.background.default, 0.5)} 0%, 
                    ${alpha(theme.palette.background.paper, 0.3)} 100%)`,
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, 
                      ${alpha(theme.palette.primary.main, 0.1)} 0%, 
                      ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                    border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
                    mb: 2,
                  }}
                >
                  <Task sx={{ fontSize: 40, color: theme.palette.primary.main, opacity: 0.5 }} />
                </Box>
                <Typography variant="h6" sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}>
                  No tasks found
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, maxWidth: 400, textAlign: 'center' }}>
                  Try adjusting your filters or create a new task to get started
                </Typography>
              </Box>
            )}
            
            {/* Table Footer with Selection */}
            {selectedTasks.size > 0 && (
              <Paper
                sx={{
                  p: 3,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderRadius: '0 0 12px 12px',
                  background: `linear-gradient(135deg, 
                    ${alpha(theme.palette.primary.main, 0.08)} 0%, 
                    ${alpha(theme.palette.primary.main, 0.04)} 100%)`,
                  borderTop: `1.5px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                  borderLeft: `1.5px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                  borderRight: `1.5px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                  borderBottom: `1.5px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: `linear-gradient(90deg, 
                      ${theme.palette.primary.main}, 
                      ${theme.palette.secondary.main})`,
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: `linear-gradient(135deg, 
                        ${alpha(theme.palette.primary.main, 0.2)} 0%, 
                        ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
                      border: `1.5px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                    }}
                  >
                    <CheckCircle sx={{ fontSize: 20, color: theme.palette.primary.main }} />
                  </Box>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: theme.palette.primary.main, 
                      fontWeight: 600,
                      fontFamily: '"Inter", sans-serif',
                    }}
                  >
                    {selectedTasks.size} task{selectedTasks.size !== 1 ? 's' : ''} selected
                  </Typography>
                </Box>
                <Button
                  startIcon={<Delete />}
                  variant="contained"
                  color="error"
                  onClick={handleDeleteSelected}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                    textTransform: 'none',
                    background: `linear-gradient(135deg, 
                      ${theme.palette.error.main} 0%, 
                      ${alpha(theme.palette.error.main, 0.8)} 100%)`,
                    boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.3)}`,
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: `0 6px 16px ${alpha(theme.palette.error.main, 0.4)}`,
                    },
                    transition: 'all 0.2s ease',
                  }}
                > 
                  Delete Selected
                </Button>
              </Paper>
            )}
          </Paper>
        </motion.div>
      )}

      {/* Modals */}
      <TaskDetailsModal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        task={selectedTask}
        theme={theme}
        userRole={userRole}
        onTaskUpdate={handleTaskUpdate}
        onUploadProof={handleOpenUploadProof}
        onStatusChange={handleStatusChange}
      />

      <UploadProofModal
        open={uploadProofModalOpen}
        onClose={() => {
          setUploadProofModalOpen(false);
          setSelectedTaskForProof(null);
        }}
        task={selectedTaskForProof}
        theme={theme}
        onSuccess={() => handleProofUploadSuccess()}
      />

      <Snackbar
        open={proofUploadMessage.open}
        autoHideDuration={3000}
        onClose={() => setProofUploadMessage({ ...proofUploadMessage, open: false })}
      >
        <Alert
          severity={proofUploadMessage.severity}
          variant="filled"
          onClose={() => setProofUploadMessage({ ...proofUploadMessage, open: false })}
        >
          {proofUploadMessage.message}
        </Alert>
      </Snackbar>
      
      <ErrorSnack 
        newError={error}
        onClose={() => setError(null)}
      />
      <TourGuide page='task-tab' />
    </Box>
  );
};

export default Tasks;