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
  alpha
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
  LocationOn
} from "@mui/icons-material";
import { useState, useEffect } from "react";
import axiosClient from "@/api/axiosClient";
import { motion } from "framer-motion";

export default function Home() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));  
  const [stdCountActive, setStdCountActive] = useState(0);
  const [animatedStats, setAnimatedStats] = useState({
    users: 0, 
    feedback: 0,
    satisfaction: 0
  });

  const fetchBasicUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axiosClient.get("/home/basic-data", {
        headers: {Authorization : `Bearer ${token}`}
      })
      setStdCountActive(res.data.activeUsers || 0);
    } catch (error) {
      console.log(`Error fetching basic data ${error}`)
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      fetchBasicUserData();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [])

  useEffect(() => {
    const animateStats = () => {
      const duration = 2000;
      const steps = 60;
      const incrementUsers = 1500 / steps;
      const incrementFeedback = 3200 / steps;
      const incrementSatisfaction = 98 / steps;

      let currentUsers = 0;
      let currentFeedback = 0;
      let currentSatisfaction = 0;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        currentUsers = Math.min(1500, currentUsers + incrementUsers);
        currentFeedback = Math.min(3200, currentFeedback + incrementFeedback);
        currentSatisfaction = Math.min(98, currentSatisfaction + incrementSatisfaction);

        setAnimatedStats({
          users: Math.floor(currentUsers),
          feedback: Math.floor(currentFeedback),
          satisfaction: Math.floor(currentSatisfaction)
        });

        if (step >= steps) {
          clearInterval(timer);
        }
      }, duration / steps);
    };

    animateStats();
  }, []);

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

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Computer Science Student",
      content: "PeerCheck transformed how our study group collaborates. The feedback system is incredible!",
      avatar: "SC"
    },
    {
      name: "Marcus Rodriguez",
      role: "Engineering Student",
      content: "Finally, a platform that understands how students actually work together.",
      avatar: "MR"
    },
    {
      name: "Priya Patel",
      role: "Medical Student",
      content: "The progress tracking helped our group stay motivated throughout the semester.",
      avatar: "PP"
    }
  ];

  return (
    <>
      <Navbar />

      {/* Enhanced Hero Section with Particles */}
      <Box
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
                  label="Trusted by 1500+ Students"
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

                {/* Trust Indicators */}
                <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
                  <AvatarGroup max={4}>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main, width: 40, height: 40 }}>A</Avatar>
                    <Avatar sx={{ bgcolor: theme.palette.secondary.main, width: 40, height: 40 }}>B</Avatar>
                    <Avatar sx={{ bgcolor: theme.palette.tertiary?.main || theme.palette.primary.light, width: 40, height: 40 }}>C</Avatar>
                    <Avatar sx={{ bgcolor: theme.palette.secondary.light, width: 40, height: 40 }}>+15</Avatar>
                  </AvatarGroup>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, opacity: 0.8 }}>
                    Join 1500+ students already learning together
                  </Typography>
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

                {/* Floating Stats Card */}
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
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        background: "#4CAF50",
                        borderRadius: "50%"
                      }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                      Live Collaboration
                    </Typography>
                  </Box>

                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 1 }}>
                    {stdCountActive} students active now
                  </Typography>
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

      {/* Interactive Stats Section */}
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
                <Chip label="Seamless Sync" sx={{ background: "rgba(255,255,255,0.2)", color: "white" }} />
                <Chip label="Real-Time Collaboration" sx={{ background: "rgba(255,255,255,0.2)", color: "white" }} />
                <Chip label="Peer Powered" sx={{ background: "rgba(255,255,255,0.2)", color: "white" }} />
              </Box>
            </Box>

            {/* Right Section - Stats */}
            <Box sx={{ flex: 1, minWidth: { xs: "100%", md: "45%" }, display: "flex", flexDirection: "column", gap: 4}}>
              {[
                { value: `${animatedStats.users}+`, label: "Active Users", icon: <People /> },
                { value: `${animatedStats.feedback}+`, label: "Feedback Given", icon: <Message /> },
                { value: `${animatedStats.satisfaction}%`, label: "Satisfaction Rate", icon: <Favorite /> }
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
                      padding: 4,
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        background: "rgba(255, 255, 255, 0.15)",
                        transform: "translateX(10px)"
                      },
                      display: "flex",
                      alignItems: "center",
                      gap: 3
                    }}
                  >
                    <Box sx={{ fontSize: '2.5rem', color: 'white', opacity: 0.9 }}>
                      {stat.icon}
                    </Box>
                    <Box>
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 800,
                          color: "white",
                          mb: 0.5
                        }}
                      >
                        {stat.value}
                      </Typography>
                      <Typography sx={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>
                        {stat.label}
                      </Typography>
                    </Box>
                  </Paper>
                </motion.div>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ py: 15, background: theme.palette.background.default }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={8}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                color: theme.palette.primary.main,
                mb: 3
              }}
            >
              What Students Say
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: theme.palette.text.secondary,
                opacity: 0.8
              }}
            >
              Real stories from real students
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {testimonials.map((testimonial, idx) => (
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
                      <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2 }}>
                        {testimonial.avatar}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          {testimonial.role}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography sx={{ color: theme.palette.text.primary, lineHeight: 1.6, fontStyle: 'italic' }}>
                      "{testimonial.content}"
                    </Typography>
                    <Box sx={{ display: 'flex', mt: 2 }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} sx={{ color: '#ffb400', mr: 0.5, fontSize: '1.2rem' }} />
                      ))}
                    </Box>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
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
            Join thousands of students already accelerating their learning journey with PeerCheck. 
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
              Schedule Demo
            </Button>
          </Box>

          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, opacity: 0.7 }}>
            Free 14-day trial • No credit card required • Cancel anytime
          </Typography>
        </Container>
      </Box>

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
          </Box>
        </Container>
      </Box>
    </>
  );
}