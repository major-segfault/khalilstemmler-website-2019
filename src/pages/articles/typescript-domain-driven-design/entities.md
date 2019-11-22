---
templateKey: article
title: "Understanding Domain Entities [with Examples] - DDD w/ TypeScript"
date: '2019-05-28T10:04:10-05:00'
updated: '2019-05-28T10:04:10-05:00'
description: >-
  Entities are the first natural place we should aim to place business logic in domain-driven applications. In this article, we talk about the roles and lifecycle of an entity in Domain-Driven Design.
tags:
  - DDD
  - TypeScript
  - Software Design
category: Domain-Driven Design
image: /img/blog/ddd/entities.png
published: true
---

<p class="course-cta">
This is part of the <a href="/courses/domain-driven-design-typescript">Domain-Driven Design w/ TypeScript & Node.js</a> course. Check it out if you liked this post.
</p>

_Also from the **[Domain-Driven Design with TypeScript](/articles/categories/domain-driven-design/)** series_.

The biggest reason why companies move towards domain-driven design is because their business has taken on a necessary complexity. 

Think about the amount of busiess logic complexity in some of the most common tools we use today like [GitLab](https://gitlab.com) or [Netlify](https://netlify.com). They're truly [not dealing with modeling basic CRUD apps](/articles/typescript-domain-driven-design/ddd-vs-crud-design/).

In order to manage business logic complexity, the approach is to use **object oriented programming** concepts to model complex behaviour between objects; replicating what _should happen_ in a particular domain _when it's possible_ and _when it's not possible_. 

Domain-Driven introduces a <u>set of artifacts</u> that we can use to model the domain.

![](/img/blog/ddd-intro/ddd-diagram.svg)

Let's talk about another one of the **main** artifacts: _entities_.

--- 

## The role of entities in DDD

Entities are pretty much the bread and butter of domain modeling.

These are some of the primary trait of entities.

### First place to put business logic (if it makes sense)

> Entities should be the <u>first place that we think of to put domain logic</u>. 

When we want to express what a particular model:
- can do
- when it can do it
- what conditions dictate when it can do that thing

We aim to place that logic **closest to the model that it belongs to**.

For example: in a job board application where employers can leave questions for applicants to answer when they apply to jobs, we can enforce some rules.

> Rule #1: You can't add a question to a job that already has existing applicants.

> Rule #2: You can't add more than the max amount of questions for a job.

Here's a quick example:

```typescript
class Job extends Entity<IJobProps> {
  // ... constructor
  // ... private factory method

  get questions (): QuestionsCollection {
    return this.props.questions;
  }

  public hasApplicants (): boolean {
    return this.props.applicants.length !== 0;
  }

  public addQuestion (question: Question) {
    if (this.hasApplicants()) {
      throw new Error("Can't add a question when there are already applicants to this job.")
    }
    
    if (this.props.questions.length === MAX_QUESTIONS_PER_JOB) {
      throw new Error("This job already has the max amount of questions.")
    }

    this.props.questions.push(question);
  }
}
```

Sometimes, it doesn't feel natural and doesn't make sense to put certain domain logic inside of an entity.

This happens when the logic we're trying figure out where to put **doesn't involve one entity in particular**. There are cases where it's OK (like our `Job` example utilizing the `Question` entity),  but there are other cases where the two entities involved shouldn't necessarily know about each other (look into Aggregate Design) [^1].

For example, if we were modeling a Movie Rental application, with a `Customer` entity and a `Movie` entity, where do we put the `purchaseMovie()` method? 

A `Customer` **can** purchase a movie, but the `Customer` entity shouldn't need to know anything about `Movies`. 

Conversely, a `Movie` can be purchased by a `Customer`. But we wouldn't want to reference a `Customer` in the `Movie` model, because ultimately, a `Customer` has nothing to do with a `Movie`.

_This is the type of logic that we put in a **Domain Service** instead_ [^2].

### Enforcing model invariants

In one of my previous articles, I said that [Domain-Driven Design is declarative](/articles/typescript-domain-driven-design/ddd-vs-crud-design/).

Building an application with DDD is like creating a domain-specific language for your problem domain.

In order to do that, we need to ensure that we only **expose operations that are meaningful and valid to the domain**. We also ensure that [class invariants](/wiki/invariant/) are satisfied.

Validation logic on object creation is normally delegated to [Value Objects](/articles/typescript-value-object/), but what can happen (and when) is up to the entity.

--- 

One of the earliest mistakes I was making in domain modeling was exposing getters and setters for everything.

So let's be explicit about the fact that that's not the best thing to do.

> Don't add getters and setters for everything.

There, I did my part.

The reason why it's not good is because we need to _control how_ our objects change. We never want our objects to end up in an invalid state.

Take the job board example again (particularly the part about the `QuestionsCollection`).

```typescript
class Job extends Entity<IJobProps> {
  // ... constructor
  // ... private factory method

  get questions (): QuestionsCollection {
    return this.props.questions;
  }

  public addQuestion (question: Question) {
    // ...
    if (this.props.questions.length === MAX_QUESTIONS_PER_JOB) {
      throw new Error("This job already has the max amount of questions.")
    }

    this.props.questions.push(question);
  }
}
```

Do you notice how the `questions` array _doesn't_ have a setter defined for it?

Our domain logic specifies that someone _shouldn't_ be able to add more than the max amount of questions per job. 

If we had a public setter for `questions`, there's nothing stopping someone from <u>completely circumventing the domain logic</u> by doing:

```typescript
job.questions = [{}, {}, {}, {}, {}, ...] // question objects
```

This is **encapsulation**: one of the 4 principles of Object-oriented programming. Encapsulation is an act of data integrity; and that's especially important in domain-modeling.

### Identity and lookup

An entity is different from a Value Object primarily due to the fact that an Entity has an identity while a Value Object does not.

Entities: think `User`, `Job`, `Organization`, `Message`, `Conversation`.

Value Objects: think `Name`, `MessageText`, `JobTitle`, `ConversationName`.

Typically, a single Entity will be a model that references other Value Objects and Entities.

Here's what a basic `User` entity might look like.

```typescript
interface IUserProps {
  name: Username;
  email: Email;
  active: boolean;
}

class User extends Entity<IUserProps> {
  get name (): Username {
    return this.props.name;
  }

  get email (): Email {
    return this.props.email;
  }

  private constructor (props: IUserProps, id?: UniqueEntityId) {
    super(props, id);
  }
  
  public isActive (): boolean {
    return this.props.active;
  }

  public static createUser (props: IUserProps, id?: UniqueEntityId) : Result<User> {
    const userPropsResult: Result = Guard.againstNullOrUndefined([
      { propName: 'name', value: props.name },
      { propName: 'email', value: props.email },
      { propName: 'active', value: props.active }
    ]);

    if (userPropsResult.isSuccess) {
      return Result.ok<User>(new User(props, id))
    } else {
      return Result.fail<User>(userPropsResult.error);
    }
  }
}
```

During the lifecycle of an entity, it may need to be `Stored` to a database, `Reconstituted` and `Modified` before being deleted or archived.

_I use UUIDs instead of Auto-incremented IDs for entity creation. See [this article](/articles/auto-increment-or-uuid/) for why._

## Entity lifecycle

This is what the lifecycle of an entity looks like, generally.

![](/img/blog/ddd/entity-lifecycle.svg)

### Creation

To create entities, just like Value Objects, we use **Factories** of some sort. 

Most of the examples on this site use basic **Factory methods**. 

What's a _factory method_?

Remember this bit in the previous example?

```typescript
class User {
  // ...

  private constructor (props: IUserProps, id?: UniqueEntityId) {
    super(props, id);
  }

  public static createUser (props: IUserProps, id?: UniqueEntityId) : Result<User> {
    const userPropsResult: Result = Guard.againstNullOrUndefined([
      { propName: 'name', value: props.name },
      { propName: 'email', value: props.email },
      { propName: 'active', value: props.active }
    ]);

    if (userPropsResult.isSuccess) {
      return Result.ok<User>(new User(props, id))
    } else {
      return Result.fail<User>(userPropsResult.error);
    }
  }
}
```

The `createUser` method is a **Factory Method** that handles creation of the `User` entity.

Notice that we can't use the `new` keyword and do:

```typescript
const user: User = new User(); // <= constructor is private
```

Again, **encapsulation** and **data integrity**. We want to control how instances of `Users` get into the execution of our domain layer code.

If we had hundreds of different types of `Users` that we wanted to be able to create, we could either write more factory methods, or we could try using [Abstract Factories](/wiki/abstract-factory/).

#### Entity base class

_Note that you should never fully copy someone else's Entity or Value Object class. For something this important to your domain (this is essentially the family jewels), it would be worthwhile for you roll your own. You might have different needs, but feel free to start here and change as necessary_.

```typescript
import { UniqueEntityID } from './types';

const isEntity = (v: any): v is Entity<any> => {
  return v instanceof Entity;
};

export abstract class Entity<T> {
  protected readonly _id: UniqueEntityID;
  protected props: T;

  // Take note of this particular nuance here:
  // Why is "id" optional?
  constructor (props: T, id?: UniqueEntityID) {
    this._id = id ? id : new UniqueEntityID();
    this.props = props;
  }

  // Entities are compared based on their referential
  // equality.
  public equals (object?: Entity<T>) : boolean {

    if (object == null || object == undefined) {
      return false;
    }

    if (this === object) {
      return true;
    }

    if (!isEntity(object)) {
      return false;
    }

    return this._id.equals(object._id);
  }
}
```

Here's what's important to note about the `Entity<T>` base class:

1. `Entity<T>` is an abstract class. This means that we can't instantiate it directly. We can, however, _subclass_ it. That's a logical design decision. An entity only makes sense to exist if it has a particular type to it like `Car extends Entity<ICarProps>`.
2. The `id` for this class is `readonly`. So it shouldn't be able to be changed once instantiated. Also a pretty logical design decision if you ask me.
3. We're using the `equals(object?: Entity<T>)` method to determine if an entity is _referentially_ equivalent to another entity. If referential equality doesn't determine that they're the same, we compare the `id` of this entity vs. the one we'recomparing it to.
4. The props for the class are stored in `this.props`. The reason for that is because we want to **leave the decision to the subclass on which properties getters and setters should be defined**.

--- 

### Optional id field

The most interesting design decision to note here is that the `id` field is **optional**.

_Why would we do that?_

Well, when the `id` is known (because we've already created it), we can pass it in. 

When we don't know the `id` (because we haven't created it yet), we create a new one ([32-bit UUID](/articles/auto-increment-or-uuid/)).

This allows us to address both the **Creation** and **Reconstitution** events in the entity lifecycle.

![](/img/blog/ddd/entity-creation.svg)

#### Storage

After we've created an entity in memory, we'll want a way to store it to the database.

This is done with the help of a **Repository** and a **Mapper**.

The **Repository** is an artifact used to persist and retrieve domain objects from whatever type of persistence technology you'd like (relational database, noSQL database, JSON file, text files).

The **Mapper** is a file that simply maps a domain object to the format needed to save it in a database, and vice versa (into a Domain object).

Here's the skeleton of a `User` repo utilizing the Sequelize ORM.

```typescript
interface IUserRepo {
  exists (userId: string): Promise<boolean>;
  searchUsersByEmail(email: string): Promise<UsersCollection>;
  getUsers (config: IUserSearchConfig): Promise<UsersCollection>;
  getUsersByRole (config: IUserSearchConfig, role: Role): Promise<UsersCollection>;
  getUser(userId: string): Promise<any>;
  save(user: User): Promise<User>;
}

export class SequelizeUserRepo implements IUserRepo {
  private sequelizeModels: any;

  constructor (sequelizeModels: any) {
    this.sequelizeModels = sequelizeModels;
  }

  exists (userId: string): Promise<boolean> {
    // implement specific algorithm using sequelize orm
  }

  searchUsersByEmail(email: string): Promise<UsersCollection> {
    // implement specific algorithm using sequelize orm
  }

  getUsers (config: IUserSearchConfig): Promise<UsersCollection> {
    // implement specific algorithm using sequelize orm
  }

  getUsersByRole (
    config: IUserSearchConfig, 
    role: Role
  ): Promise<UsersCollection> {
    // implement specific algorithm using sequelize orm
  }

  getUser(userId: string): Promise<any> {
    // implement specific algorithm using sequelize orm
  }

  save(user: User): Promise<User> {
    // implement specific algorithm using sequelize orm
  }
}
```

Let's say that we wanted to implement the `getUsers` method. 

We'd want to retrieve all the users using the Sequelize-specific syntax, and then map those [Active Records](/wiki/active-record/) into `User` domain objects.

```typescript
import { UserMap } from '../mappers'
export class SequelizeUserRepo implements IUserRepo {
  private sequelizeModels: any;

  // ...
  getUsers (config: IUserSearchConfig): Promise<UsersCollection> {
    const UserModel = this.sequelizeModels.BaseUser;
    const queryObject = this.createQueryObject(config);
    const users: any[] = await UserModel.findAll(queryObject);
    return users.map((u) => UserMap.toDomain(u))
  }
}
```

Here's what the mapper might look like:

```typescript
export class UserMap extends Mapper<User> {
  public static toDTO (user: User): UserDTO {
    id: user.id.toString(),
    userName: user.name.value,
    userEmail: user.email.value
  }

  public static toPersistence (user: User): any {
    return {
      user_id: user.id.toString(),
      user_name: user.name.value,
      user_email: user.email.value,
      is_active: user.isActive()
    }
  }

  public static toDomain (raw: any): User {
    const nameOrResult = UserName.create(raw.user_name);
    const emailOrResult = UserEmail.create(raw.user_email);
    const passwordOrResult = UserPassword.create(raw.user_password);

    return User.create({
      name: nameOrResult.getValue(),
      password: passwordOrResult.getValue(),
      email: emailOrResult.getValue()
      active: raw.is_active,
    }, new UniqueEntityID(raw.user_id)).getValue()
  }
}
```

See how narrowly scoped this class is? It's a great example of the [Single Responsibility Principle](/articles/solid-principles/solid-typescript/).

#### Reconstitution

After we've created an entity and persisted it into the database, at some point, we'll want to pull it out and use it for operations.

Again, this is a job easily maintained by the **repository** and **mapper** classes.

## Conclusion

There's more to domain objects like **Aggregate Roots** and **Domain Events** but you can get started modeling a lot of your domain with just **Entities** and **Value Objects**.

In the next few articles, we'll talk about how to use **Domain Events** in a real world Sequelize + Node + TypeScript app and how to model **Aggregates**.


[^1]: This branches into Aggregate Design. Certain entities do belong in scope of others. We call the entities at the top of this _tree_, an Aggregate Root.

[^2]: This is where we locate domain logic that doesn't belong to any one object conceptually. Not to be confused with an Application Service. Domain Services only operate on Domain Objects, whereas Application Services are artifacts that are unpure to the domain, that may pull data from external resources (APIs, object databases, etc, and so on).

<p class="course-cta">
This is part of the <a href="/courses/domain-driven-design-typescript">Domain-Driven Design w/ TypeScript & Node.js</a> course. Check it out if you liked this post.
</p>