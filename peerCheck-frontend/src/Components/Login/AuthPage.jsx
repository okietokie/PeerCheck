// src/Components/Login/AuthPage.jsx
import { Routes, Route, useLocation } from "react-router-dom";
import SignUp from "./Helper Components/Signup";
import Login from "./Login";


function AuthPage() {
  const location = useLocation();

  return (
      <Routes location={location} key={location.pathname}>

        <Route
          path="/sign-up"
          element={<SignUp />}
        />
        <Route
          path="/login"
          element={<Login />}
        />

      </Routes>
  );
}

export default AuthPage;
