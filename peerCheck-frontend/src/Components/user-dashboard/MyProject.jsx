import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Chip, 
  Avatar, 
  AvatarGroup,
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
  MenuItem
} from '@mui/material';
import {
  Edit,
  CheckCircle,
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
  ViewList,
  Dashboard,
  Email,
  TrendingUp,
  Comment,
  Settings,
  Speed,
  Security,
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
  Assessment,
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
  RefreshOutlined
} from '@mui/icons-material';
import { motion, AnimatePresence, progress } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '@/api/axiosClient';
import  useInView from '@/hooks/useInView.js';
import {format} from 'date-fns';
const MyProject = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const { ref, inView } = useInView({ threshold: 0.5 });
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState(null);
  const [refresh, setRefresh] = useState(false);

  const [activeTab, setActiveTab] = useState(0);
  const [addMemberDialog, setAddMemberDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);
  const [tasks, setTasks] = useState([
    { id: 1, name: 'Research Paper Draft', assignee: 'Sarah Chen', status: 'In Progress', timeSpent: '12h', estimated: '20h', priority: 'High', updated: '2 hours ago', risk: 'Low', efficiency: '92%' },
    { id: 2, name: 'UI Mockups', assignee: 'Alex Kim', status: 'Completed', timeSpent: '8h', estimated: '6h', priority: 'Medium', updated: '1 day ago', risk: 'Very Low', efficiency: '133%' },
    { id: 3, name: 'Backend API Setup', assignee: 'James Wilson', status: 'Pending', timeSpent: '0h', estimated: '15h', priority: 'High', updated: '3 days ago', risk: 'Medium', efficiency: '0%' },
    { id: 4, name: 'Documentation', assignee: 'Maya Patel', status: 'In Progress', timeSpent: '5h', estimated: '10h', priority: 'Low', updated: '5 hours ago', risk: 'Low', efficiency: '50%' },
    { id: 5, name: 'Testing Suite', assignee: 'David Lee', status: 'Pending', timeSpent: '0h', estimated: '8h', priority: 'Medium', updated: '1 week ago', risk: 'Low', efficiency: '0%' }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ status: 'all', priority: 'all' });
  const [taskActionsAnchor, setTaskActionsAnchor] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [hoveredTask, setHoveredTask] = useState(null);
  const [sortBy, setSortBy] = useState('priority');
  const [isDarkMode, setIsDarkMode] = useState(theme.palette.mode === 'dark');
  const [formatted, setFormatted] = useState(null);




  const isMobile = useMediaQuery('(max-width: 900px)');

  const projectData = {
    name: 'Neural Network Visualization Tool',
    status: 'Active',
    deadline: '2024-06-15',
    progress: 65,
    creator: { name: 'Dr. Elena Rodriguez', role: 'Creator', avatar: 'ER', efficiency: '95%' },
    mentor: { name: 'Prof. Kenji Tanaka', role: 'Mentor', avatar: 'KT', efficiency: '98%' },
    description: 'An interactive web-based tool for visualizing neural network architectures and training processes in real-time. Built with React, TensorFlow.js, and Three.js.',
    startDate: '2024-01-10',
    endDate: '2024-06-15',
    totalTasks: 28,
    teamMembers: 7,
    files: 12,
    tags: ['AI', 'Web Dev', 'Research', 'Visualization', 'Machine Learning', 'React', 'Three.js'],
    techStack: ['React', 'TensorFlow.js', 'Three.js', 'Node.js', 'MongoDB', 'D3.js']
  };

  const teamMembers = [
    { id: 1, name: 'Sarah Chen', role: 'Lead Developer', tasks: 8, hours: 42, efficiency: '92%', avatar: 'SC', status: 'Active', tech: ['React', 'Three.js'] },
    { id: 2, name: 'Alex Kim', role: 'UI/UX Designer', tasks: 5, hours: 28, efficiency: '88%', avatar: 'AK', status: 'Active', tech: ['Figma', 'After Effects'] },
    { id: 3, name: 'James Wilson', role: 'Backend Engineer', tasks: 6, hours: 35, efficiency: '85%', avatar: 'JW', status: 'Away', tech: ['Node.js', 'MongoDB'] },
    { id: 4, name: 'Maya Patel', role: 'Technical Writer', tasks: 4, hours: 18, efficiency: '95%', avatar: 'MP', status: 'Active', tech: ['LaTeX', 'Markdown'] },
    { id: 5, name: 'David Lee', role: 'QA Engineer', tasks: 3, hours: 22, efficiency: '90%', avatar: 'DL', status: 'Active', tech: ['Jest', 'Cypress'] }
  ];

  const activityLog = [
    { user: 'Sarah Chen', action: 'created task "Research Paper Draft"', time: '2 hours ago', icon: <Task />, color: 'primary' },
    { user: 'Prof. Kenji Tanaka', action: 'approved UI mockups', time: '1 day ago', icon: <CheckCircle />, color: 'success' },
    { user: 'Alex Kim', action: 'uploaded "UI_Final.sketch"', time: '2 days ago', icon: <Upload />, color: 'info' },
    { user: 'Dr. Elena Rodriguez', action: 'updated project status to Active', time: '3 days ago', icon: <Settings />, color: 'warning' },
    { user: 'James Wilson', action: 'completed backend setup', time: '4 days ago', icon: <Code />, color: 'success' }
  ];

  const projectFiles = [
    { id: 1, name: 'Research_Proposal.pdf', size: '2.4 MB', type: 'PDF', uploaded: '2024-03-10', uploadedBy: 'Dr. Elena Rodriguez' },
    { id: 2, name: 'Architecture_Diagram.png', size: '1.8 MB', type: 'Image', uploaded: '2024-03-08', uploadedBy: 'Alex Kim' },
    { id: 3, name: 'Source_Code.zip', size: '15.2 MB', type: 'Archive', uploaded: '2024-03-05', uploadedBy: 'Sarah Chen' },
    { id: 4, name: 'Meeting_Notes_v2.docx', size: '0.8 MB', type: 'Document', uploaded: '2024-03-02', uploadedBy: 'Maya Patel' }
  ];

  const analyticsData = {
    tasksCompleted: 16,
    tasksPending: 12,
    totalHours: 127,
    avgEfficiency: '90%',
    productivity: [65, 70, 80, 75, 85, 90, 88],
    weeklyGrowth: '+12%',
    riskScore: 'Low'
  };
  
  // Enhanced color system that works with all themes
  const getThemeColor = (colorType = 'primary', variant = 'main') => {
    const colorMap = {
      success: theme.palette.success?.main || (theme.palette.mode === 'dark' ? '#4caf50' : '#2e7d32'),
      warning: theme.palette.warning?.main || (theme.palette.mode === 'dark' ? '#ff9800' : '#ed6c02'),
      error: theme.palette.error?.main || (theme.palette.mode === 'dark' ? '#f44336' : '#d32f2f'),
      info: theme.palette.info?.main || (theme.palette.mode === 'dark' ? '#29b6f6' : '#0288d1'),
      primary: theme.palette.primary.main,
      secondary: theme.palette.secondary.main,
      background: theme.palette.background.default,
      paper: theme.palette.background.paper
    };
    
    // For gradient effects, return an array of colors
    if (variant === 'gradient') {
      return [colorMap[colorType], colorMap.secondary];
    }
    
    return colorMap[colorType];
  };

  // Get text contrast color based on background
  const getContrastColor = (backgroundColor) => {
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  };

  // Calculate gradient background based on theme
  const getGradientBackground = () => {
    if (theme.palette.mode === 'dark') {
      return `linear-gradient(135deg, 
        ${alpha(getThemeColor('primary'), 0.15)} 0%, 
        ${alpha(getThemeColor('secondary'), 0.08)} 50%, 
        ${alpha(getThemeColor('background'), 0.95)} 100%
      )`;
    }
    return `linear-gradient(135deg, 
      ${alpha(getThemeColor('primary'), 0.08)} 0%, 
      ${alpha(getThemeColor('secondary'), 0.05)} 50%, 
      ${alpha(getThemeColor('background'), 0.98)} 100%
    )`;
  };

  const getCardGradient = (colorType = 'primary') => {
    const color = getThemeColor(colorType);
    return `linear-gradient(135deg, 
      ${alpha(color, theme.palette.mode === 'dark' ? 0.25 : 0.15)} 0%, 
      ${alpha(color, theme.palette.mode === 'dark' ? 0.1 : 0.05)} 100%
    )`;
  };

  const getBorderColor = (colorType = 'primary', intensity = 0.3) => {
    return alpha(getThemeColor(colorType), intensity);
  };

  const getGlassEffect = () => ({
    backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.2 : 0.9),
    backdropFilter: 'blur(20px)',
    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
    boxShadow: `0 8px 32px ${alpha(theme.palette.mode === 'dark' ? '#000' : getThemeColor('primary'), 0.1)}`,
  });

  const handleDragStart = (task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (targetId) => {
    if (!draggedTask) return;
    
    const newTasks = [...tasks];
    const draggedIndex = newTasks.findIndex(t => t.id === draggedTask.id);
    const targetIndex = newTasks.findIndex(t => t.id === targetId);
    
    const [removed] = newTasks.splice(draggedIndex, 1);
    newTasks.splice(targetIndex, 0, removed);
    
    setTasks(newTasks);
    setDraggedTask(null);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'primary';
      case 'Pending': return 'warning';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'info';
      default: return 'default';
    }
  };

  const getRiskColor = (risk) => {
    switch(risk) {
      case 'Very Low': return 'success';
      case 'Low': return 'info';
      case 'Medium': return 'warning';
      case 'High': return 'error';
      default: return 'default';
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (searchQuery && !task.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filters.status !== 'all' && task.status !== filters.status) return false;
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch(sortBy) {
      case 'priority':
        const priorityOrder = { High: 3, Medium: 2, Low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'status':
        const statusOrder = { 'In Progress': 3, 'Pending': 2, 'Completed': 1 };
        return statusOrder[b.status] - statusOrder[a.status];
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const TabContent = ({ children, value, index }) => {
    return (
      <AnimatePresence mode="wait">
        {activeTab === index && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  const StatCard = ({ icon, value, label, colorType = 'primary' }) => {
    const color = getThemeColor(colorType);
    return (
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            background: getCardGradient(colorType),
            border: `1.5px solid ${getBorderColor(colorType, 0.3)}`,
            position: 'relative',
            overflow: 'hidden',
            height: '100%',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.7)})`,
              borderRadius: '3px 3px 0 0',
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: alpha(color, 0.15),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${alpha(color, 0.3)}`,
            }}>
              {React.cloneElement(icon, { 
                sx: { 
                  color: color,
                  fontSize: 24,
                  filter: `drop-shadow(0 2px 4px ${alpha(color, 0.3)})`
                } 
              })}
            </Box>
            <Typography variant="h4" fontWeight="800" sx={{ 
              fontFamily: '"Alkatra", cursive',
              color: color,
              lineHeight: 1,
              textShadow: `0 2px 4px ${alpha(color, 0.2)}`,
            }}>
              {value}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ 
            color: theme.palette.text.secondary,
            fontFamily: '"Adlam Display", serif',
            fontWeight: 500,
          }}>
            {label}
          </Typography>
        </Paper>
      </motion.div>
    );
  };

  const FloatingActionButton = ({ icon, onClick, tooltip, color = 'primary', sx = {} }) => {
    const colorValue = getThemeColor(color);
    return (
      <Tooltip title={tooltip}>
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Fab
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              zIndex: 1000,
              background: `linear-gradient(135deg, ${colorValue}, ${alpha(colorValue, 0.8)})`,
              color: getContrastColor(colorValue),
              boxShadow: `0 8px 25px ${alpha(colorValue, 0.4)}`,
              '&:hover': {
                background: `linear-gradient(135deg, ${alpha(colorValue, 0.9)}, ${colorValue})`,
                boxShadow: `0 12px 35px ${alpha(colorValue, 0.6)}`,
              },
              ...sx
            }}
            onClick={onClick}
          >
            {icon}
          </Fab>
        </motion.div>
      </Tooltip>
    );
  };

useEffect(() => {

  if (!projectId) return;
  console.log('Project ID from params:', projectId); 
  setLoading(true);
  const fetchProjectDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;


      console.log('Fetching project details for ID:', projectId);

      const response = await axiosClient.get(
        `/projects/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            contentType: 'application/json',
          },
        }
      );


      const fetchedDate = response?.data;
      const formattedDate = format(new Date(fetchedDate.createdAt), 'MMMM dd, yyyy');
      const startDateFormatted = format(new Date(fetchedDate.startDate), 'MMMM dd, yyyy');
      const endDateFormatted = format(new Date(fetchedDate.endDate), 'MMMM dd, yyyy');
      const updatedAtFormatted = format(new Date(fetchedDate.updatedAt), 'MMMM dd, yyyy');

      const responseMentor = await axiosClient.get(`/user/get-mentor-for-project/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          contentType: 'application/json',
        },
      });



      if (response?.data) {
        setProject(prev => ({
          ...prev,
          projectId: fetchedDate.id || projectId,
          name: fetchedDate.projectName,
          createdBy: fetchedDate.createdBy,
          description: fetchedDate.description,
          gradingCriteria: fetchedDate.gradingCriteria,
          metrics: fetchedDate.metrics,
          milestones: fetchedDate.milestones,
          progress: fetchedDate.progress,
          startDate: startDateFormatted,
          status: fetchedDate.status,
          tags: fetchedDate.tags,
          taskCount: fetchedDate.taskCount,
          teamId: fetchedDate.teamId,
          teamName: fetchedDate.teamName,
          updatedAt: updatedAtFormatted,
          createdAt: formattedDate,
          endDate: endDateFormatted,
          mentor: responseMentor?.data?.mentor?.mentor || responseMentor?.data?.mentor || null,
        }));
      }
        console.log('Setting project:', project);

      setLoading(false);
      setRefresh(false);

    } catch (error) {
      console.error('Error fetching project details:', error);
    }
  };
  if (projectId) {
      fetchProjectDetails(); 
    }
}, [refresh, projectId]);

if(loading) {
    return ( 
      <CircularProgress
        sx={{ 
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: getThemeColor('primary'),
        }}
      />
    );
  }

  return (
    <>
    { !loading && (
      <Box 
        sx={{ 
          bgcolor: 'background.default', 
          minHeight: '100vh',
          position: 'relative',
      overflow: 'hidden',
      background: getGradientBackground(),
      transition: 'background 0.5s ease',
    }}>
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
        {/* Theme Toggle Button */}
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

          <Tooltip title={`Refresh Project Data`}>
            <IconButton
              onClick={() => setRefresh(true)}
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

        {/* Project Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Paper
            elevation={0}
            sx={{
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
                        { project?.projectName || project?.name }
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                        <Chip 
                          label={projectData.status} 
                          color={projectData.status === 'Active' ? 'primary' : 'default'}
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
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarToday fontSize="small" />
                          Deadline: {project?.endDate || 'no date set'}
                        </Typography>
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
                        {project?.progress}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={project?.progress} 
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
                  <Button 
                    variant="outlined" 
                    startIcon={<Edit />}
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
                    Mark Complete
                  </Button>
                </Box>
              </Box>

              {/* Tech Stack & Tags */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ 
                  mb: 1.5,
                  fontFamily: '"Adlam Display", serif',
                  fontWeight: 500,
                  color: theme.palette.text.secondary,
                }}>
                  Tech Stack
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {project?.tags.map((tag, index) => (
                    <Chip 
                      key={index} 
                      label={tag} 
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
              </Box>

              {/* Leadership Team */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ 
                    width: 48, 
                    height: 48, 
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.8)})`,
                    border: `3px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                    boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.3)}`,
                    color: getContrastColor(theme.palette.primary.main),
                  }}>
                    {project?.createdBy.avatar}
                  </Avatar>
                  <Box>

                    <Tooltip title={project?.createdBy.username || project?.createdBy.email}>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        Creator
                      </Typography>       
                    </Tooltip>

                    <Tooltip title={project?.createdBy.email || project?.createdBy.username}>
                      <Typography variant="body1" fontWeight="600">
                        {project?.createdBy.name}
                      </Typography>
                    </Tooltip>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ 
                    width: 48, 
                    height: 48, 
                    background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${alpha(theme.palette.secondary.main, 0.8)})`,
                    border: `3px solid ${alpha(theme.palette.secondary.main, 0.3)}`,
                    boxShadow: `0 4px 15px ${alpha(theme.palette.secondary.main, 0.3)}`,
                    color: getContrastColor(theme.palette.secondary.main),
                  }}>
                    {project?.mentor?.avatar}
                  </Avatar>
                  <Box>
                    <Tooltip title={project?.mentor?.username || project?.mentor?.email}>
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        Mentor
                      </Typography>
                    </Tooltip>
                    <Tooltip title={project?.mentor?.email || project?.mentor?.username}>
                      <Typography variant="body1" fontWeight="600">
                        {project?.mentor?.name}
                      </Typography>
                    </Tooltip>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Paper>
        </motion.div>

        {/* Stats Grid */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={<Task />}
                value={projectData.totalTasks}
                label="Total Tasks"
                colorType="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={<Group />}
                value={projectData.teamMembers}
                label="Team Members"
                colorType="secondary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={<WorkspacePremium />}
                value={analyticsData.avgEfficiency}
                label="Avg Efficiency"
                colorType="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={<Speed />}
                value={analyticsData.riskScore}
                label="Risk Level"
                colorType="info"
              />
            </Grid>
          </Grid>
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
                  <Tab icon={<Note />} label="Notes" />
                </Tabs>
              </Box>

              {/* Tab Content */}
              <Box sx={{ p: { xs: 2, sm: 3 } }}>
                {/* Tasks Tab */}
                <TabContent value={activeTab} index={0} ref={ref}>
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
                        <Task /> Task Board
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
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Search fontSize="small" />
                              </InputAdornment>
                            ),
                          }}
                        />
                        <Tooltip title="Sort">
                          <IconButton 
                            size="small" 
                            onClick={() => setSortBy(sortBy === 'priority' ? 'name' : 'priority')}
                            sx={{
                              backgroundColor: alpha(theme.palette.primary.main, 0.1),
                              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                              '&:hover': {
                                backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                transform: 'rotate(180deg)',
                              }
                            }}
                          >
                            <Sort />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    <TableContainer 
                      component={Paper} 
                      sx={{ 
                        borderRadius: 3,
                        ...getGlassEffect(),
                        border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                      }}
                    >
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell width="40px"></TableCell>
                            <TableCell>Task Name</TableCell>
                            <TableCell>Assignee</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Time</TableCell>
                            <TableCell>Priority</TableCell>
                            <TableCell>Efficiency</TableCell>
                            <TableCell align="right">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {sortedTasks.map((task) => (
                            <motion.tr 
                              key={task.id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              whileHover={{ 
                                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                transform: 'translateX(4px)'
                              }}
                              draggable
                              onDragStart={() => handleDragStart(task)}
                              onDragOver={handleDragOver}
                              onDrop={() => handleDrop(task.id)}
                              onMouseEnter={() => setHoveredTask(task.id)}
                              onMouseLeave={() => setHoveredTask(null)}
                              style={{ 
                                cursor: 'move',
                                transition: 'all 0.3s ease',
                              }}
                            >
                              <TableCell>
                                <DragIndicator sx={{ 
                                  color: hoveredTask === task.id ? theme.palette.primary.main : theme.palette.text.disabled,
                                  transform: hoveredTask === task.id ? 'scale(1.2)' : 'scale(1)',
                                  transition: 'all 0.3s ease',
                                }} />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body1" fontWeight="500">
                                  {task.name}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Avatar sx={{ 
                                    width: 32, 
                                    height: 32, 
                                    fontSize: 14,
                                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                    color: getContrastColor(theme.palette.primary.main),
                                  }}>
                                    {task.assignee.split(' ').map(n => n[0]).join('')}
                                  </Avatar>
                                  <Typography variant="body2">
                                    {task.assignee.split(' ')[0]}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={task.status} 
                                  size="small" 
                                  color={getStatusColor(task.status)}
                                  sx={{ 
                                    fontWeight: 600,
                                    borderRadius: 1.5,
                                    minWidth: 100,
                                    boxShadow: `0 2px 8px ${alpha(getThemeColor(getStatusColor(task.status)), 0.2)}`,
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <Box>
                                  <Typography variant="body2" fontWeight="500">
                                    {task.timeSpent}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    of {task.estimated}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={task.priority} 
                                  size="small" 
                                  color={getPriorityColor(task.priority)}
                                  variant="outlined"
                                  sx={{ 
                                    fontWeight: 600,
                                    borderWidth: 2,
                                  }}
                                />
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <TrendingUp sx={{ 
                                    fontSize: 16,
                                    color: task.efficiency === '0%' ? theme.palette.text.disabled : 
                                           parseFloat(task.efficiency) > 100 ? getThemeColor('success') : 
                                           parseFloat(task.efficiency) < 50 ? getThemeColor('error') : getThemeColor('warning')
                                  }} />
                                  <Typography 
                                    variant="body2" 
                                    fontWeight="600"
                                    sx={{ 
                                      color: task.efficiency === '0%' ? theme.palette.text.disabled : 
                                             parseFloat(task.efficiency) > 100 ? getThemeColor('success') : 
                                             parseFloat(task.efficiency) < 50 ? getThemeColor('error') : getThemeColor('warning')
                                    }}
                                  >
                                    {task.efficiency}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell align="right">
                                <IconButton 
                                  size="small"
                                  onClick={(e) => {
                                    setSelectedTask(task);
                                    setTaskActionsAnchor(e.currentTarget);
                                  }}
                                  sx={{
                                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                    '&:hover': {
                                      backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                    }
                                  }}
                                >
                                  <MoreHoriz />
                                </IconButton>
                              </TableCell>
                            </motion.tr>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </TabContent>

                {/* Team Tab */}
                <TabContent value={activeTab} index={1}>
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
                        <Group /> Team Members
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<PersonAdd />}
                        onClick={() => setAddMemberDialog(true)}
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
                        Add Member
                      </Button>
                    </Box>

                    <Grid container spacing={3}>
                      {teamMembers.map((member) => (
                        <Grid item xs={12} sm={6} md={4} key={member.id}>
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Paper
                              elevation={0}
                              sx={{
                                p: 3,
                                borderRadius: 3,
                                ...getGlassEffect(),
                                height: '100%',
                                position: 'relative',
                                overflow: 'hidden',
                                '&:hover': {
                                  borderColor: getBorderColor('primary', 0.5),
                                  boxShadow: `0 8px 32px ${alpha(getThemeColor('primary'), 0.2)}`,
                                  transform: 'translateY(-4px)',
                                },
                                transition: 'all 0.3s ease',
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                                <Badge
                                  overlap="circular"
                                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                  variant="dot"
                                  color={member.status === 'Active' ? 'success' : 'warning'}
                                >
                                  <Avatar 
                                    sx={{ 
                                      width: 56, 
                                      height: 56,
                                      fontSize: 20,
                                      fontWeight: 'bold',
                                      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                      color: getContrastColor(theme.palette.primary.main),
                                      boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.3)}`,
                                    }}
                                  >
                                    {member.avatar}
                                  </Avatar>
                                </Badge>
                                <Box sx={{ flex: 1 }}>
                                  <Typography variant="h6" fontWeight="600">
                                    {member.name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {member.role}
                                  </Typography>
                                </Box>
                                <IconButton 
                                  size="small"
                                  sx={{
                                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                    '&:hover': {
                                      backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                    }
                                  }}
                                >
                                  <MoreHoriz />
                                </IconButton>
                              </Box>

                              <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                                  Tech Skills
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                  {member.tech.map((skill, idx) => (
                                    <Chip
                                      key={idx}
                                      label={skill}
                                      size="small"
                                      variant="outlined"
                                      sx={{ 
                                        fontSize: '0.7rem',
                                        height: 22,
                                        borderRadius: 1,
                                        borderColor: getBorderColor('primary', 0.3),
                                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                        color: theme.palette.text.primary,
                                      }}
                                    />
                                  ))}
                                </Box>
                              </Box>

                              <Divider sx={{ my: 2, borderColor: alpha(theme.palette.divider, 0.3) }} />

                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Box>
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    Tasks
                                  </Typography>
                                  <Typography variant="body2" fontWeight="600">
                                    {member.tasks}
                                  </Typography>
                                </Box>
                                <Box>
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    Hours
                                  </Typography>
                                  <Typography variant="body2" fontWeight="600">
                                    {member.hours}h
                                  </Typography>
                                </Box>
                                <Box>
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    Efficiency
                                  </Typography>
                                  <Typography 
                                    variant="body2" 
                                    fontWeight="600"
                                    sx={{ 
                                      color: parseFloat(member.efficiency) > 90 ? getThemeColor('success') : 
                                             parseFloat(member.efficiency) < 70 ? getThemeColor('error') : getThemeColor('warning')
                                    }}
                                  >
                                    {member.efficiency}
                                  </Typography>
                                </Box>
                              </Box>
                            </Paper>
                          </motion.div>
                        </Grid>
                      ))}
                    </Grid>
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
                      <Timeline /> Recent Activity
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {activityLog.map((log, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
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
                              sx={{
                                background: `linear-gradient(135deg, ${getThemeColor(log.color)}, ${alpha(getThemeColor(log.color), 0.8)})`,
                                color: getContrastColor(getThemeColor(log.color)),
                                width: 40,
                                height: 40,
                                boxShadow: `0 4px 12px ${alpha(getThemeColor(log.color), 0.3)}`,
                              }}
                            >
                              {log.icon}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="body1">
                                <strong>{log.user}</strong> {log.action}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {log.time}
                              </Typography>
                            </Box>
                          </Paper>
                        </motion.div>
                      ))}
                    </Box>
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
                        <AttachFile /> Project Files
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<Upload />}
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

                    <Grid container spacing={2}>
                      {projectFiles.map((file) => (
                        <Grid item xs={12} sm={6} md={4} key={file.id}>
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
                                    {file.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {file.uploadedBy} • {file.uploaded}
                                  </Typography>
                                </Box>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Chip
                                  label={file.type}
                                  size="small"
                                  variant="outlined"
                                  sx={{ 
                                    borderRadius: 1.5,
                                    borderColor: getBorderColor('primary', 0.3),
                                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                  }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {file.size}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                <IconButton 
                                  size="small"
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
                                <IconButton 
                                  size="small"
                                  sx={{
                                    backgroundColor: alpha(getThemeColor('error'), 0.1),
                                    color: getThemeColor('error'),
                                    '&:hover': {
                                      backgroundColor: alpha(getThemeColor('error'), 0.2),
                                    }
                                  }}
                                >
                                  <Delete />
                                </IconButton>
                              </Box>
                            </Paper>
                          </motion.div>
                        </Grid>
                      ))}
                    </Grid>
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

                    <Grid container spacing={3}>
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
                            <CheckCircle sx={{ color: getThemeColor('success') }} /> Completion Rate
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Box sx={{ textAlign: 'center' }}>
                              <Typography variant="h2" fontWeight="800" sx={{ 
                                fontFamily: '"Alkatra", cursive',
                                color: getThemeColor('success'),
                                textShadow: `0 2px 8px ${alpha(getThemeColor('success'), 0.3)}`,
                              }}>
                                {Math.round((analyticsData.tasksCompleted / (analyticsData.tasksCompleted + analyticsData.tasksPending)) * 100)}%
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Tasks Completed
                              </Typography>
                            </Box>
                            <Box sx={{ flex: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">Completed</Typography>
                                <Typography variant="body2" fontWeight="600">
                                  {analyticsData.tasksCompleted}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography variant="body2">Pending</Typography>
                                <Typography variant="body2" fontWeight="600">
                                  {analyticsData.tasksPending}
                                </Typography>
                              </Box>
                            </Box>
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
                            <AccessTime sx={{ color: getThemeColor('info') }} /> Time Tracking
                          </Typography>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h2" fontWeight="800" sx={{ 
                              fontFamily: '"Alkatra", cursive',
                              color: getThemeColor('info'),
                              mb: 1,
                              textShadow: `0 2px 8px ${alpha(getThemeColor('info'), 0.3)}`,
                            }}>
                              {analyticsData.totalHours}h
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Total hours invested
                            </Typography>
                            <LinearProgress 
                              variant="determinate" 
                              value={65}
                              sx={{ 
                                mt: 2,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: alpha(getThemeColor('info'), 0.1),
                                '& .MuiLinearProgress-bar': {
                                  background: `linear-gradient(90deg, ${getThemeColor('info')}, ${alpha(getThemeColor('info'), 0.7)})`,
                                  boxShadow: `0 0 8px ${alpha(getThemeColor('info'), 0.5)}`,
                                }
                              }}
                            />
                          </Box>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Box>
                </TabContent>

                {/* Notes Tab */}
                <TabContent value={activeTab} index={5}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      ...getGlassEffect(),
                      border: `1.5px solid ${getBorderColor('primary', 0.4)}`,
                      minHeight: 400,
                    }}
                  >
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
                      <Note /> Collaborative Notes
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={12}
                      placeholder="Start typing your collaborative notes here... All team members can see and edit in real-time."
                      variant="outlined"
                      InputProps={{
                        sx: {
                          borderRadius: 2,
                          fontFamily: '"Inter", sans-serif',
                          backgroundColor: alpha(theme.palette.background.paper, 0.5),
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                          '&:focus-within': {
                            borderColor: theme.palette.primary.main,
                            boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`,
                          }
                        }
                      }}
                    />
                  </Paper>
                </TabContent>
              </Box>
            </Paper>
          </Box>

          {/* Right Column - Sidebar */}
          {!isMobile && (
            <Box sx={{ width: { lg: 320 }, minWidth: { lg: 320 } }}>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    ...getGlassEffect(),
                    position: 'sticky',
                    top: 24,
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

                  <Typography variant="body1" sx={{ mb: 3, color: theme.palette.text.secondary }}>
                    {projectData.description}
                  </Typography>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1.5, color: theme.palette.text.secondary }}>
                      Project Timeline
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Start Date</Typography>
                      <Typography variant="body2" fontWeight="600">
                        {projectData.startDate}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">End Date</Typography>
                      <Typography variant="body2" fontWeight="600">
                        {projectData.endDate}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 3, borderColor: alpha(theme.palette.divider, 0.3) }} />

                  <Typography variant="subtitle2" sx={{ mb: 2, color: theme.palette.text.secondary }}>
                    Tags
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                    {projectData.tags.map((tag, index) => (
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

                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<Assessment />}
                    sx={{
                      borderRadius: 2,
                      py: 1.5,
                      fontFamily: '"Adlam Display", serif',
                      borderWidth: 2,
                      borderColor: getBorderColor('primary', 0.3),
                      color: theme.palette.primary.main,
                      '&:hover': {
                        borderWidth: 2,
                        borderColor: theme.palette.primary.main,
                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Generate Report
                  </Button>
                </Paper>
              </motion.div>
            </Box>
          )}
        </Box>
      </Container>

      {/* Floating Action Buttons */}
      <FloatingActionButton
        icon={<Add />}
        onClick={() => {}}
        tooltip="Add Task"
        color="primary"
      />
      <FloatingActionButton
        icon={<Comment />}
        onClick={() => setActiveTab(5)}
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
            label="Search members"
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

      {/* Task Actions Menu */}
      <Menu
        anchorEl={taskActionsAnchor}
        open={Boolean(taskActionsAnchor)}
        onClose={() => setTaskActionsAnchor(null)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 200,
            ...getGlassEffect(),
            border: `1px solid ${getBorderColor('primary', 0.2)}`,
          }
        }}
      >
        <MenuItem onClick={() => setTaskActionsAnchor(null)}>
          <Edit fontSize="small" sx={{ mr: 2 }} /> Edit Task
        </MenuItem>
        <MenuItem onClick={() => setTaskActionsAnchor(null)}>
          <PersonAdd fontSize="small" sx={{ mr: 2 }} /> Assign
        </MenuItem>
        <Divider sx={{ my: 1, borderColor: alpha(theme.palette.divider, 0.3) }} />
        <MenuItem 
          onClick={() => setTaskActionsAnchor(null)} 
          sx={{ 
            color: getThemeColor('error'),
            '&:hover': {
              backgroundColor: alpha(getThemeColor('error'), 0.1),
            }
          }}
        >
          <Delete fontSize="small" sx={{ mr: 2 }} /> Delete
        </MenuItem>
      </Menu>
    </Box>)}
    </>
  );
};

export default MyProject;