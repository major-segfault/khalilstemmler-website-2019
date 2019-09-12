import React from 'react'
import Layout from "../components/shared/layout"
import { StaticQuery, graphql } from "gatsby"
import { 
  ArticlesNavigation, 
  ArticlesContainer 
} from '../components/shared/articles'
import { 
  getCategoriesFromQuery, 
  getPostsFromQuery, 
  getTagsFromQuery 
} from '../utils/blog'
import { PageType } from '../components/shared/seo/PageType';
import { kebabCase } from 'lodash'
import ArticlesFilter from '../components/shared/articles/components/ArticlesFilter';
import ArticlesCategoriesSelection from '../components/shared/articles/components/ArticleCategoriesSelection';

export class Articles extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      filterText: '',
    }

    this.isCategoryPage = this.isCategoryPage.bind(this);
    this.getActivePageContext = this.getActivePageContext.bind(this);
    this.getArticlePageTitle = this.getArticlePageTitle.bind(this)
    this.getArticlesFromProps = this.getArticlesFromProps.bind(this);
    this.getSEOTitle = this.getSEOTitle.bind(this);
    this.isTagsOrCategoriesPage = this.isTagsOrCategoriesPage.bind(this);
  }

  isCategoryPage () {
    return this.props.isCategoryPage
  }

  isTagsPage () {
    return this.props.isTagsPage;
  }

  getActivePageContext () {
    return this.isCategoryPage() 
      ? this.props.pageContext.category 
      : this.isTagsPage() 
        ? this.props.pageContext.tag 
        : ''
  }

  getArticlePageTitle () {
    const articles = this.getArticlesFromProps();
    const isCategoriesPage = this.isCategoryPage();
    const isTagsPage = this.isTagsPage();

    if (isCategoriesPage || isTagsPage) {
      if (articles.length === 1) {
        return `Showing 1 article about "${this.getActivePageContext()}"`
      } else {
        return `Showing ${articles.length} article(s) about "${this.getActivePageContext()}"`
      }
    } else {
      return "";
    }
  }

  getArticles () {
    return this.filterArticles(
      this.getArticlesFromProps()
    )  
  }

  isFilterActive () {
    return this.state.filterText !== "";
  }

  filterArticles (articles) {
    if (this.isFilterActive()) {
      let filterText = this.state.filterText.toLowerCase();
      return articles.filter((a) => {
        const inDescription = a.description.toLowerCase().indexOf(filterText) !== -1;
        const inSlug = a.slug.toLowerCase().indexOf(filterText) !== -1;
        const inCategory = a.category.toLowerCase().indexOf(filterText) !== -1;;
        const inTitle = a.title.toLowerCase().indexOf(filterText) !== -1;;
        const inTags = a.tags.filter((t) => t.toLowerCase().indexOf(filterText) !== -1).length !== 0;
        return inDescription || inSlug || inCategory || inTitle || inTags;
      })
    } else {
      return articles;
    }
  }

  getArticlesFromProps () {
    return getPostsFromQuery(this.props.posts)
      .concat(getPostsFromQuery(this.props.blogs))
      .sort((a, b) => {
        return new Date(b.date) - new Date(a.date)
      });
  }

  isTagsOrCategoriesPage () {
    const isCategoriesPage = this.isCategoryPage();
    const isTagsPage = this.isTagsPage();

    return isCategoriesPage || isTagsPage;
  }

  getSEOTitle () {    
    if (this.isTagsOrCategoriesPage()) {
      return this.getActivePageContext();
    } else {
      return "Articles"
    }
  }

  getSEOTags () {
    if (this.isTagsOrCategoriesPage()) {
      return [this.getActivePageContext()]
    } else {
      return ['javascript', 'typescript', 'domain-driven design', 'enterprise', 'nodejs']
    }
  }

  getDescription () {
    if (this.isTagsOrCategoriesPage()) {
      return `Articles about ${this.getActivePageContext()}.`
    } else {
      return `Articles, guides, discussions and tutorials on JavaScript, TypeScript, software design 
      principles, patterns and enterprise applications.`
    }
  }

  getBreadcrumbs () {
    // TODO: Move this to it's own class, and then ensure that we also add breadcrumbs to
    // the blog posts themselves. We can use the categories key. 
    // https://support.google.com/webmasters/forum/AAAA2Jdx3sUqjfjatzuOZY/?hl=en&msgid=cXcjRYk2EwAJ&gpf=d/msg/webmasters/qjfjatzuOZY/cXcjRYk2EwAJ
    
    if (this.isTagsOrCategoriesPage()) {
      const isTagsPage = this.isTagsPage();

      const contextElement = isTagsPage ? "tags" : "categories";
      const contextValue = this.getActivePageContext();
    
      return [
        { 
          "@type": "ListItem",
          "position": 1,
          "name": "Articles",
          "item": "https://khalilstemmler.com/articles"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": isTagsPage ? "Tags" : "Categories",
          "item": `https://khalilstemmler.com/articles/${contextElement}/`
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": contextValue,
          "item": `https://khalilstemmler.com/articles/${contextElement}/${kebabCase(contextValue)}`
        }
      ]
    } else {
      return []
    }
  }

  getPageType () {
    if (this.isTagsOrCategoriesPage()) {
      return PageType.BREADCRUMB;
    } else {
      return PageType.REGULAR;
    }
  }
  
  onFilterTextChanged (text) {
    this.setState({ ...this.state, filterText: text })
  }

  render () {
    const articles = this.getArticles();
    const categories = getCategoriesFromQuery(this.props.categories);
    const tags = getTagsFromQuery(this.props.tags);

    return (
      <Layout 
        title="Articles"
        seo={{
          title: this.getSEOTitle(),
          keywords: this.getSEOTags(),
          description: this.getDescription(),
          pageType: this.getPageType(),
          breadcrumbs: this.getBreadcrumbs()
        }}
        component={(
          <ArticlesNavigation 
            categories={categories} 
            tags={tags}
          /> 
        )}>

          <ArticlesCategoriesSelection
            categories={categories} 
          />

          <ArticlesFilter
            count={articles.length}
            filterText={this.state.filterText}
            onChange={(text) => this.onFilterTextChanged(text)}
          />

          <ArticlesContainer
            titleText={this.getArticlePageTitle()}
            articles={articles}
          />

      </Layout>
    )
  }
}

export default () => (
  <StaticQuery
    query={graphql`
      query Articles {
        categories: allMarkdownRemark(
          filter: { frontmatter: { 
            templateKey: { eq: "article" },
            published: { eq: true }  } }
          limit: 1000
        ) {
          edges {
            node {
              frontmatter {
                category
              }
            }
          }
        }
    
        tags: allMarkdownRemark(
          filter: { frontmatter: { 
            templateKey: { eq: "article" }, 
            published: { eq: true } 
          } }
          limit: 1000
        ) {
          edges {
            node {
              frontmatter {
                tags
              }
            }
          }
        }
    
        posts: allMarkdownRemark(
          sort: { order: DESC, fields: [frontmatter___date] }
          filter: {
            frontmatter: {
              templateKey: { eq: "article" }
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
                updated
                description
                tags
                category
                image
              }
            }
          }
        }

        blogs: allMarkdownRemark(
          sort: { order: DESC, fields: [frontmatter___date] }
          filter: {
            frontmatter: {
              templateKey: { eq: "blog-post" }
              published: { eq: true }
              displayInArticles: { eq: true }
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
                updated
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
        <Articles
          {...data}
        />
      )
    }}
  />
)