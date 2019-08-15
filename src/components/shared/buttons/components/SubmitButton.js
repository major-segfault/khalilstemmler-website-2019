import React from 'react'
import PropTypes from 'prop-types'
import "../styles/SubmitButton.sass"
import { ClipLoader } from "react-spinners";

const COLOR = {
  GREEN: 'green'
}

const SubmitButton = ({ text, icon, onClick, loading, color, disabled }) => (
  <div 
    className={`submit-button ${color ? color : ''} ${disabled ? 'disabled' : ''}`} 
    onClick={onClick}>
    {loading ? <ClipLoader color={"#53a7d8"} loading={true} /> : text}
  </div>
)

export default SubmitButton;

SubmitButton.propTypes = {
  text: PropTypes.string.isRequired,
  icon: PropTypes.string,
  onClick: PropTypes.func.isRequired,
  color: PropTypes.string,
  disabled: PropTypes.bool
}