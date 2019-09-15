---
name: Stable Abstraction Principle (SAP)
templateKey: wiki
published: true
wikicategory: Component Principles
wikitags: null
prerequisites: null
date: '2019-09-15T00:05:28-04:00'
updated: '2019-09-15T00:11:28-04:00'
image: null
plaindescription: The more stable a component is, the more abstract it should be
---

If a component is really stable, it's likely it's going to be serving more purposes for more groups of people, and for different problems.

In order to prevent a component from becoming too specific or rigid, we should primarily use abstract classes. 

Abstract classes work well for _defining the high-level policy_ and leaving room for various implementations of the low-level details.

---

Reference: https://blog.cleancoder.com/