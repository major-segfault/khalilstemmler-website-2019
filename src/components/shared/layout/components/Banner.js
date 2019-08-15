
import PropTypes from "prop-types"
import React from "react"
import closeButton from '../../../../images/icons/close.svg'
import "../styles/banner.sass"

const messages = [
  <marquee direction="left" className="message">My TypeScript Software Design & Architecture book just prelaunched! Check out <a href="https://solidbook.io">solidbook.io</a>.</marquee>,
  // <marquee direction="left" className="message">No special messages at the moment. Just have a good day and stay hydrated!</marquee>,
  // <marquee direction="right" className="message">want to see a cool trick I can do? check out <Link to="/music/">my music</Link>.</marquee>,
  <div className="message">what the hell</div>
]


class Banner extends React.Component {
  constructor (props) {
    super(props);
  }

  render () {
    const { isOpen } = this.props;
    return (
      <>
        <header className={`${isOpen ? '' : 'closed'}`}>
          {messages[0]}
          <div onClick={() => this.props.onCloseBanner()} className="close-button">
            <img alt="Close" src={closeButton}></img>
          </div>
        </header>
      </>
    )
  }
}

Banner.propTypes = {
  siteTitle: PropTypes.string,
  isOpen: PropTypes.bool.isRequired,
  onCloseBanner: PropTypes.func.isRequired
}

Banner.defaultProps = {
  siteTitle: ``,
}

export default Banner
