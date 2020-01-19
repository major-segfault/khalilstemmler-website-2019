---
templateKey: article
title: "GraphQL's Greatest Architectural Advantages"
date: '2020-01-18T17:04:10-05:00'
updated: '2019-01-18T17:04:10-05:00'
description: >-
 There's a lot of advantages to using GraphQL instead of REST on your server, and there's a lot of advantages to using Apollo Client instead of writing your own data-fetching logic. In this article, we talk about some of GraphQL's greatest architectural advantages.
tags:
 - GraphQL
 - Architecture
 - Software Design
 - RESTful APIs
category: GraphQL
image: /img/blog/graphql/graphql-banner.png
published: true
---


Readers that frequent this blog know that I often look for answers to the hard questions in software design and architecture 🧐. 

Over the past few years, we've seen companies of all shapes and sizes like [Expedia](https://www.apollographql.com/customers/expediagroup/?utm_source=khalil&utm_medium=article&utm_campaign=graphql_architectural_advantages), [Nerdwallet](https://www.nerdwallet.com/blog/engineering/migrating-redux-graphql-nerdwallet-internship-experience/), and [AirBnb](https://www.youtube.com/watch?utm_campaign=React%2BNewsletter&utm_medium=email&utm_source=React_Newsletter_189&v=pywcFELoU8E) incrementally adopt GraphQL throughout their organizations. 

In this article, we'll discuss **specific architectural advantages** to using GraphQL in your next project or adopting it for an existing one.

We'll talk about:

- Where GraphQL belongs in the modern web application architecture.
- Why infrastructure code shouldn't be our focus on web development.
- The Data Graph: the newest layer in the modern web application stack.
- How the Data Graph unblocks frontend developers and removes the need for them to rely on backend developers.
- How to scale and separate concerns with Apollo Federation.
- How GraphQL and Apollo Federation eliminates the need to do API versioning.

### The Hexagonal architecture

[Alistair Cockburn](https://twitter.com/TotherAlistair?ref_src=twsrc%5Egoogle%7Ctwcamp%5Eserp%7Ctwgr%5Eauthor)'s "Hexagonal architecture," says that the inner-most layer of our architecture holds the [application](https://khalilstemmler.com/articles/enterprise-typescript-nodejs/application-layer-use-cases/) and [domain layer](https://khalilstemmler.com/articles/typescript-domain-driven-design/entities/). Right outside of that layer are the _adapters_ (or ports). 

Think of ports as "a way to connect the outside world to the inside world." The outside world is full of technologies that we can use to build our application on top of. Outside, you'll find databases, external APIs, cloud services, and all kinds of other stuff. If we practice [dependency inversion](https://khalilstemmler.com/articles/tutorials/dependency-injection-inversion-explained/), we can safely involve them within our application by defining _ports_. Ports are abstractions. Contracts. They often appear in the form of **interfaces** or **abstract classes**.

!["Hexagonal architecture"](/img/blog/graphql/architectural-advantages/hexagonal-architecture.svg)

<p class="caption">Alistair Cockburn's "Hexagonal Architecture".</p>

I believe pretty strongly in this type of architecture because it enables us to:

- Delay the decision on exactly which type of web server, database, transactional email provider, or caching technology until it's absolutely necessary to decide. We can always use an in-memory implementation of the _port_ for initial development efforts. 
- It also prioritizes writing code that can be tested by using [Dependency Injection](/articles/tutorials/dependency-injection-inversion-explained/). This helps to minimize [concrete](/wiki/concrete-class/) dependencies that can make code untestable.
- Lastly, it adjusts our focus to the application and domain-specific stuff. The stuff we can't just buy off the shelf or download. 

## Infrastructure Components

GraphQL servers and HTTP servers are examples of _infrastructure components_.

<p class="special-quote"><b>Infrastructure components</b>: Fundemental components that comprise the foundation of a web application. Based on the <a href="/articles/software-design-architecture/organizing-app-logic/">clean (or hexagonal) architecture</a>, databases, web servers, and caches are <i>outer layer</i> infrastructure components.</p>

We call infrastructural components _infrastructure_ because they are **foundational to the application we build on top of it**. It's within this foundation- this skeleton, that we write our rich, domain-specific applications. The infrastructure is simply the driver.

Another primary characteristic about infrastructure components is that they **aren't the focus of our development efforts for a project**.

Infrastructure components are tools trusted by the industry, and we only need to _configure_ them to make them work.

Configuration of a GraphQL API involves:

- Installing GraphQL
- Exposing a server endpoint
- Designing a schema
- Connecting resolvers to data sources

This _is work_, but it's not the **focus** of our work on a project. 

If a certain piece of infrastructure technology is trusted by the industry, there's a good chance that we can expedite our development efforts by letting that tool do its job **instead of developing our own infrastructure component**.

Consider databases. They're _infrastructural_ too.

For example, a **Postgres database** is one of several databases we could use for a new project. Imagine the pushback you'd get from your team if you tried to convince them it was essential for the project to write your own database from scratch. 

The scenario seems silly when we think about how it applies to choosing a persistence technology, but choosing your web application API style (transport/client-server technology) is a similar situation. 

It was only in 2019 that I realized the client-server communication API _isn't just the language we use_. It's not just REST or GraphQL. It goes a little bit deeper than that. APIs touch the edges of our front-end frameworks as data stores, and they touch the contracts of our backend services. 

If this sounds a bit _virtual_, that's because it kinda is. At Apollo GraphQL, we call that _virtual layer_ the _Data Graph_. And Apollo builds tools that improves developer productivity working with it.

## The Data Graph

I first heard the idea of a **Data Graph** from [Matt DeBergalis](https://twitter.com/debergalis?lang=en), CTO of [Apollo GraphQL](https://www.apollographql.com/docs/?utm_source=khalil&utm_medium=article&utm_campaign=graphql_architectural_advantages) at GraphQL Summit 2019.

<iframe width="100%" height="315" src="https://www.youtube.com/embed/EDqw-sGVq3k" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

<p class="caption">I highly recommend Matt's talk at GraphQL Summit 2019 where he introduces the concept of the Data Graph.</p>

The Data Graph is _virtual layer_ that sits in between our client-side application and a GraphQL server. It holds **the entirety of an organization's data and provides the language for how to fetch and mutate state within the entire organization**.

> The Data Graph is _a declarative, self-documenting, organization-wide GraphQL API_.

To me, the Data Graph is a previously **missing layer** in the modern application stack.

<img style="width: 100%;" src="/img/blog/graphql/architectural-advantages/Virtual-Data-Graph.svg"/>

<p class="caption">Basic full stack Apollo Client + Server application stack.</p>

### The Data Graph brings the remote state closer to client-side local state

[Three challenges all front end frameworks](/wiki/3-common-goals-of-frontend-frameworks/) need to solve are _data storage, change detection, and data flow_.

React developers typically need to patch on Redux or Context, and write lots of boilerplate code to satisfy these requirements. 

Using [Apollo Client](https://www.apollographql.com/docs/react/?utm_source=khalil&utm_medium=article&utm_campaign=graphql_architectural_advantages) + React Hooks, React developers get the benefit of having _all three needs satisfied_ with a lot less code.

Personally, I most appreciate how _close_ remote state feels. 

Take this query to fetch a particular dog by its breed, for example:

<div class="filename">queries/dog.js</div>

```graphql
const GET_DOG = gql`
  query GetDogByBreed($breed: String!) {
    dog(breed: $breed) {
      images {
        url
        id
        isLiked @client # signal to resolve locally
      }
    }
  }
`;
```

In this query primarily intended to fetch remote resources, we can use the `@client` directive to refer to properties we want to fetch from our [local cache](https://www.apollographql.com/docs/react/data/local-state/?utm_source=khalil&utm_medium=article&utm_campaign=graphql_architectural_advantages) based on a _client-side schema_. Very cool that this can be done in the same request. Think about the amount of spread and `Object.assign()`s operations we normally do in a Redux environment.

![](https://www.nerdwallet.com/assets/blog/wp-content/uploads/2019/08/GraphQL-Apollo-1400x821.png)

<p class="caption">Depiction of the the simplified data-fetching architecture where the view is any front-end framework - Source <a target="_bank" href="https://www.nerdwallet.com/blog/engineering/migrating-redux-graphql-nerdwallet-internship-experience/">nerdwallet</a>.</p>

The Data Graph, with Apollo Server and Client on both ends of the connection, simplifies fetch logic, error logic, retry logic, pagination, caching, [optimistic UI](https://www.apollographql.com/docs/react/performance/optimistic-ui/?utm_source=khalil&utm_medium=article&utm_campaign=graphql_architectural_advantages), and other boilerplate data-plumbing code.

<img style="width: 100%;" src="/img/blog/graphql/architectural-advantages/single-service-graph.svg"/>

<p class="caption">The Data Graph stretches from client to server and has an answer for the most common infrastructural problems when fetching data and mutating state in modern web applications.</p>

In order communicate with a backend service through GraphQL, [Apollo Client](https://www.apollographql.com/docs/react/?utm_source=khalil&utm_medium=article&utm_campaign=graphql_architectural_advantages) exposes several client-side methods that convert to the operation we're trying to perform into appropriate API to cross the Data Graph. 

On the [Apollo Server](https://www.apollographql.com/docs/apollo-server/?utm_source=khalil&utm_medium=article&utm_campaign=graphql_architectural_advantages) end, those API calls pass control off to [resolvers](https://www.apollographql.com/docs/graphql-tools/resolvers/?utm_source=khalil&utm_medium=article&utm_campaign=graphql_architectural_advantages) responsible for fetching data using ORMs, raw SQL, caches, _other RESTful APIs_ or anything else you can think of. For mutations, a resolver can simply pass control to an application layer [use case](/articles/enterprise-typescript-nodejs/application-layer-use-cases/).

<p class="special-quote">By making the <a href="/articles/enterprise-typescript-nodejs/application-layer-use-cases/">use cases</a> the focal point of your application, switching from REST to GraphQL (or supporting both) is a breeze.</p>

### GraphQL is self documenting

One bummer in mainting a RESTful API is keeping documentation up to date and adequate. 

There are two things that can change for a RESTful API.

1. The route + method combination
2. The request shape + parameters

A **route + method combination** example is that it's quite easy for someone to move the operation that **creates a user** from `POST /users` to `POST /users/new`. An API change like this would likely go unnoticed, break all clients of the API, and be virtually impossible for the API client to detect what the combination was changed to.

A **request shape + parameters** example is one where the `POST` request to `/users/new` used to only require an `email` and a `password`, but now, it requires a `username` property as well. The only way for an API client to understand what to do to remedy the request would be to check the error response (_hopefully, error messages are descriptive otherwise this too would be impossible_).

--- 

If you consider [introspection](https://graphql.org/learn/introspection/) adequate documentation, then **GraphQL is self-documenting** and _impossible_ for your API documentation to get _out_ of sync.

Using [GraphQL Playground](https://www.apollographql.com/docs/apollo-server/testing/graphql-playground/?utm_source=khalil&utm_medium=article&utm_campaign=graphql_architectural_advantages), one can browse all of the capabilities of a GraphQL endpoint.

![](/img/blog/graphql/architectural-advantages/introspection.png)

<p class="caption">GraphQL Playground's GraphQL explorer can display all of the capabilities of a GraphQL endpoint due to the ability to execute introspection queries.</p>

In REST-land, I've only seen APIs shipped with this amount of metadata built using Swagger. This is a very powerful feature that not only makes the code the single source of truth for documentation, but opens up the surface area of ways we can perform codegen to automate the creation of TypeScript types, client-side libraries, or service-to-service communication.

Because the GraphQL language is ubiquitous and standardized, humans **and machines** will have an easier time understanding how to integrate and work with it.

## Scaling and Separation of Concerns

[Principled GraphQL](https://principledgraphql.com/integrity#1-one-graph) states that,

> "Your company should have one unified graph, instead of multiple graphs created by each team."

The emergence of multiple graphs within a company is something that will start to happen as more and more teams catch on to GraphQL.

Using [Apollo Federation](https://www.apollographql.com/docs/apollo-server/federation/introduction/?utm_source=khalil&utm_medium=article&utm_campaign=graphql_architectural_advantages), each service team can build and manage their own GraphQL service from their bounded context, register it to an Apollo Gateway, distributing GraphQL operations across the entire enterprise.

<img style="width: 100%;" src="/img/blog/graphql/architectural-advantages/distributed-graph-features.svg"/>

<p class="caption">Apollo Federation lets us grow and expose a single Data Graph composed of several GraphQL endpoints.</p>

In Federation, you can _compose schemas_ and resolve fields from other services/bounded contexts. When a request comes in, those fields get resolved from the appropriate service 👍. 

Solving this problem is not uncommon for any organization of substantial size.

### A single endpoint

The [Open-Closed Principle](/articles/solid-principles/solid-typescript/) from the SOLID principles states that:

> "A component/system/class should be open for extension, but closed for modification".

Architecturally, because GraphQL only exposes a single endpoint to the client, it satisfies this principle. 

All of the complexities of how fields are being resolved are hidden from the client, and all it needs to focus on is how to build on top of the GraphQL server.

![](/img/blog/graphql/architectural-advantages/data-graph-evolution.svg)

<p class="caption">An illustration that depicts the evolution of an organization's Data Graph over time.</p>

## Empowers frontend developers

The Data Graph reduces front-end developers' reliance on backend developers to develop new endpoints for new use cases.

Small UI changes where we rip out components or realize that we've misjudged our data requirements and actually need a few more fields for components, happen quite often. Because this happens so often, and because REST is so rigid, it creates this dependency on the back-end team to make changes to the REST APIs any time we need adjustments.

Depending on the team structure, each of the following questions signal potential to reduce developer productivity and create a reliance on the backend team.

- Is the team fragmented? Are front-end developers strictly front-end, or are they also allowed to work on the other side of the stack?
- Are your backend developers remote?
- Are your backend developers in the office?

## GraphQL removes the need to manage API versions

[Principled GraphQL](https://principledgraphql.com/agility#5-use-an-agile-approach-to-schema-development) also has a strong opinion on versioning. It states that:

> "The schema should be built incrementally based on actual requirements and evolve smoothly over time."

This means that the team should practice [agile schema development](https://principledgraphql.com/agility?utm_source=khalil&utm_medium=article&utm_campaign=graphql_architectural_advantages#5-use-an-agile-approach-to-schema-development) by iteratively making changes instead of chunking changes in huge releases.

That's great, and all, but I live in the real world just like you. I know that that's not always possible, **at least not without the proper tooling**.

The Apollo platform has a feature called [schema validation](https://engine.apollographql.com/login?utm_source=khalil&utm_medium=article&utm_campaign=graphql_architectural_advantages) that lets you test every change against live production traffic and shows you when breaking changes are proposed, enabling teams to converse on how to continue.

Neat!

<p class="special-quote"><b>Getting started</b>: For more information on how to use Schema Validation, check out <a href="https://www.apollographql.com/docs/graph-manager/schema-validation/?utm_source=khalil&utm_medium=article&utm_campaign=graphql_architectural_advantages">the docs</a>, <a href="https://blog.apollographql.com/move-fast-without-breaking-things-c7d3407ee8d6">Evans Hauser's talk</a>, and <a href="https://engine.apollographql.com/login?utm_source=khalil&utm_medium=article&utm_campaign=graphql_architectural_advantages">sign up for a free Teams trial</a>.</p>

## Conclusion

- Within the modern web application architecture, GraphQL and RESTful Web Servers are infrastructure components. 
- Infrastructure components are fundemental components that comprise the foundation of a domain-specific web application we code within them.
- Infrastructure components aren't the focus of most web development projects, so we should aim to spend most of our time on application and domain layer code.
- The Data Graph is a declarative, self-documenting, organization-wide GraphQL API, brings remote state closer to the client-side, and can be scaled using [Apollo Federation](https://www.apollographql.com/docs/apollo-server/federation/introduction/?utm_source=khalil&utm_medium=article&utm_campaign=graphql_architectural_advantages).
- Front-end developers are empowered to create their own data-fetching use cases without the reliance on backend developers by using the Data Graph.
- GraphQL removes the need to manage API versions and Apollo's [Graph Manager](https://www.apollographql.com/docs/graph-manager/?utm_source=khalil&utm_medium=article&utm_campaign=graphql_architectural_advantages) can faciliate production schema validation.

There are a lot of scenarios where GraphQL makes sense architecturally.

I'm still in the process of trying everything out for myself. I'll be updating this article periodically as I get my hands dirty, so check back in a little while.


<!-- - Talking point: REST requires documentation to accompany it. With GraphQL, the code _is_ the documentation.
 - Supporting point: Introspection -->

<!-- - Talking point: You can still do service-to-service communication, and there are some valuable use cases, like needing to 
 - Supporting: Service-to-service communication using GraphQL is still advantageous due to introspection, but this is often turned off in production. -->

<!-- - Talking point: The greatest architectural advantage for server-side developers is there is a single contract to maintain, and it reduces risk. 
 - Supporting point: The entire contract for the way data goes in, and data comes out of your enterprise can be defined in a single schema, even if you're running a distributed microservice architecture. -->

<!-- - Talking point: GraphQL can be incrementally adopted, which means that you can run GraphQL and REST simultaneously. -->
