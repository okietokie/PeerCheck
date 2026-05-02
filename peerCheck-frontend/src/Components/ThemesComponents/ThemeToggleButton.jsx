// Components/ThemesComponents/ThemeToggleButton.jsx
import { Box, IconButton, Tooltip, Fade, alpha, useMediaQuery, useTheme } from "@mui/material";
import { Palette, Close } from "@mui/icons-material";

const ThemeToggleButton = ({ theme, onClick, isPickerOpen = false }) => {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  return (
    <Fade in timeout={300}>
      <Box
        sx={{
          position: 'fixed',
          bottom: { xs: 16, sm: 24 },
          right: { xs: 12, sm: 24 },
          zIndex: 1000,
          '&:hover': {
            '& .theme-toggle-tooltip': {
              opacity: isMobile ? 0 : 1,
              transform: isMobile ? 'translateY(-50%) translateX(-10px)' : 'translateX(0)',
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
            opacity: isMobile ? 0 : 0,
            display: { xs: 'none', sm: 'block' },
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
            width: { xs: 48, sm: 56 },
            height: { xs: 48, sm: 56 },
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
            <Close sx={{ fontSize: { xs: 20, sm: 24 } }} />
          ) : (
            <Palette sx={{ fontSize: { xs: 20, sm: 24 } }} />
          )}
        </IconButton>
      </Box>
    </Fade>
  );
};

export default ThemeToggleButton;
