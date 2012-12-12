/**
 * Module dependencies.
 */

var _ = require('underscore');
var Utils = require('../../utils');

/**
 * mysql - Utils.
 */

var utils = new Utils();

utils.quote = function(outValues, operator) {
  if (operator === 'IN' || operator === 'NOT IN') {
    var valuePos = _.range(1, outValues.length+1);
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

