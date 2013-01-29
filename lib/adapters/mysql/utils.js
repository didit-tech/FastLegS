/**
 * Module dependencies.
 */

var _ = require('underscore');
var _str = require('underscore.string');
var Utils = require('../../utils');

/**
 * mysql - Utils.
 */

var utils = new Utils();

utils.backtick = function(field) {
 return field.indexOf(' ') >= 0 ? _str.surround(field, '`') : field;
};

utils.quote = function(outValues, operator, value) {
  if (operator === 'IN' || operator === 'NOT IN') {
    var valuePos = _.range(outValues.length - value.length + 1, outValues.length+1);
    var values = _.reduce(valuePos, function(memo, pos, i) {
      memo += '?'; 
      if (i+1 !== valuePos.length) memo += ',';
      return memo;
    }, '');
    return '(' + values + ')';
  } else if (operator === 'ILIKE') {
    return 'UPPER(?)';
  } else {
    return '?';
  }
};

module.exports = utils;

