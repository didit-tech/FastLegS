/**
 * Module dependencies.
 */

var utils = require('./utils');
var _ = require('underscore');
var buildWhereClause = require('./statements/where');
var buildOperator = require('./statements/operators');
var fixPgIssues = require('./utils').fixPgIssues;

/**
 * Statements.
 */

exports.select = function(model, selector, opts, outValues) {
  var fields = buildSelectFields(model, opts);
  var stmt = "SELECT " + fields + " FROM " + '"' + model.tableName + '"';
  var join = buildJoinClause(model, opts);
  var where = buildWhereClause(model, selector, outValues);
  var limit = buildLimitClause(opts);
  var offset = buildOffsetClause(opts);
  var order = buildOrderClause(opts);

  return stmt + join + where + order + limit + offset + ';';
};

exports.insert = function(model, obj, outValues) {
  var stmt = "INSERT INTO " + '"' + model.tableName + '"';
  var fields = buildInsertFields(model, obj, outValues);

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
  var stmt = "SELECT column_name, is_nullable, data_type, " +
    "character_maximum_length, column_default " +
    "FROM information_schema.columns " +
    "WHERE table_name = '" + model.tableName + "';";
  return stmt;
};

var buildInsertFields = function(model, fields, outValues) {
  if (!_.isArray(fields)) {
    fields = [fields]
  }
  fields = _.map(fields, function(field) {
    return utils.validFields(model, field)
  });
  var keys =  utils.keysFromObject(fields);
  var vals =  buildMultiInsert(fields, keys, outValues);

  return "(" + keys + ") VALUES" + vals + ' RETURNING *';
};

var buildJoinClause = function(model, opts) {
  if (_.isUndefined(opts.join)) {
    return "";
  } else {
    model._fields = model._fields.concat(opts.join.model._fields);
    return " INNER JOIN "  + opts.join.model.tableName + " ON " +
      '"' + model.tableName + '"' + "." + model.primaryKey + "=" +
      opts.join.model.tableName + "." + opts.join.key;
  }
};

var buildLimitClause = function(opts) {
  if (_.isUndefined(opts.limit)) {
    return "";
  } else {
    return " LIMIT " + opts.limit;
  }
};

var buildOffsetClause = function(opts) {
  if(_.isUndefined(opts.offset)) {
    return "";
  } else {
    return " OFFSET " + opts.offset;
  }
};

var buildMultiInsert = function(fields, keys, outValues) {
  return _.chain(fields)
    .map(function(field) {
      var vals = _.map(keys, function(key) {
        outValues.push(fixPgIssues(field[key]));
        return '$' + (outValues.length);
      });
      return "(" + vals + ")";
    })
    .join(', ')
    .value();
};

var buildOrderClause = function(opts) {
  if (_.isUndefined(opts.order)) {
    return "";
  } else {
    var orderFields = _.chain(opts.order)
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
  if (_.isUndefined(opts.only)) {
    if (!_.isUndefined(opts.join)) {
      return '"' + model.tableName + '"' + ".*";
    } else {
      return (opts.count) ? "COUNT(*) AS count" : "*";
    }
  } else if (_.isArray(opts.only)) {
    var columns = _.pluck(model._fields, 'column_name');
    var valid_fields = _.select(opts.only, function(valid_field) {
      return _.include(columns, valid_field);
    });
    return _.isEmpty(valid_fields) ? "*" : valid_fields.join(',');
  } else {
    var columns = _.pluck(model._fields, 'column_name');
    var alias_fields = [];
    _.map(opts.only, function(value, key) {
      if (_.include(columns, key))
        alias_fields.push(key + ' AS ' + utils.doubleQuote(value));
    });
    return _.isEmpty(alias_fields) ? "*" : alias_fields.join(', ');
  }
};

var buildUpdateFields = function(model, fields, outValues) {
  var fields = utils.validFields(model, fields);
  var pred   =  _.chain(fields)
    .map(function(value, key) {
      outValues.push(fixPgIssues(value));
      return key + '= $' + outValues.length;
    })
    .join(', ')
    .value();

  return utils.nil(pred) ? '' : " SET " + pred;
};

