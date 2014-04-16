/**
 * Module dependencies.
 */

var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var query = require('pg-query');

/**
 * Client.
 */

function Client(connParams) {
  this.connParams = connParams;
  this.connected  = false;
  this.lastError = null;
};

inherits(Client, EventEmitter);

Client.prototype.connect = function() {
  query.connectionParameters = this.connParams;
  this.query = query;
  this.connected = true;
};

Client.prototype.disconnect = function() {
  if (this.client.queryQueue.length === 0) {
    this.client.end();
  } else {
    this.client.on('drain', this.client.end.bind(this.client));
  }
}

module.exports = Client;

