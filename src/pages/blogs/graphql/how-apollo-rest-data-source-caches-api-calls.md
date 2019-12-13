---
templateKey: blog-post
title: "How Apollo REST Data Source Deduplicates and Caches API calls [Deep Dive]"
date: '2019-12-13T10:04:10-05:00'
updated: '2019-12-131T10:04:10-05:00'
description: >-
  Apollo's REST Data Source actually does a lot more than you'd think behind the scenes, and that's why it's recommended instead of using a wrapped HTTP library like Axios or Fetch in order to hook up data to your resolvers.
tags:
  - Apollo Server
  - GraphQL
category: GraphQL
image: /img/blog/graphql/graphql-banner.png
published: true
displayInArticles: true
---

Quite honestly, I don't know if I really enjoy writing _optimization code_. I'm not saying that I don't like optimized code- I'm saying that _optimization code_ tends to be the last thing that I need to do, has the potential to degrade readability a little bit, and can be pretty challenging to implement. Not only that, I just don't get as excited at the opportunity to optimize something as I do when I get the opportunity to codify things relevant to the business through domain layer code and use cases.

But alas, it's something that needs to be done.

And that's what I think Apollo has done really well with their tooling. They've listened to the community and figured out the common tasks in hooking up a GraphQL server in production that aren't so fun (but totally necessary), and done a lot of that hard stuff for us so that we can _start out with an optimized GraphQL server_.

---

## Resolving data from a RESTful API

If you're thinking about running a Apollo GraphQL server, a common setup is to resolve data from an external REST API.

Going that route, you might have heard of the [Apollo REST Data Source](https://www.apollographql.com/docs/apollo-server/data/data-sources/) library. 

Using it, you can write custom data-fetching methods in order to resolve data from your external RESTful services. The image below depicts a potential architecture.

![Apollo RESTDataSource architecture example](/img/blog/graphql/rest-data-sources/rest-data-source-architecture.svg)

<p class="caption">Example architecture of a client application connected to a GraphQL server resolving data from 4 RESTful API services.</p>

Going through the [Apollo full-stack tutorial](https://www.apollographql.com/docs/tutorial/introduction), the Apollo Docs recommend that we use the `RESTDataSource` library when trying to fetch data from an external REST API.

We can get this to work in the following 3 steps:

- 1. Subclassing the `RESTDataSource`.
- 2. Setting the `BaseURL`.
- 3. Writing data fetching methods that utilize the parent class's `get`, `post`, `put`, `patch` (and more) in order to fetch data from the external REST API.

A very simple example of a `RESTDataSource` subclass might look like this:

<div class="filename">datasources/vinyl.ts</div>

```typescript
import { RESTDataSource } from 'apollo-datasource-rest'
import { Vinyl } from '../models/vinyl'

type VinylCollection = Vinyl[];

export class VinylAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://api.whitelabel.com/v2/';
  }

  async getAllVinyl (): Promise<VinylCollection> {
    // Utilize the `get` convenience method from the parent RESTDataSource class.
    const response = await this.get('vinyl');
    return Array.isArray(response)
      // Map the vinyl objects from the external API response into the format
      // that we need for our schema.
      ? response.map((vinyl: any) => this.vinylReducer(vinyl))
      : [];
  }

  // More data fetching code
  ...
}
```

A common question becomes:

> "What is the advantage of using the `RESTDataSource` library over using an abstracted HTTP client?"

Moreover, why do we need to use `RESTDataSource`? Couldn't we just use Axios and write our own `get`, `post`, `patch`, etc convenience methods if and when we feel like it?

<div class="filename">datasources/vinyl.ts</div>

```typescript
// Using axios instead
import axios from 'axios'
import { Vinyl } from '../models/vinyl'

type VinylCollection = Vinyl[];

export class VinylAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'https://api.whitelabel.com/v2/';
  }

  async getAllVinyl (): Promise<VinylCollection> {
    const response = await axios({ method: 'GET', url: `${this.baseURL}vinyl` })

    return Array.isArray(response.data)
      ? response.data.map((vinyl: any) => this.vinylReducer(vinyl))
      : [];
  }
  ...
}
```

You could, but you'd be missing out on some stuff.

Today I learned that `RESTDataSource` actually comes with **two awesome performance optimizations** out of the box:

> Request Deduplication and Resource Caching.

## Request Deduplication

Request deduplication prevents double-invoking HTTP calls in rapid succession.

That's a common enough problem if your resolvers rely on the same API call to resolve some information from an external service.

Deduplicating requests puts less stress on your service endpoints.

### How Request Deduplication works in REST Data Source

The [REST Data Source library](https://github.com/apollographql/apollo-server/tree/master/packages/apollo-datasource-rest) uses a caching technique called [memoization](https://en.wikipedia.org/wiki/Memoization) in order to cache **the entire Promise** invoked when we make a request to a resource. We hold onto the `Promise` for any request to an external RESTful resource in a `Map<string, Promise<any>>`.

<p class="special-quote"><b>Memoization</b>: A specific form of caching where for an indeterministic (and potentially expensive) operation, we save the results and return it from memory in subsequent invocations. Check out <a target="_blank" href="https://medium.com/@bluepnume/async-javascript-is-much-more-fun-when-you-spend-less-time-thinking-about-control-flow-8580ce9f73fc">this article on "How to Memoize Async Functions in JavaScript"</a>.</p>

<div class="filename">src/RESTDataSource.ts</div>

```typescript
export abstract class RESTDataSource<TContext = any> extends DataSource {
  ... 
  memoizedResults = new Map<string, Promise<any>>();
}
```

When a `GET` request comes in, we construct a _cache key_ for that request by looking at the URL:

```typescript
export abstract class RESTDataSource<TContext = any> extends DataSource {
  ...
  protected cacheKeyFor(request: Request): string {
    return request.url;
  }
  ...
}
```

That url is what we're going to use as the `string` _key_ for the `Map` that holds our memoized requests.

So if we make a request to `https://api.kittens/v2/all?sort_by=cuteness`, that becomes our key. 

Now here's the cool part.

Depending on if the request was a [query](/articles/oop-design-principles/command-query-segregation/)-like HTTP verb like GET, we'll check to see if there's a memoized `Promise<any>` by looking it up using the cache key. If there's already a `Promise<Request>` in progress for that cache key, just return that Promise that we know will resolve to the same thing we're already asking for from a previous request. Otherwise, we'll perform the request and memoize it so that it can be deduplicated for subsequent requests.

However, if we issued a [command](/articles/oop-design-principles/command-query-segregation/)-like request like `DELETE` or `POST`, let's remove that item from the memoization cache because the next time we retrieve it, we can expect it's value to be different.

<div class="filename">src/RESTDataSource.ts</div>

```typescript
export abstract class RESTDataSource<TContext = any> extends DataSource {
  ...

  private async fetch<TResult>(
    init: RequestInit & {
      path: string;
      params?: URLSearchParamsInit;
    },
  ): Promise<TResult> {
    ... 

    // If the request is a QUERY, see if we can get the memoized
    // result to prevent invoking another API call for a resource that hasn't
    // yet changed.
    if (request.method === 'GET') {
      let promise = this.memoizedResults.get(cacheKey);
      if (promise) return promise;

      // Didn't find it, just invoke the request normally and then save
      // the request to our memoization cache.
      promise = performRequest();
      this.memoizedResults.set(cacheKey, promise);
      return promise;
    } else {

      // If the request is a COMMAND, delete the item from our memoization
      // cache (because we're about to issue a side-effect) and then perform the request.
      this.memoizedResults.delete(cacheKey);
      return performRequest();
    }
  }

```

To illustrate that this works corrrectly, here's a test case straight from the Apollo REST Data Source library.

<div class="filename">src/__tests__/RESTDataSource.test.ts</div>

```typescript
 describe('memoization', () => {
    it('deduplicates requests with the same cache key', async () => {
      const dataSource = new class extends RESTDataSource {
        baseURL = 'https://api.example.com';

        getFoo(a: number) {
          return this.get('foo', { a });
        }
      }();

      dataSource.httpCache = httpCache;

      fetch.mockJSONResponseOnce();

      await Promise.all([dataSource.getFoo(1), dataSource.getFoo(1)]);

      expect(fetch.mock.calls.length).toEqual(1);
      expect(fetch.mock.calls[0][0].url).toEqual(
        'https://api.example.com/foo?a=1',
      );
    });
 });
```

If you fired the same request of one that was _already in flight but not resolved yet_ you’d only generate one Promise (and one fetch)!

## Resource Caching

As for the actual responsibility of caching in REST Data Source, that falls into the lap of an Apollo-implemented [Apollo Server Cache](https://www.npmjs.com/package/apollo-server-caching) called `HTTPClient`.

<p class="special-quote"><b>Resource cache</b>: The more traditional understanding of caching. We save a fetched resource in a storage medium more efficient at retrievals than the initial mechanism we used to retrieve it. For example, fetching an object from memory is faster than reaching into a database (disk) to fetch it. Also, fetching an object from memory is also often faster than making a network call to an external resource.</p>

### How it works

When `RESTDataSource` invokes `performRequest`, it uses a class called `HTTPCache` which is composed with a `KeyValueCache`.

`KeyValueCache` is a _powerful_ interface that Apollo Server uses internally to provide a caching store for the Data Sources.

In the following code (that powers `RESTDataSource`), Apollo uses an `InMemoryLRUCache`, which is a valid subtype of the `KeyValueCache`.

<div class="filename">src/HTTPCache.ts</div>

```typescript
export class HTTPCache {
  private keyValueCache: KeyValueCache;
  private httpFetch: typeof fetch;

  constructor(
    // You can pass in your own cache, but Apollo will use an
    // InMemoryLRUCache by default
    keyValueCache: KeyValueCache = new InMemoryLRUCache(),
    httpFetch: typeof fetch = fetch,
  ) {
    this.keyValueCache = new PrefixingKeyValueCache(
      keyValueCache,
      'httpcache:',
    );
    this.httpFetch = httpFetch;
  }

  ...
}
```

When a request comes in, we run similar logic to that of which we ran in our memoization cache, but this time, we're in control of if the request goes out onto the wire or not.

<div class="filename">src/HTTPCache.ts</div>

```typescript
export class HTTPCache {
  ... 
  async fetch(
    request: Request,
    options: {
      cacheKey?: string;
      cacheOptions?:
        | CacheOptions
        | ((response: Response, request: Request) => CacheOptions | undefined);
    } = {},
  ): Promise<Response> {

    /**
     * 1. Create the cache key. You can either supply a cache key or leave it blank
     * and Apollo will use the URL of the request as the key.
     */ 
  
    const cacheKey = options.cacheKey ? options.cacheKey : request.url;

    /**
     * 2. Using that key, see if the cache has the value already.
     */ 

    const entry = await this.keyValueCache.get(cacheKey);

    /**
     * 3. If it doesn't already have the response, we'll need to
     * get it, store the response in the cache, and return the 
     * response.
     */ 

    if (!entry) {
      const response = await this.httpFetch(request);

      const policy = new CachePolicy(
        policyRequestFrom(request),
        policyResponseFrom(response),
      );

      return this.storeResponseAndReturnClone(
        response,
        request,
        policy,
        cacheKey,
        options.cacheOptions,
      );
    }

    /**
     * 4. Returns the object from the cache (respecting any
     * cache invalidation policies).
     */ 

    ...
  }
}
```

<p class="special-quote">You can read this file and peruse around the rest of the codebase for the Apollo REST Data Source library <a href="https://github.com/apollographql/apollo-server/blob/master/packages/apollo-datasource-rest/src/HTTPCache.ts">here on GitHub</a>.</p>

Out of the box, this thing does a _LOT_. But if you want to roll your own cache, or if you need to [hook several GraphQL endpoints up to Redis or Memcached](https://www.apollographql.com/docs/apollo-server/data/data-sources/#using-memcachedredis-as-a-cache-storage-backend) for a single source of truth, that's totally possible as well.

### Making your own cache

For REST Data Source, Apollo ships with it's own in-memory caching strategy called `InMemoryLRUCache`. While this is what `HTTPCache` that REST Data Source relies on, there's nothing stopping you from writing your own cache strategy.

In order for Apollo to utilize your cache, all you need to do is write a class that implements the `KeyValueCache` interface and you're good to go.

```typescript
export interface KeyValueCache {
  get(key: string): Promise<string | undefined>;
  set(key: string, value: string, options?: { ttl?: number }): Promise<void>;
}
```

<p class="special-quote">You can get started implementing your own cache using the <a href="https://www.npmjs.com/package/apollo-server-caching">apollo-server-caching</a> npm library.</p>

## Summary

- Apollo REST Data Source comes equipped with Request Deduplication and a Resource Cache
- Request Deduplication prevents multiple requests to the same resource from getting invoked using memoization.
- The Resource Cache prevents multiple requests to the same resource from getting sent out onto the wire.
- You can implement your own Resource Cache using the [apollo-server-caching](https://www.npmjs.com/package/apollo-server-caching) library.