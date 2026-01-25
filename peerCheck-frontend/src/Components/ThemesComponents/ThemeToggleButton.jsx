// Components/ThemesComponents/ThemeToggleButton.jsx
import { Box, IconButton, Tooltip, Fade, alpha } from "@mui/material";
import { Palette, Close } from "@mui/icons-material";

const ThemeToggleButton = ({ theme, onClick, isPickerOpen = false }) => {
  return (
    <Fade in timeout={300}>
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          '&:hover': {
            '& .theme-toggle-tooltip': {
              opacity: 1,
              transform: 'translateX(0)',
            }
          }
        }}
      >
        {/* Tooltip with animation */}
        <Box
          className="theme-toggle-tooltip"
          sx={{
            position: 'absolute',
            right: 'calc(100% + 10px)',
            top: '50%',
            transform: 'translateY(-50%) translateX(-10px)',
            opacity: 0,
            transition: 'all 0.3s ease',
            pointerEvents: 'none',
          }}
        >
          <Box sx={{
            backgroundColor: theme.palette.background.paper,
            color: theme.palette.text.primary,
            padding: '4px 12px',
            borderRadius: 2,
            fontSize: '0.75rem',
            fontWeight: 500,
            boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.1)}`,
            whiteSpace: 'nowrap',
            border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
          }}>
            {isPickerOpen ? 'Close Theme Picker' : 'Change Theme'}
          </Box>
        </Box>

        <IconButton
          onClick={onClick}
          sx={{
            backgroundColor: isPickerOpen 
              ? theme.palette.error.main 
              : theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            width: 56,
            height: 56,
            borderRadius: '50%',
            boxShadow: isPickerOpen
              ? `0 4px 20px ${alpha(theme.palette.error.main, 0.3)}`
              : `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              backgroundColor: isPickerOpen 
                ? theme.palette.error.dark 
                : theme.palette.primary.dark,
              transform: 'scale(1.1)',
              boxShadow: isPickerOpen
                ? `0 8px 32px ${alpha(theme.palette.error.main, 0.4)}`
                : `0 8px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
            },
          }}
        >
          {isPickerOpen ? (
            <Close sx={{ fontSize: 24 }} />
          ) : (
            <Palette sx={{ fontSize: 24 }} />
          )}
        </IconButton>
      </Box>
    </Fade>
  );
};

export default ThemeToggleButton;