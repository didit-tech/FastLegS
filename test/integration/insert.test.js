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
 * Integration test.
 */

var config = fs.readFileSync(__dirname + '/../../.fastlegs', 'utf8');
config = JSON.parse(config);

var connParams = {
  user:     config.username,
  password: config.password,
  database: config.database,
  host:     config.host,
  port:     config.port
};

var fl = FastLegS(connParams);
fl.connect();

var Student = fl.Base.extend({
  tableName: 'students',
  primaryKey: 'id',
});

describe('Inserts', function() {
  var data = [
    { id: 1, name: 'John', stats: { height: 5, weight: 100 } },
    { id: 2, name: 'James', stats: null },
    { id: 3, name: 'Jack', stats: { height: 6, weight: 185 } },
  ];
  beforeEach(function(done) {
    Student.truncate(function(err, rows, result) {
      expect(err).to.be(null);
      done();
    });
  });

  it('creates one row in table students', function(done) {
    Student.create(data[0], function(err, rows, result) {
      expect(err).to.be(null);
      expect(result.rowCount).to.be(1);
      done()
    });
  });

  it('creates multiple rows in table students', function(done) {
    Student.create(data, function(err, rows, result) {
      expect(err).to.be(null);
      expect(result.rowCount).to.be(data.length);
      done()
    });
  });
});
