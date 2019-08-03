---
templateKey: article
title: "Over $85 billion spent on fixing bad code [bootcamps, junior devs, JavaScript, and software design principles]"
date: '2019-06-07T10:04:10-05:00'
updated: '2019-06-07T10:04:10-05:00'
description: >-
  More and more money is being spent by companies on maintaining bad JavaScript code. Here's where I think our industry needs to change.
tags:
  - Node.js
  - Software Design
  - JavaScript
category: Web Development
image: /img/blog/developer-principles/principles.jpeg
published: true
anchormessage: This article is part of the upcoming SOLID book. <a href="/resources/solid-nodejs-architecture">Get it, free</a>.
---

I came across an article recently from CNBC titled **[Tech's ultimate success: Software developers are now more valuable to companies than money](https://www.cnbc.com/2018/09/06/companies-worry-more-about-access-to-software-developers-than-capital.html)**. They summarized a few really important details that I think are relevant to us today.

> A majority of companies say lack of access to software developers is a bigger threat to success than lack of access to capital. 

Truly, it’s a great time to be a software developer. We’re in demand. We’re essential to the success of a mass majority of companies. The fact is: <u>nearly every company is a software company</u>. And every company needs good developers.

> Still, companies are misusing their most important resource, with too many developers tied up in projects designed to prop up legacy systems and bad software, at a cost of $300 billion a year — $85 billion just dealing with bad code. Correctly deployed, the expertise of software developers could add $3 trillion to global GDP over the next decade. - CNBC (6 Sept. 2018)

$85 billion. That’s a lot of money spent on maintaining **bad software**.

Think about if you hired someone to build your house. You would hope that for what you pay, you get what you’re paying for. You'd also assume that you get the job done well, right?

Building a house is not much different than building an application in principle. 

We need to pay just as much attention to the **structure** _and_ the **details** (or [Policy and Details](/articles/enterprise-typescript-nodejs/clean-nodejs-architecture/) with respect to code). Failing to do that, we could end up with something very expensive to fix. 

Bad situations like that can really hurt (and sometimes _end_) companies. It's time we realize that **we're software craftspeople**. 

Yes, _it is important_ that we know how the tools work and how we can use them together. It’s also just as important that we have a **strong set of software design principles**. A _professional code of quality_. Something that we can refer back to will help us understand potentially bad (and expensive) code from good code.

> Principles > methodologies

Let's back it up a little bit.

## Where does all this bad code come from?
I think there are a variety of reasons why we’re dealing with this as an industry now.

### <a  class="anchor" name="JavaScript"></a>JavaScript is the superhero that it never wanted to be 

[JavaScript](/articles/javascript-vs-typescript/) has quickly become the most popular programming language on the planet. JavaScript itself, and the community are _amazing_. 

What initially drew me to JavaScript years ago was the fact that you could not only create useful software, but you could create interesting web experiences. From web apps to desktop apps, mobile apps, backends, serverless functions, graphics, AR/VR, digital audio processing, artificial intelligence, etc. JS has quickly become one of **the most sought after skills for developers** entering the industry.

But also, in the most lovable way possible...

> JavaScript is also kinda frankenstein.

Not only do JavaScript developers have to deal with the waltz of supporting non-modern browsers, but they've also had to deal with the language going through various syntax extensions, flavours, and the rise of necessary build  / transpiling tools (hint hint, TypeScript), and frameworks. 

It’s a necessary strife though, because no one saw how important JavaScript was going to be. 

### <a  class="anchor" name="Barriers-to-Entry"></a>JavaScript is fun and the barrier to entry is low for Junior Developers
Despite the mess, JavaScript is **fun** and producing something initially with JavaScript is a lot easier, thanks to the community ❤️ and the ecosystem.

I think that’s why a lot of junior developers (myself included, at one time) flock to it. 

I don't know about you but I hated Java in school. Red lines in my NetBeans and constantly being unable to progress to the next lines of code because the types were wrong pissed me off.

I hated that I had to define the type for everything. I hated the concept of generics and the fact that everything had to be a _class_. It made no sense to me. It was very annoying for someone starting out. 

When I discovered JavaScript and the fact that you could make generative art, music, and a myriad of other interesting web experiences in JS just using _functions_, I said _"forget classes"_ and went fully in on JavaScript.

I was able to achieve a level of dexterity with JavaScript that I was never able to achieve with Java, way faster than I could have imagined.

When I picked up my first JavaScript book from **Scotch.io** titled “The MEAN Stack”, I flew through it. 

Following the code examples, I was amazed that I was now able to build a full-stack web app.

> “I’m a full-stack developer.” That’s what I began telling myself and everyone around me.

It wasn’t until much later in the future when I worked on large 120k+ line Node.js projects and even larger React.js ones (compiled without Types) that I realized there _might have been a reason why Java was so hard_.

I was missing essential [software development & design principles](/articles/solid-principles/solid-typescript/).

Because I didn’t spend any time honing that, I made a lot of expensive messes when I got put on real-life projects.

### <a  class="anchor" name="Design-principles"></a>Bootcamps and schools are ushering developers out into the industry with a lack of design principles

Coding bootcamps have become really popular recently. They're arming their graduates with the skills in order to _write code that will work_. 

Unfortunately, some schools and bootcamps are failing to equip its graduates with best practices and design principles towards writing maintainable and flexible code.

I think part of the reason this is happening is because developers are learning loosely typed languages like JavaScript, and some aspects of writing clean [SOLID code](/articles/solid-principles/solid-typescript/), like [Interface Segregation Principle](/articles/solid-principles/solid-typescript/) are actually straight-up impossible with this language.

For front-end developers, I think we can get away without this.

But for anyone working with Node.js on the backend, I'd say knowing your SOLID principles are a **hard requirement**.

----

Another **bold** statement to make is that _if we understand the principles_, we can vet new trends in the industry and <u>make educated software design choices for ourselves</u>.

For example, there's a lot of hype around React Hooks and their utility.

![react hooks and context replaces redux](/img/blog/developer-principles/hooks.png)

- via [Tyler Mcginnis](https://www.instagram.com/p/Bx5aSqQgr7p/)

--- 

Business are concerned with exactly two things:

> Making money and saving money

The ability to write code that is performant, clean, and able to be changed **is so incredibly valuable to a business**.

If we're writing code that is going to **hard** or _impossible_ to be changed, then we're doing neither of those two things.

A lot of companies talk about _Agile Software Development_ and say they practice it. Well, <u>flexibility</u> is actually one of the primary requirements to doing Agile well.

### <a  class="anchor" name="Agile"></a>Agile requires fundamental software design skills

If you’re not familiar with Agile, it’s an alternative approach to developing software that fosters **iterative** improvements to code and detests a fully-fledged **up-front design**. The contrasting approach is **Waterfall** where you define everything upfront and stick to the script.

The main reason why **Agile** is such an attractive approach is because the iteration cycles are smaller. 

Because of this, we can _adapt_ to changes in project requirements (you can be 99.99% sure the requirements will be bound to change at some point).

Here are a few principles of Agile Software Development.

- Deliver customer satisfaction by delivering valuable software continuously
- Always accept change of requirements no matter how early or late in the project
- Deliver software that works within a shorter timescale
- Working software is the key measure of progress
- The agile process promotes sustainable development
- Continuous attention to excellence and quality in technical development and design boosts the agility

_from [luis-goncalves.com](https://luis-goncalves.com/what-is-agile-methodology/)_

So it's apparent that <u>knowing how to write maintainable and flexible code</u> is incredibly important. 

Check.

Makes sense. If you're a developer in 2019, you'll be doing Agile at some point. And if we're doing Agile, we can fully expect that the code is going to be going through a whole lot of **changes and improvements**.

What do we call that in software development? The process of improving existing code? _Refactoring_, right? 

The thing about refactoring code is that it’s **incredibly risky** if we don’t have tests.

https://twitter.com/unclebobmartin/status/1135130426673106944


Which leads me to my next observation.

### <a  class="anchor" name="TDD"></a>Developers struggle with writing tests
In a lot of Agile projects, tests don’t get written _at all_. I know this because <u>I’ve been that developer not writing tests</u>.

I believe this is largely because a) developers are under a time constraint to meet the sprint, and don’t have time to write tests afterwards, and b) a lot of developers haven’t <i>actually been trained</i> [how to write testable code](/articles/enterprise-typescript-nodejs/clean-nodejs-architecture/).

As Uncle Bob said, the blaring problem is that when no tests get written, it becomes incredibly risky to _refactor_ code later to add new features. 

It's even more risky if the _new_ features’ use cases cut through existing features. This can lead to a number of problems such as:

- large bodies of code that everyone is afraid to change
- a lack of encapsulation / anemic domain models
- non DRY code / repeated code (“helper” files and folders)

In Michael Feather’s book about dealing with Legacy Code, he says:

> “Legacy code is code without tests”.

So let's put that to bed. It is risky as hell to change code without tests.

### TDD (Test-Driven Development)
One of the most controversial trends to hit the industry has been TDD. It’s worked for some, and failed for many others. But the reason I think it fails is because sometimes we try to treat TDD as <u>law</u>.

#### Fallacy of a strict Red-Green-Refactor Loop

In TDD, there’s a concept of a **Red-Green-Refactor loop**. It goes like this.

**Red**: Write a failing test

**Green**: Write the code to make the test pass

**Refactor**: Refactor the code when needed in order to improve the design.

Don't treat this as a dogma. You don't have to execute TDD in this order to feel like you're doing it properly.

That’s not important. You don’t have to stick to the loop by the letter. 

What’s important is that you write the tests _while you code_ _(or before you code)_ in order to reap the benefits of TDD.

The primary benefit of doing this is that you know right away if your code is testable or not. And if it’s not, you can <u>take action right then and there</u> before you pour some concrete that is going to be hard for yourself and anyone else to change in the future.

Knowing how to write testable code can be taught. That’s one of the benefits of the [SOLID principles](/articles/solid-principles/solid-typescript/), and it aims to address that.

## Conclusion

- developers aren’t being taught the essential software design skills
- lots of companies are practicing agile
- practicing agile means constantly changing and refactoring code
- to refactor code, we need tests
- to write tests, we need to know how to write testable code

Do you see what I see? The first step to addressing this problem in our industry starts with popularizing good software design skills with JavaScript.

> In order to go fast, we need to go well.

