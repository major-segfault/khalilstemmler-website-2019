---
name: Stable Dependency Principle (SDP)
templateKey: wiki
published: true
wikicategory: Component Principles
wikitags: 
  - Dependency Inversion
prerequisites: null
date: '2019-09-15T00:05:27-04:00'
updated: '2019-09-15T00:11:27-04:00'
image: /img/wiki/package-principles/stability.svg
plaindescription: "Components dependencies should be in the direction of stability"
---

Every system has **stable** components and **volatile** components.

Stable components are components that aren't expected to change that often. 

They either:

- Contain high-level policy, OR
- Have stood the test of time, and the component has more or less found it's role within the architecture. All likely use cases that would influence change within the component have been identified and addressed.

Because of this fact, it's more often that we'll write code that depends on stable components.

Volatile components are ones that are more likely to jitter and require frequent changes.

This is because:

- They are low-level details
- They are fairly new and all of the likely use cases that would influence change within the component have _not yet_ been identified.

There's nothing wrong with volatile components, every system has them and that's perfectly fine. 

But it's important to know when a component is volatile and ensure that we <u>don't make stable components depend on them</u>.

### Examples of stable components

- ECMAScript approved language constructs: `Number.toFixed()`, `JSON.stringify()`.
- Higher-level policies like domain-layer classes: [entities](/articles/typescript-domain-driven-design/entities/), [value objects](/articles/typescript-value-object/), [domain events](/blogs/domain-driven-design/where-do-domain-events-get-dispatched/).

### Examples of volatile components

- Front ends. Architecturally, front-end applications are very volatile compared to backend. The styles, layout, html, css, etc are constantly being changed. Browser testing tools Cypress.io or Selenium rely on the styles and layout of the view. Because the view is so volatile, those tests constantly need to be rewritten.
- Classes with no clear [single responsibility](/articles/solid-principles/single-responsibility/).


---

Reference: https://blog.cleancoder.com/