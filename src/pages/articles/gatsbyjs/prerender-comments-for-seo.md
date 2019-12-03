---
templateKey: article
title: "How to Prerender Comments | Gatsbyjs Guide"
date: '2019-10-25T10:04:10-05:00'
updated: '2019-10-25T10:04:10-05:00'
description: >-
  Prerendering dynamic data can have several advantages. For Gatsby blogs with high engagement, comments can positively impact SEO, helping people find the content found in conversations that they search for in Google. In this article, we look at how to prerender comments on your Gatsby site.
tags:
  - GatsbyJS
  - SEO
category: Web Development
image: /img/blog/gatsby/prerendering-comments.png
published: true
---

When Disqus comments [stopped being awesome](https://kinsta.com/blog/disqus-ads/), I was left without comments on my blog for a while. 

Not too long after, [Tania Rascia](https://taniarascia.com) wrote an awesome guide on how to "[Roll Your Own Comment](https://www.gatsbyjs.org/blog/2019-08-27-roll-your-own-comment-system/)" system. 

I hooked it up and people started leaving (mostly) productive comments. 

Today, I use the comments to answer questions about Domain-Driven Design, Clean Architecture, and Enterprise Node.js with TypeScript. They've been helpful in informing me what I should spend the majority of my time writing about. 

Not only that, but I tend to get some really good questions that really force me to think, and I enjoy the challenge of trying to make myself understood.

---

At some point I realized that lots of people might be asking the same questions that I get asked on my blog, so it would be a good idea if Google was able to see the comments when they index my site.

Because the comments are dynamic and get loaded by the client for each route, when Google crawls my site, it doesn't wait for the comments to load.

This is the problem that [prerendering](https://www.netlify.com/blog/2016/11/22/prerendering-explained/) solves.

In this article, I'm going to show you how you can prerender comments on your Gatsby blog.

## Prerequisites

- You're familiar with Gatsby, the site generator for React.
- You've read Tania's article, "[Roll Your Own Comment System](https://www.gatsbyjs.org/blog/2019-08-27-roll-your-own-comment-system/)"

## Create a GET /comments/all API route 

We're going to need to pull in all the comments everytime we build our Gatsby site.

This should be relatively straightforward if you've followed Tania's guide. A simple `SELECT *` will do just fine. And when you get a lot of comments, it would make sense to paginate the responses.

You might not need my help here, but for context, I'll show you how I did mine.

<p class="special-quote"><b>Note:</b> I use the <a href="/articles/enterprise-typescript-nodejs/clean-nodejs-architecture/">Clean Architecture approach</a> to separate the concerns of my code. Depending on amount of stuff your backend does, it might not be necessary.</p>

Using the [repository pattern](/articles/typescript-domain-driven-design/repository-dto-mapper/) to encapsulate potential complexity of interacting with a relational database, we can retrieve `comments` from our MySQL db by executing a raw query and mapping the results into `Comment` domain objects.

<div class="filename">comments/infra/repos/implementations/commentRepo.ts</div>

```typescript
export class CommentRepo implements ICommentRepo {
  ...
  getAllComments (): Promise<Comment[]> {
    const query = `SELECT * FROM comments ORDER BY created_at DESC;`;
    return new Promise((resolve, reject) => {
      this.conn.query(query, (err, result) => {
        if (err) return reject(err);
        return resolve(result.map((r) => CommentMap.toDomain(r)));
      })
    })
  }
}
```

<div class="filename">comments/domain/commentMap.ts</div>

```typescript
import { Comment } from "../models/Comment";

export class CommentMap {
  public static toDomain (raw: any): Comment {
    return {
      id: raw.id,
      name: raw.name,
      comment: raw.comment,
      createdAt: raw.created_at,
      url: raw.url,
      approved: raw.approved === 0 ? false : true,
      parentCommentId: raw.parent_comment_id
    }
  }
}
```

Then, all I have to do is create a new [use case](/articles/enterprise-typescript-nodejs/application-layer-use-cases/) called `GetAllComments` that does just that- gets all comments.

<div class="filename">comments/useCases/getAllComments/getAllComments.ts</div>

```typescript
import { ICommentRepo } from "../../../repos/CommentRepo";

export class GetAllComments {
  private commentRepo: ICommentRepo;

  constructor (commentRepo: ICommentRepo) {
    this.commentRepo = commentRepo;
  }

  async execute (): Promise<any> {
    const comments = await this.commentRepo.getAllComments();
    return comments;
  }
}
```

Now I'll write the controller:

<div class="filename">comments/useCases/getAllComments/getAllCommentsController.ts</div>

```typescript

import { GetAllComments } from "./GetAllComments";

export const GetAllCommentsController = (useCase: GetAllComments) => {
  return async (req, res) =>  {
    try {
      const comments = await useCase.execute();
      return res.status(200).json({ comments })
    } catch (err) {
      return res.status(500).json({ message: "Failed", error: err.toString() })
    }
  }
}
```

Hook everything up with some manual [Dependency Injection](/articles/tutorials/dependency-injection-inversion-explained/) and then export the controller.

<div class="filename">comments/useCases/getAllComments/index.ts</div>

```typescript
import { GetAllComments } from "./GetAllComments";
import { commentRepo } from "../../../repos";
import { GetAllCommentsController } from "./GetAllCommentsController";

const getAllComments = new GetAllComments(commentRepo);
const getAllCommentsController = GetAllCommentsController(getAllComments);

export {
  getAllCommentsController
}
```

Finally, I'll hook the controller up to our `comments` API (Express.js route).

<div class="filename">app.ts</div>

```typescript
import express from 'express';
import { getAllCommentsController } from '../../../useCases/admin/getAllComments';

const commentsRouter = express.Router();

...

commentsRouter.get('/all', 
  (req, res) => getAllCommentsController(req, res)
);

...

export {
  commentsRouter
}
```

### Testing fetching the comments

Push and deploy that code then try to get your comments! Here's what it looks like for me.

![](/img/blog/gatsby/fetched-comments-postman.png)

Nice! Now that we've **created the data source**, we need to <u>create a plugin</u> for Gatbsy so that it knows how to fetch it and then insert it into Gatsby's data layer so that we can prerender comments at build time.

## Creating a source plugin to source comments into Gatsby's data layer

A _source_ plugin is one of Gatsby's two types of plugins. _Source_ plugins simply pull in data from local or remote locations.

<p class="special-quote"><b>Essential Gatsby reading</b>: "<a href="https://www.gatsbyjs.org/docs/creating-a-source-plugin/">Creating a Source Plugin</a>".</p>

### Setup

As per the docs, we'll create a folder called `plugins`.

```bash
mkdir plugins
```

Inside that folder, let's create _another_ folder. This will be the name of the local plugin that we're about to write.

In order to not think about it, the docs also have a reference on [naming plugins](https://www.gatsbyjs.org/docs/naming-a-plugin/).

Let's name our plugin `gatsby-source-self-hosted-comments`.

```bash
cd plugins
mkdir gatsby-source-self-hosted-comments
```

In the new subfolder, let's initialize it as an npm project, add a few dependencies, and create a `gatsby-node` file.

```
cd gatsby-source-self-hosted-comments
npm init -y
npm install --save axios
touch gatsby-node.js
```

### Writing the plugin

The plugin needs to do two things.

1. Fetch the comments from our API.
2. Iterate through each comment and create a `Comment` graphql node for it.

<div class="filename">plugins/gatsby-source-self-hosted-comments/gatsby-node.js</div>

```javascript
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
  // Create nodes here.
  try {
    // We will include the API as a gatsby-config option when we hook the
    // plugin up. 
    const apiUrl = configOptions.url;
    // Fetch the data
    const response = await axios.get(apiUrl);
    const comments = response.data.comments;
    // Process data into nodes.
    comments.forEach(comment => createNode(processComment(comment)))
  } catch (err) {
    console.log(err);
  }

  return
} 
```

### Tell Gatsby to use the plugin

In order to use the newly written plugin, we need to add it to our `gatsby-config.js` in the root folder of our project.

The **name** that we use is the name of the _folder_ that we created in `plugins/`; that is- `gatsby-source-self-hosted-comments`.

<div class="filename">gatsby-config.js</div>

```javascript{4-9}
{
  ...
  plugins: [
    {
      resolve: `gatsby-source-self-hosted-comments`,
      options: {
        url: 'https://khalil-stemmler-backend.herokuapp.com/comments/all/'
      }
    },
  ...
}
```

### Test retrieving comments from Gatsby with the GraphiQL explorer

Gatsby comes with a GraphQL explorer that we can use to see the current data in Gatsby's data layer. 

In order to bring it up, let's first clear Gatsby's cache by running `gatsby clean` and then starting Gatsby locally with `gatsby develop`.

If you navigate to `localhost:8000/__graphql`, we can run an `allComment` query to return all the comments.

```graphql
{
  allComment {
    edges {
      node {
        name
        parentCommentId
        text
        url
        createdAt
        approved
      }
    }
  }
}
```

If all is well, you should see your comments!

![](/img/blog/gatsby/graphql-query.png)

Lovely. 

**Loading** comments into Gatsby on startup was the first step. Now we need to write some queries and hook up our prerendered comments to the blog post template.

## Updating the Blog Post template to load comments

Originally, the only thing the blog post template needed to load was the blog post that matches the `$id` provided at build time as context variables.

Now, we also want to load the comments. 

We can load them both by aliasing the `markdownRemark` as `post` and aliasing the `allComment` query as `comments`.

<div class="filename">templates/blog-post.js</div>

```javascript{3,24-30}
export const pageQuery = graphql`
  query BlogPostByID($id: String!) {
    post: markdownRemark(id: { eq: $id }) {
      id
      html
      fields {
        slug
        readingTime {
          text
        }
      }
      frontmatter {
        date
        updated
        title
        templateKey
        description
        tags
        image
        category
        anchormessage
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
```

In the same [file](https://github.com/stemmlerjs/khalilstemmler-website-2019/blob/aebe1ca8d338fefaf049fd1e2ad170f61207d023/src/templates/blog-post.js), we do 3 things to handle the query.

1. We deconstruct the `post` from `props.data`
2. We get the comments from the _current_ blog post by filtering in on the `slug`.
3. We pass the comments to our `Article` component.

<div class="filename">templates/blog-post.js</div>

```javascript{2-3,15-17,41}
const BlogPost = (props) => {
  const { post } = props.data
  const { fields, frontmatter, html } = post;
  const { slug } = fields;
  const {
    title,
    image,
    description,
    date,
    updated,
    category,
    tags
  } = frontmatter;

  const comments = props.data.comments.edges
    .filter((c) => slug.indexOf(c.node.url) !== -1)
    .map((c) => ({ ...c.node}));

  let seoTags = tags ? tags : [];
  seoTags = seoTags.concat(category);

  return (
    <Layout
      seo={{
        title,
        keywords: seoTags,
        image,
        description,
        pageType: PageType.ARTICLE,
        datePublished: date,
        dateModified: updated,
        slug,
        cardSize: TwittterCardSize.SMALL
      }}
    >
      <div className="article-layout-container">
        <Article
          {...fields}
          {...frontmatter}
          html={html}
          comments={comments}
        />
        <ArticleSideContent/>
      </div>
    </Layout>
  )
}
```

### Presenting prerendered data on the server and live data in production

The goal for us is to ensure that when the site is built on the server, it renders the pre-loaded content. <u>This is what's good for SEO</u>. That's the whole reason why we're doing this.

But we also want to make sure that when someone lands on a blog post, they're seeing the most up to date comments.

In the `Article` component, we feed the `comments` through to a `Comments` component.

<div class="filename">article.js</div>

```javascript{7}
export class Article extends React.Component {
  ...
  render () {
    return (
      <div>
        ...
        <Comments comments={comments}/>
      </div>
    )
  }
}
```

In the `Comments` component is where the action happens.

Here's the gist of it.

<div class="filename">comments.js</div>

```javascript

import PropTypes from 'prop-types'
import React from 'react';
import Editor from './Editor';
import Comment from './Comment';
import { TextInput } from '../../shared/text-input';
import { SubmitButton } from '../../shared/buttons';
import "../styles/Comments.sass"
import { commentService } from '../../../services/commentService';

export class Comments extends React.Component {
  constructor (props) {
    super(props);

    this.maxCommentLength = 3000;
    this.minCommentLength = 10;

    this.state = {
      isFetchingComments: true, 
      comments: [],
      name: '',
      commentText: '',
      commentSubmitted: false,
    }
  }

  ...

  async getCommentsFromAPI () {
    try {
      const url = window.location.pathname;
      this.setState({ ...this.state, isFetchingComments: true });
      const comments = await commentService.getComments(url);
      this.setState({ ...this.state, isFetchingComments: false, comments });
    } catch (err) {
      this.setState({ ...this.setState, isFetchingComments: false, comments: [] })
    }
  }

  componentDidMount () {
    this.getCommentsFromAPI();
  }

  sortComments (a, b) {
    return new Date(a.createdAt) - new Date(b.createdAt)
  }

  isReply (comment) {
    return !!comment.parentCommentId === true;
  }

  presentComments (comments) {
    const replies = comments.filter((c) => this.isReply(c));
    
    comments = comments
      .filter((c) => !this.isReply(c))
      .map((c) => {
        const commentReplies = replies.filter((r) => r.parentCommentId === c.id);
        if (commentReplies.length !== 0) {
          c.replies = commentReplies.sort(this.sortComments);
        };
        return c;
      })

    return comments
      .sort(this.sortComments)
  }

  getRealTimeComments () {
    return this.presentComments(this.state.comments);
  }

  getPrerenderedComments () {
    return this.presentComments(this.props.comments ? this.props.comments : []);
  }

  getComments () {
    return typeof window === 'undefined' 
      ? this.getPrerenderedComments() 
      : this.getRealTimeComments();
  }

  render () {
    const comments = this.getComments();
    const { commentText } = this.state;
    const numComments = comments.length;
    const hasComments = numComments !== 0;

    return (
      <div className="comments-container">
        <h3>{numComments} {numComments === 1 ? 'Comment' : 'Comments'}</h3>
        {!hasComments ? <p>Be the first to leave a comment</p> : ''}
        <TextInput
          placeholder="Name"
          value={this.state.name}
          onChange={(e) => this.updateFormField('name', e)}
        />
        <Editor 
          text={commentText}
          handleChange={(e) => this.updateFormField('commentText', e)}
          maxLength={3000}
          placeholder="Comment"
        />
        <SubmitButton
          text="Submit"
          // icon
          onClick={() => this.submitComment()}
          loading={false}
          disabled={!this.isFormReady()}
        />
        {comments.map((c, i) => <Comment {...c} key={i}/>)}
      </div>
    )
  }
}

Comments.propTypes = {
  comments: PropTypes.arrayOf(PropTypes.shape({
    approved: PropTypes.bool.isRequired,
    createdAt: PropTypes.string,
    id: PropTypes.string,
    name: PropTypes.string,
    text: PropTypes.string,
    url: PropTypes.string.isRequired
  }))
}
```

The idea is that the comments passed _to_ this component through `props` are <u>prerendered comments</u> while the comments that we retrieve and save to state by calling `getCommentsFromAPI()` within `componentDidMount()` are the <u>live, real-time comments</u>.

We can get the correct comments in context by testing to see if `window` is defined or not.

<div class="filename">comments.js</div>

```javascript
getComments () {
    return typeof window === 'undefined' 
      ? this.getPrerenderedComments() 
      : this.getRealTimeComments();
  }
```

If `window` isn't defined, then the code is running in a server; otherwise, it's being run by a real browser (in which case, we'd want to present the real-time comments).

That should do it!


## Verify that comments are preloaded

We can verify that comments are preloaded by creating a local build and then checking the resulting HTML in the `public` folder.

Build the site using `gatsby build`.

```bash
gatsby build
```

Then navigate to an `index.html` file for one of your blog posts that you know has comments. 

For me, I know that Igor left a comment on the [Domain-Driven Design Intro](/articles/domain-driven-design-intro/) article. 

Using `CMD + F` and searching for "Igor", I found it.

![](/img/blog/gatsby/igor.png)

--- 

## Conclusion

We just learned how to create a source plugin and prerender comments on a Gatsby site!

I've been a huge Gatsby fan ever since it came out, and I've really been enjoying how customizable these jam stack setups are.

If you're running a Gatsby website with some engagement and you've rolled your own commenting system, it wouldn't be a bad idea to improve your website's visibility this way.


## Resources

Check out the following resources:

- [Netlify - "Prerendering Explained"](https://www.netlify.com/blog/2016/11/22/prerendering-explained/ )
- [The source code for this blog](https://github.com/stemmlerjs/khalilstemmler-website-2019)
- [Tania's initial guide, "Roll Your Own Comment System"](https://www.gatsbyjs.org/blog/2019-08-27-roll-your-own-comment-system/)
- [Gatsby - Naming a Plugin](https://www.gatsbyjs.org/docs/naming-a-plugin/)
- [Gatsby - Creating a Source Plugin](https://www.gatsbyjs.org/docs/creating-a-source-plugin/)
