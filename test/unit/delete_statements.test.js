/**
 * Module dependencies.
 */

var expect = require('expect.js');
var StatementsPg = require('../../lib/adapters/pg/statements');

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
 * Delete statements test.
 */

describe('Delete statements pg:', function() {
  it('deletes all rows', function() {
    expect(StatementsPg.destroy(model)).to.be("DELETE FROM \"model_name\";");
  });

  it('one field for selector', function() {
    expect(StatementsPg.destroy(model, { 'name': 'awesome sauce' }, [])).to.be(
      "DELETE FROM \"model_name\" WHERE name = $1;"
    );
  });

  it('multiple fields for selector', function() {
    expect(StatementsPg.destroy(model, { 
        'name': 'awesome sauce',
        'email': 'happyman@bluesky.com'
      }, [])).to.be(
      "DELETE FROM \"model_name\" WHERE name = $1 AND email = $2;"
    );
  });

  it('ignores invalid fields', function() {
    expect(StatementsPg.destroy(model, {
        'name': 'awesome sauce',
        'email': 'happyman@bluesky.com',
        'bad_field': 1000
      }, [])).to.be(
      "DELETE FROM \"model_name\" WHERE name = $1 AND email = $2;"
    );
  });
})

