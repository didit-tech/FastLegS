/**
 * Module dependencies.
 */

var expect = require('expect.js');
var Statements = require('../../lib/statements');

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
    { 'column_name': 'field' },
    { 'column_name': 'stats' }
  ]
};

/**
 * Fixtures
 */

var flatHappy = { index: '1234', name: 'Joseph', stats: { height: 5.4, weight: 100 } };
var flatBadField = { bad_field: 'abcdef', email: 'bob@email.com', name: 'Bob', age: 8 };
var arrayHappy = [flatHappy];
var arrayBadField =  [flatBadField];

/**
 * Insert statements test.
 */

describe('Insert statements pg:', function() {
  it('basic with all valid fields', function() {
    var expected = "INSERT INTO \"model_name\"(index,name,stats) " +
      "VALUES($1,$2,$3) RETURNING *;"

    expect(Statements.insert(model, flatHappy, [])).to.be(expected);
    expect(Statements.insert(model, arrayHappy, [])).to.be(expected);
  })


  it('ignore invalid fields', function() {
    var expected = "INSERT INTO \"model_name\"(email,name,age) " +
      "VALUES($1,$2,$3) RETURNING *;"

    expect(Statements.insert(model, flatBadField, [])).to.be(expected);
    expect(Statements.insert(model, arrayBadField, [])).to.be(expected);
  });
})

