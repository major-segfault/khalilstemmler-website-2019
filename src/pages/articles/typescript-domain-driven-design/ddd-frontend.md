---
templateKey: article
title: "Does DDD Belong on the Frontend? - Domain-Driven Design w/ TypeScript"
date: '2019-09-24T10:04:10-05:00'
updated: '2019-09-24T10:04:10-05:00'
description: >-
  Should we utilize Domain-Driven Design principles and patterns in front-end applications? How far does domain modeling reach from back-end into front-end?
tags:
  - DDD
  - TypeScript
  - Software Design
  - Frontend Development
category: Domain-Driven Design
image: /img/blog/templates/banners/ddd-blog-banner.png
anchormessage: This article is part of Domain-Driven Design w/ TypeScript series. Continue reading <a href="/articles/categories/domain-driven-design">here</a>.
published: true
---

Frontend development is an animal of it's own. From jQuery, to Backbone, to EmberJS, to the (terribly painful) journey of dealing with Webpack in it's infancy, to Angular rewrites, React hooks, and all the various module systems we've had to pretend we knew... we've been through a lot.

I think we can all agree on the fact that modern front-end development can be complex.

And it keeps getting even more complex.

Readers of this blog know that I frequently write about [Domain-Driven Design](/articles/categories/domain-driven-design/) (an approach to software development on projects rich with business logic complexity) though I've only exclusively explored it with respect to backend development. Despite that, I've had several people ask me about Domain-Driven Design on the front-end.

Does it make sense to use the same DDD patterns and principles on the frontend that we do on the backend?

The main arguments that I've heard for applying DDD on the frontend are:

- The front end space is getting just as _complex_ as the backend space. Apparently, we have _Smart UIs_ now. Modern UIs power complex HTML5 games, AR apps, VR apps, and pretty much anything else you can think about.
- State management can be complex. And Domain Events _look a lot like_ how we implement the **store architecture** to manage application state using [Redux](https://redux.js.org/) or [Ngrx](https://ngrx.io/).

So... what do you think? 

> Does DDD belong in the front-end development space?

Generally speaking, <u>no</u> (and I'll explain why in detail), although there **are** some valid frontend use cases that are remniscient to how we implement DDD on the backend.

Here's what we'll discuss in this article exactly:

- Why business logic doesn't belong in the front-end
- The real challenge of front-end development
- Parallels between DDD concepts and how they apply to the front-end
- Good examples of using DDD concepts in the front-end

First argument against it I will make: DDD was meant to address business logic complexity, and business logic doesn't belong on the frontend.

## Business logic doesn't belong on the front-end

Okay so **why** doesn't business logic **belong on the front-end**?

Anyone?

It's because business logic is the [high-level policy](/articles/enterprise-typescript-nodejs/clean-nodejs-architecture/) that _everything else_ relies on (such as the database, the web front-end, the mobile front-end, etc).

And depending on your application, you might actually **require** a single source of truth.

### Single source of truth

Typically, in a client-server architecture, the **backend** acts as the **single source of truth**. The backend is the component that holds all of the high-level policy and dictates _who_ is allowed to do _what_, _when_ they can do it, and to what _degree_ (how) they can do it.

This works. And we like this because it's easy to understand the current state of the system and how everyone may use it.

For someone to execute a [COMMAND or a QUERY](/articles/oop-design-principles/command-query-segregation/) against a resource, all they need to do is ask the **backend**. This is nice because the policy that **truly dictates** how that interation will go lives in one place (the backend).

---

Why can't we organize the architecture differently? Why does the _backend_ need to hold the **high-level policy**?

Well, we _can_ change up that architecture for some use cases. In fact, there are several architectures that _do_ take this approach- [P2P](https://en.wikipedia.org/wiki/Peer-to-peer), for example. However, these architectures only work for **decentralized** systems that **do not** so deperately need a single source of truth in order to govern how the system works.

To avoid going down a rabbit hole on decentralized architectures, the most common systems you'll work on are the ones where there is some sort of **centeralized policy**.

- Todo App (authenticate w/ backend, store data in db)
- Social Networking Site (authenticate w/ backend, perform commands and queries against resources you have access to determined by the backend- _this_ is domain complexity)

Even some P2P apps need centralization:

> Even in a _paid_ decentralized messaging system, the client needs to check the **centeralized** server to see if the acccount has sufficient credits.

### To protect against change

Frontends are a lot more suceptible to change than backends.

Architecturally, the front-end is a **low-level detail**.

That means it's more likely that we'll scrap the entire front end for a new one (as my previous company had actually done several times, moving from Backbone to AngularJS to Angular), than scrap the entire backend for a new one.

The factors at play here are **stability** and **volatility**.

In Uncle Bob's _Clean Architecture_, he wrote about the [Stable Dependency Principle](/wiki/stable-dependency-principle/).

He said that,

> "Components dependencies should be in the direction of stability"

To visualize that, if we were to look at the [clean architecture]() that he talks about, we'd notice that it's the **domain layer** that holds the highest level of **stability** AND **policy**.

<img class="centered-image" style="width: 50%;" src="/img/wiki/package-principles/stability.svg">

<p class="caption">Clean architecture showing that stability goes towards the domain layer</p>.

Why is that? Why does the **domain layer** hold the highest level of policy and stability?

The reason is that the **domain layer** contains the domain modeling code that most closely describes how your business actually works in the real world. 

Since it's very unlikely that your business will drastically change, that means it's very unlikely that we will need to make drastic changes to the domain layer code.

That's what makes the **domain layer** quite stable.

And stable components are components that we can rely on, so it makes sense to enable the unstable (volatile) components to depend on the stable ones, but never rely on an unstable one... like a front-end. 

<p class="special-quote"><b>Opinion</b>: I think the reason why new developers usually end up working in front-end development jobs straight out of school is because technical managers are aware that the front-end is volatile, and if it were mucked up by a new hire, the business would still be OK. There's a lot more at risk for backend development because it's so critical.</p>

Look at how we normally organize the components of a generic web app.

<img style="width: 100%;" src="/img/blog/ddd-frontend/generic-application-architecture.svg"/>

Notice that the **application layer** and the **domain layer** are in the middle of this architecture?

And if we looked at it as a graph, it would form a [Directed Acyclic Graph - DAG](https://en.wikipedia.org/wiki/Directed_acyclic_graph) where the high-level components are on the top, and the low-level  ones are on the bottom.

<img style="width: 100%;" src="/img/blog/ddd-frontend/component-volatility.svg"/>

#### The Open-Closed Principle

In fact, when we do this, we're satisfying the [Open-Closed Principle](/articles/solid-principles/solid-typescript/) _architecturally_.

OCP says that components should be open for extension, but closed for modification. 

If your boss told you to change the color of the background on the client app, is that going to break the backend?

No, because architecturally, our system is open for extension but closed for abstraction. 

This is what we're doing when we **put all the high-level policy in the backend** and ensure that the front-end contains no high-level policy.

I think I've said enough on that for now. That's why the front-end shouldn't have business logic.

### <div class="expandable-section">Categories of business logic sorted by policy<div class="expandable-section-button" onclick="toggleExpandableSection('logic-types')">+</div></div>

<div id="logic-types" class="expandable-section-content">
  <p>These are the categories of business logic ordered from lowest  level policy to highest level policy.</p>
  <ul>
    <li>6. Presentation logic: Logic that's concerned with how we present something to the user.</li>
    <li>5. Data access / adapter logic: Logic concerned with access an infrastructure laywer concern like caches, databases, front-ends, etc.</li>
    <li>4. Application layer logic / use case: Application specific logic. In an enterprise with several different applications (think Google's Docs, Sheets, Maps, etc), each application has it's own set of use cases and policy that governs those use cases.</li>
    <li>3. Domain layer logic: Core business that doesn't quite fit within the confines of a single entity.</li>
    <li>2. Validation logic: Logic that ensures that objects are valid.</li>
    <li>1. Core business logic: Logic that can be confined to a single entity. Ex: in a blog, the fact that a `comment` entity is created with `approved: true` or `approved: false` should be central the creation of a `comment` domain object.</li>
  </ul>
</div>

### <div class="expandable-section">Examples of change rippling into other components<div class="expandable-section-button" onclick="toggleExpandableSection('ripple')">+</div></div>

<div id="ripple" class="expandable-section-content">
  <p class="special-quote"><b>Pricing model change</b>: Assume we have some Software as a Service application and we want to change the pricing model. If we change the pricing model, we're changing an essential piece of domain layer logic. That has potential to affect <i>everything else</i> like the <b>ui</b> (in order to show new options and perhaps restrict pages) and the <b>database</b> (if new tiers were added, we might need to persist those somehow).</p>

  <p class="special-quote"><b>Max users in an account</b>: Let's say there exists an application with <b>Users</b> and <b>Accounts</b>. An account has several users. Assume that this was un-capped for a long time. Accounts could have as many users as they wanted. Suddenly, we decide to add a business rule only allowing <b>3 users to an account</b>. What's affected? <i>Think about it and share in the comments</i>.</p>
</div>

## The real challenge of front-end development is architecture

If we're on the same page about keeping domain logic divorced from the front-end, let's direct our attention to the REAL complexity we're facing when building user interfaces.

Temporarily ignoring complex things like rendering svgs, projecting 3D shapes, or facial detection, the most common complexity faced in **large front-end applications** is the architecture. 

Specifically, it's the front-end stack that we use.

The goal of every front-end framework is to simplify the way that we:

- Define data (data storage)
- Signal that data changes (change detection)
- React to data changes (data flow)

There's no shortage of approaches to handle this. 

- Data storage: Redux/Ngrx store architecture, service-oriented architecture, etc
- Change detection: Angular Zones, Vue's `Object.defineProperty(), React reconcilliation, etc
- React to data changes: Observables, hooks, one-way data flow, etc

These early architectural decisions that have a **profound impact** on the quality and ease of development for the remainder of the project's lifespan. 

I think it would be correct to say that _this_ is as far as **high-level policy** goes on the front-end, and the code we write within the framework of choice are the **low-level** details.

> When you choose a frontend architecture, that high-level decision influences _the way_ you write (low-level) code for the rest of the project.

Choosing that stack, organizing code, and <u>consistently ensuring that code is getting written</u> within the **architectural choices** is (arguably) the most challenging part of front-end development (some might say it's actually CSS 🙂).

<u>None of this has to do with encapsulating a domain model to simplify business logic complexity</u>.

And again, that's what DDD is primarily meant to do.

## Drawing parallels to DDD

Let's _try_ to look at the front-end through DDD lenses.

The first thing we try to do in DDD is understand the _domain_. 

Let's use [White Label](https://github.com/stemmlerjs/white-label), the vinyl-trading application, for example. 

### The subdomain of the front-end

**White Label** is an app where traders can sign up, list the vinyl that they own within their collection, make trades and accept offers.

![](/img/blog/ddd-aggregates/WhiteLabelAddVinyl6.svg)

<p class="caption">Add new vinyl - Fill in album details.</p>

For an application like this, you can only assume that there's going to be a LOT of business logic complexity.

Setting up trades, accepting offers, updating offers, handling inventory, not to mention shipping and tracking. There's a lot going on.

Subdomains that probably exist are `Trading`, `Users`, `Shipping`, `Billing`, and more.

Though, none of that concerns the front-end.

![](/img/blog/ddd-intro/ddd-diagram.svg)

<p class="caption">Choices that we make on the front-end should be mutually exclusive from our domain model.</p> 


The majority of our front-endcode is _dumb_ to the actual problem domain. It largely entails simply **validating forms** before making API calls, **presenting data**, and responding to events like _clicks_ or _button presses_.

<img class="centered-image" style="width: 75%;" src="/img/blog/ddd-frontend/frontend-subdomain.svg"/>

<p class="caption">The primary concepts of coding within the DOM.</p> 

While that's the **common** way to look at how we interact with front-end concerns on a daily basis, it's not always like that.

Sometimes, in presentation-heavy applications like games or applications with canvas / D3 rendering, domain logic _does_ get <u>duplicated into the presentation layer in order to influence how things are presented</u>.

I'll dive deeper into that in **"Good examples of using DDD concepts in the front-end"**, so keep reading.

### Screaming architecture / package by module and subdomain

With respect to the way that I organize code on the front-end, I'll still implement what's called **packaging by module**, which means that we organize code based on the subdomains.

If these are the level subdomains: `Trading`, `Users`, `Shipping`, `Billing`.

Then, in a React-Redux project, my folder structure for the `Trading` subdomain might look like:

```
src
  modules 
    ...
    trading             # Trading module
      components/         # All components for trading subdomain
      models/             # All models in trading subdomain
      pages/              # All pages in trading subdomain
      redux/              # All the redux for the trading subdomain
      services/           # All services that interact with trading API
      styles/             # All styles for trading components
      index.ts
  ...
```

### Value Objects and validation logic

In Domain-Driven Design, **value objects** are responsible for validation logic.

If we had a `User` class and we wanted to ensure that no `User` could ever be created with an invalid `email`, we'd change the type of `email:string` to `email: UserEmail` and create a `UserEmail` value object to control creation of the valid `UserEmail`. 

See the example of a `UserEmail` class below.

```typescript
import { TextUtil } from '../utils'
import { Result, Guard } from '../../core'

interface UserEmailProps {
  email: string;
}

export class UserEmail extends ValueObject<UserEmailProps> {

  // Private constructor. No one can say "new UserEmail('diddle')"
  private constructor (props: UserEmailProps) {
    super(props);
  }

  // Factory method, can do UserEmail.create() 
  public static create (props: UserEmailProps): Result<UserEmail> {
    if (Guard.againstNullOrUndefined(props.email) || 
      !TextUtil.isValidEmail(props.email)) {
        return Result.fail<UserEmail>("Email not provided or not valid.");
    }  else {
      return Result.ok<UserEmail>(new UserEmail(props));
    }
  }
}
```

### Sharing code between the front-end and the back-end

That begs the question, since **validation logic** is one of the forms of logic _does_ have a place on the front-end, should we **package this value object class** and _share_ it on both the front-end and back-end?

<p class="special-quote"><b>Shared kernel</b>: In DDD lingo, a shared kernel is a library or package of domain objects shared across the entire enterprise. This could be an <b>npm</b> library.</p>

You could do that, but sharing **domain-layer code** between the front-end and the back-end is an **architecturally messy decision** that violates the [Stable Dependency Principle (SDP)](/wiki/stable-dependency-principle/) and the [Single Responsibility Principle](/articles/solid-principles/solid-typescript/).

A component should have one reason to change. And if that component is  relied on by both the frontend and the backend, that means it has two  reasons to change.

If a change for a low-level component like the frontend can ripple into something that breaks a high-level component like the backend, then we're also violating [OCP](/articles/solid-principles/solid-typescript/). 

If you want to go this route, I'd advise having a client-side library that's completely separate from your backend models.

### DTOs are your client side models

You probably already knew this, but your [dtos](/articles/typescript-domain-driven-design/repository-dto-mapper/) that you pass from the backend are pretty much your client-side models.

If your DTOs are just TypeScript interfaces, you can copy those in the  front-end or distribute them within your client-side library so that what you get back from an API call can be 

<div class="filename">user/services/userService.ts</div>

```typescript
interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface IUserService {
  getUserByUserId (userId: string): Promise<User>;
}

class UserService extends BaseAPI implements IUserService {
  ... 
  async getUserByUserId (userId: string): Promise<User> {
    // Retrieve the user from the API
    const response = await this.http.get(`user/${userId}`);
    // Type the response
    return response.data as User;
  }
}
```

<p class="caption">Client-side user service</p>

<p class="special-quote"><b>Client-side classes or interfaces?</b>: Depending on if you need to add behavioural capabilities to a client-side model, you may need to also request additional metadata in  order to <b>hydrate</b> the dto into a client-side <i>class</i> with instance methods instead of just deserialized json object. See the <b>Call Flow</b> example in the final section.</p>

### Domain Events are served via websockets or push notifications

[Domain events](/blogs/domain-driven-design/where-do-domain-events-get-dispatched/) get created and emitted when something interesting happens from within one subdomain.

Other subdomains can subscribe to interesting domain events in order to chain complex domain logic.

In the front-end space, this makes a lot of sense to implement with websockets.

If a front-end app sat there listening in on a websocket connection to the backend with a `switch` statement hooked up to the client side, the client could present interesting things to the user in the UI as they happen.

But the client-side is **never responsible for directly creating domain events**.

That's something I've seen recently; where developers confuse a `COMMAND` from [CQRS](/articles/oop-design-principles/command-query-segregation/) with a Domain Event.

## Good examples of using DDD concepts in the front-end

There are some really good use cases where it makes sense to lean on some of the DDD concepts, in a front-end context.

Here are a few tactics that I've had a role in the application of and that I've interacted with recently.

### Hydrating domain models

<p class="special-quote"><b>1st person shooter</b>: Consider you've built an online game like Counter Strike: GO, and you want to be able to release new gun skins, gun models, gun sounds, and what not. Your goal is to be able to dynamically create new guns with their color, render, and behavior (recoil, burst rate) without having to deploy a patch everytime a new gun comes out. Or perhaps <b>players</b> themselves could create their own frankenstein-y guns. <br/> <br/> Since the front-end is responsible for the presentation of those guns, a dto could return not only the basic details about the gun, but also all of the additional metadata required in order to hydrate an instance of a gun class, so that the instance methods and properties dynamically reflect it's presentation and behaviour within the game.</p>

<p class="special-quote"><b>Call flow visualizations</b>: Earlier this year I worked on <b>Talkify</b>, a visual call flow tool built with Angular and D3, enabling small business owners to drag and drop <i>Call Flow Nodes</i> onto a canvas in order to create these really complex call flows. Each Call Flow Node was different in the sense that they all had their own <i>presentation</i>, <i>behavior</i>, <i>chaining rules</i> (am I allowed to put something after this, or is this a terminal node), and <i>editable form</i>. <br/><br/>For example, the <b>number node</b> acted differently from the <b>busines hours node</b> and the <b>AWS lambda node</b> (yeah, it was really cool- you could hook up lambda functions to a call flow).  <br/><br/>Again, there was a sort of dynamicism required because the backend team would deploy new Call Flow Nodes all the time, and the front-end needed only require the metadata for each node via API call in order determine how to render it and how to hook up the specific <b>presentation logic</b> for each node.</p>

### Real-time domain events

<p class="special-quote"><b>Location tracking</b>: Also earlier this year, I was doing work on a mobile app for a company that builds marine magnetometers. Using a steady stream of domain events from a backend application, the mobile app would render a map of your location, your boat's position on the map, and the direction of the magnetometer at the back of the boat.</p>

<p class="special-quote"><b>Git and CI Tools</b>: Tools like GitHub, Gitlab, and Netlify do this all the time. When someone merges a PR, or a build fails, there's usually a UI change that happens if you're looking at the same page.</p>

---

### Takeaway

- Business logic doesn't belong on the front-end because of single-source of truth constraints in centralized applications, the front-end is volatile and prone to change, and components should always point towards the direction of stability.
- The real complexity of front-end development is maintaining a consistent architecture based on the decisions of the tech stack, not encapsulating a domain model.
- Be careful to not violate OCP when sharing code between the front-end and the back-end. Create a client-side library.
- Applications with heavy amounts of presentation logic are the ones that would most benefit from using a client-side presentation model from hydrated domain objects (DTOs).