
import React from 'react'
import "../styles/ResourceItem.sass"

const ResourceItem = ({ name, description, image, url, contentType }) => (
  <a href={url} className="resource-item">
    <div className="resource-item--image-container">
      <img src={image} />
    </div>
    <div>
      <h2>{name}</h2>
      <span>{contentType}</span>
      <p>{description}</p>
    </div>
  </a>
)

export default ResourceItem;
