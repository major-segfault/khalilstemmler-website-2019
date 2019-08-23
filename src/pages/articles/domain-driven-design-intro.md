---
templateKey: article
title: "An Introduction to Domain-Driven Design - DDD w/ TypeScript"
date: '2019-07-30T10:04:10-05:00'
updated: '2019-07-30T10:04:10-05:00'
description: >-
  Domain-Driven Design is the approach to software development which enables us to translate complex problem domains into rich, expressive and evolving software. It's the way we design applications when the needs of our users are complex.
tags:
  - DDD
  - TypeScript
  - Software Design
category: Domain-Driven Design
image: /img/blog/ddd-intro/ddd-intro.png
published: true
---

<p class="course-cta">
This is part of the <a href="/courses/domain-driven-design-typescript">Domain-Driven Design w/ TypeScript & Node.js</a> course. Check it out if you liked this post.
</p>

_Also from the **[Domain-Driven Design with TypeScript](/articles/categories/domain-driven-design/)** article series_.

Have you ever worked on a codebase where it felt like "the more code I add, the more complex it gets"?

Have you ever wondered, "how _do you_ organize business logic anyways"?

Or have you ever been in the situation where you're nervous to add new code to an existing codebase in the fear that you'll break something else in a completely different part of the code somewhere?

What about enterprise companies? How are _they_ doing it? Their codebases must be massive. How do they get anything done? How do _they_ manage that complexity? 

How are able they able to break off large bodies of code, assign them to teams, and then integrate all the teams together? 

I've wondered all of this while coding on a 3 year old Node.js app with a line count pushing ~150K+.

I came across **Domain-Driven Design** when I realized I needed it the most.

## Quick history about my experience with DDD

In 2017, I started working on an application called [Univjobs](https://univjobs.ca), a marketplace for Canadian students and recent-grads to find co-op jobs, gigs and entry-level jobs and internships.

The MVP was pretty simple. Students could sign up, create their profile and apply to jobs. Employers could sign up, post jobs, browse students and invite them to apply to the jobs they've posted.

Since 2017, we've iterated many times, adjusting and encorporating features based on feedback from students and employers such as job recommendations, interviews, an Applicant Tracking System and several portals to integrate with the existing platform (developers, campus reps, etc).

Eventually, the codebase had became so large that adding new features on top of it took <u>nearly 3x</u> the amount of time it would have taken when I first started. 

Lack of encapsulation and object-oriented design were to blame.

I had an [Anemic Domain Model](/wiki/anemic-domain-model).

![anemic domain model](/img/wiki/anemic/chart.svg)

It was at this point I started to seek out solutions to the problem.

## About Domain-Driven Design

Domain-Driven Design is an approach to software development that aims to **match the mental model** of the problem domain we're addressing.

The goals of DDD are as follows:

- Discover the domain model by interacting with domain experts and agreeing upon a common set of terms to refer to processes, actors and any other phenomenon that occurs in the domain.
- Take those newly discovered terms and embed them in the code, creating a rich domain model that reflects the actual living, breathing business and it's rules.
- Protect that domain model from all the other technical intricacies involved in creating a web application. 

Initially conceptualized by Eric Evans who wrote the [_bible_ of DDD](https://www.amazon.ca/gp/product/0321125215/ref=as_li_tl?ie=UTF8&camp=15121&creative=330641&creativeASIN=0321125215&linkCode=as2&tag=stemmlerjs09-20&linkId=170eea6252cf16310fc9e7694209e5ed) (famously known as the Blue Book), DDD's primary technical benefits are that it enables you to write **expressive**, **rich** and **encapsulated** software that are testable, scalable and maintainable.

### Discovering the Ubiquitous Language

The **Ubiquitous Language** (which is a fancy DDD term for the common language that best describes the domain model concepts) can only be learned by **talking with the domain experts**. Once agreed upon, it enables developers to connect what the software implementation to what _actually occurs_ in the real world. 

> If we're building an app that helps recruiters hire talent, we need to spend some time understanding the domain language and processes that exist from the recruiters' perspective.

That means actually talking to the domain experts.

Knowing the names of the constructs that we're about to model enables us to create rich **domain models**.

## Modeling the Domain

There are huge payoffs in domain modeling. When our code lines up with the real life domain, we end up with a [rich declarative design](/articles/typescript-domain-driven-design/ddd-vs-crud-design/) that will enable us to make changes and add new features exponentially faster.

### Prerequisite Knowledge

Domain-Driven Design has a steep learning-curve. I won't lie about that. Domain-Driven Developers need to be comfortable with the following:

- Object-Oriented Programming Basics 
- Object-Oriented Programming Design Principles (composition > inheritance, referring to abstractions, SOLID Principles)
- General Design Principles ([YAGNI](/wiki/yagni), KISS, DRY)

Object-Oriented Programming is not strictly necessary to be successful with Domain Driven Design, but it does go with the natural contours of the patterns Domain-Driven Design has established.

To be able to move quickly, DDD does require some fundamental knowledge of software design patterns. It's a lot harder to do DDD well if we make a mess. That's why principles like YAGNI, KISS and DRY are even more important in order to iteratively improve a design.

> In order to go fast, we must go well.

### There is a construct for everything

Much of what makes frameworks so popular is that there is a pre-established way to do everything. When modeling the domain layer in DDD, there are already pre-established building blocks for every task.

<p>See <a target="_self" href="#building-blocks">here</a> for the list of building blocks for DDD applications.</p>

## Protecting the Domain Layer

In order to do DDD well, we need to keep the [SOLID principles](/articles/solid-principles/solid-typescript/) in mind, organize a central domain layer at the core of our [Layered Architecture](https://herbertograca.com/2017/08/03/layered-architecture/), and implement interface adapters to persistence, web and external technologies. We don't want these things to sully our domain model.

We want to keep them at a distance so that we can isolate our domain and keep our unit tests fast.

![clean architecture](/img/blog/ddd-intro/clean.jpg)
<div class="caption">"The Clean Architecture". From the golden Uncle Bob archives. Also known as a Layered Architecture, Ports & Adapters, Hexigonal, etc.</div>

### JavaScript community on Enterprise Application Development

I studied Java in high-school and University. Like a lot of my peers, I didn't really LOVE Java a whole lot because: 

a) We hated seeing red lines in the compiler all the time. This was scary for a 1st year University student learning how to program and 

b) The community around Java appeared to be mostly focused on enterprise application patterns and frameworks. Concepts like POJOs, JavaBeans, dependency injection and aspect oriented programming were not _cool_ nor did we aim to understand them or their uses (I should also mention, these were the early days of learning when some of us thought Java and JavaScript were the same thing 😜). 

When I first picked up a book on Node.js and was introduced to JavaScript, I was blown away by all the cool things you can do with JavaScript, HTML and CSS. 

The community was much more interesting than the Java community to me as a musician and a gamer (at the time).

Like many others, we learned how to build Node.js backends through YouTube, [Scotch.io](https://scotch.io), [Udemy](https://udemy.com) and [Udacity](https://udacity.com) courses. This was also the extent to which a large number of developers from my generation learned about software design.

Model + view + controller.

<a id="building-blocks"></a>

This works great for a large number of RESTful web backends, but for applications where the problem domain is complex, we need to break down the "model" part even further[^1].

To do that, we use the **building blocks** of DDD.

## Building Blocks

Very briefly, these are the main technical artifacts involved in implementing DDD. 

![DDD Diagram](/img/blog/ddd-intro/ddd-diagram.svg)

### [Entities](/articles/typescript-domain-driven-design/entities/)

Domain objects that we care to _uniquely_ identify. 

Things like: `User`, `Job`, `Vinyl`, `Post`, `Comment`, etc.

Entities live a life enabling them to be `created`, `updated`, `persisted`, `retrieved` from persistence, `archived` and `deleted`. 

Entities are compared by their **unique identifier** (usually a UUID or Primary Key of some sort).

![](/img/blog/ddd/entity-lifecycle.svg)

### [Value Objects](/articles/typescript-value-object/)

Value objects have no identity. They are _attributes_ of Entities. 

Think: 

- `Name` as a Value Object on a `User`.
- `JobStatus` as a Value Object on `Job`
- `PostTitle` as a Value Object on `Post`

Value Objects are compared by their **structrual equality**.

```typescript
// A valid (yet not very efficient) way to compare Value Objects

const khalilName = { firstName: 'Khalil', lastName: 'Stemmler' };
const nick = { firstName: 'Nick', lastName: 'Cave' }

JSON.stringify(khalil) === JSON.stringify(nick) // false
```

### [Aggregate](/articles/typescript-domain-driven-design/aggregate-design-persistence/)

These are a collection of entities are that bound together by an aggregate root. The aggregate root is the thing that we refer to for lookups. No members from within the aggregate boundary can be referred to directly from anything external to the aggregate. This is how the aggregate maintains consistency. 

The **most powerful part about aggregates is that they dispatch Domain Events** which can be used to <u>co-locate business logic in the appropriate subdomain</u>.

### Domain Services

This is where we locate domain logic that doesn't belong to any one object conceptually.

<p class="special-quote">Domain Services are most often executed by application layer <a href="/articles/enterprise-typescript-nodejs/application-layer-use-cases/">Application Services / Use Cases</a>. Because Domain Services are a part of the <b>Domain Layer</b> and adhere to the <a href="/wiki/dependency-rule/">dependency rule</a>, Domain Services aren't allowed to depend on infrastructure layer concerns like <a href="/articles/typescript-domain-driven-design/repository-dto-mapper/">Repositories</a> to get access to the domain entities that they interact with. Application Services fetch the necessary entities, then pass them to domain services to run allow them to interact.</p>

### [Repository](/articles/typescript-domain-driven-design/repository-dto-mapper/)

We use repositories in order to retrieve domain objects from persistence technologies. Using software design principles like the [Liskov Subsitution Principle](/articles/solid-principles/solid-typescript/) and a layered architecture, we can design this in a way so that we can easily make architecture decisions to switch between an in-memory repository for testing, a MySQL implementation for today, and a MongoDB based implementation 2 years from now.

### Factory

We'll want to create domain objects in many different ways. We map to domain objects using a factory that operates on raw sql rows, raw json, or the [Active Record](https://martinfowler.com/eaaCatalog/activeRecord.html) that's returned from your ORM tool (like Sequelize or TypeORM). 

We might also want to create domain objects from templates using the [prototype pattern](https://www.geeksforgeeks.org/prototype-design-pattern/) or through the use of an [abstract factory](/wiki/abstract-factory).

### Domain Events

_The best part of Domain-Driven Design_.

Domain events are simply objects that define some sort of **event** that occurs in the domain **that domain experts care about**.

Typically [when we're dealing with CRUD apps](/articles/enterprise-typescript-nodejs/when-crud-mvc-isnt-enough/), we add new **domain logic** that we've identified by adding more `if/else` statements.

However, in complex applications that can become very cumbersome (think [Gitlab](https://gitlab.com) or [Netflix](https://netflix.com)).

Using Domain Events, instead of _adding more and more `if/else` blocks_ like this:

```typescript
class UserController extends BaseController {
  public createUser () {
    ...
    
    await User.save(user);

    // After creating a user, we handle both:

    // 1. Recording a referral (if one was made)
    if (user.referred_by_referral_code) {
      // calculate payouts
      // .. there could be a lot more logic here
      await Referral.create({ code: this.req.body.referralCode, user_id: user.user_id });
    } 

    // 2. Sending an email verification email
    EmailToken.createToken();
    await EmailService.sendEmailVerificationEmail(user.user_email);

    // mind you, neither of these 2 additonal things that need to get
    // done are particularly the responsibility of the "user" subdomain

    this.ok();
  }
}
```
<div class="caption">Example of handling domain logic (transaction script-style).</div>

We can achieve something beautiful like this:

![](/img/blog/ddd-intro/events.svg)

Using **domain services** (such as the `ReferralFactoryService`) and **application services** (such as the `EmailService`), Domain Events can be used to  _separate the concerns_ of the domain logic to be a executed from the subdomain it belongs.

Domain Events are an excellent way to decouple and chain really complex business logic.

***

## Technical Benefits

- write testable business-layer logic
- spend less time fixing bugs
- watch a codebase actually improve over time as code gets added to it rather than degrade
- create long-lasting software implementations of complex domains

## Technical Drawbacks

Domain modeling is time-consuming up front and it's a technique that needs to be learned.

Because it involves a lot of encapsulation and isolation of the domain model, it can take some time to accomplish.

Depending on the project, it might be more worthwhile to continue building an [Anemic Domain Model](/wiki/anemic-domain-model). Choosing DDD coincides with a lot of the [arguments I made for when it's right to use TypeScript over JavaScript](/articles/when-to-use-typescript-guide/) for your project. Use DDD for #3 of the _3 Hard Software Problems_: The Complex Domain Problem.

# Conclusion

I'm really glad you're here and you're reading this. 

If you're Junior Developer or getting started in the world of software architecture and design, I think you're on the right track.

Domain-Driven Design has introduced me to a world of software architecture, patterns and principles that I might not have naturally started learning until much later.

From my own experience, it's largely a "you don't know it until you need it" kind of thing where:

a) you realize you need to model a complex domain and it seems daunting so you try to find the right methology to approach it or

b) your codebase has become so large that it's hard to add new features without breaking new things, so you seek the solution to that problem or

c) someone more experienced than you brings it to your attention

d) you read my article and you realized [you have an anemic domain model](/wiki/anemic-domain-model) and you don't wish to have one.

The thing about Domain modeling is that it does take a little bit of time to start to get comfortable with. It can be a bit awkward to get accustomed to organizing your code this way, but when you start to reap the benefits of DDD, I think you'll naturally prefer to organize your backend code this way over the [Anemic Domain Model](/wiki/anemic-domain-model) and [Transaction Script](https://martinfowler.com/eaaCatalog/transactionScript.html) approach.

_More in this series so far_..

[Understanding Domain Entities - DDD w/ TypeScript](/articles/typescript-domain-driven-design/entities/)

[Value Objects - DDD w/ TypeScript](/articles/typescript-value-object)

[REST-first design is Imperative, DDD is Declarative [Comparison] - DDD w/ TypeScript](/articles/typescript-domain-driven-design/ddd-vs-crud-design/)

[How to Design & Persist Aggregates - Domain-Driven Design w/ TypeScript](/articles/typescript-domain-driven-design/aggregate-design-persistence/)

[Handling Collections in Aggregates (0-to-Many, Many-to-Many) - Domain-Driven Design w/ TypeScript](/articles/typescript-domain-driven-design/one-to-many-performance/)

[Challenges in Aggregate Design #1 - Domain-Driven Design w/ TypeScript](/articles/typescript-domain-driven-design/domain-modeling-1/)


[^1]: _See [this article](/articles/enterprise-typescript-nodejs/when-crud-mvc-isnt-enough/) on how to know when MVC isn't enough_.

<p class="course-cta">
This is part of the <a href="/courses/domain-driven-design-typescript">Domain-Driven Design w/ TypeScript & Node.js</a> course. Check it out if you liked this post.
</p>

