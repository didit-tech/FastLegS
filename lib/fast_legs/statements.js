/**
 * Module dependencies.
 */

var utils = require('./utils');
var _ = require('underscore');

/**
 * Statements.
 */

function fixPgIssues(val) {
  /* The current build of pg doesn't know how to bind an
   * undefined value, so we're going to be nice and coerce
   * any of 'em to null for now */
  if (val === undefined)
    return null;

  return val;
};

exports.select = function(model, selector, opts, outValues) {
  var fields = buildSelectFields(model, opts)
    , stmt   = "SELECT " + fields + " FROM " + '"' + model.tableName + '"'
    , join   = buildJoinClause(model, opts)
    , where  = buildWhereClause(model, selector, outValues)
    , limit  = buildLimitClause(opts)
    , offset = buildOffsetClause(opts)
    , order  = buildOrderClause(opts);

  return stmt + join + where + order + limit + offset + ';';
};

exports.insert = function(model, obj, outValues) {
  var stmt = "INSERT INTO " + '"' + model.tableName + '"'
    , fields = buildInsertFields(model, obj, outValues);

  return stmt + fields + ';';
};

exports.update = function(model, selector, obj, outValues) {
  var stmt  = "UPDATE " + '"' + model.tableName + '"'
    , set   = buildUpdateFields(model, obj, outValues)
    , where = buildWhereClause(model, selector, outValues);

  return stmt + set + where + ';';
};

exports.destroy = function(model, selector, outValues) {
  var stmt  = "DELETE FROM " + '"' + model.tableName + '"'
    , where = buildWhereClause(model, selector, outValues);

  return stmt + where + ";"
};

exports.truncate = function(model, opts) {
  var opts = opts === undefined ? {} : opts
    , stmt = "TRUNCATE " + '"' + model.tableName + '"';

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

var buildInsertFields = function(model, fields, outValues) {
  if (_(fields).isArray()) {
    var keys =  utils.keysFromObject(fields)
      , vals =  buildMultiInsert(fields, keys, outValues);

    return "(" + keys + ") VALUES " + vals + ' RETURNING *';
  } else {
    var fields = utils.validFields(model, fields)
      , keys = _(fields).keys().join(',')
      , vals = utils.toCsv(fields, undefined, outValues);

    return "(" + keys + ") VALUES(" + vals + ") RETURNING *";
  }
};

var buildJoinClause = function(model, opts) {
  if (_(opts.join).isUndefined()) {
    return "";
  } else {
    return  " INNER JOIN "  + opts.join[0] + " ON " +
            '"' + model.tableName + '"' + "." + model.primaryKey + "=" +
            opts.join[0]    + "." + opts.join[1];
  }
};

var buildLimitClause = function(opts) {
  if (_(opts.limit).isUndefined()) {
    return "";
  } else {
    return " LIMIT " + opts.limit;
  }
};

var buildOffsetClause = function(opts) {
  if(_(opts.offset).isUndefined()) {
    return "";
  } else {
    return " OFFSET " + opts.offset;
  }
};

var buildMultiInsert = function(fields, keys, outValues) {
  return _(fields).chain()
    .map(function(field) {
      var vals = _(keys).map(function(key) {
        outValues.push(fixPgIssues(field[key]));
        return '$' + (outValues.length);
      });
      return "(" + vals + ")";
    })
    .join(', ')
    .value();
};

var buildOperator = function(key, value, outValues) {
  var keySections = key.split('.');
  var field = keySections[0];

  switch(key.split('.')[1]) {
  case 'ne':
  case 'not':
    if (value === null) return field + ' IS NOT NULL';
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
  case 'nlike':
  case 'not_like':
    var operator = "NOT LIKE";
    break;
  case 'ilike':
    var operator = "ILIKE";
    break;
  case 'nilike':
  case 'not_ilike':
    var operator = "NOT ILIKE";
    break;
  case 'in':
    var operator = "IN";
    break;
  case 'nin':
  case 'not_in':
    var operator = "NOT IN";
    break;
  case 'textsearch':
    var operator = "@@";
	break;
  default:
    if (value === null) return field + ' IS NULL';
    var operator = "=";
  }

  outValues.push(fixPgIssues(value));
  outValues = _.flatten(outValues);
  if (keySections[1] == 'textsearch') {
    return 'to_tsvector(\'english\', ' + field + ') ' + operator +
		' to_tsquery(\'english\', ' + utils.quote(outValues, operator) + ')';
  } else if (keySections[2] == 'or_null') {
    return '(' + field + ' ' + operator + ' ' + utils.quote(outValues, operator) + ' OR ' + field + ' IS NULL)';
  } else {
    return field + ' ' + operator + ' ' + utils.quote(outValues, operator);
  }
};

var buildOrderClause = function(opts) {
  if (_(opts.order).isUndefined()) {
    return "";
  } else {
    var orderFields = _(opts.order).chain()
      .map(function(orderField) {
        var direction  = orderField[0] === '-' ? "DESC" : "ASC";
        var orderField = orderField[0] === '-' ?
          utils.doubleQuote(orderField.substring(1, orderField.length)) :
          utils.doubleQuote(orderField);
        return orderField + " " + direction;
      })
      .join(', ')
      .value();

    return " ORDER BY " + orderFields;
  }
};

var buildSelectFields = function(model, opts) {
  if (_(opts.only).isUndefined()) {
    if (!_(opts.join).isUndefined()) {
      return '"' + model.tableName + '"' + ".*";
    } else {
      return "*";
    }
  } else if (_(opts.only).isArray()) {
    var columns = _(model._fields).pluck('column_name');
    var valid_fields = _.select(opts.only, function(valid_field) {
      return _.include(columns, valid_field);
    });
    return _(valid_fields).isEmpty() ? "*" : valid_fields.join(',');
  } else {
    var columns = _(model._fields).pluck('column_name');
    var alias_fields = [];
    _.map(opts.only, function(value, key) {
      if (_.include(columns, key))
        alias_fields.push(key+' AS '+utils.doubleQuote(value));
    });
    return _(alias_fields).isEmpty() ? "*" : alias_fields.join(', ');
  }
};

var buildUpdateFields = function(model, fields, outValues) {
  var fields = utils.validFields(model, fields)
    , pred   =  _(fields).chain()
                .map(function(value, key) {
                  outValues.push(fixPgIssues(value));
                  return key + '= $' + outValues.length;
                })
                .join(', ')
                .value();

  return utils.nil(pred) ? '' : " SET " + pred;
};

var buildWhereClause = function(model, selector, outValues) {
  if (utils.nil(selector)) {
    var pred = '';
  } else if (_(selector).isArray()) {
    var ids = utils.toCsv(selector, undefined, outValues);
    var pred = model.primaryKey + " IN (" + ids + ")";
  } else if (_(selector).isNumber() || _(selector).isString()) {
    var id = selector;
    var pred = model.primaryKey + " = '" + id + "'";
  } else {
    var pred =  _(selector).chain()
                .map(function(value, key) {
                  if (utils.fieldIsValid(model, key))
                    return buildOperator(key, value, outValues);
                })
                .compact()
                .join(' AND ')
                .value();
    pred += utils.nil(pred) ? 'INVALID' : '';
  }

  return utils.nil(pred) ? '' : " WHERE " + pred;
};
