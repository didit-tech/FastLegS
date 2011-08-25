/**
 * Module dependencies.
 */

var utils = require('./utils');
var _ = require('underscore');

/**
 * Statements.
 */

exports.select = function(model, selector, opts) {
  var fields = buildSelectFields(model, opts)
    , stmt   = "SELECT " + fields + " FROM " + '"' + model.tableName + '"'
    , join   = buildJoinClause(model, opts)
    , where  = buildWhereClause(model, selector)
    , limit  = buildLimitClause(opts)
    , offset = buildOffsetClause(opts)
    , order  = buildOrderClause(opts);

  return stmt + join + where + order + limit + offset + ';';
};

exports.insert = function(model, obj) {
  var stmt = "INSERT INTO " + '"' + model.tableName + '"'
    , fields = buildInsertFields(model, obj);

  return stmt + fields + ';';
};

exports.update = function(model, selector, obj) {
  var stmt  = "UPDATE " + '"' + model.tableName + '"'
    , set   = buildUpdateFields(model, obj)
    , where = buildWhereClause(model, selector);

  return stmt + set + where + ';';
};

exports.call = function(procedure, args, opts) {
  var fields = buildSelectFields(procedure, opts);
  var stmt = "SELECT " + fields + " FROM " + '"' + procedure + '"(' + buildCallArgs(args) + ')';
  
  return stmt + ';';
};

exports.destroy = function(model, selector) {
  var stmt  = "DELETE FROM " + '"' + model.tableName + '"'
    , where = buildWhereClause(model, selector);

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

var buildInsertFields = function(model, fields) {
  if (_(fields).isArray()) {
    var keys =  utils.keysFromObject(fields)
      , vals =  buildMultiInsert(fields, keys);

    return "(" + keys + ") VALUES " + vals + ' RETURNING *';
  } else {
    var fields = utils.validFields(model, fields)
      , keys = _(fields).keys().join(',')
      , vals = utils.toCsv(fields);

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

var buildMultiInsert = function(fields, keys) {
  return _(fields).chain()
    .map(function(field) {
      var vals = _(keys).map(function(key) {
        return utils.quote(field[key]);
      });
      return "(" + vals + ")";
    })
    .join(', ')
    .value();
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
    if (value === null) return field + ' IS NULL';
    var operator = "=";
  }

  return field + ' ' + operator + ' ' + utils.quote(value);
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

var buildUpdateFields = function(model, fields) {
  var fields = utils.validFields(model, fields)
    , pred   =  _(fields).chain()
                .map(function(value, key) {
                  return key + '=' + utils.quote(value);
                })
                .join(', ')
                .value();

  return utils.nil(pred) ? '' : " SET " + pred;
};

var buildWhereClause = function(model, selector) {
  if (utils.nil(selector)) {
    var pred = '';
  } else if (_(selector).isArray()) {
    var ids = utils.toCsv(selector);
    var pred = '"' + model.tableName + '".' + model.primaryKey + " IN (" + ids + ")";
  } else if (_(selector).isNumber() || _(selector).isString()) {
    var id = selector;
    var pred = '"' + model.tableName + '".' + model.primaryKey + " = '" + id + "'";
  } else {
    var pred =  _(selector).chain()
                .map(function(value, key) {
                  if (utils.fieldIsValid(model, key))
                    return '"' + model.tableName + '".' + buildOperator(key, value);
                })
                .compact()
                .join(' AND ')
                .value();
    pred += utils.nil(pred) ? 'INVALID' : '';
  }

  return utils.nil(pred) ? '' : " WHERE " + pred;
};

var buildCallArgs = function(args) {
  var string_args = _(args).map(function(value) {
    return utils.quote(value);
  }).join(', ');
  return string_args;
};
