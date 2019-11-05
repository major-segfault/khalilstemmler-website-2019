---
templateKey: article
title: "Implementing DTOs, Mappers & the Repository Pattern using the Sequelize ORM [with Examples] - DDD w/ TypeScript"
date: '2019-06-20T10:04:10-05:00'
updated: '2019-06-20T10:04:10-05:00'
description: >-
  There are several patterns that we can utilize in order to handle data access concerns in Domain-Driven Design. In this article, we talk about the role of DTOs, repositories & data mappers in DDD.
tags:
  - DDD
  - TypeScript
  - Software Design
category: Domain-Driven Design
image: /img/blog/ddd/data-access.png
published: true
---

<p class="course-cta">
This is part of the <a href="/courses/domain-driven-design-typescript">Domain-Driven Design w/ TypeScript & Node.js</a> course. Check it out if you liked this post.
</p>

_Also from the **[Domain-Driven Design with TypeScript](/articles/categories/domain-driven-design/)** series_.

In Domain-Driven Design, there's a _correct tool_ for every possible thing that needs to happen in the development of an object-modeled system.

What's responsible for handling validation logic? _Value Objects_.

Where do you handle handle domain logic? As close to the _Entity_ as possible, otherwise _domain services_.

Perhaps one of the hardest aspects towards learning DDD is being able to determine _just what that tool is_ needed for the particular task.

In DDD, the **Repositories**, **Data Mappers** and **DTOs** are a [critical part of the entity lifecycle](/articles/typescript-domain-driven-design/entities/) that enable us to **store**, **reconsitute** and **delete** domain entities.

This type of logic is called "_Data Access Logic_".

For developers coming from building [REST-ful CRUD APIs using MVC](/articles/typescript-domain-driven-design/ddd-vs-crud-design/) without much attention to encapsulating ORM data access logic, you'll learn:

<ul class="aside">
  <li>problems that occur when we don't encapsulate ORM data access logic</li>
  <li>how DTOs can be used to stabilize an API</li>
  <li>how Repositories act as a facade over complex ORM queries</li>
  <li>approaches to creating repositories and</li>
  <li>how Data Mappers can be used to translate to and from DTOs, Domain Entities and ORM models</li>
</ul>

---

## How do we usually use ORM models in MVC apps?

In a [previous article about MVC](/articles/enterprise-typescript-nodejs/when-crud-mvc-isnt-enough/), we looked at some of the most common approaches to utilizing ORMs like [Sequelize](http://docs.sequelizejs.com/).

Take this simple `controller` where we create a `User`.

```typescript
class UserController extends BaseController {
  async exec (req, res) => {
    try {
      const { User } = models;
      const { username, email, password } = req.body;
      const user = await User.create({ username, email, password });
      return res.status(201);
    } catch (err) {
      return res.status(500);
    }
  }
}
```

We agreed that the benefits of this approach were that:

- this code is incredibly easy to read
- on small projects, this approach makes it easy to quickly become productive 

However, as our applications grow and get more complex, this approach leads to several drawbacks _which may introduce bugs_.

Summarizing [what we spoke about last time](/articles/enterprise-typescript-nodejs/when-crud-mvc-isnt-enough/), the main reason why it's problematic is because there's a <u>lack of a separation of concerns</u>. This block of code is responsible for too many things:

- handling the API request ([controller](/articles/enterprise-typescript-nodejs/clean-consistent-expressjs-controllers/) responsibility)
- performing validation on the domain object (not present here, but a [domain entity](/articles/typescript-domain-driven-design/entities/) or [value object](/articles/typescript-value-object/) responsibility)
- persisting a domain entity to the database (repository responsibility)

When we add more and more code to our project, it becomes really important that we pay attention to assigning [singular responsibility](/articles/solid-principles/single-responsibility/) to our classes. 

## Scenario: Returning the same view model in 3 separate API calls

Here's an example where lack of encapsulation towards how we **retrieve data from ORMs** may lead to introducing bugs. 

Let's say we were working on our [Vinyl Trading app](https://github.com/stemmlerjs/white-label) and we're tasked with creating 3 different API calls.

```
GET /vinyl?recent=6         - GET the 6 newest listed vinyl
GET /vinly/:vinylId/        - GET a particular vinyl by it's id
GET /vinyl/owner/:userId/   - GET all vinyl owned by a particular user
```

In each of these API calls, we need to return `Vinyl` view models [^1].

So let's do the first controller: returning recent vinyl.

```typescript
export class GetRecentVinylController extends BaseController {
  private models: any;

  public constructor (models: any) {
    super();
    this.models = models;
  }

  public async executeImpl(): Promise<any> {
    try {
      const { Vinyl, Track, Genre } = this.models;
      const count: number = this.req.query.count;

      const result = await Vinyl.findAll({
        where: {},
        include: [
          { owner: User, as: 'Owner', attributes: ['user_id', 'display_name'] },
          { model: Genre, as: 'Genres' },
          { model: Track, as: 'TrackList' },
        ],
        limit: count ? count : 12,
        order: [
          ['created_at', 'DESC']
        ],
      })

      return this.ok(this.res, result);
    } catch (err) {
      return this.fail(err);
    }
  }
}
```

OK. Not bad. If you're familiar with Sequelize, this is probably pretty standard for you.

Now let's implement getting vinyl by its `id`.

```typescript
export class GetVinylById extends BaseController {
  private models: any;

  public constructor (models: any) {
    super();
    this.models = models;
  }

  public async executeImpl(): Promise<any> {
    try {
      const { Vinyl, Track, Genre } = this.models;
      const vinylId: string = this.req.params.vinylId;

      const result = await Vinyl.findOne({
        where: { 
          vinyl_id: vinylId
        },
        include: [
          { model: User, as: 'Owner', attributes: ['user_id', 'display_name'] },
          { model: Genre, as: 'Genres' },
          { model: Track, as: 'TrackList' },
        ]
      })

      return this.ok(this.res, result);
    } catch (err) {
      return this.fail(err);
    }
  }
}
```

Not too much is different between those two classes, eh? 😅

So this is definitely not following the DRY principle, because we've repeated a lot here.

And you can expect that the 3rd API call is going to be somewhat similar to this.

So far, the main problem that we're noticing is:

> code duplication

While that's bad, because if we were to need to add a new _relationship_ to this model (like `Label`), we'd have to _remember to_ scan through our code, locate each `findOne()` and `findAll()` for the `Vinyl` model, and add the new `{ model: Label, as: 'Label' }` to our `include` array, it's not the worst aspect to this.

There's another problem on the brewing on the horizon...

> Lack of data consistency

Notice how we're passing back the ORM query results directly? 

```typescript
return this.ok(this.res, result);
```

That's what's going back out to the client in response to the API calls.

Well, what happens when we perform **migrations**  on the database and add new columns? Worse- what happens when we remove a column or _change_ the name of a column?

> We've just broken the API for each client that depended on it.

Hmm... we need a tool for this. 

Let's reach into our enterprise toolbox and see what we find...

Ah, the **DTO (Data Transfer Object)**.

## Data Transfer Objects

Data Transfer Objects are a (fancy) term for an **object that carries data between two separate systems**.

When we're concerned with web development, we think of DTOs as **View Models** because they're faux models. They're not really the REAL domain models, but they contain as much data that the view needs to know about.

For example, the `Vinyl` view model / DTO could be built up to look like this:

```typescript
type Genre = 'Post-punk' | 'Trip-hop' | 'Rock' | 'Rap' | 'Electronic' | 'Pop';

interface TrackDTO {
  number: number;
  name: string;
  length: string;
}

type TrackCollectionDTO = TrackDTO[];

// Vinyl view model / DTO, this is the format of the response
interface VinylDTO {
  albumName: string;
  label: string;
  country: string;
  yearReleased: number;
  genres: Genre[];
  artistName: string;
  trackList: TrackCollectionDTO;
}
```

The reason why this is so powerful is because we've just <u>standardized our API response structure</u>.

Our DTO is a **data contract**. We're telling anyone who uses this API, "hey, this is going to be the format that you can always expect to see from this API call". 

Here's what I mean. Let's look at how we could use this in the example of retrieving Vinyl by id.

```typescript
export class GetVinylById extends BaseController {
  private models: any;

  public constructor (models: any) {
    super();
    this.models = models;
  }

  public async executeImpl(): Promise<any> {
    try {
      const { Vinyl, Track, Genre, Label } = this.models;
      const vinylId: string = this.req.params.vinylId;

      const result = await Vinyl.findOne({
        where: {},
        include: [
          { model: User, as: 'Owner', attributes: ['user_id', 'display_name'] },
          { model: Label, as: 'Label' },
          { model: Genre, as: 'Genres' }
          { model: Track, as: 'TrackList' },
        ]
      });

      // Map the ORM object to our DTO
      const dto: VinylDTO = {
        albumName: result.album_name,
        label: result.Label.name,
        country: result.Label.country,
        yearReleased: new Date(result.release_date).getFullYear(),
        genres: result.Genres.map((g) => g.name),
        artistName: result.artist_name,
        trackList: result.TrackList.map((t) => ({
          number: t.album_track_number,
          name: t.track_name,
          length: t.track_length,
        }))
      }

      // Using our baseController, we can specify the return type
      // for readability.
      return this.ok<VinylDTO>(this.res, dto)
    } catch (err) {
      return this.fail(err);
    }
  }
}
```

That's great, but let's think about the responsibility of this class now.

This is a `controller`, but it's responsible for:

- defining the how to map persisted ORM models to `VinylDTO`, `TrackDTO`, and `Genres`.
- defining just how much data needs to get retrieved from the Sequelize ORM call in order to successfully create the DTOs.

That's quite a bit more than `controllers` should be doing.

Let's look into **Repositories** and **Data Mappers**.

We'll start with Repositories.

## Repositories

As we mentioned earlier, the **Repository** is a [critical part of the entity lifecycle](/articles/typescript-domain-driven-design/entities/) that enables us to **store**, **reconsitute** and **delete** domain entities.

> Repositories are Facades to persistence technologies (such as ORMs)

A **Facade** is some design pattern lingo that refers to an object that provide a _simplified_ interface to a larger body of code. In _our_ case, that larger body of code is **domain entity persistence** and  **domain entity retrieval** logic.

### The role of repositories in DDD & clean architecture

In DDD & clean architecture, repositories are [infrastructure-layer](/articles/enterprise-typescript-nodejs/clean-nodejs-architecture/) concerns.

Generally speaking, we said that repos **persist** and **retrieve** domain entities.

#### Persistence objectives

- Scaffold complex persistence logic across [junction](/articles/sequelize-tags-junction-pattern/) and relationship tables.
- Rollback transactions that fail
- On `save()`, check if the entity already exists and then perform the create or update.

With respect to doing the "create if not exists, else update", that's the type of complex data access logic that we don't want any other constructs in our domain to have to know about: only the repos should care about that.

#### Retrieval objectives

We've seen a little bit of this but the goals are ultimately to:

- Retrieve the entirety of data needed to create domain entities
  - ie: we've seen this with choosing what to `include: []` with Sequelize in order to create DTOs and Domain Objects.

- Delegate the responsibility of _reconsituting_ entities to a `Mapper`.

### Approaches to writing repositories
There are several different approaches to creating repositories in your application. 

#### Generic Repository Interface

You could create a generic repository interface, defining all kinds of common things that you'd have to do to a model like `getById(id: string)`, `save(t: T)` or `delete(t: T)`.

```typescript
interface Repo<T> {
  exists(t: T): Promise<boolean>;
  delete(t: T): Promise<any>;
  getById(id: string): Promise<T>;
  save(t: T): Promise<any>;
}
```

It's a good approach in the sense that we've defined a common way for repositories to be created, but we might end up seeing the details of the data access layer leaking into calling code. 

The reason for that is because saying `getById` is feels like of _cold_. If I was dealing with a `VinylRepo`, I'd prefer to say `getVinylById` because it's a lot more descriptive to the **Ubiquitous Language** of the domain. And if I wanted all the vinyl owned by a particular user, I'd say `getVinylOwnedByUserId`. 

Having methods like `getById` is pretty [YAGNI](/wiki/yagni/).

That leads us into my preferred way to create repos.

#### Repositories by entity / database table

I like being able to quickly add convience methods that make sense to the domain that I'm working in, so I'll usually start with a slim **base** repository:

```typescript
interface Repo<T> {
  exists(t: T): Promise<boolean>;
  delete(t: T): Promise<any>;
  save(t: T): Promise<any>;
}
```

And then extend that with additional methods that say more about the domain.

```typescript
export interface IVinylRepo extends Repo<Vinyl> {
  getVinylById(vinylId: string): Promise<Vinyl>;
  findAllVinylByArtistName(artistName: string): Promise<VinylCollection>;
  getVinylOwnedByUserId(userId: string): Promise<VinylCollection>;
}
```

_The reason why it's benefitial to always define repositories as interfaces first is because it adheres to the [Liskov Subsitution Principle](/articles/solid-principles/solid-typescript/) (which  enables concretions to be substituted), and it enables the concretions to be [Dependency Injected](/articles/solid-principles/solid-typescript/) (think being able to mock a Sequelize Repo for a in-memory JSON one for unit tests)!_

Let's go ahead and create a [concrete class](/wiki/concrete-class/) of our `IVinylRepo`.

```typescript
import { Op } from 'sequelize'
import { IVinylRepo } from './IVinylRepo';
import { VinylMap } from './VinyMap';

class VinylRepo implements IVinylRepo {
  private models: any;

  constructor (models: any) {
    this.models = models;
  }

  private createQueryObject (): any {
    const { Vinyl, Track, Genre, Label } = this.models;
    return { 
      where: {},
      include: [
        { model: User, as: 'Owner', attributes: ['user_id', 'display_name'], where: {} },
        { model: Label, as: 'Label' },
        { model: Genre, as: 'Genres' },
        { model: Track, as: 'TrackList' },
      ]
    }
  }

  public async exists (vinyl: Vinyl): Promise<boolean> {
    const VinylModel = this.models.Vinyl;
    const result = await VinylModel.findOne({ 
      where: { vinyl_id: vinyl.id.toString() }
    });
    return !!result === true;
  }

  public delete (vinyl: Vinyl): Promise<any> {
    const VinylModel = this.models.Vinyl;
    return VinylModel.destroy({ 
      where: { vinyl_id: vinyl.id.toString() }
    })
  }

  public async save(vinyl: Vinyl): Promise<any> {
    const VinylModel = this.models.Vinyl;
    const exists = await this.exists(vinyl.id.toString());
    const rawVinylData = VinylMap.toPersistence(vinyl);

    if (exists) {
      const sequelizeVinyl = await VinylModel.findOne({ 
        where: { vinyl_id: vinyl.id.toString() }
      });

      try {
        await sequelizeVinyl.update(rawVinylData);
        // scaffold all of the other related tables (VinylGenres, Tracks, etc)
        // ...
      } catch (err) {
        // If it fails, we need to roll everything back this.delete(vinyl);
      }
    } else  {
      await VinylModel.create(rawVinylData);
    }

    return vinyl;
  }

  public getVinylById(vinylId: string): Promise<Vinyl> {
    const VinylModel = this.models.Vinyl;
    const queryObject = this.createQueryObject();
    queryObject.where = { vinyl_id: vinyl.id.toString() };
    const vinyl = await VinylModel.findOne(queryObject);
    if (!!vinyl === false) return null;
    return VinylMap.toDomain(vinyl);
  }

  public findAllVinylByArtistName (artistName: string): Promise<VinylCollection> {
    const VinylModel = this.models.Vinyl;
    const queryObject = this.createQueryObject();
    queryObjectp.where = { [Op.like]: `%${artistName}%` };
    const vinylCollection = await VinylModel.findAll(queryObject);
    return vinylCollection.map((vinyl) => VinylMap.toDomain(vinyl));
  }

  public getVinylOwnedByUserId(userId: string): Promise<VinylCollection> {
    const VinylModel = this.models.Vinyl;
    const queryObject = this.createQueryObject();
    queryObject.include[0].where = { user_id: userId };
    const vinylCollection = await VinylModel.findAll(queryObject);
    return vinylCollection.map((vinyl) => VinylMap.toDomain(vinyl));
  }
}
```

See that we've encapsulated our sequelize data access logic? We've removed the need for repeatedly writing the `include`s because all ofthe **required** include statements are here now.

We've also referred to a `VinylMap`. Let's take a quick look at the responsibility of a **Mapper**.

## Data Mappers

The responsibility of a **Mapper** is to make all the transformations:

- From Domain to DTO
- From Domain to Persistence
- From Persistence to Domain

Here's what our `VinylMap` might look like:

```typescript
class VinylMap extends Mapper<Vinyl> {
  public static toDomain (raw: any): Vinyl {
    const vinylOrError = Vinyl.create({
      albumName: AlbumName.create(raw.album_name).getValue(),
      artistName: ArtistName.create(raw.artist_name).getValue(),
      tracks: raw.TrackList.map((t) => TrackMap.toDomain(t))
    }, new UniqueEntityID(raw.vinyl_id));
    return vinylOrError.isSuccess ? vinylOrError.getValue() : null;
  }

  public static toPersistence (vinyl: Vinyl): any {
    return {
      album_name: vinyl.albumName.value,
      artist_name: vinyl.artistName.value
    }
  }

  public static toDTO (vinyl: Vinyl): VinylDTO {
    return {
      albumName: vinyl.albumName.value,
      label: vinyl.Label.name.value,
      country: vinyl.Label.country.value
      yearReleased: vinyl.yearReleased.value,
      genres: vinyl.Genres.map((g) => g.name),
      artistName: vinyl.aristName.value,
      trackList: vinyl.tracks.map((t) => TrackMap.toDTO(t))
    }
  }
}
```

OK, now let's go back and refactor our controller from earlier using our `VinylRepo` and `VinylMap`.

```typescript
export class GetVinylById extends BaseController {
  private vinylRepo: IVinylRepo;

  public constructor (vinylRepo: IVinylRepo) {
    super();
    this.vinylRepo = vinylRepo;
  }

  public async executeImpl(): Promise<any> {
    try {
      const { VinylRepo } = this;
      const vinylId: string = this.req.params.vinylId;
      const vinyl: Vinyl = await VinylRepo.getVinylById(vinylId);
      const dto: VinylDTO = VinylMap.toDTO(vinyl);
      return this.ok<VinylDTO>(this.res, dto)
    } catch (err) {
      return this.fail(err);
    }
  }
}
```

Much. Cleaner. And. Singularly. Responsible.

--- 

## Conclusion

In this article, we took an in-depth look at **DTOs**, **Repositories** and **Data Mappers** which all have their own single responsibility in the  infrastructure layer.

### The _actual_ repo

If you'd like to see some real life code, all of the code that was used in this article can be found in the my Vinyl Trading app (Node.js + TypeScript + Sequelize + Express) that I'm working on for the upcoming DDD course. Check it out here:

- [https://github.com/stemmlerjs/white-label](https://github.com/stemmlerjs/white-label)

---

<p class="course-cta">
This is part of the <a href="/courses/domain-driven-design-typescript">Domain-Driven Design w/ TypeScript & Node.js</a> course. Check it out if you liked this post.
</p>

[^1] View models are _essentially_ the same thing as DTOs (Data Transfer Objects).