/**
 * Module dependencies.
 */

var query = require('pg-query');
var EventEmitter = require('events').EventEmitter;
var inherits = require('util').inherits;

/**
 * Client.
 */

function Client(connParams) {
  this.connParams = connParams;
  this.connected  = false;
  this.lastError = null;
};

inherits(Client, EventEmitter);

Client.prototype.connect_ = function(callback) {
  var self = this;
  self.client = new pg.Client(self.connParams);
  // if there are any problems with the pg client, record the error
  self.client.on('error', function(err){
    self.lastError = err;
    return true;
  });
  self.on('query', function(query, values, callback) {
    // if there were any errors with the pg client, surface them here then clear
    if(self.lastError !== null){
      var error = self.lastError;
      self.lastError = null;
      callback(error,0);
    }else{
      self.connected || self.doConnect();
      self.client.query(query, values, callback);
    }
  });
}

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

/*
Client.prototype.doConnect = function() {
  //inspect(this);
  this.client.connect();
  return this.connected = true;
}
*/

module.exports = Client;

