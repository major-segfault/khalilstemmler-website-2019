import React from 'react'
import Layout from '../components/shared/layout';
import { StaticQuery, graphql } from "gatsby"
import { BlogsContainer } from '../components/shared/blogs';
import { getPostsFromQuery } from '../utils/blog';

const pageDescription = `Short form notes, thoughts, ideas 
& answers to frequently asked questions`;

class Blogs extends React.Component {

  getArticlesFromProps () {
    return getPostsFromQuery(this.props.posts);
  }

  render() {
    const posts = this.getArticlesFromProps();

    return (
      <Layout
        title="Blogs"
        subTitle={pageDescription}
        seo={{
          title: 'Blogs',
          description: pageDescription
        }}
      >
        <BlogsContainer
          titleText=""
          blogs={posts}
        />
      </Layout>
    )
  }
}

export default () => (
  <StaticQuery
    query={graphql`
      query Blogs {
        posts: allMarkdownRemark(
          sort: { order: DESC, fields: [frontmatter___date] }
          filter: {
            frontmatter: {
              templateKey: { eq: "blog-post" }
              published: { eq: true }
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
        <Blogs
          {...data}
        />
      )
    }}
  />
)