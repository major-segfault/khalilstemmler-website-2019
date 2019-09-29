---
templateKey: article
title: "How to Learn Software Design and Architecture | The  Full-stack Software Design & Architecture Map"
date: '2019-09-28T10:04:10-05:00'
updated: '2019-09-28T10:04:10-05:00'
description: >-
  Software Design and Architecture is pretty much it's own field of study within the realm of computing, like DevOps or UX Design. Here's a map describing the breadth of software design and architecture, from clean code to microkernels.
tags:
  - Architecture
  - Software Design
  - Roadmap
category: Software Design
image: /img/blog/full-stack-software-design/banner.png
published: true
---

<div class="solid-book-cta course-cta">
  <div class="solid-book-logo-container">
    <img src="/img/resources/solid-book/book-logo.png"/>
  </div>
  <p>This topic is taken from Solid Book - The Software Architecture & Design Handbook w/ TypeScript + Node.js. <a href="https://solidbook.io">Check it out</a> if you like this post.</p>
</div>

You ever think about what it took for some of the world's most talented developers to learn how to build systems within companies like Uber, YouTube, Facebook, or Github?

It's crazy to me to consider the fact that Facebook was once an empty text file on someone's computer, and now it's this gargantuan company that has dipped it's toes into just about everything, and has personally impacted over [1.59 billion people](https://zephoria.com/top-15-valuable-facebook-statistics/) worldwide.

As a junior, self-taught developer or even intermediate developer, the roadmap to continued growth towards actually learning how to design clean and scalable systems seems kind of daunting.  

For a lot of us, our projects die after one or two iterations because the code turns into an unmaintainable mess.

So where do we even _start_ in order to learn how to improve our designs?

The truth is: 

> Software design and architecture is a _huge_ topic

Understanding how to:

- Architect a system to serve the needs of it's users
- Write code that's easy to change
- Write code that's easy to maintain
- Write code that's easy to test

... is _very_ hard. The breadth of learning required is just so large.

And even though you know how to write code to make things work at least _once_, the bigger challenge is to figure out how to write code that makes it easy to change in order to _keep up with the current requirements_.

But again, where to start?...

---

Anytime I'm faced with a complex problem, I go back to [first principles](https://jamesclear.com/first-principles).

## First Principles

First principles is the most effective way to break down problems. 

It works by deconstructing a problem all the way down to the **atomic level** where we can't deconstruct it anymore, and then reconstructing a solution from the parts that we're absolutely sure are true.

So let's apply it to software by first stating the goal.

What is the primary goal of software?

> The goal of software is to _continually_ **produce something that satisfies the needs of it's users**, while minimizing the effort it takes to do so.

I fought with coming up with the best definition for a long time, and I'm prepared to argue with you about why I think that's accurate.

Software that doesn't serve the needs of it's users, simply isn't good software.

And since the needs of our users change often, it's important to make sure that software **can be changed**.

If software cannot be changed (easily), that also makes it bad software, because it will prevent us for satisfying the _current_ needs of our users.

---

We've established that design matters, and it's important to learn how to produce well-designed software, but it can be a long road.

<p class="special-quote">
In this article, I'd like to present to you what I believe are the concrete pillars of software design and architecture. 
</p>

## The stack

Before I show you the map, let me show you the _stack_.

Similar to something like the [OSI Model](https://en.wikipedia.org/wiki/OSI_model), each layer builds on top of the foundation of the previous one.

![](https://user-images.githubusercontent.com/6892666/65833569-bb34fc00-e29f-11e9-8516-79cbd9f8f07b.png)

<p class="caption">The software design and architecture stack shows all of the layers of software design, from the most high-level concepts to the most low-level details.</p>

In the stack, I've included examples to _some_ of the most important concepts at that layer, but not all (because there are way too many).

Now, check out the map. While I think the stack is good to see the bigger picture, the map is a little bit more detailed, and as a result, I think it's more useful.

## The map

<p class="special-quote">To avoid running up my bandwidth, I reduced the quality of the map shown on site. If you'd like to get a high-quality png, you can find that up on my <a href="https://github.com/stemmlerjs/software-design-and-architecture-roadmap">GitHub</a>.</p>

Below is the map for software design and architecture.

![](https://user-images.githubusercontent.com/6892666/65834464-42d33880-e2a9-11e9-86e2-ce6aa896b22e.png)

## Resources & Conclusion

We talk a lot about [Domain-Driven Design](/articles/domain-driven-design-intro/) on this blog, but <u>there's a lot readers would benefit from knowing first</u> (like layered architectures, oop, model-driven design, design principles and patterns) before we dive deep on building rich domain models with TypeScript.

<div class="solid-book-cta course-cta special-quote">
  <div class="solid-book-logo-container">
    <img src="/img/resources/solid-book/book-logo.png"/>
  </div>
  <p>If you're looking for a one-stop resource, I just prelaunched <a href="https://solidbook.io">solidbook.io - The Software Design & Architecture Handbook</a>. I teach readers the things that I think they really need to know at each stage in this map in order to produce good software like we discussed in this article. It's currently on sale until it's fully complete, but I'm also happy to recommend a couple of other excellent resources that I personally used when I was learning software design and architecture.</p>
</div>

### Resources list

Here are my _favourite_ resources to learn software design and architecture.

#### Stage 1: Clean Code

- Clean Code, by Robert C. Martin
- Refactoring, by Martin Fowler (2nd edition)

#### Stage 2: Programming Paradigms

- Clean Architecture, by Robert C. Martin
- Concepts of Programming Languages, Robert W. Sebesta (10th edition)

#### Stage 3: Object-Oriented Programming

- Object-Design Style Guide, by Matthias Noback
- Clean Architecture, by Robert C. Martin
- Domain-Driven Design, by Eric Evans

#### Stage 4: Design Principles

- Head First Design Patterns, by various authors
- GoF Design Patterns, by various authors

#### Stage 5: Design Patterns

- Head First Design Patterns, by various authors

#### Stage 6: Architectural Principles

- Clean Architecture, by Robert C. Martin

#### Stage 7: Architectural Styles

- Clean Architecture, by Robert C. Martin
- Software Architect's Handbook, by Joseph Ingeno 

#### Stage 8: Architectural Patterns

- Domain-Driven Design, by Eric Evans
- Implementing Domain-Driven Design, by Vaughn Vernon

#### Stage 9: Enterprise Patterns

- Patterns of Enterprise Application Architecture, by Martin Fowler
- Domain Driven Design, by Eric Evans
- Implementing Domain-Driven Design, by Vaughn Vernon

## References

- [Wikipedia: List of architectural styles and patterns](https://en.wikipedia.org/wiki/List_of_software_architecture_styles_and_patterns)
- [Architectural styles vs. architectural patterns vs. design patterns](https://herbertograca.com/2017/07/28/architectural-styles-vs-architectural-patterns-vs-design-patterns/)
- [The Clean Architecture](http://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)