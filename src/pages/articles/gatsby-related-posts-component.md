---
templateKey: article
title: "How to Build a Related Posts Component with Gatsby.js"
date: '2019-04-16T10:04:10-05:00'
updated: '2019-04-16T10:04:10-05:00'
description: >-
  Here's how to build a "Related Posts" component for your Gatsby.js site.
tags:
  - Gatsby
  - React
  - JavaScript
category: Web Development
image: /img/blog/gatsby-related-posts/related-posts.png
published: true
---

You know how some blogs have a section after reading an article that says "Related Posts" or "You might also like" (hint: check the bottom of this article 😜).

I wanted to make something like that for **my** [Gatsby](https://www.gatsbyjs.org/) site so I can present readers with other articles they might potentially be interested in.

*** 

## Who is this article for?

_This is a post for people who already know the basics of how to build sites with Gatsby.js + Netlify. If you're not familar with it yet, definitely check out [Gatsby](https://www.gatsbyjs.org/) and their [excellent tutorials](https://www.gatsbyjs.org/tutorial/). If you'd like ME PERSONALLY to educate you on the topic, make sure to [nag me](https://twitter.com/stemmlerjs) and I'll see what I can do._

## How we're going to do it

Since this is a site about **Design Patterns and Principles**, I'm going to show you one way to build something like this using the _very fancy_ **Builder Pattern** in a way that doesn't feel _fancy_ but feels _powerful_.

<iframe src="https://giphy.com/embed/O73g1gZXVyY6Y" width="100%" height="195" frameBorder="0" class="giphy-embed" allowFullScreen></iframe>

### High level explanation

On my site, I organize all of my blog posts as `Articles`.

Each `Article` has one `Category` and can have many `Tags`.

If you _haven't already_ figured out how to set up `tags` and `category`s, check out this [cool guide on how to do that](https://www.gatsbyjs.org/docs/adding-tags-and-categories-to-blog-posts/).

What I want to do is look at the **Categories** and **Tags** of all of my other articles and compute a **similarity score** with the _current article_ to determine which articles are most similar to it.

## Get Articles From a Graphql query

I've put together a `SimilarArticles.js` file that exposes a query (1.) of the same name. 

The query returns **every single article on my site**, pulling in all the attributes I need from the article (or as I've included in my template-url, `blog-post`) markdown files to render an article, including the `Category` and `Tags`.

```javascript
// SimilarArticles.js

import React from 'react'
import PropTypes from 'prop-types'
import { StaticQuery, graphql } from "gatsby"
import { getPostsFromQuery } from '../../../../utils/blog'
import ArticleCard from './ArticleCard'
import { SimilarArticlesFactory } from './SimilarArticlesFactory'
import "../styles/SimilarArticles.sass"

const SimilarArticlesComponent = ({ articles }) => (
  <section className="similar-articles">
    {articles.map((article, i) => (
      <ArticleCard {...article.article} key={i}/>
    ))}
  </section>
)

// (1.) Query for articles
export default (props) => (
  <StaticQuery
    query={graphql`
      query SimilarArticles {    
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
      const { category, tags, currentArticleSlug } = props;

      // (2.) Marshall the response into articles
      const articles = getPostsFromQuery(data.posts);

      // (3.) Use a SimilarArticlesFactory to get my similar articles
      const similarArticles = new SimilarArticlesFactory(
        articles, currentArticleSlug
      )
      .setMaxArticles(4)
      .setCategory(category)
      .setTags(tags)
      .getArticles()

      // (4.) Render it
      return (
        <SimilarArticlesComponent
          articles={similarArticles}
        />
      )
    }}
  />
)
```

After I get all of my queries, I marshall them all (2.) into actual articles. 

The Graphql responses are a little bit nested. Since I query articles often, I wrote a utility function to strip articles from a query.

## Rank articles with the SimilarArticlesFactory

At (3.), things get fun.

I pass in all of the `articles` in addition to the `currentArticleSlug` of THIS article.

From what gets returned, I'm able to call `setMaxArticles(num: number)`, `setCategories(category: string)`, and  `setTags(tags: string[])` before calling `getArticles()`.

This is what's known as the **builder** pattern. 

It works by returning `this` _after calling the setter_.

It's a Creational pattern that allows you to create objects in a more declarative way.

Let's look at the `SimilarArticlesFactory.js`.

```javascript
// SimilarArticlesFactory.js
import { includes, orderBy } from 'lodash'

export class SimilarArticlesFactory {
  // (1.) Create by passing in articles, currentSlug
  constructor (articles, currentArticleSlug) {
    // (2.) Don't include the current article in articles list
    this.articles = articles.filter(
      (aArticle) => aArticle.slug !== currentArticleSlug);

    this.currentArticleSlug = currentArticleSlug;
    // (3.) Set default values
    this.maxArticles = 3;
    this.category = null;
    this.tags = []
  }

  // (4.) Builder pattern usage
  setMaxArticles (m) {
    this.maxArticles = m;
    return this;
  }

  setCategory (aCategory) {
    this.category = aCategory;
    return this;
  }

  setTags (tagsArray) {
    this.tags = tagsArray;
    return this;
  }

  getArticles () {
    const { category, tags, articles, maxArticles } = this;
    // (5.) We use an Identity Map to keep track of score
    const identityMap = {};

    if (!!tags === false || tags.length === 0) {
      console.error('SimilarArticlesFactory: Tags not provided, use setTags().')
      return [];
    }

    if (!!category === false) {
      console.error('SimilarArticlesFactory: Category not provided, use setCategory().')
      return [];
    }

    function getSlug (article) {
      return article.slug;
    }

    function addToMap (article) {
      const slug = getSlug(article);
      if (!identityMap.hasOwnProperty(slug)) {
        identityMap[slug] = {
          article: article,
          points: 0
        }
      }
    }

    // (7.) For category matches, we add 2 points
    function addCategoryPoints (article, category) {
      const categoryPoints = 2;
      const slug = getSlug(article);

      if (article.category === category) {
        identityMap[slug].points += categoryPoints;
      }
    }

    // (8.) For tags matches, we add 1 point
    function addTagsPoints (article, tags) {
      const tagPoint = 1;
      const slug = getSlug(article);
      
      article.tags.forEach((aTag) => {
        if (includes(tags, aTag)) {
          identityMap[slug].points += tagPoint;
        }
      })
    }

    function getIdentityMapAsArray () {
      return Object.keys(identityMap).map((slug) => identityMap[slug]);
    }
    
    // (6.) Map over all articles, add to map and add points
    for (let article of articles) {
      addToMap(article);
      addCategoryPoints(article, category);
      addTagsPoints(article, tags)
    }
    
    // (9.) Convert the identity map to an array
    const arrayIdentityMap = getIdentityMapAsArray();

    // (10.) Use a lodash utility function to sort them 
    // by points, from greatest to least
    const similarArticles = orderBy(
      arrayIdentityMap, ['points'], ['desc']
    )

    // (11. Take the max number articles requested)
    return similarArticles.splice(0, maxArticles);
  }
}
```

The most interesting parts of this class are the **setters**, that return `this`, which allows that nice **method chaining** we saw earlier, and the `getArticles()` method.

We mentioned that we wanted to score articles based on similarity, right?

Well, this is one way we can do it.

I map over all of the articles (6.) and add them to an **Identity Map** (which is a fancy term for a hash table or a JavaScript object).

![Identity Map](/img/blog/gatsby-related-posts/screencap.png)
<div class="caption">The identity map ends up looking a bit like this. An object with slugs as it's keys.</div>

The way we identify two articles is by their `slug`.

While I'm doing that, I also look at the category for each article (7.).

If the current article has the **category** in common with this article that we're looping over, then we give it **2 points**.

We do the same thing for tags (8.) but instead, we give the article **1 point** for each tag that it has that's also in the current article.

At the end, we turn the entire thing into an array (9.) and then sort all of the articles (10. using lodash) from most to least points before slicing off the `maxArticles` requested, which was 4.

*** 

That's pretty much it! That's how you can build your own Similar Articles/Posts component with Gatsby.js.

It's a pretty common thing to see on blogs but I haven't seen it much in other Gatsby.js sites, because it doesn't come right out of the box.

*** 

## Need more?

Scroll down a little bit to see it in action!

## Need even more?

You can [view all of the source code for this site](https://github.com/stemmlerjs/khalilstemmler-website-2019) on GitHub, it's fully open-sourced.

