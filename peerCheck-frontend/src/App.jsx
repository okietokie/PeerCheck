import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Components/Pages/Login/Home.jsx";
import AuthPage from "./Components/Pages/Login/AuthPage.jsx";
import UserApp from "./Components/user-dashboard/UserApp.jsx";
import ForgotPassword from "./Components/Pages/Login/ForgotPassword.jsx";
import ResetPassword from "./Components/Pages/Login/ResetPassword.jsx";
import AdminPage from "./Components/Pages/AdminComponents/AdminPage.jsx";
import SecNAuth from "./Components/Pages/AdminComponents/SecNAuth/SecNAuth.jsx";

import { useEffect, useState } from "react";
import ProtectedRoute from "./Components/ProtectedRoute.jsx";
import { ThemeProvider } from "@mui/material/styles";
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
import themes from './assets/theme.js';

// Extract theme names dynamically
const themeNames = Object.keys(themes);

// Function to format theme names prettily
const formatThemeName = (name) => {
  return name
    .replace(/-/g, " ")
    .replace(/\b\w/g, l => l.toUpperCase())
    .replace(/Hc/g, "High Contrast")
    .replace(/Mc/g, "Medium Contrast");
};

// Get preview colors from each theme
const getThemePreview = (themeName) => {
  const theme = themes[themeName];
  return {
    primary: theme.palette.primary.main,
    secondary: theme.palette.secondary.main,
    background: theme.palette.background.default,
    text: theme.palette.text.primary
  };
};

export default function App() {
  const [themeName, setThemeName] = useState(themeNames[0]);
  const [user, setUser] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);

  useEffect(() => {
    const theme = themes[themeName];
    document.body.style.backgroundColor = theme.palette.background.default;
    document.body.style.color = theme.palette.text.primary;
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
  }, [themeName]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUser(storedUser);
  }, []);

  const handleRandomTheme = () => {
    const availableThemes = themeNames.filter(name => name !== themeName);
    const randomIndex = Math.floor(Math.random() * availableThemes.length);
    setThemeName(availableThemes[randomIndex]);
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const toggleThemePicker = () => {
    setShowThemePicker(!showThemePicker);
    if (showThemePicker) {
      setExpanded(false);
    }
  };

  // Group themes by type for better organization
  const themeGroups = {
    "Dark Themes": themeNames.filter(name => name.includes('dark') || name.includes('goth')),
    "Light Themes": themeNames.filter(name => name.includes('light') || name.includes('pastel')),
    "Other Themes": themeNames.filter(name => !name.includes('dark') && !name.includes('light') && !name.includes('goth') && !name.includes('pastel'))
  };

  return (
    <ThemeProvider theme={themes[themeName]}>
      {/* Main App Content */}
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/*" element={<AuthPage />} />
            <Route path="/admin-page" element={<AdminPage />} />
            <Route path="/sec-n-auth" element={<SecNAuth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route
              path="/user-app/*"
              element={
                <ProtectedRoute>
                  <UserApp />
                </ProtectedRoute>
              }
            />
            
          </Routes>
        </Router>

        {/* Theme Toggle Button - Fixed at bottom right */}
        <Fade in={!showThemePicker} timeout={300}>
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
                onClick={toggleThemePicker}
                sx={{
                  backgroundColor: themes[themeName].palette.primary.main,
                  color: themes[themeName].palette.primary.contrastText,
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  boxShadow: `0 8px 25px ${alpha(themes[themeName].palette.primary.main, 0.4)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: themes[themeName].palette.primary.dark,
                    transform: 'scale(1.1) rotate(90deg)',
                    boxShadow: `0 12px 35px ${alpha(themes[themeName].palette.primary.main, 0.6)}`,
                  },
                }}
              >
                <Palette sx={{ fontSize: 28 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Fade>

        {/* Theme Picker Card - Shows when button is clicked */}
        <Fade in={showThemePicker} timeout={500}>
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
                  ${alpha(themes[themeName].palette.background.paper, 0.95)} 0%,
                  ${alpha(themes[themeName].palette.background.default, 0.98)} 100%)`,
                backdropFilter: 'blur(20px)',
                border: `1px solid ${alpha(themes[themeName].palette.divider, 0.2)}`,
                borderRadius: 3,
                overflow: 'auto',
                maxHeight: 'inherit',
              }}
            >
              <CardContent sx={{ p: expanded ? 3 : 2, pb: 8 }}> {/* Extra padding at bottom for close button */}
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: expanded ? 3 : 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Palette sx={{ color: themes[themeName].palette.primary.main }} />
                    <Typography variant="h6" fontWeight="600">
                      Choose Your Theme
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip 
                      label={formatThemeName(themeName)}
                      size="small"
                      sx={{ 
                        backgroundColor: themes[themeName].palette.primary.main,
                        color: themes[themeName].palette.primary.contrastText,
                        fontWeight: '600',
                        fontSize: '0.75rem'
                      }}
                    />
                    <Tooltip title="Random Theme">
                      <IconButton 
                        onClick={handleRandomTheme}
                        size="small"
                        sx={{
                          backgroundColor: alpha(themes[themeName].palette.action.hover, 0.5),
                          '&:hover': {
                            backgroundColor: themes[themeName].palette.action.selected,
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
                          backgroundColor: alpha(themes[themeName].palette.action.hover, 0.5),
                          '&:hover': {
                            backgroundColor: themes[themeName].palette.action.selected
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
                                color: themes[themeName].palette.text.secondary,
                                textTransform: 'uppercase',
                                fontSize: '0.8rem',
                                letterSpacing: '0.5px'
                              }}
                            >
                              {groupName}
                            </Typography>
                            <Grid container spacing={2}>
                              {groupThemes.map((name) => {
                                const preview = getThemePreview(name);
                                const isSelected = name === themeName;
                                
                                return (
                                  <Grid item xs={12} sm={6} md={4} lg={3} key={name}>
                                    <Card
                                      elevation={isSelected ? 8 : 2}
                                      onClick={() => setThemeName(name)}
                                      sx={{
                                        cursor: 'pointer',
                                        border: isSelected ? `2px solid ${themes[themeName].palette.primary.main}` : `1px solid ${alpha(themes[themeName].palette.divider, 0.2)}`,
                                        transition: 'all 0.2s ease',
                                        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                                        '&:hover': {
                                          transform: 'scale(1.05)',
                                          boxShadow: `0 8px 25px ${alpha(themes[themeName].palette.primary.main, 0.2)}`,
                                        },
                                        background: themes[name].palette.background.paper
                                      }}
                                    >
                                      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                        {/* Theme Preview */}
                                        <Box sx={{ display: 'flex', gap: 0.5, mb: 2, height: 20 }}>
                                          <Box sx={{ flex: 1, backgroundColor: preview.primary, borderRadius: 1 }} />
                                          <Box sx={{ flex: 1, backgroundColor: preview.secondary, borderRadius: 1 }} />
                                          <Box sx={{ flex: 1, backgroundColor: preview.background, borderRadius: 1, border: `1px solid ${alpha(themes[themeName].palette.divider, 0.3)}` }} />
                                        </Box>
                                        
                                        {/* Theme Name */}
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                          <Typography 
                                            variant="body2" 
                                            fontWeight="600"
                                            sx={{ 
                                              color: themes[name].palette.text.primary,
                                              fontSize: '0.8rem'
                                            }}
                                          >
                                            {formatThemeName(name)}
                                          </Typography>
                                          {isSelected && (
                                            <CheckCircle 
                                              sx={{ 
                                                fontSize: '1rem', 
                                                color: themes[themeName].palette.primary.main 
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
                      const preview = getThemePreview(name);
                      const isSelected = name === themeName;
                      
                      return (
                        <Tooltip key={name} title={formatThemeName(name)} placement="top">
                          <Box
                            onClick={() => setThemeName(name)}
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: 2,
                              cursor: 'pointer',
                              border: isSelected ? `3px solid ${themes[themeName].palette.primary.main}` : `2px solid ${alpha(themes[themeName].palette.divider, 0.3)}`,
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
                          backgroundColor: alpha(themes[themeName].palette.action.hover, 0.5),
                          color: themes[themeName].palette.text.primary,
                          '&:hover': {
                            backgroundColor: themes[themeName].palette.action.selected
                          }
                        }}
                      >
                        +{themeNames.length - 6}
                      </Button>
                    )}
                  </Box>
                )}
              </CardContent>

              {/* Close Button - Bottom Right */}
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
                    onClick={toggleThemePicker}
                    sx={{
                      backgroundColor: themes[themeName].palette.primary.main,
                      color: themes[themeName].palette.primary.contrastText,
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      boxShadow: `0 4px 15px ${alpha(themes[themeName].palette.primary.main, 0.4)}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: themes[themeName].palette.primary.dark,
                        transform: 'scale(1.1)',
                        boxShadow: `0 6px 20px ${alpha(themes[themeName].palette.primary.main, 0.6)}`,
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
      </Box>
    </ThemeProvider>
  );
}