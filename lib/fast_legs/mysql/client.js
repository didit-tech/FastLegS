/**
 * Module dependencies.
 */

var EventEmitter = require('events').EventEmitter;
var _ = require('underscore')._;

/**
 * Client.
 */

function Client(connParams, db) {
  this.connParams = connParams;
  this.connected  = false;
  this.lastError = null;
  this.db = db || 'pg';
};

Client.prototype.__proto__ = EventEmitter.prototype;

Client.prototype.connect = function() {
  var self = this;
  self.statements = require('./statements')
  var mysql = require('mysql')
  var connParams = (self.connParams) ? 
    self.connParams : 
    {host: 'localhost', port: 3306}
  self.client = mysql.createConnection(connParams)
  self.client.on('error', function(err) {
    self.lastError = err;
    return true;
  })
  self.on('query', function(query, values, callback) {
    if(self.lastError !== null){
      var error = self.lastError;
      self.lastError = null;
      callback(error,0);
    } else {
      if (!_.isUndefined(values[0])) values = _.flatten(values);
      self.connected || self.doConnect();
      self.client.query(query, values, callback)
    }
  })  
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
