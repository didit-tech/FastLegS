/**
 * Module dependencies.
 */

var helper = require('../test_helper.js');
var Statements = require('../../lib/fast_legs/statements');

/**
 * Model stub.
 */

var model = {
  tableName:  'model_name',
  primaryKey: 'index',
  _fields: [
    { 'column_name': 'index' },
    { 'column_name': 'name' },
    { 'column_name': 'email' },
    { 'column_name': 'age' },
    { 'column_name': 'field' }
  ]
};

/**
 * Statements test.
 */

module.exports = {

  // SELECT

  'select statement: single primary key': function() {
    assert.eql(
      Statements.select(model, '2345', {}, []),
      "SELECT * FROM \"model_name\" WHERE index = '2345';"
    );
  },
  'select statement: multiple primary keys': function() {
    assert.eql(
      Statements.select(model, ['1234', '5678'], {}, []),
      "SELECT * FROM \"model_name\" WHERE index IN ($1,$2);"
    );
  },
  'select statement: single field': function() {
    assert.eql(
      Statements.select(model, {
        'name': 'awesome sauce'
      }, {}, []),

      "SELECT * FROM \"model_name\" " +
      "WHERE name = $1;"
    );
  },
  'select statement: multiple fields': function() {
    assert.eql(
      Statements.select(model, {
        'name': 'awesome sauce',
        'email': 'joepancakes@email.com'
      }, {}, []),

      "SELECT * FROM \"model_name\" " +
      "WHERE name = $1 " +
      "AND email = $2;"
    );
  },
  'select statement: only option': function() {
    assert.eql(
      Statements.select(model, {
        'name': 'awesome sauce',
        'email': 'joepancakes@email.com'
      }, {
        only: ['index', 'email']
      }, []),

      "SELECT index,email FROM \"model_name\" " +
      "WHERE name = $1 " +
      "AND email = $2;"
    );
  },
  'select statement: limit': function() {
    assert.eql(
      Statements.select(model, {
        'name': 'awesome sauce',
        'email': 'joepancakes@email.com'
      }, {
        only: ['index', 'email'],
        limit: 25
      }, []),

      "SELECT index,email FROM \"model_name\" " +
      "WHERE name = $1 " +
      "AND email = $2 " +
      "LIMIT 25;"
    );
  },
  'select statement: offset': function() {
    assert.eql(
      Statements.select(model, {
        'name': 'awesome sauce',
        'email': 'joepancakes@email.com'
      }, {
        only: ['index', 'email'],
        offset: 5
      }, []),

      "SELECT index,email FROM \"model_name\" " +
      "WHERE name = $1 " +
      "AND email = $2 " +
      "OFFSET 5;"
    );
  },
  'select statement: order asc': function() {
    assert.eql(
      Statements.select(model, {
        'name': 'awesome sauce',
        'email': 'joepancakes@email.com'
      }, {
        only: ['index', 'email'],
        limit: 50,
        order: ['field']
      }, []),

      "SELECT index,email FROM \"model_name\" " +
      "WHERE name = $1 " +
      "AND email = $2 " +
      "ORDER BY \"field\" ASC " +
      "LIMIT 50;"
    );
  },
  'select statement: order desc': function() {
    assert.eql(
      Statements.select(model, {
        'name': 'awesome sauce',
        'email': 'joepancakes@email.com'
      }, {
        only: ['index', 'email'],
        limit: 50,
        order: ['-field']
      }, []),

      "SELECT index,email FROM \"model_name\" " +
      "WHERE name = $1 " +
      "AND email = $2 " +
      "ORDER BY \"field\" DESC " +
      "LIMIT 50;"
    );
  },
  'select statement: order, offset & limit': function() {
    assert.eql(
      Statements.select(model, {
        'name': 'awesome sauce',
        'email': 'joepancakes@email.com'
      }, {
        only: ['index', 'email'],
        offset: 5,
        limit: 50,
        order: ['-field']
      }, []),

      "SELECT index,email FROM \"model_name\" " +
      "WHERE name = $1 " +
      "AND email = $2 " +
      "ORDER BY \"field\" DESC " +
      "LIMIT 50 " +
      "OFFSET 5;"
    );
  },
  'select statement: multiple order fields': function() {
    assert.eql(
      Statements.select(model, {
        'name': 'awesome sauce',
        'email': 'joepancakes@email.com'
      }, {
        only: ['index', 'email'],
        limit: 50,
        order: ['-field', 'another_field']
      }, []),

      "SELECT index,email FROM \"model_name\" " +
      "WHERE name = $1 " +
      "AND email = $2 " +
      "ORDER BY \"field\" DESC, \"another_field\" ASC " +
      "LIMIT 50;"
    );
  },
  'select statement: not equals (ne, not)': function() {
    assert.eql(
      Statements.select(model, {
        'name.ne': 'awesome sauce'
      }, {}, []),

      "SELECT * FROM \"model_name\" " +
      "WHERE name <> $1;"
    );
    assert.eql(
      Statements.select(model, {
        'name.not': 'awesome sauce'
      }, {}, []),

      "SELECT * FROM \"model_name\" " +
      "WHERE name <> $1;"
    );
  },
  'select statement: greater than (gt)': function() {
    assert.eql(
      Statements.select(model, {
        'age.gt': 21
      }, {}, []),

      "SELECT * FROM \"model_name\" " +
      "WHERE age > $1;"
    );
  },
  'select statement: less than (lt)': function() {
    assert.eql(
      Statements.select(model, {
        'age.lt': 21
      }, {}, []),

      "SELECT * FROM \"model_name\" " +
      "WHERE age < $1;"
    );
  },
  'select statement: greater than or equal (gte)': function() {
    assert.eql(
      Statements.select(model, {
        'age.gte': 21
      }, {}, []),

      "SELECT * FROM \"model_name\" " +
      "WHERE age >= $1;"
    );
  },
  'select statement: less than or equal (lte)': function() {
    assert.eql(
      Statements.select(model, {
        'age.lte': 21
      }, {}, []),

      "SELECT * FROM \"model_name\" " +
      "WHERE age <= $1;"
    );
  },
  'select statement: like (like)': function() {
    assert.eql(
      Statements.select(model, {
        'name.like': '%John%'
      }, {}, []),

      "SELECT * FROM \"model_name\" " +
      "WHERE name LIKE $1;"
    );
  },
  'select statement: not like (nlike, not_like)': function() {
    assert.eql(
      Statements.select(model, {
        'name.nlike': '%John%'
      }, {}, []),

      "SELECT * FROM \"model_name\" " +
      "WHERE name NOT LIKE $1;"
    );
    assert.eql(
      Statements.select(model, {
        'name.not_like': '%John%'
      }, {}, []),

      "SELECT * FROM \"model_name\" " +
      "WHERE name NOT LIKE $1;"
    );
  },
  'select statement: case insensitive like (ilike)': function() {
    assert.eql(
      Statements.select(model, {
        'name.ilike': '%john%'
      }, {}, []),

      "SELECT * FROM \"model_name\" " +
      "WHERE name ILIKE $1;"
    );
  },
  'select statement: not case insensitive like (nilike, not_ilike)': function() {
    assert.eql(
      Statements.select(model, {
        'name.nilike': '%john%'
      }, {}, []),

      "SELECT * FROM \"model_name\" " +
      "WHERE name NOT ILIKE $1;"
    );
    assert.eql(
      Statements.select(model, {
        'name.not_ilike': '%john%'
      }, {}, []),

      "SELECT * FROM \"model_name\" " +
      "WHERE name NOT ILIKE $1;"
    );
  },
  'select statement: in a list of values (in)': function() {
    assert.eql(
      Statements.select(model, {
        'field.in': ['some name', 34]
      }, {}, []),

      "SELECT * FROM \"model_name\" " +
      "WHERE field IN ($1,$2);"
    );
  },
  'select statement: not in a list of values (nin, not_in)': function() {
    assert.eql(
      Statements.select(model, {
        'field.nin': ['some name', 34]
      }, {}, []),

      "SELECT * FROM \"model_name\" " +
      "WHERE field NOT IN ($1,$2);"
    );
    assert.eql(
      Statements.select(model, {
        'field.not_in': ['some name', 34]
      }, {}, []),

      "SELECT * FROM \"model_name\" " +
      "WHERE field NOT IN ($1,$2);"
    );
  },
  'select statement: ignores invalid fields': function() {
    assert.eql(
      Statements.select(model, {
        'field.in': ['some name', 34],
        'bad_field': 1234
      }, {}, []),

      "SELECT * FROM \"model_name\" " +
      "WHERE field IN ($1,$2);"
    );
  },
  'select statement: returns empty with all invalid fields': function() {
    assert.eql(
      Statements.select(model, {
        'bad_field': 1234
      }, {}),

      "SELECT * FROM \"model_name\" WHERE INVALID;"
    );
  },
  'select statement: column alias': function() {
    assert.eql(
      Statements.select(model, '2345', {
        only: {'index':'a', 'email':'b'}
      }),

      "SELECT index AS \"a\", email AS \"b\" FROM \"model_name\" " +
      "WHERE index = '2345';"
    )
  },
  'select statment: column alias ignores invalid fields': function() {
    assert.eql(
      Statements.select(model, '2345', {
        only: {'index':'a', 'email':'b', 'bad_field':'c', 'bad_field_2':'d'}
      }),

      "SELECT index AS \"a\", email AS \"b\" FROM \"model_name\" " +
      "WHERE index = '2345';"
    )
  },
  'select statment: column alias all invalid fields returns all fields': function() {
    assert.eql(
      Statements.select(model, '2345', {
        only: {'bad_field':'c', 'bad_field_2':'d'}
      }),

      "SELECT * FROM \"model_name\" " +
      "WHERE index = '2345';"
    )
  },
  'select statement: column alias with order alias': function() {
    assert.eql(
      Statements.select(model, {
        'name': 'awesome sauce',
        'email': 'joepancakes@email.com'
      }, {
        only: {'index':'an index', 'email':'a email'},
        limit: 50,
        order: ['-an index', 'a email']
      }, []),

      "SELECT index AS \"an index\", email AS \"a email\" FROM \"model_name\" " +
      "WHERE name = $1 " +
      "AND email = $2 " +
      "ORDER BY \"an index\" DESC, \"a email\" ASC " +
      "LIMIT 50;"
    );
  },
  'select statement: query using null': function() {
    assert.eql(
      Statements.select(model, {
        'name': null
      }, {}, []),

      "SELECT * FROM \"model_name\" " +
      "WHERE name IS NULL;"
    );
  },

  // INSERT

  'insert statement: basic with all valid fields': function() {
    var obj = { index: '1234', name: 'Joseph' };

    assert.eql(
      Statements.insert(model, obj, []),
      "INSERT INTO \"model_name\"(index,name) " +
      "VALUES($1,$2) RETURNING *;"
    );
  },
  'insert statement: ignore invalid fields': function() {
    var obj = {
      bad_field: 'abcdef',
      email: 'bob@email.com',
      name: 'Bob',
      age: 8
    };

    assert.eql(
      Statements.insert(model, obj, []),
      "INSERT INTO \"model_name\"(email,name,age) " +
      "VALUES($1,$2,$3) RETURNING *;"
    );
  },

  // UPDATE

  'update statement: basic with all valid fields': function() {
    var obj = { index: '1234', name: 'Joseph' };

    assert.eql(
      Statements.update(model, {
        'age.gt': 15
      }, obj, []),
      "UPDATE \"model_name\" " +
      "SET index= $1, name= $2 " +
      "WHERE age > $3;"
    );
  },
  'update statement: ignore invalid fields': function() {
    var obj = {
      age: 8,
      bad_field: 'abcdef',
      name: 'Bob',
      email: 'bob@email.com'
    };

    assert.eql(
      Statements.update(model, {
        'name': 'Joe'
      }, obj, []),
      "UPDATE \"model_name\" " +
      "SET age= $1, name= $2, email= $3 " +
      "WHERE name = $4;"
    );
  },

  // DELETE

  'delete statement: delete all rows': function() {
    assert.eql(
      Statements.destroy(model),

      "DELETE FROM \"model_name\";"
    );
  },
  'delete statement: one field for selector': function() {
    assert.eql(
      Statements.destroy(model, {
        'name': 'awesome sauce'
      }, []),

      "DELETE FROM \"model_name\" " +
      "WHERE name = $1;"
    );
  },
  'delete statement: multiple fields for selector': function() {
    assert.eql(
      Statements.destroy(model, {
        'name': 'awesome sauce',
        'email': 'happyman@bluesky.com'
      }, []),

      "DELETE FROM \"model_name\" " +
      "WHERE name = $1 " +
      "AND email = $2;"
    );
  },
  'delete statement: ignores invalid fields': function() {
    assert.eql(
      Statements.destroy(model, {
        'name': 'awesome sauce',
        'email': 'happyman@bluesky.com',
        'bad_field': 1000
      }, []),

      "DELETE FROM \"model_name\" " +
      "WHERE name = $1 " +
      "AND email = $2;"
    );
  },

  // TRUNCATE

  'truncate statement: truncates all records': function() {
    assert.eql(
      Statements.truncate(model),
      "TRUNCATE \"model_name\";"
    );
  },
  'truncate statement: passing cascading option': function() {
    assert.eql(
      Statements.truncate(model, { cascade: true }),
      "TRUNCATE \"model_name\" CASCADE;"
    );
  }
}
