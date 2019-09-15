---
name: Acyclic Dependency Principle (ADP)
templateKey: wiki
published: true
wikicategory: Component Principles
wikitags: 
  - Dependency Inversion
prerequisites: null
date: '2019-09-15T00:05:26-04:00'
updated: '2019-09-15T00:11:26-04:00'
image: /img/wiki/package-principles/bad-cycle.svg
plaindescription: One of several component design principles that states that the "dependency graph of components should have no cycles"
---

In the header image, component A relies on component B which relies on component C.

The problem is that component C also relies on A.

That creates a cycle.

We don't want dependency cycles because they:

- Make the code hard to understand, thus reducing maintainability
- Reduce the quality of the code and improve the likelihood of errors by making it harder to change one component without affecting another
- Make it impossible to test each individual component because they can't be separated
- Have the ability to violate [The Dependency Rule](/wiki/dependency-rule/)

The following example demonstrates a violation of ADP. A cycle exists where `UsernameGenerator` relies on `UserRepo`, which relies on `User`, which relies on `UsernameGenerator`.

![Dependency graph with a Cycle](/img/wiki/package-principles/bad-cycle-example.svg)

## How to fix it?

Two ways:

1. [Dependency Inversion](/articles/tutorials/dependency-injection-inversion-explained). Stick an interface inbetween one of the relationships to **break the cycle**.
2. Rethink your layers. If you've run into cycles like this, it might be a good signal that you're not following <a href="/wiki/dependency-rule/">The Dependency Rule</a>. You can fix that by aiming to understand and separate the concerns of your application into layers. See <a href="/articles/enterprise-typescript-nodejs/clean-nodejs-architecture/">The Clean Architecture</a>.

## <i class="fas fa-exchange-alt"></i> Other related topics

### Dependency Inversion Principle

This is how we might be able to break a dependency cycle.

<p class="special-quote">Check out <a href="/articles/tutorials/dependency-injection-inversion-explained/">this article</a>, "Dependency Injection & Inversion Explained | Node.js w/ TypeScript".</p>

### The Dependency Rule

The direction of dependencies should form an _acyclic_ graph where the lower-level components always **rely on/point towards** the higher-level policy.

For example, given the following generic application architecture, notice that all of the outer layer details point towards the inner-layer ones (Domain layer + Application layer)?

<img style="width: 100%;" src="/img/blog/ddd-frontend/generic-application-architecture.svg"/>

That's how you follow the **dependency rule**.

<img style="width: 100%;" src="/img/blog/ddd-frontend/component-volatility.svg"/>