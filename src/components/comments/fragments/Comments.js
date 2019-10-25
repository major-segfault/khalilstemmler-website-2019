import React from "react"
import { graphql } from "gatsby"

export const query = graphql`
  fragment CommentFields on Comment {
    approved
    createdAt
    id
    name
    text
    url
    parentCommentId
  }
`
