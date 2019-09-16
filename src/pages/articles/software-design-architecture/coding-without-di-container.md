---
templateKey: article
title: Why I Don't Use a DI Container | Node.js w/ TypeScript
date: '2019-09-16T00:05:26-04:00'
description: >-
  Instead of a DI Container, I just package features by component and use logical naming conventions.
tags:
  - IOC Containers
  - Dependency Injection
  - Inversion of control
category: Software Design
image: /img/blog/di-container/no-di-container.png
published: false
---

I get a lot of emails about which DI container to use. InversifyJS? Awilix?

"Angular and NestJS use their own inversion of control containers, so why aren't you?"

Because I really haven't needed to yet. 

I've been waiting for the moment where my dependencies got out of hand, so that I could honestly and sincerely see the need to utilize a DI container.

But I **haven't** gotten there yet.

I should also add in that my primary codebase is over 150K lines of code and has been alive and actively developed on top of for about 3 years now.

Although, before I learned about the Clean Architecture and [how to organize logic]() into layers

## Prerequisites:

You must be _this high_ to ride this ride.

Here's some stuff you should be familiar in with in order to join in on the conversation.

- Inversion of Control
- [Dependency Inversion](/articles/tutorials/dependency-injection-inversion-explained/)
- [Dependency Injection](/articles/tutorials/dependency-injection-inversion-explained/)
- IoC Containers

## Building a blog

Let's imagine we're building out a website that has a **blog** where you can sign up as a `author`, create `posts`, and write `comments` on `posts`. Also, regular `users` can `comment` on your `posts`.

What's the first thing to do? Figure out the **actors and the [use cases](/articles/enterprise-typescript-nodejs/application-layer-use-cases/)** in order to **package by component**.

## Step 1: Package by component

Front-end developers are already doing this with Angular and they might not even know it.

**Package by component** is something that Bob Martin wrote about in _Clean Architecture_ and that I wrote about in my [free ebook](/resources/names-construct-structure/), "Name, Construct & Structure | Organizing Readable Codebases".

In it, he says that we should "organize our code around the Use Cases" of the application. Doing that will create a project where the names of the folders practically _scream_ the domain of the problem we're solving. He calls it "Screaming Architecture".

The folder structure for a front-end app enabling people to trade vinyl. It might look like the following.

```bash
src
  modules 
    admin             # Admin "actor" (all admin modules/components below)
      analytics         # Analytics module
        components/     # Dumb components
        containers      # Smart components
        pages/          # Pages
        redux/          # Redux for analytics
        services/       # API adapters
        styles/         # Styles
        index.ts        
      dashboard/        # Admin Dashboard module...
      users/            # Admin view of users module...
    shared/           # Shared (admins, traders, etc)
      login/            # Login module...
    traders           # Trader "actor" (all trader modules/components below)
      dashboard/        # Trader Dashboard module...
      register/         # Trader registration module...
      trades/           # Trades module...
  models/
  utils/
```

<p class="caption">Project structure of a Vinyl-Trading front-end app</p>

For example, notice that `Admin` has an `analytics`, `dashboard` and `users` module? In Angular, you're forced to export modules and link everything up using those.

Angular forces you to think about **cohesively packaging components together**.

The word _component_ can also mean module in this case (some call it **Package by Module** instead of **Package by Component**).

That's what I do in backend development as well.

Organize code into cohesive modules... centered around the [use cases](/articles/enterprise-typescript-nodejs/application-layer-use-cases/).

--- 

### Structuring the project around the use cases

Going back to the blog, if I had to structure the project around the use cases, the folder structure would look like this:

```bash
src
  modules
    blog                    # Blog module
      authors               # Authors component
        domain                # Author module entities
          Author.ts
        repos                 # Author module repos
          AuthorRepo.ts
        useCases              # Author module use cases
          createAuthor                # <== Let's look at this one
            CreateAuthorController.ts
            CreateAuthorErrors.ts
            CreateAuthorUseCase.ts
            CreateAuthorUseCase.spec.ts
            index.ts
          getAuthorById/
          getAllAuthors/
          editAuthor/
          deleteAuthor/       
        index.ts               # Exports dependencies from the Authors component
      comments/              # Comments module
      posts/                 # Posts module
    users                    # Users module
```

Notice that the structure is similar? We're just simply following Package By Component and grouping together the features into cohesive units.

Let's focus specifically on the `CreateUser` use case from the `Authors` component for now.

#### Why do this?

2 reasons.

1. It makes it much easier to see what your code can do.
2. People are the reason why software eventually needs to be changed. By organzing code   around the people and their use cases, it makes finding where to go to change code, trivial. Not only that, but having features segregated reduces the possibility of ripple.

### What's in a Use Case?

In any use case folder, I'll strive for **cohesion** by having everything related to that use case there. That means there's a **contoller**, the **use case** itself, a **test** for the use case, and all **possible errors that the use case might generate**. I'll export what's necessary for the world outside of this module using the folder `index.ts`.

```bash
authors
  domain/
  repos/
  useCases              # Author module use cases
    createAuthor                
      CreateAuthorController.ts     # Application controller
      CreateAuthorErrors.ts         # Errors namespace
      CreateAuthorUseCase.ts        # Use case
      CreateAuthorUseCase.spec.ts   # Test for the use case
      index.ts                      # Compose and export use case + controller
    getAuthorById/
    getAllAuthors/
    editAuthor/
    deleteAuthor/  
```

#### Errors

Using a TypeScript namespace, I can represent all the errors for this use case.

<div class="filename">CreateAuthorErrors.ts</div>

```typescript
import { Result } from "core/Result";
import { DomainError } from "core/DomainErrror";

export namespace CreateAuthorErrors {

  export class AuthorExistsError extends Result<DomainError> {
    constructor () {
      super(false, {
        message: `Author already exists`
      } as DomainError)
    }
  }

  export class UserNotYetCreatedError extends Result<DomainError> {
    constructor () {
      super(false, {
        message: `Need to create the user account first`
      } as DomainError)
    }
  }

}
```

#### Use Case

The use case contains the actual feature. 

For this particular use case, the `CreateAuthorUseCase`, it relies on **two external dependencies**. 

One of them, the `IAuthorRepo`, is from the `authors` module.

The other one, the `IUserRepo`, is from the `users` module. 

It also utilizes [functional error handling techniques](/articles/enterprise-typescript-nodejs/functional-error-handling/) that we explored in a previous article.

Take a look:

<div class="filename">CreateAuthorUseCase.ts</div>

```typescript

import { UseCase } from "core/UseCase";
import { Either, Result, left, right } from "core/Result";
import { CreateAuthorErrors } from "./CreateAuthorErrors";
import { AppError } from "core/AppError";
import { IUserRepo } from "modules/users/repos/UserRepo";
import { IAuthorRepo } from "../../repos/AuthorRepo";
import { Author } from "../../domain/Author";

// All we need to execute this is a userId: string.

interface Request {
  userId: string;
}

// The response is going to be either one of these
// failure states, or a Result<void> if successful.

type Response = Either<
  CreateAuthorErrors.AuthorExistsError |
  CreateAuthorErrors.UserNotYetCreatedError |
  AppError.UnexpectedError,
  Result<any>
>

export class CreateAuthorUseCase implements UseCase<Request, Promise<Response>> {

  // This use case relies on an IUserRepo and an IAuthorRepo to work
  private userRepo: IUserRepo;
  private authorRepo: IAuthorRepo;

  public constructor (userRepo: IUserRepo, authorRepo: IAuthorRepo) {
    this.userRepo = userRepo;
    this.authorRepo = authorRepo;
  }

  public async execute (req: Request): Promise<Response> {
    const { userId } = req;

    const user = await this.userRepo.getUserById(userId);
    const userExists = !!user;

    // If the user doesn't exist yet, we can't make them an author
    if (!userExists) {
      return left(
        new CreateAuthorErrors.UserNotYetCreatedError()
      ) as Response;
    }

    // If the user was already made an author, we can return a failed result.
    const alreadyCreatedAuthor = await this.authorRepo
      .getAuthorByUserId(user.userId);

    if (alreadyCreatedAuthor) {
      return left(
        new CreateAuthorErrors.AuthorExistsError()
      ) as Response;
    }

    // If validation logic fails to create an author, we can return a failed result
    const authorOrError: Result<Author> = Author
      .create({ userId: user.userId });

    if (authorOrError.isFailure) {
      return left(
        new AppError.UnexpectedError(authorOrError.error)
      ) as Response;
    }


    // Save the author to the repo
    const author = authorOrError.getValue();
    await this.authorRepo.save(author);

    // Successfully created the author
    return right(Result.ok<void>()) as Response;
  }
}
```

#### Controller

While the controller may be an [infrastructure adapter](/articles/software-design-architecture/organizing-app-logic/), we still want to couple it with the use case to keep this module cohesive.

The controller has one dependency, and it's the `CreateAuthorUseCase` from this module.

We will need to compose the controller with that as a dependency in order to create an instance of this controller.

<p class="special-quote"><b>Base controller</b>: We're using the <b>BaseController</b> from <a href="/articles/enterprise-typescript-nodejs/clean-consistent-expressjs-controllers/">this guide</a>.</p>

<div class="filename">CreateAuthorController.ts</div>

```typescript
import { CreateAuthorUseCase } from "./CreateAuthorUseCase";
import { AppError } from "core/AppError";
import { CreateAuthorErrors } from "./CreateAuthorErrors";

export class CreateAuthorController extends BaseController {
  private useCase: CreateAuthorUseCase;

  constructor (useCase: CreateAuthorUseCase) {
    super();
    this.useCase = useCase;
  }

  public async executeImpl (): Promise<any> {
    const req = this.req as DecodedExpressRequest;
    const { userId } = req.decoded;
    try {
      const result = await this.useCase.execute({ userId });

      if (result.isLeft()) {
        const error = result.value;

        // Based on the error, map to the appropriate HTTP code
        switch (error.constructor) {
          case CreateAuthorErrors.AuthorExistsError:
            return this.notFound(error.errorValue().message)
          case CreateAuthorErrors.UserNotYetCreatedError:
            return this.fail(error.errorValue().message)
          case AppError.UnexpectedError:
          default:
            return this.fail(error.errorValue().message);
        }
      } else {
        return this.ok<void>(this.res);
      }
    } catch (err) {
      console.log(err);
      return this.fail("Something went wrong on our end.")
    }
  }
}
```

We have everything we need in order to execute this feature.

We just need to hook it up.

<a href="/resources/names-construct-structure/">
  <img src="/img/banner/ncs-banner.png"/>
</a>

## Step 2: Hook up the dependencies

Recall that the folder structure looks like this.

```bash
authors
  domain/
  repos/
  useCases              # Author module use cases
    createAuthor                
      CreateAuthorController.ts     # Application controller
      CreateAuthorErrors.ts         # Errors namespace
      CreateAuthorUseCase.ts        # Use case
      CreateAuthorUseCase.spec.ts   # Test for the use case
      index.ts                      # Compose and export use case + controller
    getAuthorById/
    getAllAuthors/
    editAuthor/
    deleteAuthor/  
...
users/
  ...
```

The first thing to create is the `CreateAuthorUseCase`.

But `CreateAuthorUseCase` relies on some dependencies (`IUserRepo` and `IAuthorRepo`).

<div class="filename">author/useCases/index.ts</div>

```typescript
import { CreateAuthorUseCase } from './CreateAuthorUseCase';

const createAuthorUseCase = new CreateAuthorUseCase() /* An argument 
for 'userRepo' and 'authorRepo' was not provided. */
```

My rule of thumb is this:

- Always use `index.ts` to export what needs to be used by others, from your module.
- Always use lowercase names to signal that an exported dependency is an instance, not a class.
- Only <u>export</u> dependencies from the direct parent folder. Only `users/repos/index.ts` is allowed to export `UserRepo`, because it resides as `users/repos/UserRepo`. `users/index.ts` (or anywhere else) is not allowed.

Over in the `users` module, I would have exported an instance of a `IUserRepo` as `userRepo` like this:

<div class="filename">modules/users/repos/index.ts</div>

```typescript
import { models } from '../../../core/infra/models' 
import { UserRepo } from './UserRepo';

const userRepo = new UserRepo(models);

export { 
  userRepo
}
```

And then I would have imported it directly from 

## Benefits of not using a DI container

### Less complexity

Just use the module system! Node.js automatically makes everything a singleton the first time it's imported, if that matters to you.

### Better software composition

Not using a DI container forces you to understand how you compose your classes a lot better, rather than just creating a new `CatsService` with an injectable decorator on it.

This is exactly the type of thing that [Eric Elliot](https://leanpub.com/composingsoftware) has written about extensively in his **Composing Software** book.

### Less circular dependencies

Not using a DI container makes it very hard for you to introduce circular dependencies.

### Less decorator noise 

Decorators are framework/library details that makes it's way into your application level code. That's not very clean.

## Disadvantages

### Working on teams

I think working on teams is sometimes more challenging than working with yourself.

The reasons why frameworks like Angular and NestJS are nodded towards for enterprise software more often than tools like React and Vue, is because frameworks **are opinionated**. 

Frameworks tell you how to do things- their way and their way only. 

There is exactly one way to create a Route Guard in Angular.

In React, that's a different story.

When working with several other people on a team, it can be very challenging to get everyone to adhere to a style guide and do things a certain way, like package features into cohesive components.

Frameworks are successful here because they <u>reduce the total surface area of ways you can do something</u>.

But if the team is small, disciplined, and the experience level is similar, I think that it can work.




