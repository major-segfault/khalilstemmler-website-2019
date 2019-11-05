import React from 'react'
import { StaticQuery, graphql } from "gatsby"
import { Link } from 'gatsby'
import arrowForward from '../../../images/icons/arrow-forward.svg'
import { getPostsFromQuery } from '../../../utils/blog'
import { BlogsContainer } from '../../shared/blogs'

const RecentBlogs = ({ blogs }) => (
  <BlogsContainer
    titleText="recent blogs"
    subTitleComponent={(
      <Link className="navigation-link" to="/blog">view all <img src={arrowForward}/></Link>
    )}
    blogs={blogs}
  />
)

export default () => (
  <StaticQuery
    query={graphql`
      query RecentBlogs {    
        blogs: allMarkdownRemark(
          sort: { order: DESC, fields: [frontmatter___updated] }
          filter: {
            frontmatter: {
              templateKey: { eq: "blog-post" }
              published: { eq: true }
            }
          }
          limit: 4
        ) {
          edges {
            node {
              excerpt
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
        <RecentBlogs
          blogs={getPostsFromQuery(data.blogs)}
        />
      )
    }}
  />
)