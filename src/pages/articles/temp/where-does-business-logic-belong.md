---
templateKey: article
title: "Where does business logic belong?"
date: '2019-07-23T10:04:10-05:00'
updated: '2019-07-23T10:04:10-05:00'
description: >-
  In this article, we talk about 
tags:
  - DDD
  - TypeScript
  - Software Design
  - Domain Event
  - Business Logic
  - Observer Pattern
category: Domain-Driven Design
image: /img/blog/ddd-rest-first/rest-first.png
published: false
---

  - what's high-level policy?
    - high-level policy are the business rules
      - for example, the **entities** (the main place to store high-level policy, second level) 
      - value objects contain the validation logic
      - domain services contain logic that doesn't quite fit within a single entity
      - use cases contain application layer logic
    - the **dependency rule** states that dependencies should always point towards high-level policy (show clean architecture image).
    - in terms of the layered architecture, the domain layer contains the high-level policy.
    - architecturally, the way we stucture web apps