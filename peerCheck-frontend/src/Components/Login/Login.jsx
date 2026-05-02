import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import {
  EmailOutlined,
  LockOutlined,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import axiosClient from "@/api/axiosClient";
import AuthShell from "./AuthShell";

const fieldStyles = (theme) => ({
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

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [messageSeverity, setMessageSeverity] = useState("error");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  useEffect(() => {
    if (location.state?.successMessage) {
      setMessage(location.state.successMessage);
      setMessageSeverity("success");
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setMessageSeverity("error");

    try {
      const res = await axiosClient.post("/auth/login", formData);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      if (res.data.role === "admin") {
        navigate("/admin-page");
      } else if (res.data?.role === "teacher") {
        navigate("/teacher-app");
      } else {
        navigate("/user-app");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed");
      setMessageSeverity("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Step back into your team workspace."
      description="Sign in to check project progress, track peer activity, and keep feedback moving without friction."
      accent="emerald"
      asideTitle="Built for active collaboration"
      asideBody="PeerCheck keeps accountability, evidence, and peer reviews in the same loop so your team can focus on the work instead of the chase."
      footerPrompt="Need a PeerCheck account?"
      footerActionLabel="Create one"
      footerActionTo="/sign-up"
    >
      <Typography
        variant="h4"
        sx={{
          fontWeight: 800,
          letterSpacing: "-0.03em",
          color: theme.palette.text.primary,
        }}
      >
        Log in
      </Typography>

      <Typography sx={{ mt: 1, mb: 3, color: alpha(theme.palette.text.primary, 0.7), lineHeight: 1.7 }}>
        Use your email and password to continue where you left off.
      </Typography>

      <Box component="form" onSubmit={handleLogin}>
        <Stack spacing={2}>
          <TextField
            label="Email address"
            name="email"
            type="email"
            fullWidth
            required
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            sx={fieldStyles(theme)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlined fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            fullWidth
            required
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
            sx={fieldStyles(theme)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockOutlined fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    edge="end"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Stack>

        <Box
          sx={{
            mt: 1.5,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button
            component={Link}
            to="/forgot-password"
            sx={{
              color: theme.palette.primary.main,
              fontWeight: 700,
              textTransform: "none",
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
              },
            }}
          >
            Forgot password?
          </Button>
        </Box>

        {message ? (
          <Alert severity={messageSeverity} sx={{ mt: 2, borderRadius: 3 }}>
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
          {loading ? <CircularProgress size={24} color="inherit" /> : "Enter PeerCheck"}
        </Button>
      </Box>
    </AuthShell>
  );
}
