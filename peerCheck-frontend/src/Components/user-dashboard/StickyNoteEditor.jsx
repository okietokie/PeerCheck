// peerCheck-frontend/src/Components/user-dashboard/StickyNoteEditor.jsx
'use client';

import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Avatar,
  Chip,
  Paper,
  TextField,
  useTheme,
  alpha
} from '@mui/material';
import {
  Edit as EditIcon,
  CheckCircle,
  PersonAdd,
  Upload,
  MoreVert,
  DragIndicator,
  Timeline,
  BarChart,
  Note as NoteIcon,
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
  RefreshOutlined,
  Man,
  Person,
  AddTask,
  PlayArrow as PlayArrowIcon,
  Security,
  History,
  Settings,
  Lock as LockIcon,
  RateReview,
  Flag,
  Pin as PinIcon
} from '@mui/icons-material';
import {
  FormatBold as BoldIcon,
  FormatItalic as ItalicIcon,
  FormatUnderlined as UnderlineIcon,
  FormatListBulleted as ListIcon,
  FormatListNumbered as OrderedListIcon,
  Highlight as HighlightIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  CloudOff,
  Lock as LockOpenIcon
} from '@mui/icons-material';

const NOTE_COLORS = [
  { name: 'Cream', value: '#FEF9E7', border: '#F4D03F' },
  { name: 'Rose', value: '#FDEDEC', border: '#E74C3C' },
  { name: 'Mint', value: '#E8F6F3', border: '#1ABC9C' },
  { name: 'Sky', value: '#EBF5FB', border: '#3498DB' },
  { name: 'Lavender', value: '#F4ECF7', border: '#9B59B6' },
  { name: 'Peach', value: '#FDF2E9', border: '#E67E22' },
];

const CATEGORIES = [
  { id: 'thought', label: 'Thought', icon: Star, color: '#9B59B6' },
  { id: 'meeting', label: 'Discussion', icon: Group, color: '#3498DB' },
  { id: 'task', label: 'Task', icon: CheckCircle, color: '#1ABC9C' },
  { id: 'question', label: 'Question', icon: Comment, color: '#E67E22' },
  { id: 'mentor', label: 'Mentor Note', icon: WorkspacePremium, color: '#E74C3C' },
];

export function StickyNoteEditor({
  projectId,
  initialContent = '',
  currentUser,
  onOpenHistory,
  onToggleComments,
  commentsOpen,
  stickyNotes = [],
  onAddNote,
  onDeleteNote,
  onPinNote,
}) {
  const theme = useTheme();
  const [isConnected, setIsConnected] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showNewNote, setShowNewNote] = useState(false);
  const [selectedColor, setSelectedColor] = useState(NOTE_COLORS[0]);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [activeUsers] = useState([currentUser]);
  const [filter, setFilter] = useState('all');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight.configure({ multicolor: false }),
      Placeholder.configure({
        placeholder: 'Start typing your collaborative notes here... Use @name to mention teammates',
      }),
      Underline,
    ],
    content: initialContent,
    editable: !isLocked || currentUser.role === 'teacher',
    immediatelyRender: false,
  });

  const isMentor = currentUser.role === 'teacher';

  const handleAddNote = () => {
    if (!newNoteContent.trim()) return;
    
    onAddNote?.({
      content: newNoteContent,
      color: selectedColor.value,
      author: currentUser,
      isPinned: false,
      isImportant: selectedCategory.id === 'mentor',
      category: selectedCategory.id,
    });
    
    setNewNoteContent('');
    setShowNewNote(false);
    setSelectedColor(NOTE_COLORS[0]);
    setSelectedCategory(CATEGORIES[0]);
  };

  const filteredNotes = stickyNotes.filter(note => {
    if (filter === 'all') return true;
    if (filter === 'pinned') return note.isPinned;
    return note.category === filter;
  });

  const pinnedNotes = filteredNotes.filter(n => n.isPinned);
  const unpinnedNotes = filteredNotes.filter(n => !n.isPinned);

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  // StickyNoteCard Component
  const StickyNoteCard = ({ 
    note, 
    onPin, 
    onDelete,
    currentUser 
  }) => {
    const category = CATEGORIES.find(c => c.id === note.category);
    const CategoryIcon = category?.icon || Star;
    const noteColor = NOTE_COLORS.find(c => c.value === note.color) || NOTE_COLORS[0];
    
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -10 }}
        whileHover={{ scale: 1.02, rotate: note.isPinned ? 0 : 1 }}
        style={{ width: '100%' }}
      >
        <Paper
          sx={{
            p: 2,
            borderRadius: 2,
            mb: 2,
            backgroundColor: note.color || '#FEF9E7',
            borderLeft: `4px solid ${noteColor.border}`,
            boxShadow: theme.shadows[2],
            '&:hover': {
              boxShadow: theme.shadows[6],
            },
            transition: 'all 0.3s ease',
            position: 'relative',
          }}
        >
          {note.isPinned && (
            <Box sx={{ 
              position: 'absolute', 
              top: -6, 
              right: -6,
              backgroundColor: theme.palette.warning.main,
              borderRadius: '50%',
              width: 20,
              height: 20,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: theme.shadows[2],
            }}>
              <PinIcon sx={{ fontSize: 12, color: 'white' }} />
            </Box>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
            <Chip
              label={category?.label || 'Thought'}
              size="small"
              icon={<CategoryIcon sx={{ fontSize: 14 }} />}
              sx={{
                backgroundColor: alpha(category?.color || '#9B59B6', 0.2),
                color: category?.color || '#9B59B6',
                fontWeight: 600,
                fontSize: '0.7rem',
              }}
            />
            
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onPin();
                }}
                sx={{
                  color: note.isPinned ? theme.palette.warning.main : theme.palette.text.secondary,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.warning.main, 0.1),
                  }
                }}
              >
                <PinIcon fontSize="small" />
              </IconButton>
              
              {(currentUser.role === 'teacher' || note.author._id === currentUser._id) && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  sx={{
                    color: theme.palette.error.main,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.error.main, 0.1),
                    }
                  }}
                >
                  <Close fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Box>
          
          <Typography 
            variant="body2" 
            sx={{ 
              color: theme.palette.primary.main,
              mb: 2,
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {note.content}
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            pt: 1,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar
                sx={{
                  width: 24,
                  height: 24,
                  fontSize: 12,
                  backgroundColor: note.author.role === 'teacher' 
                    ? theme.palette.secondary.main 
                    : theme.palette.primary.main,
                }}
              >
                {note.author.name.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                {note.author.name}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
              {formatTimeAgo(note.timestamp)}
            </Typography>
          </Box>
          
          {note.isImportant && (
            <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
              <Flag sx={{ fontSize: 16, color: theme.palette.error.main }} />
            </Box>
          )}
        </Paper>
      </motion.div>
    );
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      bgcolor: 'background.paper',
      borderRadius: 2,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <Paper
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderRadius: 0,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            backgroundColor: theme.palette.primary.main,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Star sx={{ color: 'white', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Team Notes
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Collaborative workspace
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={isConnected ? 'Live' : 'Offline'}
            size="small"
            icon={isConnected ? <Cloud /> : <CloudOff />}
            color={isConnected ? 'success' : 'error'}
            variant="outlined"
          />
          
          {isMentor && (
            <IconButton
              onClick={() => setIsLocked(!isLocked)}
              size="small"
              color={isLocked ? 'error' : 'default'}
            >
              {isLocked ? <LockIcon /> : <LockOpenIcon />}
            </IconButton>
          )}
          
          <IconButton
            onClick={onOpenHistory}
            size="small"
          >
            <History />
          </IconButton>
          
          <IconButton
            onClick={onToggleComments}
            size="small"
            color={commentsOpen ? 'primary' : 'default'}
          >
            <Comment />
          </IconButton>
        </Box>
      </Paper>

      {isLocked && currentUser.role !== 'teacher' && (
        <Paper
          sx={{
            p: 1.5,
            backgroundColor: alpha(theme.palette.warning.main, 0.1),
            borderRadius: 0,
            borderBottom: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LockIcon sx={{ fontSize: 16, color: theme.palette.warning.main }} />
            <Typography variant="body2" sx={{ color: theme.palette.warning.main }}>
              Editor is locked by mentor. You can view but not edit.
            </Typography>
          </Box>
        </Paper>
      )}

      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Main Editor */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Toolbar */}
          <Paper
            sx={{
              p: 1,
              borderRadius: 0,
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            {['Bold', 'Italic', 'Underline', 'List', 'OrderedList', 'Highlight'].map((action) => (
              <Button
                key={action}
                size="small"
                variant="outlined"
                sx={{ minWidth: 'auto', p: 0.5 }}
              >
                {action === 'Bold' && <BoldIcon sx={{ fontSize: 16 }} />}
                {action === 'Italic' && <ItalicIcon sx={{ fontSize: 16 }} />}
                {action === 'Underline' && <UnderlineIcon sx={{ fontSize: 16 }} />}
                {action === 'List' && <ListIcon sx={{ fontSize: 16 }} />}
                {action === 'OrderedList' && <OrderedListIcon sx={{ fontSize: 16 }} />}
                {action === 'Highlight' && <HighlightIcon sx={{ fontSize: 16 }} />}
              </Button>
            ))}
            
            <Box sx={{ flex: 1 }} />
            
            <IconButton size="small">
              <UndoIcon sx={{ fontSize: 16 }} />
            </IconButton>
            <IconButton size="small">
              <RedoIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Paper>

          {/* Editor Content */}
          <Box sx={{ flex: 1, p: 3, overflow: 'auto' }}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 2,
                minHeight: '200px',
                border: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                '& .ProseMirror': {
                  minHeight: '150px',
                  outline: 'none',
                }
              }}
            >
              <EditorContent editor={editor} />
            </Paper>
          </Box>
        </Box>

        {/* Sticky Notes Sidebar */}
        <Paper
          sx={{
            width: 320,
            display: 'flex',
            flexDirection: 'column',
            borderLeft: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.2)}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PinIcon sx={{ fontSize: 16, color: theme.palette.warning.main }} />
                Sticky Notes
              </Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<Add />}
                onClick={() => setShowNewNote(true)}
              >
                Add
              </Button>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 0.5, overflowX: 'auto', pb: 1 }}>
              {['all', 'pinned', ...CATEGORIES.map(c => c.id)].map((filterType) => (
                <Chip
                  key={filterType}
                  label={filterType === 'all' ? 'All' : 
                         filterType === 'pinned' ? 'Pinned' : 
                         CATEGORIES.find(c => c.id === filterType)?.label || filterType}
                  size="small"
                  onClick={() => setFilter(filterType)}
                  color={filter === filterType ? 'primary' : 'default'}
                  variant={filter === filterType ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
          </Box>

          <Box sx={{ flex: 1, p: 2, overflow: 'auto' }}>
            <AnimatePresence mode="popLayout">
              {showNewNote && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                >
                  <Paper
                    sx={{
                      p: 2,
                      mb: 2,
                      borderRadius: 2,
                      backgroundColor: selectedColor.value,
                      border: `2px solid ${selectedColor.border}`,
                      boxShadow: theme.shadows[4],
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {NOTE_COLORS.map((color) => (
                          <IconButton
                            key={color.name}
                            size="small"
                            onClick={() => setSelectedColor(color)}
                            sx={{
                              width: 20,
                              height: 20,
                              minWidth: 'auto',
                              backgroundColor: color.value,
                              border: `2px solid ${selectedColor.value === color.value ? theme.palette.common.black : 'transparent'}`,
                              '&:hover': {
                                transform: 'scale(1.1)',
                              }
                            }}
                          />
                        ))}
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => setShowNewNote(false)}
                      >
                        <Close />
                      </IconButton>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 0.5, mb: 2, overflowX: 'auto' }}>
                      {CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        return (
                          <Chip
                            key={cat.id}
                            label={cat.label}
                            size="small"
                            icon={<Icon sx={{ fontSize: 14 }} />}
                            onClick={() => setSelectedCategory(cat)}
                            sx={{
                              backgroundColor: selectedCategory.id === cat.id ? cat.color : alpha(theme.palette.common.white, 0.5),
                              color: selectedCategory.id === cat.id ? 'white' : 'inherit',
                            }}
                          />
                        );
                      })}
                    </Box>
                    
                    <TextField
                      multiline
                      rows={3}
                      fullWidth
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      placeholder="Write your note..."
                      variant="standard"
                      InputProps={{
                        disableUnderline: true,
                        sx: {
                          color: theme.palette.getContrastText(selectedColor.value),
                          '&::placeholder': {
                            color: alpha(theme.palette.getContrastText(selectedColor.value), 0.6),
                          }
                        }
                      }}
                      sx={{ mb: 2 }}
                    />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={handleAddNote}
                        disabled={!newNoteContent.trim()}
                        startIcon={<CheckCircle />}
                        sx={{
                          backgroundColor: theme.palette.common.black,
                          color: theme.palette.common.white,
                          '&:hover': {
                            backgroundColor: theme.palette.grey[900],
                          }
                        }}
                      >
                        Save Note
                      </Button>
                    </Box>
                  </Paper>
                </motion.div>
              )}

              {pinnedNotes.map((note) => (
                <StickyNoteCard
                  key={note.id}
                  note={note}
                  onPin={() => onPinNote?.(note.id)}
                  onDelete={() => onDeleteNote?.(note.id)}
                  currentUser={currentUser}
                />
              ))}

              {unpinnedNotes.map((note) => (
                <StickyNoteCard
                  key={note.id}
                  note={note}
                  onPin={() => onPinNote?.(note.id)}
                  onDelete={() => onDeleteNote?.(note.id)}
                  currentUser={currentUser}
                />
              ))}

              {filteredNotes.length === 0 && !showNewNote && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    py: 8,
                    textAlign: 'center',
                  }}>
                    <PinIcon sx={{ fontSize: 48, color: alpha(theme.palette.text.secondary, 0.3), mb: 2 }} />
                    <Typography variant="body1" sx={{ color: 'text.secondary', mb: 1 }}>
                      No notes yet
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Click "Add" to create one
                    </Typography>
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}