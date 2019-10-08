
import React from 'react'
import "../styles/AboutTheResourceAuthor.sass"
import me from '../../../images/khalil.jpeg'

const AboutTheResourceAuthor = ({ title }) => (
  <div className="about-the-resource-author">
    <h1>{ title ? title : 'About the author'}</h1>
    <div className="author--image-container">
      <img src={me}/>
    </div>
    <h2>
      Khalil Stemmler
    </h2>
    <p className="author-work-title">
    JavaScript consultant & 
    Ex co-founder @ Univjobs
    </p>
    
    <p className="author-details">Khalil is a software developer, designer and ex co-founder at Univjobs. He has 5+ years of experience 
writing software with Java, JavaScript, Node.js and as of late: TypeScript. He writes about software development
best practices with JavaScript & TypeScript and is especially passionate about Domain-Driven Design.</p>
  </div>
)

export default AboutTheResourceAuthor;