import React from "react"
import PropTypes from "prop-types"
import { ToastProvider } from 'react-toast-notifications';

import Navigation from './Navigation'
import LayoutCol from "./LayoutColumn";
import Footer from './Footer';
import { SEO } from '../../seo'

import "../styles/layout.css"
import "../styles/layout.sass"
import "../../../../assets/styles/rodal.css"
import "../../../../assets/styles/prism.css"
import ExitModal from "../../modals/components/ExitModal"; 

const hasContent = (title, component) => {
  if (!title && !component) return false;
  return true;
}

class Layout extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      darkModeEnabled: this.getDarkModeDefault(),
      isExitModalActive: false
    }

    this.toggleDarkMode = this.toggleDarkMode.bind(this);
    this.getDarkModeDefault = this.getDarkModeDefault.bind(this);
  }

  getDarkModeDefault () {
    if (typeof document !== "undefined") {
      const bodyClasses = document.body.classList;
      return bodyClasses.contains('dark-mode');
    }
  }

  toggleDarkMode = () => {
    const enabled = this.state.darkModeEnabled;

    if (enabled) {
      document.body.classList.remove('dark-mode');
    } else {
      document.body.classList.add('dark-mode');
    }

    this.setState({
      darkModeEnabled: !enabled
    });
  }

  isDarkModeEnabled () {
    return this.state.darkModeEnabled;
  }

  isRawModeEnabled () {
    return !!this.props.rawMode;
  }

  componentDidMount () {
    setTimeout(() => {
      this.setState({ ...this.state, isExitModalActive: true })
    }, 2000)
  }

  render () {
    const { children, title, subTitle, component, seo, footerComponent } = this.props;
    const { isExitModalActive } = this.state;
    return (
      <> 
        <ToastProvider>
          <SEO 
            title={seo.title}
            image={seo.image}
            description={seo.description}
            pageType={seo.pageType}
            datePublished={seo.datePublished}
            dateModified={seo.dateModified}
            keywords={seo.keywords}
            breadcrumbs={seo.breadcrumbs}
            slug={seo.slug}
            cardSize={seo.cardSize}
            exactTitle={seo.exactTitle}
          />
          {isExitModalActive ? <ExitModal/> : '' }
           
          <Navigation rawMode={this.isRawModeEnabled()}/>
           
          
          <div className="main-container">
            <main 
              className="main"
              style={{
                display: 'flex'
              }}>
              { !this.isRawModeEnabled() ? (
                <>
                  <LayoutCol 
                    checkContent={true}
                    hasContent={hasContent(title, component)} 
                    index={0}>
                    {title ? <h2>{title}</h2> : ''}
                    {subTitle ? <p>{subTitle}</p> : ''}
                    {component ? component : ''}
                  </LayoutCol>
                  <LayoutCol index={1}>
                    {children}
                  </LayoutCol>
                </>
              ) : children }
              </main>
            </div>
            { footerComponent ? footerComponent : ''}
            { !this.isRawModeEnabled() ? <Footer/> : '' }
        </ToastProvider>
      </>
    )
  }
}


Layout.propTypes = {
  children: PropTypes.node.isRequired,
  component: PropTypes.any,
  footerComponent: PropTypes.any,
  title: PropTypes.string,
  subTitle: PropTypes.string,
  seo: PropTypes.shape({
    pageType: PropTypes.string.isRequired,
    post: PropTypes.shape({
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      excerpt: PropTypes.string,
      slug: PropTypes.string.isRequired,
      datePublished: PropTypes.string,
      dateModified: PropTypes.string,
    }).isRequired,
    image: PropTypes.string,
    keywords: PropTypes.arrayOf(PropTypes.string),
    cardSize: PropTypes.string
  }).isRequired,
  rawMode: PropTypes.bool
}

export default Layout
