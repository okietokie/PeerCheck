import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminPage.css";
import SecNAuth from "./SecNAuth/SecNAuth";
import UserMgmt from "./UserManagement/UserManagement";
import SysMgmt from "./SystemManagement/SystemManagement";
import Performance from "./Performance/Performance";

/* NOTE: Make sure you have Boxicons available (or replace icons):
   Add to index.html (head): <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'>
*/

function AdminPage() {
  const [activeSession, setActiveSession] = useState("");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

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
        return <h1>Welcome Admin!</h1>;
    }
  };

  return (
    <div className="admin-container-outer">
      <aside className="side-bar" aria-label="Admin sidebar">
        <div className="top">
          <div className="heading">Admin Panel</div>

          <ul className="main-list" role="menu">
            <li role="menuitem" onClick={() => setActiveSession("sec-n-auth")}>
              <i className="bx bx-shield" aria-hidden="true"></i>
              <span className="label">Sec & Auth</span>
            </li>

            <li role="menuitem" onClick={() => setActiveSession("user-management")}>
              <i className="bx bx-user" aria-hidden="true"></i>
              <span className="label">User Management</span>
            </li>

            <li role="menuitem" onClick={() => setActiveSession("system-management")}>
              <i className="bx bxs-window" aria-hidden="true"></i>
              <span className="label">System Management</span>
            </li>

            <li role="menuitem" onClick={() => setActiveSession("performance")}>
              <i className="bx bxs-chart-network" aria-hidden="true"></i>
              <span className="label">Performance</span>
            </li>
          </ul>
        </div>

        <ul className="bottom" role="menu">
          <li role="menuitem" onClick={handleLogout}>
            <i className="bx bx-log-out" aria-hidden="true"></i>
            <span><i class='bx  bxs-clock-12'></i> </span>
            <span className="label">Logout</span>
          </li>
        </ul>
      </aside>

      <main className="not-side-bar">{renderContent()}</main>
    </div>
  );
}

export default AdminPage;
