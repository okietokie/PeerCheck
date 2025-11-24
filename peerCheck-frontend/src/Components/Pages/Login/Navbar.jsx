import { useState } from "react";
import { HashLink as Link } from "react-router-hash-link";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  Box,
  useTheme,
  useMediaQuery,
  alpha,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const navItems = [
    { label: "Home", link: "#top" },
  ];

  const drawerContent = (
    <Box 
      sx={{ 
        width: 280, 
        height: "100%",
        background: theme.palette.mode === 'dark' 
          ? `linear-gradient(135deg, 
              ${alpha(theme.palette.background.paper, 0.98)} 0%, 
              ${alpha(theme.palette.background.default, 0.95)} 100%)`
          : `linear-gradient(135deg, 
              ${alpha(theme.palette.background.paper, 0.98)} 0%, 
              ${alpha('#ffffff', 0.95)} 100%)`,
        backdropFilter: 'blur(20px)',
        borderLeft: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Drawer Header */}
      <Box sx={{ p: 3, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography 
            variant="h6" 
            fontWeight="bold"
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Menu
          </Typography>
          <IconButton 
            onClick={() => setOpen(false)} 
            sx={{ 
              color: theme.palette.text.primary,
              backgroundColor: alpha(theme.palette.action.hover, 0.5),
              '&:hover': {
                backgroundColor: alpha(theme.palette.action.selected, 0.8),
                transform: 'rotate(90deg)',
                transition: 'transform 0.3s ease'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Navigation Items */}
      <Box sx={{ flex: 1, p: 3 }}>
        <List sx={{ mb: 2 }}>
          {navItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ListItemButton
                component={Link}
                to={item.link}
                smooth
                onClick={() => setOpen(false)}
                sx={{
                  color: theme.palette.text.primary,
                  fontWeight: 600,
                  mb: 1,
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.main,
                    transform: 'translateX(8px)',
                  },
                }}
              >
                {item.label}
              </ListItemButton>
            </motion.div>
          ))}
        </List>

        {/* Auth Buttons */}
        <Box sx={{ mt: 'auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              variant="outlined"
              fullWidth
              component={Link}
              to="/login"
              onClick={() => setOpen(false)}
              sx={{
                mt: 2,
                py: 1.5,
                borderColor: alpha(theme.palette.primary.main, 0.5),
                color: theme.palette.primary.main,
                fontWeight: 600,
                borderRadius: 2,
                textTransform: 'none',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  borderColor: theme.palette.primary.main,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                },
              }}
            >
              Log In
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              variant="contained"
              fullWidth
              component={Link}
              to="/sign-up"
              onClick={() => setOpen(false)}
              sx={{
                mt: 1,
                py: 1.5,
                fontWeight: 600,
                borderRadius: 2,
                textTransform: 'none',
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.3)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                },
              }}
            >
              Sign Up
            </Button>
          </motion.div>
        </Box>
      </Box>
    </Box>
  );

  return (
    <AppBar
      position="fixed"
      sx={{
        background: theme.palette.mode === 'dark' 
          ? `linear-gradient(135deg, 
              ${alpha(theme.palette.background.paper, 0.95)} 0%, 
              ${alpha(theme.palette.background.default, 0.98)} 100%)`
          : `linear-gradient(135deg, 
              ${alpha(theme.palette.background.paper, 0.95)} 0%, 
              ${alpha('#ffffff', 0.98)} 100%)`,
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        boxShadow: `0 2px 20px ${alpha(theme.palette.mode === 'dark' ? '#000000' : theme.palette.primary.main, 0.1)}`,
        color: theme.palette.text.primary,
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", py: 1 }}>
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Typography
            variant="h5"
            fontWeight="bold"
            component={Link}
            to="/"
            sx={{ 
              textDecoration: "none",
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              transition: 'all 0.3s ease',
              '&:hover': {
                textShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.5)}`,
              }
            }}
          >
            PeerCheck
          </Typography>
        </motion.div>

        {/* Desktop Menu */}
        {!isMobile && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {navItems.map((item) => (
              <motion.div
                key={item.label}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  component={Link}
                  to={item.link}
                  smooth
                  sx={{
                    color: theme.palette.text.primary,
                    fontWeight: 600,
                    textTransform: "none",
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      color: theme.palette.primary.main,
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  {item.label}
                </Button>
              </motion.div>
            ))}
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outlined"
                component={Link}
                to="/login"
                sx={{
                  borderColor: alpha(theme.palette.primary.main, 0.5),
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: 2,
                  px: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    borderColor: theme.palette.primary.main,
                    transform: 'translateY(-2px)',
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                  },
                }}
              >
                Log In
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="contained"
                component={Link}
                to="/sign-up"
                sx={{
                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: 2,
                  px: 3,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.3)}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                  },
                }}
              >
                Sign Up
              </Button>
            </motion.div>
          </Box>
        )}

        {/* Mobile Hamburger */}
        {isMobile && (
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <IconButton 
              edge="end" 
              onClick={() => setOpen(true)} 
              sx={{ 
                color: theme.palette.text.primary,
                backgroundColor: alpha(theme.palette.action.hover, 0.5),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.action.selected, 0.8),
                }
              }}
            >
              <MenuIcon />
            </IconButton>
          </motion.div>
        )}
      </Toolbar>

      {/* Mobile Drawer */}
      <Drawer 
        anchor="right" 
        open={open} 
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: {
            backgroundColor: 'transparent',
            boxShadow: 'none',
          }
        }}
      >
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              {drawerContent}
            </motion.div>
          )}
        </AnimatePresence>
      </Drawer>
    </AppBar>
  );
}