
import React from 'react'
import PropTypes from 'prop-types'
import MobileNavigation from '../../mobile-navigation'
import Banner from "./Banner"
import "../styles/Navigation.sass"
import icon from '../../../../images/icons/mystery-icon.svg'
import NavLink from './NavLink'
import booksImg from '../../../../images/nav/books.png';
import newsletterImg from '../../../../images/nav/newsletter.png';

class Navigation extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      isBannerOpen: this.shouldBannerOpen(),
      scrolled: false,
    }

    this.navOnScroll = this.navOnScroll.bind(this);
    this.shouldBannerOpen = this.shouldBannerOpen.bind(this);
    this.closeBanner = this.closeBanner.bind(this);
    this.setBannerClosedExpiry = this.setBannerClosedExpiry.bind(this);
  }

  componentDidMount() {
    typeof window !== 'undefined' 
      && window.addEventListener('scroll', this.navOnScroll)
  }

  componentWillUnmount() {
    typeof window !== 'undefined' 
      && window.removeEventListener('scroll', this.navOnScroll)
  }

  navOnScroll () {
    if (window.scrollY > 20) {
      this.setState({ scrolled: true })
    } else {
      this.setState({ scrolled: false })
    }
  }

  setBannerClosedExpiry () {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 20)
    const object = { value: "banner-closed", timestamp: expiry }
    localStorage.setItem("banner-closed", JSON.stringify(object));
  }

  closeBanner () {
    this.setState({ 
      ...this.state,
      isBannerOpen: false 
    })
    this.setBannerClosedExpiry();
  }

  shouldBannerOpen () {
    if (typeof localStorage !== "undefined") { 
      const item = localStorage.getItem('banner-closed');
      if (item) {
        try {
          const expiry = JSON.parse(item);
          const expiryTime = new Date(expiry.timestamp);
          const now = new Date()
          const isStillExpired = (now.getTime() - expiryTime.getTime()) < 0;
          return !isStillExpired;
        } catch (err) {
          return true;
        }
      } else {
        return true;
      }
    }
  }

  render () {
    const { rawMode } = this.props;
    const { scrolled, isBannerOpen } = this.state;

    return (
      <>
      <MobileNavigation
        topOffset={isBannerOpen ? '44px' : '10px'}
      />
      <Banner 
        isOpen={isBannerOpen}
        onCloseBanner={this.closeBanner}
      />

      {!rawMode ? <div 
        style={{ marginTop: isBannerOpen ? '35px' : '0px'}}
        className={scrolled ? "navigation scroll" : "navigation"}>
        <div className="navigation-inner">
          <a className="logo" href="https://khalilstemmler.com/">
            <img src={icon}/>
            <p>khalil stemmler</p>
          </a>
    
          <div className="links">
            <NavLink to="/courses" displayValue="Courses"/>
            <NavLink to="/articles" displayValue="Articles"/>
            <NavLink 
              to="/books" 
              displayValue="Resources"
              dropdownTitle="All resources"
              dropdownLinks={[
                { 
                  icon: booksImg,
                  to: '/books', 
                  displayValue: 'Books', 
                  description: "Things you read to get smart" 
                },
                {
                  icon: newsletterImg,
                  to: '/newsletter',
                  displayValue: 'Newsletter',
                  description: `Get notified when new content comes out`
                }
              ]}
            />
            <NavLink to="/wiki" displayValue="Wiki"/>
          </div>
        </div>
      </div> : ''}
      </>
    )
  }
}

export default Navigation;

Navigation.propTypes = {
  rawMode: PropTypes.bool
}