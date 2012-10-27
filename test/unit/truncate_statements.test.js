/**
 * Module dependencies.
 */

var expect = require('expect.js');
var StatementsPg = require('../../lib/fast_legs/statements_pg');
var StatementsMySQL = require('../../lib/fast_legs/statements_mysql');

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
 * Truncate statements test.
 */

describe('Truncate statements pg:', function() {
  it('truncates all records', function() {
    expect(StatementsPg.truncate(model)).to.be("TRUNCATE \"model_name\";");
  });

  it('passes cascading option', function() {
    expect(StatementsPg.truncate(model, { cascade: true })).to.be(
      "TRUNCATE \"model_name\" CASCADE;");
  });
})

describe('Truncate statements mysql:', function() {
  it('truncates all records', function() {
    expect(StatementsMySQL.truncate(model)).to.be("TRUNCATE model_name;");
  });

  it('passes cascading option', function() {
    expect(StatementsMySQL.truncate(model, { cascade: true })).to.be(
      "TRUNCATE model_name CASCADE;");
  });
})
