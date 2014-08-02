/**
 * Module dependencies.
 */

var expect = require('expect.js');
var helper = require('../test_helper.js');
var fs = require('fs');
var FastLegS = require('../../');
var async = require('async');
var _ = require('lodash')

/**
 * Logging.
 */

var logging = false;

/**
 * Integration test.
 */

var config = fs.readFileSync(__dirname + '/../../.fastlegs', 'utf8');
config = JSON.parse(config);

var connParams = {
    user:     config.username
  , password: config.password
  , database: config.database
  , host:     config.host
  , port:     config.port
};

var fl = FastLegS(connParams);
fl.connect({ pool: true });

var models = helper(fl);

describe('Integrates pg', function() {
  before(function(done) {
    async.parallel([
      function(next) { models.Post.truncate(next) },
      function(next) { models.Comment.truncate(next) },
      function(next) { models.Student.truncate(next) },
      function(next) { models.Professor.truncate(next) },
      function(next) { models.StudentProfessor.truncate(next) }
    ], function(err) {
      expect(err).to.be(undefined)
      done()
    })
  });

  _.each([
    { name: 'posts', model: models.Post, data: models.posts },
    { name: 'comments', model: models.Comment, data: models.comments },
    { name: 'students', model: models.Student, data: models.students },
    { name: 'professors', model: models.Professor, data: models.professors },
    {
      name: 'student_professors',
      model: models.StudentProfessor,
      data: models.student_professor
    }
  ], function(testItem) {
    it('creates multiple rows in table: ' + testItem.name, function(done) {
      testItem.model.create(testItem.data, function(err, rows, result) {
        expect(err).to.be(null);
        expect(testItem.data.length).to.be(result.rowCount);
        done();
      });
    });
  });

  it('find a post by primary key', function(done) {
    models.Post.find(models.posts[0].id, function(err, results) {
      expect(models.posts[0].title).to.be(results.title);
      done();
    });
  });

  it('find a post and only return certain fields', function(done) {
    models.Post.find(models.posts[1].id, { only: ['id'] }, function(err, results) {
      expect(results.title).to.be(undefined);
      done();
    });
  });

  it('find a comment by primary key', function(done) {
    models.Comment.find(models.comments[0].id, function(err, results) {
      expect(models.comments[0].comment).to.be(results.comment);
      done();
    });
  });

  it('find a comment and only return certain fields', function(done) {
    models.Comment.find(models.comments[1].id, { only: ['id'] }, function(err, results) {
      expect(results.comment).to.be(undefined);
      done();
    });
  });

  it('find a post with a basic include(join)', function(done) {
    models.Post.find(models.posts[0].id, {
      include: {
        'comments': { }
      }
    }, function(err, results) {
      expect(results.comments.length).to.be(2);
      done();
    })
  });

  it('find a post with advanced include(join) opts', function(done) {
    models.Post.find({ 'blurb.ilike': '%Some blurb%' }, {
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
    var ids = _.pluck(models.comments, 'id');
    models.Comment.find(ids, function(err, results) {
      expect(results.length).to.be(ids.length);
      done();
    })
  });

  it('properly ignores unknown columns', function(done) {
    models.Post.find({ 'body': 'Some body 2' }, {
      only: ['id', 'bad_field']
    }, function(err, results) {
      expect(results.length).to.be(1);
      done();
    })
  });

  it('ignores all unknown columns returning everything', function(done) {
    models.Post.find({ 'id': 1 }, {
      only: ['bad_field']
    }, function(err, results) {
      expect(results.length).to.be(1);
      done();
    });
  });

  it('ignores empty only clause returning everything', function(done) {
    models.Post.find({ 'id': 2 }, {
      only: []
    }, function(err, results) {
      expect(results.length).to.be(1);
      done();
    });
  });

  it('find using in clause with one item', function(done) {
    models.Post.find({
      'title.in': ['Some Title 1']
    }, function(err, results) {
      expect(results.length).to.be(1);
      done();
    });
  });

  it('find using in clause with multiple items', function(done) {
    models.Post.find({
      'title.in': ['Some Title 1', 'Some Title 2']
    }, function(err, results) {
      expect(results.length).to.be(2);
      done();
    });
  });

  it('find count using in clause with multiple items', function(done) {
    models.Post.find({
      'title.in': ['Some Title 1', 'Some Title 2']
    }, { count: true }, function(err, result) {
      expect(result.count).to.be(2);
      done();
    });
  });

  it('find using nin clause with one item', function(done) {
    models.Post.find({
      'title.nin': ['Some Title 1']
    }, function(err, results) {
      expect(results.length).to.be(3);
      done();
    });
  });

  it('find using nin clause with multiple items', function(done) {
    models.Post.find({
      'title.nin': ['Some Title 1', 'Some Title 2']
    }, function(err, results) {
      expect(results.length).to.be(2);
      done();
    });
  });

  it('find using not_in clause with one item', function(done) {
    models.Post.find({
      'title.nin': ['Some Title 1']
    }, function(err, results) {
      expect(results.length).to.be(3);
      done();
    });
  });

  it('find using not_in clause with multiple items', function(done) {
    models.Post.find({
      'title.nin': ['Some Title 1', 'Some Title 2']
    }, function(err, results) {
      expect(results.length).to.be(2);
      done();
    });
  });

  it('findOne comment via a basic selector', function(done) {
    models.Comment.findOne({ 'comment':'Comment 5' }, function(err, comment) {
      expect(comment.comment).to.be('Comment 5');
      done();
    });
  });

  it('findOne returns undefined when not found', function(done) {
    models.Comment.findOne({ 'comment':'Comment 18' }, function(err, comment) {
      expect(comment).to.be(undefined);
      done();
    });
  });

  it('findOne: find a post with a basic include(join)', function(done) {
    models.Post.findOne({ 'title': 'Some Title 1' }, {
      include: {
        'comments': { }
      }
    }, function(err, results) {
      expect(results.comments.length).to.be(2);
      done();
    })
  });

  it('find a post and return alias fields', function(done) {
    models.Post.find({ 'id': 1 }, {
      only: {  'title'     : 'some_alias_title'
             , 'blurb'     : 'some_alias_blurb'
             , 'body'      : 'some_alias_body'
             , 'published' : 'some_alias_published'}
    }, function(err, results) {
      expect(results[0]['some_alias_title']).to.be(models.posts[0].title);
      expect(results[0]['some_alias_body'], models.posts[0].body);
      expect(results[0]['some_alias_published'], models.posts[0].published);
      expect(results[0]['some_alias_blurb'], models.posts[0].blurb);
      done();
    });
  });

  it('find a post and order results descending using aliased columns', function(done) {
    models.Post.find([1,2], {
      only: { 'title' : 'some_alias_title',
              'id'    : 'some id'},
      order: ['-some id']
    }, function(err, results) {
      expect(results[0]['some id'], models.posts[1].id);
      expect(results[1]['some id'], models.posts[0].id);
      done();
    });
  });

  it('find last 2 post ids using offset', function(done) {
    models.Post.find({}, { only: ['id'], offset: 2 }, function(err, results) {
      expect(results[0].id, models.posts[2].id);
      expect(results[1].id, models.posts[3].id);
      done();
    })
  });

  it('find with order and limit', function(done) {
    models.Post.find({}, {
      only: ['id'],
      order: ['-id'],
      limit: 1
    }, function(err, results) {
      expect(results[0].id, models.posts[3].id);
      done();
    })
  });

  it('find with order and offset', function(done) {
    models.Post.find({}, {
      only: ['id'],
      order: ['-id'],
      offset: 1
    }, function(err, results) {
      expect(results[0].id, models.posts[2].id);
      expect(results[1].id, models.posts[1].id);
      expect(results[2].id, models.posts[0].id);
      done();
    })
  });

  it('find with order, offset and limit', function(done) {
    models.Post.find({}, {
      only: ['id'],
      order: ['-id'],
      offset: 1,
      limit: 2
    }, function(err, results) {
      expect(results[0].id, models.posts[2].id);
      expect(results[1].id, models.posts[1].id);
      done();
    })
  });

  it('find a post with empty blurbs', function(done) {
    var expected = 0;
    _.each(models.posts, function(post) {
      if (_.isNull(post.blurb) || _.isUndefined(post.blurb)) { expected++; }
    });

    models.Post.find({'blurb' : null}, function(err, results) {
      expect(results.length).to.be(expected);
      done();
    });
  });

  it('updates new post title', function(done) {
    models.Post.update({ 'title': 'Some Title 1' }, {
      'title': 'Renamed Title'
    }, function(err, results) {
      expect(results).to.be(1);
      done();
    });
  });

  it('updates new post title with weird characters', function(done) {
    var newTitle = '"\'pants';
    models.Post.update(4, {'title' : newTitle}, function(er, results) {
      expect(results).to.be(1);
      models.Post.findOne(4, function(err, post) {
        expect(post.title).to.be(newTitle);
        done();
      });
    });
  });

  it('destroy comment by primary key', function(done) {
    models.Comment.destroy(8, function(err, results) {
      expect(results).to.be(1);
      done();
    });
  });

  it('destroys multiple comments by primary key', function(done) {
    models.Comment.destroy([7, 6], function(err, results) {
      expect(results).to.be(2);
      done();
    });
  });

  it('destroys comments via a basic selector', function(done) {
    models.Comment.destroy({ 'comment':'Comment 5' }, function(err, results) {
      expect(results).to.be(1);
      done();
    });
  });

  it('destroys all comments', function(done) {
    models.Comment.destroy(function(err, results) {
      expect(results).to.be(4);
      done();
    });
  });

  it('destroys nothing via empty selector', function(done) {
    models.Comment.destroy(function(err, results) {
      expect(results).to.be(0);
      done();
    });
  });

  it('destroys nothing via empty array', function(done) {
    models.Comment.destroy([], function(err, results) {
      expect(results).to.be(0);
      done();
    });
  });

  it('destroys nothing via bad selector', function(done) {
    models.Comment.destroy({ 'bad_field': 3 }, function(err, results) {
      expect(results).to.be(0);
      done();
    });
  });

  it('truncate', function(done) {
    models.Post.truncate({ cascade: true }, function(err, results) {
      expect(results).to.be(true);
      done();
    });
  });

  it('finds nothing', function(done) {
    var ids = _.pluck(models.posts, 'id');
    models.Post.find(ids, function(err, results) {
      expect(results).to.be.empty;
      done();
    });
  });

  it('finds nothing', function(done) {
    models.Post.find(models.posts[0].id, function(err, results) {
      expect(results).to.be(null);
      done();
    });
  });

  it('finds no posts with bad selector', function(done) {
    models.Post.find({ 'bad_field': 12 }, function(err, results) {
      expect(results).to.be.empty;
      done();
    });
  });

  var validateM2M = function(result) {
    var studentIds = _.pluck(result.students, 'id')
    expect(studentIds.length).to.be(2)
    _.each(studentIds, function(studentId) {
      found = _.where(
        models.student_professor,
        {student_id: studentId, professor_id: result.id }
      )
      expect(found.length).to.be(1)
    })
  }

  it('finds many to many', function(done) {
    var options = { include: { students: {} } };
    models.Professor.find({}, options, function(err, results) {
      _.each(results, function(result) {
        validateM2M(result)
      });
      done();
   });
  });

  it('finds many to many by id', function(done) {
    var options = { include: { students: {} } };
    models.Professor.findOne(9, options, function(err, result) {
      validateM2M(result);
      done();
    });
  });
})

