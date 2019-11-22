---
templateKey: blog-post
title: "When to Use a Private Constructor | TypeScript OOP"
date: '2019-11-21T10:04:10-05:00'
updated: '2019-11-21T10:04:10-05:00'
description: >-
  In this blog post, I explain how using a private constructor helps to force a single way to create an object, and why it's most commonly used with the Factory Pattern.
tags:
  - Private constructor
  - TypeScript
  - Software Design
  - OOP
category: TypeScript
published: true
displayInArticles: false
image: /img/blog/templates/banners/typescript-blog-banner.png
---

One of the first things we learn when we start out is how to create **instances** of objects. Typically, we do this with the `new` keyword.

```typescript
class User {
  public name: string;

  constructor (name: string) {
    this.name = name;
  }
}

const user: User = new User('Khalil Stemmler');
```

The actual thing that does the _creating_ is the constructor- and by default, it's public.

Have you ever seen a `private` constructor? Changing the scope of a constructor to `private` removes our ability to use the `new` keyword.

```typescript
class User {
  public name: string;

  private constructor (name: string) {
    this.name = name;
  }
}

const user: User = new User('Khalil Stemmler');  // Error
```

Why on Earth would you want to do that? We can't create instances anymore. How are we supposed to get `Users` out of this `class` now?

All is not lost, and it turns out that there is a very good reason for why you'd want to do this kind of thing.

In essence, it's <u>to enforce object creation rules</u>.

### Using the new keyword

When we use the `new` keyword, there's not really an elegant way to prevent a `User` from being created if certain validation rules don't pass.

We can _throw errors_.

```typescript
class User {
  public name: string;

  constructor (name: string) {
    if (!!name === false) {
      throw new  Error ("Ya need to include a name")
    }

    this.name = name;
  }
}

let user;

try {
  user = new User();
} catch (err) {

} 

console.log(user); // undefined
```

But honestly, who wants to live in a world where we can't trust that a simple `new` statement won't throw errors. I don't feel like adopting trust issues with my codebase. 

We've talked about why throwing errors is _not great_ in the "[Functional Error Handling](/articles/enterprise-typescript-nodejs/functional-error-handling/)" article, so let's think of a better way to prevent bad objects from being created.

## Static factory methods

The best way to enforce validation logic against a domain object is to keep the constructor `private` and use a **static factory method** to enforce the constraints.

Using the `Result<T>` class from "[Flexible Error Handling w/ the Result Class | Enterprise Node.js + TypeScript](/articles/enterprise-typescript-nodejs/handling-errors-result-class/)", we can statically represent a success or a failure.

```typescript
interface UserProps {
  name: string;
}

class User {
  private props: UserProps;

  get name (): string {
    return this.props.name;
  }

  private constructor (props: UserProps) {
    this.props = props;
  }

  public static create (props: UserProps): Result<User> {
    const guardResult = Guard.againstNullOrUndefined(props.name, 'name');
    const isAppropriateLength = TextUtils.isAtLeast(2, props.name) 
      && TextUtils.isAtMost(31, props.name);

    // Fail with reason
    if (!guardResult.success) {
      return Result.fail<User>(guardResult.message)
    }

    // Fail with reason
    if (!isAppropriateLength) {
      return Result.fail<User>("Must be between 2 and 31 characters")
    }

    // Static method can access the constructor
    return Result.ok<User>(new User(props));
  }
}
```

Now, object creation looks like this:

```typescript
let user: User;
let userOrError: Result<User> = User.create({ name: 'Khalil Stemmler' });

if (userOrError.isSuccess) {
  user = userOrError.getValue();
} else {
  console.log(userOrError.error)
}
```

Feel free to get even more functional with these different types of errors as well. We can statically type a `NullValue` error and an `InvalidLength` error.

Using the `Either<T, U>` monad from ["Functional Error Handling with Express.js and DDD | Enterprise Node.js + TypeScript"](/articles/enterprise-typescript-nodejs/functional-error-handling/), we can build return types like:

```typescript
type UserResult = Either<
  // Failure types
  UserErrors.NullValuesError |
  UserErrors.InvalidFieldLengthError,
  // Success type
  User
>
```








