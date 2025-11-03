import { useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./AuthPage.css";
import Navbar from "./Navbar/Navbar";


export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`http://localhost:5000/api/auth/reset-password/${token}`, { password });
      setMessage(res.data.message);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <>
      <Navbar />
      
      <div className="auth-container">
        <div className="auth-box">
          <h2>Reset Password</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Reset Password</button>
          </form>
          {message && <p>{message}</p>}
        </div>
      </div>
    </>

  );
}
