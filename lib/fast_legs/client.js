/**
 * Module dependencies.
 */

var pg = require("pg");
var EventEmitter = require('events').EventEmitter;

/**
 * Client.
 */

function Client(connParams) {
  this.connParams = connParams;
  this.connected  = false;
};

Client.prototype.__proto__ = EventEmitter.prototype;

Client.prototype.connect = function() {
  this.client = new pg.Client(this.connParams);
  this.on('query', function(query, values, callback) {
    this.connected || this.doConnect();
    this.client.query(query, values, function(err, result) {
      callback(err, result);
    });
  });
}

Client.prototype.disconnect = function() {
  if (this.client.queryQueue.length === 0) {
    this.client.end();
  } else {
    this.client.on('drain', this.client.end.bind(this.client));
  }
}

Client.prototype.doConnect = function() {
  this.client.connect();
  return this.connected = true;
}

module.exports = Client;
