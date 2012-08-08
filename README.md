[![Build Status](https://secure.travis-ci.org/didit-tech/FastLegS.png)](http://travis-ci.org/didit-tech/FastLegS)
#FastLegS

PostgreSQL ORM on top of node-postgres.

## Installation

    npm install FastLegS

## Quickstart

    var FastLegS = require('FastLegS');

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

    Post.create({ title: 'Some Title 1', body: 'Some body 1' }, function(err, results) {
      Post.find({ 'title.ilike': '%title%' }, { only: ['id', 'body'] }, function(err, post) {
        // Hooray!
      });
    });

#The Full Monty

For the time being while we are writing up the most awesome README you've
ever seen, why don't you try checking out our amazing tests for the full
story.

#Contributors

* Thad Clay (thadclay)
* Jim Drannbauer (excellentdrums)
* Rob Malko (malkomalko)
