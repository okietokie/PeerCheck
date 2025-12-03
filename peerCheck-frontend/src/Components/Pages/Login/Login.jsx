import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Box,
  useTheme,
  alpha,
} from "@mui/material";
import { motion } from "framer-motion";
import Navbar from "./Navbar";
import axiosClient from "@/api/axiosClient";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosClient.post("/auth/login", formData);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      setMessage(res.data.message);
      setLoading(false);

      if (res.data.role === "admin") {
        navigate("/admin-page");
      } else {
        navigate("/user-app");
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed");
      setLoading(false);
      
    }
  };

  return (
    <>
      <Navbar />
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.primary.main, 0.1)} 0%, 
            ${alpha(theme.palette.secondary.main, 0.1)} 50%, 
            ${alpha(theme.palette.tertiary?.main || theme.palette.primary.light, 0.1)} 100%)`,
          px: 2,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at 20% 80%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, ${alpha(theme.palette.secondary.main, 0.05)} 0%, transparent 50%),
                        radial-gradient(circle at 40% 40%, ${alpha(theme.palette.tertiary?.main || theme.palette.secondary.light, 0.03)} 0%, transparent 50%)`,
            pointerEvents: 'none',
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 25, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ width: "100%", maxWidth: 420 }}
        >
          <Card
            elevation={theme.palette.mode === 'dark' ? 16 : 8}
            sx={{
              borderRadius: 4,
              p: 3,
              background: theme.palette.mode === 'dark' 
                ? `linear-gradient(135deg, 
                    ${alpha(theme.palette.background.paper, 0.95)} 0%, 
                    ${alpha(theme.palette.background.default, 0.98)} 100%)`
                : `linear-gradient(135deg, 
                    ${alpha(theme.palette.background.paper, 0.95)} 0%, 
                    ${alpha('#ffffff', 0.98)} 100%)`,
              backdropFilter: 'blur(20px)',
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, 
                  ${theme.palette.primary.main} 0%, 
                  ${theme.palette.secondary.main} 50%, 
                  ${theme.palette.tertiary?.main || theme.palette.primary.light} 100%)`,
                borderRadius: '4px 4px 0 0',
              }
            }}
          >
            <CardContent sx={{ position: 'relative', zIndex: 1 }}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Typography
                  variant="h4"
                  fontWeight="bold"
                  color="text.primary"
                  textAlign="center"
                  gutterBottom
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1
                  }}
                >
                  Welcome Back!
                </Typography>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <Typography
                  variant="subtitle1"
                  color="text.secondary"
                  textAlign="center"
                  sx={{ mb: 3 }}
                >
                  Sign in to continue your learning journey
                </Typography>
              </motion.div>

              <form onSubmit={handleLogin}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <TextField
                    label="Email Address"
                    name="email"
                    type="email"
                    fullWidth
                    required
                    margin="normal"
                    value={formData.email}
                    onChange={handleChange}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                        },
                        '&.Mui-focused': {
                          boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.3)}`,
                        }
                      }
                    }}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  <TextField
                    label="Password"
                    name="password"
                    type="password"
                    fullWidth
                    required
                    margin="normal"
                    value={formData.password}
                    onChange={handleChange}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                        },
                        '&.Mui-focused': {
                          boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.3)}`,
                        }
                      }
                    }}
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{
                      mt: 3,
                      py: 1.5,
                      fontWeight: "bold",
                      borderRadius: 2,
                      textTransform: "none",
                      fontSize: '1rem',
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.3)}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                      },
                      '&:active': {
                        transform: 'translateY(0)',
                      }
                    }}
                    disabled={loading}
                  >
                    {loading ? (
                      <CircularProgress 
                        size={24} 
                        color="inherit" 
                        sx={{ 
                          color: theme.palette.primary.contrastText 
                        }} 
                      />
                    ) : (
                      "Login"
                    )}
                  </Button>
                </motion.div>
              </form>

              {message && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Typography
                    variant="body2"
                    color="error"
                    textAlign="center"
                    sx={{ 
                      mt: 2,
                      p: 1.5,
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.error.main, 0.1),
                      border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                    }}
                  >
                    {message}
                  </Typography>
                </motion.div>
              )}
            </CardContent>

            <CardActions
              sx={{
                flexDirection: "column",
                alignItems: "center",
                mt: 1,
                gap: 1,
                position: 'relative',
                zIndex: 1,
              }}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                style={{ width: '100%', textAlign: 'center' }}
              >
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{" "}
                  <Link
                    to="/sign-up"
                    style={{
                      color: theme.palette.primary.main,
                      fontWeight: "bold",
                      textDecoration: "none",
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.textShadow = `0 0 8px ${alpha(theme.palette.primary.main, 0.5)}`;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.textShadow = 'none';
                    }}
                  >
                    Sign up →
                  </Link>
                </Typography>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.5 }}
                style={{ width: '100%', textAlign: 'center' }}
              >
                <Typography variant="body2" color="text.secondary">
                  <Link
                    to="/forgot-password"
                    style={{
                      color: theme.palette.secondary.main,
                      fontWeight: "bold",
                      textDecoration: "none",
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.textShadow = `0 0 8px ${alpha(theme.palette.secondary.main, 0.5)}`;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.textShadow = 'none';
                    }}
                  >
                    Forgot Password?
                  </Link>
                </Typography>
              </motion.div>
            </CardActions>
          </Card>
        </motion.div>
      </Box>
    </>
  );
}