---
templateKey: article
title: "Domain Knowledge & Interpretation of the Single Responsibility Principle | SOLID Node.js + TypeScript"
date: '2019-06-13T10:04:10-05:00'
updated: '2019-06-13T10:04:10-05:00'
description: >-
  The Single Responsibility Principle specifies that a class or function should only have one reason to change. Admittedly, that's not very clear. This article describes why understanding the domain is important to know how SRP can be implemented.
tags:
  - SOLID
  - Software Design
  - Advanced Object-Oriented Programming
category: Software Design
image: /img/blog/solid/solid.png
published: true
anchormessage: This article is part of Solid Book - The Software Design & Architecture Handbook. <a href="https://solidbook.io">Get the book</a>.
---

<div class="solid-book-cta course-cta">
  <div class="solid-book-logo-container">
    <img src="/img/resources/solid-book/book-logo.png"/>
  </div>
  <p>This article is part of Solid Book - The Software Design & Architecture Handbook w/ TypeScript + Node.js. <a href="https://solidbook.io">Check it out</a> if you like this post.</p>
</div>

> Is domain knowledge needed for the Single Responsibility Principle?

TLDR; yes, we have to care enough to understand the domain in order to make smart design decisions.

SRP is hands-down, the hardest principle from the [SOLID Princples](/articles/solid-principles/solid-typescript/) to understand because everyone has different interepretations of it.

I'm going to attempt to explain why understanding the domain can help you understand how to implement SRP.

---  

## <a  class="anchor" name="Discussion"></a>Discussion 

In a recent discussion about the [previous article](/articles/software-professionalism/developer-principles/) on software design principles not being introduced to junior developers, one comment really struck a chord with me:

> “I would argue that SOLID on its own has a lot of esoteric nonsense packed in it, like what on earth even is single responsibility. Yeah and don't give me that "one reason to change" thing. It's meaningless unless you understand the domain (business wise) you're working in. And you can't understand the domain unless you actually have experience within the domain.”

I think “understanding the domain” is the _entirely the point_ of **Single Responsibility Principle**. Understanding the domain is the only way that we can write code that is <u>singularly responsible</u> for one thing.

In the [guide to the SOLID principles](/articles/solid-principles/solid-typescript/), we said that SRP is defined as:

> "A class or function should only have one reason to change."

This means that we split code up **based on the social structure** of the users using it. The example given was an application containing an HR department, an IT department, and an Accounting department that each needed to report their hours and calculate their pay.

```typescript
class Employee {
  public calculatePay (): number {
    // implement algorithm for hr, accounting and it
  }
  public reportHours (): number {
    // implement algorithm for hr, accounting and it
  }

  public save (): Promise<void> {
    // implement algorithm for hr, accounting and it
  }
}
```

And we realized that because the algorithms for each `Employee` might be _different_, and change requests would likely come from each department, it would be dangerous to create and locate a single algorithm to be responsible for each of the different _actors_ (HR, IT and accounting) from a single class. 

We decided it was better to separate their algorithms.

```typescript
abstract class Employee {
  // This needs to be implemented
  abstract calculatePay (): number;
  // This needs to be implemented
  abstract reportHours (): number;
  // let's assume THIS is going to be the 
  // same algorithm for each employee- it can
  // be shared here.
  protected save (): Promise<void> {
    // common save algorithm
  }
}

class HR extends Employee {
  calculatePay (): number {
    // implement own algorithm
  }
  reportHours (): number {
    // implement own algorithm
  }
}

class Accounting extends Employee {
  calculatePay (): number {
    // implement own algorithm
  }
  reportHours (): number {
    // implement own algorithm
  }

}

class IT extends Employee {
  ...
}
```

This is a good example. When we break up the algorithms from the `Employee` class into separate ones, we’ve potentially saved ourselves from the mess of trying to maintain 3 different algorithms (that might each independently be susceptible to change) in one class.

The question is: how did we know that we needed to do that?

How could we possibly have known that was a good thing to do?

It’s because we’re <u>thinking about the domain</u>.

## <a  class="anchor" name="Software-design-is-making-educated-guesses"></a>Software design is taking an educated guess at the future

Sometimes, I equate software design to playing midfield in soccer. As a midfielder, you have to be aware of what’s going on around you at all times. A good midfielder should at all times, be attempting to predict what’s going to happen 3 seconds in the future. 

A great midfielder is very perceptive to her surroundings, and will often be positioned on the field at a location that her teammates need her to be, even before they know they’re going to need her to be there.

She’s able to identify **if and when** her teammates are going to get blocked and pressured to pass the ball, so she positions herself to be available for that pass.

Software design & architecture is similar. We’re making best guesses (through abstractions and interfaces) at what we predict is going to need to happen in the future, without investing all of the upfront energy of implementing [concretions](/wiki/concrete-class/) of things we don’t need ([YAGNI](/wiki/yagni/)).

The only way for us to make those informed and educated design decisions? 

> Understand the domain we’re working in

If we don’t understand the domain we’re writing code in, we’re doomed to make [expensive messes](/articles/software-professionalism/developer-principles/), because software requirements are **sure** to change over time.

---


Therefore, I believe **Single Responsibility** can be done correctly if **you understand the domain**. Quite a bit of poor code I wrote during my early co-op roles originated from me from _not caring about understanding the domain_, and just wanting to prove that I could write code that would work. 

Don’t be like me. Don’t be a code 🐵.

The amount of time that you spend talking to domain experts, ramping up on understanding the domain, and asking questions is often related to the quality of the code that will come out of our capable hands.

---

##<a  class="anchor" name="Another-SRP-Example"></a> Is this code singularly responsible to you?

I found this example Nodejs/JavaScript code on the internet and I wanted to talk about it. 

```typescript
const UserModel = require('models/user');
const EmailService = require('services/email');
const NotificationService = require('services/notification');
const Logger = require('services/logger');

const removeUserHandler = async (userId) => {
  const message = 'Your account has been deleted';
  try {
    const user = await UserModel.getUser(userId);
    await UserModel.removeUser(userId);
    await EmailService.send(user.email, message);
    await NotificationService.push(userId, message);
    return true;
  } catch (e) {
    console.error(e);
    Logger.send('removeUserHandler', e);
  };
  return true;
};
```

Does this code say **Single Responsibility** to you?

At first, I thought **no** because it has to utilize several different services that probably aren't related to the `User` subdomain this code probably lives in. But then I thought about it some more.

### Almost

Almost, because after reading and understanding what this `removeUserHandler` `use case` [^1] adapter does, it appears to be responsible for 2 things.

1. **removing the user** _in addition to_ 
2. **all side effects of doing just that** (sending an email, notifying the user, logging when a failure happens).  

Although it's not a **single** responsibility, to me, it's a _fair_ delegation of responsibility. It would be nice to separate those two concerns, but if this isn't a very complicated application, I wouldn't push it.

If tomorrow, my manager were to tell me: 

> "Hey Khalil, I need you to make sure that after users get deleted, we also delete their image from Amazon S3"

I would know exactly where to add that code because there's <u>one place to change side effects of removing a user</u>. Furthermore, the only _reason_ it would need to change is if we change the requirements of what happens after removing a user.

#### Improving it with Domain Events and the Observer Pattern

Using Domain Events, we could actually dispatch a `UserRemoved` Domain Event from the `Users` subdomain and **subscribe** to that event from the `Email` (and the same thing from the `Notification` <u>subdomains</u>). 

```typescript

/**
 * modules/email/subscriptions/AfterUserRemoved
 * This class resides within the Email subdomain (/modules/email)
 */

class AfterUserRemoved implements IHandle<UserRemoved> {
  private emailService: IEmailService;

  constructor (emailService: IEmailService) {
    this.emailService = emailService;
  }

  private subscribeToDomainEvents (): void {
    DomainEvents.register(this.onUserRemoved.bind(this), UserRemoved.name)
  }

 /**
  * @desc onUserRemoved, a handler for the UserRemoved domain event gets called
  * when the UserRemoved event is dispatched from the Users subdomain.
  * This is an example of the Observer pattern.
  * It's also how we can prevent 'God'-classes that know about everything and
  * quickly become unmaintainable.
  */

  private async onUserRemoved (event: UserRemoved): Promise<any> {
    const { userId, email } = event.user;
    const message = 'Your account has been deleted';

    try {
      await this.emailService.send(email, message);
    } catch (err) {
      console.log(err);
    }
  }
}
```

This would remove the need for us to handle both _the actual removal of the user_ and the _side effects_ of doing so from the same class. [^2] The **Observer pattern** is especially helpful here when there may be several side effects (against a particular domain event) across architectural boundaries.

--- 

The truth is, understanding the domain improves our code by keeping responsibilities singular and focused at every level of the stack.

## Conclusion: design improves with domain enlightenment 

When we understand the domain, at an _architectural_ level:

- we’re able to implement **package by module**
- we’re able to split out code into subdomains
- we’re able to identify how micro-services could be independently deployed

When we understand the domain, at the _module_ level:

- we’re able to identify when a block of code doesn’t belong in that particular subdomain / module and would be better suited in another one

When we understand the domain, at a `class` level:
- we can understand if this block of code belongs in a helper/utility class or if it makes sense to stay in this class.

---


[^1] In Uncle Bob's "Clean Architecture", he talks about **Use Cases** as one of the primary constructs in the [Clean Architecture](/articles/enterprise-typescript-nodejs/clean-nodejs-architecture/). The Use Case is responsible for fetching entities from **repositories**, executing business logic through **domain services** and persisting those changes to the system with **repositories**. Use Cases are flexible such that they're agnostic to the external infrastructure layer construct. This means you could hook them up to be used by **Web Controllers** (for RESTful APIs), SOAP (if you needed to integrate with a legacy system), or any other type of protocol you could imagine. The most common usage is hooking them up to RESTful API controllers.


[^2] If we were to go the event-driven approach with [Domain Driven Design](/articles/domain-driven-design-intro/), initially identifying your project subdomains can difficult to figure out. 

There's a process called **Event Storming** which enables you to figure out which events exist in your domain, and which **aggregates** they belong to. This can help figure out what subdomains exist in your enterprise!
