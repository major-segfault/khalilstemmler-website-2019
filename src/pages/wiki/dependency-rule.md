---
name: The Dependency Rule
templateKey: wiki
published: true
wikicategory: Design Principles
wikitags:
  - SOLID
  - Architecture
prerequisites:
  - Interface
  - Abstract class
date: '2019-07-30T00:05:26-04:00'
updated: '2019-09-17T00:05:26-04:00'
image: /img/wiki/dependency-rule/clean-architecture-layers.svg
plaindescription: A software architecture rule that specifies the relationship between layers, namely that an inner layer should never rely on anything from an outer layer. 
---

### The Dependency Rule

In Uncle Bob's book, he describes **the dependency rule**.

That rule specifies that something declared in an outer circle <u>must not be mentioned in the code by an inner circle</u>.

_In other diagrams, there are many more layers. The rule still applies._

That means that code can only point inwards.

Domain Layer code can't depend on Infrastructure Layer code.

But Infrastructure Layer Code _can depend_ on Domain Layer code (because it goes inwards).

When we follow this rule, we're essentially following the [Dependency Inversion](dependency-inversion/) rule from the [SOLID Principles](/articles/solid-principles/solid-typescript/).

## Layered Architecture Dependency Rules

Let's talk about some of the rules we need to follow when we layer our code this way. 

### Domain Layer

OK, let's map out some common scenarios.

**Everything** can depend on **Domain Objects** (entities, value objects, domain services) within the domain layer.

But **Domain Objects** can depend on _exactly nothing outside the domain layer_.

That's because the domain layer contains the **highest level policy**. Everything else depends on it.

The domain layer should be [the most stable dependency](/wiki/stable-dependency-principle/) and depend on classes from no other layer except itself in order to prevent [cycles](/wiki/acyclic-dependencies-principle/).


### Application (Use Case) Layer

Use cases **heavily** rely on the only layer underneath it (domain) but also needs access to infrastructure layer things like **repositories**.

Try creating any use cases without access to persistence. Most of them need it. Take the `CreateUserUseCase` from the ["Functional Error Handling with Express.js and DDD"](/articles/enterprise-typescript-nodejs/functional-error-handling/) guide:

<div class="filename">modules/users/useCases/createUser/CreateUserUseCase.ts</div>

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
  private userRepo: UserRepo; // violation of the dependency rule

  constructor (userRepo: UserRepo) {
    this.userRepo = userRepo;
  }

  public async execute (request: Request): Promise<Response> {

    const { username, email, password } = request;

    const emailOrError: Either<CreateUserError.EmailInvalidError, 
      Result<Email>> = Email.create({ email })

    if (emailOrError.isLeft()) {
      return left(emailOrError.value);
    }

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

      if (usernameTaken) {
        return left(CreateUserError.UsernameTakenError.call(username));
      }
  
      if (accountCreated) {
        return left(CreateUserError.EmailInvalidError.call(email));
      }

      return right(Result.ok())
    } catch (err) {
      return left(AppError.UnexpectedError.create(err))
    }
  }
}
```

The blaring problem is that the infrastructure layer is **above** the **application layer**. It would be a <u>violation of the dependency rule</u> to mention the name of anything in the infrastructure layer.

The way we fix that is [dependency inversion](/articles/tutorials/dependency-injection-inversion-explained/) of course.

Instead of the use case relying directly on the `UserRepo` from the **infrastructure layer**, we can put an <u>interface</u> (depending on the methodology, people call this different things like port, abstraction) inbetween the two. 

That changes the dependency relationship from this:

![](/img/wiki/dependency-rule/dr-violation.svg)

To this:

![](/img/wiki/dependency-rule/dr-fixed.svg)

We've just unbroke the Dependency Rule violation that was there a second ago.

<p class="special-quote"><b>Ports and Adapters</b>: This is a huge part of the "Ports & Adapters" methodology. Thinking this way means that there's another layer in between the application and infrastructure layer called the <b>Adapter Layer</b>. The Adapter Layer contains only ports (interfaces) that specifies for the <b>Infrastructure Layer</b>, <i>how</i> to create an adapter for the port, and specifies to the <b>Application Layer</b>, <i>what to expect</i> from an implementation of that port. <br/><br/>This kind of design is <a href="/articles/solid-principles/solid-typescript/">SOLID</a> and enables us to respect the Object-Oriented Design principle stating to "always program to an abstraction, not a <a href="/wiki/concrete-class/">concretion</a>."</p>

### Infrastructure Layer

The infrastructure layer, which primarily contains implementations of **adapters** to things like [repositories](/articles/typescript-domain-driven-design/repository-dto-mapper/), **controllers**, and **integrations to services** (like external APIs, Stripe, etc), can depend on _any_ other layer below it.

For example, a **controller** (infra) will usually rely on a specific **use case** from the **application layer**.

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
      const result = await this.useCase
        .execute({ username, email, password });

      if (result.isLeft()) {
        const error = result.value;
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

That's totally valid and follows the Dependency Rule.