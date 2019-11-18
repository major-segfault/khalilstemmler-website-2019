---
templateKey: article
title: "How to Handle Updates on Aggregates - Domain-Driven Design w/ TypeScript"
date: '2019-11-18T10:04:10-05:00'
updated: '2019-11-18T10:04:10-05:00'
description: >-
  In this article, you'll learn approaches for handling aggregates on Aggregates in Domain-Driven Design.
tags:
  - DDD
  - TypeScript
  - Software Design
  - Aggregate Root
  - Aggregate
  - Sequelize
category: Domain-Driven Design
image: /img/blog/templates/banners/ddd-blog-banner.png
published: true
anchormessage: This article is part of the upcoming DDD + TypeScript course. <a href="/courses/domain-driven-design-typescript">Check it</a>.
---

<p class="course-cta">
This is part of the <a href="/courses/domain-driven-design-typescript">Domain-Driven Design w/ TypeScript & Node.js</a> course. Check it out if you liked this post.
</p>

_Also from the **[Domain-Driven Design with TypeScript](/articles/categories/domain-driven-design/)** series_.

---

## Introduction

A blog reader recently asked,

> "Please suggest to me the best practices to deal with situations where a single field or only a few fields are present for an update against an [aggregate](/articles/typescript-domain-driven-design/aggregate-design-persistence/)".

Ah yes. Updates.

It's inevitable you'll want to perform update [commands](/articles/oop-design-principles/command-query-segregation/) in a [CRUD + MVC](/articles/enterprise-typescript-nodejs/when-crud-mvc-isnt-enough/) or DDD-based application. Everyone has their own way to handle updates in basic MVC applications, but it's not abundantly clear how to design updates against aggregates using DDD.

In the code sample, they had a `User` aggregate, which looked more or less like this:

<p class="special-quote"><b>Note</b>: I've left comments for improvements that I recommend based on patterns we've explored on this site in previous articles.</p>

<div class="filename">domain/user.ts</div>

```typescript{32-36}
class User extends AggregateRoot {

  // The user props.

  // I would recommend extracting these to props like in the
  // "Understanding Domain Entities" guide.

  // The way it is currently, getters and setters are exposed
  // for everything, and that's not very "Intention Revealing".
  // Also makes it hard to restrict invalid operations (like 
  // manually changing the id) and makes it hard to enforce
  // model invariants like ensuring the Phone is a valid 
  // value object instance (can currently assign to null).
  // Let's take full advantage of the language capabilities.

  id: number;
  phone: Phone;
  email: Email;
  address: Address;

  private constructor (id, phone, email, address){
    // setting values here, I think
  }

  // Very good, there's a public factory method. Should type these  
  // props as their own interface UserProps {} though.
  public static create (props) {

    // There should be a Guard class here to ensure all props are valid.
    return new User({ ...props });
  }

  // This is what's new. We'll talk about this.
  public static update (props) {
    return new User({ ...props });
  }
}
```

There's definitely ways we could improve `User` aggregate, but the real pain points are felt from within the `UsersService`'s `updatePhone` method (which is something that I would normally advocate for representing as an [application layer](/articles/software-design-architecture/organizing-app-logic/) [use case](/articles/enterprise-typescript-nodejs/application-layer-use-cases/)) instead.

<div class="filename">usersService.ts</div>

```typescript
export class UserService {
  ... 
  public updatePhone (updatePhoneDto) {

    const userEntity = userRepository.getUser(updatePhNoDto.userId);

    const userModel = User.update({
      id: updatePhNoDto.userId,
      phone: Phone.create(userEntity.phone),
      email: Email.create(userEntity.email),
      address: Address.create(userEntity.address)
    });

    userRepository.updateUser(userModel)
  }
}
```

The primary drawback to address in this code is the fact that the `updatePhoneDto` probably has a shape like:

```typescript
interface UpdatePhoneDto {
  userId: number;
  phone?: string;
  email?: string;
  address?: string;
}
```

And with all of those optional fields, we need to be able to "deal with situations where a single field or only a few fields are present for an update".

If <u>any of either</u> `phone`, `email`, or `address` aren't present, we'll break each [value object's](/articles/typescript-value-object/) `create()` **factory method**.

That's not good.

### What about non 1-to-1 relationships?

We also have to consider situations where we're not just updating 1-to-1 relationships like `User` to `Phone` or `User` to `Address`.

How do we handle updates against _1-to-many_ or _many-to-many_ relationships?

For example, in [White Label](https://github.com/stemmlerjs/white-label), an `Album` can have many different `Genre`s assigned to it.

We need some way that we can keep track or _mark_ which `Genres` were updated or removed in an update so that we can perform the correct persistence commands (insert? delete? update?).

It can get pretty complex. And that's a necessary complexity when we use domain models to encapsulate business rules and language within code.

The flow is straightforward though.

### Plan of action for performing updates

Since in DDD, we usually implement the [Data Mapper](/articles/typescript-domain-driven-design/repository-dto-mapper/) pattern, the object we retrieve from persistence before we update it will be a _plain 'ol TypeScript object_. 

Our plan for performing an update against and aggregate will look like this:

- 1) Fetch the aggregate (simple TypeScript object) we want to change. 
- 2) Change it.
- 3) Pass it off to a [repo](/articles/typescript-domain-driven-design/repository-dto-mapper/) to `save()` (or perhaps `delete()`).

The **_challenges_ at step 2** are:

- Protecting model integrity ([class invariants](/wiki/invariant/))
- Performing validation logic
- Representing errors as domain concepts
- Keeping "update code" DRY
- Choosing the best ways to represent updates

The **challenges at step 3** are:

- Performing an atomic update as a single transaction 
- Knowing whether to perform an _update_, an _insert_ or a _delete_ based  on the changes from the domain model. 
- Scaffolding across foreign-key tables within the [aggregate boundary](/articles/typescript-domain-driven-design/aggregate-design-persistence/).

Lets start with the basics.

In this article, we'll cover:

- How to handle updates (update, insert, delete) within aggregates with 1-to-1 relationships
- How mutations to your domain model can contain class invariants that need to be represented as domain concepts

We'll go into more advanced stuff like 1-to-many relationships in another article.

## Prerequisites

In order to get the most out of this article, there are a few things that you might want to read first.

- The primary domain-driven design building blocks: [domain entities](/articles/typescript-domain-driven-design/entities/), [value objects](/articles/typescript-value-object/), [aggregate roots](/articles/typescript-domain-driven-design/aggregate-design-persistence/) and aggregate boundaries.
- How to use [DTOs, Repositories, and Mappers](/articles/typescript-domain-driven-design/repository-dto-mapper/) to persist and transform domain objects to other representations.
- The [Command-Query Segregation Principle](/articles/oop-design-principles/command-query-segregation/).
- How every feature of an application is a [use case](/articles/enterprise-typescript-nodejs/application-layer-use-cases/), which is either a command or a query.

## A basic example (1-to-1)

Let's take the example we looked at before: the `User` aggregate and it's relationship to `phone`, `email` and `address`.

### Creating the domain model

I'm going to model the `User` aggregate a little differently than the example provided based on things we've covered in the [Domain-Driven Design w/ TypeScript series](/articles/categories/domain-driven-design/) already.

<div class="filename">domain/user.ts</div>

```typescript
import { AggregateRoot } from "../../../core/domain/AggregateRoot";
import { UniqueEntityID } from "../../../core/domain/UniqueEntityID";
import { UserCreated } from '../events/userCreated'
import { Result } from "../../../core/logic/Result";
import { UserId } from "./userId";
import { Email } from "./email";
import { Phone } from "./phone";
import { Address } from "./address";
import { Guard } from "../../../core/logic/Guard";

interface UserProps {
  phone: Phone;
  email: Email;
  address: Address;
}

export class User extends AggregateRoot<UserProps> {

  // Only getters so far, no way to perform changes to
  // the model after it's been created.

  get userId (): UserId {
    return UserId.create(this._id)
  }

  get phone (): Phone {
    return this.props.phone;
  }

  get email (): Email {
    return this.props.email;
  }

  get address (): Address {
    return this.props.address;
  }

  private constructor (props: UserProps, id?: UniqueEntityID) {
    super(props, id);
  }

  // The only way to create or reconstitute a User is to use the static factory
  // method here.

  public static create (props: UserProps, id?: UniqueEntityID): Result<User> {

    const guardResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.phone, argumentName: 'phone' },
      { argument: props.email, argumentName: 'email' },
      { argument: props.address, argumentName: 'address' }
    ]);

    if (!guardResult.success) {
      return Result.fail<User>(guardResult.message);
    }

    const isNewUser = !!id === false;

    const user = new User(props, id);

    // Dispatch a domain event if it's new. Otherwise, it's just an
    // entity being reconstituted from persistence.
    if (isNewUser) {
      user.addDomainEvent(new UserCreated(user.userId))
    }

    return Result.ok<User>(user);
  }

}
```

Cool, now let's talk about the **use case**.

### Use Case setup

We want to provide a way to update the `User` aggregate, so let's start by creating a new `UpdateUser` use case in our use cases folder for the `User` subdomain.

```bash
modules/
  users/                # `users` subdomain
    domain/
      ...
      user.ts
    ...
    useCases/
      updateUser/
        UpdateUser.ts   # Use case!
```

<p class="caption">Folder structure following the Screaming Architecture / Package by Component principle.</p>

<div class="filename">useCases/updateUser/UpdateUser.ts</div>

```typescript

export class UpdateUser implements UseCase<any, Promise<any>> {

  constructor () {
    // import dependencies
  }

  public async execute (): Promise<any> {
    // execute application layer logic
  }

}
```

If you've read the [Clean Architecture vs. Domain-Driven Design concepts](/articles/software-design-architecture/domain-driven-design-vs-clean-architecture/) article, you'll remember that the responsibility of use cases at this layer are to simply _fetch_ the domain objects we'll need to complete this operation, allow them to interact with each other (at the domain layer), and then save the transaction (by passing the affected aggregate root to it's repository).

That's just what we'll do.

Let's create a [DTO](/articles/typescript-domain-driven-design/repository-dto-mapper/) in order to specify the inputs to this use case.

```bash
...
updateUser/
  UpdateUser.ts     # Use Case
  UpdateUserDTO.ts  # DTO
```

<div class="filename">useCases/updateUser/UpdateUserDTO.ts</div>

```typescript
export interface UpdateUserDto {
  userId: number;
  phone?: string;
  email?: string;
  address?: string;
}
```

And we'll update our use case to use that as the input.

<div class="filename">useCases/updateUser/UpdateUser.ts</div>

```typescript{3,8}
import { UpdateUserDTO } from './UpdateUserDTO'

export class UpdateUser implements UseCase<UpdateUserDTO, Promise<any>> {
  constructor () {
    // import dependencies
  }

  public async execute (request: UpdateUserDTO): Promise<any> {
    // execute application layer logic
  }

}
```

Cool. Now let's [dependency inject](/articles/tutorials/dependency-injection-inversion-explained/) a `UserRepo` so that we can get access to the `user` aggregate that we want to change in this transaction, then let's get it.

<div class="filename">useCases/updateUser/UpdateUser.ts</div>

```typescript
import { IUserRepo } from '../repos/interfaces/userRepo'
import { UpdateUserDTO } from './UpdateUserDTO'

export class UpdateUser implements UseCase<UpdateUserDTO, Promise<any>> {
  private userRepo: IUserRepo;

  constructor (userRepo: IUserRepo) {
    this.userRepo = userRepo;
  }

  public async execute (request: UpdateUserDTO): Promise<any> {
    let user: User;

    try {
      user = await this.userRepo.findUserById(request.userId);
    } catch (err) {
      // Handle not found error. 
    }

    ...
    // Continue

  }
}
```

I'm going to hook up some [expressive error handling](/articles/enterprise-typescript-nodejs/functional-error-handling/) because I don't want a "_Not Found_" error to go unswallowed by the consumer of this use case.

<p class="special-quote"><b>Note:</b> This is how we can strictly type and express any other application-level (use case) or domain layer errors that might get returned. The primary benefit of not throwing errors but instead representing them as first-class citizens of our app is that we <i>force the client</i> using our use case to handle the error states (that we <i>know for sure</i> will occur at some point).</p>

Two new files.

```bash{5,6}
...
updateUser/
  UpdateUser.ts         # Use Case
  UpdateUserDTO.ts      # DTO
  UpdateUserErrors.ts   # Holds all the unique types of application errors
  UpdateUserResult.ts   # Express the result as a functional error type
```

Lets create the namespace to represent errors for this use case.

<div class="filename">updateUser/UpdateUserErrors.ts</div>

```typescript
import { UseCaseError } from "../../../../../shared/core/UseCaseError";
import { Result } from "../../../../../shared/core/Result";

export namespace UpdateUserErrors {

  export class UserNotFoundError extends Result<UseCaseError> {
    constructor (userId: string) {
      super(false, {
        message: `Couldn't find user id {${userId}} to update.`
      } as UseCaseError)
    }
  }

}
```

And then we'll create our strict return type so that clients can know what success and failure states to expect.

<div class="filename">updateUser/UpdateUserResult.ts</div>

```typescript
import { Either, Result } from "../../../../../shared/core/Result";
import { UpvotePostErrors } from "./UpvotePostErrors";
import { AppError } from "../../../../../shared/core/AppError";

export type UpdateUserResult = Either<
  UpdateUserErrors.UserNotFoundError |  // Specific use case error
  AppError.UnexpectedError |            // Global app error
  Result<any>,                          // Misc errors (value objects)
  Result<void>                          // Success!
>
```

<p class="special-quote"><b>Error handling articles:</b> No idea what I'm doing right now? First read "<a href="/articles/enterprise-typescript-nodejs/handling-errors-result-class/">Flexible Error Handling w/ the Result Class</a>" and then read "<a href="/articles/enterprise-typescript-nodejs/functional-error-handling/">Functional Error Handling with Express.js and DDD</a>".</p>

Then let's update the use case with the return type, represent the not found error, and represent the  `void` success state

<div class="filename">useCases/updateUser/UpdateUser.ts</div>

```typescript{6,13,19,24}
import { IUserRepo } from '../repos/interfaces/userRepo'
import { UpdateUserDTO } from './UpdateUserDTO'
import { UpdateUserResult } from './UpdateUserResult'
import { UpdateUserErrors } from './UpdateUserErrors'

export class UpdateUser implements UseCase<UpdateUserDTO, Promise<UpdateUserResult>> {
  private userRepo: IUserRepo;

  constructor (userRepo: IUserRepo) {
    this.userRepo = userRepo;
  }

  public async execute (request: UpdateUserDTO): Promise<UpdateUserResult> {
    let user: User;

    try {
      user = await this.userRepo.findUserById(request.userId);
    } catch (err) {
      return left(new UpdateUserErrors.UserNotFoundError(request.userId))
    }

    // Update logic goes here

    return right(Result.ok<void>())
  }
}
```

Fantastic. We're all set up with to write some update logic now. 

### Handling update logic 

In this particular scenario, we have a DTO with several keys that we'd like to update: `phone`, `email`, `address`.

Depending on the domain, each of these _could possibly_ be modelled as simple [value objects](/articles/typescript-value-object/) because they're more complex than simple `string` types and have validation rules to dictate what a valid instance of them looks like.

We can start by using each value object's factory method (which encapsulates its respective validation logic).

<div class="filename">useCases/updateUser/UpdateUser.ts</div>

```typescript{26-29}
import { IUserRepo } from '../repos/interfaces/userRepo'
import { UpdateUserDTO } from './UpdateUserDTO'
import { UpdateUserResult } from './UpdateUserResult'
import { UpdateUserErrors } from './UpdateUserErrors'
import { Phone } from '../domain/phone'
import { Email } from '../domain/email'
import { Address } from '../domain/addres'

export class UpdateUser implements UseCase<UpdateUserDTO, Promise<UpdateUserResult>> {
  private userRepo: IUserRepo;

  constructor (userRepo: IUserRepo) {
    this.userRepo = userRepo;
  }

  public async execute (request: UpdateUserDTO): Promise<UpdateUserResult> {
    let user: User;

    try {
      user = await this.userRepo.findUserById(request.userId);
    } catch (err) {
      return left(new UpdateUserErrors.UserNotFoundError(request.userId))
    }

    // Create value object instances
    const phoneOrError: Result<Phone> = Phone.create(request.phone);
    const emailOrError: Result<Email> = Email.create(request.email);
    const addressOrError: Result<Address> = Address.create(request.address);

    ... 

    return right(Result.ok<void>())
  }
}
```

The problem is that a request to this use case might _not_ contain each of the keys on the dto interface. It's likely that we only want to update `phone` but not also `email` and `address` in a single request.

We can write our own null checks or use a utility like lodash's `has` function. It will return `true` if a property exists on an object.

<div class="filename">useCases/updateUser/UpdateUser.ts</div>

```typescript{26-29, 31-34,36-39}
import { IUserRepo } from '../repos/interfaces/userRepo'
import { UpdateUserDTO } from './UpdateUserDTO'
import { UpdateUserResult } from './UpdateUserResult'
import { UpdateUserErrors } from './UpdateUserErrors'
import { Phone } from '../domain/phone'
import { Email } from '../domain/email'
import { Address } from '../domain/addres'
import { has } from 'lodash'

export class UpdateUser implements UseCase<UpdateUserDTO, Promise<UpdateUserResult>> {
  private userRepo: IUserRepo;

  constructor (userRepo: IUserRepo) {
    this.userRepo = userRepo;
  }

  public async execute (request: UpdateUserDTO): Promise<UpdateUserResult> {
    let user: User;

    try {
      user = await this.userRepo.findUserById(request.userId);
    } catch (err) {
      return left(new UpdateUserErrors.UserNotFoundError(request.userId))
    }

    if (has(request, 'phone')) {
      const phoneOrError: Result<Phone> = Phone.create(request.phone);
      // update 
    }

    if (has(request, 'email')) {
      const emailOrError: Result<Email> = Email.create(request.email);
      // update 
    }

    if (has(request, 'address')) {
      const addressOrError: Result<Address> = Address.create(request.address);
      // update 
    }

    ... 

    return right(Result.ok<void>())
  }
}
```

Awesome. Now we won't attempt to update something that's not even included in the request. 

Focusing in on one of the keys (like `phone` for example) if we were able to successfully create the value object, we can go ahead and update `user` with it. 

And if we weren't able to create it, yet we included _some value_ for that key in the request, that probably means that there was a validation error that didn't pass and we should let the client know about that (matches the `Result<any>` error type).

<div class="filename">useCases/updateUser/UpdateUser.ts</div>

```typescript
...
export class UpdateUser implements UseCase<UpdateUserDTO, Promise<UpdateUserResult>> {
  ...
  public async execute (request: UpdateUserDTO): Promise<UpdateUserResult> {
    ... 

    if (has(request, 'phone')) {
      const phoneOrError: Result<Phone> = Phone.create(request.phone);

      if (phoneOrError.isSuccess) {
        user.updatePhone(phoneOrError.getValue()) // This will be of Phone type.
      } else {
        return left(phoneOrError) // This will be a Result<any> return type.
      }
    }

    ... 

    return right(Result.ok<void>())
  }
}
```

We have a new method on the `user` aggregate called `updatePhone(phone: Phone)`.


<div class="filename">domain/user.ts</div>

```typescript
...

export class User extends AggregateRoot<UserProps> {

  ...

  get phone (): Phone {
    return this.props.phone;
  }

  public updatePhone (phone: Phone): void {
    this.props.phone = phone;
  }

  ... 

}
```

Simple enough, right? 

Here's where it gets interesting...

#### Atomic Transactions

Lets say we wanted to update `phone` AND `address` in single transaction. 

If `phone` was valid but `address` was **not**, should we let the transaction <u>partially update</u> the `user` aggregate or should the entire transaction fail?

It should fail, right?

Things have the potential to get messy, code can get hard to debug, and things can be challenging to reason about if we were to allow partial transactions. A request to `UPDATE` the `user` has to be <u>fully correct</u> for it to succeed.

How do we do this?

Using our trusty `Result<T>` class and its `combine(results: Result<T>[])` method of  course!~

--- 

We want to keep track of **all the changes** in a transaction, so let's add a `changes: Result<T>[]` property and a couple of methods to manage it as well.

<div class="filename">useCases/updateUser/UpdateUser.ts</div>

```typescript{5,9,12-14,16-18}
...

export class UpdateUser implements UseCase<UpdateUserDTO, Promise<UpdateUserResult>> {
  private userRepo: IUserRepo;
  private changes: Result<T>[];

  constructor (userRepo: IUserRepo) {
    this.userRepo = userRepo;
    this.changes = [];
  }

  public addChange (result: Result<any>) : void {
    this.changes.push(result);
  }

  public getCombinedChangesResult (): Result<any> {
    return Result.combine(this.changes);
  }

  ... 
}
```

The requirement now is that every time we mutate an aggregate, that needs to issue a `Result<T>`.

Going back to our `User` aggregate, we can change the method to accomodate our design decision.

<div class="filename">domain/user.ts</div>

```typescript{11-14}
...

export class User extends AggregateRoot<UserProps> {

  ...

  get phone (): Phone {
    return this.props.phone;
  }

  public updatePhone (phone: Phone): Result<void> {
    this.props.phone = phone;
    return Result.ok<void>();
  }

  ... 

}
```

This might not seem like a great design decision right away. In our `updatePhone` method, the [cyclomatic complexity](https://en.wikipedia.org/wiki/Cyclomatic_complexity) hasn't really changed at all - there are the same number of code paths. So this additional complexity doesn't make a whole lot of sense upfront.

<p class="special-quote"><b>Note:</b> After we finish this up, I'll show you an example of a real life aggregate that enforces class invariants that dictate <i>when</i> and <i>how</i> it's allowed to change. It makes much better use of the Result type.</p>

Using this pattern, we can add each mutation against the `user` aggregate to the changes array.


<div class="filename">useCases/updateUser/UpdateUser.ts</div>

```typescript{40-42,52-54,64-66}
import { IUserRepo } from '../repos/interfaces/userRepo'
import { UpdateUserDTO } from './UpdateUserDTO'
import { UpdateUserResult } from './UpdateUserResult'
import { UpdateUserErrors } from './UpdateUserErrors'
import { Phone } from '../domain/phone'
import { Email } from '../domain/email'
import { Address } from '../domain/addres'
import { has } from 'lodash'

export class UpdateUser implements UseCase<UpdateUserDTO, Promise<UpdateUserResult>> {
  private userRepo: IUserRepo;
  private changes: Result<T>[];

  constructor (userRepo: IUserRepo) {
    this.userRepo = userRepo;
    this.changes = [];
  }

  public addChange (result: Result<any>) : void {
    this.changes.push(result);
  }

  public getCombinedChangesResult (): Result<any> {
    return Result.combine(this.changes);
  }

  public async execute (request: UpdateUserDTO): Promise<UpdateUserResult> {
    let user: User;

    try {
      user = await this.userRepo.findUserById(request.userId);
    } catch (err) {
      return left(new UpdateUserErrors.UserNotFoundError(request.userId))
    }

    if (has(request, 'phone')) {
      const phoneOrError: Result<Phone> = Phone.create(request.phone);

      if (phoneOrError.isSuccess) {
        this.addChange(
          user.updatePhone(phoneOrError.getValue())
        )
      } else {
        return left(phoneOrError)
      }
    }

    if (has(request, 'email')) {
      const emailOrError: Result<Email> = Email.create(request.email);
      
      if (emailOrError.isSuccess) {
        this.addChange(
          user.updateEmail(emailOrError.getValue())
        )
      } else {
        return left(emailOrError)
      }
    }

    if (has(request, 'address')) {
      const addressOrError: Result<Address> = Address.create(request.address);
      
      if (addressOrError.isSuccess) {
        this.addChange(
          user.updateEmail(addressOrError.getValue())
        )
      } else {
        return left(addressOrError)
      }
    }

    ... 

    return right(Result.ok<void>())
  }
}
```

And then at the end, if all of the changes were successful, we can pass it to the repository to be saved. 

<div class="filename">useCases/updateUser/UpdateUser.ts</div>

```typescript{24-32}
...

export class UpdateUser implements UseCase<UpdateUserDTO, Promise<UpdateUserResult>> {
  private userRepo: IUserRepo;
  private changes: Result<T>[];

  constructor (userRepo: IUserRepo) {
    this.userRepo = userRepo;
    this.changes = [];
  }

  public addChange (result: Result<any>) : void {
    this.changes.push(result);
  }

  public getCombinedChangesResult (): Result<any> {
    return Result.combine(this.changes);
  }

  public async execute (request: UpdateUserDTO): Promise<UpdateUserResult> {

    ... 

    if (this.getCombinedChangesResult().isSuccess) {

      try {
        // Save!
        await this.userRepo.save(user);
      } catch (err) {
        return left (AppError.create(err))
      }
    }

    return right(Result.ok<void>())
  }
}
```

And the `UserRepo` knows whether to perform an `update` or a `create` because it will first check to see if the entity exists or not.

<div class="filename">repos/implementations/sequelizeUserRepo.ts</div>

```typescript
export class SequelizeUserRepo implements UserRepo {

  ...

  async save (user: User): Promise<void> {
    const UserModel = this.models.BaseUser;
    const exists = await this.exists(user.email);
    
    if (!exists) {
      const rawSequelizeUser = await UserMap.toPersistence(user);
      await UserModel.create(rawSequelizeUser);
    } else {
      // Update!
    }

    return;
  }
}
```

<p class="special-quote">For more on using Repositories to persist domain entities, read "<a href="/articles/typescript-domain-driven-design/repository-dto-mapper/">Implementing DTOs, Mappers & the Repository Pattern using the Sequelize ORM [with Examples]</a>".</p>

### Extracting "change" functionality to a interface

Pretty much all `update` use cases need to use this kind of change functionality so I'd recommend extracting it into it's own separate class and then using composition to add it to use cases that need it.

<div class="special-quote solid-book-cta">
  <a href="https://solidbook.io" class="solid-book-logo-container">
    <img src="/img/resources/solid-book/book-logo.png"/>
  </a>
  <p>
    <b>Design Principle</b>: "Prefer composition over inheritance". - via <a href="https://solidbook.io">solidbook.io</a>: The Software Architecture & Design Handbook
  </p>
</div>

```typescript
import { Result } from "./Result";

// Use cases that need changes can implement this
export interface WithChanges {
  changes: Changes;
}

// Extracted into its own class
export class Changes {
  private changes: Result<any>[];

  constructor () {
    this.changes = [];
  }

  public addChange (result: Result<any>) : void {
    this.changes.push(result);
  }

  public getCombinedChangesResult (): Result<any> {
    return Result.combine(this.changes);
  }
}
```

This changes the usage in our use case slightly:

<div class="filename">useCases/updateUser/UpdateUser.ts</div>

```typescript{10,12,16,32-34,42}
import { IUserRepo } from '../repos/interfaces/userRepo'
import { UpdateUserDTO } from './UpdateUserDTO'
import { UpdateUserResult } from './UpdateUserResult'
import { UpdateUserErrors } from './UpdateUserErrors'
import { Phone } from '../domain/phone'
import { Email } from '../domain/email'
import { Address } from '../domain/addres'
import { has } from 'lodash'

export class UpdateUser implements UseCase<UpdateUserDTO, Promise<UpdateUserResult>>, WithChanges {
  private userRepo: IUserRepo;
  public changes: Changes;

  constructor (userRepo: IUserRepo) {
    this.userRepo = userRepo;
    this.changes = new Changes();
  }

  public async execute (request: UpdateUserDTO): Promise<UpdateUserResult> {
    let user: User;

    try {
      user = await this.userRepo.findUserById(request.userId);
    } catch (err) {
      return left(new UpdateUserErrors.UserNotFoundError(request.userId))
    }

    if (has(request, 'phone')) {
      const phoneOrError: Result<Phone> = Phone.create(request.phone);

      if (phoneOrError.isSuccess) {
        this.changes.addChange(
          user.updatePhone(phoneOrError.getValue())
        )
      } else {
        return left(phoneOrError)
      }
    }

    ...

    if (this.changes.getCombinedChangesResult().isSuccess) {

      try {
        // Save!
        await this.userRepo.save(user);
      } catch (err) {
        return left (AppError.create(err))
      }
    }

    return right(Result.ok<void>())
  }
}
```

### Representing invalid updates that break class invariants

I said I'd give you a better example of why using `Result<T>` from within a domain entity is a good idea when we're performing mutations against it in the context of an update use case.

Here's one from [DDDForum.com](https://github.com/stemmlerjs/ddd-forum), the Hackernews-inspired forum app built with TypeScript & DDD from solidbook.io.

A `Post` can have either a `link` or `text`, but not both.

And if you wish to change your `link` or `text`, you can only do so if the `Post` **doesn't yet have any comments**.

See that? In this scenario, there are business rules that dictate when it's OK for something to change. That's the power of DDD and model-driven design. The shift that should happen in your thinking is to prefer trying to represent those invalid error states as domain concepts, rather than than throwing untyped errors.

Here's a snippet from the `Post` aggregate.

<div class="filename">domain/post.ts</div>

```typescript

/** Represents the different types of things that can happen when we try 
  * to update the post text or link.
  */ 

export type UpdatePostTextOrLinkResult = Either<
  /**
   * This error means that we're trying to update a text post when the 
   * post is actually a link post, or vice versa.
   */
  EditPostErrors.InvalidPostTypeOperationError | 
  /**
   * This error means that the post is sealed due to there already being
   * comments
   */
  EditPostErrors.PostSealedError |
  Result<any>, 
  Result<void>
>

class Post extends AggregateRoot<PostProps> {

  ... 

  public updateText (postText: PostText): UpdatePostTextOrLinkResult {
    if (!this.isTextPost()) {
      return left(new EditPostErrors.InvalidPostTypeOperationError())
    } 

    if (this.hasComments()) {
      return left(new EditPostErrors.PostSealedError())
    }

    const guardResult = Guard.againstNullOrUndefined(postText, 'postText');
      
    if (!guardResult.succeeded) {
      return left(Result.fail<any>(guardResult.message))
    } 

    this.props.text = postText;
    return right(Result.ok<void>());
  }

  public updateLink (postLink: PostLink): UpdatePostTextOrLinkResult {
    if (!this.isLinkPost()) {
      return left(new EditPostErrors.InvalidPostTypeOperationError())
    } 

    if (this.hasComments()) {
      return left(new EditPostErrors.PostSealedError())
    }

    const guardResult = Guard.againstNullOrUndefined(postLink, 'postLink');
      
    if (!guardResult.succeeded) {
      return left(Result.fail<any>(guardResult.message))
    } 

    this.props.link = postLink;
    return right(Result.ok<void>());
  }
}
```
