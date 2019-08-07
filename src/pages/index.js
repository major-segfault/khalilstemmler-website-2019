import React from "react"
import Layout from "../components/shared/layout"
import { StaticQuery, graphql } from "gatsby"
import { HomeComponentLeft, Hero, RecentArticles, RecentWikiEdits } from '../components/home'
import { SubscribeForm } from '../components/subscribe'
import { SolidBookResourceCard } from '../components/resources'

const IndexPage = ({ title, description }) => (
  <Layout 
    seo={{
      title,
      exactTitle: true,
      description,
      keywords: ['advanced', 'typescript', 'nodejs', 'best practices', 'javascript']
    }}
    component={<HomeComponentLeft/>}>
    <div className="home">
      <Hero/>
      <br/>
      <SubscribeForm/>
      <br/>
      <RecentArticles/>
      <SolidBookResourceCard/>
      <br/>
      <hr/>
      <br/>
      <RecentWikiEdits/>
      <a href="/resources/solid-nodejs-architecture">
        <img src="/img/resources/solid-book/book-banner.png"/>
      </a>
    </div>
  </Layout>
)

export default () => (
  <StaticQuery
    query={graphql`
      query IndexPageQuery {
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
    `}
    render={data => {
      const { siteMetadata } = data.site
      return (
        <IndexPage
          {...siteMetadata}
        />
      )
    }}
  />
)

