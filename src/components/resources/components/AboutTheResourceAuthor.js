
import React from 'react'
import "../styles/AboutTheResourceAuthor.sass"
import me from '../../../images/khalil-2.jpeg'
import authorConstants from '../../shared/articles/constants/AuthorConstants'

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
    {authorConstants.khalil.jobTitle}
    </p>
    
    <p className="author-details">{authorConstants.khalil.resourceLandingPageDescription}</p>
  </div>
)

export default AboutTheResourceAuthor;