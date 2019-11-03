
import React from 'react'
import SocialLinks from './SocialLinks'
import Currently from './Currently'
import me from '../../../images/khalil-2.jpeg'
import { SolidBookResourceCard } from '../../resources'
import "../styles/Home.sass"

class HomeComponentLeft extends React.Component {
  render () {
    return (
      <div className="home-column-left">
        <div className="intro">
          <div className="intro-card">
            <h1 className="intro-card--name">KHALIL STEMMLER</h1>
          </div>
          <div className="intro-picture-container">
            <img src={me}/>
          </div>
        </div>
        
        <SocialLinks 
          github={{ showDataCount: false }}
          twitter={{ showDataCount: false }}
        />
        <Currently/>
        <br/>
        <SolidBookResourceCard/>
      </div>
    )
  }
}

export default HomeComponentLeft;