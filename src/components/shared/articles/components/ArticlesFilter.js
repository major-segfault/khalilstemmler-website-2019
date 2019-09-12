import React from 'react'
import "../styles/ArticlesFilter.sass"

const ArticlesFilter = ({ onChange, count }) => (
  <div className="articles-filter">
    <input 
      onChange={(e) => onChange(e.target.value)} 
      placeholder="Type to filter posts..." 
      type="text"
    />
    <div className="articles-filter--count">
      {count}
    </div>
  </div>
)

export default ArticlesFilter;