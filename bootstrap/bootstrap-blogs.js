const path = require('path')
const _ = require('lodash')
const { createFilePath } = require('gatsby-source-filesystem')
const getBlogsData = require('./blogs/getBlogsData')
const axios = require('axios').default;

module.exports.onCreateNode = async (node, actions, getNode) => {
  const { createNodeField } = actions;

  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode });

    createNodeField({
      name: `slug`,
      node,
      value,
    })
  }
}

module.exports.createPages = async (actions, graphql) => {
  const { createPage } = actions;
  try {
    const blogData = await getBlogsData(graphql);

    const blogs = blogData.data.allMarkdownRemark.edges

    blogs.forEach(edge => {
      const id = edge.node.id
      createPage({
        path: edge.node.fields.slug,
        tags: edge.node.frontmatter.tags,
        component: path.resolve(
          `src/templates/blog-post.js`
        ),
        // additional data can be passed via context
        context: {
          id,
          slug: edge.node.fields.slug
        },
      })
    })

    // Tag pages:
    let tags = []
    let categories = []

    // Iterate through each post, putting all found tags into `tags`
    blogs.forEach(edge => {
      if (_.get(edge, `node.frontmatter.tags`)) {
        tags = tags.concat(edge.node.frontmatter.tags)
      }

      if (_.get(edge, `node.frontmatter.category`)) {
        categories.push(edge.node.frontmatter.category)
      }
    })

    // Eliminate duplicate tags
    tags = _.uniq(tags)

    categories = _.uniq(categories)

    // Make tag pages
    tags.forEach(tag => {
      const tagPath = `/articles/tags/${_.kebabCase(tag)}/`

      createPage({
        path: tagPath,
        component: path.resolve(`src/templates/tags.js`),
        context: {
          tag,
        },
      })
    })

    categories.forEach(category => {
      const categoryPath = `/articles/categories/${_.kebabCase(category)}/`

      createPage({
        path: categoryPath,
        component: path.resolve(`src/templates/categories.js`),
        context: {
          category,
        },
      })
    })
  } catch (err) {
    console.log(err);
    throw new Error(err);
  }
}