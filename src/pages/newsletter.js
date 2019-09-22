import React from 'react'
import Layout from "../components/shared/layout"
import { SmallSubscribeForm } from '../components/subscribe';

class NewsletterPage extends React.Component {
  constructor (props) {
    super(props);
  }

  componentWillMount () {

  }

  render () {

    return (
      <Layout 
        seo={{ title: "Newsletter", keywords: [] }}
        rawMode={false}>
          <div className="newsletter-page">
            <SmallSubscribeForm/>
          </div>
      </Layout>
    );
  }
}

export default NewsletterPage;