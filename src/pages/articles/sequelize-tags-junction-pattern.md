---
templateKey: article
title: "Junction Model Pattern: Many-to-Many - Sequelize"
date: '2019-04-30T10:04:10-05:00'
updated: '2019-04-30T10:04:10-05:00'
description: >-
  Many-to-many is a common modeling relationship between two entities. Here's one way to handle it with the Sequelize ORM.
tags:
  - Node.js
  - Sequelize
  - ORM
  - Backend
category: Web Development
image: /img/blog/sequelize-junction/junction.png
published: true
---

Let's assume you're building a blog with Sequelize. 

On your blog, you can create a bunch of `Post`s. As a way to describe your post, it can belong to many different `Genre`s.

This blog post for example, might have the `Sequelize`, `Orm`, and `Web Development` tag.

So far, we have two models: `Post` and `Genre`.

```typescript
// Post.js
module.exports = function(sequelize, DataTypes) {
  const Post =  sequelize.define('post', {
    post_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    timestamps: true,
    underscored: true,
    tableName: 'post',
  });

  return Post;
};
```

```typescript
// Genre.js
module.exports = function(sequelize, DataTypes) {
  const Genre =  sequelize.define('genre', {
    genre_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(60),
      allowNull: false,
      unique: true
    }
  }, {
    timestamps: true,
    underscored: true,
    tableName: 'genre',
  });

  return Genre;
};
```

Great. Now how do we model the many-to-many relationship between them?

## Modeling the junction table

We need to create a [junction table](https://en.wikipedia.org/wiki/Associative_entity) to store the relationship between the two.

In order to model it, we'll end up with three tables instead of just two.

![](/img/blog/sequelize-junction/junction-svg.svg)

I know that there's a way to get Sequelize to create this for you simply by using the correct association methods, but I like to be explicit about it.

Let's go ahead and create the additional model now.

```typescript
// tagPostGenre.js
module.exports = function(sequelize, DataTypes) {
  const TagPostGenre = sequelize.define('tag_post_genre', {
    tag_post_genre_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.INTEGER(11),
      primaryKey: true
    },
    post_id: {
      type: DataTypes.INTEGER(11),
      primaryKey: false,
      references: {
        model: 'post',
        key: 'post_id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade',
      unique: 'unique-genre-per-post'
    },
    genre_id: {
      type: DataTypes.INTEGER(11),
      primaryKey: false,
      references: {
        model: 'genre',
        key: 'genre_id'
      },
      onDelete: 'cascade',
      onUpdate: 'cascade',
      unique: 'unique-genre-per-post'
    },
  }, {
    timestamps: true,
    underscored: true,
    tableName: 'tag_post_genre'
  });

  return TagPostGenre;
};
```

_Also, it's not necessary to prepend the model name with "Tag-", I just like to do that because it allows me to understand at a glance that that table is a Junction table between the other two tables mentioned in the name_.

Here's what's important about this so far:

- We've created **foreign key** relationships to the `Post` and `Genre` model.
- We added a **composite unique constraint** in order to prevent a post from adding the same genre twice.

Now that we have the model created, we have to associate them all together with Sequelize so that we can get the benefits of using the convenience methods they expose.

## Update the Associations

Add the associations on `TagPostGenre` junction table/model.

```typescript
TagPostGenre.associate = (models) => {
  TagPostGenre.belongsTo(models.Post, { foreignKey: 'post_id', targetKey: 'post_id', as: 'Post' });
  TagPostGenre.belongsTo(models.Genre, { foreignKey: 'genre_id', targetKey: 'genre_id', as: 'Genre' });
}
```

Add the association on `Genre`.

```typescript
Genre.associate = (models) => {
  Genre.belongsToMany(models.Post, { as: 'PostsInGenre', through: models.TagPostGenre, foreignKey: 'genre_id'});
}
```

Finally, add the association on `Post`.

```typescript
Post.associate = (models) => {
  Post.belongsToMany(models.Genre, { as: 'GenresForPost', through: models.TagPostGenre, foreignKey: 'post_id'});
}
```

The `as` key in the second argument's config object using `belongsToMany` is a way to specify the alias when we're doing [Eager Loading / Include Queries](http://docs.sequelizejs.com/manual/models-usage.html#eager-loading).

### Usage

If you want to set the **genres** for a `Post` instance...

```typescript
const post = await Post.findOne({ where: { post_id: 1 }});

```

Since we've added the associations, you should have access to the convenience methods that Sequelize adds.

In this particular case, expect to see something like `setGenres()` on the post instance.

```typescript
const genreIds = [1,2,3];
await post.setGenres(genreIds);

const genres = await post.getGenres();
console.log(genres) // genre instances! [{}, {}, {}]
```

We can use the ids of the genres to `set` the genres for this post.

You can also retrieve all of the genres using `get-"plural junction association name"()`. In this case, `getGenres()`.

You can always double check that the methods have been added by using the vscode debugger.
