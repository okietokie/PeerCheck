import './Home.css';
import image1 from './collaboration.jpg';
import { Link } from 'react-router-dom';
import Navbar from '../Login/Navbar/Navbar';

function Home() {
  return (
    <>
          <Navbar />

       <section className='container-1'>
      <div className='container-1-inner'>
        <div>
          <h1 className='home'>
            PeerCheck:Grow Together, Learn Together
          </h1>
          <p className='text-1'>
            The vibrant platform for students to get constructive feedback, spark creativity, and track their learning journey with friends.
          </p>
          <Link to='/sign-up' className='get-started'>Get Started</Link>
          
        </div>
          <img 
              src={image1} 
              alt="Students learning together" 
              className="image1"
            />

      </div>
    </section>
    <section id="the-3-hows">
      <div className='the-3-hows-inner'>
        <div>
          <h1 className='section-heading'>The 3 How's of PeerCheck</h1>
          <p className='tag-line'> Your questions, answered simply!</p>
        </div>

        <div className='three-boxes'>
          <div className='box'>
            <div className='circle'>
                  <i class='bx  bx-people-handshake'  ></i> 
            </div>

            <div className='section-sub-heading'>
              How it helps you
            </div>
            <p className='text-2'>
              PeerCheck is designed around the way students actually work together
            </p>
          </div>
          <div className='box'>
              <div className='circle'>
                <i class='bx  bx-directions'  ></i> 
              </div>
              <div className='section-sub-heading'>
                How to use it
              </div>
              <p className='text-2'>
                Go from zero to collaborative in under a minute
              </p>
          </div>
          <div className='box'>
            <div className='circle'>
                  <i class='bx  bx-shield'  ></i> 
            </div>

            <div className='section-sub-heading'>
              How it protects you
            </div>
            <p className='text-2'>
              We believe powerful collaboration shouldn't come at the cost of your security
            </p>
          </div>
        </div>
      </div>
    </section>
    

    <section className='how-it-protects'>
      <div className='the-3-hows-inner'>
        <div>
          <h1 className='section-heading-2'>How It Protects You</h1>
        </div>

        <div className='three-boxes'>
          <div className='box-2'>
            <div className='circle'>
                  <i class='bx  bx-people-handshake'  ></i> 
            </div>

            <div className='section-sub-heading'>
              Secure by Design
            </div>
            <p className='text-2'>
              Your password is always hashed, and your sessions are protected with industry-standard JWT authentication.
            </p>
          </div>
          <div className='box-2'>
              <div className='circle'>
                <i class='bx  bx-directions'  ></i> 
              </div>
              <div className='section-sub-heading'>
                Built with Integrity
              </div>
              <p className='text-2'>
                Your password is always hashed, and your sessions are protected with industry-standard JWT authentication.
              </p>
          </div>
          <div className='box-2'>
            <div className='circle'>
                  <i class='bx  bx-shield'  ></i> 
            </div>

            <div className='section-sub-heading'>
              Transparent Permissions
            </div>
            <p className='text-2'>
              Your password is always hashed, and your sessions are protected with industry-standard JWT authentication.
            </p>
          </div>
        </div>
      </div>

    </section>

    <section className='container-2'>
      <div className='container-2-inner'>
        <div className='content-holder'>
          <h2>Ready to Transform Your Learning Experience?</h2>
          <Link to='/sign-up' className='join-today'>Join PeerCheck Today</Link>
        </div>
      </div>
    </section>
    <footer className="footer">
      <div className="footer-container">
        {/* Logo and Tagline */}
        <div className="footer-section">
          <h2 className="footer-logo">PeerCheck</h2>
          <p className="footer-desc">
            Empowering students through peer collaboration and feedback.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h3 className="footer-title">Quick Links</h3>
          <ul className="footer-links">
            <li><Link to="/" className="footer-link">Home</Link></li>
            <li><Link to="/about" className="footer-link">About</Link></li>
            <li><Link to="/contact" className="footer-link">Contact</Link></li>
            <li><Link to="/faq" className="footer-link">FAQ</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-section">
          <h3 className="footer-title">Contact</h3>
          <p>Email: <a href="mailto:support@peercheck.com" className="footer-link">support@peercheck.com</a></p>
          <p>Phone: +971 123 456 789</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© 2025 PeerCheck. All rights reserved.</p>
      </div>
    </footer>
    </>
  )
}

export default Home;