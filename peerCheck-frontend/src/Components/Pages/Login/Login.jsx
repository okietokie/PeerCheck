// Login.jsx
import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./AuthPage.css";
import Navbar from "./Navbar/Navbar";


export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: ""});
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", formData);
      setMessage(res.data.message);
      localStorage.setItem("token", res.data.token); // save token for authentication
      if(res.data.role === "admin"){
        navigate("/admin-page")
      }else{
        navigate("/dashboard");
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed");
    }
  };
  

  return (
    <>
    <Navbar />

    <div className="auth-container">
      <div className="auth-box">
        <h2>Welcome Back</h2>
    <form onSubmit={handleLogin}>
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Login</button>
      </form>

      {message && <p>{message}</p>}
        <p>
          Don’t have an account? <Link to="/sign-up">Sign up →</Link>
        </p>

        <p> 
          Click  <Link to="/forgot-password">Forgot Password</Link>
        </p>
      </div>
    </div>
        </>
  );
}

