---
templateKey: article
title: "An Intro to Software Architecture and Design [with Examples]"
date: '2019-09-10T00:05:26-04:00'
description: >-
  There are a few books that all programmers should read.
  Clean Code by Robert C. Martin (Uncle Bob) is one of those. Here are some of the key takeaways that I'm collecting from my first read through.
tags: 
  - Architecture
  - Software Design
  - SOLID
category: Software Design
image: /img/blog/software-architecture-design/software-architecture-design.png
published: false
---

<div class="solid-book-cta course-cta">
  <div class="solid-book-logo-container">
    <img src="/img/resources/solid-book/book-logo.png"/>
  </div>
  <p>This is a chapter from Solid Book - The Software Architecture & Design Handbook w/ TypeScript + Node.js. <a href="https://solidbook.io">Check it out</a> if you like this post.</p>
</div>

Have you worked on projects that seemed to <u>become impossible to iterate on after the first couple of rounds of development</u>? Have you seen projects turn legacy before they even had a chance to take their second breath of air? 

Software architecture and design matters. _It always has_. 

If you're like me, at some point in your career, your approach to software development was to fly by the seat of your pants and dive code-first into a project.

It'll always work the first time around. But the second iteration? The third? Nah.

Software architecture and design, like DevOps or UX Design, is an entirely separate world within software of it's own. I didn't know much about software design past _the singleton pattern_ until **I horribly tanked a full-stack developer interview** at a promising startup. 

That pivotal event set me down a path to learn as much as I could in this area of development- improving the quality of code I wrote on a daily basis, helping launch **Talkify**, refactoring **Univjobs** to [domain-driven design]() with [CQRS](/articles/oop-design-principles/command-query-segregation/), starting a [DDD course](/courses/domain-driven-design-typescript) and [writing a book on software design and architecture](https://solidbook.io).

<!-- If you're ready to take the **red pill** and improve the quality of your software, read on. -->

Here are the objectives of this article:

- Articulate the meaning and goals of software architecture and design
- Debunk levels of design: connect the dots on how **software architecture** and **software design** are two sides of the same coin
- Explore several architectural patterns for creating flexible, scalable, and modular software
- Understand where **software design patterns** fit in
- Understand where **software design principles** fit into the discussion
- Learn why the ability to delay design decisions is of utmost importance to software architects
- Understand how **relationships** are a huge part of software architecture
- Learn why OOP & polymorhism is the most important tool for software architects

---

## What is the goal of software?

Let's start with the goal of software _in general_. 

Overall, 

> The goal of software is to **produce something that satisfies users' needs**

_And if it doesn't, you know what we can do with it, right?_ 🚮😏

Whether it be a clock, a note taking app, or even the code that runs on the Java Virtual Machine in your washing machine, the goal is to **satisfy users' needs**.

I think we can all agree upon that. 

In order to do that, we have two main challenges:

- Meet technical expectations (speed, reliability, scalability, etc).
- Design the system in a way where it's possible to continually do this (utilizing the minimum amount of human resources necessary).

## Software quality goals

Metrics like **speed**, **reliability**, **availability**, **scalability**, are _software quality_ goals. 

If a software system possessed all of those capabilities, it just might be asymptotically _perfect_. 

<p class="special-quote">Here's the <a href="https://en.wikipedia.org/wiki/List_of_system_quality_attributes">entire list</a> of software quality attributes.</p>

But achieving all of these metrics to a very high degree is both very hard, and also probably not necessary. As we'll explore, the <u>most important thing aspect about architecture</u> is to **identify what's most important**, and which metrics **satisfy the needs of our users**.

<p class="special-quote"><b>An AI-Improved Home Movies example</b>: Consider a machine-learning application that used AI to improve the pixel quality of your home videos. Users might be OK with it taking 2 hours to complete (<b>- speed</b>), as long as it <b>reliably</b> produces something (<b>+ reliability</b>). However, users might <u>not be OK</u> with it taking long (<b>- speed</b>) AND jobs occassionally failing 1 hour and 15 minutes in, though (<b>- reliability</b>).</p>

## What is architecture?

Ralph Johnson, co-author of Design Patterns: Elements of Reusable Object-Oriented Software, very abstractly said that:

> "Architecture is about the important stuff. Whatever that is.”

And knowing what's important is the first step towards designing software, or at least it should be because he also said that:

> [Architecture is] the decisions you wish you could get right early in a project

Architecture is the **high-level framework**, foundation or skeleton of the software system. It's a choice made early on about the foundation of the system. That choice has the effect to greatly influence the quality of the code, ease of development, deployment, maintainance, and continued work on the system.

### Is architecture the same thing as software design?

Fundementally, yes. Although most people think **software design** and **software architecture** are different. 

The divide comes from a notion that **architecture** is _only_ the high-level details and **software design** is _only_ the low-level details. 

While a developer without knowledge of the high-level details _may be able to work on a low-level feature_ in a system, the opposite isn't true.

An architect of a system will need to understand fully how their high-level design decisions will influence the low-level details.


 like implementing a new feature work on fine-grained features within a large application might be able to be productive without knowing the high-level design decisions, an **expert developer** that designs  a system will never design a system without respect for the eventual details that need to get filled in.

## Why does architecture matter?

Architecture is about identifying the elements that are most important to the **success or failure** our system, and designing the system in a way that it accomodates and protects those key elements.

For Netflix, it's their **microservice architecture** which enables them to handle **availability**.

For Google or Salesforce, important elements might be using [domain-driven design](/articles/domain-driven-design-intro/) in order to manage domain logic **complexity**.

Failure to acknowledge and design a system to accomodate around what might make it fail, has potential to _do just that_.


## What's the goal of architecture?

To produce a design that that keeps the required human resources required to continually build upon and maintain the system, minimal.







### Qualifying the process of developing something that solves users' needs

While the actual end users' opinions do matter, users' experience (optimizing the actual end-users' experience of the software), we might ask questions like:

- Was the experience painful? Or pleasurable?
- Was it quick? Or was it slow?
- Was it confusing? Or was it easy?

But that's not what we're concerned about, at least for today's discussion. 

We're more concerned about **ourselves**- the developers.

Yes, what was **your experience** like in <u>producing something to satisfy the users' needs</u>?

We can ask ourselves the same questions:

- Was the experience painful? Or pleasurable?
- Was it quick? Or was it slow?
- Was it confusing? Or was it easy?

## Which system quality metrics are important? 



## 🧱🖼️

A good architecture has 3 responsibilities: 

1. Satisfy users' needs
2. Meet the technical expectations
3. Make it easy for developers to keep making the system better

In more words, **produce a design for developers that keeps the required human resources required to continually build upon and maintain the system, minimal**.


**Software architecture** and **software design** are commonly thought of as two different things. 

They are (more or less) the <u>same thing</u>. Ralph Johnson, co-author of Design Patterns: Elements of Reusable Object-Oriented Software, very abstractly said that:

> "Architecture is about the important stuff. Whatever that is.”

And Uncle Bob

They're two sides of the same coin. The low-level details are only made possible by the high-level design decisions, and vice-versa. 

> From Uncle Bob's book: it's often thought that the word "architecture" should be divorced from the lower-level details, wherease "design" means to imply decisions at a loweer level. But this usage makes  it nonsensical when you look at what a real architect does. “Consider the architect who designed my new home. Does this home have an architecture? Of course it does. And what is that architecture? Well, it is the shape of the home, the outward appearance, the elevations, and the layout of the spaces and rooms. But as I look through the diagrams that my architect produced, I see an immense number of low-level details. I see where every outlet, light switch, and light will be placed. I see which switches control which lights. I see where the furnace is placed, and the size and placement of the water heater and the sump pump. I see detailed depictions of how the walls, roofs, and foundations will be constructed.”

Still, we can't deny that there are **different levels** of design. There's a certain level of design that:

- Influences how code is organized throughout the entire project
- Can be especially painful to have to change

## The goal?

The goal is much easier said than done. The goal is to **produce a design upon which we keep the required human resources in order to continually build upon and maintain the system, minimal**.


- How would you start with explaining software design and architecture?
  - Let's start with talking about the problems
    - We've actually mentioned a lot of this in the foreward to the book
- Architecture is all about the important decisions.
- Most developers don't know the basics of OOP, so when their designs start to get a little bit messy, they turn towards OOP, without actually knowing how to apply domain models.

- Software needs to be adaptable to change, so it's about getting the big things right early on, and then continuing to get things right upon subsequent iterations.


<!-- And now Uncle Bob's notes -->

Uncle Bob believes that there is no difference between software architecture and design. 



## What is software design? 

They're two sides of the same coin. The low-level details are only made possible by the high-level design decisions, and vice-versa. 

> From Uncle Bob's book: it's often thought that the word "architecture" should be divorced from the lower-level details, wherease "design" means to imply decisions at a loweer level. But this usage makes  it nonsensical when you look at what a real architect does. “Consider the architect who designed my new home. Does this home have an architecture? Of course it does. And what is that architecture? Well, it is the shape of the home, the outward appearance, the elevations, and the layout of the spaces and rooms. But as I look through the diagrams that my architect produced, I see an immense number of low-level details. I see where every outlet, light switch, and light will be placed. I see which switches control which lights. I see where the furnace is placed, and the size and placement of the water heater and the sump pump. I see detailed depictions of how the walls, roofs, and foundations will be constructed.”

Excerpt From: Robert C. Martin. “Clean Architecture: A Craftsman's Guide to Software Structure and Design (Robert C. Martin Series).” Apple Books. 



## Thinking critically about software design and architecture

> Architecture affects how code gets written for the entire lifetime of the project

Among the several different architectural styles, they typically _remove capabilities_ from us in order to enforce a pattern of writing code. They force high-level design decisions upon us. 

Sometimes, those high-level decisions can trickle into how we write the bulk of our low-level code.

You might be familiar with some of these...

**Frontend Architectures**

- **Store architecture (Flux, Redux, Ngrx)**: A strict unidirectional data flow of a centralized data store. Causes all of the data in the application to flow in the same direction. Events of interest are watched and then acted upon through wiring up guard clauses in lifecycle hooks.
- **Reactive architecture w/ RxJS**: Programming with asynchronous event stream. Powerful in the sense that _anything_ can be a stream.

Have you seen or worked on projects with either of these? Consider how vastly different they are. 

Imagine you're 8 months into a working on a React application using Redux. 

Now imagine your project manager says that we need to switch to RxJS for state management. 

Imagine how angry you'd be. But you're also a professional, so you'd handle it well 🙂. It'd still suck though.

**Backend Architectures**

- **Model-View-Controller**: Upon principle, reduces the number of places that is valid to locate **presentation code**, **data-access logic and validation**, and **model definition** to one a single place. 
- **Domain-Driven Design**: A [layered architecture](/articles/enterprise-typescript-nodejs/clean-nodejs-architecture/) where critical business logic is handled by [Domain Entities](/articles/typescript-domain-driven-design/entities/), validation logic is handled by [Value Objects](/articles/typescript-value-object/), application business rules are handled by [Use Cases](/articles/enterprise-typescript-nodejs/application-layer-use-cases/), and data-access logic is handled by [Repositories](/articles/typescript-domain-driven-design/repository-dto-mapper/). Complex business logic can be decoupled and enabled through the use of Domain Events.
- **DDD + CQRS**: Domain Driven Design, but the models are now split into read models + write models (for simplicity and performance reasons).
- **DDD + Event Sourcing**: A different way to handle persistence. Every change to the state of an application is captured by events. A entity is persisted by storing a sequence of state changing events.
- **Serverless architectures**: Also know as Function-as-a-service, an architectural pattern where applications are hosted by a 3rd party service that dynamically allocates machine resources.


The architecture you choose has potential to have a profound impact on what the resulting code will look like.

The other point I wanted to line up with this is that **outgrowing** or _changing_ architectures can be painful.

> Outgrowing an architecture can be painful

For example, the moment we realize [MVC is too rudimentary](/articles/enterprise-typescript-nodejs/when-crud-mvc-isnt-enough/) for applications with business logic and domain complexity, we shouldn't put the bulk of our business logic in controller or services anymore ([here's why](/wiki/anemic-domain-model/)). We've just outgrown this architecture, and we need to move to another one better suited for the businesses' needs.

[Domain-Driven Design](/articles/domain-driven-design-intro/) is the next best option in that scenario. DDD however, requires us to think about partioning our code into (domain, application, and infrastructure) layers and keeping those layers uncorrupted. It's an entirely new framework for which we will write the majority of our code within.

## Choosing an architecture

Because each of these architectures each have their nuances, pros, and cons, it can be challenging to know which one makes most sense to use for your next big project.

Here's my framework for deciding:

- a) Project architectural requirements 
- b) Developer skill and experience 
- c) Team familiarity with the architectural pattern

### a) Project architectural requirements

Remember when you had to solve math (word) problems in high school? The process for solving those is to understand the problem, ignore the irrelevant details, and then choose the appropriate formula (or formulae) in order to solve the problem.

If you listen carefully to problem that you're trying to solve, you'll be able to apply a similar process to identify the ideal architecture.


Here's a long list of all the [system quality attributes](https://en.wikipedia.org/wiki/List_of_system_quality_attributes) that a system could have.

### b) Developer skill and experience

### c) Team familiarity with the architectural pattern

---

The goal of software overall is to satisfy a goal for a group of people. 

Rough notes:

Articulate something everyone’s thinking about but no one is saying. Cut through the noise.




## Why is software architecture important?

“Software architecture is the foundation of a software system. Like other types of engineering, the foundation has a profound effect on the quality of what is built on top of it. As such, it holds a great deal of importance in terms of the successful development, and eventual maintenance, of the system.”

Excerpt From: Joseph Ingeno. “Software Architect's Handbook.” Apple Books. 

“Software architecture is the structure or structures of a system, their elements, and the relationships between those elements. It is an abstraction of a software system. Software architecture is important because all software systems have an architecture, and that architecture is the foundation for the software system.”

Excerpt From: Joseph Ingeno. “Software Architect's Handbook.” Apple Books. 

> architecture

- most people think this is think that saw for design and architecture are 2 completely different things
  - this comes from the connotation behind architecture. architecture makes people think of design of the large pieces
  - some equate it to large concrete buildings. Architects design buildings. It's important to get the framework for a building correct the first time around, because they're huge structures that are very hard to change in the future.
  - these are the decisions that we wish we got correct very early on (it can be very expensive to rip out and build it again properly) 🧱 I had a prof that used to say writing code is like pouring concrete.
  - people also seem to thnk

  - it's easy to see how someone might draw parallels between building design and software architecture.

  architecture = the highest-possible form of breaking the system down into parts AND decisions that are hard to change.

  - software architecture is an abstraction / skeleton / framework for the system. the actual life of the system lives within the architecture. the architecture is the vessel that defines and details the structure


## Levels of design

  - software design + software architecture mean the same thing, but they're commonly argued to be employed at different levels
  - if achitecture is about those large moving pieces that are hard to change, the framework, software design is about the **patterns** you use to achieve the goals of the software.

  - but it's how you actually implement the details that get those problems solved 
  - for example, an architect considers the not only the framework for the building, but they have intense knowledge and experience towards where the intracacies will go. Those intracacies are the heart of the product. 
  - if we're building a RESTful web app using MVC, that's the framework. the value and the features are in the details.

## Delaying decisions

- Continuing with the theme of delaying decisions
- Which database are we going to use? (mongodb, relational)?
- Which services are we going to use for geolocation?
- Which service are going to use for maps (MapBox? Google Maps?) 
- How are we going to handle auth? (write it ourselves, use a tool like Auth.io).
- All these intracies can be hard to consider up front, so by providing the framework for how the tools can be integrated, we can avoid making those decisions on day one.
- That's a huge thing. Why? It's better to make decisions when you have as much information as possible. People change their minds all the time as well. How many times have you wished you'd had been more well-informed to make a decision? How often do you wish you could have gone back and done something differently?
- That's why it's so important for us to delay these huge decisions until later, because if we can gather as much information as we need then... information is power 


## Policy and detail

  - details don't

  - it's also possible the a system doesn't just consist of one particular architectural patttern, there could be several different patterns used within the entirety of the system
  - in the end, what it boils down to is the fact that architecture is the **most important** stuff (things most expensive to change), and we might not know what that is right away.
  - architecture is how the **major components** of the system interact with each other.

  There are several ways to organize an application architecturally. A few common architectural patterns that we'll cover in this book are the Model-View-Controller pattern, the Layered Architecture pattern, the Event-Driven pattern, the Monolithic & Microservice architectures, and Serverless architectures.

  <!-- Use the software architects handbook for these topics -->

  Moving from one of these patterns to another is generally a technically expensive activity, and can cost a lot of time and money to do.

  <!-- last notes -->

  - the policy is "what" (quote my old policy and details article w/ the images here), vs the "what"
  - 
  
  In architecture there is this concept of policy and detail policy is when we specify the rules of the system and how something should work how something should be hooked up but we don't actually go and write the code only don't like the implementation then there is the detail which actually is that implementation right so because we mention so much of architecture is is just making those design decisions but not actually implementing it right away deferring decisions it's important for us to be able to specify the high level policy those large moving bodies of code and how they will communicate a separate that activity from the activity of actually implementing those things the ability to do that is extremely powerful and if that sounds a lot like object going to programming to you the ability to specify how something should work and separate the Are separate the policy from the detail if it sounds like object oriented programming to you it should and because of that reason object oriented programming has a lot of benefit for architects 


## Plugin architecture & OOP
  
  in fact object orientation is that ability to gain control using polymorphism over every source code dependency in the system as Uncle Bob says it allows the architect to create a plugin architecture in which modules I could contain those high level policies are independent of the modules that contain the low level details the low level details are relegated to plugin modules that can be deployed and developed independently from the modules I contain the high level policies so that means that the architects can continue to define the policy while the people who actually go and develop the systems and the low level details can continue to do that and themselves this is how integrations work this is how a company's design their systems to be be hooked into its this concept of flipping the dependency relationship normally when we think of building things we think of building them bottom up you can't build a car and till you have all of the we'll connect us to the frame women pray me that's everything else you connect the engine in the body what if there is a woman Hughes specify from caught down the Polish how things should work naturally 


--- 

Notes from my piece of paper, continuing

- Architecture & OOP is all about relationships between things (look at my notes on OOP from Ulysses and in the chapter here, OOP is about messaging / information passing).
- In every relationship, there's a dependency relationship. 
  - **One module** has to rely on at least on other. That's just a fact. 
- It's only when we compose software up from those small modules and connect them together that we can get really interesting things to happen and we can create things of value.
- As soon as we connect one module to another, we've created a **dependency relationship**. 
- That's the biggest thing to note here.
- There's a flow to the direction of dependencies. 
- Having control over the flow of dependencies is incredibly important to an architect. (Why?)
- Take backend + frontend. There's a typical notion of dependency relationship and it's direction. Usually in enterprise applications, the front-end depends on the backend, because the backend is more expensive to change, contains 100% of the business logic and rules, while the front-end is commonly relaced every several years. It can easily be relaced.
  - Note: this is also likely why lots of developers' first actual development job is as a front-end developer (sorry).
- This conversation about the direction of dependencies on the frontend vs. the backend is easy to understand since the pieces are so large (backend application vs. frontend application). However, most often, within software it cna be much harder to identify.

- it's for this reason that OO, with the advent of **polymorhism**, enables you as a developer to implement what's referred to as **Dependency Inversion** by applying the design principle of always programming to an interface, not a concretion. This gives us as architects, full CONTROL over the direction of our dependencies.


> Uncle bob says: “What is OO? There are many opinions and many answers to this question. To the software architect, however, the answer is clear: OO is the ability, through the use of polymorphism, to gain absolute control over every source code dependency in the system. It allows the architect to create a plugin architecture, in which modules that contain high-level policies are independent of modules that contain low-level details. The low-level details are relegated to plugin modules that can be deployed and developed independently from the modules that contain high-level policies.”

Excerpt From: Robert C. Martin. “Clean Architecture: A Craftsman's Guide to Software Structure and Design (Robert C. Martin Series).” Apple Books. 





---

## Hooks

Ask yourself, “If someone else wrote my intro, what are the most captivating questions they could pose to make me excited to read this?”

- What is software design anyways?
- What is the difference between software design and architecture anyways?
- What does software architecture have to do with Object-Oriented programming? Does it just mean being better at object-oriented programming?
- If I told you that you've been writing Object-Oriented code incorrectly so far, would you believe me? Would you take the red pill or the blue pill?
- What is software design and architecture and what how do they improve my day to day work?
- What's the best way to improve my software design skills? What is architecture really? Is it related?
- Do you know what the single best way to improve your software design and architecture skills are? (care deeply about the problem domain- i mean, it kinda is correct, we can't even employ SRP unless we understand the domain).
- Do you know the single most important characteristic about software architecture and design is? (care about the domain).
- Do you know what the diffrence between software architecture and software design is? 




- Objective: Distill an overwhelming topic into something approachable. (This guide.)
  - Explain what softare architecture and design actually are.
- Motivation: Does it persuade others to do something you believe is important?
 - I want to persuade people to read my book because there is a lot of different stuff that I think is important that we can get from it.
- Goals: 
  - Skyscrape this article and make it better than this article
    - https://codeburst.io/software-architecture-the-difference-between-architecture-and-design-7936abdd5830
  - Rank for "Software architecture" somehow. Maybe post it in several different places as well if I can't get it to rank anywhere.
  - Use a lot of images and make it seem really pleasing.

<!-- 
Also, skyscrape this article: 
 -->


---- NEW OUTLINE



Points I'm trying to make:

1. The goal of software is to meet people's needs. In order to do that, we have two main challenges:

- meet the technical expectations (who sets this? -users do, stakeholders do, etc)
- Design the system in a way where it's possible to continually do this.

4. Architecture is about identifying what's important, and then continuing to protect those important elements of the system throughout it's life, knowing that failure to protect those aspects of the system, could very well contribute to it's failure.

3. Why does architecture matter? 
- It matters because failure to design a good architecture creates software systems that become a lot harder and expensive to continue to improve and add features to in the future.
  - if you know you'll get a lot of high-volume traffic, how do you handle that?
  - if you know you need to serve large files like tv shows and movies, how would you architect your system?
  - if you know the primary challenge will be trying to represent the complexity of the domain, how would you approach that?
  - if you know you'll need to handle over 2000 concurrent connections consistently, how would you handle that?

2. Glossary. Understand what architecture is. Understand what software design is. Understand why people confuse them. Understand what software design patterns are. Understand what software design principles are. There isn't really any difference between the ideas of software architecture and software design other than a connotation of the layers of design.


3. The highest-level layer is the skeleton and the most expensive to change because it carries along with it, an entire methodology for how code within it should be organized.
  - it's very important because changing the high-level policy / methodology means (potentially) restructuring nearly all or the majority of your code. 

4. Explore some of the different architectures and their methodologies.
  - again, draw home why switching methologies can be challenging and why "its important to get things right the first time" in order to continually improve a project.

5. Architecture is taking a best guess for the future. Delaying decisions on the low-level details until we really have to make them.

6. Separating the policy from the detail is saying  what should happen, but not spending the upfront time to dive  into details. To  enable that, we need a plug-in architecture.

7. OOP is the best tool for architects to 


References:
- https://martinfowler.com/architecture/
- https://matthiasnoback.nl