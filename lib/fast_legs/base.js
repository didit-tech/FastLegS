/**
 * Module dependencies.
 */

var Statements = require("./statements");
var async = require("async");
var _ = require('underscore');

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
  this.client.emit('query', truncateStatement, function(err, result) {
    if (_(result).isUndefined() || _(result).isNull()) result = {};
    callback(err, !result.rowCount);
  });
};

Base.prototype.create = function(obj, callback) {
  var self = this;

  var now = new Date(); // create the object once so that it's guaranteed that the created_at and updated_at fields will have the same value (if they both need setting)
  if (self.createTimestamp && _.isUndefined(obj[self.createTimestamp])) {
    obj[self.createTimestamp] = now;
  }

  if (self.updateTimestamp && _.isUndefined(obj[self.updateTimestamp])) {
    obj[self.updateTimestamp] = now;
  }

  var createQuery = function() {
    var outValues = [];
    var insertStatement = Statements.insert(self, obj, outValues);
    self.client.emit('query', insertStatement, outValues, function(err, result) {
      callback(err, result);
    });
  };

  loadSchema(self, createQuery);
};

['find', 'findOne'].forEach(function(finder) {
  Base.prototype[finder] = function(selector, opts, callback) {
    var self = this;

    var findQuery = function() {
      if (_.isFunction(opts)) {
        callback = opts;
        opts = {};
      }

      if (finder === 'findOne') opts.limit = 1;

      var outValues = [];
      var selectStatement = Statements.select(self, selector, opts, outValues);
      self.client.emit('query', selectStatement, outValues, function(err, result) {
        var results = null;

        if (finder === 'find') {
          var empty = []
            , rowOrRows = (_.isUndefined(result)) ? null : result.rows;
        }

        if (finder === 'findOne') {
          var empty = null
            , rowOrRows = (_.isUndefined(result)) ? null : result.rows[0];
        }

        if (err && err.message === 'column "invalid" does not exist') {
          callback(null, empty);
        } else {
          if (_(opts.include).isUndefined()) {
            if (_(selector).isArray())
              results = _.isUndefined(result) ? empty : rowOrRows;
            else if (_(selector).isNumber() || _(selector).isString())
              results = _.isUndefined(result.rows[0]) ? null : result.rows[0];
            else
              results = _.isUndefined(result) ? empty : rowOrRows;

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

    loadSchema(self, findQuery);
  };
});

Base.prototype.update = function(selector, obj, callback) {
  var self = this;

  var now = new Date();
  if (self.updateTimestamp && _.isUndefined(obj[self.updateTimestamp])) {
    obj[self.updateTimestamp] = now;
  }

  var updateQuery = function() {
    var outValues = [];
    var updateStatement = Statements.update(self, selector, obj, outValues);
    self.client.emit('query', updateStatement, outValues, function(err, result) {
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
    self.client.emit('query', destroyStatement, outValues, function(err, results) {
      if (err && err.message === 'column "invalid" does not exist') {
        callback(null, 0);
      } else {
        var deletedRows = _(results).isUndefined() ? 0 : results.rowCount;
        callback(err, deletedRows);
      }
    });
  }

  loadSchema(self, destroyQuery);
};

var handleIncludes = function(self, models, selector, includes, callback) {
  var includedModels = _(includes).keys();

  var findIncludes = function(model, callback) {
    var finders = {};
    _(includedModels).each(function(includeFinder) {
      ['many', 'belongsTo', 'one'].forEach(function(relationship) {
        var includedModel = _(self[relationship]).select(function(m) {
          return _(_(m).keys()).include(includeFinder);
        })[0];

        if (_(includedModel).isUndefined())
          return;

        finders[includeFinder] = function(cb) {
          var where = _(includes[includeFinder].where).isUndefined() ?
            {} : includes[includeFinder].where;

          if (relationship === 'many') {
            var primaryKeySelector = {};
            if (includedModel.joinOn.split('.').length > 1) {
              primaryKeySelector[includedModel[includeFinder].primaryKey] = model[self.primaryKey];
              includes[includeFinder].join = includedModel.joinOn.split('.');
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

      if (_(selector).isArray())
        formattedResults = _.isUndefined(results) ? [] : results;
      else if (_(selector).isNumber() || _(selector).isString())
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

var loadSchema = function(model, query) {
  var statement = Statements.information(model);

  if (_(model._fields).isUndefined()) {
    model.client.emit('query', statement, function(err, result) {
      model._fields = result.rows;
      query();
    });
  } else {
    query();
  }
};

module.exports = Base;
