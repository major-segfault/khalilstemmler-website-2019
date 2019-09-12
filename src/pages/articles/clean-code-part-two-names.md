---
templateKey: article
title: Clean Code Series - Naming things
date: '2019-01-24T00:05:26-04:00'
description: >-
  The second chapter of Clean Code talks about giving meaningful names
tags: 
  - Professionalism
  - Books
category: Software Design
image: /img/clean-grid.jpeg
published: false
---

Ultimately, when you name something- it should reveal it's intention.

Ultimately, we should try to use names that:

- are pronouncable
- are searchable via a text editor
- are meaningful and distinctly reveal the intention
- are understood by programmers, or if no computer science term exists, is domain specific and understood by someone in the problem domain
- free of prefixed of postfixed encodings
- free of "noise words" like `theAccount` or `anItem`.
- aren't "punny", "silly" or reliant on cultural references
- free of gratiutous context

## Context

Here's the idea that variables have context. In the book, we talk about if we saw the fields "city", "region", "state" and "address" together, we're able to generally assume that they have something to do with a location. But if we just saw the variable "state" alone, without context or awareness of the other variables- we probably wouldn't think of state with respect to location.

It's with that example that we understand that our variables need to have some context to them. That's a better example to prefix each variable with addrCity, addrRegion and so on...

Also, we can create a class where all of the variables within the class are contextual to that class.

This allows us to break up complex algorithms into classes that are way more readable.

**Gratuitous context** 

This is when we throw the problem domain or something at the front of the variable name, like `GSDAccountAddress`. It's not useful because when we want to use those methods elsewhere for different entities, we have to changet the variable name to make sense.