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
 * Update statements test.
 */

describe('Update statements:', function() { 
  it('basic with all valid fields', function() {
    var obj = { index: '1234', name: 'Joseph' };

    expect(Statements.update(model, { 'age.gt': 15 }, obj, [])).to.be(
      "UPDATE \"model_name\" " +
      "SET index= $1, name= $2 " +
      "WHERE age > $3;"
    );
  });

  it('ignore invalid fields', function() {
    var obj = {
      age: 8,
      bad_field: 'abcdef',
      name: 'Bob',
      email: 'bob@email.com'
    };

    expect(Statements.update(model, { 'name': 'Joe' }, obj, [])).to.be(
      "UPDATE \"model_name\" " +
      "SET age= $1, name= $2, email= $3 " +
      "WHERE name = $4;"
    );
  });
})

