/**
 * Module dependencies.
 */

var Base   = require('./base');
var Client = require('./client');

/**
 * FastLegs.
 */

var FastLegS = module.exports = function(db) {
  this.version = '0.1.5';
  this.db = db || 'pg';
};

FastLegS.prototype.connect = function(connParams) {
  var client = new Client(connParams, this.db);
  client.connect();
  this.Base = new Base(client);
  this.client = client;
  return this;
};
