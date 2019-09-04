import _ from 'underscore'
import { BlogCategoryType } from '../components/shared/blogs';

export function getCategoryIconAndBanner (category) {
  const hasItem = BlogCategoryType.hasOwnProperty(category);
  if (hasItem) return BlogCategoryType[category];
  
  return BlogCategoryType.Fallback;
}

export function getPostsFromQuery (posts) {
  if (posts) {
    return posts.edges
      .map(edge => edge.node)
      .map(node => Object.assign({}, node.frontmatter, node.fields))
  }

  return []
}

export function getCategoriesFromQuery(categories) {
  if (categories) {
    return _.uniq(
      categories.edges
        .map(edge => edge.node)
        .map(node => Object.assign({}, node.frontmatter))
        .map(c => c.category)
        .sort()
    )
  }
  return []
}

export function getTagsFromQuery (tags) {
  if (tags) {
    return _.uniq(
      tags.edges
        .map(edge => edge.node)
        .map(node => Object.assign({}, node.frontmatter))
        .reduce((acc, e) => acc.concat(e.tags), [])
        .sort()
    )
  }

  return []
}

export function makeElipsedText (text, maxLength) {
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + "..."
  } else {
    return text;
  }
}