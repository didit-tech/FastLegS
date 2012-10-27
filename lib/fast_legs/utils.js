/**
 * Module dependencies.
 */

var _ = require('underscore');

/**
 * Utils.
 */

var doubleQuote = exports.doubleQuote = function(value, outValues) {
  if (nil(value)) {
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

var fieldIsValid = exports.fieldIsValid = function(model, field) {
  var columns = _(model._fields).pluck('column_name');
  return _.include(columns, field.split('.')[0]);
};

var hasWhiteSpace = exports.hasWhiteSpace = function(value) {
  return /\s/g.test(value);
};

var keysFromObject = exports.keysFromObject = function(fields) {
  return _(fields).chain()
    .map(function(field) {
      return _(field).keys();
    })
    .flatten()
    .uniq()
    .value();
};

var nil = exports.nil = function(value) {
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

var quote = exports.quote = function(outValues, operator, placeholder) {
  placeholder = (placeholder) ? placeholder : false;
  if (operator === 'IN' || operator === 'NOT IN') {
    var valuePos = _.range(1, outValues.length+1);
    var values = _.reduce(valuePos, function(memo, pos, i) {
      memo += (placeholder) ? '?' : '$' + pos.toString();
      if (i+1 !== valuePos.length) memo += ',';
      return memo;
    }, '');
    return '(' + values + ')';
  } else {
    return (placeholder) ? '?' : '$' + outValues.length;
  }
};

var toCsv = exports.toCsv = function(list, keys, outValues) {
  return  _(list).chain()
          .values()
          .map(function(o) { outValues.push(o); return '$' + outValues.length; })
          .join(',')
          .value();
};

var toPlaceholder = exports.toPlaceholder = function(list, keys, outValues) {
  return _(list).chain()
         .values()
         .map(function(o) { outValues.push(o); return '?'; })
         .join(', ')
         .value();
};

var toDateTime = exports.toDateTime = function(value) {
  if (_(value).isDate()) {
    return value.getFullYear()
    + '/' + (value.getMonth()+1)
    + '/' + (value.getDate())
    + ' ' + (value.getHours())
    + ':' + (value.getMinutes())
    + ':' + (value.getSeconds());
  }
};

var validFields = exports.validFields = function(model, fields) {
  var returnFields = {};
  _(fields).each(function(value, key) {
    if (fieldIsValid(model, key)) {
      returnFields[key] = value;
    }
  });
  return returnFields;
};
