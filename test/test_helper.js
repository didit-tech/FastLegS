require.paths.unshift(__dirname + '/../..', __dirname + '/../support');

var assert = global.assert = require('assert')
  , FastLegS = global.FastLegS = require('../lib/fast_legs')
  , _ = global._ = require('underscore')
  , async = global.async = require('async');
