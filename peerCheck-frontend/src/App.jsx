// App.jsx
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState, lazy, Suspense } from "react";

import ProtectedRoute from "./Components/ProtectedRoute.jsx";
import { ThemeProvider } from "@mui/material/styles";
import { Box, CircularProgress, CssBaseline, SpeedDial, SpeedDialAction, SpeedDialIcon, alpha, useMediaQuery, useTheme } from "@mui/material"; // Added CssBaseline

import themes from './assets/theme.js';
import { useInView } from "react-intersection-observer";
import SeoHead from "./Components/SeoHead.jsx";

// Import new components
import ThemePicker from "./Components/ThemesComponents/ThemePicker.jsx";
import ThemeToggleButton from "./Components/ThemesComponents/ThemeToggleButton.jsx";
import { getThemeNames } from "./utils/themeUtils.js";
import TodoButtonDialog from "./Components/user-dashboard/HelperComp/ToDoList.jsx";
import { Palette, PlaylistAddCheck, NoteAlt, AddTask } from "@mui/icons-material";

const Home = lazy(() => import("./Components/Login/Home.jsx"));
const AuthPage = lazy(() => import("./Components/Login/AuthPage.jsx"));
const ForgotPassword = lazy(() => import("@/Components/Login/Helper Components/ForgotPassword.jsx"));
const ResetPassword = lazy(() => import("@/Components/Login/Helper Components/ResetPassword.jsx"));
const AdminPage = lazy(() => import("./Components/AdminComponents/AdminPage.jsx"));
const SecNAuth = lazy(() => import("./Components/AdminComponents/SecNAuth.jsx"));
const UserApp = lazy(() => import("./Components/user-dashboard/UserApp.jsx"));
const Tasks = lazy(() => import("./Components/user-dashboard/Tasks.jsx"));
const Projects = lazy(() => import("./Components/user-dashboard/Projects.jsx"));
const MyProject = lazy(() => import("./Components/user-dashboard/MyProject.jsx"));
const PeerTeams = lazy(() => import("./Components/user-dashboard/PeerTeams.jsx"));
const Profile = lazy(() => import("./Components/user-dashboard/Profile.jsx"));
const Dashboard = lazy(() => import("./Components/user-dashboard/Dashboard.jsx"));
const NotificationsPage = lazy(() => import("./Components/Notifications/NotificationsPage.jsx"));
const MyProjectNull = lazy(() => import("./Components/user-dashboard/MyProjectNull.jsx"));
const TeacherApp = lazy(() => import("./Components/teacher-dashboard/teacher-dash-app.jsx"));
const TeacherDashboard = lazy(() => import("./Components/teacher-dashboard/Dashboard.jsx"));
const TeacherClasses = lazy(() => import("./Components/teacher-dashboard/TeacherClasses.jsx"));
const Feedback = lazy(() => import("./Components/teacher-dashboard/Feedback.jsx"));

// Extract theme names dynamically
const themeNames = getThemeNames(themes);

function FloatingUtilities({
  themes,
  themeNames,
  themeName,
  showThemePicker,
  toggleThemePicker,
  handleThemeChange,
}) {
  const location = useLocation();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
  const [todoOpen, setTodoOpen] = useState(false);

  const isDashboardWorkspace =
    location.pathname.startsWith("/user-app") ||
    location.pathname.startsWith("/teacher-app");
  const isMyProjectRoute = location.pathname.startsWith("/user-app/my-project/");

  if (!isDashboardWorkspace) {
    return (
      <>
        <div className="theme-toggle-button">
          <ThemeToggleButton
            theme={themes[themeName]}
            onClick={toggleThemePicker}
            isPickerOpen={showThemePicker}
          />
        </div>

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
      </>
    );
  }

  const utilityActions = [
    {
      key: "theme",
      name: showThemePicker ? "Hide Theme Picker" : "Change Theme",
      icon: <Palette />,
      onClick: toggleThemePicker,
    },
    {
      key: "todos",
      name: "Quick Todos",
      icon: <PlaylistAddCheck />,
      onClick: () => setTodoOpen(true),
    },
    ...(isMyProjectRoute
      ? [
          {
            key: "notes",
            name: "Open Notes",
            icon: <NoteAlt />,
            onClick: () => window.dispatchEvent(new CustomEvent("myproject-open-notes")),
          },
          {
            key: "task",
            name: "Add Task",
            icon: <AddTask />,
            onClick: () => window.dispatchEvent(new CustomEvent("myproject-open-create-task")),
          },
        ]
      : []),
  ];

  return (
    <>
      <SpeedDial
        ariaLabel="Workspace quick actions"
        icon={<SpeedDialIcon />}
        direction="up"
        FabProps={{
          sx: {
            width: { xs: 54, sm: 58 },
            height: { xs: 54, sm: 58 },
            background: `linear-gradient(135deg, ${muiTheme.palette.primary.main} 0%, ${muiTheme.palette.secondary.main} 100%)`,
            color: muiTheme.palette.primary.contrastText,
            boxShadow: `0 10px 28px ${alpha(muiTheme.palette.primary.main, 0.32)}`,
            "&:hover": {
              background: `linear-gradient(135deg, ${muiTheme.palette.primary.dark} 0%, ${muiTheme.palette.secondary.dark} 100%)`,
            },
          },
        }}
        sx={{
          position: "fixed",
          right: { xs: 14, sm: 20 },
          bottom: {
            xs: "calc(14px + env(safe-area-inset-bottom, 0px))",
            sm: 20,
          },
          zIndex: muiTheme.zIndex.modal - 2,
        }}
      >
        {utilityActions.map((action) => (
          <SpeedDialAction
            key={action.key}
            icon={action.icon}
            tooltipTitle={action.name}
            tooltipOpen={!isMobile}
            onClick={action.onClick}
            FabProps={{
              sx: {
                bgcolor: alpha(muiTheme.palette.background.paper, 0.96),
                color: muiTheme.palette.primary.main,
                border: `1px solid ${alpha(muiTheme.palette.primary.main, 0.18)}`,
                "&:hover": {
                  bgcolor: alpha(muiTheme.palette.primary.main, 0.1),
                },
              },
            }}
          />
        ))}
      </SpeedDial>

      <TodoButtonDialog showTrigger={false} open={todoOpen} onOpenChange={setTodoOpen} />

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
    </>
  );
}

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

  const routeFallback = (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CircularProgress />
    </Box>
  );

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
          <SeoHead />
          <Suspense fallback={routeFallback}>
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
          </Suspense>

          <FloatingUtilities
            themes={themes}
            themeNames={themeNames}
            themeName={themeName}
            showThemePicker={showThemePicker}
            toggleThemePicker={toggleThemePicker}
            handleThemeChange={handleThemeChange}
          />
        </Router>
      </Box>
    </ThemeProvider>
  );
}
