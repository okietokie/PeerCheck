// App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Components/Login/Home.jsx";
import AuthPage from "./Components/Login/AuthPage.jsx";
import ForgotPassword from "@/Components/Login/Helper Components/ForgotPassword.jsx";
import ResetPassword from "@/Components/Login/Helper Components/ResetPassword.jsx";
import AdminPage from "./Components/AdminComponents/AdminPage.jsx";
import SecNAuth from "./Components/AdminComponents/SecNAuth.jsx";

import { useEffect, useState } from "react";

import ProtectedRoute from "./Components/ProtectedRoute.jsx";
import { ThemeProvider } from "@mui/material/styles";
import { Box, CssBaseline } from "@mui/material"; // Added CssBaseline

import themes from './assets/theme.js';
import { useInView } from "react-intersection-observer";

import UserApp from "./Components/user-dashboard/UserApp.jsx";
import Tasks from "./Components/user-dashboard/Tasks.jsx";
import Projects from "./Components/user-dashboard/Projects.jsx";
import MyProject from "./Components/user-dashboard/MyProject.jsx";
import PeerTeams from "./Components/user-dashboard/PeerTeams.jsx";
import Profile from "./Components/user-dashboard/Profile.jsx";
import Dashboard from "./Components/user-dashboard/Dashboard.jsx";
import NotificationsPage from "./Components/Notifications/NotificationsPage.jsx";
import MyProjectNull from "./Components/user-dashboard/MyProjectNull.jsx";

// Import new components
import ThemePicker from "./Components/ThemesComponents/ThemePicker.jsx";
import ThemeToggleButton from "./Components/ThemesComponents/ThemeToggleButton.jsx";
import { getThemeNames } from "./utils/themeUtils.js";
import TeacherApp from "./Components/teacher-dashboard/teacher-dash-app.jsx";
import TeacherDashboard from "./Components/teacher-dashboard/Dashboard.jsx";
import TeacherClasses from "./Components/teacher-dashboard/TeacherClasses.jsx";
import Feedback from "./Components/teacher-dashboard/Feedback.jsx";

// Extract theme names dynamically
const themeNames = getThemeNames(themes);

const getSavedTheme = () => {
  try {
    const saved = localStorage.getItem('themeName');
    return themeNames.includes(saved) ? saved : themeNames[0];
  } catch {
    return themeNames[0];
  }
};

export default function App() {
  const [themeName, setThemeName] = useState(getSavedTheme());
  const [user, setUser] = useState(null);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const { ref, inView } = useInView();

  // Save theme preference to localStorage
  useEffect(() => {
    localStorage.setItem('themeName', themeName);
  }, [themeName]);

  // Apply theme to body
  useEffect(() => {
    const theme = themes[themeName];
    document.body.style.backgroundColor = theme.palette.background.default;
    document.body.style.color = theme.palette.text.primary;
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
  }, [themeName]);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
      }
    }
  }, []);
  
  const toggleThemePicker = () => {
    setShowThemePicker(!showThemePicker);
  };

  const handleThemeChange = (newThemeName) => {
    setThemeName(newThemeName);

  };

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showThemePicker && !event.target.closest('.theme-picker') && !event.target.closest('.theme-toggle-button')) {
        setShowThemePicker(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showThemePicker]);

  return (
    <ThemeProvider theme={themes[themeName]}>
      <CssBaseline /> {/* resets default browser styles */}
      
      {/* Main App Content */}
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative' 
      }} ref={ref}>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/*" element={<AuthPage />} />
            <Route path="/admin-page" element={<AdminPage />} />
            <Route path="/sec-n-auth" element={<SecNAuth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            
            <Route
              path="/user-app/*"
              element={
                <ProtectedRoute>
                  <UserApp />
                </ProtectedRoute>
              }
            >
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="projects" element={<Projects />} />
                <Route path="my-project" element={<MyProjectNull />} />
                <Route path="my-project/:projectId" element={<MyProject />} />
                <Route path="peerteams" element={<PeerTeams />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="profile" element={<Profile />} />
            </Route>

            <Route path="/teacher-app/*" element={<ProtectedRoute> <TeacherApp /> </ProtectedRoute>}>
              <Route path="dashboard" element={<TeacherDashboard />} />
              <Route path="classes" element={<TeacherClasses />} />
              <Route path="peer-teams" element={<PeerTeams />} />
              <Route path="analytics" element={<div>Analytics Page</div>} />
              <Route path="feedback" element={<Feedback />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Routes>
        </Router>

        {/* Theme Toggle Button */}
        <div className="theme-toggle-button">
          <ThemeToggleButton 
            theme={themes[themeName]}
            onClick={toggleThemePicker}
            isPickerOpen={showThemePicker}
          />
        </div>

        {/* Theme Picker */}
        {showThemePicker && (
          <div className="theme-picker">
            <ThemePicker 
              themes={themes}
              themeNames={themeNames}
              currentThemeName={themeName}
              onThemeChange={handleThemeChange}
              onClose={toggleThemePicker}
            />
          </div>
        )}
      </Box>
    </ThemeProvider>
  );
}