---
templateKey: article
title: "Settting up a Sequelize, TypeScript, Node.js, Jest Project [Boilerplate with Repo] - Sequelize"
date: '2019-06-24T10:04:10-05:00'
updated: '2019-06-24T10:04:10-05:00'
description: >-
  For building Node.js applications, Sequelize is my personal favourite ORM. I've battle-tested it in production with a handful of real-life projects and it's still my first choice for interacting with a relational database. Here's a walkthrough of my production setup with Node.js, TypeScript and Jest.
tags:
  - Sequelize
  - Software Design
  - Advanced Object-Oriented Programming
category: Software Design
image: /img/blog/sequelize/main.png
published: false
---

I'm currently working on an open-source TypeScript/Node.js application called _[White Label](https://github.com/stemmlerjs/white-label)_ where users can trade vinyl with each other. I'm building it for the purpose of teaching developers how to organize complex domain-logic using [Domain-Driven Design](/articles/domain-driven-design-intro/).  

In that project, I've gone the traditional route of using a relational database. 

And my favourite ORM for interacting with relational databases is [Sequelize](http://docs.sequelizejs.com/).

In this quick article, I'll walk you though my project setup.

_Want to just see the code? Check it out here, https://github.com/stemmlerjs/white-label._

---

## The Sequelize ORM

Sequelize has been around for a while. When I first started building apps with Node.js in 2014, Sequelize was the most mature ORM around at the time. 

There are some other awesome looking ORMs out there today, but because I've personally battle-tested Sequelize over time, it's normally been my first choice. They've even released [official v5 TypeScript typings](http://docs.sequelizejs.com/manual/typescript).

## 
```bash
white-label
  └ bin 
    └ www.ts    # This is the startup script that boots the webserver
  └ dist        # Builds go here
  └ scripts  
    └ db
      └ create.js
      └ delete.js
  └ sequelize
    └ config
    └ migrations
    └ seeders
    runner.ts   # 
  .env
  .sequelizerc
  .jest.config.js
```
└


<div class="filename">app.js</div>

```typescript
import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import { commentRepo } from './repos';
import { stripTrailingSlash } from './utils';
const morgan = require('morgan')
const helmet = require('helmet')
const compression = require('compression')
const rateLimit = require('express-rate-limit')

const isProduction = process.env.KS_IS_PROD !== 'false'

const origin = {
  // TODO: Uncomment
  // origin: isProduction ? 'https://khalilstemmler.com' : '*',
  origin: isProduction ? '*' : '*',
}

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors(origin))
app.use(compression())
app.use(helmet())
app.use(morgan('combined'))

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // 5 requests,
})
```