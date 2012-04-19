/**
 * Module dependencies.
 */

var pg = require("pg");
var EventEmitter = require('events').EventEmitter;
var _ = require('underscore')._;

/**
 * Client.
 */

function Client(connParams) {
  this.connParams = connParams;
  this.connected  = false;
  this.lastError = null;
};

Client.prototype.__proto__ = EventEmitter.prototype;

Client.prototype.connect = function() {
  var self = this;
  this.client = new pg.Client(this.connParams);
  // if there are any problems w/ the pg client, record the error
  this.client.on('error', function(err){
    self.lastError = err;
    return true;
  });
  this.on('query', function(query, values, callback) {
    // if there were any errors with the pg client, surface them here then clear
    if(self.lastError !== null){
      var error = self.lastError;
      self.lastError = null;
      callback(error,0);
    }else{
      if (!_.isUndefined(values[0])) values = _.flatten(values);
      this.connected || this.doConnect();
      this.client.query(query, values, function(err, result) {
        callback(err, result);
      });
    }
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
