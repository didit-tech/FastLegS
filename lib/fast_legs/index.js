/**
 * FastLegs.
 */

var FastLegS = module.exports = function(db) {
  this.version = '0.1.5';
  this.db = db || 'pg';
};

FastLegS.prototype.connect = function(connParams) {
  var Client = require('./'+(this.db)+'/client')
  var Base = require('./'+(this.db)+'/base')
  var client = new Client(connParams);
  client.connect();
  this.Base = new Base(client);
  this.client = client;
  return this;
};
