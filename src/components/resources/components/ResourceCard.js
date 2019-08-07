
import React from 'react'
import { SubmitButton } from '../../shared/buttons'
import '../styles/ResourceCard.sass'

const ResourceCard = ({ image, smallTitle, title, buttonText, onButtonClick }) => (
  <div className="resource-card">
    <div className="resource-card--image-container">
      <img src={image}/>
    </div>
    <p className="resource-card--small-title">{smallTitle}</p>
    <p className="resource-card--title">{title}</p>
    <SubmitButton text={buttonText} onClick={onButtonClick}/>
  </div>
)

export default ResourceCard;