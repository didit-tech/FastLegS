/**
 * Module dependencies.
 */

var expect = require('expect.js');
var StatementsPg = require('../../lib/adapters/pg/statements');
var StatementsMySQL = require('../../lib/adapters/mysql/statements');

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

describe('Update statements pg:', function() { 
  it('basic with all valid fields', function() {
    var obj = { index: '1234', name: 'Joseph' };

    expect(StatementsPg.update(model, { 'age.gt': 15 }, obj, [])).to.be(
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

    expect(StatementsPg.update(model, { 'name': 'Joe' }, obj, [])).to.be(
      "UPDATE \"model_name\" " +
      "SET age= $1, name= $2, email= $3 " +
      "WHERE name = $4;"
    );
  });
})

describe('Update statements mysql:', function() { 
  it('basic with all valid fields', function() {
    var obj = { index: '1234', name: 'Joseph' };

    expect(StatementsMySQL.update(model, { 'age.gt': 15 }, obj, [])).to.be(
      "UPDATE model_name " +
      "SET index= ?, name= ? " +
      "WHERE age > ?;"
    );
  });

  it('ignore invalid fields', function() {
    var obj = {
      age: 8,
      bad_field: 'abcdef',
      name: 'Bob',
      email: 'bob@email.com'
    };

    expect(StatementsMySQL.update(model, { 'name': 'Joe' }, obj, [])).to.be(
      "UPDATE model_name " +
      "SET age= ?, name= ?, email= ? " +
      "WHERE name = ?;"
    );
  });
})
