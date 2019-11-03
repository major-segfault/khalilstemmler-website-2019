import React from 'react'
import { Link } from 'gatsby'

/**
 * 
 *I co-founded <a href="https://univjobs.ca">Univjobs</a> in 2017 and learned a lot about making code scale. At some 
        point during my work as a consultant and reading as many <Link to="/books">books</Link> on software as I could digest, 
        I've come to realize that there were a lot of pitfalls I could have avoided if I knew the patterns and principles to 
        guide me. That's what this site is about: things I think all professional software people should know.
 */

export default {
  subscriberCount: 3000,
  "main": {
    "description": (
      <span>
        Advanced <span className="special-green">TypeScript</span> & <span className="special-green">Node.js</span> best practices for <span className="special-green">large-scale</span> applications. Learn to write <span className="special-green">flexible</span>, <span className="special-green">maintainable</span> software.
      </span>
    ),
    "description-expanded": (
      <span className="subhero-text">
        I create <Link to="/courses">courses</Link>, <Link to="/books">books</Link>, 
        and <Link to="/articles">articles</Link> for aspiring developers on <Link to="/articles/categories/enterprise-node-type-script/">Enterprise Node.js</Link>, <Link to="/articles/categories/domain-driven-design/">Domain-Driven Design</Link> and <Link to="/articles/solid-principles/solid-typescript/">writing testable, flexible JavaScript</Link>.
      </span>
    )
  },
  "currently": {
    "book": {
      "title": "Patterns of Enterprise Application Architecture",
      "author": "Martin Fowler"
    },
    "music": {
      "album": "Virgo's Maze",
      "artist": "Part Time"
    }
  }
}