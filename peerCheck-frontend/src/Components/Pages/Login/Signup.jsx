import { useState } from "react";
import axios from "axios";
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
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  FormControlLabel,
} from "@mui/material";
import { motion } from "framer-motion";
import Navbar from "./Navbar";
import { PersonAdd, ArrowForward } from "@mui/icons-material";
import axiosClient from "@/api/axiosClient";

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    dob: "",
    password: "",
    role: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosClient.post(
        "/auth/register",
        formData
      );
      setMessage(res.data.message);
      navigate("/login");
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { id: "name", label: "Full Name", type: "text", placeholder: "Enter your full name" },
    { id: "username", label: "Username", type: "text", placeholder: "Choose your username" },
    { id: "email", label: "Email Address", type: "email", placeholder: "you@example.com" },
    { id: "dob", label: "Date of Birth", type: "date", placeholder: "" },
    { id: "password", label: "Password", type: "password", placeholder: "Create a strong password" },
  ];

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
          pt: 10,
          pb: 2,
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
          style={{ width: "100%", maxWidth: 440 }}
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
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <PersonAdd 
                    sx={{ 
                      fontSize: '2.5rem', 
                      color: theme.palette.primary.main,
                      mr: 1 
                    }} 
                  />
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    textAlign="center"
                    gutterBottom
                    sx={{
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Create Account
                  </Typography>
                </Box>
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
                  Join PeerCheck and start growing together!
                </Typography>
              </motion.div>

              <form onSubmit={handleSignup}>
                {fields.map((field, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + (idx * 0.1), duration: 0.5 }}
                  >
                    <TextField
                      label={field.label}
                      name={field.id}
                      type={field.type}
                      placeholder={field.placeholder}
                      fullWidth
                      required
                      margin="normal"
                      value={formData[field.id]}
                      onChange={handleChange}
                      InputLabelProps={{
                        shrink: field.type === 'date' ? true : undefined,
                      }}
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
                        },
                        '& .MuiInputLabel-root': {
                          color: theme.palette.text.secondary,
                        }
                      }}
                    />                    
                  </motion.div>
                ))}
                                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8, duration: 0.5 }}
                    >
                      <FormControl component="fieldset" sx={{ mt: 2 }}>
                        <FormLabel component="legend">Account Type</FormLabel>
                        <RadioGroup
                          row
                          name="role"
                          value={formData.role}
                          onChange={handleChange}
                          sx={{ mt: 1 }}
                        >
                          <FormControlLabel
                            value="student"
                            control={<Radio />}
                            label="Student"
                          />
                          <FormControlLabel
                            value="teacher"
                            control={<Radio />}
                            label="Teacher"
                          />
                        </RadioGroup>
                      </FormControl>
                    </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                >
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    endIcon={!loading && <ArrowForward />}
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
                        sx={{ 
                          color: theme.palette.primary.contrastText 
                        }} 
                      />
                    ) : (
                      "Create Account"
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
                transition={{ delay: 1.0, duration: 0.5 }}
                style={{ width: '100%', textAlign: 'center' }}
              >
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{" "}
                  <Link
                    to="/login"
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
                    Login <ArrowForward sx={{ fontSize: '1rem', verticalAlign: 'middle' }} />
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