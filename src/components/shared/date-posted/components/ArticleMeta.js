import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import "../styles/ArticleMeta.sass"
import { createTwitterShareURL, createEditOnGitHubURL } from '../../../../utils/social';

const ArticleMeta = ({ date, title, readingTime, isUpdatedTime, editAndShare, url, slug }) => (
  <div className="date-posted">
    <div>
      {isUpdatedTime ? 'Updated ' : ''}{moment(date).format('MMM Do, YYYY')} / {readingTime ? readingTime.text : ''} 
      {editAndShare ? (
        <>
          {` / `}<a href={createTwitterShareURL(title, url)} target="_blank">Share</a>
          {` / `}<a href={createEditOnGitHubURL(slug)}>Edit on GitHub</a>
        </>
      ) : ''}
    </div>
  </div>
)

export default ArticleMeta;

ArticleMeta.propTypes = {
  date: PropTypes.string.isRequired,
  readingTime: PropTypes.shape({
    text: PropTypes.string.isRequired
  }).isRequired,
  isUpdatedTime: PropTypes.bool
}
