import { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  CardActions,
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
  Stack,
} from "@mui/material";

const SecNAuth = () => {
  const [stats, setStats] = useState({
    totalLogins: 0,
    totalLoginsLast7Days: 0,
    failedLogins: 0,
    failedLoginsLast24Hrs: 0,
    passwordResets: 0,
    passwordResetsLast7Days: 0,
  });

  const [loading, setLoading] = useState(true);
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

  // Fetch stats
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://localhost:5000/api/admin/security-stats",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStats(response.data);
      setLoading(false);
    } catch (err) {
      setError("Error fetching stats");
      setLoading(false);
    }
  };

  // Fetch table details
  const fetchDetails = async (type, page = 1, limit = pagination.limit) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/admin/${type}?page=${page}&limit=${limit}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setLogs(response.data.logs || response.data);
      if (response.data.pagination) {
        setPagination(response.data.pagination);
      }
      setActiveSection(type);
    } catch (err) {
      console.error("Error fetching details:", err);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Typography color="error" variant="h6" align="center" mt={10}>
        {error}
      </Typography>
    );

  return (
    <Box sx={{ p: 4, bgcolor: "#f7f5f0", minHeight: "100vh" }}>
      <Typography variant="h4" fontWeight="bold" mb={4} align="center">
        Security & Authentication
      </Typography>

      {/* Stats Grid */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={3}
        mb={5}
        justifyContent="center"
      >
        {[
          {
            title: "Total Login Attempts",
            value: stats.totalLoginsLast7Days,
            period: "Past 7 days",
            action: () => fetchDetails("login-logs"),
          },
          {
            title: "Failed Login Attempts",
            value: stats.failedLoginsLast24Hrs,
            period: "Past 24 hours",
            action: () => fetchDetails("failed-logins"),
          },
          {
            title: "Password Reset Requests",
            value: stats.passwordResetsLast7Days,
            period: "Past 7 days",
            action: () => fetchDetails("password-resets"),
          },
        ].map((stat, idx) => (
          <Card
            key={idx}
            sx={{
              minWidth: 250,
              flex: 1,
              bgcolor: "#fffaf5",
              boxShadow: 3,
              borderRadius: 3,
              textAlign: "center",
              p: 2,
            }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {stat.title}
              </Typography>
              <Typography variant="h4" fontWeight="bold" color="#8B5E3C">
                {stat.value}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                {stat.period}
              </Typography>
              <Button
                variant="contained"
                size="small"
                sx={{
                  bgcolor: "#8B5E3C",
                  "&:hover": { bgcolor: "#5C3A23" },
                }}
                onClick={stat.action}
              >
                More Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* Dynamic Table */}
      {activeSection && (
        <Box>
          <Typography variant="h5" fontWeight="bold" mb={3}>
            {activeSection === "login-logs" && "All Login Attempts"}
            {activeSection === "failed-logins" && "Failed Login Attempts"}
            {activeSection === "password-resets" && "Password Reset Requests"}
          </Typography>

          {/* Controls */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            mb={2}
            alignItems="center"
          >
            <FormControl size="small">
              <InputLabel id="records-label">Records per page</InputLabel>
              <Select
                labelId="records-label"
                value={pagination.limit}
                label="Records per page"
                onChange={(e) => {
                  setPagination((prev) => ({ ...prev, limit: e.target.value }));
                  fetchDetails(activeSection, 1, e.target.value);
                }}
              >
                {[10, 20, 50, 100].map((n) => (
                  <MenuItem key={n} value={n}>
                    {n}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                variant="outlined"
                onClick={() =>
                  fetchDetails(activeSection, pagination.currentPage - 1, pagination.limit)
                }
                disabled={!pagination.hasPrev}
              >
                ← Previous
              </Button>
              <TextField
                type="number"
                size="small"
                value={pagination.currentPage}
                onChange={(e) => {
                  const newPage = parseInt(e.target.value);
                  if (newPage >= 1 && newPage <= pagination.totalPages) {
                    fetchDetails(activeSection, newPage, pagination.limit);
                  }
                }}
                sx={{ width: 70 }}
              />
              <Typography>
                of {pagination.totalPages}
              </Typography>
              <Button
                variant="outlined"
                onClick={() =>
                  fetchDetails(activeSection, pagination.currentPage + 1, pagination.limit)
                }
                disabled={!pagination.hasNext}
              >
                Next →
              </Button>
            </Stack>
          </Stack>

          {/* Table */}
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell>Date</TableCell>
                  {activeSection !== "password-resets" && <TableCell>Status</TableCell>}
                  {activeSection === "failed-logins" && <TableCell>Reason</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.length > 0 ? (
                  logs.map((log, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{log.email}</TableCell>
                      <TableCell>
                        {new Date(log.date || log.requestedAt).toLocaleString()}
                      </TableCell>
                      {activeSection !== "password-resets" && (
                        <TableCell>{log.status}</TableCell>
                      )}
                      {activeSection === "failed-logins" && <TableCell>{log.reason}</TableCell>}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={activeSection === "password-resets" ? 2 : activeSection === "failed-logins" ? 4 : 3} align="center">
                      No data found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Button
            variant="outlined"
            onClick={() => {
              setActiveSection(null);
              setLogs([]);
              setPagination({
                currentPage: 1,
                totalPages: 1,
                totalRecords: 0,
                hasNext: false,
                hasPrev: false,
                limit: 20,
              });
            }}
          >
            ← Back to Overview
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default SecNAuth;
