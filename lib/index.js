var Base   = require('./base');
var Client = require('./client');

/**
 * FastLegs.
 */

module.exports = function(connParams) {
  f = new FastLegS();
  f.connParams = connParams;
  return f;
};

function FastLegS() {
  this.version = '0.3.5';
}

FastLegS.prototype.connect = function() {
  var client = new Client(this.connParams);
  client.connect();
  this.Base = new Base(client);
  this.query = client.query;
  return this;
}

