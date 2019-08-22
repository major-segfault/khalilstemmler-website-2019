---
templateKey: blog-post
title: "What's Unscalable about JavaScript? | TypeScript OOP"
date: '2019-08-21T10:04:10-05:00'
updated: '2019-08-21T10:04:10-05:00'
description: >-
  TypeScript is called JavaScript that scales. What's so unscalable about JavaScript?
tags:
  - JavaScript
  - TypeScript
  - Software Design
category: TypeScript
published: true
displayInArticles: false
image: /img/blog/templates/banners/typescript-blog-banner.png
---

Microsoft called TypeScript _JavaScript that scales_... what's so _unscalable_ about JavaScript?

With respect to software development, there are **two ways** to think about scalability.

1. Performance scalability
2. Productivity scalability

TypeScript is meant to address **2. Productivity scalability**. 

Like most dynamically-typed languages, the <u>lack of types</u> in JavaScript can drastically improve **initial productivity levels** on certain projects, but there are factors that exist in other projects (team size, code size, intended code lifespan, domain complexity), in which the lack of types can be detrimental to **code quality** and **understandability**.

It's been agreed upon that:

- It's better enable the compiler to catch silly bugs, typos, and other errors at compile time, rather than in production at runtime.
- Tests are the best documentation possible for your code. Types are no substitute for writing tests, but they can do a good job at reducing the surface area of bugs. 
- Tests also enable faster and safer refactoring. Similarly, if no tests exist, types can (at the very least) catch syntatic inaccuracies.

We've talked about it previously, but TypeScript addresses #3 of the [Hard Software Problems](/wiki/3-categories-of-hard-software-problems/): The Compled Domain Problem.

<p class="special-quote"><b>See also</b>: "<a href="/articles/when-to-use-typescript-guide/">When to Use TypeScript</a>", a Detailed Guide through Common Scenarios.</p>