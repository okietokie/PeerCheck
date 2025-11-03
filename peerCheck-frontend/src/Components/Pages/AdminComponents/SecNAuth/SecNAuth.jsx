import "./SecNAuth.css";
import { useState, useEffect } from "react";
import axios from "axios";

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
    limit: 20
  });

  // Fetch summary stats
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/admin/security-stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data);
      setLoading(false);
    } catch (err) {
      setError("Error fetching stats");
      setLoading(false);
    }
  };

  // Fetch table details with dynamic pagination
  const fetchDetails = async (type, page = 1, limit = pagination.limit) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:5000/api/admin/${type}?page=${page}&limit=${limit}`, 
        {
          headers: { Authorization: `Bearer ${token}` },
        }
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

  // Pagination handlers
  const handleNextPage = () => {
    if (pagination.hasNext) {
      fetchDetails(activeSection, pagination.currentPage + 1, pagination.limit);
    }
  };

  const handlePrevPage = () => {
    if (pagination.hasPrev) {
      fetchDetails(activeSection, pagination.currentPage - 1, pagination.limit);
    }
  };

  // Handle records per page change
  const handleLimitChange = (newLimit) => {
    setPagination(prev => ({ ...prev, limit: newLimit }));
    fetchDetails(activeSection, 1, newLimit); // Reset to page 1 when changing limit
  };

  // Handle page input change
  const handlePageInputChange = (e) => {
    const newPage = parseInt(e.target.value);
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchDetails(activeSection, newPage, pagination.limit);
    }
  };

  // Load stats initially
  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p>Loading stats...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="security-auth-container">
      <h2 className="section-title">Security & Authentication</h2>

      {/* Stats Summary */}
      <div className="stats-grid">
        {/* Total Login Attempts */}
        <div className="stat-card">
          <h3>Total Login Attempts</h3>
          <p className="stat-number">{stats.totalLoginsLast7Days}</p>
          <p className="stat-period">Past 7 days</p>
          <button
            className="details-btn"
            onClick={() => fetchDetails("login-logs")}
          >
            More Details
          </button>
        </div>

        {/* Failed Login Attempts */}
        <div className="stat-card">
          <h3>Failed Login Attempts</h3>
          <p className="stat-number">{stats.failedLoginsLast24Hrs}</p>
          <p className="stat-period">Past 24 hours</p>
          <button
            className="details-btn"
            onClick={() => fetchDetails("failed-logins")}
          >
            More Details
          </button>
        </div>

        {/* Password Reset Requests */}
        <div className="stat-card">
          <h3>Password Reset Requests</h3>
          <p className="stat-number">{stats.passwordResetsLast7Days}</p>
          <p className="stat-period">Past 7 days</p>
          <button
            className="details-btn"
            onClick={() => fetchDetails("password-resets")}
          >
            View Details
          </button>
        </div>
      </div>

      {/* Dynamic Tables Section */}
      {activeSection && (
        <div className="details-section">
          <h3 className="details-title">
            {activeSection === "login-logs" && "All Login Attempts"}
            {activeSection === "failed-logins" && "Failed Login Attempts"}
            {activeSection === "password-resets" && "Password Reset Requests"}
          </h3>

          {/* Records Per Page Selector */}
          <div className="records-controls">
            <label htmlFor="recordsPerPage">Records per page: </label>
            <select 
              id="recordsPerPage"
              value={pagination.limit}
              onChange={(e) => handleLimitChange(parseInt(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          {/* Pagination Info */}
          <div className="pagination-info">
            Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{" "}
            {Math.min(pagination.currentPage * pagination.limit, pagination.totalRecords)} of{" "}
            {pagination.totalRecords} records
          </div>

          <table className="details-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Date</th>
                {activeSection !== "password-resets" && <th>Status</th>}
                {activeSection === "failed-logins" && <th>Reason</th>}
              </tr>
            </thead>
            <tbody>
              {logs.length > 0 ? (
                logs.map((log, index) => (
                  <tr key={index}>
                    <td>{log.email}</td>
                    <td>{new Date(log.date || log.requestedAt).toLocaleString()}</td>
                    {activeSection !== "password-resets" && (
                      <td>
                        <span className={`status ${log.status?.toLowerCase()}`}>
                          {log.status}
                        </span>
                      </td>
                    )}
                    {activeSection === "failed-logins" && <td>{log.reason}</td>}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={activeSection === "password-resets" ? 2 : activeSection === "failed-logins" ? 4 : 3}>
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {logs.length > 0 && (
            <div className="pagination-controls">
              <button 
                className="pagination-btn" 
                onClick={handlePrevPage}
                disabled={!pagination.hasPrev}
              >
                ← Previous
              </button>
              
              <div className="page-navigation">
                <span>Page </span>
                <input
                  type="number"
                  className="page-input"
                  value={pagination.currentPage}
                  onChange={handlePageInputChange}
                  min="1"
                  max={pagination.totalPages}
                />
                <span> of {pagination.totalPages}</span>
              </div>
              
              <button 
                className="pagination-btn" 
                onClick={handleNextPage}
                disabled={!pagination.hasNext}
              >
                Next →
              </button>
            </div>
          )}

          <button
            className="back-btn"
            onClick={() => {
              setActiveSection(null);
              setLogs([]);
              setPagination({
                currentPage: 1,
                totalPages: 1,
                totalRecords: 0,
                hasNext: false,
                hasPrev: false,
                limit: 20
              });
            }}
          >
            ← Back to Overview
          </button>
        </div>
      )}
    </div>
  );
};

export default SecNAuth;