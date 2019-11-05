import React from 'react'
import PropTypes from 'prop-types'
import ArticleCard from './ArticleCard'
import { GhostArticleCard } from './ArticleCard'
import "../styles/ArticlesContainer.sass"
import { SubmitButton } from '../../buttons'

const ArticlesContainer = ({ articles, titleText, subTitleComponent, onLoadMore, articlesPerPage, currentPage, numArticles }) => (
  <div className="articles-container">
    { titleText ? <h3 className="light-header">{titleText}</h3> : ''}
    { subTitleComponent ? subTitleComponent : ''}
    <br/>
    <br/>
    <section className="articles">
      {articles.map((article, i) => (
        <ArticleCard {...article} key={i}/>
      ))}
      <GhostArticleCard/>
    </section>
    <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.4rem' }}>
      {
        (numArticles >= articlesPerPage) &&
        (articlesPerPage * currentPage <= numArticles) &&
         <SubmitButton text="Load more 👇" onClick={onLoadMore}/>
      }
    </div>
  </div>
)

export default ArticlesContainer;

ArticlesContainer.propTypes = {
  articles: PropTypes.array.isRequired,
  titleText: PropTypes.string.isRequired,
  subTitleComponent: PropTypes.any
}