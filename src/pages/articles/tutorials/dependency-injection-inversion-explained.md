---
templateKey: article
title: Dependency Injection & Inversion Explained | Node.js w/ TypeScript
date: '2019-09-11T00:05:26-04:00'
description: >-
  Dependency Injection and Depdency Inversion are two related but commonly misused terms in software development. In this article, we explore both types of DI and how you can use it to write testable code.
tags:
  - Dependency Injection
  - Dependency Inversion
  - Inversion of Control
  - IoC Containers
category: Software Design Principles
image: /img/blog/di-container/dependency-injection-inversion-explained.png
published: true
---

<div class="solid-book-cta course-cta">
  <div class="solid-book-logo-container">
    <img src="/img/resources/solid-book/book-logo.png"/>
  </div>
  <p>This topic is taken from Solid Book - The Software Architecture & Design Handbook w/ TypeScript + Node.js. <a href="https://solidbook.io">Check it out</a> if you like this post.</p>
</div>

One of the first things we learn in programming is to decompose large problems into smaller parts. That divide-and-conquer approach can help us to assign tasks to others, reduce anxiety by focusing on one thing at a time, and improve modularity of our designs.

There comes a time when things are ready to be hooked up. 

> That's where most developers go about things the wrong way.

Most developers that haven't yet learned about the [solid principles](/articles/solid-principles/solid-typescript/), and proceed to tightly couple modules and classes that shouldn't be coupled, resulting in coupled code that's **hard to change** and **untestable**.

In this article, we're going to learn about:

- Components & software composition
- How not to hook up components
- How and why to inject dependencies using Dependency Injection
- How to apply Dependency Inversion and write testable code
- Considerations using Inversion of Control containers

## Terminology

Let's make sure that we understand the terminology on wiring up dependencies before we continue.

### Components

I'm going to use the term **component** a lot. The term component might strike a chord with React.js or Angular developers, but it can be used beyond the scope of web, Angular, or React components. 

A component is simply a **part of an application**. It's any clump or group of software that's intended to be a part of a larger system.

The idea is to break a _large application_  up into several modular components that can be developed independently and assembled.

The more you learn about software, the more you realize that good software design is **all about composition and decomposition** of components.

### Dependency Injection

Eventually, we'll need to hook components up somehow. Let's look at a trivial (and non-ideal) way that we might hook two components up together. 

In the following example, we want to hook up a `UserController` so that it can retrieve all the `User[]`s from a `UserRepo` ([repository](/articles/typescript-domain-driven-design/repository-dto-mapper/)) when someone makes an HTTP GET request to `/api/users`.

<div class="filename">repos/userRepo.ts</div>

```typescript
/**
 * @class UserRepo
 * @desc Responsible for pulling users from persistence.
 **/

export class UserRepo {
  constructor () {}

  getUsers (): Promise<User[]> {
    // Use Sequelize or TypeORM to retrieve the users from
    // a database.
  }
}
```

And the controller...

<div class="filename">controllers/userController.ts</div>

```typescript
import { UserRepo } from '../repos' // Bad

/**
 * @class UserController
 * @desc Responsible for handling to API requests for the
 * /user route.
 **/

class UserController {
  private userRepo: UserRepo;

  constructor () {
    this.userRepo = new UserRepo(); // Also bad, read on for why
  }

  async handleGetUsers (req, res): Promise<void> {
    const users = await this.userRepo.getUsers();
    return res.status(200).json({ users });
  }
}
```

In the example, we connected a `UserRepo` directly to a `UserController` by <u>referencing the name</u> of the `UserRepo` class from within the `UserController` class.

This isn't ideal. When we do that, we create a **source code dependency**. 

<p class="special-quote"><b>Source code dependency</b>: When the current component (class, module, etc) relies on at least one other component <u>in order to be compiled/created</u>. Source code depdendencies should be limited.</p>

The problem is that everytime that we want to spin up a `UserController`, we need to make sure that the `UserRepo` is also <u>within reach</u> so that the code can compile. 

<img style="width: 100%;" src="/img/blog/di-container/before-dependency-inversion.svg">

<p class="caption">The UserController class depends directly on the UserRepo class.</p>

_When might you want to spin up an isolated `UserController`?_ During testing.

<p class="special-quote">It's a common practice during testing to <i>mock</i> or <i>fake</i> dependencies of the <b>current module under test</b> in order to isolate and test different behaviors.</p>

Notice how we're a) importing the [concrete](/wiki/concrete-class/) `UserRepo` class into the file and b) creating an instance of it from within the `UserController` constructor?

That renders this code **untestable**. Or at least, if `UserRepo` was connected to a real live running database, we'd have to <b>bring the entire database connection</b> with us to run our tests, making them very slow...

--- 

**Dependency Injection** is a technique that can improve the testability of our code. 

It works by passing in (usually via constructor) the dependencies that your module needs to operate. 

If we change the way we inject the `UserRepo` from `UserController`, we can improve it slightly.

<div class="filename">controllers/userController.ts</div>

```typescript
import { UserRepo } from '../repos' // Still bad

/**
 * @class UserController
 * @desc Responsible for handling to API requests for the
 * /user route.
 **/

class UserController {
  private userRepo: UserRepo;

  constructor (userRepo: UserRepo) { // Better, inject via constructor
    this.userRepo = userRepo; 
  }

  async handleGetUsers (req, res): Promise<void> {
    const users = await this.userRepo.getUsers();
    return res.status(200).json({ users });
  }
}
```

Even though we're using dependency injection, but there's still a problem.

`UserController` still relies on `UserRepo` _directly_.

<img style="width: 100%;" src="/img/blog/di-container/before-dependency-inversion.svg">

<p class="caption">This dependency relationship still holds true.</p>

And still, if we wanted to mock out our `UserRepo` that connects to a real SQL database, for a mock in-memory repo, it's not currently possible.

<div class="filename">controllers/userRepo.spec.ts</div>

```typescript
let userController: UserController;

beforeEach(() => {
  userController = new UserController(
    new UserRepo() // Slows down tests, needs a db running
  )
});
```

So.. what do we do?

Introducing the **Dependency _Inversion_ Principle**!

### Dependency Inversion

Dependency Inversion is a technique that allows us to **decouple** components from one another. Check this out.

What direction does **flow of dependencies** go in right now? 

<img style="width: 100%;" src="/img/blog/di-container/before-dependency-inversion.svg">

From left to right. The `UserController` relies on the `UserRepo`.

OK. Ready?

Watch what happens when we ~~slap an interface in between the two components~~ make `UserRepo` implement an `IUserRepo` interface, and then point the `UserController` to refer to _that_ instead of the `UserRepo` concrete class.

<div class="filename">repos/userRepo.ts</div>

```typescript
/**
 * @interface IUserRepo
 * @desc Responsible for pulling users from persistence.
 **/

export interface IUserRepo {          // Exported
  getUsers (): Promise<User[]>
}

class UserRepo implements IUserRepo { // Not exported
  constructor () {}

  getUsers (): Promise<User[]> {
    ...
  }
}
```

And update the controller to refer to the `IUserRepo` everywhere instead.

<div class="filename">controllers/userController.ts</div>

```typescript
import { IUserRepo } from '../repos' // Good!

/**
 * @class UserController
 * @desc Responsible for handling to API requests for the
 * /user route.
 **/

class UserController {
  private userRepo: IUserRepo; // like here

  constructor (userRepo: IUserRepo) { // and here
    this.userRepo = userRepo;
  }

  async handleGetUsers (req, res): Promise<void> {
    const users = await this.userRepo.getUsers();
    return res.status(200).json({ users });
  }
}
```

_Now_ look at direction of the flow of dependencies.

<img style="width: 100%;" src="/img/blog/di-container/after-dependency-inversion.svg">

You see what we just did? By changing all of the **references from concrete classes to interfaces**, we've just **flipped the dependency graph**.

Maybe you're not as excited about this as I am. Let me show you why this is so great.

Remember when I said that we wanted to be able to run tests on the `UserController` without having to pass in a `UserRepo`, solely because it would make the tests slow(`UserRepo` needs a db connection to run)?

Well now, we <u>can write a `MockUserRepo`</u> which implements `IUserRepo`, all the methods on the interface, and instead of using a db connection, uses an array of `User[]`s (much quicker! ⚡).

That's what we'll pass that into the `UserController` instead.

<p class="special-quote"><b>Design principle</b>: Program against interfaces, not implementations.</p>

### Using a `MockUserRepo` to mock out our `UserController`

<div class="filename">repos/mocks/mockUserRepo.ts</div>

```typescript
import { IUserRepo } from '../repos';

class MockUserRepo implements IUserRepo {
  private users: User[] = [];

  constructor () {}

  async getUsers (): Promise<User[]> { 
    return this.users;
  }
}
```

<p class="special-quote"><b>Tip</b>: Adding "async" to a method auto-wraps it in a Promise, making it easy to fake asynchronous activity.</p>

We can write a test using a testing framework like **Jest**.

<div class="filename">controllers/userRepo.spec.ts</div>

```typescript
import { MockUserRepo } from '../repos/mock/mockUserRepo';

let userController: UserController;

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

beforeEach(() => {
  userController = new UserController(
    new MockUserRepo() // Speedy! And valid since it inherits IUserRepo.
  )
});

test ("Should 200 with an empty array of users", async () => {
  let res = mockResponse();
  await userController.handleGetUsers(null, res);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalledWith({ users: [] });
})
```

**Congrats. You (more or less) just learned how write testable code!**. 

### Inversion of Control & IoC Containers

Applications get much larger than just two components. 

Not only do we need to ensure we're **referring to interfaces** and NOT concrete implementations, but we also need to handle the process of manually injecting _instances_ of dependencies at runtime.

If your app is relatively small or you've got a style guide for hooking up dependencies on your team, you could do this manually.

If you've got a huge app and you don't have a plan for how you'll accomplish dependency injection within in your app, it has potential to get out of hand.

It's for that reason that **Inversion of Control (IoC) Containers** exist.

They work by requiring you to:

1. Create a container (that will hold all of your app dependencies)
2. Make that dependency known to the container (specify that it is _injectable_)
3. Resolve the depdendencies that you need by asking the container to inject them

Some of the more popular ones for JavaScript/TypeScript are [Awilix](https://github.com/jeffijoe/awilix) and [InversifyJS](http://inversify.io/).

Personally, I'm not a huge fan of them and the additional **infrastructure-specific framework logic** that they scatter all across my codebase. 

If you're like me and you're not into _container life_, I have <u>my own style guide for injecting dependencies</u> that I talk about in [solidbook.io](https://solidbook.io). I'm also working on some video content, so stay tuned!

<p class="special-quote"><b>Inversion of Control</b>: Traditional control flow for a program is when the program only does what we tell it to do (today). Inversion of control flow happens when we develop frameworks or enable a <b>plugin architecture</b> with areas of code that can be hooked into. In these areas, we <i>might not know (today)</i> how we want it to be used, or we wish to enable developers to add additional functionality. That means that every <b>lifecycle hook in React.js or Angular</b> is a good example of Inversion of Control in practice. IoC is also often explained by the "Hollywood Design Principle": <i>Don't call us, we'll call you</i>.</p>







