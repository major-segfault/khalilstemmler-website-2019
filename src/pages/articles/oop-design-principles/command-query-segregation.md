---
templateKey: article
title: "Command Query Segregation | Object-Oriented Design Principles w/ TypeScript"
date: '2019-08-29T10:04:10-05:00'
updated: '2019-08-29T10:04:10-05:00'
description: >-
  CQS (Command-Query Segregation) is a design principle that states that a method is either a COMMAND that performs an action OR a QUERY that returns data to the caller, but never both.
tags:
  - Command Query Segregation
  - Object-Oriented Programming
category: Software Design
image: /img/blog/design-principles/object-oriented-design-principles.png
published: false
---

I recently discovered a programming term, <u>Heisen_bug_</u>. 

No, I'm not talking about about a certain chemistry-teacher turned criminal drug-lord. 

**HeisenBUG**.

It's a pun on the German physicist, <a target="_blank" href="https://en.wikipedia.org/wiki/Werner_Heisenberg">Werner Karl</a> _Heisenberg_'s name, who Bryan Cranston's character in the _Breaking Bad_ TV show is also named after. 

Heisenberg's discovery in particle physics was the <u>uncertainty principle</u>. It states that "the very act of observing [a particle] alters the position of the particle being observed, making it impossible (in theory) to accurately predict it's behavior" [^1].

> Is it just me or does that remind you of your worst debugging nightmares?

**HeisenBUG** takes after the meaning of the uncertainty principle, where it becomes incredibly hard to find a bug. So much so that the bug seems to disappear or alter its behavior when we attempts to take a closer look at it.

In programming, this happens when our code produces unintended or unexpected **side-effects** where we didn't expect it to do so. 

--- 

## Command-Query Segregation (CQS)

Command-Query Segregation (CQS) and not to be confused with the architectural Command-Query _Response_ Segregation (CQRS) pattern, is a design principle (while not strictly object-oriented) that states that:

> a _method_ is either a `COMMAND` that performs an action OR a `QUERY` that returns data to the caller, but never both.

### _Why does this matter?_

There are several reasons why this is good practice. 

The **main reason** is because the alternative, allowing the application's state to change after




Is the `save()` method a `COMMAND` or a `QUERY`?

```typescript
class JobRepo {
  save (job: Job): Promise<Job> {
    ...
  }
}
```

## CQS appears naturally in other contexts of software development

CRUD is how we think about designing simple MVC applications.

### CQS in CRUD

- CRUD Commands: `Create`, `Update`, `Delete`
- CRUD Queries: `READ`

### CQS in RESTful HTTP

In RESTful HTTP, an HTTP method is also either a `COMMAND` or a `QUERY`.

- HTTP Commands: `POST`, `PUT`, `DELETE`, `PATCH`
- HTTP Queries: `GET`

### CQS in SQL

Nearly every operation we do in SQL is a `COMMAND` and only one operation is a `QUERY`. I'm sure you can guess which one (hint: it rhymes with "REFLECT").

### CQS in Use-Case Design

[Projects beyond simple MVC](/articles/enterprise-typescript-nodejs/when-crud-mvc-isnt-enough/) are centered around the [use cases](/articles/enterprise-typescript-nodejs/application-layer-use-cases/) of the application. These are the **features** for an individual **group** of people (`Actors`).

Every use case is _strictly_ a command or a query.

In a `Blog` subdomain,

- Commands: `CreatePost`, `UpdatePost`, `DeletePost`, `PostComment`, `UpdateComment`
- Queries: `GetPostById`, `GetAllPosts`, `GetCommentById`, `GetAllCommentsForPost`

### CQS in Domain-Driven Design

In Domain-Driven Design, it makes sense to separate the `READ` models from the `WRITE` models. `WRITE`s usually take a little bit more time to finish executing because a `WRITE` to [an aggregate](/articles/typescript-domain-driven-design/aggregate-design-persistence/) requires the aggregate to be fully-constituted and contain everything within it's consistency boundary in order to enforce [invariants](/wiki/invariant/).

Using the same `READ` model as a `WRITE` model can be **expensive** as we've explored in [this article](/articles/typescript-domain-driven-design/one-to-many-performance/).

It makes more sense to enable the `READ` models to be used for all `QUERIES` and the `WRITE` model to be used for the `COMMAND`s.

### CQS in architecture with CQRS



## Logging views / retrieval

One use case that challenges this principle is: what if we wanted to log everytime someone accessed a resource? Perhaps in a **Job Board** subdomain, if someone viewed a Job, we might want to save that `JobViewedEvent`.

Wouldn't that be a side-effect of a `QUERY`?

Look, **principles exist to guide us**. So you can always go your own way and do things that seem to make more sense for your project. Just consider that principles have been distilled through generations of developers who've spilt blood, swear, and tears on the worst codebases you and I have never seen, so if it's not much more considerable effort to adhere to, I'd recommend trying.

For a use case like this, we can segregate the **side-effect** from the `GetJobById` use case by adding an extra `LogJobView` `COMMAND` use case. 


[^1]: [Uncertainty Principle](https://en.wikipedia.org/wiki/Uncertainty_principle) - Fascinating wikipedia entry on the principle also sometimes known as _The Heisenberg Effect_.