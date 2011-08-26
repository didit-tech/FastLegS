/**
 * Module dependencies.
 */

var Base   = require('./base');
var Client = require('./client');

/**
 * FastLegs.
 */

var FastLegS = function() {
  this.version = '0.1.2';
};

FastLegS.prototype.connect = function(connParams) {
  var client = new Client(connParams);
  client.connect();
  this.Base = new Base(client);
  this.client = client;
  return this;
};

module.exports = exports = new FastLegS();
