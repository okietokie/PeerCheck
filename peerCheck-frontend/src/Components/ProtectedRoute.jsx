import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';


export default function ProtectedRoute({children}) { //note: "children" is a keyworda special prop automatically provided to every component. It represents whatever you wrap inside that component in JSX.
    const navigate = useNavigate(); 
    const token = localStorage.getItem("token");

    useEffect(() => {
        if(!token){
            alert("Session expired, please log in again!");
            localStorage.clear();
            navigate('/login')
    }
    },[navigate, token]);

    return token ? children : null;

}
