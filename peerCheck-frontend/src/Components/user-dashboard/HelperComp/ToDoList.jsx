import React, { useState, useEffect } from 'react';
import axiosClient from '@/api/axiosClient';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Paper,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Checkbox,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Tooltip,
  CircularProgress,
  Badge,
  Divider,
  Slide,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  alpha,
  useTheme,
  Avatar,
  LinearProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  PlaylistAddCheck as TodoIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  Flag as FlagIcon,
  CalendarToday as CalendarIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  PriorityHigh as PriorityHighIcon,
  Work as WorkIcon,
  ShoppingCart as ShoppingCartIcon,
  School as SchoolIcon,
  LocalHospital as HealthIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  KeyboardDoubleArrowLeft as SlideInIcon,
  KeyboardDoubleArrowRight as SlideOutIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { motion, AnimatePresence } from 'framer-motion';

const TodoButtonDialog = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [newTodo, setNewTodo] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('personal');
  const [dueDate, setDueDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [bulkSelect, setBulkSelect] = useState([]);
  const [dialogWidth, setDialogWidth] = useState(400); // Default width

  useEffect(() => {
    if (open) {
      fetchTodos();
      fetchStats();
    }
  }, [open, filter, sortBy, sortOrder, searchTerm]);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const params = {
        sortBy,
        sortOrder
      };
      
      if (filter === 'active') params.completed = 'false';
      if (filter === 'completed') params.completed = 'true';
      if (filter.startsWith('priority-')) {
        params.priority = filter.split('-')[1];
      }
      if (filter.startsWith('category-')) {
        params.category = filter.split('-')[1];
      }
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      const response = await axiosClient.get('/todos', { params });
      if (response.data.success) {
        setTodos(response.data.todos || []);
      }
    } catch (error) {
      console.error('Error fetching todos:', error);
      showSnackbar('Error fetching todos', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axiosClient.get('/todos/stats');
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching todo stats:', error);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const addTodo = async () => {
    if (!newTodo.trim()) {
      showSnackbar('Please enter a todo title', 'warning');
      return;
    }

    try {
      const todoData = {
        title: newTodo,
        priority,
        category,
        dueDate: dueDate ? dueDate.toISOString() : null,
      };

      const response = await axiosClient.post('/todos', todoData);
      if (response.data.success) {
        setTodos([response.data.todo, ...todos]);
        setNewTodo('');
        setPriority('medium');
        setCategory('personal');
        setDueDate(null);
        showSnackbar('Todo added successfully');
        fetchStats();
      }
    } catch (error) {
      console.error('Error adding todo:', error);
      showSnackbar('Error adding todo', 'error');
    }
  };

  const toggleTodo = async (id) => {
    try {
      const response = await axiosClient.patch(`/todos/${id}/toggle`);
      if (response.data.success) {
        setTodos(todos.map(todo => 
          todo._id === id ? response.data.todo : todo
        ));
        showSnackbar('Todo updated');
        fetchStats();
      }
    } catch (error) {
      console.error('Error toggling todo:', error);
      showSnackbar('Error updating todo', 'error');
    }
  };

  const deleteTodo = async (id) => {
    try {
      const response = await axiosClient.delete(`/todos/${id}`);
      if (response.data.success) {
        setTodos(todos.filter(todo => todo._id !== id));
        showSnackbar('Todo deleted');
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
      showSnackbar('Error deleting todo', 'error');
    }
  };

  const startEdit = (todo) => {
    setEditingId(todo._id);
    setEditData({
      title: todo.title,
      priority: todo.priority,
      category: todo.category,
      dueDate: todo.dueDate ? new Date(todo.dueDate) : null,
    });
  };

  const saveEdit = async () => {
    try {
      const updates = {
        ...editData,
        dueDate: editData.dueDate ? editData.dueDate.toISOString() : null,
      };

      const response = await axiosClient.put(`/todos/${editingId}`, updates);
      if (response.data.success) {
        setTodos(todos.map(todo => 
          todo._id === editingId ? response.data.todo : todo
        ));
        setEditingId(null);
        setEditData({});
        showSnackbar('Todo updated');
        fetchStats();
      }
    } catch (error) {
      console.error('Error updating todo:', error);
      showSnackbar('Error updating todo', 'error');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleBulkDelete = async () => {
    if (bulkSelect.length === 0) return;

    if (!window.confirm(`Delete ${bulkSelect.length} selected todos?`)) return;

    try {
      const deletePromises = bulkSelect.map(id => 
        axiosClient.delete(`/todos/${id}`)
      );
      await Promise.all(deletePromises);
      
      setTodos(todos.filter(todo => !bulkSelect.includes(todo._id)));
      setBulkSelect([]);
      showSnackbar(`${bulkSelect.length} todos deleted`);
      fetchStats();
    } catch (error) {
      console.error('Error bulk deleting todos:', error);
      showSnackbar('Error deleting todos', 'error');
    }
  };

  const toggleBulkSelect = (id) => {
    setBulkSelect(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    if (bulkSelect.length === todos.length) {
      setBulkSelect([]);
    } else {
      setBulkSelect(todos.map(todo => todo._id));
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return theme.palette.error.main;
      case 'medium': return theme.palette.warning.main;
      case 'low': return theme.palette.success.main;
      default: return theme.palette.info.main;
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <PriorityHighIcon fontSize="small" />;
      case 'medium': return <FlagIcon fontSize="small" color="warning" />;
      case 'low': return <FlagIcon fontSize="small" color="success" />;
      default: return <FlagIcon fontSize="small" />;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'work': return <WorkIcon fontSize="small" />;
      case 'shopping': return <ShoppingCartIcon fontSize="small" />;
      case 'study': return <SchoolIcon fontSize="small" />;
      case 'health': return <HealthIcon fontSize="small" />;
      default: return <PersonIcon fontSize="small" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${Math.abs(diffDays)}d ago`;
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `${diffDays}d`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const isOverdue = (todo) => {
    if (!todo.dueDate || todo.completed) return false;
    return new Date(todo.dueDate) < new Date();
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const toggleDialogSize = () => {
    setDialogWidth(prev => prev === 400 ? 600 : 400);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      {/* Floating Button */}
      <Box
        sx={{
          position: 'fixed',
          left: { xs: 16, sm: 20 },
          bottom: { xs: 16, sm: 20 },
          zIndex: 9999,
        }}
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Badge
            badgeContent={stats?.pending || 0}
            color="error"
            overlap="circular"
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.7rem',
                height: 20,
                minWidth: 20,
                animation: stats?.pending > 0 ? 'pulse 1.5s infinite' : 'none',
                '@keyframes pulse': {
                  '0%': { transform: 'scale(1)', boxShadow: `0 0 0 0 ${alpha(theme.palette.error.main, 0.7)}` },
                  '70%': { transform: 'scale(1.1)', boxShadow: `0 0 0 10px ${alpha(theme.palette.error.main, 0)}` },
                  '100%': { transform: 'scale(1)', boxShadow: `0 0 0 0 ${alpha(theme.palette.error.main, 0)}` },
                }
              }
            }}
          >
            <Button
              variant="contained"
              startIcon={<TodoIcon />}
              onClick={handleOpen}
              sx={{
                minWidth: 'auto',
                width: { xs: 52, sm: 56 },
                height: { xs: 52, sm: 56 },
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                color: 'white',
                boxShadow: theme.shadows[8],
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[12],
                },
              }}
            />
          </Badge>
        </motion.div>
      </Box>

      {/* Slide Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'left' }}
        PaperProps={{
          sx: {
            margin: 0,
            position: 'fixed',
            left: 0,
            top: 0,
            height: '100vh',
            width: dialogWidth,
            maxWidth: '100vw',
            borderRadius: '0 12px 12px 0',
            borderLeft: `4px solid ${theme.palette.primary.main}`,
            display: 'flex',
            flexDirection: 'column',
          }
        }}
        sx={{
          '& .MuiDialog-container': {
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
          },
          '& .MuiBackdrop-root': {
            backgroundColor: alpha('#000', 0.2),
            backdropFilter: 'blur(4px)',
          }
        }}
      >
        {/* Header */}
        <DialogTitle
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            color: 'white',
            position: 'sticky',
            top: 0,
            zIndex: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TodoIcon />
            <Typography variant="h6" fontWeight="600">
              Quick Todos
            </Typography>
            {stats && (
              <Chip
                label={`${stats.completed}/${stats.total}`}
                size="small"
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 600,
                }}
              />
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title={dialogWidth === 400 ? "Expand" : "Collapse"}>
              <IconButton
                onClick={toggleDialogSize}
                size="small"
                sx={{ color: 'white' }}
              >
                {dialogWidth === 400 ? <SlideOutIcon /> : <SlideInIcon />}
              </IconButton>
            </Tooltip>
            <IconButton
              onClick={handleClose}
              size="small"
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        {/* Content */}
        <DialogContent sx={{ p: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Stats Bar */}
          {stats && (
            <Paper
              sx={{
                p: 1.5,
                mx: 2,
                mt: 2,
                borderRadius: 2,
                background: alpha(theme.palette.primary.main, 0.05),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                  }}>
                    <TodoIcon fontSize="small" />
                  </Box>
                  <Box>
                    <Typography variant="body2" fontWeight="600">
                      {stats.pending} Pending
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {stats.completed} completed
                    </Typography>
                  </Box>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={stats.completionRate}
                  sx={{
                    width: 80,
                    height: 8,
                    borderRadius: 4,
                  }}
                />
              </Box>
            </Paper>
          )}

          {/* Add Todo Form */}
          <Box sx={{ p: 2 }}>
            <Paper
              sx={{
                p: 2,
                borderRadius: 2,
                background: theme.palette.background.paper,
                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              }}
            >
              <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                <TextField
                  fullWidth
                  placeholder="Add a todo..."
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                  size="small"
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AddIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  variant="contained"
                  onClick={addTodo}
                  disabled={!newTodo.trim()}
                  sx={{ minWidth: 'auto', px: 2 }}
                >
                  Add
                </Button>
              </Box>
              
              {dialogWidth === 600 && (
                <Box sx={{ display: 'flex', gap: 1, mt:1 }}>
                  <FormControl size="small" sx={{ flex: 1 }}>
                    <InputLabel>Priority</InputLabel>
                    <Select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      label="Priority"
                    >
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <FormControl size="small" sx={{ flex: 1 }}>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      label="Category"
                    >
                      <MenuItem value="personal">Personal</MenuItem>
                      <MenuItem value="work">Work</MenuItem>
                      <MenuItem value="shopping">Shopping</MenuItem>
                      <MenuItem value="study">Study</MenuItem>
                      <MenuItem value="health">Health</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              )}

              {dialogWidth === 600 && (
                <Box sx={{ mt: 1 }}>
                  <DatePicker
                    label="Due Date"
                    value={dueDate}
                    onChange={setDueDate}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                      }
                    }}
                  />
                </Box>
              )}
            </Paper>
          </Box>

          {/* Filters */}
          <Box sx={{ px: 2, mb: 1 }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                size="small"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ flex: 1 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchTerm('')}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              <Tooltip title="Filter">
                <IconButton size="small" onClick={() => setFilter(filter === 'active' ? 'all' : 'active')}>
                  <FilterIcon fontSize="small" color={filter === 'active' ? 'primary' : 'action'} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Todo List */}
          <Box sx={{ flex: 1, overflow: 'auto', px: 2, pb: 2 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress size={24} />
              </Box>
            ) : todos.length === 0 ? (
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <TodoIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2, opacity: 0.5 }} />
                <Typography variant="body2" color="text.secondary">
                  No todos found
                </Typography>
                {searchTerm && (
                  <Button
                    size="small"
                    onClick={() => setSearchTerm('')}
                    sx={{ mt: 1 }}
                  >
                    Clear search
                  </Button>
                )}
              </Box>
            ) : (
              <List sx={{ width: '100%' }}>
                <AnimatePresence>
                  {todos.map((todo) => (
                    <motion.div
                      key={todo._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      layout
                    >
                      <Paper
                        sx={{
                          mb: 1,
                          borderRadius: 1,
                          borderLeft: `3px solid ${getPriorityColor(todo.priority)}`,
                          opacity: todo.completed ? 0.7 : 1,
                          position: 'relative',
                          overflow: 'hidden',
                          '&:hover': {
                            boxShadow: theme.shadows[1],
                          }
                        }}
                      >
                        <ListItem
                          sx={{
                            py: 1,
                            pl: 1,
                            pr: 0,
                            bgcolor: todo.completed 
                              ? alpha(theme.palette.success.main, 0.05)
                              : isOverdue(todo)
                                ? alpha(theme.palette.error.main, 0.05)
                                : 'transparent'
                          }}
                        >
                          <Checkbox
                            edge="start"
                            checked={todo.completed}
                            onChange={() => toggleTodo(todo._id)}
                            icon={<RadioButtonUncheckedIcon />}
                            checkedIcon={<CheckCircleIcon color="success" />}
                            size="small"
                            sx={{ mr: 1 }}
                          />
                          
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                {editingId === todo._id ? (
                                  <TextField
                                    value={editData.title}
                                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                    size="small"
                                    fullWidth
                                    autoFocus
                                    sx={{ fontSize: '0.875rem' }}
                                  />
                                ) : (
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      textDecoration: todo.completed ? 'line-through' : 'none',
                                      color: todo.completed ? 'text.secondary' : 'text.primary',
                                      fontWeight: 500,
                                      flex: 1,
                                    }}
                                  >
                                    {todo.title}
                                  </Typography>
                                )}
                                
                        {dialogWidth === 600 && (
                          <Chip
                            icon={getCategoryIcon(todo.category)}
                            label={todo.category}
                            size="small"
                            sx={{ height: 30, fontSize: '0.7rem', top: '30%', right: 79, position: 'absolute' }}
                          />
                        )}
                              </Box>
                            }
                            secondary={
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  {getPriorityIcon(todo.priority)}
                                  <Typography variant="caption" color="text.secondary">
                                    {todo.priority}
                                  </Typography>
                                  
                                  {todo?.dueDate && (
                                    <>
                                      <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                                      <CalendarIcon fontSize="small" sx={{ color: 'text.secondary', fontSize: 14 }} />
                                      <Typography
                                        variant="caption"
                                        color={isOverdue(todo) ? 'error' : 'text.secondary'}
                                        sx={{ fontWeight: isOverdue(todo) ? 600 : 400 }}
                                      >
                                        {formatDate(todo?.dueDate)}
                                      </Typography>
                                    </>
                                  )}
                                </Box>
                                
                                {todo?.project && dialogWidth === 600 && (
                                  <Chip
                                    label={ todo?.project?.name || todo?.project?.projectName}
                                    size="small"
                                    sx={{ height: 20, fontSize: '0.7rem'}}
                                  />
                                )}
                              </Box>
                            }
                            sx={{ 
                              '& .MuiListItemText-primary': { mb: 0.25 },
                              '& .MuiListItemText-secondary': { mt: 0.25 }
                            }}
                          />
                          
                          <ListItemSecondaryAction sx={{ display: 'flex', alignItems: 'center' }}>
                            {editingId === todo._id ? (
                              <>
                                <IconButton onClick={saveEdit} size="small" color="primary">
                                  <CheckCircleOutlineIcon fontSize="small" />
                                </IconButton>
                                <IconButton onClick={cancelEdit} size="small">
                                  <CloseIcon fontSize="small" />
                                </IconButton>
                              </>
                            ) : (
                              <>
                                <Tooltip title="Edit">
                                  <IconButton onClick={() => startEdit(todo)} size="small">
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton onClick={() => deleteTodo(todo._id)} size="small" color="error">
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                          </ListItemSecondaryAction>
                        </ListItem>
                      </Paper>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </List>
            )}
          </Box>

          {/* Bulk Actions */}
          {bulkSelect.length > 0 && (
            <Paper
              sx={{
                mx: 2,
                mb: 2,
                p: 1.5,
                borderRadius: 2,
                background: alpha(theme.palette.warning.main, 0.1),
                border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography variant="body2" fontWeight="500">
                {bulkSelect.length} selected
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => bulkSelect.forEach(id => toggleTodo(id))}
                  sx={{ fontSize: '0.75rem' }}
                >
                  Toggle
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color="error"
                  onClick={handleBulkDelete}
                  sx={{ fontSize: '0.75rem' }}
                >
                  Delete
                </Button>
              </Box>
            </Paper>
          )}
        </DialogContent>

        {/* Footer */}
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <Button
              size="small"
              onClick={selectAll}
              disabled={todos.length === 0}
            >
              {bulkSelect.length === todos.length ? 'Deselect All' : 'Select All'}
            </Button>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                label={`${todos.filter(t => t.completed).length} done`}
                size="small"
                color="success"
                variant="outlined"
              />
              <Chip
                label={`${todos.filter(t => !t.completed).length} pending`}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Box>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </LocalizationProvider>
  );
};

export default TodoButtonDialog;
