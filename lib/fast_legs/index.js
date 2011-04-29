exports.version = '0.0.7';

var Base   = require('./base');
var Client = require('./client');

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
