exports.select = function(model, selector, opts) {
  var fields = buildSelectFields(model, opts)
    , stmt   = "SELECT " + fields + " FROM " + model.tableName
    , where  = buildWhereClause(model, selector)
    , limit  = buildLimitClause(opts)
    , order  = buildOrderClause(opts);

  return stmt + where + limit + order + ';';
};

exports.insert = function(model, obj) {
  var stmt = "INSERT INTO " + model.tableName
    , fields = buildInsertFields(model, obj);

  return stmt + fields + ';';
};

exports.update = function(model, selector, obj) {
  var stmt  = "UPDATE " + model.tableName
    , set   = buildUpdateFields(model, obj)
    , where = buildWhereClause(model, selector);

  return stmt + set + where + ';';
};

exports.destroy = function(model, selector) {
  var stmt  = "DELETE FROM " + model.tableName
    , where = buildWhereClause(model, selector);

  return stmt + where + ";"
};

exports.truncate = function(model, opts) {
  var opts = opts === undefined ? {} : opts
    , stmt = "TRUNCATE " + model.tableName;

  if (opts.cascade) {
    stmt += " CASCADE";
  }

  return stmt + ";"
};

exports.information = function(model) {
  var stmt =  "SELECT column_name, is_nullable, data_type, " +
              "character_maximum_length, column_default " +
              "FROM information_schema.columns " +
              "WHERE table_name = '" + model.tableName + "';";

  return stmt;
};

var buildInsertFields = function(model, fields) {
  if (_(fields).isArray()) {
    var keys =  _(fields).chain()
                .map(function(field) {
                  return _(field).keys();
                })
                .flatten()
                .uniq()
                .value();

    var vals =  _(fields).chain()
                .map(function(field) {
                  var vals = _(keys).map(function(key) {
                    return quote(field[key]);
                  });
                  return "(" + vals + ")";
                })
                .join(', ')
                .value();

    return "(" + keys + ") VALUES " + vals;
  } else {
    var fields = validFields(model, fields)
      , keys = _(fields).keys().join(',')
      , vals = toCsv(fields);

    return "(" + keys + ") VALUES(" + vals + ") RETURNING *";
  }
};

var buildLimitClause = function(opts) {
  if (_(opts.limit).isUndefined()) {
    return "";
  } else {
    return " LIMIT " + opts.limit;
  }
};

var buildOperator = function(key, value) {
  var field = key.split('.')[0];

  switch(key.split('.')[1]) {
  case 'ne': case 'not':
    var operator = "<>";
    break;
  case 'gt':
    var operator = ">";
    break;
  case 'lt':
    var operator = "<";
    break;
  case 'gte':
    var operator = ">=";
    break;
  case 'lte':
    var operator = "<=";
    break;
  case 'like':
    var operator = "LIKE";
    break;
  case 'nlike': case 'not_like':
    var operator = "NOT LIKE";
    break;
  case 'ilike':
    var operator = "ILIKE";
    break;
  case 'nilike': case 'not_ilike':
    var operator = "NOT ILIKE";
    break;
  case 'in':
    var operator = "IN";
    break;
  case 'nin': case 'not_in':
    var operator = "NOT IN";
    break;
  default:
    var operator = "=";
  }

  return field + ' ' + operator + ' ' + quote(value);
};

var buildOrderClause = function(opts) {
  if (_(opts.order).isUndefined()) {
    return "";
  } else {
    var orderFields = _(opts.order).chain()
      .map(function(orderField) {
        var direction  = orderField[0] === '-' ? "DESC" : "ASC";
        var orderField = orderField[0] === '-' ?
          orderField.substring(1, orderField.length): orderField;
        return orderField + " " + direction;
      })
      .join(', ')
      .value();

    return " ORDER BY " + orderFields;
  }
};

var buildSelectFields = function(model, opts) {
  if (_(opts.only).isUndefined()) {
    return "*";
  } else {
    var columns = _(model._fields).pluck('column_name');
    var valid_fields = _.select(opts.only, function(valid_field) {
      return _.include(columns, valid_field);
    });
    return _(valid_fields).isEmpty() ? "*" : valid_fields.join(',');
  }
};

var buildUpdateFields = function(model, fields) {
  var fields = validFields(model, fields)
    , pred   =  _(fields).chain()
                .map(function(value, key) {
                  return key + '=' + quote(value);
                })
                .join(', ')
                .value();

  return nil(pred) ? '' : " SET " + pred;
};

var buildWhereClause = function(model, selector) {
  if (_(selector).isArray()) {
    var ids = toCsv(selector);
    var pred = model.primaryKey + " IN (" + ids + ")";
  } else if (_(selector).isNumber() || _(selector).isString()) {
    var id = selector;
    var pred = model.primaryKey + " = '" + id + "'";
  } else if (nil(selector)){
    var pred = '';
  } else {
    var pred =  _(selector).chain()
                .map(function(value, key) {
                  if (fieldIsValid(model, key))
                    return buildOperator(key, value);
                })
                .compact()
                .join(' AND ')
                .value();
    pred += nil(pred) ? 'INVALID' : '';
  }

  return nil(pred) ? '' : " WHERE " + pred;
};

var fieldIsValid = function(model, field) {
  var columns = _(model._fields).pluck('column_name');
  return _.include(columns, field.split('.')[0]);
};

var nil = function(value) {
  if (_(value).isUndefined() || _(value).isNull() || _(value).isNaN()) {
    return true;
  } else if (_(value).isArray() && _(value).isEmpty()) {
    return true;
  } else if (value.toString() === '[object Object]' && _(value).isEmpty()) {
    return true;
  } else if (_(value).isString() && _(value).isEmpty()) {
    return true;
  } else {
    return false;
  }
};

var quote = function(value) {
  if (nil(value)) {
    return "NULL";
  } else if (_(value).isNumber()) {
    return value;
  } else if (_(value).isArray()) {
    return "(" + toCsv(value) + ")";
  } else if (_(value).isDate()) {
    return "'" + toDateTime(value) + "'";
  } else {
    return "'" + value + "'";
  }
};

var toCsv = function(list, keys) {
  return  _(list).chain()
          .values()
          .map(function(o) { return quote(o) })
          .join(',')
          .value();
};

var toDateTime = function(value) {
  if (_(value).isDate()) {
    return value.getFullYear()
    + '/' + (value.getMonth()+1)
    + '/' + (value.getDate())
    + ' ' + (value.getHours())
    + ':' + (value.getMinutes())
    + ':' + (value.getSeconds());
  }
};

var validFields = function(model, fields) {
  var returnFields = {};
  _(fields).each(function(value, key) {
    if (fieldIsValid(model, key)) {
      returnFields[key] = value;
    }
  });
  return returnFields;
};
