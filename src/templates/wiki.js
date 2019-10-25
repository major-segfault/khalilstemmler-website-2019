import React from 'react'
import PropTypes from 'prop-types'
import { graphql } from "gatsby"
import Layout from "../components/shared/layout"
import { Wiki } from '../components/wiki'
import { PageType } from '../components/shared/seo/PageType';

const WikiPost = (props) => {
  const { post } = props.data
  const { fields, frontmatter, html, excerpt } = post;
  const { slug } = fields;
  const {
    name,
    wikitags,
    wikicategory,
    image,
    date,
    updated
  } = frontmatter;
 
  let seoTags = wikitags ? wikitags : [];
  seoTags = seoTags.concat(wikicategory);

  const comments = props.data.comments.edges
    .filter((c) => slug.indexOf(c.node.url) !== -1)
    .map((c) => ({ ...c.node}));
  
  return (
    <Layout
      seo={{
        title: `${name}`,
        keywords: seoTags,
        description: excerpt,
        image: image ? image : null,
        pageType: PageType.ARTICLE,
        datePublished: date,
        dateModified: updated,
        slug
      }}
    >
      <Wiki
        {...fields}
        {...frontmatter}
        html={html}
        comments={comments}
      />
    </Layout>
  )
}

export default WikiPost;

export const wikiQuery = graphql`
  query WikiByID($id: String!) {
    post: markdownRemark(id: { eq: $id }) {
      id
      html
      excerpt(pruneLength: 160)
      fields {
        slug
        readingTime {
          text
        }
      }
      frontmatter {
        date
        updated
        wikitags
        name
        templateKey
        prerequisites
        wikicategory
        image
        plaindescription
      }
    }

    comments: allComment {
      edges {
        node {
          ...CommentFields
        }
      }
    }
  }
`