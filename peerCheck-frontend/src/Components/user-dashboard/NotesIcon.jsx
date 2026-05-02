// peerCheck-frontend/src/Components/user-dashboard/NotesIcon.jsx
import { useState, useRef, useEffect } from 'react';
import { 
  IconButton,
  Box,
  Badge,
  Tooltip,
  useTheme,
  alpha,
  useMediaQuery
} from '@mui/material';
import { 
  StickyNote2 as NoteIcon,
  Close
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { CollaborativeNotesPanel } from './CollaborativeNotesPanel';

export function CollaborativeNotesIcon({ 
  projectId, 
  currentUser,
  stickyNotes = [],
  onAddNote,
  onDeleteNote,
  onPinNote,
  position = 'right'
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef(null);

  // Close panel when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        // Check if click is on the icon button
        const iconButton = event.target.closest('.notes-icon-button');
        if (!iconButton) {
          setIsOpen(false);
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadNotesCount = stickyNotes.filter(note => 
    !note.isRead && note.author._id !== currentUser._id
  ).length;

  return (
    <>
      {/* Icon Button */}
      <Tooltip title="Collaborative Notes" placement="left">
        <IconButton
          className="notes-icon-button"
          onClick={() => setIsOpen(!isOpen)}
          sx={{
            position: 'fixed',
            right: { xs: 16, sm: 20 },
            top: { xs: 'auto', sm: '50%' },
            bottom: { xs: 82, sm: 'auto' },
            transform: { xs: 'none', sm: 'translateY(-50%)' },
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            width: { xs: 52, sm: 56 },
            height: { xs: 52, sm: 56 },
            zIndex: 1300,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
              transform: { xs: 'scale(1.05)', sm: 'translateY(-50%) scale(1.1)' },
            },
            boxShadow: theme.shadows[8],
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <Badge 
            badgeContent={unreadNotesCount} 
            color="error"
            max={99}
          >
            <NoteIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      {/* Sliding Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={panelRef}
            initial={{ x: '100%', opacity: 0 }}
            animate={{ 
              x: 0, 
              opacity: 1,
              transition: {
                type: "spring",
                damping: 25,
                stiffness: 200
              }
            }}
            exit={{ 
              x: '100%', 
              opacity: 0,
              transition: {
                duration: 0.2
              }
            }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: isMobile ? '100vw' : '380px',
              height: '100vh',
              zIndex: 1400,
              backgroundColor: theme.palette.background.paper,
              boxShadow: theme.shadows[16],
              borderLeft: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <CollaborativeNotesPanel
              projectId={projectId}
              currentUser={currentUser}
              stickyNotes={stickyNotes}
              onAddNote={onAddNote}
              onDeleteNote={onDeleteNote}
              onPinNote={onPinNote}
              onClose={() => setIsOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: alpha(theme.palette.common.black, 0.5),
              zIndex: 1399,
              backdropFilter: 'blur(2px)',
            }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
