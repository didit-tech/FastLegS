/**
 * Module dependencies.
 */

var _ = require('underscore');
var utils = require('../utils');
var buildOperator = require('./operators');
var buildOrStatement = require('./or');

/**
 * Statements - where.
 */

module.exports = function(model, selector, outValues) {
  if (utils.nil(selector)) {
    var pred = '';
  } else if (_.isArray(selector)) {
    var ids = utils.toCsv(selector, undefined, outValues);
    var pred = model.primaryKey + " IN (" + ids + ")";
  } else if (_.isNumber(selector) || _.isString(selector)) {
    var id = selector;
    var pred = model.primaryKey + " = '" + id + "'";
  } else {
    var pred = _.chain(selector)
      .map(function(value, key) {
        if (key === '$or')
          return buildOrStatement(value, outValues)
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

