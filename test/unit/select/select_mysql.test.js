
/**
 * Module dependencies.
 */

var expect = require('expect.js');
var StatementsMySQL = require('../../../lib/adapters/mysql/statements');

/**
 * select mysql test.
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

describe('Select statements mysql:', function() { 
  it('single primary key', function(done) {
    expect(StatementsMySQL.select(model, '2345', {}, [])).to.be(
      "SELECT * FROM model_name WHERE index = '2345';"
    );
    
    done();
  });

  it('multiple primary keys', function() { 
    expect(StatementsMySQL.select(model, ['1234', '5678'], {}, [])).to.be(
      "SELECT * FROM model_name WHERE index IN (?, ?);"
    );
  });

  it('single field', function() {
    expect(StatementsMySQL.select(model, {'name': 'awesome sauce'}, {}, [])).to.be(
      "SELECT * FROM model_name WHERE name = ?;"
    );
  });
  
  it('multiple fields', function() {
    expect(
      StatementsMySQL.select(model, {
        'name': 'awesome sauce',
        'email': 'joepancakes@email.com'
      }, {}, [])).to.be(
      "SELECT * FROM model_name WHERE name = ? AND email = ?;"
    );
  });

  it('only option', function() {
    expect(
      StatementsMySQL.select(model, {
        'name': 'awesome sauce',
        'email': 'joepancakes@email.com'
      }, {
        only: ['index', 'email']
      }, [])).to.be(
      "SELECT index, email FROM model_name WHERE name = ? AND email = ?;"
    );
  });

  it('limit', function() {
    expect(StatementsMySQL.select(model, {
        'name': 'awesome sauce',
        'email': 'joepancakes@email.com'
      }, {
        only: ['index', 'email'],
        limit: 25
      }, [])).to.be(
      "SELECT index, email FROM model_name WHERE name = ? AND email = ? " +
      "LIMIT 25;"
    );
  });

  it('offset', function() {
    expect(StatementsMySQL.select(model, {
        'name': 'awesome sauce',
        'email': 'joepancakes@email.com'
      }, {
        only: ['index', 'email'],
        offset: 5
      }, [])).to.be(
      "SELECT index, email FROM model_name WHERE name = ? AND email = ? " +
      "LIMIT 100000000 OFFSET 5;"
    );
  });

  it('order asc', function() {
    expect(StatementsMySQL.select(model, {
        'name': 'awesome sauce',
        'email': 'joepancakes@email.com'
      }, {
        only: ['index', 'email'],
        limit: 50,
        order: ['field']
      }, [])).to.be(
      "SELECT index, email FROM model_name WHERE name = ? AND email = ? " +
      "ORDER BY field ASC LIMIT 50;"
    );
  });

  it('order desc', function() {
    expect(StatementsMySQL.select(model, {
        'name': 'awesome sauce',
        'email': 'joepancakes@email.com'
      }, {
        only: ['index', 'email'],
        limit: 50,
        order: ['-field']
      }, [])).to.be(
      "SELECT index, email FROM model_name WHERE name = ? AND email = ? " +
      "ORDER BY field DESC LIMIT 50;"
    );
  });

  it('order, offset & limit', function() {
    expect(StatementsMySQL.select(model, {
        'name': 'awesome sauce',
        'email': 'joepancakes@email.com'
      }, {
        only: ['index', 'email'],
        offset: 5,
        limit: 50,
        order: ['-field']
      }, [])).to.be(
      "SELECT index, email FROM model_name WHERE name = ? AND email = ? " +
      "ORDER BY field DESC LIMIT 50 OFFSET 5;"
    );
  });

  it('multiple order fields', function() {
    expect(StatementsMySQL.select(model, {
        'name': 'awesome sauce',
        'email': 'joepancakes@email.com'
      }, {
        only: ['index', 'email'],
        limit: 50,
        order: ['-field', 'another_field']
      }, [])).to.be(
      "SELECT index, email FROM model_name WHERE name = ? AND email = ? " +
      "ORDER BY field DESC, another_field ASC LIMIT 50;"
    );
  });

  it('not equals (ne, not)', function() {
    expect(StatementsMySQL.select(model, { 'name.ne': 'awesome sauce' }, {}, []))
      .to.be("SELECT * FROM model_name WHERE name <> ?;");
    expect(StatementsMySQL.select(model, { 'name.not': 'awesome sauce' }, {}, []))
      .to.be("SELECT * FROM model_name WHERE name <> ?;");
  });

  it('greater than (gt)', function() {
    expect(StatementsMySQL.select(model, { 'age.gt': 21 }, {}, []))
      .to.be("SELECT * FROM model_name WHERE age > ?;");
  });

  it('less than (lt)', function() {
    expect(StatementsMySQL.select(model, { 'age.lt': 21 }, {}, []))
      .to.be("SELECT * FROM model_name WHERE age < ?;");
  });

  it('greater than or equal (gte)', function() {
    expect(StatementsMySQL.select(model, { 'age.gte': 21 }, {}, []))
      .to.be("SELECT * FROM model_name WHERE age >= ?;");
  });

  it('less than or equal (lte)', function() {
    expect(StatementsMySQL.select(model, { 'age.lte': 21 }, {}, []))
      .to.be("SELECT * FROM model_name WHERE age <= ?;");
  });

  it('like (like)', function() {
    expect(StatementsMySQL.select(model, { 'name.like': '%John%' }, {}, []))
      .to.be("SELECT * FROM model_name WHERE name LIKE ?;");
  });

  it('not like (nlike, not_like)', function() {
    expect(StatementsMySQL.select(model, { 'name.nlike': '%John%'}, {}, []))
      .to.be("SELECT * FROM model_name WHERE name NOT LIKE ?;");
    expect(StatementsMySQL.select(model, { 'name.not_like': '%John%' }, {}, []))
      .to.be("SELECT * FROM model_name WHERE name NOT LIKE ?;");
  });

  it('case insensitive like (ilike)', function() {
    expect(StatementsMySQL.select(model, { 'name.ilike': '%john%' }, {}, []))
      .to.be("SELECT * FROM model_name WHERE UPPER(name) LIKE UPPER(?);");
  });

  it('not case insensitive like (nilike, not_ilike)', function() {
    expect(StatementsMySQL.select(model, { 'name.nilike': '%john%' }, {}, []))
      .to.be("SELECT * FROM model_name WHERE name NOT ILIKE ?;");
    expect(StatementsMySQL.select(model, { 'name.not_ilike': '%john%' }, {}, []))
      .to.be("SELECT * FROM model_name WHERE name NOT ILIKE ?;");
  });

  it('in a list of values (in)', function() {
    expect(StatementsMySQL.select(model, { 'field.in': ['some name'] }, {}, []))
      .to.be("SELECT * FROM model_name WHERE field IN (?);");
    expect(StatementsMySQL.select(model, { 'field.in': ['some name', 34] }, {}, []))
      .to.be("SELECT * FROM model_name WHERE field IN (?,?);");
  });

  it('not in a list of values (nin, not_in)', function() {
    expect(StatementsMySQL.select(model, { 'field.nin': ['some name'] }, {}, []))
      .to.be("SELECT * FROM model_name WHERE field NOT IN (?);");
    expect(StatementsMySQL.select(model, { 'field.nin': ['some name', 34] }, {}, []))
      .to.be("SELECT * FROM model_name WHERE field NOT IN (?,?);");
    expect(StatementsMySQL.select(model, { 'field.not_in': ['some name', 34] }, {}, []))
      .to.be("SELECT * FROM model_name WHERE field NOT IN (?,?);");
  });

  it('simple or', function() {
    expect(StatementsMySQL.select(model, { '$or': { 'field.equals': 'hi', 'age.equals': 18 } }, {}, []))
      .to.be("SELECT * FROM model_name WHERE (field = ? OR age = ?);");
  })

  it('complex or', function() {
    expect(StatementsMySQL.select(model, { 
      'name.equals': 'John',
      '$or': { 'field.equals': 'hi', 'age.equals': 18, 'index.gt': 42 },
      'email.ne': 'josef@yahoo.com'
    }, {}, []))
      .to.be("SELECT * FROM model_name WHERE name = ? AND (field = ? OR age = ? OR index > ?) AND email <> ?;");
  })

  it('ignores invalid fields', function() {
    expect(StatementsMySQL.select(model, { 
        'field.in': ['some name', 34], 
        'bad_field': 1234      
      }, {}, [])).to.be(
      "SELECT * FROM model_name WHERE field IN (?,?);"
    );
  });

  it('returns empty with all invalid fields', function() {
    expect(StatementsMySQL.select(model, { 'bad_field': 1234 }, {}))
      .to.be("SELECT * FROM model_name WHERE INVALID;");
  });

  it('column alias', function() {
    expect(StatementsMySQL.select(model, '2345', {only: {'index':'a', 'email':'b'}}))
      .to.be(
      "SELECT index AS \"a\", email AS \"b\" FROM model_name " +
      "WHERE index = '2345';"
    )
  });

  it('column alias ignores invalid fields', function() {
    expect(StatementsMySQL.select(model, '2345', {
        only: {'index':'a', 'email':'b', 'bad_field':'c', 'bad_field_2':'d'}
      })).to.be(
      "SELECT index AS \"a\", email AS \"b\" FROM model_name " +
      "WHERE index = '2345';"
    );
  });

  it('column alias all invalid fields returns all fields', function() {
    expect(StatementsMySQL.select(model, '2345', {
        only: {'bad_field':'c', 'bad_field_2':'d'}
      })).to.be("SELECT * FROM model_name WHERE index = '2345';");
  });

  it('column alias with order alias', function() {
    expect(StatementsMySQL.select(model, {
        'name': 'awesome sauce',
        'email': 'joepancakes@email.com'
      }, {
        only: {'index':'an index', 'email':'a email'},
        limit: 50,
        order: ['-an index', 'a email']
      }, [])).to.be(
      "SELECT index AS \"an index\", email AS \"a email\" FROM model_name " +
      "WHERE name = ? AND email = ? " +
      "ORDER BY `an index` DESC, `a email` ASC " +
      "LIMIT 50;"
    );
  });
  
  it('query using null', function() {
    expect(StatementsMySQL.select(model, { 'name': null }, {}, []))
      .to.be("SELECT * FROM model_name WHERE name IS NULL;");
  });
  
  it('text search query', function() {
    expect(StatementsMySQL.select(model, { 'name.textsearch': 'test' }, {}, []))
      .to.be("SELECT * FROM model_name " +
        "WHERE to_tsvector('english', name) @@ to_tsquery('english', ?);"
    );
  });

  it('gets count only with complex or', function() {
    expect(StatementsMySQL.select(model, {
      'name.equals': 'John',
      '$or': { 'field.equals': 'hi', 'age.equals': 18, 'index.gt': 42 },
      'email.ne': 'josef@yahoo.com'
    }, { count: true }, []))
      .to.be("SELECT COUNT(*) AS count FROM model_name WHERE name = ? AND (field = ? OR age = ? OR index > ?) AND email <> ?;");
  })
})
