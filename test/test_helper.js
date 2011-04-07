require.paths.unshift(__dirname + '/../..', __dirname + '/../support');

var assert = global.assert = require('assert')
  , FastLegS = global.FastLegS = require('../lib/fast_legs')
  , _ = global._ = require('underscore@1.1.4')
  , async = global.async = require('async@0.1.7');
