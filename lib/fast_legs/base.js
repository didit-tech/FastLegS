var Statements = require("./statements")
  , async = require("async@0.1.7");

function Base(client) {
  this.client = client;
};

Base.prototype.extend = function(obj) {
  return _.extend(obj, FastLegS.Base);
};

Base.prototype.truncate = function(opts, callback) {
  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  }

  var truncateStatement = Statements.truncate(this, opts);
  this.client.emit('query', truncateStatement, function(err, result) {
    callback(err, !result.rowCount);
  });
};

Base.prototype.create = function(obj, callback) {
  var self = this;

  var createQuery = function() {
    var insertStatement = Statements.insert(self, obj);
    self.client.emit('query', insertStatement, function(err, result) {
      callback(err, result.rowCount);
    });
  };

  loadSchema(self, createQuery);
};

Base.prototype.find = function(selector, opts, callback) {
  var self = this;

  var findQuery = function() {
    if (_.isFunction(opts)) {
      callback = opts;
      opts = {};
    }

    var selectStatement = Statements.select(self, selector, opts);
    self.client.emit('query', selectStatement, function(err, result) {
      var results = null;

      if (err && err.message === 'column "invalid" does not exist') {
        callback(undefined, []);
      } else {
        if (_(opts.include).isUndefined()) {
          if (_(selector).isArray())
            results = _.isUndefined(result) ? [] : result.rows;
          else if (_(selector).isNumber() || _(selector).isString())
            results = _.isUndefined(result.rows[0]) ? null : result.rows[0];
          else
            results = _.isUndefined(result) ? [] : result.rows;

          callback(err, results);
        } else {
          results = _.isUndefined(result) ? [] : result.rows;
          handleIncludes(self, results, selector, opts.include, callback);
        }
      }
    });
  };

  loadSchema(self, findQuery);
};

Base.prototype.destroy = function(selector, callback) {
  var self = this;

  var destroyQuery = function() {
    if (_.isFunction(selector)) {
      callback = selector;
      selector = {};
    }

    var destroyStatement = Statements.destroy(self, selector);
    self.client.emit('query', destroyStatement, function(err, results) {
      if (err && err.message === 'column "invalid" does not exist') {
        callback(undefined, 0);
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
      finders[includeFinder] = function(cb) {
        var includedModel = _(self.many).select(function(m) {
          return _(_(m).keys()).include(includeFinder);
        })[0];

        var where = _(includes[includeFinder].where).isUndefined() ?
          {} : includes[includeFinder].where;

        if (!_(includedModel).isUndefined()) {
          var primaryKeySelector = {};
          primaryKeySelector[includedModel.joinOn] = model[self.primaryKey];
          var selector = _.extend(primaryKeySelector, where);

          delete includes[includeFinder].where;

          includedModel[includeFinder].find(selector,
            includes[includeFinder],
          function(err, results) {
            cb(err, results);
          });
        } else {
          cb(null, []);
        }
      }
    });

    async.parallel(finders, function(err, results) {
      var models = _.extend(model, results);
      callback(err, models);
    });
  };

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
