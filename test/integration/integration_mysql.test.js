/**
 * Module dependencies.
 */

var expect = require('expect.js');
var helper = require('../test_helper.js');
var fs = require('fs');
var fl = require('../../../FastLegS');
var async = require('async');
var _ = require('underscore')._;

/**
 * Logging.
 */

var logging = false;

/**
 * Integration test.
 */

  var config = fs.readFileSync(__dirname + '/../../.fastlegs_mysql', 'utf8');
  config = JSON.parse(config);

  var connParams = {
      user:     config.username
    , password: config.password
    , database: config.database
    , host:     config.host
    , port:     config.port
  };

  var FastLegS = new fl('mysql');
  FastLegS.connect(connParams);

  var posts = [
    { id: 1, title: 'Some Title 1', blurb: 'Some blurb 1',
      body: 'Some body 1', published: false },
    { id: 2, title: 'Some Title 2',
      body: 'Some body 2', published: true },
    { id: 3, title: 'Some Title 3', blurb: 'Some blurb 3',
      body: 'Some body 3', published: true },
    { id: 4, title: '\'lol\\"', blurb: 'Extra\'"\\"\'\'--',
      body: '"""--\\\'"', published: false }
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

describe('Integrates', function() { 
  before(function(done) {
    Comment.truncate(function(err, result) {
      expect(err).to.be(null)
      Post.truncate(function(err, result) {
        expect(err).to.be(null)
        done()
      });
    });
  });  

  it('creates multiple posts', function(done) {
    Post.create(posts, function(err, result) {
      expect(posts.length).to.be(result.affectedRows);
      done();
    });
  });
  
  it('creates multiple comments', function(done) {
    Comment.create(comments, function(err, result) {
      expect(comments.length).to.be(result.affectedRows);
      done();
    })
  });
  
  it('find a post by primary key', function(done) {
    Post.find(posts[0].id, function(err, results) {
      expect(posts[0].title).to.be(results.title);
      done();
    });
  });
  
  it('find a post and only return certain fields', function(done) {
    Post.find(posts[1].id, { only: ['id'] }, function(err, results) {
      expect(results.title).to.be(undefined);     
      done();
    });
  });
  
  it('find a comment by primary key', function(done) {
    Comment.find(comments[0].id, function(err, results) {
      expect(comments[0].comment).to.be(results.comment);
      done();
    });
  });
  
  it('find a comment and only return certain fields', function(done) {
    Comment.find(comments[1].id, { only: ['id'] }, function(err, results) {
      expect(results.comment).to.be(undefined);
      done();
    });
  });
  
  it('find a post with a basic include(join)', function(done) {
    Post.find(posts[0].id, {
      include: {
        'comments': { }
      }
    }, function(err, results) {
      expect(results.comments.length).to.be(2);
      done();
    })
  });
  
  it('find a post with advanced include(join) opts', function(done) {
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
      expect(results[0].comments.length).to.be(2);
      done();
    });
  });
  
  it('multiple comments by id', function(done) {
    var ids = _.pluck(comments, 'id');
    Comment.find(ids, function(err, results) {
      expect(results.length).to.be(ids.length);
      done();
    })
  });
  
  it('properly ignores unknown columns', function(done) {
    Post.find({ 'body': 'Some body 2' }, {
      only: ['id', 'bad_field']
    }, function(err, results) {
      expect(results.length).to.be(1);
      done();
    })
  });
  
  it('ignores all unknown columns returning everything', function(done) {
    Post.find({ 'id': 1 }, {
      only: ['bad_field']
    }, function(err, results) {
      expect(results.length).to.be(1);
      done();
    });
  });

  it('ignores empty only clause returning everything', function(done) {
    Post.find({ 'id': 2 }, {
      only: []
    }, function(err, results) {
      expect(results.length).to.be(1);
      done();
    });
  });

  it('find using in clause with one item', function(done) {
    Post.find({
      'title.in': ['Some Title 1']
    }, function(err, results) {
      expect(results.length).to.be(1);
      done();
    });
  });
  
  it('find using in clause with multiple items', function(done) {
    Post.find({
      'title.in': ['Some Title 1', 'Some Title 2']
    }, function(err, results) {
      expect(results.length).to.be(2);
      done();
    });
  });

  it('find count using in clause with multiple items', function(done) {
    Post.find({
      'title.in': ['Some Title 1', 'Some Title 2']
    }, { count: true }, function(err, result) {
      expect(result.count).to.be(2);
      done();
    });
  });

  it('find using nin clause with one item', function(done) {
    Post.find({
      'title.nin': ['Some Title 1']
    }, function(err, results) {
      expect(results.length).to.be(3);
      done();
    });
  });

  it('find using nin clause with multiple items', function(done) {
    Post.find({
      'title.nin': ['Some Title 1', 'Some Title 2']
    }, function(err, results) {
      expect(results.length).to.be(2);
      done();
    });
  });

  it('find using not_in clause with one item', function(done) {
    Post.find({
      'title.nin': ['Some Title 1']
    }, function(err, results) {
      expect(results.length).to.be(3);
      done();
    });
  });

  it('find using not_in clause with multiple items', function(done) {
    Post.find({
      'title.nin': ['Some Title 1', 'Some Title 2']
    }, function(err, results) {
      expect(results.length).to.be(2);
      done();
    });
  });

  it('findOne comment via a basic selector', function(done) {
    Comment.findOne({ 'comment':'Comment 5' }, function(err, comment) {
      expect(comment.comment).to.be('Comment 5');
      done();
    });
  });

  it('findOne returns undefined when not found', function(done) {
    Comment.findOne({ 'comment':'Comment 18' }, function(err, comment) {
      expect(comment).to.be(undefined);
      done();
    });
  });

  it('findOne: find a post with a basic include(join)', function(done) {
    Post.findOne({ 'title': 'Some Title 1' }, {
      include: {
        'comments': { }
      }
    }, function(err, results) {
      expect(results.comments.length).to.be(2);
      done();
    })
  });

  it('find a post and return alias fields', function(done) {
    Post.find({ 'id': 1 }, {
      only: {  'title'     : 'some_alias_title'
             , 'blurb'     : 'some_alias_blurb'
             , 'body'      : 'some_alias_body'
             , 'published' : 'some_alias_published'}
    }, function(err, results) {
      expect(results[0]['some_alias_title']).to.be(posts[0].title);
      expect(results[0]['some_alias_body'], posts[0].body);
      expect(results[0]['some_alias_published'], posts[0].published);
      expect(results[0]['some_alias_blurb'], posts[0].blurb);
      done();
    });
  });

  it('find a post and order results descending using aliased columns', function(done) {
    Post.find([1,2], {
      only: { 'title' : 'some_alias_title',
              'id'    : 'some id'},
      order: ['-some id']
    }, function(err, results) {
      expect(results[0]['some id'], posts[1].id);
      expect(results[1]['some id'], posts[0].id);
      done();
    });
  });

  it('find last 2 post ids using offset', function(done) {
    Post.find({}, { only: ['id'], offset: 2 }, function(err, results) {
      expect(results[0].id, posts[2].id);
      expect(results[1].id, posts[3].id);
      done();
    })
  });

  it('find with order and limit', function(done) {
    Post.find({}, {
      only: ['id'],
      order: ['-id'],
      limit: 1
    }, function(err, results) {
      expect(results[0].id, posts[3].id);
      done();
    })
  });
  
  it('find with order and offset', function(done) {
    Post.find({}, {
      only: ['id'],
      order: ['-id'],
      offset: 1
    }, function(err, results) {
      expect(results[0].id, posts[2].id);
      expect(results[1].id, posts[1].id);
      expect(results[2].id, posts[0].id);
      done();
    })
  });

  it('find with order, offset and limit', function(done) {
    Post.find({}, {
      only: ['id'],
      order: ['-id'],
      offset: 1,
      limit: 2
    }, function(err, results) {
      expect(results[0].id, posts[2].id);
      expect(results[1].id, posts[1].id);
      done();
    })
  });

  it('find a post with empty blurbs', function(done) {
    var expected = 0;
    _.each(posts, function(post) {
      if (_.isNull(post.blurb) || _.isUndefined(post.blurb)) { expected++; }
    });

    Post.find({'blurb' : null}, function(err, results) {
      expect(results.length).to.be(expected);
      done();
    });
  });

  it('updates new post title', function(done) {
    Post.update({ 'title': 'Some Title 1' }, {
      'title': 'Renamed Title'
    }, function(err, results) {
      expect(results).to.be(1);
      done();
    });
  });

  it('updates new post title with weird characters', function(done) {
    var newTitle = '"\'pants';
    Post.update(4, {'title' : newTitle}, function(er, results) {
      expect(results).to.be(1);
      Post.findOne(4, function(err, post) {
        expect(post.title).to.be(newTitle);
        done();
      });
    });
  });

  it('destroy comment by primary key', function(done) {
    Comment.destroy(8, function(err, results) {
      expect(results).to.be(1);
      done();
    });
  });

  it('destroys multiple comments by primary key', function(done) {
    Comment.destroy([7, 6], function(err, results) {
      expect(results).to.be(2);
      done();
    });
  });

  it('destroys comments via a basic selector', function(done) {
    Comment.destroy({ 'comment':'Comment 5' }, function(err, results) {
      expect(results).to.be(1);
      done();
    });
  });

  it('destroys all comments', function(done) {
    Comment.destroy(function(err, results) {
      expect(results).to.be(4);
      done();
    });
  });

  it('destroys nothing via empty selector', function(done) {
    Comment.destroy(function(err, results) {
      expect(results).to.be(0);
      done();
    });
  });

  it('destroys nothing via empty array', function(done) {
    Comment.destroy([], function(err, results) {
      expect(results).to.be(0);
      done();
    });
  });

  it('destroys nothing via bad selector', function(done) {
    Comment.destroy({ 'bad_field': 3 }, function(err, results) {
      expect(results).to.be(0);
      done();
    });
  });

  it('truncate', function(done) {
    Post.truncate({ cascade: true }, function(err, results) {
      expect(results).to.be(true);
      done();
    });
  });

  it('finds nothing', function(done) {
    var ids = _.pluck(posts, 'id');
    Post.find(ids, function(err, results) {
      expect(results).to.be.empty;
      done();
    });
  });

  it('finds nothing', function(done) {
    Post.find(posts[0].id, function(err, results) {
      expect(results).to.be(null);
      done();
    });
  });

  it('finds no posts with bad selector', function(done) {
    Post.find({ 'bad_field': 12 }, function(err, results) {
      expect(results).to.be.empty;
      done();
    });
  });

  /*
   *after(function(done) {
   *  FastLegS.client.disconnect();
   *  done();
   *});
   */
})
