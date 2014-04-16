/**
 * Module dependencies.
 */

var _ = require('underscore');

/**
 * Utils.
 */

var Utils = exports;

Utils.doubleQuote = function(value, outValues) {
  if (Utils.nil(value)) {
    return "NULL";
  } else if (_(value).isNumber()) {
    return value;
  } else if (_(value).isArray()) {
    return "(" + toCsv(value, outValues) + ")";
  } else if (_(value).isDate()) {
    return '"' + toDateTime(value) + '"';
  } else {
    return '"' + value + '"';
  }
};

Utils.quote = function(outValues, operator, value) {
  if (operator === 'IN' || operator === 'NOT IN') {
    var valuePos = _.range(outValues.length - value.length + 1, outValues.length+1);
    var values = _.reduce(valuePos, function(memo, pos, i) {
      memo += '$' + pos.toString();
      if (i+1 !== valuePos.length) memo += ',';
      return memo;
    }, '');
    return '(' + values + ')';
  } else {
    return '$' + outValues.length;
  }
};

Utils.fieldIsValid = function(model, field) {
  var columns = _.pluck(model._fields, 'column_name');
  return _.include(columns, field.split('.')[0]);
};

Utils.hasWhiteSpace = function(value) {
  return /\s/g.test(value);
};

Utils.keysFromObject = function(fields) {
  return _.chain(fields)
    .map(function(field) {
      return _.keys(field);
    })
    .flatten()
    .uniq()
    .value();
};

Utils.nil = function(value) {
  if (_(value).isUndefined() || _(value).isNull() || _(value).isNaN()) {
    return true;
  } else if (_.isArray(value) && _.isEmpty(value)) {
    return true;
  } else if (value.toString() === '[object Object]' && _.isEmpty(value)) {
    return true;
  } else if (_.isString(value) && _.isEmpty(value)) {
    return true;
  } else {
    return false;
  }
};


Utils.toCsv = function(list, keys, outValues) {
  return _.chain(list)
    .values()
    .map(function(o) {
      outValues.push(o);
      return '$' + outValues.length;
    })
    .join(',')
    .value();
};

Utils.toPlaceholder = function(list, keys, outValues) {
  return _.chain(list)
    .values()
    .map(function(o) {
      outValues.push(o);
      return '?';
    })
    .join(', ')
    .value();
};

Utils.toDateTime = function(value) {
  if (_.isDate(value)) {
    return value.getFullYear()
    + '/' + (value.getMonth()+1)
    + '/' + (value.getDate())
    + ' ' + (value.getHours())
    + ':' + (value.getMinutes())
    + ':' + (value.getSeconds());
  }
};

Utils.validFields = function(model, fields) {
  var returnFields = {};
  _.each(fields, function(value, key) {
    if (Utils.fieldIsValid(model, key)) {
      returnFields[key] = value;
    }
  });
  return returnFields;
};

