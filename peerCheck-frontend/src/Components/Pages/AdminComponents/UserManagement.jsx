import { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Card,
  CardHeader,
  CardContent,
  CardActions,
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
  Grid,
  IconButton,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import { Separator } from "@radix-ui/react-dropdown-menu";

const COLORS = ["#4ade80", "#f87171"]; // green, red

const UserManagement = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("active");
  const [visibleColumns, setVisibleColumns] = useState([
    "name",
    "username",
    "email",
    "status",
  ]);
  const [showAlert, setShowAlert] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/admin/user-data", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.allUsers);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading)
    return (
      <Button variant="contained" color="primary" startIcon={<CircularProgress size={20} />}>
        Loading Data...
      </Button>
    );
  if (error)
    return (
      <Button variant="outlined" color="error" startIcon={<CircularProgress size={20} />}>
        Error Loading Data...
      </Button>
    );

  const headers = Object.keys(users[0] || {});

  const filteredUsers = users.filter((user) =>
    Object.values(user).some((value) =>
      String(value).toLowerCase().includes(search.toLowerCase())
    )
  );

  const toggleColumn = (column) => {
    setVisibleColumns((prev) =>
      prev.includes(column)
        ? prev.filter((col) => col !== column)
        : [...prev, column]
    );
  };

  const activeCount = users.filter((u) => u.status === "active").length;
  const bannedCount = users.filter((u) => u.status === "banned").length;

  const pieData = [
    { name: "Active Users", value: activeCount },
    { name: "Banned Users", value: bannedCount },
  ];

  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const usersPerMonth = monthNames.map((month, index) => {
    const count = users.filter(
      (u) => new Date(u.joinedOn).getMonth() === index
    ).length;
    return { month, count };
  });

  let total = 0;
  const cumulativeData = usersPerMonth.map((m) => {
    total += m.count;
    return { month: m.month, totalUsers: total };
  });

  const changeStatus = async (user, col) => {
    try {
      if (user.email === "peercheckhelp@gmail.com") {
        setShowAlert(true);
        return;
      }
      const newStatus = user[col] === "active" ? "banned" : "active";
      const token = localStorage.getItem("token");

      const res = await axios.put(
        `http://localhost:5000/api/admin/change-status/${user._id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, status: newStatus } : u))
      );
    } catch (err) {
      console.error("Error updating user:", err);
      alert("Update failed!");
    }
  };

  return (
    <Card sx={{ p: 4, gap: 4 }}>
      {/* Dashboard Overview */}
    <Grid container spacing={4} justifyContent="center">
      {/* Pie Chart Card */}
      <Grid item xs={12} md={4}>
        <Card sx={{ p: 3, height: 380, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', boxShadow: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            User Status
          </Typography>
          <CardContent sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <ResponsiveContainer width={250} height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={100}
                  innerRadius={40} // donut effect
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} users`} />
                <Legend verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Bar Chart Card */}
      <Grid item xs={12} md={4}>
        <Card sx={{ p: 3, height: 380, width:400, display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom textAlign="center">
            Users Joined Per Month
          </Typography>
          <CardContent sx={{ flex: 1, minHeight: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={usersPerMonth} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#60a5fa" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Line Chart Card */}
      <Grid item xs={12} md={4}>
        <Card sx={{ p: 3, height: 380, width:400, display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom textAlign="center">
            Total User Growth
          </Typography>
          <CardContent sx={{ flex: 1, minHeight: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cumulativeData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="totalUsers" stroke="#34d399" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
    <br/>

      {/* Search & Column Filter */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <TextField
          label="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          variant="outlined"
          size="small"
          sx={{ maxWidth: 300 }}
        />

        <Box>
          <Button
            variant="outlined"
            endIcon={<MoreVertIcon />}
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            Select Columns
          </Button>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            {headers.map((col) => (
              <MenuItem key={col}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={visibleColumns.includes(col)}
                      onChange={() => toggleColumn(col)}
                    />
                  }
                  label={col.charAt(0).toUpperCase() + col.slice(1)}
                />
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Box>

      {/* Table Section */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {visibleColumns.map((header) => (
                <TableCell key={header}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {header.toUpperCase()}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user, i) => (
              <TableRow key={i}>
                {visibleColumns.map((col) => (
                  <TableCell key={col}>
                    {col === "status" ? (
                      <Button
                        onClick={() => changeStatus(user, col)}
                        color={user[col] === "active" ? "success" : "error"}
                        variant="text"
                      >
                        <Chip
                          label={user[col]}
                          color={user[col] === "active" ? "success" : "error"}
                          size="small"
                        />
                      </Button>
                    ) : (
                      String(user[col])
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Alert Dialog */}
      <Dialog open={showAlert} onClose={() => setShowAlert(false)}>
        <DialogTitle sx={{ color: "error.main" }}>⚠️ You are trying to BAN the ADMIN!</DialogTitle>
        <DialogContent>
          <Typography>
            This action is not allowed. Please choose another user.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAlert(false)}>OK</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default UserManagement;
