import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Box, 
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Avatar,
  Typography,
  Button,
  Paper,
  Chip,
  Dialog,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Slide,
  Fade,
  Zoom
} from '@mui/material';
import TourIcon from '@mui/icons-material/HelpOutline';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssessmentIcon from '@mui/icons-material/Assessment';
import FolderIcon from '@mui/icons-material/Folder';


import { AccountCircle, Add, AddCircle, AddTask, Analytics, Assessment, Assignment, AssignmentTurnedIn, CalendarToday, Celebration, CheckCircle, Checklist, Comment, ConnectWithoutContact, CreateNewFolder, Dashboard, Description, Diversity3, Explore, FlashOn, Folder, FolderOpen, Forum, GroupAdd, Groups, Handshake, HelpOutline, Info, Insights, Lightbulb, Navigation, NotificationsActive, People, Person, PersonAdd, PlayCircle, PriorityHigh, RocketLaunch, Schedule, School, Security, Settings, Speed, Star, Timeline, TrendingUp, Update, ViewList, Visibility, VisibilityOutlined, Warning, Workspaces } from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import { getNavigationSteps } from './TourGuideComponents/navigationSteps';
import { getDashboardSteps } from './TourGuideComponents/dashboardSteps';
import { getProfileSteps } from './TourGuideComponents/profileSteps';
import { getTaskTabSteps } from './TourGuideComponents/taskTabSteps';
import { getTaskModalSteps } from './TourGuideComponents/getTaskModalSteps';

const TourGuide = ({ page = 'dashboard', showAppBarButton = false }) => {
  const theme = useTheme();
  const location = useLocation();
  const [tourOpen, setTourOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState(null);
  const [highlightStyle, setHighlightStyle] = useState({});
  const [isPositioning, setIsPositioning] = useState(false);
  const dialogRef = useRef(null);
  const observerRef = useRef(null);

  // Throttle scroll and resize events
  const throttle = (func, limit) => {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  };

  // Get tour steps based on page
  const getTourSteps = useCallback(() => {
    switch(page) {
        case 'dashboard':
            return getDashboardSteps(theme);
        case 'navigation':
            return getNavigationSteps(theme);
        case 'profile':
            return getProfileSteps(theme);
        case 'taskModal':
            return getTaskModalSteps(theme);
        case 'task-tab':
            return getTaskTabSteps(theme);
        default:
        return [
          {
            id: 'welcome',
            title: 'Welcome to PeerCheck!',
            description: 'Let me show you around this page.',
            icon: <Dashboard />,
            element: null,
            position: 'center'
          }
        ];
    }
  }, [page, theme]);

  const steps = getTourSteps();
  const currentStep = steps[activeStep];

const waitForScrollEnd = () =>
  new Promise(resolve => {
    let timeout;
    const onScroll = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        window.removeEventListener('scroll', onScroll);
        resolve();
      }, 80);
    };
    window.addEventListener('scroll', onScroll);
    onScroll();
  });

const highlightElement = useCallback(async (element) => {
  if (!element) {
    setHighlightedElement(null);
    setHighlightStyle({});
    return;
  }

  setIsPositioning(true);

  element.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'nearest'
  });

  await waitForScrollEnd();

  const rect = element.getBoundingClientRect();

  setHighlightStyle({
    position: 'fixed',
    top: rect.top - 10,
    left: rect.left - 10,
    width: rect.width + 20,
    height: rect.height + 20,
    borderRadius: '12px',
    border: `3px solid ${alpha(theme.palette.primary.main, 0.8)}`,
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    boxShadow: `
      0 0 0 9999px ${alpha(theme.palette.common.black, 0.3)},
      0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}
    `,
    pointerEvents: 'none',
    zIndex: 9997,
    transition: 'all 0.35s ease'
  });

  setHighlightedElement(element);
  setIsPositioning(false);
}, [theme]);


  // Position dialog
  const getDialogPosition = useCallback(() => {
      if (currentStep.position === 'center') {
            return {
            top: 'center',
            left: 'center',
            transform: 'translate(-50%, -50%)'
            };
        }
    if (!currentStep.element || !highlightedElement || isPositioning) {
      return {
        top: 'center',
        left: 'center',
        transform: 'translate(-50%, -50%)'
      };
    }

    const rect = highlightedElement.getBoundingClientRect();
    const dialogWidth = 380;
    const dialogHeight = dialogRef.current?.offsetHeight || 300;
    const padding = 20;
    const offset = currentStep.offset || { x: 0, y: 0 };

    let position = {};

    switch(currentStep.position) {
      case 'top':
        position = {
          top: rect.top  - dialogHeight - padding + offset.y,
          left: rect.left + rect.width / 2 - dialogWidth / 2 + offset.x
        };
        break;
      case 'bottom':
        position = {
          top: rect.bottom + padding + offset.y,
          left: rect.left + rect.width / 2 - dialogWidth / 2 + offset.x
        };
        break;
      case 'left':
        position = {
          top: rect.top + rect.height / 2 - dialogHeight / 2 + offset.y,
          left: rect.left - dialogWidth - padding + offset.x
        };
        break;
      case 'right':
        position = {
          top: rect.top  + rect.height / 2 - dialogHeight / 2 + offset.y,
          left: rect.right + padding + offset.x
        };
        break;
      default:
        position = {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)'
        };
    }

    // Ensure dialog stays within viewport
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

if (typeof position.top === 'number') {
  position.top = Math.max(padding, Math.min(viewportHeight - dialogHeight - padding, position.top));
}
if (typeof position.left === 'number') {
  position.left = Math.max(padding, Math.min(viewportWidth - dialogWidth - padding, position.left));
}

    return {
      ...position,
      transform: 'none'
    };
  }, [currentStep, highlightedElement, isPositioning]);

  useEffect(() => {
    if (tourOpen) {
      if (currentStep.element) {
        const element = document.querySelector(currentStep.element);
        highlightElement(element);
      } else {
        highlightElement(null);
      }

      // Throttled resize handler
      const handleResize = throttle(() => {
        if (currentStep.element) {
          const element = document.querySelector(currentStep.element);
          highlightElement(element);
        }
      }, 100);

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [activeStep, tourOpen, currentStep.element, highlightElement]);

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleStart = () => {
    setTourOpen(true);
    setActiveStep(0);
  };

  const handleComplete = () => {
    setTourOpen(false);
    setActiveStep(0);
    localStorage.setItem(`peercheck-tour-${page}-completed`, 'true');
  };

  const handleSkip = () => {
    setTourOpen(false);
    setActiveStep(0);
  };
  const handleAppBarTourStart = () => {
    setTourOpen(true);
    setActiveStep(0);
    // If we're not on the navigation page, navigate there first
    
  };

  // Auto-start tour on first visit
  useEffect(() => {
    const hasSeenTour = localStorage.getItem(`peercheck-tour-${page}-completed`);
    
    if (!hasSeenTour && page === 'dashboard') {
      const timer = setTimeout(() => {
        handleStart();
      }, 1500);
      
      return () => clearTimeout(timer);
    }
    if (!hasSeenTour && page === 'navigation') {
        // Auto-start after a short delay
        const timer = setTimeout(() => {
          setTourOpen(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
  }, [page, tourOpen]);

  return (
    <>
    {showAppBarButton && (
        <Fade in={!tourOpen} timeout={500}>
          <Tooltip title="Navigation Tour" arrow>
            <IconButton
              onClick={handleAppBarTourStart}
              sx={{
                width: 40,
                height: 40,
                background: alpha(theme.palette.info.main, 0.1),
                color: theme.palette.info.main,
                '&:hover': {
                  background: alpha(theme.palette.info.main, 0.2),
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.3s ease',
                mr: 1,
              }}
            >
              <HelpOutline />
            </IconButton>
          </Tooltip>
        </Fade>
      )}
      {/* Floating Tour Button */}
      <Fade in={!tourOpen} timeout={500}>
        <Tooltip title="Start Guided Tour" arrow>
          <Box
            sx={{
              position: 'fixed',
              bottom: 24,
              left: 24,
              zIndex: 9998,
            }}
          >
            <IconButton
              onClick={handleStart}
              sx={{
                width: 56,
                height: 56,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                color: 'white',
                boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                animation: 'pulse 2s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { 
                    transform: 'scale(1)',
                    boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.3)}`
                  },
                  '50%': { 
                    transform: 'scale(1.05)',
                    boxShadow: `0 10px 30px ${alpha(theme.palette.primary.main, 0.5)}`
                  }
                },
                '&:hover': {
                  transform: 'scale(1.1) rotate(5deg)',
                  animation: 'none',
                  boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.4)}`,
                }
              }}
            >
              <TourIcon />
            </IconButton>
          </Box>
        </Tooltip>
      </Fade>

      {/* Step Progress Indicator */}
      <Slide direction="down" in={tourOpen} timeout={300}>
        <Box
          sx={{
            position: 'fixed',
            top: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            bgcolor: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(10px)',
            padding: '10px 24px',
            borderRadius: '50px',
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
          }}
        >
          <Avatar sx={{ 
            width: 28, 
            height: 28, 
            bgcolor: theme.palette.primary.main,
            fontSize: '0.875rem',
            fontWeight: 'bold'
          }}>
            {activeStep + 1}
          </Avatar>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            Step {activeStep + 1} of {steps.length}
          </Typography>
          <Button
            size="small"
            onClick={handleSkip}
            sx={{ 
              ml: 1, 
              minWidth: 'auto',
              borderRadius: '50%',
              width: 32,
              height: 32,
              color: theme.palette.text.secondary,
              '&:hover': {
                bgcolor: alpha(theme.palette.error.main, 0.1),
                color: theme.palette.error.main
              }
            }}
          >
            <CloseIcon fontSize="small" />
          </Button>
        </Box>
      </Slide>

      {/* Overlay Highlight */}
      {tourOpen && highlightedElement && (
        <Fade in={!isPositioning} timeout={400}>
          <Box sx={highlightStyle} />
        </Fade>
      )}

      {/* Tour Dialog */}
      <Dialog
        open={tourOpen}
        onClose={handleSkip}
        disableScrollLock
        PaperProps={{
          ref: dialogRef,
          sx: {
            position: 'fixed',
            ...getDialogPosition(),
            m: 0,
            width: 380,
            maxHeight: '80vh',
            margin: 2,

            borderRadius: 4,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            zIndex: 9998,
            overflowY: 'auto',
            transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transform: isPositioning ? 'scale(0.95)' : 'scale(1)',
            opacity: isPositioning ? 0.8 : 1
          }
        }}
        BackdropProps={{
          sx: {
            backgroundColor: 'transparent',
            backdropFilter: 'none'
          }
        }}
      >
        {/* Arrow pointing to element */}
        {currentStep.element && highlightedElement && currentStep.position !== 'center' && (
          <Box
            sx={{
              position: 'absolute',
              width: 0,
              height: 0,
              borderStyle: 'solid',
              ...(currentStep.position === 'bottom' && {
                top: '-10px',
                left: '50%',
                transform: 'translateX(-50%)',
                borderWidth: '0 12px 12px 12px',
                borderColor: `transparent transparent ${theme.palette.background.paper} transparent`
              }),
              ...(currentStep.position === 'top' && {
                bottom: '-10px',
                left: '50%',
                transform: 'translateX(-50%)',
                borderWidth: '12px 12px 0 12px',
                borderColor: `${theme.palette.background.paper} transparent transparent transparent`
              }),
              ...(currentStep.position === 'left' && {
                top: '50%',
                right: '-12px',
                transform: 'translateY(-50%)',
                borderWidth: '12px 0 12px 12px',
                borderColor: `transparent transparent transparent ${theme.palette.background.paper}`
              }),
              ...(currentStep.position === 'right' && {
                top: '50%',
                left: '-12px',
                transform: 'translateY(-50%)',
                borderWidth: '12px 12px 12px 0',
                borderColor: `transparent ${theme.palette.background.paper} transparent transparent`
              }),
              filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.1))',
              transition: 'all 0.3s ease'
            }}
          />
        )}

        <DialogContent sx={{ p: 3, pb: 2 }}>
          <Zoom in={!isPositioning} timeout={200}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
              <Avatar sx={{ 
                bgcolor: alpha(theme.palette.primary.main, 0.1), 
                color: theme.palette.primary.main,
                width: 48, 
                height: 48 
              }}>
                {currentStep.icon}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {currentStep.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {currentStep.description}
                </Typography>
              </Box>
            </Box>
          </Zoom>

          <Fade in={!isPositioning} timeout={300}>
            <Box sx={{ mb: 3 }}>
              {currentStep.content}
            </Box>
          </Fade>

          {/* Progress Dots */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2 }}>
            {steps.map((_, index) => (
              <Box
                key={index}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: index === activeStep 
                    ? theme.palette.primary.main 
                    : alpha(theme.palette.primary.main, 0.2),
                  transition: 'all 0.3s ease',
                  transform: index === activeStep ? 'scale(1.2)' : 'scale(1)'
                }}
              />
            ))}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            onClick={handleSkip}
            sx={{ 
              color: theme.palette.text.secondary,
              '&:hover': {
                color: theme.palette.error.main,
                bgcolor: alpha(theme.palette.error.main, 0.1)
              }
            }}
          >
            Skip
          </Button>
          
          <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0}
              sx={{
                color: theme.palette.text.secondary,
                minWidth: 'auto',
                px: 2,
                '&:hover:not(:disabled)': {
                  bgcolor: alpha(theme.palette.action.hover, 0.1)
                }
              }}
            >
              <ArrowBackIcon />
            </Button>
            
            <Button
              onClick={handleNext}
              variant="contained"
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                color: 'white',
                borderRadius: 2,
                px: 3,
                fontWeight: 600,
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`
                }
              }}
            >
              {activeStep === steps.length - 1 ? 'Get Started' : 'Next'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Add missing icons */}
      {(() => {
        const PeopleIcon = () => <span>👥</span>;
        const CalendarTodayIcon = () => <span>📅</span>;
        return null;
      })()}
    </>
  );
};

export default TourGuide;