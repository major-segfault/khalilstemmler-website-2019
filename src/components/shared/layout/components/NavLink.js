
import React from 'react'
import { Link } from 'gatsby';
import styled from "styled-components"
import "../styles/NavLink.sass"

const NavLinkContainer = styled.div`
  position: relative;

  :hover .nav-link-dropdown-container {
    display: block;
  }
`

const Dropdown = ({ dropdownLinks, dropdownTitle }) => (
  <div className="nav-link-dropdown-container">
    <div className="nav-link-dropdown">
      <div className="nav-link-dropdown-title">{dropdownTitle}</div>
      {dropdownLinks.map((dropdownLink, i) => (
        <Link to={dropdownLink.to} className="dropdown-link" key={i}>
          <div className="flex align-center dropdown-link-image-container">
            <img src={dropdownLink.icon}/>
          </div>
          <div className="dropdown-link-content-container">
            <div>{dropdownLink.displayValue}</div>
            <p>{dropdownLink.description}</p>
          </div>
        </Link>
      ))}
    </div>
  </div>
)

class NavLink extends React.Component {
  constructor (props) {
    super(props);
  }

  hasDropdown () {
    return this.props.dropdownLinks && this.props.dropdownTitle
  }

  render () {
    const { to, displayValue, dropdownLinks, dropdownTitle } = this.props;
    return (
      <NavLinkContainer>
        <Link 
          to={to}>{displayValue}
        </Link>
        {this.hasDropdown() ? (
          <Dropdown 
            dropdownLinks={dropdownLinks}
            dropdownTitle={dropdownTitle}
          />
        ) : ''}
      </NavLinkContainer>
    )
  }
}

export default NavLink;