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
  Tooltip,
  IconButton,
} from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./Navbar";
import { PersonAdd, ArrowForward, CalendarToday, School, Person, Cake, Event } from "@mui/icons-material";
import axiosClient from "@/api/axiosClient";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format } from "date-fns";

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
  const [selectedDate, setSelectedDate] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();

  function calculateAge(birthDate) {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setFormData({ ...formData, dob: date ? format(date, 'yyyy-MM-dd') : '' });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log("formdata: ", formData);
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
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <form onSubmit={handleSignup}>
        {fields.map((field, idx) => (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + (idx * 0.1), duration: 0.5 }}
          >
            {field.type === 'date' ? (
              <Box sx={{ mt: 2, mb: 1 }}>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    mb: 0.5,
                    ml: 0.5,
                    color: theme.palette.text.secondary,
                    fontWeight: 500,
                    fontFamily: '"Inter", sans-serif',
                  }}
                >
                  {field.label}
                </Typography>
                <DatePicker
                  value={selectedDate}
                  onChange={handleDateChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      placeholder="Select your birth date"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          backgroundColor: alpha(theme.palette.background.paper, 0.6),
                          border: `2px solid ${alpha(theme.palette.divider, 0.2)}`,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: alpha(theme.palette.primary.main, 0.5),
                            backgroundColor: alpha(theme.palette.primary.main, 0.03),
                            boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}`,
                          },
                          '&.Mui-focused': {
                            borderColor: theme.palette.primary.main,
                            backgroundColor: alpha(theme.palette.primary.main, 0.05),
                            boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.15)}`,
                          }
                        },
                        '& .MuiInputAdornment-root': {
                          marginRight: 1,
                        }
                      }}
                    />
                  )}
                  components={{
                    OpenPickerIcon: CalendarToday
                  }}
                  PopperProps={{
                    sx: {
                      '& .MuiPaper-root': {
                        borderRadius: 3,
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                        boxShadow: `0 8px 32px ${alpha(theme.palette.mode === 'dark' ? '#000' : theme.palette.primary.main, 0.15)}`,
                        '& .MuiPickersDay-root': {
                          borderRadius: 2,
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          },
                          '&.Mui-selected': {
                            backgroundColor: theme.palette.primary.main,
                            color: theme.palette.primary.contrastText,
                            '&:hover': {
                              backgroundColor: theme.palette.primary.dark,
                            }
                          }
                        }
                      }
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <Box sx={{ 
                        mr: 1.5, 
                        display: 'flex', 
                        alignItems: 'center',
                        color: theme.palette.primary.main,
                      }}>
                        {field.icon}
                      </Box>
                    ),
                  }}
                />
                
                {/* Selected date preview */}
                <AnimatePresence>
                  {selectedDate && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Box
                        sx={{
                          mt: 1.5,
                          p: 1.5,
                          borderRadius: 2,
                          backgroundColor: alpha(theme.palette.success.main, 0.08),
                          border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      > 
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Event sx={{ color: theme.palette.success.main, fontSize: 16 }} />
                          <Typography variant="body2" sx={{ color: theme.palette.text.primary, fontWeight: 500 }}>
                            Selected: {format(selectedDate, 'MMMM dd, yyyy')}
                          </Typography>
                        </Box>
                        <Tooltip title="Clear date">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedDate(null);
                              setFormData({ ...formData, dateOfBirth: '' });
                            }}
                            sx={{
                              color: theme.palette.text.secondary,
                              '&:hover': {
                                color: theme.palette.error.main,
                                backgroundColor: alpha(theme.palette.error.main, 0.1),
                              }
                            }}
                          >
                            <Typography variant="caption">Clear</Typography>
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Age indicator */}
                {selectedDate && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Cake sx={{ color: theme.palette.secondary.main, fontSize: 14 }} />
                      <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                        {calculateAge(selectedDate)} years old
                      </Typography>
                    </Box>
                  </motion.div>
                )}
              </Box>
            ) : (
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
                InputProps={{
                  startAdornment: (
                    <Box sx={{ 
                      mr: 1.5, 
                      display: 'flex', 
                      alignItems: 'center',
                      color: theme.palette.primary.main,
                    }}>
                      {field.icon}
                    </Box>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: alpha(theme.palette.background.paper, 0.6),
                    border: `2px solid ${alpha(theme.palette.divider, 0.2)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: alpha(theme.palette.primary.main, 0.5),
                      backgroundColor: alpha(theme.palette.primary.main, 0.03),
                      boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}`,
                    },
                    '&.Mui-focused': {
                      borderColor: theme.palette.primary.main,
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.15)}`,
                    }
                  },
                  '& .MuiInputLabel-root': {
                    color: theme.palette.text.secondary,
                    fontFamily: '"Inter", sans-serif',
                    '&.Mui-focused': {
                      color: theme.palette.primary.main,
                    }
                  },
                  '& .MuiOutlinedInput-input': {
                    fontFamily: '"Inter", sans-serif',
                  }
                }}
              />
            )}
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <FormControl component="fieldset" sx={{ mt: 3 }}>
            <FormLabel 
              component="legend"
              sx={{ 
                color: theme.palette.text.primary,
                fontWeight: 600,
                fontFamily: '"Inter", sans-serif',
                mb: 1.5,
              }}
            >
              Account Type
            </FormLabel>
            <RadioGroup
              row
              name="role"
              value={formData.role}
              onChange={handleChange}
              sx={{ 
                gap: 2,
                '& .MuiFormControlLabel-root': {
                  margin: 0,
                }
              }}
            >
              <FormControlLabel
                value="student"
                control={
                  <Radio
                    sx={{
                      color: theme.palette.primary.main,
                      '&.Mui-checked': {
                        color: theme.palette.primary.main,
                      },
                      '& .MuiSvgIcon-root': {
                        fontSize: 24,
                      }
                    }}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <School sx={{ fontSize: 18, color: theme.palette.primary.main }} />
                    <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 500 }}>
                      Student
                    </Typography>
                  </Box>
                }
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `2px solid ${alpha(theme.palette.divider, 0.2)}`,
                  backgroundColor: formData.role === 'student' 
                    ? alpha(theme.palette.primary.main, 0.1)
                    : 'transparent',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  }
                }}
              />
              <FormControlLabel
                value="teacher"
                control={
                  <Radio
                    sx={{
                      color: theme.palette.secondary.main,
                      '&.Mui-checked': {
                        color: theme.palette.secondary.main,
                      },
                      '& .MuiSvgIcon-root': {
                        fontSize: 24,
                      }
                    }}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Person sx={{ fontSize: 18, color: theme.palette.secondary.main }} />
                    <Typography sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 500 }}>
                      Teacher
                    </Typography>
                  </Box>
                }
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `2px solid ${alpha(theme.palette.divider, 0.2)}`,
                  backgroundColor: formData.role === 'teacher' 
                    ? alpha(theme.palette.secondary.main, 0.1)
                    : 'transparent',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: theme.palette.secondary.main,
                    backgroundColor: alpha(theme.palette.secondary.main, 0.05),
                  }
                }}
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
              mt: 4,
              py: 1.8,
              fontWeight: 700,
              borderRadius: 3,
              textTransform: "none",
              fontSize: '1.1rem',
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.4)}`,
                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
              },
              '&:active': {
                transform: 'translateY(0)',
              },
              '&:disabled': {
                background: alpha(theme.palette.divider, 0.5),
                color: theme.palette.text.disabled,
                transform: 'none',
                boxShadow: 'none',
              },
              fontFamily: '"Adlam Display", serif',
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
    </LocalizationProvider>



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