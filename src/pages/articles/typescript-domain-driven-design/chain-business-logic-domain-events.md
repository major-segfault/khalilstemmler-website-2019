---
templateKey: article
title: "Decoupling Logic with Domain Events [Guide] - Domain-Driven Design w/ TypeScript"
date: '2019-09-26T10:04:10-05:00'
updated: '2019-09-65T10:04:10-05:00'
description: >-
  In this article, we'll walk through the process of using Domain Events to clean up how we decouple complex domain logic across the subdomains of our application.
tags:
  - DDD
  - TypeScript
  - Software Design
  - Domain Events
  - Sequelize
  - TypeORM
category: Domain-Driven Design
image: /img/blog/templates/banners/ddd-blog-banner.png
published: true
anchormessage: This article is part of the upcoming DDD + TypeScript course. <a href="/courses/domain-driven-design-typescript">Check it</a>.
---

<p class="course-cta">
This is part of the <a href="/courses/domain-driven-design-typescript">Domain-Driven Design w/ TypeScript & Node.js</a> course. Check it out if you liked this post.
</p>

## Introduction

When we're working on backend logic, it's not uncommon to eventually find yourself using language like this to describe what should happen.

> "When __ happens, then do ___". 

> And "after this, do that".

> Or, "after this, **and** that, and then this... _but <u>only</u> when_ _this_, do that".

Just all kinds of noise, right?

**Chaining logic** can get really messy. 

Here's what I mean.

When someone **registers for an account** on [White Label](https://github.com/stemmlerjs/white-label), the open-source Vinyl-Trading DDD application I'm building, I want to do several things.

I want to:

- Create the user's account
- Uniquely assign that user a default username based on their actual name
- Send a notification to my Slack channel letting me know that someone signed up
- Add that user to my Mailing List
- Send them a Welcome Email

... and I'll probably think of more things later as well. 

How would _you_ code this up?

A first approach might be to do all of this stuff in a `UsersService`, because that's where the _main_ event (creating the `User`) is taking place, right?

<div class="filename">UsersService.ts</div>

```typescript
import { SlackService } from '../../notification/services/slack';
import { MailchimpService } from '../../marketing/services/mailchimp';
import { SendGridService } from '../../notification/services/email';

class UsersService {
  private sequelizeModels: any;

  constuctor (sequelizeModels: any) {
    this.sequelizeModels = sequelizeModels;
  }

  async createUser (
    email: string, password: string, firstName: string, lastName: string
  ): Promise<void> {

    try {
      // Assign a username (also, might be taken)
      const username = `${firstName}${lastName}`

      // Create user
      await sequelizeModels.User.create({
        email, password, firstName, lastName, username
      });

      // Send notification to slack channel
      await SlackService.sendNotificatation (
        `Hey guys, ${firstName} ${lastName} @ ${email} just signed up.`
      );

      // Add user to mailing list
      await MailchimpService.addEmail(email)

      // Send a welcome email 
      const welcomeEmailTitle = `Welcome to White Label`
      const welcomeEmailText = `Hey, welcome to the hottest place to trade vinyl.`
      await SendGridService.sendEmail(email, welcomeEmailTitle, welcomeEmailText);

    } catch (err) {
      console.log(err);
    }
  }
}
```

The humanity! You probably feel <a target="_blank" href="https://www.youtube.com/watch?v=zhavFPiZXP4">like this</a> right now.

Alright, what's wrong with this?

Lots. But the main things are:

- The `UsersService` knows too much about things that aren't related to `Users`. Sending emails and slack messages most likely should belong to the `Notifications` subdomain, while hooking up marketing campaigns using a tool like Mailchimp would make more sense to belong to a `Marketing` subdoman. Currently, we've <u>coupled</u> all of the unrelated side-effects of `createUser` to the `UsersService`. Think about how challenging it will be in order to isolate and _test_ this class now.

We can fix this.

There's a design principle out there that's specifically useful for times like this. 

<div class="special-quote solid-book-cta">
  <a href="https://solidbook.io" class="solid-book-logo-container">
    <img src="/img/resources/solid-book/book-logo.png"/>
  </a>
  <p>
    <b>Design Principle</b>: "Strive for loosely coupled design against objects that interact". - via <a href="https://solidbook.io">solidbook.io</a>: The Software Architecture & Design Handbook
  </p>
</div>

This decoupling principle is at the heart of lots of one of my favourite libraries, [RxJs](https://github.com/ReactiveX/rxjs).

The design pattern it's built on is called the **observer pattern**. 

---

In this article, we'll learn how to use Domain Events in order to decouple complex business logic. 

## Prerequisites

In order to get the most out of this guide, you should know the following:

- [What Domain-Driven Design is all about](/articles/domain-driven-design-intro/).
- Understand the role of [entities](/articles/typescript-domain-driven-design/entities/), [value objects](/articles/typescript-value-object/), [aggregates](/articles/typescript-domain-driven-design/aggregate-design-persistence/), and [repositories](/articles/typescript-domain-driven-design/repository-dto-mapper/).
- How logically separating your app into [Subdomains and Use Cases](/articles/enterprise-typescript-nodejs/application-layer-use-cases/) helps you to quickly understand where code belongs and enforce architectural boundaries.
- And (optionally), you've read the [previous article](/blogs/domain-driven-design/where-do-domain-events-get-dispatched/) on Domain Events.

## What are Domain Events?

Every business has key events that are **important**. 

In our [vinyl-trading application](https://github.com/stemmlerjs/white-label), within the `vinyl` subdomain, we have events like `VinylCreated`, `VinylUpdated`, and `VinylAddedToWishList`.

In a job seeking application, we might see events like `JobPosted`, `AppliedToJob`, or `JobExpired`. 

Despite the domain that they belong to, when **domain events** are created and dispatched, they provide the opportunity for _other (decoupled) parts_ of our application to execute some code after that event.

## Actors, Commands, Events, and Subscriptions

In order to determine all of the capabilities of an app, an approach is to start by identifying the **actors**, **commands**, **events**, and **responses to those events (subscriptions)**.

- Actors: _Who_ or _what_ is this relevant person (or thing) to the domain? - `Authors`, `Editors`, `Guest`, `Server`
- Commands: _What_ can they do? - `CreateUser`, `DeleteAccount`, `PostArticle`
- Event: _Past_-tense version of the command (verb) - `UserCreated`, `AccountDeleted`, `ArticlePosted`
- Subscriptions: Classes that are interested in the domain event that want to be notified when they occurred - `AfterUserCreated`, `AfterAccountDeleted`, `AfterArticlePosted`

In the DDD-world, there's a fun activity you can do with your team to discover all of these. It's called [Event Storming](https://philippe.bourgau.net/how-to-use-event-storming-to-introduce-domain-driven-design/) and it involves using sticky notes in order to discover the business rules.

<img class="centered-image" src="https://proophsoftware.github.io/fee-office/ddd/img/event_storming_colors.png"/>
<p class="caption">Each sticky note color represents a different DDD concept.</p>

At the end of this process, depending on the size of your company, you'll probably end up with a huge board full of stickies.

<img class="centered-image" src="/img/blog/domain-events/board.png"/>
<p class="caption">Someone's productive Event Storming session.</p>

At this point, we'll probably have a good understanding of who does what, what the commands are, what the policies are the govern when someone can perform a particular command, and what happens in response to those commands as subscriptions to domain events.

Let's apply that to our `CreateUser` command at a smaller scale.

## Uncovering the business rules

Alright, so **any anonymous user** is able to create an account. So an `anonymous user` should be able to execute the `CreateUser` command.

The **subdomain** this command belongs to would be the `Users` subdomain.

<p class="special-quote"><b>Don't remember how <i>subdomains</i> work? </b> Read <a href="/articles/enterprise-typescript-nodejs/application-layer-use-cases/">this article</a> first.</p>

OK. Now, what are the other things we want to happen _in response_ to the `UserCreated` event that would get created and then dispatched?

Let's look at the code again.

<div class="filename">UsersService.ts</div>

```typescript
import { SlackService } from '../../notification/services/slack';
import { MailchimpService } from '../../marketing/services/mailchimp';
import { SendGridService } from '../../notification/services/email';

class UsersService {
  private sequelizeModels: any;

  constuctor (sequelizeModels: any) {
    this.sequelizeModels = sequelizeModels;
  }

  async createUser (
    email: string, password: string, firstName: string, lastName: string
  ): Promise<void> {

    try {

      // Create user (this is ALL that should be here)
      await sequelizeModels.User.create({
        email, password, firstName, lastName
      });

      // Subscription side-effect (Users subdomain): Assign user username
      
      // Subscription side-effect (Notifications subdomain): Send notification to slack channel

      // Subscription side-effect (Marketing subdomain): Add user to mailing list

      // Subscription side-effect (Notifications subdomain): Send a welcome email 

    } catch (err) {
      console.log(err);
    }
  }
}
```

Alright, so we have:

- **Subscription side-effect #1**: `Users` subdomain - Assign user username
- **Subscription side-effect #2**: `Notifications` subdomain - Send notification to slack channel
- **Subscription side-effect #3**: `Marketing` subdomain - Add user to mailing list
- **Subscription side-effect #4**: `Notifications` subdomain - Send a welcome email 

Great, so if were were to visualize the **subdomains** as modules (folders) in a monolith codebase, this is what the generalization would look like:

![](/img/blog/domain-events/intended-domain-events-1.svg)

Actually, we're missing something.

Since we need to _assign a username_ to the user after the `UserCreated` event (and since that operation belongs to the `Users` subdomain), the visualization would look more like this:

![](/img/blog/domain-events/intended-domain-events-2.svg)

Yeah. Sounds like a good plan. And let's start from scratch instead of using this [anemic](/wiki/anemic-domain-model/) `UsersService`.

<p class="special-quote"><b>Want to skip to the finished product?</b> Fork the <a href="https://github.com/stemmlerjs/white-label">repo</a> for White Label, here.</p>

## An explicit Domain Event interface

We'll need an interface in order to depict what a domain event looks like. It won't need much other than the **time** it was created at, and a way to get the [aggregate](/articles/typescript-domain-driven-design/aggregate-design-persistence/) id.

<div class="filename">IDomainEvent.ts</div>

```typescript
import { UniqueEntityID } from "../../core/types";

export interface IDomainEvent {
  dateTimeOccurred: Date;
  getAggregateId (): UniqueEntityID;
}

```

It's more of an [intention revealing interface](/articles/typescript-domain-driven-design/intention-revealing-interfaces/) than anything that actually _does_ something. Half the battle in fighting confusing and complex code is using good names for things.

## How to define Domain Events

A domain event is a "plain ol' TypeScript object". Not much to it other than it needs to implement the interface which means providing the date, the `getAggregateId (): UniqueEntityID` method and any other contextual information that might be useful for someone who subscribes to this domain event to know about.

In this case, I'm passing in the entire `User` aggregate.

Some will advise against this, but for this simple example, you should be OK.

<div class="filename">modules/users/domain/events/UserCreated.ts</div>

```typescript

import { IDomainEvent } from "../../../../core/domain/events/IDomainEvent";
import { UniqueEntityID } from "../../../../core/domain/UniqueEntityID";
import { User } from "../user";

export class UserCreated implements IDomainEvent {
  public dateTimeOccurred: Date;
  public user: User;

  constructor (user: User) {
    this.dateTimeOccurred = new Date();
    this.user = user;
  }
  
  getAggregateId (): UniqueEntityID {
    return this.user.id;
  }
}
```

## How to create domain events

Here's where it gets interesting. The following class is the `User` **aggregate root**. Read through it. I've commented the interesting parts.
 
<div class="filename">modules/users/domain/user.ts</div>

```typescript

import { AggregateRoot } from "../../../core/domain/AggregateRoot";
import { UniqueEntityID } from "../../../core/domain/UniqueEntityID";
import { Result } from "../../../core/logic/Result";
import { UserId } from "./userId";
import { UserEmail } from "./userEmail";
import { Guard } from "../../../core/logic/Guard";
import { UserCreatedEvent } from "./events/userCreatedEvent";
import { UserPassword } from "./userPassword";

// In order to create one of these, you need to pass
// in all of these props. Non-primitive types are Value Objects
// that encapsulate their own validation rules.

interface UserProps {
  firstName: string;
  lastName: string;
  email: UserEmail;      
  password: UserPassword;
  isEmailVerified: boolean;
  profilePicture?: string;
  googleId?: number;      // Users can register w/ google
  facebookId?: number;    // and facebook (instead of email + pass)
  username?: string;
}

// User is a subclass of AggregateRoot. We'll look at the AggregateRoot
// class again shortly.

export class User extends AggregateRoot<UserProps> {

  get id (): UniqueEntityID {
    return this._id;
  }

  get userId (): UserId {
    return UserId.caller(this.id)
  }

  get email (): UserEmail {
    return this.props.email;
  }

  get firstName (): string {
    return this.props.firstName
  }

  get lastName (): string {
    return this.props.lastName;
  }

  get password (): UserPassword {
    return this.props.password;
  }

  get isEmailVerified (): boolean {
    return this.props.isEmailVerified;
  }

  get profilePicture (): string {
    return this.props.profilePicture;
  }

  get googleId (): number {
    return this.props.googleId;
  }

  get facebookId (): number {
    return this.props.facebookId;
  }

  get username (): string {
    return this.props.username;
  }

  // Notice that there aren't setters for everything? 
  // There are only setters for things that it makes sense
  // for there for be setters for, like `username`.
  
  set username (value: string) {
    this.props.username = value;
  }

  // The constructor is private so that it forces you to use the
  // `create` Factory method. There's no way to circumvent 
  // validation rules that way.

  private constructor (props: UserProps, id?: UniqueEntityID) {
    super(props, id);
  }

  private static isRegisteringWithGoogle (props: UserProps): boolean {
    return !!props.googleId === true;
  }

  private static isRegisteringWithFacebook (props: UserProps): boolean {
    return !!props.facebookId === true;
  }

  public static create (props: UserProps, id?: UniqueEntityID): Result<User> {

    // Here are things that cannot be null
    const guardedProps = [
      { argument: props.firstName, argumentName: 'firstName' },
      { argument: props.lastName, argumentName: 'lastName' },
      { argument: props.email, argumentName: 'email' },
      { argument: props.isEmailVerified, argumentName: 'isEmailVerified' }
    ];

    if (
      !this.isRegisteringWithGoogle(props) && 
      !this.isRegisteringWithFacebook(props)
    ) {
      // If we're not registering w/ a social provider, we also
      // need `password`.

      guardedProps.push({ argument: props.password, argumentName: 'password' })
    }

    // Utility that checks if anything is missing
    const guardResult = Guard.againstNullOrUndefinedBulk(guardedProps);

    if (!guardResult.succeeded) {
      return Result.fail<User>(guardResult.message)
    } 
    
    else {
      // Create the user object and set any default values
      const user = new User({
        ...props,
        username: props.username ? props.username : '',
      }, id);

      // If the id wasn't provided, it means that we're creating a new
      // user, so we should create a UserCreatedEvent.

      const idWasProvided = !!id;

      if (!idWasProvided) {
        // Method from the AggregateRoot parent class. We'll look
        // closer at this.
        user.addDomainEvent(new UserCreated(user));
      }

      return Result.ok<User>(user);
    }
  }
}
```

<p class="special-quote">View this file on <a href="https://github.com/stemmlerjs/white-label/blob/master/src/modules/users/domain/user.ts">GitHub</a>.</p>

When we use the **factory method** to create the **User**, depending on if the User is _new_ (meaning it doesn't have an identifier yet) or it's _old_ (and we're just reconsistuting it from persistence), we'll create the `UserCreated` domain event.

Let's look a little closer at what happens when we do `user.addDomainEvent(new UserCreated(user));`.

That's where we're creating/raising the domain event.

We need to go to the `AggregateRoot` class to see what we do with this.

## Handling created/raised domain events

If you remember from our previous chats about [aggregates and aggregate roots](/articles/typescript-domain-driven-design/aggregate-design-persistence/), the **aggregate root** in DDD is the domain object that we use to perform transactions. 

It's the object that we refer to from the outside in order to change anything within it's [invariant](/wiki/invariant/) boundary.

That means that anytime a transaction that wants to change the aggregate in some way (ie: a [command](/articles/oop-design-principles/command-query-segregation/) getting executed), it's the aggregate that is responsible for ensuring that all the business rules are satified on that object and it's not in an invalid state. 

It says,

"Yes, all good! All my invariants are satisfied, you can go ahead and save now."

Or it might say,

> "Ah, no- you're not allowed to add more than 3 `Genres` to a `Vinyl` aggregate. Not OK."

Hopefully, none of that is new as we've talked about that on the blog already.

What's new is how we handle those created/raised **domain events**.

Here's the aggregate root class.

Check out the `protected addDomainEvent (domainEvent: IDomainEvent): void` method.

<div class="filename">core/domain/AggregateRoot.ts</div>

```typescript

import { Entity } from "./Entity";
import { IDomainEvent } from "./events/IDomainEvent";
import { DomainEvents } from "./events/DomainEvents";
import { UniqueEntityID } from "./UniqueEntityID";

// Aggregate root is an `abstract` class because, well- there's 
// no such thing as a aggregate in and of itself. It needs to _be_
// something, like User, Vinyl, etc.

export abstract class AggregateRoot<T> extends Entity<T> {

  // A list of domain events that occurred on this aggregate
  // so far.
  private _domainEvents: IDomainEvent[] = [];

  get id (): UniqueEntityID {
    return this._id;
  }

  get domainEvents(): IDomainEvent[] {
    return this._domainEvents;
  }

  protected addDomainEvent (domainEvent: IDomainEvent): void {
    // Add the domain event to this aggregate's list of domain events
    this._domainEvents.push(domainEvent);
    
    // Add this aggregate instance to the DomainEventHandler's list of
    // 'dirtied' aggregates 
    DomainEvents.markAggregateForDispatch(this);
  }

  public clearEvents (): void {
    this._domainEvents.splice(0, this._domainEvents.length);
  }

  private logDomainEventAdded (domainEvent: IDomainEvent): void {
    ...
  }
}
```

When we call `addDomainEvent(domainEvent: IDomainEvent)`, we:

1) add that domain event to a list of events that _this_ aggregate has seen so far, and 
2) we tell something called `DomainEvents` to mark `this` for dispatch.

Almost there, let's see how the `DomainEvents` class _handles_ domain events.

### The handler of domain events (DomainEvents class)

This was pretty tricky.

My implementation of this is something I ported to TypeScript from [Udi Dahan's 2009 blog post](http://udidahan.com/2009/06/14/domain-events-salvation/) about Domain Events in C#.

Here it is in it's entirety.

<div class="filename">core/domain/events/DomainEvents.ts</div>

```typescript

import { IDomainEvent } from "./IDomainEvent";
import { AggregateRoot } from "../AggregateRoot";
import { UniqueEntityID } from "../UniqueEntityID";

export class DomainEvents {
  private static handlersMap = {};
  private static markedAggregates: AggregateRoot<any>[] = [];

  /**
   * @method markAggregateForDispatch
   * @static
   * @desc Called by aggregate root objects that have created domain
   * events to eventually be dispatched when the infrastructure commits
   * the unit of work. 
   */

  public static markAggregateForDispatch (aggregate: AggregateRoot<any>): void {
    const aggregateFound = !!this.findMarkedAggregateByID(aggregate.id);

    if (!aggregateFound) {
      this.markedAggregates.push(aggregate);
    }
  }

  /**
   * @method dispatchAggregateEvents
   * @static
   * @private 
   * @desc Call all of the handlers for any domain events on this aggregate.
   */

  private static dispatchAggregateEvents (aggregate: AggregateRoot<any>): void {
    aggregate.domainEvents.forEach((event: IDomainEvent) => this.dispatch(event));
  }

  /**
   * @method removeAggregateFromMarkedDispatchList
   * @static
   * @desc Removes an aggregate from the marked list.
   */

  private static removeAggregateFromMarkedDispatchList (aggregate: AggregateRoot<any>): void {
    const index = this.markedAggregates
      .findIndex((a) => a.equals(aggregate));

    this.markedAggregates.splice(index, 1);
  }

  /**
   * @method findMarkedAggregateByID
   * @static
   * @desc Finds an aggregate within the list of marked aggregates.
   */

  private static findMarkedAggregateByID (id: UniqueEntityID): AggregateRoot<any> {
    let found: AggregateRoot<any> = null;
    for (let aggregate of this.markedAggregates) {
      if (aggregate.id.equals(id)) {
        found = aggregate;
      }
    }

    return found;
  }

  /**
   * @method dispatchEventsForAggregate
   * @static
   * @desc When all we know is the ID of the aggregate, call this
   * in order to dispatch any handlers subscribed to events on the
   * aggregate.
   */

  public static dispatchEventsForAggregate (id: UniqueEntityID): void {
    const aggregate = this.findMarkedAggregateByID(id);

    if (aggregate) {
      this.dispatchAggregateEvents(aggregate);
      aggregate.clearEvents();
      this.removeAggregateFromMarkedDispatchList(aggregate);
    }
  }

  /**
   * @method register
   * @static
   * @desc Register a handler to a domain event.
   */

  public static register(
    callback: (event: IDomainEvent) => void, 
    eventClassName: string
  ): void {

    if (!this.handlersMap.hasOwnProperty(eventClassName)) {
      this.handlersMap[eventClassName] = [];
    }
    this.handlersMap[eventClassName].push(callback);

  }

  /**
   * @method clearHandlers
   * @static
   * @desc Useful for testing.
   */

  public static clearHandlers(): void {
    this.handlersMap = {};
  }

  /**
   * @method clearMarkedAggregates
   * @static
   * @desc Useful for testing.
   */

  public static clearMarkedAggregates(): void {
    this.markedAggregates = [];
  }

  /**
   * @method dispatch
   * @static
   * @desc Invokes all of the subscribers to a particular domain event.
   */

  private static dispatch (event: IDomainEvent): void {
    const eventClassName: string = event.constructor.name;

    if (this.handlersMap.hasOwnProperty(eventClassName)) {
      const handlers: any[] = this.handlersMap[eventClassName];
      for (let handler of handlers) {
        handler(event);
      }
    }
  }
}
```

### How to register a handler to a Domain Event?

To **register** a handler to Domain Event, we use the static `register` method.

```typescript
export class DomainEvents {
  private static handlersMap = {};
  private static markedAggregates: AggregateRoot<any>[] = [];

  ...

  public static register(
    callback: (event: IDomainEvent) => void, 
    eventClassName: string
  ): void {
      
    if (!this.handlersMap.hasOwnProperty(eventClassName)) {
      this.handlersMap[eventClassName] = [];
    }
    this.handlersMap[eventClassName].push(callback);

  }
  ... 

}
```

It accepts both a `callback` function and the `eventClassName`, which is the name of the class (we can get that using `Class.name`).

When we register a handler for a domain event, it gets added to the `handlersMap`.

For 3 different domain events and 7 different handlers, the data structure for the handler's map can end up looking like this: 

```json
{
  "UserCreated": [Function, Function, Function],
  "UserEdited": [Function, Function],
  "VinylCreated": [Function, Function]
}
```

<p class="caption">The handlersMap is an Identity map of Domain Event names to callback functions.</p>

How 'bout an example of a handler?

#### AfterUserCreated subscriber (notifications subdomain)

Remember when mentioned that we want a subscriber from within the `Notifications` subdomain to send us a Slack message when someone signs up?

Here's an example of an `AfterUserCreated` subscriber setting up a handler to the `UserCreated` event from within the `User` subdomain.

<div class="filename">modules/notification/subscribers/AfterUserCreated.ts</div>

```typescript

import { IHandle } from "../../../core/domain/events/IHandle";
import { DomainEvents } from "../../../core/domain/events/DomainEvents";
import { UserCreatedEvent } from "../../users/domain/events/userCreatedEvent";
import { NotifySlackChannel } from "../useCases/notifySlackChannel/NotifySlackChannel";
import { User } from "../../users/domain/user";

export class AfterUserCreated implements IHandle<UserCreated> {
  private notifySlackChannel: NotifySlackChannel;

  constructor (notifySlackChannel: NotifySlackChannel) {
    this.setupSubscriptions();
    this.notifySlackChannel = notifySlackChannel;
  }

  setupSubscriptions(): void {
    // Register to the domain event
    DomainEvents.register(this.onUserCreated.bind(this), UserCreated.name);
  }

  private craftSlackMessage (user: User): string {
    return `Hey! Guess who just joined us? => ${user.firstName} ${user.lastName}\n
      Need to reach 'em? Their email is ${user.email}.`
  }

  // This is called when the domain event is dispatched.
  private async onUserCreatedEvent (event: UserCreated): Promise<void> {
    const { user } = event;

    try {
      await this.notifySlackChannel.execute({ 
        channel: 'growth', 
        message: this.craftSlackMessage(user)
      })
    } catch (err) {

    }
  }
}
```

<p class="special-quote"><b>View it on GitHub: </b>Psst. It's <a href="https://github.com/stemmlerjs/white-label/blob/master/src/modules/notification/subscribers/AfterUserCreated.ts">here</a> too. Check out the folder structure to see all the use cases.</p>

The **loose coupling** that happens here's is awesome. It leaves the responsibility of keeping track of _who_ needs to be alerted when a domain event is dispatched, to the `DomainEvents` class, and removes the need for us to couple code between `Users` and `Notifications` directly.

Not only is that good practice, it might very well be necessary! Like, when we get into designing microservices.

### Microservices

When we've split our application not only logically, but physically as well (via microservices), it's actually **impossible** for us to couple two different subdomains together.

We should be mindful of that when we're working on monolith codebases that we might want to someday graduate to microservives. 

> Be mindful of those architectural boundaries between subdomains. They should know very little about each other.

### How does it work in a real-life transaction?

So we've seen how to **register** a handler from a subscriber to a domain event.

And we've seen how an **aggregate root** can create, pass, and store the domain event in an array within the `DomainEvents` class using `addDomainEvent(domainEvent: IDomainEvent)` until it's ready to be dispatched.

```javascript
markedAggregates = [User, Vinyl]
```

What are we missing?

At this point, there are a few more questions I had:

- How do we handle failed transactions? What if we tried to execute the `CreateUser` use case, but it failed before the transaction succeeded? It looks like the domain event still gets created. How do we prevent it from getting sent off to subscribers if the transaction fails? Do we need a _Unit of Work_ pattern?
- Who's responsibility is it to dictate when the domain event should be sent to all subscribers? Who calls `dispatchEventsForAggregate(id: UniqueEntityId)`?

### Separating the creation from the dispatch of the domain event

When a domain event is <u>created</u>, it's _not_ <u>dispatched</u> right away.

That domain event goes **onto the aggregate**, then the aggregate gets marked in `DomainEvents` array. 

```typescript
console.log(user.domainEvents)  // [UserCreated]
```

The `DomainEvents` class then waits until _something_ tells it to <u>dispatch</u> all the handlers within the `markedAggregates` array that match a particular aggregate id.

The question is, who's responsibility is it to say when the transaction was successful?

### Your ORM is the single source of truth for a successful transaction

That's right.


The thing is, a lot of these ORMs actually have mechanisms built in to execute code after things get saved to the database.

For example, the [Sequelize docs](http://docs.sequelizejs.com/manual/hooks.html) has hooks for each of these lifecycle events.

```bash
(1)
  beforeBulkCreate(instances, options)
  beforeBulkDestroy(options)
  beforeBulkUpdate(options)
(2)
  beforeValidate(instance, options)
(-)
  validate
(3)
  afterValidate(instance, options)
  - or -
  validationFailed(instance, options, error)
(4)
  beforeCreate(instance, options)
  beforeDestroy(instance, options)
  beforeUpdate(instance, options)
  beforeSave(instance, options)
  beforeUpsert(values, options)
(-)
  create
  destroy
  update
(5)
  afterCreate(instance, options)
  afterDestroy(instance, options)
  afterUpdate(instance, options)
  afterSave(instance, options)
  afterUpsert(created, options)
(6)
  afterBulkCreate(instances, options)
  afterBulkDestroy(options)
  afterBulkUpdate(options)
```

We're interested in the ones in (5).

And [TypeORM](https://github.com/typeorm/typeorm) has a bunch [entity listeners](https://github.com/typeorm/typeorm/blob/master/docs/listeners-and-subscribers.md) which are effectively the same thing.

- @AfterLoad
- @BeforeInsert
- @**After**Insert
- @BeforeUpdate
- @**After**Update
- @BeforeRemove
- @**After**Remove

Again, we're mostly interested in the ones that happen _afterwards_.

For example, if the `CreateUserUseCase` like the one shown below transaction suceeds, it's right after the [repository](/articles/typescript-domain-driven-design/repository-dto-mapper/) is able to create or update the `User` that the hook gets invoked.

<div class="filename">modules/users/useCases/createUser/CreateUserUseCase.ts</div>

```typescript

import { UseCase } from "../../../../core/domain/UseCase";
import { CreateUserDTO } from "./CreateUserDTO";
import { Either, Result, left, right } from "../../../../core/logic/Result";
import { UserEmail } from "../../domain/userEmail";
import { UserPassword } from "../../domain/userPassword";
import { User } from "../../domain/user";
import { IUserRepo } from "../../repos/userRepo";
import { CreateUserErrors } from "./CreateUserErrors";
import { GenericAppError } from "../../../../core/logic/AppError";

type Response = Either<
  GenericAppError.UnexpectedError |
  CreateUserErrors.AccountAlreadyExists |
  Result<any>, 
  Result<void>
>

export class CreateUserUseCase implements UseCase<CreateUserDTO, Promise<Response>> {
  private userRepo: IUserRepo;

  constructor (userRepo: IUserRepo) {
    this.userRepo = userRepo;
  }

  async execute (req: CreateUserDTO): Promise<Response> {
    const { firstName, lastName } = req;

    const emailOrError = UserEmail.create(req.email);
    const passwordOrError = UserPassword.create({ value: req.password });

    const combinedPropsResult = Result.combine([ 
      emailOrError, passwordOrError 
    ]);

    if (combinedPropsResult.isFailure) {
      return left(
        Result.fail<void>(combinedPropsResult.error)
      ) as Response;
    }

    // Domain event gets created internally, here!
    const userOrError = User.create({ 
      email: emailOrError.getValue(), 
      password: passwordOrError.getValue(), 
      firstName, 
      lastName,
      isEmailVerified: false
    });

    if (userOrError.isFailure) {
      return left(
        Result.fail<void>(combinedPropsResult.error)
      ) as Response;
    }

    const user: User = userOrError.getValue();

    const userAlreadyExists = await this.userRepo.exists(user.email);

    if (userAlreadyExists) {
      return left(
        new CreateUserErrors.AccountAlreadyExists(user.email.value)
      ) as Response;
    }

    try {
      // If this transaction succeeds, we the afterCreate or afterUpdate hooks
      // get called.

      await this.userRepo.save(user);
    } catch (err) {
      return left(new GenericAppError.UnexpectedError(err)) as Response;
    }

    return right(Result.ok<void>()) as Response;
  }
}
```

### Hooking into succesful transactions with Sequelize

Using Sequelize, we can define a callback function for each hook that takes the model name and the primary key field in order to dispatch the events for the aggregate.

<div class="filename">infra/sequelize/hooks/index.ts</div>

```typescript

import models from '../models';
import { DomainEvents } from '../../../core/domain/events/DomainEvents';
import { UniqueEntityID } from '../../../core/domain/UniqueEntityID';

const dispatchEventsCallback = (model: any, primaryKeyField: string) => {
  const aggregateId = new UniqueEntityID(model[primaryKeyField]);
  DomainEvents.dispatchEventsForAggregate(aggregateId);
}

(async function createHooksForAggregateRoots () {

  const { BaseUser } = models;

  BaseUser.addHook('afterCreate', (m: any) => dispatchEventsCallback(m, 'base_user_id'));
  BaseUser.addHook('afterDestroy', (m: any) => dispatchEventsCallback(m, 'base_user_id'));
  BaseUser.addHook('afterUpdate', (m: any) => dispatchEventsCallback(m, 'base_user_id'));
  BaseUser.addHook('afterSave', (m: any) => dispatchEventsCallback(m, 'base_user_id'));
  BaseUser.addHook('afterUpsert', (m: any) => dispatchEventsCallback(m, 'base_user_id'));

})();
```

### Hooking into succesful transactions with TypeORM

Using TypeORM, here's how we can utilize the entity listener decorators to accomplish the same thing.

```typescript
@Entity()
export class User {
    
  @AfterUpdate()
  dispatchAggregateEvents() {
    const aggregateId = new UniqueEntityID(this.userId);
    DomainEvents.dispatchEventsForAggregate(aggregateId);
  }
}
```

## Conclusion

In this article, we learned:

- How domain logic that belongs to separate subdomains can get coupled
- How to create a basic domain events class
- How we can separate the process of notifying a subscriber to a domain event into 2 parts: creation and dispatch, and why it makes sense to do that.
- How to utilize the your ORM from the infrastructure layer to finalize the dispatch of handlers for your domain events

<p class="special-quote"><b>Want to see the code?: </b>Check it out <a href="https://github.com/stemmlerjs/white-label">here</a>.</p>

Now go rule out there and rule the world.

