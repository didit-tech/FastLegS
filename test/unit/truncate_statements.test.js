/**
 * Module dependencies.
 */

var expect = require('expect.js');
var StatementsPg = require('../../lib/statements');

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

describe('Truncate statements:', function() {
  it('truncates all records', function() {
    expect(StatementsPg.truncate(model)).to.be("TRUNCATE \"model_name\";");
  });

  it('passes cascading option', function() {
    expect(StatementsPg.truncate(model, { cascade: true })).to.be(
      "TRUNCATE \"model_name\" CASCADE;");
  });
})

