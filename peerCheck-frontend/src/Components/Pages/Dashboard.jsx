// Dashboard.jsx

import { useNavigate } from "react-router-dom";

function Dashboard() {
    const navigate = useNavigate();

    const handleLogout = () => {
      localStorage.removeItem("token"); // remove JWT token if you’re using one
      navigate("/login");
    };


  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <h1>🎓 PeerCheck Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </header>

      {/* Main content */}
      <main className="dashboard-main">
        <section className="welcome-section">
          <h2>Welcome back, Student!</h2>
          <p>Here’s what’s happening today 👇</p>
        </section>

        {/* Cards section */}
        <div className="dashboard-cards">
          <div className="card">
            <h3>📘 My Courses</h3>
            <p>You’re enrolled in 3 active courses.</p>
            <button>View Courses</button>
          </div>

          <div className="card">
            <h3>🕒 Recent Activity</h3>
            <p>Checked into class 2 hours ago.</p>
            <button>View History</button>
          </div>

          <div className="card">
            <h3>💬 Peer Feedback</h3>
            <p>You have 2 new feedbacks from your peers!</p>
            <button>View Feedback</button>
          </div>
        </div>
      </main>
    </div>
  );

}

export default Dashboard;