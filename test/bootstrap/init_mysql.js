var fs = require('fs')
  , async = require("async")
  , mysql = require("mysql")
  , read = require('read')

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
  ON comments (post_id) \
  USING BTREE" 
}

console.log("\nFastLegS - Please enter your MySQL credentials " +
  "and a database for us to create.\nNOTE: Make sure you specify " +
  "a database that does not already exist.\n")

async.series({
  "username": function(cb) {
    read({prompt: "mysql username: "}, cb);
  },
  "password": function(cb) {
    read({ prompt: "mysql password: ", silent: true }, cb)
  },
  "database": function(cb) {
    read({ prompt: "mysql database: ", default: "fastlegs_test" }, cb)
  },
  "host": function(cb) {
    read({ prompt: "mysql host: ", default: "localhost" }, cb)
  },
  "port": function(cb) {
    read({ prompt: "mysql port: ", default: 3306 }, cb)
  },
}, function(err, config) {
  var connectionString =  "mysql://" + config.username + 
    ((config.password)?(":" + config.password):"") +
    "@" + config.host + ":" + config.port + "/";
  var connection = mysql.createConnection(connectionString)
  connection.query( "CREATE DATABASE " + config.database,
    function(err, result) {
      if (!err) {
        connection.end()
        connection = mysql.createConnection(connectionString + config.database)
        async.series([
          function(cb) { connection.query(create.posts, cb); },
          function(cb) { connection.query(create.comments, cb); },
          function(cb) { connection.query(create.comments_post_id_index, cb); }
        ], function(err, results) {
          if (!err) {
            fs.writeFile('.fastlegs_mysql',
              JSON.stringify(config),
            function (err) {
              process.exit();
            });
          } else { console.dir(err); connection.end() }
        });
      } else { console.dir(err); connection.end() }
    }
  )
})
