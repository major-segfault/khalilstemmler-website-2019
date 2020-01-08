---
templateKey: blog-post
title: "All about TypeScript Static Members | TypeScript OOP"
date: '2019-07-07T10:04:10-05:00'
updated: '2019-07-07T10:04:10-05:00'
description: >-
  In this blog post, I explain the static keyword and when you might want to make attributes and methods a member of the class, rather than an instance of the class.
tags:
  - Static classes
  - TypeScript
  - Software Design
category: TypeScript
published: true
displayInArticles: false
image: /img/blog/templates/banners/typescript-blog-banner.png
---


In Object-Oriented Programming, <u>we write a lot of _classes_</u>.

Classes contain _properties_ (**methods** and **attributes**) which hold variables and operations.

Every time we define the properties of a class, they are said to belong to either:

- an _instance_ of the class (an object created via constructor) OR
- the class _itself_ (we call this a class member)

_What do we mean by that?_

How can properties belong to only the _instance_ vs. only the _class_?

When we choose to use or omit the `static` keyword, it changes who the properties belong to.

Let's look at regular usage without the `static` keyword.

## Regular usage (properties belong to the instance)

Normally, when we define properties on a class, the only time they can be _accessed_ is **after** we've created an instance of that class or if we use `this` to refer to the properties that will eventually reside on an instance of the object.

Take this early example from [White Label](https://github.com/stemmlerjs/white-label). 

```typescript
type Genre = 'rock' | 'pop' | 'electronic' | 'rap'

class Vinyl {
  public title: string;
  public artist: string;
  public genres: Genre[];

  constructor (title: string, artist: string, genres: Genre[]) {
    this.title = title;
    this.artist = artist;
    this.genres = genres;
  } 

  public printSummary (): void {
    console.log(`${this.title} is an album by ${this.artist}`);
  }
}

const vinyl = new Vinyl('Goo', 'Sonic Youth', ['rock']);
console.log(vinyl.title)    // 'Goo'
console.log(vinyl.artist)   // 'Sonic Youth'
console.log(vinyl.genres)   // ['rock']
vinyl.printSummary();	      // 'Goo is an album by Sonic Youth'
```

Each of the methods (`printSummary(): void`) and attributes (`title`, `artist`, `genres`) on the `Vinyl` class are said to belong to an _instance_ of the class.

In the example, we were only able to access the properties `title`, `artist` and `genres` directly from the object _after_ it was created.

```typescript
console.log(vinyl.title)    // This is valid!
```

Also note that when we use `printSummary(): void`, we can access `title` and `artist` using the `this` keyword:

```typescript
class Vinyl {
  ...
  public printSummary (): void {
    console.log(`${this.title} is an album by ${this.artist}`);
  }
}
```

That works because at this point, the resulting object / instance of `Vinyl` owns those properties.

If we check out [TypeScript Playground](http://www.typescriptlang.org/play/), we can look at the compiled JavaScript for this code sample:

```javascript
"use strict";
class Vinyl {
  constructor(title, artist, genres) {
    this.title = title;
    this.artist = artist;
    this.genres = genres;
  }
  printSummary() {
    console.log(`${this.title} is an album by ${this.artist}`);
  }
}

const vinyl = new Vinyl('Goo', 'Sonic Youth', ['rock']);
console.log(vinyl.title); // 'Goo'
console.log(vinyl.artist); // 'Sonic Youth'
console.log(vinyl.genres); // ['rock']
vinyl.printSummary(); // 'Goo is an album by Sonic Youth'
```

The resulting JavaScript looks _nearly identical_.

Let's talk a bit about what happens when the properties are owned by the _class_.

## Static properties (properties belong to the class)

When we use the `static` keyword on properties we define on a class, they belong to _the class itself_. 

That means that we <u>cannot</u> access those properties from an instance of the class.

We can only access the properties directly by referencing the class itself.

To demonstrate, let's add a counter `NUM_VINYL_CREATED` that increments the number of times that a `Vinyl` was created.

```typescript
type Genre = 'rock' | 'pop' | 'electronic' | 'rap'

class Vinyl {
  public title: string;
  public artist: string;
  public genres: Genre[];
  public static NUM_VINYL_CREATED: number = 0;

  constructor (title: string, artist: string, genres: Genre[]) {
    this.title = title;
    this.artist = artist;
    this.genres = genres;

	Vinyl.NUM_VINYL_CREATED++;        // increment number of vinyl created
    console.log(Vinyl.NUM_VINYL_CREATED)  
  } 

  public printSummary (): void { 
    console.log(`${this.title} is an album by ${this.artist}`);
  }
}

let goo = new Vinyl ('Goo', 'Sonic Youth', ['rock']);
// prints out 1

let daydream = new Vinyl ('Daydream Nation', 'Sonic Youth', ['rock']);
// prints out 2
```

Because the properties can only be accessed through the class by referring to the _class name_ itself, we **can't access static properties** through an _instance_ like so:

```typescript
let goo = new Vinyl ('Goo', 'Sonic Youth', ['rock']);
goo.MAX_GENRES_PER_VINYL    // Error
goo.NUM_VINYL_CREATED       // Error
```

You might have heard of a term called **Class Members**. An attribute or a method is a _class member_ because they can ONLY be accessed through the class itself; therefore, they're members of the class.

```typescript
class Vinyl {

  /**
   * Example "Class Member" (sometimes known as 
   * "Static Class Member") variable.
   * 
   * Can only be accessed through mentioning the class name
   * itself:
   * 
   * Example: const vinylCreatedToDate = Vinyl.NUM_VINYL_CREATED;
   */

  public static NUM_VINYL_CREATED: number = 0; 

  /**
   * Example "Instance Member" variable.
   * 
   * Can only be accessed through an instance/object created from 
   * this class.
   * 
   * Example: 
   *  
   *  const blueAlbum = new Vinyl("Blue Album");
   *  console.log(blueAlbum.title); // "Blue Album"
   */

  public title: string;

  constructor (title: string) {
    this.title = title;
  }
}
```

<p class="caption">The different types of <i>member variables</i> that can appear on a class.</p>

That's great and all, but _when would you want to use static properties?_

## How to know when to use static properties

Before you add that attribute or method, ask yourself:

> Will this property ever need to be used by another class, without first needing to create an object of it?

In other words, should I need to call it on an **object** created by this class or not? If yes, then continue normally. 

If no, then you might want to make a `static` member.

### Scenarios where it could make sense to use a static property

- to check a business rule or constraint from another class
- to implement a `factory method` to [encapsulate the complexity](/articles/typescript-value-object/) required in order to create an instance of the class
- to use an `abstract factory` in order [to create a specific type of instance of the class](/wiki/abstract-factory/)
- when the property shouldn't ever change

### Scenarios where it _seems like_ it might make sense but actually leads to an [anemic domain model](/wiki/anemic-domain-model/):

- to perform validation logic on atttributes for that class (use [Value Objects](/articles/typescript-value-object/) instead)

To demonstrate a worthwhile scenario, let's add a `static` `MAX_GENRES_PER_VINYL` attribute to "document a constraint" that a `Vinyl` may only have at max 2 different types of `Genres`. 

```typescript
type Genre = 'rock' | 'pop' | 'electronic' | 'rap'

class Vinyl {
  public title: string;
  public artist: string;
  public genres: Genre[];
  public static MAX_GENRES_PER_VINYL: number = 2;

  constructor (title: string, artist: string, genres: Genre[]) {
    this.title = title;
    this.artist = artist;
    this.genres = genres;
  }

  public printSummary (): void { 
    console.log(`${this.title} is an album by ${this.artist}`);
  }
}
```

And then let's add an `addGenre(genre: Genre): void` method to enforce this business rule.

```typescript 
type Genre = 'rock' | 'pop' | 'electronic' | 'rap'

class Vinyl {
  public title: string;
  public artist: string;
  public genres: Genre[];
  public static MAX_GENRES_PER_VINYL: number = 2;

  constructor (title: string, artist: string, genres: Genre[]) {
    this.title = title;
    this.artist = artist;
    this.genres = genres;
  }

  public addGenre (genre: Genre): void {
    // Notice that in order to reference the value, we have go through the class
    // itself (Vinyl), not through an instance of the class (this).
    const maxLengthExceeded = this.genres.length >= Vinyl.MAX_GENRES_PER_VINYL;
    const alreadyAdded = this.genres.filter((g) => g === genre).length !== 0;

    if (!maxLengthExceeded && !alreadyAdded) {
      this.genres.push(genre);
    }
  }

  public printSummary (): void { 
    console.log(`${this.title} is an album by ${this.artist}`);
  }
}
```






