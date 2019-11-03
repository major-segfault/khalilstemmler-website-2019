import React from 'react'
import PropTypes from 'prop-types'
import Layout from "../components/shared/layout"
import solidBook from '../images/book/book-logo.png'
import nameConstructStructureBook from '../images/resources/name-construct-structure/book-banner.png'
import { ResourceItem } from '../components/resources';
import { SmallSubscribeForm } from '../components/subscribe'

const resourceItems = [
  { 
    name: 'SOLID', 
    description: `The Software Design & Architecture (with TypeScript / Node.js) Handbook`,
    url: 'https://solidbook.io',
    img: solidBook,
    contentType: 'Available for presale'
  },
  {
    name: 'Name, Construct & Structure', 
    description: `Organizing readable codebases`,
    url: '/resources/names-construct-structure',
    img: nameConstructStructureBook,
    contentType: 'Free Ebook'
  }
]

export class Books extends React.Component {
  constructor (props) {
    super(props);
  }

  render () {
    return (
      <Layout 
        title="Books"
        seo={{
          title: 'Books',
          keywords: ['nodejs', 'javascript', 'typescript', 'resources']
        }}
        component={(
          <>
            <p>Catalog of books and guides written for my developer friends!</p>
            <div className="desktop-subscribe-form-container">
              <SmallSubscribeForm/>
            </div>
          </>
        )}>
        
        { resourceItems.map((resource, i) => (
          <ResourceItem 
            key={i}
            name={resource.name}
            description={resource.description}
            url={resource.url}
            image={resource.img}
            contentType={resource.contentType}
          />
        ))}

      </Layout>
    )
  }
}

export default Books;