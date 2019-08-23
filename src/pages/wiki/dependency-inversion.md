---
name: Dependency Inversion
templateKey: wiki
published: true
wikicategory: Design Principles
wikitags:
  - SOLID
prerequisites:
  - Concrete class
  - Interface
  - Abstract class
date: '2019-01-24T00:05:26-04:00'
updated: '2019-04-03T00:05:26-04:00'
image: /img/wiki/dependency-inversion/dependency-inversion.svg
plaindescription: A de-coupling technique where both high-level and low-level classes depend on the same abstraction, inverting the dependency relationship.
---

The enemy of well-designed software is [coupling](https://en.wikipedia.org/wiki/Coupling_(computer_programming)). 

When large bodies of code are tightly coupled, they become ultimately unchangable and difficult to test. Testing one part of the code requires spinning up the entire implementation. Code like this is 🗑️🚯.

Well-designed software allows us to swap out dependencies that we're not currently interested in testing, with mocks. 

In order to do this, we need to _keep the dependencies at a distance_ and design with abstractions.

> What does that mean? Keep the dependencies at a distance?

It means that when we need to include a class as a dependency, we should try to refrain from referring to [concrete classes](/wiki/concrete-class) (the actual implementation), but instead, refer to abstractions, like the **interfaces** or **abstract classes** that the concrete classes implement or subclass.

> Abstractions should not depend on details. Details should depend on abstractions.

> High-level modules should not depend on low-level modules. Both should depend on abstractions.

<hr/>

This is the essence of Dependency Inversion, the D in the [SOLID design principles](/articles/solid-principles/solid-typescript/). 

When we refer to the abstractions rather than the concrete classes, the flow of dependencies gets **inverted**. This is desired when we design software because the resulting dependency flow is **much safer** and allows for us to mock classes we're not interested in testing atm.

## Generic Example

Take this generic class diagram below.

![Dependency Inversion](/img/wiki/dependency-inversion/dependency-inversion.svg "Basic DI Diagram")

Here, we have a couple different classes:

- Application. The main class which starts the app.
- Service (interface). An interface describing some service.
- Service Factory (abstract class). An abstract class describing how to create a factory which can create a Service.
- Service Factory Impl (concrete class). A subclass of the Service Factory abstract class which is capable of creating a Service.
- Concrete Service (concrete class). A service implementation.

Also notice that there's a **boundary** inbetween some of the classes. That's very important to recognize. That boundary signifies a divide between **the abstractions** and **the concrete classes** (the implementations of the abstractions).

If we were to flip this around and look at the flow of dependencies, you'll notice that all of the **concrete classes depend on the abstractions**.

![Dependency Inversion](/img/wiki/dependency-inversion/dependency-inversion-graph.svg "Inverted depdendency graph")

<p class="aside">
From this example, when we refer to "high-level" classes, <code class="language-text">Application</code> is a good example, since it's only responsible for spinning classes up and starting the application. When we refer to low-level classes, <code class="language-text">ConcreteService</code> and <code class="language-text">ServiceFactoryImpl</code> classes, which are classes that actually implement all the work, are good examples.
</p>

This is good! Clearly, it's much better for the majority of our code to depend on abstractions, because we can always extend them (as per [The Open Closed Principle](/articles/solid-principles/solid-typescript/)) with another implementation. 

## Depending on Concrete Classes

> Why is it such a bad thing to depend on concrete classes?

It's not a good thing to depend on [concrete classes](/wiki/concrete-class) because they're **hard source code dependencies**.

We can't extend concrete classes. Once they're written, they're pretty much written and set in stone (or... concrete 😉). 

That's a partial lie, we can always _change_ concrete classes after they've been written... but if you knew that there were 10, 20 or 100 other classes that depended on it directly, would you want to? Would you feel safe changing it? (**Volatility**).

<hr/>

The [Interface Segregation Principle](/articles/solid-principles/solid-typescript/) is about creating interfaces or abstract classes for the concrete classes in order to separate what a class should do vs. what it does. Meanwhile, the L in SOLID, the [Liskov Subsitution Principle](/articles/solid-principles/solid-typescript/) allows us to swap out one subclass for another safely.


## Uncle Bob's rules

1. Don't refer to concrete classes. Refer to abstract interfaces instead. This puts a constraint on object creation and generally enforces the use of Abstract Factories.

2. Don't derive from volatile concrete classes. 

3. Don't override concrete functions. These require source code dependencies

4. Never mention the name of anything concrete.

<hr/>

## <i class="fas fa-exchange-alt"></i> Other related topics

[Dependency Rule](/wiki/dependency-rule)

Why? This is the relationship that exists between the different layers. In the [Clean Architecture](http://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html), we have the domain, data and presentation layers, generally speaking. If we were to observe what the dependency graph looked like, we'd notice that that modules from the outer layers (data and presentation) depend on modules from the inner domain layer. This is Dependency Inversion at an **much higher architectural level**.


[Abstract Factory](/wiki/abstract-factory)

Why? Dependency Inversion places constraints on how we should be constructing our concrete classes. We've been saying that we should never refer to concrete classes, never derive from them, never even speak their name, yadda yadda... But we need to create concrete classes somehow. We need to create concretions so that the methods that they implement and override can be used in our software somewhere. That's where the Abstract Factory comes into play- it's how we actually get instances of classes created. We use it when there are a number of other factories in common. We can group them all under some abstraction.

[Concrete classes](/wiki/concrete-class)

Why? These are the classes that we're saying that we should never refer to directly. These are the classes that we should "inadvertently"... "depend"... on... through  Dependency Inversion. 

<hr/>

## <i class="far fa-smile"></i> Why is it useful?

This pattern builds on a lot of different stuff. In everyday usage, it's a good rule for how we should organize source code dependencies.

In Layered Architecture, it's one of the primary components to establishing the ins and outs of each layer.

In Domain-Driven Design, which heavily benefits from a Layered Architecture, it's how we can enable ourselves to create the entire core domain of an application, without having to even begin to think about which type of database and ORM tool we want to use yet.


