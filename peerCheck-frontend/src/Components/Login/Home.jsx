// src/Components/Login/Home.jsx
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Helper Components/Navbar";
import image1 from "@/assets/collaboration.jpg";
import {
  Button,
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
  School,
  Email,
  Phone,
  LocationOn,
  Twitter,
  Facebook,
  Instagram,
  LinkedIn,
  VerifiedUser,
  Edit, 
  Delete
} from "@mui/icons-material";
import { useState, useEffect, useCallback } from "react";
import axiosClient from "@/api/axiosClient";
import { motion, AnimatePresence } from "framer-motion";
import ReviewDialog from "@/Components/Login/Helper Components/ReviewDialog";
import useInView from "@/hooks/useInView";
import TourGuide from "../TourGuide";

export default function Home() {
  const theme = useTheme();
  const { ref } = useInView({ threshold: 0.3 });
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
  const [selectedReview, setSelectedReview] = useState(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [animatedStats, setAnimatedStats] = useState({
    users: 0,
    reviews: 0,
    satisfaction: 0
  });

  const getCardBackground = () => ({
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
    transition: 'all 0.3s ease',
  });

  const getAccentColor = (type = 'primary') => {
    const colors = {
      primary: theme.palette.primary.main,
      secondary: theme.palette.secondary.main,
      success: theme.palette.success.main,
      info: theme.palette.info.main,
      warning: theme.palette.warning.main,
      error: theme.palette.error.main
    };
    return colors[type] || theme.palette.primary.main;
  };

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
        animateStats(data);
      } else {
        setError('Failed to load data');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Unable to load live data. Please try again.');
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

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    setLoadingDelete(true);
    try {
      const token = localStorage.getItem('token');
      await axiosClient.delete(`/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchLiveData();
    } catch (error) {
      console.error('Delete error:', error);
      alert(error.response?.data?.message || 'Failed to delete review');
    } finally {
      setLoadingDelete(false);
    }
  };

  const handleOpenUpdateDialog = (review) => {
    setSelectedReview(review);
    setUpdateDialogOpen(true);
  };

  const handleCloseUpdateDialog = () => {
    setUpdateDialogOpen(false);
    setSelectedReview(null);
  };

  const handleLoginButton = () => {
    navigate("/sign-up");
  };

  const handleReviewSubmitted = () => {
    fetchLiveData();
  };

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

  useEffect(() => {
    fetchLiveData();
    
  }, [fetchLiveData]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchLiveData();
    }, 300000);
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
      color: theme.palette.info.main
    },
    {
      icon: <CalendarToday />,
      title: "Collaborative Scheduling",
      description: "Coordinate study sessions and project deadlines",
      color: theme.palette.success.main
    },
    {
      icon: <VerifiedUser />,
      title: "Peer Evaluation System",
      description: "Evaluate teammates fairly using structured criteria and rubrics",
      color: theme.palette.warning.main
    },
    {
      icon: <School />,
      title: "Mentor-Guided Review",
      description: "Enable mentors to monitor progress and provide expert feedback",
      color: theme.palette.info.main
    }
  ];

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

  const renderStars = (rating) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Rating value={rating} readOnly precision={0.5} size="small" />
      <Typography variant="body2" color="text.secondary">
        ({rating.toFixed(1)})
      </Typography>
    </Box>
  );

  const StatCard = ({ icon, value, label, colorType = 'primary', progress = null }) => {
    const color = getAccentColor(colorType);
    return (
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            ...getCardBackground(),
            position: 'relative',
            overflow: 'hidden',
            height: '100%',
            '&:hover': {
              borderColor: alpha(color, 0.3),
              boxShadow: `0 8px 32px ${alpha(color, 0.12)}`,
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box sx={{
              p: 1.5,
              borderRadius: '12px',
              backgroundColor: alpha(color, 0.08),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${alpha(color, 0.1)}`,
            }}>
              {React.cloneElement(icon, { 
                sx: { 
                  color: color,
                  fontSize: 24,
                } 
              })}
            </Box>
            <Typography variant="h4" fontWeight="700" sx={{ 
              color: color,
              lineHeight: 1,
            }}>
              {value}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ 
            color: theme.palette.text.secondary,
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
                height: 4,
                borderRadius: 2,
                backgroundColor: alpha(color, 0.1),
                '& .MuiLinearProgress-bar': {
                  backgroundColor: color,
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
      <TourGuide page="welcome-tour" autoStart={true} />

      {/* Hero Section */}
      <Box
        ref={ref}
        sx={{
          backgroundColor: theme.palette.background.default,
          minHeight: "100vh",
          padding: "2em",
          display: "flex",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="xl" sx={{ py: 8 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', lg: 'row' },
            alignItems: 'center',
            gap: 6,
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
                  icon={<Star />}
                  sx={{
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    mb: 4,
                    fontWeight: 600,
                    px: 2,
                    py: 3,
                    mt: 4,
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                  }}
                />

                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', sm: '3.5rem', lg: '4rem' },
                    fontWeight: 700,
                    color: theme.palette.text.primary,
                    lineHeight: 1.1,
                    mb: 3,
                  }}
                >
                  Learn Together,
                  <Box component="span" sx={{ 
                    display: 'block', 
                    mt: 0.5,
                    color: theme.palette.primary.main 
                  }}>
                    Grow Together
                  </Box>
                </Typography>

                <Typography
                  variant="h6"
                  sx={{
                    color: theme.palette.text.secondary,
                    mb: 4,
                    fontSize: '1.125rem',
                    lineHeight: 1.7,
                    maxWidth: "600px",
                    mx: { xs: 'auto', lg: 0 },
                  }}
                >
                  Join the ultimate peer learning platform where feedback fuels growth, 
                  collaboration sparks innovation, and every student thrives together.
                  <br/> For the students, by the students!
                </Typography>

                {/* Live Stats */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2,
                  mb: 4,
                  justifyContent: { xs: 'center', lg: 'flex-start' }
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%',
                      backgroundColor: '#4CAF50',
                      animation: 'pulse 2s infinite'
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
                      backgroundColor: alpha(theme.palette.primary.main, 0.08),
                    }}
                  >
                    <Refresh fontSize="small" />
                  </IconButton>
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
                    onClick={handleLoginButton}
                    endIcon={<ArrowForward />}
                    sx={{
                      backgroundColor: theme.palette.primary.main,
                      px: 4,
                      py: 1.5,
                      fontSize: "1rem",
                      borderRadius: "8px",
                      textTransform: "none",
                      fontWeight: 600,
                      minWidth: { xs: '100%', sm: 'auto' },
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                      }
                    }}
                  >
                    <Link to="/sign-up" style={{ textDecoration: "none", color: "white" }}>
                      Start Free Today
                    </Link>
                  </Button>

                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<PlayArrow />}
                    sx={{
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                      color: theme.palette.primary.main,
                      px: 4,
                      py: 1.5,
                      borderRadius: "8px",
                      textTransform: "none",
                      fontWeight: 600,
                      minWidth: { xs: '100%', sm: 'auto' },
                      '&:hover': {
                        borderColor: theme.palette.primary.main,
                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                      }
                    }}
                  >
                    Watch Demo
                  </Button>
                </Box>
              </motion.div>
            </Box>

            {/* Right Content */}
            <Box sx={{ 
              flex: 1,
              position: 'relative',
            }}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    position: 'relative',
                    borderRadius: 2,
                    overflow: 'hidden',
                    ...getCardBackground(),
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
                    }}
                  />

                  {/* Stats Overlay */}
                  <Paper
                    elevation={0}
                    sx={{
                      position: 'absolute',
                      bottom: 24,
                      left: 24,
                      right: 24,
                      borderRadius: 2,
                      p: 2,
                      backgroundColor: 'rgba(255, 255, 255, 0)',
                      backdropFilter: 'blur(10px)',
                      border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: theme.palette.primary.main, mb: 1 }}>
                      Live Platform Stats
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ color: 'white' }}>
                        {stats.activeUsers} students active now
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ThumbUp fontSize="small" color="primary" />
                        <Typography variant="caption" sx={{ color: 'white'}}>
                          {stats.reviewStats.totalReviews} reviews
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Paper>

                {/* Review Button */}
                <Box sx={{ 
                  position: 'absolute', 
                  top: 20, 
                  right: 20,
                  display: { xs: 'none', md: 'block' }
                }}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="contained"
                      size="medium"
                      startIcon={<Star />}
                      onClick={() => setReviewDialogOpen(true)}
                      sx={{
                        backgroundColor: theme.palette.secondary.main,
                        color: "white",
                        px: 3,
                        py: 1,
                        borderRadius: "8px",
                        textTransform: "none",
                        fontWeight: 600,
                        '&:hover': {
                          backgroundColor: theme.palette.secondary.dark,
                        }
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

      {/* Features Section */}
      <Box sx={{ 
        py: { xs: 8, md: 12 },
        backgroundColor: theme.palette.background.paper,
      }}>
        <Container maxWidth="xl">
          <Box sx={{ 
            textAlign: "center", 
            mb: { xs: 6, md: 8 },
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
                  color: theme.palette.text.primary,
                  mb: 2,
                  fontSize: { xs: '2rem', md: '2.5rem' },
                }}
              >
                Everything You Need to
                <Box component="span" sx={{ 
                  display: 'block', 
                  color: theme.palette.primary.main,
                  mt: 1,
                }}>
                  Succeed Together
                </Box>
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: theme.palette.text.secondary,
                  maxWidth: "600px",
                  mx: "auto",
                }}
              >
                Powerful tools designed specifically for student collaboration and peer learning
              </Typography>
            </motion.div>
          </Box>

          <Box sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" },
            gap: 3,
          }}>
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    ...getCardBackground(),
                    borderRadius: 2,
                    padding: 3,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    '&:hover': {
                      borderColor: alpha(feature.color, 0.3),
                      transform: "translateY(-4px)",
                    },
                    transition: "all 0.3s ease",
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      backgroundColor: alpha(feature.color, 0.1),
                      borderRadius: "12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 2,
                      fontSize: "20px",
                      color: feature.color,
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      mb: 1,
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    sx={{
                      color: theme.palette.text.secondary,
                      lineHeight: 1.6,
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

      {/* Stats Section */}
      <Box sx={{ 
        py: { xs: 8, md: 12 }, 
        backgroundColor: theme.palette.primary.main,
        color: 'white',
      }}>
        <Container maxWidth="xl">
          <Box sx={{
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            alignItems: "center",
            gap: { xs: 4, lg: 6 },
          }}>
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
                    mb: 3,
                    fontSize: { xs: '2rem', md: '2.5rem' },
                  }}
                >
                  Trusted by Students Worldwide
                </Typography>
                <Typography
                  sx={{
                    color: 'rgba(255,255,255,0.9)',
                    lineHeight: 1.6,
                    mb: 4,
                  }}
                >
                  Join thousands of students who have transformed their learning experience 
                  through collaborative feedback and peer support.
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  gap: 1, 
                  flexWrap: 'wrap', 
                  justifyContent: { xs: 'center', lg: 'flex-start' } 
                }}>
                  <Chip 
                    label="Live Updates" 
                    sx={{ 
                      background: "rgba(255,255,255,0.1)", 
                      color: "white",
                      fontWeight: 500,
                    }} 
                  />
                  <Chip 
                    label="Real Reviews" 
                    sx={{ 
                      background: "rgba(255,255,255,0.1)", 
                      color: "white",
                      fontWeight: 500,
                    }} 
                  />
                  <Chip 
                    label="Peer Verified" 
                    sx={{ 
                      background: "rgba(255,255,255,0.1)", 
                      color: "white",
                      fontWeight: 500,
                    }} 
                  />
                </Box>
              </motion.div>
            </Box>

            {/* Right Section */}
            <Box sx={{ 
              flex: 1, 
              display: "grid", 
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 3,
              width: '100%'
            }}>
              {[
                { 
                  value: `${animatedStats.users}+`, 
                  label: "Active Users", 
                  icon: <People />,
                  color: 'primary'
                },
                { 
                  value: `${animatedStats.reviews}+`, 
                  label: "Verified Reviews", 
                  icon: <Message />,
                  color: 'secondary'
                },
                { 
                  value: `${animatedStats.satisfaction}%`, 
                  label: "Satisfaction Rate", 
                  icon: <Favorite />,
                  color: 'success'
                },
                { 
                  value: `${stats.activeUsers}`, 
                  label: "Online Now", 
                  icon: <People />,
                  color: 'info'
                }
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      background: "rgba(255, 255, 255, 0.1)",
                      borderRadius: 2,
                      padding: 2.5,
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box sx={{ 
                        fontSize: '1.25rem', 
                        color: 'white', 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 40,
                        height: 40,
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.1)',
                      }}>
                        {stat.icon}
                      </Box>
                      <Box>
                        <Typography
                          variant="h4"
                          sx={{
                            fontWeight: 700,
                            color: "white",
                            lineHeight: 1,
                          }}
                        >
                          {stat.value}
                        </Typography>
                        <Typography sx={{ 
                          color: 'rgba(255,255,255,0.9)', 
                          fontSize: '0.875rem',
                          fontWeight: 500,
                        }}>
                          {stat.label}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </motion.div>
              ))}
            </Box>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchLiveData}
              disabled={loading}
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.3)',
                fontWeight: 500,
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
                borderRadius: 1,
              }}
            >
              {loading ? 'Updating...' : 'Refresh Live Data'}
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Reviews Section */}
      <Box sx={{ 
        py: { xs: 8, md: 12 }, 
        backgroundColor: theme.palette.background.default 
      }}>
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
                  mb: 1,
                  fontSize: { xs: '1.75rem', md: '2.5rem' },
                }}
              >
                Recent Student Reviews
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: theme.palette.text.secondary,
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
                backgroundColor: theme.palette.primary.main,
                borderRadius: "8px",
                px: 3,
                py: 1.5,
                width: { xs: '100%', md: 'auto' },
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                }
              }}
            >
              Share Your Experience
            </Button>
          </Box>

          {/* Reviews Content */}
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                  <CircularProgress />
                </Box>
              </motion.div>
            ) : error ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Alert 
                  severity="error"
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
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Paper sx={{ 
                  p: { xs: 4, md: 8 }, 
                  textAlign: 'center', 
                  borderRadius: 2,
                  ...getCardBackground(),
                }}>
                  <Star sx={{ 
                    fontSize: 48, 
                    color: theme.palette.text.disabled, 
                    mb: 3,
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
                  >
                    Write First Review
                  </Button>
                </Paper>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' },
                  gap: 3,
                }}>
                  {stats.recentReviews.slice(0,6).map((review, idx) => (
                    <Box key={review._id || idx}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <Paper
                          elevation={0}
                          sx={{
                            ...getCardBackground(),
                            borderRadius: 2,
                            padding: 3,
                            height: "100%",
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative',
                            '&:hover': {
                              borderColor: alpha(theme.palette.primary.main, 0.3),
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <Avatar 
                            src={review.user?.avatar}
                            sx={{ 
                              bgcolor: theme.palette.primary.main, 
                              mr: 2,
                              width: 40,
                              height: 40,
                            }}>
                              {review.user?.name?.charAt(0) || 'U'}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {review.user?.name || 'Anonymous'}
                              </Typography>
                              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                {review.user?.username ? `@${review.user.username}` : 'Student'}
                              </Typography>
                            </Box>
                            {renderStars(review.rating)}
                          </Box>
                          
                          <Typography 
                            variant="h6" 
                            sx={{ 
                              mb: 2,
                              fontWeight: 600,
                            }}
                          >
                            "{review.title}"
                          </Typography>
                          
                          <Typography sx={{ 
                            color: theme.palette.text.secondary, 
                            lineHeight: 1.6, 
                            mb: 2,
                            flex: 1,
                          }}>
                            {review.content}
                          </Typography>
                          
                          {/* Tags */}
                          {review.tags && review.tags.length > 0 && (
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                              {review.tags.map((tag, tagIdx) => (
                                <Chip
                                  key={tagIdx}
                                  label={tag}
                                  size="small"
                                  sx={{
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    color: theme.palette.primary.main,
                                  }}
                                />
                              ))}
                            </Box>
                          )}
                          
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            mt: 'auto',
                            pt: 2,
                            borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <AccessTime fontSize="small" sx={{ color: theme.palette.text.disabled }} />
                              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                {formatDate(review.createdAt)}
                              </Typography>
                            </Box>
                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                              Login to manage review
                            </Typography>
                          </Box>
                        </Paper>
                      </motion.div>
                    </Box>
                  ))}
                </Box>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Overall Rating */}
          {stats.reviewStats.totalReviews > 0 && (
            <Box sx={{ mt: 8, textAlign: 'center' }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <Paper
                  sx={{
                    p: 4,
                    borderRadius: 2,
                    ...getCardBackground(),
                    maxWidth: 600,
                    mx: 'auto',
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Overall Rating
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, mb: 2 }}>
                    <Typography variant="h2" sx={{ fontWeight: 700 }}>
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

      {/* CTA Section */}
      <Box sx={{ 
        py: { xs: 8, md: 12 }, 
        backgroundColor: theme.palette.background.paper,
        textAlign: "center",
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
                fontWeight: 700,
                mb: 3,
                fontSize: { xs: '2rem', md: '2.5rem' },
              }}
            >
              Ready to Transform Your Learning?
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: theme.palette.text.secondary,
                mb: 5,
                lineHeight: 1.6,
              }}
            >
              Join {animatedStats.users}+ students already accelerating their learning journey with PeerCheck. 
              Get started in seconds - no credit card required.
            </Typography>
            
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2, 
              justifyContent: 'center', 
              mb: 4 
            }}>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                onClick={handleLoginButton}
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  px: 4,
                  py: 1.5,
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                  }
                }}
              >
                Create Free Account
              </Button>

              <Button
                variant="outlined"
                size="large"
                startIcon={<Star />}
                onClick={() => setReviewDialogOpen(true)}
                sx={{
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  color: theme.palette.primary.main,
                  px: 4,
                  py: 1.5,
                  borderRadius: "8px",
                  textTransform: "none",
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                  }
                }}
              >
                Share Your Experience
              </Button>
            </Box>

            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
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

      {/* Update Review Dialog */}
      {updateDialogOpen && selectedReview && (
        <ReviewDialog
          open={updateDialogOpen}
          onClose={handleCloseUpdateDialog}
          onReviewSubmitted={handleReviewSubmitted}
          theme={theme}
          review={selectedReview}
          isUpdate={true}
        />
      )}

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          backgroundColor: theme.palette.grey[900],
          color: "white",
          py: { xs: 6, md: 8 },
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '2fr 1fr 1fr 1fr' },
            gap: { xs: 4, md: 6 },
          }}>
            {/* Company Info */}
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                PeerCheck
              </Typography>
              <Typography sx={{ 
                opacity: 0.8, 
                lineHeight: 1.6, 
                mb: 3,
              }}>
                Empowering the next generation of learners through collaborative 
                feedback and peer-to-peer growth.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                {[Twitter, Facebook, Instagram, LinkedIn].map((SocialIcon, idx) => (
                  <IconButton
                    key={idx}
                    sx={{
                      color: 'rgba(255,255,255,0.8)',
                      '&:hover': {
                        color: 'white',
                        backgroundColor: 'rgba(255,255,255,0.1)',
                      }
                    }}
                  >
                    <SocialIcon />
                  </IconButton>
                ))}
              </Box>
            </Box>

            {/* Product Links */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Product
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {['Features', 'Pricing', 'Case Studies', 'Updates'].map((link) => (
                  <Link
                    key={link}
                    to={`/${link.toLowerCase()}`}
                    style={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      '&:hover': {
                        color: 'white',
                      }
                    }}
                  >
                    {link}
                  </Link>
                ))}
              </Box>
            </Box>

            {/* Resource Links */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Resources
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {['Blog', 'Documentation', 'Help Center', 'Community'].map((link) => (
                  <Link
                    key={link}
                    to={`/${link.toLowerCase().replace(' ', '-')}`}
                    style={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                    }}
                  >
                    {link}
                  </Link>
                ))}
              </Box>
            </Box>

            {/* Contact Info */}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Contact
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Email sx={{ fontSize: '1rem', opacity: 0.8 }} />
                  <Typography sx={{ opacity: 0.8, fontSize: '0.9rem' }}>
                    peercheck@gmail.com
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Phone sx={{ fontSize: '1rem', opacity: 0.8 }} />
                  <Typography sx={{ opacity: 0.8, fontSize: '0.9rem' }}>
                    +971 123 456 789
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn sx={{ fontSize: '1rem', opacity: 0.8 }} />
                  <Typography sx={{ opacity: 0.8, fontSize: '0.9rem' }}>
                    Abu Dhabi, UAE
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          <Box sx={{ mt: 6, pt: 4, borderTop: "1px solid rgba(255, 255, 255, 0.1)", textAlign: "center" }}>
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
              © {new Date().getFullYear()} PeerCheck. Empowering student collaboration worldwide.
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.6, mt: 1, display: 'block' }}>
              Live stats updated every 30 seconds • {stats.totalUsers} registered users
            </Typography>
          </Box>
        </Container>
      </Box>
    </>
  );
}