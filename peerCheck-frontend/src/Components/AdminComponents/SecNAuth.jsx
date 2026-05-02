import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TextField,
  useTheme,
  alpha,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Alert,
  Divider,
  Badge,
  Container,
  Skeleton,
  Pagination,
  InputAdornment,
  Stack
} from "@mui/material";
import {
  Security as SecurityIcon,
  Login as LoginIcon,
  LockReset as LockResetIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as AccessTimeIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Download as DownloadIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon
} from "@mui/icons-material";
import axiosClient from "@/api/axiosClient";

const SecNAuth = () => {
  const theme = useTheme();
  const [stats, setStats] = useState({
    totalLogins: 0,
    totalLoginsLast7Days: 0,
    failedLogins: 0,
    failedLoginsLast24Hrs: 0,
    passwordResets: 0,
    passwordResetsLast7Days: 0,
  });

  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState(null);
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    hasNext: false,
    hasPrev: false,
    limit: 20,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch stats
  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get("/admin/security-stats");
      setStats(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError("Unable to load security statistics");
    } finally {
      setLoading(false);
    }
  };

  // Fetch table details
  const fetchDetails = async (type, page = 1, limit = pagination.limit) => {
    try {
      setLogsLoading(true);
      const response = await axiosClient.get(
        `/admin/${type}?page=${page}&limit=${limit}`
      );

      setLogs(response.data.logs || []);
      if (response.data.pagination) {
        setPagination(response.data.pagination);
      }
      setActiveSection(type);
    } catch (err) {
      console.error("Error fetching details:", err);
      setError(`Failed to load ${type} data`);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter logs based on search and filter
  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === "" || 
      (log.email && log.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.ip && log.ip.includes(searchTerm)) ||
      (log.userAgent && log.userAgent.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || 
      (log.status && log.status.toLowerCase() === statusFilter.toLowerCase());
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'success': return 'success';
      case 'failed': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getSectionTitle = () => {
    switch(activeSection) {
      case 'login-logs': return 'Login Attempts Log';
      case 'failed-logins': return 'Failed Login Attempts';
      case 'password-resets': return 'Password Reset Requests';
      default: return 'Security Overview';
    }
  };

  const getSectionIcon = () => {
    switch(activeSection) {
      case 'login-logs': return <LoginIcon />;
      case 'failed-logins': return <ErrorIcon />;
      case 'password-resets': return <LockResetIcon />;
      default: return <SecurityIcon />;
    }
  };

  const renderStatsCard = (stat, index) => (
    <Card key={index} sx={{
      flex: 1,
      minWidth: { xs: '100%', sm: 280 },
      height: '100%',
      transition: 'all 0.2s ease',
      bgcolor: alpha(theme.palette.primary.main, 0.05),
      border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: theme.shadows[4],
        bgcolor: alpha(theme.palette.primary.main, 0.08),
      }
    }}>
      <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar sx={{ 
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.main,
            width: 48,
            height: 48
          }}>
            {stat.icon}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {stat.title}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {stat.subtitle}
            </Typography>
          </Box>
        </Box>
        
        <Box sx={{ mt: 'auto' }}>
          {loading ? (
            <Skeleton variant="text" width={80} height={40} />
          ) : (
            <Typography variant="h3" sx={{ 
              fontWeight: 800,
              color: theme.palette.primary.main,
              mb: 1
            }}>
              {stat.value}
            </Typography>
          )}
          
          <Button
            variant="outlined"
            size="small"
            onClick={stat.action}
            startIcon={stat.buttonIcon}
            fullWidth
            sx={{
              mt: 2,
              borderColor: alpha(theme.palette.primary.main, 0.3),
              color: theme.palette.primary.main,
              '&:hover': {
                borderColor: theme.palette.primary.main,
                bgcolor: alpha(theme.palette.primary.main, 0.04)
              }
            }}
          >
            {stat.buttonText}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading && !activeSection) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Avatar sx={{ 
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.main,
            width: 56,
            height: 56
          }}>
            {getSectionIcon()}
          </Avatar>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
              {getSectionTitle()}
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeIcon fontSize="small" />
              {loading ? 'Loading...' : `Last updated: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
            </Typography>
          </Box>
          
          <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh data">
              <IconButton onClick={fetchStats}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            {activeSection && (
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => {
                  setActiveSection(null);
                  setLogs([]);
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
              >
                Back to Overview
              </Button>
            )}
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
      </Box>

      {/* Main Content */}
      {!activeSection ? (
        <>
          {/* Stats Cards */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3, 
            mb: 4,
            '& > *': {
              flex: 1
            }
          }}>
            {[
              {
                title: "Total Login Attempts",
                subtitle: "Last 7 days",
                value: stats.totalLoginsLast7Days?.toLocaleString() || "0",
                icon: <LoginIcon />,
                buttonText: "View All Logs",
                buttonIcon: <BarChartIcon />,
                action: () => fetchDetails("login-logs")
              },
              {
                title: "Failed Login Attempts",
                subtitle: "Last 24 hours",
                value: stats.failedLoginsLast24Hrs?.toLocaleString() || "0",
                icon: <ErrorIcon />,
                buttonText: "View Failed Logs",
                buttonIcon: <WarningIcon />,
                action: () => fetchDetails("failed-logins")
              },
              {
                title: "Password Resets",
                subtitle: "Last 7 days",
                value: stats.passwordResetsLast7Days?.toLocaleString() || "0",
                icon: <LockResetIcon />,
                buttonText: "View Reset Requests",
                buttonIcon: <LockResetIcon />,
                action: () => fetchDetails("password-resets")
              }
            ].map(renderStatsCard)}
          </Box>

          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimelineIcon />
                Security Metrics Summary
              </Typography>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                <Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>Total Logins (All Time)</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.totalLogins?.toLocaleString() || "0"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>All Failed Logins</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.error.main }}>
                    {stats.failedLogins?.toLocaleString() || "0"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>All Password Resets</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
                    {stats.passwordResets?.toLocaleString() || "0"}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>Success Rate</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                    {stats.totalLogins ? 
                      `${Math.round(((stats.totalLogins - stats.failedLogins) / stats.totalLogins) * 100)}%` : 
                      "100%"
                    }
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </>
      ) : (
        // Details Section
        <>
          {/* Controls */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', md: 'row' }, 
                gap: 2, 
                alignItems: { xs: 'stretch', md: 'center' }
              }}>
                <TextField
                  placeholder="Search by email, IP, or user agent..."
                  size="small"
                  fullWidth
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ flex: 2 }}
                />
                
                <Box sx={{ display: 'flex', gap: 2, flex: 1 }}>
                  {activeSection !== 'password-resets' && (
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={statusFilter}
                        label="Status"
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <MenuItem value="all">All Status</MenuItem>
                        <MenuItem value="success">Success</MenuItem>
                        <MenuItem value="failed">Failed</MenuItem>
                        <MenuItem value="pending">Pending</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                  
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Per Page</InputLabel>
                    <Select
                      value={pagination.limit}
                      label="Per Page"
                      onChange={(e) => {
                        const newLimit = e.target.value;
                        setPagination(prev => ({ ...prev, limit: newLimit }));
                        fetchDetails(activeSection, 1, newLimit);
                      }}
                    >
                      {[10, 20, 50, 100].map((n) => (
                        <MenuItem key={n} value={n}>{n}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Data Table */}
          <Card>
            <CardContent sx={{ p: 0 }}>
              {logsLoading ? (
                <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ 
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
                          '& th': { 
                            fontWeight: 600,
                            color: theme.palette.text.primary,
                            borderBottom: `2px solid ${theme.palette.divider}`
                          }
                        }}>
                          <TableCell>User</TableCell>
                          <TableCell>Date & Time</TableCell>
                          {activeSection !== 'password-resets' && <TableCell>Status</TableCell>}
                          {activeSection === 'failed-logins' && <TableCell>Reason</TableCell>}
                          {activeSection === 'login-logs' && <TableCell>IP Address</TableCell>}
                          {activeSection === 'password-resets' && <TableCell>Status</TableCell>}
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredLogs.length > 0 ? (
                          filteredLogs.map((log, idx) => (
                            <TableRow 
                              key={idx}
                              hover
                              sx={{ 
                                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) }
                              }}
                            >
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                                    <PersonIcon fontSize="small" />
                                  </Avatar>
                                  <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                      {log.email || 'N/A'}
                                    </Typography>
                                    {log.username && (
                                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                        @{log.username}
                                      </Typography>
                                    )}
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box>
                                  <Typography variant="body2">
                                    {new Date(log.date || log.requestedAt).toLocaleDateString()}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                    {new Date(log.date || log.requestedAt).toLocaleTimeString()}
                                  </Typography>
                                </Box>
                              </TableCell>
                              
                              {activeSection !== 'password-resets' && log.status && (
                                <TableCell>
                                  <Chip 
                                    label={log.status}
                                    size="small"
                                    color={getStatusColor(log.status)}
                                    variant="outlined"
                                    icon={log.status === 'Success' ? <CheckCircleIcon /> : <ErrorIcon />}
                                  />
                                </TableCell>
                              )}
                              
                              {activeSection === 'failed-logins' && (
                                <TableCell>
                                  <Chip 
                                    label={log.reason || 'Unknown'}
                                    size="small"
                                    color="error"
                                    variant="filled"
                                    sx={{ bgcolor: alpha(theme.palette.error.main, 0.1) }}
                                  />
                                </TableCell>
                              )}
                              
                              {activeSection === 'login-logs' && (
                                <TableCell>
                                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                    {log.ip || 'N/A'}
                                  </Typography>
                                </TableCell>
                              )}
                              
                              {activeSection === 'password-resets' && (
                                <TableCell>
                                  <Chip 
                                    label={log.status || 'Pending'}
                                    size="small"
                                    color={log.status === 'completed' ? 'success' : 'warning'}
                                  />
                                </TableCell>
                              )}
                              
                              <TableCell align="right">
                                <Tooltip title="View details">
                                  <IconButton size="small">
                                    <SearchIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={activeSection === 'password-resets' ? 4 : activeSection === 'failed-logins' ? 5 : 5} align="center" sx={{ py: 4 }}>
                              <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                                <SearchIcon sx={{ fontSize: 48, opacity: 0.5, mb: 1 }} />
                                <Typography>No matching records found</Typography>
                                {(searchTerm || statusFilter !== 'all') && (
                                  <Button 
                                    size="small" 
                                    sx={{ mt: 1 }}
                                    onClick={() => {
                                      setSearchTerm("");
                                      setStatusFilter("all");
                                    }}
                                  >
                                    Clear filters
                                  </Button>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <Box sx={{ 
                      p: 3, 
                      borderTop: `1px solid ${theme.palette.divider}`,
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center'
                    }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{' '}
                        {Math.min(pagination.currentPage * pagination.limit, pagination.totalRecords)} of{' '}
                        {pagination.totalRecords} records
                      </Typography>
                      
                      <Pagination
                        count={pagination.totalPages}
                        page={pagination.currentPage}
                        onChange={(_, page) => fetchDetails(activeSection, page, pagination.limit)}
                        color="primary"
                        showFirstButton
                        showLastButton
                      />
                    </Box>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </Container>
  );
};

export default SecNAuth;