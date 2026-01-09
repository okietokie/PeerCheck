import { useState, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  CircularProgress,
  Menu,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  IconButton,
  useTheme,
  alpha,
  Avatar,
  Tooltip,
  Badge,
  Tabs,
  Tab,
  Select,
  InputLabel,
  FormControl,
  Pagination,
  Divider,
  Alert,
  Container,
  Stack
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  PersonAdd as PersonAddIcon,
  FilterList as FilterListIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Email as EmailIcon,
  School as SchoolIcon,
  Work as WorkIcon,
  CalendarToday as CalendarIcon,
  Groups as GroupsIcon,
  Person as PersonIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Timeline as TimelineIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  StackedLineChart,
} from "@mui/icons-material";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";
import axiosClient from "@/api/axiosClient";

const UserManagement = () => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [anchorEl, setAnchorEl] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [visibleColumns, setVisibleColumns] = useState([
    "name",
    "username",
    "email",
    "role",
    "status",
    "joined"
  ]);
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [stats, setStats] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get("/admin/user-data");
      const userData = response.data.allUsers || [];
      console.log("userdata: ", userData);
      setUsers(userData);
      setFilteredUsers(userData);
      calculateStats(userData);
      setError(null);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (usersData) => {
    const total = usersData.length;
    const active = usersData.filter(u => u.status === "active").length;
    const banned = usersData.filter(u => u.status === "banned").length;
    
    // FIXED: Using correct role values from your model
    const students = usersData.filter(u => u.role === "student").length;
    const teachers = usersData.filter(u => u.role === "teacher").length;
    const admins = usersData.filter(u => u.role === "admin").length;
    
    // Calculate year distribution
    const yearDistribution = {};
    usersData.forEach(user => {
      const year = user.year || "Other";
      yearDistribution[year] = (yearDistribution[year] || 0) + 1;
    });

    // Calculate monthly growth
    const monthlyGrowth = {};
    usersData.forEach(user => {
      if (user.joinedOn || user.createdAt) {
        const date = new Date(user.joinedOn || user.createdAt);
        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthlyGrowth[monthYear] = (monthlyGrowth[monthYear] || 0) + 1;
      }
    });

    setStats({
      total,
      active,
      banned,
      students,
      teachers,
      admins,
      yearDistribution,
      monthlyGrowth,
      activePercentage: total ? Math.round((active / total) * 100) : 0,
      studentPercentage: total ? Math.round((students / total) * 100) : 0,
    });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let result = users;
    
    // Apply search filter
    if (search) {
      result = result.filter(user =>
        Object.values(user).some(value =>
          String(value).toLowerCase().includes(search.toLowerCase())
        )
      );
    }

    // Apply role filter - FIXED: using correct role values
    if (roleFilter !== "all") {
      result = result.filter(user => user.role === roleFilter);
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(user => user.status === statusFilter);
    }

    // Apply year filter
    if (yearFilter !== "all") {
      result = result.filter(user => (user.year || "Other") === yearFilter);
    }

    // Apply tab filter - FIXED: using correct role values
    if (activeTab === "active") {
      result = result.filter(user => user.status === "active");
    } else if (activeTab === "banned") {
      result = result.filter(user => user.status === "banned");
    } else if (activeTab === "students") {
      result = result.filter(user => user.role === "student");
    } else if (activeTab === "teachers") {
      result = result.filter(user => user.role === "teacher");
    } else if (activeTab === "admins") {
      result = result.filter(user => user.role === "admin");
    }

    setFilteredUsers(result);
    setPage(1);
  }, [search, roleFilter, statusFilter, yearFilter, activeTab, users]);

  const handleChangeStatus = async (user) => {
    try {
      if (user.email === "peercheckhelp@gmail.com" || user.role === "admin") {
        setShowAlert(true);
        return;
      }
      
      const newStatus = user.status === "active" ? "banned" : "active";
      const response = await axiosClient.put(
        `/admin/change-status/${user._id}`,
        { status: newStatus }
      );

      setUsers(prev =>
        prev.map(u => 
          u._id === user._id ? { ...u, status: newStatus } : u
        )
      );
    } catch (err) {
      console.error("Error updating user status:", err);
      setError("Failed to update user status");
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setUserDialogOpen(true);
  };

  const toggleColumn = (column) => {
    setVisibleColumns(prev =>
      prev.includes(column)
        ? prev.filter(col => col !== column)
        : [...prev, column]
    );
  };

  const getStatusColor = (status) => {
    return status === "active" ? "success" : "error";
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'admin': return 'error';
      case 'teacher': return 'warning';
      case 'student': return 'primary';
      default: return 'default';
    }
  };

  const columnsConfig = {
    name: { label: "Name", width: 200 },
    username: { label: "Username", width: 150 },
    email: { label: "Email", width: 250 },
    role: { label: "Role", width: 120 },
    status: { label: "Status", width: 100 },
    joined: { label: "Joined", width: 120 },
    year: { label: "Year", width: 100 },
    institution: { label: "Institution", width: 180 },
    course: { label: "Course", width: 150 },
    onlineStatus: { label: "Online", width: 100 }
  };

  const pieData = stats ? [
    { name: "Active", value: stats.active, color: theme.palette.success.main },
    { name: "Banned", value: stats.banned, color: theme.palette.error.main },
  ] : [];

  const roleData = stats ? [
    { name: "Students", value: stats.students, color: theme.palette.primary.main },
    { name: "Teachers", value: stats.teachers, color: theme.palette.warning.main },
    { name: "Admins", value: stats.admins, color: theme.palette.error.main },
  ] : [];

  const yearData = stats ? Object.entries(stats.yearDistribution).map(([year, count]) => ({
    name: year,
    value: count,
    color: theme.palette.info.main
  })) : [];

  const monthlyData = stats ? Object.entries(stats.monthlyGrowth).map(([month, count]) => ({
    month: month.slice(5),
    users: count
  })).slice(-12) : [];

  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredUsers.slice(start, end);
  }, [filteredUsers, page, rowsPerPage]);

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);

  // Debug log to check user data
  useEffect(() => {
    if (users.length > 0) {
      console.log("Sample user:", users[0]);
      console.log("Roles found:", [...new Set(users.map(u => u.role))]);
    }
  }, [users]);

  if (loading) {
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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ 
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              width: 56,
              height: 56
            }}>
              <GroupsIcon />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                User Management
              </Typography>
              <Typography variant="subtitle1" sx={{ color: 'text.secondary' }}>
                {stats?.total || 0} total users • {stats?.activePercentage || 0}% active
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh data">
              <IconButton onClick={fetchUsers}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => console.log("Export users")}
            >
              Export
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
      </Box>

      {/* Quick Stats */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        gap: 2, 
        mb: 4 
      }}>
        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar sx={{ 
              bgcolor: alpha(theme.palette.success.main, 0.1),
              color: theme.palette.success.main
            }}>
              <CheckCircleIcon />
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>Active Users</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>{stats?.active || 0}</Typography>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar sx={{ 
              bgcolor: alpha(theme.palette.error.main, 0.1),
              color: theme.palette.error.main
            }}>
              <BlockIcon />
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>Banned Users</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>{stats?.banned || 0}</Typography>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar sx={{ 
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main
            }}>
              <SchoolIcon />
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>Students</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>{stats?.students || 0}</Typography>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar sx={{ 
              bgcolor: alpha(theme.palette.warning.main, 0.1),
              color: theme.palette.warning.main
            }}>
              <WorkIcon />
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>Teachers</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>{stats?.teachers || 0}</Typography>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar sx={{ 
              bgcolor: alpha(theme.palette.error.main, 0.1),
              color: theme.palette.error.main
            }}>
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>Admins</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>{stats?.admins || 0}</Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Charts Section */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', lg: 'row' },
        gap: 3, 
        mb: 4 
      }}>
        {/* Status Distribution */}
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <PieChartIcon />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>User Status Distribution</Typography>
            </Box>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={80}
                    innerRadius={40}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value) => [`${value} users`, 'Count']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

        {/* Role Distribution */}
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <BarChartIcon />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>User Role Distribution</Typography>
            </Box>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roleData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.grey[500], 0.2)} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="value" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>

        {/* Monthly Growth */}
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <StackedLineChart />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Monthly User Growth</Typography>
            </Box>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.grey[500], 0.2)} />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    stroke={theme.palette.success.main} 
                    fill={alpha(theme.palette.success.main, 0.1)} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Filters and Controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            gap: 2,
            alignItems: { xs: 'stretch', md: 'center' }
          }}>
            <TextField
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
              }}
              sx={{ flex: 2 }}
            />
            
            <Box sx={{ display: 'flex', gap: 2, flex: 3 }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Role</InputLabel>
                <Select value={roleFilter} label="Role" onChange={(e) => setRoleFilter(e.target.value)}>
                  <MenuItem value="all">All Roles</MenuItem>
                  <MenuItem value="student">Students</MenuItem>
                  <MenuItem value="teacher">Teachers</MenuItem>
                  <MenuItem value="admin">Admins</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="banned">Banned</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Year</InputLabel>
                <Select value={yearFilter} label="Year" onChange={(e) => setYearFilter(e.target.value)}>
                  <MenuItem value="all">All Years</MenuItem>
                  {yearData.map(year => (
                    <MenuItem key={year.name} value={year.name}>{year.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  startIcon={<FilterListIcon />}
                >
                  Columns
                </Button>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                  {Object.entries(columnsConfig).map(([key, config]) => (
                    <MenuItem key={key}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={visibleColumns.includes(key)}
                            onChange={() => toggleColumn(key)}
                          />
                        }
                        label={config.label}
                      />
                    </MenuItem>
                  ))}
                </Menu>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, value) => setActiveTab(value)}>
          <Tab icon={<PersonIcon />} label="All Users" value="all" />
          <Tab icon={<CheckCircleIcon />} label="Active" value="active" />
          <Tab icon={<BlockIcon />} label="Banned" value="banned" />
          <Tab icon={<SchoolIcon />} label="Students" value="students" />
          <Tab icon={<WorkIcon />} label="Teachers" value="teachers" />
          <Tab icon={<PersonIcon />} label="Admins" value="admins" />
        </Tabs>
      </Box>

      {/* Users Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
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
                  {visibleColumns.includes('name') && <TableCell>User</TableCell>}
                  {visibleColumns.includes('username') && <TableCell>Username</TableCell>}
                  {visibleColumns.includes('email') && <TableCell>Email</TableCell>}
                  {visibleColumns.includes('role') && <TableCell>Role</TableCell>}
                  {visibleColumns.includes('status') && <TableCell>Status</TableCell>}
                  {visibleColumns.includes('joined') && <TableCell>Joined</TableCell>}
                  {visibleColumns.includes('year') && <TableCell>Year</TableCell>}
                  {visibleColumns.includes('institution') && <TableCell>Institution</TableCell>}
                  {visibleColumns.includes('course') && <TableCell>Course</TableCell>}
                  {visibleColumns.includes('onlineStatus') && <TableCell>Online</TableCell>}
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user) => (
                    <TableRow key={user._id} hover>
                      {visibleColumns.includes('name') && (
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                              {user.name?.charAt(0) || 'U'}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {user.name}
                              </Typography>
                              {user.institution && (
                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                  {user.institution}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                      )}
                      
                      {visibleColumns.includes('username') && (
                        <TableCell>
                          <Typography variant="body2">@{user.username}</Typography>
                        </TableCell>
                      )}
                      
                      {visibleColumns.includes('email') && (
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <EmailIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                            <Typography variant="body2">{user.email}</Typography>
                          </Box>
                        </TableCell>
                      )}
                      
                      {visibleColumns.includes('role') && (
                        <TableCell>
                          <Chip 
                            label={user.role || "student"}
                            size="small"
                            color={getRoleColor(user.role || "student")}
                            variant="outlined"
                          />
                        </TableCell>
                      )}
                      
                      {visibleColumns.includes('status') && (
                        <TableCell>
                          <Button
                            onClick={() => handleChangeStatus(user)}
                            size="small"
                            sx={{ p: 0 }}
                            disabled={user.role === "admin"}
                          >
                            <Chip
                              label={user.status || "active"}
                              size="small"
                              color={getStatusColor(user.status || "active")}
                              icon={user.status === 'active' ? <CheckCircleIcon /> : <BlockIcon />}
                              disabled={user.role === "admin"}
                            />
                          </Button>
                        </TableCell>
                      )}
                      
                      {visibleColumns.includes('joined') && (
                        <TableCell>
                          <Typography variant="body2">
                            {user.joinedOn || user.createdAt 
                              ? new Date(user.joinedOn || user.createdAt).toLocaleDateString()
                              : "N/A"}
                          </Typography>
                        </TableCell>
                      )}
                      
                      {visibleColumns.includes('year') && (
                        <TableCell>
                          <Chip 
                            label={user.year || "Other"} 
                            size="small" 
                            variant="outlined"
                          />
                        </TableCell>
                      )}
                      
                      {visibleColumns.includes('institution') && (
                        <TableCell>
                          <Typography variant="body2">{user.institution || '-'}</Typography>
                        </TableCell>
                      )}
                      
                      {visibleColumns.includes('course') && (
                        <TableCell>
                          <Typography variant="body2">{user.course || '-'}</Typography>
                        </TableCell>
                      )}
                      
                      {visibleColumns.includes('onlineStatus') && (
                        <TableCell>
                          <Badge
                            color={user.onlineStatus === 'online' ? 'success' : 'default'}
                            variant="dot"
                            anchorOrigin={{
                              vertical: 'top',
                              horizontal: 'left',
                            }}
                          >
                            <Typography variant="body2">
                              {user.onlineStatus || 'offline'}
                            </Typography>
                          </Badge>
                        </TableCell>
                      )}
                      
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="View Profile">
                            <IconButton size="small" onClick={() => handleViewUser(user)}>
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit User">
                            <IconButton size="small" disabled={user.role === "admin"}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={user.status === 'active' ? 'Ban User' : 'Activate User'}>
                            <IconButton 
                              size="small" 
                              onClick={() => handleChangeStatus(user)}
                              color={user.status === 'active' ? 'error' : 'success'}
                              disabled={user.role === "admin"}
                            >
                              {user.status === 'active' ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={visibleColumns.length + 1} align="center" sx={{ py: 4 }}>
                      <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                        <SearchIcon sx={{ fontSize: 48, opacity: 0.5, mb: 1 }} />
                        <Typography>No users found matching your criteria</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {filteredUsers.length > 0 && (
            <Box sx={{ 
              p: 3, 
              borderTop: `1px solid ${theme.palette.divider}`,
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center'
            }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Showing {(page - 1) * rowsPerPage + 1} to{' '}
                {Math.min(page * rowsPerPage, filteredUsers.length)} of{' '}
                {filteredUsers.length} users
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <FormControl size="small">
                  <Select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(e.target.value);
                      setPage(1);
                    }}
                  >
                    {[5, 10, 25, 50].map((n) => (
                      <MenuItem key={n} value={n}>{n} per page</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                  showFirstButton
                  showLastButton
                />
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* User Detail Dialog */}
      <Dialog open={userDialogOpen} onClose={() => setUserDialogOpen(false)} maxWidth="md" fullWidth>
        {selectedUser && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                {selectedUser.name?.charAt(0) || 'U'}
              </Avatar>
              <Box>
                <Typography variant="h6">{selectedUser.name}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  @{selectedUser.username} • {selectedUser.email}
                </Typography>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>Role</Typography>
                    <Chip label={selectedUser.role || "student"} color={getRoleColor(selectedUser.role || "student")} />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>Status</Typography>
                    <Chip 
                      label={selectedUser.status || "active"} 
                      color={getStatusColor(selectedUser.status || "active")}
                      icon={selectedUser.status === 'active' ? <CheckCircleIcon /> : <BlockIcon />}
                    />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>Year</Typography>
                    <Typography variant="body1">{selectedUser.year || 'Not specified'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>Online Status</Typography>
                    <Badge
                      color={selectedUser.onlineStatus === 'online' ? 'success' : 'default'}
                      variant="dot"
                      anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                      }}
                    >
                      <Typography variant="body1">{selectedUser.onlineStatus || 'offline'}</Typography>
                    </Badge>
                  </Box>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Education Details</Typography>
                  <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    <Box>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>Institution</Typography>
                      <Typography variant="body1">{selectedUser.institution || 'Not specified'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>Course</Typography>
                      <Typography variant="body1">{selectedUser.course || 'Not specified'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>Joined</Typography>
                      <Typography variant="body1">
                        {selectedUser.joinedOn || selectedUser.createdAt
                          ? new Date(selectedUser.joinedOn || selectedUser.createdAt).toLocaleDateString()
                          : 'Not available'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {selectedUser.skills && selectedUser.skills.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Skills</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedUser.skills.map((skill, index) => (
                        <Chip key={index} label={skill} size="small" />
                      ))}
                    </Box>
                  </Box>
                )}

                {selectedUser.bio && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>Bio</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                      {selectedUser.bio}
                    </Typography>
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setUserDialogOpen(false)}>Close</Button>
              <Button 
                variant="contained" 
                onClick={() => handleChangeStatus(selectedUser)}
                color={selectedUser.status === 'active' ? 'error' : 'success'}
                disabled={selectedUser.role === "admin"}
              >
                {selectedUser.status === 'active' ? 'Ban User' : 'Activate User'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Alert Dialog */}
      <Dialog open={showAlert} onClose={() => setShowAlert(false)}>
        <DialogTitle sx={{ color: "error.main", display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon />
          Protected User
        </DialogTitle>
        <DialogContent>
          <Typography>
            You cannot modify the status of admin users or protected accounts.
            This action is restricted for security reasons.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAlert(false)} color="primary">
            Understand
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserManagement;