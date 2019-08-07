
import React from 'react'
import ResourceCard from './ResourceCard'
import bookLogo from '../../../images/book/book-logo.png'

const SolidBookResourceCard = () => (
  <ResourceCard
    image={bookLogo}
    smallTitle={`My book on Node.js / TypeScript software design and architecture just pre-launched 📕 (%33 off)!`}
    title={`SOLID: The Software Design & Architecture Handbook`}
    buttonText={"Presale $24.99"}
    onButtonClick={() => {
      if (typeof window !== undefined) {
        window.location.href = 'https://solidbook.io'
      }
    }}
  >
  </ResourceCard>
)

export default SolidBookResourceCard;