import React from 'react'
import PropTypes from 'prop-types'
import Modal from './Modal';
import { withMailchimpHOC } from '../../../../hocs'
import futureCourses from '../../../../images/courses/future-courses.svg'
import { SubmitButton } from '../../buttons';
import { TextInput } from '../../text-input'
import "../styles/GetNotifiedModal.sass"
import { MAILCHIMP_SEGMENTS } from '../../../../hocs/withMailchimpHOC';
import { navigateTo } from 'gatsby';

class GetNotifiedModal extends React.Component {
  constructor(props) {
    super(props);

    this.submitEmail = this.submitEmail.bind(this);
  }

  componentDidUpdate (prevProps) {
    if (!prevProps.submitted && this.props.submitted) {
      this.props.onClose()
      navigateTo('/best?prev=ddd-course');
    }
  }

  submitEmail () {

  }

  render () {
    const { firstName, lastName, email, submitted } = this.props;
    return (
      <Modal 
        isOpen={this.props.isOpen}
        onClose={this.props.onClose}
        className="get-notified-modal"
      >
        <div className="get-notified-inner-modal">
          { submitted ? (
            <>
              <h3>You're in!</h3>
              <h3>I'll keep you posted. Chat soon.</h3>
            </>
          ) : (
            <>
              <h3>I'm glad you're interested!</h3>
              <h3>Let's stay in touch. I'll let you know when new courses go live.</h3>
              <div className="image-container">
                <img src={futureCourses}/>
              </div>
              <TextInput
                value={firstName}
                placeholder="First name"
                type="text"
                onChange={(e) => this.props.onFormFieldChanged('firstName', e)}
              />
              <TextInput
                value={lastName}
                placeholder="Last name"
                type="text"
                onChange={(e) => this.props.onFormFieldChanged('lastName', e)}
              />
              <TextInput
                value={email}
                placeholder="Email"
                type="text"
                onChange={(e) => this.props.onFormFieldChanged('email', e)}
              />
              <SubmitButton 
                text="Get notified" 
                color="green" 
                onClick={() => this.props.submitForm(MAILCHIMP_SEGMENTS.courseSubscriber)}
              />
            </>
          )}
          
        </div>
      </Modal>
    )
  }
}

export default withMailchimpHOC(GetNotifiedModal);

GetNotifiedModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
}