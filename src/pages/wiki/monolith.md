---
name: Monolithic Application
templateKey: wiki
published: true
wikicategory: Software Architecture
wikitags: 
  - Architecture
  - Deployments
prerequisites: null
date: '2019-12-02T00:05:26-04:00'
updated: '2019-12-02T00:11:26-04:00'
image: null
plaindescription: An application where all the essential components are self-contained and deployed within a single process.
---

If what we ship to our server is a single executable file or script that runs our entire application in one process, we have a monolith on our hands.

<div style="text-align: center;">
  <img style="max-width: 300px;" src="/img/wiki/monolith/monolith-img-1.svg" />
</div>

<p class="caption">A monolithic application containing modules from A to F.</p>

If for some reason, our application relies on another service that contains critical features or business logic for our core domain, it's no longer a monolith. It may be a _distributed monolith_.

<div style="text-align: center;">
  <img style="max-width: 300px;" src="/img/wiki/monolith/monolith-img-2.svg" />
</div>

<p class="caption">An application that relies on a business-critical module running in a separate process is no longer a monolith.</p>

## When to migrate to microservices

A monolith isn't always a bad thing. In fact, I would advocate for starting out with a monolith on  _most_ projects.

Factors that can influence needing to break a monolith into microservices are:

- Growing team size.
- Clear understanding of the subdomains within the code and how they can be assigned to teams.
- Horizonal scaling required for select high-traffic or expensive to operate features in the application.

## Difference between a monorepo and a monolith

A _monorepo_ is a code repository that we use to store several related repositories for a project. 

A monorepo can _become_ a monolith if when we run an application contained from within a monorepo, it has access to all the components needed in order for it to operate, and all those components are self-contained at runtime.

If we needed to run several processes from within the monorepo in order for the application to work, it's no longer a monolith.

## Benefits

- Ease of local development.
- Ease of deployment.

## Disadvantages

- Single point of failure.
- Checking in code can turn into a nightmare if the team size is large. Code conflicts might occur more frequently.
- For some applications, it doesn't scale well.


