---
templateKey: article
title: "Make Illegal States Unrepresentable! - Domain-Driven Design w/ TypeScript"
date: '2019-11-21T18:04:10-05:00'
updated: '2019-11-21T18:04:10-05:00'
description: >-
  By using TypeScript's static type system, not only can we enforce (typically challenging things like) business rules and error states, but we can create a domain-specific language so well-defined that it becomes virtually impossible for any future code to be written that puts the system in an illegal state.
tags:
  - DDD
  - TypeScript
  - Functional Programming
category: Domain-Driven Design
image: /img/blog/templates/banners/ddd-blog-banner.png
published: true
---

When we first learn how to code, we're typically most focused on making _things work_. We visualize the finished product as a <u>coming together of several technologies</u>. A common MVC-mental model for a full-stack web app is: **database** + **React app** + **Express API**.

This works really well for a long time in [CRUD and MVC-based applications](/articles/typescript-domain-driven-design/ddd-vs-crud-design/) without lots of business logic because we can (usually) think about them <u>imperatively</u>. 

> "_This string_ maps to _this column_ in the database. I'll just do some validation _in the service_ to make sure it's not longer than 30 characters".

This approach to structuring business logic is called a "Transaction Script" and it's the most basic one. It's defined by the absense of a [domain model](/articles/domain-driven-design-intro/) and all business rules being represented with simple control statements like `if` or `switch`.

## Transaction Scripts

Here's an example of creating a user using the Transaction Script approach.

<div class="filename">UserService.ts</div>

```typescript
export class UserService {
  createUser (email: string, firstName: string, lastName: string): Promise<void> {
    const UserModel = this.models.User;
    
    const isEmailValid = TextUtils.validateEmail(email);
    const isFirstNameValid = TextUtils.greaterThan(1, firstName) 
      && TextUtils.lessThan(31, firstName);
    const isLastNameValid = TextUtils.greaterThan(1, lastName) 
      && TextUtils.lessThan(71, lastName);

    if (isEmailValid) {
      throw new Error("Email isn't valid");
    }

    if (isFirstNameValid) {
      throw new Error("First name isn't valid");
    }

    if (isLastNameValid) {
      throw new Error("Last name isn't valid");
    }

    const user: User = new User({ email, firstName, lastName });

    await UserModel.create(user);

    return;
  }
}
```

What's wrong with this code? 

You know, it's not that bad. It works. But there _are_ a couple of important things here being ignored.

1. Errors aren't given the love that they deserve. We're making it hard for the calling code to be able to handle the errors possibly thrown by this block.

We're not really solving this problem, we're just putting it off for someone else to figure out how to decipher the errors later. It would be a lot easier for the next person if the errors were treated as types just like everything else in our domain.

2. There are important business rules here (constraints) that _can easily be circumvented_.

In order to create a User, we need a valid `email`, a `firstName` from 2-30 characters, and a `lastName` from 2-70 characters.

What's stopping a new developer joining our team from just doing:

```typescript
const user: User = new User({ email: 'bob', firstName: 'b', lastName: 'c' })
```

..._completely_ circumenting our efforts defining business logic (validation logic is a form of business logic).

Nothing 😨.

There's another problem too.

## Duplicating business rules

It's nice that we're at least trying to prevent against violations to the upper and lower bound lengths for the `string`s, but what happens when we create the `updateUser` method in our `UserService`? How much of that _constraint logic_ do we have to duplicate?

All of it.

And what if the business rules changed a little bit? 

What if, in order to create a user, you need to have **either** an `email` + `firstName` OR `firstName` and `lastName`?

That would make the `User` creation logic a little bit more complex, and we'd have to repeat it anywhere that we create users in our code. 

That's a textbook [anemic domain model](/wiki/anemic-domain-model/). Not _usually_ fun for web development (though, see [Entity Component Systems](https://en.wikipedia.org/wiki/Entity_component_system) for times it _is_ fun).

> This sucks. What should we do?

## Make illegal states unrepresentable

Earlier this year, functional programming _fanatic_ [John A De Goes](https://twitter.com/jdegoes) blasted out a tweet:

> Making illegal states unrepresentable is all about statically proving that all runtime values (without exception) correspond to valid objects in the business domain. The effect of this technique on eliminating meaningless runtime states is astounding and cannot be overstated.

— John A De Goes (@jdegoes) [January 28, 2019](https://twitter.com/jdegoes/status/1089949149628375040?lang=en)

This is an awesome quote. In programming (and science), it's often impossible to prove that something is _correct_, but it's reasonable to prove that something is _correct enough_.

With types, we can achieve that _correct enough_, and that makes our code much easier to reason about. And that gives us confidence to know that our business rules are being respected.

This builds trust. This means potentially less unit tests against the business logic, and more tests with various inputs to the system. This makes it safer to refactor code. This enables us to continue to push forward the design. This means that the types serve as a form of documentation to the system. This reduces the amount of supplementary documentation necessary. This enables new developers to onboard faster. This makes us happier.

This also happens to be the core of [what Scott Wlaschin teaches with his book, blog, and talks on functional domain modeling](/articles/typescript-domain-driven-design/domain-modeling-made-functional/).

Let's recap some approaches that we've already covered in detail on the blog, and look at a few alternative approaches as well.

## Wrapping primitives with domain specific types to express a common language and prevent misuse

The essence of DDD is to build a shared understanding of the domain with stakeholders, non-technical folk, and technical folk, and then codify that.

Using types, non-techncial stakeholders can understand our code.

Like this.

<div class="filename">forum/domain/types.ts</div>

```typescript
// UserName is from a separate subdomain, `Users`
import { UserName } from '../../users/domain/types'

type MemberId = string;
type Member = {
  id: MemberId,
  name: UserName
}

type Text = string;
type Link = string;

type PostTitle = string;
type PostId = string;

type Post = {
  postId: PostId
  postedBy: Member,
  title: PostTitle,
  content: Text | Link,
}

type Upvote = {
  postId: PostId,
  memberId: MemberId
}

type Downvote = {
  postId: PostId,
  memberId: MemberId
}
```

You probably have a good idea about the type of domain that we're dealing with simply by looking at the names of the types and their relationships.

Using classes (because of its [nominal typing](https://en.wikipedia.org/wiki/Nominal_type_system)) yields a benefit (that I haven't yet been able to get working with purely functional types in TypeScript): 

> _Forcing strictly nominal type checks (based on the name)_

For example, even though `PostId` and `PostTitle` might just be _wrappers_ to a `string` value,  like this:

```typescript
interface PostIdProps {
  id: string;
}

export class PostId {
  // Value is protected 
  private props: PostIdProps;

  // There is only a getter, because it should never be able to change
  get value (): string {
    return this.props.id
  }
}

interface PostTitleProps {
  title: string;
}

export class PostTitle {
  // Also protected
  private props: PostTitleProps;
  
  // Also only needs a getter
  get value (): string {
    return this.props.title;
  }
}
```

We _can't_ just substitute them in for each other.

```typescript
export class PostSlug {

  // We need a PostTitle to create a PostSlug
  public static create (postTitle: PostTitle): Result<PostSlug> {
    ... 
  }
}

let postId: PostId = PostId.create();
let postSlug: PostSlug = PostSlug.create(postId); // Error
```

We can also think of this as a way to <u>encode business requirements</u>. If the _only_ way to create a `PostSlug` is to first create a `PostTitle`, then we're forced to first locate the factory that creates `PostTitle`s.

Think of the amount of illegal states we prevented by wrapping primitives in domain-specific types.

### Using public setters sparingly

It's easy to add getters and setters for all of the properties of a class, but _should we_?

Consider modeling a `User` entity with a public `UserId`.

```typescript
export class User extends Entity<UserProps> {
  get userId () : UserId {
    return this.props.userId;
  }

  ...
}
```

Should we also add a setter?

That depends on if doing so is <u>valid to the domain</u>. 

From a Users, Identity & Access Management context, there's no reason why the `UserId` should ever change to a new value. Doing so would break the relationships between `User` and any other subdomains that have a 1-to-1 relationship with `User` like `Member` from the Forum subdomain in  [DDDForum.com](https://github.com/stemmlerjs/ddd-forum). 

So lets make it entirely impossible.


```typescript
export class User extends Entity<UserProps> {
  get userId () : UserId {
    return this.props.userId;
  }

  // set userId (userId: UserId) {
  //   this.props.userId = userId;
  // }
}
```

I might even discourage the use of public setters _in general_ because of their rigid method signature. They clash with the way that we [handle updates in aggregates using DDD](/articles/typescript-domain-driven-design/updating-aggregates-in-domain-driven-design/) using `Result`s.

### Strictly typing "null"s

What should you do in scenarios when you "try to create an object and it fails" or you "try to retrieve an object and it's not found"? How do you represent that?

Those are pretty realistic scenarios to run into, and _passing null_ is a common practice, though not a very good one.

Nulls aren't nice because to the client, they masquerade 🎭 as if they're actually the object(s) you're looking for, but as soon as you call a method or try to access a property on them, they throw errors.

```typescript
let votes: Votes[] = [vote1, vote2, vote3, null];

for (let vote of votes) {
  // throws error on the last element
  console.log(`This vote was cast by ${vote.member.memberId}`) 
}
```

Undefined and null-y values are things that we should be prepared to deal with.

In Scott Wlaschin's talk, "[Domain Modeling Made Functional](https://www.youtube.com/embed/PLFl95c-IiU)", he suggests representing `null` or `undefined` with its own type, like `Nothing`.

```typescript
type Nothing = null | undefined | '';
```

Using this type, we can create _optional_ types using **unions**:

```typescript
type SomeString = string;

type OptionalString = 
  SomeString |
  Nothing;

type SomeNumber = number;

type OptionalNumber = 
  SomeNumber |
  Nothing;
```

Or we can make it generic in order to strictly represent _any_ type that may or may not have a value.

```typescript
type Option<T> = T | Nothing;

type OptionalString = Option<string>;
type OptionalNumber = Option<number>;
```

Building on that, the type for a Factory Function could adequately 

```typescript
type Email = string;

function createEmail (email: string): Option<Email> {
  return email.contains('@') 
    ? '' as Nothing
    : email as Email;
} 
```

This particular functional design pattern used to represent types that may or may not exist is called a [monad](https://en.wikipedia.org/wiki/Monad_(functional_programming)).

When we model _nothingness_ as a type in our domain instead of just passing null, it forces any client code that relies on it to **accomodate the possibility of nothingness**. 

<p class="special-quote">I wrote an article describing how to use the <i>Result</i> monad to model nothingness and wrap failure states with error messages. Check it out, it's called "<a href="/articles/enterprise-typescript-nodejs/handling-errors-result-class/">Flexible Error Handling w/ the Result Class | Enterprise Node.js + TypeScript</a>".</p>


### Enforcing object creation constraints with factories

Object constraints (in OO we refer to these as [class invariants](/wiki/invariant/)) are the rules that dictate size, shape, length, or the state that a particular domain object is allowed to be in, and at which point in time.

Here are some constraint (invariant) examples:

- Length constraints: `PostText` cannot be longer than 50 characters (overflow), and must be at least 3 characters (underflow)
- Pattern constraints: `Email` must be a valid email address based on a regex formula that we constructed.
- Complex constraints: `PaidJobDetails` cannot be less than 15 dollars an hour if the `Job`'s `Location` is based in Ontario.

It's important that the language we choose is able to reduce all the possible ways to create a valid domain object to **one** way.

We can use the **factory pattern** for this.

Here's a purely functional approach:

<div class="filename">domain/postTitle.ts</div>

```typescript
type Nothing = undefined | null;
type EmailAddress = string;

type Option<T> = T | Nothing;

let createEmailAddress: Option<EmailAddress> = (email: string) => (
  !!email === true && email.includes('@') 
    ? email as Email
    : null as Nothing
)
```

This is great an all, but there's nothing stopping me from doing:

```typescript
let email: EmailAddress = 'diddle.com'
```

This is one of the things that I've been able to enforce with classes using an Object-Oriented approach. Using **private constructors** and **static factory methods**, we can ensure that the only way domain objects is through the static factory.

```typescript
interface EmailAddressProps {
  value: string;
}

export class EmailAddress extends ValueObject<EmailAddressProps> {

  get value () : string {
    return this.props.value;
  }

  // Can't invoke with new from outside of class.
  private constructor (props: EmailAddressProps) {
    super(props);
  }

  // Only way to create an EmailAddress is through the static factory method 
  public static create (email: string): Result<EmailAddress> {
    const guardResult = Guard.againstNullOrUndefined(email, 'email');

    if (guardResult.isFailure() || !TextUtils.validateEmail(email)) {
      return Result.fail<EmailAddress>()
    } else {
      return Result.ok<EmailAddress>(new EmailAddress({ value: email }))
    }

  }
}
```

### Handling error states

There are errors that we expect and know how to deal with, and errors that we don't expect and don't really know how to deal with.

It's also true that for every **single use case, there are _at least_ one or more possible ways that it can fail**.

So why is it that we often let error states fall through the cracks?

We should strictly type them and represent them as domain concepts.

For example, if we were building DDDForum.com, and we wanted to code out the `UpvotePost` use case, here's a namespace containing objects for all the possible ways it can fail.

<div class="filename">useCases/UpvotePost/UpvotePostErrors.ts</div>

```typescript

import { UseCaseError } from "../../../../../shared/core/UseCaseError";
import { Result } from "../../../../../shared/core/Result";

export namespace UpvotePostErrors {

  export class MemberNotFoundError extends Result<UseCaseError> {
    constructor () {
      super(false, {
        message: `Couldn't find a member to upvote the post.`
      } as UseCaseError)
    }
  }

  export class PostNotFoundError extends Result<UseCaseError> {
    constructor (slug: string) {
      super(false, {
        message: `Couldn't find a post by slug {${slug}}.`
      } as UseCaseError)
    }
  }

  export class AlreadyUpvotedError extends Result<UseCaseError> {
    constructor (postId: string, memberId: string) {
      super(false, {
        message: `This post was already upvoted postId {${postId}}, memberId {${memberId}}.`
      } as UseCaseError)
    }
  }

}
```

For that _single_ use case, there are at least three ways that it can fail.

Using the `Either<T, U>` monad, we can take a step up from the basic `Result<T>` class that we learned about [here](/articles/enterprise-typescript-nodejs/handling-errors-result-class/), and we can **segregate all the possible failure states from the single success state**.

Here's what the response type for this use case might look like: 

<div class="filename">useCases/UpvotePost/UpvotePostResponse.ts</div>

```typescript
import { Either, Result } from "../../../../../shared/core/Result";
import { UpvotePostErrors } from "./UpvotePostErrors";
import { AppError } from "../../../../../shared/core/AppError";

export type UpvotePostResponse = Either<
  // Failures
  UpvotePostErrors.MemberNotFoundError |
  UpvotePostErrors.AlreadyUpvotedError |
  UpvotePostErrors.PostNotFoundError |
  AppError.UnexpectedError |
  Result<any>,

  // Success
  Result<void>
>
```

<p class="special-quote"><b>Note:</b> If you haven't already read it, check out "<a href="/articles/enterprise-typescript-nodejs/functional-error-handling/">Functional Error Handling with Express.js and DDD | Enterprise Node.js + TypeScript</a>" to learn how to stop <u>throwing errors</u> and prefer a functional approach to expressing error states.</p>

## Conclusion

The main takeaways here are to:

- Use Factories and [Factory Methods](/blogs/typescript/static-factory-method/) to prevent from repeating validation logic. Encapsulate it in one place. When the creation rules change, you only need to update code in one place. See this article on [Value Objects](/articles/typescript-value-object/) for how to implement this.
- Make it impossible for you to create domain objects without going through the factory. Use private constructors to prevent the use of the `new` keyword.
- Wrap primitives with their own domain specific classes in order to make the language more expressive, encode business requirements, and protect their internal values from change operations that don't make sense to the domain.
- Prefer update methods over public setters to encapsulate _change_ rules within the entity itself. Make it impossible to change things when they shouldn't be changed. 
- Strictly type errors, nulls, and nothingness in order to remove the guesswork from client side code. They should always be able to accomodate for when something failed or was not found through static typing.

> Types are law

Types are the laws that dictate what's allowed to happen in our domain. Next time you write some code, think not only about what it would take to make the code _work_, but also think about what could be done using types (and any language features) to prevent anyone else from putting the system in a state invalid to the domain. If you're using vanilla JavaScript, consider the challenges of preventing team members from doing invalid things, and [consider if TypeScript would improve the _bylaws_ of your codebase](/articles/when-to-use-typescript-guide/). 



## References & resources

For a purely functional introduction to how to implement your domain layer code functionally, watch Scott's "[Domain Modeling Made Functional](https://www.youtube.com/embed/PLFl95c-IiU)" talk. I recommend you check it out. It's well worth your time.

