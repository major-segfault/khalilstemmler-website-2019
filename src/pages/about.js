import React from 'react'
import PropTypes from 'prop-types'
import { StaticQuery, graphql } from 'gatsby'
import Layout from "../components/shared/layout"
import aboutImage from '../images/about/about-img-2.jpg'
import { SmallSubscribeForm, SubscribeForm } from '../components/subscribe'
import prose from '../assets/prose';

const AboutImage = () => (
  <img src={aboutImage}/>
)

const About = ({ content }) => (
  <Layout 
    title="About"
    seo={{
      title: 'About',
      keywords: ['khalil stemmler']
    }}
    component={(
      <div className="desktop-subscribe-form-container">
        <SmallSubscribeForm/>
      </div>
    )}>

    <AboutImage/>

    <div dangerouslySetInnerHTML={{ __html: content}}/>

    <SubscribeForm
      message={(
        <span>"I write about Advanced TypeScript & Node.js best practices for large-scale applications. Join <span className="special-green">{prose.subscriberCount}+</span> other aspiring developers learning how to write flexible, maintainable software with JavaScript."</span>
      )}
      buttonText="Submit"
    />
  
  </Layout>
)

export default () => (
  <StaticQuery
    query={graphql`
      query {
        markdownRemark(frontmatter: {templateKey: { eq: "about"}}) {
          html
        }
      }
    `}
    render={data => {
      const content = data.markdownRemark.html;
      return (
        <About
          content={content}
        />
      )
    }}
  />
)