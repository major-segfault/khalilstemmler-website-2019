import React from 'react'
import "../styles/ArticleSideContent.sass"
import trendingIcon from '../../../../images/icons/trending.svg'
import { Link } from 'gatsby';
import ArticleSideSubscribe from './ArticleSideSubscribe'
import { CarbonAd } from '../../ads';

const content = [
  { 
    title: '[Series] Domain-Driven Design w/ TypeScript and Node.js',
    link: '/articles/categories/domain-driven-design/',
    description: `Learn how to use DDD and object-oriented programming 
    concepts to model complex Node.js backends.`
  },
  {
    title: `[Article] SOLID Principles: The Software 
    Developer’s Framework to Robust & 
    Maintainable Code`,
    link: '/articles/solid-principles/solid-typescript/',
    description: `In software, change is inevitable. The more complex the software, 
    the more it should be enabled to be changed. The SOLID principles 
    are a set of principles all developers should know about in order 
    to design robust, maintainable, and flexible software.`
  }
]

const TrendingContent = () => (
  <div className="article-trending-content">
    <p className="trending"><img src={trendingIcon}/> Trending Content</p>
    {content.map((item, i) => (
      <div className="trending-content-item" key={i}>
        <Link to={item.link}>{item.title}</Link>
        <p>{item.description}</p>
      </div>
    ))}
  </div>
)

const ArticleSideContent = () => (
  <div className="article-side-content">
    <TrendingContent/>
    <CarbonAd/>
    <ArticleSideSubscribe/>
  </div>
)

export default ArticleSideContent;