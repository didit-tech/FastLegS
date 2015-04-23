/**
 * Module dependencies.
 */

var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var pgSetup = require('./pg_setup');
var pg = require('pg');

/**
 * Client.
 */

function Client(connParams) {
  this.connParams = connParams;
  this.connected  = false;
  this.lastError = null;
};

inherits(Client, EventEmitter);

Client.prototype.connect = function(usePool) {
  var query;
  if (usePool)
    query = pgSetup(this.connParams);
  else {
    this.pgClient = new pg.Client(this.connParams); 
    this.pgClient.connect();
    query = pgSetup(null, this.pgClient);
  }
  this.query = query;
  this.connected = true;
};

Client.prototype.disconnect = function() {
  if (this.pgClient) { 
    this.pgClient.end();
  }
}

module.exports = Client;

