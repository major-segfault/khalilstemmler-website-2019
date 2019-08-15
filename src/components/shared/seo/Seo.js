import React from "react"
import PropTypes from "prop-types"
import Helmet from "react-helmet"
import { StaticQuery, graphql } from "gatsby"
import { JSONLD } from './jsonld'
import { PageType } from "./PageType";
import { TwittterCardSize } from "./CardSize";

class SEO extends React.Component {
  constructor (props) {
    super(props);

    this.getDatePublished = this.getDatePublished.bind(this);
    this.getDateModified = this.getDateModified.bind(this);
    this.getKeywords = this.getKeywords.bind(this);
    this.getUrl = this.getUrl.bind(this);
    this.getImage = this.getImage.bind(this);
    this.getJSONLDMarkdown = this.getJSONLDMarkdown.bind(this);
    this.getTitle = this.getTitle.bind(this);
    this.getCardSize = this.getCardSize.bind(this);

    this.JSONLD = new JSONLD();
  }

  getJSONLDMarkdown () {
    const title = this.getTitle();
    const description = this.getDescription();
    const image = this.getImage();
    const datePublished = this.getDatePublished();
    const dateModified = this.getDateModified();

    const { pageType } = this.props;

    switch (pageType) {
      case PageType.BREADCRUMB:
        return this.getBreadcrumbs();
      case PageType.ARTICLE:
        return this.JSONLD.createArticleMarkdown(title, description, image, datePublished, dateModified, this.getUrl())
      default:
        return "";
    }
    return 
  }

  getBreadcrumbs () {
    const breadcrumbs = this.props.breadcrumbs;
    return breadcrumbs && breadcrumbs.length !== 0 ? breadcrumbs : [];
  }

  getDateModified () {
    return this.props.dateModified;
  }

  getDatePublished () {
    return this.props.datePublished;
  }

  getKeywords () {
    const { keywords } = this.props;
    return keywords.length > 0
    ? {
        name: `keywords`,
        content: keywords.join(`, `),
      }
    : []
  }

  getUrl () {
    const { slug, siteMetadata } = this.props;
    if (slug) {
      return `https://khalilstemmler.com${slug}`
    } else {
      return siteMetadata.siteUrl;
    }
  }

  getDescription () {
    const { siteMetadata, description } = this.props;
    return description || siteMetadata.description; 
  }

  getImage () {
    const { siteMetadata, image } = this.props;
    if (image) {
      return `https://khalilstemmler.com${image}`;
    } else {
      return siteMetadata.logo;
    }
  }

  getTitle () {
    const { siteMetadata, title } = this.props;
    return title || siteMetadata.title;
  }

  getTemplateTitle () {
    const { siteMetadata } = this.props;
    return siteMetadata.title;
  }

  getCardSize () {
    const { cardSize } = this.props;
    switch (cardSize) {
      case TwittterCardSize.SMALL:
        return TwittterCardSize.SMALL;
      case TwittterCardSize.LARGE:
        return TwittterCardSize.LARGE
      default:
        return TwittterCardSize.SMALL
    }
  }

  render () {
    const { siteMetadata, meta } = this.props;
    const title = this.getTitle();
    const templateTitle = this.getTemplateTitle();
    const description = this.getDescription();
    const image = this.getImage();
    const jsonLDMarkdownRaw = this.getJSONLDMarkdown();
    const url = this.getUrl();
    const { exactTitle } = this.props;
    const cardSize = this.getCardSize();

    return (
      <Helmet
        htmlAttributes={{
          lang: 'en'
        }}
        title={title}
        titleTemplate={exactTitle ? null : `%s | ${templateTitle}`}
        link={[
          { rel: 'canonical', href: url }
        ]}
        meta={[
          { name: "image", content: image },
          // General tags
          { name: `description`, content: description },

          // Opengraph tags
          { property: `og:title`, content: title },
          { property: `og:image`, content: image },
          { property: `og:description`, content: description },
          { property: `og:type`, content: `website` },
          { property: `og:url`, content: url },

          // Twitter cards
          { name: `twitter:card`, content: cardSize },
          { name: `twitter:creator`, content: siteMetadata.author },
          { name: `twitter:title`, content: title },
          { name: `twitter:description`, content: description },
          { name: "twitter:image", content: image }
        ]
        .concat(this.getKeywords())
        .concat(meta)}
      >
        <link rel="stylesheet" href="//cdn.quilljs.com/1.2.6/quill.snow.css"></link>
        <link rel="stylesheet" 
          href="https://use.fontawesome.com/releases/v5.8.1/css/all.css" 
          integrity="sha384-50oBUHEmvpQ+1lW4y57PTFmhCaXp0ML5d60M1M7uH2+nqUivzIebhndOJK28anvf" 
          crossorigin="anonymous">
          
        </link>
        <script type="application/ld+json">
          {JSON.stringify(jsonLDMarkdownRaw)}
        </script>
      </Helmet>
    )
  }
}

SEO.defaultProps = {
  lang: `en`,
  meta: [],
  keywords: [],
}

SEO.propTypes = {
  description: PropTypes.string,
  lang: PropTypes.string,
  meta: PropTypes.array,
  keywords: PropTypes.arrayOf(PropTypes.string),
  title: PropTypes.string.isRequired,
  exactTitle: PropTypes.bool
}

const detailsQuery = graphql`
  query DefaultSEOQuery {
    site {
      siteMetadata {
        title
        description
        twitter
        author
        logo
        siteUrl
      }
    }
  }
`

class SEOWrapper extends React.Component {
  render () {
    const { props } = this;
    return (
      <StaticQuery
        query={detailsQuery}
        render={data => {
          return (
            <SEO {...props} siteMetadata={data.site.siteMetadata} />
          )
        }}
      />
    )
  }
}

export default SEOWrapper;
