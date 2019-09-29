import React from 'react'
import PropTypes from 'prop-types'
import Layout from "../components/shared/layout"
import aboutImage from '../images/about/about-img-2.jpg'
import { SmallSubscribeForm, SubscribeForm } from '../components/subscribe'
import prose from '../assets/prose';

const AboutImage = () => (
  <img src={aboutImage}/>
)

const About = () => (
  <Layout 
    title="About"
    seo={{
      title: 'About',
      keywords: ['khalil stemmler']
    }}
    component={<div className="desktop-subscribe-form-container">
      <SmallSubscribeForm/>
    </div>}>

    <AboutImage/>

    <h3>Howdy 🤠</h3>
    <p>I'm Khalil, a software developer / designer and (occassional) musician living in Oakville, Canada. </p>

    <p>
      In 2017, I co-founded <b>Univjobs</b> and learned a lot about <u>making large Node.js codebases scale</u>. At some point 
      during my work as a consultant and reading as many books on software as I could digest, 
      I came to realize that there were a lot of pitfalls I could have avoided if I knew 
      the patterns and principles to guide me. 
    </p>
    <br/>
    <h4>That's what this site is all about: how to write flexible and maintainable enterprise JavaScript.</h4>
    <br/>
    <p>
      <b>Who is this site for:</b> I'm working hard to create <span className="special-green">high-quality</span> content on <span className="special-green">advanced TypeScript + Node.js</span> topics for <span className="special-green">Junior JavaScript Developers</span> who:
      <ul>
        <li>won't tolerate writing any more buggy production code</li>
        <li>want to learn how to write maintainable, testable software</li>
        <li>want to fast-track their way to senior-level roles</li>
        <li>want to learn how to model complex object-oriented software with Node.js</li>
      </ul>
    </p>

    <hr></hr>

    <p>
      <b>A bit more:</b> I hold both a Bachelors Degree in <a href="https://brocku.ca/webcal/2013/undergrad/cncc.html">Computer Science</a> from 
      Brock University and a 
      Diploma in <a href="https://academics.sheridancollege.ca/programs/bachelor-of-computing-and-network-communications-honours-internet-communications-technology">Internet Communications Technology</a> from Sheridan College. 
    </p>
    
    <p>
      If you're interested in the <a href="/uses">tech stacks and tools I use</a>, you can find that out <a href="/uses">here</a>.
    </p>

    <p>
      When I'm not coding or <a href="/books">reading excellent software books</a>, I like to spend time with my
      beautiful girlfriend, write and record <a href="/music">music</a>, longboard, and jog around Oakville 🏃‍.
    </p>

    <h2>Stay in touch</h2>
    <SubscribeForm
      message={<span>"I write about Advanced TypeScript & Node.js best practices for large-scale applications. Join <span className="special-green">{prose.subscriberCount}+</span> other aspiring developers learning how to write flexible, maintainable software with JavaScript."</span>}
      buttonText="Submit"
    />
  
  </Layout>
)

export default About;