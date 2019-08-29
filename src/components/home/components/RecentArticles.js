import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'gatsby'
import arrowForward from '../../../images/icons/arrow-forward.svg'
import { StaticQuery, graphql } from "gatsby"
import { getPostsFromQuery } from '../../../utils/blog'
import { ArticlesContainer } from '../../shared/articles'

const RecentArticles = ({ articles }) => (
  <ArticlesContainer
    titleText="recent articles"
    subTitleComponent={(
      <Link 
        className="navigation-link" 
        to="/articles">view all <img src={arrowForward}/></Link>
    )}
    articles={articles}
  />
)

export default () => (
  <StaticQuery
    query={graphql`
      query RecentArticles {
        categories: allMarkdownRemark(
          filter: { frontmatter: { 
            templateKey: { eq: "article" },
            published: { eq: true }  } }
          limit: 10
        ) {
          edges {
            node {
              frontmatter {
                category
              }
            }
          }
        }
    
        tags: allMarkdownRemark(
          filter: { frontmatter: { 
            templateKey: { eq: "article" }, 
            published: { eq: true } 
          } }
          limit: 1000
        ) {
          edges {
            node {
              frontmatter {
                tags
              }
            }
          }
        }

        blogs: allMarkdownRemark(
          sort: { order: DESC, fields: [frontmatter___date] }
          filter: {
            frontmatter: {
              templateKey: { eq: "blog-post" }
              published: { eq: true }
              displayInArticles: { eq: true }
            }
          }
          limit: 1000
        ) {
          edges {
            node {
              fields {
                slug
                readingTime {
                  text
                }
              }
              frontmatter {
                title
                date
                updated
                description
                tags
                category
                image
              }
            }
          }
        }
    
        posts: allMarkdownRemark(
          sort: { order: DESC, fields: [frontmatter___date] }
          filter: {
            frontmatter: {
              templateKey: { eq: "article" }
              published: { eq: true }
            }
          }
          limit: 6
        ) {
          edges {
            node {
              fields {
                slug
                readingTime {
                  text
                }
              }
              frontmatter {
                title
                date
                description
                tags
                category
                image
              }
            }
          }
        }
      }
    `}
    render={data => {
      return (
        <RecentArticles
          articles={getPostsFromQuery(data.posts)
            .concat(getPostsFromQuery(data.blogs))
            .sort((a, b) => {
              return new Date(b.date) - new Date(a.date)
            })}
        />
      )
    }}
  />
)