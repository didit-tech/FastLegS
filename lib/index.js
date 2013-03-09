/**
 * FastLegs.
 */

var FastLegS = module.exports = function(db) {
  this.version = '0.3.4';
  this.db = db || 'pg';
};

FastLegS.prototype.connect = function(connParams) {
  var Client = require('./adapters/'+(this.db)+'/client');
  var Base = require('./adapters/'+(this.db)+'/base');
  var client = new Client(connParams);
  client.connect();
  this.Base = new Base(client);
  this.client = client;
  return this;
};
