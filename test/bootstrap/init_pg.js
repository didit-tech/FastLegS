var fs = require('fs')
  , async = require("async")
  , pg = require("pg")
  , read = require('read')

var create = {
posts:
"CREATE TABLE posts (\
  id integer NOT NULL,\
  title character varying(255) NOT NULL,\
  blurb character varying(255),\
  body text NOT NULL,\
  published boolean,\
  created_at date,\
  updated_at date,\
  CONSTRAINT posts_pkey PRIMARY KEY (id))",
comments:
"CREATE TABLE comments (\
  id integer NOT NULL,\
  post_id integer NOT NULL,\
  comment text NOT NULL,\
  created_at timestamp,\
  CONSTRAINT comments_pkey PRIMARY KEY (id))",
comments_post_id_index:
"CREATE INDEX comments_post_id \
  ON comments\
  USING btree\
  (post_id)",
students:
"CREATE TABLE students (\
  id integer NOT NULL,\
  name character varying(255) NOT NULL,\
  CONSTRAINT students_pkey PRIMARY KEY (id))",
professors:
"CREATE TABLE professors (\
  id integer NOT NULL,\
  name character varying(255) NOT NULL,\
  CONSTRAINT professors_pkey PRIMARY KEY (id))",
student_professor:
"CREATE TABLE student_professor (\
  student_id integer NOT NULL,\
  professor_id integer NOT NULL)" 
};

console.log("\nFastLegS - Please enter your Postgres credentials " +
  "and a database for us to create.\nNOTE: Make sure you specify " +
  "a database that does not already exist.\n");

async.series({
  "username": function(cb) {
    read({prompt: "pg username: "}, cb);
  },
  "password": function(cb) {
    read({ prompt: "pg password: ", silent: true }, cb)
  },
  "database": function(cb) {
    read({ prompt: "pg database: ", default: "fastlegs_test" }, cb)
  },
  "host": function(cb) {
    read({ prompt: "pg host: ", default: "localhost" }, cb)
  },
  "port": function(cb) {
    read({ prompt: "pg port: ", default: 5432 }, cb)
  },
}, function(err, config) {
  var connectionString =  
    "pg://" + config.username + ((config.password)?(":" + config.password):"") +
    "@" + config.host + ":" + config.port + "/";
  pg.connect(connectionString + "template1", function(err, client) {
    if (!err) {
      client.query(
        "CREATE DATABASE " + config.database + " OWNER " + config.username,
        function(err, result) {
          if (!err) {
            client.end();
            pg.connect(connectionString + config.database, function(err, client) {
              if (!err) {
                async.series([
                  function(cb) { client.query(create.posts, cb); },
                  function(cb) { client.query(create.comments, cb); },
                  function(cb) { client.query(create.comments_post_id_index, cb); },
                  function(cb) { client.query(create.students, cb); },
                  function(cb) { client.query(create.professors, cb); },
                  function(cb) { client.query(create.student_professor, cb); }
                ], function(err, results) {
                  if (!err) {
                    fs.writeFile('.fastlegs_pg',
                      JSON.stringify(config),
                    function (err) {
                      client.end();
                      process.exit();
                    });
                  } else { console.dir(err); client.end(); }
                });
              }
            });
          } else { console.dir(err); client.end(); }
        }
      );
    }
  });
});
