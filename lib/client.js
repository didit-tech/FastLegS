/**
 * Module dependencies.
 */

var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var pgSetup = require('./pg_setup');

/**
 * Client.
 */

function Client(connParams) {
  this.connParams = connParams;
  this.connected  = false;
  this.lastError = null;
};

inherits(Client, EventEmitter);

/*
Client.prototype.connect = function(usePool) {
  var query;
  if (usePool)
    query = pgSetup(this.connParams);
  else {
    console.log('IM HERE')
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
*/
Client.prototype.connect = function(usePool) {
  var query = usePool ?
    pgSetup.pool(this.connParams) :
    pgSetup.noPool(this.connParams);
  this.query = query;
  this.connected = true;
}

Client.prototype.disconnect = function() {
  console.log(this.client);
  if (this.client.queryQueue.length === 0) {
    this.client.end();
  } else {
    this.client.on('drain', this.client.end.bind(this.client));
  }
}

module.exports = Client;

