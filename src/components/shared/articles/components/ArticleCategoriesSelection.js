
import React from 'react'
import { Link } from 'gatsby'
import { kebabCase } from 'lodash'
import "../styles/ArticlesCategoriesSelection.sass"

const ArticlesCategoriesSelection = ({ categories }) => (
  <div className="articles-categories-selection">
    <Link to="/articles">All</Link>
    {categories.map((category, i) => (
      <Link 
        activeClassName="active" 
        to={`/articles/categories/${kebabCase(category)}/`} 
        key={i}>{category}
      </Link>
    ))}
  </div>
)

export default ArticlesCategoriesSelection;