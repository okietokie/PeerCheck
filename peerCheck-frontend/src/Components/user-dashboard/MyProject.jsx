// MyProject.jsx
import React, { useState } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Chip, 
  Avatar, 
  LinearProgress,
  Grid,
  Card,
  CardContent,
  Paper,
  Tabs,
  Tab,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Badge,
  alpha,
  useTheme,
  CircularProgress,
  InputAdornment,
  Tooltip,
  Fab,
  Drawer,
  useMediaQuery,
  Menu,
  MenuItem,
  Autocomplete,
  Alert,
  Snackbar,
  Checkbox,
  Stack,
  FormControl,
  InputLabel,
  Select,
  Skeleton,
  Accordion
} from '@mui/material';
import {
  Edit,
  People,
  ExpandMore,
  CheckCircle,
  Assessment,
  PersonAdd,
  Upload,
  MoreVert,
  DragIndicator,
  Timeline,
  BarChart,
  Note,
  AttachFile,
  AccessTime,
  Task,
  Group,
  Description,
  Analytics,
  Download,
  Delete,
  Visibility,
  ArrowBack,
  Close,
  Folder,
  Info,
  TrendingUp,
  Comment,
  Speed,
  Warning,
  Error,
  CalendarToday,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Refresh,
  Grade,
  PlayArrow,
  Pause,
  Timer,
  FilterList,
  Sort,
  Search,
  Add,
  MoreHoriz,
  ArrowForward,
  Star,
  WorkspacePremium,
  Rocket,
  Psychology,
  Code,
  DesignServices,
  AutoGraph,
  Cloud,
  Terminal,
  Palette,
  Brightness4,
  Brightness7,
  RefreshOutlined,
  Man,
  Person,
  AddTask,
  PlayArrow as PlayArrowIcon,
  Security,
  History,
  Settings,
  Lock,
  RateReview,
  Title,
  Circle,
  CalendarMonth
} from '@mui/icons-material';
import StarIcon from '@mui/icons-material/Star';
import RateReviewIcon from '@mui/icons-material/RateReview';
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';

// Components
import { CreateTaskModal } from './Projects';
import UploadProofModal from './UploadProofModal';
import { StickyNoteEditor } from './StickyNoteEditor.jsx';
import PeerReviewTab from './PeerReviewTab.jsx';
import { TaskTableRow } from './TaskComponents/TaskTableRow.jsx';
import TaskDetailsModal from './TaskComponents/TaskDetailsModal.jsx';

// Custom Hooks
import useMyProject from '@/hooks/useMyProjects.jsx';
import { width } from '@mui/system';
import TaskTableHeader from './TaskComponents/TableHeader';

// Helper functions
const formatTime = (seconds) => {
  if (!seconds) return '0m';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

const MyProject = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { projectId } = useParams();
  const isMobile = useMediaQuery('(max-width: 900px)');

  // Use custom hook for all business logic
  const {
    // State
    loading,
    project,
    snackbarOpen,
    snackbarMessage,
    snackbarSeverity,
    user,
    members,
    activeMemberCount,
    createTaskModalOpen,
    teams,
    projectCompleted,
    selectedTaskForProof,
    uploadProofOpen,
    peerReviews,
    aggregatedScores,
    userPeerScore,
    reviewDialogOpen,
    selectedReviewee,
    reviewScores,
    reviewComment,
    activeTab,
    addMemberDialog,
    projectFiles,
    activityLog,
    tasks,
    searchQuery,
    selectedTasks,
    selectedTask,
    detailsOpen,
    sortBy,
    filters,
    userRole,
    userTeacher,
    memberEfficiencies,
    overallEfficiency,
    projectMetrics,
    stickyNotes,
    isLoadingNotes,
    showNewNoteDialog,
    editingNote,
    completionStatus,
    
    // Setters
    setActiveTab,
    setAddMemberDialog,
    setSearchQuery,
    setSelectedTask,
    setDetailsOpen,
    setUploadProofOpen,
    setSelectedTaskForProof,
    setCreateTaskModalOpen,
    setSelectedTasks,
    setSortBy,
    setFilters,
    
    // Functions
    showSnackbar,
    setSnackbarOpen,
    handleEditProjectButton,
    handleRefresh,
    onCreateTask,
    handleSelectTask,
    handleSelectAll,
    handleStatusChange,
    handleUploadProof,
    handleViewDetails,
    handleTaskFieldUpdate,
    handleDeleteSelected,
    handleTaskUpdate,
    handleProjectComplete,
    createStickyNote,
    deleteStickyNote,
    togglePinNote,
    getThemeColor,
    getContrastColor,
    getGradientBackground,
    getCardGradient,
    getBorderColor,
    getGlassEffect,
    getStatusColor,
    getRiskColor,
    getEfficiencyColor,
    TabContent,
    StatCard,
    FloatingActionButton,
      isEditing,
  editedProject,
  handleCancelEdit,
  updateProjectField,
      formatDateForInput,
    parseDateFromInput,
    formatDate
  } = useMyProject(projectId, navigate, theme);

  if (!projectId) {
    return (
      <LinearProgress> 
        Nothing to see here?  
        1. Go to Projects Tab 
        2. Double Click on a project! 
        3. That opens here!
      </LinearProgress>
    );
  }

  if (loading && !project) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        bgcolor: 'background.default'
      }}>
        <CircularProgress
          sx={{ 
            color: getThemeColor('primary'),
          }}
        />
      </Box>
    );
  }

  const allSelected = tasks.length > 0 && selectedTasks.size === tasks.length;
  console.log("project: ", project);
  return (
    <>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

      <Box 
        sx={{ 
          bgcolor: 'background.default', 
          minHeight: '100vh',
          position: 'relative',
          overflow: 'hidden',
          background: getGradientBackground(),
          transition: 'background 0.5s ease',
        }}
      >
        {/* Animated background elements */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 0,
          opacity: theme.palette.mode === 'dark' ? 0.1 : 0.05,
        }}>
          {[...Array(20)].map((_, i) => (
            <Box
              key={i}
              sx={{
                position: 'absolute',
                width: Math.random() * 100 + 50,
                height: 2,
                background: `linear-gradient(90deg, transparent, ${getThemeColor('primary')}, transparent)`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: 'pulse 3s infinite',
                animationDelay: `${Math.random() * 5}s`,
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 0.1 },
                  '50%': { opacity: 0.5 },
                }
              }}
            />
          ))}
        </Box>

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, py: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate('/user-app/projects')}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  fontFamily: '"Adlam Display", serif',
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  color: theme.palette.text.primary,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                    transform: 'translateX(-4px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Back to Projects
              </Button>
            </motion.div>

            <Box sx={{display: 'flex', gap:'1em', px: 1}}>
              <Tooltip title="Create New Task">
                <IconButton 
                  size="small" 
                  onClick={() => onCreateTask(project)} 
                  disabled={project?.status === 'COMPLETED' || project?.createdBy._id !== user?._id}
                  sx={{
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    color: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.2),
                      transform: 'rotate(30deg)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <AddTask fontSize="large" />
                </IconButton> 
              </Tooltip>
              
              <Tooltip title="Refresh Project Data">
                <IconButton
                  onClick={handleRefresh}
                  sx={{
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    color: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.2),
                      transform: 'rotate(180deg)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  <RefreshOutlined />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Project Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Box
              sx={{
                display: "flex", 
                gap: 2, 
                alignItems:"stretch",
                alignContent: 'center'
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  flex:1,
                  height:'auto',
                  p: { xs: 3, md: 4 },
                  mb: 4,
                  borderRadius: 4,
                  ...getGlassEffect(),
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '100%',
                    background: `linear-gradient(45deg, 
                      ${alpha(theme.palette.primary.main, 0.05)} 0%, 
                      transparent 50%, 
                      ${alpha(theme.palette.secondary.main, 0.05)} 100%
                    )`,
                    zIndex: 0,
                  }
                }}
              >
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                    <Box sx={{ flex: 1, minWidth: '300px' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar
                          sx={{
                            width: 60,
                            height: 60,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            fontSize: 24,
                            fontWeight: 'bold',
                            boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
                            border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                          }}
                        >
                          <Psychology />
                        </Avatar>
                        <Box>
                          {isEditing ? (
                            <TextField
                              value={editedProject?.projectName || ''}
                              onChange={(e) => updateProjectField('projectName', e.target.value)}
                              variant="outlined"
                              fullWidth
                              sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                  fontSize: '2rem',
                                  fontWeight: 500,
                                  borderRadius: 2,
                                  backgroundColor: alpha(theme.palette.background.paper, 0.8),
                                }
                              }}
                            />
                          ) : (
                            <Typography variant="h2" sx={{ 
                              fontFamily: '"Adlam Display", serif',
                              fontWeight: 500,
                              mb: 0.5,
                              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                              backgroundClip: 'text',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              textShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.2)}`,
                            }}>
                              {project?.projectName || 'Unnamed Project'}
                            </Typography>
                          )}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                            <Chip 
                              label={project?.status || 'Unknown'} 
                              color={project?.status === 'ongoing' ? 'primary' : 'default'}
                              icon={<Rocket fontSize="small" />}
                              sx={{ 
                                fontFamily: '"Adlam Display", serif',
                                fontWeight: 600,
                                borderRadius: 2,
                                background: `linear-gradient(135deg, ${getThemeColor('primary')}, ${alpha(getThemeColor('primary'), 0.8)})`,
                                color: getContrastColor(getThemeColor('primary')),
                                boxShadow: `0 4px 15px ${alpha(getThemeColor('primary'), 0.3)}`,
                              }}
                            />
                            
                            {isEditing ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CalendarToday fontSize="small" />
                                <TextField
                                  type="date"
                                  value={formatDateForInput(editedProject?.endDate) || ''}
                                  onChange={(e) => {
                                    const isoDate = parseDateFromInput(e.target.value);
                                    if (isoDate) {
                                      updateProjectField('endDate', isoDate);
                                    }
                                  }}
                                  size="small"
                                  InputLabelProps={{
                                    shrink: true,
                                  }}
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: 1,
                                      backgroundColor: alpha(theme.palette.background.paper, 0.8),
                                    }
                                  }}
                                />
                              </Box>
                            ) : (
                              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CalendarToday fontSize="small" />
                                Deadline: {formatDate(project?.deadline) || 'No date set'}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Box>

                      {/* Progress Section */}
                      <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="body2" sx={{ 
                            fontFamily: '"Adlam Display", serif',
                            fontWeight: 500,
                          }}>
                            Project Progress
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {projectMetrics?.weightedProgress || project?.progress || 0}%
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={projectMetrics?.weightedProgress || project?.progress || 0} 
                          sx={{ 
                            height: 10, 
                            borderRadius: 5,
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                            '& .MuiLinearProgress-bar': {
                              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                              borderRadius: 5,
                              boxShadow: `0 0 10px ${alpha(theme.palette.primary.main, 0.5)}`,
                            }
                          }}
                        />
                      </Box>
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      {isEditing ? (
                        <>
                          <Button 
                            variant="contained" 
                            startIcon={<CheckCircle />}
                            onClick={handleEditProjectButton}
                            sx={{ 
                              fontFamily: '"Adlam Display", serif',
                              borderRadius: 2,
                              px: 3,
                              py: 1,
                              background: `linear-gradient(135deg, ${getThemeColor('success')}, ${alpha(getThemeColor('success'), 0.8)})`,
                              color: getContrastColor(getThemeColor('success')),
                              boxShadow: `0 4px 20px ${alpha(getThemeColor('success'), 0.4)}`,
                              '&:hover': {
                                boxShadow: `0 8px 25px ${alpha(getThemeColor('success'), 0.6)}`,
                                transform: 'translateY(-2px)',
                              },
                              transition: 'all 0.3s ease',
                            }}
                          >
                            Save Changes
                          </Button>
                          <Button 
                            variant="outlined" 
                            startIcon={<Close />}
                            onClick={handleCancelEdit}
                            sx={{ 
                              fontFamily: '"Adlam Display", serif',
                              borderRadius: 2,
                              px: 3,
                              py: 1,
                              borderWidth: 2,
                              borderColor: alpha(theme.palette.error.main, 0.3),
                              color: theme.palette.error.main,
                              '&:hover': {
                                borderWidth: 2,
                                borderColor: theme.palette.error.main,
                                backgroundColor: alpha(theme.palette.error.main, 0.05),
                              }
                            }}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            variant="outlined" 
                            startIcon={<Edit />}
                            onClick={handleEditProjectButton}
                            disabled={project?.status === 'completed' || project?.createdBy?._id !== user?._id}
                            sx={{ 
                              fontFamily: '"Adlam Display", serif',
                              borderRadius: 2,
                              px: 3,
                              py: 1,
                              borderWidth: 2,
                              borderColor: alpha(theme.palette.primary.main, 0.3),
                              color: theme.palette.primary.main,
                              '&:hover': {
                                borderWidth: 2,
                                borderColor: theme.palette.primary.main,
                                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                              }
                            }}
                          >
                            Edit Project
                          </Button>
                          <Button 
                            variant="contained" 
                            startIcon={<CheckCircle />}
                            onClick={handleProjectComplete}
                            sx={{ 
                              fontFamily: '"Adlam Display", serif',
                              borderRadius: 2,
                              px: 3,
                              py: 1,
                              background: projectCompleted === 'completed'
                                          ? `darkyellow`
                                          :  `linear-gradient(135deg, ${getThemeColor('success')}, ${alpha(getThemeColor('success'), 0.8)})`,
                              color: getContrastColor(getThemeColor('success')),
                              boxShadow: `0 4px 20px ${alpha(getThemeColor('success'), 0.4)}`,
                              '&:hover': {
                                boxShadow: `0 8px 25px ${alpha(getThemeColor('success'), 0.6)}`,
                                transform: 'translateY(-2px)',
                              },
                              transition: 'all 0.3s ease',
                            }}
                          >
                            {projectCompleted === 'completed' ? "Project Completed" : "Mark Complete"}
                          </Button>
                        </>
                      )}
                    </Box>
                  </Box>

                  {/* Description */}
                  <Box sx={{ mb: 3 }}>
                    {isEditing ? (
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        value={editedProject?.description || ''}
                        onChange={(e) => updateProjectField('description', e.target.value)}
                        variant="outlined"
                        label="Project Description"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: alpha(theme.palette.background.paper, 0.8),
                          }
                        }}
                      />
                    ) : (
                      <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                        {project?.description || 'No description available'}
                      </Typography>
                    )}
                  </Box>

                  {/* ToolKit */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ 
                      mb: 1.5,
                      fontFamily: '"Adlam Display", serif',
                      fontWeight: 500,
                      color: theme.palette.text.secondary,
                    }}>
                      Project Toolkit 
                    </Typography>
                    {isEditing ? (
                      <Autocomplete
                        multiple
                        freeSolo
                        value={editedProject?.toolkit || []}
                        onChange={(event, newValue) => {
                          updateProjectField('toolkit', newValue);
                        }}
                        options={[]}
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              variant="outlined"
                              label={option}
                              {...getTagProps({ index })}
                              sx={{ 
                                borderRadius: 2,
                                borderColor: alpha(theme.palette.primary.main, 0.3),
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.text.primary,
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                  borderColor: theme.palette.primary.main,
                                },
                              }}
                            />
                          ))
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            variant="outlined"
                            placeholder="Add tools (press Enter after each)"
                            size="small"
                          />
                        )}
                      />
                    ) : (
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {(project?.toolkit || []).map((tool, index) => (
                          <Chip 
                            key={index} 
                            label={tool} 
                            icon={<Code fontSize="small" />}
                            variant="outlined"
                            sx={{ 
                              borderRadius: 2,
                              borderColor: alpha(theme.palette.primary.main, 0.3),
                              backgroundColor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.text.primary,
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                borderColor: theme.palette.primary.main,
                                transform: 'translateY(-2px)',
                              },
                              transition: 'all 0.3s ease',
                            }}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>

                  {/* Leadership Team */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        src={project?.createdBy?.avatar}                  
                        sx={{ 
                          width: 48, 
                          height: 48, 
                          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.8)})`,
                          border: `3px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                          boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.3)}`,
                          color: getContrastColor(theme.palette.primary.main),
                        }}>
                        {project?.createdBy?.avatar || (project?.createdBy?.name?.charAt(0) || 'P')}
                      </Avatar>
                      <Box>
                        <Tooltip title={project?.createdBy?.email || 'Unknown'}>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            Creator
                          </Typography>       
                        </Tooltip>
                        <Tooltip title={project?.createdBy?.email || 'Unknown'}>
                          <Typography variant="body1" fontWeight="600">
                            {project?.createdBy?.name || 'Unknown Creator'}
                          </Typography>
                        </Tooltip>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar 
                        src={project?.mentor?.avatar}                  
                        sx={{ 
                          width: 48, 
                          height: 48, 
                          background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${alpha(theme.palette.secondary.main, 0.8)})`,
                          border: `3px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
                          boxShadow: `0 4px 15px ${alpha(theme.palette.secondary.main, 0.3)}`,
                          color: getContrastColor(theme.palette.secondary.main),
                        }}>
                        {project?.mentor?.avatar || (project?.mentor?.name?.charAt(0) || 'M')}
                      </Avatar>
                      <Box>
                        <Tooltip title={project?.mentor?.email || 'No mentor assigned'}>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            Mentor
                          </Typography>
                        </Tooltip>
                        <Tooltip title={project?.mentor?.email || 'No mentor assigned'}>
                          <Typography variant="body1" fontWeight="600">
                            {project?.mentor?.name || 'No Mentor Assigned'}
                          </Typography>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Paper>
              
              {/* Right Column - Sidebar */}
              {!isMobile && (
                <Box sx={{ width: { lg: 320 }, minWidth: { lg: 320 }}}>
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        ...getGlassEffect(),
                        top: 24,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        mb:2                                                
                      }}
                    >
                      <Typography variant="h6" sx={{ 
                        mb: 3,
                        fontFamily: '"Adlam Display", serif',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        color: theme.palette.text.primary,
                      }}>
                        <Info /> Project Overview
                      </Typography>

                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1.5, color: theme.palette.text.secondary }}>
                          Project Timeline
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">Start Date</Typography>
                          <Typography variant="body2" fontWeight="600">
                            {formatDate(project?.startDate) || 'Not set'}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">End Date</Typography>
                          <Typography variant="body2" fontWeight="600">
                              {formatDate(project?.endDate) || 'Not set'}
                          </Typography>
                        </Box>
                        { project?.status !== 'completed' ?
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">(expected)</Typography>
                        </Box> : <></>
                        }


                      </Box>

                      <Divider sx={{ my: 3, borderColor: alpha(theme.palette.divider, 0.3) }} />

                      <Typography variant="subtitle2" sx={{ mb: 2, color: theme.palette.text.secondary }}>
                        Tags
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                        {(project?.tags || []).map((tag, index) => (
                          <Chip
                            key={index}
                            label={tag}
                            size="small"
                            sx={{
                              borderRadius: 1.5,
                              backgroundColor: alpha(theme.palette.primary.main, 0.1),
                              border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                              color: theme.palette.text.primary,
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.2),
                              }
                            }}
                          />
                        ))}
                      </Box>

                      <Divider sx={{ my: 3, borderColor: alpha(theme.palette.divider, 0.3) }} />

                      <Typography variant="subtitle2" sx={{ mb: 2, color: theme.palette.text.secondary }}>
                        Key Metrics
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Weighted Progress
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={projectMetrics?.weightedProgress || 0}
                            sx={{ 
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: alpha(theme.palette.primary.main, 0.1),
                              '& .MuiLinearProgress-bar': {
                                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                              }
                            }}
                          />
                          <Typography variant="body2" align="right">
                            {projectMetrics?.weightedProgress || 0}%
                          </Typography>
                        </Box>

                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Proof Compliance
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={projectMetrics?.proofComplianceRate || 0}
                            sx={{ 
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: alpha(getThemeColor('success'), 0.1),
                              '& .MuiLinearProgress-bar': {
                                background: `linear-gradient(90deg, ${getThemeColor('success')}, ${alpha(getThemeColor('success'), 0.7)})`,
                              }
                            }}
                          />
                          <Typography variant="body2" align="right">
                            {projectMetrics?.proofComplianceRate || 0}%
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </motion.div>
                </Box>
              )}
            </Box>
          </motion.div>

          {/* Stats Grid with Efficiency Metrics */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
          >
            <Box 
              sx={{ 
                mb: 4,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                flexWrap: 'wrap',
                gap: 3,
                width: '100%'
              }}
            >
              {/* Card 1: Total Tasks */}
              <Box 
                sx={{ 
                  flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' },
                  minWidth: { xs: '100%', sm: '200px' }
                }}
              >
                <StatCard
                  icon={<Task />}
                  value={projectMetrics?.totalTasks || 0}
                  label="Total Tasks"
                  colorType="primary"
                  progress={projectMetrics?.totalTasks ? (projectMetrics.completedTasks / projectMetrics.totalTasks) * 100 : 0}
                />
              </Box>

              {/* Card 2: Team Members */}
              <Box 
                sx={{ 
                  flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' },
                  minWidth: { xs: '100%', sm: '200px' }
                }}
              >
                <Tooltip title={`Active Member Count: ${activeMemberCount} of ${members.length}`}>
                  <span>
                    <StatCard 
                      icon={<Group />}
                      value={members.length}
                      label="Team Members"
                      colorType="secondary"
                      progress={activeMemberCount ? (activeMemberCount/members.length)*100 : 0}
                    />
                  </span>
                </Tooltip>
              </Box>

              {/* Card 3: Overall Efficiency */}
              <Box 
                sx={{ 
                  flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' },
                  minWidth: { xs: '100%', sm: '200px' }
                }}
              >
                <StatCard
                  icon={<WorkspacePremium />}
                  value={`${overallEfficiency || 0}%`}
                  label="Overall Efficiency"
                  colorType="success"
                  progress={overallEfficiency || 0}
                />
              </Box>

              {/* Card 4: Risk Level */}
              <Box 
                sx={{ 
                  flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 12px)', md: '1 1 calc(25% - 18px)' },
                  minWidth: { xs: '100%', sm: '200px' }
                }}
              >
                <StatCard
                  icon={<Speed />}
                  value={projectMetrics?.riskLevel || 'Low'}
                  label="Risk Level"
                  colorType={projectMetrics?.riskLevel === 'high' ? 'error' : 
                          projectMetrics?.riskLevel === 'medium' ? 'warning' : 'success'}
                  progress={projectMetrics?.riskLevel === 'low' ?  0 :
                          projectMetrics?.riskLevel === 'medium' ? 50 : 100}
                />
              </Box>
            </Box>
          </motion.div>

          {/* Main Content */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>
            {/* Left Column - Main Content */}
            <Box sx={{ flex: 2, minWidth: 0 }}>
              {/* Tabs */}
              <Paper
                elevation={0}
                sx={{
                  mb: 3,
                  borderRadius: 3,
                  ...getGlassEffect(),
                  overflow: 'hidden',
                }}
              >
                <Box sx={{ 
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                  px: { xs: 2, sm: 3 },
                  background: `linear-gradient(90deg, 
                    ${alpha(theme.palette.primary.main, 0.05)} 0%, 
                    transparent 100%
                  )`,
                }}>
                  <Tabs 
                    value={activeTab} 
                    onChange={(e, newValue) => setActiveTab(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                      '& .MuiTab-root': {
                        textTransform: 'capitalize',
                        borderRadius: 2,
                        mx: 0.5,
                        minHeight: 48,
                        fontFamily: '"Adlam Display", serif',
                        fontWeight: 500,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        },
                        '&.Mui-selected': {
                          color: theme.palette.primary.main,
                          backgroundColor: alpha(theme.palette.primary.main, 0.15),
                        }
                      },
                      '& .MuiTabs-indicator': {
                        backgroundColor: theme.palette.primary.main,
                        height: 3,
                        borderRadius: 1.5,
                        boxShadow: `0 0 8px ${alpha(theme.palette.primary.main, 0.5)}`,
                      }
                    }}
                  >
                    <Tab icon={<Task />} label="Tasks" />
                    <Tab icon={<Group />} label="Team" />
                    <Tab icon={<Timeline />} label="Activity" />
                    <Tab icon={<AttachFile />} label="Files" />
                    <Tab icon={<Analytics />} label="Analytics" />
                    <Tab icon={<RateReviewIcon />} label="Peer Reviews" /> 
                    <Tab icon={<Note />} label="Notes" />
                  </Tabs>
                </Box>

                {/* Tab Content */}
                <Box sx={{ p: { xs: 2, sm: 3 } }}>
                  <TabContent value={activeTab} index={0}>
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
                        <Typography variant="h5" sx={{ 
                          fontFamily: '"Adlam Display", serif',
                          fontWeight: 500,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}>
                          <Task /> Task Board ({tasks.length} tasks)
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <TextField
                            size="small"
                            placeholder="Search tasks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{ 
                              width: 200,
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                backgroundColor: alpha(theme.palette.background.paper, 0.5),
                                borderColor: alpha(theme.palette.primary.main, 0.2),
                                '&:hover': {
                                  borderColor: theme.palette.primary.main,
                                }
                              }
                            }}
                          />
                          
                          {/* Filter controls */}
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

                          <Tooltip title="Overdue Only">
                            <IconButton 
                              size="small"
                              color={filters.isOverdue ? "error" : "default"}
                              onClick={() => setFilters(prev => ({ ...prev, isOverdue: !prev.isOverdue }))}
                            >
                              <Warning />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>

                      {/* Stats Cards */}
                      {tasks.length > 0 && (
                        <Box sx={{ 
                          mb: 3,
                          display: 'grid',
                          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
                          gap: 2,
                        }}>
                          {[
                            { 
                              label: 'Total Tasks', 
                              value: tasks.length, 
                              icon: <Assessment fontSize="small" />,
                              color: theme.palette.primary.main
                            },
                            { 
                              label: 'High Risk', 
                              value: tasks.filter(t => t.metrics?.riskScore >= 4).length, 
                              icon: <Security fontSize="small" />,
                              color: theme.palette.error.main
                            },
                            { 
                              label: 'Completed', 
                              value: tasks.filter(t => t.status === 'completed').length, 
                              icon: <CheckCircle fontSize="small" />,
                              color: theme.palette.success.main
                            },
                            { 
                              label: 'Need Proof', 
                              value: tasks.filter(t => !t.metrics?.hasProof).length, 
                              icon: <Warning fontSize="small" />,
                              color: theme.palette.warning.main
                            }
                          ].map((stat) => (
                            <Paper
                              key={stat.label}
                              elevation={0}
                              sx={{
                                p: 2,
                                borderRadius: 2,
                                backgroundColor: alpha(stat.color, 0.05),
                                border: `1px solid ${alpha(stat.color, 0.1)}`,
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ 
                                  p: 1,
                                  borderRadius: 1,
                                  backgroundColor: alpha(stat.color, 0.1),
                                }}>
                                  {stat.icon}
                                </Box>
                                <Box>
                                  <Typography variant="h6" sx={{ color: stat.color }}>
                                    {stat.value}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    {stat.label}
                                  </Typography>
                                </Box>
                              </Box>
                            </Paper>
                          ))}
                        </Box>
                      )}

                      {/* Enhanced Tasks Table */}
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
                                {tasks
                                  .filter(task => {
                                    if (!task) return false;
                                    const query = searchQuery.toLowerCase();
                                    return (
                                      task.taskTitle?.toLowerCase().includes(query) ||
                                      task.description?.toLowerCase().includes(query) ||
                                      task.assignedTo?.name?.toLowerCase().includes(query)
                                    );
                                  })
                                  .filter(task => {
                                    if (filters.status !== 'all' && task.status !== filters.status) return false;
                                    if (filters.isOverdue && !task.metrics?.isOverdue) return false;
                                    return true;
                                  })
                                  .map((task) => (
                                    <TaskTableRow
                                      key={task._id}
                                      task={task}
                                      isSelected={selectedTasks.has(task._id)}
                                      onSelect={handleSelectTask}
                                      theme={theme}
                                      userRole={userRole}
                                      onUploadProof={handleUploadProof}
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
                          {tasks.length === 0 && (
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
                                  }}
                                >
                                  {selectedTasks.size} task{selectedTasks.size !== 1 ? 's' : ''} selected
                                </Typography>
                              </Box>
                              <Button
                                startIcon={<Delete />}
                                variant="contained"
                                color="error"
                                onClick={() => handleDeleteSelected(Array.from(selectedTasks))}
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
                    </Box>
                  </TabContent>

                  {/* Team Tab */}
                  <TabContent value={activeTab} index={1}>
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        mb: 3,
                        flexWrap: 'wrap',
                        gap: 2
                      }}>
                        <Typography variant="h5" sx={{ 
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          color: theme.palette.primary.main,
                        }}>
                          <Group /> Team Members ({members.length})
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<PersonAdd />}
                          onClick={() => setAddMemberDialog(true)}
                          sx={{ 
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                            backgroundColor: theme.palette.primary.main,
                            color: '#ffffff',
                            '&:hover': {
                              backgroundColor: theme.palette.primary.dark,
                              transform: 'translateY(-2px)',
                              boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
                            },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          Add Member
                        </Button>
                      </Box>

                      {/* Members Grid */}
                      <Box sx={{ 
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: 3,
                        '& > *': { 
                          flex: '1 1 calc(33.333% - 16px)', 
                          minWidth: 280,
                          maxWidth: '100%'
                        }
                      }}>
                        {members.map((member) => {
                          const memberEff = memberEfficiencies[member._id] || { efficiency: 0, taskCount: 0 };
                          const memberTasks = tasks.filter(task => {
                            const assigneeId = task.assignedTo?._id || task.assignedTo;
                            return assigneeId === member._id;
                          });
                          const completedTasks = memberTasks.filter(task => task.status === 'completed').length;

                          const getEfficiencyColor = (efficiency) => {
                            if (efficiency < 50) return theme.palette.error.main;
                            if (efficiency < 80) return theme.palette.warning.main;
                            return theme.palette.success.main;
                          };

                          return (
                            <motion.div 
                              key={member._id}
                              whileHover={{ scale: 1.02 }} 
                              whileTap={{ scale: 0.98 }}
                              style={{ width: '100%' }}
                            >
                              <Paper
                                sx={{
                                  p: 3,
                                  borderRadius: 3,
                                  backgroundColor: alpha(theme.palette.background.paper, 0.8),
                                  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                                  height: '100%',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  position: 'relative',
                                  overflow: 'hidden',
                                  backdropFilter: 'blur(10px)',
                                  '&:hover': {
                                    borderColor: alpha(theme.palette.primary.main, 0.3),
                                    boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
                                    transform: 'translateY(-4px)',
                                  },
                                  transition: 'all 0.3s ease',
                                }}
                              >
                                {/* Member Info */}
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                                  <Box sx={{ position: 'relative' }}>
                                    <Avatar 
                                      src={member.avatar}
                                      sx={{ 
                                        width: 56, 
                                        height: 56,
                                        fontSize: 20,
                                        fontWeight: 'bold',
                                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                        color: theme.palette.primary.main,
                                        border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                      }}
                                    >
                                      {member.avatar || member.name?.charAt(0).toUpperCase() || 'U'}
                                    </Avatar>
                                    <Box
                                      sx={{
                                        position: 'absolute',
                                        bottom: 0,
                                        right: 0,
                                        width: 12,
                                        height: 12,
                                        borderRadius: '50%',
                                        backgroundColor: member.onlineStatus === 'active' 
                                          ? theme.palette.success.main 
                                          : theme.palette.warning.main,
                                        border: `2px solid ${theme.palette.background.paper}`,
                                      }}
                                    />
                                  </Box>
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant="h6" fontWeight="600">
                                      {member.name || 'Unknown'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                      {member.email || 'No email'}
                                    </Typography>
                                  </Box>
                                </Box>

                                {/* Skills */}
                                {member.skills && member.skills.length > 0 && (
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                                      Skills
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                      {member.skills.slice(0, 3).map((skill, idx) => (
                                        <Chip
                                          key={idx}
                                          label={skill}
                                          size="small"
                                          variant="outlined"
                                          sx={{ 
                                            fontSize: '0.7rem',
                                            height: 22,
                                            borderRadius: 1,
                                            borderColor: alpha(theme.palette.primary.main, 0.3),
                                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                            color: theme.palette.text.primary,
                                          }}
                                        />
                                      ))}
                                      {member.skills.length > 3 && (
                                        <Chip
                                          label={`+${member.skills.length - 3}`}
                                          size="small"
                                          variant="outlined"
                                          sx={{ 
                                            fontSize: '0.7rem',
                                            height: 22,
                                            borderRadius: 1,
                                          }}
                                        />
                                      )}
                                    </Box>
                                  </Box>
                                )}

                                <Divider sx={{ 
                                  my: 2, 
                                  borderColor: alpha(theme.palette.divider, 0.3) 
                                }} />

                                {/* Efficiency Stats */}
                                <Box sx={{ 
                                  display: 'flex', 
                                  justifyContent: 'space-between', 
                                  alignItems: 'center',
                                  gap: 2
                                }}>
                                  <Box sx={{ textAlign: 'center', flex: 1 }}>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      Tasks
                                    </Typography>
                                    <Typography variant="h6" fontWeight="700" color={theme.palette.primary.main}>
                                      {memberEff.taskCount}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ textAlign: 'center', flex: 1 }}>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      Completed
                                    </Typography>
                                    <Typography variant="h6" fontWeight="700" color={theme.palette.success.main}>
                                      {completedTasks}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ textAlign: 'center', flex: 1 }}>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      Efficiency
                                    </Typography>
                                    <Typography 
                                      variant="h6" 
                                      fontWeight="700"
                                      sx={{ 
                                        color: getEfficiencyColor(memberEff.efficiency)
                                      }}
                                    >
                                      {memberEff.efficiency.toFixed(1)}%
                                    </Typography>
                                  </Box>
                                </Box>

                                {/* Additional Info */}
                                {memberTasks.length > 0 && (
                                  <Box sx={{ 
                                    mt: 2, 
                                    pt: 2, 
                                    borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}` 
                                  }}>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      Recent Tasks:
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                                      {memberTasks.slice(0, 2).map((task, idx) => (
                                        <Chip
                                          key={idx}
                                          label={task.taskTitle?.substring(0, 20) + (task.taskTitle?.length > 20 ? '...' : '')}
                                          size="small"
                                          sx={{ 
                                            fontSize: '0.65rem',
                                            height: 20,
                                            backgroundColor: 
                                              task.status === 'completed' ? alpha(theme.palette.success.main, 0.1) :
                                              task.status === 'active' ? alpha(theme.palette.info.main, 0.1) :
                                              alpha(theme.palette.warning.main, 0.1),
                                            color: 
                                              task.status === 'completed' ? theme.palette.success.main :
                                              task.status === 'active' ? theme.palette.info.main :
                                              theme.palette.warning.main,
                                          }}
                                        />
                                      ))}
                                      {memberTasks.length > 2 && (
                                        <Chip
                                          label={`+${memberTasks.length - 2} more`}
                                          size="small"
                                          sx={{ 
                                            fontSize: '0.65rem',
                                            height: 20,
                                          }}
                                        />
                                      )}
                                    </Box>
                                  </Box>
                                )}

                                {/* View Profile Button */}
                                <Button
                                  variant="outlined"
                                  size="small"
                                  fullWidth
                                  sx={{ 
                                    mt: 2,
                                    borderRadius: 2,
                                    borderColor: alpha(theme.palette.primary.main, 0.3),
                                    color: theme.palette.primary.main,
                                    '&:hover': {
                                      borderColor: theme.palette.primary.main,
                                      backgroundColor: alpha(theme.palette.primary.main, 0.04),
                                    }
                                  }}
                                  onClick={() => {
                                    showSnackbar(`Viewing ${member.name}'s profile`, 'info');
                                  }}
                                >
                                  View Profile
                                </Button>
                              </Paper>
                            </motion.div>
                          );
                        })}
                      </Box>

                      {/* Empty State */}
                      {members.length === 0 && (
                        <Paper
                          sx={{
                            p: 6,
                            borderRadius: 3,
                            backgroundColor: alpha(theme.palette.background.paper, 0.6),
                            border: `2px dashed ${alpha(theme.palette.divider, 0.3)}`,
                            textAlign: 'center',
                          }}
                        >
                          <Group sx={{ 
                            fontSize: 64, 
                            color: alpha(theme.palette.text.secondary, 0.3),
                            mb: 2 
                          }} />
                          <Typography variant="h6" color="text.secondary" gutterBottom>
                            No Team Members Yet
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
                            Add team members to collaborate on this project
                          </Typography>
                          <Button
                            variant="contained"
                            startIcon={<PersonAdd />}
                            onClick={() => setAddMemberDialog(true)}
                            sx={{ borderRadius: 2 }}
                          >
                            Add First Member
                          </Button>
                        </Paper>
                      )}
                    </Box>
                  </TabContent>

                  {/* Activity Tab */}
                  <TabContent value={activeTab} index={2}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h5" sx={{ 
                        fontFamily: '"Adlam Display", serif',
                        fontWeight: 500,
                        mb: 3,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}>
                        <Timeline /> Recent Activity ({activityLog.length})
                      </Typography>

                      {activityLog.length === 0 ? (
                        <Paper
                          elevation={0}
                          sx={{
                            p: 4,
                            borderRadius: 3,
                            ...getGlassEffect(),
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="body1" color="text.secondary">
                            No activity recorded yet
                          </Typography>
                        </Paper>
                      ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          {activityLog.map((log) => (
                            <motion.div
                              key={log.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                            >
                              <Paper
                                elevation={0}
                                sx={{
                                  p: 2.5,
                                  borderRadius: 3,
                                  ...getGlassEffect(),
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: 2,
                                  '&:hover': {
                                    borderColor: getBorderColor('primary', 0.5),
                                    transform: 'translateX(4px)',
                                  },
                                  transition: 'all 0.3s ease',
                                }}
                              >
                                <Avatar
                                  src={log.user?.avatar}
                                  sx={{
                                    background: `linear-gradient(135deg, ${getThemeColor('primary')}, ${alpha(getThemeColor('primary'), 0.8)})`,
                                    color: getContrastColor(getThemeColor('primary')),
                                    width: 40,
                                    height: 40,
                                    boxShadow: `0 4px 12px ${alpha(getThemeColor('primary'), 0.3)}`,
                                  }}
                                >
                                  {log.user?.avatar || log.user?.name?.charAt(0) || '?'}
                                </Avatar>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="body1">
                                    <strong>{log.user?.name || 'System'}</strong> {log.action}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {log.time}
                                  </Typography>
                                  {log.metadata?.description && (
                                    <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary' }}>
                                      {log.metadata.description}
                                    </Typography>
                                  )}
                                </Box>
                              </Paper>
                            </motion.div>
                          ))}
                        </Box>
                      )}
                    </Box>
                  </TabContent>

                  {/* Files Tab */}
                  <TabContent value={activeTab} index={3}>
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography variant="h5" sx={{ 
                          fontFamily: '"Adlam Display", serif',
                          fontWeight: 500,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}>
                          <AttachFile /> Project Files ({projectFiles.length})
                        </Typography>
                        <Button
                          variant="contained"
                          startIcon={<Upload />}
                          onClick={() => {
                            showSnackbar('File upload functionality coming soon', 'info');
                          }}
                          sx={{ 
                            borderRadius: 2,
                            px: 3,
                            py: 1,
                            fontFamily: '"Adlam Display", serif',
                            background: `linear-gradient(135deg, ${getThemeColor('primary')}, ${alpha(getThemeColor('primary'), 0.8)})`,
                            color: getContrastColor(getThemeColor('primary')),
                            boxShadow: `0 4px 20px ${alpha(getThemeColor('primary'), 0.4)}`,
                            '&:hover': {
                              boxShadow: `0 8px 25px ${alpha(getThemeColor('primary'), 0.6)}`,
                              transform: 'translateY(-2px)',
                            },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          Upload File
                        </Button>
                      </Box>

                      {projectFiles.length === 0 ? (
                        <Paper
                          elevation={0}
                          sx={{
                            p: 4,
                            borderRadius: 3,
                            ...getGlassEffect(),
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="body1" color="text.secondary">
                            No files uploaded yet
                          </Typography>
                        </Paper>
                      ) : (
                        <Grid container spacing={2}>
                          {projectFiles.map((file) => (
                            <Grid item xs={12} sm={6} md={4} key={file._id}>
                              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Paper
                                  elevation={0}
                                  sx={{
                                    p: 2.5,
                                    borderRadius: 3,
                                    ...getGlassEffect(),
                                    height: '100%',
                                    '&:hover': {
                                      borderColor: getBorderColor('primary', 0.5),
                                      transform: 'translateY(-4px)',
                                    },
                                    transition: 'all 0.3s ease',
                                  }}
                                >
                                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                                    <Avatar
                                      sx={{
                                        background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.8)})`,
                                        color: getContrastColor(theme.palette.primary.main),
                                        boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                                      }}
                                    >
                                      <Folder />
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                      <Typography variant="body1" fontWeight="500" noWrap>
                                        {file.fileName}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        From: {file.taskTitle}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary" display="block">
                                        {file.uploadedBy} • {file.uploadedAt}
                                      </Typography>
                                    </Box>
                                  </Box>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Chip
                                      label={file.fileType}
                                      size="small"
                                      variant="outlined"
                                      sx={{ 
                                        borderRadius: 1.5,
                                        borderColor: getBorderColor('primary', 0.3),
                                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                      }}
                                    />
                                    <Typography variant="caption" color="text.secondary">
                                      {file.fileSize}
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                    <IconButton 
                                      size="small"
                                      onClick={() => window.open(file.fileUrl, '_blank')}
                                      sx={{
                                        backgroundColor: alpha(getThemeColor('info'), 0.1),
                                        color: getThemeColor('info'),
                                        '&:hover': {
                                          backgroundColor: alpha(getThemeColor('info'), 0.2),
                                        }
                                      }}
                                    >
                                      <Visibility />
                                    </IconButton>
                                    <IconButton 
                                      size="small"
                                      onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = file.fileUrl;
                                        link.download = file.fileName;
                                        link.click();
                                      }}
                                      sx={{
                                        backgroundColor: alpha(getThemeColor('success'), 0.1),
                                        color: getThemeColor('success'),
                                        '&:hover': {
                                          backgroundColor: alpha(getThemeColor('success'), 0.2),
                                        }
                                      }}
                                    >
                                      <Download />
                                    </IconButton>
                                  </Box>
                                </Paper>
                              </motion.div>
                            </Grid>
                          ))}
                        </Grid>
                      )}
                    </Box>
                  </TabContent>

                  {/* Analytics Tab */}
                  <TabContent value={activeTab} index={4}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="h5" sx={{ 
                        fontFamily: '"Adlam Display", serif',
                        fontWeight: 500,
                        mb: 3,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}>
                        <Analytics /> Project Analytics
                      </Typography>

                      <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid item xs={12} md={6}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 3,
                              borderRadius: 3,
                              ...getGlassEffect(),
                              border: `1.5px solid ${getBorderColor('success', 0.4)}`,
                              height: '100%',
                            }}
                          >
                            <Typography variant="h6" sx={{ 
                              mb: 2, 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1,
                              color: getThemeColor('success'),
                            }}>
                              <CheckCircle /> Efficiency Overview
                            </Typography>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h2" fontWeight="800" sx={{ 
                                fontFamily: '"Alkatra", cursive',
                                color: getThemeColor('success'),
                                mb: 1,
                                textShadow: `0 2px 8px ${alpha(getThemeColor('success'), 0.3)}`,
                              }}>
                                {overallEfficiency || 0}%
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Overall Project Efficiency
                              </Typography>
                              <LinearProgress 
                                variant="determinate" 
                                value={Math.min(overallEfficiency || 0, 100)}
                                sx={{ 
                                  mt: 2,
                                  height: 8,
                                  borderRadius: 4,
                                  backgroundColor: alpha(getThemeColor('success'), 0.1),
                                  '& .MuiLinearProgress-bar': {
                                    background: `linear-gradient(90deg, ${getThemeColor('success')}, ${alpha(getThemeColor('success'), 0.7)})`,
                                    boxShadow: `0 0 8px ${alpha(getThemeColor('success'), 0.5)}`,
                                  }
                                }}
                              />
                            </Box>
                          </Paper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 3,
                              borderRadius: 3,
                              ...getGlassEffect(),
                              border: `1.5px solid ${getBorderColor('info', 0.4)}`,
                              height: '100%',
                            }}
                          >
                            <Typography variant="h6" sx={{ 
                              mb: 2, 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1,
                              color: getThemeColor('info'),
                            }}>
                              <AccessTime /> Time Tracking
                            </Typography>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h2" fontWeight="800" sx={{ 
                                fontFamily: '"Alkatra", cursive',
                                color: getThemeColor('info'),
                                mb: 1,
                                textShadow: `0 2px 8px ${alpha(getThemeColor('info'), 0.3)}`,
                              }}>
                                {Math.round((projectMetrics?.totalFocusTime || 0) / 3600)}h
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Total Focus Time
                              </Typography>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                <Typography variant="body2">
                                  Estimated: {Math.round((projectMetrics?.totalEstimatedTime || 0) / 3600)}h
                                </Typography>
                                <Typography variant="body2">
                                  Actual: {Math.round((projectMetrics?.totalFocusTime || 0) / 3600)}h
                                </Typography>
                              </Box>
                            </Box>
                          </Paper>
                        </Grid>
                      </Grid>

                      {/* Risk Analysis */}
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          ...getGlassEffect(),
                          border: `1.5px solid ${getBorderColor('warning', 0.4)}`,
                        }}
                      >
                        <Typography variant="h6" sx={{ 
                          mb: 2, 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 1,
                          color: getThemeColor('warning'),
                        }}>
                          <Warning /> Risk Analysis
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6} sm={3}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h4" fontWeight="800" color={getThemeColor('error')}>
                                {projectMetrics?.highRiskTasks || 0}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                High Risk Tasks
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h4" fontWeight="800" color={getThemeColor('warning')}>
                                {projectMetrics?.mediumRiskTasks || 0}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Medium Risk Tasks
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h4" fontWeight="800" color={getThemeColor('error')}>
                                {projectMetrics?.overdueTasks || 0}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Overdue Tasks
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h4" fontWeight="800" color={getThemeColor('success')}>
                                {projectMetrics?.tasksWithProof || 0}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Tasks with Proof
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Paper>
                    </Box>
                  </TabContent>

                  <TabContent value={activeTab} index={5}>
                    <PeerReviewTab
                      projectId={projectId}
                      members={members}
                      user={user}
                      project={project}
                      showSnackbar={showSnackbar}
                    />
                  </TabContent>

                  {/* Notes Tab */}
                  <TabContent value={activeTab} index={6}>
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        mb: 3,
                        flexWrap: 'wrap',
                        gap: 2
                      }}>
                        <Typography variant="h5" sx={{ 
                          fontFamily: '"Adlam Display", serif',
                          fontWeight: 500,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}>
                          <Note /> Collaborative Notes
                        </Typography>
                      </Box>

                      {/* Your StickyNoteEditor Component */}
                      <Box sx={{ 
                        height: '600px',
                        borderRadius: 3,
                        overflow: 'hidden',
                        border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                        boxShadow: `0 8px 32px ${alpha(theme.palette.mode === 'dark' ? '#000' : theme.palette.primary.main, 0.1)}`,
                      }}>
                        <StickyNoteEditor
                          projectId={projectId}
                          initialContent=""
                          currentUser={{
                            _id: user?._id || '',
                            name: user?.name || 'User',
                            role: user?.role === 'teacher' ? 'teacher' : 'peer',
                            avatar: user?.avatar
                          }}
                          onOpenHistory={() => showSnackbar('History feature coming soon', 'info')}
                          onToggleComments={() => showSnackbar('Comments feature coming soon', 'info')}
                          commentsOpen={false}
                          stickyNotes={stickyNotes}
                          onAddNote={async (note) => {
                            try {
                              const noteData = {
                                title: note.content.substring(0, 50),
                                description: note.content,
                                color: note.color,
                                category: note.category,
                                isImportant: note.isImportant,
                                isPinned: note.isPinned,
                                assignedUser: user?._id
                              };
                              
                              await createStickyNote(noteData);
                            } catch (error) {
                              console.error('Error adding note:', error);
                            }
                          }}
                          onDeleteNote={async (id) => {
                            await deleteStickyNote(id);
                          }}
                          onPinNote={async (id) => {
                            await togglePinNote(id);
                          }}
                        />
                      </Box>

                      {/* Loading State Overlay */}
                      {isLoadingNotes && (
                        <Box sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundColor: alpha(theme.palette.background.paper, 0.7),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 1000,
                          borderRadius: 3,
                        }}>
                          <CircularProgress 
                            sx={{ 
                              color: theme.palette.primary.main 
                            }} 
                          />
                        </Box>
                      )}
                    </Box>
                  </TabContent>
                </Box>
              </Paper>
            </Box>
          </Box>
        </Container>

        {/* Floating Action Buttons */}
        <FloatingActionButton
          icon={<Add />}
          onClick={() => {
            showSnackbar('Add task functionality coming soon', 'info');
          }}
          tooltip="Add Task"
          color="primary"
        />
        <FloatingActionButton
          icon={<Comment />}
          onClick={() => setActiveTab(6)}
          tooltip="Go to Notes"
          color="secondary"
          sx={{ bottom: 90, right: 24 }}
        />

        {/* Dialog for adding members */}
        <Dialog 
          open={addMemberDialog} 
          onClose={() => setAddMemberDialog(false)}
          PaperProps={{
            sx: {
              borderRadius: 4,
              minWidth: 400,
              ...getGlassEffect(),
              border: `1px solid ${getBorderColor('primary', 0.3)}`,
            }
          }}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Add Team Member</Typography>
              <IconButton 
                onClick={() => setAddMemberDialog(false)} 
                size="small"
                sx={{
                  backgroundColor: alpha(getThemeColor('error'), 0.1),
                  color: getThemeColor('error'),
                  '&:hover': {
                    backgroundColor: alpha(getThemeColor('error'), 0.2),
                  }
                }}
              >
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              fullWidth
              label="Search members by email or username"
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.background.paper, 0.5),
                  borderColor: getBorderColor('primary', 0.2),
                }
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button 
              onClick={() => setAddMemberDialog(false)}
              sx={{
                color: theme.palette.text.secondary,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.action.hover, 0.1),
                }
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained"
              onClick={() => {
                showSnackbar('Member added successfully', 'success');
                setAddMemberDialog(false);
              }}
              sx={{
                background: `linear-gradient(135deg, ${getThemeColor('primary')}, ${alpha(getThemeColor('primary'), 0.8)})`,
                color: getContrastColor(getThemeColor('primary')),
                boxShadow: `0 4px 15px ${alpha(getThemeColor('primary'), 0.3)}`,
                '&:hover': {
                  boxShadow: `0 6px 20px ${alpha(getThemeColor('primary'), 0.4)}`,
                }
              }}
            >
              Add Member
            </Button>
          </DialogActions>
        </Dialog>
      </Box>

      {/* Task Details Modal */}
      <TaskDetailsModal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        task={selectedTask}
        theme={theme}
        userRole={userRole}
        onTaskUpdate={handleTaskUpdate}
        onUploadProof={handleUploadProof}
        onStatusChange={handleStatusChange}
      />
      
      <UploadProofModal
        open={uploadProofOpen}
        onClose={() => {
          setUploadProofOpen(false);
          setSelectedTaskForProof(null);
        }}
        task={selectedTaskForProof}
        theme={theme}
        onSuccess={() => {
          showSnackbar('Proof uploaded successfully!', 'success');
        }}
      />
      
      {/* Create Task Modal */}
      <CreateTaskModal
        open={createTaskModalOpen} 
        onClose={() => setCreateTaskModalOpen(false)}
        project={project}
        teams={teams}
        theme={theme}
      />
    </>
  );
};

export default MyProject;