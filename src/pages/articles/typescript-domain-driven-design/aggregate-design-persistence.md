---
templateKey: article
title: "How to Design & Persist Aggregates - Domain-Driven Design w/ TypeScript"
date: '2019-07-24T10:04:10-05:00'
updated: '2019-08-16T10:04:10-05:00'
description: >-
  In this article, you'll learn how identify the aggregate root and encapsulate a boundary around related entities. You'll also learn how to structure and persist aggregates using the Sequelize ORM on White Label, the open-source Vinyl Trading app. 
tags:
  - DDD
  - TypeScript
  - Software Design
  - Aggregate Root
  - Aggregate
  - Sequelize
category: Domain-Driven Design
image: /img/blog/templates/banners/ddd-blog-banner.png
published: true
anchormessage: This article is part of the upcoming DDD + TypeScript course. <a href="/courses/domain-driven-design-typescript">Check it</a>.
---

<p class="course-cta">
This is part of the <a href="/courses/domain-driven-design-typescript">Domain-Driven Design w/ TypeScript & Node.js</a> course. Check it out if you liked this post.
</p>

_Also from the **[Domain-Driven Design with TypeScript](/articles/categories/domain-driven-design/)** series_.

---

_Can it be that it was all so simple then?_

Remember when our apps were simple? Remember we could make CRUD API calls to our backend to change the state of the application? We were able to do that simply by using our Sequelize or Mongoose ORM models directly from our controllers. 

Those were the good ol' days.

Look at us now. We're writing code that is pretty much a **software implementation** of the business. We're using Object-Oriented Programming principles to create **rich domain models**. 

The rules and concepts that exist in the business in _real life_ are now showing up in our code as [entities](/articles/typescript-domain-driven-design/entities/) and [value objects](/articles/typescript-value-object/). We're using [use cases](/articles/enterprise-typescript-nodejs/application-layer-use-cases/) to express what all the different **actors** (groups of users) in our system can do from within their respective subdomains.

> We're modeling software to solve **complex real life business problems**. 

## The challenge

A common recurring theme in software is **relationships**. 

A large part of programming (especially Object-Oriented Programming) is about relationships. By decomposing gargantuan problems into smaller classes and modules, we're able to tackle small pieces of that complexity in bite-sized chunks.

This decomposition is what we've been doing with **value objects** to <u>encapsulate validation logic</u>.

```typescript
interface GenreNameProps {
  value: string
}

/**
 * @class GenreName
 * @description The genre name class is a Value Object that encapsulates
 * the validation logic required to specify the name of a Genre.
 * @see Genre entity
 */

export class GenreName extends ValueObject<GenreNameProps> {
  private constuctor (props: GenreNameProps) {
    super(props);
  }

  public static create (name: string) : Result<GenreName> {
    const guardResult = Guard.againstNullOrUndefined(name, 'name');

    if (!guardResult.isSuccess) {
      return Result.fail<GenreName>(guardResult.error);
    }

    if (name.length <= 2 || name.length > 100) {
      return Result.fail<GenreName>(
        new Error('Name must be greater than 2 chars and less than 100.')
      )
    }

    return Result.ok<GenreName>(new Name({ value: name }));
  }
}
```

<p class="caption">Instead of just using a "string", we use a GenreName class to encapsulate the validation logic that a Genre's name must be between 2 and 100 characters.</p>

And we use **entities** to enforce model invariants, further decomposing the larger problem itself. 

```typescript
interface ArtistProps {
  genres: Genre[];
  name: string;
}

export class Artist extends Entity<ArtistProps> {
  public static MAX_NUMBER_OF_GENRES_PER_ARTIST = 5;

  private constructor (props: ArtistProps, id?: UniqueEntityId) : Artist {
    super(props, id);
  }

  get genres (): Genre[] {
    return this.props.genres;
  }

  ...

  /**
   * @method addGenre
   * @desc Notice this class encapsulates an important business rule about
   * the 1-many relationship between Artist and Genre. We can only add
   * a certain number of Genres to Artist.
   */

  addGenre (genre: Genre): Result<any> {
    if (this.props.genres.length >= Artist.MAX_NUMBER_OF_GENRES_PER_ARTIST) {
      return Result.fail<any>('Max number of genres reached')
    } 

    if (!this.genreAlreadyExists(genre)) {
      this.props.genres.push(genre)
    }

    return Result.ok<any>();
  }
}
```

<p class="caption">Invariant/business rule: An artist can only have at most 5 genres.</p>

As we define rules and constraints about how our isolated [Domain Layer](/articles/enterprise-typescript-nodejs/clean-nodejs-architecture/) entities are allowed to relate to each other (1-to-1, 1-to-many, many-to-many), and which operations are valid at which times, several questions are introduced:

> How do we (cascade and) save this cluster of entities to the database?

> How do we decide on boundaries for all these entities in the cluster?

> Do I need a repository for each of these entities?

In this article, I'll show you how we use **Aggregates** to create a boundary around a cluster of entities that we treat as a singular unit. I'll also show you how to persist them to a database.

## <a class="anchor" name="Aggregates"></a>What is an Aggregate?

The best definition of an aggregate comes from Eric Evans and his [DDD book](https://amzn.to/2K3B4og); in it, he says:

> An "aggregate" is a cluster of associated objects that we treat as a unit for the purpose of data changes." - Evans. 126

Let's break that apart a bit. 

An actual _aggregate_ itself is the **entire clump of objects** that are connected together.

Take the following (semi) complete `Vinyl` class from [White Label](https://github.com/stemmlerjs/white-label) - or see all the code [here](https://github.com/stemmlerjs/white-label).

```typescript

import { AggregateRoot } from "../../core/domain/AggregateRoot";
import { UniqueEntityID } from "../../core/domain/UniqueEntityID";
import { Result } from "../../core/Result";
import { Artist } from "./artist";
import { TraderId } from "../../trading/domain/traderId";
import { Guard } from "../../core/Guard";
import { VinylId } from "./vinylId";
import { VinylNotes } from "./vinylNotes";
import { Album } from "./album";

interface VinylProps {
  traderId: TraderId;
  artist: Artist;
  album: Album;
  vinylNotes?: VinylNotes;
  dateAdded?: Date;
}

export type VinylCollection = Vinyl[];

export class Vinyl extends AggregateRoot<VinylProps> {

  get vinylId(): VinylId {
    return VinylId.create(this.id)
  }

  get artist (): Artist {
    return this.props.artist;
  }

  get album (): Album {
    return this.props.album;
  }

  get dateAdded (): Date {
    return this.props.dateAdded;
  }

  get traderId (): TraderId {
    return this.props.traderId;
  }

  get vinylNotes (): VinylNotes {
    return this.props.vinylNotes;
  }

  private constructor (props: VinylProps, id?: UniqueEntityID) {
    super(props, id);
  }

  public static create (props: VinylProps, id?: UniqueEntityID): Result<Vinyl> {
    const propsResult = Guard.againstNullOrUndefinedBulk([
      { argument: props.album, argumentName: 'album' },
      { argument: props.artist, argumentName: 'artist' },
      { argument: props.traderId, argumentName: 'traderId' }
    ]);

    if (!propsResult.succeeded) {
      return Result.fail<Vinyl>(propsResult.message)
    } 

    const vinyl = new Vinyl({
      ...props,
      dateAdded: props.dateAdded ? props.dateAdded : new Date(),
    }, id);
    const isNewlyCreated = !!id === false;

    if (isNewlyCreated) {
      // TODO: Dispatch domain events 
    }

    return Result.ok<Vinyl>(vinyl);
  }
}
```

In White Label, `Vinyl` is posted by the `Trader` that owns it. `Vinyl` has a relationship to an `Artist` and a `Album`.

That means `Vinyl` has 3 different relationships to other entities.

- `Vinyl` belongs to (1-1) a `Trader`
- `Vinyl` has a (1-1) `Artist`
- `Vinyl` belongs to (1-1) an `Album`
- `Album` has many (1-m) `Genres`
- `Artist` has many (1-m) `Genres`

This relationship puts `Vinyl` in the middle and makes `Vinyl` the main entity in this clump: the **aggregate root**.

![Vinyl Aggregate - Domain-Driven Design TypeScript DDD](/img/blog/ddd-aggregates/aggregate-clump.svg)

- An **Aggregate** is the clump of related entities to treat as a unit for data changes.
- The **Aggregate Root** is the main entity that holds references to the other ones. It's the only entity in the clump that is used for direct lookup.

Hopefully, you're still with me and we have a better understanding of what **aggregates** actually _are_. 

We still have to talk about the **second** part of Evans' description about aggregates; particularly the part where he says that "we treat [them] as a unit for the purpose of data changes".

## <a class="anchor" name="Boundaries"></a>Figuring out boundaries

What's Evans talking about when he says we treat aggregates as a unit <u>for data changes</u>?

What are the data changes we're talking about?

Particularly the `CREATE`, `DELETE`, or `UPDATE`-like operations. We want to make sure that we don't allow anything illegal to the domain to leave a domain model corrupted.

OK, and where do these _data changes_ originate?

Data changes originate from the **use cases** our application fulfils. You know, the features. The app's _entire reason_ for **being**.

Take White Label again. We've identified the majority of the use cases today for the `Vinyl` entity (which we've determined is actually an Aggregate Root). 

Some of the use cases _make data changes_ to the database, and some of them simply `READ` from the database.

- `Catalog` Use cases on Vinyl in my personal catalog
  - `addVinyl`: add new existing vinyl
  - `createNewVinyl`: create new vinyl
  - `getRecommendations`: get recommendations based on vinyl currently in catalog
  - `getAllVinyl`: get all vinyl in catalog
  - `getVinylByVinylId`: get particular vinyl in catalog
  - `removeVinyl`: remove particular vinyl in catalog
  - `searchCatalogForVinyl`: search for vinyl in catalog
  - `updateVinyl`: update vinyl in catalog

- `Marketplace` Use cases on Vinyl in the public marketplace
  - `searchMarketplaceForVinyl`: search the marketplace for vinyl
  - `getRecommendationsByVinylId`: get recommendations based on other users that have this vinyl

Great, we know the use cases for `Vinyl`. Now what?

> We can design the aggregate such that it enables all of the use cases to be executed, while protecting any model invariants.

Ahh. And therein lies the trickiness. 

And therein also lies our <u>ability to determine aggregate boundaries</u>. **That's the goal** in aggregate design.

We define the boundaries such a way that all of `Vinyl`'s use cases can be performed, and enough information is provided within the boundary to ensure that that no operation breaks any business rules.

However, it turns out that that's not always the easiest thing to get right the very first time. 

Sometimes new business rules are introduced.

Sometimes new use cases are added.

Quite often, we end up being a bit off and have to make changes to our aggregate boundaries.

There are countless other essays, documents, books, resources, etc on effective aggregate design, and that's because it's so tricky to get right. There's a lot to consider.

## <a  class="anchor" name="Design-Considerations"></a>Things to consider in aggregate design

If our goals in designing aggregates are:

- Provide enough info to enforce model invariants within a boundary
- Execute use cases

Then we also have to consider what we might be doing to the database and our transactions in making overly large aggregate boundaries.

### Database / Transaction Performance

![Domain-Driven Design Aggregate Design Trade Offs - DDD TypeScript](/img/blog/ddd-aggregates/aggregate-design-tradeoffs.svg)

At this point with our boundaries on `Vinyl`, think about how many tables we need to join in order to retrieve a single `Vinyl`.

![Domain-Driven Design Aggregate Database View - DDD TypeScript](/img/blog/ddd-aggregates/aggregate-db.svg)

Let's add another goal to our aggregate design list:

- Provide enough info to enforce model invariants within a boundary
- Execute use cases
- **Ensure decent database performance**

### DTOs

There's also the case of DTOs. Quite often, we need to map a **Domain entity** to a **DTO / View Model** to return to the user.

In this case of `Vinyl` in White Label, we might need to return something like looks like this to the user:

![White Label - Domain Driven Design TypeScript DDD App - Wireframe #8](/img/blog/ddd-aggregates/WhiteLabelAddVinyl8.svg)

There's the actual `ArtistName`, the artwork, the `year` it was released and more.

Our DTO might need to look like the following in order to build this view on the frontend.

```typescript
interface GenreDTO {
  genre_id: string;
  name: string;
}

interface ArtistDTO {
  artist_id: string;
  name: string;
  artist_image: string;
  genres?: GenreDTO[];
}

interface AlbumDTO {
  name: string;
  yearReleased: number;
  artwork: string;
  genres?: GenreDTO[];
}

export interface VinylDTO {
  vinyl_id: string;
  trader_id: string;
  title: string;
  artist: ArtistDTO;
  album: AlbumDTO;
}
```

That realization might really force us ensure we include the entire `Artist` and `Album` entities inside the aggregate boundary for `Vinyl` because it _might make it easier_ for us to build API response DTOs.

That gives us another goal in aggregate design:

- Provide enough info to enforce model invariants within a boundary
- Execute use cases
- Ensure decent database performance
- (optional) **Provide enough info to transform a Domain Entity to a DTO**

The reason why this is an **optional** goal stems from the CQS (Command-Query Segregation) Principle.

### Command-Query Segregation

CQS says that any operation is either a `COMMAND` or a `QUERY`. 

So if a function performs a `COMMAND`, it has no return value (`void`), like so:

```typescript
// Valid
function createVinyl (data): void {
  ... // create and save
}

// Valid
function updateVinyl (vinylId: string, data): void {
  ... // update
}

// Invalid
function updateVinyl (vinylId: string, data): Vinyl {
  ... // update
}
```

When we make changes to our aggregates (`UPDATE`, `DELETE`, `CREATE`), we're performing `COMMAND`s.

In this scenario, we _need to have a complete aggregate_ pulled into memory in order to enforce any invariant rules before approving the `COMMAND` or rejecting it because some business rule isn't being satisfied.

OK. Makes sense. 

But queries are different. `QUERIES` simply **return a value** but also produce **absolutely no side-effects**.

```typescript
// Valid
function getVinylById (vinylId: string): Vinyl {
  // returns vinyl
}

// Invalid
function getVinylById (vinylId: string): Vinyl {
  const vinyl = this.vinylRepo.getVinyl(vinylId);

  await updateVinyl(vinyl) // bad, side-effect of a QUERY
  // returns vinyl
  return vinyl;
}
```

So in the context of DTOs, adding additional info to our aggregate for the sake of having them available for our DTOs has potential to hurt performance, don't do it.

DTOs can have a tight requirement to fulfill a user inferface, so instead of filling up an aggregate with all that info, just retrieve the data you need, directly from the repository/repositories to create the DTO.

---

Hopefully you're understanding that aggregate design takes a little bit of work. 

Like most things in software development, there's no free lunch. You have to consider the tradeoffs in simplicity vs. performance. 

I'll always recommend to start with simplicity and then address performance later if necessary.

## <a class="anchor" name="Example-Problem"></a>"Add Vinyl" Use Case

To get the hang of designing aggregates and persisting them, let's walk through building something. 

I'm currently working on a [Domain Driven Design w/ TypeScript Course](/courses/domain-driven-design-typescript) where we build a **Vinyl Trading application**. 

You can check out the code for the project here on [GitHub](https://github.com/stemmlerjs/white-label).

---

One of the [use cases](/articles/enterprise-typescript-nodejs/application-layer-use-cases/) is to be able to <u>add vinyl that you currently have in your collection at home</u> so that you can then make trades and receive offers on them. 

### The flow

Starting from an empty page, we're presented with the ability to **Add Vinyl**.

![White Label - Domain Driven Design TypeScript DDD App - Wireframe #1](/img/blog/ddd-aggregates/WhiteLabelAddVinyl1.svg)

<p class="caption">Empty collection page.</p>

When we click on **"Add Vinyl"**, we can fill out a form starting with the `Artist`.

If the `Artist` isn't currently in our system, then the user will need to **Create a new artist** as well.

![White Label - Domain Driven Design TypeScript DDD App - Wireframe #2](/img/blog/ddd-aggregates/WhiteLabelAddVinyl2.svg)

<p class="caption">Add new vinyl - Enter the artist, no auto-suggest</p>

Clicking **"+ Create new artist [Artist name]"** will open up more details for the user to fill out like the `Genres` of this artist.

![White Label - Domain Driven Design TypeScript DDD App - Wireframe #3](/img/blog/ddd-aggregates/WhiteLabelAddVinyl3.svg)

<p class="caption">Add new vinyl - Fill in addition New Artist details</p>

When they're completed with that, they can add the `Album` details.  

![White Label - Domain Driven Design TypeScript DDD App - Wireframe #4](/img/blog/ddd-aggregates/WhiteLabelAddVinyl4.svg)

<p class="caption">Add new vinyl - Add new album.</p>

Again, if the album hasn't ever been added to the platform, they'll be required to fill in all the details manually.

![White Label - Domain Driven Design TypeScript DDD App - Wireframe #6](/img/blog/ddd-aggregates/WhiteLabelAddVinyl6.svg)

<p class="caption">Add new vinyl - Fill in album details.</p>

Lastly, they can add any relevant information about their copy of the record before hitting submit.

![White Label - Domain Driven Design TypeScript DDD App - Wireframe #7](/img/blog/ddd-aggregates/WhiteLabelAddVinyl7.svg)

<p class="caption">Add new vinyl - Submission</p>

And then it should show up on their dashboard. The album artwork can be retrieved from a [music metadata API](https://github.com/stemmlerjs/music-metadata) and then ammended to the `Vinyl` through an application service in the backend that listens for a `VinylCreatedEvent`.

![White Label - Domain Driven Design TypeScript DDD App - Wireframe #8](/img/blog/ddd-aggregates/WhiteLabelAddVinyl8.svg)

## <a class="anchor" name="Solution"></a>Developing the Use Case

Since we're sure that `Vinyl` is going to be our Aggregate Root, let's talk about what we need in the `AggregateRoot` class.

### Our basic Aggregate Root class

First off, an Aggregate Root is still an `Entity`, so let's simply extend our existing `Entity<T>` class.

```typescript
import { Entity } from "./Entity";
import { UniqueEntityID } from "./UniqueEntityID";

export abstract class AggregateRoot<T> extends Entity<T> {

}
```

What else should an aggregate root class be responsible for?

_Dispatching **Domain Events**_.

We won't get into it now, but in a future article you'll see how we can apply the **observer pattern** in order to signal when relevant things happen, directly from domain layer itself.

But for now, this is good enough to simply give the class name intent.


```typescript
import { AggregateRoot } from "../../core/domain/AggregateRoot";
...

export class Vinyl extends AggregateRoot<VinylProps> {
  ... 
}
```

<p class="special-quote">If you wanna skip ahead and see what this class will look like when we hook up domain events, feel free to check out the code <a href="https://github.com/stemmlerjs/white-label/blob/master/src/core/domain/AggregateRoot.ts">here</a>.</p>

Now let's get to the Use Case.

### The Add Vinyl To Catalog Use Case

Let's think about the general algorithm here:

```text
Given a request DTO containing:
  - the current user's id
  - the vinyl details containing:
    - artist details
      - artist id if it already existed
      - name and genres if it didn't 
    - album details
      - albumId if it already existed
      - name, year and genres if it didn't exist
    - where each genre also contains:
      - the genre id if it already existed
      - the genre name if it didn't already exist

We want to:
  - Find or create the artist 
  - Find or create the album
  - Create the new vinyl (artist, album, traderId)
  - Save the new vinyl 
```

Looks good, let's start with the request DTOs. What do we need from the API call?

#### Request DTOs

For this API call to account for situations where the `Genres` exist and when they don't exist, we'll split a `GenresRequestDTO` into two parts.

```typescript
interface GenresRequestDTO {
  new: string[];
  ids: string[];
}
```

Here's the breakdown of this approach:

- `new: string[]` contains text values of new genres
- `ids: string[]` contains the ids of the genres that we want to link.

Since `Album` and `Artist` both take `Genres`, we'll give them each their own key in the main payload.

```typescript
interface AddVinylToCatalogUseCaseRequestDTO {
  artistNameOrId: string;
  artistGenres: string | GenresRequestDTO;
  albumNameOrId: string;
  albumGenres: string | GenresRequestDTO;
  albumYearReleased: number;
  traderId: string;
}
```

You'll also notice that we've named the `Artist` name and the `Album` name as `[albumName/artistName]orId`. That's because if the `Album` already exists, we can just include the id. Same for `Artist`.

Now let's hook these all up to an `AddVinylToCatalogUseCase` like we've done in our [previous articles on creating use cases](/articles/enterprise-typescript-nodejs/application-layer-use-cases/).

#### Creating the `AddVinylToCatalogUseCase` class

```typescript
// Lots of imports
import { UseCase } from "../../../../core/domain/UseCase";
import { Vinyl } from "../../../domain/vinyl";
import { IVinylRepo } from "../../../repos/vinylRepo";
import { Result } from "../../../../core/Result";
import { TextUtil } from "../../../../utils/TextUtil";
import { IArtistRepo } from "../../../repos/artistRepo";
import { Artist } from "../../../domain/artist";
import { TraderId } from "../../../../trading/domain/traderId";
import { UniqueEntityID } from "../../../../core/domain/UniqueEntityID";
import { ArtistName } from "../../../domain/artistName";
import { ParseUtils } from "../../../../utils/ParseUtils";
import { GenresRepo, IGenresRepo } from "../../../repos/genresRepo";
import { Genre } from "../../../domain/genre";
import { Album } from "../../../domain/album";
import { IAlbumRepo } from "../../../repos/albumRepo";
import { GenreId } from "../../../domain/genreId";

interface GenresRequestDTO {
  new: string[];
  ids: string[];
}

interface AddVinylToCatalogUseCaseRequestDTO {
  artistNameOrId: string;
  artistGenres: string | GenresRequestDTO;
  albumNameOrId: string;
  albumGenres: string | GenresRequestDTO;
  albumYearReleased: number;
  traderId: string;
}

export class AddVinylToCatalogUseCase implements UseCase<AddVinylToCatalogUseCaseRequestDTO, Result<Vinyl>> {
  private vinylRepo: IVinylRepo;
  private artistRepo: IArtistRepo;
  private albumRepo: IAlbumRepo;
  private genresRepo: IGenresRepo;

  // Make sure to dependency inject repos that we
  // need, only referring to their interface. Never
  // their concrete class.
  
  constructor (
    vinylRepo: IVinylRepo, 
    artistRepo: IArtistRepo, 
    genresRepo: GenresRepo, 
    albumRepo: IAlbumRepo
  ) {
    this.vinylRepo = vinylRepo;
    this.artistRepo = artistRepo;
    this.genresRepo = genresRepo;
    this.albumRepo = albumRepo;
  }

  private async getGenresFromDTO (artistGenres: string) {
    // TODO: 
  }

  private async getArtist (request: AddVinylToCatalogUseCaseRequestDTO): Promise<Result<Artist>> {
    // TODO: 
  }

  private async getAlbum (request: AddVinylToCatalogUseCaseRequestDTO, artist: Artist): Promise<Result<Album>> {
    // TODO: 
  }

  public async execute (request: AddVinylToCatalogUseCaseRequestDTO): Promise<Result<Vinyl>> {
    const { traderId } = request;

    let artist: Artist;
    let album: Album;
  
    try {
      // Get the artist 
      const artistOrError = await this.getArtist(request);
      if (artistOrError.isFailure) {
        return Result.fail<Vinyl>(artistOrError.error);
      } else {
        artist = artistOrError.getValue();
      }

      // Get the album
      const albumOrError = await this.getAlbum(request, artist);
      if (albumOrError.isFailure) {
        return Result.fail<Vinyl>(albumOrError.error);
      } else {
        album = albumOrError.getValue();
      }

      // Create vinyl
      const vinylOrError = Vinyl.create({
        album: album,
        artist: artist,
        traderId: TraderId.create(new UniqueEntityID(traderId)),
      });
  
      if (vinylOrError.isFailure) {
        return Result.fail<Vinyl>(vinylOrError.error)
      } 
      const vinyl = vinylOrError.getValue();

      // Save the vinyl
      // This is where all the magic happens

      await this.vinylRepo.save(vinyl);

      return Result.ok<Vinyl>(vinyl)

    } catch (err) {
      console.log(err);
      return Result.fail<Vinyl>(err);
    }
  }
}
```

At this point, you can see the general shape of the algorithm we defined earlier.

Our goal with this Use Case is to retrieve everything necessary to create a `Vinyl` in memory, and then pass it to the `VinylRepo` to cascade everything that needs to be saved.

All that's left to do in this class is to fill in the blanks for how we retrieve everything.

<p class="special-quote">Also, let me remind you that you can view the entire source code <a href="https://github.com/stemmlerjs/white-label">here</a>.</p>

Take a look. 

```typescript
import { UseCase } from "../../../../core/domain/UseCase";
import { Vinyl } from "../../../domain/vinyl";
import { IVinylRepo } from "../../../repos/vinylRepo";
import { Result } from "../../../../core/Result";
import { TextUtil } from "../../../../utils/TextUtil";
import { IArtistRepo } from "../../../repos/artistRepo";
import { Artist } from "../../../domain/artist";
import { TraderId } from "../../../../trading/domain/traderId";
import { UniqueEntityID } from "../../../../core/domain/UniqueEntityID";
import { ArtistName } from "../../../domain/artistName";
import { ParseUtils } from "../../../../utils/ParseUtils";
import { GenresRepo, IGenresRepo } from "../../../repos/genresRepo";
import { Genre } from "../../../domain/genre";
import { Album } from "../../../domain/album";
import { IAlbumRepo } from "../../../repos/albumRepo";
import { GenreId } from "../../../domain/genreId";

interface GenresRequestDTO {
  new: string[];
  ids: string[];
}

interface AddVinylToCatalogUseCaseRequestDTO {
  artistNameOrId: string;
  artistGenres: string | GenresRequestDTO;
  albumNameOrId: string;
  albumGenres: string | GenresRequestDTO;
  albumYearReleased: number;
  traderId: string;
}

export class AddVinylToCatalogUseCase implements UseCase<AddVinylToCatalogUseCaseRequestDTO, Result<Vinyl>> {
  private vinylRepo: IVinylRepo;
  private artistRepo: IArtistRepo;
  private albumRepo: IAlbumRepo;
  private genresRepo: IGenresRepo;

  constructor (
    vinylRepo: IVinylRepo, 
    artistRepo: IArtistRepo, 
    genresRepo: GenresRepo, 
    albumRepo: IAlbumRepo
  ) {
    this.vinylRepo = vinylRepo;
    this.artistRepo = artistRepo;
    this.genresRepo = genresRepo;
    this.albumRepo = albumRepo;
  }

  private async getGenresFromDTO (artistGenres: string) {
    return (
      await this.genresRepo.findByIds(
        ((ParseUtils.parseObject(artistGenres) as Result<GenresRequestDTO>)
          .getValue()
          .ids  
          // existing ids, we're converting them into genreIds so
          // that we can pass them into genresRepo.findByIds(genreIds: GenreId[])
          .map((genreId) => GenreId.create(new UniqueEntityID(genreId))
        ))
      ))
      //  Join both groups of ids together. New and old.
      .concat(
        ((ParseUtils.parseObject(artistGenres) as Result<GenresRequestDTO>)
            .getValue()
            .new // new genres.. let's create 'em
          ).map((name) => Genre.create(name).getValue())
    )
  }

  private async getArtist (request: AddVinylToCatalogUseCaseRequestDTO): Promise<Result<Artist>> {
    const { artistNameOrId, artistGenres } = request;
    const isArtistIdProvided = TextUtil.isUUID(artistNameOrId);

    if (isArtistIdProvided) {
      const artist = await this.artistRepo.findByArtistId(artistNameOrId);
      const found = !!artist;

      if (found) {
        return Result.ok<Artist>(artist);
      } else {
        return Result.fail<Artist>(`Couldn't find artist by id=${artistNameOrId}`);
      }
    } 
    else {
      return Artist.create({ 
        name: ArtistName.create(artistNameOrId).getValue(), 
        genres: await this.getGenresFromDTO(artistGenres as string)
      })
    }
  }

  private async getAlbum (request: AddVinylToCatalogUseCaseRequestDTO, artist: Artist): Promise<Result<Album>> {
    const { albumNameOrId, albumGenres, albumYearReleased } = request;
    const isAlbumIdProvided = TextUtil.isUUID(albumNameOrId);

    if (isAlbumIdProvided) {
      const album = await this.albumRepo.findAlbumByAlbumId(albumNameOrId);
      const found = !!album;

      if (found) {
        return Result.ok<Album>(album)
      } else {
        return Result.fail<Album>(`Couldn't find album by id=${album}`)
      }
    } else {
      return Album.create({
        name: albumNameOrId,
        artistId: artist.artistId,
        genres: await this.getGenresFromDTO(albumGenres as string),
        yearReleased: albumYearReleased
      })
    }
  }

  public async execute (request: AddVinylToCatalogUseCaseRequestDTO): Promise<Result<Vinyl>> {
    const { traderId } = request;

    let artist: Artist;
    let album: Album;
  
    try {

      const artistOrError = await this.getArtist(request);
      if (artistOrError.isFailure) {
        return Result.fail<Vinyl>(artistOrError.error);
      } else {
        artist = artistOrError.getValue();
      }

      const albumOrError = await this.getAlbum(request, artist);
      if (albumOrError.isFailure) {
        return Result.fail<Vinyl>(albumOrError.error);
      } else {
        album = albumOrError.getValue();
      }

      const vinylOrError = Vinyl.create({
        album: album,
        artist: artist,
        traderId: TraderId.create(new UniqueEntityID(traderId)),
      });
  
      if (vinylOrError.isFailure) {
        return Result.fail<Vinyl>(vinylOrError.error)
      } 
  
      const vinyl = vinylOrError.getValue();

      // This is where all the magic happens
      await this.vinylRepo.save(vinyl);

      return Result.ok<Vinyl>(vinyl)

    } catch (err) {
      console.log(err);
      return Result.fail<Vinyl>(err);
    }
  }
}
```

You've made it pretty far in this article. Let's recap what we've done so far in the use case and what's next. 

- We've created a DTO that enables us to use existing or new genres, albums, and artists to create vinyl.
- We've written code that will pull in all the resources necessary to create a vinyl (album, artist, traderId).
- Next, we have to persist it by looking at the `Vinyl` aggregate and passing parts of it to the correct repositories. 
- A repository will `save()` our aggregate and manage cascading the rest of the complex persistence code.

### Persisting an aggregate

Ready to finish it off?

Let's see how we can persist this aggregate.

Take a look at the `VinylRepo` class', particularly the `save()` method.

#### VinylRepo (saves vinyl)

```typescript
import { Repo } from "../../core/infra/Repo";
import { Vinyl } from "../domain/vinyl";
import { VinylId } from "../domain/vinylId";
import { VinylMap } from "../mappers/VinylMap";
import { TraderId } from "../../trading/domain/traderId";
import { IArtistRepo } from "./artistRepo";
import { IAlbumRepo } from "./albumRepo";

export interface IVinylRepo extends Repo<Vinyl> {
  getVinylById (vinylId: VinylId): Promise<Vinyl>;
  getVinylCollection (traderId: string): Promise<Vinyl[]>;
}

export class VinylRepo implements IVinylRepo {
  private models: any;
  private albumRepo: IAlbumRepo;
  private artistRepo: IArtistRepo;

  constructor (models: any, artistRepo: IArtistRepo, albumRepo: IAlbumRepo) {
    this.models = models;
    this.artistRepo = artistRepo;
    this.albumRepo = albumRepo;
  }

  private createBaseQuery (): any {
    const { models } = this;
    return {
      where: {},
      include: [
        { 
          model: models.Artist, as: 'Artist',
          include: [
            { model: models.Genre, as: 'ArtistGenres', required: false }
          ]
        },
        { 
          model: models.Album, as: 'Album', 
          include: [
            { model: models.Genre, as: 'AlbumGenres', required: false }
          ] 
        }
      ]
    }
  }

  public async getVinylById (vinylId: VinylId | string): Promise<Vinyl> {
    const VinylModel = this.models.Vinyl;
    const query = this.createBaseQuery();
    query.where['vinyl_id'] = (
      vinylId instanceof VinylId ? (<VinylId>vinylId).id.toValue() : vinylId
    );
    const sequelizeVinylInstance = await VinylModel.findOne(query);
    if (!!sequelizeVinylInstance === false) {
      return null;
    }
    return VinylMap.toDomain(sequelizeVinylInstance);
  }

  public async exists (vinylId: VinylId | string): Promise<boolean> {
    const VinylModel = this.models.Vinyl;
    const query = this.createBaseQuery();
    query.where['vinyl_id'] = (
      vinylId instanceof VinylId ? (<VinylId>vinylId).id.toValue() : vinylId
    );
    const sequelizeVinylInstance = await VinylModel.findOne(query);
    return !!sequelizeVinylInstance === true;
  }

  public async getVinylCollection (traderId: TraderId | string): Promise<Vinyl[]> {
    const VinylModel = this.models.Vinyl;
    const query = this.createBaseQuery();
    query.where['trader_id'] = (
      traderId instanceof TraderId ? (<TraderId>traderId).id.toValue() : traderId
    );
    const sequelizeVinylCollection = await VinylModel.findAll(query);
    return sequelizeVinylCollection.map((v) => VinylMap.toDomain(v));
  }

  private async rollbackSave (vinyl: Vinyl) {
    const VinylModel = this.models.Vinyl;
    await this.artistRepo.removeArtistById(vinyl.artist.artistId);
    await this.albumRepo.removeAlbumById(vinyl.artist.artistId);
    await VinylModel.destroy({
      where: {
        vinyl_id: vinyl.vinylId.id.toString()
      }
    })
  }

  public async save (vinyl: Vinyl): Promise<Vinyl> {
    const VinylModel = this.models.Vinyl;
    const exists: boolean = await this.exists(vinyl.vinylId);
    const rawVinyl: any = VinylMap.toPersistence(vinyl);

    try {
      await this.artistRepo.save(vinyl.artist);
      await this.albumRepo.save(vinyl.album);

      if (!exists) {
        await VinylModel.create(rawVinyl);
      } else {
        await VinylModel.update(rawVinyl);
      }
    } catch (err) {
      this.rollbackSave(vinyl);
    }

    return vinyl;
  }
}
```

In `VinylRepo`, we have methods for retrieving `Vinyl` by id, checking for it's existence, and getting the entire collection for `Trader`.

Let's walk through the `save()` method.

```typescript
export class VinylRepo implements IVinylRepo {
  ...

  public async save (vinyl: Vinyl): Promise<Vinyl> {

    // 1. Get access to the Sequelize ORM vinyl model. Our repo
    // simply encapsulates access to this.

    const VinylModel = this.models.Vinyl;

    // 2. Check to see if the vinyl already exists or not.
    // If it exists, then we'll perform an UPDATE. If not,
    // we perform a CREATE.
    
    const exists: boolean = await this.exists(vinyl.vinylId);

    // 3. VinylMap create a JSON object that the Sequelize
    // Vinyl model needs in order to save it to the DB.
    // Check it out: 
    // https://github.com/stemmlerjs/white-label/blob/master/src/catalog/mappers/VinylMap.ts

    const rawVinyl: any = VinylMap.toPersistence(vinyl);
    ...

  }
}
```

#### VinylMap (changes vinyl to different formats)

Take a look at the `VinylMap`. This class is singularly responsible for performing transformations on the `Vinyl` class from the database all the way to DTO.

```typescript
import { Mapper } from "../../core/infra/Mapper";
import { Vinyl } from "../domain/vinyl";
import { UniqueEntityID } from "../../core/domain/UniqueEntityID";
import { ArtistMap } from "./ArtistMap";
import { AlbumMap } from "./AlbumMap";
import { TraderId } from "../../trading/domain/traderId";

export class VinylMap extends Mapper<Vinyl> {
  public static toDomain (raw: any): Vinyl {
    const vinylOrError = Vinyl.create({
      traderId: TraderId.create(raw.trader_id),
      artist: ArtistMap.toDomain(raw.Artist),
      album: AlbumMap.toDomain(raw.Album)
    }, new UniqueEntityID(raw.vinyl_id));

    vinylOrError.isFailure ? console.log(vinylOrError) : '';

    return vinylOrError.isSuccess ? vinylOrError.getValue() : null;
  }

  public static toPersistence (vinyl: Vinyl): any {
    return {
      vinyl_id: vinyl.id.toString(),
      artist_id: vinyl.artist.artistId.id.toString(),
      album_id: vinyl.album.id.toString(),
      notes: vinyl.vinylNotes.value
    }
  }

  public static toDTO (vinyl): VinylDTO {
    return {
      vinyl_id: vinyl.id.toString()
      trader_id: vinyl.traderId.id.tostring(),
      artist: ArtistMap.toDTO(vinyl.artist),
      album: AlbumMap.toDTO(vinyl.album)
    }
  }
}
```

Back to the `save()` method in `VinylRepo`. 

```typescript
export class VinylRepo implements IVinylRepo {
  ...

  public async save (vinyl: Vinyl): Promise<Vinyl> {
    const VinylModel = this.models.Vinyl;
    const exists: boolean = await this.exists(vinyl.vinylId);
    const rawVinyl: any = VinylMap.toPersistence(vinyl);
    

    try {

      // 4. Delegate saving an artist (if it doesn't exist) 
      // to the artistRepo. 
      // We know that we need to do this before we save Vinyl because
      // vinyl relies on it through the 1-to-1 relationship

      await this.artistRepo.save(vinyl.artist);

      // 5. Also delegate saving the album (if it doesn't exist)
      // to the albumRepo class. Vinyl also relies on this to exist
      // first.

      await this.albumRepo.save(vinyl.album);

      if (!exists) {

        // 6. If vinyl doesn't yet exist, then we'll CREATE it.

        await VinylModel.create(rawVinyl);

      } else {

        // 7. If it does exist, then we'll UPDATE it.
        await VinylModel.update(rawVinyl);
      }

    } catch (err) {

      // 8. If anything fails, we'll do a manual rollback.
      this.rollbackSave(vinyl);
    }

    return vinyl;
  }
}
```

You can be sure that the `AlbumRepo` and `ArtistRepo` are following a similar algorithm to the one outlined here in `VinylRepo`.

#### AlbumRepo (delegated the responsibility of persisting `Albums`)

I've included the entire file here in case you want to peruse, but pay attention to the `save()` method.

```typescript
import { Repo } from "../../core/infra/Repo";
import { Album } from "../domain/album";
import { AlbumId } from "../domain/albumId";
import { AlbumMap } from "../mappers/AlbumMap";
import { IGenresRepo } from "./genresRepo";
import { Genre } from "../domain/genre";

export interface IAlbumRepo extends Repo<Album> {
  findAlbumByAlbumId (albumId: AlbumId | string): Promise<Album>;
  removeAlbumById (albumId: AlbumId | string): Promise<Album>;
}

export class AlbumRepo implements IAlbumRepo {
  private models: any;
  private genresRepo: IGenresRepo

  constructor (models: any, genresRepo: IGenresRepo) {
    this.models = models;
    this.genresRepo = genresRepo;
  }

  private createBaseQuery (): any {
    const { models } = this;
    return {
      where: {},
      include: [
        { model: models.Genre, as: 'AlbumGenres', required: false }
      ]
    }
  }

  public async findAlbumByAlbumId (albumId: AlbumId | string): Promise<Album> {
    const AlbumModel = this.models.Album;
    const query = this.createBaseQuery();
    query['album_id'] = (
      albumId instanceof AlbumId ? (<AlbumId>albumId).id.toValue() : albumId
    );
    const album = await AlbumModel.findOne(query);
    if (!!album === false) {
      return null;
    }
    return AlbumMap.toDomain(album);
  }

  public async exists (albumId: AlbumId | string): Promise<boolean> {
    const AlbumModel = this.models.Album;
    const query = this.createBaseQuery();
    query['album_id'] = (
      albumId instanceof AlbumId ? (<AlbumId>albumId).id.toValue() : albumId
    );
    const album = await AlbumModel.findOne(query);
    return !!album === true;
  }

  public removeAlbumById (albumId: AlbumId | string): Promise<Album> {
    const AlbumModel = this.models.Artist;
    return AlbumModel.destroy({ 
      where: { 
        artist_id: albumId instanceof AlbumId 
          ? (<AlbumId>albumId).id.toValue() 
          : albumId
      }
    })
  }

  public async rollbackSave (album: Album): Promise<any> {
    const AlbumModel = this.models.Album;
    await this.genresRepo.removeByGenreIds(album.genres.map((g) => g.genreId));
    await AlbumModel.destroy({
      where: {
        album_id: album.id.toString()
      }
    })
  }

  private async setAlbumGenres (sequelizeAlbumModel: any, genres: Genre[]): Promise<any[]> {
    if (!!sequelizeAlbumModel === false || genres.length === 0) return;
    return sequelizeAlbumModel.setGenres(genres.map((d) => d.genreId.id.toString()));
  }

  public async save (album: Album): Promise<Album> {
    const AlbumModel = this.models.Album;
    const exists: boolean = await this.exists(album.albumId);
    const rawAlbum: any = AlbumMap.toPersistence(album);

    let sequelizeAlbumModel;

    try {
      await this.genresRepo.saveCollection(album.genres);

      if (!exists) {
        sequelizeAlbumModel = await AlbumModel.create(rawAlbum);
      } else {
        sequelizeAlbumModel = await AlbumModel.update(rawAlbum);
      }

      await this.setAlbumGenres(sequelizeAlbumModel, album.genres);
    } catch (err) {
      this.rollbackSave(album);
    }

    return album;
  }
}
```

The algorithm is pretty much the same with one small difference to how we save `Album` `Genres` with `setAlbumGenres()`.

#### Sequelize Associations

In Sequelize, we have the ability to [set associations](http://docs.sequelizejs.com/manual/associations.html). 

When we define our models, we can do things like this:

```javascript
Album.belongsToMany(models.Genre, 
  { as: 'AlbumGenres', through: models.TagAlbumGenre, foreignKey: 'genre_id'}
);
```
The `belongsToMany` association to `Genres` adds a `setGenres()` method to the sequelize `Album` instance, making it easier to set the current `Genres` for an  `Album`.

### Rollbacks

The last thing to talk about are rolling back transactions.

Some C# popularized the [Unit Of Work](https://www.c-sharpcorner.com/UploadFile/b1df45/unit-of-work-in-repository-pattern/) pattern.

However, for us to roll that ourselves would mean that we would have to pass a [sequelize transaction](http://docs.sequelizejs.com/manual/transactions.html) through all of our repos and tie the execution of our use case to a single database transaction.

In theory, it sounds beautful. Implementing it is a little bit of a nightmare.

I've chosen to manually apply rollbacks because it's much simpler for now.

For example, in `AlbumRepo`, this is what it looks like to rollback an `Album`.

```typescript
export class AlbumRepo implements IAlbumRepo {
  public async rollbackSave (album: Album): Promise<any> {
    const AlbumModel = this.models.Album;
    await this.genresRepo.removeByGenreIds(album.genres.map((g) => g.genreId));
    await AlbumModel.destroy({
      where: {
        album_id: album.id.toString()
      }
    })
  }
}
```

I like to consider that a pretty pragmatic approach, although if it seems right for you, you could give Unit of Work a try.

---

## Takeaways

We'll conclude this article here. If you stuck around this long, you're a real trooper you deserve all the success in domain modeling possible.

To recap, here's what we covered;

- Entities and value objects are clustered together into aggregates
- An "aggregate" is a cluster of associated objects that we treat as a unit for the purpose of data changes."
- The boundary is how far fully consistuted entities are in the aggregate.
- With all fully consistuted entities inside of the aggregate, it's possible for the aggregate root to enforce all invariants within the aggregate when it's state changes.
- An aggregate must always be returned fully constited from persistance. That constraint requires us to think hard about performance constraints and what's really necessary to fully pull from the database.
- Our aggregate design goals are to:
  - Provide enough info to enforce model invariants within a boundary
  - Execute use cases
  - Ensure decent database performance
  - Provide enough info to transform a Domain Entity to a DTO
- Repositories are responsible for handling all of the complex aggregate persistence logic.
- Mappers are used to map aggregates to the format required for saving it in our persistence technology.
