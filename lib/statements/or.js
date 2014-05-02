/**
 * Module dependencies.
 */

var _ = require('underscore');
var buildOperator = require('./operators');

/**
 * Statements - or.
 */

module.exports = function(or, outValues) {
  var statement = _.map(or, function(value, key) {
    return buildOperator(key, value, outValues);
  });

  return '(' + statement.join(' OR ') + ')';
};

