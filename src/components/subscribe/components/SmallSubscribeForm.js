import React from 'react'
import PropTypes from 'prop-types'
import "../styles/SmallSubscribeForm.sass"
import mysteryIcon from '../../../images/icons/mystery-icon.svg'
import { SubmitButton } from '../../shared/buttons';
import { detectEnterPress } from '../../../utils/enterPress';
import { validateEmail } from '../../../utils/validateEmail';
import prose from '../../../assets/prose'
import { contactService } from '../../../services/contactService';

class SmallSubscribeForm extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      email: '',
      submitted: false
    }

    this.submitForm = this.submitForm.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onFormFieldChanged = this.onFormFieldChanged.bind(this);

    this.getMessage = this.getMessage.bind(this);
    this.getSubMessage = this.getSubMessage.bind(this);
  }

  onKeyUp = (e) => {
    if (detectEnterPress(e)) {
      this.submitForm();
    } 
  }

  onFormFieldChanged = (fieldName, newValue) => {
    this.setState({
      ...this.state,
      [fieldName]: newValue
    })
  }

  submitForm = async () => {
    const { email } = this.state;
    if (email !== "" && email !== undefined && validateEmail(email)) {
      await contactService.createOrUpdateContact(email, 'subscribe-form');
      // alert(`Good stuff! I'll let you know when I have something good for you. Cheers, pal.`)
      this.setState({ ...this.state, submitted: true })
    } else {
      alert('Whoops. Want to try that again with a valid email? 🤠')
    }
  }

  getMessage () {
    const { message } = this.props;
    if (!!message) {
      return message;
    } else {
      return `Want to be notified when new advanced Node.js & TypeScript content is released?`
    }
  }

  getSubMessage () {
    const { subMessage } = this.props;
    if (!!subMessage) {
      return subMessage;
    } else {
      return `Join ${prose.subscriberCount}+ other aspiring developers`
    }
  }

  render () {
    const { submitted } = this.state;
    const message = this.getMessage();
    const subMessage = this.getSubMessage();

    return (
      <div className="small-subscribe-form">
        <div className="header">
            <div className="icon-container">
              <img src={mysteryIcon}/>
            </div>
            <div className="details">
              <p className="message">
                { message }
              </p>
              <p className="sub-message">{subMessage}</p>
            </div>
        </div>
        {
          submitted ? (
            <p className="form submitted">You're in!</p>
          ) : (
            <div className="form">
                <input 
                  onChange={(e) => this.onFormFieldChanged('email', e.target.value)}
                  onKeyUp={(e) => this.onKeyUp(e)} 
                  type="text" 
                  placeholder="Your email"
                />
                <SubmitButton 
                  text="Get updates"
                  onClick={() => this.submitForm()}
                />
              </div>  
          )
        }
        <br/>
        <br/>
      </div>
    )
  }
}

export default SmallSubscribeForm;

SmallSubscribeForm.propTypes = {
  message: PropTypes.string,
  subMessage: PropTypes.string
}