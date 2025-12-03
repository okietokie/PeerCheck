import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
//note: "children" is a keyworda special prop automatically provided to every component. It represents whatever you wrap inside that component in JSX.


export default function ProtectedRoute({ children }) {
    const navigate = useNavigate();
  
    useEffect(() => {
      if (!localStorage.getItem("token")) {
        alert("Session expired, please log in again!");
        navigate('/login');
      }
    }, [navigate]);
  
    return localStorage.getItem("token") ? children : null;
  }
  
