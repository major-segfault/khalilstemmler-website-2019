---
templateKey: blog-post
title: "How to Import Modules using Absolute File Paths with TypeScript"
date: '2019-09-12T10:04:10-05:00'
updated: '2019-09-121T10:04:10-05:00'
description: >-
  In this quick blog post, I'll show you how you can configure TypeScript to use absolute file paths.
tags:
  - TypeScript
  - Absolute File Paths
category: TypeScript
published: false
image: /img/blog/templates/banners/typescript-blog-banner.png
displayInArticles: true
---

It used to **suck** having to type `../../../../` (and so on) to import a module when coding in TypeScript.

You can fix that by setting a `baseUrl` property in your `tsconfig.json`.

<div class="filename">tsconfig.json</div>

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "moduleResolution": "node",
    "pretty": true,
    "sourceMap": true,
    "target": "es6",
    "outDir": "./dist",
    "baseUrl": "./src", /* This is where all your code is*/
    "typeRoots" : ["./node_modules/@types", "./src/@types"]
  },
  "include": [
    "src/**/*.ts",
  ],
  "exclude": [
    "node_modules"
  ]
}
```

Boom, you're all set. 

Now go try to import a module. The compiler should be able to help you out now.

<div class="filename">src/modules/blog/useCases/getAllAuthors/GetAllAuthors.ts</div>

![Absolute imports](/img/blog/typescript/absolute-imports.png)

<p class="caption">See the absolute import?</p>

Say goodbye to those relative path staircases `../../../../` 👋.

