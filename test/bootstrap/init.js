var prompt = require("./prompt")
  , async = require("async@0.1.7");

console.log("\nFastLegS: Please setup your test database...\n");

async.series({
  "username": function(cb) {
    prompt("pg username: ", cb);
  },
  "password": function(cb) {
    prompt("pg password: ", null, true, cb);
  },
  "database": function(cb) {
    prompt("pg database: ", "FastLegS", cb);
  },
  "host": function(cb) {
    prompt("pg host: ", "localhost", cb);
  },
  "port": function(cb) {
    prompt("pg port: ", 5432, cb);
  },
}, function(err, results) {

});
