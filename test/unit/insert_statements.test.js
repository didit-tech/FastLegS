/**
 * Module dependencies.
 */

var expect = require('expect.js');
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
 * Insert statements test.
 */

describe('Insert statements:', function() { 
  it('basic with all valid fields', function() { 
    var obj = { index: '1234', name: 'Joseph' };

    expect(Statements.insert(model, obj, [])).to.be(
      "INSERT INTO \"model_name\"(index,name) " +
      "VALUES($1,$2) RETURNING *;"
    );
  })

  
  it('ignore invalid fields', function() {
    var obj = {
      bad_field: 'abcdef',
      email: 'bob@email.com',
      name: 'Bob',
      age: 8
    };

    expect(Statements.insert(model, obj, [])).to.be(
      "INSERT INTO \"model_name\"(email,name,age) " +
      "VALUES($1,$2,$3) RETURNING *;"
    );
  });
})

