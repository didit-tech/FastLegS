/**
 * Module dependencies.
 */

var _ = require('underscore');
var async = require('async');
var inherits = require('util').inherits;
var Statements = require('./statements');

/**
 * Base.
 */

function Base(client) {
  this.client = client;
};

Base.prototype.extend = function(obj) {
  return _.extend(obj, this);
};

Base.prototype.truncate = function(opts, callback) {
  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  }

  var truncateStatement = Statements.truncate(this, opts);
  this.client.query(truncateStatement, function(err, rows, result) {
    if (_.isUndefined(result) || _.isNull(result)) result = {};
    return callback(err, !result.rowCount);
  });
};

Base.prototype.create = function(obj, callback) {
  var self = this;

  var createQuery = function() {
    var outValues = [];
    var insertStatement = Statements.insert(self, obj, outValues);
    self.client.query(insertStatement, outValues, function(err, rows, result) {
      return callback(err, result);
    });
  };

  loadSchema(self, createQuery);
};

['find', 'findOne'].forEach(function(finder) {
  Base.prototype[finder] = function(selector, opts, callback) {
    var self = this;

    if (_.isFunction(opts)) {
      callback = opts;
      opts = {};
    }

    var findQuery = function() {
      if (finder === 'findOne') opts.limit = 1;

      var outValues = [];
      var selectStatement = Statements.select(self, selector, opts, outValues);
      self.client.query(selectStatement, outValues, function(err, rows, result) {
        var results = null;

        if (finder === 'find') {
          var empty = [];
          var rowOrRows = (_.isUndefined(result)) ? null : result.rows;
        }

        if (finder === 'findOne' || opts.count) {
          var empty = null;
          var rowOrRows = (_.isUndefined(result)) ? null : result.rows[0];
        }

        if (err && err.message === 'column "invalid" does not exist') {
          callback(null, empty);
        } else {
          if (_.isUndefined(opts.include)) {
            if (_.isArray(selector))
              results = _.isUndefined(result) ? empty : rowOrRows;
            else if (_.isNumber(selector) || _.isString(selector))
              results = _.isUndefined(result.rows[0]) ? null : result.rows[0];
            else {
              if (_.isUndefined(result))
                results = empty
              else if (rowOrRows && rowOrRows.count)
                results = { count: parseInt(rowOrRows.count) }
              else
                results = rowOrRows
            }
            callback(err, results);
          } else {
            results = _.isUndefined(result) ? empty : rowOrRows;
            if (_.isUndefined(results) || _.isEmpty(results)) {
              callback(null, results)
            } else {
              handleIncludes(self, results, selector, opts.include, callback);
            }
          }
        }
      });
    };

    loadSchema(self, findQuery, opts);
  };
});

Base.prototype.update = function(selector, obj, callback) {
  var self = this;

  var updateQuery = function() {
    var outValues = [];
    var updateStatement = Statements.update(self, selector, obj, outValues);
    self.client.query(updateStatement, outValues, function(err, rows, result) {
      result = result || { rowCount : 0 };
      callback(err, result.rowCount);
    });
  };

  loadSchema(self, updateQuery);
};

Base.prototype.destroy = function(selector, callback) {
  var self = this;

  var destroyQuery = function() {
    if (_.isFunction(selector)) {
      callback = selector;
      selector = {};
    }

    var outValues = [];
    var destroyStatement = Statements.destroy(self, selector, outValues);
    self.client.query(destroyStatement, outValues, function(err, rows, results) {
      if (err && err.message === 'column "invalid" does not exist') {
        callback(null, 0);
      } else {
        var deletedRows = _.isUndefined(results) ? 0 : results.rowCount;
        callback(err, deletedRows);
      }
    });
  }

  loadSchema(self, destroyQuery);
};

var handleIncludes = function(self, models, selector, includes, callback) {
  var includedModels = _.keys(includes);

  var findIncludes = function(model, callback) {
    var finders = {};
    _.each(includedModels, function(includeFinder) {
      ['many', 'belongsTo', 'one'].forEach(function(relationship) {
        var includedModel = _.select(self[relationship], function(m) {
          return _.include(_.keys(m), includeFinder);
        })[0];

        if (_.isUndefined(includedModel))
          return;

        finders[includeFinder] = function(cb) {
          var where = _.isUndefined(includes[includeFinder].where)
            ? {}
            : includes[includeFinder].where;

          if (relationship === 'many') {
            var primaryKeySelector = {};
            if (includedModel.assoc) {
              var primaryKey = _.find(includedModel.assoc.foreignKeys,
                function (e) { return e.model.tableName === self.tableName}
              ).key;
              primaryKeySelector[primaryKey] = model[self.primaryKey];
              var linkKey = _.find(
                includedModel.assoc.foreignKeys,
                function (elem) { return elem.model.tableName ===
                  includedModel[includeFinder].tableName}
              ).key;
              includes[includeFinder].join =
                { model: includedModel.assoc, key: linkKey};
            } else {
              primaryKeySelector[includedModel.joinOn] = model[self.primaryKey];
            }
            var selector = _.extend(primaryKeySelector, where);

            includedModel[includeFinder].find(selector,
              includes[includeFinder],
            function(err, results) {
              cb(err, results);
            });
          } else if (relationship === 'one') {
            includedModel[includeFinder].find(model[includedModel.joinOn],
              includes[includeFinder],
            function(err, results) {
              cb(err, results);
            });
          } else if (relationship === 'belongsTo') {
            var primaryKeySelector = {};
            primaryKeySelector[includedModel[includeFinder].primaryKey] = model[includedModel.joinOn];
            var selector = _.extend(primaryKeySelector, where);

            includedModel[includeFinder].find(selector,
              includes[includeFinder],
            function(err, results) {
              cb(err, results);
            });
          }
        }
      });
    });

    async.parallel(finders, function(err, results) {
      var models = _.extend(model, results);
      callback(err, models);
    });
  };

  if (_.isArray(models)) {
    async.map(models, findIncludes, function(err, results) {
      var formattedResults = null;

      if (_.isArray(selector))
        formattedResults = _.isUndefined(results) ? [] : results;
      else if (_.isNumber(selector) || _.isString(selector))
        formattedResults = _.isUndefined(results) ? null : results[0];
      else
        formattedResults = _.isUndefined(results) ? [] : results;

      callback(err, formattedResults);
    });
  } else {
    findIncludes(models, function(err, results) {
      callback(err, results);
    });
  }
};

var loadSchema = function(model, query, opts) {
  if (_.isUndefined(opts)) opts = {};
  var statement = Statements.information(model);

  if (_.isUndefined(model._fields)) {
    model.client.query(statement, function(err, rows, result) {
      model._fields = result.rows;
      if (_.isUndefined(opts.join)) return query();
      loadSchema(opts.join.model, query)
    });
  } else {
    query();
  }
};

module.exports = Base;
