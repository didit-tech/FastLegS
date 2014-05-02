/**
 * Module dependencies.
 */
var utils = require('../utils');
var fixPgIssues = utils.fixPgIssues;

/**
 * Statement - operators.
 */

module.exports = function(key, value, outValues) {
  var field = key.split('.')[0];

  switch(key.split('.')[1]) {
  case 'ne': case 'not':
    if(value === null) return field + ' IS NOT NULL';
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
  case 'textsearch':
    var operator = "@@";
	break;
  default:
    if (value === null) return field + ' IS NULL';
    var operator = "=";
  }

  if (operator === 'IN' || operator === 'NOT IN') {
    // Avoid flattening of the entire outValues here so we can pass arrays to
    // the node-pg driver for usage as postgres arrays.
    value.forEach(function(singleValue) {
      outValues.push(fixPgIssues(singleValue));
    });
  } else {
    outValues.push(fixPgIssues(value));
  }
  if (key.split('.')[1] == 'textsearch') {
    return 'to_tsvector(\'english\', ' + field + ') ' + operator +
	  ' to_tsquery(\'english\', ' + utils.quote(outValues, operator) + ')';
  } else {
    return field + ' ' + operator + ' ' + utils.quote(outValues, operator, value);
  }
};

