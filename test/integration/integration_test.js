var helper = require('../test_helper.js')
  , fs = require('fs')
  , logging = true;

module.exports = {
  'integrates': function() {
    var config = fs.readFileSync(__dirname + '/../../.fastlegs', 'utf8');
    config = JSON.parse(config);

    var connParams = {
        user:     config.username
      , password: config.password
      , database: config.database
      , host:     config.host
      , port:     config.port
    };

    FastLegS.connect(connParams);

    var posts = [
      { id: 1, title: 'Some Title 1', blurb: 'Some blurb 1',
        body: 'Some body 1', published: false },
      { id: 2, title: 'Some Title 2',
        body: 'Some body 2', published: true },
      { id: 3, title: 'Some Title 3', blurb: 'Some blurb 3',
        body: 'Some body 3', published: true },
      { id: 4, title: 'Some Title 4', blurb: 'Some blurb 4',
        body: 'Some body 4', published: true }
    ]

    var comments = [
      { id: 1, post_id: 1, comment: 'Comment 1', created_at: new Date() },
      { id: 2, post_id: 1, comment: 'Comment 2', created_at: new Date() },
      { id: 3, post_id: 2, comment: 'Comment 3', created_at: new Date() },
      { id: 4, post_id: 2, comment: 'Comment 4', created_at: new Date() },
      { id: 5, post_id: 3, comment: 'Comment 5', created_at: new Date() },
      { id: 6, post_id: 3, comment: 'Comment 6', created_at: new Date() },
      { id: 7, post_id: 4, comment: 'Comment 7', created_at: new Date() },
      { id: 8, post_id: 4, comment: 'Comment 8', created_at: new Date() }
    ]

    var Comment = FastLegS.Base.extend({
      tableName: 'comments',
      primaryKey: 'id'
    });

    var Post = FastLegS.Base.extend({
      tableName: 'posts',
      primaryKey: 'id',
      many: [
        { 'comments': Comment, joinOn: 'post_id' }
      ]
    });

    async.series({
      'setup: truncates database': function(callback) {
        Comment.truncate(function(err, result) {
          Post.truncate({ cascade: true }, function(err, result) {
            assert.eql(true, result);
            callback(err, result);
          });
        });
      },
      'create: create multiple posts': function(callback) {
        Post.create(posts, function(err, result) {
          assert.eql(posts.rowCount, result.rowCount);
          callback(err, result);
        });
      },
      'create: create multiple comments': function(callback) {
        Comment.create(comments, function(err, result) {
          assert.eql(comments.rowCount, result.rowCount);
          callback(err, result);
        })
      },
      'find: find a post by primary key': function(callback) {
        Post.find(posts[0].id, function(err, results) {
          assert.eql(posts[0].title, results.title);
          callback(err, results);
        });
      },
      'find: find a post and only return certain fields': function(callback) {
        Post.find(posts[1].id, { only: ['id'] }, function(err, results) {
          assert.isUndefined(results.title);
          callback(err, results);
        });
      },
      'find: find a comment by primary key': function(callback) {
        Comment.find(comments[0].id, function(err, results) {
          assert.eql(comments[0].comment, results.comment);
          callback(err, results);
        });
      },
      'find: find a comment and only return certain fields': function(callback) {
        Comment.find(comments[1].id, { only: ['id'] }, function(err, results) {
          assert.isUndefined(results.comment);
          callback(err, results);
        });
      },
      'find: find a post with a basic include(join)': function(callback) {
        Post.find(posts[0].id, {
          include: {
            'comments': { }
          }
        }, function(err, results) {
            assert.eql(2, results.comments.length);
            callback(err, results);
        })
      },
      'find: find a post with advanced include(join) opts': function(callback) {
        Post.find({ 'blurb.ilike': '%Some blurb%' }, {
          only: ['id', 'blurb'],
          include: {
            'comments': {
              where: {'published': true },
              only: ['id', 'post_id', 'published'],
              order: ['id']
            }
          }
        }, function(err, results) {
          assert.eql(2, results[0].comments.length);
          callback(err, results);
        });
      },
      'find: multiple comments by id': function(callback) {
        var ids = _.pluck(comments, 'id');
        Comment.find(ids, function(err, results) {
          assert.eql(ids.length, results.length);
          callback(err, results)
        })
      },
      'find: properly ignores unknown columns': function(callback) {
        Post.find({ 'body': 'Some body 2' }, {
          only: ['id', 'bad_field']
        }, function(err, results) {
          assert.eql(1, results.length);
          callback(err, results);
        })
      },
      'find: ignores all unknown columns returning everything': function(callback) {
        Post.find({ 'id': 1 }, {
          only: ['bad_field']
        }, function(err, results) {
          assert.eql(1, results.length);
          callback(err, results);
        });
      },
      'find: ignores empty only clause returning everything': function(callback) {
        Post.find({ 'id': 2 }, {
          only: []
        }, function(err, results) {
          assert.eql(1, results.length);
          callback(err, results);
        });
      },
      'findOne: comment via a basic selector': function(callback) {
        Comment.findOne({ 'comment':'Comment 5' }, function(err, comment) {
          assert.eql('Comment 5', comment.comment);
          callback(err, comment);
        });
      },
      'findOne: returns undefined when not found': function(callback) {
        Comment.findOne({ 'comment':'Comment 18' }, function(err, comment) {
          assert.eql(undefined, comment);
          callback(err, comment);
        });
      },
      'findOne: find a post with a basic include(join)': function(callback) {
        Post.findOne({ 'title': 'Some Title 1' }, {
          include: {
            'comments': { }
          }
        }, function(err, results) {
          assert.eql(2, results.comments.length);
          callback(err, results);
        })
      },
      'update: new post title': function(callback) {
        Post.update({ 'title': 'Some Title 1' }, {
          'title': 'Renamed Title'
        }, function(err, results) {
          assert.eql(1, results);
          callback(err, results);
        });
      },
      'destroy: comment by primary key': function(callback) {
        Comment.destroy(8, function(err, results) {
          assert.eql(1, results);
          callback(err, results);
        });
      },
      'destroy: multiple comments by primary key': function(callback) {
        Comment.destroy([7, 6], function(err, results) {
          assert.eql(2, results);
          callback(err, results);
        });
      },
      'destroy: comment via a basic selector': function(callback) {
        Comment.destroy({ 'comment':'Comment 5' }, function(err, results) {
          assert.eql(1, results);
          callback(err, results);
        });
      },
      'destroy: all comments': function(callback) {
        Comment.destroy(function(err, results) {
          assert.eql(4, results);
          callback(err, results);
        });
      },
      'destroy: nothing via empty selector': function(callback) {
        Comment.destroy(function(err, results) {
          assert.eql(0, results);
          callback(err, results);
        });
      },
      'destroy: nothing via empty array': function(callback) {
        Comment.destroy([], function(err, results) {
          assert.eql(0, results);
          callback(err, results);
        });
      },
      'destroy: nothing via bad selector': function(callback) {
        Comment.destroy({ 'bad_field': 3 }, function(err, results) {
          assert.eql(0, results);
          callback(err, results);
        });
      },
      'truncate': function(callback) {
        Post.truncate({ cascade: true }, function(err, results) {
          assert.eql(true, results);
          callback(err, results);
        });
      },
      'find: nothing': function(callback) {
        var ids = _.pluck(posts, 'id');
        Post.find(ids, function(err, results) {
          assert.eql([], results);
          callback(err, results);
        });
      },
      'find: nothing': function(callback) {
        Post.find(posts[0].id, function(err, result) {
          assert.isNull(result);
          callback(err, result);
        });
      },
      'find: no posts with bad selector': function(callback) {
        Post.find({ 'bad_field': 12 }, function(err, result) {
          assert.eql([], result);
          callback(err, result);
        });
      }
    },
    function(err, result) {
      if (logging) {
        if (err)
          console.log(err);
        else
          console.log(result);
      }
      FastLegS.client.disconnect();
    });
  }
};
