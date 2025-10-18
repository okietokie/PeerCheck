import Navbar from "./Components/Navbar"
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; /*to route the different paths*/
import Home from './Components/Pages/Home';
import './App.css'


export default function App() {
  return (
    <Router>
      <Navbar /> {/* This will show on all pages */}
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

/*
import Navbar from "./Components/Navbar"

export default function App(){
  return(
    <div>
      <Navbar />
    </div>
  )
}*/