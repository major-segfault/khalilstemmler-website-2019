---
name: '3 Common Goals of Frontend Frameworks'
templateKey: wiki
published: true
wikicategory: Software Design
wikitags: null
prerequisites: null
date: '2020-01-08T00:05:26-04:00'
updated: '2020-01-08T00:05:26-04:00'
image: null
plaindescription: Data storage, change detection, and data flow.
---

Every frontend framework has their own opinionated way to solve the same three problems.

## 1. Data storage

> Defining the shape, changing, and accessing data from the store

### Apollo Client + React Hooks

Using [Apollo Client](https://www.apollographql.com/docs/react/?utm_source=khalil&utm_medium=article&utm_campaign=three_frontend_goals) we can create a store to represent the **local state** as a client-side cache, fundamentally replacing the need to use Redux to maintain a client-side store.

Queries/mutations that need **remote state** can also be written in combination with remote fields to handle use cases where we add flags or booleans to data for local presentation. 

<p class="filename">queries/dog.js</p>

```graphql
const GET_DOG = gql`
  query GetDogByBreed($breed: String!) {
    dog(breed: $breed) {
      images {
        url
        id
        isLiked @client # signal to resolve locally
      }
    }
  }
`;
```

It's pretty nifty.

Anything data not found in the client-side cache is fetched remotely and cached on its way in.



## 2. Change detection 

> Signaling to components that data has changed

## 3. Data flow 

> The direction that changes flow and responding to change
