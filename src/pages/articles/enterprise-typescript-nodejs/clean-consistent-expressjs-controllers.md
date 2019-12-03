---
templateKey: article
title: "Clean & Consistent Express.js Controllers | Enterprise Node.js + TypeScript"
date: '2019-05-11T10:04:10-05:00'
updated: '2019-05-11T10:04:10-05:00'
description: >-
  In this article, we explore how to structure a clean and consistent Express.js controller by using abstraction and encapsulation with TypeScript.
tags:
  - Node.js
  - TypeScript
  - Express.js
  - Enterprise software
category: Enterprise Node + TypeScript
image: /img/blog/enterprise-node/enterprise-node.png
published: true
---

_This article is part of the **[Enterprise Node.js + TypeScript](/articles/categories/enterprise-node-type-script/)** series_.

[Express.js](https://expressjs.com/) is my favourite web framework to use with Node.js for building out the **RESTful APIs** on my backend applications.

One of the reasons why Express.js is so popular is because it's minimal and allows you to get up and running quickly with pretty much 0 boilerplate code.

Because there's a lack of opinion around how Express.js controllers and routes should be setup, it's easy to end up writing code that's not very DRY and not very consistent. 

Not only is it important to keep our code DRY to prevent introducing bugs, but we should aim to keep our API responses consistent. The best developer experiences working with RESTful APIs (think [Stripe's API](https://stripe.com/docs)) original from clear and consistent RESTful responses.

Right off the bat, I can think of two ways that we can increase the stability/structure of our responses:

1. Use **Data Transmission Objects** (DTOs) to compose a contract for the structure of the response objects (consistent data contracts).
2. Use a BaseController to encapsulate all responses for all concrete controllers.

We'll cover #2 in this article and revisit #1 in a separate one.

## Creating a BaseController

We want to create some sort of `BaseController` that represents all of the functionality that a controller can accomplish, from one place.

For example, every controller should be able to:

- take in a request and a response
- return a 200 with a response payload / dto
- return a 200/201 without a response payload / dto
- return a 400 error
- return a 500 error

To encapsulate all of this functionality, we can use an `abstract` class.

<div class="filename">shared/infra/http/models/BaseController.ts</div>

```typescript
import * as express from 'express'

export abstract class BaseController {

  /**
   * This is the implementation that we will leave to the
   * subclasses to figure out. 
   */

  protected abstract executeImpl (
    req: express.Request, res: express.Response
  ): Promise<void | any>;

  /**
   * This is what we will call on the route handler.
   * We also make sure to catch any uncaught errors in the
   * implementation.
   */

  public async execute (
    req: express.Request, res: express.Response
  ): Promise<void> {

    try {
      await this.executeImpl(req, res);
    } catch (err) {
      console.log(`[BaseController]: Uncaught controller error`);
      console.log(err);
      this.fail(res, 'An unexpected error occurred')
    }
  }

  public static jsonResponse (
    res: express.Response, code: number, message: string
  ) {
    return res.status(code).json({ message })
  }

  public ok<T> (res: express.Response, dto?: T) {
    if (!!dto) {
      res.type('application/json');
      return res.status(200).json(dto);
    } else {
      return res.sendStatus(200);
    }
  }

  public created (res: express.Response) {
    return res.sendStatus(201);
  }

  public clientError (res: express.Response, message?: string) {
    return BaseController.jsonResponse(res, 400, message ? message : 'Unauthorized');
  }

  public unauthorized (res: express.Response, message?: string) {
    return BaseController.jsonResponse(res, 401, message ? message : 'Unauthorized');
  }

  public paymentRequired (res: express.Response, message?: string) {
    return BaseController.jsonResponse(res, 402, message ? message : 'Payment required');
  }

  public forbidden (res: express.Response, message?: string) {
    return BaseController.jsonResponse(res, 403, message ? message : 'Forbidden');
  }

  public notFound (res: express.Response, message?: string) {
    return BaseController.jsonResponse(res, 404, message ? message : 'Not found');
  }

  public conflict (res: express.Response, message?: string) {
    return BaseController.jsonResponse(res, 409, message ? message : 'Conflict');
  }

  public tooMany (res: express.Response, message?: string) {
    return BaseController.jsonResponse(res, 429, message ? message : 'Too many requests');
  }

  public todo (res: express.Response) {
    return BaseController.jsonResponse(res, 400, 'TODO');
  }

  public fail (res: express.Response, error: Error | string) {
    console.log(error);
    return res.status(500).json({
      message: error.toString()
    })
  }
}
```

At this point, you may be asking why we have an `executeImpl(req, res)` in addition to an `execute(req, res)` method.

The idea is that the `execute(req, res)` **public** method exists in order to actually _hook up_ the Express handler to a Router, while the `executeImpl(res, res)` method is responsible for running the controller logic.

This is done in order to **encapsulate the request and response objects** to the controller's **state** and remove the need for us to pass 'em around manually.

If you're still confused, keep following along. It should become clear as we continue!

## Implementing a controller

Let's take the basic example of creating a `User` that requires a valid `password`, `username` and `email`.

Starting a simple controller to create a user might begin looking like this.

<div class="filename">users/useCases/createUser/CreateUserController.ts</div>

```typescript
import * as express from 'express'

export class CreateUserController extends BaseController {
  protected async executeImpl (req: express.Request, res: express.Response): Promise<void | any> {
    try {
      // ... Handle request by creating objects
 
    } catch (err) {
      return this.fail(err.toString())
    }
  }
}
```

Also, check out that **nice auto-completion** and all the methods we now have available that we no longer have to manually implement!

![](/img/blog/compared/methods.png)

### Implementing the abstract method

When we **extend** an `abstract` class, if the abstract class had any _abstract methods_ on it, we would need to implement those in the subclass. 

<a href="https://solidbook.io">
  <img src="/img/resources/solid-book/book-banner.png"/>
</a>

Observe that we've implemented it in this `CreateUserController`. If you'll recall in the `BaseController`, it had a single `abstract method`:

```typescript
// Abstract method from the CreateUserController 
protected abstract executeImpl (req: express.Request, res: express.Response): Promise<void | any>;
```

This is where we will define the controller logic. We'll start by validating the request payload.

### Validating the request payload

Let's continue by utilizing the [Value Objects](/articles/typescript-value-object/) to validate that the `username`, `password` and `email` coming in hot off the wire from the internet are valid.

<div class="filename">users/useCases/createUser/CreateUserController.ts</div>

```typescript
import * as express from 'express'

export class CreateUserController extends BaseController {
  protected executeImpl (req: express.Request, res: express.Response): void {
    try {
      const { username, password, email } = req.body;
      const usernameOrError: Result<Username> = Username.create(username);
      const passwordOrError: Result<Password> = Password.create(password);
      const emailOrError: Result<Email> = Email.create(email);

      const result = Result.combine([ 
        usernameOrError, passwordOrError, emailOrError 
      ]);

      if (result.isFailure) {
        // Send back a 400 client error
        return this.clientError(res, result.error);
      }

      // ... continue

    } catch (err) {
      return this.fail(res, err.toString())
    }
  }
}
```

If you've been following with the [Domain Driven-Design](/articles/domain-driven-design-intro/) articles I've been writing, you'll recall that this is my preferred approach of delegating the responsibility of validating objects. 

From within any of these Value Object classes, you can use a combination of [Joi validators](https://github.com/hapijs/joi), custom validation methods and anything else you like in order to ensure that the value object [invariants](/wiki/invariant/) are satisfied.

However you might be seeing something _new_ here.

#### Result class

And that _something_ is the usage of a [Result](/articles/enterprise-typescript-nodejs/handling-errors-result-class/) class. Here's a [detailed explanation](/articles/enterprise-typescript-nodejs/handling-errors-result-class/) of it. 

For now, it's sufficient to understand that the [Result](/articles/enterprise-typescript-nodejs/handling-errors-result-class/) class is a cleaner way to handle errors rather than throwing errors explicitly. It also allows us to `combine(Result[]?)`s together in order and will return the first of the provided array of Results that is invalid.

This in turn helps to pass back **really helpful contextual error messages** to the client consuming this API.

---

### Finishing it up

In order to finish off this API request, we'll want to persist the `User` to persistence. 

To do that, we'll ensure that we utilize [Depdendency Inversion](/wiki/dependency-inversion/) to specify that this class depends on an `IUserRepo`.

<div class="filename">users/useCases/createUser/CreateUserController.ts</div>

```typescript
import * as express from 'express'

export class CreateUserController extends BaseController {
  private userRepo: IUserRepo;

  constructor (userRepo: IUserRepo) {
    super();
    this.userRepo = userRepo;
  }

  protected async executeImpl (req: express.Request, res: express.Response): Promise<void | any> {
    try {
      const { username, password, email } = this.req.body;
      const usernameOrError: Result<Username> = Username.create(username);
      const passwordOrError: Result<Password> = Password.create(password);
      const emailOrError: Result<Email> = Email.create(email);

      const result = Result.combine([ 
        usernameOrError, passwordOrError, emailOrError 
      ]);

      if (result.isFailure) {
        // Send back a 400 client error
        return this.clientError(res, result.error);
      }

      // ... continue
      const userOrError: Result<User> = User.create({
        username: usernameOrError.getValue(),
        password: passwordOrError.getValue(),
        email: emailOrError.getValue()
      });

      if (userOrError.isFailure) {
        // Send back a 400 client error
        return this.clientError(res, result.error);
      }

      const user: User = userOrError.getValue();

      // Create the user
      await this.userRepo.createUser(user);

      // Return a 200
      return this.ok<any>(res);

    } catch (err) {
      return this.fail(res, err.toString())
    }
  }
}
```

That's it for the controller!

### Hooking it up to an Express.js route

To [export features from a module without needing a DI container](/articles/software-design-architecture/coding-without-di-container/), I like to do something like this:

<div class="filename">users/useCases/createUser/index.ts</div>

```typescript
import { CreateUserController } from './CreateUserController'
import { UserRepo } from '../repos/UserRepo';
import { models } from '../infra/sequelize';

const userRepo = new UserRepo(models);
const createUserController = new CreateUserController(userRepo);

// Export the feature 
export { createUserController };

```

And to hook it up, we could create a separate router, add any middleware we need to (two are shown here for example) and then execute the controller like so:

```typescript
import { createUserController } from '../useCases/createUser'

import * as express from 'express'
import { Router } from 'express'
const userRouter: Router = Router();

userRouter.post('/new', 
  middleware.useCORS,
  middleware.rateLimit,
  // + any other middleware 
  ...
  (req, res) => createUserController.execute(req, res)
);

export { userRouter }

```

Finally, we can import it from our main Express.js app instance.

```typescript
// app.js

import { userRouter } from '../users/http/routers'

const app = express();
app.use('/user', userRouter)
```

And voila! A `POST` to `/user/new` should do the trick.

---

Now you know my preferred way to create Express.js controllers by encapsulating all of the common functionality in an abstract class.

This type of thing is also possible to do without TypeScript but it's requires a little bit more trickery in order to implement the design patterns and principles we've mentioned in this article.

If you're still considering whether you want to use TypeScript, check out [my definitive guide](/articles/when-to-use-typescript-guide/) on whether it makes sense for your next project.

**Update: May 14th, 2019**

Thanks to [@patroza](https://github.com/patroza) for suggesting that we maintain the request and response objects from within the base class in a stateful/truly object-oriented manner, rather than passing them around functionally. This approach encapsulates responsibility much better.

**Update December 2nd, 2019**

After some battle-testing on this approach, the community and I discovered that making the response on the base class stateful isn't a good idea. If several requests are coming enter the same controller, we'd overwrite responses. The functional approach of passing req and response through has 0 side effects and seems to eliminate this issue. Thanks Ryan, Sam, and Matt!