---
name: Anemic Domain Model
templateKey: wiki
published: true
wikicategory: Domain-Driven Design
wikitags: null
prerequisites: null
date: '2019-04-09T00:05:26-04:00'
updated: '2019-09-24T00:11:26-04:00'
image: /img/wiki/anemic/anemic.svg
plaindescription: When the classes that describe the model and the classes that perform operations on the model are separate. The services contain all the domain logic while the the domain objects themselves contain practically none.
---

Wikipedia says an **Anemic Domain Model** "is the use of a software domain model where the domain objects contain little or no business logic (validations, calculations, business rules etc.)".

A lot of projects start out like this if you're not familiar with domain modeling. 

Anemic Domain Models are largely the cause of a lack of encapsulation and isolation.

Watch what happens to the validation logic when we have a `CreateUserUseCase` and an `EditUserUseCase`. 

```typescript

class CreateUserUseCase extends BaseUseCase<ICreateUserRequestDTO, ICreateUserResponseDTO> {
  constructor () {
    super();
  }

  exec (request: ICreateUserRequestDTO): ICreateUserResponseDTO {
    const { name, email } = request.user;
    const isValidName = UserValidator.validateName(name);
    const isValidEmail = UserValidator.validateEmail(email);
    if (isValidName && isValidEmail) {
      const user: User = User.create(name, email);
      // continue
    } else {
      // error
    }
  }
}

class EditUserUseCase extends BaseUseCase<IEditUserRequestDTO, IEditUserResponseDTO> {
  constructor () {
    super();
  }

  exec (request: IEditUserRequestDTO): IEditUserResponseDTO {
    const { name, email } = request.user;
    const isValidName = UserValidator.validateName(name);
    const isValidEmail = UserValidator.validateEmail(email);
    if (isValidName && isValidEmail) {
      const user: User = User.create(name, email);
      // continue
    } else {
      // error
    }
  }
}

```

Does that look very DRY to you?

We have to write the User validation logic on the user input from the API twice, repeating it in both Use Cases.

While it might not seem like a big deal, this can spin out of control as we add `n` more use cases that operate on the `User` model. 

Not only that, but if we add more properties to the `User` model, we'll have to write validators for those as well. This would mean that we'd have to trace back through every use case we've ever written and ensure that we've added the new validation rule.

If my math is correct, this means we have to mentally keep track of `n x m` different places to update validation rules if we assume that:

> rules to maintain = # attributes on model x # services utilizing model

A better way would be to refactor the Validator to consume the entire raw `User` object and maintain all the validation rules there. 

```typescript

class UserValidator extends BaseValidator<IUser> {
  constructor () {
    super();
  }

  private validateName (name: string) : boolean {
    // should be longer than 2 chars, less than 100
  }

  private validateEmail (email: string) : boolean {
    // regex to check string
  }

  public validate (user: IUser) : boolean {
    const isValidName = this.validateName(name);
    const isValidEmail = this.validateEmail(email);

    if (isValidName && isValidEmail) {
      const user: User = User.create(name, email);
      // continue
    } else {
      // error
    }
  }
}

```

In Domain-Driven Design, we aim to encapsulate the invariants/domain logic close to the actual models themselves, so in this example, within the `User.create(name: string, email: string)` factory function.

A validator class like this could actually exist in theory, but we would want to define and run this logic closer to the model upon object creation, not within the higher-level technical artifacts like controllers, interactors or use cases.

In JavaScript or TypeScript, I like to use [Joi](https://github.com/hapijs/joi) for validation. You can create a nice `BaseValidator` abstract class then implement the `validate()` method with readable validation code like this:

```typescript
Joi.string().min(3).max(100).required()
```

Invariant validation through **Encapsulation** is just **one** of the benefits of an rich domain model.

## Benefits of a Rich Domain Model

### Better discoverability

If we know exactly where code belongs, this reduces the amount of time it takes us to find where the new code should be added.

Our natural instinct is to look at our model to see what it's capable of. When our model accurately describes the things that it's capable of, we spend a lot less time looking for what it can do, elsewhere.

Any business logic in services that can be identified as the sole responsibility of an entity should be moved to that entity. 

Any logic that doesn't quite belong to a single entity should remain in a [Domain Service](https://stackoverflow.com/questions/2268699/domain-driven-design-domain-service-application-service).

Any logic that performs operations on external resources (like using the  Google Places API to get geolocation coordinates for an addresss) should belong in an [Application Service](https://stackoverflow.com/questions/2268699/domain-driven-design-domain-service-application-service).

Two related software design principles assist in bringing up this metric.

- [Single Responsibility Principle](/articles/solid-principles/solid-typescript/) 
- [Screaming Architecture / Packaging By Component](/resources/names-construct-structure/)

### Lack of duplication

Builds off of the last point.

If we know where code should live, it reduces the potential for duplication. 

Duplicate code is the enemy of well-designed software. If we have to maintain a redundancy and write code to describe a single piece of business logic two or more places, we need to rely on our memory to remember all the places to update if it were to change.

Humans aren't normally the BEST at remembering things.

### Encapsulation

Encapsulation is the act of protecting the data integrity.

This is what we were addressing through the Use Case scenario.

By _data integrity_, we mean "what shape is this data allowed to take?”, “what methods can be called and at which point?", “what are the required parameters and pre-conditions in order to create this object”?

These are the [invariants](/wiki/invariant).

## Benefits of an Anemic Domain Model

Because it can take time to model a domain using DDD, sometimes it really is better to use an Anemic Domain Model.

Depending on a variety of different reasons, it might be more benefitial in the "short term" for you.

For example, if you're a **startup** without a product validated yet, or if you're working on a proof-of-concept or _throwaway_ app, I would recommend to go the anemic route because you can iterate really quickly.

> How do I know when I should use a rich domain model?

There's a **sweet spot** when you'll know. The good thing is that you can always refactor towards it; it's much easier if you've written SOLID and well-designed code.

![](/img/wiki/anemic/chart.svg)

***
<p class="aside">
Aside: It turns out that Anemic Domain Modeling is actually really useful for functional programming for a few reasons. 
</p>

<p class="aside">
In functional programming, objects are immutable. This means that there's no way for invariants to become unsatisfied. In this case, having a clear separation of the model and the services makes a lot of sense.
</p>

<p class="aside">
I was recently introduced to <a href="https://en.wikipedia.org/wiki/Entity_component_system">ECS (Entity component system)</a>, a pattern that's popular in game development, in this presentation on <a href="https://docs.google.com/presentation/d/1BG8QBAgqXicNNaan3yskzpbC5gEmgOdCHM83D5awXl4/edit?fbclid=IwAR103ZMMQD-sv-3n0VcOz-CqNdJPzh9htO3HTH9VU_yBHpD4a_7e-k_xilU">A-Frame & AR web experiences</a> by <a href="https://www.linkedin.com/in/arsham-eslami/">Arsham Eslami</a>. ECS follows the rule of composition over inheritance whereby the operations that occur on models are usually located separately from the models, in services.
</p>

<p class="aside">
This makes sense and saves a lot of time if you want to add <code class="language-text">CanRun</code> and <code class="language-text">CanFly</code> in addition to <code class="language-text">CanShootLazers</code> to various models in a game engine.
</p>

