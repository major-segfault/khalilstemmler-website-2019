import React from 'react'
import PropTypes from 'prop-types'
import "../styles/ArticlesNavigation.sass"
import { Link } from 'gatsby'
import { kebabCase } from 'lodash'
import { uniq } from 'lodash'
import { SmallSubscribeForm } from '../../../subscribe';

const ArticlesNavigation = ({ categories, tags }) => (
  <div className="categories">
    <div className="desktop-subscribe-form-container">
      <SmallSubscribeForm/>
    </div>
    {/* <div className="categories--parent-category">Categories</div>
    <Link to="/articles">All</Link>
    {categories.map((category, i) => (
      <Link 
        activeClassName="active" 
        to={`/articles/categories/${kebabCase(category)}/`} 
        key={i}>{category}
      </Link>
    ))} */}

    <br/>
    <div className="categories--parent-category">Tags</div>
    <div className="categories--tags-container">
      {uniq(tags)
        .filter((e) => !!e)
        .map((tag, i) => (
        <Link 
          activeClassName="active"
          to={`/articles/tags/${kebabCase(tag)}/`} 
          key={i}>#{tag}</Link>
      ))}
    </div>
    
  </div>
)

export default ArticlesNavigation;

ArticlesNavigation.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.string).isRequired
}
