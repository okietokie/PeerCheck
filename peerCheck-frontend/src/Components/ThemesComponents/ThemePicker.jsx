// ThemePicker.jsx
import { useState } from "react";
import { 
  Box, 
  Typography, 
  Card, 
  CardContent,
  Fade,
  IconButton,
  Tooltip,
  Chip,
  alpha,
  Slide,
  Divider
} from "@mui/material";
import { Palette, Shuffle, CheckCircle, ExpandMore, ExpandLess } from "@mui/icons-material";

// Function to format theme names prettily
const formatThemeName = (name) => {
  return name
    .replace(/-/g, " ")
    .replace(/\b\w/g, l => l.toUpperCase())
    .replace(/Hc/g, "High Contrast")
    .replace(/Mc/g, "Medium Contrast");
};

const ThemePicker = ({ 
  themes, 
  themeNames, 
  currentThemeName, 
  onThemeChange, 
  onClose 
}) => {
  const [expanded, setExpanded] = useState(false);
  const currentTheme = themes[currentThemeName];

  const handleRandomTheme = () => {
    const availableThemes = themeNames.filter(name => name !== currentThemeName);
    const randomIndex = Math.floor(Math.random() * availableThemes.length);
    onThemeChange(availableThemes[randomIndex]);
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <Fade in timeout={300}>
      <Box
        sx={{
          position: 'fixed',
          bottom: 90,
          right: 20,
          width: 380,
          maxHeight: 'calc(100vh - 160px)',
          zIndex: 1001,
          overflow: 'hidden',
        }}
      >
        <Slide direction="up" in timeout={300}>
          <Card 
            elevation={24}
            sx={{
              background: `linear-gradient(135deg, 
                ${alpha(currentTheme.palette.background.paper, 0.98)} 0%,
                ${alpha(currentTheme.palette.background.default, 0.95)} 100%)`,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(currentTheme.palette.divider, 0.15)}`,
              borderRadius: 3,
              overflow: 'hidden',
              maxHeight: 'inherit',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Header */}
            <Box sx={{ 
              p: 2.5, 
              borderBottom: `1px solid ${alpha(currentTheme.palette.divider, 0.1)}`,
              backgroundColor: alpha(currentTheme.palette.background.default, 0.7),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: alpha(currentTheme.palette.primary.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Palette sx={{ 
                    fontSize: 18, 
                    color: currentTheme.palette.primary.main 
                  }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight="600">
                    Themes
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Click to switch
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip 
                  label={formatThemeName(currentThemeName)}
                  size="small"
                  sx={{ 
                    backgroundColor: currentTheme.palette.primary.main,
                    color: currentTheme.palette.primary.contrastText,
                    fontWeight: '600',
                    fontSize: '0.7rem',
                    height: 24
                  }}
                />
                <Tooltip title="Random Theme">
                  <IconButton 
                    onClick={handleRandomTheme}
                    size="small"
                    sx={{
                      backgroundColor: alpha(currentTheme.palette.action.hover, 0.4),
                      '&:hover': {
                        backgroundColor: currentTheme.palette.action.selected,
                        transform: 'rotate(180deg)',
                      },
                      transition: 'transform 0.3s ease'
                    }}
                  >
                    <Shuffle fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Theme List */}
            <CardContent sx={{ 
              p: 0, 
              flex: 1,
              overflowY: 'auto',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: alpha(currentTheme.palette.divider, 0.1),
              },
              '&::-webkit-scrollbar-thumb': {
                background: alpha(currentTheme.palette.primary.main, 0.3),
                borderRadius: 3,
              }
            }}>
              {themeNames.map((name) => {
                const theme = themes[name];
                const isSelected = name === currentThemeName;
                
                return (
                  <Box
                    key={name}
                    onClick={() => onThemeChange(name)}
                    sx={{
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      backgroundColor: isSelected 
                        ? alpha(currentTheme.palette.primary.main, 0.08) 
                        : 'transparent',
                      borderLeft: isSelected 
                        ? `4px solid ${currentTheme.palette.primary.main}`
                        : '4px solid transparent',
                      '&:hover': {
                        backgroundColor: alpha(currentTheme.palette.action.hover, 0.05),
                      },
                      position: 'relative'
                    }}
                  >
                    {/* Theme Color Preview */}
                    <Box sx={{ 
                      width: 40, 
                      height: 40,
                      borderRadius: 2,
                      background: `linear-gradient(135deg, 
                        ${theme.palette.primary.main} 0%, 
                        ${theme.palette.secondary.main} 100%)`,
                      border: `2px solid ${alpha(theme.palette.divider, 0.2)}`,
                      flexShrink: 0
                    }} />
                    
                    {/* Theme Info */}
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="body1" 
                        fontWeight="600"
                        sx={{ 
                          fontSize: '0.9rem',
                          color: isSelected 
                            ? currentTheme.palette.primary.main 
                            : currentTheme.palette.text.primary
                        }}
                      >
                        {formatThemeName(name)}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ 
                          fontSize: '0.75rem',
                          display: 'block',
                          mt: 0.5
                        }}
                      >
                        {name.includes('dark') ? 'Dark Mode' : 
                         name.includes('light') ? 'Light Mode' : 'Custom Theme'}
                      </Typography>
                    </Box>
                    
                    {/* Selection Indicator */}
                    {isSelected && (
                      <Box sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        backgroundColor: currentTheme.palette.primary.main,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <CheckCircle sx={{ 
                          fontSize: 14, 
                          color: currentTheme.palette.primary.contrastText 
                        }} />
                      </Box>
                    )}
                  </Box>
                );
              })}
            </CardContent>

            {/* Toggle View Button */}
            <Box sx={{ 
              p: 1.5, 
              borderTop: `1px solid ${alpha(currentTheme.palette.divider, 0.1)}`,
              backgroundColor: alpha(currentTheme.palette.background.default, 0.7),
              textAlign: 'center'
            }}>
              <Tooltip title={expanded ? "Show previews only" : "Show color previews"}>
                <IconButton
                  onClick={toggleExpanded}
                  size="small"
                  sx={{
                    width: '100%',
                    backgroundColor: alpha(currentTheme.palette.action.hover, 0.3),
                    borderRadius: 2,
                    '&:hover': {
                      backgroundColor: currentTheme.palette.action.selected,
                    }
                  }}
                >
                  {expanded ? (
                    <ExpandLess fontSize="small" />
                  ) : (
                    <ExpandMore fontSize="small" />
                  )}
                  <Typography variant="caption" sx={{ ml: 1, fontWeight: 500 }}>
                    {expanded ? "Compact View" : "Expand Preview"}
                  </Typography>
                </IconButton>
              </Tooltip>
            </Box>
          </Card>
        </Slide>
      </Box>
    </Fade>
  );
};

export default ThemePicker;