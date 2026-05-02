import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  useTheme,
  InputAdornment,
  IconButton,
  Fade,
  LinearProgress
} from "@mui/material";
import { motion } from "framer-motion";
import { 
  LockReset, 
  Visibility, 
  VisibilityOff, 
  CheckCircle,
  ArrowBack,
  ErrorOutline,
  Timer,
  Lock,
  SecurityRounded
} from "@mui/icons-material";
import Navbar from "./Navbar";
import axiosClient from "@/api/axiosClient";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const [tokenError, setTokenError] = useState("");
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        if (!token) {
          setTokenError("No reset token found in URL");
          setTokenValid(false);
        }
        setVerifying(false);
      } catch (err) {
        setTokenError("Invalid or expired reset link");
        setTokenValid(false);
        setVerifying(false);
      }
    };

    verifyToken();
  }, [token]);

  useEffect(() => {
    let interval;
    if (success && redirectCountdown > 0) {
      interval = setInterval(() => {
        setRedirectCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [success, redirectCountdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    try {
      console.log("Resetting password with token:", token);
      const res = await axiosClient.post(`/auth/reset-password/${token}`, { password });
      setMessage(res.data.message);
      setSuccess(true);
      
      const interval = setInterval(() => {
        setRedirectCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            navigate("/login");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Something went wrong. Please try again.";
      setMessage(errorMsg);
      setError(errorMsg);
      console.error("Password reset error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const getPasswordStrength = (password) => {
    if (password.length === 0) return { strength: 0, color: theme.palette.grey[500], label: '' };
    if (password.length < 4) return { strength: 25, color: theme.palette.error.main, label: 'Weak' };
    if (password.length < 8) return { strength: 50, color: theme.palette.warning.main, label: 'Fair' };
    
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const score = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecial].filter(Boolean).length * 25;
    
    if (score === 25) return { strength: 50, color: theme.palette.warning.main, label: 'Fair' };
    if (score === 50) return { strength: 75, color: theme.palette.info.main, label: 'Good' };
    return { strength: 100, color: theme.palette.success.main, label: 'Strong' };
  };

  const passwordStrength = getPasswordStrength(password);

  if (verifying) {
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
              ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          }}
        >
          <Container maxWidth="sm">
            <Paper
              elevation={0}
              sx={{
                p: 5,
                borderRadius: 4,
                textAlign: 'center',
                background: `linear-gradient(135deg, 
                  ${alpha(theme.palette.background.paper, 0.95)} 0%, 
                  ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              }}
            >
              <CircularProgress size={60} sx={{ mb: 3, color: theme.palette.primary.main }} />
              <Typography variant="h6" sx={{ color: theme.palette.text.primary, mb: 1 }}>
                Verifying reset link...
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                Checking if your reset link is valid
              </Typography>
            </Paper>
          </Container>
        </Box>
      </>
    );
  }

  if (!tokenValid) {
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
              ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          }}
        >
          <Container maxWidth="sm">
            <Paper
              elevation={0}
              sx={{
                p: 5,
                borderRadius: 4,
                textAlign: 'center',
                background: `linear-gradient(135deg, 
                  ${alpha(theme.palette.background.paper, 0.95)} 0%, 
                  ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              }}
            >
              <ErrorOutline sx={{ fontSize: 60, color: theme.palette.error.main, mb: 3 }} />
              <Typography variant="h5" sx={{ color: theme.palette.error.main, mb: 2, fontWeight: 600 }}>
                Invalid Reset Link
              </Typography>
              <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 3 }}>
                {tokenError || "This password reset link is invalid or has expired."}
              </Typography>
              <Button
                onClick={handleBackToLogin}
                variant="contained"
                startIcon={<ArrowBack />}
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  '&:hover': {
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                  }
                }}
              >
                Back to Login
              </Button>
            </Paper>
          </Container>
        </Box>
      </>
    );
  }

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
                borderRadius: 4,
                mt: 10,
                mb: 4,
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
                  top: 0,
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
                    background: success 
                      ? `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.15)} 0%, ${alpha(theme.palette.success.main, 0.15)} 100%)`
                      : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.secondary.main, 0.15)} 100%)`,
                    border: `2px dashed ${success ? alpha(theme.palette.success.main, 0.3) : alpha(theme.palette.primary.main, 0.3)}`,
                  }}
                >
                  {success ? (
                    <CheckCircle sx={{ fontSize: 40, color: theme.palette.success.main }} />
                  ) : (
                    <LockReset sx={{ fontSize: 40, color: theme.palette.primary.main }} />
                  )}
                </Box>
                
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 700,
                    mb: 1,
                    background: success 
                      ? `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${alpha(theme.palette.success.main, 0.8)} 100%)`
                      : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontFamily: '"Alkatra", cursive',
                  }}
                >
                  {success ? 'Password Reset Successful!' : 'Create New Password'}
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
                  {success 
                    ? `You'll be redirected to login in ${redirectCountdown} seconds...` 
                    : 'Enter a secure new password for your account'
                  }
                </Typography>
              </Box>

              {success ? (
                <Fade in={success}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Alert 
                      severity="success" 
                      sx={{ 
                        mb: 3, 
                        borderRadius: 2,
                        background: alpha(theme.palette.success.main, 0.1),
                        border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                        '& .MuiAlert-icon': {
                          color: theme.palette.success.main,
                        }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircle />
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          Password has been reset successfully!
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        You can now log in with your new password.
                      </Typography>
                    </Alert>

                    <Box sx={{ mt: 3, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
                        <Timer sx={{ color: theme.palette.primary.main }} />
                        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                          Redirecting in {redirectCountdown} seconds...
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={((5 - redirectCountdown) / 5) * 100} 
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          mb: 3,
                          '& .MuiLinearProgress-bar': {
                            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          }
                        }}
                      />
                    </Box>

                    <Button
                      onClick={() => navigate("/login")}
                      variant="contained"
                      fullWidth
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 600,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                        '&:hover': {
                          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                        }
                      }}
                    >
                      Go to Login Now
                    </Button>
                  </Box>
                </Fade>
              ) : (
                <>
                  {error && (
                    <Fade in={!!error}>
                      <Alert 
                        severity="error" 
                        sx={{ 
                          mb: 3, 
                          borderRadius: 2,
                          background: alpha(theme.palette.error.main, 0.1),
                          border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                          '& .MuiAlert-icon': {
                            color: theme.palette.error.main,
                          }
                        }}
                      >
                        {error}
                      </Alert>
                    </Fade>
                  )}

                  {message && !error && (
                    <Fade in={!!message}>
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
                    </Fade>
                  )}

                  <form onSubmit={handleSubmit}>
                    <Box sx={{ mb: 3 }}>
                      <TextField
                        fullWidth
                        type={showPassword ? "text" : "password"}
                        label="New Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={togglePasswordVisibility}
                                edge="end"
                                sx={{
                                  color: theme.palette.text.secondary,
                                  '&:hover': {
                                    color: theme.palette.primary.main,
                                  }
                                }}
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
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
                      
                      {/* Password strength indicator */}
                      {password.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          transition={{ duration: 0.3 }}
                        >
                          <Box sx={{ mt: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                Password Strength
                              </Typography>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  fontWeight: 600, 
                                  color: passwordStrength.color,
                                }}
                              >
                                {passwordStrength.label}
                              </Typography>
                            </Box>
                            <Box 
                              sx={{ 
                                height: 4,
                                width: '100%',
                                backgroundColor: alpha(theme.palette.divider, 0.2),
                                borderRadius: 2,
                                overflow: 'hidden',
                              }}
                            >
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${passwordStrength.strength}%` }}
                                transition={{ duration: 0.5 }}
                                style={{
                                  height: '100%',
                                  backgroundColor: passwordStrength.color,
                                  borderRadius: 2,
                                }}
                              />
                            </Box>
                          </Box>
                        </motion.div>
                      )}
                    </Box>

                    <Box sx={{ mb: 4 }}>
                      <TextField
                        fullWidth
                        type={showConfirmPassword ? "text" : "password"}
                        label="Confirm New Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={loading}
                        error={password !== confirmPassword && confirmPassword.length > 0}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={toggleConfirmPasswordVisibility}
                                edge="end"
                                sx={{
                                  color: theme.palette.text.secondary,
                                  '&:hover': {
                                    color: theme.palette.primary.main,
                                  }
                                }}
                              >
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
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
                      
                      {/* Password match indicator */}
                      {password && confirmPassword && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                            {password === confirmPassword ? (
                              <>
                                <CheckCircle sx={{ color: theme.palette.success.main, fontSize: 16 }} />
                                <Typography variant="caption" sx={{ color: theme.palette.success.main }}>
                                  Passwords match
                                </Typography>
                              </>
                            ) : (
                              <Typography variant="caption" sx={{ color: theme.palette.error.main }}>
                                Passwords do not match
                              </Typography>
                            )}
                          </Box>
                        </motion.div>
                      )}
                    </Box>

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={loading || password !== confirmPassword || password.length < 8}
                      startIcon={loading && <CircularProgress size={20} />}
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 600,
                        fontSize: '1rem',
                        textTransform: 'none',
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                        boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                        },
                        '&:disabled': {
                          background: alpha(theme.palette.divider, 0.5),
                          color: theme.palette.text.disabled,
                          transform: 'none',
                          boxShadow: 'none',
                        },
                        transition: 'all 0.2s ease',
                        fontFamily: '"Adlam Display", serif',
                      }}
                    >
                      {loading ? 'Resetting Password...' : 'Reset Password'}
                    </Button>
                  </form>
                </>
              )}

              {!success && (
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Button
                    onClick={handleBackToLogin}
                    startIcon={<ArrowBack />}
                    disabled={loading}
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
              )}

              {!success && (
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
                     <SecurityRounded/> This reset link will expire after use.
                    <br />
                    <Lock/> Choose a strong password with at least 8 characters including letters, numbers, and symbols.
                  </Typography>
                </Box>
              )}
            </Paper>
          </motion.div>
        </Container>
      </Box>
    </>
  );
}