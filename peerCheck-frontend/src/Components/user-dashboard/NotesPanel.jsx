'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  alpha,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Add,
  ArrowDownward,
  ArrowUpward,
  CheckCircle,
  Close,
  Comment,
  Group,
  NoteAlt,
  PushPin,
  Star,
  WorkspacePremium,
} from '@mui/icons-material';
import { AnimatePresence, motion } from 'framer-motion';

const NOTE_COLORS = [
  { name: 'Ocean', value: '#38bdf8' },
  { name: 'Mint', value: '#34d399' },
  { name: 'Amber', value: '#fbbf24' },
  { name: 'Coral', value: '#fb7185' },
];

const CATEGORIES = [
  { id: 'thought', label: 'Thought', icon: Star, color: '#a78bfa' },
  { id: 'meeting', label: 'Discussion', icon: Group, color: '#38bdf8' },
  { id: 'task', label: 'Task', icon: CheckCircle, color: '#34d399' },
  { id: 'question', label: 'Question', icon: Comment, color: '#f59e0b' },
  { id: 'mentor', label: 'Mentor Note', icon: WorkspacePremium, color: '#fb7185' },
];

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

const sortNotes = (notes, sortOrder) =>
  [...notes].sort((a, b) => {
    const dateA = new Date(a.timestamp || a.createdAt);
    const dateB = new Date(b.timestamp || b.createdAt);
    return sortOrder === 'oldest' ? dateA - dateB : dateB - dateA;
  });

export function CollaborativeNotesPanel({
  currentUser,
  stickyNotes = [],
  onAddNote,
  onDeleteNote,
  onPinNote,
  onClose,
  openComposerSignal = 0,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [showNewNote, setShowNewNote] = useState(false);
  const [selectedColor, setSelectedColor] = useState(NOTE_COLORS[0]);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('latest');

  useEffect(() => {
    if (!openComposerSignal) return;
    setShowNewNote(true);
  }, [openComposerSignal]);

  const filteredNotes = useMemo(() => {
    const matchingNotes = stickyNotes.filter((note) => {
      if (filter === 'all') return true;
      if (filter === 'pinned') return note.isPinned;
      return note.category === filter;
    });

    return sortNotes(matchingNotes, sortOrder);
  }, [filter, sortOrder, stickyNotes]);

  const pinnedNotes = filteredNotes.filter((note) => note.isPinned);
  const unpinnedNotes = filteredNotes.filter((note) => !note.isPinned);

  const noteStats = useMemo(
    () => ({
      total: stickyNotes.length,
      pinned: stickyNotes.filter((note) => note.isPinned).length,
      mentor: stickyNotes.filter((note) => note.category === 'mentor').length,
    }),
    [stickyNotes]
  );

  const handleAddNote = () => {
    if (!newNoteContent.trim()) return;

    onAddNote?.({
      content: newNoteContent.trim(),
      color: selectedColor.value,
      author: currentUser,
      isPinned: false,
      isImportant: selectedCategory.id === 'mentor',
      category: selectedCategory.id,
      timestamp: new Date().toISOString(),
    });

    setNewNoteContent('');
    setShowNewNote(false);
    setSelectedColor(NOTE_COLORS[0]);
    setSelectedCategory(CATEGORIES[0]);
  };

  const StickyNoteCard = ({ note }) => {
    const category = CATEGORIES.find((item) => item.id === note.category) || CATEGORIES[0];
    const CategoryIcon = category.icon;
    const noteAccent = note.color || category.color;
    const canDelete =
      currentUser?.role === 'teacher' || note.author?._id === currentUser?._id;

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        style={{ width: '100%' }}
      >
        <Paper
          elevation={0}
          sx={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 3,
            p: { xs: 1.75, sm: 2 },
            border: `1px solid ${alpha(noteAccent, 0.28)}`,
            background: `linear-gradient(180deg, ${alpha(noteAccent, 0.12)} 0%, ${alpha(
              theme.palette.background.paper,
              0.92
            )} 62%)`,
            boxShadow: `0 14px 32px ${alpha('#000', theme.palette.mode === 'dark' ? 0.24 : 0.08)}`,
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              borderTop: `3px solid ${alpha(noteAccent, 0.85)}`,
            }}
          />

          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5}>
            <Stack spacing={1} sx={{ minWidth: 0, flex: 1 }}>
              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                flexWrap="wrap"
                alignItems="center"
              >
                <Chip
                  size="small"
                  icon={<CategoryIcon sx={{ fontSize: 14 }} />}
                  label={category.label}
                  sx={{
                    bgcolor: alpha(category.color, 0.14),
                    color: category.color,
                    border: `1px solid ${alpha(category.color, 0.3)}`,
                    fontWeight: 700,
                  }}
                />
                {note.isPinned && (
                  <Chip
                    size="small"
                    icon={<PushPin sx={{ fontSize: 14 }} />}
                    label="Pinned"
                    sx={{
                      bgcolor: alpha(theme.palette.warning.main, 0.16),
                      color: theme.palette.warning.light,
                      border: `1px solid ${alpha(theme.palette.warning.main, 0.35)}`,
                      fontWeight: 700,
                    }}
                  />
                )}
              </Stack>

              <Typography
                variant="body2"
                sx={{
                  color: theme.palette.text.primary,
                  lineHeight: 1.65,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {note.content}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
              <IconButton
                size="small"
                onClick={() => onPinNote?.(note.id || note._id)}
                sx={{
                  color: note.isPinned ? theme.palette.warning.main : theme.palette.text.secondary,
                  bgcolor: alpha(theme.palette.common.black, 0.04),
                }}
              >
                <PushPin fontSize="small" />
              </IconButton>
              {canDelete && (
                <IconButton
                  size="small"
                  onClick={() => onDeleteNote?.(note.id || note._id)}
                  sx={{
                    color: theme.palette.error.main,
                    bgcolor: alpha(theme.palette.common.black, 0.04),
                  }}
                >
                  <Close fontSize="small" />
                </IconButton>
              )}
            </Stack>
          </Stack>

          <Divider sx={{ my: 1.5, borderColor: alpha(theme.palette.divider, 0.14) }} />

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={1}
          >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
              <Avatar
                sx={{
                  width: 28,
                  height: 28,
                  fontSize: 12,
                  bgcolor:
                    note.author?.role === 'teacher'
                      ? alpha(theme.palette.secondary.main, 0.9)
                      : alpha(theme.palette.primary.main, 0.9),
                }}
              >
                {note.author?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" sx={{ color: theme.palette.text.primary, fontWeight: 700 }}>
                  {note.author?.name || 'Unknown'}
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', color: theme.palette.text.secondary }}>
                  {note.author?.role === 'teacher' ? 'Mentor' : 'Team member'}
                </Typography>
              </Box>
            </Stack>

            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, flexShrink: 0 }}>
              {formatTimeAgo(note.timestamp || note.createdAt)}
            </Typography>
          </Stack>
        </Paper>
      </motion.div>
    );
  };

  const renderSection = (title, notes) => {
    if (!notes.length) return null;

    return (
      <Stack spacing={1.25}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography
            variant="overline"
            sx={{
              letterSpacing: 1.1,
              color: theme.palette.text.secondary,
              fontWeight: 700,
            }}
          >
            {title}
          </Typography>
          <Chip
            size="small"
            label={notes.length}
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              color: theme.palette.primary.light,
              fontWeight: 700,
            }}
          />
        </Stack>
        <Stack spacing={1.25}>
          {notes.map((note) => (
            <StickyNoteCard key={note.id || note._id} note={note} />
          ))}
        </Stack>
      </Stack>
    );
  };

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(
          theme.palette.background.default,
          0.96
        )} 20%)`,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 2.5 },
          borderRadius: 0,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.16)}`,
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(12px)',
        }}
      >
        <Stack spacing={2}>
          <Stack
            direction="row"
            alignItems="flex-start"
            justifyContent="space-between"
            spacing={2}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 2.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(theme.palette.primary.main, 0.18),
                  color: theme.palette.primary.main,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.28)}`,
                }}
              >
                <NoteAlt />
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontFamily: '"Adlam Display", serif', fontWeight: 500 }}
                >
                  Team Notes
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  Capture quick updates, open questions, and mentor guidance in one place.
                </Typography>
              </Box>
            </Stack>

            {onClose && !isMobile && (
              <IconButton onClick={onClose} size="small">
                <Close />
              </IconButton>
            )}
          </Stack>

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Chip
              size="small"
              label={`${noteStats.total} total`}
              sx={{ bgcolor: alpha(theme.palette.common.white, 0.05) }}
            />
            <Chip
              size="small"
              label={`${noteStats.pinned} pinned`}
              sx={{
                bgcolor: alpha(theme.palette.warning.main, 0.12),
                color: theme.palette.warning.light,
              }}
            />
            <Chip
              size="small"
              label={`${noteStats.mentor} mentor`}
              sx={{
                bgcolor: alpha(theme.palette.secondary.main, 0.12),
                color: theme.palette.secondary.light,
              }}
            />
          </Stack>
        </Stack>
      </Paper>

      <Box
        sx={{
          p: { xs: 2, sm: 3 },
          flex: 1,
          overflow: 'auto',
        }}
      >
        <Stack spacing={2}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.5, sm: 2 },
              borderRadius: 3,
              border: `1px solid ${alpha(theme.palette.divider, 0.14)}`,
              backgroundColor: alpha(theme.palette.background.paper, 0.7),
            }}
          >
            <Stack spacing={1.5}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                justifyContent="space-between"
                alignItems={{ xs: 'stretch', sm: 'center' }}
              >
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => setShowNewNote((prev) => !prev)}
                  sx={{
                    borderRadius: 2.5,
                    minHeight: 42,
                    px: 2,
                    alignSelf: { xs: 'stretch', sm: 'flex-start' },
                  }}
                >
                  {showNewNote ? 'Hide Composer' : 'New Note'}
                </Button>

                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    Sort
                  </Typography>
                  <ToggleButtonGroup
                    value={sortOrder}
                    exclusive
                    onChange={(event, value) => value && setSortOrder(value)}
                    size="small"
                    sx={{
                      '& .MuiToggleButton-root': {
                        px: 1.25,
                        borderRadius: 2,
                      },
                    }}
                  >
                    <ToggleButton value="latest">
                      <ArrowDownward fontSize="small" />
                    </ToggleButton>
                    <ToggleButton value="oldest">
                      <ArrowUpward fontSize="small" />
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Stack>
              </Stack>

              <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                {['all', 'pinned', ...CATEGORIES.map((category) => category.id)].map((filterType) => {
                  const label =
                    filterType === 'all'
                      ? 'All'
                      : filterType === 'pinned'
                      ? 'Pinned'
                      : CATEGORIES.find((category) => category.id === filterType)?.label || filterType;

                  const selected = filter === filterType;

                  return (
                    <Chip
                      key={filterType}
                      label={label}
                      clickable
                      onClick={() => setFilter(filterType)}
                      sx={{
                        borderRadius: 2,
                        bgcolor: selected
                          ? alpha(theme.palette.primary.main, 0.16)
                          : alpha(theme.palette.common.white, 0.03),
                        color: selected ? theme.palette.primary.main : theme.palette.text.secondary,
                        border: `1px solid ${
                          selected
                            ? alpha(theme.palette.primary.main, 0.35)
                            : alpha(theme.palette.divider, 0.18)
                        }`,
                        fontWeight: selected ? 700 : 500,
                      }}
                    />
                  );
                })}
              </Stack>
            </Stack>
          </Paper>

          <AnimatePresence initial={false}>
            {showNewNote && (
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    borderRadius: 3,
                    border: `1px solid ${alpha(selectedColor.value, 0.3)}`,
                    background: `linear-gradient(180deg, ${alpha(selectedColor.value, 0.12)} 0%, ${alpha(
                      theme.palette.background.paper,
                      0.95
                    )} 100%)`,
                  }}
                >
                  <Stack spacing={2}>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={1.5}
                      justifyContent="space-between"
                      alignItems={{ xs: 'stretch', sm: 'center' }}
                    >
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        Add a note
                      </Typography>
                      <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                        {NOTE_COLORS.map((color) => (
                          <Box
                            key={color.name}
                            onClick={() => setSelectedColor(color)}
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              cursor: 'pointer',
                              bgcolor: color.value,
                              border: `3px solid ${
                                selectedColor.value === color.value
                                  ? alpha(theme.palette.common.white, 0.9)
                                  : 'transparent'
                              }`,
                              boxShadow: `0 0 0 1px ${alpha(color.value, 0.35)}`,
                            }}
                          />
                        ))}
                      </Stack>
                    </Stack>

                    <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                      {CATEGORIES.map((category) => {
                        const Icon = category.icon;
                        const selected = selectedCategory.id === category.id;

                        return (
                          <Chip
                            key={category.id}
                            icon={<Icon sx={{ fontSize: 14 }} />}
                            label={category.label}
                            clickable
                            onClick={() => setSelectedCategory(category)}
                            sx={{
                              bgcolor: selected ? alpha(category.color, 0.18) : alpha(theme.palette.common.white, 0.04),
                              color: selected ? category.color : theme.palette.text.secondary,
                              border: `1px solid ${
                                selected ? alpha(category.color, 0.35) : alpha(theme.palette.divider, 0.18)
                              }`,
                              fontWeight: selected ? 700 : 500,
                            }}
                          />
                        );
                      })}
                    </Stack>

                    <TextField
                      fullWidth
                      multiline
                      minRows={4}
                      value={newNoteContent}
                      onChange={(event) => setNewNoteContent(event.target.value)}
                      placeholder="Share an update, decision, blocker, or follow-up..."
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2.5,
                          bgcolor: alpha(theme.palette.background.paper, 0.72),
                        },
                      }}
                    />

                    <Stack
                      direction={{ xs: 'column-reverse', sm: 'row' }}
                      spacing={1}
                      justifyContent="flex-end"
                    >
                      <Button
                        variant="text"
                        onClick={() => {
                          setShowNewNote(false);
                          setNewNoteContent('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleAddNote}
                        disabled={!newNoteContent.trim()}
                      >
                        Save Note
                      </Button>
                    </Stack>
                  </Stack>
                </Paper>
              </motion.div>
            )}
          </AnimatePresence>

          {filteredNotes.length > 0 ? (
            <Stack spacing={2.5}>
              {renderSection('Pinned Notes', pinnedNotes)}
              {renderSection(pinnedNotes.length > 0 ? 'More Notes' : 'Notes', unpinnedNotes)}
            </Stack>
          ) : (
            !showNewNote && (
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  py: { xs: 5, sm: 7 },
                  px: 3,
                  textAlign: 'center',
                  border: `1px dashed ${alpha(theme.palette.divider, 0.24)}`,
                  backgroundColor: alpha(theme.palette.background.paper, 0.5),
                }}
              >
                <NoteAlt
                  sx={{
                    fontSize: 42,
                    color: alpha(theme.palette.text.secondary, 0.4),
                    mb: 1.5,
                  }}
                />
                <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 700 }}>
                  No notes yet
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 2 }}>
                  Start with a quick update, a question for the team, or a mentor reminder.
                </Typography>
                <Button variant="contained" startIcon={<Add />} onClick={() => setShowNewNote(true)}>
                  Create First Note
                </Button>
              </Paper>
            )
          )}
        </Stack>
      </Box>
    </Box>
  );
}

export const StickyNoteEditor = CollaborativeNotesPanel;

export default CollaborativeNotesPanel;
