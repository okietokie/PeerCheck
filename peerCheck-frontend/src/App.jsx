import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Components/Pages/Home/Home.jsx";
import "./App.css";
import AuthPage from "./Components/Pages/Login/AuthPage.jsx";
import Dashboard from "./Components/Pages/Dashboard.jsx";
import ForgotPassword from "./Components/Pages/Login/ForgotPassword.jsx";
import ResetPassword from "./Components/Pages/Login/ResetPassword.jsx";
import AdminPage from "./Components/Pages/AdminComponents/AdminPage.jsx";
import SecNAuth from "./Components/Pages/AdminComponents/SecNAuth/SecNAuth.jsx";
import { useEffect, useState } from "react";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 👇 For example: fetch logged-in user from localStorage or JWT
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) setUser(storedUser);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/*" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin-page" element={<AdminPage />} />
        <Route path="/sec-n-auth" element={<SecNAuth />} />
        
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />


      </Routes>
    </Router>
  );
}
