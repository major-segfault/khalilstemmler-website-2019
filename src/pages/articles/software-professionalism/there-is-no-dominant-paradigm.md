---
templateKey: article
title: "There Is No Dominant Paradigm | Software Professionalism"
date: '2019-07-11T10:04:10-05:00'
updated: '2019-07-13T10:04:10-05:00'
description: >-
  Functional programming is not the end to all of our problems. Quality software is all three paradigms.
tags:
  - Node.js
  - Software Design
  - JavaScript
category: Software Professionalism
image: /img/blog/professionalism/dominant.png
published: true
anchormessage: This article is part of Solid Book - The Software Design & Architecture Handbook. <a href="https://solidbook.io">Get the book</a>.
---

If you ask a software consultant for advice on the **best** approach to anything, such as:

- what's the best framework to use
- what's the best ORM to use
- what's the cloud to deploy to
- what's the best way to split up this project?
- how SOLID should this code be?

... a good consultant starts their reply with two words: 

> It depends...

It's not uncommon to hear a lot of that when speaking with consultants because <u>professional people in software _rarely_ speak in absolutes</u>.

Software professionals recognize that there are tools and approaches which are optimal for certain tasks. The optimial tool for the task fully depends on **context**.

Context is everything in making decisions.

Applied to the act of programming, depending on the context, we're either writing **imperative** code, **functional code** or **object-oriented code**.

Its how we write algorithms and detail, organize those details into methods, and structure the relationships between classes that contain the bulk of the work.

**Good software is all 3 paradigms at different times**.

In this article, we'll cover the following:

<ul class="aside">
  <li>Primary characteristics of quality software</li>
  <li>How good Imperative code reinforces reliable software</li>
  <li>How good Functional code reinforces maintainable software</li>
  <li>How good Object-Oriented code reinforces flexibile software</li>
</ul>


---

## What is quality software?

A fair question. But it should be the basis for all of our development efforts.

Quality software is software that ensures:

- `reliability`
- `flexibility`
- `maintainability`

### Reliability

Reliable software does what it was meant to do, always. 

- `Submitting a comment`: if I press ENTER to reply to a thread on a social networking site, it should save my comment, store it the db, perhaps also notify all people in the thread.
- `Making a purchase`: if I enter my credit card and click submit, I expect it to charge me once and then send me a reciept.

Without considering the challenges of networking and deployment, writing the code to make things work once is easy. 

You can brute force /  imperatively / procedurally make anything work once, yes.

But your job as a developer isn't over at that point though.

### Flexibility

There is one constant in software development: **change**.

Change will always occur. Features will always need to be added and adjusted.

_Where does change come from?_

We've discovered that change requests always orignate from the [actors/groups](/articles/enterprise-typescript-nodejs/application-layer-use-cases/) that own the feature.

Therefore, it's in our **best interest** to identify and structure our software around those those groups.

This is why we:

A: split our subdomains/components/modules based on [Conway's law](/wiki/conways-law/).

- A billing subdomain: `Customer`, `Subscriber`, `Accountant`, `Treasurer`, `Employee`
- A blogging subdomain: `Editor`, `Reviewer`, `Guest`, `Author`
- A recruitment subdomain: `JobSeeker`, `Employer`, `Interviewer`, `Recruiter`
- Our vinyl-trading subdomain: `Trader`, `Admin`
- An email marketing subdomain: `Contact`, `Recipient`, `Sender`,  `ListOwner`

B: Improve cohesion by locating [use cases/features](/articles/enterprise-typescript-nodejs/application-layer-use-cases/) used by a particular group in the subdomain that they belong to:

- Our vinyl-trading subdomain use cases: `addVinyl`, `makeOffer`, `acceptOffer`, `rejectOffer`

C: Use polymorphism to [flip the dependency graph](/wiki/dependency-inversion/), enabling architects to have full control over dependencies

D: Use [Liskov Substitution](/articles/solid-principles/solid-typescript/) to enable valid plugins to be decided upon at runtime

- If I need a **mail** microservice, I can use either the `MailChimpService`, the `SendGridService`, the `MailGunService` or any other future mail microservice, as long as it's a `Mailer`.

### Maintainability

Finally, since we've confirmed that change is going to occur at some point, how do we **limit the amount of time that it takes to take software from point _A_ to point _B_**?

This is what we're primarily concerned about when we talk about **maintainability**. 

Is the code hard to understand? Are these functions [intention revealing](/articles/typescript-domain-driven-design/intention-revealing-interfaces/)? Are there modules that don't belong together? Will changing one thing break something else in a completely separate part of the application?

By limiting side effects, separating concerns, and decoupling modules that don't belong together, we're improving the **maintainability** of the code.

Essentially, writing _clean code_ improves maintainability.

---

We've just discussed some of the most important software quality metrics. Others exist, but for application developers, I believe these are the most important.

You'll discover next how each paradigm is **best suited** to reinforce one of these software quality metrics.

## All paradigms are necessary

Recently, [Uncle Bob](https://twitter.com/unclebobmartin?lang=en) tweeted something meaningful out:

![Uncle Bob on Imperative, Functional and Object-Oriented](/img/blog/professionalism/paradigm/paradigms.png) 

- via https://twitter.com/unclebobmartin/status/1141726835794939906

Interesting statement. But, we should question everything. 

Someone else got there before I did.

![Uncle Bob on Imperative, Functional and Object-Oriented](/img/blog/professionalism/paradigm/paradigms-response.png) 

Allow me to break this down a little bit. 

Here’s what Uncle Bob meant when he said that we “discovered [software is] three paradigms at different times”.

### Imperative programming reinforces reliability

![Imperative programming](/img/blog/professionalism/paradigm/imperative.png) 

**Imperative programming** is how we write our algorithms and procedures, storing data in variables and moving it around. This is where everyone starts out as new developers. It’s also where we focus a lot of our energy on naming variables well.

This type of code is relatively easy to write and if we wanted, we could brute-force all of our problems in software writing imperative code.

Sometimes that's the only option we have (if we're using languages like C).

It's in our **imperative** code that we focus on code at the [detail level](/articles/enterprise-typescript-nodejs/clean-nodejs-architecture/) and ensure that we've coded our algorithms. 

Ie: does it do what it was meant to do?

Doing this well ensures `reliability`.

### Functional programming reinforces maintainability

![Functional programming](/img/blog/professionalism/paradigm/functional.png) 

**Functional programming** is concerned with how we break those algorithms and procedures into functions. 

Now we get a little bit of code reusability and we can chain functionality together.

No longer do we have to explicitly type everything out everytime we want to do something.

This is powerful.

This moves us towards [declarative programming](/articles/typescript-domain-driven-design/ddd-vs-crud-design/).

Eventually we learn about good functional design principles, DRY, and doing one thing and doing it well; that latter of which is an **alternative understanding of SRP** (not the _correct_ interpretation of SRP, that we talk about [here](/articles/solid-principles/single-responsibility/)).

> For a lot of JavaScript developers, this is the asymptote that we constantly strive towards: to write side-effect free functions and reducing the need to rely on statefulness.

When we don't have to worry about side-effects, `maintainability` improves. 

We can be sure that when we're changing something, we're not going to break something else inadvertantly.

When we're able to understand very clearly through intention revealing function names, expressive types, we can limit side effects by chaining complex logic in clear and maintainable ways:

```typescript
if (has(payload, 'genres')) {
  this.addChange(
    vinyl.setGenres(
      (await genresRepo.findOrCreateGenresByName(
        (ParseUtils.parseObject(payload.genres) as Result<GenresDTO>)
          .getValue().new
      ))
      .concat(
        await genresRepo.findGenresById(
          (ParseUtils.parseObject(payload.genres) as Result<GenresDTO>)
            .getValue().ids
        )
      )
    )
  )
}
```

For a lot of simple CRUD applications, we can get away with a lot _without_ even thinking about object-oriented programming or types.

However, when our programs start to get sufficiently complex, we run into challenges.

--- 

What do we mean by code getting _complex_?

Complex code is code where **business logic starts to appear**.

At this point, without proper encapsulation, our app is just several procedural scripts. Fowler refers to this as a **Transaction Script** [^1]. 

Transaction Scripts are excellent for simple applications but the lack of encapsulation creates a breeding ground for code duplication.

Code duplication leads to **bugs** and an [anemic domain model](/wiki/anemic-domain-model/).

It's at this moment exact moment when using a Domain Model (OOP) is preferred.

### Object-oriented programming reinforces flexibility

![OO programming](/img/blog/professionalism/paradigm/oop.png) 

Object-Oriented programming. OOP is concerned with how we structure the relationships between our classes that _contain_ the methods that execute our (imperative) algorithms and procedures. 

At this level, the principles that dictate how we do this is a lot less clear. 

Because of the _lack of specific ubiquitous rules to follow_ in addition to the total number of possible ways to structure a system, it can be pretty challenging to learn. This is the basis for studying software design and architecture.

### Software architects spend a lot of time at this layer

We've discussed previously that when you're programming, you're either writing [detail or policy](/articles/enterprise-typescript-nodejs/clean-nodejs-architecture/). 

When your current goal is to define relationships between high-level constructs and policies between them (through interfaces and abstractions), OOP's polymorhism allows developers to [flip the dependency graph](/wiki/dependency-inversion/) to defer design decisions, enabling the **details** to be filled in later.

OOP solves a lot of problems, but _its a steep learning curve_ to learn how to use it to solve the problems that it's meant to address.

### Domain-knowledge required

Not only do we need to learn the basics of object-modeling, but we are also tasked with **understanding the domain**, which is something that most developers just don't want to do.

This is why many developers new to OOP end up with:

- classes that sound computery `[Something]Factory`, `[Something]Manager`, `[Something]Processor`

Utilizing a Rich Domain Model, we can solve business challenges in a more declarative way, requiring less new code to solve future problems.

Failure to recognize when it's time to switch could be deadly to a project or organization's productivity.

![Anemic Domain Model](/img/wiki/anemic/chart.svg) 

Polymorhism and a [declarative](/articles/typescript-domain-driven-design/ddd-vs-crud-design/), [supple design](https://www.codingblocks.net/podcast/supple-design/) dramatically improves `flexibility` [^2].

--- 

That being said, when we’re designing systems, there is no dominant programming paradigm. 

You could restrict yourself to only using one paradigm (like a lot of functional programmers may), although you’ll find that it’s challenging. Not impossible, but challenging. [^3]

And that’s because “a well-designed system is all three at the same time”. 

![OO programming](/img/blog/professionalism/paradigm/all-paradigms.png) 

There are certain cases where the best approach for a task will be an imperative one, and there are times where a functional approach is preferred.


## Takeaways

Here's what we've covered in this article:

- Quality software is `reliable`, `flexible`, and `maintainable`
- Imperative programming is where we define what _actually_ happens behind the scenes. It determines if the software actually lives up to it's responsibilities. This paradigm governs `reliability`.
- Functional programming concepts urge us to limit side-effects because it improves `maintainability`.
- Object-oriented programming is how we define the relationships between our modules, manage dependencies and encapsulate business logic. When we excell here, our software is supple, declarative, and `flexible` to the guaranteed changes that are sure to occur in a project's lifetime.

--- 


[^1] - In Fowler's Patterns of Enterprise Application Architecture, using a Transaction Script [(Fowler - PoEAA)](https://www.amazon.ca/Patterns-Enterprise-Application-Architecture-Martin/dp/0321127420)

[^2] - **Supple Design** is a concept from Domain-Driven Design where "Complex logic is encapsulated, side effects are minimized and suppled up, and dependencies are minimized". https://www.codingblocks.net/podcast/supple-design/

[^3] - See Scott  Wlaschin's book on [Domain Modeling with F#](https://www.amazon.com/Domain-Modeling-Made-Functional-Domain-Driven/dp/1680502549).