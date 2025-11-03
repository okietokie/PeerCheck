
import { HashLink as Link } from 'react-router-hash-link'; /*to link to a section in the same page*/
import './Navbar.css';

function Navbar() {
  return (
    <nav className='container'>
        <a className='peerCheck'>PeerCheck</a>

        <div className='nav-items'>
          <Link to="/" className='nav-item'>Home</Link>
          <Link smooth to="#the-3-hows" className='nav-item'>The 3 How's</Link>
          <Link smooth to="#reviews" className='nav-item'>Reviews</Link>
        </div>

        <div className='sign-up-button'>
          <Link to="/login" className='login'>Log In</Link>
          <Link to="/sign-up" className='sign-up'>Sign Up</Link>
        </div>
    </nav>
  )
}

export default Navbar

/*
import React from 'react'
import '../Styles/Navbar.css'

function Navbar() {
  return (
    <nav className='container'>
        <a className='peerCheck'>PeerCheck</a>

        <div className='nav-items'>
          <a className='nav-item'>Home</a>
          <a className='nav-item'>The 3 How's</a>
          <a className='nav-item'>Reviews</a>
        </div>

        <div className='sign-up-button'>
          <a className='login'>Log In</a>
          <a className='sign-up'>Sign Up</a>
        </div>
    </nav>
  )
}

export default Navbar
*/