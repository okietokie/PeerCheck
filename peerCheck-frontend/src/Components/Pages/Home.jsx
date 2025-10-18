import React from 'react'
import '../../Styles/Home.css'
import image1 from '../../assets/collaboration.jpg'
import { Link } from 'react-router-dom'

function Home() {
  return (
    <>
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
        <h1 className='section-heading'>The 3 How's of PeerCheck</h1>

      </div>
    </section>
    </>
  )
}

export default Home;