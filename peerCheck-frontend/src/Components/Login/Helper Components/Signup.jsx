import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormLabel,
  InputAdornment,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import {
  AlternateEmail,
  BadgeOutlined,
  CalendarMonth,
  LockOutlined,
  SchoolOutlined,
} from "@mui/icons-material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format } from "date-fns";
import axiosClient from "@/api/axiosClient";
import AuthShell from "../AuthShell";

const inputStyles = (theme) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 3,
    backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === "dark" ? 0.84 : 0.92),
    transition: "all 0.2s ease",
    "& fieldset": {
      borderColor: alpha(theme.palette.divider, 0.9),
    },
    "&:hover fieldset": {
      borderColor: alpha(theme.palette.primary.main, 0.45),
    },
    "&.Mui-focused fieldset": {
      borderColor: theme.palette.primary.main,
      borderWidth: 2,
    },
    "&.Mui-focused": {
      boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.12)}`,
    },
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: theme.palette.primary.main,
  },
  "& .MuiInputAdornment-root": {
    color: alpha(theme.palette.text.primary, 0.55),
  },
});

function calculateAge(birthDate) {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return age;
}

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    dob: "",
    password: "",
    role: "student",
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setFormData((current) => ({
      ...current,
      dob: date ? format(date, "yyyy-MM-dd") : "",
    }));
  };

  const handleSignup = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await axiosClient.post("/auth/register", formData);
      navigate("/login", {
        state: { successMessage: res.data.message || "Account created successfully" },
      });
    } catch (error) {
      setMessage(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="New account"
      title="Create a profile that can grow with your team."
      description="Set up your PeerCheck workspace to join projects, document contributions, and make peer review easier from day one."
      accent="amber"
      asideTitle="Why teams start here"
      asideBody="From classroom groups to project squads, PeerCheck gives every member a clearer place to contribute, reflect, and stay accountable."
      footerPrompt="Already have an account?"
      footerActionLabel="Go to login"
      footerActionTo="/login"
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          letterSpacing: "-0.03em",
          color: theme.palette.text.primary,
        }}
      >
        Sign up
      </Typography>

      <Typography sx={{ mt: 1, mb: 3, color: alpha(theme.palette.text.primary, 0.7), lineHeight: 1.7 }}>
        A few details and you'll be ready to join your workspace.
      </Typography>

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box component="form" onSubmit={handleSignup}>
          <Stack spacing={2}>
            <TextField
              label="Full name"
              name="name"
              fullWidth
              required
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
              sx={inputStyles(theme)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BadgeOutlined fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Username"
              name="username"
              fullWidth
              required
              value={formData.username}
              onChange={handleChange}
              autoComplete="username"
              sx={inputStyles(theme)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AlternateEmail fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Email address"
              name="email"
              type="email"
              fullWidth
              required
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              sx={inputStyles(theme)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SchoolOutlined fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <DatePicker
              label="Date of birth"
              value={selectedDate}
              onChange={handleDateChange}
              disableFuture
              slotProps={{
                textField: {
                  fullWidth: true,
                  required: true,
                  sx: inputStyles(theme),
                  InputProps: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarMonth fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                },
              }}
            />

            {selectedDate ? (
              <Typography sx={{ color: alpha(theme.palette.text.primary, 0.64), fontSize: "0.92rem", mt: -0.5 }}>
                Age: {calculateAge(selectedDate)} years old
              </Typography>
            ) : null}

            <TextField
              label="Password"
              name="password"
              type="password"
              fullWidth
              required
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              helperText="Use at least 8 characters for a stronger account."
              sx={inputStyles(theme)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl>
              <FormLabel
                sx={{
                  mb: 1,
                  fontWeight: 700,
                  color: theme.palette.text.primary,
                  "&.Mui-focused": {
                    color: theme.palette.primary.main,
                  },
                }}
              >
                I'm joining as
              </FormLabel>
              <RadioGroup row name="role" value={formData.role} onChange={handleChange}>
                <FormControlLabel
                  value="student"
                  control={<Radio />}
                  label="Student"
                  sx={{
                    mr: 3,
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 2,
                    bgcolor: formData.role === "student" ? alpha(theme.palette.primary.main, 0.1) : "transparent",
                  }}
                />
                <FormControlLabel
                  value="teacher"
                  control={<Radio />}
                  label="Teacher"
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 2,
                    bgcolor: formData.role === "teacher" ? alpha(theme.palette.primary.main, 0.1) : "transparent",
                  }}
                />
              </RadioGroup>
            </FormControl>
          </Stack>

          {message ? (
            <Alert severity="error" sx={{ mt: 2.5, borderRadius: 3 }}>
              {message}
            </Alert>
          ) : null}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              mt: 3,
              minHeight: 56,
            borderRadius: 3,
            textTransform: "none",
            fontSize: "1rem",
            fontWeight: 800,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            boxShadow: `0 18px 30px ${alpha(theme.palette.primary.main, 0.24)}`,
            "&:hover": {
              background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
            },
          }}
        >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Create account"}
          </Button>
        </Box>
      </LocalizationProvider>
    </AuthShell>
  );
}
