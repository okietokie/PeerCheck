// ThemePicker.jsx
import { useState } from "react";
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid,
  Fade,
  IconButton,
  Tooltip,
  Chip,
  Button,
  alpha
} from "@mui/material";
import { Palette, Shuffle, CheckCircle, ExpandMore, ExpandLess, Close } from "@mui/icons-material";

// Function to format theme names prettily
const formatThemeName = (name) => {
  return name
    .replace(/-/g, " ")
    .replace(/\b\w/g, l => l.toUpperCase())
    .replace(/Hc/g, "High Contrast")
    .replace(/Mc/g, "Medium Contrast");
};

// Get preview colors from each theme
const getThemePreview = (theme, themeName) => {
  return {
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    background: theme.palette.background.default,
    text: theme.palette.text.primary
  };
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

  // Group themes by type for better organization
  const themeGroups = {
    "Dark Themes": themeNames.filter(name => name.includes('dark') || name.includes('goth')),
    "Light Themes": themeNames.filter(name => name.includes('light') || name.includes('pastel')),
    "Other Themes": themeNames.filter(name => !name.includes('dark') && !name.includes('light') && !name.includes('goth') && !name.includes('pastel'))
  };

  return (
    <Fade in timeout={500}>
      <Box
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          width: expanded ? 'calc(100vw - 80px)' : 400,
          maxWidth: expanded ? 'none' : 400,
          maxHeight: 'calc(100vh - 100px)',
          zIndex: 1001,
          transition: 'all 0.3s ease',
          overflow: 'hidden',
        }}
      >
        <Card 
          elevation={16}
          sx={{
            background: `linear-gradient(135deg, 
              ${alpha(currentTheme.palette.background.paper, 0.95)} 0%,
              ${alpha(currentTheme.palette.background.default, 0.98)} 100%)`,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${alpha(currentTheme.palette.divider, 0.2)}`,
            borderRadius: 3,
            overflow: 'auto',
            maxHeight: 'inherit',
          }}
        >
          <CardContent sx={{ p: expanded ? 3 : 2, pb: 8 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: expanded ? 3 : 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Palette sx={{ color: currentTheme.palette.primary.main }} />
                <Typography variant="h6" fontWeight="600">
                  Choose Your Theme
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip 
                  label={formatThemeName(currentThemeName)}
                  size="small"
                  sx={{ 
                    backgroundColor: currentTheme.palette.primary.main,
                    color: currentTheme.palette.primary.contrastText,
                    fontWeight: '600',
                    fontSize: '0.75rem'
                  }}
                />
                <Tooltip title="Random Theme">
                  <IconButton 
                    onClick={handleRandomTheme}
                    size="small"
                    sx={{
                      backgroundColor: alpha(currentTheme.palette.action.hover, 0.5),
                      '&:hover': {
                        backgroundColor: currentTheme.palette.action.selected,
                        transform: 'rotate(180deg)',
                      }
                    }}
                  >
                    <Shuffle />
                  </IconButton>
                </Tooltip>
                <Tooltip title={expanded ? "Collapse" : "Expand"}>
                  <IconButton 
                    onClick={toggleExpanded}
                    size="small"
                    sx={{
                      backgroundColor: alpha(currentTheme.palette.action.hover, 0.5),
                      '&:hover': {
                        backgroundColor: currentTheme.palette.action.selected
                      }
                    }}
                  >
                    {expanded ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Theme Grid */}
            {expanded && (
              <Fade in={expanded} timeout={300}>
                <Box>
                  {Object.entries(themeGroups).map(([groupName, groupThemes]) => (
                    groupThemes.length > 0 && (
                      <Box key={groupName} sx={{ mb: 3 }}>
                        <Typography 
                          variant="subtitle1" 
                          fontWeight="600" 
                          sx={{ 
                            mb: 2, 
                            color: currentTheme.palette.text.secondary,
                            textTransform: 'uppercase',
                            fontSize: '0.8rem',
                            letterSpacing: '0.5px'
                          }}
                        >
                          {groupName}
                        </Typography>
                        <Grid container spacing={2}>
                          {groupThemes.map((name) => {
                            const theme = themes[name];
                            const preview = getThemePreview(theme, name);
                            const isSelected = name === currentThemeName;
                            
                            return (
                              <Grid item xs={12} sm={6} md={4} lg={3} key={name}>
                                <Card
                                  elevation={isSelected ? 8 : 2}
                                  onClick={() => onThemeChange(name)}
                                  sx={{
                                    cursor: 'pointer',
                                    border: isSelected ? `2px solid ${currentTheme.palette.primary.main}` : `1px solid ${alpha(currentTheme.palette.divider, 0.2)}`,
                                    transition: 'all 0.2s ease',
                                    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                                    '&:hover': {
                                      transform: 'scale(1.05)',
                                      boxShadow: `0 8px 25px ${alpha(currentTheme.palette.primary.main, 0.2)}`,
                                    },
                                    background: theme.palette.background.paper
                                  }}
                                >
                                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                    {/* Theme Preview */}
                                    <Box sx={{ display: 'flex', gap: 0.5, mb: 2, height: 20 }}>
                                      <Box sx={{ flex: 1, backgroundColor: preview.primary, borderRadius: 1 }} />
                                      <Box sx={{ flex: 1, backgroundColor: preview.secondary, borderRadius: 1 }} />
                                      <Box sx={{ flex: 1, backgroundColor: preview.background, borderRadius: 1, border: `1px solid ${alpha(currentTheme.palette.divider, 0.3)}` }} />
                                    </Box>
                                    
                                    {/* Theme Name */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                      <Typography 
                                        variant="body2" 
                                        fontWeight="600"
                                        sx={{ 
                                          color: theme.palette.text.primary,
                                          fontSize: '0.8rem'
                                        }}
                                      >
                                        {formatThemeName(name)}
                                      </Typography>
                                      {isSelected && (
                                        <CheckCircle 
                                          sx={{ 
                                            fontSize: '1rem', 
                                            color: currentTheme.palette.primary.main 
                                          }} 
                                        />
                                      )}
                                    </Box>
                                  </CardContent>
                                </Card>
                              </Grid>
                            );
                          })}
                        </Grid>
                      </Box>
                    )
                  ))}
                </Box>
              </Fade>
            )}

            {/* Compact View */}
            {!expanded && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                {themeNames.slice(0, 6).map((name) => {
                  const theme = themes[name];
                  const preview = getThemePreview(theme, name);
                  const isSelected = name === currentThemeName;
                  
                  return (
                    <Tooltip key={name} title={formatThemeName(name)} placement="top">
                      <Box
                        onClick={() => onThemeChange(name)}
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: 2,
                          cursor: 'pointer',
                          border: isSelected ? `3px solid ${currentTheme.palette.primary.main}` : `2px solid ${alpha(currentTheme.palette.divider, 0.3)}`,
                          background: `linear-gradient(135deg, ${preview.primary} 0%, ${preview.secondary} 50%, ${preview.background} 100%)`,
                          transition: 'all 0.2s ease',
                          transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                          '&:hover': {
                            transform: 'scale(1.15)'
                          },
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {isSelected && (
                          <CheckCircle 
                            sx={{ 
                              fontSize: '1rem', 
                              color: preview.text,
                              filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))'
                            }} 
                          />
                        )}
                      </Box>
                    </Tooltip>
                  );
                })}
                {themeNames.length > 6 && (
                  <Button
                    onClick={toggleExpanded}
                    size="small"
                    sx={{
                      minWidth: 'auto',
                      px: 2,
                      backgroundColor: alpha(currentTheme.palette.action.hover, 0.5),
                      color: currentTheme.palette.text.primary,
                      '&:hover': {
                        backgroundColor: currentTheme.palette.action.selected
                      }
                    }}
                  >
                    +{themeNames.length - 6}
                  </Button>
                )}
              </Box>
            )}
          </CardContent>

          {/* Close Button */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              right: 16,
              zIndex: 1002,
            }}
          >
            <Tooltip title="Close Theme Picker" placement="top">
              <IconButton
                onClick={onClose}
                sx={{
                  backgroundColor: currentTheme.palette.primary.main,
                  color: currentTheme.palette.primary.contrastText,
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  boxShadow: `0 4px 15px ${alpha(currentTheme.palette.primary.main, 0.4)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: currentTheme.palette.primary.dark,
                    transform: 'scale(1.1)',
                    boxShadow: `0 6px 20px ${alpha(currentTheme.palette.primary.main, 0.6)}`,
                  },
                }}
              >
                <Close />
              </IconButton>
            </Tooltip>
          </Box>
        </Card>
      </Box>
    </Fade>
  );
};

export default ThemePicker;