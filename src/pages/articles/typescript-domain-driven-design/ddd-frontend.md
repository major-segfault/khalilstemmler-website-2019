---
templateKey: article
title: "Does DDD Belong on the Frontend? - Domain-Driven Design w/ TypeScript"
date: '2019-09-13T10:04:10-05:00'
updated: '2019-09-13T10:04:10-05:00'
description: >-
  We need to write a description
tags:
  - DDD
  - TypeScript
  - Software Design
  - Frontend Development
category: Domain-Driven Design
image: /img/blog/templates/banners/ddd-blog-banner.png
anchormessage: This article is part of Domain-Driven Design w/ TypeScript series. Continue reading <a href="/articles/categories/domain-driven-design">here</a>.
published: false
---

Frontend development is an animal of it's own. From jQuery, to Backbone, to EmberJS, to the (terribly painful) journey of dealing with Webpack in it's infancy, to Angular rewrites, React hooks, and all the various module systems we've had to pretend we knew... we've been through a lot.

And it keeps getting even more complex.

Readers of this blog know that I frequently write about [Domain-Driven Design](/articles/categories/domain-driven-design/), though I've exclusively explored it with respect ot backend development. Despite that, I've had several people ask me about Domain-Driven Design on the front-end.

The main argument that I've heard for applying DDD on the frontend are:

- The front end space is getting just as _complex_ as the backend space. Now, we have _Smart UIs_. These UIs power complex HTML5 games, AR apps, VR apps, and pretty much anything else you can think about.
- State management can be complex. And Domain Events _look a lot like_ how we implement the **store architecture** to manage application state using [Redux](https://redux.js.org/) or [Ngrx](https://ngrx.io/).

So... what do you think? 

> Does DDD belong in the front-end development space?

I'm prepared to convince you why it <u>does not</u>. Read on.

- DDD was meant to address

![DDD Diagram](/img/blog/ddd-intro/ddd-diagram.svg)
<p class="caption">Eric Evans' original DDD architecture diagram. Notice that Model-Driven Design and the Smart UI are mutually exclusive?</p>

## <a class="anchor" name="Goals-of-DDD"></a>DDD was meant to simplify organizing business logic

Domain-Driven Design is the approach to software development which enables us to translate **complex problem domains** into rich, expressive and evolving software. 

The applications that DDD is well suited for are ones with _lots_ of **business logic**.

Applications built around DDD organize logic into different categories. Some examples are **core business logic**, **application layer logic**, **data access logic**, and **presentation logic**, etc.

### <div class="expandable-section">Read more about logic types in application development <div class="expandable-section-button" onclick="toggleExpandableSection('logic-types')">+</div></div>

<div id="logic-types" class="expandable-section-content">
  <p>These are the categories of business logic.</p>
  <ul>
    <li>Presentation logic: Logic that's concerned with how we present something to the user.</li>
    <li>Data access / adapter logic: Logic concerned with access an infrastructure laywer concern like caches, databases, front-ends, etc.</li>
    <li>Application layer logic / use case: Application specific logic. In an enterprise with several different applications (think Google's Docs, Sheets, Maps, etc), each application has it's own set of use cases and policy that governs those use cases.</li>
    <li>Domain layer logic: Core business that doesn't quite fit within the confines of a single entity.</li>
    <li>Validation logic: Logic that ensures that objects are valid.</li>
    <li>Core business logic: Logic that can be confined to a single entity. Ex: in a blog, the fact that a `comment` entity is created with `approved: true` or `approved: false` should be central the creation of a `comment` domain object.</li>
  </ul>
</div>

Among those categories of logic, the obvious candidate for logic that should belong on the front-end is **presentation logic**.

There are also times when **validation logic** (the kind that lives in our [Value Objects](/articles/typescript-value-object/)) can be duplicated to the frontend for things like form validation. 

---

## High-level policy and low-level details

What's **high-level** policy? What's a **low-level** detail?

The **highest-level** policy is anything within the **domain layer**.

The _next_ highest level is anything within the **application layer**.

Everything else after that is a _detail_... <u>including the front-end</u>.

![](/img/wiki/dependency-rule/clean-architecture-layers.svg)

The <u>heart of our application</u> is the **domain layer** which contains the core business rules in addition to the **application layer**. The application layer relies on the domain layer but contains the rules for the _current_ application (think about the _core business rules_ shared between Google apps like Docs, Drive, Sheets, and Maps).

<p class="special-quote"><b>The Dependency Rule</b>: If we apply the <a href="/articles/enterprise-typescript-nodejs/clean-nodejs-architecture/">clean architecture</a>, the <a href="/wiki/dependency-rule/">the dependency rule</a> states that high-level policy shouldn't rely on low-level details.</p>

---

Why do we organize our application like this? 

Is there a reason nothing in an _inner circle_ can't rely on something from an outer circle?

Is the a reason why an _entity_ can't rely on a _repository_ directly?

There certainly is. It's the **Open-Closed Principle**.

### The Open-Closed Principle

The **Open-Closed Principle** states that components should be open for extension, but closed for modification.

At the class level, I think this is well understood.

Blah blah blah.

But at the architectual level, our decision to put the **most important stuff** in the center and **minimize it's dependency on anything else** is not only OCP, but a way to protect our architecture from _volatility_.

### Volatility

Volatility is how likely some component will need to change.

Some components need to be changed all the time.

Therefore, it's best to minimize the amount of code that _depends_ on that.

Low-level details like the **front-end** is the best example of things that need to change often.

How often are you asked to change the position of a button, change what happens after you login, or change the color of something on the screen?

Consider expensive it would be to build and maintain applications if the front-end contained policy that other components relied on.

A change to the front-end would break everything else.

So we minimize the amount of mission critical business rules within the front-end to next to none because _the front-end is a detail_.

## <a class="anchor" name="The-front-end-is-a-detail"></a>Backend is law

<img style="width: 100%;" src="/img/blog/ddd-frontend/generic-application-architecture.svg"/>

- The backend is a stable dependency that we a) protect from changes to infrastructure layer concerns (views, databases, caches, etc) and b) contains the high-level policy.
  - The Open-Closed Principle says that components should be open for extension, but closed for modification.
    - The goal is to make it so that
    - If your boss told you to change the color of the background on the client app, is that going to break the backend?
    - No, because architecturally, our system is open for extension but closed for abstraction. 
    - This is what we're doing when we **put all the high-level policy in the backend** and ensure that the front-end contains no high-level policy.

    - why do we do that?
      - because we know that the front-end is voltatile, we know that we're going to be asked to change things all the time presentationally, and that's what makes it voltatile.
      - Frontends get created and wiped away all the time because they're not as mission critical and risky to change as the back-end.
      - and that's probably why for most developers, their first developer job will most likely be as a frontend developer. 
    
    - if we were asked to change some high-level policy in the backend, would that affect the front-end?
      - has sure might. it has a great potential to affect everything that relies on it, which includes **the front end** _AND_ the **database**.




<img style="width: 100%;" src="/img/blog/ddd-frontend/generic-application-architecture.svg"/>

<img style="width: 100%;" src="/img/blog/ddd-frontend/component-volatility.svg"/>



## <a class="anchor" name="Frontend Complexity is Architectural"></a>The front-end complexity is architectural

Temporarily ignoring complex things like rendering svgs, projecting 3D shapes, or facial detection, the most common complexity faced in **large front-end applications** is an architectural complexity.

The goal of every front-end framework is to simplify the way that we:

- Define data (data storage)
- Signal that data changes (change detection)
- React to data changes (data flow)

There's no shortage of approaches to handle this. 

- Data storage: Redux/Ngrx store architecture, service-oriented architecture, etc
- Change detection: Angular Zones, Vue's `Object.defineProperty(), React reconcilliation, etc
- React to data changes: Observables, hooks, one-way data flow, etc

How do you decide which one to use? 

These are the early architectural decisions that have a profound impact on the quality and ease of development for the remainder of the project's lifespan. 

<!-- Would it be fair to say that choosing a front end architectural stack influences the rest of your development efforts on that project? 

Would it be fair to say that this choice is the **high-level policy**, and the code we write for the rest of the application are the **low-level details**? -->

When you choose a frontend architecture, that stack influences _the way_ you write for the rest of the project.

Choosing that stack, organizing code, and coding within the framework dictated by the stack is (arguably) the most challenging part of front-end development.

<u>None of this has to do with encapsulating a domain model to simplify business logic</u>.

And again, that's what DDD is primarily meant to do.

What's the domain of the front-end anyway?

## The domain of the frontend is the DOM

In a **recruting enterprise**, an application that helps coders get jobs might need the help from several subdomains, like `jobs`, `billing`, `notifications`, `users`, and so on.

What's the domain of the front-end?

If it has to be anything, it's the DOM.

The majority of our front-endcode is _dumb_ to the actual problem domain. It largely entails simply **validating forms** before making API calls, **presenting data**, and responding to events like _clicks_ or _button presses_.

<img style="width: 75%;" src="/img/blog/ddd-frontend/frontend-subdomain.svg"/>

<p class="caption">The primary concepts of coding within the DOM.</p>

These are the concerns we interact with on a daily basis. We're **far** from _being responsible for_ or even _having to acknowledge_ the high-level policy that resides in the backend.

Note that this isn't always the case. Sometimes, in presentation-heavy applications like games or applications with canvas / D3 rendering, domain logic _does_ get <u>duplicated into the presentation layer in order to influence how things are presented</u>. We'll discuss those scenarios in TODO: Domain Knowledge in the Presentation Layer.

## Container components vs. dumb functional components

In 2019, component theory is common knowledge for front-end developers using modern JavaScript frameworks.

The idea is the **container components** are smart- they hold the state and methods that are responsible for _changing_ the state.

Container components are parents to **dumb functional components**. These are components that simply accept the current state/props from the **container components**. They hold no state, and notify the parent when we want to carry out an action.

When we say to keep the UI dumb, we're _not referring to container theory_.

When we say to keep the UI dumb, we mean to keep the UI free of **high-level policy**.

## Validation logic 

In Domain-Driven Design, **value objects** are responsible for validation logic.

If we had a `User` class and we wanted to ensure that no `User` could ever be created with an invalid `email`, we'd change the type of `email:string` to `email: UserEmail` and create a `UserEmail` value object to control creation of the valid `UserEmail`. See the example of a `UserEmail` class below.

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

That begs the question, since **validation logic** is one of the forms of logic _does_ have a place on the front-end, should we **package this value object class** and _share_ it on both the front-end and back-end?

Should we create an **npm library** and put the common code there?

<p class="special-quote"><b>Shared kernel</b>: In DDD lingo, a shared kernel is a library or package of domain objects shared across the entire enterprise. This could be an <b>npm</b> library.</p>

You could do that, but sharing **domain-layer code** between the front-end and the back-end is an **architecturally messy decision** that violates the Open-Closed Principle (OCP), the Single Responsibility Principle (SRP), and the Stable Depdency Principle (SDP).

TODO: We can expand on this later.

Sometimes principles get broken, but I'll leave it to your pragmatism to decide if it's worth maintaining a library that breaks OCP, SRP, and SDP vs. copying email validation code (although not very DRY).

It's also a fact that the backend is a single-source of truth, so unless for less trivial examples of validating an email, it would make more sense to enable the front-end issue the command and see what happens.

## What code gets shared between front-end and back-end?

DTOs (data transmission objects) are client-side entities.

DTOs can also be thought of as view models.

DTOs are really simple classes or interfaces that just dictate the _shape_ of the view model that gets sent to the client via HTTP.

These interfaces _can be shared_. This would be the first thing that I would locate in a library. DTOs may be used by two different agents (front-end + back-end), but they are used by them <u>for the same purpose (to represent the client-side view model)</u>.

The _names_ of Domain Events might also appear in a client-side library in order to strictly type a `switch` statement of events over a websocket stream, but a longer discussion about how and when to share code is probably required here.

## Front-end shouldn't need to concern itself with infrastructure and persistence concerns like UUIDs and domain events

In DDD, we use a **factory method** to create entities. When that succeeds, we get an entity with a unique UUID is assigned to it. At that point, we can save the entity to the database using a repository.

When we shared our entity code on the frontend, we've made the frontend repsonsible for validation logic AND **creating the id** to be used to save the entity to persistence.

This is a quick way to make things difficult to reason about. We've lost vision of who's responsibility it is to **generate** the id.

<img style="width: 100%;" src="/img/blog/ddd-frontend/infra-concern.svg"/>

<p class="caption">The client shouldn't be involved in deciding what the id that gets persisted for a domain object (that doesn't event exist yet) is.</p>

  - When a request comes in, let's say to `CreateUserController` that pulls an `email: string` and `password: string` out of the request body. The subsequent validation logic to ensure `email` and `password` adhere to valid `UserEmail` and `UserPassword` value objects happens **before the `UserEmail` and `UserPassword`** are passed into the `CreatetUser` **use case / application service**. Then, it's the **use case** that creates the `User` entity from both `UserEmail` and `UserPassword`, creating a unique entity ID in the backend.

The concept of ids and primary keys are a database and persistence concern, so why are we involving the front-end in that process?


- The backend is a stable dependency that we a) protect from changes to infrastructure layer concerns (views, databases, caches, etc) and b) contains the high-level policy.
  - The Open-Closed Principle says that components should be open for extension, but closed for modification.
    - The goal is to make it so that
    - If your boss told you to change the color of the background on the client app, is that going to break the backend?
    - No, because architecturally, our system is open for extension but closed for abstraction. 
    - This is what we're doing when we **put all the high-level policy in the backend** and ensure that the front-end contains no high-level policy.

    - why do we do that?
      - because we know that the front-end is voltatile, we know that we're going to be asked to change things all the time presentationally, and that's what makes it voltatile.
      - Frontends get created and wiped away all the time because they're not as mission critical and risky to change as the back-end.
      - and that's probably why for most developers, their first developer job will most likely be as a frontend developer. 
    
    - if we were asked to change some high-level policy in the backend, would that affect the front-end?
      - has sure might. it has a great potential to affect everything that relies on it, which includes **the front end** _AND_ the **database**.
    
  - so for that reason, that's precisely why we limit the amount of high-level policy (to none, ideally) on the front end. And organizing high-level policy is exactly what DDD is for.

  - what's high-level policy?
    - high-level policy are the business rules
      - for example, the **entities** (the main place to store high-level policy, second level)
        - an example might that when a comment gets pos
    - the **dependency rule** states that dependencies should always point towards high-level policy (show clean architecture image).
    - in terms of the layered architecture, the domain layer contains the high-level policy.
    - architecturally, the way we stucture web apps is done in order to protect high-level policy from changes to low-level details


- @commands-and-queries
  - The front-end shouldn't ever _dispatch domain events_. That doesn't make sense.
  - Domain Events happen after COMMANDS are executed. 
  - For example, if the client makes a POST request to /api/users/new (CreateUser) (command), then when the User aggregate is created, it will create a UserCreated domain event (past tense). Then, when the aggregate is successfully saved, THAT's when the domain event will be dispatched and everyone interesting in that event will be notified.
  - Because the client can't tell if a command was successful (since the client should be completely divorced from persistence concerns), it shouldn't ever be responsible for dispatching domain events.

- Soft comparison of front-end constructs to domain constructs:
  - Repository => Service + API call
    - The repository is responsible for pulling domain objects from persistence and saving them. 
      In the same vein, we can think of our client side Service adapters to the RESTful Apis as Repositories. This is a little bit of a stretch, but semantically- they serve similar puposes.
  - Value Objects => Validation Logic
    - If we want to verify form fields on the front end `onchange` or `onblur`, checking the Result<T> of a factory method or abstract factory for the domain object would work, but it's probably overkill for us to attempt to use value objects on the frontend for that reason.

  - Domain Events => Redux immutable actions
    - In Redux, when we dispatch actions in Redux, we're decoupling the action from the _way the system changes in response to that action_. This is essentially **The Hollywood Principle** or Inversion of Control: "don't call us, we'll call you". 
    - But should we dispatch domain events from the frontend? See: @commands-and-queries

    - Domain Events => Push notifications / websocket connection
    - Sometimes we want to be notified when things happen in the backend. Using a websocket  connection or push notifications, we can listen subscribe to  things we're concerned about. 


- Examples where presentation logic is affected by models:
  - Games (Gun models)
    - Maybe we need to be able to retrieve metadata about a particular weapon to figure out how to render it (color, etc) and what it's behavior might be like. (side note: in gaming, they separate the model from the behaviourr- this is called ECS - entity,component system and it looks like an Anemic Domain Model).
  - But even still, the high-level policy is in the backend, it's in the backend where we decide upon the logic. This is adhering to the Open-Closed Principle.

- Examples where access to a domain event stream would be useful
  - GitLab / GitHub
  - Marine Magnetics





Discussing front-end vs. back-end for DDD. Most front-ends are no longer dumb and contain a fair share of logic these days. How do we share it effectively and is the front-end its own DDD service or just a consumer/adapter?


Objective: Contribute original insights to a field through your research and experimentation.