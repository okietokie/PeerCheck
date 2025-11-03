// Signup.jsx
import { useState } from "react";  //brings in the useState Hook from react, helps keep and update values
import axios from "axios";  //imports axios -->helps HTTP client to send requests to your backend 
import { useNavigate, Link } from "react-router-dom";  //useNavigate returns a function that programatically change route, eg: go to /login from /signup
import "./AuthPage.css";
import Navbar from "./Navbar/Navbar";


export default function Signup() {

//formdata + message
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    dob: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {  //e stands for event, a parameter inthe arrow function 
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault(); //prevents the browser from doing a full page reload when the form submits (default form behaviour).
    try { 
      const res = await axios.post("http://localhost:5000/api/auth/register", formData);
      //await, asks program to wait 
      //axios.post("http://localhost:5000/api/auth/register", formData), 
        //sends an HTTP POST to backend endpoint,
        //the route is "/api/auth/register"
        //formData object is sent as JSON to backend endpoint
        //backend accepts this data and creates a new user

      setMessage(res.data.message); //updates the message from server like "user registered succcessfully"

      navigate("/login"); // move to login after success
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <>
    <Navbar />
     <div className="auth-container">
      <div className="auth-box">
        <h2>Create Account</h2>
      <form onSubmit={handleSignup}>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="username"
          placeholder="How would you like for us to address you?"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="dob"
          placeholder="DD/MM/YYYY"
          value={formData.dob}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Create Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Sign Up</button>
      </form>

      {message && <p>{message}</p>}
        <p>
          Already have an account? <Link to="/login">Login →</Link>
        </p>
      </div>
    </div>
    </>

  );
}

