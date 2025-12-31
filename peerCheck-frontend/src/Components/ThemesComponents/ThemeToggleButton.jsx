// ThemeToggleButton.jsx
import { Box, IconButton, Tooltip, Fade, alpha } from "@mui/material";
import { Palette } from "@mui/icons-material";

const ThemeToggleButton = ({ theme, onClick }) => {
  const currentTheme = theme;

  return (
    <Fade in timeout={300}>
      <Box
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000,
        }}
      >
        <Tooltip title="Change Theme" placement="left">
          <IconButton
            onClick={onClick}
            sx={{
              backgroundColor: currentTheme.palette.primary.main,
              color: currentTheme.palette.primary.contrastText,
              width: 60,
              height: 60,
              borderRadius: '50%',
              boxShadow: `0 8px 25px ${alpha(currentTheme.palette.primary.main, 0.4)}`,
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: currentTheme.palette.primary.dark,
                transform: 'scale(1.1) rotate(90deg)',
                boxShadow: `0 12px 35px ${alpha(currentTheme.palette.primary.main, 0.6)}`,
              },
            }}
          >
            <Palette sx={{ fontSize: 28 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Fade>
  );
};

export default ThemeToggleButton;