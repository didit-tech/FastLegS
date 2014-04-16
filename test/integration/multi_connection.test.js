/**
 * Module dependencies
 */

var expect = require('expect.js');
var helper = require('../test_helper.js');
var Client = require('../../lib/client');

describe('connection', function() {
  it('surfaces error in the callback when pg connection fails', function(done) {
    var client = new Client();
    client.connect();
    client.query('Select now();', function(err, result) {
      expect(err).to.not.be.null;
      done();
    });
  });
})
