
const axios = require('axios');
const crypto = require('crypto');

/**
 * @desc Marshalls a comment into the format that
 * we need it, and adds the required attributes in
 * order for graphql to register it as a node.
 */

function processComment (comment) {
  const commentData = {
    name: comment.name,
    text: comment.comment,
    createdAt: comment.createdAt,
    url: comment.url,
    approved: comment.approved,
    parentCommentId: comment.parentCommentId,
  }

  return {
    ...commentData,
    // Required fields.
    id: comment.id,
    parent: null,
    children: [],
    internal: {
      type: `Comment`,
      contentDigest: crypto
        .createHash(`md5`)
        .update(JSON.stringify(commentData))
        .digest(`hex`),
    }
  }
}

exports.sourceNodes = async ({ actions }, configOptions) => {
  const { createNode } = actions
  // Create nodes here, generally by downloading data
  // from a remote API.
  try {
    const response = await axios.get(configOptions.url);
    const comments = response.data.comments;
    // Process data into nodes.
    comments.forEach(comment => createNode(processComment(comment)))
  } catch (err) {
    console.log(err);
  }
  
  return
}