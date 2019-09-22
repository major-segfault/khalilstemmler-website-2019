import React from 'react'
import Layout from "../../components/shared/layout"
import { ResourceType, FaqItem, AboutTheResourceAuthor, Gem } from '../../components/resources'
import { ResourceTypeConstant } from '../../components/resources/components/ResourceType'
import addToMailchimp from "stemmlerjs-gatsby-plugin-mailchimp";
import bugsnag from '../../services/bugsnag'
import "./SolidNodeArchitectureEbook.sass"

import bookCover from '../../images/resources/name-construct-structure/book-banner.png'
import bookBanner from '../../images/resources/name-construct-structure/banner.png'
import infoIcon from '../../images/icons/info.svg'
import { TextInput } from '../../components/shared/text-input';
import { SubmitButton } from '../../components/shared/buttons';
import { validateEmail } from '../../utils/validateEmail';
import { MailChimpAPIService, EmailAudienceTags } from '../../services/mailchimpAPIService';
import { contactService } from '../../services/contactService';

const pageTitle = 'Names, Construct & Structure: Organizing readable code';
const description = 'An approach to organizing large codebases to be readable and brain-friendly'
const pageKeywords = ['nodejs', 'typescript', 'organizing code', 'ebook']
const gems = [
  `Understand what makes codebases readable vs. non-readable`,
  `Learn tips for picking really good file and folder names to improve productivity`,
  `How to organize code to make it easier to maintain architectural boundaries`,
  `Understand what package by infrastructure is and why it creates "hard-to-scan" codebases`,
  'Learn how to "Package by Component" and develop features faster'
]

class NamesConstructStructure extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      firstName: '',
      lastName: '',
      email: '',
      isGetMoreResourcedChecked: true,
      loading: false,
      subscribed: false
    }

    this.onSubmit = this.onSubmit.bind(this);
    this.isFormValid = this.isFormValid.bind(this);
    this.updateSubscriptionStatus = this.updateSubscriptionStatus.bind(this);
  }

  onUpdateFormField = (fieldName, newValue) => {
    this.setState({
      ...this.state,
      [fieldName]: newValue
    });
  }

  updateSubscriptionStatus = (loading, subscribed) => {
    this.setState({ ...this.state, loading, subscribed })
  }

  onSubmit = () => {
    const { email, firstName, lastName, isGetMoreResourcedChecked } = this.state;

    if (this.isFormValid()) {
      this.updateSubscriptionStatus(true, false)
      setTimeout( async () => {
        try {
          await contactService.createOrUpdateContact(
            email, 
            isGetMoreResourcedChecked ? 'ncs-book-and-newsletter' : 'ncs-book',
            { firstName, lastName }
          )

          this.updateSubscriptionStatus(true, true);
          // go to best content
          this.props.navigate('/best?prev=ncs-book-subscription');
        } catch (err) {
          console.error(err);
          bugsnag.bugsnagClient.notify(err);
          alert('That didnt work... sad face.')
          this.updateSubscriptionStatus(false, false)
        }
      }, 100)
    }
  }

  isFormValid = () => {
    const { firstName, lastName, email } = this.state;

    // if (!!firstName === false) {
    //   alert('Whoops. You forgot your first name. 🤠');
    //   return false;
    // }

    // if (!!lastName === false) {
    //   alert('Whoops. You forgot your last name. 🤠');
    //   return false;
    // }

    if (email === "" || email === undefined || !validateEmail(email)) {
      alert('Whoops. Want to try that again with a valid email? 🤠')
      return false;
    }
    
    return true;
  }

  render () {
    const { email, firstName, lastName, isGetMoreResourcedChecked } = this.state;
    return (
      <>
        <Layout
          title={pageTitle}
          seo={{ 
            title: pageTitle, 
            description: description,
            keywords: pageKeywords,
            image: bookBanner
          }}
          rawMode={true}
          
        >
          <div className="solid-resource--page-container">
            <section className="solid-resource--book-section">
              <div className="book-section--cover-image-container">
                <img src={bookCover}></img>
              </div>
              <div className="book-section--faq-container">
                <div className="faq-container--image-container">
                  <img src={infoIcon}></img>
                </div>
                <h2>FAQ</h2>
              </div>
              <FaqItem
                question="Who is this book for?"
                answer={`It's for anyone who cares about structuring their codebases to be readable as more and more code gets added.`}
              />
              <FaqItem
                question="What's the main takeaway? What will I learn how to do?"
                answer={`You'll learn a few approaches towards naming files and folders to be able to find the code you need to change quickly.`}
              />
              <FaqItem
                question="How long is it?"
                answer="It's 31 pages and 3.1 MB of pure code organization bliss."
              />
              <FaqItem
                question="How long is this free for?"
                answer="Not sure! But get it now while it is :)"
              />
              <FaqItem
                question="Where can I find some real-world code organized like this?"
                answer={<span>I'm working on putting together a full open-source enterprise app that should serve as a really good example. Go <a href="https://github.com/stemmlerjs/white-label">fork it</a>.</span>}
              />
            </section>
            <section className="solid-resource--body">
              <ResourceType 
                type={ResourceTypeConstant.ebook}
                free={true}
              />
              <h1><i>Organize your code. Get more done, faster.</i></h1>
              <h2>{description}</h2>
              
              <h3>Get the free 32-page book.</h3>
              {/* <TextInput
                value={firstName}
                placeholder="First name"
                type="text"
                onChange={(val) => this.onUpdateFormField('firstName', val)}
              />
              <TextInput
                value={lastName}
                placeholder="Last name"
                type="text"
                onChange={(val) => this.onUpdateFormField('lastName', val)}
              /> */}
              <TextInput
                value={email}
                placeholder="Email"
                type="email"
                onChange={(val) => this.onUpdateFormField('email', val)}
              />
              <input 
                checked={isGetMoreResourcedChecked} 
                onClick={() => this.onUpdateFormField('isGetMoreResourcedChecked', !isGetMoreResourcedChecked)}
                type="checkbox"/> Send me the best Node.js, TypeScript and JavaScript software design resources as they're released
              <br/>
              <br/>
              <SubmitButton 
                text={"Get a free copy"}
                onClick={this.onSubmit}
                loading={this.state.loading}
              />
              <br/>
              <br/>
              { gems.map((g, i) => (<Gem key={i} text={g}/>)) }
            </section>
          </div>
        </Layout>
        <AboutTheResourceAuthor/>
      </>
    )
  }
}

export default NamesConstructStructure;