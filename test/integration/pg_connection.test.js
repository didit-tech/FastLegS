/**
 * Module dependencies
 */

var expect = require('expect.js');
var helper = require('../test_helper.js');
var Client = require('../../lib/fast_legs/client');

describe('Pg connection', function() { 
  it('surfaces error in the callback when pg connection fails', function() { 
    var client = new Client();
    client.connect();
    client.emit('query', 'Select now();', function(err, result) { 
      expect(err).to.not.be(null);
    });
  });
})
