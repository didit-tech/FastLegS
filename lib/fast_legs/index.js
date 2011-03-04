exports.version = '0.0.2';

var _ = global._ = require('underscore')
  , Base   = require('./base')
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
