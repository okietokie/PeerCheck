import { useNavigate } from "react-router-dom";
import { HashLink as Link } from 'react-router-hash-link'; /*to link to a section in the same page*/
import './Navbar2.css';

function Navbar() {
    const navigate = useNavigate();
    const handleLogout = () => {
      localStorage.removeItem("token"); // remove JWT token if you’re using one
      navigate("/login");
    };
  return (
    <nav className='container'>
        <a className='peerCheck'>PeerCheck</a>

        <div className='nav-items'>
          <Link to="/" className='nav-item'>Home</Link>
          <Link smooth to="#the-3-hows" className='nav-item'>The 3 How's</Link>
          <Link smooth to="#reviews" className='nav-item'>Reviews</Link>
        </div>

        <button onClick={handleLogout} className='logout-btn'>
            Logout
        </button>
    </nav>
  )
}

export default Navbar
