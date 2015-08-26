/**
 * Module dependencies.
 */

var pg = require('pg');
pg.types.setTypeParser(1082, 'text', function(val) {
  return String(val);
});

/**
 * pg_setup.
 */

module.exports = function createConnection(connString, client) {
  if (client) {
    return function query(text, values, cb) {
      if (typeof text === 'object' || !values) {
        return client.query(text);
      }
      if (typeof values === 'function') {
        cb = values;
        values = [];
      }
      client.query(text, values, function(err, result) {
        if (err) return cb(err);
        return cb(err, result.rows, result);
      });
    };
  } else {
    return function query(text, values, cb) {
      if (typeof values === 'function') {
        cb = values;
        values = [];
      }
      pg.connect(connString, function(err, client, done) {
        if (err) {
          done();
          return cb(err);
        }
        if (typeof text === 'object' || !values) {
          var stream = client.query(text);
          stream.on('end', done);
          return cb(null, stream);
        } else {
          client.query(text, values, function(err, result) {
            done();
            if (err) return cb(err);
            return cb(null, result.rows, result);
          });
        }
      });
    };
  }
};

