/**
 * Module dependencies
 */

var expect = require('expect.js');
var helper = require('../test_helper.js');
var ClientPG = require('../../lib/fast_legs/pg/client');
var ClientMySQL = require('../../lib/fast_legs/mysql/client');

describe('connection', function() { 
  it('surfaces error in the callback when pg connection fails', function() { 
    var client = new ClientPG();
    client.connect();
    client.emit('query', 'Select now();', function(err, result) { 
      expect(err).to.not.be(null);
    });
  });

  it('surfaces error in the callback when mysql connection fails', function() {
    var client = new ClientMySQL();
    client.connect();
    client.emit('query', 'Select now();', function(err, result) {
      expect(err).to.not.be(null);
    })
  })
})
