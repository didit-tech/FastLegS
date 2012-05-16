var assert = global.assert = require('assert');

/**
 * Terminate process on uncaught exception
 */

process.on('uncaughtException', function(err) {
  console.dir(err);
  process.exit(1);
});
