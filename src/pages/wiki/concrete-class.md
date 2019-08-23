---
name: Concrete class
templateKey: wiki
published: true
wikicategory: Object-oriented design
wikitags: null
prerequisites: null
date: '2019-01-24T00:05:26-04:00'
updated: '2019-04-04T00:05:26-04:00'
image: /img/wiki/concrete-classes/concrete-classes.svg
plaindescription: Classes that are complete with fully implemented methods.
---

The name kinda makes sense. It's called a **concrete class** because:

1. it can't be extended/subclassed by another class
2. it has complete methods defined

And code is essentially like concrete, 

>> Once it's been written, it takes effort to change.

Concrete classes can also **implement interfaces** and **extend abstract classes**. 

We call the class a _complete_ concrete class when it:

- In the case of implementing an interface, fully implements the properties and methods.
- In the case of extending an abstract class, implements the abstract methods. 

Another thing to note is that <u>concrete classes can be instantiated</u> and objects can be created from it. 

We <u>cannot</u> directly instantiate an abstract class or an interface.

Beginners to object-oriented design often write the majority of their code in concrete classes, unaware of how to take advantage of abstractions to create better designs.

## Examples

Let's use animals to illustrate.

## Concrete class in TypeScript (raw)

```typescript

// Raw concrete class

class Animal {
  public color: Color;
  public isHungry: boolean;
  constructor (color: Color) {
    this.color = color;
  }

  // We're making a lot of assumptions about the type of
  // animal that this is going to be, with a lack of abstraction.
  // Do hamster's hunt? 🤔 (youtube that and let me know)
  hunt (): void {
    if (this.isHungry) {
      // Hunt stuff so you can eat it
    }
  }

  makeNoise (): string {
    // Weird noise for an animal to be making... 🤔
    return "Yeedle yeedle yeedle!"
  }
}

```

This example shows a very basic concrete class. We probably should have included some abstractions here so that we can get really specific with the types of animals that we can create. It would also help to impose constraints on the types of behaviours that some animals may or may not have.

## Concrete class in TypeScript (implementing an interface and abstract class)

```typescript

type Color = 'blue' | 'red' | 'green'

enum HunterSkillLevel {
  Novice,
  Skilled,
  Master
}

// Any class implementing this, be it an Animal, Person,
// Robot, etc.. needs to have these methods and properties.

interface IHunter {
  skillLevel: HunterSkillLevel;
  hunt (): void;
}

// Animal is an abstract class now. It can't be instantiated directly. 
// But, it does allow for us to subclass it and create lots of different
// types of animals from it.

abstract class Animal {
  
  protected color: Color;
  
  constructor (color: Color) {
    this.color = color;
  }

  // makeNoise should be implemented by any Animal subclass.
  abstract makeNoise () : string;
}

// Wolf concrete class.
// 
// The concrete class fully implements the requirements
// of the Animal abstract class by implementing the makeNoise method.
// 
// It also fully implements the requirements of the IHunter
// interface by including the HunterSkillLevel and implementing the
// hunt method.
//
// We can instantiate this directly.

class Wolf extends Animal implements IHunter {
  public skillLevel: HunterSkillLevel;

  constructor (color: Color, skillLevel: HunterSkillLevel) {
    super(color);

    this.skillLevel = skillLevel;
  }

  hunt (): void {
    // Get mean
  }

  makeNoise (): string {
    return "Arooooooooo"
  }
}

// Finally, we can create objects from our concrete Wolf class.

const meanWolf = new Wolf('blue', HunterSkillLevel.Master);
const babyWolf = new Wolf('red', HunterSkillLevel.Novice);

```

<hr/>

## Depending on concrete classes

This is not normally desirable (see [Dependency Inversion](/wiki/dependency-inversion) and the [Open-Closed Principle](/articles/solid-principles/solid-typescript/)). We usually want to rely on interfaces or abstract classes; some form of abstraction. When we rely directly on concrete classes, our code can suffer some unfortunate design constraints.

### Negative effect of depending on concrete classes: Implementation lock-in

```typescript
/**
 * A concrete Stratocaster guitar class. 
 */

class Stratocaster {
  private color: string;
  constructor (color: string) {
    this.color = color;
  }

  // Actual sound a guitar makes
  play () {
    console.log('do-dee-do-do-drnrnr')
  }
}

/**
 * The musician plays a guitar. 
 */

class Musician {
  // We've specified that this musician HAS to play
  // a Stratocaster... so they can't even play a Jazzmaster
  // if they wanted to 😢
  private guitar: Stratocaster;

  // Inject a Stratocaster into the constructor.
  // Clearly we've missed an abstraction here.
  constructor (guitar: Stratocaster) {
    this.guitar = guitar;
  }
} 
```

In this TypeScript example, we kinda played ourselves. The only guitar that the Musician is able to play is the concrete Stratocaster. If we wanted Musicians to be able to play other guitars like, the Jazzmaster, for example- we'd have to re-implement all of the methods that the Stratocaster class did.

At the moment, it's not a big deal because Statocaster only has one method, ```play()```. But what happens over time when we add new functionality? It's not unrealistic to think that it might end up like this.

```typescript
class Stratocaster {
  private color: string;
  public pedals: IPedal[];
  private currentVolume: Volume;
  private currentTone: ITone;

  constructor (color: string, pedals: IPedal[]) {
    this.color = color;
  }

  play () : void {}
  getTuning () : Tuning {}
  setTuning (newTuning: Tuning) : void {}
  getVolumn () : Volume {}
  setVolume (newVolume: Volume) : void {}
  getTone () : ITone {}
  setTone (newTone: ITone) : void {}
  plugIn () : void {}
  isPluggedIn () : boolean;
  isAtMaxVolume () : boolean;
  getConnectedPedals () : IPedal[]
  connectPedal (pedal: IPedal) : void {}
  getGuitarInfo () : IGuitarMetaData {}
  changeStrings (strings: IStrings) : void {}
  ...
}
```

This isn't the best situation to be in. If you want to add that Jazzmaster as an option, you'd have to re-implement all of these methods in the Jazzmaster concrete class as well. 

A better design to use an [Abstract class](/blank?todo=abstract-class). 

```typescript
abstract class Guitar {
  private color: string;
  public pedals: IPedal[];
  private currentVolume: Volume;
  private currentTone: ITone;

  constructor (color: string, pedals: IPedal[] = []) {
    this.color = color;
    this.pedals = pedals 
  }

  play () : void {}
  getTuning () : Tuning {}
  setTuning (newTuning: Tuning) : void {}
  getVolumn () : Volume {}
  setVolume (newVolume: Volume) : void {}
  getTone () : ITone {}
  setTone (newTone: ITone) : void {}
  plugIn () : void {}
  isPluggedIn () : boolean;
  isAtMaxVolume () : boolean;
  getConnectedPedals () : IPedal[]
  connectPedal (pedal: IPedal) : void {}
  getGuitarInfo () : IGuitarMetaData {}
  changeStrings (strings: IStrings) : void {}
  ...
}

// Stratocaster has access to all of the properties and methods
// of guitar, defined in one place.
class Stratocaster extends Guitar {
  constructor (color: string) {
    super(color, [])
  }
}

// Jazzmaster does too!
class Jazzmaster extends Guitar {
  constructor (color: string) {
    super(color, [])
  }
}

```

We would also benefit from controlling creation of guitars through the use of an [Abstract Factory](/wiki/abstract-factory) as well.


<hr/>

<p class="aside">
In TypeScript- we actually CAN create objects directly from interfaces. 
We can do things like this: 

<code class="language-text">const khalil: Person = { name: 'Khalil', age: 23 }</code>

</p>

<p class="aside">
Where Person is an interface with required properties being "name" and "age".
</p>