import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'gatsby'
import "../styles/BlogCard.sass"
import { ArticleMeta } from '../../date-posted';
import { getCategoryIconAndBanner } from '../../../../utils/blog';

const BlogCard = (props) => {
  const categoryIconAndBanner = getCategoryIconAndBanner(props.category);
  return (
    <div className="blog-card">
      <div className="icon-container">
        <img src={categoryIconAndBanner.icon}/>
      </div>
      <div className="blog-card-details">
        <Link className="blog-card-title" to={props.slug}>{props.title}</Link>
        <ArticleMeta 
          date={props.date} 
          readingTime={props.readingTime}
        />
        <p>{props.excerpt}</p>
      </div>
    </div>
  )
}

export default BlogCard;

BlogCard.propTypes = {
  category: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  readingTime: PropTypes.shape({
    text: PropTypes.string
  }).isRequired,
  slug: PropTypes.string.isRequired,
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  title: PropTypes.string.isRequired,
}