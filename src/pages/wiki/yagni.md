---
name: YAGNI
templateKey: wiki
published: true
wikicategory: Design Principles
wikitags: null
prerequisites: null
date: '2019-04-10T00:05:26-04:00'
updated: '2019-04-10T00:11:26-04:00'
image: null
plaindescription: "'You aren't gonna need it'"
---

A design principle from Extreme Programming (XP) that states that a programmer shouldn't add any functionality **until it's actually necessary**.

Ron Jeffries, one of the founders of XP wrote that programmers should "**always implement things when you actually need them, never when you forsee that you need them**" and "do the simplest possible thing that will work". 

## <i class="far fa-smile"></i> Why is it useful?

- This can help you iterate really quickly.
- It helps prevent design fatigue or fear of a large all-encompassing up-front design.

## But!

YAGNI is meant to be combined with **continuous refactoring**, automated unit testing and continuous integration.

Failure to refactor code early could require huge amounts of **technical dept** and **rework**.

Thereforer, in order to do YAGNI well, developers first need to know how to:

- write code that's testable
- run automated tests

Learning the [SOLID principles](/articles/solid-principles/solid-typescript/) and how to refactor are a good start on how to be successful with YAGNI.

