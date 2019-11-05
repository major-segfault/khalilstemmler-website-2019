import React from 'react'
import '../styles/BlogsContainer.sass'
import BlogCard from './BlogCard';

const BlogsContainer = ({ titleText, subTitleComponent, blogs }) => (
  <div className="blogs-container">
    { titleText && <h2 className="light-header">{titleText}</h2>}
    { subTitleComponent ? subTitleComponent : ''}
    <br/>
    <section>
      { blogs.map((blog, i) => (
        <BlogCard key={i} {...blog} />
      ))}
    </section>
  </div>
)

export default BlogsContainer;