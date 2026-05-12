import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import {
  ArrowOutward,
  Insights,
  PeopleAlt,
  TaskAlt,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import Navbar from "./Helper Components/Navbar";

const highlights = [
  {
    icon: <PeopleAlt sx={{ fontSize: 18 }} />,
    title: "Structured team coordination",
    description: "Keep roles, feedback, and progress aligned in one shared workflow.",
  },
  {
    icon: <TaskAlt sx={{ fontSize: 18 }} />,
    title: "Visible contribution records",
    description: "Track deliverables, proof of work, and ownership without losing context.",
  },
  {
    icon: <Insights sx={{ fontSize: 18 }} />,
    title: "Fairer evaluation signals",
    description: "Turn activity, proof, and peer input into clearer review conversations.",
  },
];

function AuthShell({
  eyebrow,
  title,
  description,
  accent,
  asideTitle,
  asideBody,
  footerPrompt,
  footerActionLabel,
  footerActionTo,
  children,
}) {
  const theme = useTheme();
  const primaryAccent = theme.palette.primary.main;
  const secondaryAccent = theme.palette.secondary.main;
  const panelTint = theme.palette.background.paper;
  const surfaceTint =
    theme.palette.mode === "dark"
      ? alpha(theme.palette.background.paper, 0.86)
      : alpha("#FFFFFF", 0.88);
  const shellBackground =
    theme.palette.mode === "dark"
      ? `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.98)} 0%, ${alpha(
          theme.palette.background.paper,
          0.94
        )} 48%, ${alpha(primaryAccent, 0.12)} 100%)`
      : `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.98)} 0%, ${alpha(
          theme.palette.background.paper,
          0.96
        )} 45%, ${alpha(primaryAccent, 0.08)} 100%)`;

  return (
    <>
      <Navbar />
      <Box
        sx={{
          minHeight: "100vh",
          pt: { xs: 12, md: 14 },
          pb: { xs: 5, md: 8 },
          position: "relative",
          overflow: "hidden",
          background: shellBackground,
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background: `
              radial-gradient(circle at 12% 18%, ${alpha(primaryAccent, 0.16)} 0, transparent 28%),
              radial-gradient(circle at 88% 20%, ${alpha(secondaryAccent, 0.14)} 0, transparent 26%),
              radial-gradient(circle at 50% 86%, ${alpha(theme.palette.primary.light, 0.12)} 0, transparent 24%)
            `,
            pointerEvents: "none",
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Paper
            elevation={0}
            sx={{
              overflow: "hidden",
              borderRadius: { xs: 4, md: 6 },
              border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              boxShadow: `0 28px 80px ${alpha(
                theme.palette.mode === "dark" ? "#000000" : theme.palette.primary.main,
                theme.palette.mode === "dark" ? 0.34 : 0.14
              )}`,
              backgroundColor: surfaceTint,
              backdropFilter: "blur(18px)",
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1.05fr 0.95fr" },
                minHeight: { md: 760 },
              }}
            >
              <Box
                component={motion.section}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55, ease: "easeOut" }}
                sx={{
                  p: { xs: 3, sm: 4, md: 6 },
                  background: `linear-gradient(160deg, ${alpha(theme.palette.background.default, 0.96)} 0%, ${alpha(
                    panelTint,
                    0.92
                  )} 100%)`,
                  borderRight: { md: `1px solid ${alpha(theme.palette.divider, 0.45)}` },
                }}
              >
                <Chip
                  label={eyebrow}
                  sx={{
                    mb: 2.5,
                    bgcolor: alpha(primaryAccent, 0.1),
                    color: primaryAccent,
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                />

                <Typography
                  variant="h2"
                  sx={{
                    fontSize: { xs: "2.5rem", md: "3.6rem" },
                    lineHeight: 0.98,
                    fontWeight: 800,
                    letterSpacing: "-0.04em",
                    color: theme.palette.text.primary,
                    maxWidth: 540,
                  }}
                >
                  {title}
                </Typography>

                <Typography
                  variant="body1"
                  sx={{
                    mt: 2.5,
                    maxWidth: 500,
                    fontSize: "1.05rem",
                    lineHeight: 1.7,
                    color: alpha(theme.palette.text.primary, 0.78),
                  }}
                >
                  {description}
                </Typography>

                <Stack spacing={2} sx={{ mt: 4 }}>
                  {highlights.map((item) => (
                    <Box
                      key={item.title}
                      sx={{
                        display: "flex",
                        gap: 1.75,
                        p: 2,
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === "dark" ? 0.72 : 0.7),
                        border: `1px solid ${alpha(primaryAccent, 0.12)}`,
                      }}
                    >
                      <Box
                        sx={{
                          width: 42,
                          height: 42,
                          borderRadius: 2.5,
                          display: "grid",
                          placeItems: "center",
                          bgcolor: alpha(primaryAccent, 0.12),
                          color: primaryAccent,
                          flexShrink: 0,
                        }}
                      >
                        {item.icon}
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 700, color: theme.palette.text.primary, mb: 0.4 }}>
                          {item.title}
                        </Typography>
                        <Typography sx={{ color: alpha(theme.palette.text.primary, 0.72), lineHeight: 1.6 }}>
                          {item.description}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>

                <Box
                  sx={{
                    mt: 4,
                    p: 2.5,
                    borderRadius: 4,
                    background: `linear-gradient(135deg, ${alpha(primaryAccent, 0.9)} 0%, ${alpha(
                      secondaryAccent,
                      0.94
                    )} 100%)`,
                    color: "#FFF",
                  }}
                >
                  <Typography variant="overline" sx={{ letterSpacing: "0.12em", opacity: 0.88 }}>
                    {asideTitle}
                  </Typography>
                  <Typography sx={{ mt: 0.8, lineHeight: 1.7, maxWidth: 460 }}>
                    {asideBody}
                  </Typography>
                </Box>
              </Box>

              <Box
                component={motion.section}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.55, ease: "easeOut", delay: 0.08 }}
                sx={{
                  p: { xs: 3, sm: 4, md: 6 },
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: alpha(
                    theme.palette.background.paper,
                    theme.palette.mode === "dark" ? 0.48 : 0.72
                  ),
                }}
              >
                <Box sx={{ width: "100%", maxWidth: 460 }}>
                  {children}

                  <Box
                    sx={{
                      mt: 3,
                      pt: 2.5,
                      borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1.25,
                    }}
                    >
                    <Typography sx={{ color: alpha(theme.palette.text.primary, 0.72) }}>
                      {footerPrompt}
                    </Typography>
                    <Button
                      component={RouterLink}
                      to={footerActionTo}
                      endIcon={<ArrowOutward />}
                      sx={{
                        color: primaryAccent,
                        fontWeight: 700,
                        textTransform: "none",
                        "&:hover": {
                          backgroundColor: alpha(primaryAccent, 0.08),
                        },
                      }}
                    >
                      {footerActionLabel}
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>
    </>
  );
}

export default AuthShell;
