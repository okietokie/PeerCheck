import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import image1 from "./collaboration.jpg";
import {
  Button,
  Card,
  Container,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Chip,
  Avatar,
  Paper,
  alpha,
  CircularProgress,
  Alert,
  IconButton,
  Rating,
  AvatarGroup,
  LinearProgress
} from "@mui/material";
import {
  People,
  Message,
  Star,
  ArrowForward,
  PlayArrow,
  CalendarToday,
  TrackChanges,
  BarChart,
  Favorite,
  Refresh,
  ThumbUp,
  AccessTime,
  TrendingUp,
  CheckCircle,
  Psychology,
  Code,
  DesignServices,
  AutoGraph,
  WorkspacePremium,
  School,
  Group,
  Schedule,
  Security,
  Email,
  Phone,
  LocationOn,
  Twitter,
  Facebook,
  Instagram,
  LinkedIn,
  VerifiedUser
} from "@mui/icons-material";
import { useState, useEffect, useCallback } from "react";
import axiosClient from "@/api/axiosClient";
import { motion, AnimatePresence } from "framer-motion";
import ReviewDialog from "./ReviewDialog";
import useInView from "@/hooks/useInView";

export default function Home() {
  const theme = useTheme();
  const { ref, inView } = useInView({ threshold: 0.3 });
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [stats, setStats] = useState({
    activeUsers: 0,
    totalUsers: 0,
    newUsersLast30Days: 0,
    reviewStats: {
      averageRating: 0,
      totalReviews: 0,
      helpfulVotes: 0,
      satisfactionRate: 0
    },
    recentReviews: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [animatedStats, setAnimatedStats] = useState({
    users: 0,
    reviews: 0,
    satisfaction: 0
  });

  // Helper functions
  const getGlassEffect = () => ({
    backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.2 : 0.9),
    backdropFilter: 'blur(20px)',
    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
    boxShadow: `0 8px 32px ${alpha(theme.palette.mode === 'dark' ? '#000' : theme.palette.primary.main, 0.1)}`,
  });

  const getCardGradient = (colorType = 'primary') => {
    const color = theme.palette[colorType]?.main || theme.palette.primary.main;
    return `linear-gradient(135deg, 
      ${alpha(color, theme.palette.mode === 'dark' ? 0.25 : 0.15)} 0%, 
      ${alpha(color, theme.palette.mode === 'dark' ? 0.1 : 0.05)} 100%
    )`;
  };

  const getBorderColor = (colorType = 'primary', intensity = 0.3) => {
    const color = theme.palette[colorType]?.main || theme.palette.primary.main;
    return alpha(color, intensity);
  };

  // Fetch live data from backend
  const fetchLiveData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axiosClient.get("/user/basic-data");
      
      if (response.data.success) {
        const data = response.data;
        setStats({
          activeUsers: data.activeUsers || 0,
          totalUsers: data.totalUsers || 0,
          newUsersLast30Days: data.newUsersLast30Days || 0,
          reviewStats: data.reviewStats || {
            averageRating: 0,
            totalReviews: 0,
            helpfulVotes: 0,
            satisfactionRate: 0
          },
          recentReviews: data.recentReviews || []
        });

        // Animate stats
        animateStats(data);
      } else {
        setError('Failed to load data');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Unable to load live data. Please try again.');
      
      // Fallback to static data for demo
      setStats({
        activeUsers: 0,
        totalUsers: 0,
        newUsersLast30Days: 0,
        reviewStats: {
          averageRating: 0,
          totalReviews: 0,
          helpfulVotes: 0,
          satisfactionRate: 0
        },
        recentReviews: []
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Animate statistics
  const animateStats = (data) => {
    const duration = 2000;
    const steps = 60;
    const incrementUsers = (data.totalUsers || 0) / steps;
    const incrementReviews = (data.reviewStats?.totalReviews || 0) / steps;
    const incrementSatisfaction = (data.reviewStats?.satisfactionRate || 0) / steps;

    let currentUsers = 0;
    let currentReviews = 0;
    let currentSatisfaction = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      currentUsers = Math.min(data.totalUsers || 0, currentUsers + incrementUsers);
      currentReviews = Math.min(data.reviewStats?.totalReviews || 0, currentReviews + incrementReviews);
      currentSatisfaction = Math.min(data.reviewStats?.satisfactionRate || 0, currentSatisfaction + incrementSatisfaction);

      setAnimatedStats({
        users: Math.floor(currentUsers),
        reviews: Math.floor(currentReviews),
        satisfaction: Math.floor(currentSatisfaction)
      });

      if (step >= steps) {
        clearInterval(timer);
      }
    }, duration / steps);
  };

  // Initial data fetch
  useEffect(() => {
    fetchLiveData();
  }, [fetchLiveData]);

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLiveData();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchLiveData]);

  const features = [
    {
      icon: <TrackChanges />,
      title: "Smart Goal Tracking",
      description: "Set learning objectives and track progress with your peers",
      color: theme.palette.primary.main
    },
    {
      icon: <Message />,
      title: "Real-time Feedback",
      description: "Give and receive constructive feedback instantly",
      color: theme.palette.secondary.main
    },
    {
      icon: <BarChart />,
      title: "Progress Analytics",
      description: "Visualize your learning journey with detailed insights",
      color: theme.palette.tertiary?.main || theme.palette.primary.light
    },
    {
      icon: <CalendarToday />,
      title: "Collaborative Scheduling",
      description: "Coordinate study sessions and project deadlines",
      color: theme.palette.secondary.light
    },
    {
      icon: <VerifiedUser />,
      title: "Peer Evaluation System",
      description: "Evaluate teammates fairly using structured criteria and rubrics",
      color: theme.palette.primary.dark
    },
    {
      icon: <School />,
      title: "Mentor-Guided Review",
      description: "Enable mentors to monitor progress and provide expert feedback",
      color: theme.palette.secondary.dark
    }

  ];

  // Handle review submission success
  const handleReviewSubmitted = () => {
    // Refresh data to show new review
    fetchLiveData();
  };

  // Format date helper
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (err) {
      return 'Recent';
    }
  };

  // Render star rating component
  const renderStars = (rating) => {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Rating value={rating} readOnly precision={0.5} size="small" />
        <Typography variant="body2" color="text.secondary">
          ({rating.toFixed(1)})
        </Typography>
      </Box>
    );
  };

  // Stat Card Component
  const StatCard = ({ icon, value, label, colorType = 'primary', progress = null }) => {
    const color = theme.palette[colorType]?.main || theme.palette.primary.main;
    return (
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            background: getCardGradient(colorType),
            border: `1.5px solid ${getBorderColor(colorType, 0.3)}`,
            position: 'relative',
            overflow: 'hidden',
            height: '100%',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.7)})`,
              borderRadius: '3px 3px 0 0',
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: alpha(color, 0.15),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${alpha(color, 0.3)}`,
            }}>
              {React.cloneElement(icon, { 
                sx: { 
                  color: color,
                  fontSize: 24,
                  filter: `drop-shadow(0 2px 4px ${alpha(color, 0.3)})`
                } 
              })}
            </Box>
            <Typography variant="h4" fontWeight="800" sx={{ 
              fontFamily: '"Alkatra", cursive',
              color: color,
              lineHeight: 1,
              textShadow: `0 2px 4px ${alpha(color, 0.2)}`,
            }}>
              {value}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ 
            color: theme.palette.text.secondary,
            fontFamily: '"Adlam Display", serif',
            fontWeight: 500,
          }}>
            {label}
          </Typography>
          {progress !== null && (
            <LinearProgress 
              variant="determinate" 
              value={progress}
              sx={{
                mt: 2,
                height: 6,
                borderRadius: 3,
                backgroundColor: alpha(color, 0.1),
                '& .MuiLinearProgress-bar': {
                  background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.7)})`,
                }
              }}
            />
          )}
        </Paper>
      </motion.div>
    );
  };

  return (
    <>
      <Navbar />

      {/*Hero Section */}
      <Box
        ref={ref}
        sx={{
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.background.default, 0.8)} 0%, 
            ${alpha(theme.palette.background.paper, 0.6)} 50%, 
            ${alpha(theme.palette.background.default, 0.8)} 100%)`,
          minHeight: "100vh",
          padding: "2em",
          display: "flex",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Animated background elements */}
        <Box sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 0,
          opacity: theme.palette.mode === 'dark' ? 0.1 : 0.05,
        }}>
          {[...Array(20)].map((_, i) => (
            <Box
              key={i}
              sx={{
                position: "absolute",
                width: Math.random() * 100 + 50,
                height: 2,
                background: `linear-gradient(90deg, transparent, ${theme.palette.primary.main}, transparent)`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: 'pulse 3s infinite',
                animationDelay: `${Math.random() * 5}s`,
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 0.1 },
                  '50%': { opacity: 0.5 },
                }
              }}
            />
          ))}
        </Box>

        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1, py: 8 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', lg: 'row' },
            alignItems: 'center',
            gap: 6,
            position: 'relative'
          }}>
            {/* Left Content */}
            <Box sx={{ 
              flex: 1,
              textAlign: { xs: 'center', lg: 'left' }
            }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Chip
                  label={`${animatedStats.users}+ Active Students`}
                  icon={<Star sx={{ color: 'inherit' }} />}
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    color: theme.palette.primary.contrastText,
                    mb: 4,
                    fontWeight: 600,
                    px: 2.5,
                    py: 1.5,
                    mt: 4,
                    borderRadius: 2,
                    fontFamily: '"Adlam Display", serif',
                    boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.3)}`,
                  }}
                />

                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '3rem', sm: '4rem', lg: '5rem' },
                    fontWeight: 800,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                    lineHeight: 1.1,
                    mb: 3,
                    fontFamily: '"Adlam Display", serif',
                  }}
                >
                  Learn Together,
                  <Box component="span" sx={{ display: 'block', mt: 0.5 }}>
                    Grow Together
                  </Box>
                </Typography>

                <Typography
                  variant="h6"
                  sx={{
                    color: theme.palette.text.secondary,
                    mb: 4,
                    fontSize: '1.25rem',
                    lineHeight: 1.7,
                    maxWidth: "600px",
                    mx: { xs: 'auto', lg: 0 },
                    fontFamily: '"Inter", sans-serif',
                  }}
                >
                  Join the ultimate peer learning platform where feedback fuels growth, 
                  collaboration sparks innovation, and every student thrives together.
                  <br/> For the students, by the students!
                </Typography>

                {/* Live Stats & Buttons */}
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 3,
                  alignItems: { xs: 'center', lg: 'flex-start' },
                  mb: 4
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 2,
                    mb: { xs: 2, sm: 0 }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ 
                        width: 8, 
                        height: 8, 
                        borderRadius: '50%',
                        backgroundColor: stats.activeUsers > 0 ? '#4CAF50' : '#ff9800',
                        animation: stats.activeUsers > 0 ? 'pulse 2s infinite' : 'none'
                      }} />
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        {stats.activeUsers} students active now
                      </Typography>
                    </Box>
                    
                    <IconButton 
                      size="small" 
                      onClick={fetchLiveData}
                      disabled={loading}
                      sx={{ 
                        color: theme.palette.primary.main,
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.2),
                        }
                      }}
                    >
                      <Refresh fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>

                {/* Action Buttons */}
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2,
                  alignItems: { xs: 'center', lg: 'flex-start' }
                }}>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForward />}
                    sx={{
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      color: theme.palette.primary.contrastText,
                      px: 5,
                      py: 1.5,
                      fontSize: "1.1rem",
                      borderRadius: "50px",
                      textTransform: "none",
                      fontWeight: 600,
                      fontFamily: '"Adlam Display", serif',
                      boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: `0 12px 35px ${alpha(theme.palette.primary.main, 0.4)}`,
                      },
                      transition: "all 0.3s ease",
                      minWidth: { xs: '100%', sm: 'auto' }
                    }}
                  >
                    <Link to="/sign-up" style={{ textDecoration: "none", color: "inherit" }}>
                      Start Free Today
                    </Link>
                  </Button>

                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<PlayArrow />}
                    sx={{
                      borderColor: getBorderColor('primary', 0.3),
                      color: theme.palette.primary.main,
                      px: 4,
                      py: 1.5,
                      borderRadius: "50px",
                      textTransform: "none",
                      fontWeight: 600,
                      fontFamily: '"Adlam Display", serif',
                      borderWidth: 2,
                      "&:hover": {
                        borderColor: theme.palette.primary.main,
                        background: alpha(theme.palette.primary.main, 0.1),
                        transform: "translateY(-2px)",
                      },
                      transition: "all 0.3s ease",
                      minWidth: { xs: '100%', sm: 'auto' }
                    }}
                  >
                    Watch Demo
                  </Button>
                </Box>
              </motion.div>
            </Box>

            {/* Right Content - Image & Stats */}
            <Box sx={{ 
              flex: 1,
              position: 'relative',
              width: '100%'
            }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {/* Main Image Container */}
                <Paper
                  elevation={0}
                  sx={{
                    position: 'relative',
                    borderRadius: 4,
                    overflow: 'hidden',
                    ...getGlassEffect(),
                    border: `1.5px solid ${getBorderColor('primary', 0.3)}`,
                  }}
                >
                  <Box
                    component="img"
                    src={image1}
                    alt="Students collaborating"
                    sx={{
                      width: "100%",
                      height: "auto",
                      display: 'block',
                      transition: "all 0.5s ease",
                      "&:hover": {
                        transform: "scale(1.02)",
                      }
                    }}
                  />

                  {/* Live Stats Overlay */}
                  <Paper
                    elevation={0}
                    sx={{
                      position: 'absolute',
                      bottom: 24,
                      left: 24,
                      right: 24,
                      borderRadius: 3,
                      p: 3,
                      ...getGlassEffect(),
                      border: `1px solid ${getBorderColor('primary', 0.2)}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          background: stats.activeUsers > 0 ? "#4CAF50" : "#ff9800",
                          borderRadius: "50%",
                          animation: stats.activeUsers > 0 ? 'pulse 2s infinite' : 'none'
                        }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                        Live Platform Stats
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        {stats.activeUsers} students active now
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ThumbUp fontSize="small" color="primary" />
                        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                          {stats.reviewStats.totalReviews} reviews
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Paper>

                {/* Floating Review Button */}
                <Box sx={{ 
                  position: 'absolute', 
                  top: -20, 
                  right: 20,
                  display: { xs: 'none', md: 'block' }
                }}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<Star />}
                      onClick={() => setReviewDialogOpen(true)}
                      sx={{
                        background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.light} 100%)`,
                        color: "white",
                        px: 4,
                        py: 1.5,
                        borderRadius: "50px",
                        textTransform: "none",
                        fontWeight: 600,
                        fontFamily: '"Adlam Display", serif',
                        boxShadow: `0 8px 25px ${alpha(theme.palette.secondary.main, 0.4)}`,
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: `0 12px 35px ${alpha(theme.palette.secondary.main, 0.6)}`,
                        },
                        transition: "all 0.3s ease"
                      }}
                    >
                      Add Your Review
                    </Button>
                  </motion.div>
                </Box>
              </motion.div>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Features Grid Section */}
      <Box sx={{ 
        py: { xs: 8, md: 12 },
        background: `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.5)} 0%, ${theme.palette.background.default} 100%)`,
      }}>
        <Container maxWidth="xl">
          <Box sx={{ 
            textAlign: "center", 
            mb: { xs: 6, md: 8 },
            px: { xs: 2, sm: 0 }
          }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.primary.main,
                  mb: 2,
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  fontFamily: '"Adlam Display", serif',
                }}
              >
                Everything You Need to
                <Box component="span" sx={{ 
                  display: 'block', 
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`, 
                  backgroundClip: "text", 
                  WebkitBackgroundClip: "text", 
                  color: "transparent",
                  mt: 1,
                }}>
                  Succeed Together
                </Box>
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: theme.palette.text.secondary,
                  opacity: 0.8,
                  maxWidth: "600px",
                  mx: "auto",
                  fontSize: '1.2rem',
                  fontFamily: '"Inter", sans-serif',
                }}
              >
                Powerful tools designed specifically for student collaboration and peer learning
              </Typography>
            </motion.div>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              flexWrap: "wrap",
              gap: 4,
              justifyContent: "center",
            }}
          >
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                style={{ 
                  flex: { xs: '0 0 100%', md: '0 0 calc(50% - 16px)' },
                  maxWidth: { xs: '100%', md: 'calc(50% - 16px)' },
                  minWidth: { xs: '100%', md: '300px' }
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    background: getCardGradient('primary'),
                    borderRadius: 3,
                    padding: 4,
                    border: `1.5px solid ${getBorderColor('primary', 0.3)}`,
                    transition: "all 0.4s ease",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
                      borderColor: getBorderColor('primary', 0.5),
                    },
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    height: "100%",
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      background: `linear-gradient(135deg, ${feature.color} 0%, ${alpha(feature.color, 0.8)} 100%)`,
                      borderRadius: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 3,
                      fontSize: "24px",
                      color: "white",
                      boxShadow: `0 4px 15px ${alpha(feature.color, 0.3)}`,
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.primary.main,
                      mb: 2,
                      fontSize: { xs: '1.3rem', md: '1.5rem' },
                      fontFamily: '"Adlam Display", serif',
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    sx={{
                      color: theme.palette.text.secondary,
                      lineHeight: 1.6,
                      fontSize: '1rem',
                      fontFamily: '"Inter", sans-serif',
                    }}
                  >
                    {feature.description}
                  </Typography>
                </Paper>
              </motion.div>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Interactive Stats Section */}
      <Box sx={{ 
        py: { xs: 8, md: 12 }, 
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        position: "relative",
        overflow: "hidden"
      }}>
        <Container maxWidth="xl">
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", lg: "row" },
              alignItems: "center",
              gap: { xs: 4, lg: 6 },
            }}
          >
            {/* Left Section */}
            <Box sx={{ 
              flex: 1,
              textAlign: { xs: 'center', lg: 'left' }
            }}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 700,
                    color: "white",
                    mb: 3,
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    fontFamily: '"Adlam Display", serif',
                    textShadow: `0 2px 8px ${alpha('#000', 0.2)}`,
                  }}
                >
                  Trusted by Students Worldwide
                </Typography>
                <Typography
                  sx={{
                    color: 'rgba(255,255,255,0.9)',
                    fontSize: '1.2rem',
                    lineHeight: 1.6,
                    mb: 4,
                    fontFamily: '"Inter", sans-serif',
                  }}
                >
                  Join thousands of students who have transformed their learning experience 
                  through collaborative feedback and peer support.
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  flexWrap: 'wrap', 
                  justifyContent: { xs: 'center', lg: 'flex-start' } 
                }}>
                  <Chip 
                    label="Live Updates" 
                    sx={{ 
                      background: "rgba(255,255,255,0.2)", 
                      color: "white",
                      fontFamily: '"Adlam Display", serif',
                      fontWeight: 500,
                    }} 
                  />
                  <Chip 
                    label="Real Reviews" 
                    sx={{ 
                      background: "rgba(255,255,255,0.2)", 
                      color: "white",
                      fontFamily: '"Adlam Display", serif',
                      fontWeight: 500,
                    }} 
                  />
                  <Chip 
                    label="Peer Verified" 
                    sx={{ 
                      background: "rgba(255,255,255,0.2)", 
                      color: "white",
                      fontFamily: '"Adlam Display", serif',
                      fontWeight: 500,
                    }} 
                  />
                </Box>
              </motion.div>
            </Box>

            {/* Right Section - Live Stats */}
            <Box sx={{ 
              flex: 1, 
              display: "flex", 
              flexDirection: "column", 
              gap: 3,
              width: '100%'
            }}>
              {[
                { 
                  value: `${animatedStats.users}+`, 
                  label: "Active Users", 
                  icon: <People />,
                  description: `${stats.activeUsers} currently online`,
                  color: 'primary'
                },
                { 
                  value: `${animatedStats.reviews}+`, 
                  label: "Verified Reviews", 
                  icon: <Message />,
                  description: `Average ${stats.reviewStats.averageRating.toFixed(1)}/5 rating`,
                  color: 'secondary'
                },
                { 
                  value: `${animatedStats.satisfaction}%`, 
                  label: "Satisfaction Rate", 
                  icon: <Favorite />,
                  description: "Based on recent feedback",
                  color: 'success'
                }
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.2 }}
                  viewport={{ once: true }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      background: "rgba(255, 255, 255, 0.1)",
                      backdropFilter: "blur(10px)",
                      borderRadius: 3,
                      padding: 3,
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        background: "rgba(255, 255, 255, 0.15)",
                        transform: "translateX(10px)",
                        borderColor: "rgba(255, 255, 255, 0.3)",
                      }
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                      <Box sx={{ 
                        fontSize: '1.5rem', 
                        color: 'white', 
                        opacity: 0.9,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 48,
                        height: 48,
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                      }}>
                        {stat.icon}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="h3"
                          sx={{
                            fontWeight: 800,
                            color: "white",
                            lineHeight: 1,
                            fontSize: { xs: '2rem', md: '2.5rem' },
                            fontFamily: '"Alkatra", cursive',
                            textShadow: `0 2px 4px ${alpha('#000', 0.2)}`,
                          }}
                        >
                          {stat.value}
                        </Typography>
                        <Typography sx={{ 
                          color: 'rgba(255,255,255,0.9)', 
                          fontSize: '1rem',
                          fontFamily: '"Adlam Display", serif',
                          fontWeight: 500,
                        }}>
                          {stat.label}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography sx={{ 
                      color: 'rgba(255,255,255,0.7)', 
                      fontSize: '0.875rem',
                      mt: 1,
                      fontFamily: '"Inter", sans-serif',
                    }}>
                      {stat.description}
                    </Typography>
                  </Paper>
                </motion.div>
              ))}
            </Box>
          </Box>

          {/* Refresh Button */}
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchLiveData}
              disabled={loading}
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.3)',
                fontFamily: '"Adlam Display", serif',
                fontWeight: 500,
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
                borderRadius: 2,
                px: 4,
                py: 1.5,
              }}
            >
              {loading ? 'Updating...' : 'Refresh Live Data'}
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Live Reviews Section */}
      <Box sx={{ py: { xs: 8, md: 12 }, background: theme.palette.background.default }}>
        <Container maxWidth="xl">
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', md: 'center' }, 
            gap: 3,
            mb: 6 
          }}>
            <Box>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.primary.main,
                  mb: 1,
                  fontSize: { xs: '2.2rem', md: '3rem' },
                  fontFamily: '"Adlam Display", serif',
                }}
              >
                Recent Student Reviews
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: theme.palette.text.secondary,
                  opacity: 0.8,
                  fontSize: '1.1rem',
                  fontFamily: '"Inter", sans-serif',
                }}
              >
                Real feedback from real students
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<Star />}
              onClick={() => setReviewDialogOpen(true)}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                borderRadius: "50px",
                px: 4,
                py: 1.5,
                width: { xs: '100%', md: 'auto' },
                fontFamily: '"Adlam Display", serif',
                fontWeight: 600,
                boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: `0 12px 35px ${alpha(theme.palette.primary.main, 0.4)}`,
                },
                transition: "all 0.3s ease"
              }}
            >
              Share Your Experience
            </Button>
          </Box>

          {/* Reviews Content */}
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                  <CircularProgress 
                    sx={{ 
                      color: theme.palette.primary.main,
                    }}
                  />
                </Box>
              </motion.div>
            ) : error ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Alert 
                  severity="error" 
                  sx={{ mb: 4 }}
                  action={
                    <Button color="inherit" size="small" onClick={fetchLiveData}>
                      Retry
                    </Button>
                  }
                >
                  {error}
                </Alert>
              </motion.div>
            ) : stats.recentReviews.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Paper sx={{ 
                  p: { xs: 4, md: 8 }, 
                  textAlign: 'center', 
                  borderRadius: 3,
                  ...getGlassEffect(),
                  border: `1.5px solid ${getBorderColor('primary', 0.3)}`,
                }}>
                  <Star sx={{ 
                    fontSize: { xs: 48, md: 64 }, 
                    color: theme.palette.text.disabled, 
                    mb: 3,
                    opacity: 0.5,
                  }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No reviews yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Be the first to share your experience!
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Star />}
                    onClick={() => setReviewDialogOpen(true)}
                    sx={{
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      borderRadius: "50px",
                      px: 4,
                      py: 1.5,
                      fontFamily: '"Adlam Display", serif',
                      fontWeight: 600,
                    }}
                  >
                    Write First Review
                  </Button>
                </Paper>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Box sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: 4,
                  flexWrap: 'wrap',
                  justifyContent: 'center'
                }}>
                  {stats.recentReviews.slice(0, 3).map((review, idx) => (
                    <Box key={idx} sx={{ 
                      flex: { xs: '0 0 100%', md: '0 0 calc(33.333% - 16px)' },
                      minWidth: { xs: '100%', md: '300px' }
                    }}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <Paper
                          elevation={0}
                          sx={{
                            background: getCardGradient('primary'),
                            borderRadius: 3,
                            padding: { xs: 3, md: 4 },
                            height: "100%",
                            border: `1.5px solid ${getBorderColor('primary', 0.3)}`,
                            transition: "all 0.3s ease",
                            "&:hover": {
                              transform: "translateY(-8px)",
                              boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
                              borderColor: getBorderColor('primary', 0.5),
                            },
                            display: 'flex',
                            flexDirection: 'column',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <Avatar sx={{ 
                              bgcolor: theme.palette.primary.main, 
                              mr: 2,
                              width: 48,
                              height: 48,
                              boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                            }}>
                              {review.user?.name?.charAt(0) || 'U'}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="h6" sx={{ 
                                fontWeight: 600, 
                                color: theme.palette.primary.main,
                                fontFamily: '"Adlam Display", serif',
                              }}>
                                {review.user?.name || 'Anonymous'}
                              </Typography>
                              <Typography variant="body2" sx={{ 
                                color: theme.palette.text.secondary,
                                fontFamily: '"Inter", sans-serif',
                              }}>
                                {review.user?.username ? `@${review.user.username}` : 'Student'}
                              </Typography>
                            </Box>
                            {renderStars(review.rating)}
                          </Box>
                          
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              color: theme.palette.text.primary, 
                              mb: 2,
                              fontWeight: 600,
                              fontSize: { xs: '1.1rem', md: '1.25rem' },
                              fontFamily: '"Adlam Display", serif',
                              lineHeight: 1.4,
                            }}
                          >
                            "{review.title}"
                          </Typography>
                          
                          <Typography sx={{ 
                            color: theme.palette.text.secondary, 
                            lineHeight: 1.6, 
                            mb: 2,
                            fontStyle: 'italic',
                            fontSize: '0.95rem',
                            fontFamily: '"Inter", sans-serif',
                            flex: 1,
                          }}>
                            {review.content}
                          </Typography>
                          
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            mt: 3, 
                            flexWrap: 'wrap', 
                            gap: 1 
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <AccessTime fontSize="small" sx={{ color: theme.palette.text.disabled }} />
                              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                {formatDate(review.createdAt)}
                              </Typography>
                            </Box>
                          </Box>
                        </Paper>
                      </motion.div>
                    </Box>
                  ))}
                </Box>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Overall Rating Summary */}
          {stats.reviewStats.totalReviews > 0 && (
            <Box sx={{ mt: 8, textAlign: 'center' }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Paper
                  sx={{
                    p: { xs: 3, md: 4 },
                    borderRadius: 3,
                    background: getCardGradient('primary'),
                    border: `1.5px solid ${getBorderColor('primary', 0.3)}`,
                    maxWidth: 600,
                    mx: 'auto',
                  }}
                >
                  <Typography variant="h5" sx={{ 
                    fontWeight: 600, 
                    color: theme.palette.primary.main, 
                    mb: 2,
                    fontFamily: '"Adlam Display", serif',
                  }}>
                    Overall Rating
                  </Typography>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: 3, 
                    mb: 2 
                  }}>
                    <Typography variant="h1" sx={{ 
                      fontWeight: 700, 
                      color: theme.palette.primary.main,
                      fontSize: { xs: '3rem', md: '4rem' },
                      fontFamily: '"Alkatra", cursive',
                      textShadow: `0 2px 4px ${alpha(theme.palette.primary.main, 0.2)}`,
                    }}>
                      {stats.reviewStats.averageRating.toFixed(1)}
                    </Typography>
                    <Box>
                      {renderStars(stats.reviewStats.averageRating)}
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Based on {stats.reviewStats.totalReviews} verified reviews
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary">
                    {stats.reviewStats.satisfactionRate}% of students are satisfied with PeerCheck
                  </Typography>
                </Paper>
              </motion.div>
            </Box>
          )}
        </Container>
      </Box>

      {/* Final CTA Section */}
      <Box sx={{ 
        py: { xs: 8, md: 12 }, 
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${theme.palette.background.default} 100%)`,
        textAlign: "center",
        position: "relative",
        overflow: "hidden"
      }}>
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                color: theme.palette.primary.main,
                mb: 3,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                fontFamily: '"Adlam Display", serif',
              }}
            >
              Ready to Transform Your Learning?
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: theme.palette.text.secondary,
                mb: 5,
                opacity: 0.8,
                fontSize: '1.2rem',
                lineHeight: 1.6,
                fontFamily: '"Inter", sans-serif',
              }}
            >
              Join {animatedStats.users}+ students already accelerating their learning journey with PeerCheck. 
              Get started in seconds - no credit card required.
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 3, 
              justifyContent: 'center', 
              flexWrap: 'wrap', 
              mb: 4 
            }}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  color: theme.palette.primary.contrastText,
                  px: { xs: 4, md: 6 },
                  py: { xs: 1.5, md: 2 },
                  fontSize: "1.1rem",
                  borderRadius: "50px",
                  textTransform: "none",
                  fontWeight: 600,
                  fontFamily: '"Adlam Display", serif',
                  boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: `0 15px 35px ${alpha(theme.palette.primary.main, 0.4)}`,
                  },
                  transition: "all 0.3s ease",
                  width: { xs: '100%', sm: 'auto' }
                }}
              >
                <Link to="/sign-up" style={{ textDecoration: "none", color: "inherit" }}>
                  Create Free Account
                </Link>
              </Button>

              <Button
                variant="outlined"
                size="large"
                startIcon={<Star />}
                onClick={() => setReviewDialogOpen(true)}
                sx={{
                  borderColor: getBorderColor('primary', 0.3),
                  color: theme.palette.primary.main,
                  px: { xs: 4, md: 4 },
                  py: { xs: 1.5, md: 2 },
                  borderRadius: "50px",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "1.1rem",
                  fontFamily: '"Adlam Display", serif',
                  borderWidth: 2,
                  "&:hover": {
                    borderColor: theme.palette.primary.main,
                    background: alpha(theme.palette.primary.main, 0.1),
                    transform: "translateY(-3px)",
                  },
                  transition: "all 0.3s ease",
                  width: { xs: '100%', sm: 'auto' }
                }}
              >
                Share Your Experience
              </Button>
            </Box>

            <Typography variant="body2" sx={{ 
              color: theme.palette.text.secondary, 
              opacity: 0.7,
              fontFamily: '"Inter", sans-serif',
            }}>
              Free 14-day trial • No credit card required • Cancel anytime
            </Typography>
          </motion.div>
        </Container>
      </Box>

      {/* Review Dialog */}
      <ReviewDialog
        open={reviewDialogOpen}
        onClose={() => setReviewDialogOpen(false)}
        onReviewSubmitted={handleReviewSubmitted}
        theme={theme}
      />

      {/* Enhanced Footer */}
      <Box
        component="footer"
        sx={{
          background: theme.palette.primary.dark,
          color: "white",
          py: { xs: 6, md: 8 },
          position: "relative"
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 4, md: 6 },
            flexWrap: 'wrap'
          }}>
            {/* Company Info */}
            <Box sx={{ flex: { xs: '1 0 100%', md: '1' } }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  fontSize: { xs: '1.8rem', md: '2.125rem' },
                  fontFamily: '"Adlam Display", serif',
                }}
              >
                PeerCheck
              </Typography>
              <Typography sx={{ 
                opacity: 0.8, 
                lineHeight: 1.6, 
                mb: 3, 
                fontSize: { xs: '0.9rem', md: '1rem' },
                fontFamily: '"Inter", sans-serif',
                maxWidth: '400px',
              }}>
                Empowering the next generation of learners through collaborative 
                feedback and peer-to-peer growth.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                {[Twitter, Facebook, Instagram, LinkedIn].map((SocialIcon, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      width: 40,
                      height: 40,
                      background: "rgba(255,255,255,0.1)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        background: "rgba(255,255,255,0.2)",
                        transform: "translateY(-2px)"
                      }
                    }}
                  >
                    <SocialIcon sx={{ fontSize: '1.2rem' }} />
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Product Links */}
            <Box sx={{ flex: { xs: '1 0 50%', md: '0 0 auto' } }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                mb: 3, 
                fontSize: { xs: '1.1rem', md: '1.25rem' },
                fontFamily: '"Adlam Display", serif',
              }}>
                Product
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {['Features', 'Pricing', 'Case Studies', 'Updates'].map((link) => (
                  <Link
                    key={link}
                    to={`/${link.toLowerCase()}`}
                    style={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      textDecoration: 'none',
                      transition: 'color 0.3s ease',
                      fontSize: '0.95rem',
                      fontFamily: '"Inter", sans-serif',
                    }}
                    className="footer-link"
                  >
                    {link}
                  </Link>
                ))}
              </Box>
            </Box>

            {/* Resource Links */}
            <Box sx={{ flex: { xs: '1 0 50%', md: '0 0 auto' } }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                mb: 3, 
                fontSize: { xs: '1.1rem', md: '1.25rem' },
                fontFamily: '"Adlam Display", serif',
              }}>
                Resources
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {['Blog', 'Documentation', 'Help Center', 'Community'].map((link) => (
                  <Link
                    key={link}
                    to={`/${link.toLowerCase().replace(' ', '-')}`}
                    style={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      textDecoration: 'none',
                      transition: 'color 0.3s ease',
                      fontSize: '0.95rem',
                      fontFamily: '"Inter", sans-serif',
                    }}
                    className="footer-link"
                  >
                    {link}
                  </Link>
                ))}
              </Box>
            </Box>

            {/* Contact Info */}
            <Box sx={{ flex: { xs: '1 0 100%', md: '0 0 auto' } }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                mb: 3, 
                fontSize: { xs: '1.1rem', md: '1.25rem' },
                fontFamily: '"Adlam Display", serif',
              }}>
                Contact
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Email sx={{ fontSize: '1rem', opacity: 0.8 }} />
                  <Typography sx={{ 
                    opacity: 0.8, 
                    fontSize: '0.95rem',
                    fontFamily: '"Inter", sans-serif',
                  }}>
                    <a href="mailto:peercheck@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }} className="footer-link">
                      peercheck@gmail.com
                    </a>
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Phone sx={{ fontSize: '1rem', opacity: 0.8 }} />
                  <Typography sx={{ 
                    opacity: 0.8, 
                    fontSize: '0.95rem',
                    fontFamily: '"Inter", sans-serif',
                  }}>
                    +971 123 456 789
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn sx={{ fontSize: '1rem', opacity: 0.8 }} />
                  <Typography sx={{ 
                    opacity: 0.8, 
                    fontSize: '0.95rem',
                    fontFamily: '"Inter", sans-serif',
                  }}>
                    Abu Dhabi, UAE
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              mt: 6,
              pt: 4,
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              textAlign: "center",
              opacity: 0.7
            }}
          >
            <Typography variant="body2" sx={{ 
              fontSize: { xs: '0.85rem', md: '0.875rem' },
              fontFamily: '"Inter", sans-serif',
            }}>
              © {new Date().getFullYear()} PeerCheck. Empowering student collaboration worldwide.
            </Typography>
            <Typography variant="caption" sx={{ 
              opacity: 0.6, 
              mt: 1, 
              display: 'block', 
              fontSize: { xs: '0.75rem', md: '0.8rem' },
              fontFamily: '"Inter", sans-serif',
            }}>
              Live stats updated every 30 seconds • {stats.totalUsers} registered users
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Add CSS animations */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          
          .footer-link:hover {
            color: white !important;
          }
        `}
      </style>
    </>
  );
}