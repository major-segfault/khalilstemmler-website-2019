---
templateKey: blog-post
title: "Where Do Domain Events Get Created? | Domain Driven Design w/ TypeScript"
date: '2019-07-04T10:04:10-05:00'
updated: '2019-07-04T10:04:10-05:00'
description: >-
  In this post, I explain how good ol' fashioned encapsulation + TypeScript getters and setters enable us to effectively create Domain Events directly from the aggregate roots in our domain-driven design projects.
tags:
  - DDD
  - Domain Entities
  - Software Design
  - Domain Events
category: Domain-Driven Design
published: true
image: /img/blog/templates/banners/ddd-blog-banner.png
displayInArticles: true
---

Last time, we talked about how to create a [facade over our ORM using the Repository pattern](/articles/typescript-domain-driven-design/repository-dto-mapper/). Today, we're talking a little bit about where we create Domain Events.

Domain Events are a _huge_ part of Domain-Driven Design. 

When implemented correctly, they allow us to **chain** domain logic, maintain [single responsibility](/articles/solid-principles/solid-typescript/), and cross architectural boundaries (subdomains) using the Observer pattern (which is a well-known way to separate concerns and decouple async logic).

The question is: "where do Domain Events get created"? 

Domain Events are a part of the **domain layer**, so they belong with all the other domain layer constructs like [entities](/articles/typescript-domain-driven-design/entities/), [value objects](/articles/typescript-value-object/) and **domain services**.

OK cool, but where _exactly_ do they get created?

Right on the **aggregate root**.

Allow me to explain.

To me, the most beautiful thing about [Domain-Driven Design](/articles/domain-driven-design-intro/) is that it urges you towards creating your own **domain-specific language (DSL)**. 

You expose only the methods and attributes that <u>make sense</u> to the domain. And those methods and attributes only belong on **entities** and **value objects** that it <u>makes sense</u> to belong on.

```typescript
class User {
  // factory method to create users, yep
  public static create (props): User { }  

  // yup, also a valid domain operation
  public deactivate (): void {}       
  
  // ❌ No. A client shouldn't need to use this operation.
  // Use a Value Object to encapsulate validation logic instead: 
  // https://khalilstemmler.com/articles/typescript-value-object/  
  public validateFirstName (firstName): boolean {}            
}
```

Determining what **makes sense** is _hard_. It usually takes a lot of conversation with domain experts and multiple iterations of the model.

This increased importance on [YAGNI](/wiki/yagni/), and only exposing operations that are valid to the model are also a big reason why [getters and setters](/blogs/typescript/getters-and-setters/) get a lot of usage for us in Domain-Driven Design. 

Using getters and setters, not only do we get to specify exactly **what** is allowed to be accessed/changed, but we also get to specify _when_ it's allowed to be accessed/changed, and _what happens_ when it's accessed/changed. 

> When _essential_ properties are accessed or changed, it might make sense to create a Domain Event.

For example, if we were working on [White Label](https://github.com/stemmlerjs/white-label)'s feature that enables `Traders` to _accept_ or _decline_ `Offers`, we'd have to walk through the process of [determining where Domain Logic should belong](/articles/software-design-architecture/organizing-app-logic/).

Following that process, we'd discover that `acceptOffer()` and `declineOffer()` perform <u>mutations</u> to the `Offer` aggregate root itself. 

Those operations can be done without the involvement of any other domain entities, so it makes sense to locate them directly on the `Offer` aggregate root.

```typescript
export type OfferState = 'initial' | 'accepted'  | 'declined'

interface OfferProps {
  ...
  state: OfferState;
}

export class Offer extends AggregateRoot<OfferProps> {
  ...

  get offerId (): OfferId {
    return OfferId.create(this._id);
  }

  get offerState (): OfferState {
    return this.props.state;
  }

  public acceptOffer (): Result<any> {
    switch (this.offerState) {
      case 'initial':
        // Notice how there is not a public setter for the
        // 'state' attribute. That's because it's important that
        // we intercept changes to state so that we can create and add
        // a Domain Event to the "observable subject" when it's
        // appropriate to do so.
        this.props.state = 'accepted';
        // And then we create the domain event.
        this.addDomainEvent(new OfferAcceptedEvent(this.offerId));
        return Result.ok<any>();
      case 'accepted':
        return Result.fail<any>(new Error('Already accepted this offer'));
      case 'declined':
        return Result.fail<any>(new Error("Can't accept an offer already declined"));
      default:
        return Result.fail<any>(new Error("Offer was in an invalid state"));
    }
  }

  public declineOffer (): Result<any> {
    switch (this.offerState) {
      case 'initial':
        // Same deal is going on here.
        this.props.state = 'declined';
        this.addDomainEvent(new OfferDeclinedEvent(this.offerId));
        return Result.ok<any>();
      case 'accepted':
        return Result.fail<any>(new Error('Already accepted this offer'));
      case 'declined':
        return Result.fail<any>(new Error("Can't decline an offer already declined"));
      default:
        return Result.fail<any>(new Error("Offer was in an invalid state"));
    }
  }

  private constructor (props: OfferProps, id?: UniqueEntityId) {
    super(props, id);
  }
}
```

And if we were taking the [use case approach](/articles/enterprise-typescript-nodejs/application-layer-use-cases/) of hooking this up, executing this feature would look like:

```typescript
export class AcceptOfferUseCase implements UseCase<AcceptOfferDTO, Result<Offer>> {
  private offerRepo: IOfferRepo;
  private artistRepo: IArtistRepo;

  constructor (offerRepo: IOfferRepo) {
    this.offerRepo = offerRepo
  }

  public async execute (request: AcceptOfferDTO): Promise<Result<Offer>> {
    const { offerId } = request;
    const offer = this.offerRepo.findById(offerId);

    if (!!offer === false) {
      return Result.fail<Offer>(ErrorType.NOT_FOUND)
    }

    // Creates the domain event
    offer.acceptOffer();

    // Persists the offer and dispatches all created domain events
    this.offerRepo.save(offer);
    
    return Result.ok<Offer>(offer)
  }
}
```

Because Domain Events are part of the domain, we'll always want to try to place Domain Events **as close to the entities/aggregate roots as possible**.

If we can trust that the domain layer will always generate the appropriate domain events in those key scenarios, we can enable several applications (perhaps deployed in separate bounded contexts and propagated over the network using a message queue like RabbitMQ) to implement their _own_ varying [application layer logic](/articles/enterprise-typescript-nodejs/application-layer-use-cases/) to handle these events however they please.

For example, if our `Billing` subdomain were to subscribe to the `OfferAcceptedEvent`, we might want to fulfill the trade by facilitating the trade between the two parties and charging a 0.2% processing fee.

![hi](/img/blog/domain-events/offer-accepted-event.svg)