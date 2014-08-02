/**
 * Module dependencies.
 */

var pg = require('pg.js');
pg.types.setTypeParser(1082, 'text', function(val) {
  return String(val);
});

/**
 * pg_setup.
 */

module.exports = {
  pool: pool,
  noPool: noPool
};

function pool(connString) {
  return function query(text, values, cb) {
    if (typeof values === 'function') {
      cb = values;
      values = [];
    }
    pg.connect(connString, function(err, client, done) {
      if (err) return cb(err);
      client.query(text, values, function(err, result) {
        done();
        if (err) return cb(err);
        return cb(err, result.rows, result);
      });
    });
  };
};

function noPool(connString) {
  console.log('NO POOOLLLL')
  return function query(text, values, cb) {
    var client = new pg.Client(connString);
    //client.connect();
    //if (typeof text === 'object') return client.query(text);
    if (typeof values === 'function') {
      cb = values;
      values = [];
    }
    client.connect(function(err) {
      if (err) return cb(err);
      client.query(text, values, function(err, result) {
        client.end();
        if (err) return cb(err);
        return cb(err, result.rows, result);
      });
    });
  };
};

