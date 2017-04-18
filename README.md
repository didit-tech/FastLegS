[![Build Status](https://secure.travis-ci.org/didit-tech/FastLegS.png)](http://travis-ci.org/didit-tech/FastLegS)
# FastLegS

PostgreSQL ORM on top of node-postgres.

## Installation

    npm install FastLegS

## Quickstart

**NOTE:** As of version```0.2.0```, both PostgreSQL and MySQL are supported. 
You indicate which database you are using at object instantiation time. All 
other operations and interfaces behave the same as older versions.

### Setup for versions < ```0.2.0```

    var FastLegS = require('FastLegS');
    ...
    FastLegS.connect(connectionParams);
    ...

### Setup for versions >= ```0.2.0```

### MySQL:

    var FastLegSBase = require('FastLegS');
    var FastLegS = new FastLegSBase('mysql');
    ...
    FastLegS.connect(connectionParams);
    ...

### PostgreSQL:

    var FastLegSBase = require('FastLegS');
    var FastLegS = new FastLegSBase('pg');
    ...
    FastLegS.connect(connectionParams);
    ...

### Example:

    var FastLegSBase = require('FastLegS');

    // gonna use PostgreSQL
    var FastLegS = new FastLegSBase('pg');

    var connectionParams = {
      user: 'shes'
    , password: 'got'
    , database: 'legs'
    , host: 'localhost'
    , port: 5432
    }

    FastLegS.connect(connectionParams);

    var Post = FastLegS.Base.extend({
      tableName: 'posts',
      primaryKey: 'id'
    });

    Post.create(
      { title: 'Some Title 1', body: 'Some body 1' }, 
      function(err, results) {
        Post.find(
          { 'title.ilike': '%title%' }, 
          { only: ['id', 'body'] }, 
          function(err, post) {
            // Hooray!
          }
        );
      }
    );

# The Full Monty

The following examples use these database tables as examples:

### posts

| id   | title        | blurb        | body        | published   |
|------|--------------|--------------|-------------|-------------|
| 1    | Some Title 1 | Some blurb 1 | Some body 1 | false       |
| 2    | Some Title 1 | Some blurb 2 | Some body 2 | true        |
| 3    | Some Title 1 | Some blurb 3 | Some body 3 | false       |
| 4    | Some Title 1 | Some blurb 4 | Some body 4 | true        |

### comments

| id | post_id | comment   | created_at |
|----|---------|-----------|------------|
|  1 |       1 | Comment 1 | 2012-12-11 |
|  2 |       1 | Comment 2 | 2012-12-11 |
|  3 |       2 | Comment 3 | 2012-12-11 |
|  4 |       2 | Comment 4 | 2012-12-11 |
|  5 |       3 | Comment 5 | 2012-12-11 |
|  6 |       3 | Comment 6 | 2012-12-11 |
|  7 |       4 | Comment 7 | 2012-12-11 |
|  8 |       4 | Comment 8 | 2012-12-11 |

Given this setup:

    var FastLegSBase = require('FastLegS');

    // gonna use PostgreSQL
    var FastLegS = new FastLegSBase('pg');

    var connectionParams = {
      user: 'shes', password: 'got',
      database: 'legs', host: 'localhost', port: 5432
    }

    FastLegS.connect(connectionParams);

    var callback = function(err, results) {
      console.dir(err);
      console.dir(results);
    }
    
    var Comment = FastLegS.Base.extend({
      tableName: 'comments',
      primaryKey: 'id'
    });
    
    var Post = FastLegS.Base.extend({
      tableName: 'posts',
      primaryKey: 'id'
    });

The following are examples of basic CRUD operations:

## Create

Calls to ```create``` can take an object or an array of objects.

    Post.create(
      { id: 5, title: 'Some Title 5', body: 'Some body 5' },
      callback
    )

    Post.create(
      [{ id: 6, title: 'Some Title 6', body: 'Some body 6' },
       { id: 7, title: 'Some Title 7', body: 'Some body 7' }],
      callback
    )

The ```results``` passed to the callback are different depending on the 
database.

In the case of PostgreSQL, the ```results``` will be an object of the form:

    {
      rows: [{ id: 5,
             title: 'Some Title 5',
             blurb: null,
             body: 'Some body 5',
             published: null }],
      command: INSERT,
      rowCount: 1,
      oid: 0
    }

In the case of MySQL, the ```results``` will be an object of the form:

    {
      fieldCount: 0,
      affectedRows: 1,
      insertId: 0,
      serverStatus: 2,
      warningCount: 0,
      message: ''
    }

## Read

The various forms of the ```find``` command are very flexible. We'll present a 
few of them here.

#### All:

    Post.find({}, callback)

outputs:

    [ 
      { id: 1,
        title: 'Some Title 1',
        blurb: null,
        body: 'Some body 1',
        published: null,
        created_at: null,
        updated_at: null },
      ...
      { id: 5,
        title: 'Some Title 5',
        blurb: null,
        body: 'Some body 5',
        published: null,
        created_at: null,
        updated_at: null },
      { id: 6,
        title: 'Some Title 6',
        blurb: null,
        body: 'Some body 6',
        published: null,
        created_at: null,
        updated_at: null },
      { id: 7,
        title: 'Some Title 7',
        blurb: null,
        body: 'Some body 7',
        published: null,
        created_at: null,
        updated_at: null } 
    ]

#### By primary key:

    Post.find(6, callback)

outputs:

    {
      id: 6,
      title: 'Some Title 6',
      blurb: null,
      body: 'Some body 6',
      published: null,
      created_at: null,
      updated_at: null
    }

#### Only show some fields:

    Post.find(6, {only: ['id','title']}, callback)

outputs:

    { id: 6, title: 'Some Title 6' }

#### Some clauses:

    Post.find({'title.like': 'Some%'}, callback)
    Post.find({'id.in': [6, 7]}, callback)
    Post.find({'id.nin': [6]}, callback)
    Post.find({'$or': {'id.equals': 5, 'body.like': '%body 7'}}, callback)

#### Order, offset, limit

    Post.find({}, { order: ['-id'] }, callback)
    Post.find({}, { offset: 1, limit: 1 }, callback)

#### Count:

    Post.find({}, {count: true}, callback)

outputs:

    { count: 7 }

## Update

    Post.update(
      { title: 'Some Title 6' },
      { title: 'Renamed title' },
      callback
    )

## Delete

    Post.destroy({ 'id.in': [5, 7]}, callback)
    Post.truncate(callback)

## A Taste of Relationships

You can call out relationships when you extend FastLegS.Base:

    var Post = FastLegS.Base.extend({
      tableName: 'posts',
      primaryKey: 'id',
      many: [
        { 'comments': Comment, joinOn: 'post_id' }
      ]
    });
    
You can then create complex object relationships with join logic:

    Post.find(
      {}, 
      { include: { comments: { only: ['id', 'comment'] } } },
      callback
    )

outputs:

    [
      {
          body: 'Some body 1',
          title: 'Some Title 1',
          id: 1,
          updated_at: null,
          published: false,
          blurb: 'Some blurb 1',
          created_at: null,
          comments: [
              { id: 1, comment: 'Comment 1' },
              { id: 2, comment: 'Comment 2' }
          ]
      },
      {
          body: 'Some body 2',
          title: 'Some Title 2',
          id: 2,
          updated_at: null,
          published: true,
          blurb: null,
          created_at: null,
          comments: [
              { id: 3, comment: 'Comment 3' },
              { id: 4, comment: 'Comment 4' }
          ]
      },
      ...
    ]

Here's a many-to-many example based on these tables:

### students

| id | name      |
|----|-----------|
| 1  | Abe       |
| 2  | Ben       |
| 3  | Christine |
| 4  | Delia     |
| 5  | Egwene    |

### professors

| id | name   |
|----|--------|
| 6  | Felix  |
| 7  | Garret |
| 8  | Horton |
| 9  | Irene  |
| 10 | Jane   |

### student_professor

| student_id | professor_id |
|------------|--------------|
| 1          | 6            |
| 2          | 6            |
| 3          | 7            |
| 4          | 7            |
| 5          | 8            |
| 1          | 8            |
| 2          | 9            |
| 3          | 9            |
| 4          | 10           |
| 5          | 10           |


    var Student = FastLegS.Base.extend({
      tableName: 'students',
      primaryKey: 'id',
    });

    var Professor = FastLegS.Base.extend({
      tableName: 'professors',
      primaryKey: 'id',
    })

    var StudentProfessor = FastLegS.Base.extend({
      tableName: 'student_professor',
      foreignKeys: [
         { model: Student, key: 'student_id' },
         { model: Professor, key: 'professor_id' }
      ]
    })

    Student.many = [{
      professors: Professor,
      assoc: StudentProfessor
    }]

    Professor.many = [{
      students: Student,
      assoc: StudentProfessor
    }]

    Professor.findOne(
      9,
      {include: { students: {} }},
      function(err, result) {
        inspect(result)
      }
    )

outputs:

    {
      id: 9,
      name: 'Irene',
      students: [
          { id: 2, name: 'Ben' },
          { id: 3, name: 'Christine' }
      ]
    }

This shows that ```professor``` Irene has ```students``` Ben and Christine

## Summary

The tests are an excellent reference for the various modifiers and syntactic 
sugar you can use in FastLegS.

## ToDo

Right now, the codebase is split because of syntactic differences between 
PostgreSQL and MySQL. There is a lot of duplicated code, however. Future 
versions should abstract out the differences and merge the duplicated code.

Watch for updates to examples in the near future to show features like 
relationships and advanced queries.

# Contributors

* Micah Silverman ([dogeared](https://github.com/dogeared))
* Thad Clay ([thadclay](https://github.com/thadclay))
* Jan Paul Erkelens ([jperkelens](https://github.com/jperkelens))
* Rob Malko ([malkomalko](https://github.com/malkomalko))
* Jim Drannbauer ([excellentdrums](https://github.com/excellentdrums))
