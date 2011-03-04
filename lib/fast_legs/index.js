exports.version = '0.0.1';

var Base   = require('./base')
  , Client = require('./client');

var FastLegS = function() {

};

FastLegS.prototype.connect = function(connParams) {
  var client = new Client(connParams);
  client.connect();
  this.Base = new Base(client);
  this.client = client;
  return this;
};

module.exports = exports = new FastLegS();
