var prompt = require("./prompt")
  , fs = require('fs')
  , async = require("async")
  , pg = require("pg");

var create = {
  "posts":
"CREATE TABLE posts (\
  id integer NOT NULL,\
  title character varying(255) NOT NULL,\
  blurb character varying(255),\
  body text NOT NULL,\
  published boolean,\
  created_at date,\
  updated_at date,\
  CONSTRAINT posts_pkey PRIMARY KEY (id))",
  "comments":
"CREATE TABLE comments (\
  id integer NOT NULL,\
  post_id integer NOT NULL,\
  comment text NOT NULL,\
  created_at date,\
  CONSTRAINT comments_pkey PRIMARY KEY (id))",
  "comments_post_id_index":
"CREATE INDEX comments_post_id \
  ON comments\
  USING btree\
  (post_id)",
  "procedure":
"CREATE OR REPLACE FUNCTION sum_numbers(v_n1 integer, v_n2 integer) \
  RETURNS integer AS \
$BODY$ \
DECLARE \
  v_sum INTEGER; \
BEGIN \
    SELECT v_n1 + v_n2 INTO v_sum; \
    RETURN v_sum; \
END; \
$BODY$ \
  LANGUAGE plpgsql VOLATILE"
};

console.log("\nFastLegS: Please enter your Postgres credentials " +
            "and a database for us to create.\n");

async.series({
  "username": function(cb) {
    prompt("pg username: ", cb);
  },
  "password": function(cb) {
    prompt("pg password: ", null, true, cb);
  },
  "database": function(cb) {
    prompt("pg database: ", "fastlegs_test", cb);
  },
  "host": function(cb) {
    prompt("pg host: ", "localhost", cb);
  },
  "port": function(cb) {
    prompt("pg port: ", 5432, cb);
  },
}, function(err, config) {
  config.password = config.password === null ? '' : config.password;
  var connectionString =  "pg://" + config.username + ":" + config.password +
                          "@" + config.host + ":" + config.port + "/";
  pg.connect(connectionString + "template1", function(err, client) {
    if (!err) {
      client.query( "CREATE DATABASE " + config.database +
                    " OWNER " + config.username,
      function(err, result) {
        if (!err) {
          client.end();
          pg.connect(connectionString + config.database, function(err, client) {
            if (!err) {
              async.series([
                function(cb) { client.query(create.posts, cb); },
                function(cb) { client.query(create.comments, cb); },
                function(cb) { client.query(create.comments_post_id_index, cb); },
                function(cb) { client.query(create.procedure, cb); }
              ], function(err, results) {
                if (!err) {
                  fs.writeFile('.fastlegs',
                    JSON.stringify(config),
                  function (err) {
                    client.end();
                  });
                } else { client.end(); }
              });
            }
          });
        } else { client.end(); }
      });
    }
  });
});
