---
templateKey: article
title: "Command Query Segregation | Object-Oriented Design Principles w/ TypeScript"
date: '2019-08-29T10:04:10-05:00'
updated: '2019-08-29T10:04:10-05:00'
description: >-
  CQS (Command-Query Segregation) is a design principle that states that a method is either a COMMAND that performs an action OR a QUERY that returns data to the caller, but never both.
tags:
  - Command Query Segregation
  - Object-Oriented Programming
category: Software Design
image: /img/blog/design-principles/object-oriented-design-principles.png
published: false
---

I recently discovered a programming term, <u>Heisen_bug_</u>. 

No, I'm not talking about about a certain chemistry-teacher turned criminal drug-lord. 

**HeisenBUG**.

It's a pun on the German physicist, <a target="_blank" href="https://en.wikipedia.org/wiki/Werner_Heisenberg">Werner Karl</a> _Heisenberg_'s name, who Bryan Cranston's character in the _Breaking Bad_ TV show is also named after. 

Heisenberg's discovery in particle physics was the <u>uncertainty principle</u>. It states that "the very act of observing [a particle] alters the position of the particle being observed, making it impossible (in theory) to accurately predict it's behavior" [^1].

> Is it just me or does that remind you of your worst debugging nightmares?

**HeisenBUG** takes after the meaning of the uncertainty principle, where it becomes incredibly hard to find a bug. So much so that the bug seems to disappear or alter its behavior when we attempts to take a closer look at it.

In programming, this happens when our code produces unintended or unexpected **side-effects** where we didn't expect it to do so. 

--- 

## Command-Query Segregation (CQS)

Command-Query Segregation (CQS) and not to be confused with the architectural Command-Query _Response_ Segregation (CQRS) pattern, is a design principle (while not strictly object-oriented) that states that:

> a _method_ is either a `COMMAND` that performs an action OR a `QUERY` that returns data to the caller, but never both.



[^1]: [Uncertainty Principle](https://en.wikipedia.org/wiki/Uncertainty_principle) - Fascinating wikipedia entry on the principle also sometimes known as _The Heisenberg Effect_.