require.paths.unshift(__dirname + '/../..', __dirname + '/../support');

var assert = global.assert = require('assert');

/**
 * Terminate process on uncaught exception
 */

process.on('uncaughtException', function(err) {
  process.exit(1);
});
