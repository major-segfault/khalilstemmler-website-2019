/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

const bootstrapArticles = require('./bootstrap/bootstrap-articles');
const bootstrapWiki = require('./bootstrap/bootstrap-wiki');
const bootstrapBlogs  = require('./bootstrap/bootstrap-blogs')

exports.createPages = async ({ actions, graphql }) => {
  await bootstrapArticles.createPages(actions, graphql);
  await bootstrapWiki.createPages(actions, graphql);
  await bootstrapBlogs.createPages(actions, graphql);
}

exports.onCreateNode = ({ node, actions, getNode }) => {
  bootstrapArticles.onCreateNode(node, actions, getNode);
  bootstrapWiki.onCreateNode(node, actions, getNode);
  bootstrapBlogs.onCreateNode(node, actions, getNode);
}

exports.onCreateWebpackConfig = ({ stage, loaders, actions }) => {
  if (stage === "build-html") {
    actions.setWebpackConfig({
      module: {
        rules: [
          {
            test: /react-quill/,
            use: loaders.null(),
          },
        ],
      },
    })
  }
}