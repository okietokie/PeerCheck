import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import image1 from "./collaboration.jpg";
import { 
  Button, 
  Card, 
  CardContent, 
  Container,
  Box,
  Typography,
  Grid,
  useTheme,
  useMediaQuery,
  Chip,
  Avatar,
  AvatarGroup,
  Paper,
  alpha,
  CircularProgress,
  Alert,
  IconButton,
  Rating
} from "@mui/material";
import { 
  People,
  CheckCircle,
  Security,
  TrendingUp,
  Message,
  EmojiEvents,
  Star,
  ArrowForward,
  PlayArrow,
  CalendarToday,
  TrackChanges,
  BarChart,
  Favorite,
  School,
  Group,
  Psychology,
  Schedule,
  Twitter,
  Facebook,
  Instagram,
  LinkedIn,
  Email,
  Phone,
  LocationOn,
  Refresh,
  ThumbUp,
  AccessTime
} from "@mui/icons-material";
import { useState, useEffect, useCallback } from "react";
import axiosClient from "@/api/axiosClient";
import { motion } from "framer-motion";
import ReviewDialog from "./ReviewDialog";
import useInView from "@/hooks/useInView";


export default function Home() {
  const theme = useTheme();
  const { ref, inView } = useInView({ threshold: 0.3 });  
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));  
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

  // Helper to get auth token
  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  // Check if user is logged in
  const isLoggedIn = () => {
    return !!getAuthToken();
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

  return (
    <>
      <Navbar />

      {/* Enhanced Hero Section */}
      <Box
        ref={ref}
        sx={{
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.background.default, 0.8)} 0%, 
            ${alpha(theme.palette.background.paper, 0.6)} 50%, 
            ${alpha(theme.palette.background.default, 0.8)} 100%)`,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 80%, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, ${alpha(theme.palette.tertiary?.main || theme.palette.primary.light, 0.05)} 0%, transparent 50%)
            `,
          }
        }}
      >
        {/* Floating Elements */}
        <Box
          sx={{
            position: "absolute",
            top: "20%",
            left: "10%",
            width: "60px",
            height: "60px",
            background: alpha(theme.palette.primary.main, 0.1),
            borderRadius: "50%",
            animation: "float 6s ease-in-out infinite"
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: "60%",
            right: "15%",
            width: "40px",
            height: "40px",
            background: alpha(theme.palette.secondary.main, 0.1),
            borderRadius: "50%",
            animation: "float 4s ease-in-out infinite 1s"
          }}
        />

        <Container maxWidth="lg" className="top">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ position: "relative", zIndex: 1, pt: 12 }}>
                <Chip
                  label={`${animatedStats.users}+ Active Students`}
                  icon={<Star sx={{ color: 'inherit' }} />}
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    color: theme.palette.primary.contrastText,
                    mb: 3,
                    fontWeight: 600,
                    px: 2,
                    py: 1
                  }}
                />
                
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '3.5rem', md: '5rem' },
                    fontWeight: 800,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                    lineHeight: 1.1,
                    mb: 3
                  }}
                >
                  Learn
                  <Box component="span" sx={{ display: 'block', color: theme.palette.primary.main }}>
                    Together,
                  </Box>
                  <Box component="span" sx={{ display: 'block', pb: '.2em'}}>
                    Grow Together
                  </Box>
                </Typography>
                
                <Typography
                  variant="h6"
                  sx={{
                    color: theme.palette.text.secondary,
                    mb: 4,
                    mt: '1.3em',
                    fontSize: '1.3rem',
                    lineHeight: 1.6,
                    opacity: 0.9,
                    maxWidth: "90%"
                  }}
                >
                  Join the ultimate peer learning platform where feedback fuels growth, 
                  collaboration sparks innovation, and every student thrives together.
                  <br/> For the students, by the students!
                </Typography>

                {/* Live Stats Indicator */}
                <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%',
                      backgroundColor: stats.activeUsers > 0 ? '#4CAF50' : '#ff9800',
                      animation: stats.activeUsers > 0 ? 'pulse 2s infinite' : 'none'
                    }} />
                    <Typography variant="body2" color="text.secondary">
                      {stats.activeUsers} students active now
                    </Typography>
                  </Box>
                  
                  <IconButton 
                    size="small" 
                    onClick={fetchLiveData}
                    disabled={loading}
                    sx={{ color: theme.palette.primary.main }}
                  >
                    <Refresh fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </Grid>

            <Box
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "space-around",
                alignItems: "center",
                gap: 3,
                mt: 4,
                mb: 5
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  maxWidth: "500px",
                  width: "100%",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: -30,
                    right: -30,
                    width: "100%",
                    height: "100%",
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, transparent 70%)`,
                    borderRadius: "40px",
                    zIndex: 0,
                  }
                }}
              >
                {/* Main Image */}
                <Box
                  component="img"
                  src={image1}
                  alt="Students collaborating"
                  sx={{
                    width: "100%",
                    height: "auto",
                    borderRadius: "40px",
                    boxShadow: `0 25px 80px ${alpha(theme.palette.common.black, 0.2)}`,
                    position: "relative",
                    zIndex: 1,
                    transform: "rotate(-3deg)",
                    transition: "all 0.5s ease",
                    "&:hover": {
                      transform: "rotate(0deg) scale(1.02)",
                    }
                  }}
                />

                {/* Live Stats Card */}
                <Card
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: -50,
                    background: theme.palette.background.paper,
                    borderRadius: "20px",
                    padding: 3,
                    boxShadow: `0 15px 40px ${alpha(theme.palette.common.black, 0.15)}`,
                    animation: "float 5s ease-in-out infinite",
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    zIndex: 2,
                    minWidth: 200
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
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
                      Live Stats
                    </Typography>
                  </Box>

                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                    {stats.activeUsers} students active now
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <ThumbUp fontSize="small" color="primary" />
                    <Typography variant="caption" color="text.secondary">
                      {stats.reviewStats.totalReviews} reviews
                    </Typography>
                  </Box>
                </Card>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  flexDirection: 'column',
                  gap: 3 
                }}
              >
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
                    boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: `0 12px 35px ${alpha(theme.palette.primary.main, 0.4)}`,
                    },
                    transition: "all 0.3s ease"
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
                    borderColor: theme.palette.primary.main,
                    color: theme.palette.primary.main,
                    px: 4,
                    py: 1.5,
                    borderRadius: "50px",
                    textTransform: "none",
                    fontWeight: 600,
                    "&:hover": {
                      borderColor: theme.palette.primary.dark,
                      background: alpha(theme.palette.primary.main, 0.1),
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.3s ease"
                  }}
                >
                  Watch Demo
                </Button>

                {/* New: Add Review Button */}
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
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: `0 12px 35px ${alpha(theme.palette.secondary.main, 0.4)}`,
                    },
                    transition: "all 0.3s ease"
                  }}
                >
                  Add Your Review
                </Button>
              </Box>
            </Box>
          </Grid>
        </Container>
      </Box>

      {/* Features Grid Section */}
      <Box sx={{ py: 15, background: `linear-gradient(180deg, ${alpha(theme.palette.background.paper, 0.5)} 0%, ${theme.palette.background.default} 100%)` }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={10}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                color: theme.palette.primary.main,
                mb: 3,
                fontSize: { xs: '2.8rem', md: '4rem' }
              }}
            >
              Everything You Need to
              <Box component="span" sx={{ display: 'block', background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`, backgroundClip: "text", WebkitBackgroundClip: "text", color: "transparent" }}>
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
                fontSize: '1.2rem'
              }}
            >
              Powerful tools designed specifically for student collaboration and peer learning
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 4,
              justifyContent: { xs: "center", md: "space-between" },
            }}
          >
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <Card
                  sx={{
                    background: theme.palette.background.paper,
                    borderRadius: "25px",
                    padding: 4,
                    width: { xs: "100%", md: "48%" },
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                    transition: "all 0.4s ease",
                    "&:hover": {
                      transform: "translateY(-15px)",
                      boxShadow: `0 25px 60px ${alpha(theme.palette.primary.main, 0.15)}`,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${theme.palette.background.paper} 100%)`,
                    },
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                  }}
                >
                  <Box
                    sx={{
                      width: 70,
                      height: 70,
                      background: `linear-gradient(135deg, ${feature.color} 0%, ${alpha(feature.color, 0.8)} 100%)`,
                      borderRadius: "20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 3,
                      fontSize: "28px",
                      color: "white"
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.primary.main,
                      mb: 2
                    }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography
                    sx={{
                      color: theme.palette.text.secondary,
                      lineHeight: 1.6,
                      fontSize: '1.1rem'
                    }}
                  >
                    {feature.description}
                  </Typography>
                </Card>
              </motion.div>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Interactive Stats Section with Live Data */}
      <Box sx={{ 
        py: 15, 
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        position: "relative",
        overflow: "hidden"
      }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "center",
              gap: 6,
              flexWrap: "wrap",
            }}
          >
            {/* Left Section */}
            <Box sx={{ flex: 1, minWidth: { xs: "100%", md: "45%" } }}>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 700,
                  color: "white",
                  mb: 3,
                  fontSize: { xs: '2.8rem', md: '3.5rem' }
                }}
              >
                Trusted by Students Worldwide
              </Typography>
              <Typography
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '1.2rem',
                  lineHeight: 1.6,
                  mb: 4
                }}
              >
                Join thousands of students who have transformed their learning experience 
                through collaborative feedback and peer support.
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: "center" }}>
                <Chip label="Live Updates" sx={{ background: "rgba(255,255,255,0.2)", color: "white" }} />
                <Chip label="Real Reviews" sx={{ background: "rgba(255,255,255,0.2)", color: "white" }} />
                <Chip label="Peer Verified" sx={{ background: "rgba(255,255,255,0.2)", color: "white" }} />
              </Box>
            </Box>

            {/* Right Section - Live Stats */}
            <Box sx={{ flex: 1, minWidth: { xs: "100%", md: "45%" }, display: "flex", flexDirection: "column", gap: 4}}>
              {[
                { 
                  value: `${animatedStats.users}+`, 
                  label: "Active Users", 
                  icon: <People />,
                  description: `${stats.activeUsers} currently online`
                },
                { 
                  value: `${animatedStats.reviews}+`, 
                  label: "Verified Reviews", 
                  icon: <Message />,
                  description: `Average ${stats.reviewStats.averageRating.toFixed(1)}/5 rating`
                },
                { 
                  value: `${animatedStats.satisfaction}%`, 
                  label: "Satisfaction Rate", 
                  icon: <Favorite />,
                  description: "Based on recent feedback"
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
                    sx={{
                      background: "rgba(255, 255, 255, 0.1)",
                      backdropFilter: "blur(10px)",
                      borderRadius: "20px",
                      padding: 3,
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        background: "rgba(255, 255, 255, 0.15)",
                        transform: "translateX(10px)"
                      }
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                      <Box sx={{ fontSize: '2rem', color: 'white', opacity: 0.9 }}>
                        {stat.icon}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="h3"
                          sx={{
                            fontWeight: 800,
                            color: "white",
                            lineHeight: 1
                          }}
                        >
                          {stat.value}
                        </Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '1rem' }}>
                          {stat.label}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography sx={{ 
                      color: 'rgba(255,255,255,0.7)', 
                      fontSize: '0.85rem',
                      mt: 1
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
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              {loading ? 'Updating...' : 'Refresh Live Data'}
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Live Reviews Section */}
      <Box sx={{ py: 15, background: theme.palette.background.default }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
            <Box>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 700,
                  color: theme.palette.primary.main,
                  mb: 1
                }}
              >
                Recent Student Reviews
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: theme.palette.text.secondary,
                  opacity: 0.8
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
                py: 1.5
              }}
            >
              Share Your Experience
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
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
          ) : stats.recentReviews.length === 0 ? (
            <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 2 }}>
              <Star sx={{ fontSize: 60, color: theme.palette.text.disabled, mb: 3 }} />
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
          ) : (
            <Grid container spacing={4}>
              {stats.recentReviews.slice(0, 3).map((review, idx) => (
                <Grid item xs={12} md={4} key={idx}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card
                      sx={{
                        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${theme.palette.background.paper} 100%)`,
                        borderRadius: "25px",
                        padding: 4,
                        height: "100%",
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        transition: "all 0.3s ease",
                        "&:hover": {
                          transform: "translateY(-10px)",
                          boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Avatar sx={{ 
                          bgcolor: theme.palette.primary.main, 
                          mr: 2,
                          width: 48,
                          height: 48 
                        }}>
                          {review.user?.name?.charAt(0) || 'U'}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
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
                          color: theme.palette.text.primary, 
                          mb: 2,
                          fontWeight: 600 
                        }}
                      >
                        "{review.title}"
                      </Typography>
                      
                      <Typography sx={{ 
                        color: theme.palette.text.secondary, 
                        lineHeight: 1.6, 
                        mb: 2,
                        fontStyle: 'italic'
                      }}>
                        {review.content}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccessTime fontSize="small" color="action" />
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(review.createdAt)}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {review.tags?.slice(0, 2).map((tag, tagIdx) => (
                            <Chip
                              key={tagIdx}
                              label={tag}
                              size="small"
                              sx={{
                                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.primary.main,
                                fontSize: '0.7rem'
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Overall Rating Summary */}
          {stats.reviewStats.totalReviews > 0 && (
            <Box sx={{ mt: 8, textAlign: 'center' }}>
              <Paper
                sx={{
                  p: 4,
                  borderRadius: "20px",
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  maxWidth: 600,
                  mx: 'auto'
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.primary.main, mb: 2 }}>
                  Overall Rating
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, mb: 2 }}>
                  <Typography variant="h1" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
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
            </Box>
          )}
        </Container>
      </Box>

      {/* Final CTA Section */}
      <Box sx={{ 
        py: 15, 
        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${theme.palette.background.default} 100%)`,
        textAlign: "center",
        position: "relative",
        overflow: "hidden"
      }}>
        <Container maxWidth="md">
          <Typography
            variant="h2"
            sx={{
              fontWeight: 800,
              color: theme.palette.primary.main,
              mb: 3,
              fontSize: { xs: '2.8rem', md: '4rem' }
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
              fontSize: '1.3rem',
              lineHeight: 1.6
            }}
          >
            Join {animatedStats.users}+ students already accelerating their learning journey with PeerCheck. 
            Get started in seconds - no credit card required.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap', mb: 4 }}>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowForward />}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                color: theme.palette.primary.contrastText,
                px: 6,
                py: 2,
                fontSize: "1.2rem",
                borderRadius: "50px",
                textTransform: "none",
                fontWeight: 600,
                boxShadow: `0 8px 25px ${alpha(theme.palette.primary.main, 0.3)}`,
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: `0 15px 35px ${alpha(theme.palette.primary.main, 0.4)}`,
                },
                transition: "all 0.3s ease"
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
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                px: 4,
                py: 2,
                borderRadius: "50px",
                textTransform: "none",
                fontWeight: 600,
                fontSize: "1.2rem",
                "&:hover": {
                  borderColor: theme.palette.primary.dark,
                  background: alpha(theme.palette.primary.main, 0.1),
                  transform: "translateY(-3px)",
                },
                transition: "all 0.3s ease"
              }}
            >
              Share Your Experience
            </Button>
          </Box>

          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, opacity: 0.7 }}>
            Free 14-day trial • No credit card required • Cancel anytime
          </Typography>
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
          py: 8,
          position: "relative"
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  mb: 2
                }}
              >
                PeerCheck
              </Typography>
              <Typography sx={{ opacity: 0.8, lineHeight: 1.6, mb: 3 }}>
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
            </Grid>

            <Grid item xs={12} md={2}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
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
                      transition: 'color 0.3s ease'
                    }}
                    className="footer-link"
                  >
                    {link}
                  </Link>
                ))}
              </Box>
            </Grid>

            <Grid item xs={12} md={3}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
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
                      transition: 'color 0.3s ease'
                    }}
                    className="footer-link"
                  >
                    {link}
                  </Link>
                ))}
              </Box>
            </Grid>

            <Grid item xs={12} md={3}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Contact
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Email sx={{ fontSize: '1rem', opacity: 0.8 }} />
                  <Typography sx={{ opacity: 0.8 }}>
                    <a href="mailto:peercheck@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }} className="footer-link">
                      peercheck@gmail.com
                    </a>
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Phone sx={{ fontSize: '1rem', opacity: 0.8 }} />
                  <Typography sx={{ opacity: 0.8 }}>
                    +971 123 456 789
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn sx={{ fontSize: '1rem', opacity: 0.8 }} />
                  <Typography sx={{ opacity: 0.8 }}>
                    Abu Dhabi, UAE
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>

          <Box
            sx={{
              mt: 6,
              pt: 4,
              borderTop: "1px solid rgba(255, 255, 255, 0.1)",
              textAlign: "center",
              opacity: 0.7
            }}
          >
            <Typography variant="body2">
              © 2025 PeerCheck. All rights reserved. Made with <Favorite sx={{ fontSize: '1rem', color: '#ff6b6b' }} /> for students everywhere.
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.6, mt: 1, display: 'block' }}>
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