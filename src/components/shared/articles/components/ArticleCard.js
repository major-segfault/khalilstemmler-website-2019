import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'gatsby'
import { ArticleMeta } from '../../date-posted'
import AuthorCredit from './AuthorCredit'
import "../styles/ArticleCard.sass"
import { makeElipsedText } from '../../../../utils/blog'
import Authors from '../constants/AuthorConstants'
import { Tags } from '../../tags'
import ArticleCategory from './ArticleCategory'

export const GhostArticleCard = () => (
  <div style={{ height: '0px', minHeight: '0px'}} className="article-card"></div>
)

const ArticleCard = (props) => {
  const {
    title,
    image,
    slug,
    date,
    updated,
    category,
    description,
    tags,
    readingTime
  } = props;
  return (
    <div className="article-card">
      <Link to={slug} className="article-card--image-container">
        <img src={image}/>
      </Link>
      <div className="article-card--content">
        <Link to={slug} className="article-card--title">{title}</Link>
        <ArticleCategory category={category}/>
        <ArticleMeta 
          date={date} 
          readingTime={readingTime}
        />
        <Tags tags={tags}/>
        <div className="article-card--description">{makeElipsedText(description, 130)}</div>
        <AuthorCredit author={Authors.khalil}/>
      </div>
    </div>
  )
}

export default ArticleCard;

ArticleCard.propTypes = {
  title: PropTypes.string.isRequired,
  image: PropTypes.string,
  slug: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  category: PropTypes.string,
  description: PropTypes.string.isRequired,
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  readingTime: PropTypes.shape({
    text: PropTypes.string.isRequired
  }).isRequired
}

