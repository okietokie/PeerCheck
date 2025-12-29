import React, { useEffect, useState } from 'react';
import {
  Snackbar,
  Alert,
  IconButton,
  Box,
  Typography,
  useTheme,
  alpha
} from '@mui/material';
import {
  WarningAmber,
  ErrorOutline,
  Close
} from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function ErrorSnack({ newError, onClose }) {
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    if (newError) {
      setError(newError);
      setOpen(true);
      
      // Auto close after 6 seconds
      const timer = setTimeout(() => {
        setOpen(false);
        if (onClose) onClose();
      }, 6000);
      
      return () => clearTimeout(timer);
    }
  }, [newError, onClose]);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
    if (onClose) onClose();
  };

  if (!error) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Snackbar
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{
          top: { xs: 16, sm: 24 },
          '& .MuiSnackbarContent-root': {
            borderRadius: 3,
            boxShadow: `0 8px 32px ${alpha(theme.palette.error.main, 0.25)}`,
          }
        }}
      >
        <Alert
          onClose={handleClose}
          severity="error"
          variant="filled"
          icon={
            <Box sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1,
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%, 100%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.1)' },
              }
            }}>
              <WarningAmber sx={{ color: 'white', fontSize: 18 }} />
            </Box>
          }
          sx={{
            width: '100%',
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
            background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.95)} 0%, ${alpha(theme.palette.error.dark, 0.95)} 100%)`,
            backdropFilter: 'blur(10px)',
            color: 'white',
            fontWeight: 600,
            fontSize: '0.95rem',
            fontFamily: '"Quicksand", sans-serif',
            alignItems: 'center',
            py: 2,
            px: 3,
            '& .MuiAlert-message': {
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            },
            '& .MuiAlert-action': {
              padding: 0,
              marginRight: 0,
              alignItems: 'center',
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
            <Box sx={{
              flexShrink: 0,
              width: 40,
              height: 40,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${alpha('#fff', 0.15)} 0%, transparent 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${alpha('#fff', 0.2)}`,
            }}>
              <ErrorOutline sx={{ fontSize: 20 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" fontWeight="700" sx={{ mb: 0.5 }}>
                Oops! Something went wrong
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {error}
              </Typography>
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={handleClose}
            sx={{
              color: 'white',
              backgroundColor: alpha('#fff', 0.15),
              ml: 2,
              '&:hover': {
                backgroundColor: alpha('#fff', 0.25),
                transform: 'rotate(90deg)',
              },
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <Close fontSize="small" />
          </IconButton>
        </Alert>
      </Snackbar>
    </motion.div>
  );
}