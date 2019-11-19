import React from 'react'
import PropTypes from 'prop-types'
import ReactDisqusComments from 'react-disqus-comments'
import { ArticleMeta } from '../../shared/date-posted'
import HTMLContent from '../../shared/HTMLContent'
import WikiBlockQuoteDesc from './WikiBlockQuoteDesc'
import { Feedback } from '../../../components/feedback'
import { SubscribeForm } from '../../../components/subscribe'
import "../styles/Wiki.sass"
import { HorizonalAd } from '../../shared/ads';
import { Comments } from '../../comments';

class Wiki extends React.Component {
  constructor (props) {
    super(props);
    this.getUniquePageIdentifier = this.getUniquePageIdentifier.bind(this);
  }

  getUniquePageIdentifier() {
    return typeof window !== 'undefined' && window.location.href
      ? typeof window !== 'undefined' && window.location.href
      : 'https://khalilstemmler.com'
  }

  render () {
    const { props } = this;
    const { 
      name, 
      plaindescription, 
      html, 
      image, 
      updated, 
      wikicategory, 
      readingTime, 
      wikitags, 
      excerpt, 
      slug,
      comments 
    } = props;
    return (
      <div className="wiki">
        <h1 className="wiki-title">{name}</h1>
        <ArticleMeta isUpdatedTime={true} date={updated} readingTime={readingTime}/>
        { image && <img className="wiki-image" src={image}/> }
        <WikiBlockQuoteDesc description={plaindescription}/>
        <br/>
        <hr/>
        <br/>
        <div className="wiki-content">
          <HTMLContent content={html}/>
        </div>
        <Comments comments={comments}/>
        <br/>
        <SubscribeForm/>
        <br/>
        <a href="https://solidbook.io">
          <img src="/img/resources/solid-book/book-banner.png"/>
        </a>
      </div>
    )
  }
}

export default Wiki;