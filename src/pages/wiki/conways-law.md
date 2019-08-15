---
name: Conway's Law
templateKey: wiki
published: true
wikicategory: Software Architecture
wikitags: 
  - architecture
  - software design
prerequisites: null
date: '2019-07-03T00:05:26-04:00'
updated: '2019-07-03T00:11:26-04:00'
image: null
plaindescription: "Any organization that designs a system (defined more broadly here than just information systems) will inevitably produce a design whose structure is a copy of the organization's communication structure."
---

Originally published here June 2019, with discussions on [Hackernews](https://news.ycombinator.com/item?id=20347821) and [Reddit](https://www.reddit.com/r/programming/comments/c8sgdp/conways_law_domaindriven_design/). 

---

Melvin Conway is credited with that quote back in 1967.

In simple terms, Conway is saying:

> when we build software, we need to know the different groups/teams/roles it serves, and divide the app up  into separate parts, similar to how those groups normally communicate in real life

That's the [essence of the single responsibility principle](/articles/solid-principles/solid-typescript/). 

Here are some reasons why it's incredibly relevant to a large number of topics on this blog.

### With respect to domain knowledge

In [this article](/articles/solid-principles/single-responsibility/) about Domain Knowledge and the Single Responsibility principle, we agreed that _without having knowledge of the domain_, it's incredibly hard to determine just how much responsibility a class and a module should have.

Based on what Conway said back in 1967, if we're working on a system that's going to be used by groups of individuals in real life, like:

- `Students`, `Recruiters` and `Interviewers` in a recruitment platform or
- `Accounting`, `HR`, `Employees` in a generic enterprise application

...then failure to understand which requirement maps to which group will make it difficult for us to identify when our classes or modules are responsible for too much (something that spills into multiple groups).

### With respect to subdomains and boundaries

In any large-scale application, the entire problem domain is the whole company.

If we were to create Wal-Mart's online systems tomorrow, the entire problem domain is **huge**.

One of the first few things we learn in software development is decomposition, breaking things to smaller modules. So we decompose the entire domain (Wal-Mart as a company) into subdomains.

But how do we identify the subdomains?

**Conway's law**.

We split up the subdomains based on the organizational structure. So we need:

- an `inventory` subdomain so that people on the floor can keep track of everything that we currently have
- a `time tracking` subdomain for employees 
- an `accounting` subdomain system for the accountants
- an `HR / hiring` subdomain system for HR and recruiters
- an `ecommerce` subdomain to sell things online

### With respect updating future use cases

From "Head First Design Patterns", one of my favourite quotes is:

> "change is the only constant in software development

Where does change originate from?

Is it from within the code? Not really, unless we identify a memory leak or something.

Is it from how we organized the code? It could be, if we didn't [organize our code](/articles/name-construct-structure/) well and suddenly it's hard to figure out where things are.

Changes (feature requests) all originate from one place: the users using the software.

If we've organized our code by `subdomain` => `use case`, it makes the task of finding where to change code non-existent.

```bash
  billing/
    └ useCases/
      └ getCustomerById/
        getAllCustomers/
        chargeCustomer/
        getCharges/
        refundCustomer/
        
  trading/
    └ useCases/
      └ approveOffer/
        getAllOffers/
        makeOffer/
        rejectOffer/
      
  catalog/
    └ useCases/
      └ addVinyl/
        getVinylById/
        getAllVinyl/
        updateVinyl/
        removeVinyl/
        search/

  users/
    └ useCases/
      └ createAccount/
        deleteAccount/
        login/
        logout/
```

If our logical boundaries between subdomains are healthy and dependencies to classes common between subdomains are carefully managed, changing a use case in one subdomain **shouldnt't** affect a use case in another subdomain.

### Additional reading
- [Wikipedia](https://en.wikipedia.org/wiki/Conway's_law)