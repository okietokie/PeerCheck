import { useState } from "react";
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Alert,
  CircularProgress,
  alpha,
  useTheme
} from "@mui/material";
import { motion } from "framer-motion";
import EmailIcon from '@mui/icons-material/Email';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Navbar from "./Navbar";
import axiosClient from "@/api/axiosClient";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const theme = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    setMessage("");

    try {
      const res = await axiosClient.post("/auth/forgot-password", { identifier });
      console.log("response:", res);
      setMessage(res.data.message);
      setSuccess(res.data.message);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Something went wrong. Please try again.";
      setMessage(errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <>
      <Navbar />
      
      <Box
        sx={{
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, 
            ${alpha(theme.palette.primary.main, 0.05)} 0%, 
            ${alpha(theme.palette.secondary.main, 0.05)} 50%, 
            ${alpha(theme.palette.background.paper, 0.05)} 100%)`,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            background: `radial-gradient(circle at 20% 80%, 
              ${alpha(theme.palette.primary.main, 0.1)} 0%, 
              transparent 50%),
              radial-gradient(circle at 80% 20%, 
              ${alpha(theme.palette.secondary.main, 0.1)} 0%, 
              transparent 50%)`,
            zIndex: 0,
          }
        }}
      >
        <Container maxWidth="sm">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, sm: 5 },
                mt: 10,
                borderRadius: 4,
                background: `linear-gradient(135deg, 
                  ${alpha(theme.palette.background.paper, 0.95)} 0%, 
                  ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
                backdropFilter: 'blur(10px)',
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                boxShadow: `0 8px 32px ${alpha(theme.palette.mode === 'dark' ? '#000' : theme.palette.primary.main, 0.1)}`,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 10,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: `linear-gradient(90deg, 
                    ${theme.palette.primary.main} 0%, 
                    ${theme.palette.secondary.main} 100%)`,
                  borderRadius: '16px 16px 0 0',
                }
              }}
            >
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    background: `linear-gradient(135deg, 
                      ${alpha(theme.palette.primary.main, 0.15)} 0%, 
                      ${alpha(theme.palette.secondary.main, 0.15)} 100%)`,
                    border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                  }}
                >
                  <EmailIcon 
                    sx={{ 
                      fontSize: 40,
                      color: theme.palette.primary.main,
                    }} 
                  />
                </Box>
                
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700,
                    mb: 1,
                    background: `linear-gradient(135deg, 
                      ${theme.palette.primary.main} 0%, 
                      ${theme.palette.secondary.main} 100%)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontFamily: '"Alkatra", cursive',
                  }}
                >
                  Forgot Your Password?
                </Typography>
                
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: theme.palette.text.secondary,
                    mb: 3,
                    maxWidth: '80%',
                    margin: '0 auto',
                    fontFamily: '"Inter", sans-serif',
                  }}
                >
                  Enter your email address or username and we'll send the reset link to the email on that account.
                </Typography>
              </Box>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 3, 
                      borderRadius: 2,
                      background: alpha(theme.palette.error.main, 0.1),
                      border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                      color: theme.palette.error.main,
                      '& .MuiAlert-icon': {
                        color: theme.palette.error.main,
                      }
                    }}
                  >
                    {error}
                  </Alert>
                </motion.div>
              )}

              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Alert 
                    severity="success" 
                    sx={{ 
                      mb: 3, 
                      borderRadius: 2,
                      background: alpha(theme.palette.success.main, 0.1),
                      border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                      color: theme.palette.success.main,
                      '& .MuiAlert-icon': {
                        color: theme.palette.success.main,
                      }
                    }}
                  >
                    {success}
                  </Alert>
                </motion.div>
              )}

              {message && !error && !success && (
                <Alert 
                  severity="info" 
                  sx={{ 
                    mb: 3, 
                    borderRadius: 2,
                    background: alpha(theme.palette.info.main, 0.1),
                    border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                  }}
                >
                  {message}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    type="text"
                    label="Email Address or Username"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    disabled={loading}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <EmailIcon 
                          sx={{ 
                            mr: 1, 
                            color: theme.palette.primary.main,
                            opacity: 0.7 
                          }} 
                        />
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.background.paper, 0.5),
                        '&:hover': {
                          '& fieldset': {
                            borderColor: alpha(theme.palette.primary.main, 0.5),
                          }
                        },
                        '&.Mui-focused': {
                          '& fieldset': {
                            borderColor: theme.palette.primary.main,
                            borderWidth: 2,
                          }
                        }
                      },
                      '& .MuiInputLabel-root': {
                        fontFamily: '"Inter", sans-serif',
                      }
                    }}
                  />
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: '1rem',
                    textTransform: 'none',
                    background: `linear-gradient(135deg, 
                      ${theme.palette.primary.main} 0%, 
                      ${theme.palette.secondary.main} 100%)`,
                    boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                      background: `linear-gradient(135deg, 
                        ${theme.palette.primary.dark} 0%, 
                        ${theme.palette.secondary.dark} 100%)`,
                    },
                    '&:disabled': {
                      background: alpha(theme.palette.divider, 0.5),
                      color: theme.palette.text.disabled,
                    },
                    transition: 'all 0.2s ease',
                    fontFamily: '"Adlam Display", serif',
                  }}
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button
                  onClick={handleBackToLogin}
                  startIcon={<ArrowBackIcon />}
                  sx={{
                    color: theme.palette.text.secondary,
                    fontWeight: 500,
                    textTransform: 'none',
                    '&:hover': {
                      color: theme.palette.primary.main,
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    },
                    fontFamily: '"Inter", sans-serif',
                  }}
                >
                  Back to Login
                </Button>
              </Box>

              <Box sx={{ mt: 4, pt: 3, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: alpha(theme.palette.text.secondary, 0.7),
                    textAlign: 'center',
                    display: 'block',
                    fontFamily: '"Inter", sans-serif',
                  }}
                >
                  Note: The reset link will expire in 1 hour.
                  <br />
                  Check your spam folder if you don't see the email.
                </Typography>
              </Box>
            </Paper>
          </motion.div>
        </Container>
      </Box>
    </>
  );
}
