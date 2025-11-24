import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  IconButton,
  CssBaseline,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  Paper,
  alpha
} from "@mui/material";
import {
  FiShield,
  FiUsers,
  FiSettings,
  FiBarChart2,  // Changed from FiBarChart3
  FiLogOut,
  FiMenu,
  FiHome,
  FiActivity,
  FiServer,
  FiUserCheck,
  FiAlertCircle,
  FiTrendingUp,
  FiDatabase,
  FiClock,
  FiCheckCircle
} from "react-icons/fi";

// Chart.js imports
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import SecNAuth from "./SecNAuth/SecNAuth";
import UserMgmt from "./UserManagement";
import SysMgmt from "./SystemManagement/SystemManagement";
import Performance from "./Performance/Performance";
import axiosClient from "@/api/axiosClient";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const drawerWidth = 280;

function AdminPage() {
  const [activeSession, setActiveSession] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      await axiosClient.get("/auth/log-out", null, {
        headers: {Authorization: `Bearer ${token}`}
      })
      
      localStorage.removeItem("token");
      window.location.href = '/login';
    } catch (error) {
      
    }

  };

  // Chart data for user growth
  const userGrowthData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'New Users',
        data: [65, 78, 66, 79, 96, 154],
        borderColor: '#6b4f3b',
        backgroundColor: alpha('#6b4f3b', 0.1),
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const userGrowthOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'User Growth',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Performance metrics data
  const performanceData = {
    labels: ['CPU', 'Memory', 'Storage', 'Network', 'Database', 'Cache'],
    datasets: [
      {
        label: 'Usage %',
        data: [65, 78, 45, 32, 55, 40],
        backgroundColor: [
          alpha('#6b4f3b', 0.8),
          alpha('#8b6b4f', 0.8),
          alpha('#a1887f', 0.8),
          alpha('#bc8f8f', 0.8),
          alpha('#4CAF50', 0.8),
          alpha('#2196F3', 0.8),
        ],
        borderColor: [
          '#6b4f3b',
          '#8b6b4f',
          '#a1887f',
          '#bc8f8f',
          '#4CAF50',
          '#2196F3',
        ],
        borderWidth: 1,
      },
    ],
  };

  const performanceOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  // Traffic sources data
  const trafficData = {
    labels: ['Direct', 'Social', 'Email', 'Referral', 'Organic'],
    datasets: [
      {
        data: [35, 25, 20, 15, 5],
        backgroundColor: [
          alpha('#6b4f3b', 0.8),
          alpha('#8b6b4f', 0.8),
          alpha('#a1887f', 0.8),
          alpha('#bc8f8f', 0.8),
          alpha('#4CAF50', 0.8),
        ],
        borderColor: [
          '#6b4f3b',
          '#8b6b4f',
          '#a1887f',
          '#bc8f8f',
          '#4CAF50',
        ],
        borderWidth: 2,
      },
    ],
  };

  const menuItems = [
    {
      key: "dashboard",
      label: "Dashboard",
      icon: <FiHome />,
      action: () => setActiveSession("")
    },
    {
      key: "sec-n-auth",
      label: "Security & Auth",
      icon: <FiShield />,
      action: () => setActiveSession("sec-n-auth")
    },
    {
      key: "user-management",
      label: "User Management",
      icon: <FiUsers />,
      action: () => setActiveSession("user-management")
    },
    {
      key: "system-management",
      label: "System Management",
      icon: <FiSettings />,
      action: () => setActiveSession("system-management")
    },
    {
      key: "performance",
      label: "Performance",
      icon: <FiBarChart2 />,  // Fixed: FiBarChart2 instead of FiBarChart3
      action: () => setActiveSession("performance")
    }
  ];

  const stats = [
    { label: "Total Users", value: "1,542", icon: <FiUsers />, color: "#6b4f3b", trend: "+12%" },
    { label: "Active Sessions", value: "327", icon: <FiActivity />, color: "#8b6b4f", trend: "+5%" },
    { label: "System Health", value: "98%", icon: <FiServer />, color: "#4CAF50", trend: "Stable" },
    { label: "Pending Actions", value: "12", icon: <FiAlertCircle />, color: "#FF9800", trend: "-3" }
  ];

  const renderContent = () => {
    switch (activeSession) {
      case "sec-n-auth":
        return <SecNAuth />;
      case "user-management":
        return <UserMgmt />;
      case "system-management":
        return <SysMgmt />;
      case "performance":
        return <Performance />;
      default:
        return (
          <Box sx={{ p: 3 }}>
            {/* Welcome Header */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: "#6b4f3b", mb: 1 }}>
                Welcome back, Admin!
              </Typography>
              <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                Here's what's happening with your platform today.
              </Typography>
            </Box>

            {/* Stats Grid */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {stats.map((stat, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card
                    sx={{
                      background: `linear-gradient(135deg, ${alpha(stat.color, 0.1)} 0%, ${alpha(stat.color, 0.05)} 100%)`,
                      border: `1px solid ${alpha(stat.color, 0.2)}`,
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 8px 25px ${alpha(stat.color, 0.15)}`,
                      }
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box>
                          <Typography variant="h4" sx={{ fontWeight: 800, color: stat.color, mb: 1 }}>
                            {stat.value}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                            {stat.label}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            background: `linear-gradient(135deg, ${stat.color} 0%, ${alpha(stat.color, 0.7)} 100%)`,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: 24
                          }}
                        >
                          {stat.icon}
                        </Box>
                      </Box>
                      <Chip 
                        label={stat.trend} 
                        size="small" 
                        variant="outlined"
                        sx={{ 
                          borderColor: stat.color,
                          color: stat.color,
                          fontWeight: 600
                        }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Charts Section */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={8}>
                <Card sx={{ borderRadius: 3, height: '100%' }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <FiTrendingUp style={{ marginRight: 8, color: '#6b4f3b' }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, color: "#6b4f3b" }}>
                        User Growth Analytics
                      </Typography>
                    </Box>
                    <Line data={userGrowthData} options={userGrowthOptions} />
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card sx={{ borderRadius: 3, height: '100%' }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <FiDatabase style={{ marginRight: 8, color: '#6b4f3b' }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, color: "#6b4f3b" }}>
                        Traffic Sources
                      </Typography>
                    </Box>
                    <Box sx={{ height: 250 }}>
                      <Doughnut data={trafficData} options={performanceOptions} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Performance Chart */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <FiActivity style={{ marginRight: 8, color: '#6b4f3b' }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, color: "#6b4f3b" }}>
                        System Performance
                      </Typography>
                    </Box>
                    <Bar data={performanceData} options={performanceOptions} />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card sx={{ borderRadius: 3 }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <FiUsers style={{ marginRight: 8, color: '#6b4f3b' }} />
                      <Typography variant="h6" sx={{ fontWeight: 600, color: "#6b4f3b" }}>
                        Quick Actions
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      {menuItems.slice(1).map((item) => (
                        <Grid item xs={12} key={item.key}>
                          <Paper
                            onClick={item.action}
                            sx={{
                              p: 3,
                              display: 'flex',
                              alignItems: 'center',
                              cursor: 'pointer',
                              background: 'linear-gradient(135deg, #fdf5e6 0%, #fff8f0 100%)',
                              border: '1px solid rgba(107, 79, 59, 0.1)',
                              borderRadius: 2,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                transform: 'translateX(8px)',
                                boxShadow: '0 6px 20px rgba(107, 79, 59, 0.15)',
                              }
                            }}
                          >
                            <Box
                              sx={{
                                width: 50,
                                height: 50,
                                background: 'linear-gradient(135deg, #6b4f3b 0%, #8b6b4f 100%)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: 20,
                                mr: 3
                              }}
                            >
                              {item.icon}
                            </Box>
                            <Typography variant="body1" sx={{ fontWeight: 600, color: "#6b4f3b" }}>
                              {item.label}
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );
    }
  };

  const drawer = (
    <Box sx={{ 
      background: 'linear-gradient(180deg, #6b4f3b 0%, #8b6b4f 100%)',
      color: 'white',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          PeerCheck Admin
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          Platform Management
        </Typography>
      </Box>

      {/* Navigation */}
      <List sx={{ flex: 1, p: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.key} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={item.action}
              selected={activeSession === item.key}
              sx={{
                borderRadius: 2,
                py: 1.5,
                px: 2,
                '&.Mui-selected': {
                  background: 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.2)',
                  }
                },
                '&:hover': {
                  background: 'rgba(255,255,255,0.1)',
                }
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label}
                primaryTypographyProps={{ fontWeight: 500 }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Logout */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            py: 1.5,
            px: 2,
            color: 'rgba(255,255,255,0.8)',
            '&:hover': {
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
            }
          }}
        >
          <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
            <FiLogOut />
          </ListItemIcon>
          <ListItemText 
            primary="Logout"
            primaryTypographyProps={{ fontWeight: 500 }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          background: 'white',
          color: '#6b4f3b',
          boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
          borderBottom: '1px solid rgba(0,0,0,0.05)'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <FiMenu />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600, flexGrow: 1 }}>
            {menuItems.find(item => item.key === activeSession)?.label || 'Dashboard'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip 
              icon={<FiUserCheck />} 
              label="Administrator" 
              variant="outlined" 
              size="small"
              sx={{ borderColor: '#6b4f3b', color: '#6b4f3b' }}
            />
            <Avatar sx={{ bgcolor: '#6b4f3b', width: 40, height: 40 }}>A</Avatar>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="admin navigation"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { md: `calc(100% - ${drawerWidth}px)` },
          background: '#f8f9fa',
          minHeight: '100vh'
        }}
      >
        <Toolbar /> {/* Spacer for AppBar */}
        {renderContent()}
      </Box>
    </Box>
  );
}

export default AdminPage;