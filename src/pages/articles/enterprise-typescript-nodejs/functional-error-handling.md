---
templateKey: article
title: "Functional Error Handling with Express.js and DDD | Enterprise Node.js + TypeScript"
date: '2019-08-14T10:04:10-05:00'
updated: '2019-08-30T10:04:10-05:00'
description: >-
  How to expressively represent (database, validation and unexpected) errors as domain concepts using functional programming concepts and how to hook those errors up to our Express.js base controller. 
tags:
  - Node.js
  - TypeScript
  - Functional programming
  - DDD
  - Express.js
  - Enterprise software
category: Enterprise Node + TypeScript
image: /img/blog/enterprise-node/enterprise-node.png
published: true
---

Imagine a world where you could open a _severely rattled_ bottle of Pepsi with **brazen confidence**, not hesitating to consider the possibility that it might end up drenching you.

Imagine a world where nothing ever went wrong; where you <u>only ever had to consider the **happy path**</u>. 

Let me know when we discover that world, because it's certainly <u>not the one we currently live in</u>. And it's something that's _especially_ true with programming. 

---

## Errors need love too ❤️

In most programming projects, there's confusion as to **how and where** errors should be handled.

They account of a large portion of our application's **possible states**, and more often than not, it's one of the _last_ things considered. 

- _Do I `throw` an error and let the client figure out how to handle it?_
- _Do I return `null`?_

When we `throw` errors, we disrupt the flow of the program and make it trickier for someone to walk through the code, since exceptions share similarities with the [sometimes criticized](https://stackoverflow.com/questions/3329390/difference-between-goto-and-throw) `GOTO` command.

And when we return `null`, we're breaking the **design principle** that "a method should return a **single type**". Not adhering to this can lead to misuse of our methods from clients.

We've half solved this problem in a previous article where we [explored the use of a `Result` class](/articles/enterprise-typescript-nodejs/handling-errors-result-class/) to mitigate the _jerky_ behaviour of throwing errors all over the place. And we're also able to determine if a `Result` is a **success** or a **failure** through `Result.ok<T>` and `Result.fail<T>`, but there's something missing...

> Errors have a place in the domain as well, and they deserve to be modeled as to be modeled as domain concepts

Since errors account for so much of program behaviour, we can't pretend to ignore them. And if we're serious about object-modeling, when we express our errors as **domain concepts**, our domain model becomes a lot richer and says a lot more about the actual problem.

That leads to improved readability and less bugs.

Let me ask you, for something _really important_, which would you rather receive if something went wrong?

```typescript
new Error('Something brok, sorry :p haha')
```

or

```typescript
type Response = Either<
  // Failure results
  CreateUserError.UsernameTakenError | 
  CreateUserError.EmailInvalidError | 
  CreateUserError.AccountAlreadyExistsError |
  CreateUserError.InsecurePasswordError
  , 
  // Success
  Result<any>
>
```

Here's what you should expect to know by the end of this article:

- Why expressing errors explicitly is important to domain modeling
- How to expressively represent errors using types
- How to and why to organize all errors by [Use Cases](/articles/enterprise-typescript-nodejs/application-layer-use-cases/)
- How to elegantly connect errors to [Express.js](https://expressjs.com/) API responses

---

## How common approaches to handling errors fail to express domain concepts

We briefly mentioned this, but two very common (and fragile) approaches to handling errors I've seen are to either **(1) Return null** or **(2) Log and throw**.

### (1) Return null

Consider we had a simple JavaScript function to **Create a User**:

```typescript
function CreateUser (email, password) {
  const isEmailValid = validateEmail(email);
  const isPasswordValid = validatePassword(password);

  if (!isEmailValid) {
    console.log('Email invalid');
    return null;
  }

  if (!isPasswordValid) {
    console.log('Password invalid');
    return null;
  }

  return new User(email, password);
}
```

You've seen code like this before. You've also written code like this. I know I have.

The truth is, it's not great. Returning `null` is a little bit **lazy** because it requires the caller to be aware of the fact that a _failure_ to produce a `User` will actually produce a `null`.

That provokes mistrust and clutters code with **`null`-checks everywhere**.

```typescript
  const user = CreateUser(email, password);
  if (user !== null) {
    // success
  } else {
    // fail
  }
```

Not only that, but there are **two separate failure states** that could occur here:

- The email could be invalid
- The password could be invalid

Returning `null` fails to _differentiate_ between these two errors. We've actually lost expressiveness of our **domain model**.

Consider if we wanted our API to return **separate error messages** for those errors?

That requirement might lead us to **(2) Log and throw**.

### (2) Log and throw

Here's another common (non-optimal) approach to error handling.

```typescript
function CreateUser (email, password) {
  const isEmailValid = validateEmail(email);
  const isPasswordValid = validatePassword(password);

  if (!isEmailValid) {
    console.log('Email invalid');
    return new Error('The email was invalid');
  }

  if (!isPasswordValid) {
    console.log('Password invalid');
    return new Error('The password was invalid');
  }

  return new User(email, password);
}
```

In this case, we do get back an **error message** from the `Error`, but manually throwing errors means having to surround lots of _your own code_ in `try-catch` blocks.

```typescript
try {
  const user = CreateUser(email, password);
} catch (err) {
  switch (err.message) {
    // Fragile code
    case 'The email was invalid':
      // handle
    case 'The password was invalid':
      // handle
  }
}
```

Typically, we should aim to reserve `try-catch` blocks for operations that interact with the outside world <u>(ie: _we're_ not the ones throwing errors)</u>, like:

- Operations against a database
- Operations utilizing an external service (API, etc)

While that's an issue, the larger problem at hand is still that we're not really expressing our possible error states effectively. Refactoring this to TypeScript and expressing errors with **types** is a start. 

## A better approach to handling errors

<p class="special-quote"><b>Tldr?</b> View the code on GitHub right <a target="_blank" href="https://github.com/stemmlerjs/white-label/blob/feature/either-monad/src/functional-error-handling.ts">here</a>.</p>

We were able to get pretty far with the `Result<T>` class, but the biggest fallback is that while there is often one possible **success** state, there are several **error** states. 

The `Result<T>` class doesn't allow us to express those several other error states.

Consider a `CreateUser` [use case](/articles/enterprise-typescript-nodejs/application-layer-use-cases/) given a `username`, `email` and `password`. What are all of the possible things **that could go _right_**?

- The user was successfully created

OK, and what about all of the things that could go wrong?

- The email was invalid
- A user already has this username
- A user already exists with this email
- The password doesn't meet certain security criteria

So from end to end (Express.js API call to the database), we want to either a `201  - Created` if successful, some `40O-x` error code if there was a client error, and a `500-x` error if something broke on our end.

Let's set it up.

<p class="special-quote"><b>"Use Case" refresher</b>: In a <a href="/articles/enterprise-typescript-nodejs/application-layer-use-cases/">previous article (Better Software Design w/ Application Layer Use Cases)</a>, we discovered that Use Cases are the <b>features</b> of our apps, <u>decoupled from controllers</u> so that they <b>can be tested</b> without spinning up a webserver.</p>

```typescript
interface User {}

// UserRepository contract
interface IUserRepo {
  getUserByUsername(username: string): Promise<User>;
  getUserByEmail(email: string): Promise<User>;
}

// Input DTO
interface Request {
  username: string;
  email: string;
  password: string;
}

class CreateUserUseCase implements UseCase<Request, Promise<Result<any>>> {
  private userRepo: IUserRepo;

  constructor (userRepo: IUserRepo) {
    this.userRepo = userRepo;
  }

  public async execute (request: Request): Promise<Result<any>> {
    ... 
  }
}
```

At this point, we have a `CreateUserUseCase` which **dependency injects** an `IUserRepo`.

The `Request` dto requires a `username`, `email`, and `password` and the return type is going to be either a success or failure of `Result<any>`.

Laying out what we need to check for, we can see that there are several potential error states.

```typescript
class CreateUserUseCase implements UseCase<Request, Promise<Result<any>>> {
  private userRepo: IUserRepo;

  constructor (userRepo: IUserRepo) {
    this.userRepo = userRepo;
  }

  public async execute (request: Request): Promise<Result<any>> {

    // Determine if the email is valid
      // If not, return invalid email error

    // Determine if the password is valid
      // if not, return invalid password error

    // Determine if the username is taken
      // If it is, return an error expressing that the username was taken

    // Determine if the user already registered with this email
      // If they did, return an account created error

    // Otherwise, return success

    return Result.ok<any>()
  }
}
```

Using [Value Objects](/articles/typescript-value-object/) to **encapsulate validation logic**, we can get a `Result<Email>` and look inside of it to see if it was successfully created or not.

```typescript
class CreateUserUseCase implements UseCase<Request, Promise<Result<any>>> {
  private userRepo: IUserRepo;

  constructor (userRepo: IUserRepo) {
    this.userRepo = userRepo;
  }

  public async execute (request: Request): Promise<Result<any>> {

    const { username, email, password } = request;

    const emailOrError: Result<Email> = Email.create(email);

    if (emailOrError.isFailure) {
      return Result.fail<any>(emailOrError.message)
    }

    const passwordOrError: Result<Password> = Password.create(password);

    if (passwordOrError.isFailure) {
      return Result.fail<void>(passwordOrError.message)
    }

    ...
  }
}
```


But still, we're back at **square one**, instead of returning `null` or throwing an error, we're returning a failed `Result<T>` for **both errors**, which is still <u>not helping the calling code distinguish between them</u>.

We need to **create types for these error messages**.

Here's how we can do that.

### Expressing all errors for the `CreateUser` use case

Let's first standarize an what an error is:

#### DomainError class

```typescript
interface DomainError {
  message: string;
  error?: any;
}
```

#### Contained error namespaces

Also, using TypeScript `namespaces`, we can represent all of the errors for the `CreateUser` use case with:

```typescript
/**
 * @desc General application errors (few of these as possible)
 * @http 500
 */

export namespace AppError {
  export class UnexpectedError extends Result<DomainError> {
    public constructor (err: any) {
      super(false, {
        message: `An unexpected error occurred.`,
        error: err
      })
    }

    public static create (err: any): UnexpectedError {
      return new UnexpectedError(err);
    }
  }
}

/**
 * @desc CreateUser errors
 */

export namespace CreateUserError {

  export class UsernameTakenError extends Result<DomainError> {    
    public constructor (username: string) {
      super(false, {
        message: `The username "${username}" has already been taken.`
      })
    }

    public static create (username: string): UsernameTakenError {
      return new UsernameTakenError(username);
    }
  }

  export class EmailInvalidError extends Result<DomainError> {    
    public constructor (email: string) {
      super(false, {
        message: `The email "${email}" is invalid.`
      })
    }

    public static create (email: string): EmailInvalidError {
      return new EmailInvalidError(email);
    }
  }

  export class AccountAlreadyExistsError extends Result<DomainError> {    
    public constructor () {
      super(false, {
        message: `The account associated with this email already exists.`
      })
    }

    public static create (): AccountAlreadyExistsError {
      return new AccountAlreadyExistsError();
    }
  }

  export class InsecurePasswordError extends Result<DomainError> {    
    public constructor () {
      super(false, {
        message: `The password provided wasn't up to security standards.`
      })
    }

    public static create (): InsecurePasswordError {
      return new InsecurePasswordError();
    }
  }
}
```

This was possible by making a couple of changes to our old `Result<T>` class:

#### Updated `Result<T>` class

```typescript
export class Result<T> {
  public isSuccess: boolean;
  public isFailure: boolean
  public error: T | string;
  private _value: T;

  public constructor (isSuccess: boolean, error?: T | string , value?: T) {
    if (isSuccess && error) {
      throw new Error("InvalidOperation: A result cannot be successful and contain an error");
    }
    
    if (!isSuccess && !error) {
      throw new Error("InvalidOperation: A failing result needs to contain an error message");
    }

    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this.error = error;
    this._value = value;
    
    Object.freeze(this);
  }

  public getValue () : T {
    if (!this.isSuccess) {
      return this.error as T;
    } 

    return this._value;
  }

  public static ok<U> (value?: U) : Result<U> {
    return new Result<U>(true, null, value);
  }

  public static fail<U> (error: any): Result<U> {
    return new Result<U>(false, error);
  }
}
```

Now, we easily represent can go back to our use case change the **signature of our response**:

```typescript
type Response = Result<CreateUserError.EmailInvalidError> 
  | Result<CreateUserError.AccountAlreadyExistsError>
  | Result<CreateUserError.InsecurePasswordError>
  | Result<CreateUserError.UsernameTakenError>
  | Result<AppError.UnexpectedError>
  | Result<any>;
```

That's better, but what if there was a better way for us to be able to **group** and separate the _success_ results from the _error_ results?

### Introducing the `Either` class

`Either` is a `union` type which is either `Left` (for failure) or `Right` (for success).

Check out the code, via [Bruno Vegreville](https://medium.com/inato/expressive-error-handling-in-typescript-and-benefits-for-domain-driven-design-70726e061c86).

#### Either monad

```typescript
export type Either<L, A> = Left<L, A> | Right<L, A>;

export class Left<L, A> {
  readonly value: L;

  constructor(value: L) {
    this.value = value;
  }

  isLeft(): this is Left<L, A> {
    return true;
  }

  isRight(): this is Right<L, A> {
    return false;
  }
}

export class Right<L, A> {
  readonly value: A;

  constructor(value: A) {
    this.value = value;
  }

  isLeft(): this is Left<L, A> {
    return false;
  }

  isRight(): this is Right<L, A> {
    return true;
  }
}

export const left = <L, A>(l: L): Either<L, A> => {
  return new Left(l);
};

export const right = <L, A>(a: A): Either<L, A> => {
  return new Right<L, A>(a);
};
```

Equipped with this, we:

- Get the same observable behaviour from the `Result<T>` class, but now we can also
- ...segregate success responses from failure responses


Here's the updated `CreateUserUseCase` using the `Either` class, returning `Left`s for errors and `Right` for success results.

```typescript
type Response = Either<
  CreateUserError.UsernameTakenError | 
  CreateUserError.EmailInvalidError | 
  CreateUserError.AccountAlreadyExistsError |
  CreateUserError.InsecurePasswordError
  , 
  Result<any> // OK 
>

class CreateUserUseCase implements UseCase<Request, Promise<Response>> {
  private userRepo: IUserRepo;

  constructor (userRepo: IUserRepo) {
    this.userRepo = userRepo;
  }

  public async execute (request: Request): Promise<Response> {

    const { username, email, password } = request;

    // We've also updated our email Value Object classes 
    // to return the failure results
    const emailOrError: Either<CreateUserError.EmailInvalidError, 
      Result<Email>> = Email.create({ email })

    if (emailOrError.isLeft()) {
      return left(emailOrError.value);
    }

    // Same thing with the Password Value Object
    const passwordOrError: Either<CreateUserError.InsecurePasswordError, 
      Result<Password>> = Password.create({ password });

    if (passwordOrError.isLeft()) {
      return left(passwordOrError.value);
    }

    try {
      const [userByUsername, userByEmail] = await Promise.all([
        this.userRepo.getUserByUsername(username),
        this.userRepo.getUserByEmail(email),
      ])
  
      const usernameTaken = !!userByUsername === true;
      const accountCreated = !!userByEmail === true;

      // More errors we know about can be expressed this way
      if (usernameTaken) {
        return left(CreateUserError.UsernameTakenError.call(username));
      }
  
      if (accountCreated) {
        return left(CreateUserError.EmailInvalidError.call(email));
      }

      // Success resultt
      return right(Result.ok())
    } catch (err) {
      // Any uncaught error
      return left(AppError.UnexpectedError.create(err))
    }
  }
}
```

Notice that even the `Email` and `Password` Value Objects can **express** and **segregate** their errors and success states?

Here's the `Email` value object for example:

#### `Email` value object

```typescript
export class Email extends ValueObject<EmailProps> {

  get value (): string {
    return this.props.email
  }

  private constructor (props: EmailProps) {
    super(props);
  }

  private static isEmailValid (email: string): boolean {
    // Naive validation
    if (email.indexOf('.com') === -1) {
      return false;
    } else {
      return true;
    }
  }

  public static create (
    props: EmailProps
  ): Either<CreateUserError.EmailInvalidError, Result<Email>> {

    if (this.isEmailValid(props.email)) {
      return right(Result.ok<Email>(new Email(props)));
    } else {
      return left(CreateUserError.EmailInvalidError.create(props.email));
    }
  }
}
```

## Hooking it all up to an Express.js API controller

Last thing we want to figure out how to do is to get this working with our [Base Controller](/articles/enterprise-typescript-nodejs/clean-consistent-expressjs-controllers/).

Since we've already encapsulated all of the potential Express.js error and success response messages, our code will look a lot more expressive.

```typescript
class CreateUserController extends BaseController {
  private useCase: CreateUserUseCase;

  constructor (useCase: CreateUserUseCase) {
    super();
    this.useCase = useCase;
  }

  async executeImpl (): Promise<any> {
    const { username, email, password } = this.req.body;

    try {
      const result = await this.useCase.execute({ username, email, password });

      // If the use case has a failure response of some sort

      if (result.isLeft()) {
        const error = result.value;

        // Switch on the response, map it to the correct HTTP error.

        switch (error.constructor) {
          case CreateUserError.UsernameTakenError:
            return this.conflict(error.getValue().message)
          case CreateUserError.EmailInvalidError:
            return this.clientError(error.getValue().message);
          case CreateUserError.AccountAlreadyExistsError:
            return this.conflict(error.getValue().message);
          case CreateUserError.InsecurePasswordError:
            return this.clientError(error.getValue().message);
          default:
            return this.fail(error.getValue().message);
        }
      } else {
        return this.ok(this.res);
      }
    } 
    
    catch (err) {
      return this.fail(err);
    }
  }
}
```

Because the result of the use case is of the `Either` type, it forces the caller to look into if the request was successful or not, and handle them accordingly.

By using a `switch` statement on the `constructor`, we can get direct access to the `type` of error before  mapping it to the correct Express.js HTTP response code.

### Composing the controller with the use case

In order to use this controller in our app, we need to create it and then export it so that it can be used up by the main Express.js app.

<div class="filename">modules/users/useCases/createUser/index.ts</div>

```typescript
import { CreateUserUseCase } from './CreateUserUseCase'
import { CreateUserController } from './CreateUserController';
import { userRepo } from 'modules/users'; // repo instance exported from module

// Create the CreateUserUseCase by injecting a UserRepo instance
const createUserCase = new CreateUserUseCase(userRepo);

// Create the CreateUserController by injecting the CreateUserUseCase
const createUserController = new CreateUserController(createUserCase);

// Export both from this module
export {
  createUserCase,
  createUserController
}
```

### Connecting a controller instance to a route handler

<div class="filename">modules/users/infra/http/routes/index.ts</div>

```typescript
import * as express from 'express'

// Grab the instance of the CreateUserController from the useCases
import { createUserController } from '../../../useCases/createUser'

const userRouter = express.Router();

userRouter.post('/', 
  // Hook the controller instance up to a POST call
  (req, res) => createUserController.execute(req, res)
)

export { userRouter } // Export the router so the main app can use it
```

And then we can hook this up to the main Express.js app instance with:

<div class="filename">app/index.ts</div>

```typescript
import * as express from 'express'
import { userRouter } from 'modules/users/infra/http/routes'

const app = express();

... // Other handlers

app.use('/users', userRouter);

app.listen(8000, () => console.log('Express app started!'))
```

In conclusion, our project structure could look a little something like this:

```bash
src
  └ modules
    └ users                          # 'Users' subdomain
      └ domain                       # Domain models (entities, value objects)
        └ Email.ts                   # Email (value object)
        └ Password.ts                # Password (value object)
        └ User.ts                    # User (aggregate / entity_             
      └ infra                        # Infrastructure layer concerns (webservers, caches, etc)
        └ http
          └ routes
            └ index.ts               # Export a user router
        └ repos                      
          └ UserRepo.ts              # Facade to the sequelize user models
      └ useCases                     # All of the application layer features
        └ createUser                 # Feature/Use Case #1 - Create a user 
          └ CreateUserUseCase.ts     # Use Case (also known as application service)
          └ CreateUserController.ts  # Create user controller
          └ CreateUserErrors.ts      # Any use case-specific errors
          └ index.ts                 # Export controller (required) and use case (optional) from this module

```

## Domain-Driven Design for the win

This is exactly the type of thinking that we do when we're working on [Domain-Driven](/courses/domain-driven-design-typescript) projects. Errors are a part of the [Domain layer](/articles/enterprise-typescript-nodejs/clean-nodejs-architecture/) in our **clean/layered architecture** and this is an excellent way to start representing them accordingly.

---

<p class="special-quote">If you'd like to see the code in it's entirety, it's right <a target="_blank" href="https://github.com/stemmlerjs/white-label/blob/feature/either-monad/src/functional-error-handling.ts">here</a> on GitHub.</p>

## Additional reading

- [Expressive Error Handling for Domain-Driven Design, by Bruno Vegreville](https://medium.com/inato/expressive-error-handling-in-typescript-and-benefits-for-domain-driven-design-70726e061c86)
- [TypeScript 2.1 Release Notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-1.html)
- [Type Signatures for functions with variable argument counts](https://stackoverflow.com/questions/12739149/typescript-type-signatures-for-functions-with-variable-argument-counts) 
- [TypeScript namespaces](https://www.typescriptlang.org/docs/handbook/namespaces.html) 
- [Type Safe Error Handling in TypeScript](https://dev.to/_gdelgado/type-safe-error-handling-in-typescript-1p4n) 
- [How to use instanceof in a switch statement](https://stackoverflow.com/questions/36332665/how-to-use-instanceof-in-a-switch-statement)